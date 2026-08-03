const crypto = require('node:crypto');
const Core = require('./_business-center-core');
const ReminderCore = require('./_menu-reminder-core');
const ORDER_CONFIG = require('../config/order-config');
const { readBusinessData, getSheetsClient, spreadsheetUrl } = require('./_business-data-source');
const { readPreferences } = require('./_menu-email-preferences');
const { appendAcceptedEmail, ensureDeliverySheet } = require('./_email-delivery-log');
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
  const result = await fetch('https://api.resend.com/emails', {
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
  });
  if (!result.ok) throw new Error(`Resend rejected a menu reminder (${result.status}).`);
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
  const manualAuthorized = MANUAL_REMINDER_TOKEN
    && keysMatch(request.headers['x-prpd-manual-reminder-key'], MANUAL_REMINDER_TOKEN);
  if (!cronAuthorized && !previewAuthorized && !manualAuthorized) {
    return sendJson(response, 401, { error: 'Menu reminder authorization failed.' });
  }

  const phase = String(request.reminderPhase || request.query?.phase || '').toLowerCase();
  if (!ReminderCore.PHASES[phase]) return sendJson(response, 400, { error: 'A valid reminder phase is required.' });

  const reportRunId = `menu-reminder-b${ORDER_CONFIG.batch.number}-${phase}-${chicagoDate()}`;
  let intendedRecipients = [];
  const sentRecipients = [];
  try {
    const data = await readBusinessData();
    const orders = Core.normalizeOrders(data.orders);
    const client = await getSheetsClient('https://www.googleapis.com/auth/spreadsheets');
    const preferences = await readPreferences(client);
    const recipients = ReminderCore.eligibleRecipients(orders, {
      batchNumber: ORDER_CONFIG.batch.number,
      batchNumberFromOrder: order => Core.batchNumber(order.Batch),
      preferences,
    });
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
        eligibleRecipientCount: recipients.length,
        recipients: recipients.map(recipient => ({ email: recipient.email, firstName: recipient.firstName })),
        example: { subject: example.subject, text: example.text },
      });
    }

    await ensureLogSheet(client);
    await ensureDeliverySheet(client);
    const runId = reportRunId;
    if (await findRun(client, runId)) return sendJson(response, 200, { status: 'already-processed', runId });

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
      });
      return sendJson(response, 200, {
        status: 'disabled',
        reason: 'A valid business postal address is required before commercial email can be sent.',
        runId,
        eligibleRecipientCount: recipients.length,
      });
    }
    if (!RESEND_API_KEY) throw new Error('Resend is not configured.');

    for (const recipient of recipients) {
      const accepted = await sendReminder(recipient, phase, runId);
      await appendAcceptedEmail(client, {
        runId,
        emailId: accepted.emailId,
        recipient: recipient.email,
        subject: accepted.subject,
        acceptedAt: accepted.acceptedAt,
      });
      sentRecipients.push(recipient);
    }
    await appendRun(client, [
      runId, new Date().toISOString(), `Menu Reminder - ${phase}`, 'sent',
      `Batch ${ORDER_CONFIG.batch.number}: ${recipients.length} eligible customer reminder(s) sent`,
    ]);
    await sendOwnerReport({
      phase,
      status: 'sent',
      runId,
      batchNumber: ORDER_CONFIG.batch.number,
      intendedCount: recipients.length,
      recipients: sentRecipients,
      note: 'All eligible customer reminders were accepted by the email provider.',
    });
    return sendJson(response, 200, {
      status: 'sent',
      runId,
      eligibleRecipientCount: recipients.length,
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
  unsubscribeUrl,
};
