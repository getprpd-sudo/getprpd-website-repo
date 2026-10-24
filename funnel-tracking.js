(function initializePrpdFunnel(windowObject, documentObject) {
  'use strict';

  const ATTRIBUTION_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  const GOOGLE_CLICK_KEYS = ['gclid', 'gbraid', 'wbraid'];
  const EVENT_NAMES = new Set([
    'landing_view', 'landing_engaged', 'menu_view', 'menu_engaged', 'menu_click',
    'menu_filter', 'meal_engaged', 'social_proof_play', 'social_proof_complete',
    'cart_started', 'cart_restored', 'begin_checkout', 'checkout_blocked',
    'fulfillment_selected', 'delivery_quote', 'delivery_blocked',
    'promo_applied', 'promo_rejected', 'order_submit', 'order_error',
    'purchase', 'lead_submit', 'contact_click',
  ]);
  const memory = new Map();

  function storageGet(key) {
    try { return windowObject.sessionStorage.getItem(key) || ''; } catch { return memory.get(key) || ''; }
  }

  function storageSet(key, value) {
    try { windowObject.sessionStorage.setItem(key, value); } catch { memory.set(key, value); }
  }

  function randomHex(bytesLength = 12) {
    const bytes = new Uint8Array(bytesLength);
    windowObject.crypto.getRandomValues(bytes);
    return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('').toUpperCase();
  }

  function captureAttribution() {
    const params = new URLSearchParams(windowObject.location.search);
    for (const key of [...ATTRIBUTION_KEYS, ...GOOGLE_CLICK_KEYS]) {
      const value = params.get(key);
      if (value) {
        const bounded = value.slice(0, key.endsWith('clid') ? 500 : 160);
        storageSet(`prpd_${key}`, bounded);
        // Keep the existing order attribution payload in sync across page navigation.
        storageSet(key, bounded);
      }
    }
    if (GOOGLE_CLICK_KEYS.some(key => params.get(key))) {
      if (!storageGet('prpd_utm_source')) {
        storageSet('prpd_utm_source', 'google');
        storageSet('utm_source', 'google');
      }
      if (!storageGet('prpd_utm_medium')) {
        storageSet('prpd_utm_medium', 'cpc');
        storageSet('utm_medium', 'cpc');
      }
    }
    const referral = params.get('ref') || params.get('promo');
    if (referral) {
      const normalizedReferral = String(referral)
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9_-]/g, '')
        .slice(0, 32);
      if (normalizedReferral) {
        storageSet('promo_code', normalizedReferral);
        if (!storageGet('prpd_utm_source')) {
          storageSet('prpd_utm_source', 'referral');
          storageSet('utm_source', 'referral');
          storageSet('prpd_utm_medium', 'partner');
          storageSet('utm_medium', 'partner');
        }
      }
    }
    if (!storageGet('landing_page')) storageSet('landing_page', windowObject.location.href.slice(0, 500));
    if (documentObject.referrer && !storageGet('referrer')) storageSet('referrer', documentObject.referrer.slice(0, 500));
  }

  function isGoogleAcquisition() {
    const source = storageGet('prpd_utm_source').toLowerCase();
    return source === 'google' || GOOGLE_CLICK_KEYS.some(key => storageGet(`prpd_${key}`));
  }

  function hasCampaignAttribution() {
    return Boolean(
      storageGet('prpd_utm_source') ||
      storageGet('prpd_utm_campaign') ||
      storageGet('promo_code') ||
      GOOGLE_CLICK_KEYS.some(key => storageGet(`prpd_${key}`))
    );
  }

  function sessionId() {
    let id = storageGet('prpd_funnel_session');
    if (!/^PRPD-FS-[A-F0-9]{24}$/.test(id)) {
      id = `PRPD-FS-${randomHex()}`;
      storageSet('prpd_funnel_session', id);
    }
    return id;
  }

  function deviceCategory() {
    const width = Math.max(documentObject.documentElement?.clientWidth || 0, windowObject.innerWidth || 0);
    if (width && width < 768) return 'mobile';
    if (width && width < 1100) return 'tablet';
    return width ? 'desktop' : 'unknown';
  }

  function currentPage() {
    const page = windowObject.location.pathname.replace(/\/$/, '') || '/';
    return ['/', '/order', '/halal-meal-prep-dfw'].includes(page) ? page : '/';
  }

  function safeDetail(value) {
    return String(value || '').replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, 120);
  }

  function track(eventName, options = {}) {
    if (!EVENT_NAMES.has(eventName) || !hasCampaignAttribution()) return false;
    const detail = safeDetail(options.detail);
    const dedupeKey = `prpd_funnel_sent_${eventName}${options.repeatable ? `_${detail}` : ''}`;
    if (!options.repeatable && storageGet(dedupeKey)) return false;

    const batch = Number(windowObject.PRPD_ORDER_CONFIG?.batch?.number || 0);
    const value = Number(options.value || 0);
    const payload = {
      action: 'funnel-event',
      eventId: `PRPD-FE-${randomHex()}`,
      sessionId: sessionId(),
      event: eventName,
      page: currentPage(),
      utmSource: storageGet('prpd_utm_source'),
      utmMedium: storageGet('prpd_utm_medium'),
      utmCampaign: storageGet('prpd_utm_campaign'),
      utmContent: storageGet('prpd_utm_content'),
      utmTerm: storageGet('prpd_utm_term'),
      googleClickPresent: GOOGLE_CLICK_KEYS.some(key => storageGet(`prpd_${key}`)),
      device: deviceCategory(),
      detail,
      value: Number.isFinite(value) && value >= 0 ? value : 0,
      batch: Number.isInteger(batch) && batch >= 0 ? batch : 0,
    };

    storageSet(dedupeKey, '1');
    windowObject.fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      // Tracking must never interrupt browsing or ordering.
    });

    if (typeof windowObject.gtag === 'function') {
      windowObject.gtag('event', `prpd_${eventName}`, {
        page_path: payload.page,
        funnel_detail: detail,
        value: payload.value,
        currency: payload.value ? 'USD' : undefined,
      });
    }
    return true;
  }

  captureAttribution();
  windowObject.trackPrpdFunnelEvent = track;

  documentObject.addEventListener('DOMContentLoaded', () => {
    const stage = documentObject.body?.dataset?.funnelStage;
    if (stage === 'homepage' || stage === 'ads-landing') track('landing_view', { detail: stage });
    if (stage === 'order') track('menu_view', { detail: 'weekly-menu' });

    const engagementEvent = stage === 'order' ? 'menu_engaged' : 'landing_engaged';
    if (stage === 'homepage' || stage === 'ads-landing' || stage === 'order') {
      windowObject.setTimeout(() => {
        if (!documentObject.hidden) {
          track(engagementEvent, { detail: `${stage}-15-seconds`, repeatable: true });
        }
      }, 15_000);

      let scrollRecorded = false;
      windowObject.addEventListener('scroll', () => {
        if (scrollRecorded) return;
        const root = documentObject.documentElement;
        const scrollable = Math.max(1, (root?.scrollHeight || 0) - (windowObject.innerHeight || 0));
        const progress = Math.max(0, windowObject.scrollY || root?.scrollTop || 0) / scrollable;
        if (progress >= 0.35) {
          scrollRecorded = true;
          track(engagementEvent, { detail: `${stage}-35-percent-scroll`, repeatable: true });
        }
      }, { passive: true });
    }

    documentObject.addEventListener('click', event => {
      const link = event.target.closest('a[href^="/order"], [data-funnel-event="menu_click"]');
      if (!link) return;
      track('menu_click', { detail: link.dataset.funnelDetail || 'order-cta' });
    });

    documentObject.querySelectorAll('[data-social-proof-video]').forEach(video => {
      video.addEventListener('play', () => {
        track('social_proof_play', { detail: video.dataset.funnelDetail || 'customer-review' });
      }, { once: true });
      video.addEventListener('ended', () => {
        track('social_proof_complete', { detail: video.dataset.funnelDetail || 'customer-review' });
      }, { once: true });
    });
  });
}(window, document));
