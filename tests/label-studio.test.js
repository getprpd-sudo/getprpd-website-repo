const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');

const html = fs.readFileSync(
  path.join(__dirname, '..', 'operations', 'label-studio.html'),
  'utf8'
);
const app = fs.readFileSync(
  path.join(__dirname, '..', 'operations', 'label-studio-app.js'),
  'utf8'
);
const nextDataPath = path.join(
  __dirname,
  '..',
  'operations',
  'nutrition',
  'next-menu-label-data.js'
);
const config = require('../operations/active/BATCH_7_DRAFT_ORDER_CONFIG');
const {
  validateLabelMenu,
  validateLabelProduction,
  encodeLabelPrintPlan,
  parseLabelPrintPlan,
} = require('../operations/label-production-guard');

function nextLabelData() {
  const source = fs.readFileSync(nextDataPath, 'utf8');
  const context = { window: {} };
  vm.runInNewContext(source, context);
  return context.window.PRPD_NEXT_LABEL_DATA;
}

test('Avery 5168 uses the official portrait sheet and rotated safe-inset artwork', () => {
  const printCss = html.slice(html.indexOf('@media print'));

  assert.match(printCss, /@page\s*\{\s*size:\s*letter portrait;/);
  assert.match(printCss, /\.print-page\s*\{[\s\S]*?width:\s*8\.5in;[\s\S]*?height:\s*11in;/);
  assert.match(printCss, /\.print-slot\s*\{[\s\S]*?width:\s*3\.5in;[\s\S]*?height:\s*5in;[\s\S]*?border-radius:\s*0\.1in;/);
  assert.match(printCss, /\.print-slot \.meal-label\s*\{[\s\S]*?width:\s*5in;[\s\S]*?height:\s*3\.5in;[\s\S]*?transform-origin:\s*0 0;[\s\S]*?transform:\s*translate\(3\.43in, 0\.1in\) rotate\(90deg\) scale\(0\.96\);/);
  assert.match(app, /return `<div class="print-slot">\$\{markup\}<\/div>`;/);
  assert.doesNotMatch(app, /foreignObject/);
});

test('Avery 5168 slots match the official portrait positions with no row gap', () => {
  const expected = [
    [1, '0.5in', '0.5in'],
    [2, '0.5in', '4.5in'],
    [3, '5.5in', '0.5in'],
    [4, '5.5in', '4.5in'],
  ];

  for (const [slot, top, left] of expected) {
    const rule = new RegExp(
      `\\.print-slot:nth-child\\(${slot}\\) \\{ top: ${top}; left: ${left}; \\}`
    );
    assert.match(html, rule);
  }
});

test('a validated URL print plan can reproduce an exact mixed-label production queue', () => {
  assert.match(app, /function applyPrintPlan\(params\)/);
  assert.match(app, /PRODUCTION_GUARD\.parseLabelPrintPlan\(params\.get\('plan'\), LABEL_DATA\)/);
  assert.match(app, /Number\(declaredCount\) !== validation\.totalLabels/);
  assert.match(app, /labelQuantities\.set\(key, labels\)/);
  assert.match(app, /labels\.slice\(index, index \+ 4\)/);
  assert.match(app, /while \(printed\.length < 4\) printed\.push\(printSlotMarkup\(''\)\)/);
  assert.match(html, /exact individual-label count/);
  assert.match(app, /const printPlanApplied = applyPrintPlan\(params\)/);
  assert.match(app, /if \(!printPlanContextMatches\(params\)\)/);
  assert.doesNotMatch(app, /resolvedTierKey|Number\.parseInt\(quantity/);
});

test('exact label plans are all-or-nothing for meal, tier, and integer quantity', () => {
  const data = nextLabelData();
  const valid = parseLabelPrintPlan('b1:lean:3,m1:bulk:4,d1:single:1', data);
  assert.equal(valid.ok, true);
  assert.equal(valid.totalLabels, 8);
  assert.deepEqual(valid.entries.map(entry => [entry.id, entry.tier, entry.labels]), [
    ['b1', 'lean', 3],
    ['m1', 'bulk', 4],
    ['d1', 'single', 1],
  ]);

  for (const invalid of [
    'b1:lean:0',
    'b1:lean:-1',
    'b1:lean:1.5',
    'b1:lean:201',
    'b1:lean:abc',
    'b1:lean:1:extra',
    'b1:lean:1,',
    'missing:lean:1',
    'd1:lean:1',
    'b1:lean:1,b1:lean:2',
  ]) {
    const result = parseLabelPrintPlan(invalid, data);
    assert.equal(result.ok, false, `${invalid} should be blocked`);
    assert.deepEqual(result.entries, [], `${invalid} must not leave a partial printable queue`);
    assert.equal(result.totalLabels, 0);
  }
});

test('planner encoding preserves exact Lean, Bulk, and Single label builds', () => {
  const data = nextLabelData();
  const encoded = encodeLabelPrintPlan([
    { id:'b1', name:'Blueberry Cheesecake Protein Pancakes', tier:'lean', labels:3 },
    { id:'m6', name:'Cajun Garlic Salmon', tier:'bulk', labels:4 },
    { id:'d1', name:'Baked Strawberry-Lemon Protein Cheesecake', tier:'single', labels:1 },
  ], data);
  assert.equal(encoded.ok, true);
  assert.equal(encoded.totalLabels, 8);
  assert.equal(encoded.encoded, 'b1:lean:3,m6:bulk:4,d1:single:1');
  assert.equal(data.meals.m6.tiers.bulk.nutrition.calories, config.menu.mains.find(item => item.id === 'm6').bulkMacros.cal);
  assert.ok(data.meals.m6.tiers.bulk.ingredients);
  assert.ok(data.meals.m6.tiers.bulk.allergens);

  const archived = encodeLabelPrintPlan([
    { id:'archived_bbq', name:'BBQ Chicken Mac & Cheese', tier:'bulk', labels:7 },
  ], data);
  assert.equal(archived.ok, false);
  assert.match(archived.errors.join(' '), /locked orders but missing from the active generated label dataset/);
});

test('Batch 7 labels contain every menu dish and add-on', () => {
  const source = fs.readFileSync(
    path.join(__dirname, '..', 'operations', 'nutrition', 'next-menu-label-data.js'),
    'utf8'
  );
  const context = { window: {} };
  vm.runInNewContext(source, context);

  assert.equal(Object.keys(context.window.PRPD_NEXT_LABEL_DATA.meals).length, 18);
  assert.equal(context.window.PRPD_NEXT_LABEL_DATA.status, 'batch-7-approved');
  assert.match(html, /Batch 7 controlled labels/);
  assert.match(html, /window\.PRPD_LABEL_DATA = window\.PRPD_NEXT_LABEL_DATA/);
});

test('Batch 7 studio defaults use the current production dates and batch ID', () => {
  const data = nextLabelData();
  assert.deepEqual(JSON.parse(JSON.stringify(data.production)), {
    batchNumber: 7,
    deliveryDate: 'Saturday, August 22, 2026',
    madeDate: '2026-08-21',
    useByDate: '2026-08-24',
    batchId: 'B7-0821',
  });
  assert.deepEqual(config.batch.labelProduction, {
    madeDate: '2026-08-21',
    useByDate: '2026-08-24',
    batchId: 'B7-0821',
  });
  assert.match(html, /id="madeDate" type="date" readonly/);
  assert.match(html, /id="useBy" type="date" readonly/);
  assert.match(html, /id="batchId" readonly/);
  assert.doesNotMatch(html, /B[1-4]-/);
});

test('label printing fails closed for stale dates, stale datasets, and stale URL plans', () => {
  const data = nextLabelData();
  const currentForm = {
    madeDate: config.batch.labelProduction.madeDate,
    useByDate: config.batch.labelProduction.useByDate,
    batchId: config.batch.labelProduction.batchId,
  };
  assert.equal(validateLabelProduction({ activeBatch: config.batch, activeMenu: config.menu, labelData: data, form: currentForm }).ok, true);

  const staleForm = { madeDate: '2026-07-24', useByDate: '2026-07-31', batchId: 'B3-0724' };
  const staleFormResult = validateLabelProduction({ activeBatch: config.batch, activeMenu: config.menu, labelData: data, form: staleForm });
  assert.equal(staleFormResult.ok, false);
  assert.match(staleFormResult.errors.join(' '), /printable made date|printable refrigerate-through date|printable batch ID/);

  const staleData = {
    ...data,
    production: { ...data.production, madeDate: '2026-07-24', useByDate: '2026-07-31' },
  };
  const staleDataResult = validateLabelProduction({ activeBatch: config.batch, activeMenu: config.menu, labelData: staleData, form: currentForm });
  assert.equal(staleDataResult.ok, false);
  assert.match(staleDataResult.errors.join(' '), /dataset made date|dataset refrigerate-through date/);

  assert.match(app, /let printPlanErrors = \[\]/);
  assert.match(app, /The URL print plan does not identify this active batch and cannot be used/);
  assert.match(app, /URL label-count total does not match the exact label plan/);
  assert.match(html, /body\.label-print-blocked \.print-sheet \{ display: none !important; \}/);
  assert.match(app, /window\.addEventListener\('beforeprint'/);
});

test('Batch 7 labels use meal-specific handling instructions and final net weights', () => {
  const source = fs.readFileSync(nextDataPath, 'utf8').trim();
  const data = JSON.parse(source.slice('window.PRPD_NEXT_LABEL_DATA = '.length, -1));
  const meals = Object.values(data.meals);
  for (const meal of meals) {
    assert.ok(meal.reheat, `${meal.name} is missing handling instructions`);
    for (const tier of Object.values(meal.tiers)) {
      assert.match(tier.netWeight, /^(?:Est\. )?(?:\d+(?:\.\d+)? oz \()?\d+ g\)?$/, `${meal.name} has an invalid net-weight declaration`);
    }
  }
  for (const name of ['Baked Strawberry-Lemon Protein Cheesecake', 'Banana Cream Pie Cup', 'High Protein Tiramisu']) {
    const dessert = meals.find(meal => meal.name === name);
    assert.match(dessert.reheat, /Serve chilled\. Do not heat\./);
  }
  assert.match(meals.find(meal => meal.name === 'Mini Chicken Snack Wrap').reheat, /Enjoy chilled|Microwave/);
  for (const excluded of ['Strawberry Cheesecake','Cheeseburger Hot Pockets','Strawberry Protein Overnight Oats']) {
    assert.equal(meals.some(meal => meal.name === excluded), false);
  }
});

test('all 30 Batch 7 labels match the controlled nutrition calculator', () => {
  const verifier = path.join(
    __dirname,
    '..',
    'operations',
    'nutrition',
    'verify_next_menu_labels.py'
  );
  const output = execFileSync('python', [verifier], {
    cwd: path.join(__dirname, '..'),
    encoding: 'utf8',
  });

  assert.match(output, /Verified 18 dishes and 30 label builds\./);
});

test('active studio promotes the generated Batch 7 dataset without manual carryovers', () => {
  assert.match(html, /window\.PRPD_NEXT_LABEL_DATA/);
  assert.doesNotMatch(html, /manualBbq/);
});

test('generated label IDs, names, categories, and tiers exactly match the live customer menu', () => {
  const data = nextLabelData();
  const expected = [
    ['breakfasts', 'Breakfast', ['lean', 'bulk']],
    ['mains', 'Main', ['lean', 'bulk']],
    ['desserts', 'Dessert', ['single']],
    ['addons', 'Add-on', ['single']],
  ].flatMap(([section, category, tiers]) => config.menu[section].map(item => ({ item, category, tiers })));

  assert.deepEqual(Object.keys(data.meals), expected.map(({ item }) => item.id));
  for (const { item, category, tiers } of expected) {
    assert.equal(data.meals[item.id].name, item.name);
    assert.equal(data.meals[item.id].category, category);
    assert.deepEqual(Object.keys(data.meals[item.id].tiers), tiers);
  }
  assert.equal(validateLabelMenu(config.menu, data).ok, true);
});

test('menu parity blocks renamed, extra, wrong-tier, incomplete, and macro-stale labels', () => {
  const mutate = callback => {
    const data = JSON.parse(JSON.stringify(nextLabelData()));
    callback(data);
    return validateLabelMenu(config.menu, data);
  };

  const renamed = mutate(data => { data.meals.m1.name = 'Archived Cottage Pie'; });
  assert.equal(renamed.ok, false);
  assert.match(renamed.errors.join(' '), /stale generated label name/);

  const extra = mutate(data => {
    data.meals.x1 = JSON.parse(JSON.stringify(data.meals.m1));
    data.meals.x1.name = 'BBQ Chicken Mac & Cheese';
  });
  assert.equal(extra.ok, false);
  assert.match(extra.errors.join(' '), /not on the active customer menu/);

  const wrongTier = mutate(data => { data.meals.d1.tiers = { lean: data.meals.d1.tiers.single }; });
  assert.equal(wrongTier.ok, false);
  assert.match(wrongTier.errors.join(' '), /exactly single label tier/);

  const incomplete = mutate(data => {
    data.meals.b1.tiers.lean.ingredients = '';
    data.meals.b1.tiers.lean.allergens = '';
  });
  assert.equal(incomplete.ok, false);
  assert.match(incomplete.errors.join(' '), /missing ingredients|missing its allergen declaration/);

  const staleMacro = mutate(data => { data.meals.b1.tiers.lean.nutrition.calories += 10; });
  assert.equal(staleMacro.ok, false);
  assert.match(staleMacro.errors.join(' '), /calories does not match the active customer menu/);
});

test('studio has no legacy dataset fallback and generated label facts are read-only', () => {
  assert.doesNotMatch(html, /<script src="nutrition\/label-data\.js/);
  assert.match(html, /window\.PRPD_LABEL_DATA = window\.PRPD_NEXT_LABEL_DATA \|\| null/);
  assert.match(app, /the generated active-batch label dataset did not load/);
  assert.match(app, /activeMenu: ACTIVE_MENU/);
  for (const id of ['netWeight', 'ingredients', 'allergens', 'personality', 'storage', 'reheat']) {
    assert.match(html, new RegExp(`id="${id}"[^>]*readonly`));
  }
  assert.match(html, /id="storageMode" disabled/);
});

test('desktop launcher verifies saved labels without silently regenerating them', () => {
  const launcher = fs.readFileSync(path.join(__dirname, '..', 'open-label-studio.bat'), 'utf8');
  assert.match(launcher, /python operations\\nutrition\\verify_next_menu_labels\.py/);
  assert.match(launcher, /LABEL STUDIO BLOCKED/);
  assert.doesNotMatch(launcher, /generate_next_menu_label_data\.py/);
});
