import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalizePaymentReference, requirePayoutMethod} from '../src/payment.js';
test('references are normalized before database uniqueness checks',()=>{
  assert.equal(normalizePaymentReference('  ab-12 34  '),'AB1234');
  assert.equal(normalizePaymentReference('ab1234'),'AB1234');
  assert.equal(normalizePaymentReference('a_b/1'),'AB1');
});
test('payment method must match campaign payment instructions',()=>{
  requirePayoutMethod('GCash','GCash');
  assert.throws(()=>requirePayoutMethod('Bank Transfer','GCash'),/does not match/);
});
