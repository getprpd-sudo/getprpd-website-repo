/* ═══════════════════════════════════════════
   PRPD — script.js
   ═══════════════════════════════════════════ */

// ── Google Apps Script endpoint
// Replace this URL after you deploy the Apps Script (see README)
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzSZRlD1Aq0MKETNC4k9HDMEPjJfDMBVGFWKPTf3facS3XYEfSNG3XGC30cUkzS2l4C/exec';

// Capture ad/source attribution so paid leads can be traced in Google Sheets.
const ATTRIBUTION_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

function captureAttribution() {
  const params = new URLSearchParams(window.location.search);

  ATTRIBUTION_KEYS.forEach(key => {
    const value = params.get(key);
    if (value) sessionStorage.setItem(key, value);
  });

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
  };
}

captureAttribution();

// ════════════════════════════════
// NAV — scroll shrink
// ════════════════════════════════
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

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
  '.value-feat, .step, .menu-card, .about__text, .about__images, .form-wrap'
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

  const pct = (n / TOTAL_STEPS) * 100;
  progressFill.style.width = pct + '%';
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
    referralInsightGroup.style.display = (val === 'Mosque' || val === 'Gym') ? 'block' : 'none';
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
    const phoneDigits = phoneEl.value.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
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
        group.style.outline = '1.5px solid rgba(224,112,112,0.6)';
        group.style.borderRadius = '12px';
        group.style.padding = '6px';
        setTimeout(() => { group.style.outline = ''; group.style.padding = ''; }, 2000);
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
    let val = phoneInput.value.replace(/\D/g, '');
    if (val.length >= 6) {
      val = `(${val.slice(0,3)}) ${val.slice(3,6)}-${val.slice(6,10)}`;
    } else if (val.length >= 3) {
      val = `(${val.slice(0,3)}) ${val.slice(3)}`;
    }
    phoneInput.value = val;
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
    if (document.getElementById('hpWebsite')?.value) {
      form.style.display = 'none';
      document.getElementById('formSuccess').style.display = 'block';
      document.querySelector('.form-progress').style.display = 'none';
      return;
    }

    const submitBtn  = document.getElementById('submitBtn');
    const btnText    = submitBtn.querySelector('.btn-text');
    const btnSpinner = submitBtn.querySelector('.btn-spinner');

    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnSpinner.style.display = 'inline';

    // Collect multi-select dietary restrictions
    const selectedRestrictions = [...document.querySelectorAll('#restrictionsGroup .multi-choice.multi-selected')]
      .map(b => b.dataset.value)
      .join(', ') || 'None selected';

    const data = {
      fullName:         document.getElementById('fullName').value.trim(),
      phone:            document.getElementById('phone').value.trim(),
      location:         document.getElementById('location').value.trim(),
      referral:         document.getElementById('referral').value,
      referralInsight:  document.getElementById('referralInsight')?.value.trim() || '',
      fitnessGoal:      document.getElementById('fitnessGoalVal').value,
      restrictions:     selectedRestrictions,
      notes:            document.getElementById('notes').value.trim(),
      submittedAt:      new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }),
      ...getAttributionData(),
    };

    try {
      if (APPS_SCRIPT_URL === 'YOUR_APPS_SCRIPT_URL_HERE') {
        console.log('Form data (dev mode):', data);
        await new Promise(r => setTimeout(r, 800));
      } else {
        await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      }

      form.style.display = 'none';
      document.getElementById('formSuccess').style.display = 'block';
      document.querySelector('.form-progress').style.display = 'none';
      progressFill.style.width = '100%';

      // TikTok Pixel — fire conversion events on successful form submission
      if (typeof ttq !== 'undefined') {
        ttq.track('CompleteRegistration', {
          contents: [{ content_id: 'prpd-intake-form', content_name: 'PRPD Intake Form' }]
        });
        ttq.track('Lead', {
          contents: [{ content_id: 'prpd-intake-form', content_name: 'PRPD Intake Form' }]
        });
      }

    } catch (err) {
      console.error('Submission error:', err);
      btnText.style.display = 'inline';
      btnSpinner.style.display = 'none';
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
