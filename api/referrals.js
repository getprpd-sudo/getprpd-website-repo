const crypto = require('node:crypto');
const { assertExactKeys, requestSourceError, safeLogError } = require('./_security');
const {
  findReferralCode,
  normalizeCode,
  promotionFromReferral,
  readReferralCodes,
  upsertReferralCode,
} = require('./_referral-program');

const PLANNER_KEY = process.env.PRPD_PLANNER_KEY;
const MAX_BODY_BYTES = 8 * 1024;
const REFERRAL_KEYS = new Set([
  'code', 'ownerName', 'ownerEmail', 'ownerPhone', 'programType',
  'customerDiscount', 'referrerCredit', 'status', 'createdAt', 'expiresAt',
  'maxPaidReferrals', 'creditUsed', 'notes', 'rowNumber',
]);

function sendJson(response, status, body, isPrivate = false) {
  response.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', isPrivate ? 'no-store, private' : 'no-store');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.end(JSON.stringify(body));
}

function keysMatch(provided, expected) {
  const left = Buffer.from(String(provided || ''), 'utf8');
  const right = Buffer.from(String(expected || ''), 'utf8');
  return left.length > 0 && left.length === right.length && crypto.timingSafeEqual(left, right);
}

function isAdmin(request) {
  return Boolean(PLANNER_KEY && keysMatch(request.headers['x-prpd-planner-key'], PLANNER_KEY));
}

module.exports = async function handler(request, response) {
  try {
    if (request.method === 'GET' && request.query?.code) {
      const record = await findReferralCode(request.query.code);
      const promotion = promotionFromReferral(record);
      if (!promotion) return sendJson(response, 404, { active: false, error: 'That referral code is not active.' });
      return sendJson(response, 200, {
        active: true,
        promotion: {
          code: promotion.code,
          type: promotion.type,
          value: promotion.value,
          maxDiscount: promotion.maxDiscount,
          firstOrderOnly: true,
        },
      });
    }

    if (!isAdmin(request)) return sendJson(response, 401, { error: 'Referral administration authorization failed.' }, true);

    if (request.method === 'GET') {
      const codes = await readReferralCodes({ ensure: true });
      return sendJson(response, 200, { codes }, true);
    }
    if (request.method === 'POST') {
      if (!String(request.headers['content-type'] || '').toLowerCase().includes('application/json')) {
        return sendJson(response, 415, { error: 'JSON content is required.' }, true);
      }
      if (Number(request.headers['content-length'] || 0) > MAX_BODY_BYTES) {
        return sendJson(response, 413, { error: 'Referral request is too large.' }, true);
      }
      const sourceError = requestSourceError(request);
      if (sourceError) return sendJson(response, 403, { error: sourceError }, true);
      let body;
      try {
        body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
      } catch {
        return sendJson(response, 400, { error: 'Referral request must contain valid JSON.' }, true);
      }
      if (Buffer.byteLength(JSON.stringify(body || {}), 'utf8') > MAX_BODY_BYTES) {
        return sendJson(response, 413, { error: 'Referral request is too large.' }, true);
      }
      assertExactKeys(body, REFERRAL_KEYS, 'Referral request');
      const record = await upsertReferralCode(body || {});
      return sendJson(response, 200, { status: 'saved', record }, true);
    }
    response.setHeader('Allow', 'GET, POST');
    return sendJson(response, 405, { error: 'Method not allowed.' }, true);
  } catch (error) {
    safeLogError('Referral program request failed.', error);
    const message = /required|invalid|already has|must be/i.test(error.message || '')
      ? error.message
      : 'Referral program data could not be loaded right now.';
    const status = /required|invalid|already has|must be/i.test(error.message || '') ? 400 : 500;
    return sendJson(response, status, { error: message }, true);
  }
};

module.exports._test = { keysMatch, normalizeCode };
