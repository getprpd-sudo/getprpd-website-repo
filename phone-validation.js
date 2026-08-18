(function phoneValidation(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PRPDPhoneValidation = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function factory() {
  function digits(value) {
    const normalized = String(value ?? '').replace(/\D/g, '');
    return normalized.length === 11 && normalized.startsWith('1') ? normalized.slice(1) : normalized;
  }

  function isUsable(value) {
    return /^\d{10}$/.test(digits(value));
  }

  function isLikelyNanp(value) {
    return /^[2-9]\d{2}[2-9]\d{6}$/.test(digits(value));
  }

  function needsReview(value) {
    return isUsable(value) && !isLikelyNanp(value);
  }

  function format(value) {
    const normalized = digits(value).slice(0, 10);
    if (normalized.length >= 6) return `(${normalized.slice(0, 3)}) ${normalized.slice(3, 6)}-${normalized.slice(6)}`;
    if (normalized.length >= 3) return `(${normalized.slice(0, 3)}) ${normalized.slice(3)}`;
    return normalized;
  }

  return Object.freeze({
    digits,
    format,
    isUsable,
    isLikelyNanp,
    needsReview,
    // Backward-compatible public contract: valid means usable for contact,
    // while unusual NANP patterns are routed to an operator review instead.
    isValid: isUsable,
  });
}));
