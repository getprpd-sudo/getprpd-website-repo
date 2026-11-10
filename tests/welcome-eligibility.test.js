const assert = require('node:assert/strict');
const test = require('node:test');
const api = require('../api/order')._test;
const config = require('../config/order-config');
const promotion = {code:'TESTFIRST10',partner:'Test fixture',type:'fixed',value:10,maxDiscount:10,minimumOrder:60,firstOrderOnly:true,maxRedemptions:50,active:true};
const order = {orderId:'NEW',email:'new@example.com',phone:'4695550199',deliveryAddress:'123 Main Street',deliveryUnit:'Apt 4',deliveryZip:'75035'};
const clientFor = rows => ({request:async()=>({data:{values:rows}})});
function row(overrides={}) {
  const values=Array(37).fill('');
  for(const [index,value] of Object.entries({5:'9725550100',10:'OLD',11:'old@example.com',12:'999 Other Road',14:'75035',18:'',...overrides})) values[index]=value;
  return values;
}
for(const [name,overrides] of [
  ['email',{11:'new@example.com'}],['phone',{5:'(469) 555-0199'}],
  ['household',{12:'123 Main St, Apartment 4'}],
]) test(`first-order offer rejects a recorded prior ${name}`,async()=>{
  await assert.rejects(api.assertReferralEligibility(clientFor([row(overrides)]),order,promotion),/first PRPD order/);
});
test('first-order offer accepts a distinct first customer with no matching recorded history',async()=>{
  await assert.doesNotReject(api.assertReferralEligibility(clientFor([row()]),order,promotion));
});
test('first-order offer cap counts distinct order IDs, not repeated meal rows',async()=>{
  const rows=Array.from({length:50},(_,i)=>row({10:`OLD${i}`,18:'TESTFIRST10'}));
  await assert.rejects(api.assertReferralEligibility(clientFor(rows),order,promotion),/redemption limit/);
  await assert.doesNotReject(api.assertReferralEligibility(clientFor(Array(50).fill(row({18:'TESTFIRST10'}))),order,promotion));
});
test('eligibility lookup fails closed if order history cannot be read',async()=>{
  await assert.rejects(api.assertReferralEligibility({request:async()=>{throw new Error('history unavailable');}},order,promotion),/history unavailable/);
});
