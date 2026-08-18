const crypto = require('node:crypto');
const Core = require('./_business-center-core');
const ReminderCore = require('./_menu-reminder-core');
const ORDER_CONFIG = require('../config/order-config');
const { readBusinessData, getSheetsClient, spreadsheetUrl } = require('./_business-data-source');
const { readPreferences } = require('./_menu-email-preferences');
const { appendReminderDecisions, readReminderHolds } = require('./_menu-reminder-controls');
const {
  acceptedRecipientSetForRun,
  appendAcceptedEmail,
  ensureDeliverySheet,
} = require('./_email-delivery-log');
const { safeLogError } = require('./_security');
const { encodeContact, signContact } = require('./menu-unsubscribe')._test;

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const CRON_SECRET = process.env.CRON_SECRET;
const PLANNER_KEY = process.env.PRPD_PLANNER_KEY;
const MANUAL_REMINDER_TOKEN = process.env.MANUAL_REMINDER_TOKEN;
const POSTAL_ADDRESS = process.env.BUSINESS_POSTAL_ADDRESS || '';
const REPORT_EMAIL = process.env.AUTOMATION_REPORT_EMAIL || 'getprpd@gmail.com';
const MENU_URL = 'https://getprpd.com/order';
const SENDER_EMAIL = 'PRPD Weekly Menu <menu@mail.getprpd.com>';
const AUTOMATION_SENDER = 'PRPD Automation <automation@mail.getprpd.com>';
const REPLY_EMAIL = 'hello@getprpd.com';
const LOG_SHEET = 'Automation Log';
const LOG_HEADERS = ['Run ID', 'Generated At', 'Automation', 'Status', 'Summary'];
const MAX_CUTOFF_TO_DELIVERY_MS = 14 * 24 * 60 * 60 * 1000;
const RATE_LIMIT_RETRY_ATTEMPTS = 5;

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isRateLimitError(error) {
  return Number(error?.status || error?.statusCode || error?.code) === 429;
}

async function retryRateLimited(task, options = {}) {
  const attempts = Math.max(1, Number(options.attempts) || RATE_LIMIT_RETRY_ATTEMPTS);
  const baseDelayMs = Math.max(100, Number(options.baseDelayMs) || 750);
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await task();
    } catch (error) {
      if (!isRateLimitError(error) || attempt === attempts - 1) throw error;
      await wait(baseDelayMs * (2 ** attempt));
    }
  }
  throw new Error('Rate-limit retry loop ended unexpectedly.');
}

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

function bearerToken(request) {
  const match = String(request.headers.authorization || '').match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : '';
}

function chicagoDate(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function manualCampaignKey(request, manualAuthorized) {
  if (!manualAuthorized) return '';
  const value = String(request.query?.campaign || '').trim().toLowerCase();
  if (!value) return '';
  return /^[a-z0-9](?:[a-z0-9-]{0,22}[a-z0-9])?$/.test(value) ? value : null;
}

function manualRequestAuthorized(request, options = {}) {
  const manualToken = String(options.manualToken || '');
  const plannerKey = String(options.plannerKey || '');
  const requestedCampaign = String(request.query?.campaign || '').trim();
  const dedicatedTokenMatches = manualToken
    && keysMatch(request.headers['x-prpd-manual-reminder-key'], manualToken);
  const plannerKeyMatches = requestedCampaign
    && plannerKey
    && keysMatch(request.headers['x-prpd-planner-key'], plannerKey);
  return Boolean(dedicatedTokenMatches || plannerKeyMatches);
}

function decisionSummary(decisions) {
  const counts = {};
  for (const entry of Array.isArray(decisions) ? decisions : []) {
    if (entry.decision !== 'suppressed') continue;
    counts[entry.reason] = (counts[entry.reason] || 0) + 1;
  }
  return Object.entries(counts)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([reason, count]) => `${reason}: ${count}`)
    .join(', ');
}

function menuWindowStatus(config, now = new Date()) {
  if (config?.batch?.published !== true) {
    return { safeToSend: false, status: 'disabled-unpublished', reason: 'menu-not-published' };
  }
  if (config?.batch?.remindersEnabled !== true) {
    return { safeToSend: false, status: 'disabled-owner-review', reason: 'reminders-not-approved' };
  }
  const nowMs = now instanceof Date ? now.getTime() : Number(now);
  const cutoffMs = Date.parse(String(config?.batch?.cutoffIso || ''));
  const deliveryMs = Date.parse(String(config?.batch?.deliveryDate || ''));

  if (!Number.isFinite(nowMs)) {
    return { safeToSend: false, status: 'disabled-stale-config', reason: 'invalid-current-time' };
  }
  if (!Number.isFinite(cutoffMs)) {
    return { safeToSend: false, status: 'disabled-stale-config', reason: 'invalid-cutoff' };
  }
  if (!Number.isFinite(deliveryMs)) {
    return { safeToSend: false, status: 'disabled-stale-config', reason: 'invalid-delivery-date' };
  }
  if (cutoffMs <= nowMs) {
    return { safeToSend: false, status: 'disabled-stale-config', reason: 'cutoff-not-future' };
  }
  const fulfillmentWindowMs = deliveryMs - cutoffMs;
  if (fulfillmentWindowMs <= 0 || fulfillmentWindowMs > MAX_CUTOFF_TO_DELIVERY_MS) {
    return { safeToSend: false, status: 'disabled-stale-config', reason: 'invalid-fulfillment-window' };
  }
  return { safeToSend: true, status: 'ready', reason: '' };
}

async function ensureLogSheet(client) {
  if (!SHEET_ID) throw new Error('Google Sheet ID is not configured.');
  const metadata = await client.request({
    url: spreadsheetUrl(SHEET_ID, '?fields=sheets.properties.title'),
    method: 'GET',
  });
  const exists = (metadata.data.sheets || []).some(sheet => sheet.properties?.title === LOG_SHEET);
  if (!exists) {
    await client.request({
      url: spreadsheetUrl(SHEET_ID, ':batchUpdate'),
      method: 'POST',
      data: { requests: [{ addSheet: { properties: { title: LOG_SHEET, gridProperties: { frozenRowCount: 1 } } } }] },
    });
  }
  const range = encodeURIComponent(`'${LOG_SHEET}'!A1:E1`);
  await client.request({
    url: spreadsheetUrl(SHEET_ID, `/values/${range}?valueInputOption=RAW`),
    method: 'PUT',
    data: { values: [LOG_HEADERS] },
  });
}

async function findRun(client, runId) {
  const range = encodeURIComponent(`'${LOG_SHEET}'!A2:E5000`);
  const result = await client.request({
    url: spreadsheetUrl(SHEET_ID, `/values/${range}`),
    method: 'GET',
  });
  return (result.data.values || []).find(row => row[0] === runId);
}

function matchesSuccessfulPhaseRun(row, options = {}) {
  const runId = String(row?.[0] || '');
  const status = String(row?.[3] || '').toLowerCase();
  const prefix = `menu-reminder-b${Number(options.batchNumber) || 0}-${String(options.phase || '').toLowerCase()}-`;
  const date = String(options.date || '');
  return status === 'sent' && runId.startsWith(prefix) && runId.endsWith(`-${date}`);
}

async function findSuccessfulPhaseRun(client, options) {
  const range = encodeURIComponent(`'${LOG_SHEET}'!A2:E5000`);
  const result = await client.request({
    url: spreadsheetUrl(SHEET_ID, `/values/${range}`),
    method: 'GET',
  });
  return (result.data.values || []).find(row => matchesSuccessfulPhaseRun(row, options));
}

async function appendRun(client, values) {
  const range = encodeURIComponent(`'${LOG_SHEET}'!A:E`);
  await client.request({
    url: spreadsheetUrl(SHEET_ID, `/values/${range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`),
    method: 'POST',
    data: { values: [values] },
  });
}

function unsubscribeUrl(email) {
  const params = new URLSearchParams({
    contact: encodeContact(email),
    token: signContact(email),
  });
  return `https://getprpd.com/api/menu-unsubscribe?${params.toString()}`;
}

async function sendReminder(recipient, phase, runId) {
  const optOutUrl = unsubscribeUrl(recipient.email);
  const rendered = ReminderCore.renderReminder({
    phase,
    firstName: recipient.firstName,
    audienceReason: recipient.audienceReason,
    cutoffLabel: ORDER_CONFIG.batch.cutoffLabel,
    menuUrl: MENU_URL,
    unsubscribeUrl: optOutUrl,
    postalAddress: POSTAL_ADDRESS,
  });
  const requestOptions = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': `${runId}-${crypto.createHash('sha256').update(recipient.email).digest('hex').slice(0, 16)}`,
    },
    body: JSON.stringify({
      from: SENDER_EMAIL,
      to: [recipient.email],
      reply_to: REPLY_EMAIL,
      subject: rendered.subject,
      text: rendered.text,
      html: rendered.html,
      headers: { 'List-Unsubscribe': `<${optOutUrl}>` },
      tags: [
        { name: 'automation', value: 'menu-reminder' },
        { name: 'batch', value: String(ORDER_CONFIG.batch.number) },
      ],
    }),
  };
  let result;
  for (let attempt = 0; attempt < RATE_LIMIT_RETRY_ATTEMPTS; attempt += 1) {
    result = await fetch('https://api.resend.com/emails', requestOptions);
    if (result.status !== 429) break;
    if (attempt === RATE_LIMIT_RETRY_ATTEMPTS - 1) break;
    const retryAfterSeconds = Number(result.headers?.get?.('retry-after'));
    const delayMs = Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
      ? retryAfterSeconds * 1000
      : 750 * (2 ** attempt);
    await wait(delayMs);
  }
  if (!result?.ok) {
    const error = new Error(`Resend rejected a menu reminder (${result?.status || 'unknown'}).`);
    error.status = Number(result?.status) || 0;
    throw error;
  }
  const payload = await result.json().catch(() => ({}));
  if (!payload.id) throw new Error('Resend accepted a reminder without returning an email ID.');
  return {
    emailId: payload.id,
    subject: rendered.subject,
    acceptedAt: new Date().toISOString(),
  };
}

async function sendOwnerReport(options) {
  if (!RESEND_API_KEY || !REPORT_EMAIL) return;
  const rendered = ReminderCore.renderOwnerReport(options);
  try {
    const result = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `${options.runId}-owner-report-${options.status}`,
      },
      body: JSON.stringify({
        from: AUTOMATION_SENDER,
        to: [REPORT_EMAIL],
        reply_to: REPLY_EMAIL,
        subject: rendered.subject,
        text: rendered.text,
      }),
    });
    if (!result.ok) {
      safeLogError('Menu reminder owner report was rejected.', new Error(`Resend status ${result.status}`));
    }
  } catch (error) {
    safeLogError('Menu reminder owner report failed.', error);
  }
}

module.exports = async function handler(request, response) {
  if (request.method !== 'GET') return sendJson(response, 405, { error: 'Method not allowed.' });
  const cronAuthorized = CRON_SECRET && keysMatch(bearerToken(request), CRON_SECRET);
  const previewAuthorized = PLANNER_KEY && keysMatch(request.headers['x-prpd-planner-key'], PLANNER_KEY);
  const manualAuthorized = manualRequestAuthorized(request, {
    manualToken: MANUAL_REMINDER_TOKEN,
    plannerKey: PLANNER_KEY,
  });
  if (!cronAuthorized && !previewAuthorized && !manualAuthorized) {
    return sendJson(response, 401, { error: 'Menu reminder authorization failed.' });
  }

  const phase = String(request.reminderPhase || request.query?.phase || '').toLowerCase();
  if (!ReminderCore.PHASES[phase]) return sendJson(response, 400, { error: 'A valid reminder phase is required.' });
  // Cron retries may carry an owner-approved campaign key so a previously
  // blocked run can be retried without weakening the endpoint authorization.
  const campaignKey = manualCampaignKey(request, manualAuthorized || cronAuthorized);
  if (campaignKey === null) return sendJson(response, 400, { error: 'The manual reminder campaign key is invalid.' });

  const reportRunId = `menu-reminder-b${ORDER_CONFIG.batch.number}-${phase}${campaignKey ? `-${campaignKey}` : ''}-${chicagoDate()}`;
  const menuWindow = menuWindowStatus(ORDER_CONFIG);
  let intendedRecipients = [];
  const sentRecipients = [];
  try {
    const data = await readBusinessData();
    const orders = Core.normalizeOrders(data.orders);
    const client = await getSheetsClient('https://www.googleapis.com/auth/spreadsheets');
    const preferences = await readPreferences(client);
    const holds = await readReminderHolds(client);
    const decisions = ReminderCore.recipientDecisions(orders, {
      batchNumber: ORDER_CONFIG.batch.number,
      batchNumberFromOrder: order => Core.batchNumber(order.Batch),
      preferences,
      holds,
      phase,
    });
    const recipients = decisions
      .filter(entry => entry.decision === 'eligible')
      .map(({ decision, reason, ...recipient }) => recipient);
    const suppressionSummary = decisionSummary(decisions);
    intendedRecipients = recipients;

    if (!cronAuthorized && !manualAuthorized) {
      const example = ReminderCore.renderReminder({
        phase,
        firstName: 'Customer',
        audienceReason: 'previous-customer',
        cutoffLabel: ORDER_CONFIG.batch.cutoffLabel,
        menuUrl: MENU_URL,
        unsubscribeUrl: 'https://getprpd.com/api/menu-unsubscribe?preview=1',
        postalAddress: POSTAL_ADDRESS || '[valid PRPD business mailing address required before sending]',
      });
      return sendJson(response, 200, {
        mode: 'preview',
        batch: ORDER_CONFIG.batch.number,
        phase,
        sendGuard: menuWindow,
        eligibleRecipientCount: recipients.length,
        suppressedRecipientCount: decisions.length - recipients.length,
        suppressionSummary,
        recipients: recipients.map(recipient => ({ email: recipient.email, firstName: recipient.firstName })),
        example: { subject: example.subject, text: example.text },
      });
    }

    await ensureLogSheet(client);
    await ensureDeliverySheet(client);
    const runId = reportRunId;
    if (await findRun(client, runId)) return sendJson(response, 200, { status: 'already-processed', runId });
    const priorPhaseRun = await findSuccessfulPhaseRun(client, {
      batchNumber: ORDER_CONFIG.batch.number,
      phase,
      date: chicagoDate(),
    });
    if (priorPhaseRun) {
      return sendJson(response, 200, {
        status: 'already-processed-phase',
        runId: priorPhaseRun[0],
      });
    }
    const alreadyAcceptedEmails = await retryRateLimited(
      () => acceptedRecipientSetForRun(client, runId),
    );
    const pendingRecipients = recipients.filter(recipient => !alreadyAcceptedEmails.has(recipient.email));
    sentRecipients.push(...recipients.filter(recipient => alreadyAcceptedEmails.has(recipient.email)));
    await retryRateLimited(
      () => appendReminderDecisions(client, runId, ORDER_CONFIG.batch.number, phase, decisions),
    );

    if (!menuWindow.safeToSend) {
      await appendRun(client, [
        runId, new Date().toISOString(), `Menu Reminder - ${phase}`, menuWindow.status,
        `Customer send blocked because reminders are not owner-approved, the menu is unpublished, or its active dates are invalid`,
      ]);
      await sendOwnerReport({
        phase,
        status: menuWindow.status,
        runId,
        batchNumber: ORDER_CONFIG.batch.number,
        intendedCount: recipients.length,
        recipients: [],
        note: 'No customer email was sent because reminders are not owner-approved, the menu is unpublished, or its cutoff/delivery dates are invalid.',
        suppressionSummary,
      });
      return sendJson(response, 200, {
        status: menuWindow.status,
        reason: menuWindow.reason,
        runId,
        eligibleRecipientCount: recipients.length,
      });
    }

    if (!recipients.length) {
      await appendRun(client, [
        runId, new Date().toISOString(), `Menu Reminder - ${phase}`, 'no-recipients',
        `Batch ${ORDER_CONFIG.batch.number}: no eligible prior customers remained after suppression`,
      ]);
      await sendOwnerReport({
        phase,
        status: 'no-recipients',
        runId,
        batchNumber: ORDER_CONFIG.batch.number,
        intendedCount: 0,
        recipients: [],
        note: 'No customer email was sent because no eligible prior customer remained.',
        suppressionSummary,
      });
      return sendJson(response, 200, { status: 'no-recipients', runId, eligibleRecipientCount: 0 });
    }

    if (!POSTAL_ADDRESS) {
      await appendRun(client, [
        runId, new Date().toISOString(), `Menu Reminder - ${phase}`, 'disabled',
        `Batch ${ORDER_CONFIG.batch.number}: ${recipients.length} eligible; BUSINESS_POSTAL_ADDRESS is not configured`,
      ]);
      await sendOwnerReport({
        phase,
        status: 'disabled',
        runId,
        batchNumber: ORDER_CONFIG.batch.number,
        intendedCount: recipients.length,
        recipients: [],
        note: 'Sending was disabled because BUSINESS_POSTAL_ADDRESS was not configured.',
        suppressionSummary,
      });
      return sendJson(response, 200, {
        status: 'disabled',
        reason: 'A valid business postal address is required before commercial email can be sent.',
        runId,
        eligibleRecipientCount: recipients.length,
      });
    }
    if (!RESEND_API_KEY) throw new Error('Resend is not configured.');

    for (const recipient of pendingRecipients) {
      const accepted = await sendReminder(recipient, phase, runId);
      await retryRateLimited(() => appendAcceptedEmail(client, {
        runId,
        emailId: accepted.emailId,
        recipient: recipient.email,
        subject: accepted.subject,
        acceptedAt: accepted.acceptedAt,
        expectedCount: recipients.length,
      }));
      sentRecipients.push(recipient);
    }
    await retryRateLimited(() => appendRun(client, [
      runId, new Date().toISOString(), `Menu Reminder - ${phase}`, 'sent',
      `Batch ${ORDER_CONFIG.batch.number}: ${recipients.length} eligible customer reminder(s) sent`,
    ]));
    await sendOwnerReport({
      phase,
      status: 'sent',
      runId,
      batchNumber: ORDER_CONFIG.batch.number,
      intendedCount: recipients.length,
      recipients: sentRecipients,
      note: 'All eligible customer reminders were accepted by the email provider.',
      suppressionSummary,
    });
    return sendJson(response, 200, {
      status: 'sent',
      runId,
      eligibleRecipientCount: recipients.length,
      resumedRecipientCount: alreadyAcceptedEmails.size,
      newlyAcceptedRecipientCount: pendingRecipients.length,
    });
  } catch (error) {
    safeLogError('Weekly menu reminder failed.', error);
    await sendOwnerReport({
      phase,
      status: 'failed',
      runId: reportRunId,
      batchNumber: ORDER_CONFIG.batch.number,
      intendedCount: intendedRecipients.length,
      recipients: sentRecipients,
      note: 'The run failed before every intended recipient was confirmed. Review the Vercel function log before retrying.',
    });
    return sendJson(response, 500, { error: 'The weekly menu reminder could not be processed.' });
  }
};

module.exports._test = {
  bearerToken,
  chicagoDate,
  keysMatch,
  manualCampaignKey,
  manualRequestAuthorized,
  menuWindowStatus,
  decisionSummary,
  matchesSuccessfulPhaseRun,
  retryRateLimited,
  unsubscribeUrl,
};
