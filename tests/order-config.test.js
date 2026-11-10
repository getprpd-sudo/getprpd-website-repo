const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const publicConfig = require('../config/order-config');
const config = publicConfig;
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

test('approved Batch 14 is published with reminders disabled after the approved send', () => {
  assert.equal(publicConfig.batch.published, true);
  assert.equal(publicConfig.batch.remindersEnabled, false);
  assert.equal(publicConfig.batch.number, 14);
  assert.equal(publicConfig.batch.deliveryDate, 'Saturday, October 10, 2026');
  assert.equal(publicConfig.batch.cutoffIso, '2026-10-07T18:00:00-05:00');
  assert.equal(Object.values(publicConfig.menu).flat().length, 18);
  const publicConfigSource = fs.readFileSync(path.join(__dirname, '..', 'config', 'order-config.js'), 'utf8');
  assert.match(publicConfigSource, /Saturday, October 10, 2026/);
  assert.match(publicConfigSource, /Egg Bites with Potato Hash/);
  assert.equal(orderApi._test.isMenuPublished(publicConfig), true);
  assert.equal(orderApi._test.isMenuPublished({ batch: { published: true } }), true);
  assert.equal(orderApi._test.isMenuPublished({ batch: {} }), false);
});

test('weekly exclusive grid keeps its full-width layout override', () => {
  const orderCss = fs.readFileSync(path.join(__dirname, '..', 'order.css'), 'utf8');
  assert.match(orderCss, /\.dish-grid\.dish-grid--exclusive\s*\{\s*grid-template-columns:\s*minmax\(0,\s*1fr\);\s*\}/);
});

test('Batch 14 uses exact-dish photos for steak, Mediterranean chicken, and Tikka wrap', () => {
  const byId = new Map(dishes.map(dish => [dish.id, dish]));
  assert.equal(byId.get('m7').image, '/assets/images/meals/menu/batch-13-2026-10-03/premium-ny-strip-steak-mashed-potatoes-batch-13.jpg');
  assert.equal(byId.get('m7').imageCrop, 'landscape-tight');
  assert.equal(byId.get('m6').image, '/assets/images/meals/menu/batch-8-2026-08-29/mediterranean-chicken-bowl.webp');
  assert.equal(byId.get('a1').image, '/assets/images/meals/menu/batch-13-2026-10-03/chicken-tikka-snack-wrap-batch-13.jpg');
  assert.equal(byId.get('a1').imageCrop, 'landscape-tikka-close');
});

test('planner ignores checkout discount rows instead of flagging them as food', () => {
  const core = require('../operations/cook-day-core');
  const parsed = core.parseItemsText([
    '1x Mexican Streetcorn Chicken Bowl (Lean) - $10.99',
    'Delivery (Local Delivery) - Free',
    'Partner discount (WELCOME10) - -$10.00',
  ].join('\n'), config);
  assert.deepEqual(parsed.warnings, []);
  assert.deepEqual(parsed.items.map(item => [item.id, item.tier, item.qty]), [['m1', 'lean', 1]]);
});

test('Batch 14 planner keeps the Weekly Five and Nouman custom meals distinct', () => {
  const core = require('../operations/cook-day-core');
  const parsed = core.parseItemsText([
    '1x Weekly Five: Mediterranean + Shakshuka (3 Mediterranean + 2 Shakshuka)',
    '2x Mexican Streetcorn Chicken Bowl (Lean)',
    '2x Tandoori Chicken (Lean)',
    '3x Custom Lebanese Chicken + Fattoush-Style Salad (Lean)',
    '3x High-Protein Beef Kofta & Roasted Vegetables (Lean)',
  ].join('\n'), config);

  assert.deepEqual(parsed.warnings, []);
  assert.deepEqual(parsed.items.map(item => [item.id, item.tier, item.qty]), [
    ['m6', 'lean', 3],
    ['bw1', 'lean', 2],
    ['m1', 'lean', 2],
    ['m5', 'lean', 2],
    ['p3', 'lean', 3],
    ['p1', 'lean', 3],
  ]);
  assert.equal(parsed.items.reduce((sum, item) => sum + item.qty, 0), 15);
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
    if (Array.isArray(dish.variants) && dish.variants.length) {
      assert.ok(Number.isFinite(dish.price));
      assert.ok(dish.variants.every(variant => Array.isArray(variant.components) && variant.components.length === 2));
      continue;
    }
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

test('WELCOME10 applies exactly $10 at the $60 food threshold and not below it', () => {
  const promotion = config.promotions.codes.find(item => item.code === 'WELCOME10');
  assert.ok(promotion);
  assert.equal(promotion.firstOrderOnly, true);
  assert.equal(promotion.maxRedemptions, 50);
  assert.equal(orderApi._test.discountForPromotion(promotion, 59.99), 0);
  assert.equal(orderApi._test.discountForPromotion(promotion, 60), 10);
  assert.equal(orderApi._test.discountForPromotion(promotion, 120), 10);
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
    { id: 'b3', tier: 'lean', qty: 2 },
    { id: 'b3', tier: 'bulk', qty: 1 },
    { id: 'm6', tier: 'bulk', qty: 1 },
    { id: 'm7', tier: 'lean', qty: 1 },
    { id: 'd1', qty: 2 },
    { id: 'a1', qty: 1 },
  ], draftCatalog);

  assert.deepEqual(items.map(item => [item.id, item.tier, item.qty, item.subtotal]), [
    ['b3', 'lean', 2, 27.98],
    ['b3', 'bulk', 1, 15.99],
    ['m6', 'bulk', 1, 12.99],
    ['m7', 'lean', 1, 21.99],
    ['d1', 'single', 2, 13.98],
    ['a1', 'single', 1, 7.99],
  ]);
});

test('sales tax stays disabled until the owner activates the reviewed policy', () => {
  assert.equal(config.tax.enabled, false);
  const quote = orderApi._test.calculateSalesTax([], 0, 0, 0, config.tax);
  assert.deepEqual(quote, { taxableSubtotal: 0, taxableDelivery: 0, taxRate: 0, salesTax: 0 });
});

test('sales tax engine taxes only classified merchandise and its proportional delivery share', () => {
  const catalog = orderApi._test.catalogForConfig({
    menu: {
      addons: [
        { id: 'taxed', name: 'Taxed prepared food', category: 'addon', price: 10, taxClass: 'taxable-prepared-food' },
        { id: 'exempt', name: 'Exempt reheatable meal', category: 'addon', price: 10, taxClass: 'exempt-reheatable-meal' },
      ],
    },
  });
  const items = orderApi._test.normalizeItems([
    { id: 'taxed', tier: null, qty: 1 },
    { id: 'exempt', tier: null, qty: 1 },
  ], catalog);
  assert.deepEqual(orderApi._test.calculateSalesTax(items, 20, 10, 2, {
    enabled: true,
    rate: 0.0825,
    deliveryMode: 'proportional',
    taxableClasses: ['taxable-prepared-food'],
  }), {
    taxableSubtotal: 9,
    taxableDelivery: 5,
    taxRate: 0.0825,
    salesTax: 1.16,
  });
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

test('weekly exclusive bundles keep the selected split and count all five meals', () => {
  const bundleConfig = {
    menu: {
      exclusives: [{
        id: 'x1',
        name: 'Build-a-Week Exclusive Duo',
        category: 'bundle',
        price: 49.99,
        servingCount: 5,
        maxQty: 5,
        variants: [
          { id: 'med3-street2', label: '3 Mediterranean + 2 Streetcorn' },
          { id: 'med2-street3', label: '2 Mediterranean + 3 Streetcorn' },
        ],
      }],
    },
  };
  const catalog = orderApi._test.catalogForConfig(bundleConfig);
  const items = orderApi._test.normalizeItems([
    { id: 'x1', tier: 'med3-street2', qty: 2 },
  ], catalog);

  assert.equal(items[0].subtotal, 99.98);
  assert.equal(items[0].variantLabel, '3 Mediterranean + 2 Streetcorn');
  assert.equal(items[0].servingCount, 5);
  assert.deepEqual(orderApi._test.paymentCounts(items), { standard: 10, beef: 0, dessert: 0 });
  assert.equal(orderApi._test.tierSummary(items), 'Weekly Five');
  assert.throws(
    () => orderApi._test.normalizeItems([{ id: 'x1', tier: 'invented-split', qty: 1 }], catalog),
    /valid weekly split/i,
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
    orderId:'PRPD-B13-20260928-ABCDEF12', email:'new@example.com', phone:'4695550199',
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
      orderId: 'PRPD-B14-20261005-A1B2C3D4',
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
      items: [{ id: 'm1', tier: 'lean', qty: 6 }],
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

    assert.equal(order.mealSubtotal, 65.94);
    assert.equal(order.deliveryFee, 9.99);
    assert.equal(order.deliveryZone, 'core');
    assert.equal(order.deliveryZoneLabel, 'Local Delivery');
    assert.equal(order.discountAmount, 15);
    assert.equal(order.exactTotal, 60.93);
    assert.equal(order.roundedTotal, 61);
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
    minimumOrder: 70,
    freeDeliveryThreshold: 100,
    deliveryFee: 12.99,
  });
  assert.deepEqual(orderApi._test.deliveryPolicyForZip('76107', config.policies), {
    id: 'extended',
    label: 'Extended Delivery',
    minimumOrder: 100,
    freeDeliveryThreshold: 135,
    deliveryFee: 14.99,
  });
  assert.equal(orderApi._test.deliveryPolicyForZip('77002', config.policies), null);
});

test('pickup is free, uses the approved lower food minimum, and never requires a delivery address', () => {
  assert.deepEqual(config.policies.deliveryZones.pickup, {
    id: 'pickup',
    label: 'Pickup',
    city: 'The Colony',
    state: 'TX',
    minimumOrder: 50,
    freeDeliveryThreshold: 50,
    deliveryFee: 0,
  });

  const order = orderApi._test.validateAndBuildOrder({
    action: 'order',
    orderId: 'PRPD-B14-20261005-A1B2C3D4',
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
  assert.equal(order.pickupCity, 'The Colony');
  assert.equal(order.pickupState, 'TX');
  assert.equal(order.deliveryFee, 0);
  assert.equal(order.mealSubtotal, 65.94);
  assert.equal(order.exactTotal, 65.94);
  assert.equal(order.roundedTotal, 66);
});

test('whole-dollar payment rounding satisfies order minimums without counting an exact lower dollar', () => {
  assert.equal(orderApi._test.roundedFoodSubtotal(49.96), 50);
  assert.equal(orderApi._test.orderMinimumReached(49.96, 50), true);
  assert.equal(orderApi._test.orderMinimumReached(49.01, 50), true);
  assert.equal(orderApi._test.orderMinimumReached(49, 50), false);

  const order = orderApi._test.validateAndBuildOrder({
    action: 'order',
    orderId: 'PRPD-B14-20261005-B1C2D3E4',
    firstName: 'Pickup',
    lastName: 'Rounding',
    phone: '9725550101',
    email: 'pickup-rounding@example.com',
    fulfillmentMethod: 'pickup',
    deliveryAddress: '',
    deliveryHasUnit: false,
    deliveryUnit: '',
    deliveryCity: '',
    deliveryState: '',
    deliveryZip: '',
    deliveryInstructions: '',
    items: [{ id: 'x0', tier: 'med3-shak2', qty: 1 }],
    promoCode: '',
    menuEmailOptIn: false,
    notes: '',
    website: '',
    formStartedAt: 1,
  }, [], draftOrderContext);

  assert.equal(order.mealSubtotal, 49.99);
  assert.equal(order.deliveryFee, 0);
  assert.equal(order.exactTotal, 49.99);
  assert.equal(order.roundedTotal, 50);
});

test('browser checkout uses the pickup floor and method-aware rounded minimum checks', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'order.js'), 'utf8');
  assert.match(source, /function orderMinimumReached\(mealSubtotal, minimumOrder\)/);
  assert.match(source, /const checkoutMinimum = Math\.min\(MIN_ORDER_TOTAL, Number\(PICKUP_POLICY\.minimumOrder\)\)/);
  assert.doesNotMatch(source, /if \(mealSubtotal < MIN_ORDER_TOTAL\)/);
  assert.match(source, /if \(!orderMinimumReached\(mealSubtotal, deliveryPolicy\.minimumOrder\)\)/);
});

test('first-order pickup promotions require a private household address and reject a prior delivery household', async () => {
  const promotion = {
    code: 'Z10', partner: 'Zee Hamoda', type: 'fixed', value: 10, active: true,
    firstOrderOnly: true, minimumOrder: 60, maxRedemptions: 25,
  };
  const payload = {
    action: 'order', orderId: 'PRPD-B14-20261005-B1C2D3E4',
    firstName: 'New', lastName: 'Pickup', phone: '9725550199', email: 'new-pickup@example.com',
    fulfillmentMethod: 'pickup', deliveryAddress: '', deliveryHasUnit: false, deliveryUnit: '',
    deliveryCity: '', deliveryState: '', deliveryZip: '', deliveryInstructions: '',
    items: [{ id: 'm2', tier: 'lean', qty: 6 }], promoCode: 'Z10', menuEmailOptIn: false,
    notes: '', website: '', formStartedAt: 1,
  };

  assert.throws(
    () => orderApi._test.validateAndBuildOrder(payload, [promotion], draftOrderContext),
    /home street address/i,
  );

  const order = orderApi._test.validateAndBuildOrder({
    ...payload,
    deliveryAddress: '123 Main Street', deliveryHasUnit: true, deliveryUnit: 'Apt 4',
    deliveryState: 'TX', deliveryZip: '75035',
  }, [promotion], draftOrderContext);
  assert.equal(order.fulfillmentMethod, 'pickup');
  assert.equal(order.deliveryAddress, '123 Main Street');
  assert.equal(order.deliveryZip, '75035');
  assert.equal(order.discountAmount, 10);

  const prior = Array(37).fill('');
  prior[5] = '4695550100';
  prior[10] = 'OLDER-ORDER';
  prior[11] = 'different@example.com';
  prior[12] = '123 Main St, Apartment 4';
  prior[14] = '75035';
  const client = { request: async () => ({ data: { values: [prior] } }) };
  await assert.rejects(
    orderApi._test.assertReferralEligibility(client, order, promotion),
    /first PRPD order/i,
  );
});

test('server enforces the extended minimum and applies its fee until the free-delivery threshold', () => {
  const payload = (qty, suffix) => ({
    action: 'order',
    orderId: `PRPD-B14-20261005-${suffix}`,
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
    items: [{ id: 'm1', tier: 'lean', qty }],
    promoCode: '',
    menuEmailOptIn: false,
    notes: '',
    website: '',
    formStartedAt: 1,
  });

  assert.throws(
    () => orderApi._test.validateAndBuildOrder(payload(9, 'A1B2C3D4'), [], draftOrderContext),
    /\$100 Extended Delivery order minimum/i,
  );

  const paidDelivery = orderApi._test.validateAndBuildOrder(payload(10, 'B1C2D3E4'), [], draftOrderContext);
  assert.equal(paidDelivery.mealSubtotal, 109.9);
  assert.equal(paidDelivery.deliveryFee, 14.99);
  assert.equal(paidDelivery.exactTotal, 124.89);

  const freeDelivery = orderApi._test.validateAndBuildOrder(payload(13, 'C1D2E3F4'), [], draftOrderContext);
  assert.equal(freeDelivery.mealSubtotal, 142.87);
  assert.equal(freeDelivery.deliveryFee, 0);
  assert.equal(freeDelivery.exactTotal, 142.87);
});

test('server enforces the regional minimum and applies its fee until the regional free-delivery threshold', () => {
  const payload = (qty, suffix) => ({
    action: 'order',
    orderId: `PRPD-B14-20261005-${suffix}`,
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
    items: [{ id: 'm1', tier: 'lean', qty }],
    promoCode: '',
    menuEmailOptIn: false,
    notes: '',
    website: '',
    formStartedAt: 1,
  });

  assert.throws(
    () => orderApi._test.validateAndBuildOrder(payload(5, 'D1E2F3A4'), [], draftOrderContext),
    /\$70 Regional Delivery order minimum/i,
  );

  const paidDelivery = orderApi._test.validateAndBuildOrder(payload(7, 'E1F2A3B4'), [], draftOrderContext);
  assert.equal(paidDelivery.mealSubtotal, 76.93);
  assert.equal(paidDelivery.deliveryFee, 12.99);
  assert.equal(paidDelivery.exactTotal, 89.92);

  const freeDelivery = orderApi._test.validateAndBuildOrder(payload(10, 'F1A2B3C4'), [], draftOrderContext);
  assert.equal(freeDelivery.mealSubtotal, 109.9);
  assert.equal(freeDelivery.deliveryFee, 0);
  assert.equal(freeDelivery.exactTotal, 109.9);
});

test('local delivery stays $9.99 below $85 and becomes free at the approved $85 threshold', () => {
  const payload = (qty, suffix) => ({
    action: 'order',
    orderId: `PRPD-B14-20261005-${suffix}`,
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
  assert.equal(orderApi._test.isValidOrderId('PRPD-B9-20260831-A4F2C91D', 9), true);
  assert.equal(orderApi._test.isValidOrderId('PRPD-B9-20260831-A4F2', 9), true);
  assert.equal(orderApi._test.isValidOrderId('PRPD-B8-20260831-A4F2C91D', 9), false);
  assert.equal(orderApi._test.isValidOrderId('PRPD-B9-20260831-NOTHEX99', 9), false);
});

test('premium steak is counted with beef and seafood in the payment log', () => {
  assert.deepEqual(orderApi._test.paymentCounts([
    { category: 'standard', qty: 2 },
    { category: 'premium', qty: 1 },
    { category: 'seafood', qty: 2 },
    { category: 'dessert', qty: 1 },
  ]), { standard: 2, beef: 3, dessert: 1 });
});

test('order page consumes the shared config instead of duplicating it', () => {
  const orderHtml = fs.readFileSync(path.join(__dirname, '..', 'order.html'), 'utf8');
  assert.match(orderHtml, /<script src="\/config\/order-config\.js(?:\?[^\"]+)?"><\/script>/);
  assert.doesNotMatch(orderHtml, /const MENU\s*=\s*\{/);
  assert.doesNotMatch(orderHtml, /const BATCH\s*=\s*\{/);
});

test('public order form collects delivery details and requests an emailed confirmation', () => {
  const orderHtml = fs.readFileSync(path.join(__dirname, '..', 'order.html'), 'utf8');
  const orderJs = fs.readFileSync(path.join(__dirname, '..', 'order.js'), 'utf8');
  for (const field of ['fullName', 'phone', 'email', 'deliveryAddress', 'deliveryCity', 'deliveryState', 'deliveryZip']) {
    assert.match(orderHtml, new RegExp(`id="${field}"[^>]*required`));
  }
  for (const field of ['firstName', 'lastName', 'phone', 'email', 'deliveryAddress', 'deliveryCity', 'deliveryState', 'deliveryZip']) {
    assert.match(orderJs, new RegExp(`\\b${field},`));
  }
  assert.match(orderJs, /splitFullName\(fullNameInput\.value\)/);
  assert.match(orderHtml, /id="deliveryHasUnit"/);
  assert.match(orderJs, /deliveryUnitInput\.required = hasUnit/);
  assert.match(orderHtml, /id="deliveryUnit"[^>]*autocomplete="address-line2"/);
  assert.doesNotMatch(orderHtml, /id="deliveryUnit"[^>]*required/);
  assert.match(orderJs, /customerConfirmationSent/);
  assert.match(orderJs, /emailed an itemized copy/i);
  assert.match(orderHtml, /data-fulfillment="delivery"/);
  assert.match(orderHtml, /data-fulfillment="pickup"/);
  assert.match(orderHtml, /Free pickup in The Colony, Texas/);
  assert.match(orderHtml, /lower \$50 food minimum/);
  assert.match(orderJs, /fulfillmentMethod: selectedFulfillment/);
  assert.match(orderJs, /field\.required = !pickup/);
});

test('public order form captures referral attribution and explicit menu-email consent', () => {
  const orderHtml = fs.readFileSync(path.join(__dirname, '..', 'order.html'), 'utf8');
  const orderJs = fs.readFileSync(path.join(__dirname, '..', 'order.js'), 'utf8');
  assert.match(orderHtml, /id="promoCode"/);
  assert.match(orderHtml, /id="pickupPromoVerification"[^>]*hidden/);
  assert.match(orderHtml, /id="pickupVerificationAddress"[^>]*disabled/);
  assert.match(orderHtml, /id="pickupVerificationZip"[^>]*disabled/);
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

  assert.equal(dishes.find(dish => dish.name === 'Egg Bites with Potato Hash').image, '/assets/images/meals/menu/egg-bites-lean.jpg');
  assert.equal(dishes.find(dish => dish.name === 'Tandoori Chicken').image, '/assets/images/meals/menu/batch-8-2026-08-29/tandoori-chicken.webp');
  assert.equal(dishes.find(dish => dish.name === 'Chocolate Peanut Butter Protein Brownie').image, '/assets/images/meals/menu/batch-8-2026-08-29/chocolate-peanut-butter-protein-brownie.webp');
});

test('Batch 14 menu uses the approved six-main, Signature Special, and Weekly Five structure', () => {
  assert.equal(config.batch.number, 14);
  assert.equal(config.batch.deliveryDate, 'Saturday, October 10, 2026');
  assert.equal(config.batch.cutoffIso, '2026-10-07T18:00:00-05:00');

  const names = dishes.map(dish => dish.name);
  for (const name of [
    'Weekly Five: Mediterranean + Shakshuka', 'Egg Bites with Potato Hash',
    'French Toast', 'Grilled Cheese Breakfast Burrito', 'Blueberry Vanilla Protein Baked Oatmeal Squares',
    'Mexican Streetcorn Chicken Bowl', 'Cheesy Achiote Chicken Tacos', 'Meatball Arrabbiata Pasta',
    'Garlic Butter Wild Argentine Shrimp + Rice', 'Tandoori Chicken', 'Mediterranean Chicken Bowl',
    'Premium NY Strip Steak', 'Chocolate Peanut Butter Protein Brownie', 'Oreo Protein Cheesecake Cup',
    'Banana Cream Pie Cup', 'Chicken Tikka Snack Wrap', 'BBQ Chicken Lavash Flatbread', 'Caprese Protein Pasta Box',
  ]) assert.equal(names.includes(name), true, name);

  assert.equal(dishes.find(dish => dish.name === 'Garlic Butter Wild Argentine Shrimp + Rice').displayCategory, 'Premium Seafood');
  assert.match(dishes.find(dish => dish.name === 'Garlic Butter Wild Argentine Shrimp + Rice').description, /^Premium Wild Argentine red shrimp/);
  assert.equal(dishes.find(dish => dish.name === 'Premium NY Strip Steak').displayCategory, 'Signature Special');
  assert.deepEqual(dishes.find(dish => dish.name === 'Egg Bites with Potato Hash').macros, { cal: 305, protein: 32, carbs: 27, fiber: 3, fat: 7 });
  assert.deepEqual(dishes.find(dish => dish.name === 'Chicken Tikka Snack Wrap').macros, { cal: 295, protein: 35, carbs: 25, fiber: 16, fat: 11 });
  assert.deepEqual(config.menu.exclusives[0].variants.map(variant => variant.components), [
    [{ id: 'm6', tier: 'lean', qty: 3 }, { id: 'bw1', tier: 'lean', qty: 2 }],
    [{ id: 'm6', tier: 'lean', qty: 2 }, { id: 'bw1', tier: 'lean', qty: 3 }],
  ]);
  assert.equal(dishes.filter(dish => dish.newThisWeek).length, 2);
  const tacos=dishes.find(dish => dish.name === 'Cheesy Achiote Chicken Tacos');
  assert.notEqual(tacos.nutritionReview, true);
  assert.deepEqual(tacos.macros,{cal:535,protein:55,carbs:32,fiber:4,fat:19});
  assert.deepEqual(tacos.bulkMacros,{cal:710,protein:73,carbs:43,fiber:5,fat:26});
});

test('mobile menu surfaces the optional exclusive and retained Grab & Go early', () => {
  const orderHtml = fs.readFileSync(path.join(__dirname, '..', 'order.html'), 'utf8');
  const orderJs = fs.readFileSync(path.join(__dirname, '..', 'order.js'), 'utf8');
  const breakfastPosition = orderHtml.indexOf('id="menu-breakfasts"');
  const addonPosition = orderHtml.indexOf('id="menu-addons"');
  const mainsPosition = orderHtml.indexOf('id="menu-mains"');

  assert.ok(breakfastPosition < addonPosition);
  assert.ok(addonPosition < mainsPosition);
  assert.match(orderHtml, /data-menu-section="exclusives" hidden>Weekly exclusive/);
  assert.doesNotMatch(orderHtml, /Grab &amp; Go <span>New<\/span>/);
  assert.match(orderJs, /dish\.newThisWeek/);
  assert.match(orderJs, /IntersectionObserver/);
  assert.match(orderJs, /\['exclusives', 'breakfasts', 'addons', 'mains', 'premium', 'desserts'\]/);

  assert.deepEqual(config.menu.addons.map(item => item.name), ['Chicken Tikka Snack Wrap', 'BBQ Chicken Lavash Flatbread', 'Caprese Protein Pasta Box']);
});

test('order page provides menu filters and a minimum-aware sticky mobile cart', () => {
  const orderHtml = fs.readFileSync(path.join(__dirname, '..', 'order.html'), 'utf8');
  const orderJs = fs.readFileSync(path.join(__dirname, '..', 'order.js'), 'utf8');
  assert.match(orderHtml, /Displayed macros exclude separately packed sauces and dressings/);
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
  assert.match(orderHtml, /<strong>Local<\/strong>\$60 minimum · \$9\.99 · free at \$85/);
  assert.match(orderJs, /\$9\.99 local · \$12\.99 regional · \$14\.99 extended/);
  assert.match(orderCss, /\.order-layout > aside \{ align-self: stretch; \}/);
  assert.match(orderCss, /max-height: calc\(100vh - var\(--banner-h\) - 112px\)/);
  assert.match(orderCss, /\.menu-filter-chip\.is-active/);
  assert.match(orderHtml, /order-delivery-details/);
  assert.equal((orderHtml.match(/order-delivery-grid[\s\S]*?<\/div>/) || [''])[0].match(/<span>/g)?.length, 3);
  assert.match(orderHtml, /id="phoneReviewNote"/);
  assert.match(orderHtml, /id="phoneReviewConfirmed"/);
  assert.match(orderJs, /phoneNeedsReview && !phoneReviewConfirmed\?\.checked/);
  assert.match(orderCss, /overflow-x: hidden/);
  assert.match(orderCss, /grid-template-columns: minmax\(0, \.82fr\) minmax\(0, 1\.18fr\)/);
});
