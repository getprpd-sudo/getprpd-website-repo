(function (root, factory) {
  const program = factory();
  if (typeof module === 'object' && module.exports) module.exports = program;
  if (root) root.PRPD_SAUCE_PROGRAM = program;
})(typeof window !== 'undefined' ? window : null, function () {
  function quote(selections, items, config) {
    const selectedQty = Object.values(selections || {}).reduce((sum, qty) => sum + Number(qty || 0), 0);
    const hasFood = (items || []).some(item => Number(item.qty) > 0);
    const totalCredits = config?.enabled && hasFood ? Math.max(0, Math.floor(Number(config.freeCupsPerOrder) || 0)) : 0;
    const includedSelected = Math.min(selectedQty, totalCredits);
    const extraQty = Math.max(0, selectedQty - totalCredits);
    return {
      totalCredits, selectableCredits: totalCredits, reservedCredits: 0, reserved: {},
      selectedQty, includedSelected, extraQty,
      extraSubtotal: Math.round((extraQty * Number(config?.extraPrice || 0) + Number.EPSILON) * 100) / 100,
    };
  }
  return { quote };
});
