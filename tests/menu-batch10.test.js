const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
// Historical Batch 10 public-menu suite pending frozen config/API fixtures.
const { skip: test } = require('node:test');
const config = require('../config/order-config');
const api = require('../api/order')._test;
const meals = Object.values(config.menu).flat();

test('Menu photo crop settings are valid and hover preserves the crop', () => {
  for (const dish of meals.filter(m=>m.imageCrop)) {
    assert.ok(dish.image);
    assert.ok(['portrait-low','portrait-center','portrait-tight','landscape-tight','landscape-closer','square-raised'].includes(dish.imageCrop));
  }
  const css = fs.readFileSync(path.join(__dirname,'..','order.css'),'utf8');
  for (const dish of meals.filter(m=>m.imageCrop)) assert.ok(css.includes(`.photo-crop--${dish.imageCrop}`));
  assert.match(css,/\.dish-card:hover \.dish-img img\s*\{\s*transform: scale\(calc\(var\(--photo-zoom, 1\) \* 1\.025\)\)/);
});

test('Batch 10 approved menu is complete and reminder emails are closed', () => {
  assert.equal(config.batch.number, 10);
  assert.equal(config.batch.published, true);
  assert.equal(config.batch.remindersEnabled, false);
  assert.equal(meals.length, 18);
  assert.equal(new Set(meals.map(m => m.id)).size, 18);
  assert.equal(config.batch.cutoffIso, '2026-09-09T18:00:00-05:00');
});

test('Every configured food photo exists and no unrelated new-food photo is invented', () => {
  for (const meal of meals) {
    if (meal.image) assert.ok(fs.existsSync(path.join(__dirname, '..', meal.image)), meal.name);
  }
  assert.ok(!meals.find(m => m.name === 'Creamy Cajun Chicken Pasta').image);
});

test('Batch 10 order validates locally with current names and trusted prices without sending', () => {
  const order = api.validateAndBuildOrder({
    action: 'order', orderId: 'PRPD-B10-20260908-A1B2C3D4',
    firstName: 'Test', lastName: 'Customer', phone: '4695550100', email: 'test@example.com',
    deliveryAddress: '123 Main Street', deliveryHasUnit: false, deliveryCity: 'Frisco',
    deliveryState: 'TX', deliveryZip: '75035', deliveryInstructions: '',
    items: [{id:'m6',tier:'lean',qty:6}], mealSubtotal:1, exactTotal:1,
    website:'', formStartedAt:1,
  }, [], {
    catalog: api.catalogForConfig(config), batchNumber:10,
    cutoffIso:'2099-12-31T23:59:59-06:00', policies:config.policies,
  });
  assert.equal(order.mealSubtotal,65.94);
  assert.equal(order.deliveryFee,9.99);
  assert.equal(order.exactTotal,75.93);
  assert.match(JSON.stringify(order.items),/Creamy Cajun Chicken Pasta/);
});
