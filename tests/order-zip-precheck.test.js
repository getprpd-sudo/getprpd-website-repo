const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'order.html'), 'utf8');
const app = fs.readFileSync(path.join(ROOT, 'order.js'), 'utf8');
const home = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

test('order flow asks for ZIP before presenting a final total', () => {
  assert.match(html, /id="earlyDeliveryZip"/);
  assert.match(html, /Check your delivery ZIP/);
  assert.match(html, /We reuse it at checkout/);
  assert.match(html, /id="summaryTotalLabel"/);
  assert.match(app, /: 'Enter ZIP';/);
  assert.doesNotMatch(app, /'From \$' \+ roundedTotal/);
});

test('early and checkout ZIP fields stay synchronized', () => {
  assert.match(app, /syncDeliveryZip\(deliveryZipInput, earlyDeliveryZipInput\)/);
  assert.match(app, /syncDeliveryZip\(earlyDeliveryZipInput, deliveryZipInput\)/);
  assert.match(app, /deliveryPolicyForZip\(zip\)/);
});

test('homepage no longer denies the weekly menu rotation', () => {
  assert.doesNotMatch(home, /Not a menu rotation/);
  assert.match(home, /A fresh weekly menu with the flexibility to order your way/);
});
