(function businessCenterApp() {
  const Core = window.PRPDBusinessCore;
  const targets = window.PRPD_DISCOVERY_TARGETS || [];
  const $ = selector => document.querySelector(selector);
  let payload = { orders: [], payments: [], leads: [], receivables: [], fetchedAt: '' };
  let state = { outreach: {}, expenses: [], adImports: [], lifecycle: {}, growthSettings: { googleReviewUrl: '' }, googleBusiness: { status:'Not started', profileUrl:'', verificationMethod:'', notes:'', updatedAt:'' }, marketing: { currentCampaign:null, history:[] } };
  let referralRegistry = [];
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
    const selected = Number($('#batchSelect')?.value || 0);
    const tagged = { ...report, batch: selected ? `Batch ${selected}` : '' };
    state.adImports = [...state.adImports.filter(row => row.id !== tagged.id), tagged];
  }

  function metric(label, value, warning = false) {
    return `<article class="metric${warning ? ' warning' : ''}"><strong>${escape(value)}</strong><span>${escape(label)}</span></article>`;
  }

  function currentModel() {
    return Core.filterBatch(model, $('#batchSelect').value);
  }

  function currentBatchNumber() {
    return Number(window.PRPD_ORDER_CONFIG?.batch?.number) || model.batchIds[0] || 0;
  }

  function lifecycleRecord(email) {
    return state.lifecycle?.[email] || { status:'Not contacted', notes:'', lastContact:'' };
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
    const lifecycle = Core.lifecycleRows(model, { currentBatch: currentBatchNumber() });
    const segmentCounts = lifecycle.reduce((counts, row) => ({ ...counts, [row.segment]: (counts[row.segment] || 0) + 1 }), {});
    $('#lifecycleSummary').innerHTML = ['Current customer','Reorder due','Win-back','Do not email']
      .map(segment => `<span class="summary-pill">${escape(segment)}: ${segmentCounts[segment] || 0}</span>`).join('');
    $('#googleReviewUrl').value = state.growthSettings?.googleReviewUrl || '';
    $('#lifecycleRows').innerHTML = lifecycle.length ? lifecycle.map((row) => {
      const record = lifecycleRecord(row.email);
      const options = ['Not contacted','Draft ready','Contacted','Follow up','Converted','Do not contact']
        .map(status => `<option${record.status === status ? ' selected' : ''}>${status}</option>`).join('');
      const segmentClass = row.segment.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '');
      const draftButton = row.draftType
        ? `<button class="btn" data-lifecycle-draft="${escape(row.email)}">Prepare draft</button>`
        : '<span class="helper">Suppressed</span>';
      return `<tr data-lifecycle="${escape(row.email)}"><td><strong>${escape(row.customer)}</strong><span class="customer-email">${escape(row.email)}</span></td><td>Batch ${row.latestBatch || '-'}<span class="customer-email">${escape(row.latestSubmittedAt || '')}</span></td><td>${row.orderCount} order${row.orderCount === 1 ? '' : 's'}<span class="customer-email">Batches ${escape(row.batches.join(', ') || '-')}</span></td><td><span class="segment ${segmentClass}">${escape(row.segment)}</span></td><td>${escape(row.emailStatus)}</td><td>${escape(row.recommendedAction)}</td><td><select data-lifecycle-status>${options}</select><input data-lifecycle-date type="date" value="${escape(record.lastContact)}" aria-label="Last contact date"></td><td><textarea data-lifecycle-notes placeholder="Response, preference, and next step">${escape(record.notes)}</textarea></td><td>${draftButton}</td></tr>`;
    }).join('') : emptyRow(9, 'No customer email history is available yet.');
  }

  function deliveredCities() {
    return [...new Set(model.orders.map(order => String(order.City || '').trim()).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b));
  }

  function googleProfileKitText() {
    const cities = deliveredCities();
    const serviceAreas = cities.length ? cities.join(', ') : 'Prosper, Frisco, Plano, and only cities PRPD actually serves';
    return [
      'Business name: PRPD',
      'Business type: Service-area business (hide the operating address)',
      'Primary category: Meal delivery service; use Food delivery service only if Google does not offer it',
      'Phone: (469) 545-0781',
      'Website: https://getprpd.com/',
      'Order link: https://getprpd.com/order?utm_source=google&utm_medium=organic&utm_campaign=business_profile&utm_content=order_link',
      `Service areas to review: ${serviceAreas}`,
      'Description: PRPD prepares halal, high-protein meals for weekly delivery across our DFW service area. Customers choose Lean or Bulk portions from a rotating menu of breakfasts, mains, desserts, and grab-and-go options. Meals are prepared in small weekly batches with clear nutrition information and direct local service.',
      'Hours: Enter only the hours PRPD is staffed to answer customers. Do not list 24 hours.',
    ].join('\n');
  }

  function renderGoogleBusiness() {
    $('#googleProfileKit').innerHTML = googleProfileKitText().split('\n').map((line) => {
      const [label, ...value] = line.split(': ');
      return `<div><strong>${escape(label)}</strong><span>${escape(value.join(': '))}</span></div>`;
    }).join('');
    const record = state.googleBusiness || {};
    $('#googleBusinessStatus').value = record.status || 'Not started';
    $('#googleBusinessProfileUrl').value = record.profileUrl || '';
    $('#googleBusinessVerification').value = record.verificationMethod || '';
    $('#googleBusinessNotes').value = record.notes || '';
  }

  function referralTrackedUrl(code, programType) {
    const query = new URLSearchParams({
      ref:code,
      utm_source:'referral',
      utm_medium:programType === 'Partner' ? 'partner' : 'customer',
      utm_campaign:'referral_program',
      utm_content:code,
    });
    return `https://getprpd.com/order?${query}`;
  }

  function renderReferralProgram() {
    const rows = Core.referralProgramRows(model, referralRegistry);
    $('#referralProgramRows').innerHTML = rows.length ? rows.map((row) => {
      const link = referralTrackedUrl(row.code, row.programType);
      const statuses = ['Active', 'Inactive'].map(status => `<option${row.status === status ? ' selected' : ''}>${status}</option>`).join('');
      return `<tr data-referral-code="${escape(row.code)}">
        <td><strong>${escape(row.ownerName)}</strong><span class="customer-email">${escape(row.ownerEmail || row.ownerPhone || '')}</span></td>
        <td><strong>${escape(row.code)}</strong><span class="customer-email referral-link">${escape(link)}</span></td>
        <td>${escape(row.programType)}</td><td><select data-referral-status>${statuses}</select></td>
        <td class="number">${row.redemptions}</td><td class="number">${row.paidReferrals}</td><td class="number">${money(row.referredRevenue)}</td>
        <td class="number">${money(row.earnedCredit)}</td><td><input data-referral-credit-used type="number" min="0" step="0.01" value="${row.creditUsed}" aria-label="Credit used"></td>
        <td class="number">${money(row.availableCredit)}</td><td><div class="referral-actions"><button class="btn" type="button" data-copy-referral="${escape(row.code)}">Copy link</button><button class="btn" type="button" data-save-referral="${escape(row.code)}">Save</button></div></td>
      </tr>`;
    }).join('') : emptyRow(11, 'No referral codes yet. Create the first code above.');
    $('#referralSyncState').textContent = `${rows.length} code${rows.length === 1 ? '' : 's'} synced`;
  }

  function renderFinance() {
    const scoped = currentModel();
    const summary = Core.financials(scoped);
    $('#financeMetrics').innerHTML = [
      metric('Booked sales', money(summary.booked)), metric('Cash collected', money(summary.collected)),
      metric('Outstanding', money(summary.outstanding), summary.outstanding > 0),
      metric('Food consumed + packed cost', money(summary.directCost)),
      metric('Operating expenses', money(summary.operatingExpenses)),
      metric('Inventory bought', money(summary.inventoryPurchases)),
      metric('Operating contribution', money(summary.contribution), summary.contribution < 0),
      metric('Net cash movement', money(summary.cashMovement), summary.cashMovement < 0),
    ].join('');
    const warning = $('#costWarning');
    if (summary.unknownCostItems.length) {
      warning.className = 'notice warn';
      warning.innerHTML = `<strong>Incomplete cost match:</strong> ${escape(summary.unknownCostItems.join(', '))}. Contribution is understated until these recipes are mapped.`;
    } else if (summary.provisionalCostItems.length) {
      warning.className = 'notice warn';
      warning.innerHTML = `<strong>Provisional recipe cost:</strong> ${escape(summary.provisionalCostItems.join(', '))}. Its chocolate-coating cost still needs one measured production run. All other active-menu recipes are mapped.`;
    } else {
      warning.className = 'notice';
      warning.innerHTML = '<strong>How to read this:</strong> operating contribution uses food actually consumed, packaging, and operating expenses. Net cash movement uses purchases paid during the period. Neither number is tax-accounting net profit.';
    }
    const batches = Core.batchRows(model);
    $('#batchRows').innerHTML = batches.length ? batches.map(row => `<tr><td>Batch ${row.batch}</td><td class="number">${row.orderCount}</td><td class="number">${money(row.booked)}</td><td class="number">${money(row.collected)}</td><td class="number">${money(row.outstanding)}</td><td class="number">${money(row.directCost)}</td><td class="number">${money(row.operatingExpenses)}</td><td class="number">${money(row.contribution)}</td><td class="number">${money(row.cashMovement)}</td></tr>`).join('') : emptyRow(9, 'No batches found.');
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
    return state.outreach[id] || { status:'Not contacted', owner:'Rida', notes:'', lastContact:'', nextAction:'', code:'', offer:'', tasting:'Not offered' };
  }

  function renderOutreachLegacy() {
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

  function renderOutreach() {
    const counts = {};
    targets.forEach(target => { const status = outreachRecord(target.id).status; counts[status] = (counts[status] || 0) + 1; });
    $('#outreachSummary').innerHTML = ['Not contacted','Draft ready','Contacted','Follow up','Meeting','Partner'].map(status => `<span class="summary-pill">${escape(status)}: ${counts[status] || 0}</span>`).join('');
    $('#outreachRows').innerHTML = targets.map((target) => {
      const record = outreachRecord(target.id);
      const options = ['Not contacted','Draft ready','Contacted','Follow up','Meeting','Partner','Passed'].map(status => `<option${record.status === status ? ' selected' : ''}>${status}</option>`).join('');
      const tastings = ['Not offered','Offered','Scheduled','Completed','Declined'].map(status => `<option${record.tasting === status ? ' selected' : ''}>${status}</option>`).join('');
      const contact = [target.contact, target.email && `<a href="mailto:${escape(target.email)}">${escape(target.email)}</a>`, target.phone && `<a href="tel:${escape(target.phone)}">${escape(target.phone)}</a>`, `<a href="${escape(target.url)}" target="_blank" rel="noreferrer">Official page</a>`].filter(Boolean).join('');
      return `<tr data-outreach="${target.id}"><td class="number">${target.priority}</td><td><div class="target-name">${escape(target.name)}</div><div class="target-meta">${escape(target.type)} | ${escape(target.city)}</div></td><td class="angle">${escape(target.angle)}</td><td><div class="contact-links">${contact}</div></td><td><input data-outreach-offer value="${escape(record.offer)}" placeholder="Tasting + member offer"><input data-outreach-code value="${escape(record.code)}" maxlength="32" placeholder="Referral code"><button class="text-btn" type="button" data-create-partner-code="${target.id}">Create or edit code</button></td><td><select data-outreach-tasting>${tastings}</select></td><td><select data-outreach-status>${options}</select><input data-outreach-date type="date" value="${escape(record.lastContact)}" aria-label="Last contact date"></td><td><input data-outreach-next type="date" value="${escape(record.nextAction)}" aria-label="Next action date"></td><td><textarea data-outreach-notes placeholder="Contact, response, and next step">${escape(record.notes)}</textarea></td><td><button class="btn" data-draft="${target.id}">Draft email</button></td></tr>`;
    }).join('');
  }

  function renderAdImports() {
    const rows = state.adImports.slice().reverse();
    $('#adImportRows').innerHTML = rows.length ? rows.map(row => `<tr><td>${escape((row.importedAt || '').slice(0,10))}</td><td>${escape(row.batch || 'Unassigned')}</td><td>${escape(row.fileName)}</td><td>${escape(row.dateFrom || '-')} to ${escape(row.dateTo || '-')}</td><td class="number">${money(row.spend)}</td><td class="number">${integer(row.impressions)}</td><td class="number">${integer(row.clicks)}</td><td class="number">${integer(row.conversions)}</td><td><button class="text-btn" data-delete-import="${escape(row.id)}">Remove</button></td></tr>`).join('') : emptyRow(9, 'No TikTok report imported yet.');
  }

  function marketingCampaign() {
    return state.marketing?.currentCampaign || null;
  }

  function renderMarketing() {
    const menu = Core.menuItems(window.PRPD_ORDER_CONFIG || {});
    const featuredSelect = $('#marketingFeaturedMeal');
    const selected = featuredSelect.value || marketingCampaign()?.featuredMealId || menu.find(item => item.section === 'Main')?.id || menu[0]?.id || '';
    featuredSelect.innerHTML = menu.map(item => `<option value="${escape(item.id)}">${escape(item.section)} | ${escape(item.name)}</option>`).join('');
    if ([...featuredSelect.options].some(option => option.value === selected)) featuredSelect.value = selected;

    const campaign = marketingCampaign();
    const summary = Core.marketingSummary(campaign);
    $('#marketingCampaignMeta').textContent = campaign
      ? `Batch ${campaign.batchNumber} | ${campaign.featuredMeal} | Delivery ${campaign.deliveryDate || 'not set'}`
      : 'No weekly campaign generated.';
    $('#marketingMetrics').innerHTML = [
      metric('Approved and ready', summary.ready), metric('Posted assets', summary.posted),
      metric('Views', integer(summary.views)), metric('Tracked clicks', integer(summary.clicks)),
      metric('Paid orders', integer(summary.paidOrders)), metric('Recorded revenue', money(summary.revenue)),
    ].join('');
    const recommendations = Core.marketingRecommendations(campaign);
    $('#marketingRecommendations').innerHTML = recommendations.map((recommendation, index) => `<article><strong>${index + 1}. Next move</strong><p>${escape(recommendation)}</p></article>`).join('');

    if (!campaign) {
      $('#marketingAssets').innerHTML = '<section class="panel marketing-empty"><strong>Start with one campaign pack.</strong><p>Select the meal that should lead this week, then generate the pack. You can edit every draft before it is approved.</p></section>';
    } else {
      $('#marketingAssets').innerHTML = campaign.assets.map((asset) => {
        const statuses = ['Idea','Needs footage','Edited','Approved','Posted'].map(status => `<option${status === asset.status ? ' selected' : ''}>${status}</option>`).join('');
        const shots = asset.shotList.length ? `<ol>${asset.shotList.map(item => `<li>${escape(item)}</li>`).join('')}</ol>` : '<p class="helper">No footage required.</p>';
        return `<article class="marketing-asset" data-marketing-asset="${escape(asset.id)}">
          <div class="asset-heading"><div><p class="eyebrow">${escape(asset.platform)} | ${escape(asset.format)}</p><h3>${escape(asset.title)}</h3><span>${escape(asset.publishWindow)}</span></div><label>Status<select data-asset-status>${statuses}</select></label></div>
          <div class="asset-copy"><strong>Hook</strong><textarea data-asset-hook rows="2">${escape(asset.hook)}</textarea><strong>Draft</strong><textarea data-asset-caption rows="9">${escape(asset.caption)}</textarea></div>
          <div class="shot-list"><strong>Shot list</strong>${shots}</div>
          <div class="tracked-link"><label>Tracked order link<input data-asset-tracked value="${escape(asset.trackedUrl)}" readonly></label><button class="btn" data-copy-link="${escape(asset.id)}" type="button">Copy link</button><button class="btn" data-copy-copy="${escape(asset.id)}" type="button">Copy draft</button></div>
          <div class="asset-results">
            <label>Post URL<input data-asset-post-url type="url" value="${escape(asset.postUrl)}" placeholder="https://..."></label>
            <label>Views<input data-asset-metric="views" type="number" min="0" value="${asset.metrics.views}"></label>
            <label>Clicks<input data-asset-metric="clicks" type="number" min="0" value="${asset.metrics.clicks}"></label>
            <label>Leads<input data-asset-metric="leads" type="number" min="0" value="${asset.metrics.leads}"></label>
            <label>Paid orders<input data-asset-metric="paidOrders" type="number" min="0" value="${asset.metrics.paidOrders}"></label>
            <label>Revenue<input data-asset-metric="revenue" type="number" min="0" step="0.01" value="${asset.metrics.revenue}"></label>
            <label>Spend<input data-asset-metric="spend" type="number" min="0" step="0.01" value="${asset.metrics.spend}"></label>
          </div>
          <label>Notes<textarea data-asset-notes rows="2" placeholder="What worked, what did not, and what to test next">${escape(asset.notes)}</textarea></label>
        </article>`;
      }).join('');
    }

    const history = state.marketing?.history || [];
    $('#marketingHistoryRows').innerHTML = history.length ? history.map((oldCampaign) => {
      const old = Core.marketingSummary(oldCampaign);
      return `<tr><td>Batch ${oldCampaign.batchNumber}</td><td>${escape(oldCampaign.featuredMeal)}</td><td class="number">${old.posted}</td><td class="number">${integer(old.clicks)}</td><td class="number">${integer(old.leads)}</td><td class="number">${integer(old.paidOrders)}</td><td class="number">${money(old.revenue)}</td><td class="number">${money(old.spend)}</td></tr>`;
    }).join('') : emptyRow(8, 'No archived campaigns yet.');
  }

  function findMarketingAsset(id) {
    return marketingCampaign()?.assets.find(asset => asset.id === id);
  }

  function updateMarketingAsset(row) {
    const asset = findMarketingAsset(row.dataset.marketingAsset);
    if (!asset) return;
    asset.status = row.querySelector('[data-asset-status]').value;
    asset.hook = row.querySelector('[data-asset-hook]').value;
    asset.caption = row.querySelector('[data-asset-caption]').value;
    asset.postUrl = row.querySelector('[data-asset-post-url]').value.trim();
    asset.notes = row.querySelector('[data-asset-notes]').value;
    row.querySelectorAll('[data-asset-metric]').forEach((input) => { asset.metrics[input.dataset.assetMetric] = Number(input.value) || 0; });
  }

  function marketingAnalysisBrief() {
    const campaign = marketingCampaign();
    if (!campaign) return 'Generate a campaign pack first.';
    const summary = Core.marketingSummary(campaign);
    const assets = campaign.assets.map(asset => `${asset.title} | ${asset.platform} | ${asset.status} | views ${asset.metrics.views} | clicks ${asset.metrics.clicks} | leads ${asset.metrics.leads} | paid orders ${asset.metrics.paidOrders} | revenue $${asset.metrics.revenue} | spend $${asset.metrics.spend} | notes: ${asset.notes || 'none'}`).join('\n');
    return `Analyze this PRPD weekly marketing campaign as a small halal high-protein meal-prep business serving DFW. Use only the evidence below. Identify the strongest asset, the weakest measurable point in the funnel, one thing to repeat, and one controlled test for next week. Do not invent missing metrics.\n\nCampaign: ${campaign.name}\nFeatured meal: ${campaign.featuredMeal}\nDelivery: ${campaign.deliveryDate}\nTotals: ${summary.views} views, ${summary.clicks} clicks, ${summary.leads} leads, ${summary.paidOrders} paid orders, $${summary.revenue} revenue, $${summary.spend} spend\n\nAssets:\n${assets}`;
  }

  function renderBrief() {
    const config = window.PRPD_ORDER_CONFIG?.batch || {};
    const brief = Core.operatorBrief(model, {
      now: new Date(),
      batchNumber: config.number,
      deliveryDate: config.deliveryDate,
      cutoffIso: config.cutoffIso,
      cutoffLabel: config.cutoffLabel,
    });
    $('#briefMetrics').innerHTML = [
      metric(`Batch ${brief.batchNumber} orders`, brief.counts.orders),
      metric('Meals recorded', brief.counts.meals),
      metric('New leads (24h)', brief.counts.recentLeads),
      metric('Missing-detail orders', brief.counts.incompleteOrders, brief.counts.incompleteOrders > 0),
      metric('Current outstanding', money(brief.money.currentOutstanding), brief.money.currentOutstanding > 0),
      metric('Consolidated outstanding', money(brief.money.consolidatedOutstanding), brief.money.consolidatedOutstanding > 0),
    ].join('');
    $('#briefActions').innerHTML = brief.actions.map((action, index) => (
      `<article><strong>${index + 1}. ${escape(action.title)}</strong><p>${escape(action.detail)}</p></article>`
    )).join('');
    $('#briefMissingRows').innerHTML = brief.incompleteOrders.length
      ? brief.incompleteOrders.map(order => `<tr><td>${escape(order.customer)}</td><td>${escape(order.missing.join(', '))}</td><td>${escape(order.orderId || '-')}</td></tr>`).join('')
      : emptyRow(3, 'No missing order details in the current batch.');
    $('#briefLeadRows').innerHTML = brief.leadFollowUps.length
      ? brief.leadFollowUps.slice(0, 12).map(lead => `<tr><td>${escape(lead.name)}</td><td>${escape(lead.city || '-')}</td><td>${escape(lead.goal || '-')}</td><td class="number">${Math.round(lead.waitHours)}h</td></tr>`).join('')
      : emptyRow(4, 'No recent unmatched leads.');
    $('#briefMonitoring').innerHTML = `<strong>Connection scope:</strong> Sheets are connected. Resend records this brief's send result. TikTok conversion events are connected; read-only ad reporting authorization remains pending. Central website-error logging is the next monitoring layer.`;
  }

  function renderAll() { renderBrief(); renderGrowth(); renderGoogleBusiness(); renderReferralProgram(); renderMarketing(); renderFinance(); renderOutreach(); renderAdImports(); }

  async function saveState(message = 'Saved locally') {
    const response = await fetch('/api/business-state', { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify(state) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'State could not be saved.');
    state = result.state;
    $('#syncDetail').textContent = message;
  }

  async function saveReferral(values, message = 'Referral code saved') {
    values.firstOrderOnly = values.firstOrderOnly !== 'No' && values.firstOrderOnly !== false;
    const response = await fetch('/api/referrals', { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify(values) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'Referral code could not be saved.');
    referralRegistry = [...referralRegistry.filter(row => row.code !== result.record.code), result.record];
    $('#syncDetail').textContent = message;
    renderGrowth();
    renderReferralProgram();
    return result.record;
  }

  async function sync() {
    $('#syncBtn').disabled = true;
    $('#syncState').textContent = 'Syncing live data...';
    try {
      const [dataResponse, stateResponse, referralResponse] = await Promise.all([fetch('/api/business-data'), fetch('/api/business-state'), fetch('/api/referrals')]);
      const data = await dataResponse.json();
      const saved = await stateResponse.json();
      const referrals = await referralResponse.json().catch(() => ({}));
      if (!stateResponse.ok) throw new Error(saved.error || 'Local state could not be loaded.');
      state = { ...state, ...(saved.state || {}), lifecycle:saved.state?.lifecycle || {}, growthSettings:saved.state?.growthSettings || { googleReviewUrl:'' }, googleBusiness:saved.state?.googleBusiness || { status:'Not started', profileUrl:'', verificationMethod:'', notes:'', updatedAt:'' }, marketing:saved.state?.marketing || { currentCampaign:null, history:[] } };
      referralRegistry = referralResponse.ok && Array.isArray(referrals.codes) ? referrals.codes : [];
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
      $('#referralSyncState').textContent = referralResponse.ok
        ? `${referralRegistry.length} code${referralRegistry.length === 1 ? '' : 's'} synced`
        : 'Referral ledger needs attention';
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

  function draftForLegacy(target) {
    const greeting = target.contact && !/team|board|office|front desk|officers/i.test(target.contact) ? `Hi ${target.contact},` : `Hi ${target.name} team,`;
    return {
      subject: `Local PRPD meal prep partnership for ${target.name}`,
      body: `${greeting}\n\nI'm Rida, the owner and operator of PRPD, a halal high-protein meal prep service serving DFW. I prepare and deliver our meals fresh each week for clients who want their food to fit their training and nutrition goals.\n\nI think PRPD could be a useful fit for your community. ${target.angle}\n\nI'd be happy to bring a small tasting so you can try the food first. If it is a fit, I can also create a unique tracked code for your members so there is no guesswork about whether the partnership is useful. There is no commitment required.\n\nWould you be open to a short conversation or tasting next week?\n\nThank you,\nRida\nPRPD · Meals. Prepped.\ngetprpd.com`,
    };
  }

  function draftFor(target) {
    const record = outreachRecord(target.id);
    const greeting = target.contact && !/team|board|office|front desk|officers/i.test(target.contact) ? `Hi ${target.contact},` : `Hi ${target.name} team,`;
    const offer = record.offer || 'a small tasting and a tracked member referral offer';
    const codeDetails = record.code
      ? `\n\nYour tracked code would be ${record.code}. Members can use this link: ${referralTrackedUrl(record.code, 'Partner')}`
      : '';
    return {
      subject: `Local PRPD meal prep partnership for ${target.name}`,
      body: `${greeting}\n\nI'm Rida, the owner and operator of PRPD, a halal high-protein meal prep service serving DFW. I prepare and deliver our meals fresh each week for clients who want their food to fit their training and nutrition goals.\n\nI think PRPD could be a useful fit for your community. ${target.angle}\n\nI would like to offer ${offer}. There is no commitment required.${codeDetails}\n\nWould you be open to a short conversation or tasting next week?\n\nThank you,\nRida\nPRPD | Meals. Prepped.\ngetprpd.com`,
    };
  }

  function lifecycleDraftFor(row) {
    const firstName = row.firstName || row.customer.split(' ')[0] || 'there';
    const menuUrl = 'https://getprpd.com/order';
    const reviewUrl = state.growthSettings?.googleReviewUrl || '';
    if (row.draftType === 'feedback') {
      const publicReview = reviewUrl
        ? `\n\nIf you would rather leave a public review, here is the direct link: ${reviewUrl}`
        : '';
      return {
        subject: 'How were your PRPD meals?',
        body: `Hi ${firstName},\n\nThank you for ordering PRPD Batch ${row.latestBatch}. Once you have had a chance to try everything, I would appreciate your honest feedback. What should we keep, and what could be better? You can reply directly to this email.${publicReview}\n\nThank you,\nRida\nPRPD | Meals. Prepped.`,
      };
    }
    if (row.draftType === 'reorder') {
      return {
        subject: "This week's PRPD menu is open",
        body: `Hi ${firstName},\n\nI wanted to make sure you saw that this week's PRPD menu is open. You can view the meals and place an order here:\n\n${menuUrl}\n\nNo pressure if you are covered this week. If there is anything you want to see on a future menu, reply and let me know.\n\nThank you,\nRida\nPRPD | Meals. Prepped.\n\nTo stop receiving menu emails, reply unsubscribe or update your email preferences on the PRPD website.`,
      };
    }
    return {
      subject: 'A new PRPD menu is available',
      body: `Hi ${firstName},\n\nIt has been a little while since your last PRPD order, so I wanted to send one quick update. This week's menu is available here:\n\n${menuUrl}\n\nIf you are taking a break, no problem. I would also appreciate any honest feedback about what would make PRPD more useful for you.\n\nThank you,\nRida\nPRPD | Meals. Prepped.\n\nTo stop receiving menu emails, reply unsubscribe or update your email preferences on the PRPD website.`,
    };
  }

  function showDraft(title, email, draft) {
    $('#draftTitle').textContent = title;
    $('#draftSubject').value = draft.subject;
    $('#draftBody').value = draft.body;
    $('#copyDraftBtn').textContent = 'Copy draft';
    $('#openEmailBtn').href = `mailto:${email || ''}?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}`;
    $('#draftDialog').showModal();
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
      showDraft(target.name, target.email, draftFor(target));
    }
    const lifecycleDraftButton = event.target.closest('[data-lifecycle-draft]');
    if (lifecycleDraftButton) {
      const email = lifecycleDraftButton.dataset.lifecycleDraft;
      const row = Core.lifecycleRows(model, { currentBatch: currentBatchNumber() }).find(item => item.email === email);
      if (row) {
        showDraft(row.customer, row.email, lifecycleDraftFor(row));
        state.lifecycle[row.email] = { ...lifecycleRecord(row.email), status:'Draft ready' };
        await saveState('Customer follow-up draft prepared');
        renderGrowth();
      }
    }
    const partnerCodeButton = event.target.closest('[data-create-partner-code]');
    if (partnerCodeButton) {
      const target = targets.find(item => item.id === partnerCodeButton.dataset.createPartnerCode);
      const record = outreachRecord(target.id);
      const form = $('#referralForm');
      form.elements.ownerName.value = target.name;
      form.elements.code.value = record.code || '';
      form.elements.programType.value = 'Partner';
      form.elements.ownerEmail.value = target.email || '';
      form.elements.ownerPhone.value = target.phone || '';
      form.elements.notes.value = record.offer || `Local partnership with ${target.name}`;
      document.querySelector('[data-tab="growth"]').click();
      form.elements.ownerName.focus();
      form.scrollIntoView({ behavior:'smooth', block:'center' });
    }
    const copyReferralButton = event.target.closest('[data-copy-referral]');
    if (copyReferralButton) {
      const record = referralRegistry.find(row => row.code === copyReferralButton.dataset.copyReferral);
      await navigator.clipboard.writeText(referralTrackedUrl(record.code, record.programType));
      copyReferralButton.textContent = 'Copied';
    }
    const saveReferralButton = event.target.closest('[data-save-referral]');
    if (saveReferralButton) {
      const row = saveReferralButton.closest('[data-referral-code]');
      const record = referralRegistry.find(item => item.code === row.dataset.referralCode);
      try {
        await saveReferral({ ...record, status:row.querySelector('[data-referral-status]').value, creditUsed:Number(row.querySelector('[data-referral-credit-used]').value) || 0 }, 'Referral ledger updated');
      } catch (error) { alert(error.message); }
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
  $('#growthSettingsForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    state.growthSettings = { googleReviewUrl:$('#googleReviewUrl').value.trim() };
    try { await saveState('Google review link saved'); renderGrowth(); }
    catch (error) { alert(error.message); }
  });
  $('#googleBusinessForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    state.googleBusiness = { ...values, updatedAt:new Date().toISOString() };
    try { await saveState('Google Business Profile status saved'); renderGoogleBusiness(); }
    catch (error) { alert(error.message); }
  });
  $('#copyGoogleProfileKitBtn').addEventListener('click', async () => {
    await navigator.clipboard.writeText(googleProfileKitText());
    $('#copyGoogleProfileKitBtn').textContent = 'Copied';
    setTimeout(() => { $('#copyGoogleProfileKitBtn').textContent = 'Copy setup kit'; }, 1500);
  });
  $('#referralForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = event.currentTarget.querySelector('button[type="submit"]');
    const values = Object.fromEntries(new FormData(event.currentTarget));
    button.disabled = true;
    try {
      const record = await saveReferral(values, 'Referral code created');
      event.currentTarget.reset();
      event.currentTarget.elements.customerDiscount.value = 10;
      event.currentTarget.elements.referrerCredit.value = 10;
      event.currentTarget.elements.minimumOrder.value = 60;
      event.currentTarget.elements.maxRedemptions.value = 4;
      event.currentTarget.elements.maxPaidReferrals.value = 4;
      event.currentTarget.elements.status.value = 'Inactive';
      await navigator.clipboard.writeText(referralTrackedUrl(record.code, record.programType));
      button.textContent = `${record.code} created and link copied`;
    } catch (error) { alert(error.message); }
    finally {
      button.disabled = false;
      setTimeout(() => { button.textContent = 'Save controlled code'; }, 2000);
    }
  });
  $('#generateCampaignBtn').addEventListener('click', async () => {
    const existing = marketingCampaign();
    const batchNumber = Number(window.PRPD_ORDER_CONFIG?.batch?.number) || 0;
    if (existing && existing.batchNumber === batchNumber && !window.confirm('Replace the current Batch campaign pack? Its edits and recorded results will be archived.')) return;
    state.marketing ||= { currentCampaign:null, history:[] };
    if (existing) state.marketing.history = [existing, ...(state.marketing.history || []).filter(campaign => campaign.id !== existing.id)].slice(0, 12);
    state.marketing.currentCampaign = Core.generateMarketingCampaign(window.PRPD_ORDER_CONFIG, { featuredMealId:$('#marketingFeaturedMeal').value });
    await saveState('Weekly marketing pack generated');
    renderMarketing();
  });
  $('#copyMarketingBriefBtn').addEventListener('click', async () => {
    await navigator.clipboard.writeText(marketingAnalysisBrief());
    $('#copyMarketingBriefBtn').textContent = 'Copied';
    setTimeout(() => { $('#copyMarketingBriefBtn').textContent = 'Copy AI analysis brief'; }, 1500);
  });
  $('#marketingAssets').addEventListener('click', async (event) => {
    const linkButton = event.target.closest('[data-copy-link]');
    const copyButton = event.target.closest('[data-copy-copy]');
    if (linkButton) {
      await navigator.clipboard.writeText(findMarketingAsset(linkButton.dataset.copyLink)?.trackedUrl || '');
      linkButton.textContent = 'Copied';
    }
    if (copyButton) {
      const asset = findMarketingAsset(copyButton.dataset.copyCopy);
      await navigator.clipboard.writeText(`${asset.hook}\n\n${asset.caption}`);
      copyButton.textContent = 'Copied';
    }
  });
  $('#marketingAssets').addEventListener('change', async (event) => {
    const row = event.target.closest('[data-marketing-asset]');
    if (!row) return;
    updateMarketingAsset(row);
    await saveState('Marketing workflow saved');
    renderMarketing();
  });
  $('#marketingAssets').addEventListener('focusout', async (event) => {
    if (!event.target.matches('textarea,input')) return;
    const row = event.target.closest('[data-marketing-asset]');
    if (!row) return;
    updateMarketingAsset(row);
    await saveState('Marketing draft saved');
  });
  $('#expenseForm').addEventListener('submit', async (event) => {
    event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget));
    state.expenses.push({ ...values, id:`expense-${Date.now()}`, amount:Number(values.amount) });
    await saveState('Expense saved locally'); model = Core.summarize(payload, state); event.currentTarget.reset(); renderAll();
  });
  $('#outreachRows').addEventListener('change', async (event) => {
    const row = event.target.closest('[data-outreach]'); if (!row) return;
    const id = row.dataset.outreach; state.outreach[id] = {
      ...outreachRecord(id),
      status:row.querySelector('[data-outreach-status]').value,
      lastContact:row.querySelector('[data-outreach-date]').value,
      nextAction:row.querySelector('[data-outreach-next]').value,
      tasting:row.querySelector('[data-outreach-tasting]').value,
      code:row.querySelector('[data-outreach-code]').value,
      offer:row.querySelector('[data-outreach-offer]').value,
      notes:row.querySelector('[data-outreach-notes]').value,
    };
    await saveState('Outreach status saved'); renderOutreach();
  });
  $('#outreachRows').addEventListener('focusout', async (event) => {
    if (!event.target.matches('[data-outreach-notes],[data-outreach-code],[data-outreach-offer]')) return;
    const row = event.target.closest('[data-outreach]'); const id = row.dataset.outreach;
    state.outreach[id] = { ...outreachRecord(id), notes:row.querySelector('[data-outreach-notes]').value, code:row.querySelector('[data-outreach-code]').value, offer:row.querySelector('[data-outreach-offer]').value };
    await saveState('Outreach notes saved');
  });
  $('#lifecycleRows').addEventListener('change', async (event) => {
    const row = event.target.closest('[data-lifecycle]'); if (!row) return;
    const email = row.dataset.lifecycle;
    state.lifecycle[email] = { ...lifecycleRecord(email), status:row.querySelector('[data-lifecycle-status]').value, lastContact:row.querySelector('[data-lifecycle-date]').value, notes:row.querySelector('[data-lifecycle-notes]').value };
    await saveState('Customer lifecycle status saved'); renderGrowth();
  });
  $('#lifecycleRows').addEventListener('focusout', async (event) => {
    if (!event.target.matches('[data-lifecycle-notes]')) return;
    const row = event.target.closest('[data-lifecycle]'); const email = row.dataset.lifecycle;
    state.lifecycle[email] = { ...lifecycleRecord(email), notes:event.target.value };
    await saveState('Customer lifecycle notes saved');
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
