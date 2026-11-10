const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('../operations/cook-day-core');
const data = require('./fixtures/batch10/production.json');
const methods = require('./fixtures/batch10/methods.json');
const kitchen = require('../operations/kitchen-dashboard');
const count = (id,qty=1,tier=Object.keys(data.meals[id].tiers)[0]) => ({id,qty,tier,name:data.meals[id].name});
const all = Object.entries(data.meals).flatMap(([id,meal])=>Object.keys(meal.tiers).map(tier=>count(id,1,tier)));

test('small seasonings display as practical spoon measures without gram decimals',()=>{
  assert.equal(core.dualAmount({unit:'g',measure:{type:'spice',gramsPerTsp:6}},6),'1 tsp');
  assert.equal(core.dualAmount({unit:'g',measure:{type:'spice',gramsPerTsp:6}},9),'1 ½ tsp');
  assert.equal(core.dualAmount({unit:'g',measure:{type:'spice',gramsPerTsp:2}},6),'1 tbsp');
  assert.equal(core.dualAmount({unit:'g',measure:{type:'packet',gramsPerPacket:50}},25),'½ packet');
});

test('all frozen Batch 10 regression tiers render every stage without changing source data',()=>{
  const before=JSON.stringify({data,methods});
  const model=kitchen.build(all,data,methods,core,5);
  assert.equal(model.recipes.length,33);
  assert.equal(model.totalMeals,33);
  assert.deepEqual(model.review.errors,[]);
  for (const stage of kitchen.stages) {
    const html=kitchen.render(model,stage.id,'',{preview:true});
    assert.ok(html.length>100);
    assert.ok(!html.includes('NaN'));
  }
  assert.equal(JSON.stringify({data,methods}),before);
});
test('manual production discrepancies cannot masquerade as exact customer orders',()=>{
  const orders=[{include:true,items:[count('p1',6)]}];
  assert.deepEqual(kitchen.countDifferences([count('p1',6)],orders,core),[]);
  assert.deepEqual(kitchen.countDifferences([count('p1',5)],orders,core),[{key:'p1:lean',production:5,ordered:6}]);
  assert.equal(kitchen.countDifferences([count('p1',6),count('m6',1)],orders,core).length,1);
});
test('Shan resolves Biryani while genuinely unmeasured recipes still block',()=>{
  const review=kitchen.review([count('m3')],data,methods,core);
  assert.equal(review.decisions.length,0);
  const incomplete=structuredClone(methods);
  incomplete.meals.m3.prepBatches[0].unmeasured=['Missing measured blend'];
  assert.equal(kitchen.review([count('m3')],data,incomplete,core).decisions.length,1);
  assert.equal(kitchen.review([count('m6')],data,methods,core).decisions.length,0);
});
test('96/4 and 90/10 are separate protein and grocery specifications',()=>{
  const model=kitchen.build([count('p1',6),count('m5',2)],data,methods,core,5);
  const keys=model.component.proteinGroups.map(g=>g.key);
  assert.ok(keys.includes('beef_96_raw') && keys.includes('beef_90_raw'));
  assert.equal(model.component.proteinGroups.find(g=>g.key==='beef_96_raw').baseAmount,1980);
  assert.equal(model.component.proteinGroups.find(g=>g.key==='beef_90_raw').baseAmount,340);
});
test('kofta divided mixture includes every gram of meat and mix-ins',()=>{
  const recipe=kitchen.build([count('p1',6)],data,methods,core,0).recipes[0];
  const mixture=recipe.prep.find(b=>b.type==='form-and-marinate').ingredients.reduce((n,i)=>n+i.baseAmount,0);
  assert.equal(mixture,2079);
  assert.equal(mixture/30,69.3);
  assert.match(recipe.prep[0].steps.join(' '),/complete seasoned mixture/);
});
test('neutral grouping is metadata driven and preserves mass after seasoning',()=>{
  const model=kitchen.build([count('a1',2),count('a3',3),count('m4',4)],data,methods,core,5);
  const shared=model.component.seasoningGroups[0];
  assert.equal(shared.allocations.length,3);
  const expected=shared.totalRaw+shared.baseSeasoning.reduce((n,i)=>n+i.grams,0);
  assert.ok(Math.abs(shared.allocations.reduce((n,a)=>n+kitchen.seasonedSplit(shared,a),0)-expected)<0.0001);
  const renamed=structuredClone(methods), renamedData=structuredClone(data);
  renamed.meals.testRecipe=renamed.meals.a1; renamedData.meals.testRecipe=renamedData.meals.a1;
  const moved=kitchen.build([{...count('a1',2),id:'testRecipe'},count('a3',3)],renamedData,renamed,core,0);
  assert.equal(moved.component.seasoningGroups[0].allocations.length,2);
});
test('only Enchilada chicken and assembly are scheduled on Prep Day',()=>{
  const model=kitchen.build([count('a1',2),count('m4',4)],data,methods,core,0);
  const ahead=model.jobs.filter(j=>j.stage==='ahead');
  assert.equal(ahead.filter(j=>j.alreadyPrepared).length,1);
  assert.equal(ahead.filter(j=>j.name==='Enchilada pan assembly').length,1);
  assert.ok(ahead.every(j=>j.steps.length));
  assert.ok(!ahead.some(j=>j.type==='cold-kit'));
  assert.ok(model.jobs.some(j=>j.type==='cold-kit' && j.stage==='cook'));
  assert.equal(new Set(model.jobs.map(j=>j.key)).size,model.jobs.length);
});
test('Lean and Bulk calculations stay independent but Cook Day renders one dish card',()=>{
  const model=kitchen.build([count('m6',3,'lean'),count('m6',2,'bulk')],data,methods,core,0);
  assert.equal(model.recipes[0].ingredients.find(i=>i.key==='protein_pasta').baseAmount,150);
  assert.equal(model.recipes[1].ingredients.find(i=>i.key==='protein_pasta').baseAmount,130);
  const html=kitchen.render(model,'cook');
  assert.equal((html.match(/data-recipe="dish:m6"/g)||[]).length,1);
  assert.match(html,/Lean 3 · Bulk 2/);
  const pack=kitchen.render(model,'pack');
  assert.match(pack,/Fill 3 Lean containers/);
  assert.match(pack,/Fill 2 Bulk containers/);
  assert.ok(!html.includes('Finished batch (g)') && !html.includes('Change or shortage'));
  assert.match(html,/<details class="kd-task kd-recipe kd-combined-recipe"/);
  assert.match(html,/kd-action-list/);
});
test('Prep Day cooks only Enchilada chicken and keeps cold-item chicken for Cook Day',()=>{
  const counts=[count('b4',3,'lean'),count('b4',1,'bulk'),count('m4',4,'lean'),count('m4',1,'bulk'),
    count('m6',3,'lean'),count('m6',3,'bulk'),count('a1',2,'single'),count('a2',2,'single'),count('a3',3,'single')];
  const html=kitchen.render(kitchen.build(counts,data,methods,core,0),'ahead');
  assert.doesNotMatch(html,/Take out 266\.2 g seasoned chicken/);
  assert.doesNotMatch(html,/Take out 399\.3 g seasoned chicken/);
  assert.match(html,/Take out 1,115\.9 g seasoned chicken/);
  assert.match(html,/Lean · 4:<\/b> 819 g seasoned pull \+ 8 g Altunsa sunflower oil/);
  assert.match(html,/Bulk · 1:<\/b> 296\.9 g seasoned pull \+ 3 g Altunsa sunflower oil/);
  assert.doesNotMatch(html,/Hummus Box lemon chicken/);
  assert.equal((html.match(/<h3>Enchilada pan assembly<\/h3>/g)||[]).length,1);
  assert.doesNotMatch(html,/combined finished-portion basis/);
  assert.match(html,/1,115\.9 g seasoned pull above/);
  assert.doesNotMatch(html,/same deep pan is enough/);
  assert.match(html,/physically separated, labeled sections or pans/);
  assert.match(html,/Lean · 4 meals/);
  assert.match(html,/Bulk · 1 meals/);

  const cookHtml=kitchen.render(kitchen.build(counts,data,methods,core,0),'cook');
  assert.match(cookHtml,/Buffalo Chicken Pinwheels/);
  assert.match(cookHtml,/Mediterranean Chicken Hummus Box/);
  assert.match(cookHtml,/Mini Chicken Snack Wrap/);
  assert.match(cookHtml,/Cook today: 266\.2 g seasoned chicken/);
  assert.match(cookHtml,/Cook today: 399\.3 g seasoned chicken/);
  assert.match(cookHtml,/Pan-cook chicken to 165 F today; rapid-cool to 41 F or below/);
});
test('Cook Day shows an exact protein pull for chicken, beef, leg quarters, and seafood',()=>{
  const counts=[count('m2',2,'lean'),count('m3',2,'lean'),count('b3',3,'lean'),count('m5',3,'lean'),
    count('m1',2,'lean'),count('m8',2,'lean'),count('a1',2,'single')];
  const html=kitchen.render(kitchen.build(counts,data,methods,core,0),'cook');
  assert.match(html,/Cook today: 470 g raw boneless skinless chicken thighs/);
  assert.match(html,/Cook today: 400 g raw boneless skinless chicken thighs/);
  assert.match(html,/Cook today: 360 g raw ground beef 90\/10/);
  assert.match(html,/Cook today: 510 g raw ground beef 90\/10/);
  assert.match(html,/Cook today: 860 g raw bone-in chicken leg quarters/);
  assert.match(html,/Cook today: 400 g raw shrimp peeled and deveined/);
  assert.match(html,/Cook today: 260 g raw boneless skinless chicken thighs/);
});
test('Breakfast Burrito prep is visible but eggs remain uncooked until Cook Day',()=>{
  const model=kitchen.build([count('b3',3,'lean')],data,methods,core,0);
  const prep=model.jobs.find(job=>job.name==='Breakfast Burrito prep kit');
  assert.equal(prep.stage,'ahead');
  const ahead=kitchen.render(model,'ahead');
  assert.match(ahead,/Breakfast Burrito prep kit/);
  assert.match(ahead,/keep both uncracked and refrigerated/);
  assert.match(ahead,/Cook the eggs fresh on Cook Day/);
});
test('Prep Day groups every grain while clearly deferring Biryani cooking',()=>{
  const model=kitchen.build([count('b4',3,'lean'),count('b4',1,'bulk'),count('m1',2,'lean'),count('m2',2,'lean'),
    count('m3',2,'lean'),count('m4',1,'lean'),count('m6',3,'lean'),count('m8',2,'lean')],data,methods,core,0);
  const ahead=model.jobs.filter(job=>job.stage==='ahead').map(job=>job.name);
  assert.ok(ahead.includes('Shakshuka tomato-pepper base'));
  assert.ok(ahead.includes('Cajun tomato-onion sauce base'));
  assert.ok(ahead.includes('Creamy Cajun pasta setup'));
  const sharedRice=model.jobs.filter(job=>job.type==='shared-rice');
  assert.equal(sharedRice.length,1);
  assert.ok(ahead.includes('Plain rice · one shared pot'));
  assert.ok(!ahead.includes('Peri Peri rice'));
  assert.ok(ahead.includes('Separate Halal Cart yellow rice'));
  assert.ok(ahead.includes('Shrimp vegetable rice'));
  assert.ok(ahead.includes('Shrimp zucchini'));
  assert.ok(ahead.includes('Biryani rice'));
  assert.equal(model.jobs.find(job=>job.name==='Biryani rice').deferred,true);
  const cajun=model.jobs.find(job=>job.name==='Creamy Cajun pasta setup');
  assert.match(cajun.steps.join(' '),/Do not cook the spaghetti today/);
  const html=kitchen.render(model,'ahead');
  const stations=['protein-cooking','grains','vegetables','sauce-bases','cold-kits','assembly'];
  assert.ok(stations.every(id=>html.includes(`data-workstation="${id}"`)));
  for(let index=1;index<stations.length;index++) assert.ok(html.indexOf(`data-workstation="${stations[index-1]}"`)<html.indexOf(`data-workstation="${stations[index]}"`));
  assert.match(html,/250 g dry rice · 80 g hold dry/);
  assert.match(html,/Peri Peri Chicken/);
  assert.match(html,/Cook tomorrow/);
});
test('tomorrow-only cold assembly disappears from Prep Day while sauces stay visible',()=>{
  const model=kitchen.build([count('b4',1,'lean'),count('m8',2,'lean'),count('a1',2,'single'),count('a2',2,'single'),count('a3',3,'single')],data,methods,core,0);
  const ahead=model.jobs.filter(job=>job.stage==='ahead').map(job=>job.name);
  assert.ok(!ahead.includes('Shakshuka eggs, cheese, bread and garnish'));
  assert.ok(!ahead.includes('Hummus Box components'));
  assert.ok(!ahead.includes('Mini Wrap fresh salad and tortillas'));
  assert.ok(!ahead.includes('Pinwheel tortillas and lettuce'));
  const sauces=model.jobs.filter(job=>job.stage==='sauces').map(job=>job.name);
  assert.ok(sauces.includes('Buffalo filling base'));
  assert.ok(sauces.includes('Garlic-butter shrimp sauce setup'));
});
test('Prep list groups canned peas and corn under an action label with exact destinations',()=>{
  const model=kitchen.build([count('m4',4,'lean'),count('m4',1,'bulk'),count('m8',2,'lean')],data,methods,core,0);
  const html=kitchen.render(model,'produce');
  assert.match(html,/Open &amp; drain/);
  assert.doesNotMatch(html,/Pantry vegetables/);
  assert.match(html,/Peas and carrots, canned, drained[\s\S]*?148 g/);
  assert.match(html,/Sweet yellow corn, cooked, no salt[\s\S]*?270 g/);
  assert.match(html,/Garlic Butter Shrimp \+ Rice[\s\S]*?148 g/);
  assert.match(html,/Chicken Enchilada Bake[\s\S]*?270 g/);
});
test('Cook Day groups chicken recipes before seafood and preserves cold-assembly safety',()=>{
  const model=kitchen.build([count('m1',2,'lean'),count('m2',2,'lean'),count('m4',4,'lean'),count('m6',3,'lean'),count('m8',2,'lean'),count('a2',2,'single')],data,methods,core,0);
  const html=kitchen.render(model,'cook');
  assert.match(html,/Mediterranean Chicken Hummus Box/);
  assert.match(html,/Pan-cook chicken to 165 F today/);
  const stations=['poultry','seafood'];
  assert.ok(stations.every(id=>html.includes(`data-cook-station="${id}"`)));
  for(let index=1;index<stations.length;index++) assert.ok(html.indexOf(`data-cook-station="${stations[index-1]}"`)<html.indexOf(`data-cook-station="${stations[index]}"`));
  const chicken=model.recipes.filter(recipe=>recipe.productionGroup==='poultry');
  assert.deepEqual(new Set(chicken.map(recipe=>recipe.id)),new Set(['m1','m2','m4','m6','a2']));
  const coldItem=chicken.find(recipe=>recipe.id==='a2');
  assert.match(coldItem.method.steps.join(' '),/rapid-cool.*to 41 F or below/);
});
test('invalid ingredient amounts and fractional containers stop production readiness',()=>{
  const changed=structuredClone(data); changed.meals.p1.tiers.lean.ingredients[0].amount=NaN;
  assert.ok(kitchen.review([count('p1',1.5)],changed,methods,core).errors.length>=2);
});
test('shared produce totals include herbs and expose recipe cut forms',()=>{
  const model=kitchen.build([count('m3',2),count('m5',3)],data,methods,core,0);
  const onion=model.produce.find(i=>i.key==='onion');
  assert.ok(onion.destinations.some(d=>d.cut==='Thinly slice'));
  assert.ok(onion.destinations.some(d=>d.cut==='Thinly slice for salad'));
  assert.ok(model.produce.some(i=>i.key==='cilantro'));
  assert.ok(Math.abs(onion.destinations.reduce((s,d)=>s+d.baseAmount,0)-onion.baseAmount)<0.11);
});
test('recipe data and customer-controlled names are HTML escaped',()=>{
  const copy=structuredClone(data); copy.meals.p1.name='<img src=x onerror=alert(1)>';
  const model=kitchen.build([{...count('p1'),name:copy.meals.p1.name}],copy,methods,core,0);
  assert.ok(!kitchen.render(model,'cook').includes('<img'));
});
