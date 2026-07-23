const ORDER_API_URL = '/api/order';
    const { batch: BATCH, policies: POLICIES, prices: PRICES, menu: MENU, promotions: PROMOTIONS = { codes: [] } } = window.PRPD_ORDER_CONFIG;
    const MIN_ORDER_TOTAL = POLICIES.minimumOrder;
    const FREE_DELIVERY_THRESHOLD = POLICIES.freeDeliveryThreshold;
    const DELIVERY_FEE = POLICIES.deliveryFee;
    const MAX_QTY_PER_ITEM = POLICIES.maxQtyPerItem;
    const MAX_TOTAL_ITEMS = POLICIES.maxTotalItems;
    const orderFormStartedAt = Date.now();
    const ATTRIBUTION_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
    let appliedPromotion = null;

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

    function discountForPromotion(promotion, mealSubtotal) {
      if (!promotion || mealSubtotal < MIN_ORDER_TOTAL) return 0;
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
        const ttclid = params.get('ttclid');
        if (ttclid) sessionStorage.setItem('tiktok_ttclid', ttclid.slice(0, 500));
        const referral = params.get('ref') || params.get('promo');
        if (referral) {
          sessionStorage.setItem('promo_code', normalizePromoCode(referral));
          if (!sessionStorage.getItem('utm_source')) sessionStorage.setItem('utm_source', 'referral');
          if (!sessionStorage.getItem('utm_medium')) sessionStorage.setItem('utm_medium', 'partner');
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
      };
    }

    function allDishes() {
      return [...MENU.breakfasts, ...MENU.mains, ...MENU.desserts];
    }

    function sectionOf(id) {
      for (const sec of ['breakfasts', 'mains', 'desserts']) {
        if (MENU[sec].some(d => d.id === id)) return sec;
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
        const availableTiers = dish.category === 'dessert' ? [null] : ['lean', 'bulk'];
        return availableTiers
          .map(tier => ({ dish, tier, qty: getQty(dish.id, tier) }))
          .filter(line => line.qty > 0);
      });
    }

    function macroChipsHtml(m) {
      const chip = (val, label, unit) =>
        val > 0 ? `<span class="macro-chip">${val}${unit} ${label}</span>` : '';
      return chip(m.cal, 'Cal', '') + chip(m.protein, 'Protein', 'g') +
             chip(m.carbs, 'Carbs', 'g') + chip(m.fiber, 'Fiber', 'g') + chip(m.fat, 'Fats', 'g');
    }

    function getPrice(dish, tier) {
      const priceTier = dish.category === 'dessert' ? 'single' : tier;
      return PRICES[dish.category][priceTier];
    }

    function hasTierPhotos(dish) {
      return Boolean(dish.images && (dish.images.lean || dish.images.bulk));
    }

    function getDishPhoto(dish, tier = 'lean') {
      if (dish.images && dish.images[tier]) return dish.images[tier];
      return dish.image || '';
    }

    function photoTierSwitchHtml(dish) {
      if (dish.category === 'dessert') return '';
      return `<div class="photo-tier-switch" aria-label="Select ${dish.name} tier preview">
        <button type="button" class="photo-tier-btn is-active" data-dish-id="${dish.id}" data-photo-tier="lean" aria-pressed="true">Lean</button>
        <button type="button" class="photo-tier-btn" data-dish-id="${dish.id}" data-photo-tier="bulk" aria-pressed="false">Bulk</button>
      </div>`;
    }

    function setDishPhoto(id, tier) {
      const dish = allDishes().find(item => item.id === id);
      const card = document.getElementById('card-' + id);
      const image = document.getElementById('dish-photo-' + id);
      if (!dish || !card) return;

      card.querySelectorAll('.photo-tier-btn').forEach(button => {
        const active = button.dataset.photoTier === tier;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      card.querySelectorAll('.tier-order-row').forEach(row => {
        row.classList.toggle('is-selected-tier', row.dataset.orderTier === tier);
      });

      const source = getDishPhoto(dish, tier);
      if (!image || !source) return;
      image.hidden = false;
      image.dataset.fallback = dish.image || '';
      image.src = source;
      image.alt = `${dish.name} ${tier === 'bulk' ? 'Bulk' : 'Lean'} portion`;

    }

    function handleDishPhotoError(image) {
      const fallback = image.dataset.fallback;
      if (fallback && !image.dataset.usedFallback && !image.src.endsWith(fallback)) {
        image.dataset.usedFallback = 'true';
        image.src = fallback;
        return;
      }
      image.hidden = true;
    }

    function tierOrderRowHtml(dish, tier) {
      const effectiveTier = dish.category === 'dessert' ? null : tier;
      const macros = effectiveTier === 'bulk' && dish.bulkMacros ? dish.bulkMacros : dish.macros;
      const label = dish.category === 'dessert' ? 'Dessert' : (tier === 'bulk' ? 'Bulk' : 'Lean');
      const price = getPrice(dish, effectiveTier);
      const keySuffix = effectiveTier || 'single';
      const fiber = macros.fiber > 0 ? ` &middot; ${macros.fiber}g fiber` : '';
      return `<div class="tier-order-row${tier === 'lean' ? ' is-selected-tier' : ''}" data-order-tier="${keySuffix}">
        <div class="tier-order-info">
          <strong>${label} &middot; $${price.toFixed(2)}</strong>
          <span><strong>${macros.cal}</strong> Calories &middot; <strong>${macros.protein}g</strong> Protein</span>
          <span>${macros.carbs}g Carbs &middot; ${macros.fat}g Fat${fiber}</span>
        </div>
        <div class="qty-ctrl">
          <button class="qty-btn" data-dish-id="${dish.id}" data-order-tier="${keySuffix}" data-qty-delta="-1" aria-label="Remove one ${label.toLowerCase()} ${dish.name}">−</button>
          <span class="qty-val" id="qty-${dish.id}-${keySuffix}">0</span>
          <button class="qty-btn" data-dish-id="${dish.id}" data-order-tier="${keySuffix}" data-qty-delta="1" aria-label="Add one ${label.toLowerCase()} ${dish.name}">+</button>
        </div>
      </div>`;
    }

    // ════════════════════════════════════════
    // RENDER
    // ════════════════════════════════════════
    function renderMenu() {
      document.getElementById('batchMeta').textContent =
        `Batch ${BATCH.number}  ·  Delivery ${BATCH.deliveryDate}`;
      document.getElementById('orderCutoff').textContent = BATCH.cutoffLabel;
      document.getElementById('successDelivery').textContent = BATCH.deliveryDate;

      ['breakfasts', 'mains', 'desserts'].forEach(section => {
        const grid = document.getElementById('grid-' + section);
        grid.innerHTML = MENU[section].map(dish => {
          const available = dish.available !== false;
          const defaultPhoto = getDishPhoto(dish, 'lean');
          const orderRows = !available
            ? '<div class="sold-out-note">Sold out for this batch</div>'
            : dish.category === 'dessert'
              ? tierOrderRowHtml(dish, null)
              : tierOrderRowHtml(dish, 'lean') + tierOrderRowHtml(dish, 'bulk');
          return `
            <div class="dish-card${available ? '' : ' is-unavailable'}" id="card-${dish.id}">
              <div class="dish-img">
                <div class="dish-img__bg"><span>PRPD</span></div>
                ${dish.laterWeek ? '<span class="later-week-badge">Freezer-friendly</span>' : ''}
                ${defaultPhoto ? `<img id="dish-photo-${dish.id}" src="${defaultPhoto}" data-fallback="${dish.image || ''}" alt="${dish.name} Lean portion" loading="lazy" />` : ''}
                ${photoTierSwitchHtml(dish)}
              </div>
              <div class="dish-body">
                <div class="dish-name">${dish.name}</div>
                ${dish.description ? `<p class="dish-desc">${dish.description}</p>` : ''}
                <div class="tier-order-list">${orderRows}</div>
              </div>
            </div>`;
        }).join('');
      });
    }

    function isOrderingClosed() {
      const cutoff = new Date(BATCH.cutoffIso);
      return !Number.isNaN(cutoff.getTime()) && Date.now() >= cutoff.getTime();
    }

    function applyOrderAvailability() {
      const closed = isOrderingClosed();
      document.getElementById('orderForm').hidden = closed;
      document.getElementById('orderClosed').classList.toggle('visible', closed);
      document.getElementById('mobileCartBar').hidden = closed;
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

    function renderOrderConfirmation(orderLines, mealSubtotal, deliveryFee, discountAmount, roundedTotal, orderId, promoCode) {
      document.getElementById('successOrderId').textContent = orderId;
      document.getElementById('successOrderItems').innerHTML = orderLines.map(({ dish, tier, qty }) => {
        const tierLabel = dish.category === 'dessert' ? '' : ` (${tier === 'bulk' ? 'Bulk' : 'Lean'})`;
        const subtotal = qty * getPrice(dish, tier);
        return `<div class="success-order__item"><span>${qty}&times; ${dish.name}${tierLabel}</span><strong>$${subtotal.toFixed(2)}</strong></div>`;
      }).join('');
      document.getElementById('successSubtotal').textContent = '$' + mealSubtotal.toFixed(2);
      document.getElementById('successDeliveryFee').textContent = deliveryFee > 0 ? '$' + deliveryFee.toFixed(2) : 'Free';
      document.getElementById('successDiscountRow').hidden = discountAmount <= 0;
      document.getElementById('successDiscountCode').textContent = promoCode ? `(${promoCode})` : '';
      document.getElementById('successDiscount').textContent = '-$' + discountAmount.toFixed(2);
      document.getElementById('successTotal').textContent = '$' + roundedTotal.toFixed(2);
      document.getElementById('successStorageNote').hidden = !orderLines.some(({ dish }) => dish.laterWeek);
    }

    function changeQty(id, tier, delta) {
      const dish = allDishes().find(item => item.id === id);
      if (!dish || dish.available === false) return;
      const effectiveTier = tier === 'single' ? null : tier;
      const key = cartKey(id, effectiveTier);
      const maxQty = dish.maxQty || MAX_QTY_PER_ITEM;
      cart[key] = Math.min(maxQty, Math.max(0, (cart[key] || 0) + delta));
      document.getElementById(`qty-${id}-${tier}`).textContent = cart[key];
      const hasAnyQty = getQty(id, null) > 0 || getQty(id, 'lean') > 0 || getQty(id, 'bulk') > 0;
      document.getElementById('card-' + id).classList.toggle('has-qty', hasAnyQty);
      if (delta > 0 && effectiveTier) setDishPhoto(id, effectiveTier);
      updateSummary();
    }

    function updateSummary() {
      const ordered = getOrderLines();
      const container = document.getElementById('summaryItems');

      if (ordered.length === 0) {
        container.innerHTML = '<p class="summary-empty">Add items from the menu.</p>';
      } else {
        container.innerHTML = ordered.map(({ dish, tier, qty }) => {
          const price = getPrice(dish, tier);
          const sub   = (qty * price).toFixed(2);
          const tierLabel = dish.category !== 'dessert' ? ` <span class="summary-tier-label">(${tier.toUpperCase()})</span>` : '';
          return `<div class="summary-item">
            <span class="summary-item-name">${qty}&times; ${dish.name}${tierLabel}</span>
            <span class="summary-item-price">$${sub}</span>
          </div>`;
        }).join('');
      }

      const mealSubtotal = getMealSubtotal(ordered);
      const deliveryFee = getDeliveryFee(mealSubtotal);
      const discountAmount = discountForPromotion(appliedPromotion, mealSubtotal);
      const exactTotal = Math.max(0, mealSubtotal + deliveryFee - discountAmount);
      const roundedTotal = Math.ceil(exactTotal);
      document.getElementById('mealSubtotalDisplay').textContent = '$' + mealSubtotal.toFixed(2);
      document.getElementById('summaryTotal').textContent = '$' + roundedTotal.toFixed(2);
      document.getElementById('deliveryFeeDisplay').textContent = mealSubtotal === 0
        ? '—'
        : deliveryFee > 0 ? '$' + deliveryFee.toFixed(2) : 'Free';
      document.getElementById('discountRow').hidden = discountAmount <= 0;
      document.getElementById('discountCodeLabel').textContent = appliedPromotion ? `(${normalizePromoCode(appliedPromotion.code)})` : '';
      document.getElementById('discountDisplay').textContent = '-$' + discountAmount.toFixed(2);
      const itemCount = ordered.reduce((sum, line) => sum + line.qty, 0);
      document.getElementById('mobileCartCount').textContent = `${itemCount} ${itemCount === 1 ? 'item' : 'items'}`;
      document.getElementById('mobileCartTotal').textContent = `$${roundedTotal.toFixed(2)} total`;
      updateOrderPolicies(mealSubtotal);
    }

    function applyPromotion(showEmptyError = true) {
      const input = document.getElementById('promoCode');
      const feedback = document.getElementById('promoFeedback');
      const code = normalizePromoCode(input.value);
      input.value = code;
      feedback.classList.remove('is-valid', 'is-error');

      if (!code) {
        appliedPromotion = null;
        feedback.textContent = showEmptyError ? 'Enter a referral or partner code first.' : '';
        if (showEmptyError) feedback.classList.add('is-error');
        updateSummary();
        return;
      }

      const promotion = promotionForCode(code);
      if (!promotion) {
        appliedPromotion = null;
        feedback.textContent = 'That code is not active. Check the spelling or contact Rida.';
        feedback.classList.add('is-error');
        updateSummary();
        return;
      }

      appliedPromotion = promotion;
      const description = promotion.type === 'percent'
        ? `${Number(promotion.value)}% off`
        : `$${Number(promotion.value).toFixed(2)} off`;
      feedback.textContent = `${description} applied to this order.`;
      feedback.classList.add('is-valid');
      updateSummary();
    }

    function getMealSubtotal(ordered) {
      return ordered.reduce((sum, line) => sum + line.qty * getPrice(line.dish, line.tier), 0);
    }

    function getDeliveryFee(mealSubtotal) {
      if (mealSubtotal <= 0) return 0;
      return mealSubtotal > FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
    }

    function updateOrderPolicies(mealSubtotal) {
      const minEl = document.getElementById('minimumStatus');
      const deliveryEl = document.getElementById('deliveryStatus');

      if (!minEl || !deliveryEl) return;

      minEl.classList.toggle('is-good', mealSubtotal >= MIN_ORDER_TOTAL);
      minEl.classList.toggle('is-warning', mealSubtotal > 0 && mealSubtotal < MIN_ORDER_TOTAL);
      const amountToMinimum = Math.max(MIN_ORDER_TOTAL - mealSubtotal, 0);
      minEl.querySelector('span').textContent = mealSubtotal >= MIN_ORDER_TOTAL
        ? 'Order minimum met'
        : 'Add $' + amountToMinimum.toFixed(2) + ' more';
      minEl.querySelector('strong').textContent = mealSubtotal >= MIN_ORDER_TOTAL
        ? 'Ready to order'
        : 'to meet the $' + MIN_ORDER_TOTAL.toFixed(0) + ' minimum';

      deliveryEl.classList.toggle('is-good', mealSubtotal > FREE_DELIVERY_THRESHOLD);
      deliveryEl.classList.toggle('is-warning', mealSubtotal > 0 && mealSubtotal <= FREE_DELIVERY_THRESHOLD);
      const amountToFreeDelivery = Math.max(FREE_DELIVERY_THRESHOLD + 0.01 - mealSubtotal, 0);
      deliveryEl.querySelector('span').textContent = mealSubtotal > FREE_DELIVERY_THRESHOLD
        ? 'Free delivery applied'
        : 'Add $' + amountToFreeDelivery.toFixed(2) + ' more';
      deliveryEl.querySelector('strong').textContent = mealSubtotal > FREE_DELIVERY_THRESHOLD
        ? 'You save $' + DELIVERY_FEE.toFixed(2)
        : 'for free delivery';
    }

    // ════════════════════════════════════════
    // NAV scroll shrink
    // ════════════════════════════════════════
    window.addEventListener('scroll', () => {
      document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });

    const phoneInput = document.getElementById('phone');
    phoneInput.addEventListener('input', () => {
      let val = phoneInput.value.replace(/\D/g, '');
      if (val.length >= 6) {
        val = `(${val.slice(0,3)}) ${val.slice(3,6)}-${val.slice(6,10)}`;
      } else if (val.length >= 3) {
        val = `(${val.slice(0,3)}) ${val.slice(3)}`;
      }
      phoneInput.value = val;
    });

    // ════════════════════════════════════════
    // SUBMIT
    // ════════════════════════════════════════
    async function submitOrder() {
      if (applyOrderAvailability()) {
        alert('Orders are closed for this week. Please contact Rida if you need help.');
        return;
      }

      const firstName = document.getElementById('firstName').value.trim();
      const lastName  = document.getElementById('lastName').value.trim();
      const phone     = document.getElementById('phone').value.trim();
      const email     = document.getElementById('email').value.trim();
      const deliveryAddress = document.getElementById('deliveryAddress').value.trim();
      const deliveryCity = document.getElementById('deliveryCity').value.trim();
      const deliveryZip = document.getElementById('deliveryZip').value.trim();
      const deliveryInstructions = document.getElementById('deliveryInstructions').value.trim();
      const notes     = document.getElementById('orderNotes').value.trim();

      // Validate required client info
      let valid = true;
      let firstInvalid = null;
      [
        ['firstName', firstName], ['lastName', lastName], ['phone', phone], ['email', email],
        ['deliveryAddress', deliveryAddress], ['deliveryCity', deliveryCity], ['deliveryZip', deliveryZip],
      ].forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (!val) {
          el.classList.add('error');
          el.addEventListener('input', () => el.classList.remove('error'), { once: true });
          if (!firstInvalid) firstInvalid = el;
          valid = false;
        }
      });
      if (!valid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      const phoneDigits = phone.replace(/\D/g, '');
      if (phoneDigits.length !== 10) {
        const el = document.getElementById('phone');
        el.classList.add('error');
        el.addEventListener('input', () => el.classList.remove('error'), { once: true });
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        const el = document.getElementById('email');
        el.classList.add('error');
        el.addEventListener('input', () => el.classList.remove('error'), { once: true });
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      if (!/^\d{5}$/.test(deliveryZip)) {
        const el = document.getElementById('deliveryZip');
        el.classList.add('error');
        el.addEventListener('input', () => el.classList.remove('error'), { once: true });
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      // Must have at least one item
      const ordered = getOrderLines();
      if (ordered.length === 0) {
        alert('Please add at least one item to your order.');
        return;
      }
      const totalItems = ordered.reduce((sum, line) => sum + line.qty, 0);
      if (totalItems > MAX_TOTAL_ITEMS) {
        alert('Please text Rida directly for very large orders.');
        return;
      }

      const btn = document.getElementById('placeOrderBtn');
      btn.disabled = true;
      document.getElementById('btnText').hidden = true;
      document.getElementById('btnSpinner').hidden = false;

      const mealSubtotal = getMealSubtotal(ordered);
      const deliveryFee = getDeliveryFee(mealSubtotal);
      const discountAmount = discountForPromotion(appliedPromotion, mealSubtotal);
      const exactTotal = Math.max(0, mealSubtotal + deliveryFee - discountAmount);
      const roundedTotal = Math.ceil(exactTotal);
      if (mealSubtotal < MIN_ORDER_TOTAL) {
        alert('Minimum order is $60. Please add a few more items to place your order.');
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
        deliveryAddress,
        deliveryCity,
        deliveryZip,
        deliveryInstructions,
        items: ordered.map(({ dish, tier, qty }) => {
          const unitPrice = getPrice(dish, tier);
          return {
            id: dish.id,
            name: dish.name,
            category: dish.category,
            section: sectionOf(dish.id),
            tier: dish.category !== 'dessert' ? tier : null,
            qty,
            unitPrice,
            subtotal: parseFloat((qty * unitPrice).toFixed(2)),
          };
        }),
        mealSubtotal: parseFloat(mealSubtotal.toFixed(2)),
        deliveryFee: parseFloat(deliveryFee.toFixed(2)),
        exactTotal: parseFloat(exactTotal.toFixed(2)),
        total: roundedTotal,
        promoCode,
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        menuEmailOptIn: document.getElementById('menuEmailOptIn').checked,
        notes,
        website: document.getElementById('orderWebsite')?.value || '',
        formStartedAt: orderFormStartedAt,
        submittedAt: new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }),
        ...attributionPayload(),
      };

      try {
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
          ? `Your order is saved. We could not send the email copy, so keep the order reference below.`
          : `We emailed an itemized copy to ${email}.`;
        const confirmedDiscount = Number(result.discountAmount ?? discountAmount);
        const confirmedTotal = Number(result.total ?? roundedTotal);
        renderOrderConfirmation(ordered, mealSubtotal, deliveryFee, confirmedDiscount, confirmedTotal, orderId, result.promoCode || promoCode);
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

      } catch (err) {
        console.error(err);
        btn.disabled = false;
        document.getElementById('btnText').hidden = false;
        document.getElementById('btnSpinner').hidden = true;
        alert(err.message || 'Something went wrong. Please text Rida at (469) 545-0781.');
      }
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
      const photoButton = event.target.closest('.photo-tier-btn');
      if (photoButton) {
        setDishPhoto(photoButton.dataset.dishId, photoButton.dataset.photoTier);
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

    document.getElementById('placeOrderBtn').addEventListener('click', submitOrder);
    document.getElementById('applyPromoBtn').addEventListener('click', () => applyPromotion());
    document.getElementById('promoCode').addEventListener('input', () => {
      if (appliedPromotion && normalizePromoCode(appliedPromotion.code) !== normalizePromoCode(document.getElementById('promoCode').value)) {
        appliedPromotion = null;
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
    const hasActivePromotions = (PROMOTIONS.codes || []).some(promotion =>
      promotionForCode(promotion && promotion.code)
    );
    document.querySelector('.promo-field').hidden = !hasActivePromotions;
    document.querySelector('.order-growth-fields').classList.toggle('has-no-promotions', !hasActivePromotions);
    try {
      const savedPromoCode = sessionStorage.getItem('promo_code');
      if (savedPromoCode) {
        document.getElementById('promoCode').value = savedPromoCode;
        if (promotionForCode(savedPromoCode)) applyPromotion(false);
      }
    } catch {
      // Ordering remains available when storage is unavailable.
    }
    updateSummary();
    applyOrderAvailability();
    setInterval(applyOrderAvailability, 60000);
