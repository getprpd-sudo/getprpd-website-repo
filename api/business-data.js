const crypto = require('node:crypto');
const { GoogleAuth } = require('google-auth-library');
const { safeLogError } = require('./_security');

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const GOOGLE_SERVICE_ACCOUNT_JSON = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
const GOOGLE_SERVICE_ACCOUNT_BASE64 = process.env.GOOGLE_SERVICE_ACCOUNT_BASE64;
const PLANNER_KEY = process.env.PRPD_PLANNER_KEY;

const RANGES = Object.freeze({
  orders: "'Orders'!A1:AC5000",
  payments: "'Payment Log'!A1:P5000",
  leads: "'Website Leads'!A1:T5000",
  receivables: "'Accounts Receivable'!A1:H500",
});

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
  if (!GOOGLE_SERVICE_ACCOUNT_BASE64 && !GOOGLE_SERVICE_ACCOUNT_JSON) throw new Error('Google Sheets is not configured.');
  const json = GOOGLE_SERVICE_ACCOUNT_BASE64
    ? Buffer.from(GOOGLE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8')
    : GOOGLE_SERVICE_ACCOUNT_JSON;
  const credentials = JSON.parse(json);
  if (credentials.private_key) credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
  return credentials;
}

async function readBusinessData() {
  if (!SHEET_ID) throw new Error('Google Sheet ID is not configured.');
  const auth = new GoogleAuth({ credentials: getCredentials(), scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'] });
  const client = await auth.getClient();
  const entries = await Promise.all(Object.entries(RANGES).map(async ([key, range]) => {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(range)}`;
    const result = await client.request({ url, method: 'GET' });
    return [key, result.data.values || []];
  }));
  return Object.fromEntries(entries);
}

async function handler(request, response) {
  if (request.method !== 'GET') return sendJson(response, 405, { error: 'Method not allowed.' });
  if (!PLANNER_KEY || !keysMatch(request.headers['x-prpd-planner-key'], PLANNER_KEY)) {
    return sendJson(response, 401, { error: 'Business Center authorization failed.' });
  }
  try {
    const data = await readBusinessData();
    return sendJson(response, 200, { fetchedAt: new Date().toISOString(), ...data });
  } catch (error) {
    safeLogError('Business Center sync failed.', error);
    return sendJson(response, 500, { error: 'Business data could not be loaded right now.' });
  }
}

handler._test = { keysMatch, RANGES };
module.exports = handler;
