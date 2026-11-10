const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const production = require('../operations/nutrition/production-data');
const config = require('../config/order-config');
const { validateLabelProduction } = require('../operations/label-production-guard');
const labelStudioSource = fs.readFileSync(
  path.join(__dirname, '../operations/label-studio-app.js'),
  'utf8',
);

function loadLabelData() {
  const source = fs.readFileSync(
    path.join(__dirname, '../operations/nutrition/next-menu-label-data.js'),
    'utf8',
  );
  const context = { window: {} };
  vm.runInNewContext(source, context);
  return context.window.PRPD_NEXT_LABEL_DATA;
}

test('Batch 16 Sweet Chili Bulk exists in both production and label data', () => {
  const labels = loadLabelData();
  assert.ok(production.meals.bw1.tiers.lean);
  assert.ok(production.meals.bw1.tiers.bulk);
  assert.ok(labels.meals.bw1.tiers.lean);
  assert.ok(labels.meals.bw1.tiers.bulk);
});

test('Batch 16 labels use the owner-approved Saturday-through-Wednesday five-day window', () => {
  const labels = loadLabelData();
  assert.deepEqual(
    JSON.parse(JSON.stringify(config.batch.labelProduction)),
    {
      madeDate: '2026-10-24',
      useByDate: '2026-10-28',
      batchId: 'B16-1024',
      completedAt: '2026-10-24T00:00:00-05:00',
      refrigeratedDays: 5,
    },
  );
  assert.equal(labels.production.madeDate, '2026-10-24');
  assert.equal(labels.production.useByDate, '2026-10-28');
  assert.equal(labels.production.refrigeratedDays, 5);
  const result = validateLabelProduction({
    activeBatch: config.batch,
    activeMenu: config.menu,
    labelData: labels,
    form: {
      madeDate: config.batch.labelProduction.madeDate,
      useByDate: config.batch.labelProduction.useByDate,
      batchId: config.batch.labelProduction.batchId,
    },
  });
  assert.equal(result.ok, true, result.errors.join(' '));
  assert.match(labelStudioSource, /refrigeratedDays - 1/);
  assert.doesNotMatch(labelStudioSource, /date\.setUTCDate\(date\.getUTCDate\(\) \+ 3\)/);
});

test('Label Studio carries the private $5 feedback reward as a separate bag-label job', () => {
  assert.match(labelStudioSource, /Customer bag feedback labels|customer bag label/i);
  assert.match(labelStudioSource, /bag-reward-value">\$5/);
  assert.match(labelStudioSource, /fetch\('\/api\/feedback-admin'/);
  assert.match(labelStudioSource, /getprpd\\\.com\\\/feedback/);
});

test('Sweet Chili labels include the required 30g side cup in the approved working weight', () => {
  const labels = loadLabelData();
  for (const [tier, grams] of [['lean', 354], ['bulk', 458]]) {
    const payload = labels.meals.bw1.tiers[tier];
    assert.equal(payload.netWeight, `Est. ${(grams / 28.3495).toFixed(1)} oz (${grams} g)`);
    assert.equal(payload.netWeightStatus, 'estimated');
    assert.equal(payload.estimatedNetWeightGrams, grams);
  }
});

test('Sweet Chili Bulk complete-package nutrition includes the required side cup', () => {
  const nutrition = loadLabelData().meals.bw1.tiers.bulk.nutrition;
  assert.deepEqual(
    JSON.parse(JSON.stringify(nutrition)),
    {
      calories: 655,
      protein: 58,
      carbs: 57,
      fiber: 2,
      fat: 21,
      satFat: 5.3,
      transFat: 0.1,
      cholesterol: 280,
      sodium: 2170,
      sugars: 0,
      addedSugar: 0,
      vitaminD: 0.4,
      calcium: 50,
      iron: 3.3,
      potassium: 720,
    },
  );
});
