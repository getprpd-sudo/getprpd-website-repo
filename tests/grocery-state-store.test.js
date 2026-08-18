const assert = require('node:assert/strict');
const test = require('node:test');
const GroceryStateStore = require('../operations/grocery-state-store');

test('grocery state validation preserves only bounded operational values', () => {
  const state = GroceryStateStore.validateState({
    batchKey: 'batch:4|delivery:2026-08-01',
    onHand: { 'chicken thighs': 4535.9 },
    buyPackages: { yogurt: 4 },
    catalog: { yogurt: { price: 3.28, ignored: 'value' } },
  });
  assert.equal(state.batchKey, 'batch:4|delivery:2026-08-01');
  assert.deepEqual(state.onHand, { 'chicken thighs': 4535.9 });
  assert.deepEqual(state.buyPackages, { yogurt: 4 });
  assert.deepEqual(state.catalog, { yogurt: { price: 3.28 } });
});

test('grocery state validation rejects negative inventory and invalid keys', () => {
  assert.throws(() => GroceryStateStore.validateState({
    batchKey: 'batch:4',
    onHand: { chicken: -1 },
  }), /invalid amount/i);
  assert.throws(() => GroceryStateStore.validateState({
    batchKey: 'batch:4',
    onHand: { '<script>': 1 },
  }), /invalid item key/i);
});
