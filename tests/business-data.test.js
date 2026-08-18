const assert = require('node:assert/strict');
const test = require('node:test');

process.env.PRPD_PLANNER_KEY = 'business-test-key';
const api = require('../api/business-data');

function responseDouble() {
  return {
    statusCode: 200, headers: {}, body: '',
    status(code) { this.statusCode = code; return this; },
    setHeader(name, value) { this.headers[name] = value; },
    end(body) { this.body = body || ''; },
  };
}

test('business data endpoint uses exact protected-key comparison', () => {
  assert.equal(api._test.keysMatch('business-test-key', 'business-test-key'), true);
  assert.equal(api._test.keysMatch('business-test', 'business-test-key'), false);
  assert.equal(api._test.keysMatch('', ''), false);
});

test('business data endpoint rejects non-GET and unauthorized requests before Google access', async () => {
  const methodResponse = responseDouble();
  await api({ method:'POST', headers:{} }, methodResponse);
  assert.equal(methodResponse.statusCode, 405);
  const authResponse = responseDouble();
  await api({ method:'GET', headers:{ 'x-prpd-planner-key':'wrong' } }, authResponse);
  assert.equal(authResponse.statusCode, 401);
});

test('business data endpoint reads only the four controlled ranges', () => {
  assert.deepEqual(api._test.RANGES, {
    orders:"'Orders'!A1:AK5000", payments:"'Payment Log'!A1:P5000", leads:"'Website Leads'!A1:T5000",
    receivables:"'Accounts Receivable'!A1:H500",
  });
});
