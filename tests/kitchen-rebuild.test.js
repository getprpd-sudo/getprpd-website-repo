const test=require('node:test');
const assert=require('node:assert/strict');
const core=require('../operations/cook-day-core');
const kitchen=require('../operations/kitchen-dashboard');
const workflow=require('../operations/kitchen-workflow');
const grocery=require('../operations/grocery-list-core');
const data=require('../operations/nutrition/production-data');
const methods=require('../operations/cook-day-methods');
const final=require('./fixtures/batch13/final-counts-2026-10-01.json');
const clone=value=>JSON.parse(JSON.stringify(value));
const counts=final.counts.filter(([id])=>data.meals[id]).map(([id,tier,qty])=>({id,tier,qty,name:data.meals[id].name}));
const batch13Only={skip:data.batch!==13};
const build=(rows=counts,m=methods,d=data)=>kitchen.build(rows,d,m,core,0);
const quantity=(rows,key)=>rows.find(item=>item.key===key)?.baseAmount || 0;

test('real final batch conserves 118 customer items and 78 side cups without unmade spares',batch13Only,()=>{
  const model=build();
  assert.equal(model.totalMeals,118);
  assert.equal(model.ownerExtraMeals,0);
  assert.deepEqual(model.productionExtras,[]);
  assert.equal(model.sideCups.reduce((sum,row)=>sum+row.cups,0),78);
  assert.equal(grocery.dishSpecificSauceCupCount(core.productionPlan(counts),methods,{},{}),78);
  assert.deepEqual(model.review.errors.filter(error=>!error.includes('production release hold:')),[]);
  const extraPack=core.extraPackagingRequirements(counts,data,methods);
  assert.equal(extraPack.some(row=>['meal_container','sauce_cup'].includes(row.key)),false);
  assert.equal(core.labelPlan(counts,0,4).totalLabels,118);
});

test('explicitly selected internal extras add only their own ingredients and packaging',batch13Only,()=>{
  const selected=clone(methods);
  selected.productionExtras.forEach(extra=>extra.enabled=true);
  const before=core.operationalIngredientTotals(counts,data,methods,0).totals;
  const after=core.operationalIngredientTotals(counts,data,selected,0).totals;
  const expected=new Map();
  for(const extra of selected.productionExtras) for(const item of extra.ingredients)
    expected.set(item.key,(expected.get(item.key)||0)+item.amount);
  for(const key of new Set([...before,...after].map(item=>item.key)))
    assert.ok(Math.abs(quantity(after,key)-quantity(before,key)-(expected.get(key)||0))<.001,key);
  const model=build(counts,selected);
  assert.equal(model.totalMeals,118);
  assert.equal(model.ownerExtraMeals,4);
  const packaging=core.extraPackagingRequirements(counts,data,selected);
  assert.equal(packaging.filter(row=>row.key==='meal_container').reduce((sum,row)=>sum+row.required,0),4);
  assert.equal(packaging.filter(row=>row.key==='sauce_cup').reduce((sum,row)=>sum+row.required,0),3);
});

test('protein categories are independent of menu slots and retain actual beef grades',batch13Only,()=>{
  const model=build();
  const shuffledData={...data,meals:{}},shuffledMethods={...methods,meals:{},productionExtras:[],groceryAdjustments:[]};
  const shuffled=counts.map((row,index)=>{
    const id=`recipe_${index}`;
    shuffledData.meals[id]=data.meals[row.id];
    shuffledMethods.meals[id]=methods.meals[row.id];
    return {...row,id};
  });
  const rerouted=build(shuffled,shuffledMethods,shuffledData);
  assert.deepEqual(rerouted.recipes.map(r=>r.productionGroup),model.recipes.map(r=>r.productionGroup));
  assert.equal(rerouted.sideCups.reduce((sum,row)=>sum+row.cups,0),78);
  assert.equal(model.recipes.find(r=>r.id==='p1').productionGroup,'ground-beef');
  assert.equal(model.recipes.find(r=>r.id==='m7').productionGroup,'ground-beef');
  assert.equal(model.recipes.find(r=>r.id==='m8').productionGroup,'steak');
  assert.equal(model.recipes.find(r=>r.id==='m4').productionGroup,'seafood');
  const protein=core.operationalIngredientTotals(counts,data,methods,0).totals;
  assert.equal(quantity(protein,'beef_96_raw'),990);
  assert.ok(quantity(protein,'beef_90_raw')>0);
  assert.equal(core.proteinProductionGroup({key:'beef_96_raw'}).key,'ground-beef');
  assert.equal(core.proteinProductionGroup({key:'beef_90_raw'}).key,'ground-beef');
});

test('Butter Chicken yogurt has one measured owner at each stage for both tiers',batch13Only,()=>{
  const rows=[{id:'bw1',name:'Butter Chicken',tier:'lean',qty:2},{id:'bw1',name:'Butter Chicken',tier:'bulk',qty:1}];
  const model=build(rows);
  assert.equal(quantity(core.operationalIngredientTotals(rows,data,methods,0).totals,'fage'),150);
  let marinade=0,finish=0;
  for(const recipe of model.recipes) {
    marinade+=quantity(recipe.prep.find(job=>job.type==='marinade').ingredients,'fage');
    finish+=quantity(workflow.ingredientUse(recipe).finish,'fage');
    assert.deepEqual(workflow.ingredientUse(recipe).errors,[]);
  }
  assert.equal(marinade,45);
  assert.equal(finish,105);
});

test('prep side routing follows ingredients and declared metadata, never the weekly slot',()=>{
  const job={type:'side',recipe:{id:'m2',category:'Main'},ingredients:[{key:'potato'}]};
  assert.equal(kitchen.aheadStation(job),'potatoes');
  assert.equal(kitchen.aheadStation({...job,recipe:{id:'arbitrary_next_week'},ingredients:[{key:'broccoli'}]}),'vegetables');
  assert.equal(kitchen.aheadStation({...job,aheadWorkstation:'cold-kits'}),'cold-kits');
});

test('a physical release hold does not hide unregistered operations',batch13Only,()=>{
  const changed=clone(methods);
  changed.meals.m4.prepBatches[0].type='unknown-future-step';
  const errors=kitchen.review([{id:'m4',name:data.meals.m4.name,tier:'lean',qty:1}],data,changed,core).errors;
  assert.ok(errors.some(error=>error.includes('production release hold:')));
  assert.ok(errors.some(error=>error.includes('unregistered operation')));
});

test('partial component ownership rejects over-allocation, including a malformed pancake split',batch13Only,()=>{
  const invalid=clone(methods);
  invalid.meals.b2.prepBatches.find(job=>job.name==='Blueberry cheesecake topping').ingredientAmounts.fage.perServing=30;
  const rows=[{id:'b2',name:data.meals.b2.name,tier:'lean',qty:1}];
  assert.ok(core.auditPlanCoverage(rows,data,invalid).errors.some(error=>error.includes('fage lean component split does not conserve')));
});

test('unrelated recipes cannot activate QC or pickle shopping and mixed tiers scale one pickle batch',batch13Only,()=>{
  assert.deepEqual(core.groceryAdjustmentPlan([{id:'m4',name:data.meals.m4.name,tier:'lean',qty:3}],data,methods),[]);
  const rows=[{id:'m7',name:data.meals.m7.name,tier:'lean',qty:6},{id:'m7',name:data.meals.m7.name,tier:'bulk',qty:2}];
  const target=rows.reduce((sum,row)=>sum+row.qty*data.meals[row.id].tiers[row.tier].ingredients.find(i=>i.key==='pickles').amount,0);
  const model=build(rows),jobs=model.jobs.filter(job=>job.name==='House refrigerator pickles — Prep Day');
  assert.equal(jobs.length,1);
  assert.equal(quantity(jobs[0].ingredients,'pickles'),target);
  const adjustments=core.groceryAdjustmentPlan(rows,data,methods);
  assert.equal(adjustments.find(i=>i.key==='pickles').delta,-target);
  for(const item of adjustments.filter(i=>i.delta>0)) assert.ok(Math.abs(quantity(jobs[0].ingredients,item.key)-item.delta)<.001,item.key);
  assert.equal(adjustments.some(i=>i.key==='shan_seekh'),false);
});

test('kitchen layout follows the work: recipes, sweet toppings, then grouped cup filling',batch13Only,()=>{
  const model=build(),html=kitchen.render(model,'sauces');
  assert.ok(html.indexOf('data-workstation="sauce-savory"')<html.indexOf('data-workstation="sauce-sweet"'));
  assert.ok(html.indexOf('data-workstation="sauce-sweet"')<html.indexOf('data-workstation="sauce-cups"'));
  assert.match(html,/79 cups/); // 78 customer + the explicit quality-check cup.
  assert.match(html,/45 g input; measure finished fill/);
  assert.equal(model.jobs.some(job=>job.stage==='sauces' && job.name==='Chocolate coating'),false);
  const dessert=model.jobs.find(job=>job.type==='prep-flow' && job.recipe.id==='d3');
  assert.ok(dessert.parts.some(job=>job.name==='Chocolate coating'));
  assert.ok(dessert.parts.some(job=>job.name==='Cookie dough balls'));
  const cook=kitchen.render(model,'cook');
  assert.match(cook,/data-cook-station="ground-beef"/);
  assert.match(cook,/data-cook-station="seafood"/);
  const formed=cook.indexOf('data-recipe="dish:m7"');
  const kofta=cook.indexOf('data-recipe="dish:p1"');
  assert.ok(formed<kofta && kofta<cook.indexOf('data-recipe="dish:m5"'));
  assert.match(cook,/<details class="kd-review-details kd-review-hold"><summary>/);
});

test('frozen Batch 10 library keeps every ingredient total when menu IDs are reassigned',()=>{
  const historical=require('./fixtures/batch10/production.json');
  const historyMethods=require('./fixtures/batch10/methods.json');
  const list=Object.entries(historical.meals).flatMap(([id,meal])=>Object.keys(meal.tiers).map(tier=>({id,name:meal.name,tier,qty:2})));
  const remapped={meals:{}},other=[];
  list.forEach((row,index)=>{const id=`historical_${index}`;remapped.meals[id]=historical.meals[row.id];other.push({...row,id});});
  const original=core.ingredientTotals(list,historical,0).totals.sort((a,b)=>a.key.localeCompare(b.key));
  const changed=core.ingredientTotals(other,remapped,0).totals.sort((a,b)=>a.key.localeCompare(b.key));
  assert.deepEqual(changed,original);
  assert.ok(list.length>=30);
  const expectedCups=list.reduce((sum,row)=>sum+Number(historyMethods.meals[row.id]?.sideCups || 0)*row.qty,0);
  assert.equal(grocery.dishSpecificSauceCupCount(core.productionPlan(list),historyMethods,{},{}),expectedCups);
});
