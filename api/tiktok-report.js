const crypto = require('node:crypto');
const { safeLogError } = require('./_security');

const REPORT_ENDPOINT = 'https://business-api.tiktok.com/open_api/v1.3/report/integrated/get/';
const MAX_REPORT_DAYS = 90;

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

function isoDate(value) {
  const text = String(value || '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) throw new Error('Use YYYY-MM-DD report dates.');
  const date = new Date(`${text}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== text) throw new Error('Report date is invalid.');
  return text;
}

function reportDates(query = {}) {
  const today = new Date();
  const endDate = isoDate(query.endDate || today.toISOString().slice(0, 10));
  const defaultStart = new Date(`${endDate}T00:00:00Z`);
  defaultStart.setUTCDate(defaultStart.getUTCDate() - 29);
  const startDate = isoDate(query.startDate || defaultStart.toISOString().slice(0, 10));
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  const days = Math.floor((end - start) / 86400000) + 1;
  if (days < 1 || days > MAX_REPORT_DAYS) throw new Error(`Choose a report range from 1 to ${MAX_REPORT_DAYS} days.`);
  return { startDate, endDate };
}

function number(value) {
  const parsed = Number(String(value ?? '').replace(/[$,%\s,]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeReport(list, { startDate, endDate }) {
  const campaigns = (Array.isArray(list) ? list : []).map(row => {
    const dimensions = row?.dimensions || {};
    const metrics = row?.metrics || {};
    return {
      id: String(dimensions.campaign_id || ''),
      name: String(metrics.campaign_name || dimensions.campaign_name || 'Unlabeled campaign'),
      spend: number(metrics.spend),
      impressions: Math.round(number(metrics.impressions)),
      clicks: Math.round(number(metrics.clicks)),
      conversions: number(metrics.conversion ?? metrics.conversions ?? metrics.result),
    };
  });
  return {
    id: `tiktok-api-${startDate}-${endDate}`,
    importedAt: new Date().toISOString(),
    fileName: 'TikTok Marketing API',
    platform: 'TikTok', source: 'api', dateFrom: startDate, dateTo: endDate,
    spend: campaigns.reduce((sum, row) => sum + row.spend, 0),
    impressions: campaigns.reduce((sum, row) => sum + row.impressions, 0),
    clicks: campaigns.reduce((sum, row) => sum + row.clicks, 0),
    conversions: campaigns.reduce((sum, row) => sum + row.conversions, 0),
    campaigns,
  };
}

async function fetchTikTokReport(dates) {
  const accessToken = process.env.TIKTOK_MARKETING_ACCESS_TOKEN;
  const advertiserId = process.env.TIKTOK_ADVERTISER_ID;
  if (!accessToken || !advertiserId) return { configured: false };
  const query = new URLSearchParams({
    advertiser_id: advertiserId,
    report_type: 'BASIC',
    data_level: 'AUCTION_CAMPAIGN',
    dimensions: JSON.stringify(['campaign_id']),
    metrics: JSON.stringify(['campaign_name', 'spend', 'impressions', 'clicks', 'conversion']),
    start_date: dates.startDate,
    end_date: dates.endDate,
    page: '1',
    page_size: '1000',
  });
  const result = await fetch(`${REPORT_ENDPOINT}?${query}`, {
    headers: { 'Access-Token': accessToken, Accept: 'application/json' },
    signal: AbortSignal.timeout(10000),
  });
  const body = await result.json().catch(() => null);
  if (!result.ok || !body || Number(body.code) !== 0) {
    throw new Error(`TikTok Marketing API rejected the report (${result.status}).`);
  }
  return { configured: true, report: normalizeReport(body.data?.list, dates) };
}

async function handler(request, response) {
  if (request.method !== 'GET') return sendJson(response, 405, { error: 'Method not allowed.' });
  if (!process.env.PRPD_PLANNER_KEY || !keysMatch(request.headers['x-prpd-planner-key'], process.env.PRPD_PLANNER_KEY)) {
    return sendJson(response, 401, { error: 'Business Center authorization failed.' });
  }
  let dates;
  try { dates = reportDates(request.query || {}); }
  catch (error) { return sendJson(response, 400, { error: error.message }); }

  try {
    const result = await fetchTikTokReport(dates);
    if (!result.configured) {
      return sendJson(response, 503, { configured: false, error: 'TikTok Marketing API credentials are not configured.' });
    }
    return sendJson(response, 200, result);
  } catch (error) {
    safeLogError('TikTok reporting sync failed.', error);
    return sendJson(response, 502, { configured: true, error: 'TikTok reporting could not be loaded right now.' });
  }
}

handler._test = { keysMatch, isoDate, reportDates, number, normalizeReport, fetchTikTokReport, REPORT_ENDPOINT };
module.exports = handler;
