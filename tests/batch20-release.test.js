const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const config = require('../config/order-config');
const details = require('../config/menu-details');
const production = require('../operations/nutrition/production-data');
const methods = require('../operations/cook-day-methods');
const core = require('../operations/cook-day-core');
const engine = require('../operations/production-engine');
const report = require('../operations/tools/generate-current-grocery-report');
const api = require('../api/order')._test;

test('Batch 20 presents the approved lineup and Wednesday cutoff', () => {
  assert.equal(config.batch.number, 20);
  assert.equal(config.batch.published, true);
  assert.equal(config.batch.cutoffIso, '2026-11-18T18:00:00-06:00');
  assert.deepEqual(config.menu.mains.map(item => item.name), [
    'Hot Honey Chicken Sliders', 'Creamy Cajun Chicken Pasta',
    'Chicken Enchilada Bake', 'Southwest Beef Taco Bowl',
    'Thai Basil Beef + Jasmine Rice', 'Halal Cart Chicken + Yellow Rice',
  ]);
  assert.deepEqual(config.menu.desserts[0].variants.map(item => [item.unitCount, item.price]),
    [[1, 2.99], [3, 7.99], [6, 13.99]]);
  assert.equal(config.menu.addons.find(item => item.id === 'dr1').price, 6.99);
  for (const item of Object.values(config.menu).flat()) {
    if (item.image) assert.ok(fs.existsSync(path.join(__dirname, '..', item.image.slice(1))), item.image);
  }
});

test('checkout prices cookie packs and lassi and expands the Cajun-Harissa split', () => {
  const catalog = api.catalogForConfig(config);
  const items = api.normalizeItems([
    {id:'d1',tier:'one',qty:1}, {id:'d1',tier:'three',qty:1},
    {id:'d1',tier:'six',qty:1}, {id:'dr1',tier:'single',qty:1},
    {id:'x0',tier:'lean-cajun3-harissa2',qty:1},
  ], catalog);
  assert.deepEqual(items.map(item => item.unitPrice), [2.99, 7.99, 13.99, 6.99, 49.95]);
  assert.equal(items.reduce((sum, item) => sum + item.subtotal, 0), 81.91);
  assert.equal(api.paymentCounts(items).dessert, 10);
  const lines = [
    '1x Classic Chocolate Chip Cookie (3 cookies) - $7.99',
    '1x Classic Chocolate Chip Cookie (6 cookies) - $13.99',
    '1x Classic Mango Lassi - $6.99',
    '1x Weekly Five: Cajun + Harissa Honey (Lean: 3 Cajun Pasta + 2 Harissa Honey Chicken) - $49.95',
  ].join('\n');
  const parsed = core.parseItemsText(lines, config);
  assert.deepEqual(parsed.warnings, []);
  assert.deepEqual(parsed.items.map(item => [item.id, item.tier, item.qty]), [
    ['d1','single',3], ['d1','single',6], ['dr1','single',1],
    ['m2','lean',3], ['bw1','lean',2],
  ]);
});

test('new item details and production plan use current recipes', () => {
  assert.equal(production.batch, 20);
  assert.equal(methods.batch, 20);
  const cookie = details.batches['20'].d1;
  const lassi = details.batches['20'].dr1;
  assert.match(cookie.tiers.single.nutritionBasis, /per cookie/i);
  assert.match(lassi.tiers.single.nutritionBasis, /330 g homogeneous recipe estimate/i);
  assert.equal(cookie.tiers.single.nutrition.calories, 315);
  assert.equal(lassi.tiers.single.nutrition.calories, 255);
  assert.match(cookie.tiers.single.allergens, /EGG/);
  assert.match(lassi.tiers.single.allergens, /MILK/);
  const orders = [{orderId:'B20-SMOKE',customer:'Fixture',included:true,sourceStatus:'active',items:[
    {id:'d1',tier:'single',qty:9}, {id:'dr1',tier:'single',qty:1},
    {id:'m2',tier:'lean',qty:3}, {id:'bw1',tier:'lean',qty:2},
  ]}];
  const plan = engine.compileProduction({orders,data:production,methods,config,...report.defaultSettings(methods)});
  assert.deepEqual(plan.diagnostics.errors, []);
});
