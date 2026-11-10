const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const config = require('../config/order-config');
const data = require('../operations/nutrition/production-data');
const methods = require('../operations/cook-day-methods');
const engine = require('../operations/production-engine');
const kitchen = require('../operations/kitchen-dashboard');
const core = require('../operations/cook-day-core');
const fixture = require('./fixtures/batch14/current-counts-2026-10-07.json');

const counts = fixture.counts.map(([id, tier, qty]) => ({ id, tier, qty }));
const compile = () => engine.compileProduction({
  counts,
  config,
  data,
  methods,
  buffer: { rawProteinBufferPct: 5, riceBufferPct: 15, riceYieldFactor: 2.75 },
  sauceConfig: methods.weeklySauces,
});

test('effective menu, generated recipes, and executable methods all use Batch 14', () => {
  assert.equal(config.batch.number, 14);
  assert.equal(data.batch, 14);
  assert.equal(methods.batch, 14);
  assert.equal(data.version, 'batch-14-current-v1');
  assert.deepEqual(Object.keys(methods.meals).sort(), Object.keys(data.meals).sort());
  const configured = [
    ...config.menu.breakfasts,
    ...config.menu.mains,
    ...config.menu.desserts,
    ...config.menu.addons,
    ...config.plannerOnly,
  ].map(item => item.id).sort();
  assert.deepEqual(Object.keys(data.meals).sort(), configured);
});

test('browser loader resolves the same current batch instead of falling back to Batch 12', () => {
  const context = { window: {}, console };
  context.globalThis = context.window;
  vm.createContext(context);
  for (const file of [
    'config/order-config.js',
    'operations/nutrition/production-data.js',
    'operations/cook-day-methods.js',
  ]) vm.runInContext(fs.readFileSync(require.resolve(`../${file}`), 'utf8'), context, { filename: file });
  assert.equal(context.window.PRPD_ORDER_CONFIG.batch.number, 14);
  assert.equal(context.window.PRPD_PRODUCTION_DATA.batch, 14);
  assert.equal(context.window.PRPD_COOK_METHODS.batch, 14);
  assert.ok(context.window.PRPD_COOK_METHODS.meals.bw1, 'Chicken Shakshuka method loaded');
});

test('owner-approved component-bowl blueprint is current and assigned by recipe identity', () => {
  assert.equal(methods.portionStandards.version, 'owner-approved-2026-10-07-v1');
  assert.deepEqual(methods.portionStandards.common.cookedStarchG, { lean: 120, bulk: 160 });
  assert.deepEqual(methods.portionStandards.common.vegetableSideG, { lean: 75, bulk: 100 });
  assert.deepEqual(methods.portionStandards.chickenThighComponent.finishedCookedBeforeSauceG, { lean: 160, bulk: 210 });
  assert.deepEqual(methods.portionStandards.chickenThighComponent.workingRawEquivalentG, { lean: 232.56, bulk: 305.23 });
  assert.deepEqual(methods.portionStandards.groundBeef90Component.rawRecipeInputG, { lean: 210, bulk: 300 });
  assert.deepEqual(methods.portionStandards.groundBeef90Component.workingFinishedSeasonedComponentG, { lean: 175, bulk: 250 });

  for (const id of ['m1', 'm6']) {
    assert.equal(methods.meals[id].portionPolicy.status, 'blanket-standard', `${id} should use the chicken bowl blueprint`);
    assert.equal(methods.meals[id].portionPolicy.standardKey, 'chickenThighComponent');
    assert.match(methods.meals[id].assemblyGuide.lean.join(' '), /160 g cooked boneless skinless chicken thigh before sauce.*232\.56 g.*120 g cooked starch.*75 g vegetable side/);
    assert.match(methods.meals[id].assemblyGuide.bulk.join(' '), /210 g cooked boneless skinless chicken thigh before sauce.*305\.23 g.*160 g cooked starch.*100 g vegetable side/);
  }

  const rendered=kitchen.render(kitchen.buildFromPlan(compile()),'pack');
  assert.match(rendered, /160 g cooked boneless skinless chicken thigh before sauce/);
  assert.match(rendered, /210 g cooked boneless skinless chicken thigh before sauce/);
});

test('portion blueprint preserves true recipe exceptions and Nouman actual 96/4', () => {
  for (const id of ['b3', 'm2', 'm3', 'm4', 'm5', 'm7', 'a1', 'a2', 'bw1', 'p1', 'p3']) {
    assert.notEqual(methods.meals[id].portionPolicy.status, 'blanket-standard', `${id} must remain recipe-specific`);
  }
  assert.match(methods.meals.p1.portionPolicy.reason, /actual 96\/4/);

  const beefBowl=methods.resolvePortionStandard({
    name:'Controlled Ground Beef Potato Bowl',
    proteinKey:'beef_90_raw',
    tiers:['lean','bulk'],
    ingredientKeys:['beef_90_raw','potato'],
  });
  assert.deepEqual(beefBowl, {status:'blanket-standard',standardKey:'groundBeef90Component',starchKey:'potato'});

  const meatballs=methods.resolvePortionStandard({
    name:'Ground Beef Meatball Bowl',
    proteinKey:'beef_90_raw',
    tiers:['lean','bulk'],
    ingredientKeys:['beef_90_raw','rice_dry'],
  });
  assert.equal(meatballs.status, 'recipe-specific-exception');
});

test('Cook Day yield planning uses the measured thigh yield and preserves other protein factors', () => {
  const component=(id,tier='lean')=>core.componentPlan([
    {id,name:data.meals[id].name,tier,qty:1},
  ],data,methods,0).proteinGroups[0];

  const thigh=component('m1');
  assert.equal(thigh.expectedCookedAmount, Math.round(thigh.baseAmount*(430/625)*10)/10);
  assert.match(thigh.yieldLabel, /measured boneless-thigh cooked yield.*430 g cooked from 625 g raw.*68\.8%/);

  const beef=component('b3');
  const shrimp=component('m4');
  assert.equal(beef.expectedCookedAmount, Math.round(beef.baseAmount*.75*10)/10);
  assert.equal(shrimp.expectedCookedAmount, Math.round(shrimp.baseAmount*.80*10)/10);
});

test('current six-order preview compiles all 45 items with owner-released quality checks', () => {
  const plan = compile();
  assert.deepEqual(plan.diagnostics.errors, []);
  assert.equal(plan.totalMeals, 45);
  assert.deepEqual(plan.diagnostics.holds, []);
  assert.equal(plan.diagnostics.releaseReady, true);
  for (const id of ['b4','m2','a3']) assert.match(data.meals[id].qualityChecks, /pack|weight|quality|hold/i);
  assert.equal(plan.cups.total, 27);
});

test('Batch 14 shared sauces scale once across every assigned dish', () => {
  const plan = compile();
  const honey = plan.sauceGroups.find(group => group.family === 'honey-barbecue-mustard');
  const yogurt = plan.sauceGroups.find(group => group.family === 'garlic-herb-yogurt');
  assert.ok(honey);
  assert.ok(yogurt);
  assert.ok(Math.abs(honey.totalInputGrams - 180) < .01);
  assert.equal(honey.cupPlan.reduce((sum, row) => sum + row.cups, 0), 4);
  assert.ok(Math.abs(yogurt.totalInputGrams - 925) < .01);
  assert.equal(yogurt.cupPlan.reduce((sum, row) => sum + row.cups, 0), 20);
  assert.ok(Math.abs(yogurt.incorporated.reduce((sum, row) => sum + row.inputGrams, 0) - 25) < .01);
  assert.equal(plan.requirements.find(row => row.key === 'sauce_cup').required, 27);
});

test('Nouman pack-out gets nine Sweet Heat cups and three lemon-garlic dressing cups', () => {
  const customCounts = [
    {id:'p1',name:data.meals.p1.name,tier:'lean',qty:3},
    {id:'p2',name:data.meals.p2.name,tier:'lean',qty:3},
  ];
  const plan = engine.compileProduction({
    counts:customCounts,
    config,
    data,
    methods,
    buffer:{rawProteinBufferPct:5,riceBufferPct:15,riceYieldFactor:2.75},
    sauceConfig:methods.weeklySauces,
  });
  assert.deepEqual(plan.diagnostics.errors, []);
  assert.equal(plan.cups.totalCustomer, 12);
  assert.equal(plan.requirements.find(row => row.key === 'sauce_cup').required, 12);
  const sweetHeat = plan.cups.customer.find(row => row.batchGroup === 'sweet-heat');
  const dressing = plan.cups.customer.find(row => row.batchGroup === 'lebanese-dressing');
  assert.equal(sweetHeat.cups, 9);
  assert.equal(dressing.cups, 3);
  const sweetBatch = plan.sauceGroups.find(group => group.family === 'batch13-sweet-heat');
  assert.ok(Math.abs(sweetBatch.totalInputGrams - 405) < .01);
});

test('both local tools regenerate current recipes and auto-sync on open', () => {
  const planner = fs.readFileSync(require.resolve('../operations/cook-day-planner.html'), 'utf8');
  const grocery = fs.readFileSync(require.resolve('../operations/grocery-list-app.js'), 'utf8');
  const plannerLauncher = fs.readFileSync(require.resolve('../open-cook-day-planner.bat'), 'utf8');
  const groceryLauncher = fs.readFileSync(require.resolve('../open-grocery-list.bat'), 'utf8');
  assert.match(planner, /initialCookLogReady\.then\(\(\) => syncOrders\(\)\)/);
  assert.match(grocery, /savedStateReady\.then\(\(\) => syncOrders\(\)\)/);
  assert.match(plannerLauncher, /generate_production_data\.py/);
  assert.match(groceryLauncher, /generate_production_data\.py/);
  assert.match(plannerLauncher, /was not opened with stale data/);
  assert.match(groceryLauncher, /was not opened with stale data/);
});

test('production packet uses executable recipes without a duplicate day-split board', () => {
  const allCards = Object.values(methods.meals).flatMap(method => method.prepBatches || []);
  const renderedText = allCards.flatMap(card => [card.name, card.instruction, ...(card.steps || [])]).join(' ');
  assert.doesNotMatch(renderedText, /complete measured recipe kit|complete the component exactly as written|weigh every displayed component ingredient/i);
  assert.equal(methods.meals.b4.prepBatches.length, 1);
  assert.equal(methods.meals.b4.prepBatches[0].deferred, true);
  assert.match(methods.meals.b4.prepBatches[0].name, /RESERVE FOR COOK DAY/i);
  assert.match(methods.meals.b4.cookDayReservations.join(' '), /raw batter is not held overnight/i);
  const plan = compile();
  const dashboard = kitchen.render(kitchen.buildFromPlan(plan), 'all');
  assert.doesNotMatch(dashboard, /DO TODAY|RESERVE FOR TOMORROW|kd-day-split/);
  assert.match(dashboard, /Prep list/);
  assert.match(dashboard, /Batch recipes/);
  assert.match(dashboard, /Cook &amp; pack/);
  assert.match(dashboard, /Fill the containers/);
  assert.doesNotMatch(dashboard, /data-kd-stage="pack"/);
  assert.match(dashboard, /Blueberry Vanilla Protein Baked Oatmeal Squares/);
});

test('every active recipe is decomposed into the actual Prep Day workstations', () => {
  const requiredCards = {
    b1:['Bake egg bites','Roast potato hash'],
    b2:['Cook French Toast','Fill French Toast syrup cups'],
    m1:['Cook Streetcorn rice','Cook and finish creamy street corn'],
    m3:['Boil Meatball Arrabbiata pasta','Cook arrabbiata sauce'],
    m4:['Cook cilantro-garlic-lime rice','Cook shrimp vegetables','Measure garlic-butter shrimp finish'],
    m5:['Cook cilantro-garlic-lime rice','Roast Tandoori broccoli'],
    m6:['Cook Mediterranean rice','Stage Mediterranean toppings'],
    m7:['Prepare garlic instant mash','Roast steak broccoli'],
    a2:['Make honey-lime BBQ finish','Count flatbread assembly set'],
    a3:['Boil Caprese protein pasta','Make Caprese balsamic-yogurt dressing'],
    bw1:['Cook Shakshuka tomato-pepper base'],
    p1:['Stage Nouman kachumber · beef meals (3 of 6)'],
    p2:['Stage Nouman moist chicken qeema','Stage Nouman kachumber · chicken meals (3 of 6)'],
  };
  for (const [id,names] of Object.entries(requiredCards)) {
    const actual=(methods.meals[id].prepBatches || []).map(card=>card.name);
    for (const name of names) assert.ok(actual.includes(name), `${data.meals[id].name} is missing ${name}`);
  }

  for (const [id,meal] of Object.entries(data.meals)) {
    const recipeKeys=new Set(Object.values(meal.tiers).flatMap(tier=>tier.ingredients.map(item=>item.key)));
    const assignedKeys=new Set((methods.meals[id].prepBatches || []).flatMap(card=>card.ingredientKeys || []));
    assert.deepEqual([...recipeKeys].filter(key=>!assignedKeys.has(key)),[],`${meal.name} has ingredients with no Prep Day or reserved Cook Day task`);
  }

  const dashboard = kitchen.render(kitchen.buildFromPlan(compile()), 'batch');
  assert.match(dashboard,/Cook arrabbiata sauce/);
  assert.match(dashboard,/Broccoli roasting/);
  assert.equal((dashboard.match(/Broccoli roasting/g)||[]).length,1);
  assert.match(dashboard,/Make Caprese balsamic-yogurt dressing/);
  assert.doesNotMatch(dashboard,/DO TODAY|RESERVE FOR TOMORROW/);
});
