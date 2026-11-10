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
  ['pickup','pickup','75035',50,50,0],['local','delivery','75035',60,85,9.99],
  ['regional','delivery','75063',70,100,12.99],['extended','delivery','76107',100,135,14.99],
]) {
  test(`${zone}: rounded payment minimum and exact free-delivery threshold use subtotal before discount`,()=>{
    assert.throws(()=>quote(min-1,method,zip),/minimum has not been met/);
    const roundedMinimum=quote(min-.01,method,zip);
    assert.equal(roundedMinimum.roundedTotal,Math.ceil(roundedMinimum.exactTotal));
    const atMinimum=quote(min,method,zip);
    assert.equal(atMinimum.deliveryFee,min>=free?0:fee);
    assert.equal(atMinimum.discountAmount,min>=60?10:0);
    const atFree=quote(Math.max(60,free),method,zip);
    assert.equal(atFree.deliveryFee,0);
    assert.equal(atFree.exactTotal,Math.max(60,free)-10);
    if(fee) assert.equal(quote(free-.01,method,zip).deliveryFee,fee);
  });
}
test('local $60 first order is $59.99 exact, rounded to $60 due',()=>{
  const order=quote(60,'delivery','75035');
  assert.equal(order.exactTotal,59.99);
  assert.equal(order.roundedTotal,60);
});
test('$60 does not meet regional or extended order minimums',()=>{
  assert.throws(()=>quote(60,'delivery','75063'),/minimum has not been met/);
  assert.throws(()=>quote(60,'delivery','76107'),/minimum has not been met/);
});
