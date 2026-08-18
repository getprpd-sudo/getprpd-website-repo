const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const ROOT = path.join(__dirname, '..');

test('order success screen directs customers to emailed payment information', () => {
  const html = fs.readFileSync(path.join(ROOT, 'order.html'), 'utf8');
  const app = fs.readFileSync(path.join(ROOT, 'order.js'), 'utf8');

  assert.match(html, /Check your email for your itemized receipt and Zelle instructions for payments@getprpd\.com\./);
  assert.match(app, /We emailed an itemized copy to \$\{email\}\. Check it for your Zelle instructions to payments@getprpd\.com\./);
  assert.match(app, /confirmation email could not be sent/);
});

test('ordering experience is meal-first and explains the referral pilot', () => {
  const html = fs.readFileSync(path.join(ROOT, 'order.html'), 'utf8');
  const app = fs.readFileSync(path.join(ROOT, 'order.js'), 'utf8');

  assert.ok(html.indexOf('id="grid-breakfasts"') < html.indexOf('id="firstName"'));
  assert.ok(html.indexOf('id="grid-desserts"') < html.indexOf('id="checkout"'));
  assert.match(html, /100% halal/);
  assert.match(html, /Ordering &amp; delivery at a glance/);
  assert.match(html, /Give \$10\. Get \$10\./);
  assert.match(html, /Get \$10 off your first order/);
  assert.match(html, /referral pilot is approved manually/i);
  assert.match(app, /Fresh photo coming soon/);
  assert.match(app, /dish-photo-overlay__brand/);
  assert.match(app, /photoOverlayHtml\(dish, section\)/);
  assert.match(app, /dish-name dish-name--sr/);
  assert.match(app, /handlePrimaryOrderAction/);
});

test('Google Ads purchase tracking runs only after the order API confirms success', () => {
  const html = fs.readFileSync(path.join(ROOT, 'order.html'), 'utf8');
  const app = fs.readFileSync(path.join(ROOT, 'order.js'), 'utf8');
  const tracking = fs.readFileSync(path.join(ROOT, 'google-ads.js'), 'utf8');

  assert.match(html, /googletagmanager\.com\/gtag\/js\?id=AW-18371492048/);
  assert.match(html, /src="\/google-ads\.js"/);
  assert.match(html, /src="\/funnel-tracking\.js"/);
  assert.match(app, /if \(!response\.ok \|\| !result \|\| result\.status !== 'success'\)/);
  assert.match(app, /trackGoogleAdsCompletedOrder\(result\.orderId \|\| orderId, confirmedTotal\)/);
  assert.match(tracking, /AW-18371492048\/yJOnCNeYzNwcENDxmrhE/);
  assert.match(tracking, /transaction_id: transactionId/);
});

test('Google Ads inquiry tracking separates submitted leads from contact clicks', () => {
  const homepage = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const homepageApp = fs.readFileSync(path.join(ROOT, 'script.js'), 'utf8');
  const tracking = fs.readFileSync(path.join(ROOT, 'google-ads.js'), 'utf8');

  assert.match(homepage, /src="\/google-ads\.js"/);
  assert.match(homepageApp, /trackGoogleAdsCustomPlanInquiry\(result\.leadId \|\| data\.leadId\)/);
  assert.match(tracking, /AW-18371492048\/vFfeCNHFq-McENDxmrhE/);
  assert.match(tracking, /AW-18371492048\/zO4UCJjct-McENDxmrhE/);
  assert.match(tracking, /href\.startsWith\('sms:'\)/);
  assert.match(tracking, /href\.startsWith\('mailto:'\)/);
  assert.match(tracking, /sessionStorage\.getItem\(sessionKey\)/);
});

test('Google Ads funnel stages are privacy-limited and tied to real order actions', () => {
  const homepage = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const order = fs.readFileSync(path.join(ROOT, 'order.html'), 'utf8');
  const app = fs.readFileSync(path.join(ROOT, 'order.js'), 'utf8');
  const tracking = fs.readFileSync(path.join(ROOT, 'funnel-tracking.js'), 'utf8');

  assert.match(homepage, /data-funnel-stage="homepage"/);
  assert.match(order, /data-funnel-stage="order"/);
  for (const event of ['cart_started', 'begin_checkout', 'delivery_quote', 'order_submit', 'order_error', 'purchase']) {
    assert.match(app, new RegExp(`trackPrpdFunnelEvent\\('${event}'`));
  }
  assert.match(tracking, /googleClickPresent/);
  assert.match(tracking, /isGoogleAcquisition\(\)/);
  assert.match(tracking, /storageSet\(key, bounded\)/);
  assert.match(tracking, /storageSet\('landing_page'/);
  assert.doesNotMatch(tracking, /firstName|lastName|phone|email|deliveryAddress|deliveryZip/);
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
});
