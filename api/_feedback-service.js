'use strict';

const { GoogleAuth } = require('google-auth-library');
const QRCode = require('qrcode');
const { requestSourceError, safeLogError } = require('./_security');
const core = require('./_feedback-core');

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const GOOGLE_SERVICE_ACCOUNT_JSON = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
const GOOGLE_SERVICE_ACCOUNT_BASE64 = process.env.GOOGLE_SERVICE_ACCOUNT_BASE64;
const PLANNER_KEY = process.env.PRPD_PLANNER_KEY;
const TOKEN_SECRET = process.env.PRPD_FEEDBACK_TOKEN_SECRET || PLANNER_KEY;
const PUBLIC_BASE_URL = 'https://getprpd.com';
const TOKEN_SHEET = 'Feedback Tokens';
const MEAL_SHEET = 'Meal Feedback';
const CREDIT_SHEET = 'Feedback Credits';
const TOKEN_HEADERS = ['Created At','Token Hash','Order ID','Batch','Batch ID','Customer Key','Customer First Name','Customer Name','Delivery Date','Expires At','Status','Meals JSON','Last Accessed At'];
const MEAL_HEADERS = ['Updated At','Order ID','Batch','Customer Name','Customer Key','Meal ID','Meal Name','Tier','Quantity','Score','Liked Note','Change Note','Testimonial Consent','Testimonial Display','Overall Note'];
const CREDIT_HEADERS = ['Issued At','Order ID','Batch','Customer Name','Customer Key','Face Value','Expires At','Status','Redeemed At','Redeemed Order ID'];

function sendJson(response, status, body, isPrivate = false) {
  response.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', isPrivate ? 'no-store, private' : 'no-store');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.end(JSON.stringify(body));
}

function keysMatch(provided, expected) {
  const crypto = require('node:crypto');
  const left = Buffer.from(String(provided || ''), 'utf8');
  const right = Buffer.from(String(expected || ''), 'utf8');
  return left.length > 0 && left.length === right.length && crypto.timingSafeEqual(left, right);
}

function credentials() {
  const raw = GOOGLE_SERVICE_ACCOUNT_BASE64
    ? Buffer.from(GOOGLE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8')
    : GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error('Google Sheets is not configured.');
  const value = JSON.parse(raw);
  if (value.private_key) value.private_key = value.private_key.replace(/\\n/g, '\n');
  return value;
}

async function sheetsClient() {
  if (!SHEET_ID) throw new Error('Google Sheet ID is not configured.');
  const auth = new GoogleAuth({ credentials: credentials(), scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
  return auth.getClient();
}

function sheetUrl(path) {
  return `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}${path}`;
}

async function ensureSheets(client) {
  const metadata = await client.request({ url: sheetUrl('?fields=sheets(properties(sheetId,title))'), method: 'GET' });
  const existing = new Set((metadata.data.sheets || []).map(sheet => sheet.properties?.title));
  const definitions = [[TOKEN_SHEET,TOKEN_HEADERS],[MEAL_SHEET,MEAL_HEADERS],[CREDIT_SHEET,CREDIT_HEADERS]];
  const missing = definitions.filter(([title]) => !existing.has(title));
  if (missing.length) {
    await client.request({
      url: sheetUrl(':batchUpdate'), method: 'POST',
      data: { requests: missing.map(([title]) => ({ addSheet: { properties: { title, gridProperties: { frozenRowCount: 1 } } } })) },
    });
  }
  for (const [title, headers] of definitions) {
    const range = encodeURIComponent(`'${title}'!A1:${String.fromCharCode(64 + headers.length)}1`);
    await client.request({ url: sheetUrl(`/values/${range}?valueInputOption=RAW`), method: 'PUT', data: { values: [headers] } });
  }
}

async function readValues(client, title, endColumn = 'Z') {
  const range = encodeURIComponent(`'${title}'!A1:${endColumn}5000`);
  const response = await client.request({ url: sheetUrl(`/values/${range}`), method: 'GET' });
  return response.data.values || [];
}

async function appendRows(client, title, rows) {
  if (!rows.length) return;
  const range = encodeURIComponent(`'${title}'!A1`);
  await client.request({
    url: sheetUrl(`/values/${range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`),
    method: 'POST', data: { values: rows },
  });
}

async function updateRow(client, title, rowNumber, row) {
  const end = String.fromCharCode(64 + row.length);
  const range = encodeURIComponent(`'${title}'!A${rowNumber}:${end}${rowNumber}`);
  await client.request({ url: sheetUrl(`/values/${range}?valueInputOption=RAW`), method: 'PUT', data: { values: [row] } });
}

function indexRows(values) {
  const headers = values[0] || [];
  return values.slice(1).map((row, index) => ({
    rowNumber: index + 2,
    raw: row,
    value: Object.fromEntries(headers.map((header, column) => [header, String(row[column] ?? '')])),
  }));
}

function nowIso() { return new Date().toISOString(); }
function isoDate(date) { return date.toISOString().slice(0, 10); }
function chicagoDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date);
  const value = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

async function provision(client, raw) {
  const plan = core.normalizeProvision(raw);
  const existing = indexRows(await readValues(client, TOKEN_SHEET, 'M'));
  const labels = [];
  for (const order of plan.orders) {
    const token = core.stableToken(TOKEN_SECRET, order.orderId, plan.batch);
    const hash = core.tokenHash(token);
    const delivery = core.parseDeliveryDate(plan.deliveryDate);
    if (!delivery) throw new Error('Feedback delivery date is invalid.');
    const expires = core.addDays(delivery, 30);
    const customerKey = core.customerKey(TOKEN_SECRET, order);
    const mealsJson = JSON.stringify(order.meals);
    const prior = existing.find(row => row.value['Token Hash'] === hash);
    const row = [
      prior?.value['Created At'] || nowIso(), hash, core.sheetCell(order.orderId,100), plan.batch,
      core.sheetCell(plan.batchId,40), customerKey, core.sheetCell(order.customerFirstName,60),
      core.sheetCell(order.customerName,120), core.sheetCell(plan.deliveryDate,80), isoDate(expires),
      'active', mealsJson, prior?.value['Last Accessed At'] || '',
    ];
    if (prior) await updateRow(client, TOKEN_SHEET, prior.rowNumber, row);
    else await appendRows(client, TOKEN_SHEET, [row]);
    const url = `${PUBLIC_BASE_URL}/feedback?t=${encodeURIComponent(token)}`;
    const qrDataUrl = await QRCode.toDataURL(url, { errorCorrectionLevel: 'M', margin: 1, width: 300, color: { dark:'#172117', light:'#ffffff' } });
    labels.push({
      orderId: order.orderId,
      customerName: order.customerName,
      customerFirstName: order.customerFirstName,
      uniqueDishes: order.meals.length,
      token,
      url,
      qrDataUrl,
    });
  }
  return { batch: plan.batch, batchId: plan.batchId, count: labels.length, labels };
}

function publicOrder(tokenRow, feedbackRows) {
  const meals = JSON.parse(tokenRow.value['Meals JSON'] || '[]');
  const prior = new Map(feedbackRows
    .filter(row => row.value['Order ID'] === tokenRow.value['Order ID'])
    .map(row => [`${row.value['Meal ID']}:${row.value.Tier}`, row.value]));
  const firstSaved = feedbackRows.find(row => row.value['Order ID'] === tokenRow.value['Order ID'])?.value || {};
  return {
    customerFirstName: tokenRow.value['Customer First Name'],
    deliveryDate: tokenRow.value['Delivery Date'],
    uniqueDishCount: meals.length,
    meals: meals.map(meal => {
      const saved = prior.get(`${meal.id}:${meal.tier}`) || {};
      return {
        id: meal.id, name: meal.name, tier: meal.tier, quantity: meal.quantity, image: meal.image,
        feedback: saved.Score ? {
          score: Number(saved.Score), liked: saved['Liked Note'] || '', change: saved['Change Note'] || '',
        } : null,
      };
    }),
    overallNote: feedbackRows.find(row => row.value['Order ID'] === tokenRow.value['Order ID'])?.value['Overall Note'] || '',
    testimonialConsent: firstSaved['Testimonial Consent'] === 'Yes',
    testimonialDisplay: firstSaved['Testimonial Display'] || 'first-name',
  };
}

async function tokenContext(client, token) {
  if (!core.TOKEN_PATTERN.test(String(token || ''))) return null;
  const hash = core.tokenHash(token);
  const tokenRows = indexRows(await readValues(client, TOKEN_SHEET, 'M'));
  const record = tokenRows.find(row => row.value['Token Hash'] === hash && row.value.Status === 'active');
  if (!record) return null;
  const expires = record.value['Expires At'];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(expires) || expires < chicagoDate()) return { expired: true, record };
  const delivery = core.parseDeliveryDate(record.value['Delivery Date']);
  if (delivery && isoDate(delivery) > chicagoDate()) return { pending: true, record };
  return { record };
}

async function getFeedback(client, token) {
  const context = await tokenContext(client, token);
  if (!context) return { status: 404, body: { error: 'This feedback link is invalid or no longer active.' } };
  if (context.expired) return { status: 410, body: { error: 'This feedback link has expired.' } };
  if (context.pending) return { status: 425, body: { error: 'Feedback opens after delivery.', availableOn: context.record.value['Delivery Date'] } };
  const feedbackRows = indexRows(await readValues(client, MEAL_SHEET, 'O'));
  const touched = TOKEN_HEADERS.map(header => context.record.value[header] || '');
  touched[12] = nowIso();
  await updateRow(client, TOKEN_SHEET, context.record.rowNumber, touched);
  return { status: 200, body: { status:'success', order:publicOrder(context.record, feedbackRows) } };
}

function creditState(rows, customerKey, now = new Date()) {
  const today = chicagoDate(now);
  const active = rows.filter(row => row.value['Customer Key'] === customerKey && row.value.Status === 'active'
    && row.value['Expires At'] >= today);
  return active.reduce((sum, row) => sum + Number(row.value['Face Value'] || 0), 0);
}

async function saveFeedback(client, raw) {
  const context = await tokenContext(client, raw?.token);
  if (!context) return { status:404, body:{ error:'This feedback link is invalid or no longer active.' } };
  if (context.expired) return { status:410, body:{ error:'This feedback link has expired.' } };
  if (context.pending) return { status:425, body:{ error:'Feedback opens after delivery.', availableOn:context.record.value['Delivery Date'] } };
  const tokenRow = context.record.value;
  const expectedMeals = JSON.parse(tokenRow['Meals JSON'] || '[]');
  const input = core.normalizeSave(raw, expectedMeals);
  const existing = indexRows(await readValues(client, MEAL_SHEET, 'O'));
  const orderRows = existing.filter(row => row.value['Order ID'] === tokenRow['Order ID']);
  const now = nowIso();
  for (const feedback of input.meals) {
    const meal = expectedMeals.find(item => item.id === feedback.id && item.tier === feedback.tier);
    const prior = orderRows.find(row => row.value['Meal ID'] === feedback.id && row.value.Tier === feedback.tier);
    const row = [
      now, tokenRow['Order ID'], Number(tokenRow.Batch), tokenRow['Customer Name'], tokenRow['Customer Key'],
      meal.id, core.sheetCell(meal.name,120), meal.tier, meal.quantity, feedback.score,
      core.sheetCell(feedback.liked,500), core.sheetCell(feedback.change,500),
      input.testimonialConsent ? 'Yes' : 'No', input.testimonialDisplay, core.sheetCell(input.overallNote,1000),
    ];
    if (prior) await updateRow(client, MEAL_SHEET, prior.rowNumber, row);
    else await appendRows(client, MEAL_SHEET, [row]);
  }

  let credit = { earned:false, amount:0, status:'not-finalized' };
  if (input.finalize) {
    const credits = indexRows(await readValues(client, CREDIT_SHEET, 'J'));
    const existingCredit = credits.find(row => row.value['Order ID'] === tokenRow['Order ID']);
    if (existingCredit) {
      credit = { earned:true, amount:Number(existingCredit.value['Face Value'] || 5), status:existingCredit.value.Status || 'active' };
    } else {
      const balance = creditState(credits, tokenRow['Customer Key']);
      const status = balance >= 30 ? 'queued' : 'active';
      const expires = core.addDays(new Date(), 90);
      await appendRows(client, CREDIT_SHEET, [[
        now, tokenRow['Order ID'], Number(tokenRow.Batch), tokenRow['Customer Name'], tokenRow['Customer Key'],
        5, isoDate(expires), status, '', '',
      ]]);
      credit = { earned:true, amount:5, status, activeBalance:Math.min(30, balance + (status === 'active' ? 5 : 0)) };
    }
  }
  return { status:200, body:{ status:'success', saved:true, finalized:input.finalize, credit } };
}

async function handler(request, response) {
  if (!['GET','POST'].includes(request.method)) return sendJson(response,405,{ error:'Method not allowed.' });
  try {
    const client = await sheetsClient();
    await ensureSheets(client);
    if (request.method === 'GET') {
      const url = new URL(request.url, PUBLIC_BASE_URL);
      const result = await getFeedback(client, url.searchParams.get('t'));
      return sendJson(response, result.status, result.body);
    }
    if (request.body?.action === 'provision') {
      if (!PLANNER_KEY || !keysMatch(request.headers['x-prpd-planner-key'], PLANNER_KEY)) {
        return sendJson(response,401,{ error:'Feedback-label authorization failed.' },true);
      }
      return sendJson(response,200,{ status:'success', ...(await provision(client, request.body)) },true);
    }
    const sourceError = requestSourceError(request);
    if (sourceError) return sendJson(response,403,{ error:sourceError });
    const result = await saveFeedback(client, request.body);
    return sendJson(response,result.status,result.body);
  } catch (error) {
    safeLogError('Feedback request failed.', error);
    const clientError = error?.code === 'feedback_input';
    return sendJson(response,clientError ? 400 : 500,{ error:clientError ? error.message : 'Feedback could not be saved right now.' });
  }
}

handler._test = { keysMatch, creditState, publicOrder };
module.exports = handler;
