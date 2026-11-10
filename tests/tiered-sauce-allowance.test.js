const test = require('node:test');
const assert = require('node:assert/strict');
const program = require('../sauce-program');
const api = require('../api/order')._test;
const policy = require('../config/sauce-policy.batch18-draft.json');
const sauceProgram = {
  enabled: true, ...policy, maxExtraCups: 50,
  choices: [{ id: 'test-sauce', name: 'Test Sauce' }],
};

test('meal-tiered allowance grants one optional cup per two meals, rounded up', () => {
  for (const [meals, free] of [[0,0],[1,1],[2,1],[3,2],[5,3],[6,3],[7,4],[8,4],[9,5],[10,5],[11,6],[12,6],[22,11],[73,37]]) {
    const quote = program.quote({}, [{ category: 'standard', qty: meals }], sauceProgram);
    assert.equal(quote.totalCredits, free, `${meals} eligible meals`);
    assert.equal(quote.selectedQty, 0);
    assert.equal(quote.extraSubtotal, 0);
  }
  assert.equal(policy.servingGrams, 40);
  assert.equal(policy.extraPrice, 1);
});

test('browser cart and normalized server lines count bundle servings once and savory Grab & Go once', () => {
  const lines = [
    { category: 'bundle', servingCount: 5, qty: 2, variants: [{ components: [{ qty: 3 }, { qty: 2 }] }] },
    { category: 'standard', qty: 3, sideCupComponents: [{ cupsPerMeal: 2 }] },
    { category: 'addon', qty: 2 },
    { category: 'dessert', qty: 40 },
    { category: 'beverage', qty: 40 },
    { category: 'shake', qty: 40 },
    { category: 'sauce', qty: 40 },
    { category: 'addon', sauceEligible: false, qty: 40 },
  ];
  const browser = lines.map(({ qty, ...dish }) => ({ dish, qty }));
  for (const items of [lines, browser]) {
    const quote = program.quote({ 'test-sauce': 10 }, items, sauceProgram);
    assert.equal(quote.eligibleMeals, 15);
    assert.equal(quote.totalCredits, 8);
    assert.equal(quote.selectedQty, 10);
    assert.equal(quote.extraQty, 2);
    assert.equal(quote.extraSubtotal, 2);
    assert.equal(quote.reservedCredits, 0);
    assert.deepEqual(quote.reserved, {});
  }
});

test('nonmeals and required recipe cups create neither free allowance nor automatic selections', () => {
  const noMeals = program.quote({}, [
    { category: 'dessert', qty: 10 }, { category: 'beverage', qty: 10 },
    { category: 'addon', sauceEligible: false, qty: 10 },
  ], sauceProgram);
  assert.equal(noMeals.totalCredits, 0);
  assert.equal(noMeals.selectedQty, 0);
  const meals = [{ category: 'premium', qty: 8, requiredCups: 100, reservedSauces: { 'test-sauce': 100 } }];
  assert.equal(program.quote({}, meals, sauceProgram).selectedQty, 0);
  assert.equal(program.quote({}, meals, sauceProgram).totalCredits, 4);
});

test('absent opt-in preserves fulfilled Batch17 flat pricing and disabled configurations', () => {
  // Fixed fulfilled-Batch17 policy, independent of the next live batch or
  // local-only draft files. Changing future config must not change this rule.
  const batch17Policy = { enabled: true, freeCupsPerOrder: 3, extraPrice: 1 };
  const items = [{ category: 'standard', qty: 22 }];
  const selected = { 'test-sauce': 11 };
  const flat = program.quote(selected, items, batch17Policy);
  assert.equal(flat.totalCredits, 3);
  assert.equal(flat.extraSubtotal, 8);
  assert.equal(program.quote(selected, items, { ...sauceProgram, enabled: false }).totalCredits, 0);
  assert.equal(program.quote(selected, items, { ...sauceProgram, allowanceMode: 'unknown', freeCupsPerOrder: 3 }).totalCredits, 3);
});

test('cart changes immediately recalculate paid cups without silently adding or deleting choices', () => {
  const selected = { 'test-sauce': 6 };
  for (const [qty, extra] of [[12,0],[7,2],[1,5]]) {
    const quote = program.quote(selected, [{ dish: { category: 'beef' }, qty }], sauceProgram);
    assert.equal(quote.selectedQty, 6);
    assert.equal(quote.extraQty, extra);
    assert.equal(quote.extraSubtotal, extra);
  }
  assert.deepEqual(selected, { 'test-sauce': 6 });
});

function context() {
  const catalog = api.catalogForConfig({ menu: { mains: [
    { id: 'm1', name: 'Meal', category: 'standard', price: 10 },
    { id: 'x1', name: 'Five Meals', category: 'bundle', servingCount: 5, price: 40,
      variants: [{ id: 'lean-split', label: '3 plus 2', price: 40, components: [{ id: 'm1', qty: 3 }, { id: 'm2', qty: 2 }] }] },
    { id: 'a1', name: 'Snack Wrap', category: 'addon', price: 5 },
    { id: 's1', name: 'Shake', category: 'addon', sauceEligible: false, price: 5 },
    { id: 'd1', name: 'Dessert', category: 'dessert', price: 5 },
  ] } });
  return { catalog, sauceProgram, batchNumber: 99, cutoffIso: '2099-01-01T00:00:00Z',
    tax: { enabled: false }, policies: { minimumOrder: 0, freeDeliveryThreshold: 0, deliveryFee: 0,
      deliveryZones: { pickup: { id: 'pickup', label: 'Pickup', minimumOrder: 0, freeDeliveryThreshold: 0, deliveryFee: 0 } } } };
}
function payload() {
  return { action: 'order', orderId: 'PRPD-B99-20261102-A1B2C3D4', firstName: 'Fixture', lastName: 'Customer',
    phone: '4695550100', email: 'fixture@example.invalid', fulfillmentMethod: 'pickup', website: '',
    items: [{ id: 'x1', tier: 'lean-split', qty: 2 }, { id: 'm1', tier: 'lean', qty: 3 },
      { id: 'a1', tier: 'single', qty: 2 }, { id: 's1', tier: 'single', qty: 4 }, { id: 'd1', tier: 'single', qty: 4 }],
    sauces: [{ id: 'test-sauce', qty: 10 }], mealSubtotal: 1, exactTotal: 1, total: 1 };
}

test('real order validation recomputes allowance and price from authoritative catalog including bundles', () => {
  const order = api.validateAndBuildOrder(payload(), [], context());
  assert.equal(order.sauces.totalCredits, 8); // 10 bundle meals +3 mains +2 wraps
  assert.equal(order.sauces.extraQty, 2);
  assert.equal(order.sauces.extraSubtotal, 2);
  assert.equal(order.mealSubtotal, 162); // 160 merchandise +2 paid cups
  assert.equal(order.exactTotal, 162);
  assert.equal(order.items.find(item => item.id === 's1').sauceEligible, false);
  assert.deepEqual(order.sauces.selections, [{ id: 'test-sauce', name: 'Test Sauce', qty: 10 }]);
});

test('client cannot forge serving counts or eligibility, and empty selections stay empty on the server', () => {
  for (const spoof of [{ servingCount: 100 }, { sauceEligible: true }]) {
    const raw = payload();
    Object.assign(raw.items[3], spoof);
    assert.throws(() => api.validateAndBuildOrder(raw, [], context()), /unsupported|unexpected|not allowed/i);
  }
  const raw = payload();
  raw.sauces = [];
  const order = api.validateAndBuildOrder(raw, [], context());
  assert.deepEqual(order.sauces.selections, []);
  assert.equal(order.sauces.extraSubtotal, 0);
  assert.equal(order.mealSubtotal, 160);
});

test('server keeps whole-cup validation and extra-cup limit with the larger free tier', () => {
  const items = [{ category: 'standard', qty: 22 }];
  const normalize = qty => api.normalizeSauceSelections([{ id: 'test-sauce', qty }], items, sauceProgram);
  assert.equal(normalize(61).extraQty, 50);
  assert.throws(() => normalize(62), /no more than 50/);
  assert.throws(() => normalize(1.5), /whole cups/);
});
