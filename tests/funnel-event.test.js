const assert = require('node:assert/strict');
const test = require('node:test');

const handler = require('../api/lead');
const { FUNNEL_HEADERS, FUNNEL_KEYS, validateFunnelEvent } = handler._test;

function validPayload(overrides = {}) {
  return {
    action: 'funnel-event',
    eventId: 'PRPD-FE-0123456789ABCDEF01234567',
    sessionId: 'PRPD-FS-89ABCDEF0123456789ABCDEF',
    event: 'landing_view',
    page: '/halal-meal-prep-dfw',
    utmSource: 'google',
    utmMedium: 'cpc',
    utmCampaign: 'north-dfw-search',
    utmContent: 'responsive-search-ad',
    utmTerm: 'halal meal prep',
    googleClickPresent: true,
    device: 'mobile',
    detail: 'ads-landing',
    value: 0,
    batch: 6,
    ...overrides,
  };
}

test('funnel endpoint accepts only the bounded PII-free acquisition schema', () => {
  const event = validateFunnelEvent(validPayload());
  assert.equal(event.event, 'landing_view');
  assert.equal(event.page, '/halal-meal-prep-dfw');
  assert.equal(event.googleClickPresent, true);
  assert.deepEqual(FUNNEL_HEADERS, [
    'Recorded At', 'Event ID', 'Session ID', 'Event', 'Page', 'UTM Source',
    'UTM Medium', 'UTM Campaign', 'UTM Content', 'UTM Term',
    'Google Click Present', 'Device', 'Detail', 'Value', 'Batch',
  ]);
  assert.throws(() => validateFunnelEvent(validPayload({ email: 'customer@example.com' })), /unsupported fields/i);
  assert.throws(() => validateFunnelEvent(validPayload({ page: '/private' })), /page/i);
  assert.throws(() => validateFunnelEvent(validPayload({ event: 'customer_name' })), /event/i);
  for (const event of [
    'landing_engaged', 'menu_engaged', 'menu_filter', 'meal_engaged',
    'social_proof_play', 'social_proof_complete',
    'cart_restored', 'checkout_blocked', 'delivery_blocked',
    'promo_applied', 'promo_rejected',
    'fulfillment_selected', 'lead_submit', 'contact_click',
  ]) {
    assert.equal(validateFunnelEvent(validPayload({ event })).event, event);
  }
});

test('funnel schema never accepts customer identity, address, or raw click fields', () => {
  for (const key of ['firstName', 'lastName', 'phone', 'email', 'deliveryAddress', 'deliveryZip', 'gclid', 'gbraid', 'wbraid']) {
    assert.equal(FUNNEL_KEYS.has(key), false, `${key} must stay outside the funnel-event schema`);
  }
});
