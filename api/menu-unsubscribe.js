const crypto = require('node:crypto');
const { getSheetsClient } = require('./_business-data-source');
const { appendPreference } = require('./_menu-email-preferences');
const { normalizeEmail } = require('./_menu-reminder-core');
const { safeLogError } = require('./_security');

function signingSecret() {
  return process.env.EMAIL_UNSUBSCRIBE_SECRET || process.env.CRON_SECRET || '';
}

function encodeContact(email) {
  return Buffer.from(normalizeEmail(email), 'utf8').toString('base64url');
}

function decodeContact(value) {
  try {
    return normalizeEmail(Buffer.from(String(value || ''), 'base64url').toString('utf8'));
  } catch {
    return '';
  }
}

function signContact(email) {
  const secret = signingSecret();
  if (!secret) return '';
  return crypto.createHmac('sha256', secret).update(`menu-unsubscribe:${normalizeEmail(email)}`).digest('base64url');
}

function validToken(email, token) {
  const expected = signContact(email);
  const left = Buffer.from(String(token || ''), 'utf8');
  const right = Buffer.from(expected, 'utf8');
  return left.length > 0 && left.length === right.length && crypto.timingSafeEqual(left, right);
}

function page(message, success) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>PRPD Email Preferences</title></head>
  <body style="margin:0;background:#f5f1ea;color:#1e2e1e;font-family:Arial,sans-serif">
  <main style="max-width:560px;margin:72px auto;padding:30px;background:#fff;border:1px solid #ded8cf">
  <div style="font-size:28px;font-weight:700;letter-spacing:2px">PRPD</div>
  <h1 style="font-size:24px">${success ? 'Email preference updated' : 'We could not update that preference'}</h1>
  <p style="line-height:1.6">${message}</p>
  <p><a href="https://getprpd.com" style="color:#1f7a3f">Return to PRPD</a></p>
  </main></body></html>`;
}

module.exports = async function handler(request, response) {
  if (!['GET', 'POST'].includes(request.method)) {
    response.status(405).setHeader('Allow', 'GET, POST').end('Method not allowed.');
    return;
  }
  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store, private');
  response.setHeader('X-Robots-Tag', 'noindex, nofollow');

  const email = decodeContact(request.query?.contact);
  const token = String(request.query?.token || '');
  if (!email || !validToken(email, token)) {
    response.status(400).end(page('The unsubscribe link is invalid or incomplete. Reply to any PRPD email for help.', false));
    return;
  }

  try {
    const client = await getSheetsClient('https://www.googleapis.com/auth/spreadsheets');
    await appendPreference(client, email, 'unsubscribed', 'email unsubscribe link');
    response.status(200).end(page('You will no longer receive PRPD weekly menu and cutoff emails. Transactional order emails are unaffected.', true));
  } catch (error) {
    safeLogError('Menu email unsubscribe failed.', error);
    response.status(500).end(page('We could not save this change right now. Reply to any PRPD email and Rida will update it manually.', false));
  }
};

module.exports._test = {
  decodeContact,
  encodeContact,
  signContact,
  validToken,
};
