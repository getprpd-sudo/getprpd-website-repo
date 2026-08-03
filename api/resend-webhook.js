const { Webhook } = require('svix');
const { getSheetsClient } = require('./_business-data-source');
const {
  deliverySummary,
  markDeliveryReported,
  recordDeliveryEvent,
} = require('./_email-delivery-log');
const { appendPreference } = require('./_menu-email-preferences');
const { safeLogError } = require('./_security');

const WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const REPORT_EMAIL = process.env.AUTOMATION_REPORT_EMAIL || 'getprpd@gmail.com';
const AUTOMATION_SENDER = 'PRPD Automation <automation@mail.getprpd.com>';
const REPLY_EMAIL = 'hello@getprpd.com';
const NEGATIVE_EVENTS = new Set(['email.bounced', 'email.failed', 'email.suppressed', 'email.complained']);
const SUPPRESSION_EVENTS = new Set(['email.bounced', 'email.suppressed', 'email.complained']);

function sendJson(response, status, body) {
  response.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store, private');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.end(JSON.stringify(body));
}

function readRawBody(request, limit = 512 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    request.on('data', chunk => {
      size += chunk.length;
      if (size > limit) {
        reject(new Error('Webhook payload is too large.'));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    request.on('error', reject);
  });
}

function verifyEvent(payload, headers, secret = WEBHOOK_SECRET) {
  if (!secret) throw new Error('Resend webhook secret is not configured.');
  const id = String(headers['svix-id'] || '');
  const timestamp = String(headers['svix-timestamp'] || '');
  const signature = String(headers['svix-signature'] || '');
  if (!id || !timestamp || !signature) throw new Error('Resend signature headers are missing.');
  const webhook = new Webhook(secret);
  return webhook.verify(payload, {
    'svix-id': id,
    'svix-timestamp': timestamp,
    'svix-signature': signature,
  });
}

function renderDeliveryReport(summary) {
  const successful = summary.counts.delivered || 0;
  const failed = (summary.counts.bounced || 0)
    + (summary.counts.failed || 0)
    + (summary.counts.suppressed || 0)
    + (summary.counts.complained || 0);
  const lines = summary.recipients.map(recipient => (
    `- ${recipient.email}: ${recipient.status}${recipient.detail ? ` (${recipient.detail})` : ''}`
  ));
  return {
    subject: `PRPD delivery report: ${successful} delivered, ${failed} failed`,
    text: [
      'Weekly menu reminder delivery is complete.',
      `Run ID: ${summary.runId}`,
      `Delivered: ${successful}`,
      `Failed, bounced, suppressed, or complained: ${failed}`,
      '',
      ...lines,
      '',
      'The Email Delivery Log tab contains the provider event trail.',
    ].join('\n'),
  };
}

async function sendFinalDeliveryReport(summary) {
  if (!RESEND_API_KEY || !REPORT_EMAIL) return false;
  const rendered = renderDeliveryReport(summary);
  const result = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': `${summary.runId}-delivery-report`,
    },
    body: JSON.stringify({
      from: AUTOMATION_SENDER,
      to: [REPORT_EMAIL],
      reply_to: REPLY_EMAIL,
      subject: rendered.subject,
      text: rendered.text,
    }),
  });
  return result.ok;
}

module.exports = async function handler(request, response) {
  if (request.method !== 'POST') return sendJson(response, 405, { error: 'Method not allowed.' });
  try {
    const payload = await readRawBody(request);
    const event = verifyEvent(payload, request.headers || {});
    const client = await getSheetsClient('https://www.googleapis.com/auth/spreadsheets');
    const recorded = await recordDeliveryEvent(client, event, request.headers['svix-id']);
    if (recorded.duplicate) return sendJson(response, 200, { status: 'duplicate' });

    if (SUPPRESSION_EVENTS.has(recorded.normalized.type) && recorded.normalized.recipient) {
      await appendPreference(
        client,
        recorded.normalized.recipient,
        'unsubscribed',
        `Resend ${recorded.normalized.type}`,
      );
    }

    if (recorded.runId) {
      const summary = await deliverySummary(client, recorded.runId);
      if (summary.complete && !summary.reported && await sendFinalDeliveryReport(summary)) {
        await markDeliveryReported(client, recorded.runId);
      }
    }
    return sendJson(response, 200, {
      status: NEGATIVE_EVENTS.has(recorded.normalized.type) ? 'recorded-attention' : 'recorded',
    });
  } catch (error) {
    safeLogError('Resend webhook processing failed.', error);
    return sendJson(response, 400, { error: 'Webhook could not be verified or recorded.' });
  }
};

module.exports._test = {
  renderDeliveryReport,
  verifyEvent,
};
