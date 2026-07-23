(function () {
  'use strict';

  const LABEL_DATA = window.PRPD_LABEL_DATA;
  const $ = (id) => document.getElementById(id);
  const escapeHtml = (value) => String(value || '').replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  })[char]);
  const dailyValue = (value, total) => Math.round((Number(value) / total) * 100);
  const categoryOrder = ['Breakfast', 'Main', 'Dessert'];
  const categoryLabels = { Breakfast: 'Breakfasts', Main: 'Mains', Dessert: 'Desserts' };
  const editableFields = [
    'netWeight', 'ingredients', 'allergens', 'storageMode', 'personality', 'storage', 'reheat',
    'satFat', 'transFat', 'cholesterol', 'sodium', 'fiber', 'sugars', 'addedSugar',
    'vitaminD', 'calcium', 'iron', 'potassium',
  ];
  const drafts = new Map();
  const selectedSheets = new Set();
  const sheetQuantities = new Map();
  let activeMealId = '';
  let activeTierKey = '';

  function variantKey(mealId, tierKey) { return `${mealId}:${tierKey}`; }
  function currentMeal() { return LABEL_DATA.meals[activeMealId]; }

  function sheetQuantity(key) {
    const value = Number.parseInt(sheetQuantities.get(key), 10);
    return Number.isFinite(value) ? Math.min(25, Math.max(1, value)) : 1;
  }

  function displayDate(value) {
    if (!value) return '';
    const [year, month, day] = value.split('-');
    return `${month}/${day}/${year}`;
  }

  function storageCopy(mode) {
    const through = displayDate($('useBy').value);
    return mode === 'freezer'
      ? `Days 1-4: refrigerate at 40°F or below through ${through}. For days 5-7, freeze upon delivery. Best within 3 months frozen. Thaw in refrigerator.`
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
      reheat: 'Microwave 1-2 minutes. Heat to 165°F throughout.',
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
    date.setUTCDate(date.getUTCDate() + 3);
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

    return `
      <article class="meal-label">
        <section class="brand-panel">
          <div class="brand-top">
            <div class="brand-lockup"><span class="brand-name">PRPD</span><span class="brand-tagline">MEALS. PREPPED.</span></div>
            <span class="tier-pill ${tierKey}">${escapeHtml(tier.label)}</span>
          </div>
          <div class="category-line">${escapeHtml(meal.category)} &middot; High Protein &middot; Halal</div>
          <h2 class="meal-name ${meal.name.length > 20 ? 'long' : ''}">${escapeHtml(meal.name)}</h2>
          <p class="meal-identity">${escapeHtml(meal.description)}</p>
          <div class="quick-facts">
            <span><b>Made</b>${escapeHtml(displayDate($('madeDate').value))}</span>
            <span><b>Refrigerate through</b>${escapeHtml(displayDate($('useBy').value))}</span>
            <span><b>Batch</b>${escapeHtml($('batchId').value)}</span>
            <span><b>Net wt.</b>${escapeHtml(draft.netWeight)}</span>
          </div>
          <p class="personality-note">&ldquo;${escapeHtml(draft.personality)}&rdquo;</p>
          <div class="label-copy">
            <p><b>Ingredients:</b> ${escapeHtml(draft.ingredients)}</p>
            <p class="allergen">${escapeHtml(draft.allergens)}</p>
            <p><b>Storage:</b> ${escapeHtml(draft.storage)}</p>
            <p><b>Reheat:</b> ${escapeHtml(draft.reheat)}</p>
          </div>
          <div class="brand-footer"><span>PRPD LLC &middot; DFW, Texas</span><span>getprpd.com &middot; @getprpd</span></div>
        </section>
        <aside class="nutrition-panel">
          <h3 class="nutrition-title">Nutrition Facts</h3>
          <div class="servings">1 serving per container<strong>Serving size 1 meal (${escapeHtml(draft.netWeight)})</strong></div>
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
        </aside>
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

  function renderPrintSheets() {
    saveActiveDraft();
    const variants = orderedVariants().filter(({ mealId, tierKey }) => selectedSheets.has(variantKey(mealId, tierKey)));
    const sheets = variants.flatMap(({ mealId, tierKey }) => {
      const key = variantKey(mealId, tierKey);
      return Array.from({ length: sheetQuantity(key) }, () => ({ mealId, tierKey }));
    });
    $('printSheet').innerHTML = sheets.map(({ mealId, tierKey }) => {
      const markup = labelMarkup(mealId, tierKey, draftFor(mealId, tierKey));
      const labels = Array.from({ length: 4 }, () => printSlotMarkup(markup)).join('');
      return `<section class="print-page">${labels}</section>`;
    }).join('');
    $('selectionCount').textContent = `${sheets.length} sheet${sheets.length === 1 ? '' : 's'} across ${variants.length} meal/tier selection${variants.length === 1 ? '' : 's'} - ${sheets.length * 4} labels`;
    $('printButton').disabled = sheets.length === 0;
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
          return `<div class="sheet-option"><input type="checkbox" data-sheet="${key}" aria-label="Select ${escapeHtml(meal.name)} ${escapeHtml(tier.label)}" ${selectedSheets.has(key) ? 'checked' : ''}><span>${escapeHtml(meal.name)}</span><small>${escapeHtml(tier.label)}</small><label class="sheet-quantity">Sheets <input type="number" min="1" max="25" step="1" value="${sheetQuantity(key)}" data-sheet-quantity="${key}" aria-label="Sheets for ${escapeHtml(meal.name)} ${escapeHtml(tier.label)}"></label></div>`;
        })).join('');
      return `<section class="sheet-group"><h3>${categoryLabels[category]}</h3>${rows}</section>`;
    }).join('');
    document.querySelectorAll('[data-sheet]').forEach((input) => input.addEventListener('change', () => {
      if (input.checked) selectedSheets.add(input.dataset.sheet);
      else selectedSheets.delete(input.dataset.sheet);
      renderPrintSheets();
    }));
    document.querySelectorAll('[data-sheet-quantity]').forEach((input) => input.addEventListener('input', () => {
      const key = input.dataset.sheetQuantity;
      const value = Math.min(25, Math.max(1, Number.parseInt(input.value, 10) || 1));
      sheetQuantities.set(key, value);
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
    const encodedPlan = params.get('plan');
    if (!encodedPlan) return false;

    const plan = encodedPlan.split(',').map((entry) => {
      const [mealId, tierKey, quantity] = entry.split(':');
      const sheets = Math.min(25, Math.max(1, Number.parseInt(quantity, 10) || 1));
      const meal = LABEL_DATA.meals[mealId];
      const resolvedTierKey = meal?.tiers[tierKey]
        ? tierKey
        : tierKey === 'single' && meal?.category === 'Dessert' && meal.tiers.lean
          ? 'lean'
          : '';
      if (!resolvedTierKey) return null;
      return { key: variantKey(mealId, resolvedTierKey), sheets };
    }).filter(Boolean);
    if (!plan.length) return false;

    selectedSheets.clear();
    sheetQuantities.clear();
    plan.forEach(({ key, sheets }) => {
      selectedSheets.add(key);
      sheetQuantities.set(key, sheets);
    });
    renderSheetSelection();
    renderPrintSheets();
    return true;
  }

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
    renderPrintSheets();
    window.print();
  });
  const params = new URLSearchParams(window.location.search);
  if (params.get('made')) $('madeDate').value = params.get('made');
  if (params.get('useBy')) $('useBy').value = params.get('useBy');
  if (params.get('batch')) $('batchId').value = params.get('batch');
  loadMeal();
  if (!applyPrintPlan(params) && params.get('printProof') === 'all') {
    replaceSelection(orderedVariants().map(({ mealId, tierKey }) => variantKey(mealId, tierKey)));
  }
})();
