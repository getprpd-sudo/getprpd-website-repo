const nodeTest = require('node:test');
// Historical Batch 10 assertions intentionally do not run against the live
// Batch 11 data files. Current coverage lives in menu-batch11.test.js.
const test = nodeTest.skip;
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const core = require('../operations/cook-day-core.js');
const production = require('../operations/nutrition/production-data.js');
const methods = require('../operations/cook-day-methods.js');

const everyTier = Object.entries(production.meals).flatMap(([id, recipe]) =>
  Object.keys(recipe.tiers).map(tier => ({id, tier, qty:1, name:recipe.name})));
const publicIds = Object.keys(methods.dishNames);
const text = method => JSON.stringify(method);

test('a valid header-only order response is treated as an empty batch', () => {
  const parsed = core.arrayRowsToOrders([
    ['Submitted At', 'Batch', 'Items', 'Order ID'],
  ], { batch: { number: 10 } });
  assert.deepEqual(parsed, { orders: [], warnings: [] });
});

test('Batch 10 production and named executable methods have exact parity', () => {
  assert.equal(production.batch, 10);
  assert.equal(methods.batch, 10);
  assert.equal(publicIds.length, 18);
  assert.deepEqual(Object.keys(methods.meals).sort(), Object.keys(production.meals).sort());
  for (const id of publicIds) {
    assert.equal(methods.meals[id].recipeName, production.meals[id].name);
    assert.equal(methods.dishNames[id], production.meals[id].name);
    assert.deepEqual(methods.meals[id], methods.methodsByName[production.meals[id].name]);
  }
});

test('every active recipe ingredient has exactly one measured prep and component owner', () => {
  assert.deepEqual(core.auditPlanCoverage(everyTier, production, methods).errors, []);
  for (const id of publicIds) {
    const method = methods.meals[id];
    for (const [tier, recipe] of Object.entries(production.meals[id].tiers)) {
      for (const ingredient of recipe.ingredients) {
        const owners = method.prepBatches.filter(card => card.includeAllRecipeIngredients || card.ingredientKeys.includes(ingredient.key));
        if(owners.some(o=>o.componentRef || o.excludeComponentRefs?.length)) {
          const batches=core.componentPlan([{id,tier,qty:1,name:production.meals[id].name}],production,methods,0).prepBatches;
          const used=batches.flatMap(b=>b.ingredients).filter(i=>i.key===ingredient.key).reduce((s,i)=>s+i.baseAmount,0);
          assert.ok(Math.abs(used-ingredient.amount)<.11,`${id} ${tier} ${ingredient.key} measured split`);
        } else assert.equal(owners.length, 1, `${id} ${tier} ${ingredient.key} prep owner`);
      }
    }
  }
});

test('historical returns are preserved by name independently of reused slots', () => {
  const french = methods.methodHistoryByName['French Toast'].find(item => item.batch === 8);
  const biryani = methods.methodHistoryByName['Chicken Biryani'].find(item => item.batch === 7);
  const parmesan = methods.methodHistoryByName['Creamy Garlic Parmesan Chicken Pasta'].find(item => item.batch === 9);
  assert.ok(french && biryani && parmesan);
  assert.match(text(parmesan.method), /whole thighs|thighs whole/i);
  assert.match(text(methods.meals.m6), /1\.5-2 cm cubes/);
  assert.notEqual(french.method, methods.meals.b2);
  assert.notEqual(methods.meals.d1, methods.methodsByName[methods.dishNames.d1]);
});

test('Cajun uses controlled cubed thighs, protein spaghetti, tomato, water and cream cheese', () => {
  const method = methods.meals.m6;
  const keys = method.prepBatches.flatMap(card => card.ingredientKeys);
  for (const key of ['chicken_thigh_raw','protein_pasta','crushed_tomatoes','water','regular_cream_cheese','smoked_paprika','oregano','thyme','cayenne']) assert.ok(keys.includes(key));
  for (const key of ['chicken_breast_raw','broth','penne_dry','parmesan','fage','broccoli']) assert.ok(!keys.includes(key));
  assert.match(method.source, /explicitly adapted/);
  assert.match(method.steps.join(' '), /measured increments/);
  assert.doesNotMatch(text(method), /\b(?:200|225|275|330)\s*g.*raw|\b(?:50|65|75|85)\s*g.*pasta/i);
});

test('original Oreo formula and correct physical wrap counts remain pinned', () => {
  const oreoKeys = methods.meals.d3.prepBatches.flatMap(card => card.ingredientKeys);
  assert.deepEqual(oreoKeys, ['cottage','whey','oreo_pudding_mix','honey','cocoa','maple_syrup','oreo_thin']);
  assert.match(methods.meals.d3.source, /page 19/);
  assert.match(text(methods.meals.a1), /exactly 4 pinwheels/);
  assert.match(text(methods.meals.a3), /two owner-standard 70-calorie/i);
  assert.match(text(methods.meals.m1), /bone-in leg quarters/);
  assert.ok(methods.meals.m1.prepBatches[0].ingredientKeys.includes('leg_quarter_raw'));
});

test('Nouman kofta uses the controlled five-piece 330g build', () => {
  const recipe = production.meals.p1.tiers.lean;
  const beef = recipe.ingredients.find(item => item.key === 'beef_96_raw');
  assert.equal(beef.amount, 330);
  assert.equal(production.meals.p1.name, 'High-Protein Beef Kofta & Roasted Vegetables');
  assert.ok(production.meals.p1.aliases.includes('96/4 Beef Kofta'));
  assert.match(text(methods.meals.p1), /five equal logs|5 kofta/i);
});

test('only Enchilada chicken cooks ahead while cold-item chicken cooks on Cook Day', () => {
  assert.equal(methods.meals.m4.proteinCook.prepDayComplete, true);
  for (const id of ['a1','a2','a3']) {
    assert.equal(methods.meals[id].proteinCook.prepDayComplete, false, id);
    assert.match(methods.meals[id].steps.join(' '), /Pan-cook.*165 F/i);
    assert.match(methods.meals[id].steps.join(' '), /rapid-cool.*41 F/i);
    assert.equal(methods.meals[id].cookDayEquipment.lane, 'stovetop');
  }
  for (const id of ['d1','d2','d3']) assert.equal(methods.meals[id].cookDayEquipment.lane, 'cold-release');
  assert.match(methods.meals.m4.steps[0], /one assembled pan/);
  assert.equal(methods.meals.m4.panBatch.name, 'One deep 9 x 13-inch pan');
  assert.deepEqual(methods.meals.m4.panBatch.portionBasis, {lean:498,bulk:716});
});

test('Halal Cart and cold-item thighs use the pan while breakfast eggs stay fresh for Cook Day', () => {
  assert.equal(methods.meals.m2.cookDayEquipment.lane, 'stovetop');
  assert.match(methods.meals.m2.steps.join(' '), /wide pan.*uncrowded batches.*deep browning/i);
  const breakfastKit=methods.meals.b3.prepBatches.find(batch=>batch.name==='Breakfast Burrito prep kit');
  assert.equal(breakfastKit.stage,'ahead');
  assert.match(breakfastKit.steps.join(' '), /uncracked.*Cook Day.*better texture/i);
});

test('parallel work separates distinct rice and seafood from long oven work', () => {
  assert.equal(methods.meals.m1.riceBatchGroup, 'common');
  assert.equal(methods.meals.m2.riceBatchGroup, 'halal-yellow-rice');
  assert.equal(methods.meals.m3.riceBatchGroup, 'biryani');
  assert.equal(methods.meals.m7.riceBatchGroup, 'vegetable-rice');
  assert.equal(methods.meals.m8.riceBatchGroup, 'vegetable-rice');
  assert.ok(methods.meals.m1.cookDayEquipment.sequence < methods.meals.m8.cookDayEquipment.sequence);
  assert.ok(methods.meals.m4.cookDayEquipment.sequence < methods.meals.m6.cookDayEquipment.sequence);
});

test('current plans have no automatic extras or stale fixed custom counts', () => {
  assert.deepEqual(methods.productionExtras, []);
  assert.deepEqual(methods.familyAllocations, []);
  assert.deepEqual(methods.familyPlatingReservations, []);
  assert.deepEqual(core.resolvedProductionExtras(everyTier, production, methods), []);
  for (const id of ['p1','p2','p3']) assert.doesNotMatch(text(methods.meals[id]), /all three|three meals|three containers/i);
  assert.doesNotMatch(text(publicIds.map(id => methods.meals[id])), /Batch 9|Banana Cream Pie|Hot Honey Chicken Sliders|Caesar Crunch|BBQ Chicken Lavash/);
});

test('workflow allows ready oven, stove, griddle and clean assembly work concurrently', () => {
  const workflow = core.buildWorkflow(everyTier, methods, {teamSize:2,burners:2});
  const cookText = text(workflow.cookStages);
  assert.ok(workflow.parallelBlocks.some(block => block.primary.length && block.while.length));
  assert.match(cookText, /Run at most 1 watched stove\/griddle task/);
  assert.match(cookText, /does not wait for unrelated proteins/);
  assert.match(cookText, /one-pan protein-and-pasta/);
  assert.match(cookText, /fully reset it before handling ready-to-eat food/);
  assert.doesNotMatch(cookText, /before every protein is released|before breakfast finishing|Do not begin dough filling|Cook every protein in one continuous block/);
});

test('prep completion does not falsely convert raw custard and dry grain into cooked food', () => {
  for (const completedPrep of [[], ['rice']]) {
    const workflow = core.buildWorkflow(everyTier, methods, {completedPrep});
    const workflowText = text([workflow.prepStages,workflow.cookStages]);
    assert.match(workflowText, /measured prep, not a completed cooked batch/);
    assert.match(workflowText, /Cook pancakes, French Toast, eggs, or fillings when the Cook Day card requires it/);
    assert.match(workflowText, /Start each Cook Day rice group/);
    assert.doesNotMatch(workflowText, /Every non-protein cooked component moves to Prep Day|sides are already complete|Verify every Prep Day breakfast egg|Friday should begin/);
    if (completedPrep.length) assert.match(workflowText, /does not mark every grain, pasta, egg, or side as cooked/);
  }
});

test('workflow wording changes do not mutate counts, methods or production calculations', () => {
  const counts = JSON.parse(JSON.stringify(everyTier));
  const countSnapshot = JSON.stringify(counts);
  const methodSnapshot = JSON.stringify(methods);
  const before = core.componentPlan(counts, production, methods, 0);
  core.buildWorkflow(counts, methods, {teamSize:3,burners:4,completedPrep:['rice']});
  assert.equal(JSON.stringify(counts), countSnapshot);
  assert.equal(JSON.stringify(methods), methodSnapshot);
  assert.deepEqual(core.componentPlan(counts, production, methods, 0), before);
});

test('planner wording follows recipe-defined cooking instead of stale blanket cook-ahead gates', () => {
  const planner = fs.readFileSync(path.join(__dirname, '..', 'operations', 'cook-day-planner.html'), 'utf8');
  assert.doesNotMatch(planner, /Release the one Prep Day rice batch|Do not cook separate rice pulls on Cook Day/);
  assert.doesNotMatch(planner, /Then sanitize once:|Run one continuous protein block|Do not remake Prep Day rice, potatoes, vegetables, eggs, sauces, or pasta/);
  assert.doesNotMatch(planner, /Reconcile all proteins and close the raw-protein station|No sides, dough, breakfast components, assembly, or plating may start until this gate is complete/);
  assert.doesNotMatch(planner, /This batch was made once on Prep Day|Do not recook potatoes, eggs, sauces, or grains/);
  assert.match(planner, /A dry measured rice allocation is not cooked rice/);
  assert.match(planner, /Cook or release each component according to its active recipe card/);
  assert.match(planner, /Fully reset any shared raw station before clean work/);
});

test('recipe lock signs production content without release-version false positives', () => {
  const planner = fs.readFileSync(path.join(__dirname, '..', 'operations', 'cook-day-planner.html'), 'utf8');
  const signatureBody = planner.match(/function recipePlanSignature\([\s\S]*?\n    \}/)?.[0] || '';
  assert.match(signatureBody, /build:DATA\.meals/);
  assert.match(signatureBody, /method:METHODS\.meals/);
  assert.match(signatureBody, /sharedProteinSeasoning:METHODS\.sharedProteinSeasoning/);
  assert.doesNotMatch(signatureBody, /dataVersion|methodsVersion|DATA\.version|METHODS\.version/);
  assert.match(planner, /lock:recipe-signature-schema.*production-content-v2/);
});
