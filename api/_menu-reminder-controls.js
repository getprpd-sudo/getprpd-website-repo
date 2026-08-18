const crypto = require('node:crypto');
const { spreadsheetUrl } = require('./_business-data-source');

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const HOLD_SHEET = 'Reminder Holds';
const HOLD_HEADERS = ['Email', 'First Name', 'Batch', 'Phase', 'Status', 'Reason', 'Expires At', 'Added At', 'Added By'];
const DECISION_SHEET = 'Reminder Decision Log';
const DECISION_HEADERS = ['Run ID', 'Evaluated At', 'Batch', 'Phase', 'Contact Key', 'Decision', 'Reason'];

function clean(value, maxLength = 500) {
  return String(value ?? '').trim().slice(0, maxLength);
}

async function ensureSheet(client, title, headers) {
  if (!SHEET_ID) throw new Error('Google Sheet ID is not configured.');
  const metadata = await client.request({
    url: spreadsheetUrl(SHEET_ID, '?fields=sheets.properties.title'),
    method: 'GET',
  });
  const exists = (metadata.data.sheets || []).some(sheet => sheet.properties?.title === title);
  if (!exists) {
    await client.request({
      url: spreadsheetUrl(SHEET_ID, ':batchUpdate'),
      method: 'POST',
      data: { requests: [{ addSheet: { properties: { title, gridProperties: { frozenRowCount: 1 } } } }] },
    });
  }
  const endColumn = String.fromCharCode(64 + headers.length);
  const range = encodeURIComponent(`'${title}'!A1:${endColumn}1`);
  await client.request({
    url: spreadsheetUrl(SHEET_ID, `/values/${range}?valueInputOption=RAW`),
    method: 'PUT',
    data: { values: [headers] },
  });
}

async function readReminderHolds(client) {
  await ensureSheet(client, HOLD_SHEET, HOLD_HEADERS);
  const range = encodeURIComponent(`'${HOLD_SHEET}'!A2:I5000`);
  const result = await client.request({
    url: spreadsheetUrl(SHEET_ID, `/values/${range}`),
    method: 'GET',
  });
  return (result.data.values || []).map(row => ({
    email: clean(row[0], 320).toLowerCase(),
    firstName: clean(row[1], 120),
    batchNumber: Number(row[2]) || 0,
    phase: clean(row[3], 20).toLowerCase() || 'all',
    status: clean(row[4], 30).toLowerCase(),
    reason: clean(row[5], 500),
    expiresAt: clean(row[6], 80),
    addedAt: clean(row[7], 80),
    addedBy: clean(row[8], 120),
  })).filter(row => row.email && row.batchNumber);
}

function contactKey(email) {
  return crypto.createHash('sha256').update(clean(email, 320).toLowerCase()).digest('hex').slice(0, 16);
}

async function appendReminderDecisions(client, runId, batchNumber, phase, decisions) {
  await ensureSheet(client, DECISION_SHEET, DECISION_HEADERS);
  const existingRange = encodeURIComponent(`'${DECISION_SHEET}'!A2:A5000`);
  const existing = await client.request({
    url: spreadsheetUrl(SHEET_ID, `/values/${existingRange}`),
    method: 'GET',
  });
  if ((existing.data.values || []).some(row => clean(row[0], 240) === clean(runId, 240))) return;
  const evaluatedAt = new Date().toISOString();
  const rows = (Array.isArray(decisions) ? decisions : []).map(entry => [
    clean(runId, 240),
    evaluatedAt,
    Number(batchNumber) || 0,
    clean(phase, 20).toLowerCase(),
    contactKey(entry.email),
    clean(entry.decision, 40).toLowerCase(),
    clean(entry.reason, 120).toLowerCase(),
  ]);
  if (!rows.length) return;
  const range = encodeURIComponent(`'${DECISION_SHEET}'!A:G`);
  await client.request({
    url: spreadsheetUrl(SHEET_ID, `/values/${range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`),
    method: 'POST',
    data: { values: rows },
  });
}

module.exports = {
  DECISION_HEADERS,
  DECISION_SHEET,
  HOLD_HEADERS,
  HOLD_SHEET,
  appendReminderDecisions,
  contactKey,
  ensureSheet,
  readReminderHolds,
};
