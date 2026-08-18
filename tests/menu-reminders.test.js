const assert = require('node:assert/strict');
const test = require('node:test');

process.env.CRON_SECRET = 'test-cron-secret';
process.env.EMAIL_UNSUBSCRIBE_SECRET = 'test-unsubscribe-secret';

const ReminderCore = require('../api/_menu-reminder-core');
const ReminderHandler = require('../api/menu-reminders')._test;
const Unsubscribe = require('../api/menu-unsubscribe')._test;

function order(overrides = {}) {
  return {
    Batch: 'Batch 3',
    'First Name': 'Prior',
    'Last Name': 'Customer',
    Email: 'prior@example.com',
    'Menu Email Opt-In': 'Yes',
    ...overrides,
  };
}

test('reminder campaign keys are strict and require request-level authorization', () => {
  assert.equal(ReminderHandler.manualCampaignKey({ query: { campaign: 'approved-menu' } }, true), 'approved-menu');
  assert.equal(ReminderHandler.manualCampaignKey({ query: { campaign: ' Approved-Menu ' } }, true), 'approved-menu');
  assert.equal(ReminderHandler.manualCampaignKey({ query: { campaign: 'approved menu' } }, true), null);
  assert.equal(ReminderHandler.manualCampaignKey({ query: { campaign: '../approved' } }, true), null);
  assert.equal(ReminderHandler.manualCampaignKey({ query: { campaign: 'approved-menu' } }, false), '');
});

test('manual sends accept a dedicated token or an explicit campaign with the protected planner key', () => {
  const request = { query: { campaign: 'approved-menu' }, headers: {} };
  const options = { manualToken: 'manual', plannerKey: 'planner' };
  assert.equal(ReminderHandler.manualRequestAuthorized({ ...request, headers: { 'x-prpd-manual-reminder-key': 'manual' } }, options), true);
  assert.equal(ReminderHandler.manualRequestAuthorized({ ...request, headers: { 'x-prpd-planner-key': 'planner' } }, options), true);
  assert.equal(ReminderHandler.manualRequestAuthorized({ query: {}, headers: { 'x-prpd-planner-key': 'planner' } }, options), false);
  assert.equal(ReminderHandler.manualRequestAuthorized({ ...request, headers: { 'x-prpd-planner-key': 'wrong' } }, options), false);
});

test('a successful phase cannot be sent twice on the same day through another campaign key', () => {
  const row = [
    'menu-reminder-b6-monday-approved-menu-2026-08-10',
    '2026-08-11T00:00:26.916Z',
    'Menu Reminder - monday',
    'sent',
  ];
  assert.equal(ReminderHandler.matchesSuccessfulPhaseRun(row, {
    batchNumber: 6,
    phase: 'monday',
    date: '2026-08-10',
  }), true);
  assert.equal(ReminderHandler.matchesSuccessfulPhaseRun(row, {
    batchNumber: 6,
    phase: 'tuesday',
    date: '2026-08-10',
  }), false);
  assert.equal(ReminderHandler.matchesSuccessfulPhaseRun([...row.slice(0, 3), 'failed'], {
    batchNumber: 6,
    phase: 'monday',
    date: '2026-08-10',
  }), false);
});

test('rate-limited reminder work retries safely before succeeding', async () => {
  let attempts = 0;
  const result = await ReminderHandler.retryRateLimited(async () => {
    attempts += 1;
    if (attempts < 3) {
      const error = new Error('rate limited');
      error.status = 429;
      throw error;
    }
    return 'ok';
  }, { attempts: 3, baseDelayMs: 1 });

  assert.equal(result, 'ok');
  assert.equal(attempts, 3);
});

test('eligible recipients include prior customers and skip current-batch orderers', () => {
  const orders = [
    order(),
    order({ Email: 'legacy@example.com', 'First Name': 'Legacy', 'Menu Email Opt-In': '' }),
    order({ Batch: 'Batch 4', 'First Name': 'Fatimah', Email: 'fatimah@example.com' }),
    order({ Batch: 'Batch 4', 'First Name': 'Muhammad', Email: 'muhammad@example.com' }),
    order({ Batch: 'Batch 3', 'First Name': 'No', Email: 'no@example.com', 'Menu Email Opt-In': 'No' }),
  ];
  const recipients = ReminderCore.eligibleRecipients(orders, {
    batchNumber: 4,
    batchNumberFromOrder: row => Number(row.Batch.replace(/\D/g, '')),
  });
  assert.deepEqual(recipients, [
    {
      email: 'legacy@example.com',
      firstName: 'Legacy',
      lastName: 'Customer',
      audienceReason: 'previous-customer',
    },
    {
      email: 'no@example.com',
      firstName: 'No',
      lastName: 'Customer',
      audienceReason: 'previous-customer',
    },
    {
      email: 'prior@example.com',
      firstName: 'Prior',
      lastName: 'Customer',
      audienceReason: 'opted-in',
    },
  ]);
});

test('order-form No does not unsubscribe a prior customer; dedicated preference does', () => {
  const orders = [
    order({ Email: 'changed@example.com', 'Menu Email Opt-In': 'Yes' }),
    order({ Email: 'changed@example.com', 'Menu Email Opt-In': 'No' }),
    order({ Email: 'stopped@example.com', 'Menu Email Opt-In': 'Yes' }),
  ];
  const preferences = new Map([['stopped@example.com', 'unsubscribed']]);
  const recipients = ReminderCore.eligibleRecipients(orders, {
    batchNumber: 4,
    batchNumberFromOrder: row => Number(row.Batch.replace(/\D/g, '')),
    preferences,
  });
  assert.deepEqual(recipients, [{
    email: 'changed@example.com',
    firstName: 'Prior',
    lastName: 'Customer',
    audienceReason: 'previous-customer',
  }]);
});

test('batch holds suppress only the selected batch and phase, then expire automatically', () => {
  const orders = [
    order({ Email: 'held@example.com', 'First Name': 'Held' }),
    order({ Email: 'open@example.com', 'First Name': 'Open' }),
  ];
  const holds = [{
    email: 'held@example.com',
    batchNumber: 6,
    phase: 'all',
    status: 'active',
    expiresAt: '',
  }];
  const batch6 = ReminderCore.recipientDecisions(orders, {
    batchNumber: 6,
    batchNumberFromOrder: row => Number(row.Batch.replace(/\D/g, '')),
    phase: 'wednesday',
    holds,
  });
  assert.equal(batch6.find(entry => entry.email === 'held@example.com').reason, 'batch-hold');
  assert.equal(batch6.find(entry => entry.email === 'open@example.com').decision, 'eligible');

  const batch7 = ReminderCore.recipientDecisions(orders, {
    batchNumber: 7,
    batchNumberFromOrder: row => Number(row.Batch.replace(/\D/g, '')),
    phase: 'wednesday',
    holds,
  });
  assert.equal(batch7.find(entry => entry.email === 'held@example.com').decision, 'eligible');
});

test('phase-specific and dated holds fail open only when they no longer apply', () => {
  const hold = {
    email: 'held@example.com',
    batchNumber: 6,
    phase: 'tuesday',
    status: 'active',
    expiresAt: '2026-08-12T18:00:00-05:00',
  };
  assert.equal(ReminderCore.holdApplies(hold, {
    batchNumber: 6,
    phase: 'tuesday',
    now: new Date('2026-08-12T12:00:00-05:00'),
  }), true);
  assert.equal(ReminderCore.holdApplies(hold, {
    batchNumber: 6,
    phase: 'wednesday',
    now: new Date('2026-08-12T12:00:00-05:00'),
  }), false);
  assert.equal(ReminderCore.holdApplies(hold, {
    batchNumber: 6,
    phase: 'tuesday',
    now: new Date('2026-08-12T19:00:00-05:00'),
  }), false);
});

test('suppression summary is stable and contains no contact data', () => {
  const summary = ReminderHandler.decisionSummary([
    { email: 'one@example.com', decision: 'suppressed', reason: 'batch-hold' },
    { email: 'two@example.com', decision: 'suppressed', reason: 'current-batch-order' },
    { email: 'three@example.com', decision: 'suppressed', reason: 'batch-hold' },
    { email: 'four@example.com', decision: 'eligible', reason: 'previous-customer' },
  ]);
  assert.equal(summary, 'batch-hold: 2, current-batch-order: 1');
  assert.doesNotMatch(summary, /@/);
});

test('Talal, Duaa, and Rida profiles are not marketing recipients', () => {
  const orders = [
    order({ 'First Name': 'Talal', 'Last Name': 'Account', Email: 'talal@example.com' }),
    order({ 'First Name': 'Duaa', 'Last Name': 'Hassan', Email: 'duaa@example.com' }),
    order({ 'First Name': 'Rida', 'Last Name': 'Khan', Email: 'rida@example.com' }),
  ];
  const recipients = ReminderCore.eligibleRecipients(orders, {
    batchNumber: 4,
    batchNumberFromOrder: () => 3,
  });
  assert.deepEqual(recipients, []);
});

test('menu reminder send guard accepts only an open menu with a sensible delivery window', () => {
  const result = ReminderHandler.menuWindowStatus({
    batch: {
      published: true,
      remindersEnabled: true,
      cutoffIso: '2026-08-12T18:00:00-05:00',
      deliveryDate: 'Saturday, August 15, 2026',
    },
  }, new Date('2026-08-10T15:00:00-05:00'));

  assert.deepEqual(result, { safeToSend: true, status: 'ready', reason: '' });
});

test('menu reminder send guard blocks a draft menu even when its dates are valid', () => {
  const result = ReminderHandler.menuWindowStatus({
    batch: {
      published: false,
      cutoffIso: '2026-08-12T18:00:00-05:00',
      deliveryDate: 'Saturday, August 15, 2026',
    },
  }, new Date('2026-08-10T15:00:00-05:00'));

  assert.deepEqual(result, {
    safeToSend: false,
    status: 'disabled-unpublished',
    reason: 'menu-not-published',
  });
});

test('menu reminder send guard blocks a cutoff that is no longer in the future', () => {
  const result = ReminderHandler.menuWindowStatus({
    batch: {
      published: true,
      remindersEnabled: true,
      cutoffIso: '2026-08-05T18:00:00-05:00',
      deliveryDate: 'Saturday, August 8, 2026',
    },
  }, new Date('2026-08-10T15:00:00-05:00'));

  assert.deepEqual(result, {
    safeToSend: false,
    status: 'disabled-stale-config',
    reason: 'cutoff-not-future',
  });
});

test('menu reminder send guard keeps a published menu quiet during owner review', () => {
  const result = ReminderHandler.menuWindowStatus({
    batch: {
      published: true,
      remindersEnabled: false,
      cutoffIso: '2026-08-12T18:00:00-05:00',
      deliveryDate: 'Saturday, August 15, 2026',
    },
  }, new Date('2026-08-10T15:00:00-05:00'));

  assert.deepEqual(result, {
    safeToSend: false,
    status: 'disabled-owner-review',
    reason: 'reminders-not-approved',
  });
});

test('menu reminder send guard blocks invalid or implausible delivery configuration', () => {
  const now = new Date('2026-08-10T15:00:00-05:00');
  const invalidCutoff = ReminderHandler.menuWindowStatus({
    batch: { published: true, remindersEnabled: true, cutoffIso: 'not-a-date', deliveryDate: 'Saturday, August 15, 2026' },
  }, now);
  const deliveryBeforeCutoff = ReminderHandler.menuWindowStatus({
    batch: {
      published: true,
      remindersEnabled: true,
      cutoffIso: '2026-08-12T18:00:00-05:00',
      deliveryDate: 'Tuesday, August 11, 2026',
    },
  }, now);
  const deliveryTooFarAway = ReminderHandler.menuWindowStatus({
    batch: {
      published: true,
      remindersEnabled: true,
      cutoffIso: '2026-08-12T18:00:00-05:00',
      deliveryDate: 'Saturday, September 5, 2026',
    },
  }, now);

  assert.equal(invalidCutoff.status, 'disabled-stale-config');
  assert.equal(invalidCutoff.reason, 'invalid-cutoff');
  assert.equal(deliveryBeforeCutoff.reason, 'invalid-fulfillment-window');
  assert.equal(deliveryTooFarAway.reason, 'invalid-fulfillment-window');
});

test('reminder copy includes cutoff, ordering rules, address, and unsubscribe', () => {
  const reminder = ReminderCore.renderReminder({
    phase: 'tuesday',
    firstName: 'Aleena',
    menuUrl: 'https://getprpd.com/order',
    unsubscribeUrl: 'https://getprpd.com/api/menu-unsubscribe?token=test',
    postalAddress: '123 Business Rd, Frisco, TX 75035',
  });
  assert.match(reminder.subject, /tomorrow at 6 PM/);
  assert.match(reminder.text, /\$60 minimum/);
    assert.match(reminder.text, /Local delivery: \$60 minimum, \$9\.99 delivery, free at \$85/);
    assert.match(reminder.text, /Regional delivery: \$80 minimum, \$12\.99 delivery, free at \$125/);
    assert.match(reminder.text, /Extended delivery: \$100 minimum, \$14\.99 delivery, free at \$150/);
  assert.match(reminder.text, /Unsubscribe/);
  assert.match(reminder.text, /123 Business Rd/);
  assert.match(reminder.text, /Promotional email/);
});

test('owner report confirms the exact recipients accepted by the email provider', () => {
  const report = ReminderCore.renderOwnerReport({
    phase: 'tuesday',
    status: 'sent',
    runId: 'menu-reminder-b4-tuesday-2026-07-28',
    batchNumber: 4,
    intendedCount: 2,
    recipients: [
      { firstName: 'Nure', lastName: 'Siddique', email: 'nure@example.com' },
      { firstName: 'Aleena', lastName: 'Sajan', email: 'aleena@example.com' },
    ],
    note: 'All eligible customer reminders were accepted by the email provider.',
  });
  assert.match(report.subject, /2 sent \(tuesday\)/);
  assert.match(report.text, /Sent: 2 of 2/);
  assert.match(report.text, /Nure Siddique <nure@example.com>/);
  assert.match(report.text, /Aleena Sajan <aleena@example.com>/);
  assert.match(report.text, /accepted by the email provider/);
});

test('unsubscribe contact tokens round-trip and reject changes', () => {
  const contact = Unsubscribe.encodeContact('Customer@Example.com');
  const email = Unsubscribe.decodeContact(contact);
  const token = Unsubscribe.signContact(email);
  assert.equal(email, 'customer@example.com');
  assert.equal(Unsubscribe.validToken(email, token), true);
  assert.equal(Unsubscribe.validToken('other@example.com', token), false);
});
