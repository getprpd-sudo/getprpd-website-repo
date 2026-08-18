const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const SCHEMA_VERSION = 1;
const MAX_ENTRIES = 1200;
const DATA_DIR = path.join(__dirname, 'private-data', 'grocery-builder');

function cleanText(value, maxLength = 240) {
  return String(value ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLength);
}

function cleanNumberMap(input, label) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {};
  const entries = Object.entries(input);
  if (entries.length > MAX_ENTRIES) throw new Error(`${label} has too many entries.`);
  const output = {};
  for (const [rawKey, rawValue] of entries) {
    const key = cleanText(rawKey);
    if (!key || !/^[a-z0-9:_|./ -]+$/i.test(key)) throw new Error(`${label} contains an invalid item key.`);
    const value = Number(rawValue);
    if (!Number.isFinite(value) || value < 0 || value > 1000000) throw new Error(`${label} contains an invalid amount.`);
    output[key] = value;
  }
  return output;
}

function cleanCatalog(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {};
  const entries = Object.entries(input);
  if (entries.length > MAX_ENTRIES) throw new Error('Grocery catalog has too many entries.');
  const output = {};
  for (const [rawKey, rawValue] of entries) {
    const key = cleanText(rawKey);
    if (!key || !/^[a-z0-9:_|./ -]+$/i.test(key)) throw new Error('Grocery catalog contains an invalid item key.');
    if (!rawValue || typeof rawValue !== 'object' || Array.isArray(rawValue)) continue;
    const price = Number(rawValue.price);
    if (!Number.isFinite(price) || price < 0 || price > 100000) throw new Error('Grocery catalog contains an invalid price.');
    output[key] = { price };
  }
  return output;
}

function validateState(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Grocery state must be an object.');
  const batchKey = cleanText(input.batchKey, 180);
  if (!batchKey) throw new Error('Grocery state batch key is required.');
  return {
    schemaVersion: SCHEMA_VERSION,
    batchKey,
    updatedAt: new Date().toISOString(),
    onHand: cleanNumberMap(input.onHand, 'On-hand inventory'),
    buyPackages: cleanNumberMap(input.buyPackages, 'Package selections'),
    catalog: cleanCatalog(input.catalog),
  };
}

function fileForBatch(batchKey) {
  const digest = crypto.createHash('sha256').update(batchKey).digest('hex').slice(0, 20);
  return path.join(DATA_DIR, `grocery-state-${digest}.json`);
}

function readJson(filePath) {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch { return null; }
}

function loadState(batchKey) {
  const cleanKey = cleanText(batchKey, 180);
  if (!cleanKey) throw new Error('Grocery state batch key is required.');
  const filePath = fileForBatch(cleanKey);
  const current = readJson(filePath);
  if (current?.batchKey === cleanKey) return current;
  const backup = readJson(`${filePath}.bak`);
  return backup?.batchKey === cleanKey ? backup : null;
}

function saveState(input) {
  const state = validateState(input);
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const filePath = fileForBatch(state.batchKey);
  const tempPath = `${filePath}.${process.pid}.tmp`;
  if (fs.existsSync(filePath)) fs.copyFileSync(filePath, `${filePath}.bak`);
  fs.writeFileSync(tempPath, `${JSON.stringify(state, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' });
  fs.renameSync(tempPath, filePath);
  const verified = readJson(filePath);
  if (!verified || verified.batchKey !== state.batchKey || verified.updatedAt !== state.updatedAt) {
    throw new Error('Grocery state verification failed after saving.');
  }
  return state;
}

module.exports = { SCHEMA_VERSION, validateState, loadState, saveState, fileForBatch };
