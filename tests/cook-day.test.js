const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const core = require('../operations/cook-day-core');
const config = require('../operations/active/BATCH_7_DRAFT_ORDER_CONFIG');
const production = require('../operations/nutrition/production-data');
const methods = require('../operations/cook-day-methods');

const allDishes = Object.values(config.menu).flat();
const amount = (id, tier, key) => production.meals[id].tiers[tier].ingredients.find(item => item.key === key)?.amount ?? 0;

test('Batch 7 order rows import while archived batches are ignored', () => {
  const csv = [
    'Submitted At,Batch,Delivery Date,First Name,Last Name,Phone,Items,Exact Total,Total (Rounded),Notes,Order ID',
    '8/17/2026 1:00 PM,Batch 7,Saturday August 22,Test,Customer,4695550101,"2x Cajun Garlic Salmon (Lean) - $27.98\n1x Chicken Caesar Crunch Box - $8.99",36.97,37,,PRPD-B7-20260817-ABCD1234',
    '8/10/2026 1:00 PM,Batch 6,Old Date,Old,Order,4695550102,"1x Hot Honey Chicken Sliders (Lean)",10.99,11,,OLD',
  ].join('\n');
  const result = core.rowsToOrders(csv, config);
  assert.equal(result.orders.length, 1);
  assert.deepEqual(result.orders[0].items.map(item => [item.id, item.tier, item.qty]), [['m6','lean',2],['a3','single',1]]);
});

test('production data and methods exactly match all 18 published dishes', () => {
  const ids = allDishes.map(dish => dish.id).sort();
  assert.equal(config.batch.number, 7);
  assert.equal(production.batch, 7);
  assert.equal(methods.batch, 7);
  assert.deepEqual(Object.keys(production.meals).sort(), ids);
  assert.deepEqual(Object.keys(methods.meals).sort(), ids);
  for (const dish of allDishes) {
    assert.equal(production.meals[dish.id].name, dish.name);
    const method = methods.meals[dish.id];
    assert.ok(method.equipment.length, `${dish.name} equipment`);
    assert.ok(method.steps.length >= 3, `${dish.name} steps`);
    assert.ok(method.prepSteps.length, `${dish.name} prep`);
    for (const tier of Object.keys(production.meals[dish.id].tiers)) {
      assert.ok(method.assemblyGuide[tier].length >= 2, `${dish.name} ${tier} plating`);
    }
  }
});

test('raw protein reserve remains a separate purchasing allowance', () => {
  const totals = core.ingredientTotals([
    { id:'m1', name:'Hot Honey Chicken Sliders', tier:'lean', qty:2 },
    { id:'m6', name:'Cajun Garlic Salmon', tier:'bulk', qty:1 },
  ], production, { rawProteinBufferPct:5, riceBufferPct:15 }).totals;
  const chicken = totals.find(item => item.key === 'chicken_thigh_raw');
  const salmon = totals.find(item => item.key === 'pink_salmon_raw');
  assert.equal(chicken.baseAmount, 200);
  assert.equal(chicken.bufferedAmount, 210);
  assert.equal(salmon.baseAmount, 300);
  assert.equal(salmon.bufferedAmount, 315);
});

test('compatible chicken uses one neutral base and distinct Desi pulls remain separate', () => {
  const counts = [
    { id:'b4', name:'Power Bowl', tier:'lean', qty:1 }, { id:'m1', name:'Hot Honey Chicken Sliders', tier:'lean', qty:1 },
    { id:'m2', name:'Chicken Biryani', tier:'lean', qty:1 }, { id:'m3', name:'Butter Chicken', tier:'lean', qty:1 },
    { id:'m4', name:'Sweet Chili Chicken with Vegetable Rice', tier:'lean', qty:1 }, { id:'m7', name:'Loaded Buffalo Chicken Potato', tier:'lean', qty:1 },
    { id:'a2', name:'Mini Chicken Snack Wrap', tier:'single', qty:1 }, { id:'a3', name:'Chicken Caesar Crunch Box', tier:'single', qty:1 },
  ];
  const plan = core.componentPlan(counts, production, methods, { rawProteinBufferPct:0 });
  assert.equal(plan.seasoningGroups.length, 1);
  assert.deepEqual(plan.seasoningGroups[0].allocations.map(item => item.dishId), ['b4','m1','m4','m7','a2','a3']);
  assert.ok(plan.seasoningGroups[0].baseSeasoning.some(item => item.name === 'Garlic powder'));
});

test('salmon is Cajun roasted rather than falsely marketed as blackened', () => {
  for (const tier of ['lean','bulk']) {
    const ingredients = production.meals.m6.tiers[tier].ingredients;
    assert.ok(ingredients.some(item => item.key === 'pink_salmon_raw'));
    assert.ok(ingredients.some(item => item.key === 'quinoa_dry'));
    assert.ok(ingredients.some(item => item.key === 'green_beans'));
    assert.equal(ingredients.some(item => item.key === 'potato' || item.key === 'rice_dry'), false);
  }
  assert.match(methods.meals.m6.steps.join(' '), /skin-side down/i);
  assert.match(methods.meals.m6.steps.join(' '), /145 F/);
  const salmon = config.menu.mains.find(item => item.id === 'm6');
  assert.doesNotMatch(`${salmon.name} ${salmon.description}`, /blackened/i);
});

test('butter chicken is permanently broth-free', () => {
  for (const tier of ['lean','bulk']) {
    const ingredients = production.meals.m3.tiers[tier].ingredients;
    assert.equal(ingredients.some(item => item.key === 'broth'), false);
    assert.ok(ingredients.some(item => item.key === 'water'));
  }
  assert.match(methods.meals.m3.steps.join(' '), /never use broth/i);
});

test('Batch 6 yield corrections survive the Batch 7 rotation', () => {
  assert.equal(amount('m1','lean','chicken_thigh_raw'), 100);
  assert.equal(amount('m1','bulk','chicken_thigh_raw'), 133);
  assert.equal(amount('m7','lean','potato'), 200);
  assert.equal(amount('m7','bulk','potato'), 200);
  assert.equal(amount('b2','lean','egg_white'), 75);
  assert.equal(amount('b2','bulk','egg_white'), 150);
  assert.equal(amount('b2','bulk','potato'), 0);
});

test('Sweet Heat is assigned once to Sandwich and Power Bowl only', () => {
  const plan = core.weeklySaucePlan([{ customer:'A', items:[
    { id:'b2', tier:'lean', qty:2 }, { id:'b4', tier:'bulk', qty:1 }, { id:'m1', tier:'lean', qty:4 },
  ]}], methods.weeklySauces);
  assert.equal(plan.eligibleMealCount, 3);
  assert.equal(plan.customerCupsTotal, 3);
  assert.equal(plan.totalPhysicalCups, 4);
  assert.equal(plan.sauces[0].gramsPerCup, 45);
  assert.equal(methods.meals.b2.sideCup.gramsPerMeal, 45);
  assert.equal(methods.meals.b4.sideCup.gramsPerMeal, 45);
  assert.equal(methods.meals.m1.sideCup, null);
});

test('Caesar Crunch Box keeps dressing and croutons separate', () => {
  const box = production.meals.a3.tiers.single.ingredients;
  for (const key of ['chicken_thigh_raw','lettuce','cucumber','parmesan','croutons']) assert.ok(box.some(item => item.key === key), key);
  assert.equal(methods.meals.a3.sideCups, 1);
  assert.equal(methods.meals.a3.sideBags, 1);
  assert.match(methods.meals.a3.assemblyGuide.single.join(' '), /dressing cup/i);
  assert.match(methods.meals.a3.assemblyGuide.single.join(' '), /crouton bag/i);
});

test('label plan prints exact mixed counts with blanks only at the end', () => {
  const plan = core.labelPlan([
    { id:'b1', name:'Blueberry Cheesecake Protein Pancakes', tier:'lean', qty:3 },
    { id:'m6', name:'Cajun Garlic Salmon', tier:'bulk', qty:4 },
    { id:'d1', name:'Baked Strawberry-Lemon Protein Cheesecake', tier:'single', qty:1 },
  ], {}, 4, allDishes);
  assert.deepEqual(plan.rows.map(row => [row.id,row.tier,row.labels]), [['b1','lean',3],['m6','bulk',4],['d1','single',1]]);
  assert.equal(plan.totalLabels, 8);
  assert.equal(plan.totalSheets, 2);
});

test('Grab and Go names and prices match the approved rotation', () => {
  assert.deepEqual(config.menu.addons.map(item => [item.name,item.price]), [
    ['PRPD Protein Box',7.99], ['Mini Chicken Snack Wrap',7.99], ['Chicken Caesar Crunch Box',8.99],
  ]);
  const counts = core.countsFromMap({ 'a1:single':2, 'a2:single':3, 'a3:single':4 }, config);
  assert.deepEqual(counts.map(item => [item.name,item.qty]), [
    ['PRPD Protein Box',2], ['Mini Chicken Snack Wrap',3], ['Chicken Caesar Crunch Box',4],
  ]);
});

test('pack-out retains delivery details and expands physical quantities', () => {
  const rows = [
    ['Submitted At','Batch','Delivery Date','First Name','Last Name','Phone','Items','Exact Total','Total (Rounded)','Notes','Order ID','Email','Address','City','ZIP','Delivery Notes'],
    ['8/17/2026','Batch 7','Saturday','Test','Customer','9725550101','2x Cajun Garlic Salmon (Lean)\n1x Chicken Caesar Crunch Box',36.97,37,'No nuts','PRPD-B7-PACK-1','test@example.com','100 Main St','Frisco','75035','Leave at door'],
  ];
  const plan = core.packoutPlan(core.arrayRowsToOrders(rows, config).orders);
  assert.equal(plan[0].totalItems, 3);
  assert.deepEqual(plan[0].items[0].units, [1,2]);
  assert.equal(plan[0].address, '100 Main St');
});

test('planner retains one rice cook and consolidated sauce presentation', () => {
  const planner = fs.readFileSync(path.join(__dirname, '..', 'operations', 'cook-day-planner.html'), 'utf8');
  assert.match(planner, /One rice cook, then divide/);
  assert.match(planner, /All sauces, finishes, and customer cups/);
  assert.match(planner, /Simple plating instructions/);
  assert.match(planner, /Desserts to pack/);
});

test('no family meals are silently carried into a new batch', () => {
  assert.deepEqual(methods.familyPlatingReservations, []);
  assert.deepEqual(methods.labelExemptCustomers, ['Talal','Duaa','Rida']);
});
