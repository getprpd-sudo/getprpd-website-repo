(function (root, factory) {
  const api = factory(typeof module !== 'undefined' && module.exports ? require('./cook-day-core') : root.PRPD_COOK_DAY);
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.PRPD_GROCERY_CORE = api;
})(typeof window !== 'undefined' ? window : globalThis, function (cook) {
  const SECTION_ORDER = [
    'Meat & Seafood',
    'Produce',
    'Dairy & Eggs',
    'Bread & Tortillas',
    'Pantry & Sauces',
    'Sweets & Baking',
    'Packaging',
  ];
  const SECTION_KEYS = {
    'Meat & Seafood': new Set(['beef_90_raw','beef_96_raw','ny_strip_raw','short_rib_cooked','leg_quarter_raw','chicken_thigh_raw','chicken_wings_raw','chicken_breast_raw','chicken_mince_raw','shrimp_raw','tilapia_raw','pink_salmon_raw','beef_strips_raw','beef_bacon','sharifa_beef_bacon']),
    'Produce': new Set(['apple','banana','blueberry','bok_choy','broccoli','carrot','cilantro','cucumber','garlic','ginger','green_bell_pepper','red_bell_pepper','lettuce','jalapeno','lemon','lime','mushroom','mixed_vegetables','onion','red_onion','spinach','strawberry','tomato','potato','zucchini','green_beans','green_onion','parsley','batch18_dill','batch18_garlic','batch18_mango','batch18_mint']),
    'Dairy & Eggs': new Set(['egg','egg_white','mascarpone','philadelphia_no_bake','regular_cream_cheese','reduced_cream_cheese','cotija','fage','fairlife_milk','cottage','mozzarella','part_skim_mozzarella','part_skim_ricotta','parmesan','feta','butter','simple_truth_yogurt','whipped_cream','batch18_fage_0']),
    'Bread & Tortillas': new Set(['large_tortilla','small_tortilla','street_taco_tortilla','fajita_tortilla','shawarma_bread','bread_slice','hawaiian_roll','sourdough_slice','english_muffin']),
    'Sweets & Baking': new Set(['banana_pudding_mix','biscoff_cookie','biscoff_spread','brown_sugar','chia','chocolate_chips','cinnamon','cocoa','coriander','honey','ladyfingers','oats','oreo_thin','peanut_butter','powdered_sugar','whey','vanilla']),
    'Packaging': new Set(['sauce_cup','sauce_lid','printed_label','dessert_cup','small_dessert_box','grab_go_container','meal_container','paper_bag','cookie_sleeve','food_prep_gloves','kitchen_consumable_allowance','parchment_roll','aluminum_foil_roll','cling_film_roll']),
  };
  const PACKAGING_KEYS = SECTION_KEYS.Packaging;
  SECTION_KEYS['Dairy & Eggs'].add('heavy_cream').add('whole_milk');
  SECTION_KEYS.Produce.add('lemon_zest');
  const PURCHASE_ALIASES = {
    simple_truth_yogurt: { key: 'fage', name: 'FAGE Total 0% plain Greek yogurt' },
    fage: { key: 'fage', name: 'FAGE Total 0% plain Greek yogurt' },
    batch18_fage_0: { key: 'fage', name: 'FAGE Total 0% plain Greek yogurt' },
    batch18_water: { key: 'water' },
    batch18_cucumber_squeezed: { key: 'cucumber', name: 'Fresh cucumber', purchaseFactor: 2, sourceNote: '50% raw-to-squeezed allowance' },
    batch18_honey: { key: 'honey' },
    batch18_lemon: { key: 'lemon' },
    batch18_lime: { key: 'lime' },
    batch18_olive_oil: { key: 'olive_oil' },
    batch18_black_pepper: { key: 'black_pepper' },
    batch18_salt: { key: 'salt' },
    batch18_vinegar: { key: 'apple_cider_vinegar' },
  };
  // Practical shopping estimates only. Recipe weights remain the source of truth because
  // individual produce size and usable yield vary. Values are average usable grams per item.
  const PRODUCE_COUNT_ESTIMATES = {
    apple: { gramsEach: 155, singular: 'small apple', plural: 'small apples' },
    banana: { gramsEach: 118, singular: 'medium banana', plural: 'medium bananas' },
    carrot: { gramsEach: 61, singular: 'medium carrot', plural: 'medium carrots' },
    bok_choy: { gramsEach: 250, singular: 'head of bok choy', plural: 'heads of bok choy' },
    cilantro: { gramsEach: 50, singular: 'bunch', plural: 'bunches' },
    cucumber: { gramsEach: 300, singular: 'medium cucumber', plural: 'medium cucumbers' },
    green_bell_pepper: { gramsEach: 160, singular: 'pepper', plural: 'peppers' },
    red_bell_pepper: { gramsEach: 160, singular: 'red pepper', plural: 'red peppers' },
    jalapeno: { gramsEach: 14, singular: 'jalapeno', plural: 'jalapenos' },
    lime: { gramsEach: 30, singular: 'lime', plural: 'limes' },
    lettuce: { gramsEach: 500, singular: 'head', plural: 'heads' },
    mushroom: { gramsEach: 18, singular: 'medium mushroom', plural: 'medium mushrooms' },
    onion: { gramsEach: 150, singular: 'medium onion', plural: 'medium onions' },
    red_onion: { gramsEach: 150, singular: 'medium red onion', plural: 'medium red onions' },
    potato: { gramsEach: 213, singular: 'medium potato', plural: 'medium potatoes' },
    strawberry: { gramsEach: 18, singular: 'medium strawberry', plural: 'medium strawberries' },
    tomato: { gramsEach: 123, singular: 'medium tomato', plural: 'medium tomatoes' },
    zucchini: { gramsEach: 196, singular: 'medium zucchini', plural: 'medium zucchini' },
  };
  const rounded = (value, digits = 2) => {
    const factor = 10 ** digits;
    return Math.round((Number(value) || 0) * factor) / factor;
  };

  function shoppingSection(item) {
    for (const section of SECTION_ORDER) {
      if (SECTION_KEYS[section]?.has(item.key)) return section;
    }
    return 'Pantry & Sauces';
  }

  function estimatedProduceCount(key, grams) {
    const estimate = PRODUCE_COUNT_ESTIMATES[key];
    const requiredGrams = Math.max(0, Number(grams) || 0);
    if (!estimate || requiredGrams <= 0) return null;
    const count = Math.max(1, Math.ceil(requiredGrams / estimate.gramsEach));
    return {
      count,
      label: `about ${count} ${count === 1 ? estimate.singular : estimate.plural}`,
      gramsEach: estimate.gramsEach,
    };
  }

  function mergeRequirements(recipeTotals, saucePlan, packaging = []) {
    const merged = new Map();
    const add = (item, amount, source) => {
      const unit = item.unit || 'g';
      const rawKey = item.key || String(item.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '_');
      const alias = PURCHASE_ALIASES[rawKey];
      const key = alias?.key || rawKey;
      const mapKey = `${key}:${unit}`;
      const current = merged.get(mapKey) || {
        key, name: alias?.name || item.name || key, unit, station: item.station || 'Other',
        required: 0, sources: new Set(), confidence: item.confidence || 'planning',
      };
      current.required += Math.max(0, Number(amount) || 0) * (alias?.purchaseFactor || 1);
      if (Number(item.minimumPieceCount) > 0) {
        current.minimumPieceCount = (Number(current.minimumPieceCount) || 0) + Number(item.minimumPieceCount);
        current.pieceCountBasis = item.pieceCountBasis || 'individual pieces';
        current.estimatedWeight = item.estimatedWeight === true;
      }
      current.sources.add(alias?.sourceNote ? `${source} (${alias.sourceNote})` : source);
      merged.set(mapKey, current);
    };

    for (const item of recipeTotals || []) add(item, item.bufferedAmount ?? item.required, 'Recipes');
    for (const sauce of saucePlan?.sauces || []) {
      const totalCups = Math.max(0, Number(sauce.totalCups) || 0);
      const extraCups = Math.max(0, (Number(sauce.kitchenUseCups) || 0) + (Number(sauce.qcCups) || 0));
      const recipeModeledFactor = sauce.ingredientsIncludedInRecipes && totalCups > 0
        ? extraCups / totalCups
        : 1;
      for (const item of sauce.ingredients || []) {
        add(
          { ...item, unit: 'g' },
          item.totalGrams * recipeModeledFactor,
          sauce.ingredientsIncludedInRecipes ? `Weekly sauce QC / kitchen reserve: ${sauce.name}` : `Weekly sauce: ${sauce.name}`,
        );
      }
    }
    for (const item of packaging || []) {
      add(item, item.required, 'Packaging');
      if (item.key === 'sauce_cup') {
        add({ key: 'sauce_lid', name: 'Matching 2 oz sauce-cup lids', unit: 'each', station: 'Packaging' }, item.required, 'Packaging');
      }
    }

    return Array.from(merged.values()).map(item => ({
      ...item,
      section: shoppingSection(item),
      required: rounded(item.required, item.unit === 'each' ? 1 : 1),
      sources: Array.from(item.sources),
    })).sort((a, b) => SECTION_ORDER.indexOf(a.section) - SECTION_ORDER.indexOf(b.section) || a.name.localeCompare(b.name));
  }

  function applyRequirementAdjustments(requirements, adjustments = []) {
    const adjusted = new Map((requirements || []).map(item => [`${item.key}:${item.unit}`, {
      ...item,
      sources: [...(item.sources || [])],
    }]));
    for (const adjustment of adjustments || []) {
      const unit = adjustment.unit || 'g';
      const mapKey = `${adjustment.key}:${unit}`;
      const current = adjusted.get(mapKey) || {
        key: adjustment.key,
        name: adjustment.name || adjustment.key,
        unit,
        station: adjustment.station || 'Other',
        section: shoppingSection(adjustment),
        required: 0,
        sources: [],
        confidence: adjustment.confidence || 'planning',
      };
      current.required = rounded(Math.max(0, current.required + (Number(adjustment.delta) || 0)), unit === 'each' ? 1 : 1);
      if (adjustment.reason && !current.sources.includes(adjustment.reason)) current.sources.push(adjustment.reason);
      adjusted.set(mapKey, current);
    }
    return Array.from(adjusted.values())
      .filter(item => item.required > 0)
      .sort((a, b) => SECTION_ORDER.indexOf(a.section) - SECTION_ORDER.indexOf(b.section) || a.name.localeCompare(b.name));
  }

  function buildPurchaseRows(requirements, catalog, saved = {}) {
    const rows = (requirements || []).map((item) => {
      const base = catalog[item.key] || {};
      const override = saved.catalog?.[item.key] || {};
      const entry = { ...base, ...override };
      const packageSize = Math.max(0, Number(entry.packageSize) || 0);
      const packagePrice = Math.max(0, Number(entry.price) || 0);
      const onHand = Math.max(0, Number(saved.onHand?.[item.key]) || 0);
      const rawNeeded = Math.max(0, item.required - onHand);
      const needed = item.key === 'egg' ? Math.ceil(rawNeeded) : rawNeeded;
      const suggestedPackages = packageSize > 0 && needed > 0 ? Math.ceil(needed / packageSize) : 0;
      const savedPackages = saved.buyPackages?.[item.key];
      const packages = Number.isFinite(Number(savedPackages))
        ? Math.max(0, Math.floor(Number(savedPackages)))
        : suggestedPackages;
      const purchaseAmount = packageSize > 0 ? rounded(packages * packageSize, 1) : 0;
      return {
        ...item,
        onHand: rounded(onHand, 1),
        needed: rounded(needed, 1),
        packageSize,
        packagePrice,
        packageLabel: entry.packageLabel || '',
        store: entry.store || 'Set source',
        confidence: entry.confidence || item.confidence || 'planning',
        query: entry.query || item.name,
        productUrl: entry.productUrl || '',
        packages,
        suggestedPackages,
        purchaseAmount,
        shortAmount: rounded(Math.max(0, needed - purchaseAmount), 1),
        usageCost: packageSize > 0 ? rounded((item.required / packageSize) * packagePrice, 2) : 0,
        estimatedCost: rounded(packages * packagePrice, 2),
        configured: packageSize > 0,
        packaging: PACKAGING_KEYS.has(item.key),
        estimatedCount: item.unit === 'g' ? estimatedProduceCount(item.key, needed) : null,
      };
    });
    for (const row of rows) {
      if (!['water', 'kitchen_consumable_allowance'].includes(row.key)) continue;
      row.nonPurchase = true;
      row.needed = 0;
      row.packages = 0;
      row.suggestedPackages = 0;
      row.purchaseAmount = 0;
      row.shortAmount = 0;
      row.estimatedCost = 0;
    }
    return rows;
  }

  function packagingRequirements(plannedCounts, orders, saucePlan, labelCount = 0, dishSpecificSauceCups = 0) {
    if (!(plannedCounts || []).some(item=>Number(item.total)>0)) return [];
    const isUnpacked = item => item.packageType === 'unpacked';
    const isHomePartyBox = item => item.packageType === 'home_party_box';
    const isDessert = item => item.packageType ? ['dessert_cup','dessert_box'].includes(item.packageType)
      : item.category ? /dessert/i.test(item.category) : String(item.id || '').startsWith('d') || (!item.id && item.tier === 'single');
    const isGrabGo = item => item.packageType ? item.packageType === 'grab_go'
      : item.category ? /add-on|grab.?go/i.test(item.category) : String(item.id || '').startsWith('a');
    const boxedDesserts = (plannedCounts || []).reduce((sum,item) => sum + (item.packageType === 'dessert_box' ? Number(item.total) || 0 : 0),0);
    const desserts = (plannedCounts || []).reduce((sum, item) => sum + (!isUnpacked(item) && isDessert(item) && item.packageType !== 'dessert_box' ? Number(item.total) || 0 : 0), 0);
    const grabGo = (plannedCounts || []).reduce((sum, item) => sum + (!isUnpacked(item) && isGrabGo(item) ? Number(item.total) || 0 : 0), 0);
    const meals = (plannedCounts || []).reduce((sum, item) => sum + (!isUnpacked(item) && !isDessert(item) && !isGrabGo(item) ? Number(item.total) || 0 : 0), 0);
    const deliveryOrders = (orders || []).filter(order => !order.items?.length || order.items.some(item => !isUnpacked(item) && !isHomePartyBox(item)));
    const weeklySauceCups = (saucePlan?.sauces || []).reduce((sum, sauce) => sum + Number(sauce.customerCups || 0) + Number(sauce.qcCups || 0), 0);
    const sauceCups = weeklySauceCups + Math.max(0, Number(dishSpecificSauceCups) || 0);
    return [
      { key: 'meal_container', name: 'Meal containers with lids', unit: 'each', station: 'Packaging', required: meals },
      { key: 'grab_go_container', name: '12 oz Grab & Go boxes with lids', unit: 'each', station: 'Packaging', required: grabGo },
      { key: 'dessert_cup', name: 'Dessert cups with lids', unit: 'each', station: 'Packaging', required: desserts },
      { key: 'small_dessert_box', name: 'Small dessert box for chocolate-dipped cookie dough balls', unit: 'each', station: 'Packaging', required: boxedDesserts },
      { key: 'sauce_cup', name: '2 oz sauce cups', unit: 'each', station: 'Packaging', required: sauceCups },
      { key: 'paper_bag', name: 'Paper delivery bags', unit: 'each', station: 'Packaging', required: deliveryOrders.length },
      { key: 'printed_label', name: 'Avery 5168 labels', unit: 'each', station: 'Packaging', required: labelCount },
      { key: 'food_prep_gloves', name: 'Disposable food-prep gloves', unit: 'box', station: 'Packaging', required: 1 },
      { key: 'kitchen_consumable_allowance', name: 'Gloves and cleaning allowance', unit: 'each', station: 'Packaging', required: meals + grabGo + desserts },
    ].filter(item => item.required > 0);
  }

  function dishSpecificSauceCupCount(plannedCounts, methods, saucePlan, sauceConfig) {
    const weeklyDishIds = new Set((saucePlan?.sauces || []).length
      ? (sauceConfig?.eligibleMealIds || [])
      : []);
    return cook.sideCupPlan((plannedCounts || []).filter(item=>!weeklyDishIds.has(item.id)),methods)
      .reduce((sum,row)=>sum+row.cups,0);
  }

  function dishSpecificPackagingRequirements(plannedCounts, methods) {
    const extra = [];
    for (const count of plannedCounts || []) {
      if (!(Number(count.total) > 0)) continue;
      const method = methods?.meals?.[count.id];
      for (const row of method?.extraPackagingPerMeal || []) {
        extra.push({...row,station:'Packaging',unit:'each',required:row.qty * Number(count.total)});
      }
    }
    for (const id of new Set((plannedCounts || []).filter(c=>Number(c.total)>0).map(c=>c.id))) {
      for (const row of methods?.meals?.[id]?.extraBatchPackaging || []) {
        extra.push({...row,station:'Packaging',unit:'each',required:row.qty});
      }
    }
    return extra;
  }

  function catalogValidationWarnings(rows) {
    const byKey = Object.fromEntries((rows || []).map(row=>[row.key,row]));
    const warnings = [];
    if (byKey.cottage && /fat.free/i.test(byKey.cottage.name) && (/Daisy/i.test(byKey.cottage.packageLabel) || /placeholder/i.test(byKey.cottage.store))) warnings.push('Cottage cheese: buy an actually fat-free product and replace the unmatched price placeholder with its shelf price and nutrition panel.');
    if (byKey.pickles && /house/i.test(byKey.pickles.name) && /hamburger/i.test(byKey.pickles.packageLabel)) warnings.push('Pickles: recipe calls for house pickled vegetables, but the catalog suggests bottled hamburger dill chips. Do not silently substitute. Confirm the house brine or approved product.');
    if (byKey.protein_pasta && /Kroger/i.test(byKey.protein_pasta.name) && /Barilla/i.test(byKey.protein_pasta.query)) warnings.push('Historical protein pasta: the recipe profile is Kroger while the locked Batch 15 catalog source is Barilla spaghetti. Preserve the completed batch record; use a separately verified current key for future menus.');
    if (byKey.kroger_protein_pasta) warnings.push('Kroger protein pasta: exact current SKU, package size, price and physical nutrition panel remain unverified. Do not substitute the historical Barilla spaghetti or Caprese Rotini records.');
    if (byKey.barilla_protein_plus_rotini) warnings.push('Barilla Protein+ Rotini: purchase GTIN 00076808533583. Capture the physical Nutrition Facts serving grams and receipt price before publishing Caprese macros or final cost.');
    if (byKey.whey && byKey.whey_vanilla) warnings.push('Protein powder: generic and vanilla lines may share one tub. Confirm the actual flavor before consolidating or buying two tubs.');
    if (byKey.garlic && /in water/i.test(byKey.garlic.packageLabel)) warnings.push('Garlic: jarred minced garlic in water is not dry fresh minced garlic. Do not add jar liquid to Nouman kofta; record the actual drained ingredient.');
    if (byKey.printed_label && byKey.printed_label.packagePrice === 0) warnings.push(`Label stock uses a zero marginal-cost allowance, not a verified empty-pantry purchase price. Confirm ${Math.ceil(byKey.printed_label.required/4)} Avery sheets for ${byKey.printed_label.required} labels. Duaa Khan's family exemption was owner-confirmed September 30. Print only from the verified current-batch Label Studio queue.`);
    if (byKey.beef_90_raw || byKey.chicken_thigh_raw) warnings.push('Case-meat prices are per-pound allocations from case receipts. Confirm available stock or actual whole-case purchase size; the displayed package checkout is not a supplier quote.');
    if (Number(byKey.chicken_wings_raw?.minimumPieceCount) > 0) {
      const pieces = Math.ceil(byKey.chicken_wings_raw.minimumPieceCount);
      const measuredBatch19 = /49-piece purchased lot average/i.test(byKey.chicken_wings_raw.name || '');
      warnings.push(measuredBatch19
        ? `Wings: current plan needs ${pieces} split flats/drumettes. The owner-reported Batch 19 purchased lot has 49 pieces / 3768 g raw bone-in, leaving ${49-pieces} pieces before cooking or added orders. Weigh actual portion pulls and verify the receipt price; gram-based on-hand stock alone does not verify piece count.`
        : `Wings: count at least ${pieces} usable individual split flats/drumettes for the plan. Raw pounds and the catalog price are planning estimates. Count and weigh the actual supplier lot; gram-based on-hand stock alone does not verify piece count.`);
    }
    if (byKey.mango_habanero_sauce) warnings.push('Mango-habanero sauce: the saved bottle mass and price are historical planning allowances. Verify the actual bottle, usable stock, ingredients/allergens and current package price; fluid ounces are not measured grams.');
    if (byKey.bottled_ranch) warnings.push('Bottled ranch: confirm the exact purchased product, package mass, ingredients/allergens and price. The recipe targets 40 g net per wing-box cup; an unconfigured row is unpriced, not free.');
    return warnings;
  }

  function summary(rows) {
    const buy = (rows || []).filter(row => !row.nonPurchase && row.needed > 0);
    const stocked = (rows || []).filter(row => !row.nonPurchase && row.needed <= 0);
    return {
      ingredients: rows.length,
      buyItems: buy.length,
      stockedItems: stocked.length,
      unconfigured: buy.filter(row => !row.configured).length,
      underBought: buy.filter(row => row.shortAmount > 0).length,
      estimatedCost: rounded(buy.reduce((sum, row) => sum + row.estimatedCost, 0), 2),
      batchUsageCost: rounded((rows || []).reduce((sum, row) => sum + row.usageCost, 0), 2),
      foodUsageCost: rounded((rows || []).filter(row => !row.packaging).reduce((sum, row) => sum + row.usageCost, 0), 2),
      packagingUsageCost: rounded((rows || []).filter(row => row.packaging).reduce((sum, row) => sum + row.usageCost, 0), 2),
    };
  }

  function csv(rows) {
    const cells = value => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const header = ['Store section','Ingredient','Required','Unit','Estimated shopping count / required piece floor','On hand','Need','Packages','Package','Estimated cost','Source'];
    return [header, ...(rows || []).filter(row => row.needed > 0).map(row => [
      row.section, row.name, row.required, row.unit, Number(row.minimumPieceCount) > 0 ? `At least ${Math.ceil(row.minimumPieceCount)} ${row.pieceCountBasis || 'individual pieces'}; verify actual count separately from weight` : row.estimatedCount?.label || '', row.onHand, row.needed, row.packages,
      row.packageLabel || `${row.packageSize} ${row.unit}`, row.estimatedCost, row.store,
    ])].map(row => row.map(cells).join(',')).join('\r\n');
  }

  return { SECTION_ORDER, shoppingSection, estimatedProduceCount, mergeRequirements, applyRequirementAdjustments, buildPurchaseRows, packagingRequirements, dishSpecificSauceCupCount, dishSpecificPackagingRequirements, catalogValidationWarnings, summary, csv };
});
