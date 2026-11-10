(function () {
  'use strict';

  const LABEL_DATA = window.PRPD_LABEL_DATA;
  const proofParams = new URLSearchParams(window.location.search);
  const PROOF_MODE = (proofParams.get('proof') === '1' || proofParams.get('reviewProof') === '1') && LABEL_DATA?.proofOnly === true;
  const CURRENT_REVIEW = PROOF_MODE && LABEL_DATA.currentReviewProof === true;
  const ACTIVE_BATCH = window.PRPD_ORDER_CONFIG?.batch;
  const ACTIVE_MENU = window.PRPD_ORDER_CONFIG?.menu;
  const PRODUCTION_GUARD = window.PRPD_LABEL_PRODUCTION_GUARD;
  const $ = (id) => document.getElementById(id);

  if (!LABEL_DATA?.meals || !Object.keys(LABEL_DATA.meals).length) {
    document.body.classList.add('label-print-blocked');
    $('productionGate').textContent = 'PRINT BLOCKED: the generated active-batch label dataset did not load. Run the label verifier before opening Label Studio.';
    $('printButton').disabled = true;
    $('mealSelect').innerHTML = '<option>Generated label data unavailable</option>';
    return;
  }
  const escapeHtml = (value) => String(value || '').replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  })[char]);
  const dailyValue = (value, total) => Math.round((Number(value) / total) * 100);
  const categoryOrder = ['Breakfast', 'Main', 'Premium meal', 'Dessert', 'Add-on', 'Internal custom meal'];
  const categoryLabels = { Breakfast: 'Breakfasts', Main: 'Mains', 'Premium meal': 'Premium meals', Dessert: 'Desserts', 'Add-on': 'Grab & Go Add-ons', 'Internal custom meal': 'Controlled custom meals' };
  const editableFields = [
    'netWeight', 'ingredients', 'allergens', 'storageMode', 'personality', 'storage', 'reheat',
    'satFat', 'transFat', 'cholesterol', 'sodium', 'fiber', 'sugars', 'addedSugar',
    'vitaminD', 'calcium', 'iron', 'potassium',
  ];
  const drafts = new Map();
  const selectedSheets = new Set();
  const labelQuantities = new Map();
  let activeMealId = '';
  let activeTierKey = '';
  let printPlanErrors = [];
  let bagLabels = [];
  let bagPlanErrors = [];

  function variantKey(mealId, tierKey) { return `${mealId}:${tierKey}`; }
  function currentMeal() { return LABEL_DATA.meals[activeMealId]; }
  function setPrintJob(value) {
    if (document.body.dataset) document.body.dataset.printJob = value;
    else document.body._prpdPrintJob = value;
  }
  function currentPrintJob() { return document.body.dataset?.printJob || document.body._prpdPrintJob || 'meals'; }

  function labelQuantity(key) {
    const value = Number.parseInt(labelQuantities.get(key), 10);
    return Number.isFinite(value) ? Math.min(200, Math.max(1, value)) : 1;
  }

  function displayDate(value) {
    if (!value) return '';
    const [year, month, day] = value.split('-');
    return `${month}/${day}/${year}`;
  }

  function productionForm() {
    return {
      madeDate: $('madeDate').value,
      useByDate: $('useBy').value,
      batchId: $('batchId').value,
    };
  }

  function productionValidation() {
    if (PROOF_MODE) {
      const configured = ACTIVE_BATCH?.labelProduction;
      const generated = LABEL_DATA?.production;
      const form = productionForm();
      const matches = Number(generated?.batchNumber) === Number(ACTIVE_BATCH?.number)
        && configured?.madeDate === generated?.madeDate && configured?.useByDate === generated?.useByDate
        && configured?.batchId === generated?.batchId && form.madeDate === generated?.madeDate
        && form.useByDate === generated?.useByDate && form.batchId === generated?.batchId;
      return { ok: matches && !printPlanErrors.length, errors: matches ? [...printPlanErrors] : ['Label batch identity does not match the active production batch.', ...printPlanErrors] };
    }
    if (!PRODUCTION_GUARD?.validateLabelProduction) {
      return { ok: false, errors: ['The label production safety guard did not load.'] };
    }
    const netWeightOverrides = {};
    selectedSheets.forEach((key) => {
      const [mealId, tierKey] = key.split(':');
      netWeightOverrides[key] = draftFor(mealId, tierKey).netWeight;
    });
    const validation = PRODUCTION_GUARD.validateLabelProduction({
      activeBatch: ACTIVE_BATCH,
      activeMenu: ACTIVE_MENU,
      labelData: LABEL_DATA,
      form: productionForm(),
      selectedVariants: new Set(selectedSheets),
      netWeightOverrides,
    });
    if (printPlanErrors.length) {
      return { ok: false, errors: [...validation.errors, ...printPlanErrors] };
    }
    return validation;
  }

  function updateProductionGate(validation = productionValidation()) {
    const gate = $('productionGate');
    gate.classList.toggle('ready', validation.ok && !PROOF_MODE);
    gate.textContent = validation.ok
      ? PROOF_MODE
        ? 'REVIEW PROOF ONLY. Every label is marked DRAFT. Recipe estimates and unverified weights are not released for food labeling.'
        : `Date check passed: Batch ${ACTIVE_BATCH.number}, made ${displayDate(productionForm().madeDate)}, refrigerate through ${displayDate(productionForm().useByDate)}.`
      : `PRINT BLOCKED: ${validation.errors.join(' ')}`;
    $('printButton').textContent = PROOF_MODE ? 'Print marked review proof' : 'Print exact label queue';
    document.body.classList.toggle('label-print-blocked', !validation.ok);
    return validation;
  }

  function applyControlledProductionDefaults() {
    const production = ACTIVE_BATCH?.labelProduction;
    if (!production) return;
    $('madeDate').value = production.madeDate || '';
    $('useBy').value = production.useByDate || '';
    $('batchId').value = production.batchId || '';
  }

  function printPlanContextMatches(params) {
    const expected = ACTIVE_BATCH?.labelProduction;
    if (!expected) return false;
    return params.get('made') === expected.madeDate
      && params.get('useBy') === expected.useByDate
      && params.get('batch') === expected.batchId;
  }

  function storageCopy(mode) {
    const through = displayDate($('useBy').value);
    const refrigeratedDays = Number(ACTIVE_BATCH?.labelProduction?.refrigeratedDays) || 4;
    return mode === 'freezer'
      ? `Days 1-${refrigeratedDays}: refrigerate at 40°F or below through ${through}. Freeze upon delivery any meal planned after ${through}. Best within 3 months frozen. Thaw in refrigerator.`
      : `Keep refrigerated at 40°F or below. Enjoy by ${through}. Do not freeze.`;
  }

  function baseDraft(mealId, tierKey) {
    const meal = LABEL_DATA.meals[mealId];
    const tier = meal.tiers[tierKey];
    const nutrition = tier.nutrition;
    return {
      netWeight: tier.netWeight,
      ingredients: tier.ingredients,
      allergens: tier.allergens,
      storageMode: meal.storageMode,
      personality: meal.note,
      storage: storageCopy(meal.storageMode),
      reheat: meal.reheat || 'Heat until hot throughout.',
      satFat: nutrition.satFat,
      transFat: nutrition.transFat,
      cholesterol: nutrition.cholesterol,
      sodium: nutrition.sodium,
      fiber: nutrition.fiber,
      sugars: nutrition.sugars,
      addedSugar: nutrition.addedSugar,
      vitaminD: nutrition.vitaminD,
      calcium: nutrition.calcium,
      iron: nutrition.iron,
      potassium: nutrition.potassium,
    };
  }

  function draftFor(mealId, tierKey) {
    const key = variantKey(mealId, tierKey);
    if (!drafts.has(key)) drafts.set(key, baseDraft(mealId, tierKey));
    return drafts.get(key);
  }

  function saveActiveDraft() {
    if (!activeMealId || !activeTierKey) return;
    const draft = draftFor(activeMealId, activeTierKey);
    editableFields.forEach((id) => { draft[id] = $(id).value; });
  }

  function loadActiveDraft() {
    const draft = draftFor(activeMealId, activeTierKey);
    editableFields.forEach((id) => { $(id).value = draft[id] ?? ''; });
    const measuredAtPackout = currentMeal().tiers[activeTierKey].requiresPackoutWeight === true;
    $('netWeight').readOnly = !measuredAtPackout;
    $('netWeight').placeholder = measuredAtPackout ? 'Example: 12.3 oz (349 g)' : '';
    $('netWeightLabel').textContent = measuredAtPackout
      ? 'Actual packed net weight (required to print)'
      : 'Net weight (generated)';
    render();
  }

  function setStorageCopy() {
    $('storage').value = storageCopy($('storageMode').value);
    render();
  }

  function updateRefrigerateThrough() {
    const made = $('madeDate').value;
    if (!made) return;
    const [year, month, day] = made.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    const refrigeratedDays = Number(ACTIVE_BATCH?.labelProduction?.refrigeratedDays) || 4;
    date.setUTCDate(date.getUTCDate() + refrigeratedDays - 1);
    $('useBy').value = date.toISOString().slice(0, 10);
    drafts.forEach((draft) => { draft.storage = storageCopy(draft.storageMode); });
    setStorageCopy();
  }

  function loadMeal() {
    saveActiveDraft();
    activeMealId = $('mealSelect').value;
    const availableTiers = Object.keys(currentMeal().tiers);
    $('tierSelect').innerHTML = availableTiers.map((key) => (
      `<option value="${key}">${escapeHtml(currentMeal().tiers[key].label)}</option>`
    )).join('');
    activeTierKey = availableTiers[0];
    $('tierSelect').value = activeTierKey;
    loadActiveDraft();
  }

  function loadTier() {
    saveActiveDraft();
    activeTierKey = $('tierSelect').value;
    loadActiveDraft();
  }

  function labelMarkup(mealId, tierKey, draft) {
    const meal = LABEL_DATA.meals[mealId];
    const tier = meal.tiers[tierKey];
    const nutrition = tier.nutrition;
    const number = (key) => Number(draft[key] || 0);
    const weightUnverified = PROOF_MODE && (CURRENT_REVIEW || tier.netWeightVerified !== true);
    const incompleteNutrition = CURRENT_REVIEW && tier.nutritionComplete === false;
    const provisional = CURRENT_REVIEW ? ' (provisional)' : '';

    return `
      <article class="meal-label">
        ${PROOF_MODE ? '<div class="label-proof-mark">DRAFT - NOT FOR FOOD LABELING</div>' : ''}
        <section class="brand-panel">
          <div class="brand-top">
            <div class="brand-lockup"><span class="brand-name">PRPD</span><span class="brand-tagline">MEALS. PREPPED.</span></div>
            <span class="tier-pill ${tierKey}">${escapeHtml(tier.label)}</span>
          </div>
          <div class="category-line">${escapeHtml(meal.category)} &middot; High Protein &middot; Halal</div>
          <h2 class="meal-name ${meal.name.length > 20 ? 'long' : ''}">${escapeHtml(meal.name)}</h2>
          <p class="meal-identity">${escapeHtml(meal.description)}</p>
          <div class="quick-facts">
            <span><b>Made${provisional}</b>${escapeHtml(displayDate($('madeDate').value))}</span>
            <span><b>Refrigerate through${provisional}</b>${escapeHtml(displayDate($('useBy').value))}</span>
            <span><b>Batch</b>${escapeHtml($('batchId').value)}</span>
            <span><b>${weightUnverified ? 'Net wt. (unverified)' : 'Net wt.'}</b>${escapeHtml(draft.netWeight || (PROOF_MODE ? 'Not measured' : ''))}</span>
          </div>
          <p class="personality-note">&ldquo;${escapeHtml(draft.personality)}&rdquo;</p>
          <div class="label-copy">
            <p><b>Ingredients:</b> ${escapeHtml(draft.ingredients)}</p>
            <p class="allergen">${escapeHtml(draft.allergens)}</p>
            <p><b>Storage:</b> ${CURRENT_REVIEW ? 'Keep refrigerated. Planned dates and holding window require actual component-date and cold-chain verification. DRAFT ONLY.' : escapeHtml(draft.storage)}</p>
            <p><b>Reheat:</b> ${escapeHtml(draft.reheat)}</p>
          </div>
          <div class="brand-footer"><span>PRPD LLC &middot; DFW, Texas</span><span>getprpd.com &middot; @getprpd</span></div>
        </section>
        ${incompleteNutrition ? `<aside class="nutrition-panel nutrition-review">
          <h3 class="nutrition-title">Nutrition review</h3>
          <div class="servings"><strong>Full Nutrition Facts not established</strong></div>
          <p>Provisional recipe estimate per serving, dip excluded.</p>
          <div class="calories"><strong>Calories</strong><span>${nutrition.calories}</span></div>
          <div class="nutrient"><span>Protein ${nutrition.protein}g</span></div>
          <div class="nutrient"><span>Carbohydrate ${nutrition.carbs}g</span></div>
          <div class="nutrient"><span>Total fat ${nutrition.fat}g</span></div>
          <p><strong>Other nutrients and daily values: UNKNOWN.</strong></p>
          <p>Pending: coating, retained oil, yield, packed weight and package verification.</p>
          <p><strong>HOLD. NOT FOR FOOD LABELING.</strong></p>
        </aside>` : `<aside class="nutrition-panel">
          <h3 class="nutrition-title">Nutrition Facts</h3>
          <div class="servings">1 serving per container<strong>${weightUnverified ? 'Serving size 1 meal (weight unverified)' : `Serving size 1 meal (${escapeHtml(draft.netWeight)})`}</strong></div>
          <div class="amount">Amount per serving</div>
          <div class="calories"><strong>Calories</strong><span>${nutrition.calories}</span></div>
          <div class="dv-heading">% Daily Value*</div>
          <div class="nutrient"><span><strong>Total Fat</strong> ${nutrition.fat}g</span><strong>${dailyValue(nutrition.fat, 78)}%</strong></div>
          <div class="nutrient indent"><span>Saturated Fat ${number('satFat')}g</span><strong>${dailyValue(number('satFat'), 20)}%</strong></div>
          <div class="nutrient indent"><span><i>Trans</i> Fat ${number('transFat')}g</span><span></span></div>
          <div class="nutrient"><span><strong>Cholesterol</strong> ${number('cholesterol')}mg</span><strong>${dailyValue(number('cholesterol'), 300)}%</strong></div>
          <div class="nutrient"><span><strong>Sodium</strong> ${number('sodium')}mg</span><strong>${dailyValue(number('sodium'), 2300)}%</strong></div>
          <div class="nutrient"><span><strong>Total Carbohydrate</strong> ${nutrition.carbs}g</span><strong>${dailyValue(nutrition.carbs, 275)}%</strong></div>
          <div class="nutrient indent"><span>Dietary Fiber ${number('fiber')}g</span><strong>${dailyValue(number('fiber'), 28)}%</strong></div>
          <div class="nutrient indent"><span>Total Sugars ${number('sugars')}g</span><span></span></div>
          <div class="nutrient indent"><span>Includes ${number('addedSugar')}g Added Sugars</span><strong>${dailyValue(number('addedSugar'), 50)}%</strong></div>
          <div class="nutrient protein-row"><span><strong>Protein</strong> ${nutrition.protein}g</span><span></span></div>
          <div class="nutrient"><span>Vitamin D ${number('vitaminD')}mcg</span><strong>${dailyValue(number('vitaminD'), 20)}%</strong></div>
          <div class="nutrient"><span>Calcium ${number('calcium')}mg</span><strong>${dailyValue(number('calcium'), 1300)}%</strong></div>
          <div class="nutrient"><span>Iron ${number('iron')}mg</span><strong>${dailyValue(number('iron'), 18)}%</strong></div>
          <div class="nutrient"><span>Potassium ${number('potassium')}mg</span><strong>${dailyValue(number('potassium'), 4700)}%</strong></div>
          <div class="nutrition-foot">* The % Daily Value tells you how much a nutrient in a serving contributes to a daily diet. 2,000 calories a day is used for general nutrition advice.</div>
        </aside>`}
      </article>`;
  }

  function orderedVariants() {
    const order = [];
    categoryOrder.forEach((category) => {
      Object.entries(LABEL_DATA.meals).forEach(([mealId, meal]) => {
        if (meal.category !== category) return;
        Object.keys(meal.tiers).forEach((tierKey) => order.push({ mealId, tierKey }));
      });
    });
    return order;
  }

  function printSlotMarkup(markup) {
    return `<div class="print-slot">${markup}</div>`;
  }

  function feedbackLabelMarkup(label) {
    const customerName = String(label.customerName || '').trim();
    const nameParts = customerName.split(/\s+/).filter(Boolean);
    const displayName = customerName.length > 17 && nameParts.length > 2
      ? `${nameParts[0]} ${nameParts[nameParts.length - 1]}`
      : customerName;
    const customerNameClass = displayName.length > 17 ? 'bag-customer-name is-long' : 'bag-customer-name';
    return `
      <article class="feedback-label" aria-label="PRPD feedback label for ${escapeHtml(customerName)}">
        <header class="bag-header"><div class="bag-brand-lockup"><span class="bag-brand-name">PRPD</span><span class="bag-brand-tagline">MEALS. PREPPED.</span></div><span class="bag-header-kicker">Private order feedback</span></header>
        <section class="bag-main">
          <div class="bag-headline"><h1><span>Rate your</span><span>meals.</span></h1><div class="bag-reward-line"><span class="bag-reward-value">$5</span><span class="bag-reward-name">PRPD credit<br>every 6 different dishes</span></div><p class="bag-reward-rule">Your progress carries across delivered orders.<br>Any honest 1&ndash;10 score + a short review counts.</p></div>
          <aside class="bag-scan-panel"><h2 class="bag-scan-title">SCAN TO REVIEW</h2><span class="bag-qr-frame"><img src="${escapeHtml(label.qrDataUrl)}" alt="Feedback QR code for ${escapeHtml(customerName)}"></span><p class="bag-scan-copy">Your meals open automatically.</p><div class="bag-live-note">Keep this private link</div></aside>
        </section>
        <footer class="bag-footer"><div class="bag-order-context"><div class="bag-customer-block"><span class="bag-context-label">Prepared for</span><strong class="${customerNameClass}">${escapeHtml(displayName)}</strong></div><div class="bag-dish-count"><strong>${label.uniqueDishes}</strong><span>different dishes<br>in this order</span></div></div><p class="bag-privacy">Repeat dishes and Lean/Bulk count once. Comments stay private unless you give permission. Credit valid 90 days; $30 active-wallet cap.</p></footer>
      </article>`;
  }

  function paginateLabels(labels, markup) {
    const pages = [];
    for (let index = 0; index < labels.length; index += 4) pages.push(labels.slice(index,index + 4));
    return pages.map(page => {
      const printed = page.map(item => printSlotMarkup(markup(item)));
      while (printed.length < 4) printed.push(printSlotMarkup(''));
      return `<section class="print-page">${printed.join('')}</section>`;
    }).join('');
  }

  function renderBagLabels() {
    const button = $('printBagLabelsButton');
    if (bagPlanErrors.length || !bagLabels.length) {
      $('bagPrintSheet').innerHTML = '';
      $('bagLabelList').innerHTML = '';
      $('bagLabelStatus').textContent = bagPlanErrors.length
        ? `Bag-label printing is blocked: ${bagPlanErrors.join(' ')}`
        : 'Open Label Studio from a locked Cook-Day Planner to load one bag label per customer order.';
      button.disabled = true;
      return;
    }
    $('bagPrintSheet').innerHTML = paginateLabels(bagLabels, feedbackLabelMarkup);
    $('bagLabelList').innerHTML = bagLabels.map(label => `<li><strong>${escapeHtml(label.customerName)}</strong><small>${label.uniqueDishes} unique dish${label.uniqueDishes === 1 ? '' : 'es'}</small></li>`).join('');
    const pages = Math.ceil(bagLabels.length / 4);
    const openSlots = pages * 4 - bagLabels.length;
    $('bagLabelStatus').textContent = `${bagLabels.length} customer-specific bag label${bagLabels.length === 1 ? '' : 's'} across ${pages} separate Avery sheet${pages === 1 ? '' : 's'}${openSlots ? `, with ${openSlots} unused final-sheet slot${openSlots === 1 ? '' : 's'}` : ''}.`;
    button.textContent = `Print ${bagLabels.length} customer bag label${bagLabels.length === 1 ? '' : 's'}`;
    button.disabled = false;
  }

  async function loadBagLabelPlan(params) {
    if (!params.has('bagPlan')) return renderBagLabels();
    const key = params.get('bagPlan');
    let plan;
    try { plan = JSON.parse(localStorage.getItem(key) || 'null'); }
    catch { plan = null; }
    if (!PRODUCTION_GUARD?.validateBagLabelPlan) {
      bagPlanErrors = ['The customer bag-label validator did not load.'];
      return renderBagLabels();
    }
    const validation = PRODUCTION_GUARD.validateBagLabelPlan(plan, {
      batch:ACTIVE_BATCH?.number,
      batchId:ACTIVE_BATCH?.labelProduction?.batchId,
      deliveryDate:ACTIVE_BATCH?.deliveryDate,
      declaredCount:params.get('bagCount'),
    });
    if (!validation.ok) {
      bagPlanErrors = validation.errors;
      return renderBagLabels();
    }
    $('bagLabelStatus').textContent = `Connecting ${validation.totalLabels} locked customer order${validation.totalLabels === 1 ? '' : 's'} to private feedback links...`;
    $('printBagLabelsButton').disabled = true;
    try {
      const response = await fetch('/api/feedback-admin', {
        method:'POST',
        headers:{ 'content-type':'application/json', accept:'application/json' },
        body:JSON.stringify({
          action:'provision',
          batch:plan.batch,
          batchId:plan.batchId,
          deliveryDate:plan.deliveryDate,
          orders:validation.orders,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'The live feedback service did not accept this queue.');
      if (!Array.isArray(result.labels) || result.labels.length !== validation.totalLabels) throw new Error('The live feedback service returned the wrong label count.');
      const expected = new Map(validation.orders.map(order => {
        // Feedback combines Lean and Bulk versions of the same dish.
        const dishes = new Set(order.meals.map(meal => meal.name.normalize('NFKC').toLowerCase()
          .replace(/\s*\((?:lean|bulk|single)\)\s*$/i, '')
          .replace(/^(?:lean|bulk|single)\s*[:·-]\s*/i, '')
          .replace(/&/g, ' and ').replace(/[’']/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim()));
        return [order.orderId, { customerName: order.customerName, uniqueDishes: dishes.size }];
      }));
      result.labels.forEach(label => {
        const order = expected.get(label.orderId);
        if (!order || label.customerName !== order.customerName || Number(label.uniqueDishes) !== order.uniqueDishes) {
          throw new Error('A customer name or unique-dish count did not reconcile with the locked orders.');
        }
        if (!/^https:\/\/getprpd\.com\/feedback\?t=[A-Za-z0-9_-]{40,60}$/.test(String(label.url || '')) || !/^data:image\/png;base64,/.test(String(label.qrDataUrl || ''))) {
          throw new Error('A feedback QR is missing or does not use the private production URL.');
        }
      });
      bagLabels = result.labels;
      bagPlanErrors = [];
    } catch (error) {
      bagLabels = [];
      bagPlanErrors = [error.message || 'The customer feedback links could not be created.'];
    }
    renderBagLabels();
  }

  function renderPrintSheets() {
    saveActiveDraft();
    const variants = orderedVariants().filter(({ mealId, tierKey }) => selectedSheets.has(variantKey(mealId, tierKey)));
    const labels = variants.flatMap(({ mealId, tierKey }) => {
      const key = variantKey(mealId, tierKey);
      return Array.from({ length: labelQuantity(key) }, () => ({ mealId, tierKey }));
    });
    const pages = [];
    for (let index = 0; index < labels.length; index += 4) pages.push(labels.slice(index, index + 4));
    const validation = updateProductionGate();
    if (!validation.ok) {
      $('printSheet').innerHTML = '';
      $('selectionCount').textContent = `${labels.length} label${labels.length === 1 ? '' : 's'} selected - printing is blocked by the production-date check.`;
      $('printButton').disabled = true;
      return;
    }
    $('printSheet').innerHTML = pages.map((page) => {
      const printed = page.map(({ mealId, tierKey }) => (
        printSlotMarkup(labelMarkup(mealId, tierKey, draftFor(mealId, tierKey)))
      ));
      while (printed.length < 4) printed.push(printSlotMarkup(''));
      return `<section class="print-page">${printed.join('')}</section>`;
    }).join('');
    const openSlots = pages.length * 4 - labels.length;
    $('selectionCount').textContent = `${labels.length} exact label${labels.length === 1 ? '' : 's'} across ${variants.length} meal/tier selection${variants.length === 1 ? '' : 's'} - ${pages.length} mixed sheet${pages.length === 1 ? '' : 's'}${openSlots ? ` - ${openSlots} unused slot${openSlots === 1 ? '' : 's'} on the final sheet` : ''}`;
    $('printButton').disabled = labels.length === 0;
  }

  function render() {
    if (!activeMealId || !activeTierKey) return;
    saveActiveDraft();
    $('previewMount').innerHTML = labelMarkup(activeMealId, activeTierKey, draftFor(activeMealId, activeTierKey));
    renderPrintSheets();
  }

  function renderMealOptions() {
    $('mealSelect').innerHTML = categoryOrder.map((category) => {
      const options = Object.entries(LABEL_DATA.meals)
        .filter(([, meal]) => meal.category === category)
        .map(([id, meal]) => `<option value="${id}">${escapeHtml(meal.name)}</option>`)
        .join('');
      return `<optgroup label="${categoryLabels[category]}">${options}</optgroup>`;
    }).join('');
  }

  function renderSheetSelection() {
    $('sheetSelection').innerHTML = categoryOrder.map((category) => {
      const rows = Object.entries(LABEL_DATA.meals)
        .filter(([, meal]) => meal.category === category)
        .flatMap(([mealId, meal]) => Object.entries(meal.tiers).map(([tierKey, tier]) => {
          const key = variantKey(mealId, tierKey);
          return `<div class="sheet-option"><input type="checkbox" data-sheet="${key}" aria-label="Select ${escapeHtml(meal.name)} ${escapeHtml(tier.label)}" ${selectedSheets.has(key) ? 'checked' : ''}><span>${escapeHtml(meal.name)}</span><small>${escapeHtml(tier.label)}</small><label class="sheet-quantity">Labels <input type="number" min="1" max="200" step="1" value="${labelQuantity(key)}" data-label-quantity="${key}" aria-label="Labels for ${escapeHtml(meal.name)} ${escapeHtml(tier.label)}"></label></div>`;
        })).join('');
      return `<section class="sheet-group"><h3>${categoryLabels[category]}</h3>${rows}</section>`;
    }).join('');
    document.querySelectorAll('[data-sheet]').forEach((input) => input.addEventListener('change', () => {
      if (input.checked) selectedSheets.add(input.dataset.sheet);
      else selectedSheets.delete(input.dataset.sheet);
      renderPrintSheets();
    }));
    document.querySelectorAll('[data-label-quantity]').forEach((input) => input.addEventListener('input', () => {
      const key = input.dataset.labelQuantity;
      const value = Math.min(200, Math.max(1, Number.parseInt(input.value, 10) || 1));
      labelQuantities.set(key, value);
      renderPrintSheets();
    }));
  }

  function replaceSelection(keys) {
    selectedSheets.clear();
    keys.forEach((key) => selectedSheets.add(key));
    renderSheetSelection();
    renderPrintSheets();
  }

  function applyPrintPlan(params) {
    if (!params.has('plan')) return false;
    if (!printPlanContextMatches(params)) {
      printPlanErrors = ['The URL print plan does not identify this active batch and cannot be used.'];
      return false;
    }
    if (!PRODUCTION_GUARD?.parseLabelPrintPlan) {
      printPlanErrors = ['The exact label-plan validator did not load.'];
      return false;
    }
    const validation = PRODUCTION_GUARD.parseLabelPrintPlan(params.get('plan'), LABEL_DATA);
    if (!validation.ok) {
      printPlanErrors = validation.errors;
      return false;
    }
    const declaredCount = params.get('count');
    if (!/^\d+$/.test(String(declaredCount || '')) || Number(declaredCount) !== validation.totalLabels) {
      printPlanErrors = ['The URL label-count total does not match the exact label plan. Reopen Label Studio from the locked Cook-Day Planner.'];
      return false;
    }

    selectedSheets.clear();
    labelQuantities.clear();
    validation.entries.forEach(({ id, tier, labels }) => {
      const key = variantKey(id, tier);
      selectedSheets.add(key);
      labelQuantities.set(key, labels);
    });
    renderSheetSelection();
    renderPrintSheets();
    return true;
  }

  applyControlledProductionDefaults();
  renderMealOptions();
  activeMealId = $('mealSelect').value;
  activeTierKey = Object.keys(currentMeal().tiers)[0];
  selectedSheets.add(variantKey(activeMealId, activeTierKey));
  renderSheetSelection();

  // The first load must read audited label data before form values become a draft.
  activeMealId = '';
  activeTierKey = '';

  $('mealSelect').addEventListener('change', loadMeal);
  $('tierSelect').addEventListener('change', loadTier);
  $('madeDate').addEventListener('change', updateRefrigerateThrough);
  $('useBy').addEventListener('change', () => {
    drafts.forEach((draft) => { draft.storage = storageCopy(draft.storageMode); });
    setStorageCopy();
  });
  $('storageMode').addEventListener('change', setStorageCopy);
  document.querySelectorAll('input, textarea').forEach((field) => field.addEventListener('input', render));
  $('selectAllLabels').addEventListener('click', () => replaceSelection(orderedVariants().map(({ mealId, tierKey }) => variantKey(mealId, tierKey))));
  $('clearLabels').addEventListener('click', () => replaceSelection([]));
  $('selectCurrentLabel').addEventListener('click', () => replaceSelection([variantKey(activeMealId, activeTierKey)]));
  $('printButton').addEventListener('click', () => {
    if (!selectedSheets.size) return;
    const validation = updateProductionGate();
    if (!validation.ok) {
      window.alert(`Printing is blocked. ${validation.errors.join(' ')}`);
      return;
    }
    setPrintJob('meals');
    renderPrintSheets();
    window.print();
  });
  $('printBagLabelsButton').addEventListener('click', async () => {
    if (bagPlanErrors.length || !bagLabels.length) return;
    setPrintJob('bags');
    renderBagLabels();
    await document.fonts?.ready;
    await Promise.all([...$('bagPrintSheet').querySelectorAll('img')].map(img => img.complete
      ? Promise.resolve()
      : new Promise(resolve => { img.addEventListener('load',resolve,{once:true}); img.addEventListener('error',resolve,{once:true}); })));
    window.print();
  });
  window.addEventListener('beforeprint', () => {
    if (currentPrintJob() === 'bags') {
      renderBagLabels();
      return;
    }
    const validation = updateProductionGate();
    if (validation.ok) renderPrintSheets();
    else $('printSheet').innerHTML = '';
  });
  const params = new URLSearchParams(window.location.search);
  setPrintJob('meals');
  if (params.get('made')) $('madeDate').value = params.get('made');
  if (params.get('useBy')) $('useBy').value = params.get('useBy');
  if (params.get('batch')) $('batchId').value = params.get('batch');
  loadMeal();
  const printPlanApplied = applyPrintPlan(params);
  if (!printPlanApplied && params.get('printProof') === 'all') {
    replaceSelection(orderedVariants().map(({ mealId, tierKey }) => variantKey(mealId, tierKey)));
  } else if (params.has('plan') && !printPlanApplied) {
    renderPrintSheets();
  }
  loadBagLabelPlan(params);
})();
