const assert = require('node:assert/strict');
// Historical Batch 12 suite pending a complete frozen Batch 12 fixture.
const { skip: test } = require('node:test');

const config = require('../config/order-config');
const production = require('../operations/nutrition/production-data');
const methods = require('../operations/cook-day-methods');
const kitchen = require('../operations/kitchen-dashboard');
const core = require('../operations/cook-day-core');
const costs = require('../operations/costing/current-menu-costs');
const business = require('../api/_business-center-core');

const publicDishes = [
  ...config.menu.breakfasts,
  ...config.menu.mains,
  ...config.menu.desserts,
  ...config.menu.addons,
];

test('Batch 12 publishes the selected 17-dish rotation without untested Hot Pockets', () => {
  assert.equal(config.batch.number, 12);
  assert.equal(config.batch.published, true);
  assert.equal(config.batch.remindersEnabled, false);
  assert.equal(config.batch.deliveryDate, 'Saturday, September 26, 2026');
  assert.equal(publicDishes.length, 17);
  assert.equal(publicDishes.some(dish => dish.name === 'Cheeseburger Hot Pockets'), false);
  assert.equal(publicDishes.find(dish => dish.name === 'Chicken Tikka Snack Wrap').newThisWeek, true);
});

test('Egg Bites use a controlled 24-well batch instead of a meal-count multiplier', () => {
  const method = methods.meals.b1;
  const serialized = JSON.stringify(method);
  assert.equal(method.recipeName, 'Egg Bites with Potato Hash');
  assert.match(serialized, /1,440 g/);
  assert.match(serialized, /24 standard wells/);
  assert.match(serialized, /60 g/);
  assert.match(serialized, /4 egg bites and 120 g potato hash/);
  assert.match(serialized, /6 egg bites and 150 g potato hash/);
  assert.deepEqual(config.menu.breakfasts[0].macros, {cal:335, protein:32, carbs:27, fiber:3, fat:10});
  assert.deepEqual(config.menu.breakfasts[0].bulkMacros, {cal:475, protein:48, carbs:36, fiber:4, fat:15});
});

test('Chicken Tikka keeps raw marinade separate and uses the shared white sauce inside one medium tortilla', () => {
  const method = methods.meals.a1;
  const marinade = method.prepBatches.find(card => card.componentRef === 'tikka-marinade');
  const finish = method.prepBatches.find(card => card.componentRef === 'white-garlic-jalapeno-sauce');
  const coldKit = method.prepBatches.find(card => card.type === 'cold-kit');
  assert.ok(marinade);
  assert.ok(finish);
  assert.match(JSON.stringify(marinade), /contacts raw chicken/i);
  assert.match(JSON.stringify(finish), /never contacts raw chicken/i);
  assert.equal(finish.sauceDelivery, 'incorporated');
  assert.deepEqual(coldKit.ingredientKeys.includes('small_tortilla'), true);
  assert.deepEqual(config.menu.addons.find(dish => dish.id === 'a1').macros, {cal:295, protein:35, carbs:25, fiber:16, fat:11});
  assert.equal(method.assemblyGuide.single.some(step => /1 complete medium wrap/.test(step)), true);
});

test('every Batch 12 tier clears the planner coverage and arithmetic review', () => {
  const counts = Object.entries(production.meals).flatMap(([id, meal]) =>
    Object.keys(meal.tiers).map(tier => ({id, name:meal.name, tier, qty:1})),
  );
  const model = kitchen.build(counts, production, methods, core, {
    rawProteinBufferPct:5,
    riceBufferPct:15,
    riceYieldFactor:2.75,
  });
  assert.equal(production.batch, 12);
  assert.equal(counts.length, 30);
  assert.deepEqual(model.review.errors, []);
  assert.deepEqual(model.review.warnings, []);
});

test('current Batch 12 planner keeps shared seasoning, sauces, rice, and Cook Day work complete', () => {
  const rows = [
    ['b2','lean',2], ['b2','bulk',3], ['m1','lean',6], ['m1','bulk',3],
    ['m2','lean',4], ['m2','bulk',5], ['m3','lean',1], ['m3','bulk',4],
    ['m4','lean',4], ['m4','bulk',1], ['m5','lean',1], ['m6','lean',5],
    ['m6','bulk',1], ['m7','lean',3], ['m7','bulk',2], ['d1','single',1],
    ['a1','single',4],
  ];
  const counts = rows.map(([id,tier,qty]) => ({id,tier,qty,name:production.meals[id].name}));
  const model = kitchen.build(counts, production, methods, core, 0);

  assert.deepEqual(model.review.errors, []);
  const savory = model.component.seasoningGroups.find(group => group.name === 'Shared savory thigh base');
  assert.deepEqual(savory.allocations.map(item => item.dish), [
    'Chicken Shakshuka', 'BBQ Chicken Mac & Cheese', 'Chicken Enchilada Bake',
  ]);
  assert.equal(savory.baseSeasoning.find(item => item.key === 'salt').grams, 11.4);

  const proteins = kitchen.render(model, 'proteins');
  assert.match(proteins, /Tikka chicken marinade/);
  assert.match(proteins, /80 g.*FAGE Total 0%/s);
  assert.match(proteins, /Whole thighs; trim and flatten only/);

  const sauces = kitchen.render(model, 'sauces');
  assert.match(sauces, /White garlic-jalapeño yogurt sauce/);
  assert.match(sauces, /1,120 g · 27 cups · 4 incorporated portions · 100 g reserve/);
  assert.match(sauces, /BBQ Mac customer sauce cups/);
  assert.match(sauces, /270 g/);
  assert.doesNotMatch(sauces, /BBQ sauce added during Mac assembly/);
  assert.doesNotMatch(sauces, /Sweet Heat/);

  const ahead = kitchen.render(model, 'ahead');
  assert.match(ahead, /Rice, pasta &amp; grains/);
  assert.match(ahead, /Cilantro-garlic-lime rice · one shared pot/);
  assert.match(ahead, /545 g dry/);
  assert.match(ahead, /BBQ Mac macaroni/);
  assert.match(ahead, /500 g.*Muscle Mac high-protein macaroni and cheese/s);
  assert.doesNotMatch(ahead, /Cook Cottage Pie beef filling/);

  const cook = kitchen.render(model, 'cook');
  assert.match(cook, /Brown the displayed raw beef to 160 F on Cook Day/);
  assert.match(cook, /Bring forward the recorded Prep Day macaroni yield/);
  assert.doesNotMatch(cook, /Cook the exact dry high-protein macaroni allocation/);
});

test('Batch 12 BBQ Mac scales its pasta once and routes it to the pasta station', () => {
  const counts = [
    {id:'m2', tier:'lean', qty:4, name:production.meals.m2.name},
    {id:'m2', tier:'bulk', qty:5, name:production.meals.m2.name},
  ];
  const model = kitchen.build(counts, production, methods, core, 0);
  const macaroni = model.jobs.find(job => job.name === 'BBQ Mac macaroni');
  assert.ok(macaroni);
  assert.equal(macaroni.type, 'starch-ahead');
  assert.equal(macaroni.stage, 'ahead');
  assert.equal(macaroni.ingredients.find(item => item.key === 'protein_mac').baseAmount, 500);
  assert.equal(model.jobs.filter(job => job.ingredients.some(item => item.key === 'protein_mac')).length, 1);
});

test('Build-a-Week exposes only the approved Harissa and Buffalo five-meal splits', () => {
  const bundle = config.menu.exclusives[0];
  assert.equal(bundle.price, 49.99);
  assert.equal(bundle.servingCount, 5);
  assert.deepEqual(bundle.variants.map(variant => variant.components), [
    [{id:'x1', tier:'lean', qty:3}, {id:'x2', tier:'lean', qty:2}],
    [{id:'x1', tier:'lean', qty:2}, {id:'x2', tier:'lean', qty:3}],
  ]);
  assert.equal(production.meals.x1.name, 'Harissa Honey Chicken');
  assert.equal(production.meals.x2.name, 'Loaded Buffalo Chicken Potato');
});

test('current direct-cost payload matches Batch 12 public dishes', () => {
  assert.equal(costs.batchNumber, 12);
  assert.equal(Object.keys(costs.directCosts).length, 30);
  assert.ok(costs.directCosts['egg bites with potato hash|lean'] > 0);
  assert.ok(costs.directCosts['chicken tikka snack wrap|single'] > 0);
  assert.ok(costs.directCosts['build-a-week: harissa + buffalo|3 harissa + 2 buffalo'] > 0);
  assert.ok(costs.directCosts['build-a-week: harissa + buffalo|2 harissa + 3 buffalo'] > 0);
  assert.equal(Object.keys(costs.directCosts).some(key => key.includes('hot pocket')), false);
});

test('Business Center costs both Build-a-Week variants instead of marking them unknown', () => {
  const lines = business.parseItemLines([
    '1x Build-a-Week: Harissa + Buffalo (3 Harissa + 2 Buffalo) - $49.99',
    '1x Build-a-Week: Harissa + Buffalo (2 Harissa + 3 Buffalo) - $49.99',
  ].join('\n'), {batchNumber:12});
  assert.deepEqual(lines.map(line => [line.tier, line.cost, line.known]), [
    ['3 Harissa + 2 Buffalo', 13.29, true],
    ['2 Harissa + 3 Buffalo', 13.49, true],
  ]);
});
