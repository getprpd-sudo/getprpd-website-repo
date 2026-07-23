const assert = require('node:assert/strict');
const test = require('node:test');

const leadApi = require('../api/lead');
const orderApi = require('../api/order');

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

for (const [name, handler] of [['lead', leadApi], ['order', orderApi]]) {
  test(`${name} endpoint requires JSON content`, async () => {
    const response = responseDouble();
    await handler({ method: 'POST', headers: {}, body: {} }, response);
    assert.equal(response.statusCode, 415);
    assert.match(response.body, /JSON content is required/);
  });

  test(`${name} endpoint checks parsed payload size`, async () => {
    const response = responseDouble();
    await handler({
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: { padding: 'x'.repeat(60_000) },
    }, response);
    assert.equal(response.statusCode, 413);
    assert.match(response.body, /too large/);
  });

  test(`${name} endpoint rejects cross-site browser submissions`, async () => {
    const response = responseDouble();
    await handler({
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        origin: 'https://attacker.example',
        'sec-fetch-site': 'cross-site',
      },
      body: {},
    }, response);
    assert.equal(response.statusCode, 403);
    assert.match(response.body, /not accepted/);
  });

  test(`${name} endpoint silently discards honeypot submissions before storage`, async () => {
    const response = responseDouble();
    await handler({
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'https://getprpd.com' },
      body: { website: 'spam.example' },
    }, response);
    assert.equal(response.statusCode, 200);
    assert.match(response.body, /"accepted":true/);
  });
}
