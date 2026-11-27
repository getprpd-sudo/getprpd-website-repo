const assert = require('node:assert/strict');
const test = require('node:test');
const config = require('../config/order-config');
const api = require('../api/order')._test;
const promo = {code:'TESTFIRST10',partner:'Test fixture',type:'fixed',value:10,maxDiscount:10,minimumOrder:60,firstOrderOnly:true,maxRedemptions:50,active:true,expiresIso:'2099-01-01T00:00:00Z'};

// Synthetic unit price isolates threshold boundaries. No API calls or real orders.
function quote(subtotal, method, zip) {
  return api.validateAndBuildOrder({
    action:'order', orderId:`PRPD-B${config.batch.number}-20260908-AABBCCDD`,
    firstName:'Test',lastName:'Customer',phone:'4695550100',email:'test@example.com',
    fulfillmentMethod:method,deliveryAddress:'123 Test Street',deliveryHasUnit:false,
    deliveryCity:'Test',deliveryState:'TX',deliveryZip:zip,items:[{id:'test',tier:'lean',qty:1}],
    promoCode:'TESTFIRST10',website:'',formStartedAt:1,
  },[promo],{
    catalog:{test:{name:'Threshold test only',category:'standard',price:subtotal,available:true,maxQty:1}},
    batchNumber:config.batch.number,cutoffIso:'2099-01-01T00:00:00Z',policies:config.policies,
  });
}

for(const [zone,method,zip,min,free,fee] of [
  ['pickup','pickup','75035',50,50,0],['local','delivery','75035',60,90,9.99],
  ['regional','delivery','75063',70,125,12.99],['extended','delivery','76107',100,150,14.99],
]) {
  test(`${zone}: rounded food subtotal qualifies for free delivery before discount`,()=>{
    assert.throws(()=>quote(min-1,method,zip),/minimum has not been met/);
    const roundedMinimum=quote(min-.01,method,zip);
    assert.equal(roundedMinimum.roundedTotal,roundedMinimum.exactTotal);
    const atMinimum=quote(min,method,zip);
    assert.equal(atMinimum.deliveryFee,min>=free?0:fee);
    assert.equal(atMinimum.discountAmount,min>=60?10:0);
    const atFree=quote(Math.max(60,free),method,zip);
    assert.equal(atFree.deliveryFee,0);
    assert.equal(atFree.exactTotal,Math.max(60,free)-10);
    if(fee) {
      assert.equal(quote(free-.01,method,zip).deliveryFee,0);
      assert.equal(quote(free-1,method,zip).deliveryFee,fee);
    }
  });
}
test('local $60 first order is billed at its exact $59.99 total',()=>{
  const order=quote(60,'delivery','75035');
  assert.equal(order.exactTotal,59.99);
  assert.equal(order.roundedTotal,59.99);
});
test('extended $149.90 receives free delivery at $150; $149.00 still pays the fee',()=>{
  const near=quote(149.9,'delivery','76107');
  assert.equal(near.deliveryFee,0);
  assert.equal(near.roundedTotal,139.9);
  assert.equal(quote(149,'delivery','76107').deliveryFee,14.99);
});
test('$60 does not meet regional or extended order minimums',()=>{
  assert.throws(()=>quote(60,'delivery','75063'),/minimum has not been met/);
  assert.throws(()=>quote(60,'delivery','76107'),/minimum has not been met/);
});
