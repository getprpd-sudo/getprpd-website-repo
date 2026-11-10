// Historical Batch 11 routing examples pending frozen Batch 11 production and
// method fixtures. Current routing is covered by the shared-run/rebuild suites.
const {skip:test}=require('node:test');
const assert=require('node:assert/strict');
const kitchen=require('../operations/kitchen-dashboard');
const workflow=require('../operations/kitchen-workflow');
const core=require('../operations/cook-day-core');
const data=require('../operations/nutrition/production-data');
const methods=require('../operations/cook-day-methods');
const counts=Object.entries(data.meals).flatMap(([id,m])=>Object.keys(m.tiers).map(tier=>({id,name:m.name,tier,qty:3})));

test('every recipe amount is used exactly once across prep, side cups, and finish',()=>{
  const model=kitchen.build(counts,data,methods,core,0);
  assert.deepEqual(model.review.errors,[]);
  for(const recipe of model.recipes) {
    const use=workflow.ingredientUse(recipe);
    for(const item of recipe.ingredients) {
      const used=use.rows.filter(r=>r.key===item.key).reduce((s,r)=>s+r.amount,0);
      const finish=use.finish.find(r=>r.key===item.key)?.baseAmount || 0;
      assert.ok(Math.abs(used+finish-item.baseAmount)<.001,`${recipe.title}: ${item.key}`);
    }
  }
});
test('staged kits retain quantities at cooking, but baked desserts do not repeat their ingredients',()=>{
  const model=kitchen.build(counts,data,methods,core,0);
  const omelette=model.recipes.find(r=>r.id==='b4');
  assert.ok(workflow.ingredientUse(omelette).finish.some(i=>i.key==='egg'));
  for(const id of ['d1','d2','d3']) assert.deepEqual(workflow.ingredientUse(model.recipes.find(r=>r.id===id)).finish,[]);
});
test('unknown operations and unbacked formula quantities fail readiness, not disappear',()=>{
  const custom=structuredClone(methods);
  custom.meals.m4.prepBatches[2].type='future-sauce';
  assert.ok(kitchen.review([counts.find(c=>c.id==='m4')],data,custom,core).errors.some(e=>e.includes('unregistered')));
  const doubled=structuredClone(methods);
  doubled.meals.m4.prepBatches[2].formulaIngredients=[{key:'extra_tomato',sourceKey:'crushed_tomatoes',perServing:1,includeInGrocery:false}];
  assert.ok(kitchen.review([counts.find(c=>c.id==='m4')],data,doubled,core).errors.some(e=>e.includes('more than')));
});
test('future recipe IDs preserve dessert, sauce, grain, and deferred assembly routing',()=>{
  const rename={meals:{},...data}; rename.meals={};
  const renamed=structuredClone(methods);renamed.meals={};renamed.sharedProteinSeasoning=[];
  for(const id of ['d1','m4','a3']) {
    rename.meals[`future-${id}`]=data.meals[id];renamed.meals[`future-${id}`]=methods.meals[id];
  }
  const selected=Object.keys(rename.meals).map(id=>({id,name:rename.meals[id].name,tier:Object.keys(rename.meals[id].tiers)[0],qty:2}));
  const model=kitchen.build(selected,rename,renamed,core,0);
  assert.ok(model.jobs.some(j=>j.recipe?.id==='future-d1' && kitchen.aheadStation(j)==='desserts'));
  assert.ok(model.jobs.some(j=>j.recipe?.id==='future-m4' && j.stage==='sauces'));
  assert.ok(model.jobs.some(j=>j.recipe?.id==='future-a3' && j.stage==='cook'));
  assert.match(kitchen.render(model,'cook'),/Drain and rinse the cannellini beans/);
});
test('one mixed pan requires proportional ingredients, not just different portion weights',()=>{
  const recipes=['lean','bulk'].map(tier=>({tier,qty:1,ingredients:data.recipeLibrary['Chicken Enchilada Bake'].tiers[tier].ingredients.map(i=>({...i,baseAmount:i.amount}))}));
  assert.equal(workflow.panRatioCompatible(recipes,{lean:448,bulk:646}),false);
});

test('pan yield is a visible physical check, not a computed guarantee or a pre-cook deadlock',()=>{
  const model=kitchen.build(counts.filter(c=>c.id==='m6'),data,methods,core,0);
  assert.ok(model.review.warnings.some(d=>d.message.includes('measured production check')));
  assert.deepEqual(model.review.decisions,[]);
  assert.doesNotMatch(kitchen.render(model,'cook'),/One-pan portion control|will fit/);
});

test('produce has specific cuts and pantry vegetables have one visible work row',()=>{
  const model=kitchen.build(counts,data,methods,core,0);
  const html=kitchen.render(model,'produce');
  assert.doesNotMatch(html,/Follow the recipe form/);
  assert.equal((html.match(/Peas and carrots, canned, drained/g)||[]).length,1);
});
