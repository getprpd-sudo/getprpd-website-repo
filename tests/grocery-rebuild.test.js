const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname,'..');
const cook = require('../operations/cook-day-core');
const engine = require('../operations/production-engine');
const run = require('../operations/production-run');
const dashboard = require('../operations/grocery-dashboard');
const grocery = require('../operations/grocery-list-core');
const data = require('../operations/nutrition/production-data');
const methods = require('../operations/cook-day-methods');
const catalog = require('../operations/grocery-catalog').catalog;
const baseConfig = require('../config/order-config');
const plannerOnly = Object.entries(data.meals).filter(([,meal])=>meal.plannerOnly).map(([id,meal])=>({id,name:meal.name,aliases:meal.aliases||[],category:meal.orderCategory||'standard',packageType:meal.packageType||''}));
const config = {...baseConfig,menu:{...baseConfig.menu,mains:[...baseConfig.menu.mains,...plannerOnly]}};
const defaults = {buffer:{rawProteinBufferPct:'5',rawProteinReserveByDish:methods.rawProteinReserveByDish||{},riceBufferPct:'15',riceYieldFactor:'2.75'},sauceConfig:{...methods.weeklySauces,customerCupsTotal:'0',kitchenUseCupsPerSauce:'0',qcCupsPerSauce:String(Number(methods.weeklySauces.qcCupsPerSauce)||0)},extras:[]};
const order = (qty=2) => ({orderId:'QA-ORDER-1',customer:'Fixture customer',included:true,sourceStatus:'active',items:[{id:'m1',name:data.meals.m1.name,tier:'lean',qty,sourceQty:2}]});
const emptySaved = () => ({onHand:{},buyPackages:{},catalog:{}});
const near = (actual, expected, tolerance = 0.001) => assert.ok(Math.abs(actual-expected) <= tolerance, `${actual} should be within ${tolerance} of ${expected}`);
function reviewed(live=[order()], orders=live) {
  const plan = engine.compileProduction({orders,data,methods,config,...defaults});
  assert.deepEqual(plan.diagnostics.errors,[]);
  return {batchKey:`batch:${config.batch.number}|delivery:${config.batch.deliveryDate}`.toLowerCase(),updatedAt:'2026-10-05T22:00:00Z',fields:run.reviewedFields({plan,orders,sourceOrders:live,...defaults})};
}
const build = (record, liveOrders=[order()], saved=emptySaved()) => dashboard.build({liveOrders,record,data,methods,config,defaults,catalog,saved});

test('grocery consumes the exact shared engine snapshot and requirements, with persisted string settings',()=>{
  const record = reviewed(), result = build(record);
  const expected = engine.compileProduction({orders:run.selectOrders([order()],record).orders,data,methods,config,...run.settings(record,defaults)});
  assert.equal(result.exact,true);
  assert.equal(result.plan.snapshot.id,expected.snapshot.id);
  assert.deepEqual(result.plan.requirements,expected.requirements);
  assert.deepEqual(result.rows,grocery.buildPurchaseRows(expected.requirements,catalog,emptySaved()));
  assert.ok(Object.isFrozen(result.plan));
  assert.equal(result.plan.productionExtras.filter(extra=>extra.optional).length,0);
});
test('reviewed quantities stay reviewed and source changes stop replacement',()=>{
  const record = reviewed([order(2)],[order(1)]), result = build(record);
  assert.equal(result.plan.totalMeals,1);
  const newer = order(3); newer.items[0].sourceQty=3;
  const changed = build(record,[newer]);
  assert.equal(changed.blocked,true); assert.equal(changed.selection.mode,'changed');
  assert.deepEqual(changed.rows,[]);
});
test('new locks must match snapshot; older locks are explicit previews, never exact',()=>{
  const record=reviewed();
  for (const [key,value] of Object.entries(record.fields)) if(key.startsWith('plan:')) record.fields[key.replace('plan:','lock:')]=value;
  record.fields['lock:status']='locked';
  assert.equal(build(record).exact,true);
  const newer=order(3);newer.items[0].sourceQty=3;
  assert.equal(build(record,[newer]).selection.changed,true);
  assert.equal(build(record,[newer]).plan.totalMeals,2);
  assert.equal(build(record,[newer]).blocked,true);
  assert.deepEqual(build(record,[newer]).rows,[]);
  record.fields['lock:engine-snapshot-json']=JSON.stringify({id:'older-engine-version'});
  assert.equal(build(record).blocked,true);
  assert.deepEqual(build(record).rows,[]);
  delete record.fields['lock:engine-snapshot-json'];
  const legacy=build(record);
  assert.equal(legacy.blocked,false);assert.equal(legacy.exact,false);assert.equal(legacy.snapshot.legacy,true);
  assert.match(legacy.message,/older lock/i);
});
test('structural errors fail closed while the owner-released current plan remains actionable',()=>{
  const bad=order();bad.items[0].id='missing-recipe';
  const blocked=build(null,[bad]);
  assert.equal(blocked.blocked,true);assert.deepEqual(blocked.rows,[]);
  const achiote=order();achiote.items[0]={id:'m2',name:data.meals.m2.name,tier:'lean',qty:1};
  const held=build(null,[achiote]);
  assert.equal(held.blocked,false);
  assert.deepEqual(held.plan.diagnostics.holds,[]);
  assert.equal(held.plan.diagnostics.releaseReady,true);
});
test('grocery fails closed when generated recipes or methods do not belong to the configured batch',()=>{
  const staleData={...data,batch:Number(config.batch.number)-1};
  const staleRecipes=dashboard.build({liveOrders:[order()],record:null,data:staleData,methods,config,defaults,catalog,saved:emptySaved()});
  assert.equal(staleRecipes.blocked,true);assert.equal(staleRecipes.plan,null);assert.deepEqual(staleRecipes.rows,[]);
  assert.match(staleRecipes.message,/Regenerate the current recipe payload/);
  const staleMethods={...methods,batch:Number(config.batch.number)-1};
  const staleInstructions=dashboard.build({liveOrders:[order()],record:null,data,methods:staleMethods,config,defaults,catalog,saved:emptySaved()});
  assert.equal(staleInstructions.blocked,true);assert.equal(staleInstructions.plan,null);assert.deepEqual(staleInstructions.rows,[]);
});
test('current standard chicken bowls purchase the authoritative 160g/210g cooked portions at measured yield plus 5% reserve',()=>{
  const cookedByTier={lean:160,bulk:210};
  const measuredYield=430/625;
  for(const mealName of ['Mexican Streetcorn Chicken Bowl','Mediterranean Chicken Bowl']){
    const [id,meal]=Object.entries(data.meals).find(([,record])=>record.name===mealName);
    for(const [tier,cooked] of Object.entries(cookedByTier)){
      const raw=cooked/measuredYield, source=meal.tiers[tier].ingredients.find(item=>item.key==='chicken_thigh_raw');
      near(source.amount,raw);
      const live={orderId:`QA-${id}-${tier}`,customer:'Fixture customer',included:true,sourceStatus:'active',items:[{id,name:meal.name,tier,qty:1}]};
      const result=build(null,[live]);
      assert.equal(result.blocked,false);
      const operational=result.plan.operational.totals.find(item=>item.key==='chicken_thigh_raw');
      near(operational.baseAmount,raw);near(operational.bufferedAmount,raw*1.05);
      near(result.rows.find(item=>item.key==='chicken_thigh_raw').required,Math.round(raw*1.05*10)/10,0.0001);
    }
  }
});
test('90/10 reserve follows recipe demand while current non-blanket beef meals preserve their recipe-specific amounts',()=>{
  for(const [mealName,tier] of [['Grilled Cheese Breakfast Burrito','lean'],['Meatball Arrabbiata Pasta','lean']]){
    const [id,meal]=Object.entries(data.meals).find(([,record])=>record.name===mealName);
    const source=meal.tiers[tier].ingredients.find(item=>item.key==='beef_90_raw');
    const live={orderId:`QA-${id}-${tier}`,customer:'Fixture customer',included:true,sourceStatus:'active',items:[{id,name:meal.name,tier,qty:1}]};
    const result=build(null,[live]), total=result.plan.operational.totals.find(item=>item.key==='beef_90_raw');
    near(total.baseAmount,source.amount);near(total.bufferedAmount,source.amount*1.05);
    assert.notEqual(source.amount,210,'an exception must not be silently replaced with the blanket Lean beef pull');
  }
});
test('Nouman stays actual 96/4 in the normal meat section and never merges into 90/10',()=>{
  const [id,meal]=Object.entries(data.meals).find(([,record])=>record.name==='High-Protein Beef Kofta & Roasted Vegetables');
  const live={orderId:'QA-NOUMAN',customer:'Nouman Ali Khan',included:true,sourceStatus:'active',items:[{id,name:meal.name,tier:'lean',qty:1}]};
  const result=build(null,[live]);
  assert.equal(result.blocked,false);
  const beef96=result.plan.operational.totals.find(item=>item.key==='beef_96_raw');
  assert.equal(beef96.baseAmount,330);assert.equal(beef96.bufferedAmount,346.5);
  assert.equal(result.plan.operational.totals.some(item=>item.key==='beef_90_raw'),false);
  const row=result.rows.find(item=>item.key==='beef_96_raw');
  assert.equal(row.required,346.5);assert.equal(row.section,'Meat & Seafood');
});
test('purchase overrides and original unit sizes survive rebuild; pantry changes never mutate recipe demand',()=>{
  const saved={onHand:{rice_dry:10},buyPackages:{rice_dry:3},catalog:{rice_dry:{price:4.25},cilantro:{price:1.23},onion:{price:2.34}}};
  const before=JSON.stringify(saved), result=build(reviewed(),[order()],saved);
  assert.equal(JSON.stringify(saved),before);
  const rice=result.rows.find(row=>row.key==='rice_dry');
  assert.equal(rice.packagePrice,4.25);assert.equal(rice.packages,3);assert.equal(rice.onHand,10);
  assert.equal(result.rows.find(row=>row.key==='cilantro').packageSize,50);
  assert.equal(result.rows.find(row=>row.key==='onion').packageSize,453.592);
  const requirement=JSON.stringify(result.plan.requirements);
  dashboard.edit(saved,rice,'onHand',20);
  assert.equal(saved.onHand.rice_dry,20);assert.equal(saved.buyPackages.rice_dry,undefined);
  dashboard.edit(saved,rice,'price',5.67);
  assert.equal(saved.catalog.rice_dry.price,5.67);assert.equal(saved.catalog.cilantro.price,1.23);
  dashboard.edit(saved,rice,'package-dec');assert.equal(saved.buyPackages.rice_dry,2);
  dashboard.edit(saved,rice,'reset-suggestion');assert.equal(saved.buyPackages.rice_dry,undefined);
  assert.equal(JSON.stringify(result.plan.requirements),requirement);
});
test('compact rows keep allocations and price evidence expandable, with search/section and print purchase counts',()=>{
  const model=build(reviewed());
  const html=dashboard.renderRows(model.rows,model.plan,{});
  assert.match(html,/<details class="item-details"><summary>Allocations &amp; price/);
  assert.match(html,/data-field="onHand"/);assert.match(html,/class="print-only"/);
  assert.ok(dashboard.visibleRows(model.rows,{query:'ginger'}).every(row=>/ginger/i.test(row.name)));
  assert.ok(dashboard.visibleRows(model.rows,{section:'Produce'}).every(row=>row.section==='Produce'));
  const row=model.rows.find(row=>row.key==='ginger');
  assert.equal(dashboard.visibleRows([{...row,needed:0}],{}).length,0);
  assert.equal(dashboard.visibleRows([{...row,needed:0}],{showStocked:true}).length,1);
  const hostile={...row,name:'<img src=x onerror=alert(1)>',sources:['<script>']};
  assert.ok(!dashboard.renderRows([hostile],model.plan,{}).includes('<img'));
});
test('grocery rows show compact meal coverage without splitting lean and bulk tiers',()=>{
  const model=build(reviewed());
  const row=model.rows.find(item=>item.key==='chicken_thigh_raw');
  const coverage=dashboard.coverage(model.plan,row);
  assert.match(coverage,/Used in:/);
  assert.match(coverage,/2 Sweet Chili Chicken with Rice/);
  const rendered=dashboard.renderRows([row],model.plan,{});
  assert.match(rendered,/class="coverage"/);
  assert.match(rendered,/2 Sweet Chili Chicken with Rice/);
});

// A small browser DOM harness runs the real app event handlers, without dependencies,
// private browser storage, network requests or remote state writes.
function browserHarness({record,rows,saved=emptySaved()}={}) {
  const html=fs.readFileSync(path.join(root,'operations/grocery-list.html'),'utf8');
  const nodes=new Map([...html.matchAll(/id="([^"]+)"/g)].map(([,id])=>[id,{id,hidden:html.includes(`id="${id}" hidden`),disabled:false,textContent:'',innerHTML:'',className:'',value:'',handlers:{},addEventListener(type,fn){this.handlers[type]=fn;}}]));
  const local=new Map(),posts=[],timers=[];
  const batchKey=`batch:${config.batch.number}|delivery:${config.batch.deliveryDate}`.toLowerCase();
  const savedKey=`prpd-grocery-state-v2:batch:${config.batch.number}|delivery:${config.batch.deliveryDate}`;
  local.set(savedKey,JSON.stringify({...saved,updatedAt:'2026-10-05T21:00:00Z'}));
  const document={getElementById(id){assert.ok(nodes.has(id),`HTML element ${id} exists`);return nodes.get(id);},addEventListener(){},createElement(){return {click(){}};}};
  const window={PRPD_ORDER_CONFIG:baseConfig,PRPD_PRODUCTION_DATA:data,PRPD_COOK_DAY:cook,PRPD_COOK_METHODS:methods,PRPD_GROCERY_CORE:grocery,PRPD_GROCERY_CATALOG:{catalog},PRPD_PRODUCTION_RUN:run,PRPD_GROCERY_DASHBOARD:dashboard,addEventListener(){},confirm(){return true;},print(){}};
  const sourceRows=rows||[['Order ID','First Name','Batch','Items'],['QA-ORDER-1','Fixture customer',`Batch ${config.batch.number}`,`2x ${data.meals.m1.name} (Lean)`]];
  const live=cook.arrayRowsToOrders(sourceRows,config).orders;
  const currentRecord=record===undefined?reviewed(live):record;
  const context={window,document,localStorage:{getItem:key=>local.get(key)||null,setItem:(key,value)=>local.set(key,value)},navigator:{storage:{}},AbortSignal,Blob,URL,Date,JSON,Number,Math,setTimeout:fn=>(timers.push(fn),timers.length),clearTimeout(){},PRPD_RECURRING_CUSTOMERS:{materialize:orders=>({orders})},fetch:async(url,options={})=>{
    if(options.method==='POST'){posts.push(JSON.parse(options.body));return{ok:true,json:async()=>({state:posts.at(-1)})};}
    const payload=url.startsWith('/api/current-orders')?{rows:sourceRows,fetchedAt:'2026-10-05T22:00:00Z'}:url.startsWith('/api/cook-log')?{record:currentRecord}:{state:null};
    return {ok:true,json:async()=>payload};
  }};
  vm.runInNewContext(fs.readFileSync(path.join(root,'operations/grocery-list-app.js'),'utf8'),context);
  return {nodes,local,posts,timers,savedKey,context,async sync(){await nodes.get('syncBtn').handlers.click();},edit(key,field,value){const target={dataset:{field},value,closest:()=>({dataset:{key}})};nodes.get('groceryRows').handlers.change({target});}};
}
test('real app DOM sync renders same plan, inventory change autosaves while preserving prices',async()=>{
  const fixture=browserHarness({saved:{onHand:{cilantro:11},buyPackages:{rice_dry:2},catalog:{cilantro:{price:1.23}}}});
  await fixture.sync();
  assert.equal(fixture.nodes.get('planTitle').textContent,'Same kitchen plan');
  assert.equal(fixture.nodes.get('listPanel').hidden,false);
  assert.match(fixture.nodes.get('planCount').textContent,/2 meals/);
  assert.equal(fixture.posts.length,0,'read-only initial sync makes no external save');
  const initialPlan=fixture.nodes.get('planCount').textContent;
  fixture.edit('cilantro','onHand',15);
  assert.equal(JSON.parse(fixture.local.get(fixture.savedKey)).onHand.cilantro,15);
  assert.equal(JSON.parse(fixture.local.get('prpd-grocery-catalog-overrides-v1')).cilantro.price,1.23);
  assert.equal(fixture.nodes.get('planCount').textContent,initialPlan);
  await fixture.timers.at(-1)();
  assert.equal(fixture.posts.length,1);assert.equal(fixture.posts[0].catalog.cilantro.price,1.23);
  fixture.nodes.get('showStockedBtn').handlers.click();
  fixture.nodes.get('searchItems').handlers.input({target:{value:'cilantro'}});
  assert.match(fixture.nodes.get('visibleCount').textContent,/1 item shown/);
  assert.ok(!fixture.nodes.get('groceryRows').innerHTML.includes('data-key="rice_dry"'));
  let printHtml;
  fixture.context.window.print=()=>{printHtml=fixture.nodes.get('groceryRows').innerHTML;};
  fixture.nodes.get('printBtn').handlers.click();
  assert.ok(printHtml.includes('data-key="rice_dry"'),'print includes all purchase sections despite search');
  assert.ok(!printHtml.includes('data-key="cilantro"'),'print excludes stocked ingredient');
  assert.ok(!fixture.nodes.get('groceryRows').innerHTML.includes('data-key="rice_dry"'),'screen filter restored after print');
});
test('real app DOM blocks a stale snapshot instead of exposing a stale shopping list',async()=>{
  const record=reviewed();record.fields['plan:engine-snapshot-json']=JSON.stringify({id:'stale-version'});
  // Use the parser-produced live source to keep this test focused on snapshot mismatch.
  const fixtureRows=[['Order ID','First Name','Batch','Items'],['QA-ORDER-1','Fixture customer',`Batch ${config.batch.number}`,`2x ${data.meals.m1.name} (Lean)`]];
  record.fields['plan:source-signature']=run.sourceSignature(cook.arrayRowsToOrders(fixtureRows,config).orders);
  const fixture=browserHarness({record,rows:fixtureRows});await fixture.sync();
  assert.equal(fixture.nodes.get('planTitle').textContent,'Review needed');
  assert.equal(fixture.nodes.get('listPanel').hidden,true);assert.equal(fixture.nodes.get('generateBtn').disabled,true);
  assert.equal(fixture.posts.length,0);
});
test('HTML loads shared engine dependencies before app and settings have no independent controls',()=>{
  const html=fs.readFileSync(path.join(root,'operations/grocery-list.html'),'utf8');
  const scripts=[...html.matchAll(/<script src="([^"]+)/g)].map(([,src])=>src);
  const index=name=>scripts.findIndex(src=>src.includes('/'+name+'.js'));
  for(const name of ['cook-day-core','grocery-list-core','kitchen-workflow']) assert.ok(index(name)<index('production-engine'));
  assert.ok(index('production-engine')<index('grocery-dashboard'));
  assert.ok(index('production-run')<index('grocery-dashboard'));
  assert.ok(index('grocery-dashboard')<index('grocery-list-app'));
  assert.ok(!html.includes('id="rawProteinBufferPct"'));
  const app=fs.readFileSync(path.join(root,'operations/grocery-list-app.js'),'utf8');
  assert.ok(!app.includes('COOK.operationalIngredientTotals'));
  assert.ok(!app.includes('GROCERY.packagingRequirements'));
  assert.ok(!app.includes('food is consumed'));
});
test('protected server lock wins over newer unlocked browser copy',()=>{
  const server=reviewed();server.fields['lock:status']='locked';
  const local={...reviewed(),updatedAt:'2099-01-01T00:00:00Z'};
  assert.equal(dashboard.selectRecord(server,local,server.batchKey).fields['lock:status'],'locked');
  assert.equal(dashboard.selectRecord(server,local,server.batchKey).updatedAt,server.updatedAt);
  delete server.fields['lock:status'];
  assert.equal(dashboard.selectRecord(server,local,server.batchKey).updatedAt,local.updatedAt);
  assert.deepEqual(dashboard.selectRecord(server,{...local,batchKey:'other-batch'},server.batchKey),server);
});
test('new measurements cannot replace a newer complete kitchen review with old plan fields',()=>{
  const server=reviewed([order(2)],[order(1)]), local=reviewed();
  server.fields['plan:reviewed-at']='2026-10-05T22:00:00Z';
  local.fields['plan:reviewed-at']='2026-10-05T21:00:00Z';
  local.updatedAt='2026-10-05T23:00:00Z';local.fields['measurement:rice']='275';
  const selected=dashboard.selectRecord(server,local,server.batchKey);
  assert.equal(selected.fields['measurement:rice'],'275');
  assert.equal(selected.fields['plan:orders-json'],server.fields['plan:orders-json']);
  assert.equal(selected.fields['plan:engine-snapshot-json'],server.fields['plan:engine-snapshot-json']);
  assert.equal(build(selected).plan.totalMeals,1);
});
