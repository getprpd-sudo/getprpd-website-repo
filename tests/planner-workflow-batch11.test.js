// Historical Batch 11 workflow suite pending frozen production/method fixtures.
const {skip:test}=require('node:test');
const assert=require('node:assert/strict');
const core=require('../operations/cook-day-core');
const data=require('../operations/nutrition/production-data');
const methods=require('../operations/cook-day-methods');
const kitchen=require('../operations/kitchen-dashboard');
const count=(id,qty=1,tier=Object.keys(data.meals[id].tiers)[0])=>({id,name:data.meals[id].name,qty,tier});
const build=counts=>kitchen.build(counts,data,methods,core,{rawProteinBufferPct:5,riceBufferPct:15,riceYieldFactor:2.75});
const near=(a,b)=>assert.ok(Math.abs(a-b)<.001,`${a} !== ${b}`);

test('shared sauce scales from ingredients, not stale batch numbers or grocery reserves',()=>{
  for(const counts of [[count('b2'),count('m5',2),count('m5',3,'bulk')],[count('m5',7,'bulk')]]) {
    const model=build(counts),sauces=model.jobs.filter(job=>job.type==='side-cup-batch');
    assert.equal(sauces.length,1);
    const sauce=sauces[0],qty=counts.reduce((sum,row)=>sum+row.qty,0);
    assert.equal(sauce.qty,qty);
    near(sauce.ingredients.reduce((sum,item)=>sum+item.baseAmount,0),qty*45);
    for(const item of sauce.ingredients) near(item.baseAmount,counts.reduce((sum,row)=>sum+data.meals[row.id].tiers[row.tier].ingredients.find(i=>i.key===item.key).amount*row.qty,0));
    assert.match(kitchen.jobCard(sauce),/Valentina/);
  }
});

test('compatible rice is one physical job with conserved shares, including exclusive meals',()=>{
  const counts=[count('m1',3),count('m1',1,'bulk'),count('m3'),count('m3',1,'bulk')];
  const model=build(counts),rice=model.jobs.filter(job=>job.type==='shared-rice');
  assert.equal(rice.length,1);near(rice[0].ingredients[0].baseAmount,290);
  near(rice[0].destinations.reduce((sum,row)=>sum+row.grams,0),290);
  assert.deepEqual(rice[0].destinations.map(row=>row.grams).sort((a,b)=>a-b),[95,195]);
  const more=build([...counts,count('x1',3),count('x2',2)]).jobs.filter(job=>job.type==='shared-rice');
  assert.equal(more.length,1);near(more[0].ingredients[0].baseAmount,505);
  const custom=structuredClone(methods);custom.meals.m1.riceBatchGroup='special-seasoned';
  const separate=kitchen.build(counts,data,custom,core,0);
  assert.ok(separate.jobs.some(job=>job.recipe?.id==='m1' && job.ingredients.some(i=>i.key==='rice_dry')));
});

test('meatball pasta sauce is visible in Sauces and conserves recipe allocations at any count',()=>{
  for(const counts of [[count('m4',4),count('m4',4,'bulk')],[count('m4',2,'bulk')],[count('m4',1)]]) {
    const model=build(counts),qty=counts.reduce((sum,row)=>sum+row.qty,0);
    const sauces=model.jobs.filter(job=>job.recipe?.id==='m4' && job.stage==='sauces');
    assert.equal(sauces.length,1);
    const sauce=sauces[0];
    assert.equal(sauce.name,'Meatball pasta · tomato sauce');
    assert.deepEqual(sauce.ingredients.map(item=>item.key),['crushed_tomatoes','tomato_paste']);
    near(sauce.ingredients.find(item=>item.key==='crushed_tomatoes').baseAmount,150*qty);
    near(sauce.ingredients.find(item=>item.key==='tomato_paste').baseAmount,16*qty);
    assert.match(kitchen.render(model,'sauces'),/Stir until the paste is fully dispersed/);
    const pasta=model.jobs.find(job=>job.recipe?.id==='m4' && job.type==='starch-ahead');
    assert.deepEqual(pasta.ingredients.map(item=>item.key),['protein_pasta']);
    for(const recipe of model.recipes) {
      for(const source of data.meals.m4.tiers[recipe.tier].ingredients.filter(item=>item.key!=='mozzarella')) {
        near(recipe.prep.flatMap(batch=>batch.ingredients).filter(item=>item.key===source.key).reduce((sum,item)=>sum+item.baseAmount,0),source.amount*recipe.qty);
      }
    }
    const finish=kitchen.combinedCookCard(model.recipes).split('Finish / assembly quantities')[1]?.split('</ul>')[0] || '';
    assert.match(finish,/mozzarella/);
    assert.doesNotMatch(finish,/Canned crushed tomatoes|Tomato paste|Garlic, raw|Onion, raw/);
  }
});

test('reusable meatball methods keep sauce separate from the pasta job',()=>{
  const method=methods.methodsByName['Meatball Arrabbiata Pasta'];
  assert.ok(method.prepBatches.some(card=>card.type==='sauce' && card.ingredientKeys.includes('crushed_tomatoes')));
  assert.deepEqual(method.prepBatches.find(card=>card.type==='starch-ahead').ingredientKeys,['protein_pasta']);
});

test('lasagna has one ordered process with every scaled ingredient exactly once',()=>{
  const counts=[count('m6',6),count('m6',2,'bulk')],model=build(counts);
  const jobs=model.jobs.filter(job=>job.recipe?.id==='m6');
  assert.equal(jobs.length,1);
  assert.deepEqual(jobs[0].parts.map(part=>part.type),['sauce','mix','bake-ahead']);
  for(const expected of core.ingredientTotals(counts,data,0).totals) {
    near(jobs[0].ingredients.find(item=>item.key===expected.key).baseAmount,expected.baseAmount);
  }
  assert.equal(kitchen.aheadStation(jobs[0]),'complete-recipes');
  assert.doesNotMatch(kitchen.render(model,'proteins'),/Brown the 90\/10/);
});

test('recipe seasoning already present is not added a second time by operational totals',()=>{
  const family=methods.sharedProteinSeasoning[0];
  for(const id of family.dishIds) for(const tier of Object.keys(data.meals[id].tiers)) {
    const counts=[count(id,3,tier)],total=core.operationalIngredientTotals(counts,data,methods,0).totals;
    for(const spice of family.basePerKg) {
      const source=data.meals[id].tiers[tier].ingredients.find(item=>item.key===spice.key);
      near(total.find(item=>item.key===spice.key).baseAmount,source.amount*3);
    }
  }
});

test('whole-pan rounding conserves fractional eggs and exposes unlabeled extras',()=>{
  const model=build([count('d3',1)]),job=model.jobs.find(job=>job.recipe?.id==='d3');
  near(job.ingredients.find(item=>item.key==='egg').baseAmount,1);
  near(job.ingredients.find(item=>item.key==='flour').baseAmount,80);
  assert.match(kitchen.jobCard(job),/3 unlabeled owner portions/);
  assert.equal(kitchen.aheadStation(job),'desserts');
});

test('cooking stations follow equipment and garnish stays in Produce',()=>{
  const model=build([count('m2'),count('m4'),count('m7'),count('m5'),count('m3')]);
  for(const id of ['m2','m4','m7']) assert.equal(kitchen.cookStation(model.recipes.filter(r=>r.id===id)),'oven-400');
  assert.ok(model.jobs.some(job=>job.type==='protein-cook-ahead'));
  assert.ok(model.jobs.some(job=>job.name==='Lemon-herb quinoa'));
  assert.equal(model.jobs.some(job=>job.type==='garnish-kit'),false);
  assert.ok(model.produce.some(item=>item.key==='cilantro'));
});

test('all current recipe tiers, desserts, and Grab & Go remain visible without mutating sources',()=>{
  const counts=Object.entries(data.meals).flatMap(([id,meal])=>Object.keys(meal.tiers).map(tier=>count(id,2,tier)));
  const before=JSON.stringify({data,methods,counts}),model=build(counts);
  assert.deepEqual(model.review.errors,[]);
  for(const stage of kitchen.stages) assert.doesNotMatch(kitchen.render(model,stage.id),/NaN|undefined|Missing raw-protein method/);
  const html=kitchen.render(model,'cook');
  for(const id of Object.keys(data.meals).filter(id=>!methods.meals[id].prepDayOnly)) assert.equal(html.split(`data-recipe="dish:${id}"`).length-1,1,id);
  for(const id of ['d1','d2','d3']) assert.ok(model.jobs.some(job=>job.recipe?.id===id && kitchen.aheadStation(job)==='desserts'));
  assert.equal(JSON.stringify({data,methods,counts}),before);
});

test('finish ingredients exclude applied seasoning and preserve reserved yogurt and garnish shares',()=>{
  const model=build([count('m1'),count('m3'),count('m7'),count('m5')]);
  const html=id=>kitchen.combinedCookCard(model.recipes.filter(recipe=>recipe.id===id));
  const finish=id=>html(id).split('Finish / assembly quantities')[1]?.split('</ul>')[0] || '';
  assert.doesNotMatch(finish('m1'),/Table salt|Garlic powder|Paprika/);
  assert.match(finish('m3'),/30 g/);
  assert.doesNotMatch(finish('m5'),/Table salt/);
  assert.match(finish('m7'),/2 g/);
  assert.doesNotMatch(finish('m7'),/Garlic, raw|Lemon juice|Table salt/);
});

test('family pack allocations and no-label instruction agree on the same dish card',()=>{
  const counts=[count('w1',7)],orders=[{customer:'Talal Hassan',items:[count('w1',5)]},{customer:'Duaa Hassan',items:[count('w1',2)]}];
  const model=kitchen.build(counts,data,methods,core,0,orders),html=kitchen.render(model,'cook');
  assert.match(html,/Talal: 5 Single/);assert.match(html,/Duaa: 2 Single/);
  assert.doesNotMatch(html,/Close, apply the exact label/);
  assert.match(html,/family portions separate and unlabeled/);
});
