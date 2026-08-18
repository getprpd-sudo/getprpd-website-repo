const assert = require('node:assert/strict');
const test = require('node:test');

const config = require('../config/order-config');
const delivery = require('../api/_delivery-zones');
const deliveryQuoteHandler = require('../api/delivery-quote');

function responseRecorder() {
  return {
    statusCode: 0,
    headers: {},
    body: '',
    status(value) { this.statusCode = value; return this; },
    setHeader(name, value) { this.headers[name] = value; },
    end(value) { this.body = String(value || ''); },
  };
}

test('delivery zones use the controlled 25-mile local, 35-mile regional, and 60-mile service limits', () => {
  assert.equal(delivery.CORE_MAX_MILES, 25);
  assert.equal(delivery.REGIONAL_MAX_MILES, 35);
  assert.equal(delivery.SERVICE_MAX_MILES, 60);

  const core = delivery.quoteDeliveryZone('75035', config.policies);
  assert.equal(core.supported, true);
  assert.equal(core.zoneId, 'core');
  assert.ok(core.estimatedDrivingMiles <= 25);

  const regional = delivery.quoteDeliveryZone('75063', config.policies);
  assert.equal(regional.supported, true);
  assert.equal(regional.zoneId, 'regional');
  assert.ok(regional.estimatedDrivingMiles > 25);
  assert.ok(regional.estimatedDrivingMiles <= 35);

  const extended = delivery.quoteDeliveryZone('76107', config.policies);
  assert.equal(extended.supported, true);
  assert.equal(extended.zoneId, 'extended');
  assert.ok(extended.estimatedDrivingMiles > 35);
  assert.ok(extended.estimatedDrivingMiles <= 60);

  assert.deepEqual(delivery.quoteDeliveryZone('77002', config.policies), {
    supported: false,
    reason: 'outside-service-area',
  });
});

test('public delivery quote returns pricing but no origin, city, or mileage', async () => {
  const response = responseRecorder();
  await deliveryQuoteHandler({ method: 'GET', query: { zip: '76107' } }, response);
  const body = JSON.parse(response.body);

  assert.equal(response.statusCode, 200);
  assert.equal(body.supported, true);
  assert.equal(body.policy.id, 'extended');
  assert.equal(body.policy.deliveryFee, 14.99);
  assert.equal(Object.hasOwn(body, 'estimatedDrivingMiles'), false);
  assert.equal(Object.hasOwn(body, 'city'), false);
  assert.doesNotMatch(response.body, /Prosper/i);
});

test('public delivery quote rejects unsupported ZIPs without revealing distance', async () => {
  const response = responseRecorder();
  await deliveryQuoteHandler({ method: 'GET', query: { zip: '77002' } }, response);
  assert.deepEqual(JSON.parse(response.body), {
    status: 'success',
    supported: false,
    reason: 'outside-service-area',
  });
});
