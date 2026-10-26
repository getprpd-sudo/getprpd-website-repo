'use strict';

const { GoogleAuth } = require('google-auth-library');
const QRCode = require('qrcode');
const { requestSourceError, safeLogError } = require('./_security');
const core = require('./_feedback-core');
const rewards = require('./_feedback-rewards');

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const GOOGLE_SERVICE_ACCOUNT_JSON = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
const GOOGLE_SERVICE_ACCOUNT_BASE64 = process.env.GOOGLE_SERVICE_ACCOUNT_BASE64;
const PLANNER_KEY = process.env.PRPD_PLANNER_KEY;
const TOKEN_SECRET = process.env.PRPD_FEEDBACK_TOKEN_SECRET || PLANNER_KEY;
const PUBLIC_BASE_URL = 'https://getprpd.com';
const TOKEN_SHEET = 'Feedback Tokens';
const MEAL_SHEET = 'Meal Feedback';
const CREDIT_SHEET = 'Feedback Credits';
const TOKEN_HEADERS = ['Created At','Token Hash','Order ID','Batch','Batch ID','Customer Key','Customer First Name','Customer Name','Delivery Date','Expires At','Status','Meals JSON','Last Accessed At','Overall Note','Testimonial Consent','Testimonial Display'];
const MEAL_HEADERS = ['Updated At','Order ID','Batch','Customer Name','Customer Key','Meal ID','Meal Name','Tier','Quantity','Score','Liked Note','Change Note','Testimonial Consent','Testimonial Display','Overall Note','Canonical Dish ID','Qualified At','Reward Customer Key'];
const CREDIT_HEADERS = ['Issued At','Order ID','Batch','Customer Name','Customer Key','Face Value','Expires At','Status','Redeemed At','Redeemed Order ID','Reward Key','Unique Dish Milestone','Reward Customer Key'];

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
  const range = encodeURIComponent(`'${title}'!A1:${endColumn}`);
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
  const existing = indexRows(await readValues(client, TOKEN_SHEET, 'P'));
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
      prior?.value['Overall Note'] || '', prior?.value['Testimonial Consent'] || 'No', prior?.value['Testimonial Display'] || 'first-name',
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

async function rewardCustomer(client, tokenRow) {
  if (/^SAMPLE-/i.test(tokenRow['Order ID'] || '')) return {key:null,legacyKeys:[]};
  const orders = indexRows(await readValues(client, 'Orders', 'AZ'));
  const order = orders.find(row => row.value['Order ID'] === tokenRow['Order ID']);
  const key = rewards.customerIdentity(TOKEN_SECRET, order?.value);
  const legacyKeys = new Set([tokenRow['Customer Key']]);
  if (key) for (const row of orders) {
    if (rewards.customerIdentity(TOKEN_SECRET,row.value) === key) {
      legacyKeys.add(core.customerKey(TOKEN_SECRET,{email:row.value.Email,phone:row.value.Phone,
        customerName:`${row.value['First Name']} ${row.value['Last Name']}`,orderId:row.value['Order ID']}));
    }
  }
  return {key,legacyKeys:[...legacyKeys].filter(Boolean)};
}

function publicOrder(tokenRow, feedbackRows, rewardCustomerKey = null) {
  const meals = rewards.uniqueMeals(JSON.parse(tokenRow.value['Meals JSON'] || '[]'));
  const prior = new Map(feedbackRows
    .filter(row => row.value['Order ID'] === tokenRow.value['Order ID'])
    .map(row => [`${row.value['Meal ID']}:${row.value.Tier}`, row.value]));
  const firstSaved = feedbackRows.find(row => row.value['Order ID'] === tokenRow.value['Order ID'])?.value || {};
  const counted = rewards.qualifiedDishIds(feedbackRows, rewardCustomerKey);
  return {
    customerFirstName: tokenRow.value['Customer First Name'],
    deliveryDate: tokenRow.value['Delivery Date'],
    uniqueDishCount: meals.length,
    rewardProgress: rewards.progress(feedbackRows, rewardCustomerKey),
    meals: meals.map(meal => {
      const saved = prior.get(`${meal.id}:${meal.tier}`) || {};
      return {
        id: meal.id, name: meal.name, tier: meal.tier, quantity: meal.quantity, image: meal.image,
        portionLabel: meal.portions.map(tier => tier.toUpperCase()).join(' + '),
        alreadyCounted: counted.has(meal.canonicalDishId),
        feedback: saved.Score ? {
          score: Number(saved.Score), liked: saved['Liked Note'] || '', change: saved['Change Note'] || '',
        } : null,
      };
    }),
    overallNote: tokenRow.value['Overall Note'] ?? firstSaved['Overall Note'] ?? '',
    testimonialConsent: (tokenRow.value['Testimonial Consent'] ?? firstSaved['Testimonial Consent']) === 'Yes',
    testimonialDisplay: tokenRow.value['Testimonial Display'] || firstSaved['Testimonial Display'] || 'first-name',
  };
}

async function tokenContext(client, token) {
  if (!core.TOKEN_PATTERN.test(String(token || ''))) return null;
  const hash = core.tokenHash(token);
  const tokenRows = indexRows(await readValues(client, TOKEN_SHEET, 'P'));
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
  const feedbackRows = indexRows(await readValues(client, MEAL_SHEET, 'R'));
  const customer = await rewardCustomer(client, context.record.value);
  const touched = TOKEN_HEADERS.map(header => context.record.value[header] || '');
  touched[12] = nowIso();
  await updateRow(client, TOKEN_SHEET, context.record.rowNumber, touched);
  return { status: 200, body: { status:'success', order:publicOrder(context.record, feedbackRows, customer.key) } };
}

function creditState(rows, customerKey, now = new Date()) {
  const today = chicagoDate(now);
  const active = rows.filter(row => row.value['Customer Key'] === customerKey && row.value.Status === 'active'
    && row.value['Expires At'] >= today);
  return active.reduce((sum, row) => sum + Number(row.value['Face Value'] || 0), 0);
}

async function rewardState(client) {
  const [creditValues, metadata] = await Promise.all([
    readValues(client, CREDIT_SHEET, 'M'),
    client.request({url:sheetUrl('?fields=sheets(properties(sheetId,title)),namedRanges(namedRangeId)'),method:'GET'}),
  ]);
  const sheetId = metadata.data.sheets.find(sheet => sheet.properties.title === CREDIT_SHEET)?.properties.sheetId;
  if (!Number.isInteger(sheetId)) throw new Error('Feedback credit sheet is unavailable.');
  return { credits:indexRows(creditValues), sheetId,
    claimIds:new Set((metadata.data.namedRanges || []).map(range => range.namedRangeId)) };
}

async function saveFeedback(client, raw) {
  const context = await tokenContext(client, raw?.token);
  if (!context) return { status:404, body:{ error:'This feedback link is invalid or no longer active.' } };
  if (context.expired) return { status:410, body:{ error:'This feedback link has expired.' } };
  if (context.pending) return { status:425, body:{ error:'Feedback opens after delivery.', availableOn:context.record.value['Delivery Date'] } };
  const tokenRow = context.record.value;
  const expectedMeals = rewards.uniqueMeals(JSON.parse(tokenRow['Meals JSON'] || '[]'));
  const input = core.normalizeSave(raw, expectedMeals);
  const customer = await rewardCustomer(client, tokenRow);
  const existing = indexRows(await readValues(client, MEAL_SHEET, 'R'));
  const orderRows = existing.filter(row => row.value['Order ID'] === tokenRow['Order ID']);
  const now = nowIso();
  for (const feedback of input.meals) {
    const meal = expectedMeals.find(item => item.id === feedback.id && item.tier === feedback.tier);
    const prior = orderRows.find(row => row.value['Canonical Dish ID'] === meal.canonicalDishId
      || (row.value['Meal ID'] === feedback.id && row.value.Tier === feedback.tier));
    const row = [
      now, tokenRow['Order ID'], Number(tokenRow.Batch), tokenRow['Customer Name'], tokenRow['Customer Key'],
      meal.id, core.sheetCell(meal.name,120), meal.tier, meal.quantity, feedback.score,
      core.sheetCell(feedback.liked,500), core.sheetCell(feedback.change,500),
      input.testimonialConsent ? 'Yes' : 'No', input.testimonialDisplay, core.sheetCell(input.overallNote,1000),
      meal.canonicalDishId, prior?.value['Qualified At'] || (feedback.liked.length >= 8 && customer.key ? now : ''),
      prior?.value['Reward Customer Key'] || customer.key || '',
    ];
    if (prior) await updateRow(client, MEAL_SHEET, prior.rowNumber, row);
    else await appendRows(client, MEAL_SHEET, [row]);
  }
  const orderPreferences = TOKEN_HEADERS.map(header => tokenRow[header] || '');
  orderPreferences[13] = core.sheetCell(input.overallNote,1000);
  orderPreferences[14] = input.testimonialConsent ? 'Yes' : 'No';
  orderPreferences[15] = input.testimonialDisplay;
  await updateRow(client, TOKEN_SHEET, context.record.rowNumber, orderPreferences);
  const savedRows = indexRows(await readValues(client, MEAL_SHEET, 'R'));
  const rewardProgress = rewards.progress(savedRows, customer.key);
  let credit = { earned:false, amount:0, status:'no-new-milestone', milestones:[] };
  if (input.finalize || rewardProgress.uniqueDishCount > rewards.qualifiedDishIds(existing, customer.key).size) {
    try {
      credit = await rewards.issueMilestones({
        customerKey:customer.key, legacyKey:tokenRow['Customer Key'], legacyKeys:customer.legacyKeys, uniqueDishCount:rewardProgress.uniqueDishCount,
        order:{orderId:tokenRow['Order ID'],batch:Number(tokenRow.Batch),customerName:tokenRow['Customer Name']},
        now,today:chicagoDate(),readState:()=>rewardState(client),
        commit:requests=>client.request({url:sheetUrl(':batchUpdate'),method:'POST',data:{requests}}),
      });
    } catch (error) {
      safeLogError('Feedback saved; reward reconciliation needs a retry.',error);
      credit = {earned:false,amount:0,status:'pending',milestones:[]};
    }
  }
  return { status:200, body:{ status:'success', saved:true, finalized:input.finalize, credit, rewardProgress } };
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

handler._test = { keysMatch, creditState, publicOrder, saveFeedback, getFeedback, rewardCustomer, rewardState, indexRows, TOKEN_HEADERS, MEAL_HEADERS, CREDIT_HEADERS };
module.exports = handler;
