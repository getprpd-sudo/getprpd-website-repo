/* ═══════════════════════════════════════════
   PRPD — script.js
   ═══════════════════════════════════════════ */

// Same-domain Vercel lead endpoint.
const LEAD_API_URL = '/api/lead';
let leadSubmissionId = null;
const leadFormStartedAt = Date.now();

function createLeadId() {
  const dateStamp = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Chicago', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date()).replace(/-/g, '');
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  const suffix = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('').toUpperCase();
  return `PRPD-LEAD-${dateStamp}-${suffix}`;
}

// Capture ad/source attribution so paid leads can be traced in Google Sheets.
const ATTRIBUTION_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

function browserCookie(name) {
  const match = document.cookie.split(';').map(value => value.trim()).find(value => value.startsWith(`${name}=`));
  if (!match) return '';
  try { return decodeURIComponent(match.slice(name.length + 1)); } catch { return ''; }
}

function captureAttribution() {
  const params = new URLSearchParams(window.location.search);

  ATTRIBUTION_KEYS.forEach(key => {
    const value = params.get(key);
    if (value) sessionStorage.setItem(key, value);
  });

  const ttclid = params.get('ttclid');
  if (ttclid) sessionStorage.setItem('tiktok_ttclid', ttclid.slice(0, 500));

  const landingPage = sessionStorage.getItem('landing_page');
  if (!landingPage) sessionStorage.setItem('landing_page', window.location.href);

  if (document.referrer && !sessionStorage.getItem('referrer')) {
    sessionStorage.setItem('referrer', document.referrer);
  }
}

function getAttributionData() {
  return {
    utmSource:   sessionStorage.getItem('utm_source') || '',
    utmMedium:   sessionStorage.getItem('utm_medium') || '',
    utmCampaign: sessionStorage.getItem('utm_campaign') || '',
    utmContent:  sessionStorage.getItem('utm_content') || '',
    utmTerm:     sessionStorage.getItem('utm_term') || '',
    landingPage: sessionStorage.getItem('landing_page') || window.location.href,
    referrer:    sessionStorage.getItem('referrer') || document.referrer || '',
    tiktokTtclid: sessionStorage.getItem('tiktok_ttclid') || '',
    tiktokTtp:    browserCookie('_ttp'),
  };
}

captureAttribution();

// Keep the homepage preview synchronized with the live weekly order configuration.
function renderWeeklyHomepage() {
  const config = window.PRPD_ORDER_CONFIG;
  if (!config) return;

  const { batch, menu, prices } = config;
  const heroCutoff = document.getElementById('heroCutoff');
  const weeklyCutoff = document.getElementById('weeklyCutoff');
  const weeklyDelivery = document.getElementById('weeklyDelivery');
  const grid = document.getElementById('homeMenuGrid');
  if (batch.published !== true) {
    if (heroCutoff) heroCutoff.textContent = 'Ordering currently closed';
    if (weeklyCutoff) weeklyCutoff.textContent = 'Next menu being finalized';
    if (weeklyDelivery) weeklyDelivery.textContent = 'Announced with the next menu';
    if (grid) grid.replaceChildren();
    return;
  }
  if (heroCutoff) heroCutoff.textContent = `${batch.cutoffLabel} cutoff`;
  if (weeklyCutoff) weeklyCutoff.textContent = batch.cutoffLabel;
  if (weeklyDelivery) weeklyDelivery.textContent = batch.deliveryDate;

  if (!grid) return;

  const preview = [...menu.mains, ...menu.breakfasts]
    .filter(dish => dish.available !== false && dish.image)
    .slice(0, 4);

  preview.forEach((dish, index) => {
    const card = document.createElement('article');
    card.className = `menu-card${index === 1 ? ' menu-card--featured' : ''}`;

    const imageWrap = document.createElement('div');
    imageWrap.className = 'menu-card__img';
    const image = document.createElement('img');
    image.src = dish.images?.lean || dish.image;
    image.alt = `${dish.name} by PRPD`;
    image.loading = 'lazy';
    const placeholder = document.createElement('div');
    placeholder.className = 'menu-card__img-ph';
    placeholder.textContent = 'PRPD';
    const photoOverlay = document.createElement('div');
    photoOverlay.className = 'menu-card__photo-overlay';
    const photoBrand = document.createElement('span');
    photoBrand.className = 'menu-card__photo-brand';
    photoBrand.textContent = 'PRPD';
    const photoCopy = document.createElement('div');
    photoCopy.className = 'menu-card__photo-copy';
    const photoType = document.createElement('span');
    photoType.textContent = menu.breakfasts.includes(dish)
      ? 'Breakfast'
      : dish.displayCategory || (dish.category === 'beef' ? 'Beef' : 'High-protein meal');
    const photoName = document.createElement('strong');
    photoName.textContent = dish.name;
    photoCopy.append(photoType, photoName);
    photoOverlay.append(photoBrand, photoCopy);
    image.addEventListener('error', () => { image.hidden = true; });
    imageWrap.append(image, placeholder, photoOverlay);

    const body = document.createElement('div');
    body.className = 'menu-card__body';
    const badges = document.createElement('div');
    badges.className = 'menu-card__badges';
    const halalBadge = document.createElement('span');
    halalBadge.className = 'badge badge--halal';
    halalBadge.textContent = 'Halal';
    const priceBadge = document.createElement('span');
    priceBadge.className = 'badge badge--breakfast';
    const tierPrice = prices[dish.category]?.lean ?? prices[dish.category]?.single;
    priceBadge.textContent = `From $${Number(tierPrice).toFixed(2)}`;
    badges.append(halalBadge, priceBadge);

    const name = document.createElement('h3');
    name.className = 'menu-card__name menu-card__name--sr';
    name.textContent = dish.name;
    const description = document.createElement('p');
    description.className = 'menu-card__desc';
    description.textContent = dish.description;

    const macros = document.createElement('div');
    macros.className = 'menu-card__macros';
    const calories = document.createElement('div');
    calories.className = 'macro';
    calories.innerHTML = `<span class="macro__val">${dish.macros.cal}</span><span class="macro__label">cal</span>`;
    const protein = document.createElement('div');
    protein.className = 'macro macro--highlight';
    protein.innerHTML = `<span class="macro__val">${dish.macros.protein}g</span><span class="macro__label">protein</span>`;
    macros.append(calories, protein);

    body.append(badges, name, description, macros);
    card.append(imageWrap, body);
    grid.append(card);
  });
}

renderWeeklyHomepage();

// ════════════════════════════════
// NAV — scroll shrink
// ════════════════════════════════
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

document.querySelectorAll('.js-hide-on-error').forEach(image => {
  image.addEventListener('error', () => { image.hidden = true; });
});

// ════════════════════════════════
// SCROLL ANIMATIONS
// ════════════════════════════════
// Hero elements animate in immediately on load
const heroEls = document.querySelectorAll('.hero__content, .hero__visual');
heroEls.forEach((el, i) => {
  el.classList.add('fade-up');
  setTimeout(() => el.classList.add('visible'), 120 + i * 140);
});

// All other sections animate on scroll
const fadeEls = document.querySelectorAll(
  '.weekly-order__copy, .weekly-order__details, .weekly-order__cta, .value-feat, .step, .menu-card, .about__text, .about__images, .form-menu-route, .form-wrap'
);
fadeEls.forEach(el => el.classList.add('fade-up'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const siblings = [...entry.target.parentElement.children].filter(c => c.classList.contains('fade-up'));
      const idx = siblings.indexOf(entry.target);
      setTimeout(() => entry.target.classList.add('visible'), idx * 90);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });

fadeEls.forEach(el => observer.observe(el));

// A small desktop-only parallax response keeps the hero feeling tactile without
// interfering with touch scrolling or reduced-motion preferences.
const heroVisual = document.querySelector('.hero__visual');
const heroCluster = document.querySelector('.hero__cluster');
const canUsePointerMotion = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (heroVisual && heroCluster && canUsePointerMotion) {
  heroVisual.addEventListener('pointermove', event => {
    const rect = heroVisual.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 12;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 12;
    heroCluster.animate(
      [{ transform: `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)` }],
      { duration: 350, fill: 'forwards', easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' }
    );
  });

  heroVisual.addEventListener('pointerleave', () => {
    heroCluster.animate(
      [{ transform: 'translate3d(0, 0, 0)' }],
      { duration: 350, fill: 'forwards', easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' }
    );
  });
}

// ════════════════════════════════
// MULTI-STEP FORM
// ════════════════════════════════
const form          = document.getElementById('prpdForm');
const progressFill  = document.getElementById('progressFill');
const progressLabel = document.getElementById('progressLabel');
const TOTAL_STEPS   = 4;
let currentStep = 1;

function goToStep(n) {
  const current = document.querySelector(`.form-step[data-step="${currentStep}"]`);
  const next    = document.querySelector(`.form-step[data-step="${n}"]`);
  if (!next) return;

  current.classList.remove('active');
  next.classList.add('active');
  currentStep = n;

  progressFill.classList.remove('step-1', 'step-2', 'step-3', 'step-4');
  progressFill.classList.add(`step-${n}`);
  progressLabel.textContent = `Step ${n} of ${TOTAL_STEPS}`;

  document.querySelector('.form-wrap').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Next buttons
document.querySelectorAll('.form-next').forEach(btn => {
  btn.addEventListener('click', () => {
    if (validateStep(currentStep)) goToStep(parseInt(btn.dataset.next));
  });
});

// Back buttons
document.querySelectorAll('.form-back').forEach(btn => {
  btn.addEventListener('click', () => goToStep(parseInt(btn.dataset.back)));
});

// ── Single-select choice pills
document.querySelectorAll('.choice-group:not(#restrictionsGroup)').forEach(group => {
  const hiddenInput = group.nextElementSibling;
  group.querySelectorAll('.choice:not(.multi-choice)').forEach(btn => {
    btn.addEventListener('click', () => {
      group.querySelectorAll('.choice').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      if (hiddenInput && hiddenInput.type === 'hidden') {
        hiddenInput.value = btn.dataset.value;
      }
    });
  });
});

// ── Multi-select dietary restrictions
const restrictionsGroup = document.getElementById('restrictionsGroup');
if (restrictionsGroup) {
  restrictionsGroup.querySelectorAll('.multi-choice').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.value === 'None') {
        // Deselect all others
        restrictionsGroup.querySelectorAll('.multi-choice').forEach(b => b.classList.remove('multi-selected'));
        btn.classList.add('multi-selected');
      } else {
        // Deselect "None" if selecting anything else
        restrictionsGroup.querySelectorAll('.multi-choice').forEach(b => {
          if (b.dataset.value === 'None') b.classList.remove('multi-selected');
        });
        btn.classList.toggle('multi-selected');
      }
    });
  });
}

// ── Referral insight toggle (show when Mosque or Gym selected)
const referralSelect = document.getElementById('referral');
const referralInsightGroup = document.getElementById('referralInsightGroup');
if (referralSelect) {
  referralSelect.addEventListener('change', () => {
    const val = referralSelect.value;
    referralInsightGroup.hidden = val !== 'Mosque' && val !== 'Gym';
  });
}

// ── Validation
function validateStep(step) {
  let valid = true;

  if (step === 1) {
    ['fullName', 'phone', 'location'].forEach(id => {
      const el = document.getElementById(id);
      if (!el.value.trim()) {
        el.classList.add('error');
        el.addEventListener('input', () => el.classList.remove('error'), { once: true });
        valid = false;
      }
    });
    const phoneEl = document.getElementById('phone');
    if (!window.PRPDPhoneValidation?.isValid(phoneEl.value)) {
      phoneEl.classList.add('error');
      phoneEl.addEventListener('input', () => phoneEl.classList.remove('error'), { once: true });
      valid = false;
    }
    if (!document.getElementById('referral').value) {
      document.getElementById('referral').classList.add('error');
      valid = false;
    }
  }

  if (step === 2) {
    const el = document.getElementById('fitnessGoalVal');
    if (!el.value) {
      const group = document.getElementById('fitnessGoal');
      if (group) {
        group.classList.add('validation-pulse');
        setTimeout(() => group.classList.remove('validation-pulse'), 2000);
      }
      valid = false;
    }
  }

  return valid;
}

// ── Phone auto-format
const phoneInput = document.getElementById('phone');
if (phoneInput) {
  phoneInput.addEventListener('input', () => {
    phoneInput.value = window.PRPDPhoneValidation?.format(phoneInput.value) || phoneInput.value;
  });
}

// ════════════════════════════════
// FORM SUBMISSION
// ════════════════════════════════
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    for (let step = 1; step <= TOTAL_STEPS; step++) {
      if (!validateStep(step)) {
        goToStep(step);
        return;
      }
    }

    // ── Honeypot: if a bot filled the hidden field, silently bail
    const submitBtn  = document.getElementById('submitBtn');
    const btnText    = submitBtn.querySelector('.btn-text');
    const btnSpinner = submitBtn.querySelector('.btn-spinner');

    submitBtn.disabled = true;
    btnText.hidden = true;
    btnSpinner.hidden = false;

    // Collect multi-select dietary restrictions
    const selectedRestrictions = [...document.querySelectorAll('#restrictionsGroup .multi-choice.multi-selected')]
      .map(b => b.dataset.value)
      .join(', ') || 'None selected';

    const data = {
      action:           'lead',
      leadId:           leadSubmissionId || (leadSubmissionId = createLeadId()),
      fullName:         document.getElementById('fullName').value.trim(),
      phone:            document.getElementById('phone').value.trim(),
      location:         document.getElementById('location').value.trim(),
      referral:         document.getElementById('referral').value,
      referralInsight:  document.getElementById('referralInsight')?.value.trim() || '',
      fitnessGoal:      document.getElementById('fitnessGoalVal').value,
      restrictions:     selectedRestrictions,
      notes:            document.getElementById('notes').value.trim(),
      website:          document.getElementById('hpWebsite')?.value || '',
      formStartedAt:    leadFormStartedAt,
      submittedAt:      new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }),
      ...getAttributionData(),
    };

    try {
      const response = await fetch(LEAD_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result || result.status !== 'success') {
        throw new Error(result && result.message ? result.message : 'The intake could not be confirmed.');
      }

      form.hidden = true;
      document.getElementById('formSuccess').hidden = false;
      document.querySelector('.form-progress').hidden = true;
      progressFill.classList.remove('step-1', 'step-2', 'step-3');
      progressFill.classList.add('step-4');

      // TikTok Pixel — fire conversion events on successful form submission
      if (typeof ttq !== 'undefined') {
        ttq.track('Lead', {
          contents: [{ content_id: 'prpd-intake-form', content_name: 'PRPD Intake Form' }]
        }, { event_id: `${data.leadId}:lead` });
      }

      if (typeof window.trackGoogleAdsCustomPlanInquiry === 'function') {
        window.trackGoogleAdsCustomPlanInquiry(result.leadId || data.leadId);
      }

    } catch (err) {
      console.error('Submission error:', err);
      btnText.hidden = false;
      btnSpinner.hidden = true;
      submitBtn.disabled = false;
      alert('Something went wrong. Please try again or reach out on Instagram @getprpd.');
    }
  });
}

// ════════════════════════════════
// SMOOTH SCROLL
// ════════════════════════════════
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ════════════════════════════════
// 360° SPIN VIEWER  (canvas + blending + inertia)
// ════════════════════════════════
(function () {
  const stage  = document.getElementById('spinStage');
  const canvas = document.getElementById('spinCanvas');
  const hint   = document.getElementById('spinHint');
  if (!stage || !canvas) return;

  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  const FRAMES       = 24;
  const BASE         = 'assets/360/halal-cart-chicken/';
  const PX_PER_FRAME = 30;     // px drag to advance one frame
  const AUTO_SPD     = 0.020;  // frames per ms — fast enough for ~20fps effective (smooth)
  const FRICTION     = 0.84;   // velocity decay per animation frame
  const RESUME_MS    = 3000;   // ms idle before auto-spin resumes

  // ── Preload all frames
  let loaded = 0;
  const imgs = Array.from({ length: FRAMES }, (_, i) => {
    const el = new Image();
    el.onload = () => { loaded++; if (loaded === 1) render(); };
    el.src = BASE + String(i + 1).padStart(3, '0') + '.webp';
    return el;
  });

  // ── State
  let pos       = 0;      // fractional frame index (0 – FRAMES)
  let vel       = 0;      // frames/ms velocity (for inertia)
  let dragging  = false;
  let lastX     = 0;
  let lastT     = 0;
  let touched   = false;
  let rafId     = null;

  // ── Render: snap to nearest frame — clean, no blur
  function render() {
    const f = ((Math.round(pos) % FRAMES) + FRAMES) % FRAMES;
    if (!imgs[f].complete) return;
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(imgs[f], 0, 0, W, H);
  }

  function wrap(n) { return ((n % FRAMES) + FRAMES) % FRAMES; }

  // ── Auto-spin (time-based via rAF for true 60 fps smoothness)
  function startAuto() {
    stopAuto();
    let last = null;
    const tick = (ts) => {
      if (dragging) return;
      if (last !== null) {
        pos = wrap(pos + AUTO_SPD * (ts - last));
        render();
      }
      last   = ts;
      rafId  = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
  }

  function stopAuto() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  }

  // ── Inertia: continue spin after drag release, decay to stop
  function runInertia() {
    stopAuto();
    const tick = () => {
      if (Math.abs(vel) < 0.0008) {
        vel = 0;
        setTimeout(startAuto, RESUME_MS);
        return;
      }
      pos = wrap(pos - vel);
      vel *= FRICTION;
      render();
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
  }

  // ── Drag handlers
  function onStart(x, t) {
    dragging = true; lastX = x; lastT = t; vel = 0;
    stopAuto();
    if (!touched) { touched = true; if (hint) hint.classList.add('hidden'); }
  }

  function onMove(x, t) {
    if (!dragging) return;
    const dx = x - lastX;
    const dt = t - lastT || 16;
    vel = (dx / PX_PER_FRAME) / dt * 16;  // frames per rAF tick (~16ms)
    pos = wrap(pos - dx / PX_PER_FRAME);
    lastX = x; lastT = t;
    render();
  }

  function onEnd() {
    if (!dragging) return;
    dragging = false;
    if (Math.abs(vel) > 0.003) runInertia();
    else setTimeout(startAuto, RESUME_MS);
  }

  // ── Events: mouse
  stage.addEventListener('mousedown',  e => { e.preventDefault(); onStart(e.clientX, e.timeStamp); });
  window.addEventListener('mousemove', e => { if (dragging) onMove(e.clientX, e.timeStamp); });
  window.addEventListener('mouseup',   onEnd);

  // ── Events: touch
  stage.addEventListener('touchstart', e => { e.preventDefault(); onStart(e.touches[0].clientX, e.timeStamp); }, { passive: false });
  stage.addEventListener('touchmove',  e => { e.preventDefault(); onMove(e.touches[0].clientX,  e.timeStamp); }, { passive: false });
  stage.addEventListener('touchend',   onEnd);

  // ── Kick off once any frame is loaded
  if (imgs[0].complete) { loaded = 1; render(); startAuto(); }
  else imgs[0].addEventListener('load', startAuto);
}());
