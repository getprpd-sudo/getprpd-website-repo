const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const recurring=require('../operations/recurring-customers');
const data=require('../operations/nutrition/production-data');
const core=require('../operations/cook-day-core');
const methods=require('../operations/cook-day-methods');
const selected={nouman:{enabled:true,quantities:{'High-Protein Beef Kofta & Roasted Vegetables|lean':6}}};
test('saved customers are off unless the current batch explicitly enables them',()=>{
  assert.equal(recurring.materialize([],{}, {number:11},data).orders.length,0);
  const order=recurring.materialize([],selected,{number:10},data).orders[0];
  assert.equal(order.customer,'Nouman Ali Khan');
  assert.equal(order.items[0].qty,6);
  assert.equal(order.items[0].id,'p1');
  const contactOrder=recurring.materialize([],{nouman:{...selected.nouman,fulfillment:'Delivery',address:'Example street',city:'Example city',zip:'75001',phone:'5550100',email:'test@example.com'}},{number:10},data).orders[0];
  assert.equal(contactOrder.address,'Example street');
  assert.equal(contactOrder.fulfillment,'Delivery');
  assert.equal(contactOrder.email,'test@example.com');
  assert.equal(recurring.materialize([order],{}, {number:11},data).orders.length,0);
  const totals=core.operationalIngredientTotals(core.aggregateCounts([order]),data,methods,0).totals;
  assert.equal(totals.find(i=>i.key==='beef_96_raw').baseAmount,1980);
});
test('repeat sync retains the enabled plan exactly once, imported order wins',()=>{
  const once=recurring.materialize([],selected,{number:10},data).orders;
  assert.equal(recurring.materialize(once,selected,{number:10},data).orders.length,1);
  const imported={customer:'Nouman Khan',sourceStatus:'active',orderId:'real-order',items:[{id:'p1',tier:'lean',qty:4}]};
  const result=recurring.materialize([...once,imported],selected,{number:10},data);
  assert.equal(result.orders.length,1);
  assert.equal(result.orders[0].items[0].qty,4);
  assert.equal(result.warnings.length,1);
  assert.equal(recurring.materialize([], {nouman:{...selected.nouman,enabled:false}}, {number:10},data).orders.length,0);
});
test('planning status reserves production without becoming a confirmed customer order',()=>{
  const selection={nouman:{status:'planning',enabled:true,quantities:{
    'High-Protein Beef Kofta & Roasted Vegetables|lean':3,
    'Custom Lean Chicken Mince|lean':3,
  }}};
  const pending=recurring.materialize([],selection,{number:14},data).orders[0];
  assert.equal(pending.planningOnly,true);
  assert.equal(pending.confirmationStatus,'unconfirmed');
  assert.equal(core.aggregateCounts([pending]).reduce((sum,row)=>sum+row.qty,0),6);
  assert.deepEqual(core.confirmedOrders([pending]),[]);
  assert.deepEqual(core.labelRequiredOrders([pending],methods.labelExemptCustomers),[]);
  const labelApproved=recurring.materialize([],{nouman:{...selection.nouman,labelsApproved:true}},{number:14},data).orders[0];
  assert.equal(labelApproved.labelsApproved,true);
  assert.equal(core.confirmedOrders([labelApproved]).length,0);
  assert.equal(core.labelRequiredOrders([labelApproved],methods.labelExemptCustomers)[0].items.reduce((sum,item)=>sum+item.qty,0),6);
});
test('recipe identity follows moved slots and cannot create missing or fractional recipes',()=>{
  const moved=structuredClone(data);moved.meals.newKofta=moved.meals.p1;delete moved.meals.p1;
  assert.equal(recurring.materialize([],selected,{number:10},moved).orders[0].items[0].id,'newKofta');
  for(const quantities of [{'Missing recipe|lean':6},{'High-Protein Beef Kofta & Roasted Vegetables|lean':1.5},{'High-Protein Beef Kofta & Roasted Vegetables|lean':'invalid'},{}])
    assert.throws(()=>recurring.materialize([],{nouman:{enabled:true,quantities}},{number:10},data));
});
test('Current Weekly Five companion keeps its recipe and cooking method',()=>{
  assert.equal(data.meals.bw1.name,'Chicken Shakshuka');
  assert.ok(data.meals.bw1.tiers.lean.ingredients.some(i=>i.key==='crushed_tomatoes'));
  assert.ok(methods.meals.bw1);
  assert.deepEqual(core.auditPlanCoverage([{id:'bw1',tier:'lean',qty:2,name:'Chicken Shakshuka'}],data,methods).errors,[]);
});
test('packet failures are handled next to the button with bounded saves',()=>{
  const html=fs.readFileSync('operations/cook-day-planner.html','utf8');
  assert.match(html,/id="packetStatus"[^>]*role="status"/);
  assert.match(html,/catch\(error\)\s*\{\s*console\.error\('\[planner:generate\]'/);
  assert.match(html,/signal:AbortSignal\.timeout\(15000\)/);
  assert.match(html,/addEventListener\('click',\(\) => runPacketAction\(\)\)/);
});
