const test=require('node:test');
const assert=require('node:assert/strict');
const core=require('../operations/cook-day-core');
const engine=require('../operations/production-engine');
const data=require('../operations/nutrition/production-data');
const methods=require('../operations/cook-day-methods');

const rows=[
  ['m6','lean',6],['m6','bulk',12],['m2','lean',3],['m2','bulk',7],
  ['m1','lean',3],['m1','bulk',6],['bw1','lean',3],['bw1','bulk',5],
  ['m3','lean',4],['m3','bulk',6],['m4','lean',4],['m4','bulk',8],
  ['w1','lean',3],['w1','bulk',2],['m7','lean',3],['a2','single',4],
  ['a3','single',5],['a4','single',9],['b1','bulk',1],['b3','bulk',1],
  ['b4','lean',1],['b4','bulk',2],
].map(([id,tier,qty])=>({id,tier,qty,name:data.meals[id].name}));
const buffer={rawProteinBufferPct:5,riceBufferPct:15,riceYieldFactor:2.75};
const component=core.componentPlan(rows,data,methods,buffer);
const protein=id=>component.proteins.find(item=>item.dishId===id);
const cloneMethods=()=>({...methods,meals:JSON.parse(JSON.stringify(methods.meals))});

test('recipe-specific output estimates match the existing source basis, without claiming new measurements',()=>{
  for(const [id,expected] of [['m6',3375],['m2',1665],['a2',234],['a3',375],['a4',1080],['m4',2235.6]]) {
    assert.equal(protein(id).expectedCookedAmount,expected,id);
    assert.match(protein(id).yieldLabel,/Recipe-modeled.*actual output must be weighed/);
  }
  for(const [id,expected] of [['m1',1740],['bw1',1530],['m3',1900]]) {
    assert.equal(protein(id).expectedCookedAmount,expected,id);
    assert.match(protein(id).yieldLabel,/October 7 2026 test.*68\.8%/);
  }
});

test('mixed protein totals preserve each allocation and label reserve output as planning',()=>{
  const chicken=component.proteinGroups.find(item=>item.key==='chicken_thigh_raw');
  assert.equal(chicken.expectedCookedAmount,11899);
  assert.match(chicken.yieldLabel,/Dish-specific.*planning estimates.*Actual output must be weighed/);
  assert.equal(chicken.reserveExpectedCookedAmount,595);
  const beef=component.proteinGroups.find(item=>item.key==='beef_90_raw');
  assert.equal(beef.expectedCookedAmount,2235.6);
  assert.equal(beef.reserveExpectedCookedAmount,111.8);
});

test('source estimate overrides preserve all 98 portions, ingredient demand, purchase reserve, cups and nutrition inputs',()=>{
  const beforeData=JSON.stringify(data);
  const legacyMethods=cloneMethods();
  for(const method of Object.values(legacyMethods.meals))if(method.proteinCook)delete method.proteinCook.yieldByProteinKey;
  const build=m=>engine.compileProduction({counts:rows,data,methods:m,buffer});
  const before=build(legacyMethods),after=build(methods);
  assert.equal(after.totalMeals,98);
  assert.deepEqual(after.requirements,before.requirements);
  assert.deepEqual(after.dishIngredients,before.dishIngredients);
  assert.deepEqual(after.recipes.map(r=>r.ingredients),before.recipes.map(r=>r.ingredients));
  assert.deepEqual(after.cups,before.cups);
  assert.deepEqual(after.packaging,before.packaging);
  assert.deepEqual(after.buffer,before.buffer);
  assert.equal(JSON.stringify(data),beforeData);
  assert.equal(after.diagnostics.ok,true);
});

test('recipes without valid overrides keep the legacy default yields',()=>{
  const fallbackMethods=cloneMethods();
  for(const method of Object.values(fallbackMethods.meals))if(method.proteinCook)delete method.proteinCook.yieldByProteinKey;
  fallbackMethods.meals.m6.proteinCook.yieldByProteinKey={chicken_thigh_raw:{factor:1.5}};
  const fallback=core.componentPlan(rows,data,fallbackMethods,buffer);
  assert.equal(fallback.proteins.find(item=>item.dishId==='m6').expectedCookedAmount,3096);
  assert.equal(fallback.proteins.find(item=>item.dishId==='m4').expectedCookedAmount,2430);
  assert.equal(fallback.proteins.find(item=>item.dishId==='w1').expectedCookedAmount,2200);
});
