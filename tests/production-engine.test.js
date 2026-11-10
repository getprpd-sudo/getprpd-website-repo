const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const engine=require('../operations/production-engine');
const core=require('../operations/cook-day-core');
const data=require('../operations/nutrition/production-data');
const methods=require('../operations/cook-day-methods');
const config=require('../config/order-config');
const final=require('./fixtures/batch14/current-counts-2026-10-07.json');
const copy=value=>JSON.parse(JSON.stringify(value));
const counts=final.counts.map(([id,tier,qty])=>({id,tier,qty}));
const compile=options=>engine.compileProduction({data,methods,config,...options});
const total=(plan,key)=>plan.operational.totals.find(row=>row.key===key)?.baseAmount||0;
const purchase=(plan,key)=>plan.requirements.find(row=>row.key===key)?.required||0;
const order=(items,extra={})=>({orderId:'order-fixture-1',customer:'Fixture customer',phone:'5550100',items,...extra});

test('empty demand has no ingredients, QC, cups, gloves or fixed packaging',()=>{
  const plan=compile({orders:[]});
  assert.equal(plan.diagnostics.ok,true);
  assert.deepEqual(plan.requirements,[]);assert.deepEqual(plan.packaging,[]);
  assert.equal(plan.totalMeals,0);assert.equal(plan.cups.total,0);
});

test('current Batch 14 preview compiles once into 45 meals, 27 physical cups and conserved inputs',()=>{
  const plan=compile({counts,buffer:{rawProteinBufferPct:5,riceBufferPct:10}});
  assert.equal(data.batch,14);assert.equal(methods.batch,14);assert.equal(config.batch.number,14);
  assert.deepEqual(plan.diagnostics.errors,[]);assert.equal(plan.diagnostics.holds.length,0);
  assert.equal(plan.diagnostics.ok,true);assert.equal(plan.diagnostics.releaseReady,true);
  assert.equal(plan.totalMeals,45);assert.equal(plan.productionExtras.length,0);
  assert.equal(plan.cups.totalCustomer,27);assert.equal(plan.cups.totalQc,0);assert.equal(plan.cups.total,27);
  assert.equal(purchase(plan,'sauce_cup'),27);
  assert.equal(purchase(plan,'meal_container'),39);assert.equal(purchase(plan,'grab_go_container'),5);
  assert.equal(purchase(plan,'dessert_cup'),1);assert.equal(purchase(plan,'small_dessert_box'),0);
  assert.equal(total(plan,'beef_96_raw'),0);assert.equal(total(plan,'beef_90_raw'),585);
  assert.equal(purchase(plan,'beef_90_raw'),614.3);
  assert.equal(total(plan,'chicken_thigh_raw'),5458.8367);assert.equal(purchase(plan,'chicken_thigh_raw'),5731.8);
  assert.ok(plan.conservation.ingredients.length>250);
  assert.ok(plan.conservation.ingredients.every(row=>Math.abs(row.difference)<.001));
  assert.ok(plan.conservation.tiers.every(row=>Math.abs(row.difference)<.001));
  assert.equal(plan.dishIngredients.m4.find(row=>row.key==='shrimp_raw').baseAmount,200);
  assert.equal(plan.recipes.find(row=>row.id==='m4').output.quantity.value,null);
  assert.equal(plan.recipes.find(row=>row.id==='m4').inputs.find(row=>row.key==='rice_dry').quantity.basis,'dry-input');
  const rice=plan.operational.totals.find(row=>row.key==='rice_dry');
  assert.ok(Math.abs(rice.bufferedAmount-rice.baseAmount*1.1)<.001);
});

test('menu slot permutation leaves stable recipe versions, ingredients, packaging and fingerprints unchanged',()=>{
  const remap=Object.fromEntries(Object.keys(data.meals).map((id,index)=>[id,`new_menu_${index}`]));
  const movedData=copy(data),movedMethods=copy(methods),movedConfig=copy(config);
  movedData.meals=Object.fromEntries(Object.entries(data.meals).map(([id,value])=>[remap[id],value]));
  movedMethods.meals=Object.fromEntries(Object.entries(methods.meals).map(([id,value])=>[remap[id],value]));
  movedMethods.groceryAdjustments.forEach(row=>{if(row.dishId)row.dishId=remap[row.dishId];});
  movedMethods.productionExtras.forEach(row=>row.dishId=remap[row.dishId]);
  movedMethods.weeklySauces.eligibleMealIds=movedMethods.weeklySauces.eligibleMealIds.map(id=>remap[id]);
  Object.values(movedConfig.menu).flat().forEach(row=>{if(remap[row.id])row.id=remap[row.id];});
  const original=compile({counts}),moved=compile({data:movedData,methods:movedMethods,config:movedConfig,counts:counts.map(row=>({...row,id:remap[row.id]}))});
  assert.deepEqual(moved.diagnostics.errors,[]);
  assert.deepEqual(moved.requirements,original.requirements);
  assert.deepEqual(moved.registry.current,original.registry.current);
  assert.equal(moved.snapshot.id,original.snapshot.id);
});

test('current Batch 14 owner extras are explicit, optional, and excluded until selected',()=>{
  const orders=[order(counts)],baseline=compile({orders});
  assert.deepEqual(baseline.diagnostics.errors,[]);
  assert.equal(baseline.totalMeals,45);assert.equal(baseline.labelCount,45);
  assert.deepEqual(methods.productionExtras.map(extra=>extra.id),[
    'batch14-owner-extra-b3','batch14-owner-extra-m1','batch14-owner-extra-m2',
    'batch14-owner-extra-m3','batch14-owner-extra-bw1',
  ]);
  assert.ok(methods.productionExtras.every(extra=>extra.optional===true&&extra.enabled===false&&extra.tier==='lean'));
  assert.deepEqual(baseline.productionExtras,[]);
  assert.equal(baseline.cups.totalExtras,0);

  const selected=compile({orders,extras:methods.productionExtras.map(extra=>extra.id)});
  assert.deepEqual(selected.diagnostics.errors,[]);
  assert.equal(selected.productionExtras.reduce((sum,extra)=>sum+extra.ownerServings,0),5);
  assert.equal(selected.labelCount,45);
  assert.equal(selected.cups.totalExtras,3);

  const stale=compile({orders,extras:['batch13-internal-spare']});
  assert.equal(stale.diagnostics.ok,false);
  assert.ok(stale.diagnostics.errors.some(error=>/Unknown internal extra batch13-internal-spare/.test(error)));
  assert.deepEqual(stale.requirements,[]);
});

test('order snapshots ignore ingestion metadata but retain notes, quantity and order identity',()=>{
  const items=[{id:'bw2',tier:'lean',qty:2}];
  const first=compile({orders:[order(items)]});
  const imported=compile({orders:[order(items.map(item=>({...item,sourceQty:999,expanded:true})),{fetchedAt:'new',sourceRow:24})]});
  assert.equal(imported.snapshot.id,first.snapshot.id);
  const changed=compile({orders:[order(items,{notes:'No pickles.'})]});
  assert.notEqual(changed.snapshot.orderHash,first.snapshot.orderHash);
  assert.equal(engine.compareSnapshots(first.snapshot,changed.snapshot).same,false);
  const secondOrder=compile({orders:[order(items,{orderId:'different-order'})]});
  assert.notEqual(secondOrder.snapshot.orderHash,first.snapshot.orderHash);
});

test('expanded items retain exact current tiers without inheriting Batch 13 omission rules',()=>{
  const orders=[order([{id:'m5',tier:'lean',qty:1},{id:'m7',tier:'bulk',qty:1}],{notes:'No pickles or raw tomatoes please',bundleName:'Fixture bundle'})];
  const plan=compile({orders});
  assert.equal(plan.totalMeals,2);assert.deepEqual(plan.diagnostics.errors,[]);
  assert.deepEqual(plan.counts.map(row=>[row.id,row.tier,row.qty]).sort(),[['m5','lean',1],['m7','bulk',1]]);
  assert.equal(plan.customerNotes[0].note,'No pickles or raw tomatoes please');
  assert.deepEqual(plan.customerNotes[0].items,[]);
  assert.ok(plan.recipes.every(row=>row.customerNotes.length===0));
  const unexpanded=compile({orders:[order([{id:'unexpanded_bundle',tier:'lean',qty:1}])]});
  assert.equal(unexpanded.diagnostics.ok,false);assert.deepEqual(unexpanded.requirements,[]);
});

test('structural failures return no actionable grocery demand',()=>{
  for(const options of [
    {counts:[{id:'not_a_recipe',tier:'lean',qty:1}]},
    {counts:[{id:'m4',tier:'lean',qty:1.2}]},
    {counts:[{id:'m4',tier:'lean',qty:-1}]},
    {orders:[{customer:'Ambiguous',items:[{id:'m4',tier:'lean',qty:1}]}]},
    {orders:[order([{id:'m4',tier:'lean',qty:1}]),order([{id:'m4',tier:'lean',qty:1}])]},
    {orders:[order([{id:'m4',tier:'lean',qty:1}])],counts:[{id:'m4',tier:'lean',qty:2}]},
    {counts:[{id:'m4',tier:'lean',qty:1}],extras:['unknown-extra']},
    {orders:[order([{id:'m4',tier:'lean',qty:1,ingredientOverrides:{pink_salmon_raw:250}}])]},
  ]){const plan=compile(options);assert.equal(plan.diagnostics.ok,false);assert.deepEqual(plan.requirements,[]);}
  const changed=copy(data);changed.meals.m4.tiers.lean.ingredients[0].amount=NaN;
  assert.equal(compile({data:changed,counts:[{id:'m4',tier:'lean',qty:1}]}).diagnostics.ok,false);
});

test('physical holds never mask invalid workflow or over-allocation',()=>{
  const changed=copy(methods),heldData=copy(data);changed.meals.b4.prepBatches[0].type='unknown-step';
  heldData.meals.b4.productionHold='Injected physical release hold for coverage testing.';
  const plan=compile({data:heldData,methods:changed,counts:[{id:'b4',tier:'bulk',qty:1}]});
  assert.ok(plan.diagnostics.holds.length);assert.ok(plan.diagnostics.errors.some(error=>error.includes('unregistered')));
  assert.equal(plan.diagnostics.ok,false);assert.deepEqual(plan.requirements,[]);
});

test('unconfirmed recurring planning orders feed ingredients but not labels or release',()=>{
  const pending=order([{id:'p1',tier:'lean',qty:3},{id:'p2',tier:'lean',qty:3}],{
    orderId:'pending-nouman',customer:'Nouman Ali Khan',planningOnly:true,
    recurringStatus:'planning',confirmationStatus:'unconfirmed',sourceStatus:'planning',
  });
  const plan=compile({orders:[pending]});
  assert.deepEqual(plan.diagnostics.errors,[]);
  assert.equal(plan.totalMeals,6);
  assert.equal(plan.labelCount,0);
  assert.equal(plan.operational.totals.find(row=>row.key==='beef_96_raw').baseAmount,990);
  assert.equal(plan.operational.totals.find(row=>row.key==='chicken_mince_raw').baseAmount,900);
  assert.equal(plan.diagnostics.holds.length,1);
  assert.equal(plan.diagnostics.releaseReady,false);
  assert.match(plan.diagnostics.holds[0],/unconfirmed/);
  const labelsApproved=compile({orders:[{...pending,labelsApproved:true}]});
  assert.equal(labelsApproved.labelCount,6);
  assert.equal(labelsApproved.diagnostics.releaseReady,false);
  assert.notEqual(labelsApproved.snapshot.id,plan.snapshot.id);
});

test('outputs and snapshots are immutable and source records are not mutated',()=>{
  const before=JSON.stringify({data,methods,counts});
  const plan=compile({counts});
  assert.equal(JSON.stringify({data,methods,counts}),before);
  assert.ok(Object.isFrozen(plan));assert.ok(Object.isFrozen(plan.snapshot.recipeRefs));
  assert.ok(Object.isFrozen(plan.recipes[0].ingredients[0]));
  assert.throws(()=>plan.counts.push({id:'oops'}),TypeError);
  const same=compile({counts:[...counts].reverse()});assert.equal(same.snapshot.id,plan.snapshot.id);
  const changed=copy(data);changed.meals.m4.tiers.lean.ingredients[0].amount+=1;
  assert.notEqual(compile({data:changed,counts}).snapshot.recipeHash,plan.snapshot.recipeHash);
});

test('current sauce graph keeps true cups at 45g and incorporated yogurt separate',()=>{
  const plan=compile({counts});
  const garlic=plan.sauceGroups.find(row=>row.family==='garlic-herb-yogurt');
  assert.equal(garlic.cupPlan.reduce((n,row)=>n+row.cups,0),20);
  assert.equal(garlic.incorporated.reduce((n,row)=>n+row.qty,0),1);
  assert.ok(Math.abs(garlic.incorporated.reduce((n,row)=>n+row.inputGrams,0)-25.0002)<.001);
  assert.equal(garlic.variants.filter(row=>row.delivery==='incorporated').length,1);
  const honey=plan.sauceGroups.find(row=>row.family==='honey-barbecue-mustard');
  assert.equal(honey.cupPlan.reduce((n,row)=>n+row.cups,0),4);
  assert.deepEqual(honey.cupPlan.map(row=>[row.gramsPerMeal,row.cups]),[[45,4]]);
  const onlyGarlic=compile({counts:[{id:'m6',tier:'lean',qty:1}]});
  assert.equal(onlyGarlic.cups.totalQc,0);assert.equal(purchase(onlyGarlic,'sauce_cup'),1);
  assert.equal(onlyGarlic.sauceGroups.find(row=>row.family==='honey-barbecue-mustard'),undefined);
});

test('browser and Node compile identical immutable output using the actual global dependencies',()=>{
  const context={window:{},console};context.globalThis=context.window;
  vm.createContext(context);
  for(const file of ['config/order-config.js','operations/nutrition/production-data.js','operations/cook-day-core.js','operations/cook-day-methods.js','operations/kitchen-workflow.js','operations/grocery-list-core.js','operations/production-engine.js'])vm.runInContext(fs.readFileSync(require.resolve('../'+file),'utf8'),context,{filename:file});
  const browser=context.window.PRPD_PRODUCTION_ENGINE.compileProduction({counts,data:context.window.PRPD_PRODUCTION_DATA,methods:context.window.PRPD_COOK_METHODS,config:context.window.PRPD_ORDER_CONFIG});
  const node=compile({counts});
  assert.deepEqual(JSON.parse(JSON.stringify(browser.snapshot)),node.snapshot);
  assert.deepEqual(JSON.parse(JSON.stringify(browser.requirements)),node.requirements);
  assert.equal(browser.diagnostics.ok,true);
});

test('frozen historical library remains a distinct registry and conserves all 33 tiers',()=>{
  const historical=require('./fixtures/batch10/production.json'),historicalMethods=require('./fixtures/batch10/methods.json');
  const rows=Object.entries(historical.meals).flatMap(([id,meal])=>Object.keys(meal.tiers).map(tier=>({id,tier,qty:1})));
  const plan=engine.compileProduction({counts:rows,data:historical,methods:historicalMethods,config:{},buffer:{rawProteinBufferPct:5}});
  assert.equal(plan.totalMeals,33);assert.deepEqual(plan.diagnostics.errors,[]);
  assert.ok(plan.conservation.ingredients.every(row=>Math.abs(row.difference)<.001));
  const library=copy(data);library.recipeLibrary={'Archived test':{tiers:{single:{ingredients:[]}}}};
  const registry=compile({data:library,counts:[]}).registry;
  assert.equal(registry.historical[0].id,'recipe:archived-test');
  assert.ok(registry.current.every(row=>row.status==='current'));
});

test('cancelled, skipped, held and explicitly excluded orders cannot contribute demand',()=>{
  const items=[{id:'m6',tier:'lean',qty:1}];
  const orders=[order(items),order(items,{orderId:'cancelled',sourceStatus:'cancelled'}),order(items,{orderId:'skipped',sourceStatus:'skipped'}),order(items,{orderId:'held',notes:'[HOLD] pending'}),order(items,{orderId:'excluded',included:false})];
  const plan=compile({orders});
  assert.equal(plan.totalMeals,1);assert.deepEqual(plan.diagnostics.errors,[]);
  const cancelledOnly=[order(items,{sourceStatus:'cancelled'})];
  assert.equal(compile({orders:cancelledOnly}).totalMeals,0);
  assert.equal(compile({orders:cancelledOnly,counts:items}).diagnostics.ok,false);
});

test('buffer validation rejects out-of-range or invalid values before clamping',()=>{
  for(const buffer of [{rawProteinBufferPct:21},{rawProteinBufferPct:-1},{riceBufferPct:31},{riceYieldFactor:0},{riceYieldFactor:5},{rawProteinReserveByDish:{m4:31}},{rawProteinBufferPct:''}]){
    const plan=compile({counts:[{id:'m4',tier:'lean',qty:1}],buffer});
    assert.equal(plan.diagnostics.ok,false);assert.deepEqual(plan.requirements,[]);
  }
  const numeric=compile({counts:[{id:'p1',tier:'lean',qty:1}],buffer:5});
  assert.equal(numeric.buffer.rawProteinBufferPct,5);
});

test('global quantity and packaging policy changes invalidate recipe snapshots',()=>{
  const baseline=compile({counts}).snapshot;
  for(const change of [
    m=>m.groceryAdjustments.push({key:'salt',name:'Synthetic audit adjustment',unit:'g',delta:1,reason:'Snapshot audit only.'}),
    m=>m.extraPackaging.push({key:'meal_container',name:'Synthetic audit container',unit:'each',required:1}),
    m=>m.weeklySauces.policy+=' Changed policy.',
    m=>m.sharedProteinSeasoning.push({id:'inactive-fixture',dishIds:[],proteinKey:'chicken_thigh_raw',base:[]}),
  ]){const changed=copy(methods);change(changed);assert.notEqual(compile({counts,methods:changed}).snapshot.recipeHash,baseline.recipeHash);}
});

test('whole-pan completion preserves each tier in a mixed historical recipe',()=>{
  const historical=require('./fixtures/batch10/production.json'),historicalMethods=copy(require('./fixtures/batch10/methods.json'));
  historicalMethods.meals.m4.panBatch.servingsPerPan=4; // Synthetic capacity, not a measured claim.
  const selected=[{id:'m4',name:historical.meals.m4.name,tier:'lean',qty:1},{id:'m4',name:historical.meals.m4.name,tier:'bulk',qty:2}];
  const extras=core.resolvedProductionExtras(selected,historical,historicalMethods);
  assert.equal(extras.find(row=>row.tier==='lean').ownerServings,3);
  assert.equal(extras.find(row=>row.tier==='bulk').ownerServings,2);
  const bulk=extras.find(row=>row.tier==='bulk');
  assert.equal(bulk.ingredients.find(row=>row.key==='chicken_thigh_raw').amount,historical.meals.m4.tiers.bulk.ingredients.find(row=>row.key==='chicken_thigh_raw').amount*2);
});

test('new unowned fixed batch quantities fail cross-tier conservation instead of being duplicated',()=>{
  const changed=copy(methods);
  changed.meals.m4.prepBatches.find(row=>row.type==='sauce').formulaIngredients=[{key:'unowned_fixed_stock',name:'Synthetic fixed stock',unit:'g',fixedAmount:5,includeInGrocery:true}];
  const plan=compile({counts:[{id:'m4',tier:'lean',qty:1},{id:'m4',tier:'bulk',qty:1}],methods:changed});
  assert.equal(plan.diagnostics.ok,false);
  assert.deepEqual(plan.requirements,[]);
  assert.ok(plan.diagnostics.errors.some(error=>/tier allocations differ|no recipe source|missing recipe ingredient/.test(error)));
});
