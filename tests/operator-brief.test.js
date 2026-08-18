const assert = require('node:assert/strict');
const test = require('node:test');

process.env.CRON_SECRET = 'cron-secret-for-tests';
process.env.PRPD_PLANNER_KEY = 'planner-secret-for-tests';
const api = require('../api/operator-brief');

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

test('operator brief endpoint accepts only GET', async () => {
  const response = responseDouble();
  await api({ method: 'POST', headers: {} }, response);
  assert.equal(response.statusCode, 405);
});

test('operator brief endpoint rejects missing and incorrect credentials before data access', async () => {
  for (const headers of [{}, { authorization: 'Bearer wrong' }, { 'x-prpd-planner-key': 'wrong' }]) {
    const response = responseDouble();
    await api({ method: 'GET', headers }, response);
    assert.equal(response.statusCode, 401);
    assert.match(response.body, /authorization failed/i);
  }
});

test('operator brief helpers use exact credentials and render an internal-only message', () => {
  assert.equal(api._test.keysMatch('same', 'same'), true);
  assert.equal(api._test.keysMatch('same', 'different'), false);
  assert.equal(api._test.bearerToken({ headers: { authorization: 'Bearer abc123' } }), 'abc123');
  const rendered = api._test.renderBrief({
    generatedAt: '2026-07-23T14:00:00.000Z',
    batchNumber: 3,
    deliveryDate: 'Saturday',
    counts: { orders: 1, meals: 2, recentLeads: 1, leadFollowUps: 1 },
    money: { booked: 25, collected: 10, currentOutstanding: 15, consolidatedOutstanding: 0 },
    actions: [{ title: 'Review balance', detail: 'One payment remains.' }],
    incompleteOrders: [],
    unpaid: [{ customer: 'Customer', balance: 15 }],
    consolidated: [],
    cutoff: { state: 'open', label: 'Wednesday at 5:00 PM CT' },
  });
  assert.match(rendered.text, /No customer messages were sent/);
  assert.match(rendered.html, /Daily Operator Brief/);
  assert.match(rendered.html, /\$15\.00/);
});
