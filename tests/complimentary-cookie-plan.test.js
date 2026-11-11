const test = require('node:test');
const assert = require('node:assert/strict');
const cookies = require('../operations/complimentary-cookie-plan');

test('Batch 19 makes one complimentary cookie per customer order in full 12-cookie batches', () => {
  const nine = cookies.plan(9, 19);
  assert.deepEqual([nine.needed, nine.batches, nine.produced, nine.spare], [9, 1, 12, 3]);
  assert.equal(nine.ingredients.find(item => item.name === 'Unsalted butter').amount, 226);
  assert.equal(nine.eggsToBuy, 4);

  const thirteen = cookies.plan(13, 19);
  assert.deepEqual([thirteen.needed, thirteen.batches, thirteen.produced, thirteen.spare], [13, 2, 24, 11]);
  assert.equal(thirteen.ingredients.find(item => item.name === 'Chocolate chips or chunks').amount, 520);
  assert.equal(thirteen.eggsToBuy, 8);
});

test('complimentary cookies are limited to the approved batch', () => {
  assert.equal(cookies.plan(9, 20).needed, 0);
  assert.equal(cookies.plan(0, 19).batches, 0);
});
