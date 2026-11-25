const test = require('node:test');
const assert = require('node:assert/strict');
const config = require('../config/order-config.js');
const { summarizeOrder } = require('../order-nutrition.js');

const find = id => Object.values(config.menu).flat().find(dish => dish.id === id);

test('Weekly Five expands into five actual portions for meal totals and averages', () => {
  const bundle = find('x0');
  const result = summarizeOrder([{dish: bundle, tier: 'lean-biryani3-butter2', qty: 1}], config.menu);
  assert.equal(result.mealCount, 5);
  assert.deepEqual(result.meals, {cal: 2905, protein: 217, carbs: 242, fat: 115});
  assert.deepEqual(result.average, {cal: 581, protein: 43, carbs: 48, fat: 23});
  assert.deepEqual(result.missing, []);
});

test('snacks and cookie pack units stay outside meal averages', () => {
  const lines = [
    {dish: find('m5'), tier: 'lean', qty: 2},
    {dish: find('a2'), tier: null, qty: 1},
    {dish: find('d1'), tier: 'three', qty: 1},
  ];
  const result = summarizeOrder(lines, config.menu);
  assert.equal(result.mealCount, 2);
  assert.equal(result.extraCount, 4);
  assert.deepEqual(result.meals, {cal: 1020, protein: 110, carbs: 108, fat: 20});
  assert.deepEqual(result.average, {cal: 510, protein: 55, carbs: 54, fat: 10});
  assert.equal(result.extras.cal, 1305);
  assert.equal(result.all.cal, 2325);
});
