const assert = require('node:assert/strict');
const test = require('node:test');
const { Webhook } = require('svix');

const DeliveryLog = require('../api/_email-delivery-log');
const WebhookHandler = require('../api/resend-webhook')._test;

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
