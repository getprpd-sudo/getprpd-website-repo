(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.PRPD_COOK_DAY = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  function normalize(value) {
    return String(value || '').trim().replace(/\s+/g, ' ').toLowerCase();
  }

  function configuredDishes(config) {
    return [
      ...Object.values(config.menu || {}).flat(),
      ...(config.plannerOnly || []),
    ];
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
    return configuredDishes(config).reduce((map, dish) => {
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
      const tier = dish.category === 'dessert' || dish.category === 'addon'
        ? 'single'
        : normalize(match[3]) === 'bulk' ? 'bulk' : 'lean';
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
    const emailIndex = indexOf('email', 'email address');
    const addressIndex = indexOf('address', 'street address');
    const cityIndex = indexOf('city');
    const zipIndex = indexOf('zip', 'zip code', 'postal code');
    const deliveryNotesIndex = indexOf('delivery notes', 'delivery instructions');
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
        email: row[emailIndex] || '',
        address: row[addressIndex] || '',
        city: row[cityIndex] || '',
        zip: row[zipIndex] || '',
        deliveryNotes: row[deliveryNotesIndex] || '',
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

  function packoutPlan(orders) {
    return includedOrders(orders).map(order => {
      const items = (order.items || []).map(item => {
        const qty = Math.max(0, Math.floor(Number(item.qty) || 0));
        return {
          ...item,
          qty,
          units: Array.from({ length: qty }, (_, index) => index + 1),
        };
      });
      return {
        key: orderKey(order),
        customer: order.customer || 'Unknown',
        phone: order.phone || '',
        email: order.email || '',
        address: order.address || '',
        city: order.city || '',
        zip: order.zip || '',
        deliveryNotes: order.deliveryNotes || '',
        notes: order.notes || '',
        orderId: order.orderId || '',
        totalItems: items.reduce((sum, item) => sum + item.qty, 0),
        items,
      };
    });
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
    const dishes = configuredDishes(config);
    return Object.entries(countMap).flatMap(([key, qty]) => {
      const [id, tier] = key.split(':');
      const dish = dishes.find(item => item.id === id);
      return dish && Number(qty) > 0 ? [{ id, name: dish.name, tier, qty: Number(qty) }] : [];
    });
  }

  function bufferSettings(buffer) {
    if (typeof buffer === 'object' && buffer) {
      const rawProteinReserveByDish = Object.fromEntries(Object.entries(buffer.rawProteinReserveByDish || {})
        .filter(([dishId]) => /^[a-z][a-z0-9_-]{0,31}$/i.test(dishId))
        .map(([dishId, value]) => [dishId, Math.min(30, Math.max(0, Number(value) || 0))]));
      return {
        rawProteinBufferPct: Math.min(20, Math.max(0, Number(buffer.rawProteinBufferPct) || 0)),
        rawProteinReserveByDish,
        riceBufferPct: Math.min(30, Math.max(0, Number(buffer.riceBufferPct) || 0)),
        riceYieldFactor: Math.min(4, Math.max(1, Number(buffer.riceYieldFactor) || 3)),
      };
    }
    return { rawProteinBufferPct: 0, rawProteinReserveByDish: {}, riceBufferPct: 0, riceYieldFactor: 3 };
  }

  function productionBreakdown(quantity) {
    const qty = Math.max(0, Number(quantity) || 0);
    return { customer: qty, extra: 0, total: qty };
  }

  function productionPlan(counts) {
    return (counts || []).map((count) => {
      const customer = Math.max(0, Number(count.qty) || 0);
      return { ...count, customer, extra: 0, total: customer };
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
      const dishProteinReservePct = Object.hasOwn(settings.rawProteinReserveByDish, count.id)
        ? settings.rawProteinReserveByDish[count.id]
        : settings.rawProteinBufferPct;
      for (const ingredient of build.ingredients) {
        const key = `${ingredient.key}:${ingredient.unit}`;
        if (!totals[key]) totals[key] = { ...ingredient, baseAmount: 0, bufferedAmount: 0 };
        const planningBuffer = proteinYieldRules[ingredient.key]
          ? 1 + dishProteinReservePct / 100
          : ingredient.key === 'rice_dry'
            ? 1 + settings.riceBufferPct / 100
            : 1;
        totals[key].baseAmount += ingredient.amount * count.qty;
        totals[key].bufferedAmount += ingredient.amount * bufferedServingCount * planningBuffer;
      }
    }
    return {
      totals: Object.values(totals).map(item => ({
        ...item,
        baseAmount: Math.round(item.baseAmount * 10) / 10,
        bufferedAmount: Math.round(item.bufferedAmount * 10) / 10,
      })),
      warnings: Array.from(new Set(warnings)),
      buffer: settings,
    };
  }

  function operationalIngredientTotals(counts, productionData, methods, buffer) {
    const result = ingredientTotals(counts, productionData, buffer);
    const totals = new Map(result.totals.map(item => [`${item.key}:${item.unit}`, { ...item }]));

    for (const count of productionPlan(counts)) {
      const build = productionData.meals?.[count.id]?.tiers?.[count.tier];
      const method = methods?.meals?.[count.id] || {};
      const overrides = method.groceryOverrides || {};
      if (!build) continue;

      const modeledByKey = (build.ingredients || []).reduce((map, item) => {
        const key = `${item.key}:${item.unit || 'g'}`;
        const current = map.get(key) || { ...item, amount: 0 };
        current.amount += Number(item.amount) || 0;
        map.set(key, current);
        return map;
      }, new Map());

      for (const [ingredientKey, override] of Object.entries(overrides)) {
        const unit = override.unit || 'g';
        const mapKey = `${ingredientKey}:${unit}`;
        const modeled = modeledByKey.get(mapKey);
        const actualPerServing = Number(
          override[count.tier] ?? override.perServing ?? 0,
        ) || 0;
        const modeledPerServing = Number(modeled?.amount) || 0;
        const delta = (actualPerServing - modeledPerServing) * count.qty;
        const current = totals.get(mapKey) || {
          key: ingredientKey,
          name: override.name || ingredientKey,
          unit,
          station: override.station || 'Other',
          note: override.note || 'Operational preparation quantity.',
          confidence: override.confidence || 'planning',
          baseAmount: 0,
          bufferedAmount: 0,
        };
        current.baseAmount += delta;
        current.bufferedAmount += delta;
        totals.set(mapKey, current);
      }

      for (const prep of method.prepBatches || []) {
        for (const formula of prep.formulaIngredients || []) {
          if (overrides[formula.key] || formula.includeInGrocery === false) continue;
          const unit = formula.unit || 'g';
          const mapKey = `${formula.key}:${unit}`;
          const perServing = Number(formula[count.tier] ?? formula.perServing ?? 0) || 0;
          const amount = perServing * count.qty + (Number(formula.fixedAmount) || 0);
          if (amount <= 0) continue;
          const current = totals.get(mapKey) || {
            key: formula.key,
            name: formula.name || formula.key,
            unit,
            station: formula.station || 'Other',
            note: formula.note || 'Measured production-formula quantity.',
            confidence: formula.confidence || 'planning',
            baseAmount: 0,
            bufferedAmount: 0,
            measure: formula.measure,
          };
          current.baseAmount += amount;
          current.bufferedAmount += amount;
          totals.set(mapKey, current);
        }
      }
    }

    for (const family of methods?.sharedProteinSeasoning || []) {
      let totalRaw = 0;
      const allocations = [];
      for (const count of productionPlan(counts)) {
        if (!family.dishIds?.includes(count.id)) continue;
        const ingredient = productionData.meals?.[count.id]?.tiers?.[count.tier]?.ingredients
          ?.find(item => item.key === family.proteinKey);
        if (!ingredient) continue;
        const raw = (Number(ingredient.amount) || 0) * count.qty;
        totalRaw += raw;
        allocations.push({ count, raw });
      }
      const addSeasoning = (item, rawAmount, note) => {
        const grams = (Number(item.grams) || 0) * rawAmount / 1000;
        if (grams <= 0) return;
        const key = item.key || item.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
        const mapKey = `${key}:g`;
        const current = totals.get(mapKey) || {
          key,
          name: item.name,
          unit: 'g',
          station: item.station || 'Dry Prep & Seasonings',
          note,
          confidence: item.confidence || 'planning',
          baseAmount: 0,
          bufferedAmount: 0,
          measure: item.measure,
        };
        current.baseAmount += grams;
        current.bufferedAmount += grams;
        totals.set(mapKey, current);
      };
      for (const item of family.basePerKg || []) {
        addSeasoning(item, totalRaw, `${family.name} shared base.`);
      }
      for (const allocation of allocations) {
        for (const item of family.finishes?.[allocation.count.id]?.perKg || []) {
          addSeasoning(item, allocation.raw, `${family.name}: ${allocation.count.name} finish.`);
        }
      }
    }

    return {
      ...result,
      totals: Array.from(totals.values())
        .filter(item => item.bufferedAmount > 0)
        .map(item => ({
          ...item,
          baseAmount: Math.round(item.baseAmount * 10) / 10,
          bufferedAmount: Math.round(item.bufferedAmount * 10) / 10,
        })),
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

  function labelPlan(counts, buffer, labelsPerSheet = 4, mealOrder = []) {
    const perSheet = Math.max(1, Math.floor(Number(labelsPerSheet) || 4));
    const orderById = new Map((mealOrder || []).map((meal, index) => [meal.id, index]));
    const tierOrder = { lean: 0, bulk: 1, single: 2 };
    const consolidated = new Map();
    for (const count of counts || []) {
      const labels = Math.max(0, Math.floor(Number(count.qty) || 0));
      if (!labels) continue;
      const key = `${count.id}:${count.tier}`;
      const current = consolidated.get(key) || { ...count, qty: 0 };
      current.qty += labels;
      consolidated.set(key, current);
    }
    const orderedCounts = [...consolidated.values()];
    if (orderById.size) {
      orderedCounts.sort((left, right) => {
        const leftOrder = orderById.has(left.id) ? orderById.get(left.id) : Number.MAX_SAFE_INTEGER;
        const rightOrder = orderById.has(right.id) ? orderById.get(right.id) : Number.MAX_SAFE_INTEGER;
        if (leftOrder !== rightOrder) return leftOrder - rightOrder;
        const nameOrder = String(left.name || '').localeCompare(String(right.name || ''));
        if (nameOrder) return nameOrder;
        return (tierOrder[left.tier] ?? 3) - (tierOrder[right.tier] ?? 3);
      });
    }
    let queueOffset = 0;
    const rows = orderedCounts.map((count) => {
      const customer = Math.max(0, Math.floor(Number(count.qty) || 0));
      const queueStart = queueOffset + 1;
      queueOffset += customer;
      return {
        id: count.id,
        name: count.name,
        tier: count.tier,
        customer,
        labels: customer,
        queueStart,
        queueEnd: queueOffset,
      };
    });
    const totalLabels = rows.reduce((sum, row) => sum + row.labels, 0);
    const totalSheets = Math.ceil(totalLabels / perSheet);
    const finalSheetOpenSlots = totalSheets * perSheet - totalLabels;
    return {
      rows,
      labelsPerSheet: perSheet,
      totalLabels,
      totalSheets,
      finalSheetOpenSlots,
    };
  }

  const proteinYieldRules = {
    chicken_thigh_raw: { factor: 0.75, label: 'estimated boneless cooked yield' },
    chicken_breast_raw: { factor: 0.75, label: 'estimated boneless cooked yield' },
    beef_90_raw: { factor: 0.75, label: 'estimated cooked yield after draining' },
    leg_quarter_raw: { factor: 0.75, label: 'estimated cooked bone-in weight; edible yield must be recorded' },
    ny_strip_raw: { factor: 0.75, label: 'estimated cooked yield' },
    beef_strips_raw: { factor: 0.76, label: 'estimated cooked yield' },
    shrimp_raw: { factor: 0.80, label: 'estimated cooked yield' },
    tilapia_raw: { factor: 0.80, label: 'estimated cooked yield' },
    pink_salmon_raw: { factor: 0.80, label: 'estimated cooked yield' },
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
            // Dish allocations are recipe quantities only. Reserve is pooled once
            // at the protein-group level below, never assigned to a dish.
            reserveAmount: 0,
            expectedCookedAmount: rounded(item.baseAmount * rule.factor, 1),
            reserveExpectedCookedAmount: 0,
            yieldLabel: rule.label,
          });
        }
        if (item.key === 'rice_dry') {
          const allowanceAmount = rounded(Math.max(0, item.bufferedAmount - item.baseAmount), 1);
          rice.push({
            ...item,
            dishId: group.id,
            dish: group.name,
            tiers: tierText,
            batchGroup: methods?.meals?.[group.id]?.riceBatchGroup || 'common',
            allowanceAmount,
            expectedCookedAmount: rounded(item.baseAmount * settings.riceYieldFactor, 1),
            allowanceExpectedCookedAmount: rounded(allowanceAmount * settings.riceYieldFactor, 1),
          });
        }
      }

      for (const prep of methods?.meals?.[group.id]?.prepBatches || []) {
        const isSharedProteinPrep = prep.type === 'marinade' && (methods?.sharedProteinSeasoning || []).some(family =>
          family.dishIds?.includes(group.id) && prep.ingredientKeys?.includes(family.proteinKey)
        );
        if (isSharedProteinPrep) continue;
        const ingredientKeys = Array.isArray(prep.ingredientKeys) ? prep.ingredientKeys : [];
        const ingredients = prep.includeAllRecipeIngredients
          ? Object.values(byKey)
          : ingredientKeys.map(key => byKey[key]).filter(Boolean);
        for (const formula of prep.formulaIngredients || []) {
          const amount = group.counts.reduce((sum, count) => {
            const perServing = Number(
              formula[count.tier] ?? formula.perServing ?? 0,
            ) || 0;
            return sum + perServing * count.qty;
          }, Number(formula.fixedAmount) || 0);
          if (amount <= 0) continue;
          ingredients.push({
            key: formula.key,
            name: formula.name || formula.key,
            unit: formula.unit || 'g',
            station: formula.station || 'Other',
            note: formula.note || 'Full kitchen preparation quantity.',
            confidence: formula.confidence || 'planning',
            baseAmount: rounded(amount, 1),
            bufferedAmount: rounded(amount, 1),
            measure: formula.measure,
          });
        }
        const pieceTargets = Object.entries(prep.pieceTargets || {}).map(([tier, target]) => {
          const count = group.counts.find(item => item.tier === tier);
          const pieces = (Number(count?.qty) || 0) * (Number(target.piecesPerServing) || 0);
          const gramsPerPiece = Number(target.gramsPerPiece) || 0;
          return {
            tier,
            label: target.label || `${tier} piece`,
            pieces,
            gramsPerPiece,
            totalGrams: rounded(pieces * gramsPerPiece, 1),
          };
        }).filter(target => target.pieces > 0);
        prepBatches.push({
          dishId: group.id,
          dish: group.name,
          tiers: tierText,
          type: prep.type,
          prepWave: prep.prepWave || '',
          prepWaveName: prep.prepWaveName || '',
          name: prep.name,
          instruction: prep.instruction || '',
          ingredients,
          pieceTargets,
          unmeasured: prep.unmeasured || [],
          steps: prep.steps || [],
        });
      }
    }

    const allIngredients = operationalIngredientTotals(counts, productionData, methods, buffer).totals;
    const produce = allIngredients.filter(item => item.station === 'Cold Prep & Produce' || produceKeys.has(item.key));
    const proteinGroups = Object.values(proteins.reduce((map, item) => {
      const group = map[item.key] ||= {
        key: item.key,
        name: item.name,
        unit: item.unit,
        measure: item.measure,
        yieldLabel: item.yieldLabel,
        bufferedAmount: 0,
        baseAmount: 0,
        reserveAmount: 0,
        expectedCookedAmount: 0,
        reserveExpectedCookedAmount: 0,
        allocations: [],
      };
      group.bufferedAmount += item.bufferedAmount;
      group.baseAmount += item.baseAmount;
      group.expectedCookedAmount += item.expectedCookedAmount;
      group.allocations.push(item);
      return map;
    }, {})).map(group => ({
      ...group,
      bufferedAmount: rounded(group.bufferedAmount, 1),
      baseAmount: rounded(group.baseAmount, 1),
      reserveAmount: rounded(Math.max(0, group.bufferedAmount - group.baseAmount), 1),
      expectedCookedAmount: rounded(group.expectedCookedAmount, 1),
      reserveExpectedCookedAmount: rounded(Math.max(0, group.bufferedAmount - group.baseAmount) * (proteinYieldRules[group.key]?.factor || 1), 1),
    }));
    const seasoningGroups = (methods?.sharedProteinSeasoning || []).map(family => {
      const allocations = proteins.filter(item => item.key === family.proteinKey && family.dishIds?.includes(item.dishId));
      if (!allocations.length) return null;
      const totalRaw = rounded(allocations.reduce((sum, item) => sum + item.baseAmount, 0), 1);
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
          bufferedAmount: item.baseAmount,
          finishSeasoning: scaled(family.finishes?.[item.dishId]?.perKg, item.baseAmount),
        })),
      };
    }).filter(Boolean);
    const riceGroups = Object.values(rice.reduce((map, item) => {
      const key = item.batchGroup || 'common';
      const group = map[key] ||= {
        key,
        name: key === 'biryani' ? 'Biryani rice - cook separately' : 'Common plain basmati rice',
        unit: item.unit,
        measure: item.measure,
        bufferedAmount: 0,
        baseAmount: 0,
        allowanceAmount: 0,
        expectedCookedAmount: 0,
        allowanceExpectedCookedAmount: 0,
        allocations: [],
      };
      group.bufferedAmount += item.bufferedAmount;
      group.baseAmount += item.baseAmount;
      group.allowanceAmount += item.allowanceAmount;
      group.expectedCookedAmount += item.expectedCookedAmount;
      group.allowanceExpectedCookedAmount += item.allowanceExpectedCookedAmount;
      group.allocations.push(item);
      return map;
    }, {})).map(group => ({
      ...group,
      bufferedAmount: rounded(group.bufferedAmount, 1),
      baseAmount: rounded(group.baseAmount, 1),
      allowanceAmount: rounded(group.allowanceAmount, 1),
      expectedCookedAmount: rounded(group.expectedCookedAmount, 1),
      allowanceExpectedCookedAmount: rounded(group.allowanceExpectedCookedAmount, 1),
    }));
    const riceTotal = rice.reduce((total, item) => ({
      ...total,
      bufferedAmount: total.bufferedAmount + item.bufferedAmount,
      baseAmount: total.baseAmount + item.baseAmount,
      allowanceAmount: total.allowanceAmount + item.allowanceAmount,
      expectedCookedAmount: total.expectedCookedAmount + item.expectedCookedAmount,
      allowanceExpectedCookedAmount: total.allowanceExpectedCookedAmount + item.allowanceExpectedCookedAmount,
    }), { key: 'rice_dry', name: 'Dry rice, uncooked', unit: 'g', bufferedAmount: 0, baseAmount: 0, allowanceAmount: 0, expectedCookedAmount: 0, allowanceExpectedCookedAmount: 0 });
    return {
      labels: labelPlan(counts, buffer, 4),
      proteins,
      proteinGroups,
      seasoningGroups,
      rice,
      riceGroups,
      riceTotal: {
        ...riceTotal,
        bufferedAmount: rounded(riceTotal.bufferedAmount, 1),
        baseAmount: rounded(riceTotal.baseAmount, 1),
        allowanceAmount: rounded(riceTotal.allowanceAmount, 1),
        expectedCookedAmount: rounded(riceTotal.expectedCookedAmount, 1),
        allowanceExpectedCookedAmount: rounded(riceTotal.allowanceExpectedCookedAmount, 1),
      },
      produce,
      prepBatches,
    };
  }

  function weeklySaucePlan(orders, sauceConfig) {
    const config = sauceConfig || {};
    if (config.enabled === false) {
      return {
        policy: config.policy || '',
        cupSizeOz: Number(config.cupSizeOz) || 0,
        orderCount: 0,
        eligibleMealCount: 0,
        customerCupsTotal: 0,
        customerCupMode: 'disabled',
        sauces: [],
        totalCups: 0,
        totalPhysicalCups: 0,
      };
    }
    const eligibleMealIds = new Set(Array.isArray(config.eligibleMealIds) ? config.eligibleMealIds : []);
    const isEligibleMeal = item => eligibleMealIds.size
      ? eligibleMealIds.has(item.id)
      : item.tier !== 'single';
    const eligibleOrders = (orders || []).filter(order => (order.items || []).some(isEligibleMeal));
    const orderCount = eligibleOrders.length;
    const eligibleMealCount = eligibleOrders.reduce((sum, order) => sum + (order.items || [])
      .filter(isEligibleMeal)
      .reduce((mealSum, item) => {
        const quantity = Number(item.qty);
        return mealSum + (Number.isFinite(quantity) && quantity >= 0 ? quantity : 1);
      }, 0), 0);
    const configuredCustomerCups = Math.max(0, Number(config.customerCupsTotal) || 0);
    const customerCupsTotal = configuredCustomerCups || eligibleMealCount;
    const kitchenUseCupsPerSauce = Math.max(0, Number(config.kitchenUseCupsPerSauce) || 0);
    const qcCupsPerSauce = Math.max(0, Number(config.qcCupsPerSauce) || 0);
    const sauceDefinitions = config.sauces || [];
    const sauces = sauceDefinitions.map((sauce, index) => {
      const customerCups = sauceDefinitions.length
        ? Math.floor(customerCupsTotal / sauceDefinitions.length) + (index < customerCupsTotal % sauceDefinitions.length ? 1 : 0)
        : 0;
      const productionActive = customerCups > 0;
      const kitchenUseCups = productionActive ? kitchenUseCupsPerSauce : 0;
      const qcCups = productionActive ? qcCupsPerSauce : 0;
      const totalCups = customerCups + kitchenUseCups + qcCups;
      const gramsPerCup = rounded((sauce.ingredientsPerCup || []).reduce((sum, item) => sum + (Number(item.grams) || 0), 0), 1);
      return {
        ...sauce,
        customerCups,
        kitchenUseCups,
        qcCups,
        totalCups,
        gramsPerCup,
        physicalCups: customerCups + qcCups,
        totalGrams: rounded(gramsPerCup * totalCups, 1),
        ingredients: (sauce.ingredientsPerCup || []).map(item => ({
        ...item,
        unit: 'g',
          totalGrams: rounded((Number(item.grams) || 0) * totalCups, 1),
        })),
      };
    });
    return {
      policy: config.policy || '',
      cupSizeOz: Number(config.cupSizeOz) || 0,
      orderCount,
      eligibleMealCount,
      customerCupsTotal,
      customerCupMode: configuredCustomerCups ? 'manual' : 'automatic',
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

  function dishPackAllocation(orders, dishId, exemptCustomers) {
    const exemptionNames = exemptCustomers || [];
    const exemptions = exemptionNames.map(normalize);
    const labeled = new Map();
    const separate = new Map();
    const tierOrder = { lean: 0, bulk: 1, single: 2 };

    for (const order of includedOrders(orders)) {
      const customer = normalize(order.customer);
      const exemptionIndex = exemptions.findIndex(exempt => customer === exempt || customer.startsWith(`${exempt} `));
      for (const item of order.items || []) {
        if (item.id !== dishId || Number(item.qty) <= 0) continue;
        const tier = item.tier || 'single';
        const qty = Math.max(0, Math.floor(Number(item.qty) || 0));
        if (exemptionIndex < 0) {
          labeled.set(tier, (labeled.get(tier) || 0) + qty);
          continue;
        }
        const name = exemptionNames[exemptionIndex] || order.customer || 'Separate box';
        const key = `${exemptionIndex}:${tier}`;
        const current = separate.get(key) || { customer: name, tier, qty: 0, order: exemptionIndex };
        current.qty += qty;
        separate.set(key, current);
      }
    }

    const byTier = (left, right) => (tierOrder[left.tier] ?? 3) - (tierOrder[right.tier] ?? 3);
    return {
      labeled: Array.from(labeled, ([tier, qty]) => ({ tier, qty })).sort(byTier),
      separate: Array.from(separate.values()).sort((left, right) => left.order - right.order || byTier(left, right)),
    };
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
    const proteinPrepTypes = new Set(['marinade', 'marinade-finish', 'protein-mix', 'protein-portion']);
    const proteinKeys = new Set(['chicken_thigh_raw', 'leg_quarter_raw', 'beef_90_raw', 'beef_strip_raw', 'steak_raw', 'shrimp_raw', 'tilapia_raw', 'pink_salmon_raw']);
    const hasProteinPrep = entry => (entry.method.prepBatches || []).some(batch =>
      proteinPrepTypes.has(batch.type)
      || (batch.ingredientKeys || []).some(key => proteinKeys.has(key))
    );
    const proteins = selected.filter(entry => entry.method.proteinCook || hasProteinPrep(entry) || hasText(entry, /marinat|season chicken|mix and form|score every|raw protein/i));
    const vegetables = selected.filter(entry => hasText(entry, /chop|vegetable|lettuce|tomato|jalapeno|broccoli|potato|corn|pickle|fruit/i));
    const mixes = selected.filter(entry => hasText(entry, /batter|dough|custard|whisk eggs|egg mix|mixture|filling/i));
    const starches = selected.filter(entry => hasText(entry, /rice cooker|rice batch|cook.*rice|pasta|mac(?:aroni)?|potato/i));
    const oven = selected.filter(entry => hasText(entry, /oven|bake|roast/i));
    const stove = selected.filter(entry => hasText(entry, /skillet|griddle|sauce pot|pasta pot|stovetop|pan-cook|brown beef|sear/i));
    const proteinCookEntries = selected
      .filter(entry => entry.method.proteinCook)
      .sort((left, right) => Number(left.method.proteinCook.sequence || 999) - Number(right.method.proteinCook.sequence || 999));
    const proteinCookGroups = Array.from(proteinCookEntries.reduce((groups, entry) => {
      const key = entry.method.proteinCook.group || 'other-protein';
      if (!groups.has(key)) groups.set(key, { key, entries: [], sequence:Number(entry.method.proteinCook.sequence || 999) });
      groups.get(key).entries.push(entry);
      groups.get(key).sequence = Math.min(groups.get(key).sequence, Number(entry.method.proteinCook.sequence || 999));
      return groups;
    }, new Map()).values()).sort((left, right) => left.sequence - right.sequence);
    const starchLine = selected.filter(entry => hasText(entry, /rice|pasta|mac|potato|corn|bread|tortilla/i));

    const prepStages = [
      prepStage('reconcile', {
        title: '1. Reconcile, print, label, and stage',
        reason: 'Lock the reviewed customer counts and label empty containers before food is opened.',
        dishes: names(selected),
        tasks: ['Confirm included orders and manual corrections.', 'Print only the customer labels shown in the label plan; exempt internal/family orders remain unlabeled.', 'Count the exact customer containers, apply labels to the empty containers without blocking the sealing edge, then stack them by dish and tier outside the raw zone.', 'Count clean empty packaging spares for damage only, along with dessert cups, lids, sauce cups, and bags.', 'Stage labeled raw-protein bags or bowls, scales, knives, and sanitation supplies before opening meat. Keep empty customer containers covered outside the raw zone.'],
      }),
      prepStage('proteins', {
        title: '2. Fabricate, season, split, and marinate proteins',
        reason: 'Complete all dirty raw-protein work in one controlled block, then reset the kitchen before clean prep.',
        dishes: names(proteins),
        tasks: proteins.length ? ['Keep proteins at 41 F or below and pull only what can be cut and returned to refrigeration promptly.', 'Use the recipe quantity for each dish. Keep the displayed pooled reserve plain and refrigerated; do not turn it into automatic extra meals.', 'Trim and cut all proteins first. Weigh and place every dish allocation into its labeled bag or bowl before seasoning.', 'Pull only the displayed compatible boneless chicken into a shared master family. Chicken Biryani and every other non-compatible flavor profile remain separate.', 'Apply each complete scaled family seasoning once, record every actual seasoning weight, then divide the seasoned chicken into the exact labeled dish bags or bowls shown in the table.', 'Complete every displayed formed-protein or raw-portion batch. Keep all raw kits separate from cooked food and ready-to-eat components.', 'Add measured dish-specific wet finishes only after shared chicken is divided. Cover, identify, date, and refrigerate every batch.', 'Complete the raw-zone sanitation reset: discard contaminated disposables, wash and rinse tools and surfaces, sanitize the complete raw zone, and change gloves/apron before produce begins.'] : ['No overnight protein preparation is required.', 'Complete and document the raw-zone sanitation reset before beginning produce.'],
      }),
      prepStage('produce', {
        title: '3. Wash, cut, and bulk-store all produce',
        reason: 'After the raw-zone reset, use one clean produce session and divide only when the cut or storage treatment differs.',
        dishes: names(vegetables),
        tasks: vegetables.length ? ['Wash produce under the commercial-kitchen procedure, then cut matching cooked-component forms together in bulk.', 'Use one covered bulk bowl per vegetable. Split a vegetable only when its physical form truly differs, such as diced onion versus a cold-garnish cut.', 'Do not create separate vegetable bags for every dish. On cook day, weigh each recipe amount from the matching bulk bowl.', 'Keep ready-to-eat lettuce, tomato, cucumber, and apple whole after washing and drying; cut them tomorrow to protect texture and prevent excess moisture.', 'Store ready-to-eat produce separately from vegetables that will be cooked. Label, date, cover, and refrigerate every bulk container.', 'Pre-weigh dry seasoning kits and label every prep container.'] : ['Only dry seasoning kits and general mise en place are required.'],
      }),
      prepStage('sauces', {
        title: '4. Make sauces, toppings, and cold sides',
        reason: 'Complete shared sauces and cold components now so cook day is not interrupted by measuring or blending.',
        dishes: names(sauces),
        tasks: sauces.length ? ['Make shared customer sauces in full batches.', 'Complete dish-specific components such as street-corn finish, slider sauce, pancake compote/topping, garnishes, and cold sides.', 'Reserve measured kitchen-use sauce before filling customer cups.', 'Fill, count, label, date, and refrigerate all side cups and component containers.'] : ['No separate sauce cups are required.'],
      }),
      prepStage('desserts', {
        title: '5. Build desserts and start the chill',
        reason: 'The station is clean again, and finished desserts now receive the longest remaining uninterrupted chill.',
        dishes: names(desserts),
        tasks: desserts.length ? ['Complete each scaled dessert recipe, including crusts, fillings, toppings, and coatings.', 'Seal, label, date, and refrigerate every ordered dessert.', 'Record the finished cup count and leftover filling or topping yield before moving on.'] : ['No desserts are in this production run.'],
      }),
      prepStage('mixes', {
        title: '6. Make dough and build clean assembly kits',
        reason: 'Complete the approved overnight dough and pre-measure every clean cook-day dependency.',
        dishes: names(mixes),
        tasks: mixes.length ? ['Prepare every displayed recipe-specific dry, wet, vegetable, and clean assembly kit without combining components early when texture or food quality would suffer.', 'Keep raw-protein kits physically separate from sauces, cooked sides, desserts, and every ready-to-eat component.', 'Label every kit with its dish and intended cook step. Refrigerate all perishable mixtures immediately.'] : ['No separate clean assembly kit is required.'],
      }),
      prepStage('rice', {
        title: '7. Cook eggs, sides, rice, pasta, and potatoes',
        reason: 'Every non-protein cooked component moves to Prep Day so tomorrow can focus on the all-protein block and final assembly.',
        dishes: names(starches),
        tasks: starches.length ? ['Cook every egg and egg-patty batch shown in the Prep Day cards; record finished counts and yields.', 'Cook the full displayed dry-rice total as one shared batch. Record the cooked yield first, then divide the cooked rice into the labeled destination pans shown in the rice card.', 'Cook fresh potatoes only for roasted, baked, chopped, or hash-style components. Prepare every mashed-potato component from the displayed packaged instant-potato formula; never divert fresh potatoes into mash.', 'Cook protein pasta about 1 minute short of the final desired texture; keep it separate from tomorrow\'s protein until assembly.', 'Complete the fully mixed Streetcorn component, broccoli, peas-and-carrots finish, and every other displayed non-protein side.', 'Cool from 135 F to 70 F within 2 hours and to 41 F within 6 hours total using shallow pans or the kitchen-approved method.', 'Record start temperature/time, 70 F checkpoint, 41 F checkpoint, and total cooked yield before covering. If cooling capacity is insufficient, stop and move the affected batch to tomorrow rather than cooling unsafely.'] : ['No non-protein cook-ahead batch is required.'],
      }),
      prepStage('labels', {
        title: '8. Reconcile every kit and close prep day',
        reason: 'Friday should begin with measured kits, labeled containers, and a clean, counted line.',
        dishes: names(selected),
        tasks: ['Confirm the labeled empty-container stacks still match the final customer count.', 'Do not prepare or label automatic extra meals; the raw-protein reserve is pooled across production.', 'Stage each dish kit with its recipe card.', 'Reconcile completed prep against the packet and record shortages before leaving.'],
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
          completedPrep.has('rice') ? 'eggs/sides/starches' : '',
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
        title: '2. Preheat and stage the protein block',
        reason: 'Equipment may preheat now, but no assembled dish begins before every protein is released.',
        dishes: names(oven),
        tasks: [
          `Preheat the required oven, skillet, grill, and sheet-pan equipment. Planned oven demand: ${ovenTimeline}`,
          'Stage one sanitized active protein station and one clean receiving/cooling station. Keep all labeled protein bowls refrigerated except the next batch.',
          'Do not assemble any finished meal during this stage. Keep every released protein in its labeled destination pan until the raw station is closed.',
        ],
        release: 'Protein equipment is hot, labeled destination pans are ready, and only the first scheduled protein is out of refrigeration.',
      },
      {
        title: '3. Cook every protein in one continuous block',
        reason: 'Finish all chicken, ground and formed beef, steak, and seafood before breakfast finishing, sides, or assembly can begin.',
        dishes: names(proteinCookEntries),
        tasks: proteinCookEntries.length ? [
          `Run the protein families in this order: ${proteinCookGroups.map(group => `${group.key}: ${names(group.entries).join(', ')}`).join(' | ')}.`,
          'Cook one labeled recipe batch, or one numbered equipment-capacity sub-batch, at a time. A shared seasoning base never makes different finished recipes interchangeable.',
          'For every batch, record the actual raw weight, endpoint, cooked yield, piece count where applicable, destination pan, and any reserve used before pulling the next protein.',
          'Keep the pooled raw reserve refrigerated and plain. Cook it only for a measured shortage, then document the exact dish allocation.',
          'Move each released protein to its own labeled holding/cooling pan. Do not begin dough filling, sandwiches, pasta, bowls, or plated meal assembly yet.',
        ] : ['No meat, poultry, or seafood cooking is required.'],
        release: 'Every planned protein is cooked to its endpoint, weighed, counted, reconciled to the required portions, and staged in its labeled pan.',
      },
      {
        title: '4. Close the raw-protein station',
        reason: 'The kitchen does not move into clean component work until raw protein is gone and the station has a documented reset.',
        dishes: names(proteinCookEntries),
        tasks: proteinCookEntries.length ? [
          'Confirm every protein line on the control board has an endpoint, cooked yield, destination pan, and released status.',
          'Return approved unused raw reserve to labeled cold inventory or record discard/waste; no unlabeled raw bowl remains on the line.',
          'Remove raw packaging and contaminated disposables. Wash, rinse, and sanitize the protein station, tools, handles, probes, sinks, and touched surfaces.',
          'Change gloves and apron, place raw-only tools out of service, and mark the raw-protein station CLOSED before clean work begins.',
        ] : ['Confirm no raw protein was opened, then release the clean station.'],
        release: 'All raw protein is accounted for and refrigerated, cooked, or discarded; the station reset is complete and marked CLOSED.',
      },
      {
        title: '5. Breakfast combination line',
        reason: 'With the raw-protein station closed, combine released breakfast proteins with the Prep Day eggs and sides.',
        dishes: names(breakfasts),
        tasks: breakfasts.length ? [
          'Verify every Prep Day breakfast egg, custard, French Toast, potato, rice, pasta, vegetable, sauce, and dessert batch is complete, counted, and cold-held correctly.',
          'Reheat prepared components only as needed; do not cook duplicate egg or potato batches.',
          'Combine each prepared breakfast component only with its released protein and exact dish kit.',
          'Record the final assembled count before releasing breakfast meals to cooling.',
        ] : ['No breakfast production is required.'],
        release: 'All breakfast components are counted, identified, cooled/held correctly, and ready for final build.',
      },
      {
        title: '6. Release Prep Day sides and starches',
        reason: 'Tomorrow uses the recorded Prep Day components instead of repeating non-protein cooking.',
        dishes: names(starchLine),
        tasks: starchLine.length ? [
          completedPrep.has('rice') ? 'Eggs, rice, pasta, potatoes, corn, broccoli, and other sides are already complete: verify recorded yields and cold holding; do not cook duplicate batches.' : 'Prep Day cook-ahead is not marked complete. Stop and reconcile every egg, rice, pasta, potato, vegetable, and sauce batch before assembly.',
          'Reheat only the labeled component amount needed for the current dish and tier.',
          'Keep dish-specific finishes attached to their labeled Prep Day pans.',
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

    return { prepStages, cookStages, parallelBlocks, lanes, proteinCookGroups, selected: names(selected) };
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
    packoutPlan,
    aggregateCounts,
    countsFromMap,
    bufferSettings,
    productionBreakdown,
    productionPlan,
    ingredientTotals,
    operationalIngredientTotals,
    dualAmount,
    productionSummary,
    labelPlan,
    componentPlan,
    weeklySaucePlan,
    labelEligibleOrders,
    dishPackAllocation,
    buildWorkflow,
  };
});
