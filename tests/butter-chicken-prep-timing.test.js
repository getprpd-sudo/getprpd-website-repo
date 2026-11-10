const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const repo = process.env.PRPD_REPO_ROOT || path.resolve(__dirname, '..');
const methods = require(process.env.PRPD_METHODS_PATH || path.join(repo, 'operations/cook-day-methods'));
const data = require(path.join(repo, 'operations/nutrition/production-data'));
const core = require(path.join(repo, 'operations/cook-day-core'));
const kitchen = require(path.join(repo, 'operations/kitchen-dashboard'));
const workflow = require(path.join(repo, 'operations/kitchen-workflow'));
const butter = methods.meals.m2;
const sauce = butter.prepBatches.find(batch => batch.name === 'Butter Chicken sauce');

test('Butter Chicken Prep Day makes an independent base and reserves cold finishing yogurt', () => {
  assert.equal(sauce.stage, 'ahead');
  assert.equal(sauce.aheadWorkstation, 'sauce-bases');
  const prep = sauce.steps.join(' ');
  assert.match(prep, /separate labeled container/);
  assert.match(prep, /do not add it to this base/);
  assert.match(prep, /base yield separately from the reserved yogurt/);
  assert.match(prep, /135 F to 70 F within 2 hours/);
  assert.doesNotMatch(prep, /after the chicken reaches|cook.*chicken.*165 F/i);
});

test('reserving finishing yogurt keeps the existing ingredient quantities and ownership', () => {
  const counts = ['lean', 'bulk'].map(tier => ({id:'m2', tier, qty:2, name:data.meals.m2.name}));
  const model = kitchen.build(counts, data, methods, core, 0);
  assert.deepEqual(model.review.errors, []);
  assert.equal(sauce.ingredientAmounts.fage.lean, 30);
  assert.equal(sauce.ingredientAmounts.fage.bulk, 45);
  for (const recipe of model.recipes) {
    const use = workflow.ingredientUse(recipe);
    assert.deepEqual(use.errors, []);
    const yogurt = use.rows.filter(row => row.key === 'fage');
    assert.equal(yogurt.length, 2, 'marinade and reserved sauce yogurt are the only owners');
    assert.deepEqual(yogurt.map(row => row.owner).sort(), ['Butter Chicken sauce', 'Shan Butter Chicken marinade']);
    const source = recipe.ingredients.find(item => item.key === 'fage');
    assert.equal(yogurt.reduce((sum, row) => sum + row.amount, 0), source.baseAmount);
    assert.ok(!use.finish.some(item => item.key === 'fage'), 'no duplicate finishing addition is created');
    for (const item of recipe.ingredients) {
      const allocated = use.rows.filter(row => row.key === item.key).reduce((sum, row) => sum + row.amount, 0)
        + use.finish.filter(row => row.key === item.key).reduce((sum, row) => sum + row.baseAmount, 0);
      assert.ok(Math.abs(allocated - item.baseAmount) < .001, item.key + ' mass remains conserved');
    }
  }
});

test('all Butter Chicken Cook Day views use the existing base and add reserved yogurt once', () => {
  assert.deepEqual(butter.cookDayReservations, butter.cookPackSteps);
  assert.deepEqual(butter.steps, butter.cookPackSteps);
  const finish = butter.cookPackSteps.join(' ');
  assert.match(finish, /all retained marinade to 165 F/);
  assert.match(finish, /Reheat the prepared smooth onion-tomato sauce base/);
  assert.match(finish, /Do not remake the base/);
  assert.match(finish, /reserved finishing yogurt once/);
  assert.match(finish, /assigned rice job/);
  assert.match(finish, /all internal and customer allocations/);
});
