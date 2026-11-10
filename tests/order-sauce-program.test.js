const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const config = require('../config/order-config');
const orderApi = require('../api/order');

const sauceProgram = {
  enabled: true,
  servingGrams: 45,
  freeCupsPerOrder: 3,
  extraPrice: 1,
  maxExtraCups: 50,
  taxClass: 'taxable-prepared-food',
  choices: [
    { id: 'sweet-heat', name: 'PRPD Sweet Heat' },
    { id: 'garlic-herb-yogurt', name: 'Garlic Herb Yogurt' },
  ],
};

test('fulfilled Batch 16 retains its approved flat sauce policy and the selector remains available', () => {
  const fulfilled = require('../config/archive/order-config.batch16.json');
  assert.equal(fulfilled.batch.number, 16);
  assert.equal(fulfilled.batch.published, true);
  assert.equal(fulfilled.batch.remindersEnabled, false);
  assert.equal(fulfilled.sauceProgram.enabled, true);
  assert.equal(fulfilled.sauceProgram.freeCupsPerOrder, 3);
  assert.equal(fulfilled.sauceProgram.extraPrice, 1);
  assert.deepEqual(fulfilled.sauceProgram.choices.map(choice => choice.id), ['sweet-heat', 'garlic-herb-yogurt']);
  assert.deepEqual(fulfilled.sauceProgram.choices.map(choice => choice.allergens), ['CONTAINS: EGG.', 'CONTAINS: EGG, MILK.']);
  assert.ok(fulfilled.sauceProgram.choices.every(choice => choice.customerIngredients));
  const orderHtml = fs.readFileSync(path.join(__dirname, '..', 'order.html'), 'utf8');
  assert.match(orderHtml, /id="sauceSelector"[^>]*hidden/);
  assert.doesNotMatch(orderHtml, /Every savory meal includes|Save sauce choices/);
  assert.ok(orderHtml.indexOf('id="sauceSelector"') > orderHtml.indexOf('id="checkout"'));
  const orderJs = fs.readFileSync(path.join(__dirname, '..', 'order.js'), 'utf8');
  assert.match(orderJs, /sauce-choice__allergens/);
  assert.match(orderJs, /sauce-choice__ingredients/);
});

test('three free chosen cups apply once per order regardless of meal and recipe-cup counts', () => {
  const quote = orderApi._test.normalizeSauceSelections([
    { id: 'sweet-heat', qty: 2 },
    { id: 'garlic-herb-yogurt', qty: 3 },
  ], [
    { id: 'b2', qty: 2 },
    { id: 'm1', qty: 3 },
    { id: 'd1', qty: 10 },
  ], sauceProgram);

  assert.equal(quote.totalCredits, 3);
  assert.equal(quote.reservedCredits, 0);
  assert.equal(quote.selectableCredits, 3);
  assert.equal(quote.selectedQty, 5);
  assert.equal(quote.extraQty, 2);
  assert.equal(quote.extraSubtotal, 2);
  assert.deepEqual(quote.selections.map(({ id, qty }) => [id, qty]), [
    ['sweet-heat', 2],
    ['garlic-herb-yogurt', 3],
  ]);
});

test('checkout uses warm neutral surfaces and keeps paid-cup status forest green', () => {
  const css = fs.readFileSync(path.join(__dirname, '..', 'order.css'), 'utf8');
  assert.match(css, /body\s*\{[^}]*background:\s*#f5f2ec;/);
  assert.match(css, /\.sauce-selector\s*\{[^}]*background:\s*#fffdf9;/);
  assert.match(css, /\.sauce-selector__meter\s*\{[^}]*background:\s*var\(--green\);/);
  assert.doesNotMatch(css, /#7c4a2d|#dae8cd|#b9d1ab|#edf1e7|#e3ebda|#f6f8f1/i);
});

test('server rejects unknown sauce IDs and selections while the feature is disabled', () => {
  assert.throws(
    () => orderApi._test.normalizeSauceSelections([{ id: 'invented', qty: 1 }], [{ id: 'm1', qty: 1 }], sauceProgram),
    /unknown sauce/i,
  );
  assert.throws(
    () => orderApi._test.normalizeSauceSelections([{ id: 'sweet-heat', qty: 1 }], [{ id: 'm1', qty: 1 }], { enabled: false }),
    /not available/i,
  );
});

test('order validation recalculates sauce extras and ignores client-submitted totals', () => {
  const menuConfig = {
    menu: {
      mains: [{ id: 'm1', name: 'Savory Meal', category: 'standard', price: 10, taxClass: 'exempt-reheatable-meal' }],
    },
  };
  const catalog = orderApi._test.catalogForConfig(menuConfig);
  const order = orderApi._test.validateAndBuildOrder({
    action: 'order',
    orderId: 'PRPD-B99-20261014-A1B2C3D4',
    firstName: 'Test',
    lastName: 'Customer',
    phone: '4695550100',
    email: 'test@example.com',
    fulfillmentMethod: 'pickup',
    deliveryAddress: '',
    deliveryHasUnit: false,
    deliveryUnit: '',
    deliveryCity: '',
    deliveryState: '',
    deliveryZip: '',
    deliveryInstructions: '',
    items: [{ id: 'm1', tier: 'lean', qty: 2 }],
    sauces: [{ id: 'sweet-heat', qty: 4 }],
    mealSubtotal: 1,
    deliveryFee: 999,
    exactTotal: 1,
    total: 1,
    promoCode: '',
    discountAmount: 999,
    menuEmailOptIn: false,
    notes: '',
    discoverySource: '',
    website: '',
  }, [], {
    catalog,
    batchNumber: 99,
    cutoffIso: '2099-01-01T00:00:00-06:00',
    policies: {
      minimumOrder: 0,
      freeDeliveryThreshold: 0,
      deliveryFee: 0,
      deliveryZones: {
        pickup: { id: 'pickup', label: 'Pickup', city: 'The Colony', state: 'TX', minimumOrder: 0, freeDeliveryThreshold: 0, deliveryFee: 0 },
      },
    },
    tax: { enabled: false },
    sauceProgram,
  });

  assert.equal(order.sauces.totalCredits, 3);
  assert.equal(order.sauces.extraQty, 1);
  assert.equal(order.sauces.extraSubtotal, 1);
  assert.equal(order.mealSubtotal, 21);
  assert.equal(order.deliveryFee, 0);
  assert.equal(order.exactTotal, 21);
  assert.equal(order.roundedTotal, 21);
});

test('zero selections never create cups, and quantities remain whole bounded cups', () => {
  const normalize = (values, overrides = {}) => orderApi._test.normalizeSauceSelections(values, [{id:'m1',qty:20}], {...sauceProgram,...overrides});
  assert.deepEqual(normalize([]).selections, []);
  assert.equal(normalize([]).extraSubtotal, 0);
  assert.equal(normalize([{id:'sweet-heat',qty:1}]).extraSubtotal, 0);
  assert.equal(normalize([{id:'sweet-heat',qty:2}]).extraSubtotal, 0);
  assert.equal(normalize([{id:'sweet-heat',qty:4}],{freeCupsPerOrder:3}).extraSubtotal, 1);
  assert.throws(()=>normalize([{id:'sweet-heat',qty:1.5}]), /whole cups/);
  assert.throws(()=>normalize([{id:'sweet-heat',qty:54}]), /no more than/);
  assert.throws(()=>orderApi._test.normalizeSauceSelections([{id:'sweet-heat',qty:1}],[],sauceProgram), /Add food/);
});

test('selected sauces round-trip to the kitchen without multiplying by meal count', () => {
  const core = require('../operations/cook-day-core');
  const parsed = core.parseItemsText('4x Savory Meal (Lean) - $40.00\n1x Sauce cup: PRPD Sweet Heat - selected\n2x Sauce cup: Garlic Herb Yogurt - selected\nExtra sauce cups: 1 - $1.00', {
    menu:{mains:[{id:'m1',name:'Savory Meal',category:'standard'}]},sauceProgram,
  });
  assert.deepEqual(parsed.warnings, []);
  assert.equal(parsed.items.length, 1);
  const sauceConfig={enabled:true,selectionMode:'order-selections',sauces:sauceProgram.choices.map(choice=>({id:choice.id,name:choice.name,ingredientsPerCup:[{key:'fage',name:'Yogurt',grams:45}]}))};
  const order={customer:'Test',orderId:'test',items:parsed.items,sauces:parsed.sauces};
  const plan=core.weeklySaucePlan([order],sauceConfig);
  assert.equal(plan.totalPhysicalCups,3);
  assert.deepEqual(plan.sauces.map(sauce=>sauce.customerCups),[1,2]);
  assert.equal(plan.sauces[1].ingredients[0].totalGrams,90);
  assert.equal(core.weeklySaucePlan([{...order,sauces:[]}],sauceConfig).totalPhysicalCups,0);
  assert.equal(core.weeklySaucePlan([{...order,included:false}],sauceConfig).totalPhysicalCups,0);
});

test('the public sauce formulas exactly match the current whole-gram source and 40g fill', () => {
  const data = require('../operations/nutrition/production-data');
  for (const choice of config.sauceProgram.choices) {
    const expected=data.sauceFormulas[choice.id].ingredients;
    assert.deepEqual(choice.batchIngredients.map(({key,grams})=>({key,grams})), expected.map(({key,grams})=>({key,grams})));
    assert.equal(choice.gramsPerCup,40);
    assert.equal(choice.batchSizeCups,5);
    assert.equal(choice.batchIngredients.reduce((sum,row)=>sum+row.grams,0),225);
    assert.ok(choice.batchIngredients.every(row=>Number.isInteger(row.grams)));
  }
});

test('shopping adds selected cups and lids once, alongside required recipe cups', () => {
  const core=require('../operations/cook-day-core');
  const grocery=require('../operations/grocery-list-core');
  const orders=[{orderId:'test',customer:'Test',items:[{id:'m1',tier:'lean',qty:12}],sauces:[{id:'sweet-heat',qty:2},{id:'garlic-herb-yogurt',qty:2}]}];
  const plan=core.weeklySaucePlan(orders,{enabled:true,selectionMode:'order-selections',sauces:config.sauceProgram.choices});
  const packaging=grocery.packagingRequirements([{id:'m1',tier:'lean',total:12}],orders,plan,12,1);
  assert.equal(packaging.find(row=>row.key==='sauce_cup').required,5);
  const requirements=grocery.mergeRequirements([],plan,packaging);
  assert.equal(requirements.find(row=>row.key==='sauce_lid').required,5);
  assert.equal(requirements.find(row=>row.key==='sriracha').required,15);
  assert.equal(requirements.find(row=>row.key==='fage').required,66);
});

test('current sauce batches scale to whole grams without changing the 40g fill', () => {
  const core=require('../operations/cook-day-core');
  const plan=core.weeklySaucePlan([
    {orderId:'one',customer:'One',items:[{id:'m1',tier:'lean',qty:1}],sauces:[{id:'sweet-heat',qty:3}]},
  ],{enabled:true,selectionMode:'order-selections',sauces:config.sauceProgram.choices});
  const sauce=plan.sauces[0];
  assert.equal(sauce.gramsPerCup,40);
  assert.equal(sauce.totalGrams,120);
  assert.deepEqual(sauce.ingredients.map(({key,totalGrams})=>({key,totalGrams})),[
    {key:'light_mayo',totalGrams:33},
    {key:'ketchup',totalGrams:40},
    {key:'honey',totalGrams:40},
    {key:'sriracha',totalGrams:23},
  ]);
  assert.ok(sauce.ingredients.every(item=>Number.isInteger(item.totalGrams)));
});
