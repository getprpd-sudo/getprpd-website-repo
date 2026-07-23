const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const security = require('../api/_security');
const orderApi = require('../api/order');

test('request schemas reject extra properties and invalid non-dessert tiers', () => {
  assert.throws(
    () => orderApi._test.normalizeItems([{ id: 'b1', tier: 'family', qty: 1 }]),
    /invalid tier/i,
  );
  assert.throws(
    () => orderApi._test.normalizeItems([{ id: 'b1', tier: 'lean', qty: 1, admin: true }]),
    /unsupported fields/i,
  );
});

test('order contact validation requires a usable email and delivery location', () => {
  const base = {
    action: 'order',
    orderId: 'PRPD-B3-20260721-A1B2C3D4',
    batch: 3,
    deliveryDate: 'Saturday, July 25, 2026',
    firstName: 'Test',
    lastName: 'Customer',
    phone: '4695550100',
    email: 'not-an-email',
    deliveryAddress: '123 Main Street',
    deliveryCity: 'Frisco',
    deliveryZip: '75035',
    deliveryInstructions: '',
    items: [],
    mealSubtotal: 0,
    deliveryFee: 0,
    exactTotal: 0,
    total: 0,
    promoCode: '',
    discountAmount: 0,
    menuEmailOptIn: false,
    notes: '',
    submittedAt: '',
    website: '',
    formStartedAt: 1,
    utmSource: '',
    utmMedium: '',
    utmCampaign: '',
    utmContent: '',
    utmTerm: '',
    landingPage: '',
    referrer: '',
  };

  assert.throws(() => orderApi._test.validateAndBuildOrder(base), /valid email address/i);
  assert.throws(
    () => orderApi._test.validateAndBuildOrder({ ...base, email: 'customer@example.com', deliveryZip: '7503' }),
    /5-digit ZIP code/i,
  );
});

test('origin and fetch-metadata checks allow PRPD and reject cross-site origins', () => {
  assert.equal(security.isAllowedOrigin('https://getprpd.com'), true);
  assert.equal(security.isAllowedOrigin('https://preview-name.vercel.app'), true);
  assert.equal(security.isAllowedOrigin('https://attacker.example'), false);
  assert.match(
    security.requestSourceError({ headers: { 'sec-fetch-site': 'cross-site' } }),
    /cross-site/i,
  );
});

test('bot signals detect a filled honeypot and impossibly fast form submission', () => {
  const now = 1_000_000;
  assert.equal(security.isLikelyBot({ website: 'https://spam.example' }, now), true);
  assert.equal(security.isLikelyBot({ formStartedAt: now - 500 }, now), true);
  assert.equal(security.isLikelyBot({ formStartedAt: now - 5_000 }, now), false);
});

test('Google Sheets writes use RAW values and public code contains no private credential literals', () => {
  const orderSource = fs.readFileSync(path.join(__dirname, '..', 'api', 'order.js'), 'utf8');
  const leadSource = fs.readFileSync(path.join(__dirname, '..', 'api', 'lead.js'), 'utf8');
  assert.match(orderSource, /valueInputOption=RAW/);
  assert.match(leadSource, /valueInputOption=RAW/);

  const publicFiles = [
    'index.html', 'order.html', 'faq.html', 'privacy.html', 'script.js',
    'order.js', 'faq.js', 'analytics.js', 'structured-data.js', 'config/order-config.js',
  ];
  for (const file of publicFiles) {
    const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
    assert.doesNotMatch(source, /-----BEGIN PRIVATE KEY-----/);
    assert.doesNotMatch(source, /\bre_[A-Za-z0-9]{20,}\b/);
  }
});

test('order storage and email confirmation preserve canonical records', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'api', 'order.js'), 'utf8');
  assert.match(source, /'Orders'!A\$\{targetRow\}:AC\$\{targetRow\}/);
  assert.match(source, /'Email', 'Delivery Address', 'City', 'ZIP Code', 'Delivery Instructions'/);
  assert.match(source, /'Meal Subtotal', 'Delivery Fee', 'Discount Code', 'Discount Amount'/);
  assert.match(source, /order-customer-\$\{order\.orderId\}/);
  assert.match(source, /awaiting payment and final confirmation from Rida/i);
  assert.match(source, /Promise\.allSettled/);
});

test('Vercel headers include CSP and cross-origin protections', () => {
  const vercel = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'vercel.json'), 'utf8'));
  const headers = Object.fromEntries(vercel.headers[0].headers.map(item => [item.key, item.value]));
  assert.match(headers['Content-Security-Policy'], /frame-ancestors 'none'/);
  assert.match(headers['Content-Security-Policy'], /object-src 'none'/);
  assert.match(headers['Content-Security-Policy'], /script-src-attr 'none'/);
  assert.match(headers['Content-Security-Policy'], /style-src-attr 'none'/);
  assert.doesNotMatch(headers['Content-Security-Policy'], /'unsafe-inline'/);
  assert.equal(headers['Cross-Origin-Opener-Policy'], 'same-origin-allow-popups');
  assert.equal(headers['X-Content-Type-Options'], 'nosniff');
});

test('public pages contain no inline scripts, styles, or event handlers', () => {
  for (const file of ['index.html', 'order.html', 'faq.html', 'privacy.html']) {
    const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
    assert.doesNotMatch(source, /<style\b/i, `${file} contains an inline style block`);
    assert.doesNotMatch(source, /\sstyle\s*=/i, `${file} contains a style attribute`);
    assert.doesNotMatch(source, /\son[a-z]+\s*=/i, `${file} contains an inline event handler`);

    for (const tag of source.matchAll(/<script\b([^>]*)>/gi)) {
      assert.match(tag[1], /\ssrc\s*=/i, `${file} contains an inline script block`);
    }
  }
});

test('Vercel deployment excludes internal operations, tests, audits, and credential patterns', () => {
  const ignore = fs.readFileSync(path.join(__dirname, '..', '.vercelignore'), 'utf8');
  for (const pattern of [
    'operations/', 'tests/', 'SECURITY_AUDIT_*.md', 'apps-script.gs',
    '.env*', '*-website-*.json', 'service-account*.json', '*API*KEY*.txt',
  ]) {
    assert.match(ignore, new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});
