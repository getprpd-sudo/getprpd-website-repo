const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const store = require('../operations/cook-log-store');

test('cook log validates, saves atomically, and loads by batch', () => {
  const batchKey = `test-batch-${Date.now()}-${Math.random()}`;
  const saved = store.saveLog({
    batchKey,
    fields: {
      'dish:m1:actual-raw-protein-g': '1200',
      'dish:m1:notes': 'Yield looked correct.',
    },
  });
  assert.equal(saved.schemaVersion, 1);
  assert.equal(store.loadLog(batchKey).fields['dish:m1:actual-raw-protein-g'], '1200');
  const file = store.fileForBatch(batchKey);
  assert.equal(fs.existsSync(file), true);
  fs.rmSync(file, { force:true });
  fs.rmSync(`${file}.bak`, { force:true });
});

test('cook log rejects unsafe field keys and excessive data', () => {
  assert.throws(() => store.validateLog({ batchKey:'batch', fields:{ '<script>':'x' } }), /invalid field key/i);
  assert.throws(() => store.validateLog({ batchKey:'', fields:{} }), /batch key/i);
});

test('cook log preserves complete frozen order snapshots above the note limit', () => {
  const frozenOrders = JSON.stringify(Array.from({ length:80 }, (_,index) => ({
    customer:`Customer ${index + 1}`,
    items:[{ id:'m1', tier:'lean', qty:1 }],
  })));
  assert.ok(frozenOrders.length > 4000);
  const validated = store.validateLog({
    batchKey:'batch-lock-payload',
    fields:{
      'lock:status':'locked',
      'lock:orders-json':frozenOrders,
      'batch:notes':'x'.repeat(5000),
    },
  });
  assert.equal(validated.fields['lock:orders-json'], frozenOrders);
  assert.equal(validated.fields['batch:notes'].length, 4000);
  assert.throws(() => store.validateLog({
    batchKey:'batch-lock-truncated',
    fields:{ 'lock:status':'locked', 'lock:orders-json':frozenOrders.slice(0, 4000) },
  }), /complete frozen order snapshot/i);
});

test('cook log keeps the previous project copy as a recovery backup', () => {
  const batchKey = `test-backup-${Date.now()}-${Math.random()}`;
  const file = store.fileForBatch(batchKey);
  store.saveLog({ batchKey, fields:{ 'batch:notes':'first' } });
  store.saveLog({ batchKey, fields:{ 'batch:notes':'second' } });
  const backup = JSON.parse(fs.readFileSync(`${file}.bak`, 'utf8'));
  assert.equal(backup.fields['batch:notes'], 'first');
  assert.equal(store.loadLog(batchKey).fields['batch:notes'], 'second');
  fs.rmSync(file, { force:true });
  fs.rmSync(`${file}.bak`, { force:true });
});

test('shared production records are preserved whole and oversized records fail closed', () => {
  const orders = JSON.stringify(Array.from({length:80}, (_,index) => ({orderId:`order-${index}`,customer:`Customer ${index}`,items:[{id:'m1',tier:'lean',qty:1}]})));
  const result = store.validateLog({batchKey:'shared-plan-test',fields:{'plan:orders-json':orders}});
  assert.ok(orders.length > 4000);
  assert.equal(result.fields['plan:orders-json'], orders);
  assert.throws(() => store.validateLog({batchKey:'shared-plan-test',fields:{'plan:orders-json':'x'.repeat(100001)}}), /not truncated or replaced/);
  assert.throws(() => store.validateLog({batchKey:'shared-plan-test',fields:{'lock:orders-json':'x'.repeat(100001)}}), /not truncated or replaced/);
});

test('old-tab autosaves cannot erase omitted shared production fields', () => {
  const existing = {fields:{'plan:orders-json':'[]','plan:engine-snapshot-json':'{"id":"reviewed"}','dish:m1:notes':'old'}};
  const merged = store.preserveLockFields(existing,{fields:{'dish:m1:notes':'new'}});
  assert.equal(merged.fields['plan:orders-json'],'[]');
  assert.equal(merged.fields['plan:engine-snapshot-json'],'{"id":"reviewed"}');
  assert.equal(merged.fields['dish:m1:notes'],'new');
  assert.equal(store.preserveLockFields(existing,{fields:{'plan:orders-json':'[{"orderId":"next"}]'}}).fields['plan:orders-json'],'[{"orderId":"next"}]');
});

test('stale-tab measurement autosaves cannot replace a more recently reviewed production plan', () => {
  const existing={fields:{'plan:reviewed-at':'2026-10-05T20:00:00Z','plan:orders-json':'[{"orderId":"reviewed"}]','plan:extras-json':'["selected-extra"]'}};
  const incoming={fields:{'plan:reviewed-at':'2026-10-05T19:00:00Z','plan:orders-json':'[{"orderId":"stale"}]','plan:extras-json':'[]','dish:m1:actual-yield':'500'}};
  const merged=store.preserveLockFields(existing,incoming);
  assert.equal(merged.fields['plan:orders-json'],existing.fields['plan:orders-json']);
  assert.equal(merged.fields['plan:extras-json'],existing.fields['plan:extras-json']);
  assert.equal(merged.fields['dish:m1:actual-yield'],'500');
  incoming.fields['plan:reviewed-at']=existing.fields['plan:reviewed-at'];
  assert.equal(store.preserveLockFields(existing,incoming).fields['plan:extras-json'],existing.fields['plan:extras-json']);
  incoming.fields['plan:reviewed-at']='2026-10-05T21:00:00Z';
  assert.equal(store.preserveLockFields(existing,incoming).fields['plan:orders-json'],incoming.fields['plan:orders-json']);
});

test('normal cook-log autosaves preserve the protected server lock', () => {
  const existing = {
    batchKey:'batch:protected',
    fields:{
      'lock:status':'locked',
      'lock:recipe-signature':'current-signature',
      'lock:orders-json':'[{"orderId":"one"}]',
      'dish:m1:notes':'old note',
    },
  };
  const incoming = {
    batchKey:'batch:protected',
    fields:{
      'lock:status':'locked',
      'lock:recipe-signature':'stale-signature',
      'lock:orders-json':'[{"orderId":"old"}]',
      'dish:m1:notes':'new measured note',
    },
  };
  const merged = store.preserveLockFields(existing,incoming);
  assert.equal(merged.fields['lock:recipe-signature'],'current-signature');
  assert.equal(merged.fields['lock:orders-json'],'[{"orderId":"one"}]');
  assert.equal(merged.fields['dish:m1:notes'],'new measured note');
});

test('normal cook-log autosaves do not erase an omitted recurring-customer selection', () => {
  const selected = JSON.stringify({ nouman:{ enabled:true, quantities:{ 'High-Protein Beef Kofta & Roasted Vegetables|lean':6 } } });
  const existing = {
    batchKey:'batch:protected',
    fields:{
      'recurring:selections':selected,
      'dish:p1:notes':'old note',
    },
  };
  const staleIncoming = {
    batchKey:'batch:protected',
    fields:{ 'dish:p1:notes':'new note' },
  };
  assert.equal(store.preserveLockFields(existing,staleIncoming).fields['recurring:selections'],selected);

  const disabled = JSON.stringify({ nouman:{ enabled:false, quantities:{} } });
  const explicitIncoming = {
    batchKey:'batch:protected',
    fields:{ 'recurring:selections':disabled },
  };
  assert.equal(store.preserveLockFields(existing,explicitIncoming).fields['recurring:selections'],disabled);
});
