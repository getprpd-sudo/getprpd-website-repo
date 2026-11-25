(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.PRPD_ORDER_NUTRITION = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';
  const fields = ['cal', 'protein', 'carbs', 'fat'];
  const empty = () => Object.fromEntries(fields.map(field => [field, 0]));
  const add = (target, macros, quantity) => fields.forEach(field => {
    target[field] += Number(macros[field] || 0) * quantity;
  });
  const rounded = value => Object.fromEntries(fields.map(field => [field, Math.round(value[field])]));

  function summarizeOrder(lines, menu) {
    const dishes = new Map(Object.values(menu || {}).flatMap(section => Array.isArray(section) ? section : []).map(dish => [dish.id, dish]));
    const meals = empty(), extras = empty();
    const missing = [];
    let mealCount = 0, extraCount = 0;
    function count(dish, tier, quantity, extra) {
      if (!dish || quantity <= 0) return;
      const macros = tier === 'bulk' && dish.bulkMacros ? dish.bulkMacros : dish.macros;
      if (!macros || fields.some(field => !Number.isFinite(Number(macros[field])))) {
        missing.push(dish.name || dish.id);
        return;
      }
      add(extra ? extras : meals, macros, quantity);
      if (extra) extraCount += quantity;
      else mealCount += quantity;
    }
    for (const {dish, tier, qty} of lines || []) {
      const quantity = Number(qty) || 0;
      if (!dish || quantity <= 0) continue;
      const variant = (dish.variants || []).find(item => item.id === tier);
      if (dish.category === 'bundle' && variant?.components?.length) {
        for (const component of variant.components) {
          count(dishes.get(component.id), component.tier, quantity * Number(component.qty || 0), false);
        }
      } else if (dish.category === 'dessert' || dish.category === 'addon') {
        count(dish, tier, quantity * Number(variant?.unitCount || 1), true);
      } else {
        count(dish, tier, quantity, false);
      }
    }
    const all = empty();
    fields.forEach(field => { all[field] = meals[field] + extras[field]; });
    const average = empty();
    if (mealCount) fields.forEach(field => { average[field] = meals[field] / mealCount; });
    return {
      meals: rounded(meals), extras: rounded(extras), all: rounded(all), average: rounded(average),
      mealCount, extraCount, missing: [...new Set(missing)],
    };
  }
  return { summarizeOrder };
});
