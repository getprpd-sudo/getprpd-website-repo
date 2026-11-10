(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.PRPD_COOK_DAY = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  function normalize(value) {
    return String(value || '').trim().replace(/\s+/g, ' ').toLowerCase();
  }

  // Ingredient identity is also a nutrition specification. Draining a 90/10
  // product does not establish equivalence to raw 96/4 beef.
  const ingredientAliases = {};

  function canonicalIngredientKey(key) {
    return ingredientAliases[key]?.key || key;
  }

  function canonicalIngredient(ingredient) {
    const alias = ingredientAliases[ingredient?.key];
    return alias ? { ...ingredient, ...alias } : ingredient;
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
    const dishes = configuredDishes(config);
    const byId = new Map(dishes.map(dish => [dish.id, dish]));
    return dishes.reduce((map, dish) => {
      if (Array.isArray(dish.variants) && dish.variants.length) {
        for (const variant of dish.variants) {
          map[normalize(`${dish.name} (${variant.label})`)] = { bundle: dish, variant, byId };
        }
        return map;
      }
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
    const sauces = [];
    for (const rawLine of lines) {
      const line = rawLine.trim();
      const sauceLine = line.match(/^(\d+)x\s+Sauce cup:\s+(.+?)\s+-\s+selected$/i);
      if (sauceLine) {
        const sauce = (config.sauceProgram?.choices || []).find(choice => normalize(choice.name) === normalize(sauceLine[2]));
        if (sauce) sauces.push({id:sauce.id,name:sauce.name,qty:Number(sauceLine[1])});
        else warnings.push(`Unknown selected sauce: ${sauceLine[2]}`);
        continue;
      }
      if (/^Extra sauce cups\b/i.test(line)) continue;
      if (!line || /^(?:delivery|pickup|(?:partner\s+)?discount)\b/i.test(line) || /^\$?\d+(?:\.\d{2})?$/.test(line)) continue;
      const match = line.match(/^(\d+)x\s+(.+?)(?:\s+\((Lean|Bulk)\))?\s*(?:[-\u2013\u2014]\s*\$?[\d.]+)?$/i);
      if (!match) {
        warnings.push(`Could not parse item line: ${line}`);
        continue;
      }
      const qty = Number(match[1]);
      const name = match[2].trim();
      const matchEntry = dishes[normalize(name)];
      if (!matchEntry) {
        warnings.push(`Unknown menu item: ${name}`);
        continue;
      }
      if (matchEntry.bundle) {
        const components = Array.isArray(matchEntry.variant.components) ? matchEntry.variant.components : [];
        if (!components.length) {
          warnings.push(`Weekly exclusive has no production split: ${name}`);
          continue;
        }
        for (const component of components) {
          const componentDish = matchEntry.byId.get(component.id);
          const componentQty = Math.max(0, Math.floor(Number(component.qty) || 0));
          if (!componentDish || !componentQty) {
            warnings.push(`Weekly exclusive contains an unknown component: ${component.id || 'missing item'}`);
            continue;
          }
          const componentTier = componentDish.category === 'dessert' || componentDish.category === 'addon'
            ? 'single'
            : component.tier === 'bulk' ? 'bulk' : 'lean';
          items.push({
            id: componentDish.id,
            name: componentDish.name,
            tier: componentTier,
            qty: qty * componentQty,
            sourceBundle: matchEntry.bundle.name,
          });
        }
        continue;
      }
      const dish = matchEntry;
      const tier = dish.category === 'dessert' || dish.category === 'addon'
        ? 'single'
        : normalize(match[3]) === 'bulk' ? 'bulk' : 'lean';
      items.push({ id: dish.id, name: dish.name, tier, qty, packageType: dish.packageType || '' });
    }
    return { items, warnings, sauces };
  }

  function fulfillmentFromItems(itemsText) {
    const lines = String(itemsText || '').split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    const pickup = lines.find(line => /^pickup\b/i.test(line));
    if (pickup) return 'Pickup';
    const delivery = lines.find(line => /^delivery\b/i.test(line));
    if (!delivery) return '';
    const tier = delivery.match(/\(([^)]+)\)/);
    return tier ? `Delivery — ${tier[1]}` : 'Delivery';
  }

  function orderStatusFromNotes(notes) {
    const value = String(notes || '').trim();
    if (/^\[(?:HOLD|ON HOLD)\]/i.test(value)) return 'hold';
    if (/^\[(?:CANCELLED|CANCELED)\]/i.test(value)) return 'cancelled';
    return 'active';
  }

  function arrayRowsToOrders(rows, config) {
    if (!Array.isArray(rows) || !rows.length) throw new Error('The file does not contain an Orders header row.');
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
    // The production Orders sheet uses "Delivery Address". Keep the shorter
    // legacy headers too, but never silently drop a valid street address.
    const addressIndex = indexOf('address', 'street address', 'delivery address');
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
        fulfillment: fulfillmentFromItems(row[itemsIndex]),
        total: row[totalIndex] || '',
        notes,
        items: parsed.items,
        sauces: parsed.sauces,
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

  function confirmedOrders(orders) {
    return includedOrders(orders).filter(order => order.planningOnly !== true &&
      order.recurringStatus !== 'planning' && order.confirmationStatus !== 'unconfirmed');
  }

  function packoutPlan(orders) {
    return confirmedOrders(orders).map(order => {
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
        fulfillment: order.fulfillment || '',
        notes: order.notes || '',
        orderId: order.orderId || '',
        totalItems: items.reduce((sum, item) => sum + item.qty, 0),
        sauces: order.sauces?.selections || order.sauces || [],
        items,
      };
    });
  }

  function customerNotePlan(orders, data, methods) {
    return confirmedOrders(orders).flatMap(order => {
      const original = String(order.notes || '').trim();
      if (!original || /^Paid:/i.test(original) || /^Owner confirmed\b/i.test(original)
          || /^Owner-directed.*\bamount pending\b/i.test(original)) return [];
      const note = original.replace(/^Prepaid\.\s*Apply verified.*?no new amount due\.\s*/i, '').trim();
      if (!note) return [];
      const noPickles = /\b(?:no|without)\b[^.!?]{0,80}\bpickles?\b/i.test(note);
      const noRawTomato = /\b(?:no|without)\b[^.!?]{0,80}\braw tomatoes?\b/i.test(note);
      const items = (order.items || []).flatMap(item => {
        const rules = methods?.meals?.[item.id]?.customerOmissionRules || {};
        const selected = [noPickles && rules.pickles, noRawTomato && rules.rawTomato].filter(Boolean);
        if (!selected.length) return [];
        const qty = Math.max(0, Math.floor(Number(item.qty) || 0));
        const actions = selected.map(rule => {
          const source = data?.meals?.[item.id]?.tiers?.[item.tier]?.ingredients?.find(ingredient => ingredient.key === rule.ingredientKey);
          return { text: rule.action, ingredientKey: rule.ingredientKey || '', excludedGrams: source ? Number(source.amount || 0) * qty : 0 };
        });
        return [{ id:item.id, tier:item.tier, name:item.name, qty, actions }];
      });
      return [{ key:orderKey(order), customer:order.customer || 'Unknown', note, items }];
    });
  }

  function aggregateCounts(orders) {
    const counts = {};
    for (const order of orders) {
      for (const item of order.items || []) {
        const key = `${item.id}:${item.tier}`;
        if (!counts[key]) counts[key] = { id: item.id, name: item.name, tier: item.tier, packageType: item.packageType || '', qty: 0 };
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
      return dish && Number(qty) > 0 ? [{ id, name: dish.name, tier, packageType: dish.packageType || '', qty: Number(qty) }] : [];
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
      for (const sourceIngredient of build.ingredients) {
        const ingredient = canonicalIngredient(sourceIngredient);
        const key = `${ingredient.key}:${ingredient.unit}`;
        if (!totals[key]) totals[key] = { ...ingredient, baseAmount: 0, bufferedAmount: 0 };
        const planningBuffer = proteinYieldRules[ingredient.key]
          ? 1 + dishProteinReservePct / 100
          : ingredient.key === 'rice_dry'
            ? 1 + settings.riceBufferPct / 100
            : 1;
        totals[key].baseAmount += ingredient.amount * count.qty;
        totals[key].bufferedAmount += ingredient.amount * bufferedServingCount * planningBuffer;
        if (Number(ingredient.minimumPieces) > 0) {
          // A counted serving floor is independent of estimated raw mass and
          // the separate raw-mass reserve. Never infer piece size from grams.
          totals[key].minimumPieceCount = (Number(totals[key].minimumPieceCount) || 0)
            + Number(ingredient.minimumPieces) * bufferedServingCount;
        }
      }
    }
    return {
      totals: Object.values(totals).map(item => ({
        ...item,
        baseAmount: rounded(item.baseAmount, 4),
        bufferedAmount: rounded(item.bufferedAmount, 4),
      })),
      warnings: Array.from(new Set(warnings)),
      buffer: settings,
    };
  }

  function resolvedProductionExtras(counts, productionData, methods) {
    const extras = [...(methods?.productionExtras || [])].filter(extra =>
      (!extra.optional || extra.enabled === true) && (counts || []).some(count =>
        count.id === extra.dishId && (!extra.tier || count.tier === extra.tier) && Number(count.qty) > 0));
    const grouped = (counts || []).reduce((map, count) => {
      const qty = Math.max(0, Number(count.qty) || 0);
      if (!qty) return map;
      const key = `${count.id}:${count.tier}`;
      const current = map.get(key) || { id: count.id, tier: count.tier, name: count.name, qty: 0 };
      current.qty += qty;
      map.set(key, current);
      return map;
    }, new Map());

    for (const count of grouped.values()) {
      const policy = methods?.meals?.[count.id]?.panBatch;
      const servingsPerPan = Math.max(0, Number(policy?.servingsPerPan) || 0);
      if (!servingsPerPan) continue;
      const panCount = Math.max(1, Math.ceil(count.qty / servingsPerPan));
      const totalServings = panCount * servingsPerPan;
      const ownerServings = totalServings - count.qty;
      if (ownerServings <= 0) continue;
      const build = productionData?.meals?.[count.id]?.tiers?.[count.tier];
      if (!build) continue;
      const dimensions = policy.pan || 'controlled pan';
      extras.push({
        id: `whole-pan:${count.id}:${count.tier}`,
        dishId: count.id,
        tier: count.tier,
        label: `${count.name} whole-pan completion`,
        note: `Bake ${panCount} complete ${dimensions} ${panCount === 1 ? 'pan' : 'pans'} (${totalServings} equal portions). Pack ${count.qty} customer portions first; retain ${ownerServings} unlabeled owner ${ownerServings === 1 ? 'portion' : 'portions'}.`,
        panPlan: `${servingsPerPan} equal portions per ${dimensions} pan. Never shrink the recipe below one complete pan; when the live count exceeds ${servingsPerPan}, add another complete pan.`,
        panCount,
        totalServings,
        customerServings: count.qty,
        ownerServings,
        ingredients: (build.ingredients || []).map(ingredient => ({
          ...ingredient,
          amount: (Number(ingredient.amount) || 0) * ownerServings,
          note: `Whole-pan completion for ${ownerServings} unlabeled owner ${ownerServings === 1 ? 'portion' : 'portions'}.`,
        })),
      });
    }
    return extras;
  }

  // Production grouping is presentation metadata, never an ingredient alias.
  // In particular, 96/4 and 90/10 share a work section but keep distinct weights,
  // purchase rows, nutrition and labels.
  function proteinProductionGroup(ingredient) {
    const key = ingredient.key || '';
    const declared = ingredient.productionGroup;
    const group = declared || (/chicken|leg_quarter|turkey/.test(key) ? 'poultry'
      : /(?:^beef_\d+_raw$|ground_beef)/.test(key) ? 'ground-beef'
        : /beef|steak|ny_strip/.test(key) ? 'steak'
          : /tilapia|salmon|shrimp|fish|seafood/.test(key) ? 'seafood' : 'other');
    const definitions = {
      poultry: { name:'Chicken', category:'poultry', rank:10 },
      'ground-beef': { name:'Ground beef', category:'beef', rank:20 },
      steak: { name:'Steak', category:'beef', rank:30 },
      seafood: { name:'Fish & seafood', category:'seafood', rank:40 },
      other: { name:'Other proteins', category:'other', rank:50 },
    };
    return { key:group, ...(definitions[group] || definitions.other) };
  }

  function sideCupDefinitions(method = {}) {
    if (Array.isArray(method.sideCupComponents)) return method.sideCupComponents;
    const count = Number(method.sideCups) || 0;
    if (!count) return [];
    if (count === 1 && method.sideCup?.name) return [{ ...method.sideCup, cupsPerMeal:1 }];
    // Retain packaging arithmetic for archived recipes without inventing fills.
    return [{ name:'Unspecified side cups', cupsPerMeal:count, needsDefinition:true }];
  }

  function sideCupPlan(counts, methods) {
    const grouped = new Map();
    for (const count of counts || []) {
      const qty = Number(count.total ?? count.qty) || 0;
      if (qty <= 0) continue;
      for (const definition of sideCupDefinitions(methods?.meals?.[count.id])) {
        const grams = typeof definition.gramsPerMeal === 'object'
          ? definition.gramsPerMeal[count.tier] : definition.gramsPerMeal;
        const key = `${definition.batchGroup || definition.name}:${grams ?? 'unmeasured'}:${definition.weightBasis || 'finished'}`;
        const group = grouped.get(key) || { ...definition, key, gramsPerMeal:grams, cups:0, destinations:[] };
        const cups = qty * Number(definition.cupsPerMeal || 1);
        group.cups += cups;
        group.destinations.push({id:count.id,name:count.name,tier:count.tier,qty,cups});
        grouped.set(key,group);
      }
    }
    return [...grouped.values()].sort((a,b)=>a.name.localeCompare(b.name));
  }

  function extraPackagingRequirements(counts, productionData, methods) {
    return [
      ...(methods?.extraPackaging || []).filter(item=>!item.productionExtra),
      ...resolvedProductionExtras(counts,productionData,methods).flatMap(extra=>extra.packaging || []),
    ];
  }

  function groceryAdjustmentPlan(counts, productionData, methods) {
    return (methods?.groceryAdjustments || []).flatMap(adjustment=>{
      if (!adjustment.dishId) return [{...adjustment}];
      const selected=(counts || []).filter(count=>count.id===adjustment.dishId && Number(count.qty)>0);
      if (!selected.length) return [];
      const sourceAmount=adjustment.scaleToIngredient ? selected.reduce((sum,count)=>sum+count.qty*
        (productionData.meals[count.id]?.tiers?.[count.tier]?.ingredients || []).filter(item=>item.key===adjustment.scaleToIngredient.key)
          .reduce((n,item)=>n+Number(item.amount),0),0)+resolvedProductionExtras(counts,productionData,methods)
            .filter(extra=>extra.dishId===adjustment.dishId).flatMap(extra=>extra.ingredients || [])
            .filter(item=>item.key===adjustment.scaleToIngredient.key).reduce((sum,item)=>sum+Number(item.amount),0) : 0;
      const factor=adjustment.scaleToIngredient ? sourceAmount/adjustment.scaleToIngredient.referenceAmount
        : adjustment.referenceServings ? selected.reduce((sum,count)=>sum+count.qty,0)/adjustment.referenceServings : 1;
      return [{...adjustment,delta:Number(adjustment.delta)*factor}];
    });
  }

  function operationalIngredientTotals(counts, productionData, methods, buffer) {
    const result = ingredientTotals(counts, productionData, buffer);
    const totals = new Map(result.totals.map(item => [`${item.key}:${item.unit}`, { ...item }]));
    const countedFixedFormula = new Set();

    for (const count of productionPlan(counts)) {
      const build = productionData.meals?.[count.id]?.tiers?.[count.tier];
      const method = methods?.meals?.[count.id] || {};
      const overrides = method.groceryOverrides || {};
      if (!build) continue;

      const modeledByKey = (build.ingredients || []).reduce((map, sourceItem) => {
        const item = canonicalIngredient(sourceItem);
        const key = `${item.key}:${item.unit || 'g'}`;
        const current = map.get(key) || { ...item, amount: 0 };
        current.amount += Number(item.amount) || 0;
        map.set(key, current);
        return map;
      }, new Map());

      for (const [sourceIngredientKey, override] of Object.entries(overrides)) {
        const ingredientKey = canonicalIngredientKey(sourceIngredientKey);
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
        if (override.name) current.name = override.name;
        if (override.station) current.station = override.station;
        if (override.note) current.note = override.note;
        if (override.confidence) current.confidence = override.confidence;
        current.baseAmount += delta;
        current.bufferedAmount += delta;
        if (override.applyRawProteinReserve) {
          const reservePct = Object.hasOwn(result.buffer.rawProteinReserveByDish || {}, count.id)
            ? Number(result.buffer.rawProteinReserveByDish[count.id]) || 0
            : Number(result.buffer.rawProteinBufferPct) || 0;
          current.bufferedAmount += actualPerServing * count.qty * reservePct / 100;
        }
        totals.set(mapKey, current);
      }

      for (const prep of method.prepBatches || []) {
        for (const formula of prep.formulaIngredients || []) {
          if (overrides[formula.key] || formula.includeInGrocery === false) continue;
          const unit = formula.unit || 'g';
          const mapKey = `${formula.key}:${unit}`;
          const perServing = Number(formula[count.tier] ?? formula.perServing ?? 0) || 0;
          const extraServings = resolvedProductionExtras(counts, productionData, methods)
            .filter(extra => extra.dishId === count.id && (extra.tier || 'lean') === count.tier)
            .reduce((sum, extra) => sum + Number(extra.ownerServings || 0), 0);
          const fixedKey = `${count.id}:${prep.name}:${mapKey}`;
          const fixedAmount = countedFixedFormula.has(fixedKey) ? 0 : (Number(formula.fixedAmount) || 0);
          countedFixedFormula.add(fixedKey);
          const amount = perServing * (count.qty + extraServings) + fixedAmount;
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

        const pieceTarget = prep.pieceTargets?.[count.tier];
        const customerPieces = count.qty * (Number(pieceTarget?.piecesPerServing) || 0);
        const pieceReservePct = Number(prep.reservePct ?? method.piecePlan?.reservePct ?? 0) || 0;
        const reservePieces = customerPieces ? Math.ceil(customerPieces * pieceReservePct / 100) : 0;
        for (const formula of prep.reserveFormulaIngredients || []) {
          if (formula.includeInGrocery === false) continue;
          const unit = formula.unit || 'g';
          const mapKey = `${formula.key}:${unit}`;
          const perPiece = Number(formula[count.tier] ?? formula.perPiece ?? 0) || 0;
          const amount = perPiece * reservePieces;
          if (amount <= 0) continue;
          const current = totals.get(mapKey) || {
            key: formula.key,
            name: formula.name || formula.key,
            unit,
            station: formula.station || 'Other',
            note: formula.note || 'Shaped-piece production reserve.',
            confidence: formula.confidence || 'planning',
            baseAmount: 0,
            bufferedAmount: 0,
            measure: formula.measure,
          };
          current.bufferedAmount += amount;
          totals.set(mapKey, current);
        }
      }
    }

    const activeDishIds = new Set((counts || []).filter(count => Number(count.qty) > 0).map(count => count.id));
    for (const extra of resolvedProductionExtras(counts, productionData, methods)) {
      if (!activeDishIds.has(extra.dishId)) continue;
      const extraMethod = methods?.meals?.[extra.dishId] || {};
      const groceryOverrides = extraMethod.groceryOverrides || {};
      const tier = extra.tier || 'lean';
      for (const sourceIngredient of extra.ingredients || []) {
        const ingredient = canonicalIngredient(sourceIngredient);
        const override = groceryOverrides[ingredient.key];
        const unit = ingredient.unit || 'g';
        const mapKey = `${ingredient.key}:${unit}`;
        const servings = Math.max(0, Number(extra.ownerServings) || 0);
        const overridePerServing = Number(override?.[tier] ?? override?.perServing);
        const amount = Number.isFinite(overridePerServing) && servings > 0
          ? overridePerServing * servings
          : Number(ingredient.amount) || 0;
        if (amount <= 0) continue;
        const current = totals.get(mapKey) || {
          key: ingredient.key,
          name: override?.name || ingredient.name || ingredient.key,
          unit,
          station: override?.station || ingredient.station || 'Other',
          note: override?.note || ingredient.note || 'Explicit non-customer production quantity.',
          confidence: override?.confidence || ingredient.confidence || 'planning',
          baseAmount: 0,
          bufferedAmount: 0,
          measure: ingredient.measure,
        };
        if (override?.name) current.name = override.name;
        if (override?.station) current.station = override.station;
        if (override?.note) current.note = override.note;
        if (override?.confidence) current.confidence = override.confidence;
        current.baseAmount += amount;
        const reservePct = override?.applyRawProteinReserve
          ? (Object.hasOwn(result.buffer.rawProteinReserveByDish || {}, extra.dishId)
              ? Number(result.buffer.rawProteinReserveByDish[extra.dishId]) || 0
              : Number(result.buffer.rawProteinBufferPct) || 0)
          : 0;
        current.bufferedAmount += amount * (1 + reservePct / 100);
        totals.set(mapKey, current);
      }
    }

    for (const family of methods?.sharedProteinSeasoning || []) {
      const familyProteinKey = canonicalIngredientKey(family.proteinKey);
      let totalRaw = 0;
      const allocations = [];
      for (const count of productionPlan(counts)) {
        if (!family.dishIds?.includes(count.id)) continue;
        const ingredient = productionData.meals?.[count.id]?.tiers?.[count.tier]?.ingredients
          ?.map(canonicalIngredient)
          .find(item => item.key === familyProteinKey);
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
        if (!family.baseIncludedInRecipe) addSeasoning(item, totalRaw, `${family.name} shared base.`);
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
          baseAmount: rounded(item.baseAmount, 4),
          bufferedAmount: rounded(item.bufferedAmount, 4),
        })),
    };
  }

  function rounded(value, digits = 2) {
    const factor = 10 ** digits;
    return Math.round((Number(value) || 0) * factor) / factor;
  }

  const spoonFractions = [[0.25,'¼'],[0.5,'½'],[0.75,'¾']];

  function mixedSpoonNumber(value) {
    const practical = Math.max(0.25, Math.round((Number(value) || 0) * 4) / 4);
    const whole = Math.floor(practical);
    const part = practical - whole;
    const fraction = spoonFractions.find(([number]) => Math.abs(number - part) < 0.01)?.[1] || '';
    return `${whole || ''}${whole && fraction ? ' ' : ''}${fraction}` || '¼';
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
      if (tsp >= 3) {
        const tablespoons = Math.floor(tsp / 3);
        const remainder = tsp - tablespoons * 3;
        return `${mixedSpoonNumber(tablespoons)} tbsp${remainder >= 0.25 ? ` + ${mixedSpoonNumber(remainder)} tsp` : ''}`;
      }
      return `${mixedSpoonNumber(tsp)} tsp`;
    }
    if (measure.type === 'packet' && measure.gramsPerPacket) {
      const packets = amount / measure.gramsPerPacket;
      return `${mixedSpoonNumber(packets)} ${packets > 1 ? 'packets' : 'packet'}`;
    }
    if (measure.type === 'piece' && measure.gramsPerPiece) {
      const count = Math.max(1, Math.round(amount / measure.gramsPerPiece));
      const name = measure.pieceName || 'piece';
      const plural = measure.pieceNamePlural || `${name}s`;
      return `${count} ${count === 1 ? name : plural}`;
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
    chicken_thigh_raw: { factor: 430 / 625, label: 'measured boneless-thigh cooked yield, October 7 2026 test (430 g cooked from 625 g raw, 68.8%)' },
    chicken_wings_raw: { factor: 0.75, label: 'estimated cooked bone-in weight; count pieces and record edible yield separately' },
    chicken_breast_raw: { factor: 0.75, label: 'estimated boneless cooked yield' },
    chicken_mince_raw: { factor: 0.75, label: 'estimated cooked yield' },
    beef_90_raw: { factor: 0.75, label: 'estimated cooked yield after draining' },
    beef_96_raw: { factor: 0.75, label: 'estimated cooked yield after thorough draining' },
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
      const batchMap = new Map(ingredientTotals(group.counts, productionData, buffer).totals
        .map(item => [`${item.key}:${item.unit}`, { ...item }]));
      const productionExtras = resolvedProductionExtras(counts, productionData, methods).filter(extra => extra.dishId === group.id);
      for (const extra of productionExtras) {
        for (const sourceIngredient of extra.ingredients || []) {
          const ingredient = canonicalIngredient(sourceIngredient);
          const unit = ingredient.unit || 'g';
          const mapKey = `${ingredient.key}:${unit}`;
          const amount = Number(ingredient.amount) || 0;
          if (amount <= 0) continue;
          const current = batchMap.get(mapKey) || {
            key: ingredient.key,
            name: ingredient.name || ingredient.key,
            unit,
            station: ingredient.station || 'Other',
            note: ingredient.note || 'Explicit non-customer production quantity.',
            confidence: ingredient.confidence || 'planning',
            baseAmount: 0,
            bufferedAmount: 0,
            measure: ingredient.measure,
          };
          current.baseAmount += amount;
          current.bufferedAmount += amount;
          batchMap.set(mapKey, current);
        }
      }
      const batch = Array.from(batchMap.values()).map(item => ({
        ...item,
        baseAmount: rounded(item.baseAmount, 4),
        bufferedAmount: rounded(item.bufferedAmount, 4),
      }));
      const byKey = Object.fromEntries(batch.map(item => [item.key, item]));
      const tierText = group.counts.map(count => count.tier).join(' + ');

      for (const item of batch) {
        const fallbackRule = proteinYieldRules[item.key];
        const recipeRule = methods?.meals?.[group.id]?.proteinCook?.yieldByProteinKey?.[item.key];
        const rule = fallbackRule && Number(recipeRule?.factor)>0 && Number(recipeRule.factor)<=1
          ? recipeRule : fallbackRule;
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
            yieldFactor: Number(rule.factor),
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
        if (Array.isArray(prep.activeTiers) && prep.activeTiers.length && !group.counts.some(count => prep.activeTiers.includes(count.tier))) continue;
        const isSharedProteinPrep = prep.type === 'marinade' && (methods?.sharedProteinSeasoning || []).some(family =>
          family.dishIds?.includes(group.id) && prep.ingredientKeys?.includes(family.proteinKey)
        );
        if (isSharedProteinPrep) continue;
        const ingredientKeys = Array.isArray(prep.ingredientKeys) ? prep.ingredientKeys : [];
        let ingredients = prep.includeAllRecipeIngredients
          ? Object.values(byKey)
          : ingredientKeys.map(key => byKey[canonicalIngredientKey(key)]).filter(Boolean);
        // Recipe components carry their measured share of common ingredients.
        // Yogurt/garlic in a cold sauce must not be counted again in a marinade.
        const customerComponentAmount = (key, refs) => group.counts.reduce((sum,count) => sum + count.qty *
          (productionData.meals[group.id].tiers[count.tier].ingredients || []).filter(i=>canonicalIngredientKey(i.key)===key)
            .reduce((n,i)=>n+refs.reduce((s,ref)=>s+Number(i.allocations?.[ref]||0),0),0),0);
        const componentAmount = (key, refs) => customerComponentAmount(key, refs) + productionExtras.reduce((sum,extra) => sum +
          (extra.ingredients || []).filter(i=>canonicalIngredientKey(i.key)===key)
            .reduce((n,i)=>n+refs.reduce((s,ref)=>s+Number(i.allocations?.[ref]||0),0),0),0);
        if (prep.componentRef || prep.excludeComponentRefs?.length) ingredients=ingredients.map(item=>{
          const amount=prep.componentRef ? componentAmount(item.key,[prep.componentRef])
            : item.baseAmount-componentAmount(item.key,prep.excludeComponentRefs);
          return {...item,baseAmount:rounded(Math.max(0,amount),4),bufferedAmount:rounded(Math.max(0,amount),4)};
        }).filter(i=>i.baseAmount>0);
        // A component can own only part of a shared recipe ingredient. The
        // remainder stays available for later stages; shopping still buys the
        // complete recipe total once.
        if (prep.ingredientAmounts) ingredients=ingredients.map(item=>{
          const split=prep.ingredientAmounts[item.key];
          if (!split) return item;
          const forTier=tier=>Number(split[tier] ?? split.perServing ?? 0);
          const amount=group.counts.reduce((sum,count)=>sum+count.qty*forTier(count.tier),0)
            + productionExtras.reduce((sum,extra)=>sum+Number(extra.ownerServings || 0)*forTier(extra.tier || 'lean'),0);
          return {...item,baseAmount:rounded(amount,4),bufferedAmount:rounded(amount,4)};
        });
        // Some recipes use cooked inputs for nutrition but a separate physical
        // formula for the kitchen. The card displays the latter.
        if (prep.useFormulaInputsOnly) ingredients = [];
        for (const formula of prep.formulaIngredients || []) {
          const scale=prep.scaleToIngredient ? Number(byKey[prep.scaleToIngredient.key]?.baseAmount || 0)/prep.scaleToIngredient.referenceAmount : 1;
          const amount = group.counts.reduce((sum, count) => {
            const perServing = Number(
              formula[count.tier] ?? formula.perServing ?? 0,
            ) || 0;
            return sum + perServing * count.qty;
          }, productionExtras.reduce((sum, extra) => {
            const perServing = Number(
              formula[extra.tier || 'lean'] ?? formula.perServing ?? 0,
            ) || 0;
            return sum + perServing * Number(extra.ownerServings || 0);
          }, (Number(formula.fixedAmount) || 0)*scale));
          if (amount <= 0) continue;
          ingredients.push({
            key: formula.key,
            sourceKey: formula.sourceKey || formula.key,
            deferredUntilCook: formula.deferredUntilCook === true,
            name: formula.name || formula.key,
            unit: formula.unit || 'g',
            station: formula.station || 'Other',
            note: formula.note || 'Full kitchen preparation quantity.',
            confidence: formula.confidence || 'planning',
            baseAmount: rounded(amount, 4),
            bufferedAmount: rounded(amount, 4),
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
        const customerPieceCount = pieceTargets.reduce((sum, target) => sum + target.pieces, 0);
        const ownerPieceCount = (productionExtras || []).reduce((sum,extra) => {
          const target = prep.pieceTargets?.[extra.tier || 'lean'];
          return sum + Number(extra.ownerServings || 0) * Number(target?.piecesPerServing || 0);
        },0);
        const reservePct = Number(prep.reservePct ?? methods?.meals?.[group.id]?.piecePlan?.reservePct ?? 0) || 0;
        const reservePieces = customerPieceCount ? Math.ceil(customerPieceCount * reservePct / 100) : 0;
        for (const formula of prep.reserveFormulaIngredients || []) {
          const activeTier = pieceTargets.length === 1 ? pieceTargets[0].tier : null;
          const perPiece = Number((activeTier && formula[activeTier]) ?? formula.perPiece ?? 0) || 0;
          const amount = perPiece * reservePieces;
          if (amount <= 0) continue;
          const unit = formula.unit || 'g';
          const existing = ingredients.find(item => item.key === formula.key && (item.unit || 'g') === unit);
          if (existing) {
            const alreadyBuffered = (Number(existing.bufferedAmount) || 0) > (Number(existing.baseAmount) || 0) + .0001;
            if (!alreadyBuffered) existing.bufferedAmount = rounded((Number(existing.bufferedAmount) || 0) + amount, 4);
          } else {
            ingredients.push({
              key: formula.key,
              sourceKey: formula.sourceKey || formula.key,
              name: formula.name || formula.key,
              unit,
              station: formula.station || 'Other',
              note: formula.note || 'Shaped-piece production reserve.',
              confidence: formula.confidence || 'planning',
              baseAmount: 0,
              bufferedAmount: rounded(amount, 4),
              measure: formula.measure,
            });
          }
        }
        prepBatches.push({
          dishId: group.id,
          dish: group.name,
          tiers: tierText,
          type: prep.type,
          prepWave: prep.prepWave || '',
          prepWaveName: prep.prepWaveName || '',
          equipmentLane: prep.equipmentLane || '',
          ovenTemperatureF: Number(prep.ovenTemperatureF) || 0,
          estimatedMinutes: Number(prep.estimatedMinutes) || 0,
          sequence: Number(prep.sequence) || 999,
          background: prep.background === true,
          name: prep.name,
          stage: prep.stage || '',
          consumesIngredients: prep.consumesIngredients,
          deferred: prep.deferred === true,
          cookAhead: prep.cookAhead || null,
          componentRef: prep.componentRef || '',
          sharedSauceFamily: prep.sharedSauceFamily || '',
          sauceVariant: prep.sauceVariant || '',
          sauceUse: prep.sauceUse || '',
          sauceDelivery: prep.sauceDelivery || '',
          sauceReserve: prep.sauceReserve === true,
          flavorCategory: prep.flavorCategory || '',
          aheadWorkstation: prep.aheadWorkstation || '',
          workBatchGroup: prep.workBatchGroup || '',
          workBatchName: prep.workBatchName || '',
          workOperation: prep.workOperation || '',
          workPrimaryKeys: prep.workPrimaryKeys || [],
          operatorSteps: prep.operatorSteps || null,
          referenceNotes: prep.referenceNotes || [],
          oncePerDish: prep.oncePerDish === true,
          instruction: prep.instruction || '',
          ingredients,
          recipeSections: (prep.recipeSections || []).map(section => ({
            title: section.title || 'Complete recipe',
            note: section.note || '',
            ingredients: (section.ingredientKeys || []).map(key => byKey[key]).filter(Boolean),
          })).filter(section => section.ingredients.length),
          pieceTargets,
          pieceWeightNote: prep.pieceWeightNote || '',
          pieceNoun: prep.pieceNoun || 'piece',
          customerPieceCount,
          ownerPieceCount,
          reservePct,
          reservePieces,
          totalPieceCount: customerPieceCount + ownerPieceCount + reservePieces,
          unmeasured: prep.unmeasured || [],
          steps: prep.steps || [],
          stepIngredientKeys: prep.stepIngredientKeys || [],
          cookDayIngredientKeys: prep.cookDayIngredientKeys || [],
          productionExtras,
          showProductionExtras: prep.showProductionExtras === true,
          seasoningFamily: prep.seasoningFamily || '',
          seasoningFamilyName: prep.seasoningFamilyName || '',
          seasoningFinishNote: prep.seasoningFinishNote || '',
          seasoningBaseForm: prep.seasoningBaseForm || '',
          proteinForm: prep.proteinForm || '',
          releaseTiming: prep.releaseTiming || 'prep-day',
          finishTiming: prep.finishTiming || 'prep-day',
          poolStorage: prep.poolStorage === true,
          splitAfterSeasoning: prep.splitAfterSeasoning === true,
          seasoningFamilyGroupId: '',
          seasoningAppliedIngredientKeys: [],
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
    }, {})).map(group => {
      const category = proteinProductionGroup(group);
      const yieldLabels = [...new Set(group.allocations.map(item=>item.yieldLabel))];
      const weightedYield = group.baseAmount>0
        ? group.allocations.reduce((sum,item)=>sum+item.baseAmount*item.yieldFactor,0)/group.baseAmount
        : (proteinYieldRules[group.key]?.factor || 1);
      return {
        ...group,
        yieldLabel: yieldLabels.length===1 ? yieldLabels[0] : 'Dish-specific cooked-yield planning estimates; see recipe allocations. Actual output must be weighed.',
        category: category.category,
        productionGroup: category.key,
        categoryName: category.name,
        categoryRank: category.rank,
        bufferedAmount: rounded(group.bufferedAmount, 1),
        baseAmount: rounded(group.baseAmount, 1),
        reserveAmount: rounded(Math.max(0, group.bufferedAmount - group.baseAmount), 1),
        expectedCookedAmount: rounded(group.expectedCookedAmount, 1),
        reserveExpectedCookedAmount: rounded(Math.max(0, group.bufferedAmount - group.baseAmount) * weightedYield, 1),
      };
    }).sort((left, right) => left.categoryRank - right.categoryRank || left.name.localeCompare(right.name));
    const explicitSeasoningGroups = (methods?.sharedProteinSeasoning || []).map(family => {
      const familyProteinKey = canonicalIngredientKey(family.proteinKey);
      const allocations = proteins.filter(item => item.key === familyProteinKey && family.dishIds?.includes(item.dishId));
      if (!allocations.length) return null;
      const totalRaw = rounded(allocations.reduce((sum, item) => sum + item.baseAmount, 0), 1);
      const scaled = (items, rawAmount) => (items || []).map(item => ({
        ...item,
        grams: rounded((Number(item.grams) || 0) * rawAmount / 1000, 4),
      }));
      return {
        id: family.id,
        name: family.name,
        proteinKey: familyProteinKey,
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
    const taggedSeasoningFamilies = Object.values(prepBatches.reduce((map, batch) => {
      if (!batch.seasoningFamily) return map;
      const protein = (batch.ingredients || []).find(item => proteinYieldRules[canonicalIngredientKey(item.key)]);
      if (!protein) return map;
      const proteinKey = canonicalIngredientKey(protein.key);
      // The common base can be applied while thighs are still whole. Each labeled
      // pull may then receive a different cut without creating separate base bowls.
      const proteinForm = batch.seasoningBaseForm || batch.proteinForm || 'unspecified-form';
      // Release and finish timing are physical workflow constraints too: a batch
      // cooked today or finished overnight cannot remain in tomorrow's pool.
      const releaseTiming = batch.splitAfterSeasoning ? 'split-immediately' : batch.releaseTiming || 'prep-day';
      const finishTiming = batch.splitAfterSeasoning ? 'split-immediately' : batch.finishTiming || 'prep-day';
      const key = `${batch.seasoningFamily}:${proteinKey}:${proteinForm}:${releaseTiming}:${finishTiming}`;
      const family = map[key] ||= {
        id: safeLogKey(`recipe-family:${key}`),
        name: batch.seasoningFamilyName || batch.seasoningFamily,
        proteinKey,
        proteinForm,
        releaseTiming,
        finishTiming,
        batches: [],
      };
      family.batches.push({ batch, protein });
      return map;
    }, {}));
    const workflowSeasoningGroups = taggedSeasoningFamilies.map(family => {
      if (family.batches.length < 2) return null;
      const allocations = family.batches.map(({ batch }) => {
        const allocation = proteins.find(item => item.dishId === batch.dishId && item.key === family.proteinKey);
        return allocation ? { ...allocation, batch } : null;
      }).filter(Boolean);
      if (allocations.length < 2) return null;
      const keyLists = allocations.map(item => (item.batch.ingredients || [])
        .filter(ingredient => canonicalIngredientKey(ingredient.key) !== family.proteinKey && ingredient.unit === 'g' && Number(ingredient.baseAmount) > 0)
        .map(ingredient => canonicalIngredientKey(ingredient.key)));
      const commonKeys = [...new Set(keyLists[0] || [])].filter(key => keyLists.every(keys => keys.includes(key)));
      if (!commonKeys.length) return null;
      const totalRaw = rounded(allocations.reduce((sum, item) => sum + item.baseAmount, 0), 1);
      const commonRates = commonKeys.map(key => {
        const candidates = allocations.map(item => {
          const ingredient = item.batch.ingredients.find(candidate => canonicalIngredientKey(candidate.key) === key);
          const controlledBase = Number(ingredient?.allocations?.['shared-chicken-base']);
          const recipeProtein = item.batch.ingredients.find(candidate => canonicalIngredientKey(candidate.key) === family.proteinKey);
          if (controlledBase > 0 && Number(recipeProtein?.amount) > 0) return controlledBase / Number(recipeProtein.amount);
          return item.baseAmount > 0 && ingredient ? Number(ingredient.baseAmount) / item.baseAmount : 0;
        });
        if (candidates.some(value => value <= 0)) return null;
        const source = allocations.map(item => item.batch.ingredients.find(candidate => canonicalIngredientKey(candidate.key) === key)).find(Boolean);
        return source ? { key, name: source.name, rate: Math.min(...candidates) } : null;
      }).filter(Boolean);
      const baseSeasoning = commonRates.map(item => ({
        key: item.key,
        name: item.name,
        grams: rounded(item.rate * totalRaw, 1),
      }));
      const group = {
        id: family.id,
        name: family.name,
        proteinKey: family.proteinKey,
        proteinForm: family.proteinForm,
        note: 'These active recipe cards share the displayed base. Season the combined weighed pull once, then divide the exact labeled recipe amounts and add only the displayed finishes.',
        totalRaw,
        baseSeasoning,
        allocations: allocations.map(item => ({
          ...item,
          finishNote: item.batch.seasoningFinishNote || '',
          bufferedAmount: item.baseAmount,
          finishSeasoning: (item.batch.ingredients || []).map(ingredient => {
            const key = canonicalIngredientKey(ingredient.key);
            if (key === family.proteinKey || ingredient.unit !== 'g') return null;
            const common = commonRates.find(candidate => candidate.key === key);
            const baseShare = common ? common.rate * item.baseAmount : 0;
            const grams = rounded(Math.max(0, Number(ingredient.baseAmount) - baseShare), 1);
            return grams >= 0.2 ? { key, name: ingredient.name, grams } : null;
          }).filter(Boolean),
        })),
      };
      const appliedKeys = [...new Set([
        ...group.baseSeasoning.map(item => item.key),
        ...group.allocations.flatMap(item => item.finishSeasoning.map(ingredient => ingredient.key)),
      ])];
      for (const item of group.allocations) {
        item.batch.seasoningFamilyGroupId = group.id;
        item.batch.seasoningAppliedIngredientKeys = appliedKeys;
      }
      return group;
    }).filter(Boolean);
    const seasoningGroups = [...explicitSeasoningGroups, ...workflowSeasoningGroups];
    const proteinStoragePools = seasoningGroups.flatMap(group => {
      const compatible = group.allocations.filter(item =>
        item.batch?.poolStorage === true
        && item.batch.releaseTiming === 'cook-day'
        && item.batch.finishTiming === 'cook-day'
      );
      const pools = Object.values(compatible.reduce((map, item) => {
        const form = item.batch.proteinForm || group.proteinForm || 'unspecified-form';
        const key = `${group.id}:${group.proteinKey}:${form}`;
        const pool = map[key] ||= {
          id: `storage-pool:${key}`,
          seasoningGroupId: group.id,
          proteinKey: group.proteinKey,
          proteinForm: form,
          name: `${group.name} — ${form}`,
          totalRaw: 0,
          allocations: [],
        };
        pool.totalRaw += item.baseAmount;
        pool.allocations.push({
          dishId: item.dishId,
          dish: item.dish,
          tiers: item.tiers,
          baseAmount: item.baseAmount,
          finishSeasoning: item.finishSeasoning || [],
          finishNote: item.finishNote || '',
        });
        return map;
      }, {}));
      return pools.filter(pool => pool.allocations.length > 1).map(pool => ({
        ...pool,
        totalRaw: rounded(pool.totalRaw, 1),
      }));
    });
    const riceGroups = Object.values(rice.reduce((map, item) => {
      const key = item.batchGroup || 'common';
      const group = map[key] ||= {
        key,
        name: ({ common: 'Plain basmati rice', biryani: 'Biryani rice - cook separately', 'halal-yellow-rice': 'Halal Cart yellow rice', 'vegetable-rice': 'Vegetable rice', 'cilantro-garlic-lime': 'Cilantro-garlic-lime rice' })[key] || item.dish + ' rice',
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
    }, {})).map(group => {
      const groupDishIds = new Set((group.allocations || []).map(item => item.dishId));
      const finishMap = new Map();
      const finishCards = prepBatches.filter(batch =>
        groupDishIds.has(batch.dishId)
        && batch.componentRef === `shared-${group.key}-rice`
      );
      for (const card of finishCards) for (const ingredient of card.ingredients || []) {
        if (ingredient.key === 'rice_dry') continue;
        const key = `${ingredient.key}:${ingredient.unit || 'g'}`;
        const current = finishMap.get(key) || { ...ingredient, baseAmount: 0, bufferedAmount: 0 };
        current.baseAmount += Number(ingredient.baseAmount) || 0;
        current.bufferedAmount += Number(ingredient.bufferedAmount) || 0;
        finishMap.set(key, current);
      }
      return {
        ...group,
        bufferedAmount: rounded(group.bufferedAmount, 1),
        baseAmount: rounded(group.baseAmount, 1),
        allowanceAmount: rounded(group.allowanceAmount, 1),
        expectedCookedAmount: rounded(group.expectedCookedAmount, 1),
        allowanceExpectedCookedAmount: rounded(group.allowanceExpectedCookedAmount, 1),
        finishIngredients: [...finishMap.values()].map(item => ({
          ...item,
          baseAmount: rounded(item.baseAmount, 1),
          bufferedAmount: rounded(item.bufferedAmount, 1),
        })),
      };
    });
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
      proteinStoragePools,
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

  const proteinPrepTypes = new Set([
    'marinade', 'marinade-finish', 'protein-mix', 'protein-portion', 'form-and-marinate',
  ]);

  const separatelyScheduledPrepTypes = new Set([
    ...proteinPrepTypes, 'sauce', 'topping', 'dessert',
  ]);

  function inferredPrepWave(batch) {
    if (!batch) return '';
    if (batch.prepWave) return batch.prepWave;
    const keys = new Set((batch.ingredients || []).map(item => item.key));
    const hasAny = values => values.some(value => keys.has(value));
    if (hasAny(['egg', 'egg_white']) && batch.type === 'cook-ahead') return 'eggs';
    if (hasAny(['instant_potato_flakes'])) return 'instant-mash';
    if (hasAny(['potato'])) return 'roasted-potatoes';
    if (hasAny(['rice_dry'])) return 'rice';
    if (hasAny(['quinoa_dry'])) return 'quinoa';
    if (hasAny(['protein_pasta', 'kroger_protein_pasta', 'barilla_protein_plus_rotini', 'protein_mac', 'lasagna_sheet'])) return 'pasta-and-bakes';
    if (batch.type === 'vegetable-ahead') return 'hot-vegetables';
    if (batch.type === 'mix' || batch.type === 'cold-kit') return 'cold-kits';
    if (batch.type === 'recipe-kit' || batch.type === 'measured-prep') return 'active-recipe-kits';
    return 'other-components';
  }

  function buildCookAheadWaves(prepBatches) {
    const rank = {
      'roasted-potatoes': 10,
      'instant-mash': 20,
      rice: 30,
      quinoa: 40,
      'hot-vegetables': 50,
      broccoli: 50,
      'green-beans': 50,
      'southwest-vegetables': 50,
      eggs: 60,
      'pasta-and-bakes': 70,
      'pasta-sauce': 70,
      'protein-mac': 70,
      'cold-kits': 80,
      'active-recipe-kits': 90,
      'other-components': 100,
    };
    const waves = new Map();
    (prepBatches || []).forEach((batch, index) => {
      if (batch.deferred === true) return;
      // Raw protein prep is shown once in the dedicated protein block. A complete
      // Prep Day recipe such as lasagna, a braise, or a cooked filling may contain
      // protein and still belongs in the batch-recipe workstation.
      if (proteinPrepTypes.has(batch.type)) return;
      // Ordinary cold ingredients are pulled from the shared produce/toppings
      // block and weighed at assembly.  Treating every 20 g onion or cheese
      // allocation as its own "kit" created dozens of fake production jobs.
      if (['cold-kit', 'garnish-kit'].includes(batch.type)) return;
      if (separatelyScheduledPrepTypes.has(batch.type)) return;
      const inferred = inferredPrepWave(batch);
      // Rice is generated from riceGroups so the same dry pull cannot appear
      // once per recipe and again in the shared rice station.
      if (inferred === 'rice') return;
      const key = inferred || `single:${batch.dishId}:${batch.name}:${index}`;
      const wave = waves.get(key) || {
        key,
        name: batch.prepWaveName || batch.name,
        batches: [],
        dishes: [],
        ingredients: [],
        _ingredients: new Map(),
      };
      wave.batches.push(batch);
      if (!wave.dishes.includes(batch.dish)) wave.dishes.push(batch.dish);
      for (const ingredient of batch.ingredients || []) {
        const ingredientKey = `${ingredient.key}:${ingredient.unit}`;
        const current = wave._ingredients.get(ingredientKey) || { ...ingredient, baseAmount: 0, bufferedAmount: 0 };
        current.baseAmount += Number(ingredient.baseAmount) || 0;
        current.bufferedAmount += Number(ingredient.bufferedAmount) || 0;
        wave._ingredients.set(ingredientKey, current);
      }
      waves.set(key, wave);
    });
    return [...waves.values()].map(wave => ({
      ...wave,
      ingredients: [...wave._ingredients.values()],
      _ingredients: undefined,
    })).sort((left, right) =>
      (rank[left.key] || 999) - (rank[right.key] || 999) || left.name.localeCompare(right.name)
    );
  }

  function buildPrepWorkstations(cookAheadWaves, riceGroups = []) {
    const riceWaves = (riceGroups || []).map(group => {
      const riceIngredient = {
        key: `rice_dry:${group.key}`,
        name: group.name,
        unit: 'g',
        station: 'Starches & Hot Sides',
        baseAmount: Number(group.baseAmount) || 0,
        bufferedAmount: Number(group.baseAmount) || 0,
        allowanceAmount: Number(group.allowanceAmount) || 0,
        expectedCookedAmount: Number(group.expectedCookedAmount) || 0,
      };
      const destinations = (group.allocations || [])
        .map(allocation => `${allocation.dish}: approximately ${Math.round(Number(allocation.expectedCookedAmount) || 0)} g cooked`)
        .join('; ');
      return {
        key: `rice:${group.key}`,
        name: group.name === 'Common plain basmati rice' ? 'One shared rice cook' : group.name,
        dishes: [...new Set((group.allocations || []).map(allocation => allocation.dish))],
        ingredients: [riceIngredient, ...(group.finishIngredients || [])],
        batches: [{
          dish: 'All active rice destinations',
          dishId: `rice:${group.key}`,
          tiers: `${(group.allocations || []).length} labeled destination pan${(group.allocations || []).length === 1 ? '' : 's'}`,
          type: 'starch-ahead',
          name: group.name === 'Common plain basmati rice' ? 'Cook the complete rice pull once' : group.name,
          instruction: 'Cook this exact dry-rice total once, record the full cooked yield, then divide it into the labeled recipe pans.',
          ingredients: [riceIngredient, ...(group.finishIngredients || [])],
          unmeasured: [],
          steps: [
            'Cook the displayed dry rice as one physical batch. Do not cook the purchase-only allowance.',
            ...((group.finishIngredients || []).length ? ['Add the displayed cilantro, garlic, and lime to this one shared rice batch. Do not create separate flavored rice pots.'] : []),
            'Weigh and record the complete finished rice yield before any portion is removed.',
            `Divide only after cooking: ${destinations}. Adjust each split proportionally if the actual cooked yield differs from the estimate.`,
            'Rapid-cool each labeled destination pan and refrigerate.',
          ],
        }],
      };
    });
    const sourceWaves = [...riceWaves, ...(cookAheadWaves || [])];
    const definitions = [
      { key: 'potato-station', name: 'Potato and mash station', description: 'Run every active fresh-potato and packaged-mash job in one coordinated equipment block, while keeping unlike recipes in labeled pans.', match: wave => ['roasted-potatoes', 'instant-mash'].includes(wave.key) },
      { key: 'starch-station', name: 'Rice, pasta and grains', description: 'Run every active rice, quinoa, pasta, and macaroni job in one coordinated starch block. Preserve each measured recipe batch and divide shared rice only after recording its finished yield.', match: wave => wave.key.startsWith('rice:') || wave.key === 'quinoa' || ['pasta-and-bakes', 'pasta-sauce', 'protein-mac'].includes(wave.key) },
      { key: 'vegetable-station', name: 'Hot vegetable station', description: 'Run every active cooked vegetable component in one coordinated block using separate labeled pans.', match: wave => wave.key === 'hot-vegetables' || (wave.batches || []).every(batch => batch.type === 'vegetable-ahead') },
      { key: 'egg-station', name: 'Egg station', description: 'Pull eggs once, then cook each active egg recipe in its own labeled pan during the same work block.', match: wave => /egg/i.test(wave.key) },
      { key: 'assembled-pan-station', name: 'Assemble refrigerated pans', description: 'Build every active casserole pan completely on Prep Day so Cook Day only bakes, rests, weighs, and portions it.', match: wave => wave.key === 'assembled-pans' },
      { key: 'cold-kit-station', name: 'Cold toppings and assembly-kit station', description: 'Wash, count, and stage the active cold toppings and dry assembly components in one clean work block.', match: wave => wave.key === 'cold-kits' },
      { key: 'recipe-kit-station', name: 'Active recipe mise en place', description: 'Complete only the remaining measured recipe kits generated by this batch. Each active dish appears as one tab; inactive recipes never appear.', match: wave => wave.key === 'active-recipe-kits' },
      { key: 'other-component-station', name: 'Other active components', description: 'Complete only the remaining active component work generated by this batch.', match: () => true },
    ];
    const assigned = new Set();
    const workstations = [];
    for (const definition of definitions) {
      const subwaves = sourceWaves.filter((wave, index) => !assigned.has(index) && definition.match(wave));
      if (!subwaves.length) continue;
      sourceWaves.forEach((wave, index) => { if (subwaves.includes(wave)) assigned.add(index); });
      const ingredientMap = new Map();
      for (const wave of subwaves) {
        for (const ingredient of wave.ingredients || []) {
          const key = `${ingredient.key}:${ingredient.unit}`;
          const current = ingredientMap.get(key) || { ...ingredient, baseAmount: 0, bufferedAmount: 0 };
          current.baseAmount += Number(ingredient.baseAmount) || 0;
          current.bufferedAmount += Number(ingredient.bufferedAmount) || 0;
          ingredientMap.set(key, current);
        }
      }
      workstations.push({
        key: definition.key,
        name: definition.name,
        description: definition.description,
        subwaves,
        batches: subwaves.flatMap(wave => wave.batches || []),
        dishes: [...new Set(subwaves.flatMap(wave => wave.dishes || []))],
        ingredients: [...ingredientMap.values()],
      });
    }
    return workstations;
  }

  function buildPrepEquipmentSchedule(prepBatches, workstations = []) {
    const ovenBatches = (prepBatches || [])
      .filter(batch => batch.deferred !== true && batch.equipmentLane === 'oven' && Number(batch.ovenTemperatureF) > 0)
      .sort((left, right) => Number(left.sequence || 999) - Number(right.sequence || 999)
        || Number(left.ovenTemperatureF) - Number(right.ovenTemperatureF)
        || String(left.name).localeCompare(String(right.name)));
    const groups = new Map();
    for (const batch of ovenBatches) {
      const temperature = Number(batch.ovenTemperatureF);
      const key = `${Number(batch.sequence || 999)}:${temperature}`;
      const block = groups.get(key) || {
        key,
        temperature,
        sequence: Number(batch.sequence || 999),
        batches: [],
        dishes: [],
        estimatedMinutes: 0,
      };
      block.batches.push(batch);
      if (!block.dishes.includes(batch.dish)) block.dishes.push(batch.dish);
      block.estimatedMinutes = Math.max(block.estimatedMinutes, Number(batch.estimatedMinutes) || 0);
      groups.set(key, block);
    }
    const blocks = [...groups.values()].sort((left, right) => left.sequence - right.sequence || left.temperature - right.temperature);
    const availableStations = (workstations || [])
      .filter(station => !station.subwaves?.every(subwave => subwave.batches?.every(batch => batch.equipmentLane === 'oven')))
      .map(station => station.name);
    let stationIndex = 0;
    for (const block of blocks) {
      block.while = availableStations.slice(stationIndex, stationIndex + 2);
      stationIndex += block.while.length;
      block.release = block.batches.some(batch => /Lasagna/i.test(batch.name))
        ? 'Lasagna center reached 165 F; hot pan weight and both cooling checkpoints must be logged before Cook Day cutting.'
        : 'Every displayed pan reached its recipe endpoint, its finished yield was recorded, and cooling began promptly.';
    }
    return blocks;
  }

  function weeklySaucePlan(orders, sauceConfig) {
    const config = sauceConfig || {};
    const scaledSauceFormula = (sauce, cups) => {
      const perCup = Array.isArray(sauce.ingredientsPerCup) ? sauce.ingredientsPerCup : [];
      const batch = Array.isArray(sauce.batchIngredients) ? sauce.batchIngredients : [];
      const batchSizeCups = Math.max(0, Number(sauce.batchSizeCups) || 0);
      const declaredFill = Math.max(0, Number(sauce.gramsPerCup) || 0);
      if (batch.length && batchSizeCups) {
        const ingredients = batch.map(item => ({
          ...item,
          unit: 'g',
          // Owner standard: sauce station works in whole grams, not long
          // per-cup decimals. Scale the locked master batch, then round once.
          totalGrams: Math.round((Number(item.grams) || 0) * cups / batchSizeCups),
        }));
        return {
          gramsPerCup: declaredFill,
          totalGrams: declaredFill * cups,
          inputGrams: ingredients.reduce((sum, item) => sum + item.totalGrams, 0),
          ingredients,
        };
      }
      const gramsPerCup = declaredFill || perCup.reduce((sum, item) => sum + Number(item.grams || 0), 0);
      const ingredients = perCup.map(item => ({
        ...item,
        unit: 'g',
        totalGrams: Number(item.grams) * cups,
      }));
      return {
        gramsPerCup,
        totalGrams: gramsPerCup * cups,
        inputGrams: ingredients.reduce((sum, item) => sum + item.totalGrams, 0),
        ingredients,
      };
    };
    if (config.selectionMode === 'order-selections' && config.enabled !== false) {
      const selections = (orders || []).filter(order => order.included !== false && !order.planningOnly)
        .flatMap(order => (order.sauces?.selections || order.sauces || []).map(sauce => ({...sauce, customer:order.customer, orderId:order.orderId})));
      const sauces = (config.sauces || []).map(sauce => {
        const destinations = selections.filter(selection => selection.id === sauce.id);
        const customerCups = destinations.reduce((sum, row) => sum + Number(row.qty || 0), 0);
        if (!Number.isSafeInteger(customerCups) || customerCups < 0) throw new Error(`Invalid selected sauce count: ${sauce.id}`);
        const formula = scaledSauceFormula(sauce, customerCups);
        const gramsPerCup = formula.gramsPerCup;
        if (customerCups && !gramsPerCup) throw new Error(`Missing controlled optional sauce formula: ${sauce.name}`);
        return {...sauce,customerCups,kitchenUseCups:0,qcCups:0,totalCups:customerCups,physicalCups:customerCups,
          gramsPerCup,totalGrams:formula.totalGrams,inputGrams:formula.inputGrams,destinations,
          ingredients:formula.ingredients};
      }).filter(sauce => sauce.customerCups > 0);
      const known = new Set((config.sauces || []).map(sauce => sauce.id));
      for (const selection of selections) if (!known.has(selection.id)) throw new Error(`No production formula for ordered sauce: ${selection.id}`);
      const total = sauces.reduce((sum, sauce) => sum+sauce.customerCups,0);
      return {policy:config.policy || '',cupSizeOz:2,orderCount:new Set(selections.map(row=>row.orderId || row.customer)).size,
        eligibleMealCount:0,customerCupsTotal:total,customerCupMode:'order-selections',sauces,totalCups:total,totalPhysicalCups:total};
    }
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
    const hasSauceSpecificAssignments = sauceDefinitions.some(sauce => Array.isArray(sauce.eligibleMealIds) && sauce.eligibleMealIds.length);
    const sauces = sauceDefinitions.map((sauce, index) => {
      const sauceEligibleIds = new Set(Array.isArray(sauce.eligibleMealIds) ? sauce.eligibleMealIds : []);
      const sauceEligibleCount = sauceEligibleIds.size
        ? (orders || []).reduce((sum, order) => sum + (order.items || [])
          .filter(item => sauceEligibleIds.has(item.id))
          .reduce((mealSum, item) => {
            const quantity = Number(item.qty);
            return mealSum + (Number.isFinite(quantity) && quantity >= 0 ? quantity : 1);
          }, 0), 0)
        : 0;
      const configuredSauceCups = Math.max(0, Number(sauce.customerCupsTotal) || 0);
      const customerCups = configuredSauceCups || (sauceEligibleIds.size
        ? sauceEligibleCount
        : hasSauceSpecificAssignments
          ? 0
          : sauceDefinitions.length
            ? Math.floor(customerCupsTotal / sauceDefinitions.length) + (index < customerCupsTotal % sauceDefinitions.length ? 1 : 0)
            : 0);
      const productionActive = customerCups > 0;
      const kitchenUseCups = productionActive ? kitchenUseCupsPerSauce : 0;
      const qcCups = productionActive ? qcCupsPerSauce : 0;
      const totalCups = customerCups + kitchenUseCups + qcCups;
      const formula = scaledSauceFormula(sauce, totalCups);
      const gramsPerCup = rounded(formula.gramsPerCup, 1);
      return {
        ...sauce,
        customerCups,
        kitchenUseCups,
        qcCups,
        totalCups,
        gramsPerCup,
        physicalCups: customerCups + qcCups,
        totalGrams: rounded(formula.totalGrams, 1),
        inputGrams: rounded(formula.inputGrams, 1),
        ingredients: formula.ingredients,
      };
    });
    const resolvedCustomerCupsTotal = hasSauceSpecificAssignments
      ? sauces.reduce((sum, sauce) => sum + sauce.customerCups, 0)
      : customerCupsTotal;
    return {
      policy: config.policy || '',
      cupSizeOz: Number(config.cupSizeOz) || 0,
      orderCount,
      eligibleMealCount,
      customerCupsTotal: resolvedCustomerCupsTotal,
      customerCupMode: configuredCustomerCups ? 'manual' : 'automatic',
      sauces,
      totalCups: sauces.reduce((sum, sauce) => sum + sauce.totalCups, 0),
      totalPhysicalCups: sauces.reduce((sum, sauce) => sum + sauce.physicalCups, 0),
    };
  }

  const PERMANENT_LABEL_EXEMPT_CUSTOMERS = ['Talal', 'Duaa', 'Rida', 'Owner Custom'];

  function labelEligibleOrders(orders, exemptCustomers) {
    // Permanent owner/family and home-party exemptions apply even when a caller
    // forgets to pass the current batch's method configuration.
    const exemptions = [...PERMANENT_LABEL_EXEMPT_CUSTOMERS, ...(exemptCustomers || [])]
      .map(normalize).filter(Boolean);
    return includedOrders(orders).filter(order => {
      const unconfirmed = order.planningOnly === true || order.recurringStatus === 'planning' || order.confirmationStatus === 'unconfirmed';
      if (unconfirmed && order.labelsApproved !== true) return false;
      const customer = normalize(order.customer);
      return order.labelExempt !== true && order.noLabels !== true &&
        !exemptions.some(exempt => customer === exempt || customer.startsWith(`${exempt} `));
    });
  }

  function dishPackAllocation(orders, dishId, exemptCustomers) {
    const exemptionNames = [...new Set([...PERMANENT_LABEL_EXEMPT_CUSTOMERS, ...(exemptCustomers || [])])];
    const exemptions = exemptionNames.map(normalize);
    const labeled = new Map();
    const separate = new Map();
    const tierOrder = { lean: 0, bulk: 1, single: 2 };

    for (const order of confirmedOrders(orders)) {
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
    const cookSelected = selected.filter(entry => !entry.method.prepDayOnly);

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
    const breakfasts = cookSelected.filter(entry => /^b/.test(entry.id));
    const sauces = selected.filter(entry => entry.method.sideCups > 0 || hasText(entry, /sauce|salsa|syrup|crema|condiment/i));
    const proteinPrepTypes = new Set(['marinade', 'marinade-finish', 'protein-mix', 'protein-portion', 'protein-cook-ahead', 'form-and-marinate']);
    const proteinKeys = new Set(['chicken_thigh_raw', 'chicken_wings_raw', 'chicken_breast_raw', 'chicken_mince_raw', 'leg_quarter_raw', 'beef_90_raw', 'beef_96_raw', 'beef_strip_raw', 'steak_raw', 'short_rib_cooked', 'shrimp_raw', 'tilapia_raw', 'pink_salmon_raw']);
    const hasProteinPrep = entry => (entry.method.prepBatches || []).some(batch =>
      proteinPrepTypes.has(batch.type)
      || (batch.ingredientKeys || []).some(key => proteinKeys.has(key))
    );
    const proteins = selected.filter(entry => entry.method.proteinCook || hasProteinPrep(entry) || hasText(entry, /marinat|season chicken|mix and form|score every|raw protein/i));
    const vegetables = selected.filter(entry => hasText(entry, /chop|vegetable|lettuce|tomato|jalapeno|broccoli|potato|corn|pickle|fruit/i));
    const mixes = selected.filter(entry => hasText(entry, /batter|dough|custard|whisk eggs|egg mix|mixture|filling/i));
    const starches = selected.filter(entry => hasText(entry, /rice cooker|rice batch|cook.*rice|pasta|mac(?:aroni)?|potato/i));
    const equipmentLane = entry => String(entry.method.cookDayEquipment?.lane || entry.method.proteinCook?.lane || '').toLowerCase();
    const oven = cookSelected.filter(entry => entry.method.cookDayEquipment
      ? /oven/.test(equipmentLane(entry))
      : (/oven/.test(equipmentLane(entry)) || hasText(entry, /oven|bake|roast/i)));
    const stove = cookSelected.filter(entry => entry.method.cookDayEquipment
      ? /stovetop|griddle/.test(equipmentLane(entry))
      : (/stovetop|griddle/.test(equipmentLane(entry)) || hasText(entry, /skillet|griddle|sauce pot|pasta pot|stovetop|pan-cook|brown beef|sear/i)));
    const proteinCookEntries = cookSelected
      .filter(entry => entry.method.proteinCook && !entry.method.proteinCook.prepDayComplete)
      .sort((left, right) => Number(left.method.proteinCook.sequence || 999) - Number(right.method.proteinCook.sequence || 999));
    const proteinCookGroups = Array.from(proteinCookEntries.reduce((groups, entry) => {
      const key = entry.method.proteinCook.group || 'other-protein';
      if (!groups.has(key)) groups.set(key, { key, entries: [], sequence:Number(entry.method.proteinCook.sequence || 999) });
      groups.get(key).entries.push(entry);
      groups.get(key).sequence = Math.min(groups.get(key).sequence, Number(entry.method.proteinCook.sequence || 999));
      return groups;
    }, new Map()).values()).sort((left, right) => left.sequence - right.sequence);
    const starchLine = cookSelected.filter(entry => hasText(entry, /rice|pasta|mac|potato|corn|bread|tortilla/i));
    const taggedFamilies = selected.flatMap(entry => (entry.method.prepBatches || [])
      .filter(batch => batch.seasoningFamily)
      .map(batch => batch.seasoningFamily));
    const activeSharedProteinFamilies = [...new Set(taggedFamilies)].filter(family =>
      taggedFamilies.filter(candidate => candidate === family).length > 1
    );
    const configuredSharedProteinFamilies = (methods?.sharedProteinSeasoning || []).filter(family =>
      (family.dishIds || []).some(id => selected.some(entry => entry.id === id))
    );
    const sharedFamilyCount = activeSharedProteinFamilies.length + configuredSharedProteinFamilies.length;
    const sharedProteinTasks = sharedFamilyCount
      ? [
          `Use only the ${sharedFamilyCount} displayed compatible seasoning ${sharedFamilyCount === 1 ? 'family' : 'families'} as shared bases. Any active recipe without matching family metadata stays separate.`,
          'Apply each measured shared base once, record the actual seasoning weights, then divide it back into the exact labeled recipe bags and add only the displayed finish.',
        ]
      : ['No shared seasoning family is approved for this batch. Keep every recipe pull in its own labeled bag or pan and use only its exact formula card.'];

    const earlyBraises=selected.filter(entry=>(entry.method.prepBatches || []).some(batch=>
      batch.type==='protein-cook-ahead' && !batch.cookAhead && !batch.deferred &&
      (entry.method.productionGroup==='braise' || /brais/i.test(batch.name || ''))));
    const earlyBraiseIds=new Set(earlyBraises.map(entry=>entry.id));
    const ordinaryProteins=proteins.filter(entry=>!earlyBraiseIds.has(entry.id));

    const prepStages = [
      prepStage('reconcile', {
        title: '1. Reconcile, print, label, and stage',
        reason: 'Lock the reviewed customer counts and label empty containers before food is opened.',
        dishes: names(selected),
        tasks: ['Confirm included orders and manual corrections.', 'Print only the customer labels shown in the label plan; exempt internal/family orders remain unlabeled.', 'Count the exact customer containers, apply labels to the empty containers without blocking the sealing edge, then stack them by dish and tier outside the raw zone.', 'Count clean empty packaging spares for damage only, along with dessert cups, lids, sauce cups, and bags.', 'Stage labeled raw-protein bags or bowls, scales, knives, and sanitation supplies before opening meat. Keep empty customer containers covered outside the raw zone.'],
      }),
      prepStage('proteins', {
        title: '3. Fabricate, season, split, and marinate proteins',
        reason: 'Clean sauces and nonmeat make-ahead components are protected and chilling. Prepare the remaining ordinary raw pulls last, then sanitize.',
        dishes: names(ordinaryProteins),
        tasks: ordinaryProteins.length ? ['Keep proteins at 41 F or below and pull only what can be cut and returned to refrigeration promptly.', 'Use the recipe quantity for each dish. Keep the displayed pooled reserve plain and refrigerated; do not turn it into automatic extra meals.', 'Keep clean components protected and their cooling checkpoints scheduled. Trim, cut and weigh one manageable raw pull at a time into its labeled bag or pan.', ...sharedProteinTasks, 'Complete each remaining marinade, formed-protein or raw-portion card once. Then use those labeled pulls for dependent cook-ahead protein cards; do not remake an early braise already started. Keep raw and cooked tools and components separate.', 'Cover, identify, date, and refrigerate every finished raw-protein batch.', 'Complete the raw-zone sanitation reset: discard contaminated disposables, wash and rinse tools and surfaces, sanitize the raw zone, wash hands and change contaminated gloves/apron before cooked-food handling. Repeat the reset after any later raw-loading job.'] : ['No overnight protein preparation is required.', 'Confirm all completed clean components are protected and any remaining cook-ahead protein card owns its ingredients.'],
      }),
      prepStage('produce', {
        title: '2. Wash, cut, and bulk-store all produce',
        reason: 'Prepare clean produce and recipe aromatics before opening raw meat; keep ready-to-eat portions covered and separate.',
        dishes: names(vegetables),
        tasks: vegetables.length ? ['Wash produce under the commercial-kitchen procedure, then cut matching forms together in bulk before opening raw meat.', 'Use one covered bulk bowl per ingredient and cut style. Split only when the physical form truly differs, such as diced onion versus thin-sliced onion.', 'Use this same block for cooked vegetables and cold toppings. Do not create separate bags or jobs for every dish.', 'Weigh each recipe, sauce, filling, side, and topping amount from the matching shared bowl when that later recipe is made.', 'Keep washed ready-to-eat produce dry and physically separate from vegetables that will be cooked. Label, date, cover, and refrigerate every bulk container.'] : ['No produce preparation is required.'],
      }),
      prepStage('sauces', {
        title: '4. Make sauces, toppings, and cold sides',
        reason: 'Complete the sauces and cold components explicitly assigned to Prep Day; keep raw finishes separate.',
        dishes: names(sauces),
        tasks: sauces.length ? ['Make only the sauces and quantities displayed on active recipe cards.', 'Complete only the displayed active dish-specific sauces, finishes, toppings, garnishes, dressings, and cold sides.', 'Reserve sauce for kitchen use only when an active card explicitly assigns that quantity; do not create extra sauce.', 'Fill, count, label, date, and refrigerate the assigned side cups and component containers.'] : ['No separate sauce cups are required.'],
      }),
      prepStage('desserts', {
        title: '5. Build desserts and start the chill',
        reason: 'Complete only ordered desserts while the station is clean, then protect them before raw-meat work.',
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
        title: '7. Complete only scheduled cook-ahead components',
        reason: 'Complete assigned nonmeat make-ahead components before ordinary raw-meat preparation; recipe cards still decide their storage state.',
        dishes: names(starches),
        tasks: starches.length ? ['Read each active Prep Day card. Cook eggs, sides, grains, pasta, or potatoes now only when that card explicitly instructs cooking ahead.', 'A weighed dry-rice allocation, pasta kit, raw egg mixture, or custard is measured prep, not a completed cooked batch. Leave it in the storage state specified by its card.', 'Keep distinct grain groups and dish-specific finishes separate. Record finished yields only for components actually cooked.', 'Do each scheduled nonmeat cook-ahead component once; the long braise starts on its own early card, and protein jobs needing labeled raw pulls follow ordinary raw preparation. Cook Day verifies yield, holding and assembly.', 'Cool cooked components from 135 F to 70 F within 2 hours and to 41 F within 6 hours total using shallow pans or the kitchen-approved method.', 'Record start temperature/time, 70 F checkpoint, 41 F checkpoint, and cooked yield. During active cooling, use loosely covered shallow pans in a protected clean area with no raw food above; seal fully after cooling. If capacity is insufficient, revise the cooking schedule before starting more food.'] : ['No non-protein cook-ahead batch is required.'],
      }),
      prepStage('labels', {
        title: '8. Reconcile every kit and close prep day',
        reason: 'Cook Day should begin with measured kits, labeled containers, and a clean, counted line.',
        dishes: names(selected),
        tasks: ['Confirm the labeled empty-container stacks still match the final customer count.', 'Do not prepare or label automatic extra meals; the raw-protein reserve is pooled across production.', 'Stage each dish kit with its recipe card.', 'Reconcile completed prep against the packet and record shortages before leaving.'],
      }),
    ];

    const ovenSetpoints = (entry) => {
      const explicit = Number(entry.method.cookDayEquipment?.temperatureF
        || (!entry.method.proteinCook?.prepDayComplete ? entry.method.proteinCook?.ovenTemperatureF : 0)) || 0;
      const temperatureText = entry.method.temperature || '';
      const bakeOrRoast = Array.from(
        temperatureText.matchAll(/(?:bake|roast)[^.;]{0,70}?(\d{3})\s*F/gi),
        match => Number(match[1])
      );
      const ovenFinish = Array.from(
        temperatureText.matchAll(/(\d{3})\s*F\s+(?:finishing\s+)?oven/gi),
        match => Number(match[1])
      );
      return Array.from(new Set([...(explicit ? [explicit] : []), ...bakeOrRoast, ...ovenFinish]));
    };
    const ovenTemperatures = Array.from(new Set(oven.flatMap(ovenSetpoints)));
    const durationMinutes = (entry) => {
      const explicit = Number(entry.method.cookDayEquipment?.estimatedMinutes || entry.method.proteinCook?.estimatedMinutes) || 0;
      if (explicit) return explicit;
      const values = Array.from(methodText(entry).matchAll(/(\d+)(?:\s*-\s*(\d+))?\s*minutes?/gi), match => Number(match[2] || match[1]));
      return values.length ? Math.max(...values) : 0;
    };
    const ovenBlocks = ovenTemperatures.map((temperature) => ({
      temperature,
      entries: oven.filter(entry => ovenSetpoints(entry).includes(temperature)),
    })).filter(block => block.entries.length).map(block => ({
      ...block,
      estimatedMinutes: Math.max(...block.entries.map(durationMinutes), 0),
    })).sort((a, b) => {
      const leftSequence = Math.min(...a.entries.map(entry => Number(entry.method.cookDayEquipment?.sequence || entry.method.proteinCook?.sequence || 999)));
      const rightSequence = Math.min(...b.entries.map(entry => Number(entry.method.cookDayEquipment?.sequence || entry.method.proteinCook?.sequence || 999)));
      return leftSequence - rightSequence || a.temperature - b.temperature;
    });
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
      completedPrep.has('rice') ? 'designated cook-ahead component cards' : '',
    ].filter(Boolean);
    const ovenTimeline = parallelBlocks.length
      ? parallelBlocks.map(block => `${block.title}: ${block.primary.join(', ')}${block.while.length ? `; active lane: ${block.while.join(', ')}` : ''}`).join(' | ')
      : 'No oven blocks are required.';

    const cookStages = [
      {
        title: '1. Shift startup and control board',
        reason: 'Professional batch production starts from one locked count and one visible plan.',
        dishes: names(cookSelected),
        tasks: [
          'Confirm the active customer count, dish/tier totals, labels, and container count before cooking begins.',
          completedText.length ? `Prep already completed: ${completedText.join(', ')}. Verify counts, labels, and cold holding; do not remake these batches.` : 'Confirm which prep-day batches are complete and properly held.',
          'Set up three lanes: passive equipment (ovens/rice), active cooking (stove/griddle), and cold/cooling (staging, shallow pans, labels).',
          'Pull only the first scheduled protein bowl. Keep every later batch refrigerated until its lane is ready.',
        ],
        release: 'Counts locked; equipment preheated; cooling space, thermometers, scales, and labeled pans ready.',
      },
      {
        title: '2. Start long oven and passive-equipment jobs',
        reason: 'Start ready long-running pans first, then use a separate clean station for the next active task.',
        dishes: names(oven),
        tasks: [
          `Preheat the required oven, skillet, grill, and sheet-pan equipment. Planned oven demand: ${ovenTimeline}`,
          'Stage separate raw-handling and clean receiving/cooling areas. Keep later protein bowls refrigerated until their lane is ready.',
          'Load only the pans whose measured prep is ready. Set timers and probe checkpoints before starting another task; never leave an active pan unattended.',
          'A dish may move to clean assembly when its own components are fully cooked, weighed, and safely held. It does not wait for unrelated proteins; never assemble at a contaminated raw station.',
        ],
        release: 'The first ready oven jobs are running with timers; raw and clean work areas remain separated.',
      },
      {
        title: '3. Run the coordinated active cooking lanes',
        reason: 'Use oven waiting time for the scheduled stove, griddle, grain, or side job, within the available staffing and equipment capacity.',
        dishes: names(proteinCookEntries),
        tasks: proteinCookEntries.length ? [
          `Active protein families: ${proteinCookGroups.map(group => `${group.key}: ${names(group.entries).join(', ')}`).join(' | ')}. Follow the recipe lane schedule, not a requirement to finish an entire family before starting another ready dish.`,
          `Run at most ${activeCapacity} watched stove/griddle task${activeCapacity === 1 ? '' : 's'} at once alongside safely timed passive equipment. Start long jobs first and keep seafood in its final scheduled wave.`,
          'Follow the complete dish card, including one-pan protein-and-pasta or sauce cooking. A shared seasoning base never makes different finished recipes interchangeable.',
          'For every batch, record raw weight, endpoint, cooked yield, piece count where applicable, destination pan, and any reserve used.',
          'Keep the pooled raw reserve refrigerated and plain. Cook it only for a measured shortage, then document the exact dish allocation.',
          'Send each finished dish or component to its labeled safe holding/cooling area immediately. Finish and assemble ready dishes at a separate clean station while other timed equipment continues.',
        ] : ['No meat, poultry, or seafood cooking is required.'],
        release: 'Each completed batch is individually cooked to its endpoint, weighed, reconciled, and released to safe holding or its clean assembly step.',
      },
      {
        title: '4. Reset raw-handling areas between jobs',
        reason: 'Clean component work may continue only at a physically separate clean station or after a documented raw-zone reset.',
        dishes: names(proteinCookEntries),
        tasks: proteinCookEntries.length ? [
          'After each raw-handling job, return unopened later batches to refrigeration and keep them out of the clean receiving area.',
          'Return approved unused raw reserve to labeled cold inventory or record discard/waste; no unlabeled raw bowl remains on the line.',
          'Remove raw packaging and contaminated disposables. Wash, rinse, and sanitize the protein station, tools, handles, probes, sinks, and touched surfaces.',
          'Change gloves and apron before clean work. If one person shares a station between jobs, stop and fully reset it before handling ready-to-eat food.',
          'After the final protein job, reconcile every endpoint, yield, and destination pan, then mark the raw station CLOSED.',
        ] : ['Confirm no raw protein was opened, then release the clean station.'],
        release: 'Every station change has a documented reset; after the final raw job, all protein is accounted for and the raw station is closed.',
      },
      {
        title: '5. Breakfast cooking and finishing lane',
        reason: 'Finish each breakfast from its actual prepared state as griddle, stove, and clean-station capacity becomes available.',
        dishes: names(breakfasts),
        tasks: breakfasts.length ? [
          'Check the measured breakfast cards: distinguish raw egg mixtures, chilled custard, dry batter kits, and bread from components explicitly cooked ahead.',
          'Cook pancakes, French Toast, eggs, or fillings when the Cook Day card requires it. For a component already cooked and logged, follow its release/reheat instruction instead of cooking a duplicate.',
          'Combine each breakfast only when its own protein, egg, bread, sauce, and side components meet the recipe endpoints; keep cold toppings away from raw handling.',
          'Record the final assembled count before releasing breakfast meals to cooling.',
        ] : ['No breakfast production is required.'],
        release: 'All breakfast components are counted, identified, cooled/held correctly, and ready for final build.',
      },
      {
        title: '6. Cook or release sides and starches by card',
        reason: 'Use the passive grain and watched stovetop lanes for Cook Day components; release verified cook-ahead components without repeating them.',
        dishes: names(starchLine),
        tasks: starchLine.length ? [
          completedPrep.has('rice') ? 'The designated cook-ahead cards are marked complete. Verify those specific yields and cold holding; this does not mark every grain, pasta, egg, or side as cooked.' : 'Reconcile the actual status of each component. Cook any unfinished item at the time assigned by its recipe card; do not treat measured dry grain or pasta as cooked.',
          'Start each Cook Day rice group in its scheduled lane; keep plain, yellow, Biryani, and vegetable rice separate unless their current cards explicitly allow sharing.',
          'Cook one-pan pasta in its owning recipe. Reheat a verified cooked component only when its card requires it and only for the current dish and tier.',
          'Keep measured finishes attached to the correct labeled dish kit or completed pan.',
          'Do not let a finished protein wait at room temperature for an unfinished side; send released components into approved hot holding or rapid cooling.',
        ] : ['No starch or hot-side production is required.'],
        release: 'Every selected meal has all required hot components released and identified.',
      },
      {
        title: '7. Yield release and controlled cooling',
        reason: 'Plating begins from measured, released components, not estimates still sitting in cookware.',
        dishes: names(cookSelected.filter(entry => !/^d/.test(entry.id))),
        tasks: [
          'Compare each finished dish or component yield with its own plating requirement before releasing that dish to assembly; unrelated timed jobs may continue.',
          'Resolve shortages using the documented raw reserve or an approved correction; record all changes.',
          'Rapid-cool cooked TCS components using shallow pans or the commercial kitchen-approved method and log required checkpoints.',
          'Keep cold garnishes, sauces, and desserts refrigerated until their assembly step.',
        ],
        release: 'All components have enough verified yield, correct identity, and an approved holding/cooling state.',
      },
      {
        title: '8. Assembly line by dish and tier',
        reason: 'The assembly line is organized by SKU, not customer, to protect speed and portion consistency.',
        dishes: names(cookSelected),
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
        dishes: names(cookSelected),
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

    if (earlyBraises.length) prepStages.push(prepStage('early-proteins',{
      title:'Start the slow roast or braise and reset',
      reason:'An independent long cook needs an early start; its own measured card contains the ingredients.',
      dishes:names(earlyBraises),
      tasks:['After produce prep, start the slow roast or braise and set its timer. Leave the ordinary raw pulls refrigerated.','Wash and rinse tools and surfaces, sanitize the raw area, wash hands and change contaminated gloves/apron before returning to sauces and other clean batches.','Monitor the oven while completing clean work. Record yield and cooling checkpoints when finished.'],
    }));
    const prepOrder = new Map(['reconcile','produce','early-proteins','sauces','desserts','mixes','rice','proteins','labels'].map((key,index) => [key,index]));
    prepStages.sort((left,right) => prepOrder.get(left.key) - prepOrder.get(right.key));
    prepStages.forEach((stage,index)=>{stage.title=(index+1)+'. '+stage.title.replace(/^\d+\.\s*/, '');});
    return { prepStages, cookStages, parallelBlocks, lanes, proteinCookGroups, selected: names(selected) };
  }

  // Stock must include required labels even while stale nutrition data blocks printing.
  function labelRequiredOrders(orders, exemptCustomers) {
    return labelEligibleOrders(orders, exemptCustomers).map(order => ({
      ...order,
      items: (order.items || []).filter(item =>
        item.labelExempt !== true && item.noLabels !== true && item.packageType !== 'home_party_box' &&
        item.packageType !== 'unpacked'),
    })).filter(order => order.items.length);
  }

  function labelProductionOrders(orders, labelData, exemptCustomers) {
    return labelRequiredOrders(orders, exemptCustomers).map(order => ({
      ...order,
      items: order.items.filter(item => Boolean(labelData?.meals?.[item.id]?.tiers?.[item.tier || 'single'])),
    })).filter(order => order.items.length);
  }

  function auditPlanCoverage(counts, productionData, methods) {
    const grouped = Object.values((counts || []).reduce((map, count) => {
      if ((Number(count.qty) || 0) <= 0) return map;
      (map[count.id] ||= { id: count.id, name: count.name, tiers: new Set() }).tiers.add(count.tier);
      return map;
    }, {}));
    const errors = [];
    const rows = [];
    const proteinPrepTypes = new Set(['marinade', 'marinade-finish', 'protein-mix', 'protein-portion', 'protein-cook-ahead', 'form-and-marinate']);

    for (const group of grouped) {
      const production = productionData?.meals?.[group.id];
      const method = methods?.meals?.[group.id];
      const renderedProteinSteps = method?.proteinCook
        ? (method.proteinCook.recipeSteps || method.proteinCook.instructions || [])
        : [];
      const renderedCookSteps = method?.proteinCook && !method.proteinCook.prepDayComplete
        ? renderedProteinSteps
        : (method?.steps || []);
      const row = {
        id: group.id,
        name: group.name || production?.name || group.id,
        tiers: [...group.tiers],
        prepBatches: method?.prepBatches?.length || 0,
        cookSteps: renderedCookSteps.length,
        assemblyTiers: [],
        errors: [],
      };
      const fail = message => {
        const text = `${row.name}: ${message}`;
        row.errors.push(text);
        errors.push(text);
      };

      if (!production) fail('missing controlled production recipe.');
      if (production?.productionHold) fail(`production release hold: ${production.productionHold}`);
      for (const tier of group.tiers) {
        if (production?.tiers?.[tier]?.productionHold) fail(`${tier} production release hold: ${production.tiers[tier].productionHold}`);
        if (production?.tiers?.[tier] && !production.tiers[tier].ingredients?.length) fail(`${tier} has no measured ingredients.`);
      }
      if (!method) {
        fail('missing controlled Prep Day and Cook Day method.');
        rows.push(row);
        continue;
      }

      if (!Array.isArray(method.prepSteps) || !method.prepSteps.length) fail('missing Prep Day summary.');
      if (!Array.isArray(method.prepBatches) || !method.prepBatches.length) fail('missing measured Prep Day card.');
      if (!Array.isArray(renderedCookSteps) || !renderedCookSteps.length) fail('missing rendered Cook Day instructions.');
      const recipeKeys = new Set([...group.tiers].flatMap(tier =>
        (production?.tiers?.[tier]?.ingredients || []).map(item => item.key)
      ));
      const allRecipeKeys = new Set(Object.values(production?.tiers || {}).flatMap(tier =>
        (tier?.ingredients || []).map(item => item.key)
      ));
      const componentOwners = new Map();
      if (!Array.isArray(method.componentMap) || !method.componentMap.length) {
        fail('missing protein/base/side/topping component map.');
      } else {
        for (const component of method.componentMap) {
          if (!component?.role || !component?.label || !component?.handling) fail('contains an incomplete component-map row.');
          if (!Array.isArray(component?.ingredientKeys) || !component.ingredientKeys.length) fail(`${component?.label || 'component'} has no ingredient keys.`);
          for (const key of component.ingredientKeys || []) {
            // A controlled component may cover tier-specific alternatives (for
            // example, the Lean and Bulk tortilla sizes). Validate the key
            // against the complete recipe, while still requiring every
            // ingredient in the selected tier below to have exactly one owner.
            if (!allRecipeKeys.has(key)) fail(`${component.label} references missing component ingredient ${key}.`);
            const owners = componentOwners.get(key) || [];
            owners.push(component.label);
            componentOwners.set(key, owners);
          }
        }
        for (const key of recipeKeys) {
          const owners = componentOwners.get(key) || [];
          if (!owners.length) fail(`recipe ingredient ${key} is not assigned to a protein, base, side, topping, seasoning, or cup component.`);
          if (owners.length > 1) fail(`recipe ingredient ${key} is assigned to multiple assembly components (${owners.join(' / ')}).`);
        }
      }
      const allCookText = [...renderedCookSteps, ...(method.steps || [])];
      if (allCookText.some(step => /\b(?:on|during) Prep Day\b/i.test(String(step)))) {
        fail('Cook Day instructions contain Prep Day work; move that work into a measured Prep Day card.');
      }
      if (!method.temperature) fail('missing Cook Day endpoint or no-cook declaration.');

      for (const tier of group.tiers) {
        if (!production?.tiers?.[tier]) fail(`missing ${tier} production build.`);
        const guide = method.assemblyGuide?.[tier];
        if (!Array.isArray(guide) || !guide.length) fail(`missing ${tier} plating instructions.`);
        else row.assemblyTiers.push(tier);
      }

      const prepKeyOwners = new Map();
      for (const batch of method.prepBatches || []) {
        if (Array.isArray(batch?.activeTiers) && batch.activeTiers.length && ![...group.tiers].some(tier => batch.activeTiers.includes(tier))) continue;
        if (!batch?.name || !batch?.type || !batch?.instruction) fail('contains an incomplete Prep Day card identity.');
        if (!Array.isArray(batch?.steps) || !batch.steps.length) fail(`${batch?.name || 'Prep Day card'} has no executable steps.`);
        const ingredientKeys = Array.isArray(batch?.ingredientKeys) ? batch.ingredientKeys : [];
        const formulas = Array.isArray(batch?.formulaIngredients) ? batch.formulaIngredients : [];
        if (!ingredientKeys.length && !formulas.length && !batch?.includeAllRecipeIngredients && !batch?.workflowOnly) {
          fail(`${batch?.name || 'Prep Day card'} has no measured ingredients.`);
        }
        for (const key of ingredientKeys) {
          // Prep cards may intentionally describe one shared operation across
          // tier-specific ingredients. The scaled card itself contains only
          // ingredients from the tiers that were actually ordered.
          const exists = allRecipeKeys.has(key);
          if (!exists) fail(`${batch.name} references missing recipe ingredient ${key}.`);
          const owners = prepKeyOwners.get(key) || [];
          owners.push(batch);
          prepKeyOwners.set(key, owners);
        }
      }
      for (const [key, owners] of prepKeyOwners) {
        const explicitAmounts=owners.some(owner=>owner.ingredientAmounts?.[key]);
        if (explicitAmounts) {
          for (const tier of group.tiers) {
            const expected=(production.tiers[tier]?.ingredients || []).filter(item=>item.key===key).reduce((sum,item)=>sum+Number(item.amount),0);
            const amounts=owners.map(owner=>{
              const split=owner.ingredientAmounts?.[key];
              return split ? Number(split[tier] ?? split.perServing ?? 0) : expected;
            });
            const sum=amounts.reduce((total,amount)=>total+amount,0);
            if (amounts.some(amount=>!Number.isFinite(amount)||amount<0) || sum>expected+.001 || (owners.length>1 && Math.abs(sum-expected)>.001))
              fail(`${key} ${tier} component split does not conserve the measured recipe amount.`);
          }
          continue;
        }
        const measuredSplit=owners.some(o=>o.componentRef || o.excludeComponentRefs?.length);
        if (measuredSplit) {
          for (const tier of group.tiers) {
            const lines=production.tiers[tier]?.ingredients.filter(i=>i.key===key) || [];
            const expected=lines.reduce((n,i)=>n+Number(i.amount),0);
            const allocated=refs=>lines.reduce((n,i)=>n+refs.reduce((s,ref)=>s+Number(i.allocations?.[ref]||0),0),0);
            const amounts=owners.map(o=>o.componentRef ? allocated([o.componentRef]) : expected-allocated(o.excludeComponentRefs || []));
            if (amounts.some(n=>!Number.isFinite(n)||n<-.001) || Math.abs(amounts.reduce((s,n)=>s+n,0)-expected)>.001)
              fail(`${key} ${tier} component split does not conserve the measured recipe amount.`);
          }
        } else if (owners.length > 1) {
          fail(`recipe ingredient ${key} is assigned in multiple Prep Day cards (${owners.map(o=>o.name).join(' / ')}); split the component amounts with explicit formula ingredients.`);
        }
      }

      if (method.proteinCook) {
        const sharedProteinPrep = (methods?.sharedProteinSeasoning || []).some(family => family.dishIds?.includes(group.id));
        const explicitProteinPrep = (method.prepBatches || []).some(batch =>
          proteinPrepTypes.has(batch.type)
          || (batch.ingredientKeys || []).some(key => method.proteinCook.recipeKeys?.includes(key))
          || batch.includeAllRecipeIngredients === true
        );
        if (!sharedProteinPrep && !explicitProteinPrep) fail('raw protein is not assigned to a Prep Day portion, seasoning, forming, or marinade step.');
      }
      rows.push(row);
    }

    return { errors, rows };
  }

  // Form descriptions contain spaces and Unicode. Persisted IDs must satisfy
  // the cook-log store's field-key contract, without dropping that identity.
  function safeLogKey(value) {
    return String(value).replace(/[^a-z0-9:_|.-]/gi, c=>`_x${c.codePointAt(0).toString(16)}_`);
  }

  return {
    safeLogKey,
    normalize,
    parseDelimited,
    parseTable,
    parseItemsText,
    orderStatusFromNotes,
    arrayRowsToOrders,
    rowsToOrders,
    orderKey,
    includedOrders,
    confirmedOrders,
    packoutPlan,
    customerNotePlan,
    aggregateCounts,
    countsFromMap,
    bufferSettings,
    productionBreakdown,
    productionPlan,
    ingredientTotals,
    operationalIngredientTotals,
    resolvedProductionExtras,
    proteinProductionGroup,
    sideCupDefinitions,
    sideCupPlan,
    extraPackagingRequirements,
    groceryAdjustmentPlan,
    dualAmount,
    productionSummary,
    labelPlan,
    componentPlan,
    buildCookAheadWaves,
    buildPrepWorkstations,
    buildPrepEquipmentSchedule,
    weeklySaucePlan,
    labelEligibleOrders,
    labelRequiredOrders,
    labelProductionOrders,
    dishPackAllocation,
    buildWorkflow,
    auditPlanCoverage,
  };
});
