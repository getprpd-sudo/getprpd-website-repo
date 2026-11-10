const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const vm = require('node:vm');

const read = file => fs.readFileSync(require.resolve(`../${file}`), 'utf8').replace(/\r\n/g, '\n');
const order = read('order.js');
const ads = read('google-ads.js');
const funnel = read('funnel-tracking.js');

// Execute the real submission response/catch block without loading menu UI or
// contacting any API. Fail visibly if the production boundaries change.
function sourceBetween(source, startMarker, endMarker, from = 0) {
  const start = source.indexOf(startMarker, from);
  const end = source.indexOf(endMarker, start);
  assert.ok(start >= from && end > start, `Missing source boundaries: ${startMarker}`);
  return source.slice(start, end);
}
const submission = sourceBetween(order, '      try {\n        if (typeof window.trackPrpdFunnelEvent',
  '\n    }\n\n    function cartReadyForCheckout', order.indexOf('async function submitOrder()'));
const errorUi = sourceBetween(order, '    function clearOrderError()', '    function splitFullName(');
const attribution = sourceBetween(order, '    function captureAttribution()', "    const MENU_SECTIONS =");
const cookies = sourceBetween(order, '    function browserCookie(', '    // ═');

function fixture(response) {
  const elements = new Map();
  const element = id => {
    if (!elements.has(id)) elements.set(id, {
      hidden: false, disabled: false, textContent: '', focused: false,
      classes: new Set(),
      classList: { add(name) { elements.get(id).classes.add(name); } },
      scrollIntoView() {}, focus() { this.focused = true; },
    });
    return elements.get(id);
  };
  element('placeOrderBtn').disabled = true;
  element('btnText').hidden = true;
  element('btnSpinner').hidden = false;
  element('orderFeedback').hidden = true;
  const removed = [], events = [], requests = [], invoices = [], stored = new Map();
  const document = { cookie: '', referrer: '', getElementById: element, addEventListener() {}, documentElement: { clientWidth: 390 } };
  const sessionStorage = { getItem: key => stored.get(key) || null, setItem: (key, value) => stored.set(key, String(value)) };
  const window = {
    document, sessionStorage, localStorage: { removeItem: key => removed.push(key) },
    location: { search: '', href: 'https://getprpd.com/order', pathname: '/order' },
    crypto: { getRandomValues: bytes => bytes.fill(1) }, innerWidth: 390,
    scrollTo() {}, setTimeout: callback => callback(),
    trackPrpdFunnelEvent: (name, data) => events.push({ name, data }),
  };
  const context = vm.createContext({
    window, document, sessionStorage, URLSearchParams,
    console: { error() {} },
    fetch: async (url, options) => {
      requests.push({ url, options });
      if (response instanceof Error) throw response;
      return response;
    },
    ORDER_API_URL: '/api/order', payload: { fixture: 'never-sent' },
    btn: element('placeOrderBtn'), firstName: 'Fixture', email: 'fixture@example.invalid',
    roundedTotal: 80, discountAmount: 10, tax: { salesTax: 5 }, deliveryFee: 5,
    ordered: [{ qty: 2 }], mealSubtotal: 80, totalItems: 2,
    orderId: 'CLIENT-FIXTURE', promoCode: '', selectedFulfillment: 'delivery',
    CART_STORAGE_KEY: 'cart-fixture', SAUCE_STORAGE_KEY: 'sauce-fixture',
    closeMobileSummary() {}, renderOrderConfirmation: (...args) => invoices.push(args),
    ATTRIBUTION_KEYS: ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'],
    GOOGLE_CLICK_KEYS: ['gclid', 'gbraid', 'wbraid'], GOOGLE_AD_DETAIL_KEYS: ['matchtype', 'device', 'network'],
    normalizePromoCode: value => value.toUpperCase(),
  });
  vm.runInContext(ads + '\n' + errorUi + '\n' + cookies + '\n' + attribution, context);
  const conversions = () => window.dataLayer.filter(args => args[0] === 'event' && args[1] === 'conversion');
  return {
    context, window, elements, events, requests, invoices, removed, stored, conversions,
    submit: () => vm.runInContext(`(async () => {\n${submission}\n})()`, context),
  };
}

for (const [name, response] of [
  ['HTTP failure despite success JSON', { ok: false, json: async () => ({ status: 'success', orderId: 'SERVER-FIXTURE', total: 73.25 }) }],
  ['unparseable JSON', { ok: true, json: async () => { throw new SyntaxError('fixture JSON'); } }],
  ['null JSON', { ok: true, json: async () => null }],
  ['API error status', { ok: true, json: async () => ({ status: 'error', message: 'Fixture rejected' }) }],
  ['network rejection', new Error('Fixture offline')],
]) {
  test(`${name} emits no completed order and restores the order UI`, async () => {
    const f = fixture(response);
    await f.submit();
    assert.equal(f.requests.length, 1);
    assert.equal(f.requests[0].url, '/api/order');
    assert.equal(f.conversions().length, 0);
    assert.equal(f.events.some(event => event.name === 'purchase'), false);
    assert.equal(f.events.filter(event => event.name === 'order_error').length, 1);
    assert.equal(f.invoices.length, 0);
    assert.equal(f.removed.length, 0);
    assert.equal(f.elements.get('placeOrderBtn').disabled, false);
    assert.equal(f.elements.get('btnText').hidden, false);
    assert.equal(f.elements.get('btnSpinner').hidden, true);
    assert.equal(f.elements.get('orderFeedback').hidden, false);
    assert.equal(f.elements.get('orderFeedback').focused, true);
    assert.equal(f.elements.get('orderForm')?.hidden || false, false);
  });
}

test('confirmed server order emits exactly one Ads conversion with server ID and confirmed total', async () => {
  const f = fixture({ ok: true, json: async () => ({
    status: 'success', orderId: 'SERVER-FIXTURE', total: 73.25,
    discountAmount: 15, salesTax: 3.25, deliveryFee: 5, customerConfirmationSent: false,
  }) });
  await f.submit();
  assert.equal(f.conversions().length, 1);
  const event = f.conversions()[0][2];
  assert.equal(event.transaction_id, 'SERVER-FIXTURE');
  assert.equal(event.value, 73.25);
  assert.equal(event.currency, 'USD');
  assert.equal(event.send_to, 'AW-18371492048/yJOnCNeYzNwcENDxmrhE');
  assert.equal(f.events.filter(event => event.name === 'purchase').length, 1);
  assert.equal(f.events.find(event => event.name === 'purchase').data.value, 73.25);
  assert.equal(f.events.some(event => event.name === 'order_error'), false);
  assert.equal(f.elements.get('orderForm').hidden, true);
  assert.equal(f.elements.get('orderSuccess').classes.has('visible'), true);
  assert.match(f.elements.get('successEmailMsg').textContent, /order is saved, but the confirmation email could not be sent/);
  assert.equal(f.invoices[0][5], 73.25);
  assert.deepEqual(f.removed, ['cart-fixture', 'sauce-fixture']);
});

test('Ads helper rejects unusable IDs and totals without emitting a conversion', () => {
  const f = fixture(null);
  for (const [id, value] of [['', 10], ['   ', 10], ['SERVER-FIXTURE', NaN], ['SERVER-FIXTURE', -1]]) {
    assert.equal(f.window.trackGoogleAdsCompletedOrder(id, value), false);
  }
  assert.equal(f.conversions().length, 0);
});

test('real homepage capture reaches the order attribution payload after clean navigation', () => {
  const f = fixture(null);
  const landing = 'https://getprpd.com/?utm_source=google&utm_medium=cpc&utm_campaign=homepage_fixture&utm_content=ad_fixture&utm_term=halal&gclid=fixture-click-only&matchtype=e&device=m&network=g';
  f.window.location = { href: landing, search: new URL(landing).search, pathname: '/' };
  vm.runInContext(funnel, f.context);
  f.window.location = { href: 'https://getprpd.com/order', search: '', pathname: '/order' };
  vm.runInContext('captureAttribution();', f.context);
  const payload = vm.runInContext('attributionPayload()', f.context);
  assert.equal(payload.landingPage, landing);
  assert.equal(payload.utmSource, 'google');
  assert.equal(payload.utmMedium, 'cpc');
  assert.equal(payload.utmCampaign, 'homepage_fixture');
  assert.equal(payload.utmContent, 'ad_fixture');
  assert.equal(payload.utmTerm, 'halal');
  assert.equal(payload.googleClickId, 'fixture-click-only');
  assert.equal(payload.googleClickIdType, 'gclid');
  assert.equal(payload.adMatchType, 'e');
  assert.equal(payload.adDevice, 'm');
  assert.equal(payload.adNetwork, 'g');
  assert.equal(f.requests.length, 0);
});
