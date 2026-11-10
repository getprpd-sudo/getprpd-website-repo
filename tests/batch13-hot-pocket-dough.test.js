const test=require('node:test');
const assert=require('node:assert/strict');
const data=require('../operations/nutrition/production-data');

const meal=data.meals.m3;
const dough=(tier,key,component='hot-pocket-dough')=>
  meal.tiers[tier].ingredients.find(item=>item.key===key)?.allocations?.[component]||0;
const batch=(key,component='hot-pocket-dough')=>
  11*dough('lean',key,component)+2*dough('bulk',key,component);

test('Batch 13 Hot Pocket pilot scales one measured yeast-butter dough to 28 pockets',()=>{
  assert.match(meal.productionHold,/untested PRPD 28-pocket adaptation/);
  assert.match(meal.tiers.lean.assumptions.join(' '),/King Arthur Baking/);
  assert.match(meal.tiers.lean.assumptions.join(' '),/Mix\/shape on Cook Day/);
  for(const [key,grams] of Object.entries({
    flour:1260,water:795,butter:200,granulated_sugar:42,instant_yeast:21,salt:25,
  })) assert.ok(Math.abs(batch(key)-grams)<0.003,`${key}: ${batch(key)} != ${grams}`);
  assert.ok(Math.abs(batch('flour','hot-pocket-bench-reserve')-35)<0.003);
  assert.equal(meal.tiers.lean.ingredients.some(item=>item.key==='fage'||item.key==='baking_powder'),false);
  assert.equal(meal.tiers.bulk.ingredients.some(item=>item.key==='egg'),false);
  assert.equal(11*2+2*3,28);
});
