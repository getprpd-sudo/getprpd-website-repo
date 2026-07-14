const { GoogleAuth } = require('google-auth-library');

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const GOOGLE_SERVICE_ACCOUNT_BASE64 = process.env.GOOGLE_SERVICE_ACCOUNT_BASE64;
const MAX_BODY_BYTES = 30_000;
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

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);
}

function validateLead(raw) {
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
    trainingDays: safeText(raw.trainingDays, 40),
    halalPref: safeText(raw.halalPref, 80),
    utmSource: safeText(raw.utmSource, 120),
    utmMedium: safeText(raw.utmMedium, 120),
    utmCampaign: safeText(raw.utmCampaign, 160),
    utmContent: safeText(raw.utmContent, 160),
    utmTerm: safeText(raw.utmTerm, 160),
    landingPage: safeText(raw.landingPage, 500),
    referrer: safeText(raw.referrer, 500),
  };
  if (!/^PRPD-LEAD-\d{8}-[A-F0-9]{4}(?:[A-F0-9]{4})?$/.test(lead.leadId)) throw new Error('Invalid lead reference.');
  if (!lead.fullName) throw new Error('Full name is required.');
  if (lead.phone.replace(/\D/g, '').length !== 10) throw new Error('A valid 10-digit phone number is required.');
  if (!lead.location) throw new Error('Location is required.');
  if (!lead.referral) throw new Error('Referral source is required.');
  if (!lead.fitnessGoal) throw new Error('Fitness goal is required.');
  if (!lead.trainingDays) throw new Error('Training frequency is required.');
  if (!lead.halalPref) throw new Error('Halal preference is required.');
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
  const rows = await readRange(client, "'Website Leads'!A2:T");
  if (rows.some(row => safeText(row[19], 50) === lead.leadId)) return false;
  let index = rows.findIndex(row => !row.slice(0, 5).some(value => safeText(value, 200)));
  if (index === -1) index = rows.length;
  const targetRow = index + 2;
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
    `Training Days: ${lead.trainingDays}`, `Halal Preference: ${lead.halalPref}`,
    `Restrictions: ${lead.restrictions || '-'}`, `Notes: ${lead.notes || '-'}`, '',
    `Source: ${source}`, `Campaign: ${lead.utmCampaign || '-'}`,
    `Landing Page: ${lead.landingPage || '-'}`, `Lead reference: ${lead.leadId}`,
    `Submitted: ${lead.submittedAt}`,
  ].join('\n');
  const html = `<div style="font-family:Arial,sans-serif;color:#1E2E1E;line-height:1.55;max-width:620px">
    <h1 style="font-size:22px">New PRPD Lead</h1>
    <p><strong>${escapeHtml(lead.fullName)}</strong><br>${escapeHtml(lead.phone)}<br>${escapeHtml(lead.location)}</p>
    <p>Fitness goal: <strong>${escapeHtml(lead.fitnessGoal)}</strong><br>Training: ${escapeHtml(lead.trainingDays)}<br>Halal preference: ${escapeHtml(lead.halalPref)}<br>How they heard: ${escapeHtml(lead.referral)}<br>Restrictions: ${escapeHtml(lead.restrictions || '-')}</p>
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
    let notificationSent = true;
    try {
      await sendLeadEmail(lead);
    } catch (error) {
      notificationSent = false;
      console.error('Lead saved but notification failed:', error);
    }
    return sendJson(response, 200, { status: 'success', leadId: lead.leadId, notificationSent });
  } catch (error) {
    console.error('Lead submission failed:', error);
    return sendJson(response, 502, {
      status: 'error',
      message: 'We could not confirm your intake. Please try again or text Rida at (469) 545-0781.',
    });
  }
};

module.exports._test = { validateLead };
