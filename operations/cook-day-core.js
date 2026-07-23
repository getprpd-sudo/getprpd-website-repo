(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.PRPD_COOK_DAY = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  function normalize(value) {
    return String(value || '').trim().replace(/\s+/g, ' ').toLowerCase();
  }

  function parseDelimited(text, delimiter) {
    const rows = [];
    let row = [];
    let cell = '';
    let quoted = false;
    const source = String(text || '').replace(/^\uFEFF/, '');
    for (let index = 0; index < source.length; index += 1) {
      const char = source[index];
      if (quoted) {
        if (char === '"' && source[index + 1] === '"') {
          cell += '"';
          index += 1;
        } else if (char === '"') {
          quoted = false;
        } else {
          cell += char;
        }
      } else if (char === '"') {
        quoted = true;
      } else if (char === delimiter) {
        row.push(cell);
        cell = '';
      } else if (char === '\n') {
        row.push(cell.replace(/\r$/, ''));
        if (row.some(value => value !== '')) rows.push(row);
        row = [];
        cell = '';
      } else {
        cell += char;
      }
    }
    row.push(cell.replace(/\r$/, ''));
    if (row.some(value => value !== '')) rows.push(row);
    return rows;
  }

  function parseTable(text) {
    const firstLine = String(text || '').split(/\r?\n/, 1)[0] || '';
    return parseDelimited(text, firstLine.includes('\t') ? '\t' : ',');
  }

  function catalog(config) {
    return Object.values(config.menu).flat().reduce((map, dish) => {
      map[normalize(dish.name)] = dish;
      for (const alias of dish.aliases || []) map[normalize(alias)] = dish;
      return map;
    }, {});
  }

  function parseItemsText(itemsText, config) {
    const dishes = catalog(config);
    const lines = String(itemsText || '').split(/\r?\n/);
    const items = [];
    const warnings = [];
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || /^delivery\b/i.test(line) || /^\$?\d+(?:\.\d{2})?$/.test(line)) continue;
      const match = line.match(/^(\d+)x\s+(.+?)(?:\s+\((Lean|Bulk)\))?\s*(?:[-\u2013\u2014]\s*\$?[\d.]+)?$/i);
      if (!match) {
        warnings.push(`Could not parse item line: ${line}`);
        continue;
      }
      const qty = Number(match[1]);
      const name = match[2].trim();
      const dish = dishes[normalize(name)];
      if (!dish) {
        warnings.push(`Unknown menu item: ${name}`);
        continue;
      }
      const tier = dish.category === 'dessert' ? 'single' : normalize(match[3]) === 'bulk' ? 'bulk' : 'lean';
      items.push({ id: dish.id, name: dish.name, tier, qty });
    }
    return { items, warnings };
  }

  function orderStatusFromNotes(notes) {
    const value = String(notes || '').trim();
    if (/^\[(?:HOLD|ON HOLD)\]/i.test(value)) return 'hold';
    if (/^\[(?:CANCELLED|CANCELED)\]/i.test(value)) return 'cancelled';
    return 'active';
  }

  function arrayRowsToOrders(rows, config) {
    if (rows.length < 2) throw new Error('The file does not contain an Orders header and data rows.');
    const header = rows[0].map(normalize);
    const indexOf = (...names) => header.findIndex(value => names.includes(value));
    const submittedIndex = indexOf('submitted at', 'timestamp');
    const batchIndex = indexOf('batch');
    const firstIndex = indexOf('first name', 'firstname');
    const lastIndex = indexOf('last name', 'lastname');
    const phoneIndex = indexOf('phone', 'phone number');
    const itemsIndex = indexOf('items', 'order');
    const totalIndex = indexOf('total (rounded)', 'total rounded', 'total');
    const notesIndex = indexOf('notes');
    const idIndex = indexOf('order id', 'orderid');
    if (itemsIndex < 0) throw new Error('An Items column was not found. Export the Orders tab with its header row.');

    const orders = [];
    const warnings = [];
    for (const row of rows.slice(1)) {
      const batch = row[batchIndex] || '';
      if (batchIndex >= 0 && batch && !normalize(batch).includes(`batch ${config.batch.number}`)) continue;
      const parsed = parseItemsText(row[itemsIndex], config);
      if (!parsed.items.length) continue;
      warnings.push(...parsed.warnings.map(warning => `${row[idIndex] || 'Order'}: ${warning}`));
      const notes = row[notesIndex] || '';
      const sourceStatus = orderStatusFromNotes(notes);
      orders.push({
        orderId: row[idIndex] || '',
        submittedAt: row[submittedIndex] || '',
        customer: [row[firstIndex], row[lastIndex]].filter(Boolean).join(' ').trim() || 'Unknown',
        phone: row[phoneIndex] || '',
        total: row[totalIndex] || '',
        notes,
        items: parsed.items,
        sourceStatus,
        included: sourceStatus === 'active',
      });
    }
    return { orders, warnings };
  }

  function rowsToOrders(text, config) {
    return arrayRowsToOrders(parseTable(text), config);
  }

  function orderKey(order) {
    if (order.orderId) return `id:${order.orderId}`;
    return `row:${normalize(order.submittedAt)}|${normalize(order.customer)}|${String(order.phone || '').replace(/\D/g, '')}`;
  }

  function includedOrders(orders) {
    return (orders || []).filter(order => order.included !== false).map(order => ({
      ...order,
      items: (order.items || []).filter(item => Number(item.qty) > 0),
    })).filter(order => order.items.length > 0);
  }

  function aggregateCounts(orders) {
    const counts = {};
    for (const order of orders) {
      for (const item of order.items || []) {
        const key = `${item.id}:${item.tier}`;
        if (!counts[key]) counts[key] = { id: item.id, name: item.name, tier: item.tier, qty: 0 };
        counts[key].qty += Number(item.qty) || 0;
      }
    }
    return Object.values(counts).filter(item => item.qty > 0);
  }

  function countsFromMap(countMap, config) {
    const dishes = Object.values(config.menu).flat();
    return Object.entries(countMap).flatMap(([key, qty]) => {
      const [id, tier] = key.split(':');
      const dish = dishes.find(item => item.id === id);
      return dish && Number(qty) > 0 ? [{ id, name: dish.name, tier, qty: Number(qty) }] : [];
    });
  }

  function bufferSettings(buffer) {
    if (typeof buffer === 'object' && buffer) {
      return {
        prpdExtraServings: Math.max(0, Number(buffer.prpdExtraServings ?? buffer.qcServings) || 0),
        rawProteinBufferPct: Math.min(20, Math.max(0, Number(buffer.rawProteinBufferPct) || 0)),
        riceBufferPct: Math.min(30, Math.max(0, Number(buffer.riceBufferPct) || 0)),
        riceYieldFactor: Math.min(4, Math.max(1, Number(buffer.riceYieldFactor) || 3)),
      };
    }
    return { prpdExtraServings: Math.max(0, Number(buffer) || 0), rawProteinBufferPct: 0, riceBufferPct: 0, riceYieldFactor: 3 };
  }

  function productionBreakdown(quantity, buffer) {
    const qty = Math.max(0, Number(quantity) || 0);
    const settings = bufferSettings(buffer);
    const extra = Math.ceil(settings.prpdExtraServings);
    return { customer: qty, extra, total: qty + extra };
  }

  function productionPlan(counts, buffer) {
    const settings = bufferSettings(buffer);
    const extrasPerDish = Math.ceil(settings.prpdExtraServings);
    const tierRank = { single: 1, lean: 2, bulk: 3 };
    const extraTierByDish = new Map();
    for (const count of counts || []) {
      if (!(Number(count.qty) > 0)) continue;
      const current = extraTierByDish.get(count.id);
      if (!current || (tierRank[count.tier] || 0) > (tierRank[current] || 0)) {
        extraTierByDish.set(count.id, count.tier);
      }
    }
    return (counts || []).map((count) => {
      const customer = Math.max(0, Number(count.qty) || 0);
      const extra = count.tier === extraTierByDish.get(count.id) ? extrasPerDish : 0;
      return { ...count, customer, extra, total: customer + extra };
    });
  }

  function ingredientTotals(counts, productionData, buffer) {
    const totals = {};
    const warnings = [];
    const settings = bufferSettings(buffer);
    const plannedCounts = productionPlan(counts, settings);
    for (const count of plannedCounts) {
      const meal = productionData.meals[count.id];
      const build = meal && meal.tiers[count.tier];
      if (!build) {
        warnings.push(`No production build for ${count.name} (${count.tier}).`);
        continue;
      }
      if (build.confidence === 'low') warnings.push(`${count.name} (${count.tier}) uses a low-confidence production build.`);
      const bufferedServingCount = count.total;
      for (const ingredient of build.ingredients) {
        const key = `${ingredient.key}:${ingredient.unit}`;
        if (!totals[key]) totals[key] = { ...ingredient, baseAmount: 0, bufferedAmount: 0 };
        totals[key].baseAmount += ingredient.amount * count.qty;
        totals[key].bufferedAmount += ingredient.amount * bufferedServingCount;
      }
    }
    return {
      totals: Object.values(totals).map(item => {
        const planningBuffer = proteinYieldRules[item.key]
          ? 1 + settings.rawProteinBufferPct / 100
          : item.key === 'rice_dry'
            ? 1 + settings.riceBufferPct / 100
            : 1;
        return {
          ...item,
          baseAmount: Math.round(item.baseAmount * 10) / 10,
          bufferedAmount: Math.round(item.bufferedAmount * planningBuffer * 10) / 10,
        };
      }),
      warnings: Array.from(new Set(warnings)),
      buffer: settings,
    };
  }

  function rounded(value, digits = 2) {
    const factor = 10 ** digits;
    return Math.round((Number(value) || 0) * factor) / factor;
  }

  function dualAmount(item, value, options = {}) {
    const amount = Math.max(0, Number(value) || 0);
    const unit = item.unit || 'g';
    if (unit === 'each') return `${options.roundCount ? Math.ceil(amount) : rounded(amount, 1)} each`;
    if (unit !== 'g') return `${rounded(amount, 1)} ${unit}`;
    const measure = item.measure || {};
    const metric = amount >= 1000 ? `${rounded(amount / 1000, amount >= 10000 ? 1 : 2)} kg` : `${rounded(amount, amount < 10 ? 1 : 0)} g`;
    if (measure.type === 'spice' && measure.gramsPerTsp) {
      const tsp = amount / measure.gramsPerTsp;
      const spoonValue = tsp >= 3 ? tsp / 3 : tsp;
      const practical = Math.max(spoonValue < 1 ? 0.125 : 0.25, Math.round(spoonValue / (spoonValue < 1 ? 0.125 : 0.25)) * (spoonValue < 1 ? 0.125 : 0.25));
      const kitchen = tsp >= 3 ? `${rounded(practical, 3)} tbsp` : `${rounded(practical, 3)} tsp`;
      return `${metric} / ${kitchen}`;
    }
    if (measure.type === 'liquid') {
      const ml = amount / (measure.density || 1);
      return `${metric} / ${rounded(ml, ml < 20 ? 1 : 0)} mL / ${rounded(ml / 236.588, 2)} cup`;
    }
    if (measure.type === 'meat') {
      const pounds = amount / 453.592;
      const estimatedPieces = measure.gramsPerPiece ? amount / measure.gramsPerPiece : 0;
      const buyCount = options.roundCount && estimatedPieces ? `; buy ${Math.ceil(estimatedPieces)}` : '';
      const pieces = estimatedPieces ? ` / approx. ${rounded(estimatedPieces, 1)} ${measure.pieceName || 'pieces'}${buyCount}` : '';
      return `${metric} / ${rounded(pounds, 2)} lb${pieces}`;
    }
    return metric;
  }

  function productionSummary(counts, orders, buffer) {
    const breakdowns = productionPlan(counts, buffer);
    return {
      customers: new Set((orders || []).map(order => order.customer).filter(Boolean)).size,
      orders: (orders || []).length,
      meals: counts.reduce((sum, item) => sum + item.qty, 0),
      labels: breakdowns.reduce((sum, item) => sum + item.customer, 0),
      sauces: counts.reduce((sum, item) => sum + item.qty, 0),
      extraMeals: breakdowns.reduce((sum, item) => sum + item.extra, 0),
      productionMeals: breakdowns.reduce((sum, item) => sum + item.total, 0),
    };
  }

  function labelPlan(counts, buffer, labelsPerSheet = 4) {
    const perSheet = Math.max(1, Math.floor(Number(labelsPerSheet) || 4));
    const rows = (counts || []).map((count) => {
      const customer = Math.max(0, Number(count.qty) || 0);
      const sheets = Math.ceil(customer / perSheet);
      return {
        id: count.id,
        name: count.name,
        tier: count.tier,
        customer,
        labels: customer,
        sheets,
        spareLabels: sheets * perSheet - customer,
      };
    });
    return {
      rows,
      labelsPerSheet: perSheet,
      totalLabels: rows.reduce((sum, row) => sum + row.labels, 0),
      totalSheets: rows.reduce((sum, row) => sum + row.sheets, 0),
      totalSpareLabels: rows.reduce((sum, row) => sum + row.spareLabels, 0),
    };
  }

  const proteinYieldRules = {
    chicken_thigh_raw: { factor: 0.75, label: 'estimated boneless cooked yield' },
    chicken_breast_raw: { factor: 0.75, label: 'estimated boneless cooked yield' },
    beef_90_raw: { factor: 0.75, label: 'estimated cooked yield after draining' },
    leg_quarter_raw: { factor: 0.75, label: 'estimated cooked bone-in weight; edible yield must be recorded' },
    ny_strip_raw: { factor: 0.75, label: 'estimated cooked yield' },
    beef_strip_raw: { factor: 0.75, label: 'estimated cooked yield' },
    shrimp_raw: { factor: 0.80, label: 'estimated cooked yield' },
    tilapia_raw: { factor: 0.80, label: 'estimated cooked yield' },
  };

  const produceKeys = new Set([
    'spinach', 'tomato', 'onion', 'jalapeno', 'potato', 'strawberry', 'banana',
    'lettuce', 'broccoli', 'corn', 'cilantro', 'lime', 'lemon', 'garlic', 'ginger',
    'pickles',
  ]);

  function componentPlan(counts, productionData, methods, buffer) {
    const settings = bufferSettings(buffer);
    const grouped = Object.values((counts || []).reduce((map, count) => {
      (map[count.id] ||= { id: count.id, name: count.name, counts: [] }).counts.push(count);
      return map;
    }, {}));
    const proteins = [];
    const rice = [];
    const prepBatches = [];

    for (const group of grouped) {
      const batch = ingredientTotals(group.counts, productionData, buffer).totals;
      const byKey = Object.fromEntries(batch.map(item => [item.key, item]));
      const tierText = group.counts.map(count => count.tier).join(' + ');

      for (const item of batch) {
        const rule = proteinYieldRules[item.key];
        if (rule) {
          proteins.push({
            ...item,
            dishId: group.id,
            dish: group.name,
            tiers: tierText,
            expectedCookedAmount: rounded(item.bufferedAmount * rule.factor, 1),
            yieldLabel: rule.label,
          });
        }
        if (item.key === 'rice_dry') {
          rice.push({
            ...item,
            dish: group.name,
            tiers: tierText,
            expectedCookedAmount: rounded(item.bufferedAmount * settings.riceYieldFactor, 1),
          });
        }
      }

      for (const prep of methods?.meals?.[group.id]?.prepBatches || []) {
        const isSharedProteinPrep = prep.type === 'marinade' && (methods?.sharedProteinSeasoning || []).some(family =>
          family.dishIds?.includes(group.id) && prep.ingredientKeys?.includes(family.proteinKey)
        );
        if (isSharedProteinPrep) continue;
        const ingredients = prep.ingredientKeys.map(key => byKey[key]).filter(Boolean);
        prepBatches.push({
          dishId: group.id,
          dish: group.name,
          tiers: tierText,
          type: prep.type,
          name: prep.name,
          instruction: prep.instruction || '',
          ingredients,
          unmeasured: prep.unmeasured || [],
        });
      }
    }

    const allIngredients = ingredientTotals(counts, productionData, buffer).totals;
    const produce = allIngredients.filter(item => item.station === 'Cold Prep & Produce' || produceKeys.has(item.key));
    const proteinGroups = Object.values(proteins.reduce((map, item) => {
      const group = map[item.key] ||= {
        key: item.key,
        name: item.name,
        unit: item.unit,
        measure: item.measure,
        yieldLabel: item.yieldLabel,
        bufferedAmount: 0,
        expectedCookedAmount: 0,
        allocations: [],
      };
      group.bufferedAmount += item.bufferedAmount;
      group.expectedCookedAmount += item.expectedCookedAmount;
      group.allocations.push(item);
      return map;
    }, {})).map(group => ({
      ...group,
      bufferedAmount: rounded(group.bufferedAmount, 1),
      expectedCookedAmount: rounded(group.expectedCookedAmount, 1),
    }));
    const seasoningGroups = (methods?.sharedProteinSeasoning || []).map(family => {
      const allocations = proteins.filter(item => item.key === family.proteinKey && family.dishIds?.includes(item.dishId));
      if (!allocations.length) return null;
      const totalRaw = rounded(allocations.reduce((sum, item) => sum + item.bufferedAmount, 0), 1);
      const scaled = (items, rawAmount) => (items || []).map(item => ({
        ...item,
        grams: rounded((Number(item.grams) || 0) * rawAmount / 1000, 1),
      }));
      return {
        id: family.id,
        name: family.name,
        proteinKey: family.proteinKey,
        note: family.note || '',
        totalRaw,
        baseSeasoning: scaled(family.basePerKg, totalRaw),
        allocations: allocations.map(item => ({
          ...item,
          finishNote: family.finishes?.[item.dishId]?.note || '',
          finishSeasoning: scaled(family.finishes?.[item.dishId]?.perKg, item.bufferedAmount),
        })),
      };
    }).filter(Boolean);
    const riceTotal = rice.reduce((total, item) => ({
      ...total,
      bufferedAmount: total.bufferedAmount + item.bufferedAmount,
      expectedCookedAmount: total.expectedCookedAmount + item.expectedCookedAmount,
    }), { key: 'rice_dry', name: 'Dry rice, uncooked', unit: 'g', bufferedAmount: 0, expectedCookedAmount: 0 });
    return {
      labels: labelPlan(counts, buffer, 4),
      proteins,
      proteinGroups,
      seasoningGroups,
      rice,
      riceTotal: {
        ...riceTotal,
        bufferedAmount: rounded(riceTotal.bufferedAmount, 1),
        expectedCookedAmount: rounded(riceTotal.expectedCookedAmount, 1),
      },
      produce,
      prepBatches,
    };
  }

  function weeklySaucePlan(orders, sauceConfig) {
    const config = sauceConfig || {};
    const eligibleOrders = (orders || []).filter(order => (order.items || []).some(item => item.tier !== 'single'));
    const orderCount = eligibleOrders.length;
    const customerCupsPerSauce = Math.max(0, Number(config.customerCupsPerSauce) || 0);
    const kitchenUseCupsPerSauce = Math.max(0, Number(config.kitchenUseCupsPerSauce) || 0);
    const qcCupsPerSauce = Math.max(0, Number(config.qcCupsPerSauce) || 0);
    const cupsPerSauce = customerCupsPerSauce + kitchenUseCupsPerSauce + qcCupsPerSauce;
    const sauces = (config.sauces || []).map(sauce => ({
      ...sauce,
      customerCups: customerCupsPerSauce,
      kitchenUseCups: kitchenUseCupsPerSauce,
      qcCups: qcCupsPerSauce,
      totalCups: cupsPerSauce,
      physicalCups: customerCupsPerSauce + qcCupsPerSauce,
      totalGrams: rounded((sauce.ingredientsPerCup || []).reduce((sum, item) => sum + (Number(item.grams) || 0), 0) * cupsPerSauce, 1),
      ingredients: (sauce.ingredientsPerCup || []).map(item => ({
        ...item,
        unit: 'g',
        totalGrams: rounded((Number(item.grams) || 0) * cupsPerSauce, 1),
      })),
    }));
    return {
      policy: config.policy || '',
      cupSizeOz: Number(config.cupSizeOz) || 0,
      orderCount,
      sauces,
      totalCups: sauces.reduce((sum, sauce) => sum + sauce.totalCups, 0),
      totalPhysicalCups: sauces.reduce((sum, sauce) => sum + sauce.physicalCups, 0),
    };
  }

  function labelEligibleOrders(orders, exemptCustomers) {
    const exemptions = (exemptCustomers || []).map(normalize).filter(Boolean);
    return (orders || []).filter(order => {
      const customer = normalize(order.customer);
      return !exemptions.some(exempt => customer === exempt || customer.startsWith(`${exempt} `));
    });
  }

  function buildWorkflow(counts, methods, resources = {}) {
    const selected = [];
    const seen = new Set();
    for (const count of counts || []) {
      if (seen.has(count.id) || !methods?.meals?.[count.id]) continue;
      seen.add(count.id);
      selected.push({ id: count.id, name: count.name, method: methods.meals[count.id] });
    }

    const methodText = (entry) => [
      ...(entry.method.equipment || []),
      ...(entry.method.prepSteps || []),
      ...(entry.method.steps || []),
      entry.method.temperature || '',
      entry.method.plating || '',
    ].join(' ');
    const hasText = (entry, pattern) => pattern.test(methodText(entry));
    const names = (entries) => entries.map(entry => entry.name);
    const completedPrep = new Set((resources.completedPrep || []).map(normalize));
    const prepStage = (key, stage) => ({
      key,
      completed: completedPrep.has(normalize(key)),
      ...stage,
    });
    const desserts = selected.filter(entry => /^d/.test(entry.id));
    const breakfasts = selected.filter(entry => /^b/.test(entry.id));
    const sauces = selected.filter(entry => entry.method.sideCups > 0 || hasText(entry, /sauce|salsa|syrup|crema|condiment/i));
    const proteins = selected.filter(entry => hasText(entry, /marinat|season chicken|mix and form|score every|raw protein/i));
    const vegetables = selected.filter(entry => hasText(entry, /chop|vegetable|lettuce|tomato|jalapeno|broccoli|potato|corn|pickle|fruit/i));
    const rice = selected.filter(entry => hasText(entry, /rice cooker|rice batch|cook.*rice/i));
    const oven = selected.filter(entry => hasText(entry, /oven|bake|roast/i));
    const stove = selected.filter(entry => hasText(entry, /skillet|griddle|sauce pot|pasta pot|stovetop|pan-cook|brown beef|sear/i));
    const chickenLine = selected.filter(entry => hasText(entry, /chicken|poultry/i));
    const beefLine = selected.filter(entry => hasText(entry, /beef|steak|seekh|meatball/i));
    const starchLine = selected.filter(entry => hasText(entry, /rice|pasta|mac|potato|corn|bread|tortilla/i));

    const prepStages = [
      prepStage('reconcile', {
        title: '1. Reconcile, print, and stage',
        reason: 'Lock the reviewed customer counts before food is opened.',
        dishes: names(selected),
        tasks: ['Confirm included orders and manual corrections.', 'Print only the paid-customer labels shown in the label plan.', 'Count the exact customer containers, plus clean empty packaging spares for damage only, along with dessert cups, lids, sauce cups, and bags.'],
      }),
      prepStage('desserts', {
        title: '2. Build desserts first',
        reason: 'Desserts need the longest uninterrupted chill time and stay separated from raw-protein work.',
        dishes: names(desserts),
        tasks: desserts.length ? ['Complete, seal, label, and refrigerate every ordered dessert.', 'Record the finished cup yield before moving to raw ingredients.'] : ['No desserts are in this production run.'],
      }),
      prepStage('sauces', {
        title: '3. Portion sauces and cold sides',
        reason: 'Finishing these early clears measuring tools and prevents hot-line bottlenecks.',
        dishes: names(sauces),
        tasks: sauces.length ? ['Make shared sauces in full batches.', 'Fill and count all side cups, then refrigerate them by dish.'] : ['No separate sauce cups are required.'],
      }),
      prepStage('produce', {
        title: '4. Wash, cut, and kit vegetables',
        reason: 'Prepare produce before raw meat, then sanitize the station once.',
        dishes: names(vegetables),
        tasks: vegetables.length ? ['Wash and cut produce by dish.', 'Store cold garnishes separately from vegetables that will be cooked.', 'Pre-weigh dry seasoning kits and label every prep container.'] : ['Only dry seasoning kits and general mise en place are required.'],
      }),
      prepStage('proteins', {
        title: '5. Marinate and form proteins',
        reason: 'Finish all raw-protein handling in one controlled block, then clean and sanitize.',
        dishes: names(proteins),
        tasks: proteins.length ? ['Pull the compatible boneless chicken listed in the Master chicken seasoning table as one weighed batch; keep butter chicken, peri-peri, beef, and other distinct marinades out.', 'Apply the complete scaled master seasoning once, record every actual seasoning weight, then divide the seasoned raw chicken into the exact labeled dish bowls shown in the table.', 'Add the listed dish finish only after each bowl is separated. Form meatballs or seekh logs where ordered.', 'Cover, identify, date, and refrigerate each dish batch, then clean and sanitize the raw-protein station.'] : ['No overnight protein preparation is required.'],
      }),
      prepStage('rice', {
        title: '6. Cook and rapid-cool rice',
        reason: 'Thursday rice is only safe when the commercial kitchen can execute and record rapid cooling.',
        dishes: names(rice),
        tasks: rice.length ? ['Combine only rice builds that share the same base method; keep spice-cooked or otherwise distinct rice in separate sub-batches.', 'Divide the cooked rice into labeled dish pans using the packet allocations.', 'Cool from 135 F to 70 F within 2 hours and to 41 F within 6 hours total using shallow pans or the kitchen-approved method.', 'Record time, temperature, and total cooked yield before covering and refrigerating. If capacity is insufficient, move rice to Friday.'] : ['No rice batch is required.'],
      }),
      prepStage('labels', {
        title: '7. Label containers and close prep day',
        reason: 'Friday should begin with measured kits and a clean, counted line.',
        dishes: names(selected),
        tasks: ['Apply paid-customer labels to empty containers without blocking the sealing edge.', 'Do not prepare or label automatic extra meals; the raw-protein reserve is pooled across production.', 'Stage each dish kit with its recipe card.', 'Reconcile completed prep against the packet and record shortages before leaving.'],
      }),
    ];

    const ovenSetpoints = (entry) => {
      const temperatureText = entry.method.temperature || '';
      const bakeOrRoast = Array.from(
        temperatureText.matchAll(/(?:bake|roast)[^.;]{0,70}?(\d{3})\s*F/gi),
        match => Number(match[1])
      );
      const ovenFinish = Array.from(
        temperatureText.matchAll(/(\d{3})\s*F\s+(?:finishing\s+)?oven/gi),
        match => Number(match[1])
      );
      return Array.from(new Set([...bakeOrRoast, ...ovenFinish]));
    };
    const ovenTemperatures = Array.from(new Set(oven.flatMap(ovenSetpoints)));
    const durationMinutes = (entry) => {
      const values = Array.from(methodText(entry).matchAll(/(\d+)(?:\s*-\s*(\d+))?\s*minutes?/gi), match => Number(match[2] || match[1]));
      return values.length ? Math.max(...values) : 0;
    };
    const ovenBlocks = ovenTemperatures.map((temperature) => ({
      temperature,
      entries: oven.filter(entry => ovenSetpoints(entry).includes(temperature)),
    })).filter(block => block.entries.length).map(block => ({
      ...block,
      estimatedMinutes: Math.max(...block.entries.map(durationMinutes), 0),
    })).sort((a, b) => b.estimatedMinutes - a.estimatedMinutes || b.temperature - a.temperature);
    const assignedStove = new Set();
    const ovenIds = new Set(oven.map(entry => entry.id));
    const teamSize = Math.max(1, Number(resources.teamSize) || 1);
    const activeCapacity = Math.max(1, Math.min(Number(resources.burners) || 1, Math.max(1, teamSize - 1)));
    const parallelBlocks = ovenBlocks.map((block, index) => {
      const available = stove
        .filter(entry => !assignedStove.has(entry.id) && !block.entries.some(ovenEntry => ovenEntry.id === entry.id))
        .sort((a, b) => Number(ovenIds.has(a.id)) - Number(ovenIds.has(b.id)));
      const whileEntries = available.slice(0, activeCapacity);
      whileEntries.forEach(entry => assignedStove.add(entry.id));
      return {
        title: `${block.temperature} F oven block`,
        primary: names(block.entries),
        while: names(whileEntries),
        estimatedMinutes: block.estimatedMinutes,
        order: index + 1,
      };
    });
    const completedText = [
      completedPrep.has('desserts') ? 'desserts' : '',
      completedPrep.has('sauces') ? 'sauces/cold sides' : '',
      completedPrep.has('rice') ? 'rice' : '',
    ].filter(Boolean);
    const ovenTimeline = parallelBlocks.length
      ? parallelBlocks.map(block => `${block.title}: ${block.primary.join(', ')}${block.while.length ? `; active lane: ${block.while.join(', ')}` : ''}`).join(' | ')
      : 'No oven blocks are required.';

    const cookStages = [
      {
        title: '1. Shift startup and control board',
        reason: 'Professional batch production starts from one locked count and one visible plan.',
        dishes: names(selected),
        tasks: [
          'Confirm the active customer count, dish/tier totals, labels, and container count before cooking begins.',
          completedText.length ? `Prep already completed: ${completedText.join(', ')}. Verify counts, labels, and cold holding; do not remake these batches.` : 'Confirm which prep-day batches are complete and properly held.',
          'Set up three lanes: passive equipment (ovens/rice), active cooking (stove/griddle), and cold/cooling (staging, shallow pans, labels).',
          'Pull only the first scheduled protein bowl. Keep every later batch refrigerated until its lane is ready.',
        ],
        release: 'Counts locked; equipment preheated; cooling space, thermometers, scales, and labeled pans ready.',
      },
      {
        title: '2. Launch the passive-equipment lane',
        reason: 'Start the longest hands-off work first so oven time overlaps with active cooking.',
        dishes: names(oven),
        tasks: [
          ovenTimeline,
          'Load only the amount the equipment can cook evenly; split oversized recipes into numbered sub-batches rather than crowding pans.',
          'When a passive batch finishes, record endpoint temperature and yield, move it to its labeled holding/cooling pan, then load the next block.',
        ],
        release: 'Every oven/rice batch is assigned a block, destination pan, endpoint check, and actual yield line.',
      },
      {
        title: '3. Egg and breakfast component line',
        reason: 'Measure shared egg work together, then keep each recipe build separate through cooking and assembly.',
        dishes: names(breakfasts),
        tasks: breakfasts.length ? [
          'Stage all measured eggs, egg whites, dairy, bread, tortillas, cheese, and breakfast vegetables together.',
          'Prepare each labeled recipe batch separately: egg-bite mix, French-toast custard, quesadilla eggs, and burrito eggs are not interchangeable.',
          'Run oven, griddle, and skillet batches at the same time only within the available team and equipment capacity.',
          'Record finished bite count, toast count, egg weight, and filling yield before releasing components to cooling.',
        ] : ['No breakfast production is required.'],
        release: 'All breakfast components counted, identified, cooled/held correctly, and ready for final build.',
      },
      {
        title: '4. Chicken component line',
        reason: 'Cook by labeled recipe batch and equipment capacity, not by customer and not as one universal chicken batch.',
        dishes: names(chickenLine),
        tasks: chickenLine.length ? [
          'Pull the grouped chicken total, then confirm the raw allocation in every labeled dish bowl before cooking.',
          'Cook one recipe batch, or one numbered equipment-capacity sub-batch, at a time. Keep marinades and finished pans distinct.',
          'When reusing equipment, move from mild/neutral profiles toward stronger sauces when practical; fully clean and sanitize between incompatible allergen or flavor profiles.',
          'For every dish, record raw weight, batch count, endpoint temperature, and cooked yield before moving to the next recipe.',
          'Hold the pooled raw reserve cold. Cook it only when an actual measured yield shortage requires it.',
        ] : ['No chicken production is required.'],
        release: 'Every chicken dish has a verified cooked yield in its own labeled pan; reserve usage is documented.',
      },
      {
        title: '5. Beef, formed-protein, and steak line',
        reason: 'Ground, formed, and whole-muscle beef use different controls even when they share equipment.',
        dishes: names(beefLine),
        tasks: beefLine.length ? [
          'Run burrito beef, seekh, meatballs, and steak as separate labeled batches using their own recipe cards.',
          'Form and count seekh logs/meatballs before cooking; sear steak in uncrowded sub-batches and preserve its doneness target.',
          'Record endpoint temperature, cooked weight, count, and any trim loss for every beef batch.',
          'Move each released batch to its own labeled pan; never combine cooked beef from different recipes.',
        ] : ['No beef production is required.'],
        release: 'All beef batches meet their recipe endpoint and yield target and are staged separately.',
      },
      {
        title: '6. Starch, vegetable, and hot-side line',
        reason: 'Shared bases are efficient only when the base method is truly identical.',
        dishes: names(starchLine),
        tasks: starchLine.length ? [
          completedPrep.has('rice') ? 'Rice is already complete: verify its recorded yield and cold holding. Reheat or use it only under the commercial kitchen procedure; do not cook a duplicate batch.' : 'Cook compatible plain rice as one controlled base, then split into labeled dish pans. Keep yellow or spice-cooked rice separate.',
          'Run pasta/mac, potatoes, corn, broccoli, and other hot sides in equipment-sized batches; record actual yield before plating.',
          'Apply dish-specific finishes only after shared bases are divided into labeled pans.',
          'Do not let a finished protein wait at room temperature for an unfinished side; send released components into approved hot holding or rapid cooling.',
        ] : ['No starch or hot-side production is required.'],
        release: 'Every selected meal has all required hot components released and identified.',
      },
      {
        title: '7. Yield release and controlled cooling',
        reason: 'Plating begins from measured, released components, not estimates still sitting in cookware.',
        dishes: names(selected.filter(entry => !/^d/.test(entry.id))),
        tasks: [
          'Compare actual cooked yields with the plating requirement before opening the assembly line.',
          'Resolve shortages using the documented raw reserve or an approved correction; record all changes.',
          'Rapid-cool cooked TCS components using shallow pans or the commercial kitchen-approved method and log required checkpoints.',
          'Keep cold garnishes, sauces, and desserts refrigerated until their assembly step.',
        ],
        release: 'All components have enough verified yield, correct identity, and an approved holding/cooling state.',
      },
      {
        title: '8. Assembly line by dish and tier',
        reason: 'The assembly line is organized by SKU, not customer, to protect speed and portion consistency.',
        dishes: names(selected),
        tasks: [
          'Stage only one dish and tier at a time: containers, correct label stack, scale, protein pan, starch/side pans, garnish, and sauce.',
          'Build and verify the first three containers, check regular mid-run portions, then verify the final three.',
          'Complete the full Lean run, reconcile it, reset the line, then complete Bulk. Desserts remain a separate cold line.',
          'Move completed containers immediately to the approved cold-holding area; do not let the entire menu sit on the table awaiting labels.',
        ],
        release: 'Every dish/tier count matches the production sheet and every container has the correct portion and label.',
      },
      {
        title: '9. Customer pack-out and close',
        reason: 'Dish-level production is complete before customer-specific bagging begins.',
        dishes: names(selected),
        tasks: [
          'Build one customer order at a time from the staging sheet and mark each item as it enters the bag.',
          'Reconcile sauces, desserts, and any special notes before closing each bag.',
          'Record shorts, damage, true overage, rework, and the final cold-holding check.',
          'Clean and sanitize all stations, then record actual phase finish times for the next planner revision.',
        ],
        release: 'All customer bags reconciled, cold, and ready for delivery; production variance recorded.',
      },
    ];

    const lanes = [
      { name: 'Passive equipment lane', detail: 'Ovens and rice equipment stay occupied with the longest safe batch while hands move elsewhere.', dishes: names(oven) },
      { name: 'Active cooking lane', detail: `Use no more than ${activeCapacity} simultaneous active task${activeCapacity === 1 ? '' : 's'} with the current team/equipment setup.`, dishes: names(stove) },
      { name: 'Cold and cooling lane', detail: 'A clean person/station receives finished yields, starts cooling, stages cold components, and protects labels/counts.', dishes: names([...desserts, ...sauces]) },
    ];

    return { prepStages, cookStages, parallelBlocks, lanes, selected: names(selected) };
  }

  return {
    normalize,
    parseDelimited,
    parseTable,
    parseItemsText,
    orderStatusFromNotes,
    arrayRowsToOrders,
    rowsToOrders,
    orderKey,
    includedOrders,
    aggregateCounts,
    countsFromMap,
    bufferSettings,
    productionBreakdown,
    productionPlan,
    ingredientTotals,
    dualAmount,
    productionSummary,
    labelPlan,
    componentPlan,
    weeklySaucePlan,
    labelEligibleOrders,
    buildWorkflow,
  };
});
