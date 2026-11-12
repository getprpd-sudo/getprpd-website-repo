const test = require('node:test');
const assert = require('node:assert/strict');
const cookies = require('../operations/complimentary-cookie-plan');
const groceryDashboard = require('../operations/grocery-dashboard');

test('Batch 19 makes one-time 18-cookie batch and scales if orders exceed it', () => {
  const nine = cookies.plan(9, 19);
  assert.deepEqual([nine.needed, nine.batches, nine.produced, nine.spare], [9, 1.5, 18, 9]);
  assert.equal(nine.ingredients.find(item => item.name === 'Unsalted butter').amount, 339);
  assert.equal(nine.eggsToBuy, 6);

  const thirteen = cookies.plan(13, 19);
  assert.deepEqual([thirteen.needed, thirteen.batches, thirteen.produced, thirteen.spare], [13, 1.5, 18, 5]);
  assert.equal(thirteen.ingredients.find(item => item.name === 'Chocolate chips or chunks').amount, 390);
  assert.equal(cookies.plan(19, 19).produced, 24);
  assert.deepEqual(cookies.groceryIngredients(nine).map(item => item.key),
    ['butter','brown_sugar','granulated_sugar','egg','vanilla','flour','baking_soda','baking_powder','salt','chocolate_chips']);
});

test('complimentary cookies are limited to the approved batch', () => {
  assert.equal(cookies.plan(9, 20).needed, 0);
  assert.equal(cookies.plan(0, 19).batches, 0);
});

test('grocery builder adds cookie demand once to shared shopping requirements', () => {
  const mealFlour = {key:'flour',name:'All-purpose flour',unit:'g',section:'Pantry & Sauces',required:200,sources:['Recipes']};
  const cookiePlan = cookies.plan(9,19);
  const rows = groceryDashboard.withCookieGroceries([mealFlour],cookiePlan);
  assert.equal(rows.find(row=>row.key==='flour').required,650);
  assert.equal(rows.find(row=>row.key==='egg').required,6);
  assert.equal(rows.find(row=>row.key==='chocolate_chips').required,390);
  assert.equal(rows.find(row=>row.key==='cookie_sleeve').required,9);
  assert.equal(rows.find(row=>row.key==='cookie_sleeve').section,'Packaging');
  assert.equal(mealFlour.required,200);
  assert.equal(groceryDashboard.withCookieGroceries([mealFlour],cookies.plan(9,20)).length,1);
});
