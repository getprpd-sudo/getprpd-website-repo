const assert = require('node:assert/strict');
const test = require('node:test');
const { Webhook } = require('svix');

process.env.GOOGLE_SHEET_ID ||= 'test-sheet-id';
const DeliveryLog = require('../api/_email-delivery-log');
const ResendWebhook = require('../api/resend-webhook');
const WebhookHandler = ResendWebhook._test;

test('Resend webhook disables Vercel body parsing for signature verification', () => {
  assert.deepEqual(ResendWebhook.config, { api: { bodyParser: false } });
});

test('Resend events normalize into a stable delivery-log record', () => {
  const normalized = DeliveryLog.normalizeDeliveryEvent({
    type: 'email.bounced',
    created_at: '2026-07-28T20:00:00.000Z',
    data: {
      email_id: 'email_123',
      to: ['Customer@Example.com'],
      subject: 'PRPD reminder',
      bounce: { message: 'Mailbox does not exist' },
    },
  }, 'msg_123');
  assert.deepEqual(normalized, {
    emailId: 'email_123',
    recipient: 'customer@example.com',
    subject: 'PRPD reminder',
    type: 'email.bounced',
    status: 'bounced',
    eventAt: '2026-07-28T20:00:00.000Z',
    detail: 'Mailbox does not exist',
    webhookId: 'msg_123',
  });
});

test('Resend webhook verification rejects altered content', () => {
  const secret = `whsec_${Buffer.from('test webhook signing secret').toString('base64')}`;
  const webhook = new Webhook(secret);
  const payload = JSON.stringify({ type: 'email.delivered', data: { email_id: 'email_123' } });
  const messageId = 'msg_test';
  const timestamp = new Date();
  const signature = webhook.sign(messageId, timestamp, payload);
  const headers = {
    'svix-id': messageId,
    'svix-timestamp': String(Math.floor(timestamp.getTime() / 1000)),
    'svix-signature': signature,
  };
  assert.equal(WebhookHandler.verifyEvent(payload, headers, secret).type, 'email.delivered');
  assert.throws(() => WebhookHandler.verifyEvent(`${payload} `, headers, secret));
});

test('Resend webhook retries transient Sheets throttling before succeeding', async () => {
  let attempts = 0;
  const delays = [];
  const result = await WebhookHandler.retryTransient(async () => {
    attempts += 1;
    if (attempts < 3) {
      const error = new Error('Sheets quota throttled');
      error.status = 429;
      throw error;
    }
    return 'recorded';
  }, {
    attempts: 4,
    baseDelayMs: 100,
    random: () => 0.5,
    sleep: async delay => delays.push(delay),
  });

  assert.equal(result, 'recorded');
  assert.equal(attempts, 3);
  assert.deepEqual(delays, [150, 250]);
  assert.equal(WebhookHandler.isTransientUpstreamError({ status: 503 }), true);
  assert.equal(WebhookHandler.isTransientUpstreamError({ status: 400 }), false);
});

test('Resend webhook treats provider sent events as redundant with accepted logging', () => {
  assert.equal(WebhookHandler.REDUNDANT_EVENTS.has('email.sent'), true);
  assert.equal(WebhookHandler.REDUNDANT_EVENTS.has('email.delivered'), false);
});

test('delivery events reuse one row read for recording and completion summary', async () => {
  const runId = 'menu-reminder-b9-wednesday-2026-09-02';
  const requests = [];
  const acceptedRow = [
    runId,
    'email_123',
    'customer@example.com',
    'PRPD orders close today at 6:00 PM CT',
    '2026-09-02T20:17:43.000Z',
    'accepted',
    'email.accepted',
    '2026-09-02T20:17:43.000Z',
    '',
    '',
    '2026-09-02T20:17:43.000Z',
    '',
    '1',
  ];
  const client = {
    request: async request => {
      requests.push(request);
      if (request.method === 'GET') return { data: { values: [acceptedRow] } };
      return { data: {} };
    },
  };

  const recorded = await DeliveryLog.recordDeliveryEvent(client, {
    type: 'email.delivered',
    created_at: '2026-09-02T20:17:52.000Z',
    data: {
      email_id: 'email_123',
      to: ['customer@example.com'],
      subject: 'PRPD orders close today at 6:00 PM CT',
    },
  }, 'webhook_123', { ensureSheet: false });

  assert.equal(recorded.summary.complete, true);
  assert.equal(recorded.summary.counts.delivered, 1);
  assert.equal(requests.length, 2);
  assert.equal(requests[0].method, 'GET');
  assert.equal(requests[1].method, 'PUT');
});

test('delivery report distinguishes delivered from failed recipients', () => {
  const report = WebhookHandler.renderDeliveryReport({
    runId: 'menu-reminder-b4-tuesday-2026-07-28',
    counts: { delivered: 4, bounced: 1 },
    recipients: [
      { email: 'good@example.com', status: 'delivered', detail: '' },
      { email: 'bad@example.com', status: 'bounced', detail: 'Mailbox unavailable' },
    ],
  });
  assert.match(report.subject, /4 delivered, 1 failed/);
  assert.match(report.text, /bad@example\.com: bounced \(Mailbox unavailable\)/);
});

test('delivery summary waits for the full intended audience', () => {
  const row = (email, status) => [
    'menu-reminder-b5-monday-2026-08-03',
    `email-${email}`,
    email,
    "This week's PRPD menu is open",
    '2026-08-03T23:00:00.000Z',
    status,
    `email.${status}`,
    '2026-08-03T23:00:01.000Z',
    '',
    '',
    '2026-08-03T23:00:02.000Z',
    '',
    '3',
  ];
  const partial = DeliveryLog.summarizeDeliveryRows([
    row('one@example.com', 'delivered'),
    row('two@example.com', 'delivered'),
  ], 'menu-reminder-b5-monday-2026-08-03');
  assert.equal(partial.expectedCount, 3);
  assert.equal(partial.complete, false);

  const complete = DeliveryLog.summarizeDeliveryRows([
    row('one@example.com', 'delivered'),
    row('two@example.com', 'delivered'),
    row('three@example.com', 'delivered'),
  ], 'menu-reminder-b5-monday-2026-08-03');
  assert.equal(complete.complete, true);
});
