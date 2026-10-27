(function () {
  'use strict';

  const $ = id => document.getElementById(id);
  const token = new URLSearchParams(location.search).get('t') || '';
  let meals = [];
  let rewardProgress = {uniqueDishCount:0,every:6,amount:5,remaining:6,identityReview:false};
  let saveTimer = null;
  let saving = false;
  let queuedSave = false;
  const state = { overallNote:'', testimonialConsent:false, testimonialDisplay:'first-name' };

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[char]);
  }

  function errorScreen(title, copy) {
    const view = $('loadState');
    view.classList.add('is-error');
    view.querySelector('h1').textContent = title;
    view.querySelector('p').textContent = copy;
  }

  function mealKey(meal) { return `${meal.id}:${meal.tier}`; }
  function isMealComplete(meal) {
    const value = state[mealKey(meal)] || {};
    return Number.isInteger(value.score) && String(value.liked || '').trim().length >= 8;
  }
  function writtenCommentExists() {
    return meals.some(meal => state[mealKey(meal)]?.liked || state[mealKey(meal)]?.change) || state.overallNote.trim();
  }

  function payload(finalize) {
    return {
      action:'save', token, finalize,
      meals:meals.flatMap(meal => {
        const value = state[mealKey(meal)] || {};
        return Number.isInteger(value.score) ? [{ id:meal.id, tier:meal.tier, score:value.score, liked:value.liked || '', change:value.change || '' }] : [];
      }),
      overallNote:state.overallNote,
      testimonialConsent:state.testimonialConsent,
      testimonialDisplay:state.testimonialDisplay,
    };
  }

  async function save(finalize = false) {
    if (saving) { queuedSave = true; return null; }
    saving = true;
    $('saveStatus').textContent = finalize ? 'Finishing your feedback...' : 'Saving...';
    $('saveStatus').classList.remove('is-error');
    try {
      const response = await fetch('/api/feedback', {
        method:'POST', headers:{ 'content-type':'application/json', accept:'application/json' },
        body:JSON.stringify(payload(finalize)),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Your feedback could not be saved.');
      applySavedResult(result);
      $('saveStatus').textContent = finalize ? 'Feedback saved.' : 'Saved privately.';
      return result;
    } catch (error) {
      $('saveStatus').textContent = `${error.message} Please try again.`;
      $('saveStatus').classList.add('is-error');
      return null;
    } finally {
      saving = false;
      if (queuedSave) { queuedSave = false; save(false); }
    }
  }

  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => save(false), 500);
  }

  function refreshCard(article, meal) {
    const value = state[mealKey(meal)] || {};
    const complete = isMealComplete(meal);
    const help = article.querySelector('.field-help');
    article.querySelector('.saved-state').textContent = complete ? 'Review complete' : value.score ? 'Rating saved, note needed' : 'Choose 1–10';
    help.textContent = String(value.liked || '').trim().length >= 8 ? 'Response saved' : 'Required, minimum 8 characters';
    help.classList.toggle('is-valid', String(value.liked || '').trim().length >= 8);
  }

  function refreshProgress() {
    const rated = meals.filter(meal => Number.isInteger(state[mealKey(meal)]?.score)).length;
    const completed = meals.filter(isMealComplete).length;
    $('progressText').textContent = `${completed} of ${meals.length} reviews complete`;
    $('scoreText').textContent = `${rated} of ${meals.length} ratings selected`;
    $('progressFill').style.width = `${meals.length ? completed / meals.length * 100 : 0}%`;
    $('rewardText').textContent = 'Each completed dish counts on its own';
    $('doneButton').disabled = false;
    $('doneButton').textContent = 'Save feedback and optional note';
    $('consentCard').classList.toggle('is-visible', Boolean(writtenCommentExists()));
    document.querySelectorAll('.meal-card').forEach((article,index) => refreshCard(article,meals[index]));
  }

  function mealCard(meal,index) {
    const value = state[mealKey(meal)] || {};
    const article = document.createElement('article');
    article.className = 'meal-card';
    const image = meal.image || '/assets/images/favicon-1024-google.png';
    article.innerHTML = `<div class="meal-header"><img class="meal-image" src="${escapeHtml(image)}" alt="${escapeHtml(meal.name)}"><div class="meal-heading"><span class="tier">${escapeHtml(meal.portionLabel || meal.tier.toUpperCase())}</span><h2>${index + 1}. ${escapeHtml(meal.name)}</h2><p>${meal.quantity} ordered &middot; ${meal.alreadyCounted ? 'Already counted for rewards. Updates are welcome.' : 'Rate this dish once'}</p></div></div><div class="rating-area"><div class="rating-question"><strong>How was it?</strong><span class="saved-state">Choose 1&ndash;10</span></div><div class="score-grid" role="group" aria-label="Score ${escapeHtml(meal.name)} from 1 to 10">${Array.from({length:10},(_,i) => `<button class="score-button" type="button" data-score="${i + 1}" aria-label="${i + 1} out of 10" aria-pressed="${value.score === i + 1}">${i + 1}</button>`).join('')}</div><div class="score-anchors"><span>Not for me</span><span>Loved it</span></div><div class="notes" ${value.score || value.liked || value.change ? '' : 'hidden'}><label class="feedback-prompt"><span class="prompt-row"><strong>Your honest review</strong><span class="required-mark">Required</span></span><textarea data-note="liked" required minlength="8" maxlength="500" aria-required="true" placeholder="What worked, or what would you change?">${escapeHtml(value.liked || '')}</textarea><span class="field-help">Required, minimum 8 characters</span></label><label class="feedback-prompt"><span class="prompt-row"><strong>Anything else to improve?</strong><span class="optional-mark">Optional</span></span><textarea data-note="change" maxlength="500" placeholder="Skip this if you would not change anything">${escapeHtml(value.change || '')}</textarea></label></div></div>`;
    article.querySelector('.meal-image').addEventListener('error', event => { event.currentTarget.src = '/assets/images/favicon-1024-google.png'; }, { once:true });
    article.querySelectorAll('.score-button').forEach(button => button.addEventListener('click', () => {
      const key = mealKey(meal);
      state[key] ||= {};
      state[key].score = Number(button.dataset.score);
      article.querySelectorAll('.score-button').forEach(item => item.setAttribute('aria-pressed',String(item === button)));
      const notes = article.querySelector('.notes');
      notes.hidden = false;
      refreshProgress();
      scheduleSave();
      if (!state[key].liked) notes.querySelector('[data-note="liked"]').focus();
    }));
    article.querySelectorAll('textarea[data-note]').forEach(textarea => textarea.addEventListener('input', () => {
      const key = mealKey(meal);
      state[key] ||= {};
      state[key][textarea.dataset.note] = textarea.value;
      refreshProgress();
      scheduleSave();
    }));
    return article;
  }

  function hydrate(order) {
    meals = order.meals;
    rewardProgress = order.rewardProgress || rewardProgress;
    meals.forEach(meal => { if (meal.feedback) state[mealKey(meal)] = meal.feedback; });
    state.overallNote = order.overallNote || '';
    state.testimonialConsent = order.testimonialConsent === true;
    state.testimonialDisplay = order.testimonialDisplay || 'first-name';
    $('customerGreeting').textContent = `Hey, ${order.customerFirstName}`;
    $('introCopy').textContent = `Your ${meals.length} unique dish${meals.length === 1 ? ' is' : 'es are'} ready below. Review any dishes you have tried. Give each a 1–10 rating and a short, honest review. All scores count equally. Each completed dish saves and counts on its own.`;
    renderRewardProgress();
    $('completionCopy').textContent = `This order note and testimonial permission are optional and save separately. Each dish counts when it has a score and a short review of at least 8 characters. You can return to the other dishes later.`;
    meals.forEach((meal,index) => $('mealList').appendChild(mealCard(meal,index)));
    $('overallNote').value = state.overallNote;
    $('testimonialConsent').checked = state.testimonialConsent;
    $('displayOptions').classList.toggle('is-visible',state.testimonialConsent);
    const display = document.querySelector(`input[name="display"][value="${state.testimonialDisplay}"]`);
    if (display) display.checked = true;
    $('loadState').hidden = true;
    $('feedbackExperience').hidden = false;
    refreshProgress();
  }

  function applySavedResult(result) {
    if (result.rewardProgress) { rewardProgress = result.rewardProgress; renderRewardProgress(); }
    const credit = result.credit || {};
    $('rewardNotice').classList.toggle('is-confirmed', Boolean(credit.earned));
    if (credit.earned) {
      $('rewardNotice').textContent = `$${Number(credit.amount).toFixed(0)} credit earned and recorded.${credit.status === 'queued' ? ' Credit above the $30 active-wallet cap is queued.' : ''}`;
    } else if (credit.status === 'pending') {
      $('rewardNotice').textContent = 'Reviews saved. Reward processing needs another attempt. Use Save feedback to retry.';
    } else if (credit.status === 'identity-review') {
      $('rewardNotice').textContent = 'Reviews saved. Contact PRPD to link this order to your rewards.';
    } else if (credit.alreadyRecorded?.length) {
      $('rewardNotice').textContent = 'Your reached rewards are already recorded. Repeated dishes do not add another count.';
    }
  }

  function renderRewardProgress() {
    $('rewardHeadline').textContent = '$5 for every 6 different dishes reviewed';
    const count = Math.max(0, Number(rewardProgress.uniqueDishCount) || 0);
    const every = Math.max(1, Number(rewardProgress.every) || 6);
    const next = (Math.floor(count / every) + 1) * every;
    const current = count % every;
    const needsIdentity = rewardProgress.identityReview === true;
    $('uniqueDishTotal').textContent = needsIdentity ? 'Link account' : String(count);
    $('nextMilestone').textContent = needsIdentity ? 'Not linked yet' : `${next} dishes`;
    const meter = $('lifetimeMeter');
    meter.hidden = needsIdentity;
    meter.setAttribute('aria-valuemax', String(every));
    meter.setAttribute('aria-valuenow', String(current));
    meter.setAttribute('aria-valuetext', `${current} of ${every} different dishes toward the next reward`);
    Array.from(meter.children).forEach((mark, index) => {
      mark.classList.toggle('is-counted', index < current);
      mark.setAttribute('aria-hidden', 'true');
    });
    $('lifetimeProgress').textContent = needsIdentity
      ? 'Your reviews still save. Contact PRPD to link this order to your rewards.'
      : `${count} different dishes counted across your orders. ${rewardProgress.remaining} more to your next $5 credit.`;
  }

  function showCompletion(result) {
    const credit = result.credit || {};
    $('successTitle').textContent = credit.earned ? `You earned $${Number(credit.amount).toFixed(0)} in PRPD credit.` : 'Your feedback is saved.';
    $('successCopy').textContent = credit.earned
      ? 'Thank you for your honest reviews. Your progress carries across delivered orders.'
      : 'Thank you. Repeated dishes do not add another reward count. Your progress carries across delivered orders.';
    $('creditDetail').textContent = credit.status === 'identity-review'
      ? 'Contact PRPD to link this order to your rewards. Your reviews have been saved.'
      : credit.status === 'pending'
        ? 'Your reviews are saved. Reward processing needs another attempt. Finish again to retry safely.'
        : credit.status === 'queued'
          ? 'Credit above the $30 active-wallet cap is recorded and queued. Credits are valid for 90 days.'
          : credit.earned
            ? 'Credits are valid for 90 days. Credit is not cash, is not transferable, and cannot be combined with Welcome10 or another promotion.'
            : (credit.alreadyRecorded?.length ? 'Reached rewards are already recorded. ' : '') + (rewardProgress.identityReview ? 'Contact PRPD to link your rewards.' : `${rewardProgress.uniqueDishCount} different dishes counted. ${rewardProgress.remaining} more to your next $5 credit.`);
    if (credit.status === 'pending') {
      $('doneButton').disabled = false;
      $('doneButton').textContent = 'Retry reward processing';
    }
    $('success').classList.add('is-visible');
    $('success').focus();
    $('success').scrollIntoView({ behavior:'smooth', block:'center' });
  }

  $('overallNote').addEventListener('input', () => { state.overallNote = $('overallNote').value; refreshProgress(); scheduleSave(); });
  $('testimonialConsent').addEventListener('change', () => {
    state.testimonialConsent = $('testimonialConsent').checked;
    $('displayOptions').classList.toggle('is-visible',state.testimonialConsent);
    scheduleSave();
  });
  document.querySelectorAll('input[name="display"]').forEach(option => option.addEventListener('change', () => { state.testimonialDisplay = option.value; scheduleSave(); }));
  $('doneButton').addEventListener('click', async () => {
    if ($('doneButton').disabled) return;
    clearTimeout(saveTimer);
    $('doneButton').disabled = true;
    while (saving) await new Promise(resolve => setTimeout(resolve,50));
    const result = await save(true);
    if (!result?.finalized) { refreshProgress(); return; }
    showCompletion(result);
  });

  (async () => {
    if (!/^[A-Za-z0-9_-]{40,60}$/.test(token)) return errorScreen('Link not found','This private feedback link is invalid. Please use the QR from your PRPD bag.');
    try {
      const response = await fetch(`/api/feedback?t=${encodeURIComponent(token)}`, { headers:{ accept:'application/json' }, cache:'no-store' });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 425) return errorScreen('Ready after delivery',`Your feedback page will open after ${result.availableOn || 'delivery'}. Keep this label and scan it once you have tried your meals.`);
        return errorScreen('Link unavailable',result.error || 'This private feedback link is no longer available.');
      }
      hydrate(result.order);
    } catch {
      errorScreen('Could not load','We could not load your meals right now. Please check your connection and try this QR again.');
    }
  })();
})();
