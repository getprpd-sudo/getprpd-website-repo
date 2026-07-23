const assert = require('node:assert/strict');
const test = require('node:test');

const leadApi = require('../api/lead');

function validLead(leadId) {
  return {
    action: 'lead',
    leadId,
    fullName: 'Test Customer',
    phone: '(469) 555-0100',
    location: 'Frisco',
    referral: 'Instagram / TikTok / YouTube',
    fitnessGoal: 'Build Muscle',
  };
}

test('lead validation accepts new and open-page legacy references', () => {
  assert.equal(
    leadApi._test.validateLead(validLead('PRPD-LEAD-20260714-A4F2C91D')).leadId,
    'PRPD-LEAD-20260714-A4F2C91D',
  );
  assert.equal(
    leadApi._test.validateLead(validLead('PRPD-LEAD-20260714-A4F2')).leadId,
    'PRPD-LEAD-20260714-A4F2',
  );
});

test('lead validation rejects unsupported fields and invalid controlled choices', () => {
  const extra = validLead('PRPD-LEAD-20260714-A4F2C91D');
  extra.admin = true;
  assert.throws(() => leadApi._test.validateLead(extra), /unsupported fields/i);

  const badGoal = validLead('PRPD-LEAD-20260714-A4F2C91D');
  badGoal.fitnessGoal = '<script>alert(1)</script>';
  assert.throws(() => leadApi._test.validateLead(badGoal), /valid fitness goal/i);
});

test('lead validation still enforces contact fields and reference format', () => {
  assert.throws(
    () => leadApi._test.validateLead(validLead('PRPD-LEAD-20260714-NOTHEX99')),
    /invalid lead reference/i,
  );
  const missingPhone = validLead('PRPD-LEAD-20260714-A4F2C91D');
  missingPhone.phone = '';
  assert.throws(() => leadApi._test.validateLead(missingPhone), /10-digit phone/i);

});

test('lead storage targets the row after the last real record', () => {
  assert.equal(leadApi._test.nextRecordRow([]), 2);
  assert.equal(leadApi._test.nextRecordRow([
    ['7/1', 'Website Form'],
    [],
    ['7/3', 'Website Form'],
  ]), 5);
  assert.equal(leadApi._test.nextRecordRow([
    ['7/1', 'Website Form'],
    ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'shifted'],
  ]), 4);
});
