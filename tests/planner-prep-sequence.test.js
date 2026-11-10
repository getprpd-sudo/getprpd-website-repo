const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const kitchen=require('../operations/kitchen-dashboard');
const core=require('../operations/cook-day-core');
const data=require('../operations/nutrition/production-data');
const methods=require('../operations/cook-day-methods');
const html=fs.readFileSync(path.join(__dirname,'../operations/cook-day-planner.html'),'utf8');
const counts=[
  {id:'m2',tier:'lean',qty:2},
  {id:'m7',tier:'lean',qty:1},
  {id:'a1',tier:'single',qty:2},
  {id:'b3',tier:'lean',qty:1},
].map(row=>({...row,name:data.meals[row.id].name}));
const makeModel=()=>kitchen.build(counts,data,methods,core,0,[],true);
const keys=rows=>Array.from(rows,row=>row.key).sort();
const prepJobs=model=>model.jobs.filter(job=>job.stage==='ahead'||job.stage==='sauces');
function guided(model,rows=counts) {
  const start=html.indexOf('    function buildCookModePhases(');
  const end=html.indexOf('\n    function renderCookMode(',start);
  assert.ok(start>=0&&end>start);
  const context=vm.createContext({
    PRPD_KITCHEN:kitchen,CORE:core,
    compileCurrentPlan:()=>model.productionPlan,
    planOrders:()=>[],
    cookModeGroupedCounts:()=>rows,
    customerPackoutOrders:()=>[],
    customerLabelPlan:()=>({rows:[]}),
  });
  vm.runInContext(html.slice(start,end)+'\nthis.buildPhases=buildCookModePhases;',context);
  return context.buildPhases(rows,core.buildWorkflow(rows,methods,{teamSize:1}),model.component);
}
test('prep partition conserves every ahead job and starts only independent braises early',()=>{
  const model=makeModel(),sequence=kitchen.prepSequence(model);
  assert.deepEqual(keys([...sequence.early,...sequence.clean,...sequence.late]),keys(model.jobs.filter(job=>job.stage==='ahead')));
  assert.ok(sequence.early.length>0);
  assert.ok(sequence.clean.length>0);
  assert.equal(new Set([...sequence.early,...sequence.clean,...sequence.late].map(job=>job.key)).size,model.jobs.filter(job=>job.stage==='ahead').length);
  for(const job of sequence.early){
    assert.equal(kitchen.cookStation([job.recipe]),'braise');
    assert.ok(['protein-cook-ahead','prep-flow'].includes(job.type));
    assert.ok(!job.preparedPull&&!job.preparedPanProtein&&!job.deferred);
  }
});
test('a prepared raw pull cannot be scheduled early and dependent pan assembly follows cooking',()=>{
  const model=makeModel(),source=kitchen.prepSequence(model).early.find(job=>job.type==='protein-cook-ahead');
  assert.ok(source,'fixture includes an independent long roast or braise');
  const raw={...structuredClone(source),key:'fixture:raw-cook',type:'protein-cook-ahead',preparedPull:{grams:100,rawGrams:100,groupName:'fixture',finishIngredients:[]},aheadWorkstation:'assembly'};
  const assembly={...structuredClone(source),key:'fixture:pan',type:'mix',preparedPanProtein:{grams:100},aheadWorkstation:'protein-cooking'};
  const side={...structuredClone(source),key:'fixture:side',type:'starch-ahead',aheadWorkstation:'sides',ingredients:[{key:'potato',baseAmount:100,unit:'g'}]};
  const sequence=kitchen.prepSequence({...model,jobs:[raw,assembly,side]});
  assert.deepEqual(keys(sequence.early),[]);
  assert.deepEqual(keys(sequence.clean),['fixture:side']);
  assert.deepEqual(keys(sequence.late),['fixture:pan','fixture:raw-cook']);
  assert.equal(kitchen.aheadStation(raw),'protein-cooking');
  assert.equal(kitchen.aheadStation(assembly),'assembly');
  const blocks=kitchen.aheadWorkstations(sequence.late);
  assert.ok(blocks.indexOf('data-job="fixture:raw-cook"')<blocks.indexOf('data-job="fixture:pan"'));
});
test('normal Full run puts clean work before raw prep with an early braise reset and no repeated jobs',()=>{
  const model=makeModel(),rendered=kitchen.render(model,'all','',{preview:true});
  const order=['produce','early','early-reset','sauces','clean-ahead','raw','raw-reset'];
  const indexes=order.map(step=>rendered.indexOf('data-prep-step="'+step+'"'));
  assert.ok(indexes.every(index=>index>=0));
  assert.deepEqual([...indexes].sort((a,b)=>a-b),indexes);
  for(const job of prepJobs(model)){
    const escaped=job.key.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    assert.equal(rendered.split('data-job="'+escaped+'"').length-1,1,job.key+' must appear once');
  }
});
test('guided Produce and Raw Protein cards show their own work only',()=>{
  const model=makeModel();
  const produce=kitchen.render(model,'produce','',{embedded:true});
  const raw=kitchen.render(model,'proteins','',{embedded:true});
  assert.match(produce,/data-prep-step="produce"/);
  assert.doesNotMatch(produce,/data-prep-step="raw"/);
  assert.match(raw,/data-prep-step="raw"/);
  assert.doesNotMatch(raw,/data-prep-step="produce"/);
});
test('guided phases preserve every prep job once, clean-before-raw order and explicit resets',()=>{
  const model=makeModel(),phases=guided(model);
  const prep=phases.filter(phase=>phase.phaseDay==='prep');
  const jobs=prep.flatMap(phase=>phase.tasks.filter(task=>task.ticketKind==='kitchen-job').map(task=>task.kitchenJob));
  assert.deepEqual(keys(jobs),keys(prepJobs(model)));
  assert.equal(new Set(jobs.map(job=>job.key)).size,jobs.length);
  const index=key=>prep.findIndex(phase=>phase.phaseKey===key);
  assert.ok(index('produce')<index('early-cook-ahead'));
  assert.ok(index('early-cook-ahead')<index('early-reset'));
  assert.ok(index('early-reset')<index('sauces'));
  assert.ok(index('sauces')<index('proteins'));
  for(const phase of prep.filter(phase=>phase.phaseKey.startsWith('prep:'))){
    assert.ok(index(phase.phaseKey)<index('proteins'));
  }
  assert.ok(index('proteins')<index('raw-reset'));
  const resets=prep.flatMap(phase=>phase.tasks).filter(task=>task.ticketKind==='sanitation-reset');
  assert.ok(resets.length>=2);
  assert.ok(resets.every(task=>task.instructions.length>=3));
});
test('guided dependent cooking precedes dependent pan assembly after raw prep',()=>{
  const model=makeModel(),plan=structuredClone(model.productionPlan);
  // Isolate sequencing from recipe formulas by using already compiled jobs in the model adapter.
  const rawSource=model.jobs.find(job=>job.stage==='ahead');
  const raw={...structuredClone(rawSource),key:'fixture:raw-cook',type:'protein-cook-ahead',preparedPull:{grams:100,rawGrams:100,groupName:'fixture',finishIngredients:[]},aheadWorkstation:'assembly'};
  const assembly={...structuredClone(rawSource),key:'fixture:pan',type:'mix',preparedPanProtein:{grams:100},aheadWorkstation:'protein-cooking'};
  const adapter={...kitchen,buildFromPlan:()=>({...model,jobs:[raw,assembly]})};
  const start=html.indexOf('    function buildCookModePhases('),end=html.indexOf('\n    function renderCookMode(',start);
  const context=vm.createContext({PRPD_KITCHEN:adapter,CORE:core,compileCurrentPlan:()=>plan,planOrders:()=>[],cookModeGroupedCounts:()=>counts,customerPackoutOrders:()=>[],customerLabelPlan:()=>({rows:[]})});
  vm.runInContext(html.slice(start,end)+'\nthis.buildPhases=buildCookModePhases;',context);
  const phases=context.buildPhases(counts,core.buildWorkflow(counts,methods,{teamSize:1}),model.component);
  const index=key=>phases.findIndex(phase=>phase.phaseKey===key);
  assert.ok(index('proteins')<index('late:protein-cooking'));
  assert.ok(index('late:protein-cooking')<index('late:assembly'));
});
test('generic prep guide matches clean-first ordering, retains early braise and numbers stages consecutively',()=>{
  const stages=core.buildWorkflow(counts,methods,{teamSize:1}).prepStages;
  const index=key=>stages.findIndex(stage=>stage.key===key);
  assert.ok(index('produce')<index('early-proteins'));
  assert.ok(index('early-proteins')<index('sauces'));
  assert.ok(index('sauces')<index('rice'));
  assert.ok(index('rice')<index('proteins'));
  stages.forEach((stage,i)=>assert.match(stage.title,new RegExp('^'+(i+1)+'\\. ')));
  const deferred={...methods,meals:{...methods.meals,m7:structuredClone(methods.meals.m7)}};
  deferred.meals.m7.prepBatches.find(batch=>batch.type==='protein-cook-ahead').deferred=true;
  assert.equal(core.buildWorkflow(counts,deferred,{teamSize:1}).prepStages.some(stage=>stage.key==='early-proteins'),false);

});
test('sequencing/rendering leaves quantities, ingredient ownership, extras and recipes unchanged',()=>{
  const model=makeModel(),before=structuredClone(model);
  kitchen.prepSequence(model);
  kitchen.render(model,'all','',{preview:true});
  guided(model);
  assert.deepEqual(model,before);
  assert.equal(model.totalMeals,counts.reduce((sum,row)=>sum+row.qty,0));
  const script=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(match=>match[1]).find(value=>value.includes('const BASE_CONFIG'));
  new vm.Script(script);
  assert.match(html,/id="teamSize" min="1" max="20" value="1"/);
  const card=kitchen.combinedCookCard(model.recipes.filter(recipe=>recipe.id==='m2'));
  assert.match(card,/dish:m2:staging-locations/);
  assert.match(card,/dish:m2:staging-waiting-on/);
  assert.match(card,/dish:m2:staging-timing/);
});


test('all current meal/tier builds keep exactly one prep ticket per job without mutating production data',()=>{
  const allCounts=Object.entries(data.meals).flatMap(([id,meal])=>Object.keys(meal.tiers).map(tier=>({id,name:meal.name,tier,qty:1})));
  assert.ok(allCounts.length>=20);
  const model=kitchen.build(allCounts,data,methods,core,0,[],true);
  const snapshot=structuredClone(model);
  const sequence=kitchen.prepSequence(model);
  assert.deepEqual(keys([...sequence.early,...sequence.clean,...sequence.late]),keys(model.jobs.filter(job=>job.stage==='ahead')));
  const rendered=kitchen.render(model,'all','',{preview:true});
  for(const job of prepJobs(model)){
    const escaped=job.key.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    assert.equal(rendered.split('data-job="'+escaped+'"').length-1,1,job.key);
  }
  const phases=guided(model,allCounts);
  const scheduled=phases.filter(phase=>phase.phaseDay==='prep').flatMap(phase=>phase.tasks.filter(task=>task.ticketKind==='kitchen-job').map(task=>task.kitchenJob));
  assert.deepEqual(keys(scheduled),keys(prepJobs(model)));
  assert.deepEqual(model,snapshot);
  assert.equal(model.totalMeals,allCounts.length);
});


