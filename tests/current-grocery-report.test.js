const test = require('node:test');
const assert = require('node:assert/strict');
const {execFileSync} = require('node:child_process');
const Report = require('../operations/tools/generate-current-grocery-report');
const Engine = require('../operations/production-engine');
const Run = require('../operations/production-run');
const Dashboard = require('../operations/grocery-dashboard');
const Grocery = require('../operations/grocery-list-core');
const Kitchen = require('../operations/kitchen-dashboard');
const data = require('../operations/nutrition/production-data');
const methods = require('../operations/cook-day-methods');
const config = Report.activeConfig();
const catalog = require('../operations/grocery-catalog').catalog;
const historicalBatch13 = require('./fixtures/batch13/final-counts-2026-10-01.json');
const currentBatch14 = require('./fixtures/batch14/current-counts-2026-10-07.json');
const copy = value => JSON.parse(JSON.stringify(value));
const empty = () => ({onHand:{},buyPackages:{},catalog:{}});
const order = (qty=2) => ({orderId:'REPORT-QA-1',customer:'Fixture customer',included:true,sourceStatus:'active',items:[{id:'m1',name:data.meals.m1.name,tier:'lean',qty,sourceQty:2}]});
const currentOrder = () => ({orderId:'REPORT-QA-CURRENT',customer:'Fixture customer',included:true,sourceStatus:'active',items:currentBatch14.counts.map(([id,tier,qty]) => ({id,name:data.meals[id].name,tier,qty}))});
function reviewed(sourceOrders, orders=sourceOrders, settings=Report.defaultSettings(), methodData=methods) {
  const plan=Engine.compileProduction({orders,data,methods:methodData,config,...settings});
  assert.deepEqual(plan.diagnostics.errors,[]);
  return {batchKey:`batch:${config.batch.number}|delivery:${config.batch.deliveryDate}`.toLowerCase(),fields:Run.reviewedFields({plan,orders,sourceOrders,...settings})};
}
const render = report => {const lines=[];Report.printReport({batch:config.batch.number,deliveryDate:'fixture only'},report,line=>lines.push(line));return lines.join('\n');};

test('import exposes pure helpers without fetching orders, reading live stores or writing reports',()=>{
  const result=execFileSync(process.execPath,['-e',`
    global.fetch=()=>{throw new Error('Unexpected network request')};
    const log=require('./operations/cook-log-store');log.loadLog=()=>{throw new Error('Unexpected live log read')};
    const pantry=require('./operations/grocery-state-store');pantry.loadState=()=>{throw new Error('Unexpected live pantry read')};
    const fs=require('node:fs');fs.writeFileSync=()=>{throw new Error('Unexpected report write')};
    const report=require('./operations/tools/generate-current-grocery-report');
    if(typeof report.build!=='function')throw new Error('Missing pure build');
    process.stdout.write('pure import');
  `],{cwd:require('node:path').join(__dirname,'..'),encoding:'utf8'});
  assert.equal(result,'pure import');
});
test('short rib uses Idahoan mash and exposes a measured Prep Day card',()=>{
  const entry=Object.entries(data.meals).find(([,meal])=>meal.name==='Braised Beef Short Rib');
  assert.ok(entry,'Braised Beef Short Rib must exist in production data');
  const [id,meal]=entry;
  const ingredients=meal.tiers.lean.ingredients.map(row=>row.key);
  assert.ok(ingredients.includes('instant_potato_flakes'));
  assert.ok(!ingredients.includes('potato'));
  const card=methods.meals[id].prepBatches.find(batch=>batch.componentRef==='short-rib-mash');
  assert.ok(card,'short-rib Idahoan mash must have its own Prep Day card');
  const text=[card.name,...card.steps].join(' ');
  assert.match(text,/Idahoan Original.*Do not peel, cut, boil, or mash fresh potatoes/is);
  assert.match(text,/Bring.*to a boil.*remove.*heat.*cold Fairlife milk.*flakes.*stand for 2 minutes/is);

  const shortRibOrder={orderId:'SHORT-RIB-CARD-QA',customer:'Fixture customer',included:true,sourceStatus:'active',items:[{id,tier:'lean',qty:4}]};
  const settings=Report.defaultSettings(methods);
  const plan=Engine.compileProduction({orders:[shortRibOrder],data,methods,config,...settings});
  assert.deepEqual(plan.diagnostics.errors,[]);
  const model=Kitchen.buildFromPlan(plan,plan.counts);
  const mashJob=model.jobs.find(job=>job.family==='instant-mash');
  assert.ok(mashJob,'the Prep Day runbook must contain the Idahoan mash batch');
  const amounts=Object.fromEntries(mashJob.ingredients.map(item=>[item.key,item.baseAmount]));
  const close=(actual,expected)=>assert.ok(Math.abs(actual-expected)<.001,`${actual} should be approximately ${expected}`);
  close(amounts.instant_potato_flakes,101.1428);
  close(amounts.water,375.4284);
  assert.equal(amounts.fairlife_milk,240);
  close(amounts.butter,32.5714);
  close(amounts.garlic_powder,1.7143);
  close(amounts.rosemary,1.7143);
  close(amounts.salt,1.7143);
  assert.equal(amounts.garlic,undefined);
  assert.match(mashJob.steps.join(' '),/cold milk.*Idahoan Original flakes.*stand for 2 minutes/is);
});
test('report uses reviewed quantities, reserves, snapshot and purchase rows exactly like shopping UI',()=>{
  const source=[order()],orders=[order(1)],settings=Report.defaultSettings();
  settings.buffer.rawProteinBufferPct=8;settings.buffer.riceBufferPct=22;
  const record=reviewed(source,orders,settings),saved=empty(),before=JSON.stringify([source,record,saved]);
  const report=Report.build(source,saved,{record});
  const ui=Dashboard.build({liveOrders:source,record,data,methods,config,defaults:Report.defaultSettings(),catalog,saved});
  assert.equal(report.exact,true);assert.equal(report.plan.totalMeals,1);
  assert.equal(report.settings.buffer.rawProteinBufferPct,8);assert.equal(report.settings.buffer.riceBufferPct,22);
  assert.equal(report.plan.snapshot.id,ui.plan.snapshot.id);assert.deepEqual(report.rows,ui.rows);
  assert.deepEqual(report.plan.requirements,ui.plan.requirements);
  assert.equal(JSON.stringify([source,record,saved]),before);
  assert.match(render(report),/Raw-protein purchasing reserve: 8%; rice allowance: 22%/);
});
test('source changes, recipe changes and invalid orders prevent a printable purchase list',()=>{
  const source=[order()],record=reviewed(source),newer=order(3);newer.items[0].sourceQty=3;
  const changed=Report.build([newer],null,{record});assert.equal(changed.blocked,true);assert.deepEqual(changed.rows,[]);
  assert.throws(()=>render(changed),/No grocery purchase list/);
  const revisedData=copy(data);revisedData.meals.m1.tiers.lean.ingredients[0].amount+=1;
  const stale=Report.build(source,null,{record,data:revisedData});assert.equal(stale.blocked,true);assert.deepEqual(stale.rows,[]);
  const invalid=order();invalid.items[0].id='missing';
  assert.equal(Report.build([invalid]).blocked,true);
  assert.throws(()=>Report.build(source,null,{methods:{...methods,batch:-1}}),/different batch/);
});
test('archived Batch 13 and Batch 14 counts remain historical evidence and are never treated as current demand',()=>{
  assert.equal(historicalBatch13.batch,13);assert.equal(historicalBatch13.customerItems,118);
  assert.equal(historicalBatch13.counts.reduce((sum,[,,qty])=>sum+qty,0),118);
  assert.ok(historicalBatch13.counts.some(([id])=>!data.meals[id]),'archived fixture intentionally contains recipe slots absent from the current batch');
  assert.equal(currentBatch14.batch,14);
  assert.notEqual(currentBatch14.batch,config.batch.number);
});
test('archived Batch 14 fixture compiles 45 customer items without inheriting current internal spares',()=>{
  const orders=[currentOrder()],testMethods=copy(methods);testMethods.productionExtras=[];
  const settings=Report.defaultSettings(testMethods),record=reviewed(orders,orders,settings,testMethods);
  const report=Report.build(orders,null,{methods:testMethods,record});
  assert.equal(report.plan.totalMeals,45);assert.equal(report.plan.productionExtras.length,0);
  assert.equal(report.plan.cups.total,40);assert.equal(report.plan.requirements.find(row=>row.key==='sauce_cup').required,40);
  const text=render(report);assert.match(text,/Explicit internal meals: 0; total physical meals: 45/);
  assert.doesNotMatch(text,/PLANNING ONLY, NOT RELEASED FOR PRODUCTION/);
  assert.match(text,/Customer recipe cups: 40; internal cups: 0; QC cups: 0/);
  assert.match(text,/Canonical cup-and-lid purchasing requirement: 40/);
  assert.doesNotMatch(text,/Epic Market|OWNER BUYER CORRECTIONS|Unlabeled internal Lean spares: 4/);
});
test('only explicitly reviewed extras increase physical meals and cups, never customer demand',()=>{
  const orders=[currentOrder()],testMethods=copy(methods),extraId='qa-owner-extra-m1';
  testMethods.productionExtras=[{
    id:extraId,dishId:'m1',label:'QA owner spare Streetcorn',ownerServings:1,tier:'lean',optional:true,enabled:false,
    ingredients:copy(data.meals.m1.tiers.lean.ingredients),
    packaging:[
      {key:'meal_container',name:'Meal container with lid',unit:'each',station:'Packaging',required:1},
      {key:'sauce_cup',name:'2 oz sauce cup with lid',unit:'each',station:'Packaging',required:1},
    ],
  }];
  const settings=Report.defaultSettings(testMethods);settings.extras=[extraId];
  const report=Report.build(orders,null,{methods:testMethods,record:reviewed(orders,orders,settings,testMethods)});
  assert.equal(report.plan.totalMeals,45);assert.equal(report.plan.labelCount,45);
  assert.equal(report.plan.productionExtras.reduce((sum,row)=>sum+row.ownerServings,0),1);
  assert.equal(report.plan.cups.totalCustomer,40);assert.equal(report.plan.cups.totalExtras,1);
  const text=render(report);assert.match(text,/Explicit internal meals: 1; total physical meals: 46/);
  assert.match(text,/Customer recipe cups: 40; internal cups: 1; QC cups: 0/);
});
test('saved recurring orders materialize once and preserve Nouman protein and sauce identities',()=>{
  const record={fields:{'recurring:selections':JSON.stringify({nouman:{enabled:true,quantities:{
    'High-Protein Beef Kofta & Roasted Vegetables|lean':3,
    'Custom Lean Chicken Mince|lean':3,
  }}})}};
  const report=Report.build([],null,{record});assert.equal(report.blocked,false);assert.equal(report.plan.totalMeals,6);
  assert.equal(report.plan.operational.totals.find(row=>row.key==='beef_96_raw').baseAmount,990);
  assert.equal(report.plan.operational.totals.find(row=>row.key==='chicken_mince_raw').baseAmount,900);
  assert.equal(report.plan.cups.totalCustomer,12);
  assert.equal(report.plan.requirements.find(row=>row.key==='sauce_cup').required,12);
  assert.equal(report.plan.cups.customer.find(row=>row.batchGroup==='sweet-heat').cups,9);
  assert.equal(report.plan.cups.customer.find(row=>row.batchGroup==='lebanese-dressing').cups,3);
  const real={...order(),customer:'Nouman Ali Khan',items:[{id:'p1',name:data.meals.p1.name,tier:'lean',qty:2}]};
  const synced=Report.build([real],null,{record});assert.equal(synced.plan.totalMeals,2);assert.equal(synced.recurringWarnings.length,1);
});
test('pantry changes purchases only; CLI overrides cannot silently change the reviewed plan',()=>{
  const source=[order()],record=reviewed(source),plain=Report.build(source,null,{record});
  const saved={onHand:{rice_dry:10000},buyPackages:{},catalog:{rice_dry:{price:4.25}}};
  const stocked=Report.build(source,saved,{record});
  assert.equal(stocked.plan.snapshot.id,plain.plan.snapshot.id);assert.deepEqual(stocked.plan.requirements,plain.plan.requirements);
  assert.deepEqual(stocked.rows,Grocery.buildPurchaseRows(plain.plan.requirements,catalog,saved));
  assert.equal(stocked.rows.find(row=>row.key==='rice_dry').needed,0);
  assert.doesNotThrow(()=>Report.validateEnvironment({}));
  for(const key of ['PRPD_MANUAL_ORDERS_JSON','PRPD_EXCLUDE_CUSTOMERS','PRPD_RAW_PROTEIN_BUFFER_PCT'])
    assert.throws(()=>Report.validateEnvironment({[key]:'5'}),/Cook Day Planner/);
});
