const crypto = require('node:crypto');
const Core = require('./_business-center-core');
const ORDER_CONFIG = require('../config/order-config');
const { readBusinessData, getSheetsClient, spreadsheetUrl } = require('./_business-data-source');
const { safeLogError } = require('./_security');

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const CRON_SECRET = process.env.CRON_SECRET;
const PLANNER_KEY = process.env.PRPD_PLANNER_KEY;
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || 'getprpd@gmail.com';
const SENDER_EMAIL = 'PRPD Operator <operations@mail.getprpd.com>';
const LOG_SHEET = 'Automation Log';
const LOG_HEADERS = ['Run ID', 'Generated At', 'Automation', 'Status', 'Summary'];

function sendJson(response, status, body) {
  response.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store, private');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.end(JSON.stringify(body));
}

function keysMatch(provided, expected) {
  const left = Buffer.from(String(provided || ''), 'utf8');
  const right = Buffer.from(String(expected || ''), 'utf8');
  return left.length > 0 && left.length === right.length && crypto.timingSafeEqual(left, right);
}

function bearerToken(request) {
  const match = String(request.headers.authorization || '').match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : '';
}

function chicagoDate(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);
}

function money(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0);
}

function renderBrief(brief) {
  const actionText = brief.actions.map((action, index) => `${index + 1}. ${action.title}: ${action.detail}`);
  const incompleteText = brief.incompleteOrders.length
    ? brief.incompleteOrders.map(order => `- ${order.customer}: ${order.missing.join(', ')}`)
    : ['- None'];
  const unpaidText = [...brief.unpaid.map(row => `- ${row.customer}: ${money(row.balance)}`),
    ...brief.consolidated.map(row => `- ${row.customer} (consolidated): ${money(row.balance)}`)];
  const text = [
    `PRPD Daily Operator Brief - ${chicagoDate(new Date(brief.generatedAt))}`,
    '',
    `Batch ${brief.batchNumber}${brief.deliveryDate ? ` | ${brief.deliveryDate}` : ''}`,
    `${brief.counts.orders} orders | ${brief.counts.meals} meals | ${brief.counts.recentLeads} new leads in 24 hours`,
    `Booked ${money(brief.money.booked)} | Collected ${money(brief.money.collected)}`,
    `Outstanding ${money(brief.money.currentOutstanding + brief.money.consolidatedOutstanding)}`,
    '',
    'TOP ACTIONS',
    ...actionText,
    '',
    'MISSING ORDER DETAILS',
    ...incompleteText,
    '',
    'OUTSTANDING BALANCES',
    ...(unpaidText.length ? unpaidText : ['- None']),
    '',
    `Lead follow-ups without a matched order: ${brief.counts.leadFollowUps}`,
    `Cutoff: ${brief.cutoff.state}${brief.cutoff.label ? ` (${brief.cutoff.label})` : ''}`,
    '',
    'This is an internal read-only brief. No customer messages were sent.',
  ].join('\n');

  const actionHtml = brief.actions.map((action, index) => `
    <li style="margin:0 0 12px"><strong>${index + 1}. ${escapeHtml(action.title)}</strong><br>
    <span style="color:#536354">${escapeHtml(action.detail)}</span></li>`).join('');
  const issueRows = brief.incompleteOrders.map(order => `
    <tr><td style="padding:8px;border-bottom:1px solid #e4ded4">${escapeHtml(order.customer)}</td>
    <td style="padding:8px;border-bottom:1px solid #e4ded4">${escapeHtml(order.missing.join(', '))}</td></tr>`).join('');
  const html = `<div style="font-family:Arial,sans-serif;color:#1e2e1e;line-height:1.5;max-width:680px;margin:auto">
    <div style="background:#1e2e1e;color:#f6f1e8;padding:22px 26px">
      <div style="font-size:26px;font-weight:700;letter-spacing:2px">PRPD</div>
      <div style="font-size:12px;color:#a8c4ab;text-transform:uppercase">Daily Operator Brief</div>
    </div>
    <div style="padding:24px;border:1px solid #d8d2c9;border-top:0">
      <h1 style="font-size:22px;margin:0 0 4px">Batch ${brief.batchNumber}</h1>
      <p style="margin:0 0 18px;color:#536354">${escapeHtml(brief.deliveryDate || chicagoDate(new Date(brief.generatedAt)))}</p>
      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-bottom:22px">
        <div style="background:#eef4ec;padding:14px"><strong style="font-size:22px">${brief.counts.orders}</strong><br>orders</div>
        <div style="background:#eef4ec;padding:14px"><strong style="font-size:22px">${brief.counts.meals}</strong><br>meals</div>
        <div style="background:#eef4ec;padding:14px"><strong style="font-size:22px">${money(brief.money.collected)}</strong><br>collected</div>
        <div style="background:#fff1e5;padding:14px"><strong style="font-size:22px">${money(brief.money.currentOutstanding + brief.money.consolidatedOutstanding)}</strong><br>outstanding</div>
      </div>
      <h2 style="font-size:17px">Top actions</h2>
      <ol style="padding-left:22px">${actionHtml}</ol>
      <h2 style="font-size:17px;margin-top:24px">Missing order details</h2>
      ${issueRows ? `<table style="border-collapse:collapse;width:100%"><thead><tr><th align="left" style="padding:8px">Customer</th><th align="left" style="padding:8px">Missing</th></tr></thead><tbody>${issueRows}</tbody></table>` : '<p>None.</p>'}
      <p style="margin-top:24px;color:#536354"><strong>${brief.counts.recentLeads}</strong> new leads in 24 hours; <strong>${brief.counts.leadFollowUps}</strong> recent leads have no matched order.</p>
      <p style="font-size:12px;color:#6a786a;margin-top:22px">Internal read-only brief. No customer messages were sent.</p>
    </div>
  </div>`;
  return { text, html };
}

async function automationLogClient() {
  if (!SHEET_ID) throw new Error('Google Sheet ID is not configured.');
  return getSheetsClient('https://www.googleapis.com/auth/spreadsheets');
}

async function ensureLogSheet(client) {
  const metadata = await client.request({
    url: spreadsheetUrl(SHEET_ID, '?fields=sheets.properties.title'),
    method: 'GET',
  });
  const exists = (metadata.data.sheets || []).some(sheet => sheet.properties?.title === LOG_SHEET);
  if (!exists) {
    await client.request({
      url: spreadsheetUrl(SHEET_ID, ':batchUpdate'),
      method: 'POST',
      data: { requests: [{ addSheet: { properties: { title: LOG_SHEET, gridProperties: { frozenRowCount: 1 } } } }] },
    });
  }
  const headerUrl = spreadsheetUrl(SHEET_ID, `/values/${encodeURIComponent(`'${LOG_SHEET}'!A1:E1`)}?valueInputOption=RAW`);
  await client.request({ url: headerUrl, method: 'PUT', data: { values: [LOG_HEADERS] } });
}

async function findRun(client, runId) {
  const url = spreadsheetUrl(SHEET_ID, `/values/${encodeURIComponent(`'${LOG_SHEET}'!A2:E1000`)}`);
  const result = await client.request({ url, method: 'GET' });
  return (result.data.values || []).find(row => row[0] === runId && row[3] === 'sent');
}

async function appendRun(client, values) {
  const range = encodeURIComponent(`'${LOG_SHEET}'!A:E`);
  const url = spreadsheetUrl(SHEET_ID, `/values/${range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`);
  await client.request({ url, method: 'POST', data: { values: [values] } });
}

async function sendEmail(brief, runId) {
  if (!RESEND_API_KEY) throw new Error('Resend is not configured.');
  const rendered = renderBrief(brief);
  const result = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': runId,
    },
    body: JSON.stringify({
      from: SENDER_EMAIL,
      to: [NOTIFICATION_EMAIL],
      subject: `PRPD Daily Brief - Batch ${brief.batchNumber} - ${chicagoDate(new Date(brief.generatedAt))}`,
      text: rendered.text,
      html: rendered.html,
    }),
  });
  if (!result.ok) throw new Error(`Resend rejected the operator brief (${result.status}).`);
}

module.exports = async function handler(request, response) {
  if (request.method !== 'GET') return sendJson(response, 405, { error: 'Method not allowed.' });
  const cronAuthorized = CRON_SECRET && keysMatch(bearerToken(request), CRON_SECRET);
  const previewAuthorized = PLANNER_KEY && keysMatch(request.headers['x-prpd-planner-key'], PLANNER_KEY);
  if (!cronAuthorized && !previewAuthorized) return sendJson(response, 401, { error: 'Operator Brief authorization failed.' });

  try {
    const data = await readBusinessData();
    const model = Core.summarize({ fetchedAt: new Date().toISOString(), ...data });
    const brief = Core.operatorBrief(model, {
      now: new Date(),
      batchNumber: ORDER_CONFIG.batch.number,
      deliveryDate: ORDER_CONFIG.batch.deliveryDate,
      cutoffIso: ORDER_CONFIG.batch.cutoffIso,
      cutoffLabel: ORDER_CONFIG.batch.cutoffLabel,
    });
    if (!cronAuthorized) return sendJson(response, 200, { mode: 'preview', brief });

    const runId = `operator-brief-${chicagoDate(new Date())}`;
    const client = await automationLogClient();
    await ensureLogSheet(client);
    if (await findRun(client, runId)) return sendJson(response, 200, { status: 'already-sent', runId, brief });
    await sendEmail(brief, runId);
    await appendRun(client, [
      runId,
      brief.generatedAt,
      'Daily Operator Brief',
      'sent',
      `Batch ${brief.batchNumber}: ${brief.counts.orders} orders, ${brief.counts.meals} meals, ${brief.money.currentOutstanding + brief.money.consolidatedOutstanding} outstanding`,
    ]);
    return sendJson(response, 200, { status: 'sent', runId, brief });
  } catch (error) {
    safeLogError('Daily Operator Brief failed.', error);
    return sendJson(response, 500, { error: 'The Daily Operator Brief could not be generated.' });
  }
};

module.exports._test = {
  bearerToken,
  chicagoDate,
  keysMatch,
  renderBrief,
  LOG_HEADERS,
};
