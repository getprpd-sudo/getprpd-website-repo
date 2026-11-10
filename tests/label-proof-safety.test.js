const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const guard = require('../operations/label-production-guard');

const app = fs.readFileSync(path.join(__dirname, '../operations/label-studio-app.js'), 'utf8');

function fixture({ proofOnly = false, unverified = false } = {}) {
  const nutrition = Object.fromEntries([
    'calories', 'protein', 'carbs', 'fiber', 'fat', 'satFat', 'transFat',
    'cholesterol', 'sodium', 'sugars', 'addedSugar', 'vitaminD', 'calcium', 'iron', 'potassium',
  ].map(key => [key, 1]));
  const macros = { cal: 1, protein: 1, carbs: 1, fiber: 1, fat: 1 };
  const production = {
    batchNumber: 13, deliveryDate: '2026-10-03', madeDate: '2026-10-02',
    useByDate: '2026-10-05', batchId: 'B13-1002',
  };
  const tier = label => ({
    label, netWeight: unverified ? 'Not measured' : '10 oz (283 g)',
    ...(unverified ? { netWeightVerified: false } : {}),
    ingredients: 'Chicken, rice.', allergens: 'CONTAINS: NONE.', nutrition,
  });
  const data = {
    proofOnly, status: 'batch-13-generated', production,
    meals: { b1: {
      name: 'Sample breakfast', category: 'Breakfast', description: 'Chicken and rice.',
      reheat: 'Heat thoroughly.', storageMode: 'fridge', note: 'Sample.',
      ...(unverified ? { productionHold: 'Finished weight not measured.' } : {}),
      tiers: { lean: tier('Lean'), bulk: tier('Bulk') },
    } },
  };
  const config = {
    batch: { number: 13, deliveryDate: production.deliveryDate, labelProduction: production },
    menu: { breakfasts: [{ id: 'b1', name: 'Sample breakfast', macros, bulkMacros: macros }], mains: [], premium: [], desserts: [], addons: [] },
  };
  return { data, config, production };
}

// Run the real studio renderer with only the browser's element/event surface stubbed.
function studio(data, config, { proofRequested = false, currentReviewRequested = false } = {}) {
  const elements = new Map();
  function element(id) {
    if (elements.has(id)) return elements.get(id);
    const classes = new Set();
    const el = {
      value: '', textContent: '', disabled: false, _html: '',
      classList: {
        add: value => classes.add(value),
        contains: value => classes.has(value),
        toggle(value, enabled) { if (enabled) classes.add(value); else classes.delete(value); },
      },
      addEventListener() {},
      get innerHTML() { return this._html; },
      set innerHTML(value) {
        this._html = value;
        if (id.endsWith('Select')) this.value = /<option value="([^"]+)"/.exec(value)?.[1] || '';
      },
    };
    elements.set(id, el);
    return el;
  }
  const params = new URLSearchParams({
    plan: 'b1:lean:3,b1:bulk:2', count: '5', made: '2026-10-02', useBy: '2026-10-05', batch: 'B13-1002',
    ...(proofRequested ? { proof: '1' } : {}),
    ...(currentReviewRequested ? { reviewProof: '1' } : {}),
  });
  const document = { body: element('body'), getElementById: element, querySelectorAll: () => [] };
  const window = {
    location: { search: `?${params}` }, PRPD_LABEL_DATA: data, PRPD_ORDER_CONFIG: config,
    PRPD_LABEL_PRODUCTION_GUARD: guard, addEventListener() {},
  };
  vm.runInNewContext(app, { document, window, URLSearchParams });
  return { elements, document };
}

test('every printable proof label and preview carries a visible draft notice', () => {
  const { data, config } = fixture({ proofOnly: true, unverified: true });
  const { elements, document } = studio(data, config, { proofRequested: true });
  const queue = elements.get('printSheet').innerHTML;
  assert.equal((queue.match(/class="meal-label"/g) || []).length, 5);
  assert.equal((queue.match(/DRAFT - NOT FOR FOOD LABELING/g) || []).length, 5);
  assert.equal((queue.match(/weight unverified/g) || []).length, 5);
  assert.match(elements.get('previewMount').innerHTML, /DRAFT - NOT FOR FOOD LABELING/);
  assert.match(elements.get('productionGate').textContent, /REVIEW PROOF ONLY/);
  assert.equal(elements.get('printButton').textContent, 'Print marked review proof');
  assert.equal(document.body.classList.contains('label-print-blocked'), false);
});

test('a valid final queue keeps its original five labels without draft marks', () => {
  const { data, config } = fixture();
  const { elements, document } = studio(data, config);
  const queue = elements.get('printSheet').innerHTML;
  assert.equal((queue.match(/class="meal-label"/g) || []).length, 5);
  assert.doesNotMatch(queue, /label-proof-mark|weight unverified/);
  assert.equal(document.body.classList.contains('label-print-blocked'), false);
});

test('a proof URL cannot bypass holds or unknown weight on non-proof data', () => {
  const { data, config } = fixture({ unverified: true });
  const { elements, document } = studio(data, config, { proofRequested: true });
  assert.equal(document.body.classList.contains('label-print-blocked'), true);
  assert.equal(elements.get('printSheet').innerHTML, '');
});

test('proof data can be reviewed but cannot be released as final production labels', () => {
  const { data, config, production } = fixture({ proofOnly: true, unverified: true });
  assert.equal(guard.parseLabelPrintPlan('b1:lean:3', data).ok, true);
  const result = guard.validateLabelProduction({ activeBatch: config.batch, activeMenu: config.menu, labelData: data, form: production });
  assert.equal(result.ok, false);
  assert.match(result.errors.join(' '), /Review-only proof/);
});

test('final label plan rejects unknown, zero and explicitly unverified weight', () => {
  for (const value of ['', 'Not measured', 'UNVERIFIED', '0 g', '0 oz (283 g)', '-10 g']) {
    const { data } = fixture();
    data.meals.b1.tiers.lean.netWeight = value;
    const result = guard.parseLabelPrintPlan('b1:lean:1', data);
    assert.equal(result.ok, false, value);
    assert.equal(result.entries.length, 0);
  }
  for (const marker of [{ netWeightVerified: false }, { netWeightStatus: 'unverified' }]) {
    const { data } = fixture();
    Object.assign(data.meals.b1.tiers.lean, marker);
    assert.equal(guard.parseLabelPrintPlan('b1:lean:1', data).ok, false);
  }
});

test('packout-required labels load into the queue but print only after an actual weight is entered', () => {
  const { data, config, production } = fixture();
  const tier=data.meals.b1.tiers.lean;
  Object.assign(tier,{netWeight:'Enter packed weight',netWeightVerified:false,netWeightStatus:'packout-required',requiresPackoutWeight:true});
  assert.equal(guard.parseLabelPrintPlan('b1:lean:1',data).ok,true);
  const selectedVariants=new Set(['b1:lean']);
  const missing=guard.validateLabelProduction({activeBatch:config.batch,activeMenu:config.menu,labelData:data,form:production,selectedVariants,netWeightOverrides:{}});
  assert.equal(missing.ok,false);
  assert.match(missing.errors.join(' '),/actual packed net weight/);
  const ready=guard.validateLabelProduction({activeBatch:config.batch,activeMenu:config.menu,labelData:data,form:production,selectedVariants,netWeightOverrides:{'b1:lean':'10.0 oz (284 g)'}});
  assert.equal(ready.ok,true);
});

test('current review shows unknown nutrients honestly and cannot release final labels', () => {
  const { data, config, production } = fixture({ proofOnly: true, unverified: true });
  data.currentReviewProof = true;
  for (const tier of Object.values(data.meals.b1.tiers)) {
    tier.nutrition = { calories: 360, protein: 34, carbs: 26, fat: 13 };
    tier.nutritionComplete = false;
    tier.netWeight = '';
    tier.requiresPackoutWeight = true;
  }
  const { elements, document } = studio(data, config, { currentReviewRequested: true });
  const html = elements.get('printSheet').innerHTML;
  assert.equal((html.match(/class="meal-label"/g) || []).length, 5);
  assert.equal((html.match(/DRAFT - NOT FOR FOOD LABELING/g) || []).length, 5);
  assert.equal((html.match(/Made \(provisional\)/g) || []).length, 5);
  assert.equal((html.match(/Full Nutrition Facts not established/g) || []).length, 5);
  assert.equal((html.match(/Other nutrients and daily values: UNKNOWN/g) || []).length, 5);
  assert.doesNotMatch(html, /undefined|NaN|Sodium 0mg/);
  assert.equal(document.body.classList.contains('label-print-blocked'), false);
  assert.equal(guard.validateLabelProduction({activeBatch:config.batch,activeMenu:config.menu,labelData:data,form:production}).ok, false);
  data.proofOnly = false;
  assert.equal(guard.parseLabelPrintPlan('b1:lean:3', data).ok, false);
  assert.equal(studio(data, config, {currentReviewRequested:true}).document.body.classList.contains('label-print-blocked'), true);
});

test('current review cannot mask missing core macro values', () => {
  const { data } = fixture({proofOnly:true});
  data.currentReviewProof = true;
  data.meals.b1.tiers.lean.nutrition = {calories:360, protein:34, carbs:26};
  data.meals.b1.tiers.lean.nutritionComplete = false;
  assert.equal(guard.parseLabelPrintPlan('b1:lean:3', data).ok, false);
});

test('current review loader copies current data and preserves historical proof and final datasets', () => {
  const html = fs.readFileSync(path.join(__dirname, '../operations/label-studio.html'), 'utf8');
  const loader = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
    .map(match=>match[1]).find(source=>source.includes('const currentReviewRequested'));
  assert.ok(loader);
  const source = fixture().data;
  const original = JSON.stringify(source);
  const historical = {proofOnly:true, meals:{historical:{}}};
  const load = search => {
    const window = {PRPD_NEXT_LABEL_DATA:source,PRPD_BATCH13_PROOF_DATA:historical,PRPD_ORDER_CONFIG:{batch:{number:17}}};
    vm.runInNewContext(loader, {window,location:{search},URLSearchParams,document:{getElementById:()=>({})}});
    return window.PRPD_LABEL_DATA;
  };
  const review = load('?reviewProof=1');
  assert.equal(review.currentReviewProof,true);
  assert.equal(review.proofOnly,true);
  assert.notEqual(review,source);
  assert.equal(JSON.stringify(source),original);
  assert.equal(load(''),source);
  assert.equal(load('?proof=1'),historical);
  assert.equal(load('?proof=1&reviewProof=1'),historical);
});

test('final labels can retain an earlier prepared-component date without resetting it at assembly', () => {
  const { data, config } = fixture();
  const production = {
    ...config.batch.labelProduction,
    madeDate: '2026-10-01', useByDate: '2026-10-04', batchId: 'B13-1001',
    dateBasis: 'earliest-prepared-component', plannedComponentDate: '2026-10-01',
  };
  config.batch.labelProduction = production;
  data.production = {...data.production, ...production};
  assert.equal(guard.validateLabelProduction({activeBatch:config.batch,activeMenu:config.menu,labelData:data,form:production}).ok,true);
  config.batch.labelProduction.plannedComponentDate = '2026-10-02';
  assert.equal(guard.validateLabelProduction({activeBatch:config.batch,activeMenu:config.menu,labelData:data,form:production}).ok,false);
  Object.assign(production, {madeDate:'2026-09-25',plannedComponentDate:'2026-09-25',useByDate:'2026-09-28',batchId:'B13-0925'});
  Object.assign(data.production, production);
  assert.equal(guard.validateLabelProduction({activeBatch:config.batch,activeMenu:config.menu,labelData:data,form:production}).ok,false);
});
