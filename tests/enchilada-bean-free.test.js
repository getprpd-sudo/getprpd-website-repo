const test = require('node:test');
const assert = require('node:assert/strict');
const data = require('./fixtures/batch10/production.json');
const methods = require('./fixtures/batch10/methods.json');
const core = require('../operations/cook-day-core');
const kitchen = require('../operations/kitchen-dashboard');
const groceries = require('../operations/grocery-list-core');

test('reusable Enchilada Bake recipe stays bean-free through planner and Grocery Builder', () => {
  const entry = Object.entries(data.meals).find(([, meal]) => meal.name === 'Chicken Enchilada Bake');
  const [recipeId, recipe] = entry || [];
  const method = methods.meals[recipeId];
  assert.ok(recipe && method);
  for (const tier of ['lean', 'bulk']) {
    assert.ok(recipe.tiers[tier].ingredients.some(item => item.key === 'sunflower_oil'));
    assert.ok(!recipe.tiers[tier].ingredients.some(item => item.key === 'avocado_oil'));
  }
  assert.deepEqual(method.panBatch.portionBasis, {lean: 448, bulk: 646});
  assert.match(method.proteinCook?.prepDayComplete ? method.prepBatches[0].cookAhead.steps.join(' ') : '', /whole thighs.*shred/i);
  const libraryData = {meals: {enchilada: recipe}};
  const libraryMethods = {...methods, meals: {enchilada: method}};
  const counts = [
    {id: 'enchilada', tier: 'lean', qty: 1, name: recipe.name},
    {id: 'enchilada', tier: 'bulk', qty: 1, name: recipe.name},
  ];
  assert.deepEqual(core.auditPlanCoverage(counts, libraryData, libraryMethods).errors, []);
  const totals = core.operationalIngredientTotals(counts, libraryData, libraryMethods, 0).totals;
  const requirements = groceries.mergeRequirements(totals, {sauces: []});
  for (const items of [totals, requirements]) {
    assert.ok(!items.some(item => item.key === 'black_beans' || item.key === 'cannellini_beans'));
    assert.equal(items.find(item => item.key === 'corn')?.baseAmount ?? items.find(item => item.key === 'corn')?.required, 120);
  }
  const planner = kitchen.render(kitchen.build(counts, libraryData, libraryMethods, core, 0), 'ahead');
  assert.match(planner, /Enchilada pan assembly/);
  assert.match(planner, /physically separated/);
  assert.doesNotMatch(planner, /same deep pan is enough/);
  assert.doesNotMatch(planner, /\b(?:black|cannellini) beans\b/i);
});
