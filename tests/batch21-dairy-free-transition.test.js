const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const config = require('../config/order-config.js');
const details = require('../config/menu-details.js').batches[21];
const production = require('../operations/nutrition/production-data.js').meals;
const methods = require('../operations/cook-day-methods.js');
const engine = require('../operations/production-engine.js');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'operations/nutrition/next-menu-label-data.js'), 'utf8'), context);
const labels = context.window.PRPD_NEXT_LABEL_DATA.meals;

const ingredient = (id, key, tier = 'lean') => production[id].tiers[tier].ingredients.find(item => item.key === key);

test('sitewide Biryani uses plant yogurt in both chicken and its required cup', () => {
  assert.ok(ingredient('m1', 'so_delicious_plain_yogurt').amount > 30);
  assert.equal(ingredient('m1', 'fage'), undefined);
  assert.equal(details.m1.tiers.lean.allergens.includes('MILK'), false);
  assert.equal(production.m1.service.sideCupComponents[0].gramsPerMeal, 30);
  assert.equal(labels.m1.tiers.lean.nutritionComplete, false);
  assert.equal(details.x0.variants['lean-biryani3-butter2'].components[1].allergens.includes('MILK'), true);
});

test('sitewide Buffalo sauce removes milk from potato but not cheesy pinwheels', () => {
  assert.equal(ingredient('m3', 'franks_buffalo_wings').amount, 15);
  assert.equal(ingredient('m3', 'buffalo_sauce'), undefined);
  assert.equal(details.m3.tiers.lean.allergens.includes('MILK'), false);
  assert.equal(details.a1.tiers.single.allergens.includes('MILK'), true);
  assert.ok(ingredient('a1', 'franks_buffalo_wings', 'single'));
  assert.equal(labels.m3.tiers.lean.nutritionComplete, false);
});

test('private dairy-free cheese variants stay out of public menu with unchanged egg portions', () => {
  for (const id of ['p4', 'p5']) {
    assert.equal(production[id].plannerOnly, true);
    assert.equal(production[id].tiers.lean.ingredients.some(item => item.key === 'fage'), false);
    assert.equal(labels[id].tiers.lean.nutritionComplete, false);
    assert.equal(Object.values(config.menu).flat().some(item => item.id === id), false);
    assert.ok(production[id].tiers.bulk);
  }
  assert.ok(ingredient('p4', 'daiya_mozzarella'));
  assert.ok(ingredient('p5', 'daiya_mozzarella'));
  assert.ok(ingredient('b1', 'mozzarella'));
  assert.ok(ingredient('m4', 'mozzarella'));
  assert.equal(ingredient('p4', 'egg_white').amount, ingredient('b1', 'egg_white').amount);
  assert.equal(ingredient('p4', 'egg_white', 'bulk').amount, ingredient('b1', 'egg_white', 'bulk').amount);
  assert.equal(production.p6, undefined);
  assert.equal(labels.p6, undefined);
  assert.ok(ingredient('m1', 'chicken_thigh_raw'));
  assert.equal(ingredient('m1', 'chicken_breast_raw'), undefined);
});

test('tilapia and popcorn chicken remain recorded without milk', () => {
  assert.equal(details.m5.tiers.lean.allergens.includes('MILK'), false);
  assert.equal(details.a2.tiers.single.allergens.includes('MILK'), false);
});

test('cook-day planner uses the new products and holds their labels for verification', () => {
  const taskKeys = id => methods.meals[id].prepBatches.flatMap(task => task.ingredientKeys || []);
  for (const id of ['m1']) {
    assert.ok(taskKeys(id).includes('so_delicious_plain_yogurt'));
    assert.equal(taskKeys(id).includes('fage'), false);
  }
  for (const id of ['m3', 'a1']) {
    assert.ok(taskKeys(id).includes('franks_buffalo_wings'));
    assert.equal(taskKeys(id).includes('buffalo_sauce'), false);
  }
  for (const id of ['p4', 'p5']) {
    assert.ok(taskKeys(id).includes('daiya_mozzarella'));
    assert.equal(taskKeys(id).includes('mozzarella'), false);
  }
  const plan = engine.compileProduction({
    data: require('../operations/nutrition/production-data.js'), methods, config,
    counts: ['m1','m3','a1','p4','p5'].map(id => ({ id, tier: id === 'a1' ? 'single' : 'lean', qty: 1 })),
  });
  assert.deepEqual(plan.diagnostics.errors, []);
  assert.equal(plan.diagnostics.releaseReady, false);
  assert.equal(plan.diagnostics.holds.length, 5);
});

test('Butter Chicken has a measured butter and cream sauce', () => {
  assert.equal(ingredient('m2', 'heavy_cream').amount, 20);
  assert.equal(ingredient('m2', 'butter').amount, 8);
  assert.equal(ingredient('m2', 'fage').amount, 15);
  assert.equal(ingredient('m2', 'shan_butter_chicken').amount, 10);
  for (const key of ['onion', 'tomato_paste', 'paprika', 'cumin']) assert.equal(ingredient('m2', key), undefined);
  assert.equal(config.menu.mains.find(item => item.id === 'm2').macros.cal, 635);
  assert.equal(labels.m2.tiers.lean.nutritionComplete, false);
  assert.ok(methods.meals.m2.steps.some(step => step.includes('heavy cream')));
});
