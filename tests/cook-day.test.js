// Historical Batch 8 suite. Re-enable against a frozen Batch 8 production,
// method, config and order fixture. Never run it against the rotating live data.
const { skip: test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const core = require('../operations/cook-day-core');
const config = require('../operations/active/BATCH_8_DRAFT_ORDER_CONFIG');
const production = require('../operations/nutrition/production-data');
const methods = require('../operations/cook-day-methods');
const grocery = require('../operations/grocery-list-core');
const groceryCatalog = require('../operations/grocery-catalog').catalog;

const dishes = [...Object.values(config.menu).flat(), ...(config.plannerOnly || [])];
const allCounts = Object.entries(production.meals).flatMap(([id, meal]) =>
  Object.keys(meal.tiers).map(tier => ({ id, name: meal.name, tier, qty: 1 }))
);

test('Batch 8 order rows import while archived batches are ignored', () => {
  const csv = [
    'Submitted At,Batch,First Name,Last Name,Phone,Items,Total (Rounded),Notes,Order ID',
    '8/24/2026 1:00 PM,Batch 8,Test,Customer,4695550101,"2x Chicken Enchilada Bake (Lean) - $21.98\n1x PRPD Protein Box - $7.99",29.97,,PRPD-B8-20260824-ABCD1234',
    '8/17/2026 1:00 PM,Batch 7,Old,Order,4695550102,"1x Chicken Biryani (Lean)",10.99,,OLD',
  ].join('\n');
  const result = core.rowsToOrders(csv, config);
  assert.equal(result.orders.length, 1);
  assert.deepEqual(result.orders[0].items.map(item => [item.id, item.tier, item.qty]), [['m6', 'lean', 2], ['a3', 'single', 1]]);
});

test('planner imports the Orders sheet Delivery Address header', () => {
  const csv = [
    'Submitted At,Batch,First Name,Last Name,Phone,Items,Total (Rounded),Notes,Order ID,Delivery Address,City,ZIP Code,Delivery Instructions',
    '8/24/2026 1:00 PM,Batch 8,Test,Customer,4695550101,"1x Chicken Enchilada Bake (Lean) - $10.99\nDelivery (Local Delivery) - Free",10.99,,PRPD-B8-20260824-ADDR1234,123 Main Street,Dallas,75248,Leave at door.',
  ].join('\n');
  const result = core.rowsToOrders(csv, config);
  assert.equal(result.orders.length, 1);
  assert.equal(result.orders[0].customer, 'Test Customer');
  assert.equal(result.orders[0].address, '123 Main Street');
  assert.equal(result.orders[0].city, 'Dallas');
  assert.equal(result.orders[0].zip, '75248');
  assert.equal(result.orders[0].deliveryNotes, 'Leave at door.');
  assert.equal(result.orders[0].fulfillment, 'Delivery — Local Delivery');
});

test('planner preserves pickup as a fulfillment mode without parsing it as food', () => {
  const csv = [
    'Submitted At,Batch,First Name,Last Name,Phone,Items,Total (Rounded),Notes,Order ID,Delivery Address,City,ZIP Code',
    '8/24/2026 1:00 PM,Batch 8,Test,Pickup,4695550101,"1x PRPD Protein Box - $7.99\nPickup - Free",7.99,,PRPD-B8-PICKUP12,Pickup location sent after confirmation,Frisco,75034',
  ].join('\n');
  const result = core.rowsToOrders(csv, config);
  assert.equal(result.orders[0].fulfillment, 'Pickup');
  assert.deepEqual(result.orders[0].items.map(item => [item.id, item.qty]), [['a3', 1]]);
});

test('pickup fulfillment lines do not hide real order items', () => {
  const parsed = core.parseItemsText('1x Loaded Beef Cottage Pie (Bulk) - $15.99\nPickup - Free', config);
  assert.deepEqual(parsed.warnings, []);
  assert.deepEqual(parsed.items.map(item => [item.id, item.tier, item.qty]), [['m8', 'bulk', 1]]);
});

test('weekly exclusive splits expand into the real kitchen meal counts', () => {
  const bundleConfig = {
    menu: {
      exclusives: [{
        id: 'x1',
        name: 'Build-a-Week Exclusive Duo',
        category: 'bundle',
        variants: [{
          id: 'med3-street2',
          label: '3 Mediterranean + 2 Streetcorn',
          components: [
            { id: 'm1', tier: 'lean', qty: 3 },
            { id: 'm2', tier: 'lean', qty: 2 },
          ],
        }],
      }],
      mains: [
        { id: 'm1', name: 'Mediterranean Chicken Bowl', category: 'standard' },
        { id: 'm2', name: 'Mexican Streetcorn Chicken Bowl', category: 'standard' },
      ],
    },
  };
  const parsed = core.parseItemsText(
    '2x Build-a-Week Exclusive Duo (3 Mediterranean + 2 Streetcorn) - $99.98\nDelivery (Local Delivery) - $9.99',
    bundleConfig,
  );

  assert.deepEqual(parsed.warnings, []);
  assert.deepEqual(parsed.items.map(item => [item.id, item.tier, item.qty]), [
    ['m1', 'lean', 6],
    ['m2', 'lean', 4],
  ]);
});

test('Batch 8 imports Nouman custom meals as internal-only production items', () => {
  const parsed = core.parseItemsText([
    '3x Custom Drained Ground Beef Mince - $47.97',
    '3x Custom Lean Chicken Mince - $47.97',
    '1x Custom Lebanese-Style Chicken Breast - $15.99',
  ].join('\n'), config);
  assert.deepEqual(parsed.warnings, []);
  assert.deepEqual(parsed.items.map(item => [item.id, item.tier, item.qty]), [
    ['p1', 'lean', 3], ['p2', 'lean', 3], ['p3', 'lean', 1],
  ]);
});

test('production, methods, and published menu have exact Batch 8 parity', () => {
  const ids = dishes.map(dish => dish.id).sort();
  assert.equal(config.batch.number, 8);
  assert.equal(production.batch, 8);
  assert.equal(methods.batch, 8);
  assert.deepEqual(Object.keys(production.meals).sort(), ids);
  assert.deepEqual(Object.keys(methods.meals).sort(), ids);
  for (const dish of dishes) {
    assert.equal(production.meals[dish.id].name, dish.name);
  }
});

test('every active tier has complete synchronized prep, cook, and plating coverage', () => {
  const audit = core.auditPlanCoverage(allCounts, production, methods);
  assert.deepEqual(audit.errors, []);
  assert.equal(audit.rows.length, 21);
  assert.ok(audit.rows.every(row => row.prepBatches >= 1 && row.cookSteps >= 1));
});

test('batch-driven prep workstations schedule real shared work and omit fake cold kits', () => {
  const counts = [
    { id: 'm2', name: production.meals.m2.name, tier: 'lean', qty: 2 },
    { id: 'm7', name: production.meals.m7.name, tier: 'bulk', qty: 1 },
    { id: 'p2', name: production.meals.p2.name, tier: 'lean', qty: 3 },
  ];
  const components = core.componentPlan(counts, production, methods);
  const waves = core.buildCookAheadWaves(components.prepBatches);
  const stations = core.buildPrepWorkstations(waves, components.riceGroups);
  const activeNames = JSON.stringify(stations);
  assert.match(activeNames, /Mediterranean Chicken Bowl/);
  assert.match(activeNames, /Nouman chicken-mince/);
  assert.doesNotMatch(activeNames, /cold toppings|finish kit/i);
  assert.doesNotMatch(activeNames, /Pepper Steak|French Toast/);
});

test('active recipes with the same seasoning-family metadata group automatically', () => {
  const counts = [
    { id: 'm2', name: production.meals.m2.name, tier: 'lean', qty: 2 },
    { id: 'a2', name: production.meals.a2.name, tier: 'single', qty: 2 },
  ];
  const components = core.componentPlan(counts, production, methods);
  const chicken = components.proteinGroups.find(group => group.key === 'chicken_thigh_raw');
  assert.deepEqual(methods.sharedProteinSeasoning, []);
  assert.equal(components.seasoningGroups.length, 1);
  assert.equal(components.seasoningGroups[0].name, 'Mediterranean lemon chicken');
  assert.deepEqual(components.seasoningGroups[0].allocations.map(item => item.dishId).sort(), ['a2', 'm2']);
  assert.equal(chicken.allocations.length, 2);
  assert.deepEqual(chicken.allocations.map(item => item.dishId).sort(), ['a2', 'm2']);
  const workflow = core.buildWorkflow(counts, methods);
  const proteinTasks = workflow.prepStages.find(stage => stage.key === 'proteins').tasks.join(' ');
  assert.match(proteinTasks, /displayed compatible seasoning family/i);
  assert.doesNotMatch(proteinTasks, /Chicken Biryani|Butter Chicken/);
});

test('Prep-Day-complete proteins are omitted from Cook Day protein cooking', () => {
  const counts = [
    { id: 'm7', name: production.meals.m7.name, tier: 'bulk', qty: 2 },
    { id: 'm3', name: production.meals.m3.name, tier: 'bulk', qty: 2 },
  ];
  const workflow = core.buildWorkflow(counts, methods);
  const proteinText = JSON.stringify(workflow.proteinCookGroups);
  assert.doesNotMatch(proteinText, /Lasagna beef/);
  assert.match(proteinText, /Tandoori (?:Chicken|bone-in leg quarters)/);
});

test('Batch 8 protein formats are pinned from recipe through Cook Day', () => {
  const expectedRawProtein = {
    b2: 'beef_90_raw', b3: 'chicken_thigh_raw', m1: 'chicken_thigh_raw',
    m2: 'chicken_thigh_raw', m3: 'leg_quarter_raw', m4: 'beef_strips_raw',
    m5: 'tilapia_raw', m6: 'chicken_thigh_raw', m7: 'beef_90_raw',
    m8: 'beef_90_raw', a1: 'chicken_thigh_raw', a2: 'chicken_thigh_raw',
    p1: 'beef_90_raw', p2: 'chicken_mince_raw', p3: 'chicken_breast_raw',
  };
  for (const [id, key] of Object.entries(expectedRawProtein)) {
    const recipeKeys = new Set(Object.values(production.meals[id].tiers).flatMap(tier => tier.ingredients.map(item => item.key)));
    assert.ok(recipeKeys.has(key), `${id} generated recipe must use ${key}`);
    assert.ok(methods.meals[id].proteinCook.recipeKeys.includes(key), `${id} Cook Day must use ${key}`);
  }
  assert.equal(Object.values(production.meals.m3.tiers).some(tier => tier.ingredients.some(item => item.key === 'chicken_thigh_raw')), false);
  assert.equal(methods.meals.m3.proteinCook.recipeKeys.includes('chicken_thigh_raw'), false);
});

test('Tandoori and Nouman formed beef are executable Prep-Day handoffs', () => {
  const tandoori = methods.meals.m3.prepBatches.find(batch => /leg-quarter marinade/i.test(batch.name));
  assert.ok(tandoori);
  assert.ok(tandoori.ingredientKeys.includes('leg_quarter_raw'));
  assert.match(tandoori.steps.join(' '), /cook pans.*overnight/i);
  const formedBeef = methods.meals.p1.prepBatches.find(batch => /Form Nouman seasoned beef/i.test(batch.name));
  assert.ok(formedBeef);
  assert.match(formedBeef.steps.join(' '), /Shape uniform oven-ready pieces/i);
  assert.match(methods.meals.p1.proteinCook.recipeSteps.join(' '), /Bake the refrigerated formed pieces to 160 F/i);
});

test('Cottage Pie stays an individual mash-first assembly and never becomes a casserole', () => {
  const cottagePie = methods.meals.m8;
  const methodText = [
    cottagePie.temperature,
    cottagePie.steps.join(' '),
    cottagePie.plating,
    cottagePie.prepBatches.flatMap(batch => batch.steps).join(' '),
  ].join(' ');
  assert.match(methodText, /mash.*first/i);
  assert.match(methodText, /beef filling.*over/i);
  assert.match(methodText, /do not (?:assemble or )?bake a casserole|there is no casserole bake/i);
  assert.equal(cottagePie.cookDayEquipment.lane, 'assembly');
  assert.equal(cottagePie.cookDayEquipment.temperatureF, undefined);
});

test('Chicken Parmesan raw work happens Prep Day but breading stays dry until Cook Day', () => {
  const prep = methods.meals.m1.prepBatches.find(batch => /whole-thigh pull/i.test(batch.name));
  assert.ok(prep);
  const prepText = `${prep.instruction} ${prep.steps.join(' ')}`;
  assert.match(prepText, /KEEP.*WHOLE/i);
  assert.match(prepText, /do not cube/i);
  assert.match(prepText, /trim.*flatten.*pat dry/i);
  assert.match(prepText, /do not bread tonight|coat.*immediately before/i);
  assert.match(methods.meals.m1.steps.join(' '), /Parmesan.*sauce/i);
  assert.match(methods.meals.m1.steps.join(' '), /do not put mozzarella in the sauce/i);
});

test('Nouman vegetable sides are fully cooked and rapid-cooled on Prep Day', () => {
  const beefVeg = methods.meals.p1.prepBatches.find(batch => /roasted beef-meal vegetables/i.test(batch.name));
  const minceVeg = methods.meals.p2.prepBatches.find(batch => /green beans and onion/i.test(batch.name));
  assert.ok(beefVeg);
  assert.ok(minceVeg);
  assert.match(beefVeg.steps.join(' '), /roast.*rapid-cool/i);
  assert.match(minceVeg.steps.join(' '), /Cook.*rapid-cool/i);
  assert.doesNotMatch(methods.meals.p1.steps.join(' '), /roast.*vegetables/i);
  assert.match(methods.meals.p2.steps.join(' '), /Retrieve the fully cooked Prep-Day.*green beans/i);
  assert.match(methods.meals.p2.steps.join(' '), /without recooking the vegetables/i);
});

test('Pinwheel filling is made Prep Day while tortillas stay dry until Cook Day', () => {
  const pinwheels = methods.meals.a1;
  const filling = pinwheels.prepBatches.find(batch => /chilled filling/i.test(batch.name));
  const dryKit = pinwheels.prepBatches.find(batch => /dry wrap kit/i.test(batch.name));
  assert.ok(filling);
  assert.ok(dryKit);
  assert.match(filling.steps.join(' '), /Do not put the filling on tortillas tonight/i);
  assert.match(dryKit.steps.join(' '), /eight tortillas total/i);
  assert.match(pinwheels.steps.join(' '), /20-30 minutes.*slice/i);
});

test('Prep Day oven schedule runs upward once and includes the full lasagna bake', () => {
  const components = core.componentPlan(allCounts, production, methods);
  const waves = core.buildCookAheadWaves(components.prepBatches);
  const stations = core.buildPrepWorkstations(waves, components.riceGroups);
  const schedule = core.buildPrepEquipmentSchedule(components.prepBatches, stations);
  assert.deepEqual(schedule.map(block => block.temperature), [325, 350, 375, 400, 425]);
  const lasagnaBlock = schedule.find(block => block.batches.some(batch => /Lasagna/i.test(batch.name)));
  assert.equal(lasagnaBlock.temperature, 375);
  assert.match(JSON.stringify(lasagnaBlock), /fully bake.*chill Lasagna/i);
});

test('Lasagna is baked and safely cooled on Prep Day, then cut cold on Cook Day', () => {
  const lasagna = methods.meals.m7;
  const bake = lasagna.prepBatches.find(batch => batch.type === 'bake-ahead');
  assert.ok(bake);
  assert.match(bake.steps.join(' '), /center reaches 165 F/i);
  assert.match(bake.steps.join(' '), /135 F to 70 F within 2 hours/i);
  assert.match(bake.steps.join(' '), /41 F or below within 4 additional hours/i);
  assert.doesNotMatch(lasagna.steps.join(' '), /Bake the fully assembled/i);
  assert.match(lasagna.steps.join(' '), /cut it cold/i);
  const workflow = core.buildWorkflow([
    { id: 'm6', name: production.meals.m6.name, tier: 'lean', qty: 1 },
    { id: 'm7', name: production.meals.m7.name, tier: 'lean', qty: 1 },
    { id: 'm8', name: production.meals.m8.name, tier: 'lean', qty: 1 },
  ], methods);
  assert.doesNotMatch(JSON.stringify(workflow.parallelBlocks), /Lasagna/i);
  assert.match(JSON.stringify(workflow.parallelBlocks), /Enchilada|Cottage Pie/i);
});

test('tier-specific Enchilada ingredients do not block a Lean-only packet', () => {
  const counts = [{ id: 'm6', name: production.meals.m6.name, tier: 'lean', qty: 2 }];
  const audit = core.auditPlanCoverage(counts, production, methods);
  assert.deepEqual(audit.errors, []);
  const plan = core.componentPlan(counts, production, methods);
  const assembly = plan.prepBatches.find(batch => batch.name === 'Assemble Chicken Enchilada pans');
  assert.ok(assembly);
  assert.match(JSON.stringify(assembly.ingredients), /small_tortilla/);
  assert.doesNotMatch(JSON.stringify(assembly.ingredients), /large_tortilla/);
});

test('Talal is excluded while Nouman receives one label per complete main meal', () => {
  assert.ok(methods.labelExemptCustomers.includes('Talal'));
  assert.ok(!methods.labelExemptCustomers.includes('Nouman'));
});

test('coverage fails closed if a measured prep card disappears', () => {
  const altered = JSON.parse(JSON.stringify(methods));
  altered.meals.m7.prepBatches = [];
  const audit = core.auditPlanCoverage([{ id: 'm7', name: production.meals.m7.name, tier: 'lean', qty: 1 }], production, altered);
  assert.ok(audit.errors.some(error => /High-Protein Beef Lasagna.*measured Prep Day card/i.test(error)));
});

test('coverage rejects one aggregate recipe ingredient assigned to multiple prep cards', () => {
  const altered = JSON.parse(JSON.stringify(methods));
  altered.meals.b2.prepBatches[1].ingredientKeys.push('garlic');
  const audit = core.auditPlanCoverage([{ id: 'b2', name: production.meals.b2.name, tier: 'bulk', qty: 1 }], production, altered);
  assert.ok(audit.errors.some(error => /garlic.*multiple Prep Day cards/i.test(error)));
});

test('all protein methods have explicit recipes and safe endpoints', () => {
  const proteinIds = ['b2', 'b3', 'm1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'a1', 'a2', 'p1', 'p2', 'p3'];
  for (const id of proteinIds) {
    const cook = methods.meals[id].proteinCook;
    assert.ok(cook, `${id} is missing protein cook controls`);
    assert.ok(cook.recipeKeys.length, `${id} needs protein recipe keys`);
    assert.ok(cook.recipeSteps.length >= 2, `${id} needs executable cook steps`);
    assert.match(`${cook.endpoint} ${cook.recipeSteps.join(' ')}`, /145 F|160 F|165 F/i);
  }
});

test('all active rice dishes share one physical rice group', () => {
  const riceIds = Object.entries(production.meals)
    .filter(([, meal]) => Object.values(meal.tiers).some(tier => tier.ingredients.some(item => item.key === 'rice_dry')))
    .map(([id]) => id);
  assert.deepEqual(riceIds, ['m2', 'm3', 'm4']);
  assert.ok(riceIds.every(id => methods.meals[id].riceBatchGroup === 'common'));
});

test('Batch 8 weekly sauces retain exact dish assignments and cup sizes', () => {
  assert.deepEqual(methods.weeklySauces.eligibleMealIds, ['b2', 'm5', 'a3', 'm8']);
  const plan = core.weeklySaucePlan([{ included: true, items: [
    { id: 'b2', tier: 'bulk', qty: 4 },
    { id: 'a3', tier: 'single', qty: 2 },
    { id: 'm5', tier: 'bulk', qty: 2 },
    { id: 'm8', tier: 'lean', qty: 3 },
    { id: 'm1', tier: 'lean', qty: 3 },
  ] }], methods.weeklySauces);
  assert.equal(plan.sauces.length, 2);
  assert.equal(plan.eligibleMealCount, 11);
  assert.deepEqual(plan.sauces.map(sauce => [sauce.name, sauce.customerCups, sauce.qcCups, sauce.gramsPerCup]), [
    ['PRPD Mustard BBQ Sauce', 8, 1, 40],
    ['PRPD Sweet Heat Sauce', 3, 1, 45],
  ]);
  assert.equal(plan.totalPhysicalCups, 13);
});

test('Batch 8 generated recipes exclude retired runoff ingredients', () => {
  const activeKeys = new Set(Object.values(production.meals).flatMap(meal =>
    Object.values(meal.tiers).flatMap(tier => tier.ingredients.map(item => item.key))
  ));
  for (const retired of ['harissa', 'salsa', 'philadelphia_no_bake', 'sourdough_slice', 'fajita_tortilla', 'onion', 'whey', 'jalapeno']) {
    assert.equal(activeKeys.has(retired), false, `${retired} must not return to the active generated Batch 8 recipe set`);
  }
  assert.equal(activeKeys.has('cilantro'), true, 'the controlled 2g savory garnish must remain in the generated Batch 8 recipes');
  assert.equal(activeKeys.has('sunflower_oil'), true, 'the purchased Batch 8 cooking oil must remain explicit');
  assert.equal(activeKeys.has('avocado_oil'), false, 'the unpurchased avocado oil must not remain in Batch 8 generated recipes');
  for (const controlled of ['bbq_sauce', 'mustard', 'apple_cider_vinegar', 'red_onion', 'bread_slice', 'small_tortilla', 'whey_vanilla', 'whey_chocolate']) {
    assert.equal(activeKeys.has(controlled), true, `${controlled} must remain explicit in the active generated Batch 8 recipe set`);
  }
});

test('every generated Batch 8 grocery requirement has a configured purchasable catalog item', () => {
  const operational = core.operationalIngredientTotals(allCounts, production, methods, {
    rawProteinBufferPct: 5,
    rawProteinReserveByDish: methods.rawProteinReserveByDish || {},
    riceBufferPct: 15,
    riceYieldFactor: 2.75,
  });
  const merged = grocery.mergeRequirements(operational.totals, { sauces: [] }, []);
  const adjusted = grocery.applyRequirementAdjustments(merged, methods.groceryAdjustments || []);
  const rows = grocery.buildPurchaseRows(adjusted, groceryCatalog, {
    onHand: {},
    buyPackages: {},
    catalog: {},
  });
  const unconfigured = rows.filter(row => !row.configured).map(row => row.key).sort();
  assert.deepEqual(unconfigured, [], `Unconfigured active grocery keys: ${unconfigured.join(', ')}`);
});

test('Grab and Go rotation and prices match the approved menu', () => {
  assert.deepEqual(config.menu.addons.map(dish => [dish.name, dish.price]), [
    ['Buffalo Chicken Pinwheels', 7.99],
    ['Mediterranean Chicken Hummus Box', 8.99],
    ['PRPD Protein Box', 7.99],
  ]);
});

test('pack-out preserves fulfillment details and exact physical counts', () => {
  const orders = [{ orderId: 'B8-T', customer: 'Test Customer', address: '1 Test St', city: 'Frisco', zip: '75034', included: true, items: [
    { id: 'm8', name: 'Loaded Beef Cottage Pie', tier: 'bulk', qty: 2 },
    { id: 'd1', name: 'Baked Strawberry-Lemon Protein Cheesecake', tier: 'single', qty: 1 },
  ] }];
  const pack = core.packoutPlan(orders)[0];
  assert.equal(pack.totalItems, 3);
  assert.equal(pack.address, '1 Test St');
  assert.deepEqual(pack.items.map(item => item.units.length), [2, 1]);
});

test('exact label queue prints only ordered builds', () => {
  const counts = core.countsFromMap({ 'b1:lean': 3, 'm8:bulk': 4, 'a3:single': 1 }, config);
  const plan = core.labelPlan(counts);
  assert.equal(plan.totalLabels, 8);
  assert.equal(plan.totalSheets, 2);
  assert.equal(plan.finalSheetOpenSlots, 0);
});

test('owner lasagna half-pan scales production without creating customer labels', () => {
  const counts = core.countsFromMap({ 'm7:lean': 5, 'm7:bulk': 6 }, config);
  const totals = Object.fromEntries(core.operationalIngredientTotals(counts, production, methods)
    .totals.map(item => [item.key, item.baseAmount]));
  assert.equal(totals.beef_90_raw, 2197.2);
  assert.equal(totals.crushed_tomatoes, 2635);
  assert.equal(totals.tomato_paste, 164.7);
  assert.equal(totals.water, 232.5);
  assert.equal(totals.italian_seasoning, 11.7);
  assert.equal(totals.lasagna_sheet, 30);
  assert.equal(totals.part_skim_ricotta, 823.4);
  const lasagnaPrep = core.componentPlan(counts, production, methods).prepBatches
    .find(batch => batch.dishId === 'm7' && batch.name === 'Assemble, fully bake, and chill Lasagna pans');
  assert.equal(lasagnaPrep.ingredients.find(item => item.key === 'lasagna_sheet').baseAmount, 30);
  assert.equal(lasagnaPrep.productionExtras[0].id, 'b8-owner-lasagna-half-pan');
  assert.equal(core.labelPlan(counts).totalLabels, 11);
});

test('brownies always fill complete four-serving 8 x 4 x 2.5-inch pans without extra labels', () => {
  const twoOrders = core.countsFromMap({ 'd3:single': 2 }, config);
  const fourServingTotals = Object.fromEntries(core.operationalIngredientTotals(twoOrders, production, methods)
    .totals.map(item => [item.key, item.baseAmount]));
  assert.equal(fourServingTotals.flour, 80);
  assert.equal(fourServingTotals.whey_chocolate, 78);
  assert.equal(fourServingTotals.egg, 1);
  assert.equal(fourServingTotals.fage, 240);
  assert.equal(fourServingTotals.chocolate_chips, 28);
  const browniePrep = core.componentPlan(twoOrders, production, methods).prepBatches
    .find(batch => batch.dishId === 'd3');
  assert.match(browniePrep.instruction, /8 x 4 x 2\.5-inch/);
  assert.equal(browniePrep.productionExtras[0].ownerServings, 2);
  assert.equal(core.labelPlan(twoOrders).totalLabels, 2);

  const fiveOrders = core.countsFromMap({ 'd3:single': 5 }, config);
  const twoPanExtra = core.resolvedProductionExtras(fiveOrders, production, methods)
    .find(extra => extra.dishId === 'd3');
  assert.equal(twoPanExtra.panCount, 2);
  assert.equal(twoPanExtra.totalServings, 8);
  assert.equal(twoPanExtra.ownerServings, 3);
  assert.equal(core.labelPlan(fiveOrders).totalLabels, 5);
});

test('planner retains operational sections and no archived menu names', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'operations', 'cook-day-planner.html'), 'utf8');
  const methodText = JSON.stringify(methods);
  assert.match(html, /Kitchen Guide/i);
  assert.match(html, /Pack-out/i);
  assert.doesNotMatch(methodText, /Chicken Biryani|Butter Chicken|Cajun Garlic Salmon|Mini Chicken Snack Wrap/);
  assert.deepEqual(methods.manualReservations || [], []);
});

test('Prep Day UI sequences shared prep before recipe-contained oven work', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'operations', 'cook-day-planner.html'), 'utf8');
  assert.match(html, /<details class="guide-phase"/);
  assert.match(html, /Load when ready; keep working while it cooks/);
  assert.match(html, /cookModePrepBatchCard\(entry\.batch,0\)/);
  assert.ok(
    html.indexOf("guidePhase(3,'Chop produce once'")
      < html.indexOf("guidePhase(4,'Make sauces'"),
    'clean produce preparation must appear before the sauce station'
  );
  assert.ok(
    html.indexOf("guidePhase(4,'Make sauces'")
      < html.indexOf("guidePhase(5,'Start oven work and continue stations'"),
    'the sauce station must be visible before remaining production'
  );
  assert.match(html, /Proteins/);
  assert.match(html, /Vegetables and sides/);
  assert.match(html, /meat and vegetables stay on separate labeled trays/);
  assert.match(html, /batch\.equipmentLane !== 'oven'/);
  assert.doesNotMatch(html, /recipe-first oven waves/);
});

test('Prep Day exposes one visible batch-driven protein cutting and seasoning station', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'operations', 'cook-day-planner.html'), 'utf8');
  assert.match(html, /Raw protein station/);
  assert.match(html, /recipe pull ·/);
  assert.match(html, /Labeled bag \/ pan/);
  assert.match(html, /1\. Seasoning plan/);
  assert.match(html, /2\. Portion into labeled bags and pans/);
  assert.match(html, /data-pack-toggle/);
  assert.doesNotMatch(html, /cook:release-station/);
  assert.doesNotMatch(html, /Ready the kitchen/);
  assert.doesNotMatch(html, /Close raw work and release sides/);
  assert.doesNotMatch(html, /data-protein-tab="bags"/);
  assert.doesNotMatch(html, /canonicalIngredientKey/, 'the page renderer cannot call core-private key helpers');
  assert.match(html, /proteinPrepBatches[\s\S]*batch\.ingredients\.some\(item => proteinKeySet\.has\(item\.key\)\)/);
});

test('Batch 8 combines only compatible neutral chicken seasoning before exact dish finishes', () => {
  const plan = core.componentPlan([
    { id: 'a1', name: production.meals.a1.name, tier: 'single', qty: 1 },
    { id: 'b3', name: production.meals.b3.name, tier: 'lean', qty: 1 },
    { id: 'm6', name: production.meals.m6.name, tier: 'lean', qty: 1 },
  ], production, methods, 0);
  const group = plan.seasoningGroups.find(item => item.id === 'recipe-family:neutral-chicken-start:chicken_thigh_raw');
  assert.ok(group);
  assert.equal(group.totalRaw, 480);
  assert.deepEqual(group.allocations.map(item => item.dishId).sort(), ['a1', 'b3', 'm6']);
  assert.deepEqual(group.baseSeasoning.map(item => item.key).sort(), ['salt', 'sunflower_oil']);
  assert.deepEqual(group.allocations.find(item => item.dishId === 'a1').finishSeasoning, []);
  assert.deepEqual(
    group.allocations.find(item => item.dishId === 'b3').finishSeasoning.map(item => item.key).sort(),
    ['cumin', 'garlic', 'paprika', 'salt', 'sunflower_oil']
  );
  assert.ok(!group.allocations.some(item => item.dishId === 'm2'), 'Mediterranean chicken must remain separate');
});

test('Pepper Steak includes a measured Cook Day velveting workflow', () => {
  const prep = methods.meals.m4.prepBatches.find(batch => /velveting kit/i.test(batch.name));
  assert.ok(prep);
  assert.ok(prep.formulaIngredients.some(item => item.key === 'baking_soda'));
  assert.match(prep.steps.join(' '), /20 minutes/i);
  assert.match(prep.steps.join(' '), /rinse thoroughly/i);
  assert.match(methods.meals.m4.proteinCook.recipeSteps.join(' '), /pat completely dry/i);
  assert.ok(groceryCatalog.baking_soda);
});

test('Generate and lock refreshes an intentionally changed locked recipe plan', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'operations', 'cook-day-planner.html'), 'utf8');
  assert.match(html, /await initialCookLogReady; await generatePacket\(\{ refreshChangedLock:true \}\)/);
  assert.match(html, /freezeCurrentBatchPlan\(\{ announce:false, reuseLockedOrders:true \}\)/);
  assert.match(html, /options\.reuseLockedOrders && batchPlanLock\(\)\.locked[\s\S]*\? selectedCounts\(\)/);
  assert.match(html, /const orders = liveOrders\.length \? liveOrders : \(options\.reuseLockedOrders \? lockedOrders\(\) : \[\]\)/);
  assert.match(html, /Object\.assign\(state\.cookLog\.fields, priorLockFields\)/);
  assert.match(html, /initialCookLogReady = loadCookLog\(\)\.finally/);
});

test('editable kitchen run reconciles customer counts without a required batch lock', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'operations', 'cook-day-planner.html'), 'utf8');
  assert.match(html, /id="generateBtn">Run editable kitchen plan</);
  assert.match(html, /options\.autoLock === true/);
  assert.match(html, /PRPD_KITCHEN\.countDifferences\(counts, orders, CORE\)/);
  assert.match(html, /Customer orders and production counts differ/);
  assert.match(html, /state\.packetOrdersSignature === orderPlanSignature\(productionOrders\(\)\)/);
  assert.match(html, /return `\$\{base\}:editable:\$\{revision\}`/);
  assert.match(html, /\$\('lockBatchBtn'\)\.addEventListener\('click',\(\) => runPacketAction\(\{ autoLock:true \}\)\)/);
  assert.doesNotMatch(html, /Lock the final batch before packing/);
});
