const ORDER_API_URL = '/api/order';
    const { batch: BATCH, policies: POLICIES, prices: PRICES, menu: MENU, promotions: PROMOTIONS = { codes: [] }, tax: TAX_POLICY = { enabled: false }, sauceProgram: SAUCE_PROGRAM = { enabled: false } } = window.PRPD_ORDER_CONFIG;
    const IS_MENU_PUBLISHED = BATCH.published === true;
    const MIN_ORDER_TOTAL = POLICIES.minimumOrder;
    const FREE_DELIVERY_THRESHOLD = POLICIES.freeDeliveryThreshold;
    const DELIVERY_FEE = POLICIES.deliveryFee;
    const DELIVERY_ZONES = POLICIES.deliveryZones || {};
    const CORE_DELIVERY_POLICY = DELIVERY_ZONES.core || {
      id: 'core', label: 'Local Delivery', minimumOrder: MIN_ORDER_TOTAL,
      freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD, deliveryFee: DELIVERY_FEE,
    };
    const PICKUP_POLICY = DELIVERY_ZONES.pickup || {
      id: 'pickup', label: 'Pickup', minimumOrder: MIN_ORDER_TOTAL,
      city: 'Frisco', state: 'TX', freeDeliveryThreshold: MIN_ORDER_TOTAL, deliveryFee: 0,
    };
    const PICKUP_CITY = PICKUP_POLICY.city || 'Frisco';
    const MAX_QTY_PER_ITEM = POLICIES.maxQtyPerItem;
    const MAX_TOTAL_ITEMS = POLICIES.maxTotalItems;
    const DELIVERY_DAY = String(BATCH.deliveryDate || 'weekly delivery').split(',')[0].trim();
    const orderFormStartedAt = Date.now();
    const ATTRIBUTION_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
    const GOOGLE_CLICK_KEYS = ['gclid', 'gbraid', 'wbraid'];
    const GOOGLE_AD_DETAIL_KEYS = ['matchtype', 'device', 'network'];
    let appliedPromotion = null;
    let fulfillmentMethod = 'delivery';
    let deliveryQuoteState = { zip: '', status: 'idle', policy: null };
    let deliveryQuoteRequest = 0;
    const CART_STORAGE_KEY = `prpd_cart_b${BATCH.number}`;
    const SAUCE_STORAGE_KEY = `prpd_sauces_order_allowance_b${BATCH.number}`;
    const sauceSelections = {};
    const MENU_DETAILS_BY_BATCH = window.PRPD_MENU_DETAILS?.batches || {};
    let displayedMenuBatchNumber = BATCH.number;
    let lastMealDetailTrigger = null;

    function moneyAmount(value) {
      return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
    }

    function calculateSalesTax(ordered, mealSubtotal, deliveryFee, discountAmount) {
      if (!TAX_POLICY.enabled) {
        return { taxableSubtotal: 0, taxableDelivery: 0, taxRate: 0, salesTax: 0 };
      }
      const rate = Number(TAX_POLICY.rate);
      const taxableClasses = new Set(TAX_POLICY.taxableClasses || []);
      const unresolved = ordered.filter(({ dish }) => !dish.taxClass || dish.taxClass === 'classification-pending');
      if (!Number.isFinite(rate) || rate < 0 || rate > 0.2 || unresolved.length) {
        throw new Error('Sales tax is not configured for this menu yet. Please text Rida before ordering.');
      }
      const taxableMerchandise = moneyAmount(ordered.reduce((sum, { dish, tier, qty }) => (
        taxableClasses.has(dish.taxClass) ? sum + (getPrice(dish, tier) * qty) : sum
      ), 0) + (taxableClasses.has(SAUCE_PROGRAM.taxClass) ? sauceCreditSummary(ordered).extraSubtotal : 0));
      const taxableRatio = mealSubtotal > 0 ? Math.min(1, taxableMerchandise / mealSubtotal) : 0;
      const taxableSubtotal = moneyAmount(Math.max(0, taxableMerchandise - (discountAmount * taxableRatio)));
      const taxableDelivery = TAX_POLICY.deliveryMode === 'all-when-any'
        ? (taxableSubtotal > 0 ? moneyAmount(deliveryFee) : 0)
        : TAX_POLICY.deliveryMode === 'none'
          ? 0
          : moneyAmount(Math.max(0, deliveryFee) * taxableRatio);
      return {
        taxableSubtotal,
        taxableDelivery,
        taxRate: rate,
        salesTax: moneyAmount((taxableSubtotal + taxableDelivery) * rate),
      };
    }

    function roundedFoodSubtotal(value) {
      return Math.ceil(moneyAmount(value));
    }

    function orderMinimumReached(mealSubtotal, minimumOrder) {
      return roundedFoodSubtotal(mealSubtotal) >= Number(minimumOrder);
    }

    function amountToOrderMinimum(mealSubtotal, minimumOrder) {
      const lowestQualifyingSubtotal = Number(minimumOrder) - 0.99;
      return Math.max(0, moneyAmount(lowestQualifyingSubtotal - moneyAmount(mealSubtotal)));
    }

    function clearOrderError() {
      const feedback = document.getElementById('orderFeedback');
      if (feedback) feedback.hidden = true;
    }

    function clearFieldError(field) {
      if (!field || !field.classList) return;
      field.classList.remove('error');
      field.removeAttribute('aria-invalid');
    }

    function showOrderError(message, target = null, title = 'Please check your order') {
      const feedback = document.getElementById('orderFeedback');
      if (!feedback) return;
      document.getElementById('orderFeedbackTitle').textContent = title;
      document.getElementById('orderFeedbackMessage').textContent = message;
      feedback.hidden = false;
      if (target) {
        target.classList.add('error');
        target.setAttribute('aria-invalid', 'true');
        target.addEventListener('input', () => {
          clearFieldError(target);
          clearOrderError();
        }, { once: true });
      }
      const focusTarget = target || feedback;
      focusTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
      window.setTimeout(() => focusTarget.focus({ preventScroll: true }), 250);
    }

    function splitFullName(value) {
      const parts = String(value || '').trim().split(/\s+/).filter(Boolean);
      return {
        firstName: parts[0] || '',
        lastName: parts.slice(1).join(' '),
      };
    }

    function browserCookie(name) {
      const match = document.cookie.split(';').map(value => value.trim()).find(value => value.startsWith(`${name}=`));
      if (!match) return '';
      try { return decodeURIComponent(match.slice(name.length + 1)); } catch { return ''; }
    }

    // ════════════════════════════════════════
    // STATE
    // ════════════════════════════════════════
    const cart = {}; // { "dishId:tier": qty }

    function normalizePromoCode(value) {
      return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 32);
    }

    function saveCart() {
      try {
        const saved = Object.fromEntries(Object.entries(cart).filter(([, quantity]) => Number(quantity) > 0));
        window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(saved));
      } catch {
        // A blocked storage API must never interrupt ordering.
      }
    }

    function restoreCart() {
      try {
        const saved = JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) || '{}');
        if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return 0;
        let restoredItems = 0;
        Object.entries(saved).forEach(([key, rawQuantity]) => {
          const [id, storedTier = ''] = String(key).split(':');
          const dish = allDishes().find(item => item.id === id && item.available !== false);
          if (!dish) return;
          const tier = isSingleSize(dish) ? null : storedTier;
          if (!orderOptions(dish).some(option => option === tier)) return;
          const quantity = Math.min(Number(dish.maxQty || MAX_QTY_PER_ITEM), Math.max(0, Math.floor(Number(rawQuantity) || 0)));
          if (!quantity) return;
          cart[cartKey(id, tier)] = quantity;
          restoredItems += quantity;
          const quantityDisplay = document.getElementById(`qty-${id}-${tier || 'single'}`);
          if (quantityDisplay) quantityDisplay.textContent = quantity;
          document.getElementById(`card-${id}`)?.classList.add('has-qty');
        });
        return restoredItems;
      } catch {
        return 0;
      }
    }

    function promotionForCode(value) {
      const code = normalizePromoCode(value);
      if (!code) return null;
      const promotion = (PROMOTIONS.codes || []).find(item =>
        item && item.active !== false && normalizePromoCode(item.code) === code
      );
      if (!promotion) return null;
      if (promotion.expiresIso && Date.now() >= new Date(promotion.expiresIso).getTime()) return null;
      return promotion;
    }

    async function resolvePromotionForCode(value) {
      const local = promotionForCode(value);
      if (local) return local;
      if (!PROMOTIONS.remote) return null;
      const code = normalizePromoCode(value);
      if (!code) return null;
      try {
        const response = await fetch(`/api/referrals?code=${encodeURIComponent(code)}`, {
          headers: { Accept: 'application/json' },
        });
        const result = await response.json().catch(() => ({}));
        return response.ok && result.active ? result.promotion : null;
      } catch {
        return null;
      }
    }

    function discountForPromotion(promotion, mealSubtotal) {
      const minimumOrder = Math.max(MIN_ORDER_TOTAL, Number(promotion && promotion.minimumOrder) || 0);
      if (!promotion || mealSubtotal < minimumOrder) return 0;
      const rawDiscount = promotion.type === 'percent'
        ? mealSubtotal * (Number(promotion.value) / 100)
        : Number(promotion.value);
      const cap = Number(promotion.maxDiscount || rawDiscount);
      return Math.max(0, Math.min(rawDiscount, cap, mealSubtotal));
    }

    function captureAttribution() {
      const params = new URLSearchParams(window.location.search);
      try {
        ATTRIBUTION_KEYS.forEach(key => {
          const value = params.get(key);
          if (value) sessionStorage.setItem(key, value.slice(0, 160));
        });
        GOOGLE_CLICK_KEYS.forEach(key => {
          const value = params.get(key);
          if (value) sessionStorage.setItem(key, value.slice(0, 500));
        });
        GOOGLE_AD_DETAIL_KEYS.forEach(key => {
          const value = params.get(key);
          if (value) sessionStorage.setItem(key, value.slice(0, 160));
        });
        if (GOOGLE_CLICK_KEYS.some(key => params.get(key))) {
          if (!sessionStorage.getItem('utm_source')) sessionStorage.setItem('utm_source', 'google');
          if (!sessionStorage.getItem('utm_medium')) sessionStorage.setItem('utm_medium', 'cpc');
        }
        const ttclid = params.get('ttclid');
        if (ttclid) sessionStorage.setItem('tiktok_ttclid', ttclid.slice(0, 500));
        const referral = params.get('ref') || params.get('promo');
        if (referral) {
          const normalizedReferral = normalizePromoCode(referral);
          sessionStorage.setItem('promo_code', normalizedReferral);
          const isWelcomeOffer = normalizedReferral === 'WELCOME10';
          if (!sessionStorage.getItem('utm_source')) sessionStorage.setItem('utm_source', isWelcomeOffer ? 'offer' : 'referral');
          if (!sessionStorage.getItem('utm_medium')) sessionStorage.setItem('utm_medium', isWelcomeOffer ? 'first_order' : 'partner');
        }
        if (!sessionStorage.getItem('landing_page')) {
          sessionStorage.setItem('landing_page', window.location.href.slice(0, 500));
        }
        if (document.referrer && !sessionStorage.getItem('referrer')) {
          sessionStorage.setItem('referrer', document.referrer.slice(0, 500));
        }
      } catch {
        // Attribution is helpful but must never prevent an order.
      }
    }

    function attributionPayload() {
      const read = key => {
        try { return sessionStorage.getItem(key) || ''; } catch { return ''; }
      };
      const googleClickIdType = GOOGLE_CLICK_KEYS.find(key => read(key)) || '';
      return {
        utmSource: read('utm_source'),
        utmMedium: read('utm_medium'),
        utmCampaign: read('utm_campaign'),
        utmContent: read('utm_content'),
        utmTerm: read('utm_term'),
        landingPage: read('landing_page') || window.location.href,
        referrer: read('referrer') || document.referrer || '',
        tiktokTtclid: read('tiktok_ttclid'),
        tiktokTtp: browserCookie('_ttp'),
        googleClickId: googleClickIdType ? read(googleClickIdType) : '',
        googleClickIdType,
        adMatchType: read('matchtype'),
        adDevice: read('device'),
        adNetwork: read('network'),
      };
    }

    const MENU_SECTIONS = ['exclusives', 'breakfasts', 'addons', 'mains', 'premium', 'desserts'];
    const isSingleSize = dish => dish.category === 'dessert' || dish.category === 'addon';
    const isVariantDish = dish => Array.isArray(dish.variants) && dish.variants.length > 0;

    function orderOptions(dish) {
      if (isVariantDish(dish)) return dish.variants.map(variant => variant.id);
      return isSingleSize(dish) ? [null] : ['lean', 'bulk'];
    }

    function optionLabel(dish, option) {
      if (isVariantDish(dish)) {
        return dish.variants.find(variant => variant.id === option)?.label || option;
      }
      if (isSingleSize(dish)) return dish.category === 'dessert' ? 'Dessert' : 'Add-on';
      return option === 'bulk' ? 'Bulk' : 'Lean';
    }

    function allDishes() {
      return MENU_SECTIONS.flatMap(section => MENU[section] || []);
    }

    function sectionOf(id) {
      for (const sec of MENU_SECTIONS) {
        if ((MENU[sec] || []).some(d => d.id === id)) return sec;
      }
      return '';
    }

    function cartKey(id, tier) {
      return `${id}:${tier || 'single'}`;
    }

    function getQty(id, tier) {
      return cart[cartKey(id, tier)] || 0;
    }

    function getOrderLines() {
      return allDishes().flatMap(dish => {
        return orderOptions(dish)
          .map(tier => ({ dish, tier, qty: getQty(dish.id, tier) }))
          .filter(line => line.qty > 0);
      });
    }

    function sauceChoiceById(id) {
      return (SAUCE_PROGRAM.choices || []).find(choice => choice.id === id);
    }

    function sauceCreditSummary(ordered = getOrderLines()) {
      if (!SAUCE_PROGRAM.enabled) {
        return { totalCredits: 0, reservedCredits: 0, selectableCredits: 0, selectedQty: 0, includedSelected: 0, extraQty: 0, extraSubtotal: 0, reserved: {} };
      }
      return window.PRPD_SAUCE_PROGRAM.quote(sauceSelections, ordered, SAUCE_PROGRAM);
    }

    function saveSauceSelections() {
      if (!SAUCE_PROGRAM.enabled) return;
      try {
        const saved = Object.fromEntries(Object.entries(sauceSelections).filter(([, quantity]) => Number(quantity) > 0));
        window.localStorage.setItem(SAUCE_STORAGE_KEY, JSON.stringify(saved));
      } catch {
        // A blocked storage API must never interrupt ordering.
      }
    }

    function restoreSauceSelections() {
      if (!SAUCE_PROGRAM.enabled) return;
      try {
        const saved = JSON.parse(window.localStorage.getItem(SAUCE_STORAGE_KEY) || '{}');
        if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return;
        const max = Math.max(0, Number(SAUCE_PROGRAM.maxExtraCups) || 50) + 250;
        Object.entries(saved).forEach(([id, rawQuantity]) => {
          if (!sauceChoiceById(id)) return;
          sauceSelections[id] = Math.min(max, Math.max(0, Math.floor(Number(rawQuantity) || 0)));
        });
      } catch {
        // Ignore unavailable or malformed local storage.
      }
    }

    function sauceSwatchColor(id) {
      return ({
        'smoky-bbq': '#713f28',
        'sweet-heat': '#d8755c',
        'green-jalapeno-yogurt': '#8ba773',
        'golden-honey-mustard': '#d5aa45',
      })[id] || '#d8c49a';
    }

    function renderSauceSelector() {
      const selector = document.getElementById('sauceSelector');
      const note = document.getElementById('sauceProgramNote');
      if (!selector || !note) return;
      const hasFood = getOrderLines().length > 0;
      selector.hidden = !SAUCE_PROGRAM.enabled || !hasFood;
      note.hidden = true;
      if (!SAUCE_PROGRAM.enabled) return;
      if (!hasFood) {
        Object.keys(sauceSelections).forEach(id => delete sauceSelections[id]);
        saveSauceSelections();
        return;
      }

      const quote = sauceCreditSummary();
      const choices = SAUCE_PROGRAM.choices || [];
      const grid = document.getElementById('sauceChoiceGrid');
      grid.innerHTML = choices.map(choice => `<div class="sauce-choice">
        ${choice.image ? `<img class="sauce-choice__image" src="${choice.image}" alt="${choice.name}${choice.imageStatus === 'concept' ? ', concept image' : ''}" width="80" height="80">` : `<span class="sauce-choice__swatch" style="--sauce-color:${sauceSwatchColor(choice.id)}" aria-hidden="true"></span>`}
        <span class="sauce-choice__copy"><strong>${choice.name}</strong><span>${Number(SAUCE_PROGRAM.servingGrams) || 45} g${choice.imageStatus === 'concept' ? ' · Concept image' : ''}</span>${choice.allergens ? `<span class="sauce-choice__allergens">${escapeMealDetail(choice.allergens)}</span>` : ''}${choice.customerIngredients ? `<span class="sauce-choice__ingredients">${escapeMealDetail(choice.customerIngredients)}</span>` : ''}</span>
        <span class="qty-ctrl">
          <button type="button" class="qty-btn sauce-qty-btn" data-sauce-id="${choice.id}" data-sauce-delta="-1" aria-label="Remove one ${choice.name} sauce cup">−</button>
          <span class="qty-val" id="sauce-qty-${choice.id}">${sauceSelections[choice.id] || 0}</span>
          <button type="button" class="qty-btn sauce-qty-btn" data-sauce-id="${choice.id}" data-sauce-delta="1" aria-label="Add one ${choice.name} sauce cup">+</button>
        </span>
      </div>`).join('');

      const status = document.getElementById('sauceCreditStatus');
      const extraStatus = document.getElementById('sauceExtraStatus');
      const meter = status.closest('.sauce-selector__meter');
      status.textContent = `${quote.includedSelected} of ${quote.totalCredits} free cups selected`;
      extraStatus.textContent = quote.extraQty > 0
        ? `${quote.extraQty} extra ${quote.extraQty === 1 ? 'cup' : 'cups'} · $${quote.extraSubtotal.toFixed(2)}`
        : `Then $${Number(SAUCE_PROGRAM.extraPrice).toFixed(2)} each`;
      meter.classList.toggle('is-extra', quote.extraQty > 0);

      const reservedNote = document.getElementById('sauceReservedNote');
      reservedNote.hidden = true;
      document.getElementById('sauceAllowanceCopy').textContent = `Choose up to ${quote.totalCredits} free cups with your order. More are $${Number(SAUCE_PROGRAM.extraPrice).toFixed(2)} each.`;
    }

    function changeSauceQty(id, delta) {
      if (!SAUCE_PROGRAM.enabled || !sauceChoiceById(id)) return;
      clearOrderError();
      const quote = sauceCreditSummary();
      const maxSelected = quote.selectableCredits + Math.max(0, Number(SAUCE_PROGRAM.maxExtraCups) || 50);
      const current = Number(sauceSelections[id]) || 0;
      if (delta > 0 && quote.selectedQty >= maxSelected) return;
      sauceSelections[id] = Math.max(0, current + delta);
      saveSauceSelections();
      renderSauceSelector();
      updateSummary();
    }

    function selectedSaucePayload() {
      if (!SAUCE_PROGRAM.enabled) return [];
      return (SAUCE_PROGRAM.choices || []).map(choice => ({
        id: choice.id,
        qty: Number(sauceSelections[choice.id]) || 0,
      })).filter(selection => selection.qty > 0);
    }

    function currentFinalSauceSelections(quote = sauceCreditSummary()) {
      return (SAUCE_PROGRAM.choices || []).map(choice => ({
        id: choice.id,
        name: choice.name,
        qty: (Number(sauceSelections[choice.id]) || 0) + (Number(quote.reserved[choice.id]) || 0),
      })).filter(selection => selection.qty > 0);
    }

    function macroChipsHtml(m) {
      const chip = (val, label, unit) =>
        val > 0 ? `<span class="macro-chip">${val}${unit} ${label}</span>` : '';
      return chip(m.cal, 'Cal', '') + chip(m.protein, 'Protein', 'g') +
             chip(m.carbs, 'Carbs', 'g') + chip(m.fiber, 'Fiber', 'g') + chip(m.fat, 'Fats', 'g');
    }

    function getPrice(dish, tier) {
      if (isVariantDish(dish)) {
        const variantPrice = dish.variants.find(variant => variant.id === tier)?.price;
        if (Number.isFinite(Number(variantPrice))) return Number(variantPrice);
      }
      if (Number.isFinite(Number(dish.price))) return Number(dish.price);
      const priceTier = isSingleSize(dish) ? 'single' : tier;
      const archive = window.PRPD_ORDER_CONFIG?.publishedArchive;
      const prices = !IS_MENU_PUBLISHED && (archive?.published === true || archive?.batch?.published === true)
        ? archive.prices || PRICES : PRICES;
      return prices[dish.category][priceTier];
    }

    function getDishPhoto(dish) {
      return dish.image || '';
    }

    function placeholderLabel(dish, section) {
      if (section === 'exclusives') return 'Weekly exclusive';
      if (section === 'breakfasts') return 'Breakfast';
      if (section === 'desserts') return 'High-protein dessert';
      if (section === 'addons') return 'Grab & go';
      if (dish.displayCategory) return dish.displayCategory;
      if (dish.category === 'beef') return 'Beef';
      if (dish.category === 'premium') return 'Premium meal';
      return 'High-protein meal';
    }

    function photoPlaceholderHtml(dish, section) {
      return `<div class="dish-photo-placeholder" data-placeholder-section="${section}">
        <span class="dish-photo-placeholder__brand">PRPD</span>
        <span class="dish-photo-placeholder__status">Fresh photo coming soon</span>
        <strong>${dish.name}</strong>
        <span class="dish-photo-placeholder__type">${placeholderLabel(dish, section)}</span>
      </div>`;
    }

    function photoOverlayHtml(dish, section) {
      return `<div class="dish-photo-overlay">
        <span class="dish-photo-overlay__brand">PRPD</span>
        <div class="dish-photo-overlay__copy">
          <span class="dish-photo-overlay__type">${placeholderLabel(dish, section)}</span>
          <strong>${dish.name}</strong>
        </div>
      </div>`;
    }

    function handleDishPhotoError(image) {
      image.hidden = true;
    }

    function escapeMealDetail(value) {
      return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
    }

    function cardAllergenNames(declaration) {
      const match = String(declaration || '').trim().match(/^CONTAINS:\s*(.*?)\.?$/i);
      if (!match) return null;
      const names = match[1].split(',').map(name => name.trim());
      if (names.some(name => !name)) return null;
      return [...new Set(names.map(name => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()))].sort();
    }

    function cardAllergenBadgesHtml(dishId) {
      const detail = MENU_DETAILS_BY_BATCH[String(displayedMenuBatchNumber)]?.[dishId];
      const pending = '<p class="dish-allergen-note">Allergen details pending. Contact us before ordering.</p>';
      if (!detail) return pending;
      const badge = (label, names, note = '') => `<span class="dish-allergen-badge"><strong>${escapeMealDetail(label)}</strong> ${escapeMealDetail(names.join(', '))}${note ? ` <span class="dish-allergen-badge__note">${escapeMealDetail(note)}</span>` : ''}</span>`;
      if (detail.type === 'bundle') {
        const variants = Object.values(detail.variants || {});
        if (!variants.length || variants.some(variant => !Array.isArray(variant?.components) || !variant.components.length)) return pending;
        const statements = variants.flatMap(variant => variant.components.map(component => cardAllergenNames(component?.allergens)));
        if (statements.some(names => !names)) return pending;
        const names = [...new Set(statements.flat())].sort();
        return `<div class="dish-allergens">${badge('Bundle allergens:', names, '· varies by selection')}</div>`;
      }
      const tiers = Object.entries(detail.tiers || {}).map(([key, tier]) => ({
        label: key === 'lean' ? 'Lean' : key === 'bulk' ? 'Bulk' : tier?.label || key,
        names: cardAllergenNames(tier?.allergens),
      }));
      if (!tiers.length || tiers.some(tier => !tier.names)) return pending;
      const shared = tiers.every(tier => tier.names.join(',') === tiers[0].names.join(','));
      return `<div class="dish-allergens">${shared
        ? badge('Contains:', tiers[0].names)
        : tiers.map(tier => badge(`${tier.label} · Contains:`, tier.names)).join('')}</div>`;
    }

    function detailNutritionHtml(nutrition = {}) {
      const rows = [
        ['Calories', nutrition.calories, ''],
        ['Protein', nutrition.protein, 'g'],
        ['Carbs', nutrition.carbs, 'g'],
        ['Fiber', nutrition.fiber, 'g'],
        ['Total fat', nutrition.fat, 'g'],
        ['Saturated fat', nutrition.satFat, 'g'],
        ['Total sugars', nutrition.sugars, 'g'],
        ['Sodium', nutrition.sodium, 'mg'],
        ['Cholesterol', nutrition.cholesterol, 'mg'],
      ].filter(([, value]) => Number.isFinite(Number(value)));
      return `<div class="meal-detail-nutrition" aria-label="Nutrition facts">${rows.map(([label, value, unit], index) => `
        <div class="meal-detail-nutrient${index < 5 ? ' is-primary' : ''}">
          <span>${escapeMealDetail(label)}</span><strong>${escapeMealDetail(value)}${unit}</strong>
        </div>`).join('')}</div>`;
    }

    function detailFactsHtml(detail, tier) {
      const freezerFriendly = detail.storageMode === 'freezer';
      const storage = freezerFriendly
        ? 'Freezer-friendly. Freeze when delivered for later-week meals, then thaw overnight in the refrigerator.'
        : 'Keep refrigerated and follow the use-by date on the meal label.';
      return `
        <section class="meal-detail-section meal-detail-allergen">
          <span>Major allergens</span>
          <strong>${escapeMealDetail(tier.allergens || 'No major allergen declaration is available.')}</strong>
          ${tier.allergenAdvisory ? `<p class="meal-detail-allergen__advisory">${escapeMealDetail(tier.allergenAdvisory)}</p>` : ''}
        </section>
        <section class="meal-detail-section">
          <div class="meal-detail-section__head"><h3>Nutrition</h3>${tier.netWeight ? `<span>${escapeMealDetail(tier.netWeight)}</span>` : ''}</div>
          ${detailNutritionHtml(tier.nutrition)}
          ${tier.nutritionBasis ? `<p>${escapeMealDetail(tier.nutritionBasis)}</p>` : ''}
        </section>
        <section class="meal-detail-section">
          <h3>Ingredients</h3>
          <p>${escapeMealDetail(tier.ingredients || 'Ingredient statement pending final recipe review.')}</p>
        </section>
        <div class="meal-detail-fact-grid">
          <section class="meal-detail-section">
            <h3>${freezerFriendly ? 'Freezer-friendly' : 'Storage'}</h3>
            <p>${escapeMealDetail(storage)}</p>
          </section>
          <section class="meal-detail-section">
            <h3>Reheating</h3>
            <p>${escapeMealDetail(detail.reheat || 'Follow the reheating directions on the meal label.')}</p>
          </section>
        </div>`;
    }

    function renderMealDetail(detail, tierKey) {
      const tabs = document.getElementById('mealDetailTabs');
      const content = document.getElementById('mealDetailContent');
      const tiers = Object.entries(detail.tiers || {});
      const selected = detail.tiers?.[tierKey] ? tierKey : tiers[0]?.[0];
      tabs.hidden = tiers.length < 2;
      tabs.innerHTML = tiers.map(([key, tier]) => `<button type="button" role="tab" data-meal-detail-tier="${escapeMealDetail(key)}" aria-selected="${key === selected}">${escapeMealDetail(tier.label || key)}</button>`).join('');
      content.innerHTML = selected ? detailFactsHtml(detail, detail.tiers[selected]) : '<p>Meal details are being verified.</p>';
    }

    function renderBundleDetail(detail, variantId) {
      const tabs = document.getElementById('mealDetailTabs');
      const content = document.getElementById('mealDetailContent');
      const variants = Object.entries(detail.variants || {});
      const selected = detail.variants?.[variantId] ? variantId : variants[0]?.[0];
      tabs.hidden = variants.length < 2;
      tabs.innerHTML = variants.map(([key, variant]) => `<button type="button" role="tab" data-meal-detail-variant="${escapeMealDetail(key)}" aria-selected="${key === selected}">${escapeMealDetail(variant.label)}</button>`).join('');
      const variant = detail.variants?.[selected];
      content.innerHTML = variant ? `
        <p class="meal-detail-bundle-note">Nutrition and allergens are shown per individual meal in this five-meal bundle.</p>
        <div class="meal-detail-components">${variant.components.map(component => `
          <article class="meal-detail-component">
            <header><div><span>${escapeMealDetail(component.qty)} meals</span><h3>${escapeMealDetail(component.name)}</h3></div><strong>${escapeMealDetail(component.label || component.tier)}</strong></header>
            ${detailFactsHtml(component, component)}
          </article>`).join('')}</div>` : '<p>Bundle details are being verified.</p>';
    }

    function openMealDetail(dishId, trigger) {
      const dialog = document.getElementById('mealDetailDialog');
      const details = MENU_DETAILS_BY_BATCH[String(displayedMenuBatchNumber)]?.[dishId];
      if (!dialog || !details) return;
      lastMealDetailTrigger = trigger || null;
      dialog.dataset.detailDish = dishId;
      dialog.dataset.detailType = details.type;
      document.getElementById('mealDetailTitle').textContent = details.name;
      document.getElementById('mealDetailDescription').textContent = details.description || '';
      document.getElementById('mealDetailEyebrow').textContent = details.type === 'bundle' ? 'Weekly Five details' : 'Meal details';
      if (details.type === 'bundle') renderBundleDetail(details);
      else renderMealDetail(details, details.tiers?.lean ? 'lean' : Object.keys(details.tiers || {})[0]);
      document.body.classList.add('meal-detail-open');
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
      document.getElementById('mealDetailClose').focus({ preventScroll: true });
    }

    function closeMealDetail() {
      const dialog = document.getElementById('mealDetailDialog');
      if (!dialog?.hasAttribute('open')) return;
      if (typeof dialog.close === 'function') dialog.close();
      else dialog.removeAttribute('open');
      document.body.classList.remove('meal-detail-open');
      lastMealDetailTrigger?.focus?.({ preventScroll: true });
    }

    function initMealDetails() {
      const dialog = document.getElementById('mealDetailDialog');
      const close = document.getElementById('mealDetailClose');
      if (!dialog || !close) return;
      close.addEventListener('click', closeMealDetail);
      dialog.addEventListener('click', event => {
        if (event.target === dialog) closeMealDetail();
      });
      dialog.addEventListener('close', () => {
        document.body.classList.remove('meal-detail-open');
      });
      document.addEventListener('click', event => {
        const trigger = event.target.closest('[data-open-meal-details]');
        if (trigger) {
          openMealDetail(trigger.dataset.openMealDetails, trigger);
          return;
        }
        const tierTab = event.target.closest('[data-meal-detail-tier]');
        const variantTab = event.target.closest('[data-meal-detail-variant]');
        const details = MENU_DETAILS_BY_BATCH[String(displayedMenuBatchNumber)]?.[dialog.dataset.detailDish];
        if (tierTab && details?.type === 'meal') renderMealDetail(details, tierTab.dataset.mealDetailTier);
        if (variantTab && details?.type === 'bundle') renderBundleDetail(details, variantTab.dataset.mealDetailVariant);
      });
      document.addEventListener('keydown', event => {
        const trigger = event.target.closest('.dish-img[data-open-meal-details]');
        if (!trigger || !['Enter', ' '].includes(event.key)) return;
        event.preventDefault();
        openMealDetail(trigger.dataset.openMealDetails, trigger);
      });
    }

    function tierOrderRowHtml(dish, tier) {
      const effectiveTier = isSingleSize(dish) ? null : tier;
      const macros = effectiveTier === 'bulk' && dish.bulkMacros ? dish.bulkMacros : dish.macros;
      const label = dish.category === 'dessert' ? 'Dessert' : dish.category === 'addon' ? 'Add-on' : (tier === 'bulk' ? 'Bulk' : 'Lean');
      const price = getPrice(dish, effectiveTier);
      const keySuffix = effectiveTier || 'single';
      const fiber = macros.fiber > 0 ? ` &middot; ${macros.fiber}g fiber` : '';
      const nutrition = `<span><strong>${macros.cal}</strong> Calories &middot; <strong>${macros.protein}g</strong> Protein</span>
           <span>${macros.carbs}g Carbs &middot; ${macros.fat}g Fat${fiber}</span>`;
      return `<div class="tier-order-row" data-order-tier="${keySuffix}">
        <div class="tier-order-info">
          <strong>${label} &middot; $${price.toFixed(2)}</strong>
          ${nutrition}
        </div>
        <div class="qty-ctrl">
          <button class="qty-btn" data-dish-id="${dish.id}" data-order-tier="${keySuffix}" data-qty-delta="-1" aria-label="Remove one ${label.toLowerCase()} ${dish.name}">−</button>
          <span class="qty-val" id="qty-${dish.id}-${keySuffix}">0</span>
          <button class="qty-btn" data-dish-id="${dish.id}" data-order-tier="${keySuffix}" data-qty-delta="1" aria-label="Add one ${label.toLowerCase()} ${dish.name}">+</button>
        </div>
      </div>`;
    }

    function variantOrderRowHtml(dish, variant) {
      const price = getPrice(dish, variant.id);
      const servingCount = Number(dish.servingCount) || 5;
      const compareAtPrice = Number(variant.compareAtPrice);
      const savings = Number.isFinite(compareAtPrice) && compareAtPrice > price
        ? Math.round((compareAtPrice - price) * 100) / 100
        : 0;
      const savingsLabel = savings > 0
        ? `<span class="bundle-savings">Save $${Number.isInteger(savings) ? savings.toFixed(0) : savings.toFixed(2)}</span>`
        : '';
      return `<div class="tier-order-row tier-order-row--variant" data-order-tier="${variant.id}">
        <div class="tier-order-info">
          <strong>${variant.label}</strong>
          ${variant.detail ? `<span>${variant.detail}</span>` : ''}
          <span><strong>${servingCount} meals</strong> &middot; $${price.toFixed(2)} total ${savingsLabel}</span>
        </div>
        <div class="qty-ctrl">
          <button class="qty-btn" data-dish-id="${dish.id}" data-order-tier="${variant.id}" data-qty-delta="-1" aria-label="Remove one ${dish.name}, ${variant.label}">−</button>
          <span class="qty-val" id="qty-${dish.id}-${variant.id}">0</span>
          <button class="qty-btn" data-dish-id="${dish.id}" data-order-tier="${variant.id}" data-qty-delta="1" aria-label="Add one ${dish.name}, ${variant.label}">+</button>
        </div>
      </div>`;
    }

    function bundleOrderGroupsHtml(dish) {
      const groups = new Map();
      dish.variants.forEach(variant => {
        const tier = variant.components?.[0]?.tier || String(variant.id).split('-')[0] || 'lean';
        if (!groups.has(tier)) groups.set(tier, []);
        groups.get(tier).push(variant);
      });
      return `<div class="bundle-choice-groups">${Array.from(groups.entries()).map(([tier, variants]) => {
        const first = variants[0];
        const price = getPrice(dish, first.id);
        const compareAtPrice = Number(first.compareAtPrice);
        const savings = Number.isFinite(compareAtPrice) && compareAtPrice > price
          ? Math.round((compareAtPrice - price) * 100) / 100
          : 0;
        const savingsLabel = savings > 0
          ? `<span class="bundle-savings">Save $${Number.isInteger(savings) ? savings.toFixed(0) : savings.toFixed(2)}</span>`
          : '';
        return `<section class="bundle-choice-group" aria-label="${tier} Weekly Five options">
          <div class="bundle-choice-group__head">
            <div><strong>${tier === 'bulk' ? 'Bulk' : 'Lean'}</strong><span>${Number(dish.servingCount) || 5} meals</span></div>
            <div><strong>$${price.toFixed(2)}</strong>${savingsLabel}</div>
          </div>
          <div class="bundle-choice-group__options">${variants.map(variant => {
            const mixLabel = variant.label.replace(/^(Lean|Bulk):\s*/i, '');
            return `<div class="bundle-choice-row" data-order-tier="${variant.id}">
              <span>${mixLabel}</span>
              <div class="qty-ctrl">
                <button class="qty-btn" data-dish-id="${dish.id}" data-order-tier="${variant.id}" data-qty-delta="-1" aria-label="Remove one ${dish.name}, ${variant.label}">−</button>
                <span class="qty-val" id="qty-${dish.id}-${variant.id}">0</span>
                <button class="qty-btn" data-dish-id="${dish.id}" data-order-tier="${variant.id}" data-qty-delta="1" aria-label="Add one ${dish.name}, ${variant.label}">+</button>
              </div>
            </div>`;
          }).join('')}</div>
        </section>`;
      }).join('')}</div>`;
    }

    // ════════════════════════════════════════
    // RENDER
    // ════════════════════════════════════════
    function photoCropClass(dish) {
      // Reusable composition presets, not weekly dish IDs. External CSS respects CSP.
      return ['portrait-low', 'portrait-low-soft', 'portrait-low-wide', 'portrait-center', 'portrait-tight', 'landscape-low', 'landscape-tight', 'landscape-closer', 'landscape-tikka-close', 'square-raised', 'square-low', 'rotate-180'].includes(dish.imageCrop)
        ? `photo-crop--${dish.imageCrop}` : '';
    }

    function renderMenu() {
      const publishedArchive = window.PRPD_ORDER_CONFIG?.publishedArchive;
      const hasPublishedArchive = !IS_MENU_PUBLISHED
        && Boolean(publishedArchive?.menu)
        && (publishedArchive?.published === true || publishedArchive?.batch?.published === true);
      if (!IS_MENU_PUBLISHED && !hasPublishedArchive) {
        document.getElementById('batchMeta').textContent = 'Fresh weekly menu opens every Monday.';
        document.getElementById('orderCutoff').textContent = 'See this week\'s published cutoff';
        document.getElementById('successDelivery').textContent = '';
        MENU_SECTIONS.forEach(section => {
          document.getElementById('grid-' + section).replaceChildren();
        });
        return;
      }
      if (hasPublishedArchive) {
        MENU_SECTIONS.forEach(section => {
          MENU[section] = Array.isArray(publishedArchive.menu[section]) ? publishedArchive.menu[section] : [];
        });
      }
      const displayBatch = hasPublishedArchive ? (publishedArchive.batch || {}) : BATCH;
      displayedMenuBatchNumber = displayBatch.number || BATCH.number;
      const displayDeliveryDate = displayBatch.deliveryDate || BATCH.deliveryDate || 'weekly delivery';
      const displayDeliveryDay = String(displayDeliveryDate).split(',')[0].trim();
      const browseOnly = isOrderingClosed();
      document.getElementById('batchMeta').textContent = browseOnly
        ? `Recent published menu${displayBatch.number ? ` · Batch ${displayBatch.number}` : ''}`
        : `Batch ${displayBatch.number}  ·  Delivery ${displayDeliveryDate}`;
      document.getElementById('orderCutoff').textContent = browseOnly
        ? 'Ordering closed'
        : displayBatch.cutoffLabel;
      document.getElementById('successDelivery').textContent = displayDeliveryDate;
      document.getElementById('activeDeliveryDay').textContent = `${displayDeliveryDay} delivery`;
      document.getElementById('closedDeliveryCopy').textContent = `${displayDeliveryDay} delivery`;
      document.getElementById('closedDeliveryDay').textContent = displayDeliveryDay;

      MENU_SECTIONS.forEach(section => {
        const grid = document.getElementById('grid-' + section);
        const dishes = MENU[section] || [];
        const menuLink = document.querySelector(`.menu-jump a[data-menu-section="${section}"]`);
        if (menuLink) menuLink.hidden = dishes.length === 0;
        grid.innerHTML = dishes.map(dish => {
          const available = dish.available !== false;
          const defaultPhoto = getDishPhoto(dish);
          const orderRows = !available
            ? '<div class="sold-out-note">Sold out for this batch</div>'
            : isVariantDish(dish)
              ? bundleOrderGroupsHtml(dish)
            : isSingleSize(dish)
              ? tierOrderRowHtml(dish, null)
              : tierOrderRowHtml(dish, 'lean') + tierOrderRowHtml(dish, 'bulk');
          const displayRows = browseOnly
            ? orderRows.replace(/<div class="qty-ctrl">[\s\S]*?<\/div>/g, '')
            : orderRows;
          return `
            <div class="dish-card${available ? '' : ' is-unavailable'}${defaultPhoto ? '' : ' no-photo'}${dish.category === 'addon' ? ' is-addon' : ''}${isVariantDish(dish) ? ' is-exclusive' : ''}${browseOnly ? ' is-browse-only' : ''}" id="card-${dish.id}" data-menu-dish="${dish.id}">
              <div class="dish-img" role="button" tabindex="0" data-open-meal-details="${dish.id}" aria-label="View ingredients, allergens and nutrition for ${dish.name}">
                ${defaultPhoto ? '<div class="dish-img__bg"><span>PRPD</span></div>' : photoPlaceholderHtml(dish, section)}
                ${dish.laterWeek ? '<span class="later-week-badge">Freezer-friendly</span>' : ''}
                ${dish.newThisWeek ? '<span class="new-this-week-badge">New this week</span>' : ''}
                ${defaultPhoto ? `<img id="dish-photo-${dish.id}" class="${[dish.imageTone ? `dish-photo--${dish.imageTone}` : '', photoCropClass(dish)].filter(Boolean).join(' ')}" src="${defaultPhoto}" alt="${dish.name}" loading="lazy" />` : ''}
                ${defaultPhoto ? photoOverlayHtml(dish, section) : ''}
              </div>
              <div class="dish-body">
                <div class="dish-name dish-name--sr">${dish.name}</div>
                ${dish.description ? `<p class="dish-desc">${dish.description}</p>` : ''}
                ${cardAllergenBadgesHtml(dish.id)}
                <button type="button" class="meal-detail-trigger" data-open-meal-details="${dish.id}" aria-label="View ingredients, allergens and nutrition for ${dish.name}">
                  <span>Ingredients, allergens &amp; facts</span><span aria-hidden="true">&rsaquo;</span>
                </button>
                <div class="tier-order-list">${displayRows}</div>
              </div>
            </div>`;
        }).join('');
      });
    }

    function initMenuFilters() {
      const bar = document.getElementById('menuFilterBar');
      const empty = document.getElementById('menuFilterEmpty');
      if (!bar || !empty) return;
      const archive = window.PRPD_ORDER_CONFIG?.publishedArchive;
      const canBrowseMenu = IS_MENU_PUBLISHED || (Boolean(archive?.menu)
        && (archive.published === true || archive.batch?.published === true));

      const buttons = Array.from(bar.querySelectorAll('[data-menu-filter]'));
      const sections = MENU_SECTIONS
        .map(section => document.getElementById(`menu-${section}`))
        .filter(Boolean);

      function qualifies(dish, filter) {
        if (isVariantDish(dish)) return filter === 'all' || (filter === 'freezer' && dish.laterWeek === true);
        if (filter === 'lean-high-protein') return Boolean(dish.bulkMacros) && Number(dish.macros?.protein) >= 50;
        if (filter === 'lean-under-550') return Boolean(dish.bulkMacros) && Number(dish.macros?.cal) < 550;
        if (filter === 'bulk-high-protein') return Boolean(dish.bulkMacros) && Number(dish.bulkMacros?.protein) >= 65;
        if (filter === 'freezer') return dish.laterWeek === true;
        return true;
      }

      function applyFilter(filter) {
        let visibleCount = 0;
        MENU_SECTIONS.forEach(sectionName => {
          const section = document.getElementById(`menu-${sectionName}`);
          const dishes = Array.isArray(MENU[sectionName]) ? MENU[sectionName] : [];
          let sectionCount = 0;
          dishes.forEach(dish => {
            const card = document.getElementById(`card-${dish.id}`);
            if (!card) return;
            const visible = qualifies(dish, filter);
            card.hidden = !visible;
            if (visible) {
              sectionCount += 1;
              visibleCount += 1;
            }
          });
          if (section) section.hidden = sectionCount === 0;
        });
        empty.hidden = visibleCount > 0 || !canBrowseMenu;
      }

      buttons.forEach(button => {
        button.addEventListener('click', () => {
          const filter = button.dataset.menuFilter || 'all';
          buttons.forEach(option => {
            const active = option === button;
            option.classList.toggle('is-active', active);
            option.setAttribute('aria-pressed', String(active));
          });
          applyFilter(filter);
          if (typeof window.trackPrpdFunnelEvent === 'function') {
            window.trackPrpdFunnelEvent('menu_filter', { detail: filter, repeatable: true });
          }
        });
      });

      if (!canBrowseMenu) {
        bar.hidden = true;
        sections.forEach(section => { section.hidden = true; });
        return;
      }
      applyFilter('all');

      document.addEventListener('click', event => {
        const card = event.target.closest('[data-menu-dish]');
        if (!card || typeof window.trackPrpdFunnelEvent !== 'function') return;
        window.trackPrpdFunnelEvent('meal_engaged', {
          detail: card.dataset.menuDish || 'unknown-meal',
          repeatable: true,
        });
      });
    }

    function initMenuNavigation() {
      const links = new Map(
        Array.from(document.querySelectorAll('.menu-jump a[data-menu-section]'))
          .map(link => [link.dataset.menuSection, link])
      );
      const sections = MENU_SECTIONS
        .map(section => document.getElementById(`menu-${section}`))
        .filter(Boolean);

      function setActiveSection(section) {
        links.forEach((link, key) => {
          const active = key === section;
          link.classList.toggle('is-active', active);
          if (active) {
            link.setAttribute('aria-current', 'location');
            const nav = link.parentElement;
            const targetLeft = link.offsetLeft - ((nav.clientWidth - link.offsetWidth) / 2);
            nav.scrollTo({ left: Math.max(0, targetLeft), behavior: 'smooth' });
          } else {
            link.removeAttribute('aria-current');
          }
        });
      }

      links.forEach((link, section) => {
        link.addEventListener('click', () => setActiveSection(section));
      });

      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => {
          const visible = entries
            .filter(entry => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
          if (visible) setActiveSection(visible.target.id.replace('menu-', ''));
        }, { rootMargin: '-28% 0px -58% 0px', threshold: [0, 0.08, 0.2] });
        sections.forEach(section => observer.observe(section));
      }

      const firstConfiguredSection = MENU_SECTIONS.find(section => (MENU[section] || []).length > 0) || 'breakfasts';
      setActiveSection(firstConfiguredSection);
    }

    function isOrderingClosed() {
      if (!IS_MENU_PUBLISHED) return true;
      const cutoff = new Date(BATCH.cutoffIso);
      return !Number.isNaN(cutoff.getTime()) && Date.now() >= cutoff.getTime();
    }

    function applyOrderAvailability() {
      const closed = isOrderingClosed();
      const publishedArchive = window.PRPD_ORDER_CONFIG?.publishedArchive;
      const hasPublishedArchive = !IS_MENU_PUBLISHED
        && Boolean(publishedArchive?.menu)
        && (publishedArchive?.published === true || publishedArchive?.batch?.published === true);
      const browseMenuAvailable = closed && (IS_MENU_PUBLISHED || hasPublishedArchive);
      const orderForm = document.getElementById('orderForm');
      orderForm.hidden = closed && !browseMenuAvailable;
      orderForm.classList.toggle('order-layout--browse', browseMenuAvailable);
      document.body.classList.toggle('is-ordering-closed', closed);
      document.body.classList.toggle('is-menu-browse-only', browseMenuAvailable);
      const pageTitle = document.getElementById('orderPageTitle');
      if (pageTitle) pageTitle.textContent = browseMenuAvailable ? 'Browse Our Recent Menu' : closed ? 'Next Menu Coming Soon' : 'Place Your Order';
      const closedTitle = document.getElementById('closedMenuTitle');
      const closedDescription = document.getElementById('closedMenuDescription');
      const closedEyebrow = document.getElementById('closedMenuEyebrow');
      const browseLink = document.getElementById('browseRecentMenuLink');
      if (closedTitle) closedTitle.textContent = browseMenuAvailable ? 'Ordering is closed for this week. Browse our recent menu.' : 'Our next menu is coming soon.';
      if (closedDescription) closedDescription.textContent = browseMenuAvailable
        ? 'Explore our recent dishes, photos and prices below. This menu is for browsing only. Text MENU below to hear when ordering opens.'
        : 'The next menu is being prepared. Text MENU below to hear when ordering opens.';
      if (closedEyebrow) closedEyebrow.textContent = browseMenuAvailable ? 'Recent menu · Browse only' : 'Ordering is currently closed';
      if (browseLink) browseLink.hidden = !browseMenuAvailable;
      document.getElementById('orderClosed').classList.toggle('visible', closed);
      document.getElementById('mobileCartBar').hidden = closed || getOrderLines().length === 0;
      if (closed) {
        document.querySelectorAll('.qty-btn, .sauce-qty-btn, #promoCode, #applyPromoBtn, #placeOrderBtn, #mobileCartReview, .fulfillment-option')
          .forEach(control => { control.disabled = true; });
      }
      return closed;
    }

    function createOrderId() {
      const dateStamp = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Chicago',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date()).replace(/-/g, '');
      const randomBytes = new Uint8Array(4);
      crypto.getRandomValues(randomBytes);
      const suffix = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('').toUpperCase();
      return `PRPD-B${BATCH.number}-${dateStamp}-${suffix}`;
    }

    function renderOrderConfirmation(orderLines, mealSubtotal, deliveryFee, discountAmount, salesTax, roundedTotal, orderId, promoCode, confirmedFulfillment = fulfillmentMethod, confirmedSauces = null) {
      document.getElementById('successOrderId').textContent = orderId;
      document.getElementById('successOrderItems').innerHTML = orderLines.map(({ dish, tier, qty }) => {
        const tierLabel = isVariantDish(dish)
          ? ` (${optionLabel(dish, tier)})`
          : isSingleSize(dish)
            ? ''
            : ` (${tier === 'bulk' ? 'Bulk' : 'Lean'})`;
        const subtotal = qty * getPrice(dish, tier);
        return `<div class="success-order__item"><span>${qty}&times; ${dish.name}${tierLabel}</span><strong>$${subtotal.toFixed(2)}</strong></div>`;
      }).join('');
      const sauceQuote = sauceCreditSummary(orderLines);
      const sauceSummary = confirmedSauces || {
        selections: currentFinalSauceSelections(sauceQuote),
        extraQty: sauceQuote.extraQty,
        extraSubtotal: sauceQuote.extraSubtotal,
      };
      document.getElementById('successSauceItems').innerHTML = SAUCE_PROGRAM.enabled && sauceSummary.selections?.length
        ? `<div class="success-order__item"><span>Separate sauce cups</span><strong>${sauceSummary.selections.map(item => `${item.qty} ${item.name}`).join(' · ')}</strong></div>${Number(sauceSummary.extraQty) > 0 ? `<div class="success-order__item"><span>Extra sauce cups</span><strong>$${Number(sauceSummary.extraSubtotal).toFixed(2)}</strong></div>` : ''}`
        : '';
      document.getElementById('successSubtotal').textContent = '$' + mealSubtotal.toFixed(2);
      document.getElementById('successDeliveryFee').textContent = deliveryFee > 0 ? '$' + deliveryFee.toFixed(2) : 'Free';
      const isPickup = confirmedFulfillment === 'pickup';
      document.getElementById('successFulfillmentFeeLabel').textContent = isPickup ? 'Pickup' : 'Delivery';
      document.getElementById('successScheduleLabel').textContent = isPickup ? 'Pickup week' : 'Delivery';
      document.getElementById('successFulfillmentText').textContent = isPickup
        ? `Rida will confirm payment, the ${PICKUP_CITY} pickup address, and your pickup window by text shortly.`
        : `Rida will confirm payment and ${DELIVERY_DAY} delivery by text shortly.`;
      document.getElementById('successDiscountRow').hidden = discountAmount <= 0;
      document.getElementById('successDiscountCode').textContent = promoCode ? `(${promoCode})` : '';
      document.getElementById('successDiscount').textContent = '-$' + discountAmount.toFixed(2);
      document.getElementById('successSalesTaxRow').hidden = salesTax <= 0;
      document.getElementById('successSalesTax').textContent = '$' + salesTax.toFixed(2);
      document.getElementById('successTotal').textContent = '$' + roundedTotal.toFixed(2);
      document.getElementById('successStorageNote').hidden = !orderLines.some(({ dish }) => dish.laterWeek);
    }

    function changeQty(id, tier, delta) {
      clearOrderError();
      const previousItemCount = getOrderLines().reduce((sum, line) => sum + line.qty, 0);
      const dish = allDishes().find(item => item.id === id);
      if (!dish || dish.available === false) return;
      const effectiveTier = tier === 'single' ? null : tier;
      if (!orderOptions(dish).some(option => option === effectiveTier)) return;
      const key = cartKey(id, effectiveTier);
      const maxQty = dish.maxQty || MAX_QTY_PER_ITEM;
      const previousQuantity = cart[key] || 0;
      cart[key] = Math.min(maxQty, Math.max(0, (cart[key] || 0) + delta));
      const addedQuantity = Math.max(0, cart[key] - previousQuantity);
      document.getElementById(`qty-${id}-${tier}`).textContent = cart[key];
      const hasAnyQty = orderOptions(dish).some(option => getQty(id, option) > 0);
      document.getElementById('card-' + id).classList.toggle('has-qty', hasAnyQty);
      saveCart();
      updateSummary();
      if (addedQuantity > 0 && typeof window.trackGoogleAdsAddToCart === 'function') {
        window.trackGoogleAdsAddToCart({
          id: dish.id,
          name: dish.name,
          tier: effectiveTier || 'single',
          price: getPrice(dish, effectiveTier),
          quantity: addedQuantity,
        });
      }
      if (delta > 0 && previousItemCount === 0 && typeof window.trackPrpdFunnelEvent === 'function') {
        window.trackPrpdFunnelEvent('cart_started', {
          detail: sectionOf(id) || 'menu',
          value: getMealSubtotal(getOrderLines()),
        });
      }
    }

    function updateSummary() {
      const ordered = getOrderLines();
      const sauceQuote = sauceCreditSummary(ordered);
      const container = document.getElementById('summaryItems');

      if (ordered.length === 0) {
        container.innerHTML = '<p class="summary-empty">Add items from the menu.</p>';
      } else {
        container.innerHTML = ordered.map(({ dish, tier, qty }) => {
          const price = getPrice(dish, tier);
          const sub   = (qty * price).toFixed(2);
          const tierLabel = isVariantDish(dish)
            ? ` <span class="summary-tier-label">(${optionLabel(dish, tier)})</span>`
            : !isSingleSize(dish)
              ? ` <span class="summary-tier-label">(${tier.toUpperCase()})</span>`
              : '';
          const orderTier = tier || 'single';
          return `<div class="summary-item">
            <span class="summary-item-name">${dish.name}${tierLabel}</span>
            <span class="summary-item-price">$${sub}</span>
            <div class="summary-item-editor">
              <span>$${price.toFixed(2)} each</span>
              <div class="summary-qty" aria-label="Change quantity for ${dish.name}">
                <button type="button" class="qty-btn" data-dish-id="${dish.id}" data-order-tier="${orderTier}" data-qty-delta="-1" aria-label="Remove one ${dish.name}">−</button>
                <span class="qty-val" aria-label="Quantity">${qty}</span>
                <button type="button" class="qty-btn" data-dish-id="${dish.id}" data-order-tier="${orderTier}" data-qty-delta="1" aria-label="Add one ${dish.name}">+</button>
              </div>
            </div>
          </div>`;
        }).join('');
      }

      const itemSubtotal = getItemsSubtotal(ordered);
      const mealSubtotal = moneyAmount(itemSubtotal + sauceQuote.extraSubtotal);
      const quoteState = currentDeliveryQuote();
      const deliveryPolicy = currentDeliveryPolicy();
      const pricingPolicy = fulfillmentMethod === 'pickup' ? PICKUP_POLICY : (deliveryPolicy || CORE_DELIVERY_POLICY);
      const deliveryFee = getDeliveryFee(mealSubtotal, pricingPolicy);
      const discountAmount = discountForPromotion(appliedPromotion, mealSubtotal);
      const tax = calculateSalesTax(ordered, mealSubtotal, deliveryFee, discountAmount);
      const exactTotal = Math.max(0, mealSubtotal + deliveryFee - discountAmount + tax.salesTax);
      const roundedTotal = TAX_POLICY.enabled ? moneyAmount(exactTotal) : Math.ceil(exactTotal);
      document.getElementById('mealSubtotalDisplay').textContent = '$' + itemSubtotal.toFixed(2);
      document.getElementById('sauceExtrasRow').hidden = !SAUCE_PROGRAM.enabled || sauceQuote.extraQty === 0;
      document.getElementById('sauceExtrasCount').textContent = sauceQuote.extraQty > 0 ? `(${sauceQuote.extraQty})` : '';
      document.getElementById('sauceExtrasDisplay').textContent = '$' + sauceQuote.extraSubtotal.toFixed(2);
      document.getElementById('summaryTotalLabel').textContent = fulfillmentMethod === 'pickup' || deliveryPolicy
        ? 'Total due'
        : 'Final total';
      document.getElementById('summaryTotal').textContent = fulfillmentMethod === 'pickup' || deliveryPolicy
        ? '$' + roundedTotal.toFixed(2)
        : 'Enter ZIP';
      document.getElementById('fulfillmentFeeLabel').textContent = fulfillmentMethod === 'pickup' ? 'Pickup' : 'Delivery';
      document.getElementById('deliveryFeeDisplay').textContent = mealSubtotal === 0
        ? '—'
        : fulfillmentMethod === 'pickup'
          ? `Free · ${PICKUP_CITY}`
        : quoteState.status === 'loading'
          ? 'Checking ZIP…'
          : quoteState.status === 'unsupported'
            ? 'Outside standard area'
            : quoteState.status === 'error'
              ? 'Text Rida to confirm'
              : !deliveryPolicy
                ? 'Enter ZIP'
                : deliveryFee > 0 ? '$' + deliveryFee.toFixed(2) + ` · ${pricingPolicy.label}` : `Free · ${pricingPolicy.label}`;
      document.getElementById('discountRow').hidden = discountAmount <= 0;
      document.getElementById('discountCodeLabel').textContent = appliedPromotion ? `(${normalizePromoCode(appliedPromotion.code)})` : '';
      document.getElementById('discountDisplay').textContent = '-$' + discountAmount.toFixed(2);
      document.getElementById('salesTaxRow').hidden = tax.salesTax <= 0;
      document.getElementById('salesTaxDisplay').textContent = '$' + tax.salesTax.toFixed(2);
      const itemCount = ordered.reduce((sum, line) => sum + line.qty, 0);
      document.getElementById('mobileCartCount').textContent = `${itemCount} ${itemCount === 1 ? 'item' : 'items'}`;
      document.getElementById('mobileCartTotal').textContent = fulfillmentMethod === 'pickup' || deliveryPolicy
        ? `$${roundedTotal.toFixed(2)} total`
        : `$${mealSubtotal.toFixed(2)} food · enter ZIP`;
      updateDeliveryPreview(quoteState, deliveryPolicy);
      const mobileStatus = document.getElementById('mobileCartStatus');
      if (mobileStatus) {
        const minimumOrder = Number(pricingPolicy.minimumOrder);
        const freeDeliveryThreshold = Number(pricingPolicy.freeDeliveryThreshold);
        if (fulfillmentMethod === 'pickup' && !orderMinimumReached(mealSubtotal, PICKUP_POLICY.minimumOrder)) {
          mobileStatus.textContent = `$${amountToOrderMinimum(mealSubtotal, PICKUP_POLICY.minimumOrder).toFixed(2)} to pickup minimum`;
        } else if (fulfillmentMethod === 'pickup') {
          mobileStatus.textContent = `Free ${PICKUP_CITY} pickup selected`;
        } else if (quoteState.status === 'loading') {
          mobileStatus.textContent = 'Checking delivery ZIP';
        } else if (quoteState.status === 'unsupported' || quoteState.status === 'error') {
          mobileStatus.textContent = 'Text Rida to confirm delivery';
        } else if (!deliveryPolicy) {
          mobileStatus.textContent = 'Enter ZIP for exact delivery';
        } else if (!orderMinimumReached(mealSubtotal, minimumOrder)) {
          mobileStatus.textContent = `$${amountToOrderMinimum(mealSubtotal, minimumOrder).toFixed(2)} to ${pricingPolicy.label} minimum`;
        } else if (mealSubtotal < freeDeliveryThreshold) {
          mobileStatus.textContent = `$${(freeDeliveryThreshold - mealSubtotal).toFixed(2)} to free delivery`;
        } else {
          mobileStatus.textContent = 'Free delivery unlocked';
        }
      }
      document.getElementById('mobileCartBar').hidden = itemCount === 0 || isOrderingClosed();
      updateOrderPolicies(mealSubtotal, deliveryPolicy);
      renderSauceSelector();
    }

    async function applyPromotion(showEmptyError = true) {
      const input = document.getElementById('promoCode');
      const feedback = document.getElementById('promoFeedback');
      const button = document.getElementById('applyPromoBtn');
      const code = normalizePromoCode(input.value);
      input.value = code;
      feedback.classList.remove('is-valid', 'is-error');

      if (!code) {
        appliedPromotion = null;
        syncPickupPromoVerification();
        feedback.textContent = showEmptyError ? 'Enter a referral or partner code first.' : '';
        if (showEmptyError) feedback.classList.add('is-error');
        if (showEmptyError && typeof window.trackPrpdFunnelEvent === 'function') {
          window.trackPrpdFunnelEvent('promo_rejected', { detail: 'empty-code', repeatable: true });
        }
        updateSummary();
        return;
      }

      button.disabled = true;
      feedback.textContent = 'Checking code...';
      const promotion = await resolvePromotionForCode(code);
      button.disabled = false;
      if (!promotion) {
        appliedPromotion = null;
        syncPickupPromoVerification();
        feedback.textContent = 'That code is not active. Check the spelling or text Rida.';
        feedback.classList.add('is-error');
        if (typeof window.trackPrpdFunnelEvent === 'function') {
          window.trackPrpdFunnelEvent('promo_rejected', { detail: `inactive|code=${code}`, repeatable: true });
        }
        updateSummary();
        return;
      }

      appliedPromotion = promotion;
      syncPickupPromoVerification();
      const description = promotion.type === 'percent'
        ? `${Number(promotion.value)}% off`
        : `$${Number(promotion.value).toFixed(2)} off`;
      const minimum = Math.max(MIN_ORDER_TOTAL, Number(promotion.minimumOrder) || 0);
      feedback.textContent = `${description} applied${promotion.firstOrderOnly ? ' to a first PRPD order' : ''} of $${minimum.toFixed(0)} or more.`;
      feedback.classList.add('is-valid');
      try { sessionStorage.setItem('promo_code', code); } catch { /* Optional attribution storage. */ }
      if (typeof window.trackPrpdFunnelEvent === 'function') {
        window.trackPrpdFunnelEvent('promo_applied', {
          detail: `code=${code}|minimum=${minimum.toFixed(0)}`,
          value: Number(promotion.value) || 0,
          repeatable: true,
        });
      }
      updateSummary();
    }

    function getItemsSubtotal(ordered) {
      return ordered.reduce((sum, line) => sum + line.qty * getPrice(line.dish, line.tier), 0);
    }

    function getMealSubtotal(ordered) {
      return moneyAmount(getItemsSubtotal(ordered) + sauceCreditSummary(ordered).extraSubtotal);
    }

    function currentDeliveryQuote() {
      if (fulfillmentMethod === 'pickup') return { zip: '', status: 'ready', policy: PICKUP_POLICY };
      const zip = String(document.getElementById('deliveryZip')?.value || '').trim();
      if (!/^\d{5}$/.test(zip)) return { zip, status: 'idle', policy: null };
      if (deliveryQuoteState.zip !== zip) return { zip, status: 'loading', policy: null };
      return deliveryQuoteState;
    }

    async function deliveryPolicyForZip(zipCode, force = false) {
      const zip = String(zipCode || '').trim();
      if (!/^\d{5}$/.test(zip)) return null;
      if (!force && deliveryQuoteState.zip === zip && deliveryQuoteState.status === 'ready') {
        return deliveryQuoteState.policy;
      }

      const requestId = ++deliveryQuoteRequest;
      deliveryQuoteState = { zip, status: 'loading', policy: null };
      updateSummary();
      try {
        const response = await fetch(`/api/delivery-quote?zip=${encodeURIComponent(zip)}`, {
          headers: { Accept: 'application/json' },
        });
        const result = await response.json().catch(() => ({}));
        const liveZip = String(document.getElementById('deliveryZip')?.value || '').trim();
        if (requestId !== deliveryQuoteRequest || zip !== liveZip) return null;
        if (!response.ok || result.status !== 'success') throw new Error('Delivery quote unavailable.');
        if (!result.supported || !result.policy) {
          deliveryQuoteState = { zip, status: 'unsupported', policy: null };
          updateSummary();
          if (typeof window.trackPrpdFunnelEvent === 'function') {
            window.trackPrpdFunnelEvent('delivery_blocked', { detail: 'unsupported-zone', repeatable: true });
          }
          return null;
        }
        deliveryQuoteState = { zip, status: 'ready', policy: result.policy };
        updateSummary();
        if (typeof window.trackPrpdFunnelEvent === 'function') {
          window.trackPrpdFunnelEvent('delivery_quote', {
            detail: `${result.policy.id || 'supported'}|minimum=${Number(result.policy.minimumOrder || 0).toFixed(0)}|subtotal=${getMealSubtotal(getOrderLines()).toFixed(2)}`,
            value: Number(result.policy.deliveryFee || 0),
          });
        }
        return result.policy;
      } catch {
        if (requestId === deliveryQuoteRequest) {
          deliveryQuoteState = { zip, status: 'error', policy: null };
          updateSummary();
          if (typeof window.trackPrpdFunnelEvent === 'function') {
            window.trackPrpdFunnelEvent('delivery_blocked', { detail: 'quote-error', repeatable: true });
          }
        }
        return null;
      }
    }

    function currentDeliveryPolicy() {
      if (fulfillmentMethod === 'pickup') return PICKUP_POLICY;
      const quote = currentDeliveryQuote();
      return quote.status === 'ready' ? quote.policy : null;
    }

    function getDeliveryFee(mealSubtotal, deliveryPolicy = currentDeliveryPolicy() || CORE_DELIVERY_POLICY) {
      if (mealSubtotal <= 0) return 0;
      return mealSubtotal >= Number(deliveryPolicy.freeDeliveryThreshold) ? 0 : Number(deliveryPolicy.deliveryFee);
    }

    function updateOrderPolicies(mealSubtotal, deliveryPolicy = currentDeliveryPolicy()) {
      const minEl = document.getElementById('minimumStatus');
      const deliveryEl = document.getElementById('deliveryStatus');

      if (!minEl || !deliveryEl) return;

      if (fulfillmentMethod === 'pickup') {
        const minimumOrder = Number(PICKUP_POLICY.minimumOrder);
        const minimumReached = orderMinimumReached(mealSubtotal, minimumOrder);
        const amountToMinimum = amountToOrderMinimum(mealSubtotal, minimumOrder);
        minEl.classList.toggle('is-good', minimumReached);
        minEl.classList.toggle('is-warning', mealSubtotal > 0 && !minimumReached);
        minEl.querySelector('span').textContent = minimumReached
          ? 'Pickup minimum met'
          : 'Add $' + amountToMinimum.toFixed(2) + ' more';
        minEl.querySelector('strong').textContent = minimumReached
          ? `Free ${PICKUP_CITY} pickup selected`
          : 'to meet the $' + minimumOrder.toFixed(0) + ' pickup minimum';
        deliveryEl.classList.add('is-good');
        deliveryEl.classList.remove('is-warning');
        deliveryEl.querySelector('span').textContent = 'Pickup fee';
        deliveryEl.querySelector('strong').textContent = 'Free · exact details sent after confirmation';
        return;
      }

      const quoteState = currentDeliveryQuote();
      if (quoteState.status === 'loading') {
        minEl.classList.remove('is-good', 'is-warning');
        deliveryEl.classList.remove('is-good', 'is-warning');
        minEl.querySelector('span').textContent = 'Checking your delivery area';
        minEl.querySelector('strong').textContent = 'One moment';
        deliveryEl.querySelector('span').textContent = 'Calculating ZIP-based delivery';
        deliveryEl.querySelector('strong').textContent = 'Checking…';
        return;
      }
      if (quoteState.status === 'unsupported' || quoteState.status === 'error') {
        minEl.classList.remove('is-good');
        minEl.classList.add('is-warning');
        deliveryEl.classList.remove('is-good');
        deliveryEl.classList.add('is-warning');
        minEl.querySelector('span').textContent = 'Outside standard delivery area';
        minEl.querySelector('strong').textContent = 'Text Rida before ordering';
        deliveryEl.querySelector('span').textContent = 'Automatic delivery unavailable';
        deliveryEl.querySelector('strong').textContent = 'Address review required';
        return;
      }

      const policy = deliveryPolicy || CORE_DELIVERY_POLICY;
      const minimumOrder = Number(policy.minimumOrder);
      const freeDeliveryThreshold = Number(policy.freeDeliveryThreshold);
      const deliveryFee = Number(policy.deliveryFee);
      const minimumReached = orderMinimumReached(mealSubtotal, minimumOrder);

      minEl.classList.toggle('is-good', minimumReached);
      minEl.classList.toggle('is-warning', mealSubtotal > 0 && !minimumReached);
      const amountToMinimum = amountToOrderMinimum(mealSubtotal, minimumOrder);
      minEl.querySelector('span').textContent = minimumReached
        ? 'Order minimum met'
        : 'Add $' + amountToMinimum.toFixed(2) + ' more';
      minEl.querySelector('strong').textContent = minimumReached
        ? (deliveryPolicy ? policy.label : 'Core minimum met; enter ZIP to confirm')
        : 'to meet the $' + minimumOrder.toFixed(0) + (deliveryPolicy ? ` ${policy.label} minimum` : ' core minimum');

      if (!deliveryPolicy) {
        deliveryEl.classList.remove('is-good', 'is-warning');
        deliveryEl.querySelector('span').textContent = 'Enter ZIP for exact delivery pricing';
        deliveryEl.querySelector('strong').textContent = '$9.99 local · $12.99 regional · $14.99 extended';
        return;
      }

      deliveryEl.classList.toggle('is-good', mealSubtotal >= freeDeliveryThreshold);
      deliveryEl.classList.toggle('is-warning', mealSubtotal > 0 && mealSubtotal < freeDeliveryThreshold);
      const amountToFreeDelivery = Math.max(freeDeliveryThreshold - mealSubtotal, 0);
      deliveryEl.querySelector('span').textContent = mealSubtotal >= freeDeliveryThreshold
        ? 'Free delivery applied'
        : 'Add $' + amountToFreeDelivery.toFixed(2) + ' more';
      deliveryEl.querySelector('strong').textContent = mealSubtotal >= freeDeliveryThreshold
        ? 'You save $' + deliveryFee.toFixed(2) + ` · ${policy.label}`
        : `for free ${policy.label} delivery at $${freeDeliveryThreshold.toFixed(0)}`;
    }

    // ════════════════════════════════════════
    // NAV scroll shrink
    // ════════════════════════════════════════
    window.addEventListener('scroll', () => {
      document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });

    const phoneInput = document.getElementById('phone');
    const phoneReviewNote = document.getElementById('phoneReviewNote');
    const phoneReviewMessage = document.getElementById('phoneReviewMessage');
    const phoneReviewConfirmed = document.getElementById('phoneReviewConfirmed');
    phoneInput.addEventListener('input', () => {
      phoneInput.value = window.PRPDPhoneValidation?.format(phoneInput.value) || phoneInput.value;
      const needsReview = window.PRPDPhoneValidation?.needsReview(phoneInput.value);
      if (phoneReviewNote) phoneReviewNote.hidden = !needsReview;
      if (phoneReviewConfirmed) phoneReviewConfirmed.checked = false;
      if (phoneReviewMessage) {
        const digits = window.PRPDPhoneValidation?.digits(phoneInput.value) || '';
        phoneReviewMessage.textContent = digits.startsWith('1')
          ? 'This may be missing a digit after a +1 country code. Double-check all 10 digits.'
          : 'The area or exchange looks unusual. Double-check all 10 digits.';
      }
    });

    const deliveryZipInput = document.getElementById('deliveryZip');
    const earlyDeliveryZipInput = document.getElementById('earlyDeliveryZip');
    const deliveryPreviewStatus = document.getElementById('deliveryPreviewStatus');

    function updateDeliveryPreview(quoteState = currentDeliveryQuote(), deliveryPolicy = currentDeliveryPolicy()) {
      if (!deliveryPreviewStatus) return;
      if (fulfillmentMethod === 'pickup') {
        deliveryPreviewStatus.textContent = `Free pickup selected in ${PICKUP_CITY}.`;
      } else if (quoteState.status === 'loading') {
        deliveryPreviewStatus.textContent = 'Checking this ZIP…';
      } else if (quoteState.status === 'unsupported') {
        deliveryPreviewStatus.textContent = 'Outside our standard area. Text Rida and we will check it manually.';
      } else if (quoteState.status === 'error') {
        deliveryPreviewStatus.textContent = 'We could not check this ZIP. Text Rida for a quick confirmation.';
      } else if (deliveryPolicy) {
        deliveryPreviewStatus.textContent = `${deliveryPolicy.label}: $${Number(deliveryPolicy.minimumOrder).toFixed(0)} food minimum, $${Number(deliveryPolicy.deliveryFee).toFixed(2)} delivery, free at $${Number(deliveryPolicy.freeDeliveryThreshold).toFixed(0)}.`;
      } else {
        deliveryPreviewStatus.textContent = 'Enter 5 digits to check your delivery area.';
      }
    }

    function syncDeliveryZip(source, target) {
      const zip = source.value.replace(/\D/g, '').slice(0, 5);
      source.value = zip;
      if (target && target.value !== zip) target.value = zip;
      deliveryQuoteRequest += 1;
      deliveryQuoteState = { zip, status: 'idle', policy: null };
      updateSummary();
      if (/^\d{5}$/.test(zip)) {
        deliveryPolicyForZip(zip);
      }
    }

    deliveryZipInput.addEventListener('input', () => {
      syncDeliveryZip(deliveryZipInput, earlyDeliveryZipInput);
    });
    deliveryZipInput.addEventListener('change', () => {
      syncDeliveryZip(deliveryZipInput, earlyDeliveryZipInput);
    });

    earlyDeliveryZipInput.addEventListener('input', () => {
      syncDeliveryZip(earlyDeliveryZipInput, deliveryZipInput);
    });
    earlyDeliveryZipInput.addEventListener('change', () => {
      syncDeliveryZip(earlyDeliveryZipInput, deliveryZipInput);
    });
    earlyDeliveryZipInput.addEventListener('focus', () => {
      window.setTimeout(() => {
        if (earlyDeliveryZipInput.value && deliveryQuoteState.zip !== earlyDeliveryZipInput.value) {
          syncDeliveryZip(earlyDeliveryZipInput, deliveryZipInput);
        }
      }, 150);
    });

    // Some browsers restore or autofill ZIP values without firing an input event.
    [400, 1200].forEach(delay => {
      window.setTimeout(() => {
        if (earlyDeliveryZipInput.value && earlyDeliveryZipInput.value !== deliveryZipInput.value) {
          syncDeliveryZip(earlyDeliveryZipInput, deliveryZipInput);
        } else if (deliveryZipInput.value && deliveryQuoteState.zip !== deliveryZipInput.value) {
          syncDeliveryZip(deliveryZipInput, earlyDeliveryZipInput);
        }
      }, delay);
    });

    const deliveryHasUnitInput = document.getElementById('deliveryHasUnit');
    const deliveryUnitInput = document.getElementById('deliveryUnit');
    deliveryHasUnitInput.addEventListener('change', () => {
      const hasUnit = deliveryHasUnitInput.checked;
      deliveryUnitInput.hidden = !hasUnit;
      deliveryUnitInput.disabled = !hasUnit;
      deliveryUnitInput.required = hasUnit;
      deliveryHasUnitInput.setAttribute('aria-expanded', String(hasUnit));
      deliveryUnitInput.classList.remove('error');
      if (!hasUnit) deliveryUnitInput.value = '';
      if (hasUnit) deliveryUnitInput.focus();
    });

    const pickupVerification = document.getElementById('pickupPromoVerification');
    const pickupVerificationAddress = document.getElementById('pickupVerificationAddress');
    const pickupVerificationHasUnit = document.getElementById('pickupVerificationHasUnit');
    const pickupVerificationUnit = document.getElementById('pickupVerificationUnit');
    const pickupVerificationZip = document.getElementById('pickupVerificationZip');

    function pickupNeedsReferralVerification() {
      return fulfillmentMethod === 'pickup' && Boolean(appliedPromotion?.firstOrderOnly);
    }

    function syncPickupPromoVerification() {
      const required = pickupNeedsReferralVerification();
      pickupVerification.hidden = !required;
      pickupVerificationAddress.disabled = !required;
      pickupVerificationAddress.required = required;
      pickupVerificationZip.disabled = !required;
      pickupVerificationZip.required = required;
      pickupVerificationHasUnit.disabled = !required;
      if (!required) {
        pickupVerificationHasUnit.checked = false;
        pickupVerificationUnit.value = '';
        pickupVerificationUnit.hidden = true;
        pickupVerificationUnit.disabled = true;
        pickupVerificationUnit.required = false;
        pickupVerificationHasUnit.setAttribute('aria-expanded', 'false');
        [pickupVerificationAddress, pickupVerificationZip, pickupVerificationUnit].forEach(field => field.classList.remove('error'));
      }
    }

    pickupVerificationHasUnit.addEventListener('change', () => {
      const hasUnit = pickupVerificationHasUnit.checked && pickupNeedsReferralVerification();
      pickupVerificationUnit.hidden = !hasUnit;
      pickupVerificationUnit.disabled = !hasUnit;
      pickupVerificationUnit.required = hasUnit;
      pickupVerificationHasUnit.setAttribute('aria-expanded', String(hasUnit));
      pickupVerificationUnit.classList.remove('error');
      if (!hasUnit) pickupVerificationUnit.value = '';
      if (hasUnit) pickupVerificationUnit.focus();
    });

    pickupVerificationZip.addEventListener('input', () => {
      pickupVerificationZip.value = pickupVerificationZip.value.replace(/\D/g, '').slice(0, 5);
    });

    function setFulfillmentMethod(nextMethod) {
      clearOrderError();
      fulfillmentMethod = nextMethod === 'pickup' ? 'pickup' : 'delivery';
      document.getElementById('fulfillmentMethod').value = fulfillmentMethod;
      const pickup = fulfillmentMethod === 'pickup';
      const deliveryFields = document.getElementById('deliveryFields');
      const pickupInfo = document.getElementById('pickupInfo');
      deliveryFields.hidden = pickup;
      pickupInfo.hidden = !pickup;
      document.querySelectorAll('.fulfillment-option').forEach(button => {
        const active = button.dataset.fulfillment === fulfillmentMethod;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      ['deliveryAddress', 'deliveryCity', 'deliveryState', 'deliveryZip'].forEach(id => {
        const field = document.getElementById(id);
        field.disabled = pickup;
        field.required = !pickup;
        clearFieldError(field);
      });
      deliveryHasUnitInput.disabled = pickup;
      if (pickup) {
        deliveryHasUnitInput.checked = false;
        deliveryUnitInput.hidden = true;
        deliveryUnitInput.disabled = true;
        deliveryUnitInput.required = false;
        document.getElementById('deliveryInstructions').placeholder = 'Pickup timing notes (optional)...';
        document.getElementById('deliveryInstructions').setAttribute('aria-label', 'Pickup timing notes');
      } else {
        document.getElementById('deliveryInstructions').placeholder = 'Gate code or delivery instructions (optional)...';
        document.getElementById('deliveryInstructions').setAttribute('aria-label', 'Delivery instructions');
      }
      syncPickupPromoVerification();
      updateSummary();
      if (typeof window.trackPrpdFunnelEvent === 'function') {
        window.trackPrpdFunnelEvent('fulfillment_selected', { detail: fulfillmentMethod });
      }
    }

    // ════════════════════════════════════════
    // SUBMIT
    // ════════════════════════════════════════
    async function submitOrder() {
      if (applyOrderAvailability()) {
        showOrderError('Orders are closed for this week. Please text Rida if you need help.', null, 'Ordering is closed');
        return;
      }

      clearOrderError();
      const fullNameInput = document.getElementById('fullName');
      const { firstName, lastName } = splitFullName(fullNameInput.value);
      const phone     = document.getElementById('phone').value.trim();
      const email     = document.getElementById('email').value.trim();
      const selectedFulfillment = fulfillmentMethod;
      const isPickup = selectedFulfillment === 'pickup';
      const verifyPickupReferral = isPickup && Boolean(appliedPromotion?.firstOrderOnly);
      const deliveryAddress = isPickup
        ? (verifyPickupReferral ? pickupVerificationAddress.value.trim() : '')
        : document.getElementById('deliveryAddress').value.trim();
      const deliveryHasUnit = isPickup
        ? (verifyPickupReferral && pickupVerificationHasUnit.checked)
        : document.getElementById('deliveryHasUnit').checked;
      const deliveryUnit = isPickup
        ? (deliveryHasUnit ? pickupVerificationUnit.value.trim() : '')
        : document.getElementById('deliveryUnit').value.trim();
      const deliveryCity = isPickup ? '' : document.getElementById('deliveryCity').value.trim();
      const deliveryState = isPickup
        ? (verifyPickupReferral ? 'TX' : '')
        : document.getElementById('deliveryState').value.trim().toUpperCase();
      const deliveryZip = isPickup
        ? (verifyPickupReferral ? pickupVerificationZip.value.trim() : '')
        : document.getElementById('deliveryZip').value.trim();
      const deliveryInstructions = document.getElementById('deliveryInstructions').value.trim();
      const notes     = document.getElementById('orderNotes').value.trim();
      const discoverySource = document.getElementById('discoverySource')?.value || '';

      // Validate required client info
      let valid = true;
      let firstInvalid = null;
      [
        ['fullName', firstName && lastName, 'Enter your first and last name.'],
        ['phone', phone, 'Enter your 10-digit phone number.'],
        ['email', email, 'Enter the email address for your confirmation.'],
        ...(!isPickup ? [
          ['deliveryAddress', deliveryAddress, 'Enter the delivery street address.'],
          ['deliveryCity', deliveryCity, 'Enter the delivery city.'],
          ['deliveryState', deliveryState, 'Select the delivery state.'],
          ['deliveryZip', deliveryZip, 'Enter the 5-digit delivery ZIP code.'],
        ] : []),
        ...(verifyPickupReferral ? [
          ['pickupVerificationAddress', deliveryAddress, 'Enter the home street address used to verify this offer.'],
          ['pickupVerificationZip', deliveryZip, 'Enter the home ZIP code used to verify this offer.'],
        ] : []),
        ...(deliveryHasUnit ? [[isPickup ? 'pickupVerificationUnit' : 'deliveryUnit', deliveryUnit, 'Enter the apartment, suite, or unit number.']] : []),
      ].forEach(([id, val, message]) => {
        const el = document.getElementById(id);
        if (!val) {
          el.classList.add('error');
          el.setAttribute('aria-invalid', 'true');
          el.addEventListener('input', () => {
            clearFieldError(el);
            clearOrderError();
          }, { once: true });
          if (!firstInvalid) firstInvalid = { el, message };
          valid = false;
        }
      });
      if (!valid) {
        showOrderError(firstInvalid.message, firstInvalid.el);
        return;
      }
      if (!window.PRPDPhoneValidation?.isValid(phone)) {
        const el = document.getElementById('phone');
        showOrderError('Enter a valid U.S. 10-digit phone number.', el);
        return;
      }
      const phoneNeedsReview = window.PRPDPhoneValidation?.needsReview(phone);
      if (phoneReviewNote) phoneReviewNote.hidden = !phoneNeedsReview;
      if (phoneNeedsReview && !phoneReviewConfirmed?.checked) {
        phoneReviewNote?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        phoneReviewConfirmed?.focus();
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        const el = document.getElementById('email');
        showOrderError('Enter a valid email address for your confirmation.', el);
        return;
      }
      if ((!isPickup || verifyPickupReferral) && !/^\d{5}$/.test(deliveryZip)) {
        const el = document.getElementById(isPickup ? 'pickupVerificationZip' : 'deliveryZip');
        showOrderError('Enter a valid 5-digit ZIP code.', el);
        return;
      }

      // Must have at least one item
      const ordered = getOrderLines();
      if (ordered.length === 0) {
        showOrderError('Add at least one item before placing your order.');
        return;
      }
      const totalItems = ordered.reduce((sum, line) => sum + line.qty, 0);
      if (totalItems > MAX_TOTAL_ITEMS) {
        showOrderError('Please text Rida directly for very large orders.', null, 'This order needs a quick review');
        return;
      }

      const btn = document.getElementById('placeOrderBtn');
      btn.disabled = true;
      document.getElementById('btnText').hidden = true;
      document.getElementById('btnSpinner').hidden = false;

      const mealSubtotal = getMealSubtotal(ordered);
      const deliveryPolicy = isPickup ? PICKUP_POLICY : await deliveryPolicyForZip(deliveryZip);
      if (!deliveryPolicy) {
        if (typeof window.trackPrpdFunnelEvent === 'function') {
          window.trackPrpdFunnelEvent('checkout_blocked', {
            detail: `delivery-unavailable|subtotal=${mealSubtotal.toFixed(2)}`,
            value: mealSubtotal,
            repeatable: true,
          });
        }
        showOrderError('Automatic delivery is not available for this ZIP. Please text Rida before placing the order.', deliveryZipInput, 'Delivery needs confirmation');
        btn.disabled = false;
        document.getElementById('btnText').hidden = false;
        document.getElementById('btnSpinner').hidden = true;
        return;
      }
      const deliveryFee = getDeliveryFee(mealSubtotal, deliveryPolicy);
      const discountAmount = discountForPromotion(appliedPromotion, mealSubtotal);
      const tax = calculateSalesTax(ordered, mealSubtotal, deliveryFee, discountAmount);
      const exactTotal = Math.max(0, mealSubtotal + deliveryFee - discountAmount + tax.salesTax);
      const roundedTotal = TAX_POLICY.enabled ? moneyAmount(exactTotal) : Math.ceil(exactTotal);
      if (!orderMinimumReached(mealSubtotal, deliveryPolicy.minimumOrder)) {
        if (typeof window.trackPrpdFunnelEvent === 'function') {
          window.trackPrpdFunnelEvent('checkout_blocked', {
            detail: `${deliveryPolicy.id}|subtotal=${mealSubtotal.toFixed(2)}|minimum=${Number(deliveryPolicy.minimumOrder).toFixed(0)}`,
            value: mealSubtotal,
            repeatable: true,
          });
        }
        showOrderError(`The ${deliveryPolicy.label} minimum is $${Number(deliveryPolicy.minimumOrder).toFixed(0)}. Add a few more items to place your order.`);
        btn.disabled = false;
        document.getElementById('btnText').hidden = false;
        document.getElementById('btnSpinner').hidden = true;
        return;
      }
      const orderId = createOrderId();
      const promoCode = appliedPromotion ? normalizePromoCode(appliedPromotion.code) : '';

      const payload = {
        action: 'order',
        orderId,
        batch: BATCH.number,
        deliveryDate: BATCH.deliveryDate,
        firstName,
        lastName,
        phone,
        email,
        fulfillmentMethod: selectedFulfillment,
        deliveryAddress,
        deliveryHasUnit,
        deliveryUnit,
        deliveryCity,
        deliveryState,
        deliveryZip,
        deliveryInstructions,
        items: ordered.map(({ dish, tier, qty }) => {
          const unitPrice = getPrice(dish, tier);
          return {
            id: dish.id,
            name: dish.name,
            category: dish.category,
            section: sectionOf(dish.id),
            tier: isSingleSize(dish) ? null : tier,
            qty,
            unitPrice,
            subtotal: parseFloat((qty * unitPrice).toFixed(2)),
          };
        }),
        sauces: selectedSaucePayload(),
        mealSubtotal: parseFloat(mealSubtotal.toFixed(2)),
        deliveryFee: parseFloat(deliveryFee.toFixed(2)),
        exactTotal: parseFloat(exactTotal.toFixed(2)),
        total: roundedTotal,
        promoCode,
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        taxableSubtotal: tax.taxableSubtotal,
        taxableDelivery: tax.taxableDelivery,
        taxRate: tax.taxRate,
        salesTax: tax.salesTax,
        menuEmailOptIn: document.getElementById('menuEmailOptIn').checked,
        notes,
        discoverySource,
        website: document.getElementById('orderWebsite')?.value || '',
        formStartedAt: orderFormStartedAt,
        submittedAt: new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }),
        ...attributionPayload(),
      };

      try {
        if (typeof window.trackPrpdFunnelEvent === 'function') {
          window.trackPrpdFunnelEvent('order_submit', { detail: 'api-submit', value: roundedTotal });
        }
        const response = await fetch(ORDER_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const result = await response.json().catch(() => null);
        if (!response.ok || !result || result.status !== 'success') {
          throw new Error(result && result.message ? result.message : 'The order could not be confirmed.');
        }

        document.getElementById('orderForm').hidden = true;
        document.getElementById('mobileCartBar').hidden = true;
        closeMobileSummary();
        document.getElementById('successMsg').textContent =
          `Thanks, ${firstName}! Your order has been sent to PRPD.`;
        document.getElementById('successEmailMsg').textContent = result.customerConfirmationSent === false
          ? `Your order is saved, but the confirmation email could not be sent. Keep the order reference below and text Rida for payment instructions.`
          : `We emailed an itemized copy to ${email}. Check it for your Zelle instructions to payments@getprpd.com.`;
        const confirmedDiscount = Number(result.discountAmount ?? discountAmount);
        const confirmedSalesTax = Number(result.salesTax ?? tax.salesTax);
        const confirmedTotal = Number(result.total ?? roundedTotal);
        const confirmedDeliveryFee = Number(result.deliveryFee ?? deliveryFee);
        renderOrderConfirmation(ordered, mealSubtotal, confirmedDeliveryFee, confirmedDiscount, confirmedSalesTax, confirmedTotal, orderId, result.promoCode || promoCode, result.fulfillmentMethod || selectedFulfillment, result.sauces || null);
        document.getElementById('orderSuccess').classList.add('visible');
        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (window.ttq && typeof window.ttq.track === 'function') {
          window.ttq.track('PlaceAnOrder', {
            content_type: 'product',
            content_id: orderId,
            currency: 'USD',
            value: confirmedTotal,
            quantity: totalItems,
          }, { event_id: orderId });
        }

        if (typeof window.trackGoogleAdsCompletedOrder === 'function') {
          window.trackGoogleAdsCompletedOrder(result.orderId || orderId, confirmedTotal);
        }
        if (typeof window.trackPrpdFunnelEvent === 'function') {
          window.trackPrpdFunnelEvent('purchase', {
            detail: result.promoCode || promoCode ? `confirmed|promo=${result.promoCode || promoCode}` : 'confirmed-order',
            value: confirmedTotal,
          });
        }
        try { window.localStorage.removeItem(CART_STORAGE_KEY); } catch { /* Optional cart persistence. */ }
        try { window.localStorage.removeItem(SAUCE_STORAGE_KEY); } catch { /* Optional cart persistence. */ }

      } catch (err) {
        console.error(err);
        if (typeof window.trackPrpdFunnelEvent === 'function') {
          window.trackPrpdFunnelEvent('order_error', { detail: 'order-api', repeatable: true });
        }
        btn.disabled = false;
        document.getElementById('btnText').hidden = false;
        document.getElementById('btnSpinner').hidden = true;
        showOrderError(err.message || 'Something went wrong. Please text Rida at (469) 545-0781.', null, 'We could not place the order');
      }
    }

    function cartReadyForCheckout() {
      const ordered = getOrderLines();
      if (ordered.length === 0) {
        if (typeof window.trackPrpdFunnelEvent === 'function') {
          window.trackPrpdFunnelEvent('checkout_blocked', { detail: 'empty-cart', repeatable: true });
        }
        showOrderError('Add at least one item before continuing to checkout.');
        return false;
      }
      const mealSubtotal = getMealSubtotal(ordered);
      const checkoutMinimum = Math.min(MIN_ORDER_TOTAL, Number(PICKUP_POLICY.minimumOrder));
      if (!orderMinimumReached(mealSubtotal, checkoutMinimum)) {
        if (typeof window.trackPrpdFunnelEvent === 'function') {
          window.trackPrpdFunnelEvent('checkout_blocked', {
            detail: `base-minimum|subtotal=${mealSubtotal.toFixed(2)}|minimum=${checkoutMinimum}`,
            value: mealSubtotal,
            repeatable: true,
          });
        }
        showOrderError(`Pickup orders require a $${checkoutMinimum} rounded food total. Add a few more items to continue.`);
        return false;
      }
      return true;
    }

    function beginCheckout() {
      const checkout = document.getElementById('checkout');
      checkout.dataset.started = 'true';
      checkout.classList.add('is-active');
      document.getElementById('btnText').textContent = 'Place Order →';
      mobileCartReview.textContent = 'View order';
      document.getElementById('mobileCartBar').classList.add('is-checkout');
      closeMobileSummary();
      if (typeof window.trackPrpdFunnelEvent === 'function') {
        window.trackPrpdFunnelEvent('begin_checkout', {
          detail: 'customer-details',
          value: getMealSubtotal(getOrderLines()),
        });
      }
      checkout.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function handlePrimaryOrderAction() {
      if (applyOrderAvailability()) {
        showOrderError('Orders are closed for this week. Please text Rida if you need help.', null, 'Ordering is closed');
        return;
      }
      if (!cartReadyForCheckout()) return;
      const checkout = document.getElementById('checkout');
      if (checkout.dataset.started !== 'true') {
        beginCheckout();
        return;
      }
      submitOrder();
    }

    // ════════════════════════════════════════
    // INIT
    // ════════════════════════════════════════
    const orderAside = document.querySelector('#orderForm aside');
    const mobileCartReview = document.getElementById('mobileCartReview');

    function openMobileSummary() {
      orderAside.classList.add('mobile-open');
      mobileCartReview.setAttribute('aria-expanded', 'true');
      document.querySelector('.order-summary').focus({ preventScroll: true });
    }

    function closeMobileSummary() {
      orderAside.classList.remove('mobile-open');
      mobileCartReview.setAttribute('aria-expanded', 'false');
    }

    mobileCartReview.addEventListener('click', openMobileSummary);
    document.getElementById('summaryClose').addEventListener('click', closeMobileSummary);
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeMobileSummary();
    });

    document.addEventListener('click', event => {
      const sauceButton = event.target.closest('.sauce-qty-btn');
      if (sauceButton) {
        changeSauceQty(sauceButton.dataset.sauceId, Number(sauceButton.dataset.sauceDelta));
        return;
      }
      const quantityButton = event.target.closest('.qty-btn');
      if (quantityButton) {
        changeQty(
          quantityButton.dataset.dishId,
          quantityButton.dataset.orderTier,
          Number(quantityButton.dataset.qtyDelta)
        );
      }
    });

    document.addEventListener('error', event => {
      if (event.target.matches('.dish-img img')) handleDishPhotoError(event.target);
    }, true);

    document.getElementById('placeOrderBtn').addEventListener('click', handlePrimaryOrderAction);
    document.querySelectorAll('.fulfillment-option').forEach(button => {
      button.addEventListener('click', () => setFulfillmentMethod(button.dataset.fulfillment));
    });
    document.getElementById('applyPromoBtn').addEventListener('click', () => applyPromotion());
    document.getElementById('applyWelcomeOffer').addEventListener('click', async () => {
      document.getElementById('promoCode').value = 'WELCOME10';
      await applyPromotion();
      if (appliedPromotion?.code === 'WELCOME10') {
        const button = document.getElementById('applyWelcomeOffer');
        button.textContent = 'WELCOME10 applied';
        button.disabled = true;
        document.getElementById('welcomeOffer').classList.add('is-applied');
      }
    });
    document.getElementById('promoCode').addEventListener('input', () => {
      if (appliedPromotion && normalizePromoCode(appliedPromotion.code) !== normalizePromoCode(document.getElementById('promoCode').value)) {
        appliedPromotion = null;
        syncPickupPromoVerification();
        document.getElementById('promoFeedback').textContent = 'Apply the code again after editing it.';
        document.getElementById('promoFeedback').className = 'promo-feedback';
        updateSummary();
      }
    });
    document.getElementById('promoCode').addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        event.preventDefault();
        applyPromotion();
      }
    });

    captureAttribution();
    renderMenu();
    initMealDetails();
    const addonPriceGuide = document.getElementById('addonPriceGuide');
    const addonPrices = (MENU.addons || []).filter(dish => dish.available !== false)
      .map(dish => getPrice(dish, 'single'));
    if (addonPriceGuide && addonPrices.length) {
      const lowest = Math.min(...addonPrices).toFixed(2);
      const highest = Math.max(...addonPrices).toFixed(2);
      addonPriceGuide.textContent = lowest === highest ? `$${lowest} each` : `$${lowest}–$${highest} each`;
    }
    const restoredItems = restoreCart();
    restoreSauceSelections();
    renderSauceSelector();
    if (restoredItems > 0 && typeof window.trackPrpdFunnelEvent === 'function') {
      window.trackPrpdFunnelEvent('cart_restored', { detail: `items=${restoredItems}`, value: getMealSubtotal(getOrderLines()) });
    }
    initMenuFilters();
    initMenuNavigation();
    if ('IntersectionObserver' in window) {
      const checkoutObserver = new IntersectionObserver(entries => {
        if (!entries.some(entry => entry.isIntersecting)) return;
        const checkout = document.getElementById('checkout');
        checkout.dataset.started = 'true';
        document.getElementById('btnText').textContent = 'Place Order →';
        mobileCartReview.textContent = 'View order';
        document.getElementById('mobileCartBar').classList.add('is-checkout');
        checkoutObserver.disconnect();
      }, { threshold: 0.12 });
      checkoutObserver.observe(document.getElementById('checkout'));
    }
    const hasActivePromotions = PROMOTIONS.remote || (PROMOTIONS.codes || []).some(promotion =>
      promotionForCode(promotion && promotion.code)
    );
    document.querySelector('.promo-field').hidden = !hasActivePromotions;
    document.querySelector('.order-growth-fields').classList.toggle('has-no-promotions', !hasActivePromotions);
    try {
      const savedPromoCode = sessionStorage.getItem('promo_code');
      if (savedPromoCode) {
        document.getElementById('promoCode').value = savedPromoCode;
        applyPromotion(false);
      }
    } catch {
      // Ordering remains available when storage is unavailable.
    }
    updateSummary();
    applyOrderAvailability();
    setInterval(applyOrderAvailability, 60000);
