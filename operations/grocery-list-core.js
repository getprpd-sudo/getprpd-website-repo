(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.PRPD_GROCERY_CORE = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
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
    'Meat & Seafood': new Set(['beef_90_raw','ny_strip_raw','leg_quarter_raw','chicken_thigh_raw','shrimp_raw','tilapia_raw','beef_strips_raw','beef_bacon']),
    'Produce': new Set(['apple','banana','blueberry','broccoli','carrot','cilantro','cucumber','garlic','ginger','green_bell_pepper','lettuce','jalapeno','lemon','lime','mushroom','mixed_vegetables','onion','red_onion','spinach','strawberry','tomato','potato','zucchini']),
    'Dairy & Eggs': new Set(['egg','egg_white','mascarpone','philadelphia_no_bake','reduced_cream_cheese','cotija','fage','fairlife_milk','cottage','mozzarella','butter','simple_truth_yogurt','whipped_cream']),
    'Bread & Tortillas': new Set(['large_tortilla','small_tortilla','fajita_tortilla','shawarma_bread','bread_slice','hawaiian_roll','sourdough_slice','english_muffin']),
    'Sweets & Baking': new Set(['banana_pudding_mix','biscoff_cookie','biscoff_spread','brown_sugar','chia','chocolate_chips','cinnamon','cocoa','coriander','honey','ladyfingers','oats','oreo_thin','peanut_butter','powdered_sugar','whey','vanilla']),
    'Packaging': new Set(['sauce_cup','printed_label','dessert_cup','meal_container','paper_bag','food_prep_gloves','kitchen_consumable_allowance']),
  };
  const PACKAGING_KEYS = SECTION_KEYS.Packaging;
  const PURCHASE_ALIASES = {
    simple_truth_yogurt: { key: 'fage', name: 'Nonfat Greek yogurt' },
    fage: { key: 'fage', name: 'Nonfat Greek yogurt' },
  };
  // Practical shopping estimates only. Recipe weights remain the source of truth because
  // individual produce size and usable yield vary. Values are average usable grams per item.
  const PRODUCE_COUNT_ESTIMATES = {
    apple: { gramsEach: 155, singular: 'small apple', plural: 'small apples' },
    banana: { gramsEach: 118, singular: 'medium banana', plural: 'medium bananas' },
    carrot: { gramsEach: 61, singular: 'medium carrot', plural: 'medium carrots' },
    cilantro: { gramsEach: 50, singular: 'bunch', plural: 'bunches' },
    cucumber: { gramsEach: 300, singular: 'medium cucumber', plural: 'medium cucumbers' },
    green_bell_pepper: { gramsEach: 160, singular: 'pepper', plural: 'peppers' },
    jalapeno: { gramsEach: 14, singular: 'jalapeno', plural: 'jalapenos' },
    lemon: { gramsEach: 48, singular: 'lemon', plural: 'lemons' },
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
      current.required += Math.max(0, Number(amount) || 0);
      current.sources.add(source);
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
    for (const item of packaging || []) add(item, item.required, 'Packaging');

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
    return (requirements || []).map((item) => {
      const base = catalog[item.key] || {};
      const override = saved.catalog?.[item.key] || {};
      const entry = { ...base, ...override };
      const packageSize = Math.max(0, Number(entry.packageSize) || 0);
      const packagePrice = Math.max(0, Number(entry.price) || 0);
      const onHand = Math.max(0, Number(saved.onHand?.[item.key]) || 0);
      const needed = Math.max(0, item.required - onHand);
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
  }

  function packagingRequirements(plannedCounts, orders, saucePlan, labelCount = 0, dishSpecificSauceCups = 0) {
    const isDessert = item => String(item.id || '').startsWith('d') || String(item.id || '') === 'a3' || (!item.id && item.tier === 'single');
    const desserts = (plannedCounts || []).reduce((sum, item) => sum + (isDessert(item) ? Number(item.total) || 0 : 0), 0);
    const meals = (plannedCounts || []).reduce((sum, item) => sum + (!isDessert(item) ? Number(item.total) || 0 : 0), 0);
    const weeklySauceCups = (saucePlan?.sauces || []).reduce((sum, sauce) => sum + Number(sauce.customerCups || 0) + Number(sauce.qcCups || 0), 0);
    const sauceCups = weeklySauceCups + Math.max(0, Number(dishSpecificSauceCups) || 0);
    return [
      { key: 'meal_container', name: 'Meal containers with lids', unit: 'each', station: 'Packaging', required: meals },
      { key: 'dessert_cup', name: 'Dessert cups with lids', unit: 'each', station: 'Packaging', required: desserts },
      { key: 'sauce_cup', name: '2 oz sauce cups with lids', unit: 'each', station: 'Packaging', required: sauceCups },
      { key: 'paper_bag', name: 'Paper delivery bags', unit: 'each', station: 'Packaging', required: (orders || []).length },
      { key: 'printed_label', name: 'Avery 5168 labels', unit: 'each', station: 'Packaging', required: labelCount },
      { key: 'food_prep_gloves', name: 'Disposable food-prep gloves', unit: 'box', station: 'Packaging', required: 1 },
      { key: 'kitchen_consumable_allowance', name: 'Gloves and cleaning allowance', unit: 'each', station: 'Packaging', required: meals + desserts },
    ].filter(item => item.required > 0);
  }

  function summary(rows) {
    const buy = (rows || []).filter(row => row.needed > 0);
    const stocked = (rows || []).filter(row => row.needed <= 0);
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
    const header = ['Store section','Ingredient','Required','Unit','Estimated shopping count','On hand','Need','Packages','Package','Estimated cost','Source'];
    return [header, ...(rows || []).filter(row => row.needed > 0).map(row => [
      row.section, row.name, row.required, row.unit, row.estimatedCount?.label || '', row.onHand, row.needed, row.packages,
      row.packageLabel || `${row.packageSize} ${row.unit}`, row.estimatedCost, row.store,
    ])].map(row => row.map(cells).join(',')).join('\r\n');
  }

  return { SECTION_ORDER, shoppingSection, estimatedProduceCount, mergeRequirements, applyRequirementAdjustments, buildPurchaseRows, packagingRequirements, summary, csv };
});
