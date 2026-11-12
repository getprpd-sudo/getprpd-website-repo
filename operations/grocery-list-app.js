(function () {
  const CONFIG_BASE = window.PRPD_ORDER_CONFIG;
  const DATA = window.PRPD_PRODUCTION_DATA;
  const COOK = window.PRPD_COOK_DAY;
  const METHODS = window.PRPD_COOK_METHODS;
  const GROCERY = window.PRPD_GROCERY_CORE;
  const CATALOG = window.PRPD_GROCERY_CATALOG.catalog;
  const DASH = window.PRPD_GROCERY_DASHBOARD;
  const RUN = window.PRPD_PRODUCTION_RUN;
  const plannerOnlyMains = Object.entries(DATA.meals).filter(([, meal]) => meal.plannerOnly).map(([id, meal]) => ({ id, name: meal.name, aliases: meal.aliases || [], category: meal.orderCategory || 'standard', packageType: meal.packageType || '' }));
  const CONFIG = { ...CONFIG_BASE, menu: { ...CONFIG_BASE.menu, mains: [...CONFIG_BASE.menu.mains, ...plannerOnlyMains] } };
  const LEGACY_STORAGE_KEY = 'prpd-grocery-state-v1';
  const STORAGE_KEY = `prpd-grocery-state-v2:batch:${CONFIG.batch.number}|delivery:${CONFIG.batch.deliveryDate}`;
  const PRICE_STORAGE_KEY = 'prpd-grocery-catalog-overrides-v1';
  const BATCH_KEY = `batch:${CONFIG.batch.number}|delivery:${CONFIG.batch.deliveryDate}`.toLowerCase();
  const state = { orders: [], rows: [], liveOrders: [], record: null, model: null, saved: loadSaved(), savedAt: '', showStocked: false, section: '', query: '', dirty: false };
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  let saveTimer = null;

  function mergeCatalogs(...sources) {
    const merged = {};
    for (const source of sources) for (const [key, value] of Object.entries(source || {})) {
      if (value && typeof value === 'object' && !Array.isArray(value)) merged[key] = { ...merged[key], ...value };
    }
    return merged;
  }
  function catalogPricesOnly(catalog) {
    return Object.fromEntries(Object.entries(catalog || {}).filter(([, row]) =>
      row && row.price !== undefined && Number.isFinite(Number(row.price)) && Number(row.price) >= 0
    ).map(([key, row]) => [key, { price: Number(row.price) }]));
  }

  function loadSaved() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
      const sharedCatalog = JSON.parse(localStorage.getItem(PRICE_STORAGE_KEY)) || {};
      const legacy = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY)) || {};
      return {
        onHand: parsed?.onHand || {},
        catalog: mergeCatalogs(catalogPricesOnly(legacy?.catalog), catalogPricesOnly(sharedCatalog), parsed?.catalog),
        buyPackages: parsed?.buyPackages || {},
      };
    }
    catch { return { onHand: {}, catalog: {}, buyPackages: {} }; }
  }
  function groceryRecord() {
    return {
      schemaVersion: 1,
      batchKey: BATCH_KEY,
      updatedAt: new Date().toISOString(),
      onHand: state.saved.onHand,
      buyPackages: state.saved.buyPackages,
      catalog: state.saved.catalog,
    };
  }

  function setSaveState(message, mode = '') {
    $('grocerySaveState').textContent = message;
    $('grocerySaveState').className = `save-state${mode ? ` ${mode}` : ''}`;
  }

  function saveLocal(record = groceryRecord()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      updatedAt: record.updatedAt,
      onHand: record.onHand,
      buyPackages: record.buyPackages,
      catalog: record.catalog,
    }));
    localStorage.setItem(PRICE_STORAGE_KEY, JSON.stringify(catalogPricesOnly(record.catalog)));
    state.savedAt = record.updatedAt;
    return record;
  }

  function save() {
    state.dirty = true;
    const record = saveLocal();
    setSaveState('Saved in browser; saving private project copy...');
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveProjectCopy(record), 500);
  }

  async function saveProjectCopy(record = groceryRecord()) {
    clearTimeout(saveTimer);
    saveLocal(record);
    try {
      const response = await fetch('/api/grocery-state', {
        method: 'POST',
        headers: { 'Content-Type':'application/json', accept:'application/json' },
        body: JSON.stringify(record),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Private project-file save failed.');
      if (record.updatedAt === state.savedAt) state.dirty = false;
      state.savedAt = payload.state.updatedAt;
      setSaveState(`Saved twice at ${new Date(state.savedAt).toLocaleTimeString([], { hour:'numeric', minute:'2-digit', second:'2-digit' })}`, 'ok');
    } catch {
      setSaveState('Saved in browser only; export a backup before clearing browser data', 'warn');
    }
  }

  async function loadDurableState() {
    const candidates = [];
    try {
      const local = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (local) candidates.push({
        batchKey: BATCH_KEY,
        updatedAt: local.updatedAt || '',
        onHand: local.onHand || {},
        buyPackages: local.buyPackages || {},
        catalog: state.saved.catalog,
      });
    } catch { /* The project copy can recover a damaged browser copy. */ }
    try {
      const response = await fetch(`/api/grocery-state?batchKey=${encodeURIComponent(BATCH_KEY)}`, { headers:{ accept:'application/json' }, cache:'no-store', signal:AbortSignal.timeout(15000) });
      const payload = await response.json();
      if (response.ok && payload.state) candidates.push(payload.state);
    } catch { /* Browser storage remains usable if the local server is unavailable. */ }
    candidates.sort((a,b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')));
    const newest = candidates[0];
    if (newest) {
      state.saved = {
        onHand: newest.onHand || {},
        buyPackages: newest.buyPackages || {},
        catalog: mergeCatalogs(state.saved.catalog, newest.catalog),
      };
      state.savedAt = newest.updatedAt || '';
      saveLocal({ ...groceryRecord(), updatedAt: state.savedAt || new Date().toISOString() });
      setSaveState(`Recovered selections from ${new Date(state.savedAt).toLocaleString()}`, 'ok');
    } else {
      setSaveState('New batch list; pantry changes auto-save');
    }
    try { await navigator.storage?.persist?.(); } catch { /* JSON export remains available. */ }
  }
  function defaultSettings() {
    return {
      buffer: {rawProteinBufferPct:5,rawProteinReserveByDish:METHODS.rawProteinReserveByDish || {},riceBufferPct:15,riceYieldFactor:2.75},
      sauceConfig: {...METHODS.weeklySauces,customerCupsTotal:0,kitchenUseCupsPerSauce:0,qcCupsPerSauce:Number(METHODS.weeklySauces.qcCupsPerSauce)||0},
      extras: [],
    };
  }
  function clearList() {
    state.rows = []; state.model = null;
    $('listPanel').hidden = true; $('metrics').hidden = true; $('planPanel').hidden = true; $('cookiePanel').hidden = true;
    $('generateBtn').disabled = true;
  }

  async function syncOrders() {
    $('syncBtn').disabled = true;
    $('syncBtn').textContent = 'Syncing...';
    $('status').className = 'status';
    $('status').textContent = 'Reading the current Orders tab...';
    clearList();
    try {
      await savedStateReady;
      const response = await fetch('/api/current-orders', { headers: { accept:'application/json' }, cache:'no-store', signal:AbortSignal.timeout(15000) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Live sync failed.');
      const parsed = COOK.arrayRowsToOrders(payload.rows, CONFIG);
      const logResponse=await fetch(`/api/cook-log?batchKey=${encodeURIComponent(BATCH_KEY)}`,{headers:{accept:'application/json'},cache:'no-store',signal:AbortSignal.timeout(15000)});
      if(!logResponse.ok) throw new Error('Saved customer plans could not be checked. Open the planner and retry sync; grocery counts were not replaced.');
      const logPayload=await logResponse.json();
      let localRecord;
      try{localRecord=JSON.parse(localStorage.getItem(`prpdCookDayLog:${BATCH_KEY}`)||'null');}catch{}
      const record=DASH.selectRecord(logPayload.record,localRecord,BATCH_KEY);
      const selections=RUN.read(record,'recurring:selections',{});
      const merged=PRPD_RECURRING_CUSTOMERS.materialize(parsed.orders,selections,CONFIG.batch,DATA);
      state.liveOrders = merged.orders;
      state.record = record;
      state.orders = RUN.selectOrders(merged.orders, record).orders;
      const fetchedAt = payload.fetchedAt ? new Date(payload.fetchedAt) : new Date();
      const syncLabel = Number.isNaN(fetchedAt.getTime())
        ? 'live sync completed'
        : `synced ${fetchedAt.toLocaleString([], { month:'short', day:'numeric', hour:'numeric', minute:'2-digit' })}`;
      if (!state.orders.length) {
        const selected = RUN.selectOrders(merged.orders, record);
        $('status').textContent = selected.changed ? selected.message : `No current orders for Batch ${CONFIG.batch.number}; ${syncLabel}.`;
        $('status').className = `status${selected.changed ? ' warn' : ''}`;
        $('generateBtn').disabled = true;
      } else {
        if (parsed.warnings.length) throw new Error(`${parsed.warnings.length} order parsing warning(s) need review in Cook Day Planner. The grocery list has not been replaced.`);
        state.syncLabel = syncLabel;
        $('generateBtn').disabled = false;
        buildList();
      }
    } catch (error) {
      $('status').className = 'status warn';
      $('status').textContent = error.message;
      clearList(); state.orders = [];
    } finally {
      $('syncBtn').disabled = false;
      $('syncBtn').textContent = 'Sync kitchen plan';
    }
  }

  function buildList() {
    if (!state.orders.length) return;
    try {
      state.model = DASH.build({liveOrders:state.liveOrders,record:state.record,data:DATA,methods:METHODS,config:CONFIG,defaults:defaultSettings(),catalog:CATALOG,saved:state.saved});
      state.rows = state.model.rows;
      renderPlan();
      $('listPanel').hidden = state.model.blocked;
      $('metrics').hidden = state.model.blocked;
      if (!state.model.blocked) { renderCookiePanel(); renderRows(); renderMetrics(); }
    } catch (error) {
      clearList();
      $('status').className = 'status warn'; $('status').textContent = error.message;
    }
  }

  function refreshInventory() {
    if (!state.model || state.model.blocked) return;
    state.rows = GROCERY.buildPurchaseRows(state.model.shoppingRequirements, CATALOG, state.saved);
    renderRows(); renderMetrics();
  }
  function renderCookiePanel() {
    const cookie=state.model?.cookiePlan;
    $('cookiePanel').hidden=!cookie?.needed;
    if(!cookie?.needed)return;
    $('cookieTitle').textContent=`Complimentary cookies: ${cookie.produced} total`;
    const eggs=cookie.produced===20?'3 whole eggs and 4 extra yolks from 7 shell eggs':`${cookie.batches*2} whole eggs and ${cookie.batches*2} extra yolks`;
    $('cookieDescription').textContent=`${cookie.needed} customer orders get one full-size cookie each; ${cookie.spare} extra. The one-time Batch 19 recipe is scaled from the 12-cookie base to ${cookie.produced} cookies. Use ${eggs}; the shopping list subtracts eggs already at home.`;
    $('cookieRows').innerHTML=cookie.ingredients.map(item=>`<tr><td>${esc(item.name)}</td><td>${esc(item.amount)} ${esc(item.unit)}</td></tr>`).join('');
  }
  function renderPlan() {
    const model = state.model, plan = model.plan;
    $('status').className = `status${model.blocked || !model.exact || model.selection.changed ? ' warn' : ''}`;
    $('status').textContent = [model.message, state.syncLabel].filter(Boolean).join(' · ');
    $('planPanel').hidden = false;
    $('planTitle').textContent = model.blocked ? 'Review needed' : model.exact ? 'Same kitchen plan' : model.snapshot?.legacy ? 'Older lock · planning preview' : 'Planning preview';
    $('planCount').textContent = plan ? `${plan.totalMeals} meals · ${plan.cups.total} cups · ${plan.labelCount} labels` : '';
    const settings = model.settings || defaultSettings();
    $('planSettings').textContent = `${Number(settings.buffer.rawProteinBufferPct)||0}% protein reserve · ${Number(settings.buffer.riceBufferPct)||0}% rice allowance · ${Number(settings.buffer.riceYieldFactor)||3}× rice yield · ${settings.extras.length} optional extras`;
    const issues = [...(plan?.diagnostics.errors || []),...(plan?.diagnostics.holds || []),...(plan?.diagnostics.decisions || []).map(row=>row.message),...(plan?.diagnostics.warnings || []).map(row=>row.message)];
    $('planReview').hidden = !issues.length;
    $('planReviewSummary').textContent = model.blocked ? 'Calculation issues to resolve' : `${issues.length} recipe validation notes · planning estimate only`;
    $('planIssues').innerHTML = issues.map(note=>`<li>${esc(note)}</li>`).join('');
    $('planOrigin').textContent = plan ? `Batch ${CONFIG.batch.number} · ${model.selection.mode} source · ${plan.schemaVersion} · ${plan.snapshot.id}` : '';
    $('generateBtn').disabled = model.blocked;
  }
  function renderMetrics() {
    const s = GROCERY.summary(state.rows);
    const values = [
      [`$${s.estimatedCost.toFixed(2)}`, 'estimated checkout'],
      [s.buyItems, 'items still to buy'],
      [s.stockedItems, 'items marked stocked'],
      [`$${s.foodUsageCost.toFixed(2)}`, 'estimated recipe food cost'],
    ];
    $('metrics').innerHTML = values.map(([value,label]) => `<div class="metric"><strong>${esc(value)}</strong><span>${esc(label)}</span></div>`).join('');
    const warnings = GROCERY.catalogValidationWarnings(state.rows);
    $('costNote').innerHTML = `<p>Recipe food cost estimates ingredient demand, including the selected purchasing allowances, at saved prices. It is not measured consumption or actual margin. Checkout estimates the listed purchase units after pantry stock; some units are weight allowances, not supplier packages.</p><p>Produce counts are shopping estimates. Buy by weight when sizes vary. Check actual package sizes, stock and shelf prices.</p>${warnings.length ? `<ul>${warnings.map(w=>`<li>${esc(w)}</li>`).join('')}</ul>` : ''}`;
    const unpriced = state.rows.filter(row=>!row.nonPurchase && row.needed > 0 && !row.configured).length;
    $('shoppingWarning').hidden = !s.underBought && !unpriced;
    $('shoppingWarning').textContent = [s.underBought ? `${s.underBought} item(s) below the suggested purchase quantity.` : '',unpriced ? `${unpriced} unpriced item(s) excluded from checkout estimate.` : ''].filter(Boolean).join(' ');
    $('showStockedBtn').textContent = `${state.showStocked ? 'Hide' : 'Show'} stocked items (${s.stockedItems})`;
  }

  function renderRows() {
    $('groceryRows').innerHTML = DASH.renderRows(state.rows,state.model?.plan,state);
    const groups = [{name:'',label:'All sections',count:state.rows.filter(row=>!row.nonPurchase && row.needed>0).length},...DASH.sections(state.rows).map(row=>({...row,label:row.name}))];
    $('sectionNav').innerHTML = groups.map(group=>`<button data-section-filter="${esc(group.name)}" aria-pressed="${state.section===group.name}">${esc(group.label)} <span>${group.count}</span></button>`).join('');
    const shown = DASH.visibleRows(state.rows,state).length;
    $('visibleCount').textContent = `${shown} ${shown === 1 ? 'item' : 'items'} shown`;
  }

  function updateRow(target) {
    const tr = target.closest('tr[data-key]');
    if (!tr) return;
    const key = tr.dataset.key;
    const row = state.rows.find(item => item.key === key);
    if (!row) return;
    if (!DASH.edit(state.saved,row,target.dataset.action || target.dataset.field,target.value)) return;
    save();
    refreshInventory();
  }

  function exportCsv() {
    const blob = new Blob([GROCERY.csv(state.rows)], { type:'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `prpd-batch-${CONFIG.batch.number}-grocery-list.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function exportState() {
    const record = saveLocal();
    const blob = new Blob([`${JSON.stringify(record, null, 2)}\n`], { type:'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `PRPD-grocery-state-batch-${CONFIG.batch.number}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    setSaveState('Backup exported', 'ok');
  }

  async function importState(file) {
    try {
      const record = JSON.parse(await file.text());
      if (record.batchKey !== BATCH_KEY) throw new Error('This backup belongs to a different batch.');
      state.saved = {
        onHand: record.onHand || {},
        buyPackages: record.buyPackages || {},
        catalog: mergeCatalogs(state.saved.catalog, record.catalog),
      };
      await saveProjectCopy(groceryRecord());
      refreshInventory();
    } catch (error) {
      setSaveState(error.message || 'Backup import failed', 'warn');
    }
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
      save(); refreshInventory(); return;
    }
    const button = event.target.closest('[data-action]');
    if (button) updateRow(button);
  });
  $('exportBtn').addEventListener('click', exportCsv);
  $('exportStateBtn').addEventListener('click', exportState);
  $('importStateFile').addEventListener('change', event => {
    if (event.target.files[0]) importState(event.target.files[0]);
    event.target.value = '';
  });
  $('printBtn').addEventListener('click', () => {
    const previous = {showStocked:state.showStocked,section:state.section,query:state.query};
    Object.assign(state,{showStocked:false,section:'',query:''}); renderRows();
    try { window.print(); } finally { Object.assign(state,previous); renderRows(); }
  });
  $('showStockedBtn').addEventListener('click', () => { state.showStocked = !state.showStocked; renderRows(); renderMetrics(); });
  $('searchItems').addEventListener('input', event => { state.query = event.target.value; renderRows(); });
  $('sectionNav').addEventListener('click', event => {
    const button = event.target.closest('[data-section-filter]');
    if (!button) return;
    state.section = button.dataset.sectionFilter; renderRows();
  });
  $('resetBtn').addEventListener('click', () => {
    if (!window.confirm('Clear this batch’s pantry quantities and purchase counts? Your saved prices will stay. Export a backup first if you need these selections.')) return;
    state.saved = { onHand:{}, catalog:{ ...state.saved.catalog }, buyPackages:{} };
    save();
    refreshInventory();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'hidden' || !state.dirty) return;
    try {
      const record = saveLocal();
      navigator.sendBeacon?.('/api/grocery-state', new Blob([JSON.stringify(record)], { type:'application/json' }));
    } catch { /* The latest successful autosave remains available. */ }
  });
  window.addEventListener('pagehide', () => {
    if (!state.dirty) return;
    try {
      const record = saveLocal();
      navigator.sendBeacon?.('/api/grocery-state', new Blob([JSON.stringify(record)], { type:'application/json' }));
    } catch { /* The latest successful autosave remains available. */ }
  });
  const savedStateReady = loadDurableState();
  // Start from the current protected order feed every time the Grocery
  // Builder opens. Batch-scoped pantry selections still load first, but an
  // old reviewed plan can never masquerade as the current week's demand.
  savedStateReady.then(() => syncOrders());
})();
