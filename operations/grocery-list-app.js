(function () {
  const CONFIG_BASE = window.PRPD_ORDER_CONFIG;
  const DATA = window.PRPD_PRODUCTION_DATA;
  const COOK = window.PRPD_COOK_DAY;
  const METHODS = window.PRPD_COOK_METHODS;
  const GROCERY = window.PRPD_GROCERY_CORE;
  const CATALOG = window.PRPD_GROCERY_CATALOG.catalog;
  const plannerOnlyMains = Object.entries(DATA.meals).filter(([, meal]) => meal.plannerOnly).map(([id, meal]) => ({ id, name: meal.name, category: 'standard' }));
  const CONFIG = { ...CONFIG_BASE, menu: { ...CONFIG_BASE.menu, mains: [...CONFIG_BASE.menu.mains, ...plannerOnlyMains] } };
  const LEGACY_STORAGE_KEY = 'prpd-grocery-state-v1';
  const STORAGE_KEY = `prpd-grocery-state-v2:batch:${CONFIG.batch.number}|delivery:${CONFIG.batch.deliveryDate}`;
  const PRICE_STORAGE_KEY = 'prpd-grocery-catalog-overrides-v1';
  const state = { orders: [], rows: [], saved: loadSaved(), showStocked: false };
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

  function loadSaved() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
      const sharedCatalog = JSON.parse(localStorage.getItem(PRICE_STORAGE_KEY)) || {};
      const legacy = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY)) || {};
      return {
        onHand: parsed?.onHand || {},
        catalog: { ...(legacy?.catalog || {}), ...sharedCatalog, ...(parsed?.catalog || {}) },
        buyPackages: parsed?.buyPackages || {},
      };
    }
    catch { return { onHand: {}, catalog: {}, buyPackages: {} }; }
  }
  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      onHand: state.saved.onHand,
      buyPackages: state.saved.buyPackages,
    }));
    localStorage.setItem(PRICE_STORAGE_KEY, JSON.stringify(state.saved.catalog));
  }
  function amount(value, unit) {
    const n = Number(value) || 0;
    if (unit === 'g') {
      const pounds = n / 453.59237;
      if (pounds >= 1) return `${pounds.toFixed(pounds >= 10 ? 1 : 2)} lb`;
      return `${(n / 28.3495).toFixed(1)} oz`;
    }
    if (unit === 'each') {
      const displayed = Number.isInteger(n) ? n : Math.round(n * 10) / 10;
      return `${displayed} count`;
    }
    return `${Math.round(n * 10) / 10} ${unit}`;
  }
  function sauceConfig() {
    return {
      ...METHODS.weeklySauces,
      customerCupsPerSauce: Number($('customerSauceCups').value) || 0,
      kitchenUseCupsPerSauce: Number($('kitchenSauceCups').value) || 0,
      qcCupsPerSauce: Number($('qcSauceCups').value) || 0,
    };
  }

  async function syncOrders() {
    $('syncBtn').disabled = true;
    $('syncBtn').textContent = 'Syncing...';
    $('status').className = 'status';
    $('status').textContent = 'Reading the current Orders tab...';
    try {
      const response = await fetch('/api/current-orders', { headers: { accept:'application/json' }, cache:'no-store' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Live sync failed.');
      const parsed = COOK.arrayRowsToOrders(payload.rows, CONFIG);
      state.orders = COOK.includedOrders(parsed.orders);
      const mealCount = state.orders.flatMap(order => order.items).reduce((sum, item) => sum + Number(item.qty || 0), 0);
      $('status').textContent = `${state.orders.length} current orders and ${mealCount} customer meals loaded for Batch ${CONFIG.batch.number}${parsed.warnings.length ? `; ${parsed.warnings.length} warning(s) need review in the cook-day planner` : ''}.`;
      $('status').className = `status${parsed.warnings.length ? ' warn' : ''}`;
      $('generateBtn').disabled = false;
    } catch (error) {
      $('status').className = 'status warn';
      $('status').textContent = error.message;
    } finally {
      $('syncBtn').disabled = false;
      $('syncBtn').textContent = 'Sync current orders';
    }
  }

  function buildList() {
    if (!state.orders.length) return;
    const counts = COOK.aggregateCounts(state.orders);
    const buffer = {
      prpdExtraServings: 0,
      rawProteinBufferPct: Number($('rawProteinBufferPct').value) || 0,
      riceBufferPct: Number($('riceBufferPct').value) || 0,
      riceYieldFactor: Number($('riceYieldFactor').value) || 3,
    };
    const planned = COOK.productionPlan(counts, buffer);
    const recipeTotals = COOK.ingredientTotals(counts, DATA, buffer).totals;
    const saucePlan = COOK.weeklySaucePlan(state.orders, sauceConfig());
    const labelOrders = COOK.labelEligibleOrders(state.orders, METHODS.labelExemptCustomers);
    const labelCount = COOK.aggregateCounts(labelOrders).reduce((sum, item) => sum + Number(item.qty || 0), 0);
    const packaging = GROCERY.packagingRequirements(planned, state.orders, saucePlan, labelCount);
    const requirements = GROCERY.mergeRequirements(recipeTotals, saucePlan, packaging);
    state.rows = GROCERY.buildPurchaseRows(requirements, CATALOG, state.saved);
    renderRows();
    renderMetrics(saucePlan);
    $('listPanel').hidden = false;
    $('metrics').hidden = false;
    $('listPanel').scrollIntoView({ behavior:'smooth', block:'start' });
  }

  function renderMetrics(saucePlan) {
    const s = GROCERY.summary(state.rows);
    const values = [
      [`$${s.foodUsageCost.toFixed(2)}`, 'food used by this batch'],
      [`$${s.estimatedCost.toFixed(2)}`, 'cash checkout after pantry'],
      [s.buyItems, 'items still to buy'],
      [s.stockedItems, 'items marked stocked'],
    ];
    $('metrics').innerHTML = values.map(([value,label]) => `<div class="metric"><strong>${esc(value)}</strong><span>${esc(label)}</span></div>`).join('');
    $('costNote').innerHTML = `<strong>How to read this:</strong> About <strong>$${s.foodUsageCost.toFixed(2)}</strong> of food is consumed by the generated batch, based on the current saved prices. The <strong>$${s.estimatedCost.toFixed(2)}</strong> checkout figure buys whole packages for everything not marked stocked. It drops as you mark pantry items on hand.${s.underBought ? ` <strong>${s.underBought} item(s)</strong> are manually set below the calculated package recommendation.` : ''}`;
    $('costNote').hidden = false;
    $('showStockedBtn').textContent = `${state.showStocked ? 'Hide' : 'Show'} stocked items (${s.stockedItems})`;
  }

  function renderRows() {
    let section = '';
    const html = [];
    const visibleRows = state.rows.filter(row => row.needed > 0 || state.showStocked);
    for (const row of visibleRows) {
      if (row.section !== section) {
        section = row.section;
        const sectionRows = state.rows.filter(item => item.section === section && item.needed > 0);
        const sectionCost = sectionRows.reduce((sum, item) => sum + item.estimatedCost, 0);
        html.push(`<tr class="station-row" data-section="${esc(section)}"><td colspan="6"><div><span>${esc(section)}</span><span>${sectionRows.length} to buy · $${sectionCost.toFixed(2)}</span><button class="section-action screen-only" data-action="stock-section">I have this section</button></div></td></tr>`);
      }
      const search = `https://www.walmart.com/search?q=${encodeURIComponent(row.query || row.name)}`;
      const stocked = row.needed <= 0;
      html.push(`<tr data-key="${esc(row.key)}" class="${stocked ? 'stocked-row' : ''}">
        <td><strong>${esc(row.key === 'fage' ? 'Nonfat Greek yogurt' : row.name)}</strong><div class="source">${esc(row.sources.join(' + '))}</div><details class="price-details screen-only"><summary>Package and price</summary><div><span>${esc(row.packageLabel || row.unit)} at </span><label>$<input aria-label="${esc(row.name)} package price" data-field="price" type="number" min="0" step="0.01" value="${row.packagePrice}"></label><span> · ${esc(row.store)}</span></div></details></td>
        <td class="amount"><strong>${stocked ? 'Stocked' : esc(amount(row.needed,row.unit))}</strong>${!stocked && row.required !== row.needed ? `<div class="source">Total recipe: ${esc(amount(row.required,row.unit))}</div>` : ''}</td>
        <td>${stocked ? '<span class="pill">ready</span>' : row.configured ? `<div class="stepper screen-only"><button aria-label="Decrease ${esc(row.name)} packages" data-action="package-dec">−</button><strong>${row.packages}</strong><button aria-label="Increase ${esc(row.name)} packages" data-action="package-inc">+</button></div><div class="package-label">${esc(row.packageLabel)}</div>${row.packages !== row.suggestedPackages ? `<button class="reset-suggestion screen-only" data-action="reset-suggestion">Suggested: ${row.suggestedPackages}</button>` : ''}${row.shortAmount > 0 ? `<div class="short">Short ${esc(amount(row.shortAmount,row.unit))}</div>` : ''}` : '<span class="pill planning">Set package</span>'}</td>
        <td class="amount">${stocked ? '—' : `$${row.estimatedCost.toFixed(2)}`}</td>
        <td class="screen-only"><button class="row-action" data-action="${stocked ? 'unstocked' : 'stocked'}">${stocked ? 'Put back on list' : 'I have enough'}</button></td>
        <td class="screen-only"><a class="store-link" href="${search}" target="_blank" rel="noopener">Walmart</a><a class="store-link" href="https://member.restaurantdepot.com/store/jetro-restaurant-depot/" target="_blank" rel="noopener">Restaurant Depot</a></td>
      </tr>`);
    }
    $('groceryRows').innerHTML = html.join('') || '<tr><td colspan="6" class="empty">Everything is marked stocked.</td></tr>';
  }

  function updateRow(target) {
    const tr = target.closest('tr[data-key]');
    if (!tr) return;
    const key = tr.dataset.key;
    const row = state.rows.find(item => item.key === key);
    if (!row) return;
    if (target.dataset.action === 'stocked') {
      state.saved.onHand[key] = row.required;
      delete state.saved.buyPackages[key];
    } else if (target.dataset.action === 'unstocked') {
      state.saved.onHand[key] = 0;
      delete state.saved.buyPackages[key];
    } else if (target.dataset.action === 'package-dec' || target.dataset.action === 'package-inc') {
      const direction = target.dataset.action === 'package-inc' ? 1 : -1;
      state.saved.buyPackages[key] = Math.max(0, row.packages + direction);
    } else if (target.dataset.action === 'reset-suggestion') {
      delete state.saved.buyPackages[key];
    } else if (target.dataset.field === 'price') {
      state.saved.catalog[key] ||= {};
      state.saved.catalog[key][target.dataset.field] = Math.max(0, Number(target.value) || 0);
    } else return;
    save();
    buildList();
  }

  function exportCsv() {
    const blob = new Blob([GROCERY.csv(state.rows)], { type:'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `prpd-batch-${CONFIG.batch.number}-grocery-list.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  $('syncBtn').addEventListener('click', syncOrders);
  $('generateBtn').addEventListener('click', buildList);
  $('groceryRows').addEventListener('change', event => updateRow(event.target));
  $('groceryRows').addEventListener('click', event => {
    const sectionButton = event.target.closest('[data-action="stock-section"]');
    if (sectionButton) {
      const section = sectionButton.closest('tr[data-section]')?.dataset.section;
      for (const row of state.rows.filter(item => item.section === section)) {
        state.saved.onHand[row.key] = row.required;
        delete state.saved.buyPackages[row.key];
      }
      save(); buildList(); return;
    }
    updateRow(event.target);
  });
  $('exportBtn').addEventListener('click', exportCsv);
  $('printBtn').addEventListener('click', () => window.print());
  $('showStockedBtn').addEventListener('click', () => { state.showStocked = !state.showStocked; renderRows(); renderMetrics(COOK.weeklySaucePlan(state.orders, sauceConfig())); });
  $('resetBtn').addEventListener('click', () => {
    state.saved = { onHand:{}, catalog:{ ...state.saved.catalog }, buyPackages:{} };
    save();
    buildList();
  });
  for (const id of ['rawProteinBufferPct','riceBufferPct','riceYieldFactor','customerSauceCups','kitchenSauceCups','qcSauceCups']) $(id).addEventListener('change', () => state.orders.length && buildList());
})();
