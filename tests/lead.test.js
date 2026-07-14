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
    referral: 'Instagram',
    fitnessGoal: 'Build Muscle',
    trainingDays: '4-5 days',
    halalPref: 'Strictly Halal',
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

test('lead validation still enforces contact fields and reference format', () => {
  assert.throws(
    () => leadApi._test.validateLead(validLead('PRPD-LEAD-20260714-NOTHEX99')),
    /invalid lead reference/i,
  );
  const missingPhone = validLead('PRPD-LEAD-20260714-A4F2C91D');
  missingPhone.phone = '';
  assert.throws(() => leadApi._test.validateLead(missingPhone), /10-digit phone/i);

  const missingTraining = validLead('PRPD-LEAD-20260714-A4F2C91D');
  missingTraining.trainingDays = '';
  assert.throws(() => leadApi._test.validateLead(missingTraining), /training frequency/i);

  const missingHalal = validLead('PRPD-LEAD-20260714-A4F2C91D');
  missingHalal.halalPref = '';
  assert.throws(() => leadApi._test.validateLead(missingHalal), /halal preference/i);
});
