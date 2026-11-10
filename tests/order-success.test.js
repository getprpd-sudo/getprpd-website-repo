const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');

test('order success screen directs customers to emailed payment information', () => {
  const html = fs.readFileSync(path.join(ROOT, 'order.html'), 'utf8');
  const app = fs.readFileSync(path.join(ROOT, 'order.js'), 'utf8');

  assert.match(html, /Check your email for your itemized receipt and Zelle instructions for payments@getprpd\.com\./);
  assert.match(app, /We emailed an itemized copy to \$\{email\}\. Check it for your Zelle instructions to payments@getprpd\.com\./);
  assert.match(app, /confirmation email could not be sent/);
});

test('ordering experience is meal-first and presents the approved public first-order discount', () => {
  const html = fs.readFileSync(path.join(ROOT, 'order.html'), 'utf8');
  const app = fs.readFileSync(path.join(ROOT, 'order.js'), 'utf8');

  assert.ok(html.indexOf('id="grid-breakfasts"') < html.indexOf('id="fullName"'));
  assert.ok(html.indexOf('id="grid-desserts"') < html.indexOf('id="checkout"'));
  assert.match(html, /100% halal/);
  assert.match(html, /Ordering essentials/);
  assert.match(html, /Give \$10\. Get \$10\./);
  assert.match(html, /\$10 off your first \$60\+ food order/);
  assert.match(html, /WELCOME10/);
  assert.match(html, /referral pilot is approved manually/i);
  assert.match(app, /Fresh photo coming soon/);
  assert.match(app, /dish-photo-overlay__brand/);
  assert.match(app, /photoOverlayHtml\(dish, section\)/);
  assert.match(app, /dish-name dish-name--sr/);
  assert.match(app, /handlePrimaryOrderAction/);
});

test('order page keeps secondary checkout fields collapsed and lets customers edit the cart summary', () => {
  const html = fs.readFileSync(path.join(ROOT, 'order.html'), 'utf8');
  const app = fs.readFileSync(path.join(ROOT, 'order.js'), 'utf8');
  const css = fs.readFileSync(path.join(ROOT, 'order.css'), 'utf8');

  assert.match(html, /<details class="checkout-optional-group" id="orderNotesGroup">/);
  assert.match(html, /<details class="checkout-optional-group" id="orderExtrasGroup">/);
  assert.match(html, /<details class="menu-planning-details">/);
  assert.match(html, /id="orderFeedback" role="alert" tabindex="-1" hidden/);
  assert.match(app, /class="summary-item-editor"/);
  assert.match(app, /class="summary-qty"/);
  assert.match(app, /mobileCartReview\.textContent = 'View order'/);
  assert.match(app, /function showOrderError\(/);
  assert.doesNotMatch(app, /\balert\(/);
  assert.match(css, /\.qty-btn \{ width:44px; height:44px; \}/);
  assert.match(css, /\.menu-filter-chip \{ flex:0 0 auto; min-height:44px; \}/);
});

test('Google Ads purchase tracking runs only after the order API confirms success', () => {
  const html = fs.readFileSync(path.join(ROOT, 'order.html'), 'utf8');
  const app = fs.readFileSync(path.join(ROOT, 'order.js'), 'utf8');
  const tracking = fs.readFileSync(path.join(ROOT, 'google-ads.js'), 'utf8');

  assert.match(html, /googletagmanager\.com\/gtag\/js\?id=AW-18371492048/);
  assert.match(html, /src="\/google-ads\.js"/);
  assert.match(html, /src="\/funnel-tracking\.js(?:\?[^\"]+)?"/);
  assert.match(app, /if \(!response\.ok \|\| !result \|\| result\.status !== 'success'\)/);
  assert.match(app, /trackGoogleAdsCompletedOrder\(result\.orderId \|\| orderId, confirmedTotal\)/);
  assert.match(tracking, /AW-18371492048\/yJOnCNeYzNwcENDxmrhE/);
  assert.match(tracking, /transaction_id: transactionId/);
});

test('Google Ads add-to-cart tracking sends the configured standard ecommerce event', () => {
  const app = fs.readFileSync(path.join(ROOT, 'order.js'), 'utf8');
  const tracking = fs.readFileSync(path.join(ROOT, 'google-ads.js'), 'utf8');

  assert.match(tracking, /trackGoogleAdsAddToCart/);
  assert.match(tracking, /gtag\('event', 'add_to_cart'/);
  assert.match(tracking, /item_id: itemId/);
  assert.match(tracking, /item_variant:/);
  assert.match(tracking, /value: price \* quantity/);
  assert.match(app, /addedQuantity > 0/);
  assert.match(app, /trackGoogleAdsAddToCart\(\{/);
  assert.match(app, /price: getPrice\(dish, effectiveTier\)/);
});

test('Google Ads inquiry tracking separates submitted leads from contact clicks', () => {
  const homepage = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const homepageApp = fs.readFileSync(path.join(ROOT, 'script.js'), 'utf8');
  const tracking = fs.readFileSync(path.join(ROOT, 'google-ads.js'), 'utf8');

  assert.match(homepage, /src="\/google-ads\.js"/);
  assert.match(homepageApp, /trackGoogleAdsCustomPlanInquiry\(result\.leadId \|\| data\.leadId\)/);
  assert.match(homepageApp, /trackPrpdFunnelEvent\('lead_submit'/);
  assert.match(tracking, /AW-18371492048\/vFfeCNHFq-McENDxmrhE/);
  assert.match(tracking, /AW-18371492048\/zO4UCJjct-McENDxmrhE/);
  assert.match(tracking, /href\.startsWith\('sms:'\)/);
  assert.match(tracking, /href\.startsWith\('mailto:'\)/);
  assert.match(tracking, /trackPrpdFunnelEvent\('contact_click'/);
  assert.match(tracking, /sessionStorage\.getItem\(sessionKey\)/);
});

test('Google Ads funnel stages are privacy-limited and tied to real order actions', () => {
  const homepage = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const order = fs.readFileSync(path.join(ROOT, 'order.html'), 'utf8');
  const app = fs.readFileSync(path.join(ROOT, 'order.js'), 'utf8');
  const tracking = fs.readFileSync(path.join(ROOT, 'funnel-tracking.js'), 'utf8');

  assert.match(homepage, /data-funnel-stage="homepage"/);
  assert.match(order, /data-funnel-stage="order"/);
  for (const event of ['cart_started', 'cart_restored', 'begin_checkout', 'checkout_blocked', 'fulfillment_selected', 'delivery_quote', 'delivery_blocked', 'promo_applied', 'promo_rejected', 'order_submit', 'order_error', 'purchase']) {
    assert.match(app, new RegExp(`trackPrpdFunnelEvent\\('${event}'`));
  }
  assert.match(tracking, /googleClickPresent/);
  assert.match(tracking, /isGoogleAcquisition\(\)/);
  assert.match(tracking, /hasCampaignAttribution\(\)/);
  for (const event of ['landing_engaged', 'menu_engaged', 'menu_filter', 'meal_engaged', 'social_proof_play', 'social_proof_complete']) {
    assert.match(tracking, new RegExp(`['\"]${event}['\"]`));
  }
  assert.match(app, /trackPrpdFunnelEvent\('menu_filter'/);
  assert.match(app, /trackPrpdFunnelEvent\('meal_engaged'/);
  assert.match(tracking, /storageSet\(key, bounded\)/);
  assert.match(tracking, /params\.get\('ref'\) \|\| params\.get\('promo'\)/);
  assert.match(tracking, /storageSet\('promo_code', normalizedReferral\)/);
  assert.match(tracking, /storageSet\('landing_page'/);
  assert.doesNotMatch(tracking, /firstName|lastName|phone|email|deliveryAddress|deliveryZip/);
});

test('active WELCOME10 offer is published with the approved terms and one-click checkout control', () => {
  const html = fs.readFileSync(path.join(ROOT, 'order.html'), 'utf8');
  const app = fs.readFileSync(path.join(ROOT, 'order.js'), 'utf8');
  const config = require('../config/order-config');

  const welcome = config.promotions.codes.find(promotion => promotion.code === 'WELCOME10');
  assert.deepEqual(welcome, {
    code: 'WELCOME10',
    partner: 'PRPD First-Order Acquisition',
    type: 'fixed',
    value: 10,
    maxDiscount: 10,
    minimumOrder: 60,
    firstOrderOnly: true,
    maxRedemptions: 50,
    active: true,
  });
  assert.match(html, /\$10 off your first \$60\+ food order/);
  assert.match(html, /One per customer or household/);
  assert.match(app, /applyWelcomeOffer/);
  assert.match(app, /WELCOME10 applied/);
  assert.match(app, /CART_STORAGE_KEY = `prpd_cart_b\$\{BATCH\.number\}`/);
});

test('Google Ads click attribution is retained for Sheets and owner email reporting', () => {
  const app = fs.readFileSync(path.join(ROOT, 'order.js'), 'utf8');
  const api = fs.readFileSync(path.join(ROOT, 'api', 'order.js'), 'utf8');

  assert.match(app, /GOOGLE_CLICK_KEYS = \['gclid', 'gbraid', 'wbraid'\]/);
  assert.match(app, /googleClickIdType/);
  assert.match(app, /adMatchType: read\('matchtype'\)/);
  assert.match(api, /'Google Click ID', 'Google Click ID Type', 'Ad Match Type', 'Ad Device', 'Ad Network'/);
  assert.match(api, /Acquisition: \$\{acquisition\}/);
  assert.match(api, /Google Ads \/ Search/);
  assert.match(api, /Customer-reported \/ \$\{order\.discoverySource\}/);
  assert.match(app, /discoverySource/);
});

test('homepage partner links preserve the referral code and campaign attribution for checkout', () => {
  const tracking = fs.readFileSync(path.join(ROOT, 'funnel-tracking.js'), 'utf8');
  const stored = new Map();
  const sessionStorage = {
    getItem: key => stored.get(key) || null,
    setItem: (key, value) => stored.set(key, String(value)),
  };
  const windowObject = {
    location: {
      search: '?ref=Z10&utm_source=instagram&utm_medium=partner&utm_campaign=zee_pilot&utm_content=story_week1',
      href: 'https://getprpd.com/?ref=Z10&utm_source=instagram&utm_medium=partner&utm_campaign=zee_pilot&utm_content=story_week1',
      pathname: '/',
    },
    sessionStorage,
    crypto: { getRandomValues: bytes => bytes.fill(1) },
    innerWidth: 390,
    fetch: () => Promise.resolve({ ok: true }),
  };
  const documentObject = {
    referrer: '',
    documentElement: { clientWidth: 390 },
    addEventListener: () => {},
  };

  vm.runInNewContext(tracking, { window: windowObject, document: documentObject, URLSearchParams });

  assert.equal(stored.get('promo_code'), 'Z10');
  assert.equal(stored.get('utm_source'), 'instagram');
  assert.equal(stored.get('utm_medium'), 'partner');
  assert.equal(stored.get('utm_campaign'), 'zee_pilot');
  assert.equal(stored.get('utm_content'), 'story_week1');
});
