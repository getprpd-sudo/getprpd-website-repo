const ORDER_API_URL = '/api/order';
    const { batch: BATCH, policies: POLICIES, prices: PRICES, menu: MENU, promotions: PROMOTIONS = { codes: [] } } = window.PRPD_ORDER_CONFIG;
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
    const orderFormStartedAt = Date.now();
    const ATTRIBUTION_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
    const GOOGLE_CLICK_KEYS = ['gclid', 'gbraid', 'wbraid'];
    const GOOGLE_AD_DETAIL_KEYS = ['matchtype', 'device', 'network'];
    let appliedPromotion = null;
    let fulfillmentMethod = 'delivery';
    let deliveryQuoteState = { zip: '', status: 'idle', policy: null };
    let deliveryQuoteRequest = 0;

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

    const MENU_SECTIONS = ['breakfasts', 'addons', 'mains', 'desserts'];
    const isSingleSize = dish => dish.category === 'dessert' || dish.category === 'addon';

    function allDishes() {
      return MENU_SECTIONS.flatMap(section => MENU[section] || []);
    }

    function sectionOf(id) {
      for (const sec of MENU_SECTIONS) {
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
        const availableTiers = isSingleSize(dish) ? [null] : ['lean', 'bulk'];
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
      if (Number.isFinite(Number(dish.price))) return Number(dish.price);
      const priceTier = isSingleSize(dish) ? 'single' : tier;
      return PRICES[dish.category][priceTier];
    }

    function getDishPhoto(dish) {
      return dish.image || '';
    }

    function placeholderLabel(dish, section) {
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

    function tierOrderRowHtml(dish, tier) {
      const effectiveTier = isSingleSize(dish) ? null : tier;
      const macros = effectiveTier === 'bulk' && dish.bulkMacros ? dish.bulkMacros : dish.macros;
      const label = dish.category === 'dessert' ? 'Dessert' : dish.category === 'addon' ? 'Add-on' : (tier === 'bulk' ? 'Bulk' : 'Lean');
      const price = getPrice(dish, effectiveTier);
      const keySuffix = effectiveTier || 'single';
      const fiber = macros.fiber > 0 ? ` &middot; ${macros.fiber}g fiber` : '';
      const nutrition = dish.nutritionReview
        ? `<span><strong>Nutrition update in progress</strong></span>
           <span>Final macros will be posted after the recipe review.</span>`
        : `<span><strong>${macros.cal}</strong> Calories &middot; <strong>${macros.protein}g</strong> Protein</span>
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

    // ════════════════════════════════════════
    // RENDER
    // ════════════════════════════════════════
    function renderMenu() {
      if (!IS_MENU_PUBLISHED) {
        document.getElementById('batchMeta').textContent = 'Fresh weekly menu opens every Monday.';
        document.getElementById('orderCutoff').textContent = 'Orders close Wednesday at 6:00 PM CT';
        document.getElementById('successDelivery').textContent = '';
        MENU_SECTIONS.forEach(section => {
          document.getElementById('grid-' + section).replaceChildren();
        });
        return;
      }
      document.getElementById('batchMeta').textContent =
        `Batch ${BATCH.number}  ·  Delivery ${BATCH.deliveryDate}`;
      document.getElementById('orderCutoff').textContent = BATCH.cutoffLabel;
      document.getElementById('successDelivery').textContent = BATCH.deliveryDate;

      MENU_SECTIONS.forEach(section => {
        const grid = document.getElementById('grid-' + section);
        grid.innerHTML = MENU[section].map(dish => {
          const available = dish.available !== false;
          const defaultPhoto = getDishPhoto(dish);
          const orderRows = !available
            ? '<div class="sold-out-note">Sold out for this batch</div>'
            : isSingleSize(dish)
              ? tierOrderRowHtml(dish, null)
              : tierOrderRowHtml(dish, 'lean') + tierOrderRowHtml(dish, 'bulk');
          return `
            <div class="dish-card${available ? '' : ' is-unavailable'}${defaultPhoto ? '' : ' no-photo'}${dish.category === 'addon' ? ' is-addon' : ''}" id="card-${dish.id}" data-menu-dish="${dish.id}">
              <div class="dish-img">
                ${defaultPhoto ? '<div class="dish-img__bg"><span>PRPD</span></div>' : photoPlaceholderHtml(dish, section)}
                ${dish.laterWeek ? '<span class="later-week-badge">Freezer-friendly</span>' : ''}
                ${defaultPhoto ? `<img id="dish-photo-${dish.id}"${dish.imageTone ? ` class="dish-photo--${dish.imageTone}"` : ''} src="${defaultPhoto}" alt="${dish.name}" loading="lazy" />` : ''}
                ${defaultPhoto ? photoOverlayHtml(dish, section) : ''}
              </div>
              <div class="dish-body">
                <div class="dish-name dish-name--sr">${dish.name}</div>
                ${dish.description ? `<p class="dish-desc">${dish.description}</p>` : ''}
                <div class="tier-order-list">${orderRows}</div>
              </div>
            </div>`;
        }).join('');
      });
    }

    function initMenuFilters() {
      const bar = document.getElementById('menuFilterBar');
      const empty = document.getElementById('menuFilterEmpty');
      if (!bar || !empty) return;

      const buttons = Array.from(bar.querySelectorAll('[data-menu-filter]'));
      const sections = MENU_SECTIONS
        .map(section => document.getElementById(`menu-${section}`))
        .filter(Boolean);

      function qualifies(dish, filter) {
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
        empty.hidden = visibleCount > 0 || !IS_MENU_PUBLISHED;
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
        });
      });

      if (!IS_MENU_PUBLISHED) {
        bar.hidden = true;
        sections.forEach(section => { section.hidden = true; });
        return;
      }
      applyFilter('all');
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

      setActiveSection('breakfasts');
    }

    function isOrderingClosed() {
      if (!IS_MENU_PUBLISHED) return true;
      const cutoff = new Date(BATCH.cutoffIso);
      return !Number.isNaN(cutoff.getTime()) && Date.now() >= cutoff.getTime();
    }

    function applyOrderAvailability() {
      const closed = isOrderingClosed();
      document.getElementById('orderForm').hidden = closed;
      document.getElementById('orderClosed').classList.toggle('visible', closed);
      document.getElementById('mobileCartBar').hidden = closed || getOrderLines().length === 0;
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

    function renderOrderConfirmation(orderLines, mealSubtotal, deliveryFee, discountAmount, roundedTotal, orderId, promoCode, confirmedFulfillment = fulfillmentMethod) {
      document.getElementById('successOrderId').textContent = orderId;
      document.getElementById('successOrderItems').innerHTML = orderLines.map(({ dish, tier, qty }) => {
        const tierLabel = isSingleSize(dish) ? '' : ` (${tier === 'bulk' ? 'Bulk' : 'Lean'})`;
        const subtotal = qty * getPrice(dish, tier);
        return `<div class="success-order__item"><span>${qty}&times; ${dish.name}${tierLabel}</span><strong>$${subtotal.toFixed(2)}</strong></div>`;
      }).join('');
      document.getElementById('successSubtotal').textContent = '$' + mealSubtotal.toFixed(2);
      document.getElementById('successDeliveryFee').textContent = deliveryFee > 0 ? '$' + deliveryFee.toFixed(2) : 'Free';
      const isPickup = confirmedFulfillment === 'pickup';
      document.getElementById('successFulfillmentFeeLabel').textContent = isPickup ? 'Pickup' : 'Delivery';
      document.getElementById('successScheduleLabel').textContent = isPickup ? 'Pickup week' : 'Delivery';
      document.getElementById('successFulfillmentText').textContent = isPickup
        ? `Rida will confirm payment, the ${PICKUP_CITY} pickup address, and your pickup window by text shortly.`
        : 'Rida will confirm payment and Saturday delivery by text shortly.';
      document.getElementById('successDiscountRow').hidden = discountAmount <= 0;
      document.getElementById('successDiscountCode').textContent = promoCode ? `(${promoCode})` : '';
      document.getElementById('successDiscount').textContent = '-$' + discountAmount.toFixed(2);
      document.getElementById('successTotal').textContent = '$' + roundedTotal.toFixed(2);
      document.getElementById('successStorageNote').hidden = !orderLines.some(({ dish }) => dish.laterWeek);
    }

    function changeQty(id, tier, delta) {
      const previousItemCount = getOrderLines().reduce((sum, line) => sum + line.qty, 0);
      const dish = allDishes().find(item => item.id === id);
      if (!dish || dish.available === false) return;
      const effectiveTier = tier === 'single' ? null : tier;
      const key = cartKey(id, effectiveTier);
      const maxQty = dish.maxQty || MAX_QTY_PER_ITEM;
      cart[key] = Math.min(maxQty, Math.max(0, (cart[key] || 0) + delta));
      document.getElementById(`qty-${id}-${tier}`).textContent = cart[key];
      const hasAnyQty = getQty(id, null) > 0 || getQty(id, 'lean') > 0 || getQty(id, 'bulk') > 0;
      document.getElementById('card-' + id).classList.toggle('has-qty', hasAnyQty);
      updateSummary();
      if (delta > 0 && previousItemCount === 0 && typeof window.trackPrpdFunnelEvent === 'function') {
        window.trackPrpdFunnelEvent('cart_started', {
          detail: sectionOf(id) || 'menu',
          value: getMealSubtotal(getOrderLines()),
        });
      }
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
          const tierLabel = !isSingleSize(dish) ? ` <span class="summary-tier-label">(${tier.toUpperCase()})</span>` : '';
          return `<div class="summary-item">
            <span class="summary-item-name">${qty}&times; ${dish.name}${tierLabel}</span>
            <span class="summary-item-price">$${sub}</span>
          </div>`;
        }).join('');
      }

      const mealSubtotal = getMealSubtotal(ordered);
      const quoteState = currentDeliveryQuote();
      const deliveryPolicy = currentDeliveryPolicy();
      const pricingPolicy = fulfillmentMethod === 'pickup' ? PICKUP_POLICY : (deliveryPolicy || CORE_DELIVERY_POLICY);
      const deliveryFee = getDeliveryFee(mealSubtotal, pricingPolicy);
      const discountAmount = discountForPromotion(appliedPromotion, mealSubtotal);
      const exactTotal = Math.max(0, mealSubtotal + deliveryFee - discountAmount);
      const roundedTotal = Math.ceil(exactTotal);
      document.getElementById('mealSubtotalDisplay').textContent = '$' + mealSubtotal.toFixed(2);
      document.getElementById('summaryTotal').textContent = fulfillmentMethod === 'pickup' || deliveryPolicy
        ? '$' + roundedTotal.toFixed(2)
        : 'From $' + roundedTotal.toFixed(2);
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
      const itemCount = ordered.reduce((sum, line) => sum + line.qty, 0);
      document.getElementById('mobileCartCount').textContent = `${itemCount} ${itemCount === 1 ? 'item' : 'items'}`;
      document.getElementById('mobileCartTotal').textContent = fulfillmentMethod === 'pickup' || deliveryPolicy
        ? `$${roundedTotal.toFixed(2)} total`
        : `From $${roundedTotal.toFixed(2)} · enter ZIP`;
      const mobileStatus = document.getElementById('mobileCartStatus');
      if (mobileStatus) {
        const minimumOrder = Number(pricingPolicy.minimumOrder);
        const freeDeliveryThreshold = Number(pricingPolicy.freeDeliveryThreshold);
        if (fulfillmentMethod === 'pickup' && mealSubtotal < Number(PICKUP_POLICY.minimumOrder)) {
          mobileStatus.textContent = `$${(Number(PICKUP_POLICY.minimumOrder) - mealSubtotal).toFixed(2)} to pickup minimum`;
        } else if (fulfillmentMethod === 'pickup') {
          mobileStatus.textContent = `Free ${PICKUP_CITY} pickup selected`;
        } else if (quoteState.status === 'loading') {
          mobileStatus.textContent = 'Checking delivery ZIP';
        } else if (quoteState.status === 'unsupported' || quoteState.status === 'error') {
          mobileStatus.textContent = 'Text Rida to confirm delivery';
        } else if (!deliveryPolicy) {
          mobileStatus.textContent = 'Enter ZIP for exact delivery';
        } else if (mealSubtotal < minimumOrder) {
          mobileStatus.textContent = `$${(minimumOrder - mealSubtotal).toFixed(2)} to ${pricingPolicy.label} minimum`;
        } else if (mealSubtotal < freeDeliveryThreshold) {
          mobileStatus.textContent = `$${(freeDeliveryThreshold - mealSubtotal).toFixed(2)} to free delivery`;
        } else {
          mobileStatus.textContent = 'Free delivery unlocked';
        }
      }
      document.getElementById('mobileCartBar').hidden = itemCount === 0 || isOrderingClosed();
      updateOrderPolicies(mealSubtotal, deliveryPolicy);
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
        feedback.textContent = showEmptyError ? 'Enter a referral or partner code first.' : '';
        if (showEmptyError) feedback.classList.add('is-error');
        updateSummary();
        return;
      }

      button.disabled = true;
      feedback.textContent = 'Checking code...';
      const promotion = await resolvePromotionForCode(code);
      button.disabled = false;
      if (!promotion) {
        appliedPromotion = null;
        feedback.textContent = 'That code is not active. Check the spelling or text Rida.';
        feedback.classList.add('is-error');
        updateSummary();
        return;
      }

      appliedPromotion = promotion;
      const description = promotion.type === 'percent'
        ? `${Number(promotion.value)}% off`
        : `$${Number(promotion.value).toFixed(2)} off`;
      const minimum = Math.max(MIN_ORDER_TOTAL, Number(promotion.minimumOrder) || 0);
      feedback.textContent = `${description} applied${promotion.firstOrderOnly ? ' to a first PRPD order' : ''} of $${minimum.toFixed(0)} or more.`;
      feedback.classList.add('is-valid');
      updateSummary();
    }

    function getMealSubtotal(ordered) {
      return ordered.reduce((sum, line) => sum + line.qty * getPrice(line.dish, line.tier), 0);
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
          return null;
        }
        deliveryQuoteState = { zip, status: 'ready', policy: result.policy };
        updateSummary();
        if (typeof window.trackPrpdFunnelEvent === 'function') {
          window.trackPrpdFunnelEvent('delivery_quote', {
            detail: result.policy.id || 'supported',
            value: Number(result.policy.deliveryFee || 0),
          });
        }
        return result.policy;
      } catch {
        if (requestId === deliveryQuoteRequest) {
          deliveryQuoteState = { zip, status: 'error', policy: null };
          updateSummary();
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
        const amountToMinimum = Math.max(minimumOrder - mealSubtotal, 0);
        minEl.classList.toggle('is-good', mealSubtotal >= minimumOrder);
        minEl.classList.toggle('is-warning', mealSubtotal > 0 && mealSubtotal < minimumOrder);
        minEl.querySelector('span').textContent = mealSubtotal >= minimumOrder
          ? 'Pickup minimum met'
          : 'Add $' + amountToMinimum.toFixed(2) + ' more';
        minEl.querySelector('strong').textContent = mealSubtotal >= minimumOrder
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

      minEl.classList.toggle('is-good', mealSubtotal >= minimumOrder);
      minEl.classList.toggle('is-warning', mealSubtotal > 0 && mealSubtotal < minimumOrder);
      const amountToMinimum = Math.max(minimumOrder - mealSubtotal, 0);
      minEl.querySelector('span').textContent = mealSubtotal >= minimumOrder
        ? 'Order minimum met'
        : 'Add $' + amountToMinimum.toFixed(2) + ' more';
      minEl.querySelector('strong').textContent = mealSubtotal >= minimumOrder
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
    deliveryZipInput.addEventListener('input', () => {
      deliveryZipInput.value = deliveryZipInput.value.replace(/\D/g, '').slice(0, 5);
      deliveryQuoteRequest += 1;
      deliveryQuoteState = { zip: deliveryZipInput.value, status: 'idle', policy: null };
      updateSummary();
      if (/^\d{5}$/.test(deliveryZipInput.value)) {
        deliveryPolicyForZip(deliveryZipInput.value);
      }
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

    function setFulfillmentMethod(nextMethod) {
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
        field.classList.remove('error');
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
        alert('Orders are closed for this week. Please text Rida if you need help.');
        return;
      }

      const firstName = document.getElementById('firstName').value.trim();
      const lastName  = document.getElementById('lastName').value.trim();
      const phone     = document.getElementById('phone').value.trim();
      const email     = document.getElementById('email').value.trim();
      const selectedFulfillment = fulfillmentMethod;
      const isPickup = selectedFulfillment === 'pickup';
      const deliveryAddress = isPickup ? '' : document.getElementById('deliveryAddress').value.trim();
      const deliveryHasUnit = isPickup ? false : document.getElementById('deliveryHasUnit').checked;
      const deliveryUnit = isPickup ? '' : document.getElementById('deliveryUnit').value.trim();
      const deliveryCity = isPickup ? '' : document.getElementById('deliveryCity').value.trim();
      const deliveryState = isPickup ? '' : document.getElementById('deliveryState').value.trim().toUpperCase();
      const deliveryZip = isPickup ? '' : document.getElementById('deliveryZip').value.trim();
      const deliveryInstructions = document.getElementById('deliveryInstructions').value.trim();
      const notes     = document.getElementById('orderNotes').value.trim();

      // Validate required client info
      let valid = true;
      let firstInvalid = null;
      [
        ['firstName', firstName], ['lastName', lastName], ['phone', phone], ['email', email],
        ...(!isPickup ? [
          ['deliveryAddress', deliveryAddress], ['deliveryCity', deliveryCity],
          ['deliveryState', deliveryState], ['deliveryZip', deliveryZip],
        ] : []),
        ...(deliveryHasUnit ? [['deliveryUnit', deliveryUnit]] : []),
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
      if (!window.PRPDPhoneValidation?.isValid(phone)) {
        const el = document.getElementById('phone');
        el.classList.add('error');
        el.addEventListener('input', () => el.classList.remove('error'), { once: true });
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
        el.classList.add('error');
        el.addEventListener('input', () => el.classList.remove('error'), { once: true });
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      if (!isPickup && !/^\d{5}$/.test(deliveryZip)) {
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
      const deliveryPolicy = isPickup ? PICKUP_POLICY : await deliveryPolicyForZip(deliveryZip);
      if (!deliveryPolicy) {
        alert('Automatic delivery is not available for this ZIP. Please text Rida before placing the order.');
        btn.disabled = false;
        document.getElementById('btnText').hidden = false;
        document.getElementById('btnSpinner').hidden = true;
        return;
      }
      const deliveryFee = getDeliveryFee(mealSubtotal, deliveryPolicy);
      const discountAmount = discountForPromotion(appliedPromotion, mealSubtotal);
      const exactTotal = Math.max(0, mealSubtotal + deliveryFee - discountAmount);
      const roundedTotal = Math.ceil(exactTotal);
      if (mealSubtotal < Number(deliveryPolicy.minimumOrder)) {
        alert(`The ${deliveryPolicy.label} minimum is $${Number(deliveryPolicy.minimumOrder).toFixed(0)}. Please add a few more items to place your order.`);
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
        const confirmedTotal = Number(result.total ?? roundedTotal);
        const confirmedDeliveryFee = Number(result.deliveryFee ?? deliveryFee);
        renderOrderConfirmation(ordered, mealSubtotal, confirmedDeliveryFee, confirmedDiscount, confirmedTotal, orderId, result.promoCode || promoCode, result.fulfillmentMethod || selectedFulfillment);
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
          window.trackPrpdFunnelEvent('purchase', { detail: 'confirmed-order', value: confirmedTotal });
        }

      } catch (err) {
        console.error(err);
        if (typeof window.trackPrpdFunnelEvent === 'function') {
          window.trackPrpdFunnelEvent('order_error', { detail: 'order-api', repeatable: true });
        }
        btn.disabled = false;
        document.getElementById('btnText').hidden = false;
        document.getElementById('btnSpinner').hidden = true;
        alert(err.message || 'Something went wrong. Please text Rida at (469) 545-0781.');
      }
    }

    function cartReadyForCheckout() {
      const ordered = getOrderLines();
      if (ordered.length === 0) {
        alert('Please add at least one item to your order.');
        return false;
      }
      const mealSubtotal = getMealSubtotal(ordered);
      if (mealSubtotal < MIN_ORDER_TOTAL) {
        alert(`Minimum order is $${MIN_ORDER_TOTAL}. Please add a few more items to continue.`);
        return false;
      }
      return true;
    }

    function beginCheckout() {
      const checkout = document.getElementById('checkout');
      checkout.dataset.started = 'true';
      checkout.classList.add('is-active');
      document.getElementById('btnText').textContent = 'Place Order →';
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
        alert('Orders are closed for this week. Please text Rida if you need help.');
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
    initMenuFilters();
    initMenuNavigation();
    if ('IntersectionObserver' in window) {
      const checkoutObserver = new IntersectionObserver(entries => {
        if (!entries.some(entry => entry.isIntersecting)) return;
        const checkout = document.getElementById('checkout');
        checkout.dataset.started = 'true';
        document.getElementById('btnText').textContent = 'Place Order →';
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
