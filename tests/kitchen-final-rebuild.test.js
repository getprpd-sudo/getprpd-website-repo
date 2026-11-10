const test=require('node:test');
const assert=require('node:assert/strict');
const engine=require('../operations/production-engine');
const kitchen=require('../operations/kitchen-dashboard');
const data=require('../operations/nutrition/production-data');
const methods=require('../operations/cook-day-methods');
const config=require('../config/order-config');
const fixture=require('./fixtures/batch14/current-counts-2026-10-07.json');

const counts=fixture.counts.map(([id,tier,qty])=>({id,tier,qty}));
const plan=engine.compileProduction({counts,data,methods,config,buffer:{rawProteinBufferPct:5,riceBufferPct:15,riceYieldFactor:2.75}});
const model=kitchen.buildFromPlan(plan);

test('planner exposes one professional production flow without the duplicate day board',()=>{
  assert.deepEqual(kitchen.stages.map(stage=>stage.name),['Full run','Prep list','Batch recipes','Cook & pack','Recipe book']);
  const html=kitchen.render(model,'all');
  assert.doesNotMatch(html,/kd-day-split|DO TODAY|RESERVE FOR TOMORROW/);
  for(const title of ['Prep list','Batch recipes','Cook &amp; pack']) assert.match(html,new RegExp(title));
  assert.doesNotMatch(html,/data-kd-stage="pack"/);
});

test('prep list groups physical knife work and gives practical seasoning measures',()=>{
  const html=kitchen.render(model,'prep');
  assert.ok(html.indexOf('data-produce-group="onions"')<html.indexOf('data-produce-group="aromatics"'));
  assert.match(html,/Garlic &amp; ginger/);
  assert.match(html,/Open &amp; drain/);
  assert.doesNotMatch(html,/Pantry vegetables/);
  assert.match(html,/(?:tsp|Tbsp)/);
  assert.doesNotMatch(html,/\([^<]+ g exact\)/);
  assert.doesNotMatch(html,/Keep raw .* isolated|displayed ingredients/i);
  assert.ok(html.indexOf('data-produce-group="fruit"')<html.indexOf('data-produce-group="vegetables"'));
  assert.ok(html.indexOf('data-produce-group="other"')<html.indexOf('data-produce-group="herbs"'));
});

test('batch recipes hide allocation diagnostics and enforce the owner cup standard visibly',()=>{
  const html=kitchen.render(model,'batch');
  assert.doesNotMatch(html,/Allocation details|finished yield ×|incorporated recipe input/i);
  assert.match(html,/Standard sauces are 45 g net/);
  assert.doesNotMatch(html,/Recipe correction required before release/);
  assert.match(html,/PRPD Garlic Herb Yogurt[\s\S]*45 g net/);
  assert.doesNotMatch(html,/PRPD Garlic Herb Yogurt[\s\S]{0,100}30 g net/);
  assert.match(html,/approved exception/);
});

test('cook cards use one numbered instruction flow with exact in-context container builds',()=>{
  const html=kitchen.render(model,'pack');
  const dishCount=new Set(model.recipes.filter(recipe=>!recipe.method.prepDayOnly).map(recipe=>recipe.id)).size;
  assert.equal((html.match(/data-recipe="dish:/g)||[]).length,dishCount);
  assert.match(html,/Mexican Streetcorn Chicken Bowl/);
  assert.match(html,/160 g cooked boneless skinless chicken thigh before sauce/);
  assert.match(html,/Fill \d+ Lean containers?/);
  assert.match(html,/complete share from [\d,.]+ g raw/);
  assert.match(html,/kd-action-list/);
  assert.match(html,/Bring over the measured protein/);
  assert.match(html,/Cook and finish the dish/);
  assert.doesNotMatch(html,/kd-pack-spec|kd-pack-row|kd-recipe-grid/);
  assert.match(html,/Cook the achiote chicken to 165 F/i);
  assert.doesNotMatch(html,/Cook the protein to its safe endpoint and record the actual temperature/i);
  assert.doesNotMatch(html,/Stage the .* container|verify every measured component|do not substitute from an archived batch/i);
});

test('compiled recipes retain exact per-tier source quantities for packing',()=>{
  assert.ok(model.recipes.every(recipe=>Array.isArray(recipe.portionIngredients)&&recipe.portionIngredients.length));
  const streetcorn=model.recipes.find(recipe=>recipe.id==='m1'&&recipe.tier==='lean');
  assert.equal(streetcorn.portionIngredients.find(item=>item.key==='rice_dry').amount,45);
  assert.ok(streetcorn.tierAssumptions.some(line=>/160g cooked boneless skinless chicken thigh/i.test(line)));
});

test('formed and counted recipes show the exact production output',()=>{
  const shapedPlan=engine.compileProduction({counts:[
    {id:'b1',tier:'lean',qty:1},{id:'b1',tier:'bulk',qty:1},{id:'b2',tier:'bulk',qty:1},
    {id:'m3',tier:'lean',qty:2},{id:'m3',tier:'bulk',qty:3},{id:'p1',tier:'lean',qty:3},
  ],data,methods,config,buffer:{rawProteinBufferPct:5,riceBufferPct:15,riceYieldFactor:2.75}});
  const shaped=kitchen.buildFromPlan(shapedPlan);
  const prep=kitchen.render(shaped,'prep');
  const batch=kitchen.render(shaped,'batch');
  assert.match(prep,/Shape 46 meatballs/);
  assert.match(prep,/Shape 15 kofta logs/);
  assert.match(batch,/Make 10 egg bites/);
  assert.match(batch,/Make 4 French toast slices/);
});
