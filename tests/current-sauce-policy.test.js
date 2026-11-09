const test = require('node:test');
const assert = require('node:assert/strict');
const config = require('../config/order-config');
const sauce = require('../sauce-program');

test('current checkout grants one optional cup per two eligible meals', () => {
  const policy = config.sauceProgram;
  for (const [meals, expected] of [[0, 0], [1, 1], [2, 1], [3, 2], [10, 5]]) {
    const quote = sauce.quote({}, [{ category: 'beef', qty: meals }], policy);
    assert.equal(quote.totalCredits, expected, `${meals} meals`);
  }
  const quote = sauce.quote({ 'cucumber-dill-tzatziki': 6 }, [
    { category: 'beef', qty: 10, requiredCups: 20 },
  ], policy);
  assert.equal(quote.totalCredits, 5);
  assert.equal(quote.extraQty, 1);
  assert.equal(quote.extraSubtotal, 1);
});

test('bundle servings count once and drinks do not earn sauce', () => {
  const quote = sauce.quote({}, [
    { category: 'bundle', servingCount: 5, qty: 1 },
    { category: 'addon', sauceEligible: false, qty: 2 },
    { category: 'dessert', qty: 2 },
  ], config.sauceProgram);
  assert.equal(quote.eligibleMeals, 5);
  assert.equal(quote.totalCredits, 3);
});
