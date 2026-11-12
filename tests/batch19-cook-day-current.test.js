const test = require('node:test');
const assert = require('node:assert/strict');

const config = require('../config/order-config');
const production = require('../operations/nutrition/production-data');
const methods = require('../operations/cook-day-methods');
const engine = require('../operations/production-engine');
const report = require('../operations/tools/generate-current-grocery-report');
const kitchen = require('../operations/kitchen-dashboard');

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
  assert.ok(production.meals.m6.tiers.lean.ingredients.some(item => item.key === 'avocado_oil'));
  assert.ok(!production.meals.m6.tiers.lean.ingredients.some(item => item.key === 'sunflower_oil'));

  assert.equal(production.meals.b3.name, 'Beef Bacon Breakfast Pizza');
  assert.match(methods.meals.b3.steps.join(' '), /pizza stone.*425 F.*125 g Bulk/s);
  assert.match(methods.meals.b3.steps.join(' '), /bacon bits/);
  assert.ok(production.meals.b3.tiers.lean.ingredients.some(item =>
    item.name === 'H-E-B fat-free mozzarella' && item.amount === 30));
});

test('Batch 19 BBQ Mac, burrito, and wing cards compile into a shoppable plan', () => {
  const orders = [{orderId:'B19-GROCERY-QA',customer:'Fixture customer',included:true,sourceStatus:'active',items:[
    {id:'m1',tier:'lean',qty:1},
    {id:'b1',tier:'lean',qty:1},
    {id:'m6',tier:'lean',qty:1},
    {id:'m6',tier:'bulk',qty:1},
  ]}];
  const plan = engine.compileProduction({orders,data:production,methods,config,...report.defaultSettings(methods)});
  assert.deepEqual(plan.diagnostics.errors, []);
  assert.ok(plan.requirements.some(item => item.key === 'mango_habanero_sauce' && item.required > 0));
});

test('Batch 19 kitchen cards follow the prep and cook day handoff', () => {
  const orders = [{orderId:'B19-WORKFLOW-QA',customer:'Fixture customer',included:true,sourceStatus:'active',items:[
    {id:'b3',tier:'lean',qty:1},{id:'b2',tier:'lean',qty:1},
    {id:'m4',tier:'lean',qty:1},{id:'m3',tier:'lean',qty:1},
    {id:'m6',tier:'lean',qty:1},{id:'m1',tier:'lean',qty:1},
    {id:'a1',tier:'single',qty:1},{id:'a2',tier:'single',qty:1},
  ]}];
  const plan = engine.compileProduction({orders,data:production,methods,config,...report.defaultSettings(methods)});
  assert.deepEqual(plan.diagnostics.errors, []);
  const model = kitchen.buildFromPlan(plan,plan.counts);
  const prep = kitchen.render(model,'batch');
  const cook = kitchen.render(model,'cook');
  assert.ok(prep.indexOf('Quick-pickle red onion') < prep.indexOf('PRPD lasagna tomato meat sauce'));
  assert.ok(prep.indexOf('PRPD lasagna tomato meat sauce') < prep.indexOf('Lasagna ricotta layer'));
  assert.ok(prep.indexOf('Lasagna ricotta layer') < prep.indexOf('Make Garlic Herb Yogurt'));
  assert.ok(!prep.includes('Prepare Popcorn breading station'));
  assert.ok(!prep.includes('Breakfast Skillet eggs'));
  assert.ok(!prep.includes('Toss wings with clean mango habanero after cooking'));
  assert.ok(cook.indexOf('Beef Bacon Breakfast Pizza') < cook.indexOf('BBQ Chicken Mac &amp; Cheese'));
  assert.match(cook,/Cook the tier eggs fresh/);
  assert.match(cook,/immediately before baking/);
});
