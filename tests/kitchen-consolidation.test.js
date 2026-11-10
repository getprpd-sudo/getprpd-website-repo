const test=require('node:test');
const assert=require('node:assert/strict');
const core=require('../operations/cook-day-core');
const data=require('./fixtures/batch10/production.json');
const methods=require('./fixtures/batch10/methods.json');
const kitchen=require('../operations/kitchen-dashboard');
const count=(id,qty=1,tier='lean')=>({id,qty,tier,name:data.meals[id].name});

test('all compatible Batch 10 thighs share the complete savory base',()=>{
  const counts=[count('m6',2),count('b4',3),count('m4',4),count('m7'),count('a1',1,'single'),count('a2',1,'single'),count('a3',1,'single'),count('m1'),count('m2'),count('m3')];
  const model=kitchen.build(counts,data,methods,core,0);
  const group=model.component.seasoningGroups.find(g=>g.name==='Shared savory thigh base');
  assert.equal(group.allocations.length,7);
  assert.equal(group.totalRaw,2240);
  assert.deepEqual(group.baseSeasoning.map(i=>i.key),['garlic_powder','onion_powder','paprika','black_pepper','salt']);
  assert.deepEqual(group.baseSeasoning.map(i=>i.grams),[15.1,9,6.7,4.5,17.9]);
  assert.ok(!group.allocations.some(a=>['m1','m2','m3'].includes(a.dishId)));
  const cajun=group.allocations.find(a=>a.dishId==='m6');
  assert.ok(cajun.finishSeasoning.some(i=>i.key==='smoked_paprika'));
  assert.ok(!model.component.proteinStoragePools.some(p=>p.seasoningGroupId===group.id));
  assert.equal(group.allocations.reduce((n,a)=>n+a.baseAmount,0),group.totalRaw);
});

test('shared sauces form one measured base with separate white and green yields',()=>{
  const counts=[count('m2'),count('m5',2),count('m3',3),count('a3',2,'single')];
  const model=kitchen.build(counts,data,methods,core,0);
  const shared=model.jobs.filter(j=>j.shared);
  assert.equal(shared.length,1);
  assert.ok(shared[0].ingredients.some(i=>i.key==='light_mayo'));
  assert.ok(shared[0].greenAddition>0);
  const final=shared[0].destinations.reduce((n,d)=>n+d.grams,0);
  assert.ok(Math.abs(final-230)<.01); // 90 white + 90 biryani green + 50 wrap green.
  assert.ok(Math.abs(shared[0].ingredients.reduce((n,i)=>n+i.baseAmount,0)+shared[0].greenAddition-final)<.001);
  const html=kitchen.render(model,'sauces');
  assert.equal(html.match(/Garlic sauces: one base, two finishes/g).length,1);
  assert.ok(html.indexOf('kd-sauce-green')<html.indexOf('kd-sauce-white'));
});

test('cold sauce does not consume Biryani marinade yogurt',()=>{
  const plan=core.componentPlan([count('m3',2)],data,methods,0);
  const marinade=plan.prepBatches.find(b=>b.type==='marinade');
  const sauce=plan.prepBatches.find(b=>b.componentRef==='green-garlic');
  assert.ok(Math.abs(marinade.ingredients.find(i=>i.key==='fage').baseAmount-60)<.11);
  assert.ok(Math.abs(sauce.ingredients.reduce((n,i)=>n+i.baseAmount,0)-60)<.001);
  const bad=structuredClone(methods);
  delete bad.meals.m3.prepBatches[0].excludeComponentRefs;
  assert.ok(core.auditPlanCoverage([count('m3')],data,bad).errors.some(e=>e.includes('does not conserve')));
});

test('Shan replaces homemade meat seasonings in both kebab recipes',()=>{
  for(const id of ['m5','p1']) {
    const method=methods.meals[id];
    const raw=method.prepBatches.find(b=>['marinade','form-and-marinate'].includes(b.type));
    assert.ok(raw.ingredientKeys.includes('shan_seekh'));
    assert.ok(!raw.ingredientKeys.some(k=>['salt','paprika','cumin','coriander','black_pepper'].includes(k)));
    const plan=core.componentPlan([count(id)],data,methods,0);
    const protein=plan.proteins[0];
    assert.ok(Math.abs(plan.prepBatches.find(b=>b.ingredients.some(i=>i.key==='shan_seekh')).ingredients.find(i=>i.key==='shan_seekh').baseAmount-protein.baseAmount*.05)<.001);
  }
});

test('produce stays sorted and destinations use progressive disclosure',()=>{
  const model=kitchen.build([count('m3'),count('b4'),count('m6'),count('m5')],data,methods,core,0);
  const keys=model.produce.map(i=>i.key);
  assert.ok(keys.indexOf('onion')<keys.indexOf('red_onion'));
  assert.ok(keys.indexOf('red_onion')<keys.indexOf('garlic'));
  assert.ok(keys.indexOf('garlic')<keys.indexOf('tomato'));
  assert.ok(keys.indexOf('tomato')<keys.indexOf('cilantro'));
  assert.ok(kitchen.render(model,'produce').includes('<details'));
  assert.match(kitchen.render(model,'produce'),/kd-produce-table/);
  assert.match(kitchen.render(model,'produce'),/Chicken Biryani/);
  assert.match(kitchen.render(model,'produce'),/Garlic &amp; ginger/);
});

test('Unicode form descriptions generate valid persistent cook-log IDs',()=>{
  const model=kitchen.build([count('m6'),count('b4'),count('m4')],data,methods,core,0);
  const store=require('../operations/cook-log-store');
  const group=model.component.seasoningGroups.find(g=>g.name==='Shared savory thigh base');
  const key=`seasoning:${group.id}:actual-master-raw-g`;
  assert.match(key,/^[a-z0-9:_|.-]+$/i);
  assert.equal(store.validateLog({batchKey:'test:unicode-form',fields:{[key]:'500'}}).fields[key],'500');
  assert.equal(core.safeLogKey(core.safeLogKey('1.5–2 cm thigh cubes')),core.safeLogKey('1.5–2 cm thigh cubes'));
});
