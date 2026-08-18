const test = require('node:test');
const assert = require('node:assert/strict');
const grocery = require('../operations/grocery-list-core.js');

test('grocery requirements merge recipes, weekly sauces, and packaging by ingredient key', () => {
  const requirements = grocery.mergeRequirements([
    { key:'fage', name:'Greek yogurt', unit:'g', station:'Dairy', bufferedAmount:500 },
  ], {
    sauces:[{
      name:'Weekly sauce',
      ingredients:[{ key:'fage', name:'Greek yogurt', unit:'g', station:'Dairy', totalGrams:800 }],
    }],
  }, [
    { key:'sauce_cup', name:'Sauce cups', unit:'each', station:'Packaging', required:9 },
  ]);
  assert.equal(requirements.find(row => row.key === 'fage').required, 1300);
  assert.deepEqual(requirements.find(row => row.key === 'fage').sources, ['Recipes','Weekly sauce: Weekly sauce']);
  assert.equal(requirements.find(row => row.key === 'sauce_cup').required, 9);
});

test('interchangeable nonfat Greek yogurt brands consolidate into one purchase line', () => {
  const requirements = grocery.mergeRequirements([
    { key:'fage', name:'FAGE Total 0%', unit:'g', bufferedAmount:1000 },
    { key:'simple_truth_yogurt', name:'Simple Truth nonfat Greek yogurt', unit:'g', bufferedAmount:500 },
  ], null, []);
  assert.equal(requirements.length, 1);
  assert.equal(requirements[0].key, 'fage');
  assert.equal(requirements[0].name, 'Nonfat Greek yogurt');
  assert.equal(requirements[0].required, 1500);
});

test('batch-specific grocery substitutions preserve totals and add the replacement ingredient', () => {
  const requirements = grocery.mergeRequirements([
    { key:'blueberry', name:'Blueberries', unit:'g', bufferedAmount:440 },
  ], null, []);
  const adjusted = grocery.applyRequirementAdjustments(requirements, [
    { key:'blueberry', name:'Blueberries', unit:'g', delta:-200, reason:'Customer substitution' },
    { key:'strawberry', name:'Strawberries', unit:'g', delta:200, reason:'Customer substitution' },
  ]);
  assert.equal(adjusted.find(row => row.key === 'blueberry').required, 240);
  assert.equal(adjusted.find(row => row.key === 'strawberry').required, 200);
  assert.deepEqual(adjusted.find(row => row.key === 'strawberry').sources, ['Customer substitution']);
});

test('finished house pickles expand into raw vegetables and a complete brine purchase list', () => {
  const requirements = grocery.mergeRequirements([
    { key:'pickles', name:'House refrigerator pickles', unit:'g', bufferedAmount:460 },
  ], null, []);
  const adjusted = grocery.applyRequirementAdjustments(requirements, [
    { key:'pickles', unit:'g', delta:-460, reason:'Expand finished yield' },
    { key:'red_onion', name:'Red onion', unit:'g', delta:345, reason:'Raw vegetables' },
    { key:'carrot', name:'Carrots', unit:'g', delta:345, reason:'Raw vegetables' },
    { key:'white_vinegar', name:'5% vinegar', unit:'g', delta:460, reason:'Brine' },
    { key:'water', name:'Water', unit:'g', delta:460, reason:'Brine' },
    { key:'pickling_salt', name:'Pickling salt', unit:'g', delta:34.5, reason:'Brine' },
    { key:'granulated_sugar', name:'Sugar', unit:'g', delta:37.5, reason:'Brine' },
  ]);
  assert.equal(adjusted.some(row => row.key === 'pickles'), false);
  for (const key of ['red_onion','carrot','white_vinegar','water','pickling_salt','granulated_sugar']) {
    assert.ok(adjusted.some(row => row.key === key), `${key} should be present`);
  }
});

test('purchase list subtracts pantry stock and rounds up whole packages', () => {
  const rows = grocery.buildPurchaseRows([
    { key:'rice', name:'Rice', unit:'g', station:'Starches', required:1500, sources:['Recipes'] },
  ], {
    rice:{ packageSize:1000, price:3.25, packageLabel:'1 kg bag', store:'Test' },
  }, { onHand:{ rice:200 }, catalog:{} });
  assert.equal(rows[0].needed, 1300);
  assert.equal(rows[0].packages, 2);
  assert.equal(rows[0].purchaseAmount, 2000);
  assert.equal(rows[0].estimatedCost, 6.5);
  assert.equal(rows[0].suggestedPackages, 2);
  assert.equal(rows[0].usageCost, 4.88);
});

test('count-friendly produce exposes a conservative shopping estimate without replacing recipe weight', () => {
  const rows = grocery.buildPurchaseRows([
    { key:'apple', name:'Small apples', unit:'g', section:'Produce', required:470, sources:['Recipes'] },
  ], {
    apple:{ packageSize:454, price:1.48, packageLabel:'1 lb', store:'Test' },
  }, { onHand:{}, catalog:{}, buyPackages:{} });
  assert.equal(rows[0].required, 470);
  assert.deepEqual(rows[0].estimatedCount, { count:4, label:'about 4 small apples', gramsEach:155 });
  assert.match(grocery.csv(rows), /Estimated shopping count/);
  assert.match(grocery.csv(rows), /about 4 small apples/);
});

test('grocery rows follow a short grocery-store aisle order', () => {
  const requirements = grocery.mergeRequirements([
    { key:'rice_dry', name:'Rice', unit:'g', station:'Starches', bufferedAmount:1000 },
    { key:'chicken_thigh_raw', name:'Chicken', unit:'g', station:'Poultry', bufferedAmount:1000 },
    { key:'lettuce', name:'Lettuce', unit:'g', station:'Produce', bufferedAmount:100 },
    { key:'small_tortilla', name:'Tortillas', unit:'each', station:'Bread', bufferedAmount:4 },
  ]);
  assert.deepEqual(requirements.map(row => row.section), [
    'Meat & Seafood', 'Produce', 'Bread & Tortillas', 'Pantry & Sauces',
  ]);
});

test('checkout cost and consumed batch value stay separate', () => {
  const rows = grocery.buildPurchaseRows([
    { key:'rice', name:'Rice', unit:'g', section:'Pantry & Sauces', required:1500, sources:['Recipes'] },
  ], {
    rice:{ packageSize:1000, price:3.25, packageLabel:'1 kg bag', store:'Test' },
  }, { onHand:{}, catalog:{}, buyPackages:{} });
  const summary = grocery.summary(rows);
  assert.equal(summary.estimatedCost, 6.5);
  assert.equal(summary.foodUsageCost, 4.88);
  assert.equal(summary.packagingUsageCost, 0);
});

test('operator package overrides expose an under-buy warning', () => {
  const rows = grocery.buildPurchaseRows([
    { key:'rice', name:'Rice', unit:'g', section:'Pantry & Sauces', required:1500, sources:['Recipes'] },
  ], {
    rice:{ packageSize:1000, price:3.25, packageLabel:'1 kg bag', store:'Test' },
  }, { onHand:{}, catalog:{}, buyPackages:{ rice:1 } });
  assert.equal(rows[0].packages, 1);
  assert.equal(rows[0].suggestedPackages, 2);
  assert.equal(rows[0].shortAmount, 500);
  assert.equal(grocery.summary(rows).underBought, 1);
});

test('packaging counts physical sauce cups but excludes bulk squeeze-bottle sauce', () => {
  const rows = grocery.packagingRequirements([
    { tier:'lean', total:10 },
    { tier:'single', total:3 },
  ], [{ customer:'A' }, { customer:'B' }], {
    sauces:[
      { customerCups:4, qcCups:1, kitchenUseCups:10 },
      { customerCups:3, qcCups:1, kitchenUseCups:10 },
    ],
  }, 8, 4);
  assert.equal(rows.find(row => row.key === 'meal_container').required, 10);
  assert.equal(rows.find(row => row.key === 'dessert_cup').required, 3);
  assert.equal(rows.find(row => row.key === 'sauce_cup').required, 13);
  assert.equal(rows.find(row => row.key === 'paper_bag').required, 2);
  assert.equal(rows.find(row => row.key === 'printed_label').required, 8);
  assert.equal(rows.find(row => row.key === 'food_prep_gloves').required, 1);
  assert.equal(rows.find(row => row.key === 'kitchen_consumable_allowance').required, 13);
});

test('weekly sauce already modeled in recipes adds only QC and kitchen reserve ingredients', () => {
  const rows = grocery.mergeRequirements([
    { key:'honey', name:'Honey', unit:'g', bufferedAmount:100 },
  ], { sauces:[{
    name:'Controlled sauce', customerCups:4, kitchenUseCups:0, qcCups:1, totalCups:5,
    ingredientsIncludedInRecipes:true,
    ingredients:[{ key:'honey', name:'Honey', totalGrams:50 }],
  }] });
  const honey = rows.find(row => row.key === 'honey');
  assert.equal(honey.required, 110);
  assert.ok(honey.sources.includes('Weekly sauce QC / kitchen reserve: Controlled sauce'));
});
