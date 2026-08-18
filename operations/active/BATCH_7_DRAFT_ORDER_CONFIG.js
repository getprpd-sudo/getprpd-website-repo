// Controlled internal mirror for the owner-approved Batch 7 customer menu.
// The public configuration remains the runtime authority; this wrapper prevents
// production tools from silently loading an archived Batch 6 menu.
(function (root, factory) {
  const config = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = config;
  if (root) root.PRPD_ORDER_CONFIG = config;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  if (typeof module !== 'undefined' && module.exports) {
    return require('../../config/order-config.js');
  }
  return window.PRPD_ORDER_CONFIG;
});
