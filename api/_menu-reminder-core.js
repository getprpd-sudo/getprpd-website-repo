const EXEMPT_CUSTOMERS = Object.freeze(['Talal Account', 'Duaa Hassan', 'Rida Khan']);
const PHASES = Object.freeze({
  monday: {
    subject: "This week's PRPD menu is open",
    heading: "This week's menu is ready",
    intro: 'Choose your meals for Saturday delivery before {cutoff}.',
    cta: "View this week's menu",
  },
  tuesday: {
    subject: 'PRPD orders close tomorrow at {cutoffTimeShort}',
    heading: 'A quick PRPD order reminder',
    intro: "This week's menu is open, and orders close tomorrow at {cutoffTime}.",
    cta: 'Place your order',
  },
  wednesday: {
    subject: 'PRPD orders close today at {cutoffTimeShort}',
    heading: "Final call for this week's PRPD menu",
    intro: 'Orders close today at {cutoffTime} for Saturday delivery.',
    cta: 'Order before cutoff',
  },
});

function clean(value) {
  return String(value ?? '').trim();
}

function normalizeEmail(value) {
  const email = clean(value).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '';
}

function normalizeName(value) {
  return clean(value).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function customerName(order) {
  return `${clean(order['First Name'])} ${clean(order['Last Name'])}`.trim();
}

function isExempt(order, exemptions = EXEMPT_CUSTOMERS) {
  const customer = normalizeName(customerName(order));
  return exemptions.some((entry) => {
    const exempt = normalizeName(entry);
    return exempt && (customer === exempt || customer.startsWith(`${exempt} `));
  });
}

function consentValue(value) {
  const normalized = clean(value).toLowerCase();
  if (['yes', 'true', '1', 'opted in', 'subscribed'].includes(normalized)) return true;
  if (['no', 'false', '0', 'opted out', 'unsubscribed'].includes(normalized)) return false;
  return null;
}

function preferenceStatus(value) {
  const normalized = clean(value).toLowerCase();
  return ['unsubscribed', 'opted out', 'no'].includes(normalized) ? 'unsubscribed' : normalized;
}

function holdApplies(hold, options = {}) {
  if (!hold || typeof hold !== 'object') return false;
  if (clean(hold.status).toLowerCase() !== 'active') return false;
  if (Number(hold.batchNumber) !== Number(options.batchNumber)) return false;
  const holdPhase = clean(hold.phase).toLowerCase() || 'all';
  const phase = clean(options.phase).toLowerCase();
  if (holdPhase !== 'all' && holdPhase !== phase) return false;
  const expiresAt = clean(hold.expiresAt);
  if (!expiresAt) return true;
  const expiresMs = Date.parse(expiresAt);
  const nowMs = options.now instanceof Date ? options.now.getTime() : Date.now();
  return Number.isFinite(expiresMs) && expiresMs > nowMs;
}

function recipientDecisions(orders, options = {}) {
  const batchNumber = Number(options.batchNumber) || 0;
  const preferences = options.preferences instanceof Map ? options.preferences : new Map();
  const holds = Array.isArray(options.holds) ? options.holds : [];
  const latestByEmail = new Map();
  const consentByEmail = new Map();
  const orderedCurrentBatch = new Set();

  for (const order of Array.isArray(orders) ? orders : []) {
    const email = normalizeEmail(order.Email);
    if (!email || isExempt(order, options.exemptions)) continue;
    latestByEmail.set(email, order);
    const consent = consentValue(order['Menu Email Opt-In']);
    if (consent !== null) consentByEmail.set(email, consent);
    if (Number(options.batchNumberFromOrder?.(order)) === batchNumber) orderedCurrentBatch.add(email);
  }

  return Array.from(latestByEmail.entries()).map(([email, order]) => {
    const base = {
      email,
      firstName: clean(order['First Name']) || 'there',
      lastName: clean(order['Last Name']),
      audienceReason: consentByEmail.get(email) === true ? 'opted-in' : 'previous-customer',
    };
    if (orderedCurrentBatch.has(email)) {
      return { ...base, decision: 'suppressed', reason: 'current-batch-order' };
    }
    if (preferenceStatus(preferences.get(email)) === 'unsubscribed') {
      return { ...base, decision: 'suppressed', reason: 'unsubscribed' };
    }
    const matchingHold = holds.find(hold => normalizeEmail(hold.email) === email && holdApplies(hold, {
      batchNumber,
      phase: options.phase,
      now: options.now,
    }));
    if (matchingHold) {
      return { ...base, decision: 'suppressed', reason: 'batch-hold' };
    }
    return { ...base, decision: 'eligible', reason: base.audienceReason };
  }).sort((left, right) => left.email.localeCompare(right.email));
}

function eligibleRecipients(orders, options = {}) {
  return recipientDecisions(orders, options)
    .filter(entry => entry.decision === 'eligible')
    .map(({ decision, reason, ...recipient }) => recipient);
}

function escapeHtml(value) {
  return clean(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);
}

function renderReminder(options) {
  const phase = PHASES[options.phase] || PHASES.tuesday;
  const firstName = clean(options.firstName) || 'there';
  const cutoff = clean(options.cutoffLabel) || 'Wednesday at 6:00 PM CT';
  const cutoffTime = cutoff.replace(/^Wednesday at\s+/i, '');
  const cutoffTimeShort = cutoffTime.replace(':00 ', ' ');
  const subject = phase.subject.replace('{cutoffTimeShort}', cutoffTimeShort);
  const intro = phase.intro
    .replace('{cutoff}', cutoff)
    .replace('{cutoffTime}', cutoffTime);
  const menuUrl = clean(options.menuUrl) || 'https://getprpd.com/order';
  const unsubscribeUrl = clean(options.unsubscribeUrl);
  const postalAddress = clean(options.postalAddress);
  const audienceReason = clean(options.audienceReason);
  const audienceText = audienceReason === 'opted-in'
    ? 'You received this because you opted into PRPD weekly menu emails.'
    : 'You received this because you previously ordered from PRPD.';
  const text = [
    `Hi ${firstName},`,
    '',
    intro,
    '',
    `Browse this week's menu and place your order: ${menuUrl}`,
    '',
    'Saturday delivery across the DFW area.',
    'Local delivery: $60 minimum, $9.99 delivery, free at $85.',
    'Regional delivery: $80 minimum, $12.99 delivery, free at $125.',
    'Extended delivery: $100 minimum, $14.99 delivery, free at $150.',
    '',
    'Promotional email from PRPD LLC.',
    audienceText,
    unsubscribeUrl ? `Unsubscribe: ${unsubscribeUrl}` : '',
    postalAddress ? `PRPD LLC - ${postalAddress}` : '',
  ].filter(Boolean).join('\n');

  const html = `<div style="font-family:Arial,sans-serif;color:#1e2e1e;line-height:1.6;max-width:620px;margin:auto;background:#f5f1ea;padding:30px">
    <div style="background:#1e2e1e;color:#f7f1e7;padding:22px 26px">
      <div style="font-size:28px;font-weight:700;letter-spacing:2px">PRPD</div>
      <div style="font-size:12px;color:#afd1b3;text-transform:uppercase">Fresh halal meal prep</div>
    </div>
    <div style="background:#fff;padding:28px;border:1px solid #ded8cf;border-top:0">
      <p style="margin:0 0 12px">Hi ${escapeHtml(firstName)},</p>
      <h1 style="font-size:23px;margin:0 0 12px">${escapeHtml(phase.heading)}</h1>
      <p style="margin:0 0 22px">${escapeHtml(intro)}</p>
      <p style="margin:0 0 24px"><a href="${escapeHtml(menuUrl)}" style="display:inline-block;background:#1f7a3f;color:#fff;text-decoration:none;padding:13px 19px;font-weight:700">${escapeHtml(phase.cta)}</a></p>
      <p style="margin:0">Saturday delivery across the DFW area.<br>
      Local delivery: $60 minimum, $9.99 delivery, free at $85.<br>
      Regional delivery: $80 minimum, $12.99 delivery, free at $125.<br>
      Extended delivery: $100 minimum, $14.99 delivery, free at $150.</p>
      <hr style="border:0;border-top:1px solid #ded8cf;margin:26px 0 18px">
      <p style="font-size:12px;color:#667266;margin:0">Promotional email from PRPD LLC.<br>
      ${escapeHtml(audienceText)}
      ${unsubscribeUrl ? `<a href="${escapeHtml(unsubscribeUrl)}" style="color:#315f3b">Unsubscribe</a><br>` : '<br>'}
      PRPD LLC - ${escapeHtml(postalAddress)}</p>
    </div>
  </div>`;
  return { subject, text, html };
}

function renderOwnerReport(options) {
  const phase = clean(options.phase) || 'unknown';
  const status = clean(options.status) || 'unknown';
  const batchNumber = Number(options.batchNumber) || 0;
  const recipients = Array.isArray(options.recipients) ? options.recipients : [];
  const intendedCount = Number(options.intendedCount) || recipients.length;
  const recipientLines = recipients.length
    ? recipients.map(recipient => {
      const name = `${clean(recipient.firstName)} ${clean(recipient.lastName)}`.trim() || 'Customer';
      return `- ${name} <${normalizeEmail(recipient.email)}>`;
    })
    : ['- None'];
  const subject = `PRPD reminder report: ${recipients.length} sent (${phase})`;
  const suppressionSummary = clean(options.suppressionSummary);
  const text = [
    `Automation: ${phase} weekly menu reminder`,
    `Batch: ${batchNumber}`,
    `Status: ${status.toUpperCase()}`,
    `Run ID: ${clean(options.runId)}`,
    `Sent: ${recipients.length} of ${intendedCount}`,
    '',
    'Recipients:',
    ...recipientLines,
    '',
    clean(options.note),
    suppressionSummary ? `Suppressed: ${suppressionSummary}` : '',
    'Current-batch orderers, explicit opt-outs, unsubscribed contacts, and internal accounts are suppressed automatically.',
  ].filter(Boolean).join('\n');
  return { subject, text };
}

module.exports = {
  EXEMPT_CUSTOMERS,
  PHASES,
  consentValue,
  eligibleRecipients,
  holdApplies,
  normalizeEmail,
  recipientDecisions,
  renderOwnerReport,
  renderReminder,
};
