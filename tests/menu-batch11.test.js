// Historical Batch 11 suite pending a complete frozen Batch 11 fixture.
const { skip: test } = require('node:test');
const assert = require('node:assert/strict');

const config = require('../config/order-config');
const production = require('../operations/nutrition/production-data');
const methods = require('../operations/cook-day-methods');
const core = require('../operations/cook-day-core');
const orderApi = require('../api/order')._test;

test('family and home-party meals never join the label queue, even when a caller omits exemptions', () => {
  const labelData = { meals: { m4: { tiers: { lean: {}, bulk: {} } }, a1: { tiers: { single: {} } } } };
  const orders = [
    { customer: 'Duaa', items: [{ id: 'a1', tier: 'single', qty: 1 }, { id: 'm4', tier: 'lean', qty: 1 }] },
    { customer: 'Talal', items: [{ id: 'm4', tier: 'bulk', qty: 3 }, { id: 'w1', tier: 'single', qty: 5 }] },
    { customer: 'Owner Custom', items: [{ id: 'h1', tier: 'single', qty: 8 }] },
  ];
  const labels = core.labelProductionOrders(orders, labelData, ['Rida', 'Owner Custom']);
  assert.deepEqual(labels, []);
  assert.deepEqual(core.labelProductionOrders(orders, labelData, []), []);
  assert.deepEqual(core.labelProductionOrders([
    { customer: 'Talal Hassan', items: [{ id: 'm4', tier: 'bulk', qty: 3 }] },
    { customer: 'Duaa Hassan', items: [{ id: 'm4', tier: 'lean', qty: 1 }] },
  ], labelData, []), []);
  assert.deepEqual(core.labelProductionOrders([
    { customer: 'Paying Customer', items: [{ id: 'a1', tier: 'single', qty: 1 }] },
    { customer: 'Party Guest', items: [{ id: 'a1', tier: 'single', qty: 8, packageType: 'home_party_box' }] },
    { customer: 'Other Custom', labelExempt: true, items: [{ id: 'm4', tier: 'lean', qty: 2 }] },
  ], labelData, []).map(order => order.customer), ['Paying Customer']);
  const allocation = core.dishPackAllocation(orders, 'm4', methods.labelExemptCustomers);
  assert.match(JSON.stringify(allocation), /Duaa/);
  assert.match(JSON.stringify(allocation), /Talal/);
});

test('Batch 11 meatball size matches the complete measured mix', () => {
  const mix = methods.meals.m4.prepBatches.find(card => card.type === 'protein-mix');
  assert.equal(mix.pieceTargets.lean.gramsPerPiece, 32.5);
  assert.equal(mix.pieceTargets.bulk.gramsPerPiece, 32.5);
  assert.equal(mix.reservePct, 0);
  assert.equal(methods.meals.m4.piecePlan.formedGrams, 32.5);
  assert.doesNotMatch(JSON.stringify(methods.meals.m4), /25-26 g|25\.5|12% damage reserve/);
});

test('Batch 11 public menu and production identity are synchronized', () => {
  assert.equal(config.batch.number, 11);
  assert.equal(config.batch.deliveryDate, 'Sunday, September 20, 2026');
  assert.equal(config.batch.remindersEnabled, false);
  assert.equal(Object.values(config.menu).flat().length, 18);
  assert.equal(production.batch, 11);
  assert.equal(methods.batch, 11);
  assert.deepEqual(Object.keys(methods.meals).sort(), Object.keys(production.meals).sort());
  assert.deepEqual(Object.keys(production.meals).sort(), [
    'a1','a2','a3','b1','b2','b3','b4','d1','d2','d3','h1','m1','m2','m3','m4','m5','m6','m7','w1','x1','x2',
  ]);
});

test('approved new dishes use the exact controlled identity and calculated macros', () => {
  const bok = config.menu.mains.find(item => item.id === 'm1');
  assert.equal(bok.name, 'Chinese-Style Bok Choy Chicken');
  assert.equal(bok.newThisWeek, true);
  assert.deepEqual(bok.macros, { cal: 605, protein: 46, carbs: 66, fiber: 4, fat: 17 });
  assert.deepEqual(bok.bulkMacros, { cal: 850, protein: 67, carbs: 87, fiber: 6, fat: 24 });
  const bokKeys = production.meals.m1.tiers.lean.ingredients.map(item => item.key);
  assert.equal(bokKeys.includes('hoisin'), true);
  assert.equal(bokKeys.includes('bok_choy'), true);
  assert.equal(bokKeys.some(key => /tamari|fish|oyster/.test(key)), false);

  const caprese = config.menu.addons.find(item => item.id === 'a3');
  assert.equal(caprese.name, 'Caprese Protein Pasta Box');
  assert.equal(caprese.newThisWeek, true);
  assert.deepEqual(caprese.macros, { cal: 345, protein: 32, carbs: 54, fiber: 14, fat: 4 });
  assert.equal(caprese.price, 7.99);
  assert.match(JSON.stringify(methods.meals.a3), /20 g balsamic-yogurt/);
});

test('Build-a-Week selections expand into five real Lean production meals', () => {
  const catalog = orderApi.catalogForConfig(config);
  const line = orderApi.normalizeItems([{ id:'x0', tier:'med3-street2', qty:1 }], catalog)[0];
  assert.equal(line.subtotal, 49.99);
  assert.equal(line.servingCount, 5);
  assert.deepEqual(orderApi.paymentCounts([line]), { standard:5, beef:0, dessert:0 });

  const parsed = core.parseItemsText('1x Build-a-Week Exclusive Duo (3 Mediterranean + 2 Streetcorn) - $49.99', config);
  assert.deepEqual(parsed.warnings, []);
  assert.deepEqual(parsed.items.map(item => [item.id,item.tier,item.qty]), [['x1','lean',3],['x2','lean',2]]);
});

test('every active Batch 11 ingredient is represented in the planner method model', () => {
  const everyTier = Object.entries(production.meals).flatMap(([id, recipe]) =>
    Object.keys(recipe.tiers).map(tier => ({ id, tier, qty:1, name:recipe.name }))
  );
  assert.deepEqual(core.auditPlanCoverage(everyTier, production, methods).errors, []);
});

test('family wings are one grocery-backed meal, never a public nutrition card', () => {
  const wing = config.plannerOnly.find(item => item.id === 'w1');
  assert.equal(wing.category, 'addon');
  assert.equal(Object.values(config.menu).flat().some(item => item.id === 'w1'), false);
  const parsed = core.parseItemsText('4x Mango Habanero Chicken Wings', config);
  assert.deepEqual(parsed.warnings, []);
  assert.deepEqual(parsed.items.map(item => [item.id,item.tier,item.qty]), [['w1','single',4]]);
  const ingredients = production.meals.w1.tiers.single.ingredients;
  assert.equal(ingredients.find(item => item.key === 'chicken_wings_raw').amount, 400);
  assert.equal(ingredients.find(item => item.key === 'mango_habanero_sauce').amount, 45);
  assert.equal(production.meals.w1.macros, undefined);
  const grocery = core.operationalIngredientTotals([{id:'w1',name:wing.name,tier:'single',qty:4}], production, methods, {rawProteinBufferPct:5});
  assert.equal(grocery.totals.find(item => item.key === 'chicken_wings_raw').bufferedAmount, 1680);
  assert.equal(grocery.totals.find(item => item.key === 'mango_habanero_sauce').bufferedAmount, 180);
  assert.deepEqual(core.labelEligibleOrders([{customer:'Talal Hassan',items:parsed.items}], methods.labelExemptCustomers), []);
});

test('eight home-party hummus boxes use half-breads and home containers without customer packaging', () => {
  const parsed = core.parseItemsText('8x Mediterranean Chicken Hummus Box', config);
  assert.deepEqual(parsed.warnings, []);
  assert.deepEqual(parsed.items.map(item => [item.id,item.tier,item.qty,item.packageType]), [['h1','single',8,'home_party_box']]);
  const ingredients = production.meals.h1.tiers.single.ingredients;
  assert.equal(ingredients.find(item => item.key === 'shawarma_bread').amount, 0.5);
  assert.equal(ingredients.find(item => item.key === 'hummus').amount, 60);
  const packaging = require('../operations/grocery-list-core').packagingRequirements(
    core.productionPlan(core.aggregateCounts([{items:parsed.items}])),
    [{customer:'Owner Custom',items:parsed.items}], {sauces:[]}, 0, 0,
  );
  assert.equal(packaging.find(item => item.key === 'grab_go_container'), undefined);
  assert.equal(packaging.find(item => item.key === 'meal_container').required, 8);
  assert.equal(packaging.find(item => item.key === 'paper_bag'), undefined);
});

test('Friday party boxes remain on Prep Day and never become Saturday customer bags', () => {
  const kitchen = require('../operations/kitchen-dashboard');
  const counts = [
    {id:'h1',name:'Mediterranean Chicken Hummus Box',tier:'single',qty:8},
    {id:'m6',name:'High-Protein Beef Lasagna',tier:'lean',qty:1},
  ];
  const workflow = core.buildWorkflow(counts,methods);
  assert.equal(methods.meals.h1.prepDayOnly,true);
  assert.deepEqual(workflow.prepStages.slice(0,3).map(stage=>stage.key),['reconcile','produce','proteins']);
  assert.ok(workflow.prepStages.some(stage=>stage.dishes.includes('Mediterranean Chicken Hummus Box')));
  assert.equal(workflow.cookStages.some(stage=>stage.dishes.includes('Mediterranean Chicken Hummus Box')),false);
  const model = kitchen.build(counts,production,methods,core,{rawProteinBufferPct:5});
  assert.deepEqual(model.review.errors,[]);
  assert.match(kitchen.render(model,'ahead'),/Friday home-party chicken cook and box assembly/);
  assert.doesNotMatch(kitchen.render(model,'cook'),/data-recipe="dish:h1"/);
  assert.doesNotMatch(kitchen.render(model,'proteins'),/Missing raw-protein method/);
  const lasagnaMeatSauce = methods.meals.m6.prepBatches.find(card=>card.name==='PRPD lasagna tomato meat sauce');
  assert.equal(lasagnaMeatSauce.stage,'ahead');
  assert.match(kitchen.render(model,'ahead'),/PRPD lasagna tomato meat sauce/);
});

test('Batch 11 consolidates onion and fat-free mozzarella and drains canned peas and carrots', () => {
  const tiers = Object.values(production.meals).flatMap(meal => Object.values(meal.tiers));
  const keys = new Set(tiers.flatMap(tier => tier.ingredients.map(item => item.key)));
  assert.equal(keys.has('red_onion'), false);
  assert.equal(keys.has('part_skim_mozzarella'), false);
  assert.equal(keys.has('mixed_vegetables'), false);
  assert.equal(keys.has('onion'), true);
  assert.equal(keys.has('mozzarella'), true);
  assert.equal(keys.has('canned_peas_carrots'), true);
  assert.equal(production.meals.m5.tiers.lean.ingredients.find(item => item.key === 'canned_peas_carrots').amount, 80);
  assert.equal(production.meals.m6.tiers.lean.ingredients.find(item => item.key === 'mozzarella').amount, 28.25);
  assert.match(JSON.stringify(methods.meals.m5), /Drain canned peas and carrots/);
  assert.match(JSON.stringify(methods.meals.h1), /eight clean home meal containers/);
  assert.deepEqual(config.menu.mains.find(item => item.id === 'm6').macros, {cal:530,protein:51,carbs:38,fiber:5,fat:19});
});
