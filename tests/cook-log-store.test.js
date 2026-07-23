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
