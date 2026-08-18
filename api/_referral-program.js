const { getSheetsClient, spreadsheetUrl } = require('./_business-data-source');

const SHEET_NAME = 'Referral Codes';
const HEADERS = Object.freeze([
  'Code', 'Owner Name', 'Owner Email', 'Owner Phone', 'Program Type',
  'Customer Discount', 'Referrer Credit', 'Status', 'Created At',
  'Expires At', 'Max Paid Referrals', 'Credit Used', 'Notes',
  'Minimum Order', 'First Order Only', 'Max Redemptions', 'Starts At',
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
  const cleaned = String(value ?? '').replace(/[$,%\s,]/g, '');
  if (!cleaned) return fallback;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function businessDate(now = Date.now()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date(now));
  const value = Object.fromEntries(parts.filter(part => part.type !== 'literal').map(part => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
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
    minimumOrder: Math.max(0, number(record['Minimum Order'], 60)),
    firstOrderOnly: !/^(no|false|0)$/i.test(record['First Order Only']),
    maxRedemptions: Math.max(0, Math.floor(number(record['Max Redemptions'], number(record['Max Paid Referrals'], 0)))),
    startsAt: record['Starts At'],
  };
}

function validEmail(value) {
  return !value || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value);
}

function validPhone(value) {
  return String(value || '').replace(/\D/g, '').length === 10;
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
  const requestedProgramType = input.programType ?? existing?.programType ?? 'Customer referral';
  const programType = requestedProgramType === 'Partner' ? 'Partner' : 'Customer referral';
  const customerDiscount = Math.max(0, Math.min(50, number(input.customerDiscount ?? existing?.customerDiscount, 10)));
  const referrerCredit = Math.max(0, Math.min(100, number(input.referrerCredit ?? existing?.referrerCredit, 10)));
  const requestedStatus = input.status ?? existing?.status ?? 'Inactive';
  const status = requestedStatus === 'Active' ? 'Active' : 'Inactive';
  const createdAt = clean(existing?.createdAt || input.createdAt || new Date().toISOString(), 40);
  const expiresAt = clean(input.expiresAt ?? existing?.expiresAt, 20);
  const maxPaidReferrals = Math.max(0, Math.min(10000, Math.floor(number(input.maxPaidReferrals ?? existing?.maxPaidReferrals, 0))));
  const creditUsed = Math.max(0, Math.min(100000, number(input.creditUsed ?? existing?.creditUsed, 0)));
  const notes = clean(input.notes ?? existing?.notes, 1000);
  const minimumOrder = Math.max(0, Math.min(5000, number(input.minimumOrder ?? existing?.minimumOrder, 60)));
  const firstOrderOnly = typeof input.firstOrderOnly === 'boolean'
    ? input.firstOrderOnly
    : existing?.firstOrderOnly !== false;
  const maxRedemptions = Math.max(0, Math.min(10000, Math.floor(number(
    input.maxRedemptions ?? existing?.maxRedemptions ?? maxPaidReferrals,
    maxPaidReferrals,
  ))));
  const startsAt = clean(input.startsAt ?? existing?.startsAt, 20);

  if (!/^[A-Z0-9][A-Z0-9_-]{2,31}$/.test(code)) throw new Error('Referral code must be 3 to 32 letters, numbers, dashes, or underscores.');
  if (!ownerName) throw new Error('Referral owner name is required.');
  if (!ownerEmail || !validEmail(ownerEmail)) throw new Error('Referral owner email is required and must be valid.');
  if (status === 'Active' && !validPhone(ownerPhone)) throw new Error('An active referral code requires a valid 10-digit owner phone.');
  if (customerDiscount <= 0) throw new Error('Customer discount must be greater than zero.');
  if (minimumOrder < customerDiscount) throw new Error('Minimum order must be at least the customer discount.');
  if (startsAt && !/^\d{4}-\d{2}-\d{2}$/.test(startsAt)) throw new Error('Referral start date is invalid.');
  if (expiresAt && !/^\d{4}-\d{2}-\d{2}$/.test(expiresAt)) throw new Error('Referral expiry date is invalid.');
  if (startsAt && expiresAt && expiresAt < startsAt) throw new Error('Referral expiry date must not precede its start date.');

  return {
    code, ownerName, ownerEmail, ownerPhone, programType, customerDiscount,
    referrerCredit, status, createdAt, expiresAt, maxPaidReferrals, creditUsed, notes,
    minimumOrder, firstOrderOnly, maxRedemptions, startsAt,
  };
}

function valuesForRecord(record) {
  return [[
    record.code, record.ownerName, record.ownerEmail, record.ownerPhone,
    record.programType, record.customerDiscount, record.referrerCredit,
    record.status, record.createdAt, record.expiresAt, record.maxPaidReferrals,
    record.creditUsed, record.notes, record.minimumOrder,
    record.firstOrderOnly ? 'Yes' : 'No', record.maxRedemptions, record.startsAt,
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
    url: spreadsheetUrl(sheetId, `/values/${encodeURIComponent(`'${SHEET_NAME}'!A1:Q1`)}?valueInputOption=RAW`),
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
    url: spreadsheetUrl(sheetId, `/values/${encodeURIComponent(`'${SHEET_NAME}'!A2:Q1000`)}`),
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
  const today = businessDate(now);
  if (record.startsAt && (!/^\d{4}-\d{2}-\d{2}$/.test(record.startsAt) || today < record.startsAt)) return false;
  if (!record.expiresAt) return true;
  return /^\d{4}-\d{2}-\d{2}$/.test(record.expiresAt) && today <= record.expiresAt;
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
    firstOrderOnly: record.firstOrderOnly,
    minimumOrder: record.minimumOrder,
    maxRedemptions: record.maxRedemptions,
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
    url: spreadsheetUrl(sheetId, `/values/${encodeURIComponent(`'${SHEET_NAME}'!A${rowNumber}:Q${rowNumber}`)}?valueInputOption=RAW`),
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
  businessDate,
  findReferralCode,
  isActive,
  normalizeCode,
  promotionFromReferral,
  readReferralCodes,
  serializeRecord,
  suggestCode,
  upsertReferralCode,
};
