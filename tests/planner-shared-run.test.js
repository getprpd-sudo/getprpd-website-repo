const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const engine = require('../operations/production-engine');
const Run = require('../operations/production-run');
const copy = value => JSON.parse(JSON.stringify(value));
const html = fs.readFileSync(require.resolve('../operations/cook-day-planner.html'), 'utf8');
const script = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(match=>match[1]).find(value=>value.includes('const BASE_CONFIG'));

function harness() {
  const elements = new Map();
  const get = id => {
    if (!elements.has(id)) elements.set(id, {value:({rawProteinBufferPct:'5',riceBufferPct:'15',riceYieldFactor:'2.75',customerSauceCupsTotal:'0',kitchenSauceCups:'0',qcSauceCups:'0',cookDate:'2026-10-02'})[id] || '',textContent:'',className:'',disabled:false});
    return elements.get(id);
  };
  let compiles = 0;
  const window = {
    PRPD_ORDER_CONFIG:copy(require('../config/order-config')),
    PRPD_PRODUCTION_DATA:copy(require('../operations/nutrition/production-data')),
    PRPD_COOK_METHODS:copy(require('../operations/cook-day-methods')),
    PRPD_COOK_DAY:require('../operations/cook-day-core'),
    PRPD_PRODUCTION_ENGINE:{...engine,compileProduction(options){compiles++;return engine.compileProduction(options);}},
    PRPD_PRODUCTION_RUN:Run,
  };
  const context = vm.createContext({window,document:{getElementById:get},PRPD_KITCHEN:require('../operations/kitchen-dashboard'),console});
  vm.runInContext(script.slice(0,script.indexOf("\n    document.querySelectorAll('.nav-btn').forEach(button")),context);
  const run = code => vm.runInContext(code,context);
  return {context,window,get,run,compiles:()=>compiles};
}
function load(h, items=[{id:'bw2',tier:'lean',qty:2}]) {
  h.context.inputOrders=[{orderId:'test-shared-order',customer:'Test customer',included:true,sourceStatus:'active',items}];
  h.run('state.orders = inputOrders; state.counts = Object.fromEntries(CORE.aggregateCounts(state.orders).map(item=>[countKey(item.id,item.tier),item.qty]));');
}

test('planner inline script is syntactically valid and shared dependencies precede consumers',()=>{
  new vm.Script(script);
  assert.ok(html.indexOf('/operations/production-engine.js') < html.indexOf('/operations/kitchen-dashboard.js'));
  assert.ok(html.indexOf('/operations/grocery-list-core.js') < html.indexOf('/operations/production-engine.js'));
});

test('planner compiles once for all views, invalidates settings, and shares the exact reviewed run with shopping',()=>{
  const h=harness();load(h);
  const first=h.run('compileCurrentPlan(selectedCounts())');
  assert.deepEqual(first.diagnostics.errors,[]);
  assert.equal(h.run('compileCurrentPlan(selectedCounts())'),first);
  assert.equal(h.compiles(),1);
  assert.equal(first.buffer.riceYieldFactor,2.75);
  h.get('riceBufferPct').value='20';
  const next=h.run('compileCurrentPlan(selectedCounts())');
  assert.equal(h.compiles(),2);assert.notEqual(first.snapshot.id,next.snapshot.id);
  h.run('state.cookLog.fields = reviewedPlanFields(compileCurrentPlan(selectedCounts()),productionOrders())');
  const record=h.run('state.cookLog'),source=h.run('state.orders');
  const chosen=Run.selectOrders(source,record),settings=Run.settings(record);
  const grocery=engine.compileProduction({orders:chosen.orders,data:h.window.PRPD_PRODUCTION_DATA,methods:h.window.PRPD_COOK_METHODS,config:h.window.PRPD_ORDER_CONFIG,...settings});
  assert.equal(Run.snapshotStatus(grocery,record).ok,true);
  assert.equal(grocery.snapshot.id,next.snapshot.id);
  assert.deepEqual(grocery.requirements,next.requirements);
});

test('new locks freeze shared content and changed notes or settings require review',async()=>{
  const h=harness();load(h);
  h.run('saveCookLog = async () => true; renderBatchLock = () => {};');
  assert.equal(await h.run('freezeCurrentBatchPlan()'),true);
  assert.equal(h.run('validateLockedPlan(selectedCounts())'),true);
  const saved=h.run('RUN.read(state.cookLog,"lock:engine-snapshot-json")');
  assert.ok(saved.id);
  h.run('state.orders[0].notes = "New food instruction"');
  assert.equal(h.run('validateLockedPlan(selectedCounts())'),false);
  assert.match(h.get('importStatus').textContent,/source orders changed/);
  h.run('state.orders[0].notes = ""; state.cookLog.fields["lock:buffer-json"] = JSON.stringify({rawProteinBufferPct:5,riceBufferPct:20,riceYieldFactor:2.75})');
  assert.equal(h.run('validateLockedPlan(selectedCounts())'),false);
  assert.match(h.get('importStatus').textContent,/shared plan changed/);
});

test('draft extra selection cannot mutate the last reviewed shopping agreement before Run',()=>{
  const h=harness();load(h,[{id:'m7',tier:'lean',qty:1}]);
  h.run('state.cookLog.fields = reviewedPlanFields(compileCurrentPlan(selectedCounts()),productionOrders())');
  const before=h.run('state.cookLog.fields["plan:engine-snapshot-json"]');
  const id=h.window.PRPD_COOK_METHODS.productionExtras.find(extra=>extra.dishId==='m7').id;
  h.context.extraId=id;h.run('state.draftExtras = [extraId]');
  assert.deepEqual(copy(h.run('selectedExtraIds()')),[id]);
  assert.deepEqual(Run.settings(h.run('state.cookLog')).extras,[]);
  assert.equal(h.run('state.cookLog.fields["plan:engine-snapshot-json"]'),before);
  assert.equal(h.run('compileCurrentPlan(selectedCounts()).productionExtras.length'),1);
  h.run('Object.assign(state.cookLog.fields,reviewedPlanFields(compileCurrentPlan(selectedCounts()),productionOrders()));state.draftExtras=null');
  assert.deepEqual(Run.settings(h.run('state.cookLog')).extras,[id]);
});

test('required label counts never silently omit recipes missing from the current label dataset',()=>{
  const h=harness();load(h,[{id:'m7',tier:'lean',qty:2}]);
  // The isolated harness deliberately has no label dataset. Required demand
  // still comes from orders; the separate production guard gates printing.
  assert.equal(h.run('customerLabelPlan().totalLabels'),2);
  assert.equal(h.run('compileCurrentPlan(selectedCounts()).labelCount'),2);
});

test('summary uses the selected compiled extras instead of default recipe metadata',()=>{
  const h=harness();load(h,[{id:'m7',tier:'lean',qty:1}]);
  h.context.extraId=h.window.PRPD_COOK_METHODS.productionExtras.find(extra=>extra.dishId==='m7').id;
  h.run('state.draftExtras=[extraId]; renderMetrics({orders:1,productionMeals:1,labels:1},selectedCounts())');
  assert.match(h.get('metrics').innerHTML,/Owner spares<\/span><strong>1/);
  assert.match(h.get('metrics').innerHTML,/Physical cook target<\/span><strong>2/);
  assert.match(h.get('metrics').innerHTML,/Labels required<\/span><strong>1/);
});

test('lock persistence failure restores the prior lock and never reports success',async()=>{
  const h=harness();load(h);
  h.run('saveCookLog = async () => false; renderBatchLock = () => {}; writeLocalCookLog = () => {};');
  assert.equal(await h.run('freezeCurrentBatchPlan()'),false);
  assert.equal(h.run('batchPlanLock().locked'),false);
  assert.equal(h.run('state.cookLog.fields["lock:engine-snapshot-json"]'),undefined);
});

test('failed unlock restores the exact frozen run and existing pack-out checks',async()=>{
  const h=harness();load(h);
  h.run('saveCookLog=async()=>true;renderBatchLock=()=>{}');
  assert.equal(await h.run('freezeCurrentBatchPlan()'),true);
  h.run('state.cookLog.fields["pack:fixture:packed"]="1";state.confirmUnlock=true;saveCookLog=async()=>false;writeLocalCookLog=()=>{}');
  const before=copy(h.run('state.cookLog.fields'));
  assert.equal(await h.run('unlockBatchPlan()'),false);
  assert.deepEqual(copy(h.run('state.cookLog.fields')),before);
  assert.match(h.get('importStatus').textContent,/Unlock could not be saved/);
});

test('selected extras survive the transition into a new lock and alter both ingredient and packaging demand',async()=>{
  const h=harness();load(h,[{id:'m7',tier:'lean',qty:1}]);
  // Isolate lock mechanics from the real recipe's physical-validation status.
  // This fixture does not release or mutate the on-disk recipe.
  h.run('METHODS.meals.m7.productionHold = ""; METHODS.meals.m7.productionReleaseHold = "";');
  const baseline=h.run('compileCurrentPlan(selectedCounts())');
  assert.deepEqual(baseline.diagnostics.holds,[]);
  const id=h.window.PRPD_COOK_METHODS.productionExtras.find(extra=>extra.dishId==='m7').id;
  h.context.extraId=id;
  h.run('state.cookLog.fields["plan:extras-json"] = JSON.stringify([extraId]); saveCookLog = async () => true; renderBatchLock = () => {};');
  const selected=h.run('compileCurrentPlan(selectedCounts())');
  assert.equal(selected.productionExtras.length,1);
  assert.equal(selected.cups.total,baseline.cups.total+1);
  assert.equal(await h.run('freezeCurrentBatchPlan()'),true);
  assert.deepEqual(copy(h.run('selectedExtraIds()')),[id]);
  assert.equal(h.run('validateLockedPlan(selectedCounts())'),true);
});
