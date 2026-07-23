const { GoogleAuth } = require('google-auth-library');
const {
  assertExactKeys,
  isLikelyBot,
  requestSourceError,
  safeLogError,
} = require('./_security');
const { sendWebEvent } = require('./_tiktok');

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const GOOGLE_SERVICE_ACCOUNT_BASE64 = process.env.GOOGLE_SERVICE_ACCOUNT_BASE64;
const MAX_BODY_BYTES = 30_000;
const LEAD_KEYS = new Set([
  'action', 'leadId', 'fullName', 'phone', 'location', 'referral',
  'referralInsight', 'fitnessGoal', 'restrictions', 'notes', 'submittedAt',
  'utmSource', 'utmMedium', 'utmCampaign', 'utmContent', 'utmTerm',
  'landingPage', 'referrer', 'tiktokTtclid', 'tiktokTtp', 'website', 'formStartedAt',
]);
const REFERRAL_OPTIONS = new Set([
  'Instagram / TikTok / YouTube', 'Mosque', 'Gym',
  'Friend or family referral', 'MSA / College', 'Other',
]);
const FITNESS_OPTIONS = new Set([
  'Fat Loss', 'Build Muscle', 'Body Recomp',
  'Athletic Performance', 'General Health Improvement',
]);
const RESTRICTION_OPTIONS = new Set([
  'No Shellfish', 'Dairy Free', 'Gluten Free', 'No Eggs', 'Nut Allergy',
  'Fish / Seafood Allergy', 'Soy Allergy', 'None', 'None selected',
]);
const HEADERS = [
  'Submitted At', 'Source', 'Full Name', 'Phone', 'Location', 'How They Heard',
  'Mosque / Gym Detail', 'Fitness Goal', 'Training Days', 'Halal Preference',
  'Dietary Restrictions', 'Notes', 'UTM Source', 'UTM Medium', 'UTM Campaign',
  'UTM Content', 'UTM Term', 'Landing Page', 'Referrer', 'Lead ID',
];

function sendJson(response, status, body) {
  response.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.end(JSON.stringify(body));
}

function safeText(value, maxLength) {
  return String(value || '').replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, maxLength);
}

function hasCellValue(value) {
  return String(value ?? '').trim() !== '';
}

function nextRecordRow(rows, firstDataRow = 2) {
  let lastUsedIndex = -1;
  rows.forEach((row, index) => {
    if (Array.isArray(row) && row.some(hasCellValue)) lastUsedIndex = index;
  });
  return firstDataRow + lastUsedIndex + 1;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);
}

function safePageUrl(value, maxLength) {
  const text = safeText(value, maxLength);
  if (!text) return '';
  try {
    const parsed = new URL(text);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? text : '';
  } catch {
    return '';
  }
}

function validateLead(raw) {
  assertExactKeys(raw, LEAD_KEYS, 'Lead request');
  if (!raw || raw.action !== 'lead') throw new Error('Invalid lead request.');
  const lead = {
    leadId: safeText(raw.leadId, 50),
    fullName: safeText(raw.fullName, 100),
    phone: safeText(raw.phone, 30),
    location: safeText(raw.location, 100),
    referral: safeText(raw.referral, 100),
    referralInsight: safeText(raw.referralInsight, 140),
    fitnessGoal: safeText(raw.fitnessGoal, 140),
    restrictions: safeText(raw.restrictions, 300),
    notes: safeText(raw.notes, 500),
    trainingDays: '',
    halalPref: '',
    utmSource: safeText(raw.utmSource, 120),
    utmMedium: safeText(raw.utmMedium, 120),
    utmCampaign: safeText(raw.utmCampaign, 160),
    utmContent: safeText(raw.utmContent, 160),
    utmTerm: safeText(raw.utmTerm, 160),
    landingPage: safePageUrl(raw.landingPage, 500),
    referrer: safePageUrl(raw.referrer, 500),
    tiktokTtclid: safeText(raw.tiktokTtclid, 500),
    tiktokTtp: safeText(raw.tiktokTtp, 500),
  };
  if (!/^PRPD-LEAD-\d{8}-[A-F0-9]{4}(?:[A-F0-9]{4})?$/.test(lead.leadId)) throw new Error('Invalid lead reference.');
  if (!lead.fullName) throw new Error('Full name is required.');
  if (lead.phone.replace(/\D/g, '').length !== 10) throw new Error('A valid 10-digit phone number is required.');
  if (!lead.location) throw new Error('Location is required.');
  if (!lead.referral) throw new Error('Referral source is required.');
  if (!lead.fitnessGoal) throw new Error('Fitness goal is required.');
  if (!REFERRAL_OPTIONS.has(lead.referral)) throw new Error('Select a valid referral source.');
  if (!FITNESS_OPTIONS.has(lead.fitnessGoal)) throw new Error('Select a valid fitness goal.');
  const restrictions = lead.restrictions.split(',').map(value => value.trim()).filter(Boolean);
  if (restrictions.some(value => !RESTRICTION_OPTIONS.has(value))) {
    throw new Error('Select valid dietary restrictions.');
  }
  if ((lead.referral === 'Mosque' || lead.referral === 'Gym') && lead.referralInsight.length > 140) {
    throw new Error('Mosque or gym detail is too long.');
  }
  lead.submittedAt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago', dateStyle: 'short', timeStyle: 'medium',
  }).format(new Date());
  return lead;
}

async function getClient() {
  if (!SHEET_ID || !GOOGLE_SERVICE_ACCOUNT_BASE64) throw new Error('Google Sheets is not configured.');
  let credentials;
  try {
    credentials = JSON.parse(Buffer.from(GOOGLE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8'));
  } catch {
    throw new Error('Google service account configuration is invalid.');
  }
  const auth = new GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
  return auth.getClient();
}

function sheetsUrl(path) {
  return `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/${path}`;
}

async function readRange(client, range) {
  const result = await client.request({ url: sheetsUrl(`values/${encodeURIComponent(range)}`), method: 'GET' });
  return result.data.values || [];
}

async function updateRange(client, range, values) {
  await client.request({
    url: sheetsUrl(`values/${encodeURIComponent(range)}?valueInputOption=RAW`),
    method: 'PUT', data: { values: [values] },
  });
}

async function saveLead(client, lead) {
  const header = await readRange(client, "'Website Leads'!A1:T1");
  if ((header[0] || []).join('|') !== HEADERS.join('|')) {
    await updateRange(client, "'Website Leads'!A1:T1", HEADERS);
  }
  const rows = await readRange(client, "'Website Leads'!A2:AZ");
  if (rows.some(row => row.some(value => safeText(value, 50) === lead.leadId))) return false;
  const targetRow = nextRecordRow(rows);
  await updateRange(client, `'Website Leads'!A${targetRow}:T${targetRow}`, [
    lead.submittedAt, 'Website Form', lead.fullName, lead.phone, lead.location,
    lead.referral, lead.referralInsight, lead.fitnessGoal, lead.trainingDays,
    lead.halalPref, lead.restrictions, lead.notes, lead.utmSource, lead.utmMedium,
    lead.utmCampaign, lead.utmContent, lead.utmTerm, lead.landingPage,
    lead.referrer, lead.leadId,
  ]);
  return true;
}

async function sendLeadEmail(lead) {
  if (!RESEND_API_KEY) throw new Error('Resend is not configured.');
  const source = lead.utmSource || 'organic';
  const text = [
    'New PRPD Lead', '', `Name: ${lead.fullName}`, `Phone: ${lead.phone}`,
    `Location: ${lead.location}`, `How they heard: ${lead.referral}`,
    `Mosque / Gym: ${lead.referralInsight || '-'}`, `Fitness Goal: ${lead.fitnessGoal}`,
    `Restrictions: ${lead.restrictions || '-'}`, `Notes: ${lead.notes || '-'}`, '',
    `Source: ${source}`, `Campaign: ${lead.utmCampaign || '-'}`,
    `Landing Page: ${lead.landingPage || '-'}`, `Lead reference: ${lead.leadId}`,
    `Submitted: ${lead.submittedAt}`,
  ].join('\n');
  const html = `<div style="font-family:Arial,sans-serif;color:#1E2E1E;line-height:1.55;max-width:620px">
    <h1 style="font-size:22px">New PRPD Lead</h1>
    <p><strong>${escapeHtml(lead.fullName)}</strong><br>${escapeHtml(lead.phone)}<br>${escapeHtml(lead.location)}</p>
    <p>Fitness goal: <strong>${escapeHtml(lead.fitnessGoal)}</strong><br>How they heard: ${escapeHtml(lead.referral)}<br>Restrictions: ${escapeHtml(lead.restrictions || '-')}</p>
    ${lead.notes ? `<p>Notes: ${escapeHtml(lead.notes)}</p>` : ''}
    <hr style="border:0;border-top:1px solid #d8d2c9">
    <p>Source: ${escapeHtml(source)}<br>Campaign: ${escapeHtml(lead.utmCampaign || '-')}<br>Reference: ${escapeHtml(lead.leadId)}</p>
  </div>`;
  const result = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': `lead-${lead.leadId}`,
    },
    body: JSON.stringify({
      from: 'PRPD Leads <leads@mail.getprpd.com>', to: ['getprpd@gmail.com'],
      subject: `New PRPD Lead: ${lead.fullName} - ${lead.location}`, text, html,
    }),
  });
  if (!result.ok) throw new Error(`Resend rejected the lead notification (${result.status}).`);
}

module.exports = async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return sendJson(response, 405, { status: 'error', message: 'Method not allowed.' });
  }
  const contentType = String(request.headers['content-type'] || '').toLowerCase();
  if (!contentType.includes('application/json')) {
    return sendJson(response, 415, { status: 'error', message: 'JSON content is required.' });
  }
  if (Number(request.headers['content-length'] || 0) > MAX_BODY_BYTES) {
    return sendJson(response, 413, { status: 'error', message: 'Submission is too large.' });
  }
  let raw;
  try {
    raw = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
  } catch {
    return sendJson(response, 400, { status: 'error', message: 'Invalid JSON request.' });
  }
  if (Buffer.byteLength(JSON.stringify(raw || {}), 'utf8') > MAX_BODY_BYTES) {
    return sendJson(response, 413, { status: 'error', message: 'Submission is too large.' });
  }
  const sourceError = requestSourceError(request);
  if (sourceError) return sendJson(response, 403, { status: 'error', message: sourceError });
  if (isLikelyBot(raw)) {
    return sendJson(response, 200, {
      status: 'success', leadId: safeText(raw && raw.leadId, 50), accepted: true,
    });
  }
  let lead;
  try {
    lead = validateLead(raw);
  } catch (error) {
    return sendJson(response, 400, { status: 'error', message: error.message });
  }
  try {
    const client = await getClient();
    const created = await saveLead(client, lead);
    if (!created) return sendJson(response, 200, { status: 'success', leadId: lead.leadId, duplicate: true });
    const [notification, tiktokEvent] = await Promise.allSettled([
      sendLeadEmail(lead),
      sendWebEvent({
        request,
        event: 'Lead',
        eventId: `${lead.leadId}:lead`,
        pageUrl: lead.landingPage,
        referrer: lead.referrer,
        phone: lead.phone,
        tiktokTtp: lead.tiktokTtp,
        tiktokTtclid: lead.tiktokTtclid,
        properties: {
          content_type: 'product',
          contents: [{ content_id: 'prpd-intake-form', content_name: 'PRPD Intake Form' }],
        },
      }),
    ]);
    const notificationSent = notification.status === 'fulfilled';
    const tiktokEventSent = tiktokEvent.status === 'fulfilled' && tiktokEvent.value.sent === true;
    if (!notificationSent) safeLogError('Lead saved but notification failed.', notification.reason);
    if (tiktokEvent.status === 'rejected') safeLogError('Lead saved but TikTok event failed.', tiktokEvent.reason);
    return sendJson(response, 200, { status: 'success', leadId: lead.leadId, notificationSent, tiktokEventSent });
  } catch (error) {
    safeLogError('Lead submission failed.', error);
    return sendJson(response, 502, {
      status: 'error',
      message: 'We could not confirm your intake. Please try again or text Rida at (469) 545-0781.',
    });
  }
};

module.exports._test = {
  validateLead,
  nextRecordRow,
  LEAD_KEYS,
  REFERRAL_OPTIONS,
  FITNESS_OPTIONS,
  RESTRICTION_OPTIONS,
};
