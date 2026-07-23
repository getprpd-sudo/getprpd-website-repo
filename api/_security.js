'use strict';

const PUBLIC_ORIGINS = new Set([
  'https://getprpd.com',
  'https://www.getprpd.com',
  'http://127.0.0.1:4173',
  'http://localhost:4173',
  'http://127.0.0.1:3000',
  'http://localhost:3000',
]);

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
    && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
}

function assertExactKeys(value, allowedKeys, label) {
  if (!isPlainObject(value)) throw new Error(`${label} must be an object.`);
  const unexpected = Object.keys(value).filter(key => !allowedKeys.has(key));
  if (unexpected.length) throw new Error(`${label} contains unsupported fields.`);
}

function isAllowedOrigin(origin) {
  if (!origin) return true;
  const normalized = String(origin).replace(/\/$/, '');
  return PUBLIC_ORIGINS.has(normalized) || /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(normalized);
}

function requestSourceError(request) {
  const headers = request.headers || {};
  if (String(headers['sec-fetch-site'] || '').toLowerCase() === 'cross-site') {
    return 'Cross-site browser submissions are not accepted.';
  }
  if (!isAllowedOrigin(headers.origin)) return 'This submission source is not accepted.';
  return '';
}

function isLikelyBot(raw, now = Date.now()) {
  if (!isPlainObject(raw)) return false;
  if (String(raw.website || '').trim()) return true;
  if (raw.formStartedAt !== undefined && raw.formStartedAt !== '') {
    const startedAt = Number(raw.formStartedAt);
    if (!Number.isFinite(startedAt)) return true;
    const elapsed = now - startedAt;
    if (elapsed < 1200 || elapsed > 24 * 60 * 60 * 1000) return true;
  }
  return false;
}

function safeLogError(context, error) {
  const name = error && typeof error.name === 'string' ? error.name : 'Error';
  const code = error && ['string', 'number'].includes(typeof error.code) ? String(error.code).slice(0, 40) : '';
  const status = Number(error && (error.status || error.statusCode));
  console.error(context, { name, ...(code ? { code } : {}), ...(Number.isFinite(status) ? { status } : {}) });
}

module.exports = {
  assertExactKeys,
  isAllowedOrigin,
  isLikelyBot,
  isPlainObject,
  requestSourceError,
  safeLogError,
};
