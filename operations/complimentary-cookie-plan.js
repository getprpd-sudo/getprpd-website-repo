(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.PRPD_COMPLIMENTARY_COOKIES = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const BATCH = 19;
  const YIELD_PER_BATCH = 12;
  const ONE_TIME_MINIMUM = 18;
  const formula = [
    { name: 'Unsalted butter', amount: 226, unit: 'g' },
    { name: 'Brown sugar', amount: 210, unit: 'g' },
    { name: 'White sugar', amount: 100, unit: 'g' },
    { name: 'Whole eggs', amount: 2, unit: 'each' },
    { name: 'Extra egg yolks', amount: 2, unit: 'each' },
    { name: 'Vanilla extract', amount: 20, unit: 'g' },
    { name: 'All-purpose flour', amount: 300, unit: 'g' },
    { name: 'Baking soda', amount: 1, unit: 'tsp' },
    { name: 'Baking powder', amount: 0.5, unit: 'tsp' },
    { name: 'Salt', amount: 0.5, unit: 'tsp' },
    { name: 'Chocolate chips or chunks', amount: 260, unit: 'g' },
  ];

  function plan(orderCount, batchNumber) {
    const needed = Number(batchNumber) === BATCH ? Math.max(0, Math.floor(Number(orderCount) || 0)) : 0;
    const produced = needed ? needed <= ONE_TIME_MINIMUM
      ? ONE_TIME_MINIMUM : Math.ceil(needed / YIELD_PER_BATCH) * YIELD_PER_BATCH : 0;
    const batches = produced / YIELD_PER_BATCH;
    return {
      needed,
      batches,
      produced,
      spare: produced - needed,
      ingredients: formula.map(item => ({ ...item, amount: item.amount * batches })),
      eggsToBuy: batches * 4,
    };
  }

  function groceryIngredients(cookiePlan) {
    if (!cookiePlan?.needed) return [];
    const scale = cookiePlan.batches;
    return [
      { key:'butter', name:'Unsalted butter', amount:226*scale, unit:'g', section:'Dairy & Eggs' },
      { key:'brown_sugar', name:'Brown sugar', amount:210*scale, unit:'g', section:'Sweets & Baking' },
      { key:'granulated_sugar', name:'Granulated white sugar', amount:100*scale, unit:'g', section:'Sweets & Baking' },
      { key:'egg', name:'Eggs for whole eggs and extra yolks', amount:4*scale, unit:'each', section:'Dairy & Eggs' },
      { key:'vanilla', name:'Vanilla extract', amount:20*scale, unit:'g', section:'Sweets & Baking' },
      { key:'flour', name:'All-purpose flour', amount:300*scale, unit:'g', section:'Pantry & Sauces' },
      { key:'baking_soda', name:'Baking soda', amount:4.6*scale, unit:'g', section:'Sweets & Baking' },
      { key:'baking_powder', name:'Baking powder', amount:2*scale, unit:'g', section:'Sweets & Baking' },
      { key:'salt', name:'Salt', amount:3*scale, unit:'g', section:'Pantry & Sauces' },
      { key:'chocolate_chips', name:'Chocolate chips or chunks', amount:260*scale, unit:'g', section:'Sweets & Baking' },
    ].map(item => ({...item,amount:Math.round(item.amount*10)/10}));
  }

  return { BATCH, YIELD_PER_BATCH, ONE_TIME_MINIMUM, plan, groceryIngredients };
});
