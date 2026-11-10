const test = require('node:test');
const assert = require('node:assert/strict');
const methods = require('../operations/cook-day-methods');
const data = require('../operations/nutrition/production-data');
const workflow = require('../operations/kitchen-workflow');
const engine = require('../operations/production-engine');
const current = Number(data.batch) === 17;
const actual = (name) => Object.values(methods.meals).find(method => method.recipeName === name);
const check = (name, fn) => test(name, {skip: !current}, fn);

check('Batch17 pasta, fresh eggs/batter and Popcorn station route to Cook Day without consuming ingredients twice', () => {
  const targets = [
    ['High Protein Omelette', 'Prepare omelette egg mixture'],
    ['PRPD Beef Bacon Breakfast Sandwich', 'Prepare sandwich egg mixture'],
    ['Strawberry Cheesecake Protein Pancakes', 'Mix pancake batter Friday'],
    ['Lemon Herb Chicken Orzo', 'Stage dry Orzo and lemon-herb finish'],
    ['Creamy Cajun Chicken Pasta', 'Creamy Cajun pasta setup'],
    ['Oven-Baked Popcorn Chicken', 'Prepare Popcorn breading station'],
  ];
  for (const [dish, name] of targets) {
    const method = actual(dish);
    const task = method.prepBatches.find(row => row.name === name);
    assert.ok(task, `${dish}: ${name}`);
    assert.equal(workflow.route(task, {method}).stage, 'cook');
    assert.equal(workflow.route(task, {method}).consumes, false);
    assert.equal(task.deferred, true);
  }
});

check('Batch17 protein block excludes pasta cooking, vegetable roasting and final packing', () => {
  const cajun = actual('Creamy Cajun Chicken Pasta');
  const orzo = actual('Lemon Herb Chicken Orzo');
  assert.doesNotMatch(cajun.proteinCook.recipeSteps.join(' '), /spaghetti|cream cheese|simmer/);
  assert.doesNotMatch(orzo.proteinCook.recipeSteps.join(' '), /boil|roast the staged zucchini|roast.*carrot/i);
  for (const name of ['Halal Cart Chicken + Yellow Rice', 'Premium NY Strip Steak', 'Garlic Butter Wild Argentine Shrimp + Rice', 'High-Protein Beef Kofta & Roasted Vegetables', 'Custom Lean Chicken Mince', 'Custom Lebanese-Style Chicken Breast']) {
    assert.doesNotMatch(actual(name).proteinCook.recipeSteps.join(' '), /\bpack\b|\bplate\b|assemble|fill.*cup/i);
  }
  assert.match(cajun.cookDayComponentSteps.join(' '), /already-made|prepared Cajun sauce base/);
  assert.match(cajun.cookDayComponentSteps.join(' '), /No second tomato-onion base/);
  assert.match(orzo.cookDayComponentSteps.join(' '), /already-cooked zucchini and carrot/);
  assert.match(orzo.cookDayComponentSteps.join(' '), /Do not roast it again/);
});

check('Batch17 Popcorn breading remains before its bake inside the chicken block', () => {
  const popcorn = actual('Oven-Baked Popcorn Chicken');
  const lines = popcorn.proteinCook.recipeSteps;
  assert.match(lines[0], /before this chicken cooks|before.*cooks|before.*cook|before coating|before this|Within the chicken block/i);
  assert.match(lines[1], /flour, egg white, then seasoned Corn Flakes/);
  assert.match(lines[2], /165 F/);
  assert.deepEqual(popcorn.cookDayComponentSteps, []);
  assert.ok(popcorn.proteinCook.recipeKeys.includes('kelloggs_corn_flakes_plain'));
  assert.ok(popcorn.proteinCook.recipeKeys.includes('egg_white'));
  assert.deepEqual(popcorn.proteinCook.cookIngredientPrepNames, ['Prepare Popcorn breading station']);
});

check('Batch17 actual generated recipe tiers conserve each ingredient across prep use and remaining finish', () => {
  const counts = Object.entries(data.meals).flatMap(([id, meal]) => Object.keys(meal.tiers).map(tier => ({id, tier, qty: 1, name: meal.name})));
  const plan = engine.compileProduction({counts, data, methods, buffer: 0});
  assert.deepEqual(plan.diagnostics.errors, []);
  for (const recipe of plan.recipes) {
    const use = workflow.ingredientUse(recipe);
    assert.deepEqual(use.errors, [], recipe.title);
    for (const ingredient of recipe.ingredients) {
      const used = use.rows.filter(row => row.key === ingredient.key).reduce((sum, row) => sum + row.amount, 0);
      const remaining = use.finish.filter(row => row.key === ingredient.key).reduce((sum, row) => sum + row.baseAmount, 0);
      assert.ok(Math.abs(used + remaining - ingredient.baseAmount) < .0011, `${recipe.title}: ${ingredient.key}`);
    }
  }
});

check('Batch17 final assembly retains tacos, wing finish and cold toppings without replaying protein cooking', () => {
  assert.match(actual('Cheesy Achiote Chicken Tacos').cookDayAssemblySteps.join(' '), /Warm the counted corn tortillas/);
  assert.match(actual('Cheesy Achiote Chicken Tacos').cookDayAssemblySteps.join(' '), /melting mozzarella/);
  assert.match(actual('Mango Habanero Chicken Wings').cookDayAssemblySteps.join(' '), /Toss the cooked wings/);
  assert.match(actual('Southwest Beef Taco Bowl').cookDayAssemblySteps.join(' '), /reserved rice-kit cilantro and lime/);
  for(const method of Object.values(methods.meals)) {
    assert.ok(Array.isArray(method.cookDayAssemblySteps));
    assert.doesNotMatch(method.cookDayAssemblySteps.join(' '), /sear|brown.*beef|roast.*thigh|boil.*pasta|cook.*to 165 F/i);
  }
  assert.ok(actual('Chicken Tikka Snack Wrap').coldAssemblySteps.length);
  assert.ok(actual('Buffalo Chicken Pinwheels').coldAssemblySteps.length);
});
