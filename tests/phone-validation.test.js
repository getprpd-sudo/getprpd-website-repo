const assert = require('node:assert/strict');
const test = require('node:test');
const PhoneValidation = require('../phone-validation');

test('phone validation accepts a normal U.S. number and strips country code', () => {
  assert.equal(PhoneValidation.isValid('(469) 555-0100'), true);
  assert.equal(PhoneValidation.isValid('+1 469 555 0100'), true);
  assert.equal(PhoneValidation.digits('+1 469 555 0100'), '4695550100');
  assert.equal(PhoneValidation.format('+1 469 555 0100'), '(469) 555-0100');
});

test('unusual ten-digit numbers are accepted but flagged for operator review', () => {
  assert.equal(PhoneValidation.isValid('197-298-4881'), true);
  assert.equal(PhoneValidation.needsReview('197-298-4881'), true);
  assert.equal(PhoneValidation.isValid('469-155-0100'), true);
  assert.equal(PhoneValidation.needsReview('469-155-0100'), true);
  assert.equal(PhoneValidation.isValid('469-555-010'), false);
  assert.equal(PhoneValidation.needsReview('469-555-010'), false);
});
