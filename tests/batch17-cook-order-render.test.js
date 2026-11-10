const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const kitchen=require('../operations/kitchen-dashboard');
const core=require('../operations/cook-day-core');
const engine=require('../operations/production-engine');
const data=require('../operations/nutrition/production-data');
const methods=require('../operations/cook-day-methods');
const rows=[
  {id:'a4',tier:'single',qty:9},{id:'m3',tier:'lean',qty:4},{id:'m3',tier:'bulk',qty:6},
  {id:'m6',tier:'lean',qty:6},{id:'m6',tier:'bulk',qty:12},{id:'b1',tier:'bulk',qty:1},
  {id:'b3',tier:'bulk',qty:1},{id:'b4',tier:'lean',qty:1},{id:'a3',tier:'single',qty:5},
].map(row=>({...row,name:data.meals[row.id].name}));
const plan=engine.compileProduction({counts:rows,data,methods,buffer:0});
const model=kitchen.buildFromPlan(plan,rows,true);
test('Cook and pack completes proteins and components before any container builds',()=>{
  const html=kitchen.render(model,'cook','',{prepCompleted:'Rice, vegetables and sauces are ready.'});
  const p=html.indexOf('data-cook-step="proteins"'),c=html.indexOf('data-cook-step="components"'),a=html.indexOf('data-cook-step="plating"');
  assert.ok(p<c&&c<a);
  assert.doesNotMatch(html.slice(p,a),/class="kd-build-card"|<h4>Build containers<\/h4>/);
  assert.equal((html.slice(a).match(/data-cook-phase=/g)||[]).length,new Set(rows.map(row=>row.id)).size);
  assert.match(html,/Rice, vegetables and sauces are ready/);
  assert.match(html.slice(p,c),/weigh the complete breading kit[\s\S]*Coat the raw chicken[\s\S]*Bake one uncrowded layer/);
});
test('component kits sum finish allocations into one cook and show un-staged breakfast ingredients',()=>{
  const orzo=kitchen.combinedCookCard(model.recipes.filter(r=>r.id==='m3'),[],'components');
  assert.match(orzo,/<b>13 g<\/b><span>Avocado oil/);
  assert.match(orzo,/<b>10 g<\/b><span>Garlic, raw/);
  assert.match(orzo,/Boil 540 g dry Orzo together/);
  assert.doesNotMatch(orzo,/kd-component-amounts|Lean 180 g|Bulk 360 g/);
  const cajun=kitchen.combinedCookCard(model.recipes.filter(r=>r.id==='m6'),[],'components');
  assert.match(cajun,/Add 1,080 g dry spaghetti and 2,259\.9 g water/);
  const sandwich=kitchen.combinedCookCard(model.recipes.filter(r=>r.id==='b4'),[],'components');
  for(const name of ['beef bacon','English muffin','mozzarella'])assert.match(sandwich,new RegExp(name,'i'));
});
test('plating preserves taco and wing assembly without cooking proteins again',()=>{
  const selected=['m2','w1'].map(id=>({id,tier:'lean',qty:1,name:data.meals[id].name}));
  const built=kitchen.build(selected,data,methods,core,0,[],true);
  const html=kitchen.render(built,'cook');
  const plating=html.slice(html.indexOf('data-cook-step="plating"'));
  assert.match(plating,/Warm the counted corn tortillas/);
  assert.match(plating,/Toss the cooked wings/);
  assert.doesNotMatch(plating,/<li>Cook the already-seasoned|<li>Air-fry or oven-cook/);
});
test('guided Cook Day uses the same protein, component and plating phases',()=>{
  const source=fs.readFileSync(require.resolve('../operations/cook-day-planner.html'),'utf8');
  const start=source.indexOf('    function buildCookModePhases('),end=source.indexOf('\n    function renderCookMode(',start);
  const ctx={PRPD_KITCHEN:kitchen,CORE:core,compileCurrentPlan:()=>plan,planOrders:()=>[],cookModeGroupedCounts:()=>[],customerPackoutOrders:()=>[],customerLabelPlan:()=>({rows:[]})};
  vm.runInNewContext(source.slice(start,end)+'\nthis.phases=buildCookModePhases;',ctx);
  const phases=ctx.phases(rows,core.buildWorkflow(rows,methods,{teamSize:1}),model.component).filter(p=>p.phaseDay==='cook');
  const components=phases.findIndex(p=>p.phaseKey==='cook-components'),plating=phases.findIndex(p=>p.phaseKey==='cook-plating');
  assert.ok(components>0&&plating>components);
  assert.ok(phases.slice(0,components).flatMap(p=>p.tasks).filter(t=>t.ticketKind==='kitchen-cook').every(t=>t.kitchenCookPhase==='protein'));
  assert.ok(phases[components].tasks.every(t=>t.kitchenCookPhase==='components'));
});

test('remaining work groups pasta together and omits reminder-only cards without losing plating',()=>{
  const selected=['m3','bw1','m7','m6','m1','b1'].map(id=>({id,tier:'lean',qty:1,name:data.meals[id].name}));
  const built=kitchen.build(selected,data,methods,core,0,[],true);
  const html=kitchen.render(built,'cook');
  const remaining=html.slice(html.indexOf('data-cook-step="components"'),html.indexOf('data-cook-step="plating"'));
  const pasta=remaining.slice(remaining.indexOf('data-component-group="pasta"'),remaining.indexOf('data-component-group="breakfast"'));
  assert.match(pasta,/dish:m3/);assert.match(pasta,/dish:m6/);
  for(const id of ['bw1','m7','m1']) {
    assert.doesNotMatch(remaining,new RegExp(`data-recipe="dish:${id}"`));
    assert.match(html.slice(html.indexOf('data-cook-step="plating"')),new RegExp(`data-recipe="dish:${id}"`));
  }
  assert.match(pasta,/Boil 45 g dry Orzo together/);
  assert.match(pasta,/Add 50 g dry spaghetti/);
  assert.doesNotMatch(remaining,/Bring forward|Do not repeat|Test and yield details|Make the remaining components/);
});

test('mixed breakfast cooks combine measured ingredients without borrowing from prepared toppings',()=>{
  const selected=['b1','b3','b4'].flatMap(id=>['lean','bulk'].map(tier=>({id,tier,qty:1,name:data.meals[id].name})));
  const built=kitchen.build(selected,data,methods,core,0,[],true);
  const render=id=>kitchen.combinedCookCard(built.recipes.filter(r=>r.id===id),[],'components');
  assert.match(render('b1'),/<b>230 g<\/b><span>Liquid egg white/);
  assert.match(render('b3'),/<b>180 g<\/b><span>FAGE Total 0%/);
  assert.match(render('b4'),/<b>225 g<\/b><span>Liquid egg white/);
  for(const id of ['b1','b3','b4'])assert.doesNotMatch(render(id),/kd-component-amounts/);
});

test('combined pasta cooking portions finished food instead of packing dry pasta or separate tier batches',()=>{
  const cajun=model.recipes.filter(r=>r.id==='m6');
  const html=kitchen.combinedCookCard(cajun,[],'assembly');
  assert.match(html,/finished batch weight × 50 ÷ 1,080/);
  assert.match(html,/finished batch weight × 65 ÷ 1,080/);
  assert.match(html,/finished batch weight × 200 ÷ 4,500/);
  assert.doesNotMatch(html,/Keep the two tiers separate|one measured tier share|Add.*dry/);
  const orzo=model.recipes.filter(r=>r.id==='m3');
  const portions=orzo.map(recipe=>kitchen.packRows(recipe,orzo));
  assert.equal(portions[0][1].amount,'finished batch weight × 45 ÷ 540');
  assert.equal(portions[1][1].amount,'finished batch weight × 60 ÷ 540');
});


