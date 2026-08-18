const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const publicConfig = require('../config/order-config');
const config = require('../operations/active/BATCH_7_DRAFT_ORDER_CONFIG');
const orderApi = require('../api/order');

const dishes = Object.values(config.menu).flat();
const draftCatalog = orderApi._test.catalogForConfig(config);
const draftOrderContext = {
  catalog: draftCatalog,
  batchNumber: config.batch.number,
  // Order-pricing tests must remain deterministic after the real weekly cutoff.
  cutoffIso: '2099-12-31T23:59:59-06:00',
  policies: config.policies,
};

test('approved Batch 7 is published and owner-approved reminders are enabled', () => {
  assert.equal(publicConfig.batch.published, true);
  assert.equal(publicConfig.batch.remindersEnabled, true);
  assert.equal(publicConfig.batch.number, 7);
  assert.equal(publicConfig.batch.deliveryDate, 'Saturday, August 22, 2026');
  assert.equal(publicConfig.batch.cutoffIso, '2026-08-19T18:00:00-05:00');
  assert.equal(Object.values(publicConfig.menu).flat().length, 18);
  const publicConfigSource = fs.readFileSync(path.join(__dirname, '..', 'config', 'order-config.js'), 'utf8');
  assert.match(publicConfigSource, /Saturday, August 22, 2026/);
  assert.match(publicConfigSource, /Cajun Garlic Salmon/);
  assert.equal(orderApi._test.isMenuPublished(publicConfig), true);
  assert.equal(orderApi._test.isMenuPublished({ batch: { published: true } }), true);
  assert.equal(orderApi._test.isMenuPublished({ batch: {} }), false);
});

test('public order page hides every draft dish behind the publication gate', () => {
  const orderJs = fs.readFileSync(path.join(__dirname, '..', 'order.js'), 'utf8');
  assert.match(orderJs, /BATCH\.published === true/);
  assert.match(orderJs, /replaceChildren\(\)/);
  assert.match(orderJs, /if \(!IS_MENU_PUBLISHED\) return true/);
});

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
  assert.equal(config.promotions.remote, true);
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
    { id: 'b2', tier: 'lean', qty: 2 },
    { id: 'b2', tier: 'bulk', qty: 1 },
    { id: 'm6', tier: 'bulk', qty: 1 },
    { id: 'm8', tier: 'lean', qty: 1 },
    { id: 'd1', qty: 2 },
    { id: 'a1', qty: 1 },
  ], draftCatalog);

  assert.deepEqual(items.map(item => [item.id, item.tier, item.qty, item.subtotal]), [
    ['b2', 'lean', 2, 27.98],
    ['b2', 'bulk', 1, 15.99],
    ['m6', 'bulk', 1, 15.99],
    ['m8', 'lean', 1, 13.99],
    ['d1', 'single', 2, 13.98],
    ['a1', 'single', 1, 7.99],
  ]);
});

test('server combines duplicate lines and rejects unknown menu IDs', () => {
  const items = orderApi._test.normalizeItems([
    { id: 'm2', tier: 'lean', qty: 1 },
    { id: 'm2', tier: 'lean', qty: 2 },
  ], draftCatalog);
  assert.equal(items.length, 1);
  assert.equal(items[0].qty, 3);
  assert.throws(
    () => orderApi._test.normalizeItems([{ id: 'not-real', tier: 'lean', qty: 1 }], draftCatalog),
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
  assert.equal(orderApi._test.discountForPromotion({ ...promotion, minimumOrder: 80 }, 65.94), 0);
});

test('partner offers reject repeat households and stop at their configured redemption cap', async () => {
  const promotion = {
    code:'Z10', partner:'Athlete Partner', type:'fixed', value:10,
    firstOrderOnly:true, minimumOrder:60, maxRedemptions:2,
  };
  const order = {
    orderId:'PRPD-B7-20260817-ABCDEF12', email:'new@example.com', phone:'4695550199',
    fulfillmentMethod:'delivery', deliveryAddress:'123 Main Street', deliveryUnit:'Apt 4', deliveryZip:'75035',
  };
  const row = ({ id, email, phone, address, zip, code }) => {
    const values = Array(37).fill('');
    values[5] = phone; values[10] = id; values[11] = email;
    values[12] = address; values[14] = zip; values[18] = code;
    return values;
  };
  const clientFor = rows => ({ request: async () => ({ data:{ values:rows } }) });

  await assert.rejects(
    orderApi._test.assertReferralEligibility(clientFor([
      row({ id:'OLDER', email:'other@example.com', phone:'9725550100', address:'123 Main St, Apartment 4', zip:'75035', code:'' }),
    ]), order, promotion),
    /first PRPD order/i,
  );

  await assert.rejects(
    orderApi._test.assertReferralEligibility(clientFor([
      row({ id:'ONE', email:'one@example.com', phone:'9725550101', address:'1 First St', zip:'75001', code:'Z10' }),
      row({ id:'TWO', email:'two@example.com', phone:'9725550102', address:'2 Second St', zip:'75002', code:'z10' }),
    ]), { ...order, deliveryAddress:'999 New Road', deliveryUnit:'', deliveryZip:'75035' }, promotion),
    /redemption limit/i,
  );
});

test('server recalculates an approved discount and ignores client-submitted totals', () => {
  const promotion = { code: 'TEST15', partner: 'Test Partner', type: 'fixed', value: 15, active: true };
  const originalNow = Date.now;
  config.promotions.codes.push(promotion);
  Date.now = () => new Date('2026-07-21T12:00:00-05:00').getTime();

  try {
    const order = orderApi._test.validateAndBuildOrder({
      action: 'order',
      orderId: 'PRPD-B7-20260817-A1B2C3D4',
      firstName: 'Test',
      lastName: 'Customer',
      phone: '4695550100',
      email: 'customer@example.com',
      deliveryAddress: '123 Main Street',
      deliveryHasUnit: false,
      deliveryUnit: '',
      deliveryCity: 'Frisco',
      deliveryState: 'TX',
      deliveryZip: '75035',
      deliveryInstructions: '',
      items: [{ id: 'b2', tier: 'lean', qty: 6 }],
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
    }, config.promotions.codes, draftOrderContext);

    assert.equal(order.mealSubtotal, 83.94);
    assert.equal(order.deliveryFee, 9.99);
    assert.equal(order.deliveryZone, 'core');
    assert.equal(order.deliveryZoneLabel, 'Local Delivery');
    assert.equal(order.discountAmount, 15);
    assert.equal(order.exactTotal, 78.93);
    assert.equal(order.roundedTotal, 79);
    assert.equal(order.promoCode, 'TEST15');
    assert.equal(order.promotionPartner, 'Test Partner');
    assert.equal(order.menuEmailOptIn, true);
    assert.equal(order.utmSource, 'tiktok');
  } finally {
    Date.now = originalNow;
    config.promotions.codes.pop();
  }
});

test('server selects local, regional, or extended pricing by ZIP and rejects out-of-area ZIPs', () => {
  assert.deepEqual(orderApi._test.deliveryPolicyForZip('75035', config.policies), {
    id: 'core',
    label: 'Local Delivery',
    minimumOrder: 60,
    freeDeliveryThreshold: 85,
    deliveryFee: 9.99,
  });
  assert.deepEqual(orderApi._test.deliveryPolicyForZip('75063', config.policies), {
    id: 'regional',
    label: 'Regional Delivery',
    minimumOrder: 80,
    freeDeliveryThreshold: 125,
    deliveryFee: 12.99,
  });
  assert.deepEqual(orderApi._test.deliveryPolicyForZip('76107', config.policies), {
    id: 'extended',
    label: 'Extended Delivery',
    minimumOrder: 100,
    freeDeliveryThreshold: 150,
    deliveryFee: 14.99,
  });
  assert.equal(orderApi._test.deliveryPolicyForZip('77002', config.policies), null);
});

test('pickup is free, uses the approved lower food minimum, and never requires a delivery address', () => {
  assert.deepEqual(config.policies.deliveryZones.pickup, {
    id: 'pickup',
    label: 'Pickup',
    city: 'Frisco',
    state: 'TX',
    minimumOrder: 50,
    freeDeliveryThreshold: 50,
    deliveryFee: 0,
  });

  const order = orderApi._test.validateAndBuildOrder({
    action: 'order',
    orderId: 'PRPD-B7-20260817-A1B2C3D4',
    firstName: 'Pickup',
    lastName: 'Customer',
    phone: '9725550100',
    email: 'pickup@example.com',
    fulfillmentMethod: 'pickup',
    deliveryAddress: '',
    deliveryHasUnit: false,
    deliveryUnit: '',
    deliveryCity: '',
    deliveryState: '',
    deliveryZip: '',
    deliveryInstructions: 'Late afternoon works best.',
    items: [{ id: 'm2', tier: 'lean', qty: 6 }],
    promoCode: '',
    menuEmailOptIn: false,
    notes: '',
    website: '',
    formStartedAt: 1,
  }, [], draftOrderContext);

  assert.equal(order.fulfillmentMethod, 'pickup');
  assert.equal(order.deliveryZone, 'pickup');
  assert.equal(order.deliveryZoneLabel, 'Pickup');
  assert.equal(order.pickupCity, 'Frisco');
  assert.equal(order.pickupState, 'TX');
  assert.equal(order.deliveryFee, 0);
  assert.equal(order.mealSubtotal, 65.94);
  assert.equal(order.exactTotal, 65.94);
  assert.equal(order.roundedTotal, 66);
});

test('server enforces the extended minimum and applies its fee until the free-delivery threshold', () => {
  const payload = (qty, suffix) => ({
    action: 'order',
    orderId: `PRPD-B7-20260817-${suffix}`,
    firstName: 'Fort',
    lastName: 'Worth',
    phone: '8175550100',
    email: 'fortworth@example.com',
    deliveryAddress: '123 Main Street',
    deliveryHasUnit: false,
    deliveryUnit: '',
    deliveryCity: 'Fort Worth',
    deliveryState: 'TX',
    deliveryZip: '76107',
    deliveryInstructions: '',
    items: [{ id: 'b2', tier: 'lean', qty }],
    promoCode: '',
    menuEmailOptIn: false,
    notes: '',
    website: '',
    formStartedAt: 1,
  });

  assert.throws(
    () => orderApi._test.validateAndBuildOrder(payload(6, 'A1B2C3D4'), [], draftOrderContext),
    /\$100 Extended Delivery order minimum/i,
  );

  const paidDelivery = orderApi._test.validateAndBuildOrder(payload(8, 'B1C2D3E4'), [], draftOrderContext);
  assert.equal(paidDelivery.mealSubtotal, 111.92);
  assert.equal(paidDelivery.deliveryFee, 14.99);
  assert.equal(paidDelivery.exactTotal, 126.91);

  const freeDelivery = orderApi._test.validateAndBuildOrder(payload(11, 'C1D2E3F4'), [], draftOrderContext);
  assert.equal(freeDelivery.mealSubtotal, 153.89);
  assert.equal(freeDelivery.deliveryFee, 0);
  assert.equal(freeDelivery.exactTotal, 153.89);
});

test('server enforces the regional minimum and applies its fee until the regional free-delivery threshold', () => {
  const payload = (qty, suffix) => ({
    action: 'order',
    orderId: `PRPD-B7-20260817-${suffix}`,
    firstName: 'Regional',
    lastName: 'Customer',
    phone: '9725550100',
    email: 'regional@example.com',
    deliveryAddress: '123 Main Street',
    deliveryHasUnit: false,
    deliveryUnit: '',
    deliveryCity: 'Irving',
    deliveryState: 'TX',
    deliveryZip: '75063',
    deliveryInstructions: '',
    items: [{ id: 'b2', tier: 'lean', qty }],
    promoCode: '',
    menuEmailOptIn: false,
    notes: '',
    website: '',
    formStartedAt: 1,
  });

  assert.throws(
    () => orderApi._test.validateAndBuildOrder(payload(5, 'D1E2F3A4'), [], draftOrderContext),
    /\$80 Regional Delivery order minimum/i,
  );

  const paidDelivery = orderApi._test.validateAndBuildOrder(payload(6, 'E1F2A3B4'), [], draftOrderContext);
  assert.equal(paidDelivery.mealSubtotal, 83.94);
  assert.equal(paidDelivery.deliveryFee, 12.99);
  assert.equal(paidDelivery.exactTotal, 96.93);

  const freeDelivery = orderApi._test.validateAndBuildOrder(payload(9, 'F1A2B3C4'), [], draftOrderContext);
  assert.equal(freeDelivery.mealSubtotal, 125.91);
  assert.equal(freeDelivery.deliveryFee, 0);
  assert.equal(freeDelivery.exactTotal, 125.91);
});

test('local delivery stays $9.99 below $85 and becomes free at the approved $85 threshold', () => {
  const payload = (qty, suffix) => ({
    action: 'order',
    orderId: `PRPD-B7-20260817-${suffix}`,
    firstName: 'Local',
    lastName: 'Customer',
    phone: '9725550100',
    email: 'local@example.com',
    deliveryAddress: '123 Main Street',
    deliveryHasUnit: false,
    deliveryUnit: '',
    deliveryCity: 'Frisco',
    deliveryState: 'TX',
    deliveryZip: '75035',
    deliveryInstructions: '',
    items: [{ id: 'm2', tier: 'lean', qty }],
    promoCode: '',
    menuEmailOptIn: false,
    notes: '',
    website: '',
    formStartedAt: 1,
  });

  const paidDelivery = orderApi._test.validateAndBuildOrder(payload(7, 'A5B6C7D8'), [], draftOrderContext);
  assert.equal(paidDelivery.mealSubtotal, 76.93);
  assert.equal(paidDelivery.deliveryFee, 9.99);
  assert.equal(paidDelivery.exactTotal, 86.92);

  const freeDelivery = orderApi._test.validateAndBuildOrder(payload(8, 'B6C7D8E9'), [], draftOrderContext);
  assert.equal(freeDelivery.mealSubtotal, 87.92);
  assert.equal(freeDelivery.deliveryFee, 0);
  assert.equal(freeDelivery.exactTotal, 87.92);
});

test('server accepts new references and rejects other-batch references', () => {
  assert.equal(orderApi._test.isValidOrderId('PRPD-B7-20260817-A4F2C91D', 7), true);
  assert.equal(orderApi._test.isValidOrderId('PRPD-B7-20260817-A4F2', 7), true);
  assert.equal(orderApi._test.isValidOrderId('PRPD-B6-20260817-A4F2C91D', 7), false);
  assert.equal(orderApi._test.isValidOrderId('PRPD-B7-20260817-NOTHEX99', 7), false);
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
  for (const field of ['firstName', 'lastName', 'phone', 'email', 'deliveryAddress', 'deliveryCity', 'deliveryState', 'deliveryZip']) {
    assert.match(orderHtml, new RegExp(`id="${field}"[^>]*required`));
    assert.match(orderJs, new RegExp(`\\b${field},`));
  }
  assert.match(orderHtml, /id="deliveryHasUnit"/);
  assert.match(orderJs, /deliveryUnitInput\.required = hasUnit/);
  assert.match(orderHtml, /id="deliveryUnit"[^>]*autocomplete="address-line2"/);
  assert.doesNotMatch(orderHtml, /id="deliveryUnit"[^>]*required/);
  assert.match(orderJs, /customerConfirmationSent/);
  assert.match(orderJs, /emailed an itemized copy/i);
  assert.match(orderHtml, /data-fulfillment="delivery"/);
  assert.match(orderHtml, /data-fulfillment="pickup"/);
  assert.match(orderHtml, /Free pickup in Frisco, Texas/);
  assert.match(orderHtml, /lower \$50 food minimum/);
  assert.match(orderJs, /fulfillmentMethod: selectedFulfillment/);
  assert.match(orderJs, /field\.required = !pickup/);
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

  assert.equal(dishes.find(dish => dish.name === 'PRPD Beef Bacon Breakfast Sandwich').image, '/assets/images/meals/menu/batch-6-2026-08-15/prpd-beef-bacon-breakfast-sandwich.webp');
  assert.equal(dishes.find(dish => dish.name === 'Loaded Buffalo Chicken Potato').image, '/assets/images/meals/menu/loaded-buffalo-chicken-potato.jpg');
});

test('Batch 7 menu uses the approved rotation and reconciled nutrition', () => {
  assert.equal(config.batch.number, 7);
  assert.equal(config.batch.deliveryDate, 'Saturday, August 22, 2026');
  assert.equal(config.batch.cutoffIso, '2026-08-19T18:00:00-05:00');

  const names = dishes.map(dish => dish.name);
  assert.equal(names.includes('Butter Chicken'), true);
  assert.equal(names.includes('PRPD Beef Bacon Breakfast Sandwich'), true);
  assert.equal(names.includes('Cheeseburger Hot Pockets'), false);
  assert.equal(names.includes('Strawberry Cheesecake'), false);
  assert.equal(names.includes('Chicken Biryani'), true);
  assert.equal(names.includes('French Toast'), false);
  assert.equal(names.includes('Breakfast Quesadilla'), false);
  assert.equal(names.includes('Loaded Beef Cottage Pie'), false);
  assert.equal(names.includes('Harissa Honey Chicken'), false);
  assert.equal(names.includes('Korean Bulgogi Beef Bowl'), false);
  assert.equal(names.includes('Southwest Beef Taco Bowl'), true);
  assert.equal(names.includes('Cajun Garlic Salmon'), true);
  assert.equal(names.includes('Chicken Caesar Crunch Box'), true);
  assert.equal(dishes.find(dish => dish.name === 'Meatball Arrabbiata Pasta').displayCategory, 'Beef');
  assert.equal(dishes.find(dish => dish.name === 'Southwest Beef Taco Bowl').displayCategory, 'Beef');
  assert.equal(dishes.find(dish => dish.name === 'Cajun Garlic Salmon').displayCategory, 'Seafood');

  assert.deepEqual(dishes.find(dish => dish.name === 'PRPD Beef Bacon Breakfast Sandwich').macros, { cal: 600, protein: 36, carbs: 70, fiber: 4, fat: 20 });
  assert.deepEqual(dishes.find(dish => dish.name === 'Cajun Garlic Salmon').macros, { cal: 540, protein: 55, carbs: 45, fiber: 8, fat: 17 });
  assert.deepEqual(dishes.find(dish => dish.name === 'Southwest Beef Taco Bowl').macros, { cal: 635, protein: 50, carbs: 59, fiber: 7, fat: 22 });
  assert.deepEqual(dishes.find(dish => dish.name === 'Chicken Caesar Crunch Box').macros, { cal: 380, protein: 39, carbs: 18, fiber: 2, fat: 16 });
  for (const name of ['PRPD Beef Bacon Breakfast Sandwich', 'Power Bowl']) {
    assert.match(dishes.find(dish => dish.name === name).description, /PRPD Sweet Heat (?:sauce|cup)/);
  }
  const wrap = dishes.find(dish => dish.name === 'Mini Chicken Snack Wrap');
  assert.deepEqual(wrap.macros, { cal: 325, protein: 41, carbs: 29, fiber: 23, fat: 13 });
  assert.equal(wrap.price, 7.99);
  assert.equal(wrap.laterWeek, undefined);
  assert.doesNotMatch(wrap.description, /pickle/i);
  assert.match(wrap.description, /Two high-fiber tortillas/);
  assert.equal(dishes.some(dish => dish.nutritionReview === true), false);
});

test('mobile menu surfaces the retained Grab & Go add-on early', () => {
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

  assert.deepEqual(config.menu.addons.map(item => item.name), ['PRPD Protein Box', 'Mini Chicken Snack Wrap', 'Chicken Caesar Crunch Box']);
});

test('order page provides menu filters and a minimum-aware sticky mobile cart', () => {
  const orderHtml = fs.readFileSync(path.join(__dirname, '..', 'order.html'), 'utf8');
  const orderJs = fs.readFileSync(path.join(__dirname, '..', 'order.js'), 'utf8');
  const orderCss = fs.readFileSync(path.join(__dirname, '..', 'order.css'), 'utf8');

  for (const filter of ['all', 'lean-high-protein', 'lean-under-550', 'bulk-high-protein', 'freezer']) {
    assert.match(orderHtml, new RegExp(`data-menu-filter="${filter}"`));
  }
  assert.match(orderJs, /function initMenuFilters\(\)/);
  assert.match(orderJs, /dish\.macros\?\.protein\) >= 50/);
  assert.match(orderJs, /dish\.macros\?\.cal\) < 550/);
  assert.match(orderJs, /dish\.bulkMacros\?\.protein\) >= 65/);
  assert.match(orderHtml, /id="mobileCartStatus"/);
  assert.match(orderJs, /to free delivery/);
  assert.match(orderJs, /Free delivery unlocked/);
  assert.match(orderJs, /\/api\/delivery-quote\?zip=/);
  assert.match(orderHtml, /\$9\.99 local · \$12\.99 regional · \$14\.99 extended/);
  assert.match(orderHtml, /Local delivery<\/strong> \$60 order minimum · \$9\.99 · free at \$85/);
  assert.match(orderJs, /\$9\.99 local · \$12\.99 regional · \$14\.99 extended/);
  assert.match(orderCss, /\.order-layout > aside \{ align-self: stretch; \}/);
  assert.match(orderCss, /max-height: calc\(100vh - var\(--banner-h\) - 112px\)/);
  assert.match(orderCss, /\.menu-filter-chip\.is-active/);
  assert.match(orderHtml, /Fresh menu Monday/);
  assert.equal((orderHtml.match(/order-trust-strip[\s\S]*?<\/div>/) || [''])[0].match(/<span>/g)?.length, 6);
  assert.match(orderHtml, /id="phoneReviewNote"/);
  assert.match(orderHtml, /id="phoneReviewConfirmed"/);
  assert.match(orderJs, /phoneNeedsReview && !phoneReviewConfirmed\?\.checked/);
  assert.match(orderCss, /overflow-x: hidden/);
  assert.match(orderCss, /grid-template-columns: minmax\(0, \.82fr\) minmax\(0, 1\.18fr\)/);
});
