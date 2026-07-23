(function businessCenterCore(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PRPDBusinessCore = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function factory() {
  const ORDER_HEADERS = [
    'Submitted At', 'Batch', 'Delivery Date', 'First Name', 'Last Name', 'Phone', 'Items', 'Exact Total',
    'Total (Rounded)', 'Notes', 'Order ID', 'Email', 'Address', 'City', 'ZIP', 'Delivery Notes', 'Meal Subtotal',
    'Delivery Fee', 'Discount Code', 'Discount Amount', 'Referral Partner', 'Menu Email Opt-In', 'UTM Source',
    'UTM Medium', 'UTM Campaign', 'UTM Content', 'UTM Term', 'Landing Page', 'Referrer',
  ];
  const PAYMENT_HEADERS = [
    'Batch', 'Delivery Date', 'Paid Date', 'Client', 'Tier', 'Standard Meals', 'Beef/Seafood #', 'Dessert #',
    'Total Due', 'Amount Paid', 'Balance', 'Method', 'Notes', 'Order ID', 'Discount Code', 'Referral Partner',
  ];
  const LEAD_HEADERS = [
    'Submitted At', 'Source', 'Full Name', 'Phone', 'Location', 'How They Heard', 'Mosque / Gym Detail',
    'Fitness Goal', 'Training Days', 'Halal Preference', 'Dietary Restrictions', 'Notes', 'UTM Source',
    'UTM Medium', 'UTM Campaign', 'UTM Content', 'UTM Term', 'Landing Page', 'Referrer', 'Lead ID',
  ];
  const RECEIVABLE_HEADERS = [
    'Client Account', 'Covered Batches', 'Amount Agreed', 'Amount Paid', 'Balance', 'Status', 'Last Updated', 'Notes',
  ];
  const DEFAULT_PROFILE_EXEMPT_CUSTOMERS = Object.freeze(['Talal Account', 'Duaa Hassan', 'Rida Khan']);

  const DIRECT_COSTS = Object.freeze({
    'high protein omelette|lean': 2.62, 'high protein omelette|bulk': 3.27,
    'beef breakfast skillet|lean': 3.69, 'beef breakfast skillet|bulk': 4.72,
    'power bowl|lean': 2.78, 'power bowl|bulk': 3.63,
    'blueberry cheesecake protein pancakes|lean': 3.11, 'blueberry cheesecake protein pancakes|bulk': 3.94,
    'strawberry cheesecake protein pancakes|lean': 3.11, 'strawberry cheesecake protein pancakes|bulk': 3.94,
    'cheeseburger hot pockets|lean': 2.21, 'cheeseburger hot pockets|bulk': 3.15,
    'mexican streetcorn chicken bowl|lean': 2.86, 'mexican streetcorn chicken bowl|bulk': 3.71,
    'hot honey chicken sliders|lean': 3.28, 'hot honey chicken sliders|bulk': 4.01,
    'chicken biryani|lean': 3.39, 'chicken biryani|bulk': 4.23,
    'bbq chicken mac & cheese|lean': 3.58, 'bbq chicken mac & cheese|bulk': 4.42,
    'korean bulgogi beef bowl|lean': 5.21, 'korean bulgogi beef bowl|bulk': 6.64,
    'garlic butter shrimp + rice|lean': 5.25, 'garlic butter shrimp + rice|bulk': 6.91,
    'premium ny strip steak|lean': 7.74, 'premium ny strip steak|bulk': 9.51,
    'cookie dough cup|single': 2.42, 'lotus biscoff cheesecake|single': 2.82,
    'banana cream pie cup|single': 2.14,
  });

  function clean(value) { return String(value ?? '').trim().replace(/^'/, ''); }
  function number(value) {
    const parsed = Number(clean(value).replace(/[$,%\s]/g, '').replace(/,/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  function phone(value) { return clean(value).replace(/\D/g, '').slice(-10); }
  function customerName(order) {
    return `${clean(order['First Name'])} ${clean(order['Last Name'])}`.trim() || 'Unknown';
  }
  function normalizedCustomerName(value) {
    return clean(value).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  }
  function isProfileExempt(customer, exemptions = DEFAULT_PROFILE_EXEMPT_CUSTOMERS) {
    const normalized = normalizedCustomerName(customer);
    return exemptions.some((entry) => {
      const exempt = normalizedCustomerName(entry);
      return exempt && (normalized === exempt || normalized.startsWith(`${exempt} `));
    });
  }
  function validEmail(value) {
    const email = clean(value);
    return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email);
  }
  function validStreetAddress(value) {
    const address = clean(value);
    return address.length >= 5 && /\d/.test(address) && /[a-z]{2}/i.test(address);
  }
  function validCity(value) {
    const city = clean(value);
    return city.length >= 2 && /[a-z]{2}/i.test(city) && !/^\d+$/.test(city);
  }
  function validZip(value) {
    return /^\d{5}(?:-\d{4})?$/.test(clean(value));
  }
  function batchNumber(value) {
    const match = clean(value).match(/batch\s*(\d+)/i);
    return match ? Number(match[1]) : 0;
  }
  function rowObject(headers, row) { return Object.fromEntries(headers.map((header, index) => [header, clean(row[index])])); }

  function normalizeOrders(values) {
    if (!Array.isArray(values)) return [];
    return values.slice(1).flatMap((raw) => {
      const row = Array.isArray(raw) ? raw : [];
      const batchIndex = row.findIndex(value => /^batch\s*\d+$/i.test(clean(value)));
      if (batchIndex < 1) return [];
      const normalized = row.slice(batchIndex - 1, batchIndex - 1 + ORDER_HEADERS.length);
      while (normalized.length < ORDER_HEADERS.length) normalized.push('');
      return [rowObject(ORDER_HEADERS, normalized)];
    }).filter(order => order['Order ID'] || order['First Name']);
  }

  function standardRows(values, headers) {
    if (!Array.isArray(values)) return [];
    return values.slice(1).filter(row => Array.isArray(row) && row.some(value => clean(value))).map(row => rowObject(headers, row));
  }

  function normalizeMealName(name) {
    return clean(name).toLowerCase().replace(/\s+/g, ' ').replace(/&amp;/g, '&');
  }

  function parseItemLines(items) {
    return clean(items).split(/\r?\n/).map(line => line.trim()).filter(Boolean).flatMap((line) => {
      if (/^delivery\b/i.test(line)) return [];
      const match = line.match(/^(\d+)x\s+(.+?)(?:\s+\((Lean|Bulk|Single)\))?\s*(?:[-\u2013\u2014]\s*\$?[\d,.]+)?$/i);
      if (!match) return [{ quantity: 0, name: line, tier: '', cost: 0, known: false }];
      const quantity = Number(match[1]);
      const name = match[2].trim();
      const tier = (match[3] || (/(cup|cheesecake|cream pie|mousse|tiramisu)/i.test(name) ? 'Single' : '')).trim();
      const unitCost = DIRECT_COSTS[`${normalizeMealName(name)}|${tier.toLowerCase()}`];
      return [{ quantity, name, tier, cost: unitCost ? quantity * unitCost : 0, known: Boolean(unitCost) }];
    });
  }

  function orderCost(order) {
    const lines = parseItemLines(order.Items);
    return {
      amount: Math.round(lines.reduce((sum, line) => sum + line.cost, 0) * 100) / 100,
      unknown: lines.filter(line => !line.known).map(line => line.name), lines,
    };
  }

  function sourceForOrder(order, leadByPhone) {
    if (order['UTM Source']) return order['UTM Source'];
    if (order['Referral Partner']) return `Partner: ${order['Referral Partner']}`;
    if (order['Discount Code']) return `Code: ${order['Discount Code']}`;
    const lead = leadByPhone.get(phone(order.Phone));
    return lead?.['UTM Source'] || lead?.['How They Heard'] || 'Direct / unknown';
  }

  function summarize(payload, state = {}) {
    const orders = normalizeOrders(payload.orders || []);
    const payments = standardRows(payload.payments || [], PAYMENT_HEADERS);
    const leads = standardRows(payload.leads || [], LEAD_HEADERS);
    const receivables = standardRows(payload.receivables || [], RECEIVABLE_HEADERS).map(row => ({
      ...row,
      agreed: number(row['Amount Agreed']),
      paid: number(row['Amount Paid']),
      balance: number(row.Balance),
    }));
    const leadByPhone = new Map(leads.map(lead => [phone(lead.Phone), lead]).filter(([key]) => key));
    const enrichedOrders = orders.map((order) => {
      const cost = orderCost(order);
      return {
        ...order, batchNumber: batchNumber(order.Batch), revenue: number(order['Total (Rounded)']) || number(order['Exact Total']),
        directCost: cost.amount, unknownCostItems: cost.unknown, source: sourceForOrder(order, leadByPhone),
      };
    });
    const enrichedPayments = payments.map(row => ({
      ...row, batchNumber: batchNumber(row.Batch), due: number(row['Total Due']), paid: number(row['Amount Paid']), balance: number(row.Balance),
    }));
    const expenses = Array.isArray(state.expenses) ? state.expenses : [];
    const adImports = Array.isArray(state.adImports) ? state.adImports : [];
    const batchIds = [...new Set([
      ...enrichedOrders.map(order => order.batchNumber),
      ...enrichedPayments.map(payment => payment.batchNumber),
      ...expenses.map(expense => batchNumber(expense.batch)),
    ].filter(Boolean))].sort((a, b) => b - a);
    return { orders: enrichedOrders, payments: enrichedPayments, leads, receivables, batchIds, expenses, adImports, fetchedAt: payload.fetchedAt || '' };
  }

  function filterBatch(model, batch) {
    const selected = Number(batch) || 0;
    return {
      ...model,
      orders: selected ? model.orders.filter(row => row.batchNumber === selected) : model.orders,
      payments: selected ? model.payments.filter(row => row.batchNumber === selected) : model.payments,
      expenses: selected ? model.expenses.filter(row => batchNumber(row.batch) === selected) : model.expenses,
    };
  }

  function financials(model) {
    const booked = model.orders.reduce((sum, order) => sum + order.revenue, 0);
    const collected = model.payments.reduce((sum, row) => sum + row.paid, 0);
    const sheetOutstanding = model.payments.reduce((sum, row) => sum + Math.max(0, row.balance), 0);
    const outstanding = sheetOutstanding || Math.max(0, booked - collected);
    const directCost = model.orders.reduce((sum, order) => sum + order.directCost, 0);
    const expenses = model.expenses.reduce((sum, row) => sum + number(row.amount), 0);
    const adSpend = model.adImports.reduce((sum, row) => sum + number(row.spend), 0);
    const contribution = booked - directCost - expenses - adSpend;
    return {
      booked, collected, outstanding, directCost, expenses, adSpend, contribution,
      orderCount: model.orders.length, aov: model.orders.length ? booked / model.orders.length : 0,
      directCostPct: booked ? directCost / booked : 0,
      unknownCostItems: [...new Set(model.orders.flatMap(order => order.unknownCostItems))],
    };
  }

  function sourceRows(model) {
    const rows = new Map();
    function get(name) {
      const key = clean(name) || 'Direct / unknown';
      if (!rows.has(key)) rows.set(key, { source: key, leads: 0, orders: 0, revenue: 0 });
      return rows.get(key);
    }
    model.leads.forEach(lead => { get(lead['UTM Source'] || lead['How They Heard'] || lead.Source).leads += 1; });
    model.orders.forEach(order => { const row = get(order.source); row.orders += 1; row.revenue += order.revenue; });
    return [...rows.values()].map(row => ({
      ...row, conversion: row.leads ? row.orders / row.leads : 0, aov: row.orders ? row.revenue / row.orders : 0,
    })).sort((a, b) => b.revenue - a.revenue || b.leads - a.leads);
  }

  function referralRows(model) {
    const rows = new Map();
    model.orders.forEach((order) => {
      const key = order['Referral Partner'] || order['Discount Code'];
      if (!key) return;
      if (!rows.has(key)) rows.set(key, { partner: order['Referral Partner'] || '-', code: order['Discount Code'] || '-', orders: 0, revenue: 0, discount: 0 });
      const row = rows.get(key); row.orders += 1; row.revenue += order.revenue; row.discount += number(order['Discount Amount']);
    });
    return [...rows.values()].sort((a, b) => b.revenue - a.revenue);
  }

  function batchRows(model) {
    return model.batchIds.map((id) => {
      const scoped = filterBatch(model, id);
      return { batch: id, ...financials(scoped) };
    });
  }

  function customerRows(model) {
    const rows = new Map();
    model.payments.forEach((payment) => {
      const key = payment.Client || 'Unknown';
      if (!rows.has(key)) rows.set(key, { customer: key, due: 0, paid: 0, balance: 0, orders: 0 });
      const row = rows.get(key); row.due += payment.due; row.paid += payment.paid; row.balance += Math.max(0, payment.balance); row.orders += 1;
    });
    return [...rows.values()].sort((a, b) => b.balance - a.balance || b.due - a.due);
  }

  function receivableRows(model) {
    return model.receivables.slice().sort((a, b) => b.balance - a.balance || b.agreed - a.agreed);
  }

  function parseDate(value) {
    const parsed = Date.parse(clean(value));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function ageHours(value, nowMs) {
    const timestamp = parseDate(value);
    return timestamp ? Math.max(0, (nowMs - timestamp) / 3600000) : 0;
  }

  function operatorBrief(model, options = {}) {
    const now = options.now instanceof Date ? options.now : new Date(options.now || Date.now());
    const nowMs = now.getTime();
    const latestBatch = Number(options.batchNumber) || model.batchIds[0] || 0;
    const scoped = filterBatch(model, latestBatch);
    const cutoffMs = parseDate(options.cutoffIso);
    const cutoffHours = cutoffMs ? (cutoffMs - nowMs) / 3600000 : 0;
    const orderPhones = new Set(model.orders.map(order => phone(order.Phone)).filter(Boolean));
    const recentWindowMs = 24 * 3600000;
    const followUpWindowMs = 14 * 24 * 3600000;
    const recentLeads = model.leads.filter(lead => {
      const timestamp = parseDate(lead['Submitted At']);
      return timestamp && nowMs - timestamp >= 0 && nowMs - timestamp <= recentWindowMs;
    });
    const leadFollowUps = model.leads.filter((lead) => {
      const timestamp = parseDate(lead['Submitted At']);
      const leadPhone = phone(lead.Phone);
      return timestamp && nowMs - timestamp >= 0 && nowMs - timestamp <= followUpWindowMs
        && (!leadPhone || !orderPhones.has(leadPhone));
    }).map(lead => ({
      name: lead['Full Name'] || 'Unknown lead',
      phone: lead.Phone,
      city: lead.Location,
      goal: lead['Fitness Goal'],
      submittedAt: lead['Submitted At'],
      waitHours: ageHours(lead['Submitted At'], nowMs),
    })).sort((a, b) => b.waitHours - a.waitHours);
    const recentOrders = scoped.orders.filter((order) => {
      const timestamp = parseDate(order['Submitted At']);
      return timestamp && nowMs - timestamp >= 0 && nowMs - timestamp <= recentWindowMs;
    });
    const profileExemptCustomers = Array.isArray(options.profileExemptCustomers)
      ? options.profileExemptCustomers
      : DEFAULT_PROFILE_EXEMPT_CUSTOMERS;
    const incompleteOrders = scoped.orders.map((order) => {
      const customer = customerName(order);
      if (isProfileExempt(customer, profileExemptCustomers)) return null;
      const missing = [
        ['phone number', phone(order.Phone).length === 10],
        ['valid email', validEmail(order.Email)],
        ['street address', validStreetAddress(order.Address)],
        ['city', validCity(order.City)],
        ['5-digit ZIP', validZip(order.ZIP)],
      ].filter(([, valid]) => !valid).map(([label]) => label);
      return { orderId: order['Order ID'], customer, missing };
    }).filter(order => order && order.missing.length);
    const unpaid = scoped.payments.filter(payment => payment.balance > 0).map(payment => ({
      customer: payment.Client || 'Unknown',
      due: payment.due,
      paid: payment.paid,
      balance: payment.balance,
      orderId: payment['Order ID'],
    })).sort((a, b) => b.balance - a.balance);
    const consolidated = model.receivables.filter(row => row.balance > 0).map(row => ({
      customer: row['Client Account'] || 'Unknown',
      batches: row['Covered Batches'],
      balance: row.balance,
    })).sort((a, b) => b.balance - a.balance);
    const mealCount = scoped.orders.reduce((sum, order) => (
      sum + parseItemLines(order.Items).reduce((lineSum, line) => lineSum + line.quantity, 0)
    ), 0);
    const actions = [];
    if (incompleteOrders.length) actions.push({
      priority: 'high',
      title: `Complete or correct ${incompleteOrders.length} order record${incompleteOrders.length === 1 ? '' : 's'}`,
      detail: incompleteOrders.slice(0, 3).map(order => `${order.customer}: ${order.missing.join(', ')}`).join('; '),
    });
    if (unpaid.length || consolidated.length) actions.push({
      priority: 'high',
      title: `Review ${unpaid.length + consolidated.length} outstanding balance${unpaid.length + consolidated.length === 1 ? '' : 's'}`,
      detail: `Current batch $${unpaid.reduce((sum, row) => sum + row.balance, 0).toFixed(2)}; consolidated $${consolidated.reduce((sum, row) => sum + row.balance, 0).toFixed(2)}.`,
    });
    if (leadFollowUps.length) actions.push({
      priority: 'medium',
      title: `Review ${leadFollowUps.length} recent lead${leadFollowUps.length === 1 ? '' : 's'} without a matched order`,
      detail: leadFollowUps.slice(0, 3).map(lead => `${lead.name} (${Math.round(lead.waitHours)}h)`).join(', '),
    });
    if (!actions.length) actions.push({
      priority: 'normal',
      title: 'No urgent record exceptions',
      detail: 'Review production volume and the current menu before making any customer-facing changes.',
    });
    actions.push({
      priority: 'normal',
      title: cutoffMs && cutoffHours > 0 ? 'Monitor orders before cutoff' : 'Use the reviewed order set for production',
      detail: `${scoped.orders.length} orders and ${mealCount} meals are currently recorded for Batch ${latestBatch || '?'}.`,
    });
    return {
      generatedAt: now.toISOString(),
      batchNumber: latestBatch,
      deliveryDate: clean(options.deliveryDate),
      cutoff: {
        iso: clean(options.cutoffIso),
        label: clean(options.cutoffLabel),
        state: !cutoffMs ? 'not-configured' : cutoffHours > 0 ? 'open' : 'closed',
        hoursRemaining: cutoffMs ? cutoffHours : null,
      },
      counts: {
        orders: scoped.orders.length,
        meals: mealCount,
        recentOrders: recentOrders.length,
        recentLeads: recentLeads.length,
        leadFollowUps: leadFollowUps.length,
        incompleteOrders: incompleteOrders.length,
      },
      money: {
        booked: financials(scoped).booked,
        collected: financials(scoped).collected,
        currentOutstanding: unpaid.reduce((sum, row) => sum + row.balance, 0),
        consolidatedOutstanding: consolidated.reduce((sum, row) => sum + row.balance, 0),
      },
      recentLeads,
      leadFollowUps,
      recentOrders: recentOrders.map(order => ({
        orderId: order['Order ID'],
        customer: `${order['First Name']} ${order['Last Name']}`.trim() || 'Unknown',
        total: order.revenue,
        submittedAt: order['Submitted At'],
      })),
      incompleteOrders,
      unpaid,
      consolidated,
      actions: actions.slice(0, 3),
      monitoring: {
        sheets: 'connected',
        resend: 'send result is recorded when this brief is emailed',
        tiktok: 'conversion events connected; reporting authorization pending',
        website: 'order and lead API failures are not yet persisted in a central error log',
      },
    };
  }

  function parseCsv(text) {
    const rows = []; let row = []; let field = ''; let quoted = false;
    for (let index = 0; index < String(text).length; index += 1) {
      const char = text[index];
      if (quoted && char === '"' && text[index + 1] === '"') { field += '"'; index += 1; }
      else if (char === '"') quoted = !quoted;
      else if (!quoted && char === ',') { row.push(field); field = ''; }
      else if (!quoted && (char === '\n' || char === '\r')) {
        if (char === '\r' && text[index + 1] === '\n') index += 1;
        row.push(field); if (row.some(value => clean(value))) rows.push(row); row = []; field = '';
      } else field += char;
    }
    row.push(field); if (row.some(value => clean(value))) rows.push(row);
    return rows;
  }

  function importTikTokCsv(csv, fileName = 'TikTok export.csv') {
    const rows = parseCsv(csv);
    if (rows.length < 2) throw new Error('The TikTok export has no campaign rows.');
    const headers = rows[0].map(value => clean(value).toLowerCase());
    const find = (...names) => headers.findIndex(header => names.some(name => header === name || header.includes(name)));
    const indexes = {
      name: find('campaign name', 'campaign'), spend: find('cost', 'spend'), impressions: find('impression'),
      clicks: find('clicks (destination)', 'destination click', 'clicks'), conversions: find('conversion', 'result'),
      date: find('date'),
    };
    if (indexes.spend < 0 && indexes.impressions < 0) throw new Error('This CSV does not look like a TikTok Ads report.');
    const campaigns = rows.slice(1).map(row => ({
      name: clean(row[indexes.name]) || 'Unlabeled campaign', spend: number(row[indexes.spend]),
      impressions: Math.round(number(row[indexes.impressions])), clicks: Math.round(number(row[indexes.clicks])),
      conversions: Math.round(number(row[indexes.conversions])), date: clean(row[indexes.date]),
    }));
    const dates = campaigns.map(row => row.date).filter(Boolean).sort();
    return {
      id: `tiktok-${Date.now()}`, importedAt: new Date().toISOString(), fileName, platform: 'TikTok', source: 'csv',
      dateFrom: dates[0] || '', dateTo: dates.at(-1) || '',
      spend: campaigns.reduce((sum, row) => sum + row.spend, 0),
      impressions: campaigns.reduce((sum, row) => sum + row.impressions, 0),
      clicks: campaigns.reduce((sum, row) => sum + row.clicks, 0),
      conversions: campaigns.reduce((sum, row) => sum + row.conversions, 0), campaigns,
    };
  }

  return {
    ORDER_HEADERS, PAYMENT_HEADERS, LEAD_HEADERS, RECEIVABLE_HEADERS, DIRECT_COSTS, DEFAULT_PROFILE_EXEMPT_CUSTOMERS,
    number, phone, batchNumber, normalizeOrders,
    standardRows, parseItemLines, orderCost, summarize, filterBatch, financials, sourceRows, referralRows, batchRows,
    customerRows, receivableRows, operatorBrief, parseCsv, importTikTokCsv,
  };
}));
