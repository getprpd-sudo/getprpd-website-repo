const assert = require('node:assert/strict');
const test = require('node:test');

const Referrals = require('../api/_referral-program');

test('referral codes are normalized and generated predictably', () => {
  assert.equal(Referrals.normalizeCode(' sana 15!! '), 'SANA15');
  assert.equal(Referrals.suggestCode([], 'Sana Khan'), 'SANAKHAN10');
  assert.equal(Referrals.suggestCode([{ code:'SANAKHAN10' }], 'Sana Khan'), 'SANAKHAN2');
});

test('referral sheet creation freezes its header through grid properties', () => {
  assert.deepEqual(Referrals.addSheetRequest(), {
    addSheet: {
      properties: {
        title: 'Referral Codes',
        gridProperties: { frozenRowCount: 1 },
      },
    },
  });
});

test('referral records enforce bounded first-order offers', () => {
  const record = Referrals.serializeRecord({
    code:'GYM10', ownerName:'North Frisco Athletics', ownerEmail:'partner@example.com',
    programType:'Partner', customerDiscount:10, referrerCredit:10,
  });
  assert.equal(record.code, 'GYM10');
  assert.equal(record.programType, 'Partner');
  assert.equal(record.customerDiscount, 10);
  assert.equal(record.status, 'Active');
  assert.throws(() => Referrals.serializeRecord({ code:'A', ownerName:'Test', customerDiscount:10 }), /3 to 32/);
  assert.throws(() => Referrals.serializeRecord({ code:'TEST10', ownerName:'Test', customerDiscount:0 }), /greater than zero/);
});

test('inactive and expired codes do not produce public promotions', () => {
  const active = Referrals.serializeRecord({ code:'ACTIVE10', ownerName:'Active', customerDiscount:10 });
  assert.equal(Referrals.promotionFromReferral(active).firstOrderOnly, true);
  assert.equal(Referrals.promotionFromReferral({ ...active, status:'Inactive' }), null);
  assert.equal(Referrals.isActive({ ...active, expiresAt:'2026-01-01' }, Date.parse('2026-08-04T12:00:00-05:00')), false);
});
