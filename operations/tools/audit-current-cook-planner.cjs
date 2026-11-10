#!/usr/bin/env node
// Read-only audit of the protected current-order feed, generated recipes, and planner stages.
const assert = require('node:assert/strict');
const config = require('../../config/order-config');
const production = require('../nutrition/production-data');
const methods = require('../cook-day-methods');
const core = require('../cook-day-core');
const kitchen = require('../kitchen-dashboard');

async function main() {
  const origin = process.env.PRPD_LOCAL_ORIGIN || 'http://127.0.0.1:4173';
  const response = await fetch(`${origin}/api/current-orders`);
  assert.equal(response.status, 200, 'live source-order route');
  const source = await response.json();
  assert.equal(source.batch, config.batch.number, 'order feed matches published batch');
  assert.equal(production.batch, config.batch.number, 'production data matches published batch');
  assert.equal(methods.batch, config.batch.number, 'method overlay matches published batch');

  const parsed = core.arrayRowsToOrders(source.rows, config);
  assert.deepEqual(parsed.warnings, [], 'unparsed order lines');
  const orders = core.includedOrders(parsed.orders);
  const counts = core.aggregateCounts(orders);
  const buffer = {rawProteinBufferPct:5,riceBufferPct:15,riceYieldFactor:2.75,rawProteinReserveByDish:methods.rawProteinReserveByDish || {}};
  const model = kitchen.build(counts, production, methods, core, buffer, orders);
  assert.deepEqual(kitchen.countDifferences(counts, orders, core), [], 'every imported item conserved');
  const seasoningRows = [];
  const dryPrepIngredients = new Set(['avocado_oil','sunflower_oil','breadcrumbs','kelloggs_corn_flakes_plain','flour']);
  for (const [mealId, meal] of Object.entries(production.meals || {})) {
    const method = methods.meals[mealId];
    assert.ok(method?.prepBatches?.length && method.steps?.length, `${meal.name} has a complete method`);
    if (source.batch >= 18) {
      assert.doesNotMatch(method.steps.join(' '), /Cook any reserved raw protein to its safe endpoint/i,
        `${meal.name} has recipe-specific finish instructions`);
    }
    for (const [tier, recipe] of Object.entries(meal.tiers || {})) {
      for (const ingredient of recipe.ingredients || []) {
        if (ingredient.station !== 'Dry Prep & Seasonings' || dryPrepIngredients.has(ingredient.key)) continue;
        seasoningRows.push({mealId,tier,key:ingredient.key,display:kitchen.displayAmount(ingredient),measure:ingredient.measure});
      }
    }
  }
  assert.ok(seasoningRows.length > 0, 'controlled seasoning rows exist');
  assert.deepEqual(seasoningRows.filter(row => !row.measure || /\s+g$/i.test(row.display)), [], 'all small seasonings use spoon, packet, or piece measures');
  const releaseHolds = model.review.errors.filter(note => /production release hold:/i.test(note));
  const structuralErrors = model.review.errors.filter(note => !/production release hold:/i.test(note));
  assert.deepEqual(structuralErrors, [], 'recipe, component, and method coverage');

  const rendered = {};
  for (const stage of ['all','prep','batch','cook','book']) {
    rendered[stage] = kitchen.render(model, stage);
    assert.ok(rendered[stage].length > 500, `${stage} renders meaningful content`);
    assert.doesNotMatch(rendered[stage], /Missing raw-protein method|\bNaN\b|\bundefined\b|\[object Object\]/i, `${stage} has no broken output`);
  }
  console.log(JSON.stringify({
    batch:source.batch,
    fetchedAt:source.fetchedAt,
    orders:orders.length,
    finishedItems:model.totalMeals,
    recipeTierCards:model.recipes.length,
    planningReady:true,
    productionReleased:releaseHolds.length===0 && model.review.decisions.length===0,
    softwareCoverage:'Counts conserved; all five kitchen views render without structural errors.',
    seasoningRowsVerified:seasoningRows.length,
    releaseHolds,
    decisions:model.review.decisions,
    warnings:model.review.warnings,
  },null,2));
}

main().catch(error=>{console.error(error.stack || error.message);process.exitCode=1;});
