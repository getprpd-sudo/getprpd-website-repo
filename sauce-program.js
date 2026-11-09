(function (root, factory) {
  const program = factory();
  if (typeof module === 'object' && module.exports) module.exports = program;
  if (root) root.PRPD_SAUCE_PROGRAM = program;
})(typeof window !== 'undefined' ? window : null, function () {
  const mealCategories = new Set(['standard', 'beef', 'seafood', 'premium', 'bundle', 'addon']);

  function eligibleMealCount(items) {
    return (items || []).reduce((sum, item) => {
      const dish = item.dish || item;
      const eligible = typeof dish.sauceEligible === 'boolean'
        ? dish.sauceEligible : mealCategories.has(dish.category);
      const qty = Number(item.qty);
      if (!eligible || !Number.isSafeInteger(qty) || qty < 1) return sum;
      const servings = Number(dish.servingCount ?? 1);
      // A bundle line already represents its component meals. Do not also
      // expand its variants/components or add a credit for the bundle itself.
      return sum + qty * (Number.isSafeInteger(servings) && servings > 0 ? servings : 1);
    }, 0);
  }

  function quote(selections, items, config) {
    const selectedQty = Object.values(selections || {}).reduce((sum, qty) => sum + Number(qty || 0), 0);
    const hasFood = (items || []).some(item => Number(item.qty) > 0);
    const eligibleMeals = eligibleMealCount(items);
    const allowance = config?.allowanceMode === 'meal-tiered'
      ? Math.ceil(eligibleMeals / 2)
      : (hasFood ? Math.max(0, Math.floor(Number(config?.freeCupsPerOrder) || 0)) : 0);
    const totalCredits = config?.enabled ? allowance : 0;
    const includedSelected = Math.min(selectedQty, totalCredits);
    const extraQty = Math.max(0, selectedQty - totalCredits);
    return {
      totalCredits, selectableCredits: totalCredits, reservedCredits: 0, reserved: {}, eligibleMeals,
      selectedQty, includedSelected, extraQty,
      extraSubtotal: Math.round((extraQty * Number(config?.extraPrice || 0) + Number.EPSILON) * 100) / 100,
    };
  }
  return { quote, eligibleMealCount };
});
