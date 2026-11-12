const test = require('node:test');
const assert = require('node:assert/strict');
const cookies = require('../operations/complimentary-cookie-plan');
const groceryDashboard = require('../operations/grocery-dashboard');

test('Batch 19 scales the full-size cookie recipe to 20 and rounds egg procurement', () => {
  const nine = cookies.plan(9, 19);
  assert.deepEqual([nine.needed, nine.produced, nine.spare], [9, 20, 11]);
  assert.equal(nine.batches, 20 / 12);
  assert.equal(nine.ingredients.find(item => item.name === 'Unsalted butter').amount, 376.7);
  assert.equal(nine.eggsToBuy, 7);

  const thirteen = cookies.plan(13, 19);
  assert.deepEqual([thirteen.needed, thirteen.produced, thirteen.spare], [13, 20, 7]);
  assert.equal(thirteen.batches, 20 / 12);
  assert.equal(thirteen.ingredients.find(item => item.name === 'Chocolate chips').amount, 433.3);
  assert.equal(cookies.plan(20, 19).produced, 20);
  assert.equal(cookies.plan(21, 19).produced, 24);
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
  assert.equal(rows.find(row=>row.key==='flour').required,700);
  assert.equal(rows.find(row=>row.key==='egg').required,7);
  assert.equal(rows.find(row=>row.key==='chocolate_chips').required,433.3);
  assert.equal(rows.find(row=>row.key==='cookie_sleeve').required,9);
  assert.equal(rows.find(row=>row.key==='cookie_sleeve').section,'Packaging');
  assert.equal(mealFlour.required,200);
  assert.equal(groceryDashboard.withCookieGroceries([mealFlour],cookies.plan(9,20)).length,1);
});
