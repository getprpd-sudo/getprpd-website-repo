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
const REDUNDANT_EVENTS = new Set(['email.sent']);
const UPSTREAM_RETRY_ATTEMPTS = 5;

function wait(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

function isTransientUpstreamError(error) {
  const status = Number(error?.status || error?.statusCode || error?.code || error?.response?.status);
  if (status === 429 || (status >= 500 && status <= 599)) return true;
  const code = String(error?.code || error?.cause?.code || '').toUpperCase();
  return ['ECONNRESET', 'ETIMEDOUT', 'EAI_AGAIN', 'ENETUNREACH', 'UND_ERR_CONNECT_TIMEOUT'].includes(code);
}

async function retryTransient(task, options = {}) {
  const attempts = Math.max(1, Number(options.attempts) || UPSTREAM_RETRY_ATTEMPTS);
  const baseDelayMs = Math.max(1, Number(options.baseDelayMs) || 500);
  const random = typeof options.random === 'function' ? options.random : Math.random;
  const sleep = typeof options.sleep === 'function' ? options.sleep : wait;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await task();
    } catch (error) {
      if (!isTransientUpstreamError(error) || attempt === attempts - 1) throw error;
      const exponentialDelay = baseDelayMs * (2 ** attempt);
      const jitter = Math.floor(random() * baseDelayMs);
      await sleep(exponentialDelay + jitter);
    }
  }
  throw new Error('Transient retry loop exited unexpectedly.');
}

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
    if (REDUNDANT_EVENTS.has(String(event?.type || '').toLowerCase())) {
      return sendJson(response, 200, { status: 'ignored-redundant' });
    }
    const client = await getSheetsClient('https://www.googleapis.com/auth/spreadsheets');
    const recorded = await retryTransient(
      () => recordDeliveryEvent(client, event, request.headers['svix-id'], { ensureSheet: false }),
    );
    if (recorded.duplicate) return sendJson(response, 200, { status: 'duplicate' });

    if (SUPPRESSION_EVENTS.has(recorded.normalized.type) && recorded.normalized.recipient) {
      await retryTransient(
        () => appendPreference(
          client,
          recorded.normalized.recipient,
          'unsubscribed',
          `Resend ${recorded.normalized.type}`,
        ),
      );
    }

    if (recorded.runId) {
      const summary = recorded.summary
        || await retryTransient(() => deliverySummary(client, recorded.runId));
      if (summary.complete && !summary.reported && await sendFinalDeliveryReport(summary)) {
        await retryTransient(() => markDeliveryReported(client, recorded.runId));
      }
    }
    return sendJson(response, 200, {
      status: NEGATIVE_EVENTS.has(recorded.normalized.type) ? 'recorded-attention' : 'recorded',
    });
  } catch (error) {
    safeLogError('Resend webhook processing failed.', error);
    const transient = isTransientUpstreamError(error);
    return sendJson(response, transient ? 503 : 400, {
      error: transient
        ? 'Webhook was verified but could not be recorded yet.'
        : 'Webhook could not be verified or recorded.',
    });
  }
};

// Resend verifies the exact request bytes. Vercel must not parse and rebuild
// the JSON body before the Svix signature check runs.
module.exports.config = {
  api: {
    bodyParser: false,
  },
};

module.exports._test = {
  isTransientUpstreamError,
  REDUNDANT_EVENTS,
  renderDeliveryReport,
  retryTransient,
  verifyEvent,
};
