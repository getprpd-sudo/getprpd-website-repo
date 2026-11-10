// Historical Batch 9 suite pending a complete frozen Batch 9 fixture.
const { skip: test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const core = require('../operations/cook-day-core.js');
const production = require('../operations/nutrition/production-data.js');
const methods = require('../operations/cook-day-methods.js');

const activeCounts = {
  b1: { lean: 1 }, b2: { bulk: 3 }, b4: { bulk: 2 },
  m2: { lean: 2, bulk: 4 }, m3: { lean: 1, bulk: 3 },
  m4: { lean: 2, bulk: 3 }, m5: { lean: 1, bulk: 2 },
  m6: { lean: 5, bulk: 3 }, m7: { lean: 1, bulk: 2 },
  m8: { bulk: 1 }, p1: { lean: 3 }, p3: { lean: 3 },
  d2: { single: 2 }, d3: { single: 1 }, a1: { single: 4 },
  a3: { single: 1 },
};

function countsFrom(source) {
  return Object.entries(source).flatMap(([id, tiers]) =>
    Object.entries(tiers).map(([tier, qty]) => ({
      id, tier, qty, name: production.meals[id].name,
    })),
  );
}

test('Batch 9 production and executable methods have exact dish parity', () => {
  assert.equal(production.batch, 9);
  assert.equal(methods.batch, 9);
  assert.deepEqual(Object.keys(methods.meals).sort(), Object.keys(production.meals).sort());
  assert.deepEqual(methods.productionExtras, []);
  assert.deepEqual(methods.familyAllocations, []);
  assert.deepEqual(methods.familyPlatingReservations, []);
});

test('every Batch 9 tier has measured prep, cook, component, and plating coverage', () => {
  const counts = Object.entries(production.meals).flatMap(([id, meal]) =>
    Object.keys(meal.tiers).map(tier => ({ id, tier, qty: 1, name: meal.name })),
  );
  assert.deepEqual(core.auditPlanCoverage(counts, production, methods).errors, []);
});

test('current Batch 9 packet combines only the four compatible Cook Day chicken recipes', () => {
  const plan = core.componentPlan(countsFrom(activeCounts), production, methods, 0);
  const group = plan.seasoningGroups.find(item => item.name === 'Batch 9 neutral chicken base');
  assert.ok(group);
  assert.equal(group.totalRaw, 2660);
  assert.equal(group.proteinForm, 'standard pieces');
  assert.deepEqual(group.baseSeasoning, [
    { key: 'neutral_chicken_oil', name: 'Sunflower oil for neutral chicken base', grams: 13.3 },
    { key: 'neutral_chicken_salt', name: 'Salt for neutral chicken base', grams: 3.9 },
  ]);
  assert.deepEqual(group.allocations.map(item => item.dishId), ['b4', 'm3', 'm5', 'a3']);
  assert.ok(!group.allocations.some(item => ['m2', 'm4', 'm6', 'a1'].includes(item.dishId)));
});

test('compatible Cook Day chicken remains in one reusable master storage pool', () => {
  const plan = core.componentPlan(countsFrom(activeCounts), production, methods, 0);
  assert.equal(plan.proteinStoragePools.length, 1);
  const pool = plan.proteinStoragePools[0];
  assert.equal(pool.proteinKey, 'chicken_thigh_raw');
  assert.equal(pool.proteinForm, 'standard pieces');
  assert.equal(pool.totalRaw, 2660);
  assert.deepEqual(pool.allocations.map(item => item.dishId), ['b4', 'm3', 'm5', 'a3']);
  assert.ok(!pool.allocations.some(item => ['m4', 'm6', 'a1'].includes(item.dishId)));
});

test('every operational seasoning split recombines to its recipe total', () => {
  const expectations = {
    b4: { sunflower_oil: ['neutral_chicken_oil','b4_side_oil'], salt: ['neutral_chicken_salt','b4_side_salt'] },
    m1: { sunflower_oil: ['neutral_chicken_oil'], salt: ['neutral_chicken_salt'] },
    m2: { fage: ['m2_marinade_yogurt','m2_sauce_yogurt'] },
    m3: { sunflower_oil: ['neutral_chicken_oil'], salt: ['neutral_chicken_salt','m3_streetcorn_salt'] },
    m4: { sunflower_oil: ['neutral_chicken_oil','m4_glaze_oil'], salt: ['neutral_chicken_salt','m4_glaze_salt'] },
    m5: { sunflower_oil: ['neutral_chicken_oil','m5_side_oil'], salt: ['neutral_chicken_salt','m5_side_salt'] },
    m6: { sunflower_oil: ['neutral_chicken_oil'], salt: ['neutral_chicken_salt','m6_sauce_salt'], black_pepper: ['m6_chicken_pepper','m6_sauce_pepper'] },
    m7: { salt: ['m7_beef_salt','m7_vegetable_salt'] },
    m8: { garlic: ['m8_salmon_garlic','m8_quinoa_garlic','m8_beans_garlic'], lemon: ['m8_salmon_lemon','m8_quinoa_lemon','m8_beans_lemon'], sunflower_oil: ['m8_salmon_oil','m8_beans_oil'], salt: ['m8_salmon_salt','m8_quinoa_salt','m8_beans_salt'], cilantro: ['m8_quinoa_cilantro','m8_garnish_cilantro'] },
    a1: { sunflower_oil: ['neutral_chicken_oil'], salt: ['neutral_chicken_salt'] },
    a2: { salt: ['a2_chicken_salt'] },
    p2: { salt: ['p2_chicken_salt','p2_side_salt'] },
    p3: { lemon: ['p3_marinade_lemon','p3_dressing_lemon'], garlic: ['p3_marinade_garlic','p3_dressing_garlic'], sunflower_oil: ['p3_marinade_oil','p3_dressing_oil'], black_pepper: ['p3_marinade_pepper','p3_dressing_pepper'], salt: ['p3_marinade_salt','p3_dressing_salt'] },
    a3: { sunflower_oil: ['neutral_chicken_oil'], salt: ['neutral_chicken_salt'] },
  };

  for (const [id, ingredientSplits] of Object.entries(expectations)) {
    const formulas = methods.meals[id].prepBatches.flatMap(batch => batch.formulaIngredients || []);
    for (const [tier, recipe] of Object.entries(production.meals[id].tiers)) {
      const source = Object.fromEntries(recipe.ingredients.map(item => [item.key, item.amount]));
      for (const [ingredientKey, splitKeys] of Object.entries(ingredientSplits)) {
        const reconstructed = splitKeys.reduce((sum, key) => {
          const formula = formulas.find(item => item.key === key);
          return sum + Number(formula?.[tier] ?? formula?.perServing ?? 0);
        }, 0);
        assert.equal(reconstructed, source[ingredientKey], `${id} ${tier} ${ingredientKey}`);
      }
    }
  }
});

test('corrected Batch 9 high-risk plating and cook instructions stay pinned', () => {
  assert.match(methods.meals.b2.assemblyGuide.bulk.join(' '), /2 complete sandwiches, no potatoes/i);
  assert.match(methods.meals.m8.steps.join(' '), /skin-side down/i);
  assert.match(methods.meals.m8.steps.join(' '), /lemon-herb quinoa/i);
  assert.match(methods.meals.m6.prepSteps.join(' '), /Keep the boneless thighs whole/i);
  assert.match(methods.meals.m6.steps.join(' '), /slice them into even strips/i);
  assert.match(methods.meals.a3.steps.join(' '), /pack all four wedges/i);
  assert.match(methods.meals.p3.assemblyGuide.lean.join(' '), /225 g cooked chicken/i);
  assert.match(methods.meals.p3.assemblyGuide.lean.join(' '), /200 g undressed salad/i);
  assert.match(methods.meals.p3.assemblyGuide.lean.join(' '), /15 g dressing cup/i);
});

test('active potatoes remain visible in the shared chopping block', () => {
  const totals = core.ingredientTotals(countsFrom(activeCounts), production, {
    rawProteinBufferPct: 0,
    riceBufferPct: 0,
  }).totals;
  const potatoes = Object.values(totals).find(item => item.key === 'potato');
  assert.ok(potatoes);
  assert.equal(potatoes.baseAmount, 800);

  const planner = fs.readFileSync(path.join(__dirname, '..', 'operations', 'cook-day-planner.html'), 'utf8');
  assert.doesNotMatch(planner, /componentPlan\.produce\.filter\(item => item\.key !== 'potato'\)/);
  assert.match(planner, /Potatoes are cut here, then cooked later in the potato station/);
});

test('brownies always scale to complete four-portion 8 x 4 pans', () => {
  const counts = [{ id: 'd2', tier: 'single', qty: 2, name: production.meals.d2.name }];
  const extra = core.resolvedProductionExtras(counts, production, methods)
    .find(item => item.id === 'whole-pan:d2:single');
  assert.ok(extra);
  assert.equal(extra.panCount, 1);
  assert.equal(extra.totalServings, 4);
  assert.equal(extra.customerServings, 2);
  assert.equal(extra.ownerServings, 2);

  const prep = core.componentPlan(counts, production, methods, {
    rawProteinBufferPct: 0,
    riceBufferPct: 0,
  }).prepBatches.find(batch => batch.dishId === 'd2');
  assert.ok(prep.showProductionExtras);
  assert.equal(prep.ingredients.find(item => item.key === 'egg').baseAmount, 1);
  assert.equal(prep.ingredients.find(item => item.key === 'flour').baseAmount, 80);
});

test('raw protein UI is one integrated block per protein category', () => {
  const planner = fs.readFileSync(path.join(__dirname, '..', 'operations', 'cook-day-planner.html'), 'utf8');
  assert.match(planner, /one protein work block/);
  assert.match(planner, /Compatible portions stay in one master container/);
  assert.match(planner, /data-storage-pool/);
  assert.match(planner, /Whole-batch chicken seasoning/);
  assert.match(planner, /KEEP WHOLE — DO NOT CUT/);
  assert.doesNotMatch(planner, /<h4>1\. Seasoning plan<\/h4>/);
  assert.doesNotMatch(planner, /<h4>2\. Portion into labeled bags and pans<\/h4>/);
});
