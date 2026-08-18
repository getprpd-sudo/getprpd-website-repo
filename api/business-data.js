const crypto = require('node:crypto');
const { safeLogError } = require('./_security');
const { RANGES, readBusinessData } = require('./_business-data-source');

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
