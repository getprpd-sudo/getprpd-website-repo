const test = require('node:test');
const assert = require('node:assert/strict');

const config = require('../config/order-config');
const production = require('../operations/nutrition/production-data');
const methods = require('../operations/cook-day-methods');

test('current planner matches the published Batch 19 wing and pizza builds', () => {
  assert.equal(config.batch.number, 19);
  assert.equal(production.batch, 19);
  assert.equal(methods.batch, 19);
  const wingIds = Object.entries(production.meals)
    .filter(([, meal]) => meal.name === 'Mango Habanero Chicken Wings')
    .map(([id]) => id);
  assert.deepEqual(wingIds, ['m6']);
  assert.deepEqual(methods.meals.m6.wingPiecesByTier, { lean: 6, bulk: 8 });
  assert.deepEqual(methods.meals.m6.sideCupComponents.map(cup => cup.gramsPerMeal), [40, 20]);
  assert.equal(production.meals.m6.tiers.bulk.portionControl.minimumPieces, 8);

  assert.equal(production.meals.b3.name, 'Beef Bacon Breakfast Pizza');
  assert.match(methods.meals.b3.steps.join(' '), /pizza stone.*425 F.*125 g Bulk/s);
  assert.match(methods.meals.b3.steps.join(' '), /bacon bits/);
  assert.ok(production.meals.b3.tiers.lean.ingredients.some(item =>
    item.name === 'H-E-B fat-free mozzarella' && item.amount === 30));
});
