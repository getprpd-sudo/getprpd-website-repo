(function businessCenterApp() {
  const Core = window.PRPDBusinessCore;
  const targets = window.PRPD_DISCOVERY_TARGETS || [];
  const $ = selector => document.querySelector(selector);
  let payload = { orders: [], payments: [], leads: [], receivables: [], fetchedAt: '' };
  let state = { outreach: {}, expenses: [], adImports: [] };
  let model = Core.summarize(payload, state);

  const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(value) || 0);
  const percent = value => new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 }).format(Number(value) || 0);
  const integer = value => new Intl.NumberFormat('en-US').format(Math.round(Number(value) || 0));
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[char]);
  const emptyRow = (columns, message) => `<tr><td class="empty" colspan="${columns}">${escape(message)}</td></tr>`;

  function isoDate(date) { return date.toISOString().slice(0, 10); }

  function initializeTikTokDates() {
    const end = new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - 29);
    $('#tiktokStartDate').value = isoDate(start);
    $('#tiktokEndDate').value = isoDate(end);
  }

  function upsertAdImport(report) {
    state.adImports = [...state.adImports.filter(row => row.id !== report.id), report];
  }

  function metric(label, value, warning = false) {
    return `<article class="metric${warning ? ' warning' : ''}"><strong>${escape(value)}</strong><span>${escape(label)}</span></article>`;
  }

  function currentModel() {
    return Core.filterBatch(model, $('#batchSelect').value);
  }

  function renderBatchOptions() {
    const select = $('#batchSelect');
    const current = select.value;
    select.innerHTML = '<option value="0">All batches</option>' + model.batchIds.map(id => `<option value="${id}">Batch ${id}</option>`).join('');
    select.value = current && [...select.options].some(option => option.value === current) ? current : String(model.batchIds[0] || 0);
  }

  function renderGrowth() {
    const scoped = currentModel();
    const finances = Core.financials(scoped);
    const emailOptIns = scoped.orders.filter(order => /^(yes|true|1)$/i.test(order['Menu Email Opt-In'])).length;
    const attributed = scoped.orders.filter(order => order.source !== 'Direct / unknown').length;
    $('#growthMetrics').innerHTML = [
      metric('Website leads (all time)', model.leads.length), metric('Orders in view', finances.orderCount),
      metric('Booked revenue', money(finances.booked)), metric('Average order', money(finances.aov)),
      metric('Attributed orders', attributed), metric('Menu email opt-ins', emailOptIns),
    ].join('');
    const sources = Core.sourceRows(scoped);
    $('#sourceRows').innerHTML = sources.length ? sources.map(row => `<tr><td>${escape(row.source)}</td><td class="number">${row.leads}</td><td class="number">${row.orders}</td><td class="number">${money(row.revenue)}</td><td class="number">${percent(row.conversion)}</td><td class="number">${money(row.aov)}</td></tr>`).join('') : emptyRow(6, 'No source data yet.');
    const referrals = Core.referralRows(scoped);
    $('#referralRows').innerHTML = referrals.length ? referrals.map(row => `<tr><td>${escape(row.partner)}</td><td>${escape(row.code)}</td><td class="number">${row.orders}</td><td class="number">${money(row.revenue)}</td><td class="number">${money(row.discount)}</td></tr>`).join('') : emptyRow(5, 'No referral-code orders yet.');
  }

  function renderFinance() {
    const scoped = currentModel();
    const summary = Core.financials(scoped);
    $('#financeMetrics').innerHTML = [
      metric('Booked sales', money(summary.booked)), metric('Cash collected', money(summary.collected)),
      metric('Outstanding', money(summary.outstanding), summary.outstanding > 0), metric('Estimated direct packed cost', money(summary.directCost)),
      metric('Direct cost rate', percent(summary.directCostPct), summary.directCostPct > .38), metric('Estimated contribution', money(summary.contribution)),
    ].join('');
    const warning = $('#costWarning');
    if (summary.unknownCostItems.length) {
      warning.className = 'notice warn';
      warning.innerHTML = `<strong>Incomplete cost match:</strong> ${escape(summary.unknownCostItems.join(', '))}. Contribution is understated until these recipes are mapped.`;
    } else {
      warning.className = 'notice';
      warning.innerHTML = '<strong>Estimate scope:</strong> recipe ingredients, saved protein reserve, packaging, and approved consumables are included. Owner labor and unpaid overhead are not.';
    }
    const batches = Core.batchRows(model);
    $('#batchRows').innerHTML = batches.length ? batches.map(row => `<tr><td>Batch ${row.batch}</td><td class="number">${row.orderCount}</td><td class="number">${money(row.booked)}</td><td class="number">${money(row.collected)}</td><td class="number">${money(row.outstanding)}</td><td class="number">${money(row.directCost)}</td><td class="number">${money(row.contribution)}</td></tr>`).join('') : emptyRow(7, 'No batches found.');
    const customers = Core.customerRows(scoped);
    $('#customerRows').innerHTML = customers.length ? customers.map(row => `<tr><td>${escape(row.customer)}</td><td class="number">${row.orders}</td><td class="number">${money(row.due)}</td><td class="number">${money(row.paid)}</td><td class="number">${money(row.balance)}</td></tr>`).join('') : emptyRow(5, 'No payment records found.');
    const receivables = Core.receivableRows(model);
    $('#receivableRows').innerHTML = receivables.length ? receivables.map(row => `<tr><td>${escape(row['Client Account'])}</td><td>${escape(row['Covered Batches'])}</td><td class="number">${money(row.agreed)}</td><td class="number">${money(row.paid)}</td><td class="number">${money(row.balance)}</td><td>${escape(row.Status)}</td><td>${escape(row.Notes)}</td></tr>`).join('') : emptyRow(7, 'No consolidated collection requests found.');
    renderExpenses();
  }

  function renderExpenses() {
    const rows = currentModel().expenses.slice().sort((a, b) => b.date.localeCompare(a.date));
    $('#expenseRows').innerHTML = rows.length ? rows.map(row => `<tr><td>${escape(row.date)}</td><td>${escape(row.batch)}</td><td>${escape(row.vendor)}</td><td>${escape(row.category)}</td><td class="number">${money(row.amount)}</td><td>${escape(row.notes)}</td><td><button class="text-btn" data-delete-expense="${escape(row.id)}">Remove</button></td></tr>`).join('') : emptyRow(7, 'No additional expenses recorded.');
  }

  function outreachRecord(id) {
    return state.outreach[id] || { status:'Not contacted', owner:'Rida', notes:'', lastContact:'' };
  }

  function renderOutreach() {
    const counts = {};
    targets.forEach(target => { const status = outreachRecord(target.id).status; counts[status] = (counts[status] || 0) + 1; });
    $('#outreachSummary').innerHTML = ['Not contacted','Draft ready','Contacted','Follow up','Meeting','Partner'].map(status => `<span class="summary-pill">${escape(status)}: ${counts[status] || 0}</span>`).join('');
    $('#outreachRows').innerHTML = targets.map((target) => {
      const record = outreachRecord(target.id);
      const options = ['Not contacted','Draft ready','Contacted','Follow up','Meeting','Partner','Passed'].map(status => `<option${record.status === status ? ' selected' : ''}>${status}</option>`).join('');
      const contact = [target.contact, target.email && `<a href="mailto:${escape(target.email)}">${escape(target.email)}</a>`, target.phone && `<a href="tel:${escape(target.phone)}">${escape(target.phone)}</a>`, `<a href="${escape(target.url)}" target="_blank" rel="noreferrer">Official page</a>`].filter(Boolean).join('');
      return `<tr data-outreach="${target.id}"><td class="number">${target.priority}</td><td><div class="target-name">${escape(target.name)}</div><div class="target-meta">${escape(target.type)} · ${escape(target.city)}</div></td><td class="angle">${escape(target.angle)}</td><td><div class="contact-links">${contact}</div></td><td><select data-outreach-status>${options}</select><input data-outreach-date type="date" value="${escape(record.lastContact)}" aria-label="Last contact date"></td><td><textarea data-outreach-notes placeholder="Contact, response, and next step">${escape(record.notes)}</textarea></td><td><button class="btn" data-draft="${target.id}">Draft email</button></td></tr>`;
    }).join('');
  }

  function renderAdImports() {
    const rows = state.adImports.slice().reverse();
    $('#adImportRows').innerHTML = rows.length ? rows.map(row => `<tr><td>${escape((row.importedAt || '').slice(0,10))}</td><td>${escape(row.fileName)}</td><td>${escape(row.dateFrom || '-')} to ${escape(row.dateTo || '-')}</td><td class="number">${money(row.spend)}</td><td class="number">${integer(row.impressions)}</td><td class="number">${integer(row.clicks)}</td><td class="number">${integer(row.conversions)}</td><td><button class="text-btn" data-delete-import="${escape(row.id)}">Remove</button></td></tr>`).join('') : emptyRow(8, 'No TikTok report imported yet.');
  }

  function renderAll() { renderGrowth(); renderFinance(); renderOutreach(); renderAdImports(); }

  async function saveState(message = 'Saved locally') {
    const response = await fetch('/api/business-state', { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify(state) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'State could not be saved.');
    state = result.state;
    $('#syncDetail').textContent = message;
  }

  async function sync() {
    $('#syncBtn').disabled = true;
    $('#syncState').textContent = 'Syncing live data...';
    try {
      const [dataResponse, stateResponse] = await Promise.all([fetch('/api/business-data'), fetch('/api/business-state')]);
      const data = await dataResponse.json();
      const saved = await stateResponse.json();
      if (!stateResponse.ok) throw new Error(saved.error || 'Local state could not be loaded.');
      state = saved.state || state;
      if (dataResponse.ok) payload = data;
      model = Core.summarize(payload, state);
      renderBatchOptions(); renderAll();
      if (!dataResponse.ok) throw new Error(data.error || 'Live data sync failed.');
      const snapshotMode = data.source === 'historical-snapshot-plus-live-orders';
      $('#syncState').textContent = data.partial ? 'Current orders synced' : snapshotMode ? 'History and current orders synced' : 'Live data synced';
      $('#syncDetail').textContent = data.partial
        ? `${model.orders.length} orders loaded. Payment Log and Website Leads will join after the reporting endpoint is deployed.`
        : snapshotMode
          ? `${model.orders.length} orders, ${model.payments.length} payment records, ${model.leads.length} leads. Current Orders are live; historical finance and lead data were refreshed ${new Date(data.snapshotAt).toLocaleString()}.`
        : `${model.orders.length} orders, ${model.payments.length} payment records, ${model.leads.length} leads | ${new Date(data.fetchedAt).toLocaleString()}`;
      $('#sheetsDot').classList.toggle('good', !data.partial);
      $('#sheetsDetail').textContent = data.partial
        ? 'Current Orders are live. Payment Log and Website Leads await reporting-endpoint deployment.'
        : snapshotMode
          ? 'Current Orders are live. Historical Payment Log, Website Leads, and Accounts Receivable use the latest secured local snapshot.'
        : 'Live read-only sync for Orders, Payment Log, and Website Leads.';
    } catch (error) {
      $('#syncState').textContent = 'Sync needs attention'; $('#syncDetail').textContent = error.message;
      $('#sheetsDot').classList.remove('good');
      $('#sheetsDetail').textContent = 'The protected reporting connection is unavailable. Local outreach and saved records still work.';
    } finally { $('#syncBtn').disabled = false; }
  }

  async function syncTikTok() {
    const button = $('#syncTikTokBtn');
    button.disabled = true;
    button.textContent = 'Syncing...';
    try {
      const query = new URLSearchParams({
        startDate: $('#tiktokStartDate').value,
        endDate: $('#tiktokEndDate').value,
      });
      const response = await fetch(`/api/tiktok-report?${query}`);
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.report) throw new Error(result.error || 'TikTok reporting sync failed.');
      upsertAdImport(result.report);
      await saveState('TikTok API report synced');
      model = Core.summarize(payload, state);
      renderAll();
      $('#tiktokDot').classList.add('good');
      $('#tiktokDetail').textContent = `Connected read-only. Last synced ${new Date(result.report.importedAt).toLocaleString()}.`;
    } catch (error) {
      $('#tiktokDot').classList.remove('good');
      $('#tiktokDetail').textContent = `${error.message} CSV import is still available.`;
    } finally {
      button.disabled = false;
      button.textContent = 'Sync TikTok API';
    }
  }

  function draftFor(target) {
    const greeting = target.contact && !/team|board|office|front desk|officers/i.test(target.contact) ? `Hi ${target.contact},` : `Hi ${target.name} team,`;
    return {
      subject: `Local PRPD meal prep partnership for ${target.name}`,
      body: `${greeting}\n\nI'm Rida, the owner and operator of PRPD, a halal high-protein meal prep service serving DFW. I prepare and deliver our meals fresh each week for clients who want their food to fit their training and nutrition goals.\n\nI think PRPD could be a useful fit for your community. ${target.angle}\n\nI'd be happy to bring a small tasting so you can try the food first. If it is a fit, I can also create a unique tracked code for your members so there is no guesswork about whether the partnership is useful. There is no commitment required.\n\nWould you be open to a short conversation or tasting next week?\n\nThank you,\nRida\nPRPD · Meals. Prepped.\ngetprpd.com`,
    };
  }

  document.addEventListener('click', async (event) => {
    const tab = event.target.closest('[data-tab]');
    if (tab) {
      document.querySelectorAll('.tab').forEach(item => item.classList.toggle('active', item === tab));
      document.querySelectorAll('.view').forEach(view => view.classList.toggle('active', view.id === `${tab.dataset.tab}View`));
    }
    const draftButton = event.target.closest('[data-draft]');
    if (draftButton) {
      const target = targets.find(item => item.id === draftButton.dataset.draft);
      const draft = draftFor(target); $('#draftTitle').textContent = target.name; $('#draftSubject').value = draft.subject; $('#draftBody').value = draft.body;
      $('#openEmailBtn').href = `mailto:${target.email || ''}?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}`;
      $('#draftDialog').showModal();
    }
    const expenseId = event.target.dataset.deleteExpense;
    if (expenseId) { state.expenses = state.expenses.filter(row => row.id !== expenseId); await saveState('Expense removed'); model = Core.summarize(payload, state); renderAll(); }
    const importId = event.target.dataset.deleteImport;
    if (importId) { state.adImports = state.adImports.filter(row => row.id !== importId); await saveState('Ad import removed'); model = Core.summarize(payload, state); renderAll(); }
  });

  $('#syncBtn').addEventListener('click', sync);
  $('#syncTikTokBtn').addEventListener('click', syncTikTok);
  $('#batchSelect').addEventListener('change', renderAll);
  $('#copyDraftBtn').addEventListener('click', async () => { await navigator.clipboard.writeText(`${$('#draftSubject').value}\n\n${$('#draftBody').value}`); $('#copyDraftBtn').textContent = 'Copied'; });
  $('#expenseForm').addEventListener('submit', async (event) => {
    event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget));
    state.expenses.push({ ...values, id:`expense-${Date.now()}`, amount:Number(values.amount) });
    await saveState('Expense saved locally'); model = Core.summarize(payload, state); event.currentTarget.reset(); renderAll();
  });
  $('#outreachRows').addEventListener('change', async (event) => {
    const row = event.target.closest('[data-outreach]'); if (!row) return;
    const id = row.dataset.outreach; state.outreach[id] = { ...outreachRecord(id), status:row.querySelector('[data-outreach-status]').value, lastContact:row.querySelector('[data-outreach-date]').value, notes:row.querySelector('[data-outreach-notes]').value };
    await saveState('Outreach status saved'); renderOutreach();
  });
  $('#outreachRows').addEventListener('focusout', async (event) => {
    if (!event.target.matches('[data-outreach-notes]')) return;
    const row = event.target.closest('[data-outreach]'); const id = row.dataset.outreach;
    state.outreach[id] = { ...outreachRecord(id), notes:event.target.value };
    await saveState('Outreach notes saved');
  });
  $('#importTikTokBtn').addEventListener('click', async () => {
    const file = $('#tiktokFile').files[0]; if (!file) return alert('Choose a TikTok CSV export first.');
    try { upsertAdImport(Core.importTikTokCsv(await file.text(), file.name)); await saveState('TikTok report imported'); model = Core.summarize(payload, state); renderAll(); }
    catch (error) { alert(error.message); }
  });

  renderBatchOptions();
  initializeTikTokDates();
  renderAll();
  sync();
}());
