const test = require('node:test');
const assert = require('node:assert/strict');
const Run = require('../operations/production-run');
const order = (qty=2) => ({orderId:'REAL-1',customer:'Customer',included:true,sourceStatus:'active',notes:'No pickles',items:[{id:'dish',name:'Dish',tier:'lean',qty,sourceQty:2}]});
const snapshot = {id:'run-1',orderHash:'orders',recipeHash:'recipes',demandHash:'demand'};
const record = () => ({fields:Run.reviewedFields({plan:{snapshot},orders:[order(1)],sourceOrders:[order()],buffer:{riceBufferPct:15},sauceConfig:{},extras:[]})});

test('shopping preserves reviewed quantity edits instead of reimporting the raw order quantity',()=>{
  const result = Run.selectOrders([order()],record());
  assert.equal(result.mode,'reviewed');
  assert.equal(result.orders[0].items[0].qty,1);
  result.orders[0].items[0].qty=9;
  assert.equal(Run.selectOrders([order()],record()).orders[0].items[0].qty,1);
});
test('new source quantities or customer food notes require review before replacing shopping counts',()=>{
  const newer = order(); newer.items[0].sourceQty=3;
  assert.equal(Run.selectOrders([newer],record()).mode,'changed');
  newer.items[0].sourceQty=2;newer.notes='No raw tomato';
  assert.deepEqual(Run.selectOrders([newer],record()).orders,[]);
});

test('changed fulfillment contact and handoff details also require review',()=>{
  for(const key of ['phone','email','city','zip','deliveryNotes']) {
    const newer=order();newer[key]='changed';
    assert.equal(Run.selectOrders([newer],record()).mode,'changed',key);
  }
});
test('locked orders stay authoritative even when a source changes',()=>{
  const saved=record();saved.fields['lock:status']='locked';saved.fields['lock:orders-json']=JSON.stringify([order(1)]);
  const newer=order();newer.items[0].sourceQty=3;
  const result=Run.selectOrders([newer],saved);
  assert.equal(result.mode,'locked');assert.equal(result.changed,true);assert.equal(result.orders[0].items[0].qty,1);
});
test('malformed state and missing locked orders fail closed',()=>{
  assert.throws(()=>Run.selectOrders([],{fields:{'lock:status':'locked'}}),/no saved orders/);
  assert.throws(()=>Run.settings({fields:{'plan:extras-json':'{"bad":true}'}}),/extra choices/);
  assert.throws(()=>Run.settings({fields:{'plan:buffer-json':'broken'}}),/incomplete/);
});
test('snapshot validation distinguishes old locks from changed ingredients or counts',()=>{
  assert.equal(Run.snapshotStatus({snapshot},record()).ok,true);
  assert.match(Run.snapshotStatus({snapshot:{...snapshot,id:'run-2',recipeHash:'changed'}},record()).message,/recipes/);
  assert.equal(Run.snapshotStatus({snapshot},{fields:{'lock:status':'locked'}}).legacy,true);
});
test('shared settings preserve exact reserve controls and selected extras without mutating state',()=>{
  const saved=record();saved.fields['plan:extras-json']='["extra-salmon"]';
  const settings=Run.settings(saved);
  assert.equal(settings.buffer.riceBufferPct,15);assert.deepEqual(settings.extras,['extra-salmon']);
  settings.extras.push('other');assert.deepEqual(Run.settings(saved).extras,['extra-salmon']);
});
test('recovery preserves the newest complete review as one group despite a later measurement save',()=>{
  const old=record(), recent=record();
  for(const saved of [old,recent])saved.batchKey='batch-test';
  old.updatedAt='2026-10-05T22:00:00Z';old.fields['plan:reviewed-at']='2026-10-05T20:00:00Z';
  old.fields['plan:obsolete-setting']='old';old.fields['yield:measured']='480';old.fields['lock:status']='locked';
  recent.updatedAt='2026-10-05T21:00:00Z';recent.fields['plan:reviewed-at']='2026-10-05T20:30:00Z';
  recent.fields['plan:orders-json']=JSON.stringify([order(3)]);recent.fields['plan:extras-json']='["extra-salmon"]';
  recent.fields['plan:buffer-json']='{"riceBufferPct":20}';recent.fields['plan:engine-snapshot-json']=JSON.stringify({...snapshot,id:'run-2'});
  const original=JSON.stringify([old,recent]);
  const recovered=Run.mergeReviewedFields(old,[recent]);
  assert.equal(JSON.parse(recovered.fields['plan:orders-json'])[0].items[0].qty,3);
  assert.deepEqual(Run.settings(recovered).extras,[]); // Locked settings stay independent of review recovery.
  assert.equal(recovered.fields['plan:extras-json'],'["extra-salmon"]');
  assert.equal(recovered.fields['plan:buffer-json'],'{"riceBufferPct":20}');
  assert.equal(JSON.parse(recovered.fields['plan:engine-snapshot-json']).id,'run-2');
  assert.equal(recovered.fields['plan:obsolete-setting'],undefined);
  assert.equal(recovered.fields['yield:measured'],'480');assert.equal(recovered.fields['lock:status'],'locked');
  assert.equal(recovered.updatedAt,old.updatedAt);
  assert.equal(JSON.stringify([old,recent]),original);
});
test('recovery ignores incomplete, malformed and wrong-batch reviews without mixing their fields',()=>{
  const base=record();base.batchKey='batch-test';base.fields['plan:reviewed-at']='2026-10-05T20:00:00Z';
  const invalid=[];
  for(const [field,value] of [
    ['plan:orders-json','broken'],['plan:orders-json','[]'],['plan:orders-json','[null]'],
    ['plan:source-signature','{}'],['plan:buffer-json','[]'],['plan:sauce-json','null'],
    ['plan:extras-json','[42]'],['plan:engine-snapshot-json','{}'],['plan:reviewed-at','not a date'],
  ]){
    const candidate=JSON.parse(JSON.stringify(base));candidate.fields['plan:reviewed-at']='2026-10-05T21:00:00Z';
    candidate.fields[field]=value;invalid.push(candidate);
  }
  const incomplete=JSON.parse(JSON.stringify(base));incomplete.fields['plan:reviewed-at']='2026-10-05T21:00:00Z';delete incomplete.fields['plan:sauce-json'];invalid.push(incomplete);
  const wrongBatch=JSON.parse(JSON.stringify(base));wrongBatch.batchKey='other';wrongBatch.fields['plan:reviewed-at']='2026-10-05T23:00:00Z';invalid.push(wrongBatch);
  assert.deepEqual(Run.mergeReviewedFields(base,invalid),base);
  const malformed={batchKey:'batch-test',fields:{'plan:orders-json':'broken','yield:measured':'10'}};
  assert.deepEqual(Run.mergeReviewedFields(malformed,[]),malformed);
});
test('equal review markers prefer authoritative candidate order over measurement recency',()=>{
  const base=record(),server=record();
  for(const saved of [base,server]){saved.batchKey='batch-test';saved.fields['plan:reviewed-at']='2026-10-05T20:00:00Z';}
  base.updatedAt='2026-10-05T22:00:00Z';server.updatedAt='2026-10-05T21:00:00Z';
  base.fields['plan:extras-json']='["unreviewed-change"]';
  assert.equal(Run.mergeReviewedFields(base,[server]).fields['plan:extras-json'],'[]');
});
test('new explicit reviews advance the marker even with a same or backward wall clock',()=>{
  const previousReviewedAt='2099-10-05T20:00:00.123Z';
  const fields=Run.reviewedFields({plan:{snapshot},orders:[order()],sourceOrders:[order()],buffer:{},sauceConfig:{},previousReviewedAt});
  assert.equal(Date.parse(fields['plan:reviewed-at']),Date.parse(previousReviewedAt)+1);
});
