(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.PRPD_COMPLIMENTARY_COOKIES = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const BATCH = 19;
  const YIELD_PER_BATCH = 12;
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
    const batches = Math.ceil(needed / YIELD_PER_BATCH);
    return {
      needed,
      batches,
      produced: batches * YIELD_PER_BATCH,
      spare: batches * YIELD_PER_BATCH - needed,
      ingredients: formula.map(item => ({ ...item, amount: item.amount * batches })),
      eggsToBuy: batches * 4,
    };
  }

  return { BATCH, YIELD_PER_BATCH, plan };
});
