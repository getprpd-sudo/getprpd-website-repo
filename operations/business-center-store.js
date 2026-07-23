const fs = require('node:fs');
const path = require('node:path');

const SCHEMA_VERSION = 1;
const DATA_DIR = path.join(__dirname, 'private-data', 'business-center');
const DATA_FILE = path.join(DATA_DIR, 'state.json');

function cleanText(value, max = 500) {
  return String(value ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max);
}

function money(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0 || number > 1_000_000) throw new Error('Amount is invalid.');
  return Math.round(number * 100) / 100;
}

function validateState(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Business Center state is invalid.');
  const outreachEntries = Object.entries(input.outreach || {});
  if (outreachEntries.length > 200) throw new Error('Too many outreach records.');
  const outreach = {};
  for (const [rawId, raw] of outreachEntries) {
    const id = cleanText(rawId, 100);
    if (!/^[a-z0-9-]+$/i.test(id) || !raw || typeof raw !== 'object') throw new Error('Outreach record is invalid.');
    outreach[id] = {
      status: ['Not contacted', 'Draft ready', 'Contacted', 'Follow up', 'Meeting', 'Partner', 'Passed'].includes(raw.status) ? raw.status : 'Not contacted',
      owner: cleanText(raw.owner, 80), notes: cleanText(raw.notes, 1000), lastContact: cleanText(raw.lastContact, 30),
    };
  }
  const expenses = Array.isArray(input.expenses) ? input.expenses.slice(0, 1000).map(entry => ({
    id: cleanText(entry.id, 80), date: cleanText(entry.date, 20), batch: cleanText(entry.batch, 40),
    vendor: cleanText(entry.vendor, 100), category: cleanText(entry.category, 80), amount: money(entry.amount), notes: cleanText(entry.notes, 500),
  })).filter(entry => entry.id && entry.date) : [];
  const adImports = Array.isArray(input.adImports) ? input.adImports.slice(0, 100).map(entry => ({
    id: cleanText(entry.id, 80), importedAt: cleanText(entry.importedAt, 40), fileName: cleanText(entry.fileName, 180),
    platform: cleanText(entry.platform, 40) || 'TikTok', source: cleanText(entry.source, 20) || 'csv', dateFrom: cleanText(entry.dateFrom, 30), dateTo: cleanText(entry.dateTo, 30),
    spend: money(entry.spend), impressions: Math.max(0, Math.round(Number(entry.impressions) || 0)),
    clicks: Math.max(0, Math.round(Number(entry.clicks) || 0)), conversions: Math.max(0, Math.round(Number(entry.conversions) || 0)),
    campaigns: Array.isArray(entry.campaigns) ? entry.campaigns.slice(0, 100).map(row => ({
      name: cleanText(row.name, 180), spend: money(row.spend), impressions: Math.max(0, Math.round(Number(row.impressions) || 0)),
      clicks: Math.max(0, Math.round(Number(row.clicks) || 0)), conversions: Math.max(0, Math.round(Number(row.conversions) || 0)),
    })) : [],
  })).filter(entry => entry.id) : [];
  return { schemaVersion: SCHEMA_VERSION, updatedAt: new Date().toISOString(), outreach, expenses, adImports };
}

function readJson(filePath) {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch { return null; }
}

function loadState() {
  return readJson(DATA_FILE) || readJson(`${DATA_FILE}.bak`) || {
    schemaVersion: SCHEMA_VERSION, updatedAt: null, outreach: {}, expenses: [], adImports: [],
  };
}

function saveState(input) {
  const state = validateState(input);
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const temp = `${DATA_FILE}.${process.pid}.tmp`;
  if (fs.existsSync(DATA_FILE)) fs.copyFileSync(DATA_FILE, `${DATA_FILE}.bak`);
  fs.writeFileSync(temp, `${JSON.stringify(state, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' });
  fs.renameSync(temp, DATA_FILE);
  return state;
}

module.exports = { SCHEMA_VERSION, validateState, loadState, saveState, DATA_FILE };
