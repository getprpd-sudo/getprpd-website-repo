const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const security = require('../api/_security');
const orderApi = require('../api/order');
const draftConfig = require('../operations/active/BATCH_7_DRAFT_ORDER_CONFIG');
const draftCatalog = orderApi._test.catalogForConfig(draftConfig);
const draftOrderContext = {
  catalog: draftCatalog,
  batchNumber: draftConfig.batch.number,
  cutoffIso: draftConfig.batch.cutoffIso,
  policies: draftConfig.policies,
};

test('request schemas reject extra properties and invalid non-dessert tiers', () => {
  assert.throws(
    () => orderApi._test.normalizeItems([{ id: 'b1', tier: 'family', qty: 1 }], draftCatalog),
    /invalid tier/i,
  );
  assert.throws(
    () => orderApi._test.normalizeItems([{ id: 'b1', tier: 'lean', qty: 1, admin: true }], draftCatalog),
    /unsupported fields/i,
  );
});

test('order contact validation requires a usable email and delivery location', () => {
  const base = {
    action: 'order',
    orderId: 'PRPD-B7-20260817-A1B2C3D4',
    batch: 7,
    deliveryDate: 'Saturday, August 22, 2026',
    firstName: 'Test',
    lastName: 'Customer',
    phone: '4695550100',
    email: 'not-an-email',
    deliveryAddress: '123 Main Street',
    deliveryHasUnit: false,
    deliveryUnit: '',
    deliveryCity: 'Frisco',
    deliveryState: 'TX',
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

  assert.throws(() => orderApi._test.validateAndBuildOrder(base, [], draftOrderContext), /valid email address/i);
  assert.throws(
    () => orderApi._test.validateAndBuildOrder({ ...base, email: 'customer@example.com', deliveryZip: '7503' }, [], draftOrderContext),
    /5-digit ZIP code/i,
  );
  assert.throws(
    () => orderApi._test.validateAndBuildOrder({ ...base, email: 'customer@example.com', deliveryState: '' }, [], draftOrderContext),
    /state must be TX/i,
  );
  assert.throws(
    () => orderApi._test.validateAndBuildOrder({ ...base, email: 'customer@example.com', deliveryHasUnit: true }, [], draftOrderContext),
    /unit number is required/i,
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

test('order storage expands undersized sheet grids before writing new tracking columns', async () => {
  const requests = [];
  const client = {
    async request(options) {
      requests.push(options);
      if (options.method === 'GET') {
        return {
          data: {
            sheets: [{
              properties: {
                sheetId: 123,
                title: 'Orders',
                gridProperties: { columnCount: 29 },
              },
            }],
          },
        };
      }
      return { data: {} };
    },
  };

  const expanded = await orderApi._test.ensureSheetColumnCapacity(client, 'Orders', 36);
  assert.equal(expanded, true);
  assert.equal(requests.length, 2);
  assert.deepEqual(requests[1].data.requests, [{
    appendDimension: {
      sheetId: 123,
      dimension: 'COLUMNS',
      length: 7,
    },
  }]);
});

test('order storage and email confirmation preserve canonical records', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'api', 'order.js'), 'utf8');
  assert.match(source, /'Orders'!A\$\{targetRow\}:AK\$\{targetRow\}/);
  assert.match(source, /'Email', 'Delivery Address', 'City', 'ZIP Code', 'Delivery Instructions'/);
  assert.match(source, /'Meal Subtotal', 'Delivery Fee', 'Discount Code', 'Discount Amount'/);
  assert.match(source, /'Fulfillment Method'/);
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
  assert.match(headers['Content-Security-Policy'], /https:\/\/analytics-ipv6\.tiktokw\.us/);
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
