const crypto = require('node:crypto');
const { GoogleAuth } = require('google-auth-library');
const ORDER_CONFIG = require('../config/order-config');
const { safeLogError } = require('./_security');

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const GOOGLE_SERVICE_ACCOUNT_JSON = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
const GOOGLE_SERVICE_ACCOUNT_BASE64 = process.env.GOOGLE_SERVICE_ACCOUNT_BASE64;
const PLANNER_KEY = process.env.PRPD_PLANNER_KEY;

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

function getCredentials() {
  if (!GOOGLE_SERVICE_ACCOUNT_BASE64 && !GOOGLE_SERVICE_ACCOUNT_JSON) {
    throw new Error('Google Sheets is not configured.');
  }
  const json = GOOGLE_SERVICE_ACCOUNT_BASE64
    ? Buffer.from(GOOGLE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8')
    : GOOGLE_SERVICE_ACCOUNT_JSON;
  const credentials = JSON.parse(json);
  if (credentials.private_key) credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
  return credentials;
}

const ORDER_HEADERS = [
  'Submitted At', 'Batch', 'Delivery Date', 'First Name', 'Last Name', 'Phone',
  'Items', 'Exact Total', 'Total (Rounded)', 'Notes', 'Order ID',
];

const MAX_MANUAL_ORDERS = 20;
const MANUAL_ORDER_KEYS = new Set([
  'submittedAt', 'firstName', 'lastName', 'phone', 'items', 'exactTotal',
  'totalRounded', 'notes', 'orderId',
]);
const PLANNER_ONLY_ITEMS = ['BBQ Chicken Mac & Cheese', 'Premium NY Strip Steak'];
const MANUAL_ITEM_NAMES = new Set([
  ...Object.values(ORDER_CONFIG.menu).flat().map(item => item.name.toLowerCase()),
  ...PLANNER_ONLY_ITEMS.map(name => name.toLowerCase()),
]);

function safeCell(value, maxLength, preserveNewlines = false) {
  const controls = preserveNewlines ? /[\u0000-\u0009\u000B-\u001F\u007F]/g : /[\u0000-\u001F\u007F]/g;
  const clean = String(value ?? '').replace(/\r\n?/g, '\n').replace(controls, ' ').trim().slice(0, maxLength);
  return /^[=+\-@]/.test(clean) ? `'${clean}` : clean;
}

function finiteMoney(value, label) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0 || amount > 5000) throw new Error(`${label} is invalid.`);
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

function validateManualItemLines(items) {
  const lines = String(items || '').split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  if (!lines.length || lines.length > 60) return false;
  return lines.every((line) => {
    if (/^delivery\b/i.test(line)) return true;
    const match = line.match(/^(\d+)x\s+(.+?)(?:\s+\((Lean|Bulk)\))?\s*(?:[-\u2013\u2014]\s*\$?[\d.]+)?$/i);
    if (!match || Number(match[1]) < 1 || Number(match[1]) > 50) return false;
    return MANUAL_ITEM_NAMES.has(match[2].trim().toLowerCase());
  });
}

function validateManualOrders(raw) {
  if (!raw || raw.action !== 'insert-manual-orders' || !Array.isArray(raw.orders)) {
    throw new Error('Invalid manual-order request.');
  }
  if (!raw.orders.length || raw.orders.length > MAX_MANUAL_ORDERS) {
    throw new Error('Manual-order batch size is invalid.');
  }
  const ids = new Set();
  return raw.orders.map((entry) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) throw new Error('Manual order must be an object.');
    if (Object.keys(entry).some(key => !MANUAL_ORDER_KEYS.has(key))) throw new Error('Manual order contains unsupported fields.');
    const firstName = safeCell(entry.firstName, 60);
    const lastName = safeCell(entry.lastName, 60);
    const phone = safeCell(entry.phone, 30);
    const items = safeCell(entry.items, 5000, true);
    const notes = safeCell(entry.notes, 500);
    const orderId = safeCell(entry.orderId, 80);
    const submittedAt = safeCell(entry.submittedAt || new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Chicago', dateStyle: 'short', timeStyle: 'medium',
    }).format(new Date()), 80);
    if (!firstName) throw new Error('Manual order first name is required.');
    if (!orderId || !/^PRPD-B\d+-MANUAL-\d{8}-[A-Z0-9]{4,12}$/.test(orderId)) throw new Error('Manual order reference is invalid.');
    if (ids.has(orderId)) throw new Error('Manual order references must be unique.');
    ids.add(orderId);
    if (!validateManualItemLines(items)) throw new Error(`Manual order ${orderId} contains an unknown or malformed item.`);
    const exactTotal = finiteMoney(entry.exactTotal, 'Exact total');
    const totalRounded = finiteMoney(entry.totalRounded, 'Rounded total');
    return {
      submittedAt, firstName, lastName, phone, items, exactTotal, totalRounded, notes, orderId,
      row: [
        submittedAt,
        `Batch ${ORDER_CONFIG.batch.number}`,
        ORDER_CONFIG.batch.deliveryDate,
        firstName,
        lastName,
        phone,
        items,
        exactTotal,
        totalRounded,
        notes,
        orderId,
      ],
    };
  });
}

function normalizeOrderRows(values, batchNumber) {
  if (!Array.isArray(values) || !values.length) return [];
  const header = ORDER_HEADERS.map((name, index) => values[0]?.[index] || name);
  const batchText = `batch ${batchNumber}`;
  const rows = values.slice(1).flatMap((rawRow) => {
    const row = Array.isArray(rawRow) ? rawRow : [];
    const batchIndex = row.findIndex(value => String(value || '').trim().toLowerCase() === batchText);
    if (batchIndex < 1) return [];
    const start = batchIndex - 1;
    const normalized = row.slice(start, start + ORDER_HEADERS.length);
    while (normalized.length < ORDER_HEADERS.length) normalized.push('');
    return [normalized];
  });
  return [header, ...rows];
}

async function readCurrentOrders() {
  if (!SHEET_ID) throw new Error('Google Sheet ID is not configured.');
  const auth = new GoogleAuth({
    credentials: getCredentials(),
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  const client = await auth.getClient();
  const range = "'Orders'!A1:Z5000";
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(range)}`;
  const result = await client.request({ url, method: 'GET' });
  const values = result.data.values || [];
  return normalizeOrderRows(values, ORDER_CONFIG.batch.number);
}

async function insertManualOrders(raw) {
  if (!SHEET_ID) throw new Error('Google Sheet ID is not configured.');
  const orders = validateManualOrders(raw);
  const auth = new GoogleAuth({
    credentials: getCredentials(),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const client = await auth.getClient();
  const readRange = "'Orders'!A1:AZ5000";
  const readUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(readRange)}`;
  const existing = (await client.request({ url: readUrl, method: 'GET' })).data.values || [];
  const existingIds = new Set(existing.map(row => String(row?.[10] || '').trim()).filter(Boolean));
  const pending = orders.filter(order => !existingIds.has(order.orderId));
  if (!pending.length) return { inserted: 0, skipped: orders.length, orderIds: orders.map(order => order.orderId) };

  let lastUsedRow = 1;
  existing.forEach((row, index) => {
    if ((row || []).slice(0, ORDER_HEADERS.length).some(value => String(value ?? '').trim())) lastUsedRow = index + 1;
  });
  const startRow = Math.max(2, lastUsedRow + 1);
  const endRow = startRow + pending.length - 1;
  const writeRange = `'Orders'!A${startRow}:K${endRow}`;
  const writeUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(writeRange)}?valueInputOption=RAW`;
  await client.request({ url: writeUrl, method: 'PUT', data: { values: pending.map(order => order.row) } });
  return { inserted: pending.length, skipped: orders.length - pending.length, orderIds: orders.map(order => order.orderId), startRow, endRow };
}

async function handler(request, response) {
  if (!['GET', 'POST'].includes(request.method)) return sendJson(response, 405, { error: 'Method not allowed.' });
  if (!PLANNER_KEY || !keysMatch(request.headers['x-prpd-planner-key'], PLANNER_KEY)) {
    return sendJson(response, 401, { error: 'Planner authorization failed.' });
  }
  try {
    if (request.method === 'POST') {
      const result = await insertManualOrders(request.body);
      return sendJson(response, 200, { status: 'success', ...result });
    }
    const rows = await readCurrentOrders();
    return sendJson(response, 200, {
      batch: ORDER_CONFIG.batch.number,
      deliveryDate: ORDER_CONFIG.batch.deliveryDate,
      fetchedAt: new Date().toISOString(),
      rows,
    });
  } catch (error) {
    safeLogError('Planner order sync failed.', error);
    return sendJson(response, 500, { error: 'Orders could not be loaded right now.' });
  }
}

handler._test = { keysMatch, normalizeOrderRows, validateManualItemLines, validateManualOrders };
module.exports = handler;
