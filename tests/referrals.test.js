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
    minimumOrder:60, firstOrderOnly:true, maxRedemptions:25, startsAt:'2026-08-22',
  });
  assert.equal(record.code, 'GYM10');
  assert.equal(record.programType, 'Partner');
  assert.equal(record.customerDiscount, 10);
  assert.equal(record.status, 'Inactive');
  assert.equal(record.minimumOrder, 60);
  assert.equal(record.firstOrderOnly, true);
  assert.equal(record.maxRedemptions, 25);
  assert.equal(record.startsAt, '2026-08-22');
  assert.throws(() => Referrals.serializeRecord({ code:'A', ownerName:'Test', ownerEmail:'test@example.com', customerDiscount:10 }), /3 to 32/);
  assert.throws(() => Referrals.serializeRecord({ code:'TEST10', ownerName:'Test', ownerEmail:'test@example.com', customerDiscount:0 }), /greater than zero/);
  assert.throws(() => Referrals.serializeRecord({ code:'TEST10', ownerName:'Test', ownerEmail:'', customerDiscount:10 }), /email is required/i);
  assert.throws(() => Referrals.serializeRecord({ code:'TEST10', ownerName:'Test', ownerEmail:'test@example.com', status:'Active', customerDiscount:10 }), /owner phone/i);
  assert.throws(() => Referrals.serializeRecord({ code:'TEST10', ownerName:'Test', ownerEmail:'test@example.com', startsAt:'2026-09-01', expiresAt:'2026-08-31', customerDiscount:10 }), /must not precede/i);
});

test('inactive and expired codes do not produce public promotions', () => {
  const active = Referrals.serializeRecord({ code:'ACTIVE10', ownerName:'Active', ownerEmail:'active@example.com', ownerPhone:'469-555-0100', status:'Active', customerDiscount:10 });
  assert.equal(Referrals.promotionFromReferral(active).firstOrderOnly, true);
  assert.equal(Referrals.promotionFromReferral(active).minimumOrder, 60);
  assert.equal(Referrals.promotionFromReferral({ ...active, status:'Inactive' }), null);
  assert.equal(Referrals.isActive({ ...active, expiresAt:'2026-01-01' }, Date.parse('2026-08-04T12:00:00-05:00')), false);
  assert.equal(Referrals.isActive({ ...active, startsAt:'2026-08-22' }, Date.parse('2026-08-21T12:00:00-05:00')), false);
});

test('partial referral updates preserve an inactive partner classification', () => {
  const existing = Referrals.serializeRecord({
    code:'Z10', ownerName:'Athlete Partner', ownerEmail:'athlete@example.com',
    programType:'Partner', status:'Inactive', customerDiscount:10,
    minimumOrder:60, maxPaidReferrals:25, maxRedemptions:25,
  });
  const updated = Referrals.serializeRecord({ code:'Z10', creditUsed:10 }, existing);
  assert.equal(updated.programType, 'Partner');
  assert.equal(updated.status, 'Inactive');
  assert.equal(updated.maxRedemptions, 25);
});
