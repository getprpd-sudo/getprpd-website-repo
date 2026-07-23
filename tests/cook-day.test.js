const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');

const core = require('../operations/cook-day-core');
const config = require('../config/order-config');
const production = require('../operations/nutrition/production-data');
const methods = require('../operations/cook-day-methods');

test('Orders CSV imports quoted multiline items and filters to the active batch', () => {
  const csv = [
    'Submitted At,Batch,Delivery Date,First Name,Last Name,Phone,Items,Exact Total,Total (Rounded),Notes,Order ID',
    '7/20/2026 1:00 PM,Batch 3,Saturday July 25,Rida,Khan,4695550101,"2x High Protein Omelette (Lean) - $21.98\n1x Premium NY Strip Steak (Bulk) - $26.99\nDelivery - Free",49,49,"No onions",PRPD-B3-20260720-ABCD1234',
    '7/15/2026 1:10 PM,Batch 1,Old Date,Old,Order,4695550102,"9x French Toast (Lean) - $98.91",99,99,,OLD',
  ].join('\n');

  const result = core.rowsToOrders(csv, config);
  assert.equal(result.orders.length, 1);
  assert.equal(result.orders[0].customer, 'Rida Khan');
  assert.deepEqual(result.orders[0].items.map(item => [item.id, item.tier, item.qty]), [
    ['b1', 'lean', 2],
    ['m8', 'bulk', 1],
  ]);
});

test('tab-separated copied sheet rows are accepted', () => {
  const tsv = [
    'Submitted At\tBatch\tDelivery Date\tFirst Name\tLast Name\tPhone\tItems\tExact Total\tTotal (Rounded)\tNotes\tOrder ID',
    '7/20\tBatch 3\tSaturday\tJake\tMiller\t4695550102\t"1x Blueberry Cheesecake Protein Pancakes (Bulk) - $12.99\n2x Lotus Biscoff Cheesecake - $13.98"\t27\t27\t\tPRPD-B3-20260720-EEEE1111',
  ].join('\n');
  const result = core.rowsToOrders(tsv, config);
  assert.equal(result.orders.length, 1);
  assert.deepEqual(result.orders[0].items.map(item => [item.id, item.tier, item.qty]), [
    ['b4', 'bulk', 1],
    ['d2', 'single', 2],
  ]);
});

test('ingredient totals scale audited builds and keep the PRPD extra separate', () => {
  const counts = [
    { id: 'm2', name: 'Mexican Streetcorn Chicken Bowl', tier: 'lean', qty: 4 },
    { id: 'm6', name: 'Korean Bulgogi Beef Bowl', tier: 'bulk', qty: 2 },
  ];
  const result = core.ingredientTotals(counts, production, { prpdExtraServings: 1 });
  const chicken = result.totals.find(item => item.key === 'chicken_thigh_raw');
  const beef = result.totals.find(item => item.key === 'beef_strips_raw');
  assert.equal(chicken.baseAmount, 800);
  assert.equal(chicken.bufferedAmount, 1000);
  assert.equal(beef.baseAmount, 500);
  assert.equal(beef.bufferedAmount, 750);
});

test('pooled raw-protein reserve does not inflate meals, sides, or packaging ingredients', () => {
  const counts = [
    { id: 'm2', name: 'Mexican Streetcorn Chicken Bowl', tier: 'lean', qty: 4 },
  ];
  const buffer = { prpdExtraServings: 0, rawProteinBufferPct: 5 };
  const plan = core.productionPlan(counts, buffer);
  const totals = core.ingredientTotals(counts, production, buffer).totals;
  const chicken = totals.find(item => item.key === 'chicken_thigh_raw');
  const rice = totals.find(item => item.key === 'rice_dry');
  assert.deepEqual(plan.map(item => [item.customer, item.extra, item.total]), [[4, 0, 4]]);
  assert.equal(chicken.baseAmount, 800);
  assert.equal(chicken.bufferedAmount, 840);
  assert.equal(rice.bufferedAmount, rice.baseAmount);
});

test('temporary rice controls stage dry-rice allowance and use the conservative measured-yield factor', () => {
  const counts = [{ id: 'm2', name: 'Halal Cart Chicken + Yellow Rice', tier: 'lean', qty: 2 }];
  const buffer = {
    prpdExtraServings: 0,
    rawProteinBufferPct: 5,
    riceBufferPct: 15,
    riceYieldFactor: 2.75,
  };
  const totals = core.ingredientTotals(counts, production, buffer).totals;
  const rice = totals.find(item => item.key === 'rice_dry');
  assert.equal(rice.baseAmount, 80);
  assert.equal(rice.bufferedAmount, 92);
  const plan = core.componentPlan(counts, production, methods, buffer);
  assert.equal(plan.rice[0].bufferedAmount, 92);
  assert.equal(plan.rice[0].expectedCookedAmount, 253);
});

test('pooled reserve applies to steak production without inflating its sides', () => {
  const counts = [{ id: 'm8', name: 'Premium NY Strip Steak', tier: 'lean', qty: 2 }];
  const totals = core.ingredientTotals(
    counts,
    production,
    { prpdExtraServings: 0, rawProteinBufferPct: 5 },
  ).totals;
  const steak = totals.find(item => item.key === 'ny_strip_raw');
  const potato = totals.find(item => item.key === 'potato');
  assert.equal(steak.bufferedAmount, Math.round(steak.baseAmount * 1.05 * 10) / 10);
  assert.equal(potato.bufferedAmount, potato.baseAmount);
});

test('one PRPD extra is produced when a dish has one selected tier', () => {
  const counts = [{ id: 'b1', name: 'Egg Bites', tier: 'lean', qty: 2 }];
  const result = core.ingredientTotals(counts, production, { prpdExtraServings: 1 });
  const eggs = result.totals.find(item => item.key === 'egg');
  const perServing = production.meals.b1.tiers.lean.ingredients.find(item => item.key === 'egg').amount;
  assert.equal(eggs.baseAmount, perServing * 2);
  assert.equal(eggs.bufferedAmount, perServing * 3);
});

test('Lean and Bulk orders share one Bulk-sized PRPD extra for the dish', () => {
  const counts = [
    { id: 'm2', name: 'Mexican Streetcorn Chicken Bowl', tier: 'lean', qty: 4 },
    { id: 'm2', name: 'Mexican Streetcorn Chicken Bowl', tier: 'bulk', qty: 2 },
  ];
  const plan = core.productionPlan(counts, { prpdExtraServings: 1 });
  assert.deepEqual(plan.map(item => [item.tier, item.customer, item.extra, item.total]), [
    ['lean', 4, 0, 4],
    ['bulk', 2, 1, 3],
  ]);
  const chicken = core.ingredientTotals(counts, production, { prpdExtraServings: 1 })
    .totals.find(item => item.key === 'chicken_thigh_raw');
  const leanChicken = production.meals.m2.tiers.lean.ingredients.find(item => item.key === 'chicken_thigh_raw').amount;
  const bulkChicken = production.meals.m2.tiers.bulk.ingredients.find(item => item.key === 'chicken_thigh_raw').amount;
  assert.equal(chicken.baseAmount, leanChicken * 4 + bulkChicken * 2);
  assert.equal(chicken.bufferedAmount, leanChicken * 4 + bulkChicken * 3);
});

test('production breakdown separates customer meals and one PRPD extra', () => {
  assert.deepEqual(
    core.productionBreakdown(4, { prpdExtraServings: 1 }),
    { customer: 4, extra: 1, total: 5 },
  );
});

test('label plan prints Avery 5168 labels for paid customer meals only', () => {
  const plan = core.labelPlan([
    { id: 'b1', name: 'Egg Bites', tier: 'lean', qty: 4 },
    { id: 'm4', name: 'Peri Peri Chicken', tier: 'bulk', qty: 2 },
  ], { prpdExtraServings: 1 });
  assert.deepEqual(plan.rows.map(row => [row.labels, row.sheets, row.spareLabels]), [
    [4, 1, 0],
    [2, 1, 2],
  ]);
  assert.equal(plan.totalLabels, 6);
  assert.equal(plan.totalSheets, 2);
});

test('component plan exposes exact raw protein, dry rice, produce, and prep batches', () => {
  const plan = core.componentPlan([
    { id: 'm2', name: 'Mexican Streetcorn Chicken Bowl', tier: 'lean', qty: 2 },
  ], production, methods, { prpdExtraServings: 1 });
  assert.equal(plan.proteins.length, 1);
  assert.equal(plan.proteinGroups.length, 1);
  assert.equal(plan.proteins[0].bufferedAmount, 600);
  assert.equal(plan.proteins[0].expectedCookedAmount, 450);
  assert.equal(plan.rice[0].bufferedAmount, 120);
  assert.equal(plan.rice[0].expectedCookedAmount, 360);
  assert.equal(plan.riceTotal.bufferedAmount, 120);
  assert.ok(plan.produce.some(item => item.key === 'green_bell_pepper'));
  const streetCorn = plan.prepBatches.find(batch => batch.name === 'Mexican street-corn mixture');
  assert.ok(streetCorn);
  assert.ok(streetCorn.ingredients.some(item => item.key === 'corn'));
  assert.ok(streetCorn.ingredients.some(item => item.key === 'cotija'));
});

test('compatible chicken is seasoned once and split into labeled dish bowls', () => {
  const plan = core.componentPlan([
    { id: 'b3', name: 'Power Bowl', tier: 'lean', qty: 2 },
    { id: 'm2', name: 'Mexican Streetcorn Chicken Bowl', tier: 'lean', qty: 2 },
    { id: 'm3', name: 'Hot Honey Chicken Sliders', tier: 'lean', qty: 2 },
    { id: 'm5', name: 'BBQ Chicken Mac & Cheese', tier: 'lean', qty: 2 },
    { id: 'm4', name: 'Chicken Biryani', tier: 'lean', qty: 2 },
  ], production, methods, { rawProteinBufferPct: 0 });
  assert.equal(plan.seasoningGroups.length, 1);
  assert.deepEqual(plan.seasoningGroups[0].allocations.map(item => item.dishId), ['b3', 'm2', 'm3', 'm5']);
  assert.equal(plan.seasoningGroups[0].baseSeasoning[0].name, 'Fine salt');
  assert.equal(plan.seasoningGroups[0].baseSeasoning[0].grams, Math.round(plan.seasoningGroups[0].totalRaw * 0.008 * 10) / 10);
  assert.ok(plan.prepBatches.some(batch => /biryani marinade/i.test(batch.name)));
  assert.ok(!plan.seasoningGroups[0].allocations.some(item => item.dishId === 'm4'));
});

test('workflow prioritizes prep stages and pairs stove work with passive oven time', () => {
  const counts = [
    { id: 'm3', name: 'Hot Honey Chicken Sliders', tier: 'lean', qty: 4 },
    { id: 'm6', name: 'Korean Bulgogi Beef Bowl', tier: 'lean', qty: 3 },
    { id: 'd2', name: 'Lotus Biscoff Cheesecake', tier: 'single', qty: 2 },
  ];
  const workflow = core.buildWorkflow(counts, methods, {
    burners: 2,
    ovens: 1,
    riceCookers: 1,
    teamSize: 2,
    completedPrep: ['desserts', 'sauces', 'rice'],
  });
  assert.match(workflow.prepStages[1].title, /desserts/i);
  assert.ok(workflow.prepStages[1].dishes.includes('Lotus Biscoff Cheesecake'));
  assert.equal(workflow.prepStages.find(stage => stage.key === 'desserts').completed, true);
  assert.equal(workflow.prepStages.find(stage => stage.key === 'sauces').completed, true);
  assert.equal(workflow.prepStages.find(stage => stage.key === 'rice').completed, true);
  assert.equal(workflow.parallelBlocks[0].primary.includes('Hot Honey Chicken Sliders'), true);
  assert.equal(workflow.parallelBlocks[0].while.includes('Korean Bulgogi Beef Bowl'), true);
  assert.ok(workflow.parallelBlocks.some(block => block.while.includes('Korean Bulgogi Beef Bowl')));
  assert.match(workflow.prepStages[5].tasks.join(' '), /135 F to 70 F within 2 hours/);
  assert.equal(workflow.lanes.length, 3);
  assert.match(workflow.lanes[1].detail, /no more than 1 simultaneous active task/i);
  assert.ok(workflow.cookStages.some(stage => /Chicken component line/i.test(stage.title)));
  assert.ok(workflow.cookStages.some(stage => /Assembly line by dish and tier/i.test(stage.title)));
  assert.match(workflow.cookStages[0].tasks.join(' '), /desserts, sauces\/cold sides, rice/i);
});

test('weekly sauces scale fixed customer cups, assembly reserve, and QC separately', () => {
  const plan = core.weeklySaucePlan([
    { customer: 'A', items: [{ tier: 'lean' }] },
    { customer: 'B', items: [{ tier: 'bulk' }] },
    { customer: 'C', items: [{ tier: 'lean' }] },
  ], methods.weeklySauces);
  assert.equal(plan.sauces.length, 2);
  assert.equal(plan.sauces[0].customerCups, 30);
  assert.equal(plan.sauces[0].kitchenUseCups, 10);
  assert.equal(plan.sauces[0].qcCups, 1);
  assert.equal(plan.sauces[0].totalCups, 41);
  assert.equal(plan.sauces[0].physicalCups, 31);
  assert.equal(plan.sauces[0].totalGrams, 2460);
  assert.equal(plan.totalCups, 82);
  assert.equal(plan.totalPhysicalCups, 62);
});

test('dessert-only orders do not receive savory weekly sauces', () => {
  const plan = core.weeklySaucePlan([
    { customer: 'Savory', items: [{ tier: 'lean' }, { tier: 'single' }] },
    { customer: 'Dessert only', items: [{ tier: 'single' }] },
  ], methods.weeklySauces);
  assert.equal(plan.orderCount, 1);
  assert.equal(plan.sauces[0].customerCups, 30);
  assert.equal(plan.sauces[0].totalCups, 41);
});

test('permanent no-label customers stay in production but leave the label count', () => {
  const orders = [
    { customer: 'Talal', items: [{ id: 'x2', name: 'Premium NY Strip Steak', tier: 'bulk', qty: 4 }] },
    { customer: 'Duaa Hassan', items: [{ id: 'x1', name: 'BBQ Chicken Mac & Cheese', tier: 'lean', qty: 2 }] },
    { customer: 'Adeen Zafar', items: [{ id: 'x1', name: 'BBQ Chicken Mac & Cheese', tier: 'lean', qty: 1 }] },
  ];
  const eligible = core.labelEligibleOrders(orders, methods.labelExemptCustomers);
  assert.deepEqual(eligible.map(order => order.customer), ['Adeen Zafar']);
  assert.equal(core.aggregateCounts(orders).reduce((sum, item) => sum + item.qty, 0), 7);
  assert.equal(core.aggregateCounts(eligible).reduce((sum, item) => sum + item.qty, 0), 1);
});

test('dual units expose pounds for protein and kitchen measures for seasonings', () => {
  const chicken = production.meals.m2.tiers.lean.ingredients.find(item => item.key === 'chicken_thigh_raw');
  assert.match(core.dualAmount(chicken, 1290), /kg/);
  assert.match(core.dualAmount(chicken, 1290), /lb/);
  const salt = production.meals.m2.tiers.lean.ingredients.find(item => item.key === 'salt');
  assert.match(core.dualAmount(salt, 12), /tsp|tbsp/);
});

test('rotated-off dishes are flagged instead of mapped into a different current dish', () => {
  const parsed = core.parseItemsText('2x Peri Peri Drumsticks (Lean) - $21.98', config);
  assert.equal(parsed.warnings.length, 1);
  assert.deepEqual(parsed.items, []);
});

test('manual counts ignore zeros and preserve meal names', () => {
  const counts = core.countsFromMap({ 'b1:lean': 3, 'b1:bulk': 0, 'd2:single': 4 }, config);
  assert.deepEqual(counts.map(item => [item.name, item.tier, item.qty]), [
    ['High Protein Omelette', 'lean', 3],
    ['Lotus Biscoff Cheesecake', 'single', 4],
  ]);
});

test('live Sheet arrays parse directly and excluded orders do not affect production', () => {
  const rows = [
    ['Submitted At','Batch','Delivery Date','First Name','Last Name','Phone','Items','Exact Total','Total (Rounded)','Notes','Order ID'],
    ['7/20/2026','Batch 3','Saturday','Rida','Khan','4695550101','2x High Protein Omelette (Lean) - $21.98',21.98,22,'','PRPD-B3-20260720-AAAA1111'],
    ['7/20/2026','Batch 3','Saturday','Test','Order','4695550102','5x Blueberry Cheesecake Protein Pancakes (Bulk) - $64.95',64.95,65,'','PRPD-B3-20260720-BBBB2222'],
  ];
  const parsed = core.arrayRowsToOrders(rows, config);
  parsed.orders[1].included = false;
  const included = core.includedOrders(parsed.orders);
  assert.equal(included.length, 1);
  assert.equal(core.aggregateCounts(included)[0].qty, 2);
  assert.equal(core.orderKey(included[0]), 'id:PRPD-B3-20260720-AAAA1111');
});

test('Orders marked HOLD or CANCELLED stay visible but are excluded from production', () => {
  const rows = [
    ['Submitted At','Batch','Delivery Date','First Name','Last Name','Phone','Items','Exact Total','Total (Rounded)','Notes','Order ID'],
    ['7/20/2026','Batch 3','Saturday','Jasmine','Shaw','9725550101','2x High Protein Omelette (Bulk) - $25.98',25.98,26,'[HOLD] No payment or address confirmed.','PRPD-B3-HOLD-1'],
    ['7/20/2026','Batch 3','Saturday','Active','Customer','9725550102','1x Blueberry Cheesecake Protein Pancakes (Lean) - $10.99',10.99,11,'','PRPD-B3-ACTIVE-1'],
  ];
  const parsed = core.arrayRowsToOrders(rows, config);
  assert.equal(parsed.orders.length, 2);
  assert.equal(parsed.orders[0].sourceStatus, 'hold');
  assert.equal(parsed.orders[0].included, false);
  assert.deepEqual(core.includedOrders(parsed.orders).map(order => order.customer), ['Active Customer']);
  assert.equal(core.orderStatusFromNotes('[CANCELLED] Customer requested cancellation.'), 'cancelled');
});

test('legacy orders receive a stable review key without exposing notes or items', () => {
  const key = core.orderKey({ submittedAt: '7/15/2026 1:00 PM', customer: 'Rida Khan', phone: '(469) 555-0101' });
  assert.equal(key, 'row:7/15/2026 1:00 pm|rida khan|4695550101');
});

test('every current menu item has a complete cook-day method', () => {
  const dishes = Object.values(config.menu).flat();
  assert.deepEqual(Object.keys(production.meals).sort(), dishes.map(dish => dish.id).sort());
  assert.deepEqual(Object.keys(methods.meals).sort(), dishes.map(dish => dish.id).sort());
  for (const dish of dishes) {
    assert.equal(production.meals[dish.id].name, dish.name, `${dish.id} production name`);
    const method = methods.meals[dish.id];
    assert.ok(method.equipment.length, `${dish.name} equipment`);
    assert.ok(method.steps.length >= 3, `${dish.name} method steps`);
    assert.ok(method.temperature, `${dish.name} temperature`);
    assert.ok(method.plating, `${dish.name} plating`);
    assert.ok(method.hold, `${dish.name} holding guidance`);
    assert.ok(Number.isInteger(method.sideCups), `${dish.name} side cup count`);
    assert.ok(Array.isArray(method.prepSteps) && method.prepSteps.length > 0, `${dish.name} prep-day steps`);
    assert.ok(Array.isArray(method.prepBatches) && method.prepBatches.length > 0, `${dish.name} prep batches`);
    assert.equal(typeof method.stepIngredients, 'object', `${dish.name} scaled step references`);
  }
});

test('planner setup is isolated by batch and delivery date', () => {
  const planner = fs.readFileSync(path.join(ROOT, 'operations', 'cook-day-planner.html'), 'utf8');
  assert.match(planner, /function setupStorageKey\(\) \{ return `prpdCookDaySetup:\$\{cookLogBatchKey\(\)\}`; \}/);
  assert.match(planner, /localStorage\.setItem\(setupStorageKey\(\),JSON\.stringify\(setup\)\)/);
  assert.match(planner, /localStorage\.getItem\(setupStorageKey\(\)\)/);
  assert.doesNotMatch(planner, /localStorage\.setItem\('prpdCookDaySetup'/);
  assert.doesNotMatch(planner, /id="prep(?:Desserts|Sauces|Rice)Done" checked/);
});

test('Guided production provides a linear kitchen queue with one active job ticket', () => {
  const planner = fs.readFileSync(path.join(ROOT, 'operations', 'cook-day-planner.html'), 'utf8');
  assert.match(planner, /function buildCookModePhases\(counts, workflow, componentPlan\)/);
  assert.match(planner, /function cookModePhaseDetail\(current\)/);
  assert.match(planner, /class="cook-action-card current"/);
  assert.match(planner, /Complete ticket - show next/);
  assert.match(planner, /class="cook-queue-strip"/);
  assert.match(planner, /Active job ticket/);
  assert.match(planner, /class="cook-day-switch"/);
  assert.match(planner, /Prep Day/);
  assert.match(planner, /Cook Day/);
  assert.match(planner, /class="cook-live-reference"/);
  assert.match(planner, /const hasDishFilter = Array\.isArray\(current\.dishes\)/);
  assert.match(planner, /class="card cook-reference-drawer cook-other-actions"/);
  assert.match(planner, /Dessert recipes/);
  assert.match(planner, /Chicken recipes/);
  assert.match(planner, /Beef and steak recipes/);
  assert.match(planner, /Exact scaled ingredients/);
  assert.match(planner, /Step-by-step method/);
  assert.match(planner, /data-cook-task-index/);
  assert.match(planner, /data-cook-log-key/);
  assert.match(planner, /state\.cookLog\.fields\[key\]/);
  assert.match(planner, /Full printable Runbook/);
  assert.match(planner, /Current customer bag/);
  assert.match(planner, /cookModeSinglePackout/);
});

test('public steak and BBQ mac orders parse and scale from the active menu', () => {
  const parsed = core.parseItemsText([
    '2x BBQ Chicken Mac & Cheese (Lean) - $21.98',
    '4x Premium NY Strip Steak (Bulk) - $107.96',
  ].join('\n'), config);
  assert.deepEqual(parsed.warnings, []);
  assert.deepEqual(parsed.items.map(item => [item.id, item.tier, item.qty]), [
    ['m5', 'lean', 2],
    ['m8', 'bulk', 4],
  ]);
  const totals = core.ingredientTotals(parsed.items, production, { prpdExtraServings: 1 });
  assert.deepEqual(totals.warnings, ['BBQ Chicken Mac & Cheese (lean) uses a low-confidence production build.']);
  assert.ok(totals.totals.some(item => item.key === 'protein_mac'));
  assert.ok(totals.totals.some(item => item.key === 'ny_strip_raw'));
  assert.equal(config.menu.mains.some(item => item.id === 'm5'), true);
  assert.equal(config.menu.mains.some(item => item.id === 'm8'), true);
});
