const test = require('node:test');
const assert = require('node:assert/strict');
const kitchen = require('../operations/kitchen-dashboard');
const core = require('../operations/cook-day-core');
const data = require('../operations/nutrition/production-data');
const methods = require('../operations/cook-day-methods');
const fixture = require('./fixtures/batch13/final-counts-2026-10-01.json');
const counts = fixture.counts.filter(([id])=>data.meals[id]).map(([id,tier,qty])=>({id,tier,qty,name:data.meals[id].name}));
const batch13Only = {skip:data.batch !== 13};
const visible = html => html.replace(/<details\b[^>]*>[\s\S]*?<\/details>/g, '');

test('shared sauce cards show one batch and hide repeated dish/tier allocations by default', batch13Only, () => {
  const model = kitchen.build(counts, data, methods, core, 0);
  const job = model.jobs.find(row=>row.key==='shared-sauce:sweet-heat');
  const html = kitchen.jobCard(job);
  const main = visible(html);
  assert.match(main, /2,385 g input/);
  assert.match(main, /52 cups/);
  assert.match(main, /45 g net each/);
  assert.match(main, /Great Value light mayonnaise/);
  assert.match(main, /Tare, seal, count and refrigerate/);
  assert.doesNotMatch(main, /Breakfast Quesadilla|Cheeseburger Hot Pockets|Boy Kibble/);
  assert.match(html, /<details class="kd-allocation-details"><summary>Allocation details/);
  assert.match(html, /Breakfast Quesadilla/);
  assert.match(html, /High-Protein Beef Kofta &amp; Roasted Vegetables QC cup/);
  assert.equal((html.match(/One separate 45 g cup per meal\./g)||[]).length, 1);
});

test('generic sauce summary keeps raw-input reservations distinct from finished fill', () => {
  const job = {
    key:'shared-sauce:future', sharedPreparedSauce:true, name:'Future sauce',
    ingredients:[{name:'Base',baseAmount:100,unit:'g'}], steps:['Cook and record the yield.'],
    cupRows:[{cups:2,gramsPerMeal:45,weightBasis:'raw-input'}],
    destinations:[{id:'future-recipe',name:'Future dish',tier:'lean',qty:2,grams:90,delivery:'cup'}],
  };
  const html=kitchen.jobCard(job);
  assert.match(visible(html), /2 cups × 45 g recipe share; record the finished cup weight/);
  assert.doesNotMatch(html, /45 g net/);
  assert.match(visible(html), /Cook and record the yield/);
  const unknown=kitchen.jobCard({...job,cupRows:[{cups:2,weightBasis:'measured-yield'}]});
  assert.match(visible(unknown), /equal measured portions/);
  const precise=kitchen.jobCard({...job,cupRows:[{cups:3,gramsPerMeal:14.35,weightBasis:'finished'}]});
  assert.match(visible(precise), /14\.35 g net/);
});

test('working sauce card omits diagnostic allocation disclosure', () => {
  const html=kitchen.jobCard({
    key:'side-cup:future',type:'side-cup-batch',name:'Sauce',qty:3,gramsPerMeal:20,
    ingredients:[{name:'Base',baseAmount:60,unit:'g'}],steps:['Mix.'],
    destinations:[{name:'<img src=x>',tier:'lean',qty:1},{name:'Other',tier:'bulk',qty:2}],
  });
  assert.doesNotMatch(html, /<img/);
  assert.doesNotMatch(html, /&lt;img src=x&gt;|Allocation details/);
  assert.match(html, /3 cups × 20 g net/);
});

test('current house sauces accept the owner-approved 40 g fill', () => {
  assert.equal(kitchen.cupPolicy({name:'PRPD Sweet Heat',gramsPerMeal:40}).valid,true);
  assert.equal(kitchen.cupPolicy({name:'Garlic Herb Yogurt',gramsPerMeal:40}).valid,true);
  assert.equal(kitchen.cupPolicy({name:'G Hughes BBQ Sauce',gramsPerMeal:30}).valid,true);
  assert.equal(kitchen.cupPolicy({name:'G Hughes Sweet Chili Sauce',gramsPerMeal:30}).valid,true);
  assert.equal(kitchen.cupPolicy({name:'PRPD Sweet Heat',gramsPerMeal:45}).valid,false);
  assert.equal(kitchen.cupPolicy({name:'Generic serving sauce',gramsPerMeal:45}).valid,true);
});

test('kitchen spice measures round to usable quarter-teaspoon increments', () => {
  const paprika=kitchen.displayAmount({key:'paprika',name:'Paprika',unit:'g',baseAmount:10});
  const pepper=kitchen.displayAmount({key:'black_pepper',name:'Black pepper',unit:'g',baseAmount:5});
  assert.equal(paprika,'1 Tbsp + 1 ¼ tsp');
  assert.equal(pepper,'2 ¼ tsp');
  assert.doesNotMatch(`${paprika} ${pepper}`,/⅛|grams?|\bg\b/);
});

test('sauce workstation total does not subtract incorporated portions from physical cups', () => {
  const model={
    jobs:[],
    sideCups:[
      {name:'PRPD Sweet Heat',cups:6,gramsPerMeal:40},
      {name:'Garlic Herb Yogurt',cups:7,gramsPerMeal:40},
    ],
    extraSideCups:[],qcSideCups:[],review:{errors:[],decisions:[],warnings:[]},
    totalMeals:0,ownerExtraMeals:0,counts:[],recipes:[],productionExtras:[],
  };
  const html=kitchen.render(model,'batch');
  assert.match(html,/13 cups/);
  assert.doesNotMatch(html,/Recipe correction required before release/);
});

test('cup filling keeps counts and fill warnings visible while dish lists are optional', batch13Only, () => {
  const html=kitchen.render(kitchen.build(counts,data,methods,core,0),'sauces');
  const cups=html.slice(html.indexOf('data-workstation="sauce-cups"'));
  assert.match(visible(cups), /79 cups/);
  assert.match(visible(cups), /45 g input; measure finished fill/);
  assert.match(visible(cups), /PRPD Sweet Heat Sauce/);
  assert.doesNotMatch(visible(cups), /Breakfast Quesadilla/);
  assert.match(cups, /<details class="kd-cup-destinations"><summary>7 dishes/);
});

test('kitchen consumes a compiled plan without recompiling or mutating its frozen inputs', batch13Only, () => {
  const engine=require('../operations/production-engine');
  const plan=engine.compileProduction({counts,data,methods,buffer:0});
  const before=JSON.stringify(plan);
  assert.equal(Object.isFrozen(plan.recipes[0]),true);
  const compile=engine.compileProduction;
  engine.compileProduction=()=>{throw new Error('Renderer attempted a second compilation');};
  try {
    const model=kitchen.buildFromPlan(plan);
    assert.equal(model.productionPlan,plan);
    assert.deepEqual(model.sideCups,plan.cups.customer);
    assert.deepEqual(model.qcSideCups,plan.cups.qc);
    assert.equal(model.totalMeals,118);
    for(const stage of kitchen.stages) assert.doesNotMatch(kitchen.render(model,stage.id),/NaN/);
    assert.equal(JSON.stringify(plan),before);
    const garlic=model.jobs.find(job=>job.key==='shared-sauce:house-garlic');
    assert.equal(garlic.cupRows.reduce((sum,row)=>sum+row.cups,0),13);
    assert.ok(garlic.destinations.filter(row=>row.variant==='white').every(row=>row.delivery==='incorporated'));
  } finally {
    engine.compileProduction=compile;
  }
});

test('combined cooked sauce exposes compiled raw-input cups and keeps optional owner reserves distinct', batch13Only, () => {
  const engine=require('../operations/production-engine');
  const extras=methods.productionExtras.filter(row=>row.optional).map(row=>row.id);
  const plan=engine.compileProduction({counts,data,methods,buffer:0,extras});
  const model=kitchen.buildFromPlan(plan);
  const salmon=model.jobs.find(job=>job.recipe?.id==='m4' && job.sauceGroupRef);
  assert.ok(salmon);
  assert.equal(salmon.cupRows.filter(row=>row.audience==='customer').reduce((sum,row)=>sum+row.cups,0),8);
  assert.equal(salmon.cupRows.filter(row=>row.audience==='internal').reduce((sum,row)=>sum+row.cups,0),1);
  assert.ok(salmon.reserves.some(row=>row.kind==='internal' && row.grams>0));
  const main=visible(kitchen.jobCard(salmon));
  assert.match(main, /8 cups · 45 g input; measure finished fill/);
  assert.match(main, /1 owner cup · 45 g input; measure finished fill/);
  assert.match(main, /8 incorporated portions/);
  assert.doesNotMatch(main, /45 g net/);
  assert.equal(model.ownerExtraMeals,4);
});
