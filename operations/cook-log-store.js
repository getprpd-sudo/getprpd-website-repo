const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const SCHEMA_VERSION = 1;
const MAX_FIELDS = 1200;
const MAX_VALUE_LENGTH = 4000;
const MAX_LOCK_VALUE_LENGTH = 100000;
const DATA_DIR = path.join(__dirname, 'private-data', 'cook-day-logs');

function cleanText(value, maxLength = MAX_VALUE_LENGTH) {
  return String(value ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').slice(0, maxLength);
}

function validateLog(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Cook log must be an object.');
  const batchKey = cleanText(input.batchKey, 180).trim();
  if (!batchKey) throw new Error('Cook log batch key is required.');
  if (!input.fields || typeof input.fields !== 'object' || Array.isArray(input.fields)) throw new Error('Cook log fields are invalid.');
  const entries = Object.entries(input.fields);
  if (entries.length > MAX_FIELDS) throw new Error('Cook log has too many fields.');
  const fields = {};
  for (const [rawKey, rawValue] of entries) {
    const key = cleanText(rawKey, 240).trim();
    if (!key || !/^[a-z0-9:_|.-]+$/i.test(key)) throw new Error('Cook log contains an invalid field key.');
    fields[key] = cleanText(rawValue, key.startsWith('lock:') ? MAX_LOCK_VALUE_LENGTH : MAX_VALUE_LENGTH);
  }
  if (fields['lock:status'] === 'locked') {
    try {
      const orders = JSON.parse(fields['lock:orders-json'] || '[]');
      if (!Array.isArray(orders) || orders.length === 0) throw new Error('empty');
    } catch {
      throw new Error('Locked cook log is missing a complete frozen order snapshot.');
    }
  }
  return {
    schemaVersion: SCHEMA_VERSION,
    batchKey,
    updatedAt: new Date().toISOString(),
    fields,
  };
}

function fileForBatch(batchKey) {
  const digest = crypto.createHash('sha256').update(batchKey).digest('hex').slice(0, 20);
  return path.join(DATA_DIR, `cook-log-${digest}.json`);
}

function readJson(filePath) {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch { return null; }
}

function loadLog(batchKey) {
  const cleanKey = cleanText(batchKey, 180).trim();
  if (!cleanKey) throw new Error('Cook log batch key is required.');
  const filePath = fileForBatch(cleanKey);
  const current = readJson(filePath);
  if (current?.batchKey === cleanKey) return current;
  const backup = readJson(`${filePath}.bak`);
  return backup?.batchKey === cleanKey ? backup : null;
}

function saveLog(input) {
  const log = validateLog(input);
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const filePath = fileForBatch(log.batchKey);
  const tempPath = `${filePath}.${process.pid}.tmp`;
  if (fs.existsSync(filePath)) fs.copyFileSync(filePath, `${filePath}.bak`);
  fs.writeFileSync(tempPath, `${JSON.stringify(log, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' });
  fs.renameSync(tempPath, filePath);
  const verified = readJson(filePath);
  if (!verified || verified.batchKey !== log.batchKey || verified.updatedAt !== log.updatedAt) {
    throw new Error('Cook log verification failed after saving.');
  }
  return log;
}

function preserveLockFields(existing, incoming) {
  if (!existing?.fields || !incoming?.fields) return incoming;
  const fields = Object.fromEntries(Object.entries(incoming.fields).filter(([key]) => !key.startsWith('lock:')));
  for (const [key,value] of Object.entries(existing.fields)) {
    if (key.startsWith('lock:')) fields[key] = value;
  }
  return { ...incoming, fields };
}

module.exports = { SCHEMA_VERSION, validateLog, loadLog, saveLog, preserveLockFields, fileForBatch };
