(function businessCenterCore(root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PRPDBusinessCore = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function factory(root) {
  const ORDER_HEADERS = [
    'Submitted At', 'Batch', 'Delivery Date', 'First Name', 'Last Name', 'Phone', 'Items', 'Exact Total',
    'Total (Rounded)', 'Notes', 'Order ID', 'Email', 'Delivery Address', 'City', 'ZIP Code', 'Delivery Instructions', 'Meal Subtotal',
    'Delivery Fee', 'Discount Code', 'Discount Amount', 'Referral Partner', 'Menu Email Opt-In', 'UTM Source',
    'UTM Medium', 'UTM Campaign', 'UTM Content', 'UTM Term', 'Landing Page', 'Referrer', 'State',
    'Address Has Unit', 'Google Click ID', 'Google Click ID Type', 'Ad Match Type', 'Ad Device', 'Ad Network',
    'Fulfillment Method',
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
  const PHONE_VALIDATION = (() => {
    if (root?.PRPDPhoneValidation) return root.PRPDPhoneValidation;
    if (typeof module === 'object' && module.exports) return require('../phone-validation');
    return Object.freeze({
      digits: value => String(value ?? '').replace(/\D/g, '').slice(-10),
      isValid: value => /^\d{10}$/.test(String(value ?? '').replace(/\D/g, '').slice(-10)),
      isLikelyNanp: value => /^[2-9]\d{2}[2-9]\d{6}$/.test(String(value ?? '').replace(/\D/g, '').slice(-10)),
    });
  })();

  const HISTORICAL_DIRECT_COSTS = Object.freeze({
    'egg bites|lean': 2.50, 'egg bites|bulk': 3.16,
    'french toast|lean': 2.94, 'french toast|bulk': 3.55,
    'breakfast quesadilla|lean': 3.82, 'breakfast quesadilla|bulk': 4.49,
    'grilled cheese breakfast burrito|lean': 4.03, 'grilled cheese breakfast burrito|bulk': 4.85,
    'high protein omelette|lean': 2.62, 'high protein omelette|bulk': 3.27,
    'beef breakfast skillet|lean': 3.69, 'beef breakfast skillet|bulk': 4.72,
    'power bowl|lean': 2.78, 'power bowl|bulk': 3.63,
    'blueberry cheesecake protein pancakes|lean': 3.11, 'blueberry cheesecake protein pancakes|bulk': 3.94,
    'strawberry cheesecake protein pancakes|lean': 3.11, 'strawberry cheesecake protein pancakes|bulk': 3.94,
    'cheeseburger hot pockets|lean': 2.21, 'cheeseburger hot pockets|bulk': 3.15,
    'mexican streetcorn chicken bowl|lean': 2.86, 'mexican streetcorn chicken bowl|bulk': 3.71,
    'hot honey chicken sliders|lean': 3.49, 'hot honey chicken sliders|bulk': 4.34,
    'chicken biryani|lean': 2.83, 'chicken biryani|bulk': 3.67,
    'butter chicken|lean': 3.25, 'butter chicken|bulk': 4.12,
    'loaded buffalo chicken potato|lean': 4.02, 'loaded buffalo chicken potato|bulk': 4.90,
    'peri peri chicken|lean': 1.64, 'peri peri chicken|bulk': 1.91,
    'meatball arrabbiata pasta|lean': 3.88, 'meatball arrabbiata pasta|bulk': 4.70,
    'beef seekh kabab shawarma|lean': 3.68, 'beef seekh kabab shawarma|bulk': 4.60,
    'bbq chicken mac & cheese|lean': 3.16, 'bbq chicken mac & cheese|bulk': 3.99,
    'korean bulgogi beef bowl|lean': 5.21, 'korean bulgogi beef bowl|bulk': 6.64,
    'garlic butter shrimp + rice|lean': 5.25, 'garlic butter shrimp + rice|bulk': 6.91,
    'premium ny strip steak|lean': 7.74, 'premium ny strip steak|bulk': 9.51,
    'strawberry cheesecake|single': 2.33,
    'cookie dough cup|single': 2.42, 'chocolate-dipped cookie dough balls|single': 2.50,
    'chocolate oreo mousse|single': 2.57, 'high protein tiramisu|single': 2.53,
    'lotus biscoff cheesecake|single': 2.82,
    'banana cream pie cup|single': 2.14,
  });
  const CURRENT_COST_DATA = (() => {
    if (root?.PRPDCurrentMenuCosts) return root.PRPDCurrentMenuCosts;
    if (typeof module === 'object' && module.exports) return require('./_current-menu-costs-data.json');
    return Object.freeze({ batchNumber: 0, directCosts: {}, provisionalCosts: [] });
  })();
  const CURRENT_BATCH_NUMBER = Number(CURRENT_COST_DATA.batchNumber) || 0;
  const CURRENT_DIRECT_COSTS = Object.freeze({ ...(CURRENT_COST_DATA.directCosts || {}) });
  const DIRECT_COSTS = Object.freeze({ ...HISTORICAL_DIRECT_COSTS, ...CURRENT_DIRECT_COSTS });
  const CURRENT_PROVISIONAL_COSTS = Object.freeze(new Set(CURRENT_COST_DATA.provisionalCosts || []));
  const PROVISIONAL_COSTS = CURRENT_PROVISIONAL_COSTS;

  function clean(value) { return String(value ?? '').trim().replace(/^'/, ''); }
  function number(value) {
    const parsed = Number(clean(value).replace(/[$,%\s]/g, '').replace(/,/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  function phone(value) { return PHONE_VALIDATION.digits(value); }
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

  function parseItemLines(items, options = {}) {
    return clean(items).split(/\r?\n/).map(line => line.trim()).filter(Boolean).flatMap((line) => {
      if (/^delivery\b/i.test(line)) return [];
      const match = line.match(/^(\d+)x\s+(.+?)(?:\s+\((Lean|Bulk|Single)\))?\s*(?:[-\u2013\u2014]\s*\$?[\d,.]+)?$/i);
      if (!match) return [{ quantity: 0, name: line, tier: '', cost: 0, known: false }];
      const quantity = Number(match[1]);
      const name = match[2].trim();
      const currentBatch = Number(options.batchNumber) === CURRENT_BATCH_NUMBER;
      const costSource = currentBatch ? CURRENT_DIRECT_COSTS : HISTORICAL_DIRECT_COSTS;
      let tier = (match[3] || (/(cup|cheesecake|cream pie|mousse|tiramisu|cookie dough ball)/i.test(name) ? 'Single' : '')).trim();
      const normalizedName = normalizeMealName(name);
      if (!tier && costSource[`${normalizedName}|single`] !== undefined) tier = 'Single';
      const costKey = `${normalizedName}|${tier.toLowerCase()}`;
      const unitCost = costSource[costKey];
      return [{
        quantity, name, tier, cost: unitCost ? quantity * unitCost : 0, known: Boolean(unitCost),
        provisional: currentBatch && CURRENT_PROVISIONAL_COSTS.has(costKey),
      }];
    });
  }

  function orderCost(order) {
    const lines = parseItemLines(order.Items, { batchNumber: batchNumber(order.Batch) });
    return {
      amount: Math.round(lines.reduce((sum, line) => sum + line.cost, 0) * 100) / 100,
      unknown: lines.filter(line => !line.known).map(line => line.name),
      provisional: lines.filter(line => line.provisional).map(line => line.name), lines,
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
        directCost: cost.amount, unknownCostItems: cost.unknown, provisionalCostItems: cost.provisional,
        source: sourceForOrder(order, leadByPhone),
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
      adImports: selected ? model.adImports.filter(row => batchNumber(row.batch) === selected) : model.adImports,
    };
  }

  function financials(model) {
    const booked = model.orders.reduce((sum, order) => sum + order.revenue, 0);
    const collected = model.payments.reduce((sum, row) => sum + row.paid, 0);
    const sheetOutstanding = model.payments.reduce((sum, row) => sum + Math.max(0, row.balance), 0);
    const outstanding = sheetOutstanding || Math.max(0, booked - collected);
    const directCost = model.orders.reduce((sum, order) => sum + order.directCost, 0);
    const cashPurchases = model.expenses.reduce((sum, row) => sum + number(row.amount), 0);
    const categoryTotal = category => model.expenses
      .filter(row => clean(row.category).toLowerCase() === category.toLowerCase())
      .reduce((sum, row) => sum + number(row.amount), 0);
    const inventoryPurchases = categoryTotal('Inventory purchase');
    const equipmentPurchases = categoryTotal('Equipment');
    const operatingExpenses = cashPurchases - inventoryPurchases - equipmentPurchases;
    const adSpend = model.adImports.reduce((sum, row) => sum + number(row.spend), 0);
    const contribution = booked - directCost - operatingExpenses - adSpend;
    const cashMovement = collected - cashPurchases - adSpend;
    return {
      booked, collected, outstanding, directCost,
      expenses: operatingExpenses, operatingExpenses, inventoryPurchases, equipmentPurchases, cashPurchases,
      adSpend, contribution, cashMovement,
      orderCount: model.orders.length, aov: model.orders.length ? booked / model.orders.length : 0,
      directCostPct: booked ? directCost / booked : 0,
      contributionPct: booked ? contribution / booked : 0,
      unknownCostItems: [...new Set(model.orders.flatMap(order => order.unknownCostItems))],
      provisionalCostItems: [...new Set(model.orders.flatMap(order => order.provisionalCostItems || []))],
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

  function referralProgramRows(model, codes = []) {
    const paymentsByOrder = new Map(model.payments.map(payment => [clean(payment['Order ID']), payment]).filter(([id]) => id));
    return (Array.isArray(codes) ? codes : []).map((code) => {
      const normalizedCode = clean(code.code).toUpperCase();
      const orders = model.orders.filter(order => clean(order['Discount Code']).toUpperCase() === normalizedCode);
      const paidOrders = orders.filter((order) => {
        const payment = paymentsByOrder.get(clean(order['Order ID']));
        return payment && payment.due > 0 && payment.paid >= payment.due && payment.balance <= 0;
      });
      const qualifyingPaid = code.maxPaidReferrals > 0 ? Math.min(paidOrders.length, code.maxPaidReferrals) : paidOrders.length;
      const earnedCredit = Math.round(qualifyingPaid * number(code.referrerCredit) * 100) / 100;
      const creditUsed = Math.max(0, number(code.creditUsed));
      return {
        ...code,
        redemptions: orders.length,
        paidReferrals: paidOrders.length,
        referredRevenue: orders.reduce((sum, order) => sum + order.revenue, 0),
        discountCost: orders.reduce((sum, order) => sum + number(order['Discount Amount']), 0),
        earnedCredit,
        creditUsed,
        availableCredit: Math.max(0, Math.round((earnedCredit - creditUsed) * 100) / 100),
      };
    }).sort((a, b) => b.paidReferrals - a.paidReferrals || b.referredRevenue - a.referredRevenue || clean(a.ownerName).localeCompare(clean(b.ownerName)));
  }

  function explicitEmailChoice(value) {
    const choice = clean(value).toLowerCase();
    if (/^(yes|true|1|opted in)$/.test(choice)) return true;
    if (/^(no|false|0|opted out)$/.test(choice)) return false;
    return null;
  }

  function lifecycleRows(model, options = {}) {
    const currentBatch = Number(options.currentBatch) || model.batchIds[0] || 0;
    const exemptions = Array.isArray(options.profileExemptCustomers) && options.profileExemptCustomers.length
      ? options.profileExemptCustomers
      : DEFAULT_PROFILE_EXEMPT_CUSTOMERS;
    const customers = new Map();

    model.orders.forEach((order) => {
      const email = clean(order.Email).toLowerCase();
      const customer = customerName(order);
      if (!validEmail(email) || isProfileExempt(customer, exemptions)) return;
      if (!customers.has(email)) {
        customers.set(email, {
          email, customer, firstName: clean(order['First Name']) || customer.split(' ')[0],
          orderCount: 0, batches: new Set(), latestBatch: 0, latestSubmittedAt: '', emailChoice: null,
        });
      }
      const row = customers.get(email);
      row.orderCount += 1;
      if (order.batchNumber) row.batches.add(order.batchNumber);
      const submittedAt = parseDate(order['Submitted At']);
      const latestSubmittedAt = parseDate(row.latestSubmittedAt);
      if (order.batchNumber > row.latestBatch || (order.batchNumber === row.latestBatch && submittedAt >= latestSubmittedAt)) {
        row.customer = customer;
        row.firstName = clean(order['First Name']) || customer.split(' ')[0];
        row.latestBatch = order.batchNumber;
        row.latestSubmittedAt = clean(order['Submitted At']);
      }
      const emailChoice = explicitEmailChoice(order['Menu Email Opt-In']);
      if (emailChoice !== null) row.emailChoice = emailChoice;
    });

    const priority = { 'Reorder due': 0, 'Win-back': 1, 'Current customer': 2, 'Do not email': 3 };
    return [...customers.values()].map((row) => {
      let segment = 'Win-back';
      let recommendedAction = 'Send a short, personal menu update; stop if there is no interest.';
      let draftType = 'win-back';
      if (row.emailChoice === false) {
        segment = 'Do not email';
        recommendedAction = 'Respect the recorded opt-out. Use no marketing email.';
        draftType = '';
      } else if (row.latestBatch >= currentBatch) {
        segment = 'Current customer';
        recommendedAction = 'After delivery, ask for honest feedback and an optional public review.';
        draftType = 'feedback';
      } else if (row.latestBatch === currentBatch - 1) {
        segment = 'Reorder due';
        recommendedAction = 'Send one personal current-menu follow-up, then wait for a response.';
        draftType = 'reorder';
      }
      return {
        ...row,
        batches: [...row.batches].sort((a, b) => b - a),
        segment,
        recommendedAction,
        draftType,
        emailStatus: row.emailChoice === true ? 'Opted in' : row.emailChoice === false ? 'Opted out' : 'No recorded choice',
      };
    }).sort((a, b) => priority[a.segment] - priority[b.segment] || b.latestBatch - a.latestBatch || a.customer.localeCompare(b.customer));
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
        ['phone number needs confirmation', PHONE_VALIDATION.isLikelyNanp(order.Phone)],
        ['valid email', validEmail(order.Email)],
        ['street address', validStreetAddress(order['Delivery Address'])],
        ['city', validCity(order.City)],
        ['5-digit ZIP', validZip(order['ZIP Code'])],
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

  function slug(value) {
    return clean(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
  }

  function menuItems(config) {
    const menu = config?.menu || {};
    const groups = [
      ['Breakfast', menu.breakfasts], ['Main', menu.mains], ['Dessert', menu.desserts], ['Grab & Go', menu.addons],
    ];
    return groups.flatMap(([section, items]) => (Array.isArray(items) ? items : []).map(item => ({ ...item, section })));
  }

  function trackedMarketingUrl(baseUrl, values = {}) {
    const url = new URL(baseUrl || 'https://getprpd.com/order');
    const fields = {
      utm_source: values.source,
      utm_medium: values.medium,
      utm_campaign: values.campaign,
      utm_content: values.content,
    };
    Object.entries(fields).forEach(([key, value]) => {
      const normalized = slug(value);
      if (normalized) url.searchParams.set(key, normalized);
    });
    return url.toString();
  }

  function campaignAsset({ id, title, platform, format, publishWindow, hook, caption, shotList, source, medium, campaign }) {
    return {
      id, title, platform, format, publishWindow, hook, caption, shotList,
      status: format === 'Short video' ? 'Needs footage' : 'Idea',
      trackedUrl: trackedMarketingUrl('https://getprpd.com/order', { source, medium, campaign, content:id }),
      postUrl: '', notes: '',
      metrics: { views:0, clicks:0, leads:0, paidOrders:0, revenue:0, spend:0 },
    };
  }

  function generateMarketingCampaign(config, options = {}) {
    const items = menuItems(config);
    if (!items.length) throw new Error('The active menu has no items.');
    const featured = items.find(item => item.id === options.featuredMealId) || items.find(item => item.section === 'Main') || items[0];
    const batch = Number(config?.batch?.number) || 0;
    const campaign = `batch-${batch}-${slug(featured.name)}`;
    const orderUrl = 'https://getprpd.com/order';
    const menuCount = items.length;
    const commonClose = `Order by ${config?.batch?.cutoffLabel || 'Wednesday evening'} at ${orderUrl}. DFW delivery only.`;
    const assets = [
      campaignAsset({
        id:'menu-launch-reel', title:'Weekly menu launch reel', platform:'TikTok + Instagram Reels', format:'Short video', publishWindow:'Menu launch',
        hook:`DFW meal prep for people who want high-protein food without eating the same bowl all week.`,
        caption:`This week at PRPD: ${featured.name} plus ${menuCount - 1} more breakfast, main, dessert, and grab-and-go options. Every meal is prepared halal and delivered across DFW. ${commonClose}`,
        shotList:[`Open on the finished ${featured.name}`, 'Show three contrasting menu items in quick succession', 'Capture one close-up cut, pull, or sauce shot', 'End on the packed weekly lineup and ordering deadline'],
        source:'tiktok-instagram', medium:'organic-social', campaign,
      }),
      campaignAsset({
        id:'menu-carousel', title:'Menu variety carousel', platform:'Instagram + Facebook', format:'Carousel', publishWindow:'Monday or Tuesday',
        hook:`${menuCount} options, one order page, and portions built around your goals.`,
        caption:`Swipe through this week's PRPD menu. Choose Lean or Bulk on full meals, then add breakfast, desserts, or Grab & Go items as needed. ${commonClose}`,
        shotList:['Cover: strongest finished meal photo', 'One slide for breakfast', 'Two slides for contrasting mains', 'One dessert or Grab & Go slide', 'Final slide with cutoff and getprpd.com/order'],
        source:'meta', medium:'organic-social', campaign,
      }),
      campaignAsset({
        id:'deadline-reminder', title:'Cutoff reminder', platform:'Instagram Stories + Facebook Stories', format:'Story', publishWindow:'Wednesday afternoon',
        hook:`Last call for this week's PRPD delivery.`,
        caption:`Orders close ${config?.batch?.cutoffLabel || 'tonight'}. Build your week before the kitchen count locks. ${commonClose}`,
        shotList:['Use a clean meal lineup or packing photo', 'Add the exact cutoff as large on-screen text', 'Use the tracked order link as the story link'],
        source:'meta', medium:'organic-story', campaign,
      }),
      campaignAsset({
        id:'customer-menu-email', title:'Customer menu email', platform:'Email', format:'Email', publishWindow:'Monday morning',
        hook:`This week's PRPD menu is open`,
        caption:`Hi {{first_name}},\n\nThis week's PRPD menu is open. ${featured.name} is one of ${menuCount} options available for DFW delivery. View the full menu and place your order here:\n\n${trackedMarketingUrl(orderUrl, { source:'resend', medium:'email', campaign, content:'customer-menu-email' })}\n\nOrders close ${config?.batch?.cutoffLabel || 'Wednesday evening'}.\n\nThank you,\nRida\nPRPD | Meals. Prepped.\n\nTo stop receiving menu emails, use the unsubscribe link below.`,
        shotList:[], source:'resend', medium:'email', campaign,
      }),
      campaignAsset({
        id:'creator-brief', title:'Creator tasting brief', platform:'Creator outreach', format:'Brief', publishWindow:'Before next menu launch',
        hook:`A real DFW meal-prep tasting centered on taste, portions, and convenience.`,
        caption:`Show the meals as they arrive, taste at least two contrasting dishes, and give an honest opinion on flavor, portion size, and who PRPD fits. Clearly disclose any free meals or payment. Do not make medical, weight-loss, or guaranteed-results claims. Use this tracked link: ${trackedMarketingUrl(orderUrl, { source:'creator', medium:'partner', campaign, content:'creator-brief' })}`,
        shotList:['Sealed delivery and labels', 'Lean/Bulk portion context when available', 'Real first bite and honest reaction', 'Ordering page and weekly cutoff'],
        source:'creator', medium:'partner', campaign,
      }),
    ];
    return {
      id:`batch-${batch}-${Date.now()}`, batchNumber:batch, name:`Batch ${batch} weekly campaign`,
      featuredMealId:featured.id, featuredMeal:featured.name,
      deliveryDate:clean(config?.batch?.deliveryDate), cutoffLabel:clean(config?.batch?.cutoffLabel),
      generatedAt:new Date().toISOString(), assets,
    };
  }

  function marketingSummary(campaign) {
    const assets = campaign?.assets || [];
    const totals = assets.reduce((sum, asset) => {
      const metrics = asset.metrics || {};
      return {
        views:sum.views + number(metrics.views), clicks:sum.clicks + number(metrics.clicks),
        leads:sum.leads + number(metrics.leads), paidOrders:sum.paidOrders + number(metrics.paidOrders),
        revenue:sum.revenue + number(metrics.revenue), spend:sum.spend + number(metrics.spend),
      };
    }, { views:0, clicks:0, leads:0, paidOrders:0, revenue:0, spend:0 });
    return {
      ...totals,
      posted:assets.filter(asset => asset.status === 'Posted').length,
      ready:assets.filter(asset => asset.status === 'Approved').length,
      clickRate:totals.views ? totals.clicks / totals.views : 0,
      leadRate:totals.clicks ? totals.leads / totals.clicks : 0,
      orderRate:totals.leads ? totals.paidOrders / totals.leads : 0,
      roas:totals.spend ? totals.revenue / totals.spend : 0,
    };
  }

  function marketingRecommendations(campaign) {
    const assets = campaign?.assets || [];
    const posted = assets.filter(asset => asset.status === 'Posted');
    if (!campaign) return ['Generate the active weekly campaign pack.'];
    if (!posted.length) return ['Approve the strongest asset, publish it, then record its URL and results before adding more campaigns.'];
    const measured = posted.filter(asset => number(asset.metrics?.views) || number(asset.metrics?.clicks) || number(asset.metrics?.paidOrders));
    if (!measured.length) return ['Add results to posted assets so the next weekly plan can use evidence instead of guesses.'];
    const best = measured.slice().sort((a, b) => number(b.metrics?.paidOrders) - number(a.metrics?.paidOrders) || number(b.metrics?.clicks) - number(a.metrics?.clicks))[0];
    return [`Repeat the structure of ${best.title}; it currently has the strongest recorded order and click signal.`, 'Change one variable at a time next week: hook, featured dish, or distribution channel.'];
  }

  return {
    ORDER_HEADERS, PAYMENT_HEADERS, LEAD_HEADERS, RECEIVABLE_HEADERS, DIRECT_COSTS, HISTORICAL_DIRECT_COSTS,
    CURRENT_DIRECT_COSTS, CURRENT_BATCH_NUMBER, CURRENT_PROVISIONAL_COSTS, PROVISIONAL_COSTS, DEFAULT_PROFILE_EXEMPT_CUSTOMERS,
    number, phone, batchNumber, normalizeOrders,
    standardRows, parseItemLines, orderCost, summarize, filterBatch, financials, sourceRows, referralRows, referralProgramRows, lifecycleRows, batchRows,
    customerRows, receivableRows, operatorBrief, parseCsv, importTikTokCsv,
    menuItems, trackedMarketingUrl, generateMarketingCampaign, marketingSummary, marketingRecommendations,
  };
}));
