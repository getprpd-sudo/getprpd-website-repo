const crypto = require('node:crypto');

const EVENTS_ENDPOINT = 'https://business-api.tiktok.com/open_api/v1.3/event/track/';
const DEFAULT_PIXEL_ID = 'D8KU48BC77U7CO3SHUSG';

function cleanText(value, maxLength = 500) {
  return String(value || '').replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, maxLength);
}

function safeHttpUrl(value) {
  const text = cleanText(value, 1000);
  if (!text) return '';
  try {
    const parsed = new URL(text);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.toString() : '';
  } catch {
    return '';
  }
}

function cookieValue(request, name) {
  const cookie = String(request?.headers?.cookie || '');
  const match = cookie.split(';').map(value => value.trim()).find(value => value.startsWith(`${name}=`));
  if (!match) return '';
  try { return decodeURIComponent(match.slice(name.length + 1)); } catch { return ''; }
}

function clickIdFromUrl(value) {
  const url = safeHttpUrl(value);
  if (!url) return '';
  try { return cleanText(new URL(url).searchParams.get('ttclid'), 500); } catch { return ''; }
}

function clientIp(request) {
  const forwarded = String(request?.headers?.['x-forwarded-for'] || '').split(',')[0].trim();
  return cleanText(forwarded || request?.socket?.remoteAddress || '', 80);
}

function normalizeEmail(value) {
  return cleanText(value, 320).toLowerCase();
}

function normalizePhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return '';
  return digits.length === 10 ? `+1${digits}` : `+${digits}`;
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function compact(value) {
  if (Array.isArray(value)) return value.map(compact).filter(item => item !== undefined);
  if (!value || typeof value !== 'object') return value === '' || value === null || value === undefined ? undefined : value;
  const entries = Object.entries(value)
    .map(([key, item]) => [key, compact(item)])
    .filter(([, item]) => item !== undefined && (!Array.isArray(item) || item.length));
  return entries.length ? Object.fromEntries(entries) : undefined;
}

function buildWebEvent({
  request,
  event,
  eventId,
  properties = {},
  pageUrl,
  referrer,
  email,
  phone,
  tiktokTtp,
  tiktokTtclid,
  eventTime = Math.floor(Date.now() / 1000),
  advancedMatching = process.env.TIKTOK_ADVANCED_MATCHING_ENABLED === 'true',
}) {
  const url = safeHttpUrl(pageUrl);
  const user = {
    ttp: cleanText(tiktokTtp, 500) || cookieValue(request, '_ttp'),
    ttclid: cleanText(tiktokTtclid, 500) || clickIdFromUrl(url),
    ip: clientIp(request),
    user_agent: cleanText(request?.headers?.['user-agent'], 1000),
  };
  if (advancedMatching) {
    const normalizedEmail = normalizeEmail(email);
    const normalizedPhone = normalizePhone(phone);
    if (normalizedEmail) user.email = [sha256(normalizedEmail)];
    if (normalizedPhone) user.phone = [sha256(normalizedPhone)];
  }

  return compact({
    event: cleanText(event, 100),
    event_time: Number(eventTime),
    event_id: cleanText(eventId, 200),
    user,
    page: { url, referrer: safeHttpUrl(referrer) },
    properties,
  });
}

async function sendWebEvent(options) {
  const accessToken = process.env.TIKTOK_EVENTS_ACCESS_TOKEN;
  const pixelId = process.env.TIKTOK_PIXEL_ID || DEFAULT_PIXEL_ID;
  if (!accessToken || !pixelId) return { configured: false, sent: false };

  const body = compact({
    event_source: 'web',
    event_source_id: pixelId,
    test_event_code: process.env.TIKTOK_EVENTS_TEST_CODE,
    data: [buildWebEvent(options)],
  });
  const result = await fetch(EVENTS_ENDPOINT, {
    method: 'POST',
    headers: { 'Access-Token': accessToken, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(4000),
  });
  const responseBody = await result.json().catch(() => null);
  if (!result.ok || !responseBody || Number(responseBody.code) !== 0) {
    throw new Error(`TikTok Events API rejected the event (${result.status}).`);
  }
  return { configured: true, sent: true, requestId: cleanText(responseBody.request_id, 200) };
}

module.exports = {
  EVENTS_ENDPOINT,
  DEFAULT_PIXEL_ID,
  buildWebEvent,
  sendWebEvent,
  _test: { cleanText, safeHttpUrl, cookieValue, clickIdFromUrl, normalizeEmail, normalizePhone, sha256, compact },
};
