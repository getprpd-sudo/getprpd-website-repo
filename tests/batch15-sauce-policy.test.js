const test = require('node:test');
const assert = require('node:assert/strict');
const data = require('../operations/nutrition/production-data');
const methods = require('../operations/cook-day-methods');

const regularGreenIds = ['b4','m1','m2','m3','m4','m5','m6','m7','bw1'];

test('Batch 15 regular savory meals receive one green cup except the breakfast sandwich', () => {
  assert.equal(data.batch, 15);
  assert.equal(methods.weeklySauces.selectedSauce, 'Green jalapeño yogurt');
  for (const id of regularGreenIds) {
    assert.deepEqual(methods.meals[id].sideCupComponents, [{
      name: 'Green jalapeno yogurt sauce',
      batchGroup: 'weekly-green-yogurt',
      cupsPerMeal: 1,
      gramsPerMeal: 45,
    }], `${data.meals[id].name} should receive exactly one green cup`);
    const sauceJobs = methods.meals[id].prepBatches.filter(batch => batch.type === 'sauce');
    assert.equal(sauceJobs.some(batch => batch.sharedSauceFamily === 'weekly-sweet-heat'), false);
  }
  assert.deepEqual(methods.meals.b2.sideCupComponents.map(cup => [cup.name, cup.cupsPerMeal]), [
    ['PRPD Sweet Heat Sauce', 1],
  ]);
  const sandwichIngredients = data.meals.b2.tiers.lean.ingredients;
  assert.deepEqual(
    sandwichIngredients.filter(line => line.note === '45g Sweet Heat cup').map(line => line.key).sort(),
    ['honey','ketchup','light_mayo','sriracha'],
  );
});

test('Nouman keeps his controlled custom sauces', () => {
  assert.deepEqual(methods.meals.p1.sideCupComponents.map(cup => [cup.name, cup.cupsPerMeal]), [
    ['PRPD Sweet Heat Sauce', 2],
  ]);
  assert.deepEqual(methods.meals.p2.sideCupComponents.map(cup => [cup.name, cup.cupsPerMeal]), [
    ['Lemon-garlic dressing', 1],
    ['PRPD Sweet Heat Sauce', 1],
  ]);
});
