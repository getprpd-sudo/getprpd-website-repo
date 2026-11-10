// Historical Batch 12 whole-pan behavior pending a frozen Batch 12 fixture.
const { skip: test } = require('node:test');
const assert = require('node:assert/strict');
const core = require('../operations/cook-day-core');
const data = require('../operations/nutrition/production-data');
const methods = require('../operations/cook-day-methods');

const near = (a, b) => assert.ok(Math.abs(a - b) < .001, `${a} !== ${b}`);

test('Batch 12 cheesecake always makes one complete eight-serving pan', () => {
  const counts = [{ id: 'd1', name: data.meals.d1.name, qty: 1, tier: 'single' }];
  const extra = core.resolvedProductionExtras(counts, data, methods)
    .find(item => item.id === 'whole-pan:d1:single');
  assert.ok(extra);
  assert.equal(extra.panCount, 1);
  assert.equal(extra.totalServings, 8);
  assert.equal(extra.customerServings, 1);
  assert.equal(extra.ownerServings, 7);

  const totals = Object.fromEntries(core.operationalIngredientTotals(counts, data, methods)
    .totals.map(item => [item.key, item.baseAmount]));
  near(totals.reduced_cream_cheese, 340);
  near(totals.cottage, 300);
  near(totals.fage, 100);
  near(totals.egg, 2);
  near(totals.whey_vanilla, 40);
  near(totals.cornstarch, 23);
  near(totals.vanilla, 4);
  near(totals.lemon, 18);
  near(totals.salt, 1);
  near(totals.strawberry, 250);
  near(totals.honey, 62.5);
});
