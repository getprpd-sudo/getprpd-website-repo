const assert = require('node:assert/strict');
const test = require('node:test');

process.env.PRPD_PLANNER_KEY = 'test-planner-key-123';
const plannerApi = require('../api/planner-orders');

function responseDouble() {
  return {
    statusCode: 200,
    headers: {},
    body: '',
    status(code) { this.statusCode = code; return this; },
    setHeader(name, value) { this.headers[name] = value; },
    end(body) { this.body = body || ''; },
  };
}

test('planner comparison accepts only an exact nonempty key', () => {
  assert.equal(plannerApi._test.keysMatch('test-planner-key-123', 'test-planner-key-123'), true);
  assert.equal(plannerApi._test.keysMatch('test-planner-key-12', 'test-planner-key-123'), false);
  assert.equal(plannerApi._test.keysMatch('', ''), false);
});

test('planner Orders endpoint allows only GET and protected manual-order POST', async () => {
  const response = responseDouble();
  await plannerApi({ method: 'DELETE', headers: {} }, response);
  assert.equal(response.statusCode, 405);
});

test('planner Orders endpoint rejects missing and incorrect keys before Google access', async () => {
  for (const provided of [undefined, 'incorrect']) {
    const response = responseDouble();
    await plannerApi({ method: 'GET', headers: { 'x-prpd-planner-key': provided } }, response);
    assert.equal(response.statusCode, 401);
    assert.match(response.body, /authorization failed/i);
  }
});

test('planner normalizes standard and accidentally shifted order rows', () => {
  const header = ['Submitted At','Batch','Delivery Date','First Name','Last Name','Phone','Items','Exact Total','Total (Rounded)','Notes','Order ID','Email','Address','City','ZIP','Delivery Notes'];
  const standard = ['7/15','Batch 2','Saturday','Rida','Khan','4695550101','1x Egg Bites (Lean) - $10.99',10.99,11,'','ORDER-1','rida@example.com','1 Main St','Frisco','75035','Gate code 1234'];
  const shifted = ['', '', '7/15','Batch 2','Saturday','Jake','Miller','4695550102','2x French Toast (Bulk) - $25.98',25.98,26,'','ORDER-2'];
  const otherBatch = ['7/15','Batch 1','Old','Old','Order','4695550103','1x Egg Bites (Lean) - $10.99',10.99,11,'','OLD'];
  const result = plannerApi._test.normalizeOrderRows([header, standard, shifted, otherBatch], 2);
  assert.equal(result.length, 3);
  assert.deepEqual(result[1], standard);
  assert.equal(result[2][0], '7/15');
  assert.equal(result[2][1], 'Batch 2');
  assert.equal(result[2][6], '2x French Toast (Bulk) - $25.98');
  assert.equal(result[2][10], 'ORDER-2');
  assert.equal(result[2].length, 16);
});

test('manual planner orders accept public and approved planner-only dishes', () => {
  const body = {
    action: 'insert-manual-orders',
    orders: [{
      firstName: 'Test', lastName: 'Customer', phone: '',
      items: '1x BBQ Chicken Mac & Cheese (Lean) - $10.99\n2x Premium NY Strip Steak (Bulk) - $43.98',
      exactTotal: 0, totalRounded: 0, notes: 'Complimentary',
      orderId: 'PRPD-B2-MANUAL-20260715-TEST',
    }],
  };
  const result = plannerApi._test.validateManualOrders(body);
  assert.equal(result.length, 1);
  assert.equal(result[0].row.length, 11);
  assert.match(result[0].row[6], /Premium NY Strip Steak/);
});

test('manual planner orders reject unknown dishes and spreadsheet formulas', () => {
  assert.throws(() => plannerApi._test.validateManualOrders({
    action: 'insert-manual-orders',
    orders: [{
      firstName: '=HYPERLINK("bad")', lastName: '', phone: '',
      items: '1x Unknown Meal (Lean) - $10.99', exactTotal: 0, totalRounded: 0,
      notes: '', orderId: 'PRPD-B2-MANUAL-20260715-BAD1',
    }],
  }), /unknown or malformed/i);
});
