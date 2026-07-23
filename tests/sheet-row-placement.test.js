const assert = require('node:assert/strict');
const test = require('node:test');

const orderApi = require('../api/order');

test('order storage targets the row after all standard or shifted records', () => {
  assert.equal(orderApi._test.nextRecordRow([]), 2);
  assert.equal(orderApi._test.nextRecordRow([
    ['7/1', 'Batch 2'],
    [],
    ['7/3', 'Batch 2'],
  ]), 5);
  assert.equal(orderApi._test.nextRecordRow([
    ['7/1', 'Batch 2'],
    ['', '', '', '', '', '', '', '', '', '', '', '7/2', 'Batch 2'],
  ]), 4);
});
