const test=require('node:test');
const assert=require('node:assert/strict');
const kitchen=require('../operations/kitchen-dashboard');
const engine=require('../operations/production-engine');
const data=require('../operations/nutrition/production-data');
const methods=require('../operations/cook-day-methods');
const fixture=require('./fixtures/batch13/final-counts-2026-10-01.json');

const counts=fixture.counts.map(([id,tier,qty])=>({id,tier,qty,name:data.meals[id].name}));
const model=()=>kitchen.buildFromPlan(engine.compileProduction({counts,data,methods,buffer:0}),counts,true);

test('plain rice is one physical pot and includes the corrected Sweet Chili destination',()=>{
  const built=model();
  const rice=built.jobs.filter(job=>job.type==='shared-rice' && job.group==='plain-rice');
  assert.equal(rice.length,1);
  assert.equal(rice[0].ingredients.find(item=>item.key==='rice_dry').baseAmount,1870);
  assert.ok(rice[0].destinations.some(row=>row.id==='bw2' && row.grams===225));
  assert.ok(!built.jobs.some(job=>job.name==='Sweet Chili plain rice'));
});

test('all compatible broccoli is one roast with recipe destinations, not four recipe jobs',()=>{
  const built=model();
  const broccoli=built.jobs.filter(job=>job.type==='shared-work-batch' && job.group==='roasted-broccoli');
  assert.equal(broccoli.length,1);
  assert.equal(broccoli[0].ingredients.find(item=>item.key==='broccoli').baseAmount,3185);
  assert.deepEqual(new Set(broccoli[0].destinations.map(row=>row.id)),new Set(['m2','m4','m6','m8']));
  assert.ok(!built.jobs.some(job=>['Loaded Buffalo broccoli','Salmon broccoli','Harissa broccoli and garnish','Steak broccoli'].includes(job.name)));
});

test('packaged mash is one complete executable batch with its measured salt',()=>{
  const mash=model().jobs.find(job=>job.type==='shared-work-batch' && job.family==='instant-mash');
  assert.ok(mash);
  assert.ok(Math.abs(mash.ingredients.find(item=>item.key==='salt').baseAmount-6.2972)<.0001);
  assert.match(mash.steps.join(' '),/heat the water, butter and salt to a boil/i);
  assert.match(mash.steps.join(' '),/remove the pot from the heat/i);
  assert.match(mash.steps.join(' '),/stand 2 minutes/i);
});

test('physical grouping follows operation metadata and keeps incompatible temperatures apart',()=>{
  const make=(id,temp)=>({key:id,type:'vegetable-ahead',stage:'ahead',name:id,workBatchGroup:'roasted-zucchini',workBatchName:'Zucchini roast',workOperation:'roast',ovenTemperatureF:temp,
    ingredients:[{key:'zucchini',name:'Zucchini',unit:'g',baseAmount:100}],steps:['Roast until tender.'],recipe:{id,name:id,tier:'lean',qty:1,method:{}}});
  const source=[make('future-a',400),make('future-b',400),make('future-c',425)];
  const before=structuredClone(source);
  const grouped=kitchen.consolidatePhysicalWork(source);
  assert.equal(grouped.filter(job=>job.type==='shared-work-batch').length,2);
  assert.equal(grouped.find(job=>job.temperature===400).destinations.length,2);
  assert.deepEqual(source,before);
});
