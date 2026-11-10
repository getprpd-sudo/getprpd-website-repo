(function (root, factory) {
  const node = typeof module !== 'undefined' && module.exports;
  const api = factory(node ? require('./production-engine') : root.PRPD_PRODUCTION_ENGINE,
    node ? require('./production-run') : root.PRPD_PRODUCTION_RUN,
    node ? require('./grocery-list-core') : root.PRPD_GROCERY_CORE);
  if (node) module.exports = api;
  else root.PRPD_GROCERY_DASHBOARD = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (engine, run, grocery) {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const money = value => `$${Number(value || 0).toFixed(2)}`;
  function amount(value, unit) {
    const n = Number(value) || 0;
    if (unit === 'g') return n >= 453.59237 ? `${(n / 453.59237).toFixed(n >= 4535.9237 ? 1 : 2)} lb` : `${(n / 28.3495).toFixed(1)} oz`;
    return `${Number.isInteger(n) ? n : Math.round(n * 10) / 10} ${unit === 'each' ? 'count' : unit}`;
  }
  function coverage(plan, row) {
    const same = candidate => candidate === row.key || row.key === 'fage' && candidate === 'simple_truth_yogurt';
    const dishes = new Map();
    for (const recipe of plan?.recipes || []) {
      if (!recipe.ingredients?.some(item => same(item.key))) continue;
      const count = Math.max(0, Number(recipe.productionQty) || 0);
      if (!count) continue;
      dishes.set(recipe.name, (dishes.get(recipe.name) || 0) + count);
    }
    if (dishes.size) {
      const all = [...dishes].map(([name,count]) => `${count} ${name}`);
      return `Used in: ${all.slice(0,3).join(' · ')}${all.length > 3 ? ` · +${all.length - 3} more dishes` : ''}`;
    }
    const packaging = {
      meal_container:`Covers ${row.required} prepared meals`,
      grab_go_container:`Covers ${row.required} Grab & Go items`,
      dessert_cup:`Covers ${row.required} dessert cups`,
      small_dessert_box:`Covers ${row.required} dessert boxes`,
      sauce_cup:`Covers ${row.required} sauce portions`,
      sauce_lid:`Covers ${row.required} sauce portions`,
      paper_bag:`Covers ${row.required} customer orders`,
      printed_label:`Covers ${row.required} labeled items`,
    };
    if (packaging[row.key]) return packaging[row.key];
    const usefulSources = (row.sources || []).filter(source => !['Recipes','Packaging'].includes(source));
    return usefulSources.length ? `For: ${usefulSources.slice(0,2).join(' · ')}` : '';
  }
  function build({liveOrders,record,data,methods,config,defaults,catalog,saved}) {
    const selection = run.selectOrders(liveOrders, record);
    if (!selection.orders.length) return {selection,blocked:true,message:selection.message,rows:[],plan:null};
    const settings = run.settings(record, defaults);
    const configuredBatch = Number(config?.batch?.number);
    const recipeBatch = Number(data?.batch);
    const methodBatch = Number(methods?.batch);
    if (!Number.isFinite(configuredBatch) || !Number.isFinite(recipeBatch) || !Number.isFinite(methodBatch) ||
        configuredBatch !== recipeBatch || configuredBatch !== methodBatch) {
      return {
        selection, settings, plan:null, snapshot:null, blocked:true, exact:false, rows:[],
        message:`Current recipe data is not ready for Batch ${Number.isFinite(configuredBatch) ? configuredBatch : 'unknown'}. Regenerate the current recipe payload, then reopen the Grocery Builder.`,
      };
    }
    const plan = engine.compileProduction({orders:selection.orders,data,methods,config,...settings});
    const snapshot = run.snapshotStatus(plan, record);
    const blocked = selection.changed || !plan.diagnostics.ok || (!snapshot.ok && !snapshot.legacy);
    const message = selection.changed ? 'Orders changed after the kitchen plan was locked. Review the changes in Cook Day Planner before shopping.' : !plan.diagnostics.ok ? 'The kitchen plan has unresolved calculation errors. Review it in Cook Day Planner.' : snapshot.message || selection.message;
    // A legacy lock can be inspected, but it is never presented as an exact locked run.
    const exact = !blocked && snapshot.ok && !snapshot.legacy && ['locked','reviewed'].includes(selection.mode) &&
      Boolean(run.read(record, selection.mode === 'locked' ? 'lock:engine-snapshot-json' : 'plan:engine-snapshot-json'));
    return {selection,settings,plan,snapshot,blocked,exact,message,
      rows:blocked ? [] : grocery.buildPurchaseRows(plan.requirements, catalog, saved)};
  }
  function selectRecord(remote, local, batchKey) {
    const valid = [remote,local].filter(record => record?.batchKey === batchKey);
    // An older browser tab cannot supersede the protected server lock.
    const chosen = remote?.batchKey === batchKey && remote.fields?.['lock:status'] === 'locked' ? remote :
      [...valid].sort((a,b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')))[0];
    return chosen ? run.mergeReviewedFields(chosen,valid) : undefined;
  }
  function visibleRows(rows, {showStocked=false,section='',query=''} = {}) {
    const search = query.trim().toLowerCase();
    return rows.filter(row => !row.nonPurchase && (showStocked || row.needed > 0) && (!section || row.section === section) &&
      (!search || [row.name,row.packageLabel,row.section,...(row.sources || [])].join(' ').toLowerCase().includes(search)));
  }
  function sections(rows) {
    return [...new Set(rows.filter(row => !row.nonPurchase).map(row => row.section))].map(name => {
      const items = rows.filter(row => row.section === name && !row.nonPurchase && row.needed > 0);
      return {name,count:items.length,cost:items.reduce((n,row) => n + row.estimatedCost,0)};
    });
  }
  function allocations(plan, key) {
    const same = candidate => candidate === key || key === 'fage' && candidate === 'simple_truth_yogurt';
    const rows = (plan?.recipes || []).flatMap(recipe => recipe.ingredients.filter(item => same(item.key)).map(item => ({
      name:recipe.title,amount:item.baseAmount,unit:item.unit || 'g',kind:'recipe',
    })));
    for (const item of plan?.operational?.totals || []) {
      if (same(item.key) && item.bufferedAmount > item.baseAmount) rows.push({name:'Separate purchasing reserve',amount:item.bufferedAmount-item.baseAmount,unit:item.unit || 'g',kind:'reserve'});
    }
    for (const item of plan?.adjustments || []) if (same(item.key)) rows.push({name:item.reason || 'Approved adjustment',amount:item.delta,unit:item.unit || 'g',kind:'adjustment'});
    return rows;
  }
  function rowHtml(row, plan) {
    const stocked = row.needed <= 0;
    const details = allocations(plan, row.key);
    const coverageLabel = coverage(plan,row);
    const search = /^https:\/\//.test(row.productUrl || '') ? row.productUrl : `https://www.walmart.com/search?q=${encodeURIComponent(row.query || row.name)}`;
    return `<tr data-key="${esc(row.key)}" class="${stocked ? 'stocked-row' : ''}">
      <td class="ingredient" data-label="Item"><strong>${esc(row.name)}</strong>${Number(row.minimumPieceCount) > 0 ? `<small><b>Count at least ${Math.ceil(row.minimumPieceCount)} ${esc(row.pieceCountBasis || 'individual pieces')}.</b> Verify the actual count, including pantry stock. Displayed weight is an estimate.</small>` : ''}${coverageLabel ? `<small class="coverage">${esc(coverageLabel)}</small>` : ''}
        <details class="item-details"><summary>Allocations &amp; price</summary><div class="detail-body">
          <p>Plan total: <strong>${esc(amount(row.required,row.unit))}</strong>${row.unit === 'g' ? ` (${row.required} g)` : ''}. ${esc((row.sources || []).join(' · '))}</p>
          ${details.length ? `<ul>${details.map(item => `<li><span>${esc(item.name)}</span><strong>${esc(amount(item.amount,item.unit))}</strong></li>`).join('')}</ul>` : ''}
          <p><span class="pill ${esc(row.confidence)}">${esc(row.confidence)} price basis</span></p>
          <p>${esc(row.packageLabel || 'Package not configured')} · ${esc(row.store)}</p>
          <label class="screen-only">Price per listed unit ($)<input aria-label="${esc(row.name)} package price" data-field="price" type="number" min="0" step="0.01" value="${row.packagePrice}"></label>
          <div class="compare-links screen-only"><a href="${esc(search)}" target="_blank" rel="noopener">Compare product</a><a href="https://member.restaurantdepot.com/store/jetro-restaurant-depot/" target="_blank" rel="noopener">Restaurant Depot</a></div>
        </div></details>
      </td>
      <td class="amount" data-label="Still needed"><strong>${stocked ? 'Stocked' : esc(amount(row.needed,row.unit))}</strong>${!stocked && row.estimatedCount ? `<small>${esc(row.estimatedCount.label)}</small>` : ''}<small>Plan: ${esc(amount(row.required,row.unit))}</small></td>
      <td class="pantry" data-label="On hand"><span class="print-only">${esc(amount(row.onHand,row.unit))}</span><div class="screen-only"><label class="pantry-input"><span class="sr-only">${esc(row.name)} on hand in ${esc(row.unit)}</span><input aria-label="${esc(row.name)} on hand in ${esc(row.unit)}" data-field="onHand" type="number" min="0" step="${row.unit === 'each' ? '1' : '0.1'}" value="${row.onHand}"><span>${esc(row.unit)}</span></label><button class="row-action" data-action="${stocked ? 'unstocked' : 'stocked'}">${stocked ? 'Put back' : 'Have enough'}</button></div></td>
      <td data-label="Buy units">${stocked ? '<span class="pill">Ready</span>' : row.configured ? `<div class="stepper screen-only"><button aria-label="Decrease ${esc(row.name)} packages" data-action="package-dec">−</button><strong>${row.packages}</strong><button aria-label="Increase ${esc(row.name)} packages" data-action="package-inc">+</button></div><strong class="print-only">${row.packages} × </strong><small>${esc(row.packageLabel)}</small>${row.packages !== row.suggestedPackages ? `<button class="row-action screen-only" data-action="reset-suggestion">Use suggested ${row.suggestedPackages}</button>` : ''}${row.shortAmount > 0 ? `<small class="short">Short ${esc(amount(row.shortAmount,row.unit))}</small>` : ''}` : '<span class="pill planning">Check package</span>'}</td>
      <td class="amount" data-label="Est. checkout">${stocked ? '—' : row.configured ? money(row.estimatedCost) : 'Unpriced'}</td>
    </tr>`;
  }
  function renderRows(rows, plan, filter) {
    let previous = '';
    return visibleRows(rows, filter).map(row => {
      let heading = '';
      if (row.section !== previous) {
        previous = row.section;
        const group = sections(rows).find(item => item.name === row.section);
        heading = `<tr class="station-row" data-section="${esc(row.section)}"><td colspan="5"><div><strong>${esc(row.section)}</strong><span>${group.count} to buy · ${money(group.cost)}</span><button class="section-action screen-only" data-action="stock-section">Have this section</button></div></td></tr>`;
      }
      return heading + rowHtml(row, plan);
    }).join('') || '<tr><td colspan="5" class="empty">No items in this view. Try another section or show stocked items.</td></tr>';
  }
  // Only the owner-edited inventory fields change. Engine demand and catalog units stay intact.
  function edit(saved, row, action, value) {
    if (action === 'stocked' || action === 'unstocked' || action === 'onHand') {
      saved.onHand[row.key] = action === 'stocked' ? row.required : action === 'unstocked' ? 0 : Math.max(0,Number(value)||0);
      delete saved.buyPackages[row.key];
    } else if (action === 'package-inc' || action === 'package-dec') saved.buyPackages[row.key] = Math.max(0,row.packages + (action === 'package-inc' ? 1 : -1));
    else if (action === 'reset-suggestion') delete saved.buyPackages[row.key];
    else if (action === 'price') saved.catalog[row.key] = {...saved.catalog[row.key],price:Math.max(0,Number(value)||0)};
    else return false;
    return true;
  }
  return {build,selectRecord,visibleRows,sections,allocations,coverage,renderRows,edit,amount,esc,money};
});
