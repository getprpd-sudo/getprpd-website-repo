const assert = require('node:assert/strict');
const test = require('node:test');

const tiktok = require('../api/_tiktok');
const reportApi = require('../api/tiktok-report');

function requestDouble() {
  return {
    headers: {
      cookie: '_ttp=browser-cookie-value; session=ignored',
      'user-agent': 'PRPD test browser',
      'x-forwarded-for': '203.0.113.10, 10.0.0.1',
    },
  };
}

test('TikTok web event includes deduplication and click identifiers without raw contact data by default', () => {
  const event = tiktok.buildWebEvent({
    request: requestDouble(),
    event: 'Lead',
    eventId: 'PRPD-LEAD-20260722-A1B2C3D4:lead',
    pageUrl: 'https://getprpd.com/?ttclid=click-123&utm_source=tiktok',
    referrer: 'https://www.tiktok.com/',
    email: 'Customer@Example.com',
    phone: '(469) 555-0100',
    eventTime: 1_721_600_000,
    advancedMatching: false,
    properties: { content_type: 'product' },
  });

  assert.equal(event.event, 'Lead');
  assert.equal(event.event_id, 'PRPD-LEAD-20260722-A1B2C3D4:lead');
  assert.equal(event.user.ttp, 'browser-cookie-value');
  assert.equal(event.user.ttclid, 'click-123');
  assert.equal(event.user.ip, '203.0.113.10');
  assert.equal(event.user.email, undefined);
  assert.equal(event.user.phone, undefined);
});

test('TikTok advanced matching hashes normalized contact data when explicitly enabled', () => {
  const event = tiktok.buildWebEvent({
    request: requestDouble(), event: 'PlaceAnOrder', eventId: 'ORDER-1',
    pageUrl: 'https://getprpd.com/order', email: ' Customer@Example.com ', phone: '(469) 555-0100',
    advancedMatching: true,
  });
  assert.deepEqual(event.user.email, [tiktok._test.sha256('customer@example.com')]);
  assert.deepEqual(event.user.phone, [tiktok._test.sha256('+14695550100')]);
});

test('TikTok report dates enforce a bounded valid reporting window', () => {
  assert.deepEqual(reportApi._test.reportDates({ startDate: '2026-07-01', endDate: '2026-07-22' }), {
    startDate: '2026-07-01', endDate: '2026-07-22',
  });
  assert.throws(() => reportApi._test.reportDates({ startDate: '2026-02-01', endDate: '2026-07-22' }), /1 to 90 days/i);
  assert.throws(() => reportApi._test.reportDates({ startDate: '07\/01\/2026', endDate: '2026-07-22' }), /YYYY-MM-DD/i);
});

test('TikTok campaign rows normalize into the Business Center report shape', () => {
  const report = reportApi._test.normalizeReport([
    { dimensions: { campaign_id: '123' }, metrics: { campaign_name: 'DFW Lead Test', spend: '42.50', impressions: '12500', clicks: '118', conversion: '6' } },
    { dimensions: { campaign_id: '456' }, metrics: { campaign_name: 'Creator Test', spend: '10.00', impressions: '3000', clicks: '25', conversion: '1' } },
  ], { startDate: '2026-07-01', endDate: '2026-07-22' });

  assert.equal(report.id, 'tiktok-api-2026-07-01-2026-07-22');
  assert.equal(report.source, 'api');
  assert.equal(report.spend, 52.5);
  assert.equal(report.impressions, 15500);
  assert.equal(report.clicks, 143);
  assert.equal(report.conversions, 7);
  assert.equal(report.campaigns.length, 2);
});
