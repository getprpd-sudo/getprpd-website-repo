const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const config = require('../config/order-config');
const orderApi = require('../api/order');

const dishes = Object.values(config.menu).flat();

test('weekly order config has unique, server-priceable dishes', () => {
  const ids = dishes.map(dish => dish.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(dishes.length > 0);

  for (const dish of dishes) {
    assert.ok(dish.name);
    assert.ok(config.prices[dish.category]);
    assert.ok(Number.isFinite(dish.macros.cal));
    assert.ok(Number.isFinite(dish.macros.protein));

    if (dish.category === 'dessert' || dish.category === 'addon') {
      assert.ok(Number.isFinite(dish.price ?? config.prices[dish.category].single));
    } else {
      assert.ok(Number.isFinite(config.prices[dish.category].lean));
      assert.ok(Number.isFinite(config.prices[dish.category].bulk));
      assert.ok(dish.bulkMacros);
    }
  }
});

test('configured promotions use an auditable server-compatible shape', () => {
  assert.ok(Array.isArray(config.promotions.codes));
  const seen = new Set();
  for (const promotion of config.promotions.codes) {
    const code = orderApi._test.normalizePromoCode(promotion.code);
    assert.ok(code);
    assert.equal(seen.has(code), false, `duplicate promotion code ${code}`);
    seen.add(code);
    assert.ok(promotion.partner);
    assert.ok(['fixed', 'percent'].includes(promotion.type));
    assert.ok(Number(promotion.value) > 0);
  }
});

test('weekly config remains valid UTF-8 text', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'config', 'order-config.js'), 'utf8');
  assert.doesNotMatch(source, /\uFFFD/);
  assert.doesNotMatch(source, /Ã|â|Â/);
});

test('later-week menu guidance is driven by explicit meal flags', () => {
  const laterWeek = dishes.filter(dish => dish.laterWeek);
  assert.ok(laterWeek.length > 0);
  const orderHtml = fs.readFileSync(path.join(__dirname, '..', 'order.html'), 'utf8');
  const orderJs = fs.readFileSync(path.join(__dirname, '..', 'order.js'), 'utf8');
  assert.match(orderHtml, /Freezer-friendly/);
  assert.match(orderJs, /dish\.laterWeek/);
});

test('server totals tiered meals, desserts, and add-ons from shared prices', () => {
  const items = orderApi._test.normalizeItems([
    { id: 'b1', tier: 'lean', qty: 2 },
    { id: 'b1', tier: 'bulk', qty: 1 },
    { id: 'm6', tier: 'bulk', qty: 1 },
    { id: 'm8', tier: 'lean', qty: 1 },
    { id: 'd1', qty: 2 },
    { id: 'a1', qty: 1 },
    { id: 'a2', tier: 'single', qty: 1 },
  ]);

  assert.deepEqual(items.map(item => [item.id, item.tier, item.qty, item.subtotal]), [
    ['b1', 'lean', 2, 21.98],
    ['b1', 'bulk', 1, 12.99],
    ['m6', 'bulk', 1, 15.99],
    ['m8', 'lean', 1, 13.99],
    ['d1', 'single', 2, 13.98],
    ['a1', 'single', 1, 7.99],
    ['a2', 'single', 1, 7.99],
  ]);
});

test('server combines duplicate lines and rejects unknown menu IDs', () => {
  const items = orderApi._test.normalizeItems([
    { id: 'm2', tier: 'lean', qty: 1 },
    { id: 'm2', tier: 'lean', qty: 2 },
  ]);
  assert.equal(items.length, 1);
  assert.equal(items[0].qty, 3);
  assert.throws(
    () => orderApi._test.normalizeItems([{ id: 'not-real', tier: 'lean', qty: 1 }]),
    /unknown menu item/i,
  );
});

test('partner discounts are normalized, capped, and resolved only from approved config', () => {
  const promotion = { code: 'SANA15', partner: 'Sana', type: 'fixed', value: 15, active: true };
  assert.equal(orderApi._test.normalizePromoCode(' sana 15!! '), 'SANA15');
  assert.equal(orderApi._test.promotionForCode('sana15', [promotion]), promotion);
  assert.equal(orderApi._test.promotionForCode('unknown', [promotion]), null);
  assert.equal(orderApi._test.discountForPromotion(promotion, 65.94), 15);
  assert.equal(orderApi._test.discountForPromotion({ ...promotion, type: 'percent', value: 25, maxDiscount: 10 }, 65.94), 10);
});

test('server recalculates an approved discount and ignores client-submitted totals', () => {
  const promotion = { code: 'TEST15', partner: 'Test Partner', type: 'fixed', value: 15, active: true };
  const originalNow = Date.now;
  config.promotions.codes.push(promotion);
  Date.now = () => new Date('2026-07-21T12:00:00-05:00').getTime();

  try {
    const order = orderApi._test.validateAndBuildOrder({
      action: 'order',
      orderId: 'PRPD-B5-20260803-A1B2C3D4',
      firstName: 'Test',
      lastName: 'Customer',
      phone: '4695550100',
      email: 'customer@example.com',
      deliveryAddress: '123 Main Street',
      deliveryCity: 'Frisco',
      deliveryZip: '75035',
      deliveryInstructions: '',
      items: [{ id: 'b1', tier: 'lean', qty: 6 }],
      mealSubtotal: 1,
      deliveryFee: 0,
      exactTotal: 1,
      total: 1,
      promoCode: 'test15',
      discountAmount: 999,
      menuEmailOptIn: true,
      notes: '',
      submittedAt: '',
      website: '',
      formStartedAt: 1,
      utmSource: 'tiktok',
      utmMedium: 'paid',
      utmCampaign: 'batch-4',
      utmContent: 'creator-a',
      utmTerm: '',
      landingPage: 'https://getprpd.com/order?ref=TEST15',
      referrer: 'https://www.tiktok.com/',
      tiktokTtclid: 'test-click-id',
      tiktokTtp: 'test-browser-id',
    });

    assert.equal(order.mealSubtotal, 65.94);
    assert.equal(order.deliveryFee, 6.99);
    assert.equal(order.discountAmount, 15);
    assert.equal(order.exactTotal, 57.93);
    assert.equal(order.roundedTotal, 58);
    assert.equal(order.promoCode, 'TEST15');
    assert.equal(order.promotionPartner, 'Test Partner');
    assert.equal(order.menuEmailOptIn, true);
    assert.equal(order.utmSource, 'tiktok');
  } finally {
    Date.now = originalNow;
    config.promotions.codes.pop();
  }
});

test('server accepts new references and rejects other-batch references', () => {
  assert.equal(orderApi._test.isValidOrderId('PRPD-B5-20260803-A4F2C91D'), true);
  assert.equal(orderApi._test.isValidOrderId('PRPD-B5-20260803-A4F2'), true);
  assert.equal(orderApi._test.isValidOrderId('PRPD-B4-20260803-A4F2C91D'), false);
  assert.equal(orderApi._test.isValidOrderId('PRPD-B5-20260803-NOTHEX99'), false);
});

test('premium steak is counted with beef and seafood in the payment log', () => {
  assert.deepEqual(orderApi._test.paymentCounts([
    { category: 'standard', qty: 2 },
    { category: 'premium', qty: 1 },
    { category: 'dessert', qty: 1 },
  ]), { standard: 2, beef: 1, dessert: 1 });
});

test('order page consumes the shared config instead of duplicating it', () => {
  const orderHtml = fs.readFileSync(path.join(__dirname, '..', 'order.html'), 'utf8');
  assert.match(orderHtml, /<script src="\/config\/order-config\.js"><\/script>/);
  assert.doesNotMatch(orderHtml, /const MENU\s*=\s*\{/);
  assert.doesNotMatch(orderHtml, /const BATCH\s*=\s*\{/);
});

test('public order form collects delivery details and requests an emailed confirmation', () => {
  const orderHtml = fs.readFileSync(path.join(__dirname, '..', 'order.html'), 'utf8');
  const orderJs = fs.readFileSync(path.join(__dirname, '..', 'order.js'), 'utf8');
  for (const field of ['email', 'deliveryAddress', 'deliveryCity', 'deliveryZip']) {
    assert.match(orderHtml, new RegExp(`id="${field}"[^>]*required`));
    assert.match(orderJs, new RegExp(`\\b${field},`));
  }
  assert.match(orderJs, /customerConfirmationSent/);
  assert.match(orderJs, /emailed an itemized copy/i);
});

test('public order form captures referral attribution and explicit menu-email consent', () => {
  const orderHtml = fs.readFileSync(path.join(__dirname, '..', 'order.html'), 'utf8');
  const orderJs = fs.readFileSync(path.join(__dirname, '..', 'order.js'), 'utf8');
  assert.match(orderHtml, /id="promoCode"/);
  assert.match(orderHtml, /id="menuEmailOptIn"/);
  assert.doesNotMatch(orderHtml, /id="menuEmailOptIn"[^>]*checked/i);
  assert.match(orderJs, /utmSource/);
  assert.match(orderJs, /captureAttribution/);
  assert.match(orderJs, /PlaceAnOrder/);
  assert.match(orderJs, /discountAmount/);
});

test('configured menu photos exist and each dish uses one canonical image', () => {
  const projectRoot = path.join(__dirname, '..');
  for (const dish of dishes) {
    assert.equal(dish.images, undefined, `${dish.name} does not switch photos by tier`);
    const sources = [dish.image].filter(Boolean);
    for (const source of sources) {
      assert.ok(source.startsWith('/assets/'), `${dish.name} uses a local asset path`);
      const assetPath = new URL(source, 'https://getprpd.com').pathname;
      assert.ok(fs.existsSync(path.join(projectRoot, assetPath.slice(1))), `${source} exists`);
    }
  }

  const orderSource = [
    fs.readFileSync(path.join(projectRoot, 'order.html'), 'utf8'),
    fs.readFileSync(path.join(projectRoot, 'order.js'), 'utf8'),
  ].join('\n');
  assert.doesNotMatch(orderSource, /photo-tier-switch/);
  assert.doesNotMatch(orderSource, /setDishPhoto/);
  assert.doesNotMatch(orderSource, /hasTierPhotos/);
  assert.match(orderSource, /data-order-tier/);
  assert.match(orderSource, /Freezer-friendly/);
  assert.doesNotMatch(orderSource, /Better later in the week/);

  const steak = dishes.find(dish => dish.name === 'Premium NY Strip Steak');
  assert.equal(steak.image, '/assets/images/meals/menu/premium-ny-strip-steak-bulk.jpg');
  assert.equal(dishes.find(dish => dish.name === 'Halal Cart Chicken + Yellow Rice').imageTone, 'soft');
});

test('Batch 5 menu uses the approved rotation and Grab & Go nutrition', () => {
  assert.equal(config.batch.number, 5);
  assert.equal(config.batch.deliveryDate, 'Saturday, August 8, 2026');

  const names = dishes.map(dish => dish.name);
  assert.equal(names.includes('Butter Chicken'), false);
  assert.equal(names.includes('PRPD Beef Bacon Breakfast Sandwich'), true);
  assert.equal(names.includes('Loaded Beef Cottage Pie'), true);
  assert.equal(names.includes('Blackened Tilapia with Garlic Potatoes'), true);
  assert.equal(dishes.find(dish => dish.name === 'Blackened Tilapia with Garlic Potatoes').category, 'beef');

  const proteinBox = dishes.find(dish => dish.name === 'PRPD Protein Box');
  assert.deepEqual(proteinBox.macros, { cal: 370, protein: 29, carbs: 19, fiber: 3, fat: 20 });
  assert.equal(proteinBox.price, 7.99);
  assert.doesNotMatch(proteinBox.description, /halal beef breakfast slices/i);
  assert.doesNotMatch(dishes.find(dish => dish.name === 'PRPD Beef Bacon Breakfast Sandwich').description, /^Halal\b/i);
  const wrap = dishes.find(dish => dish.name === 'Mini Chicken Snack Wrap');
  assert.deepEqual(wrap.macros, { cal: 305, protein: 39, carbs: 23, fiber: 16, fat: 12 });
  assert.equal(wrap.price, 7.99);
  assert.equal(wrap.laterWeek, undefined);
  assert.equal(dishes.some(dish => dish.nutritionReview === true), false);
});

test('mobile menu surfaces Grab & Go early and uses the approved protein-box wording', () => {
  const orderHtml = fs.readFileSync(path.join(__dirname, '..', 'order.html'), 'utf8');
  const orderJs = fs.readFileSync(path.join(__dirname, '..', 'order.js'), 'utf8');
  const breakfastPosition = orderHtml.indexOf('id="menu-breakfasts"');
  const addonPosition = orderHtml.indexOf('id="menu-addons"');
  const mainsPosition = orderHtml.indexOf('id="menu-mains"');

  assert.ok(breakfastPosition < addonPosition);
  assert.ok(addonPosition < mainsPosition);
  assert.match(orderHtml, /Grab &amp; Go <span>New<\/span>/);
  assert.match(orderJs, /IntersectionObserver/);
  assert.match(orderJs, /\['breakfasts', 'addons', 'mains', 'desserts'\]/);

  const proteinBox = dishes.find(dish => dish.name === 'PRPD Protein Box');
  assert.match(proteinBox.description, /beef breakfast slices/);
  assert.doesNotMatch(proteinBox.description, /halal beef breakfast slices/i);
});
