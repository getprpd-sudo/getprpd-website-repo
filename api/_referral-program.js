const { getSheetsClient, spreadsheetUrl } = require('./_business-data-source');

const SHEET_NAME = 'Referral Codes';
const HEADERS = Object.freeze([
  'Code', 'Owner Name', 'Owner Email', 'Owner Phone', 'Program Type',
  'Customer Discount', 'Referrer Credit', 'Status', 'Created At',
  'Expires At', 'Max Paid Referrals', 'Credit Used', 'Notes',
]);
const PUBLIC_CACHE_TTL_MS = 60_000;
let cachedRecords = null;
let cacheExpiresAt = 0;

function clean(value, max = 500) {
  return String(value ?? '').replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, max);
}

function normalizeCode(value) {
  return clean(value, 32).toUpperCase().replace(/[^A-Z0-9_-]/g, '');
}

function number(value, fallback = 0) {
  const parsed = Number(String(value ?? '').replace(/[$,%\s,]/g, ''));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function rowObject(row, rowNumber) {
  const values = HEADERS.map((_, index) => clean(row[index], index === 12 ? 1000 : 254));
  const record = Object.fromEntries(HEADERS.map((header, index) => [header, values[index]]));
  return {
    rowNumber,
    code: normalizeCode(record.Code),
    ownerName: record['Owner Name'],
    ownerEmail: record['Owner Email'].toLowerCase(),
    ownerPhone: record['Owner Phone'],
    programType: record['Program Type'] === 'Partner' ? 'Partner' : 'Customer referral',
    customerDiscount: Math.max(0, number(record['Customer Discount'], 10)),
    referrerCredit: Math.max(0, number(record['Referrer Credit'], 10)),
    status: record.Status === 'Inactive' ? 'Inactive' : 'Active',
    createdAt: record['Created At'],
    expiresAt: record['Expires At'],
    maxPaidReferrals: Math.max(0, Math.floor(number(record['Max Paid Referrals'], 0))),
    creditUsed: Math.max(0, number(record['Credit Used'], 0)),
    notes: record.Notes,
  };
}

function validEmail(value) {
  return !value || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value);
}

function suggestCode(records, ownerName) {
  const existingCodes = new Set((Array.isArray(records) ? records : []).map(record => normalizeCode(record.code)));
  const base = normalizeCode(ownerName).replace(/[_-]/g, '').slice(0, 20) || 'PRPD';
  let code = `${base}10`;
  let suffix = 2;
  while (existingCodes.has(code)) {
    code = `${base.slice(0, 28 - String(suffix).length)}${suffix}`;
    suffix += 1;
  }
  return code;
}

function serializeRecord(input, existing = null) {
  const code = normalizeCode(input.code || existing?.code);
  const ownerName = clean(input.ownerName ?? existing?.ownerName, 100);
  const ownerEmail = clean(input.ownerEmail ?? existing?.ownerEmail, 254).toLowerCase();
  const ownerPhone = clean(input.ownerPhone ?? existing?.ownerPhone, 30);
  const programType = input.programType === 'Partner' ? 'Partner' : 'Customer referral';
  const customerDiscount = Math.max(0, Math.min(50, number(input.customerDiscount ?? existing?.customerDiscount, 10)));
  const referrerCredit = Math.max(0, Math.min(100, number(input.referrerCredit ?? existing?.referrerCredit, 10)));
  const status = input.status === 'Inactive' ? 'Inactive' : 'Active';
  const createdAt = clean(existing?.createdAt || input.createdAt || new Date().toISOString(), 40);
  const expiresAt = clean(input.expiresAt ?? existing?.expiresAt, 20);
  const maxPaidReferrals = Math.max(0, Math.min(10000, Math.floor(number(input.maxPaidReferrals ?? existing?.maxPaidReferrals, 0))));
  const creditUsed = Math.max(0, Math.min(100000, number(input.creditUsed ?? existing?.creditUsed, 0)));
  const notes = clean(input.notes ?? existing?.notes, 1000);

  if (!/^[A-Z0-9][A-Z0-9_-]{2,31}$/.test(code)) throw new Error('Referral code must be 3 to 32 letters, numbers, dashes, or underscores.');
  if (!ownerName) throw new Error('Referral owner name is required.');
  if (!validEmail(ownerEmail)) throw new Error('Referral owner email is invalid.');
  if (customerDiscount <= 0) throw new Error('Customer discount must be greater than zero.');

  return {
    code, ownerName, ownerEmail, ownerPhone, programType, customerDiscount,
    referrerCredit, status, createdAt, expiresAt, maxPaidReferrals, creditUsed, notes,
  };
}

function valuesForRecord(record) {
  return [[
    record.code, record.ownerName, record.ownerEmail, record.ownerPhone,
    record.programType, record.customerDiscount, record.referrerCredit,
    record.status, record.createdAt, record.expiresAt, record.maxPaidReferrals,
    record.creditUsed, record.notes,
  ]];
}

async function sheetExists(client, sheetId) {
  const response = await client.request({
    url: spreadsheetUrl(sheetId, '?fields=sheets.properties.title'),
    method: 'GET',
  });
  return (response.data.sheets || []).some(sheet => sheet.properties?.title === SHEET_NAME);
}

function addSheetRequest() {
  return {
    addSheet: {
      properties: {
        title: SHEET_NAME,
        gridProperties: { frozenRowCount: 1 },
      },
    },
  };
}

async function ensureReferralSheet(client, sheetId) {
  if (!(await sheetExists(client, sheetId))) {
    try {
      await client.request({
        url: spreadsheetUrl(sheetId, ':batchUpdate'),
        method: 'POST',
        data: { requests: [addSheetRequest()] },
      });
    } catch (error) {
      if (!(await sheetExists(client, sheetId))) throw error;
    }
  }
  await client.request({
    url: spreadsheetUrl(sheetId, `/values/${encodeURIComponent(`'${SHEET_NAME}'!A1:M1`)}?valueInputOption=RAW`),
    method: 'PUT',
    data: { values: [HEADERS] },
  });
}

async function readReferralCodes({ ensure = false } = {}) {
  if (!ensure && cachedRecords && Date.now() < cacheExpiresAt) return cachedRecords.map(record => ({ ...record }));
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) throw new Error('Google Sheet ID is not configured.');
  const client = await getSheetsClient(ensure
    ? 'https://www.googleapis.com/auth/spreadsheets'
    : 'https://www.googleapis.com/auth/spreadsheets.readonly');
  if (ensure) await ensureReferralSheet(client, sheetId);
  else if (!(await sheetExists(client, sheetId))) return [];
  const response = await client.request({
    url: spreadsheetUrl(sheetId, `/values/${encodeURIComponent(`'${SHEET_NAME}'!A2:M1000`)}`),
    method: 'GET',
  });
  const records = (response.data.values || []).map((row, index) => rowObject(row, index + 2)).filter(record => record.code);
  if (!ensure) {
    cachedRecords = records;
    cacheExpiresAt = Date.now() + PUBLIC_CACHE_TTL_MS;
  }
  return records.map(record => ({ ...record }));
}

function isActive(record, now = Date.now()) {
  if (!record || record.status !== 'Active') return false;
  if (!record.expiresAt) return true;
  const expires = Date.parse(`${record.expiresAt}T23:59:59-05:00`);
  return Number.isFinite(expires) && now <= expires;
}

async function findReferralCode(code) {
  const normalized = normalizeCode(code);
  if (!normalized) return null;
  const record = (await readReferralCodes()).find(item => item.code === normalized);
  if (!isActive(record)) return null;
  return record;
}

function promotionFromReferral(record) {
  if (!isActive(record)) return null;
  return {
    code: record.code,
    partner: record.ownerName,
    ownerEmail: record.ownerEmail,
    ownerPhone: record.ownerPhone,
    programType: record.programType,
    type: 'fixed',
    value: record.customerDiscount,
    maxDiscount: record.customerDiscount,
    active: true,
    firstOrderOnly: true,
  };
}

async function upsertReferralCode(input) {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) throw new Error('Google Sheet ID is not configured.');
  const client = await getSheetsClient('https://www.googleapis.com/auth/spreadsheets');
  await ensureReferralSheet(client, sheetId);
  const records = await readReferralCodes({ ensure: true });
  let normalized = normalizeCode(input.code);
  if (!normalized) normalized = suggestCode(records, input.ownerName);
  const existing = records.find(record => record.code === normalized) || null;
  const record = serializeRecord({ ...input, code: normalized }, existing);
  const duplicateOwner = records.find(item => item.code !== record.code
    && record.ownerEmail && item.ownerEmail === record.ownerEmail && item.status === 'Active');
  if (duplicateOwner) throw new Error(`${record.ownerName} already has active code ${duplicateOwner.code}.`);
  const rowNumber = existing?.rowNumber || records.reduce((max, item) => Math.max(max, item.rowNumber), 1) + 1;
  await client.request({
    url: spreadsheetUrl(sheetId, `/values/${encodeURIComponent(`'${SHEET_NAME}'!A${rowNumber}:M${rowNumber}`)}?valueInputOption=RAW`),
    method: 'PUT',
    data: { values: valuesForRecord(record) },
  });
  cachedRecords = null;
  cacheExpiresAt = 0;
  return { ...record, rowNumber };
}

module.exports = {
  HEADERS,
  SHEET_NAME,
  addSheetRequest,
  findReferralCode,
  isActive,
  normalizeCode,
  promotionFromReferral,
  readReferralCodes,
  serializeRecord,
  suggestCode,
  upsertReferralCode,
};
