const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const config = require('../config/order-config.js');
const details = require('../config/menu-details.js').batches[21];
const guard = require('../operations/label-production-guard.js');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'operations/nutrition/next-menu-label-data.js'), 'utf8'), context);
const labels = context.window.PRPD_NEXT_LABEL_DATA;
const menuItems = Object.values(config.menu).flat().filter(item => item.macros);

test('required cup nutrition is included in the card, detail and final label', () => {
  for (const id of ['b2', 'm1', 'm7']) {
    const item = menuItems.find(row => row.id === id);
    for (const tier of ['lean', 'bulk']) {
      const card = tier === 'bulk' ? item.bulkMacros : item.macros;
      const label = labels.meals[id].tiers[tier];
      const detail = details[id].tiers[tier];
      for (const [cardKey, labelKey] of Object.entries({cal: 'calories', protein: 'protein', carbs: 'carbs', fiber: 'fiber', fat: 'fat'})) {
        assert.equal(card[cardKey], label.nutrition[labelKey], `${id} ${tier} ${cardKey}`);
        assert.equal(detail.nutrition[labelKey], label.nutrition[labelKey], `${id} ${tier} detail ${labelKey}`);
      }
    }
  }
});

test('all current labels require an actual packed net weight', () => {
  for (const meal of Object.values(labels.meals)) {
    for (const tier of Object.values(meal.tiers)) {
      assert.equal(tier.requiresPackoutWeight, true);
      assert.equal(tier.netWeightVerified, false);
      assert.equal(tier.netWeight, 'Enter packed weight');
    }
  }
});

test('customer label copy contains no internal status wording', () => {
  for (const meal of Object.values(labels.meals)) {
    const customerCopy = [meal.customerLabelName || meal.name, meal.description, meal.note, meal.reheat].join(' ');
    if (meal.plannerOnly) assert.ok(meal.customerLabelName, `${meal.name} has a customer label name`);
    assert.doesNotMatch(customerCopy, /\b(?:custom|private|Barry-only|draft|review|verify|confirm|pending)\b/i,
      `${meal.name} has no internal status in customer copy`);
  }
});

test('private kofta label needs its own measured weight and business address', () => {
  const released = structuredClone(labels);
  for (const meal of Object.values(released.meals)) delete meal.productionHold;
  const batch = structuredClone(config.batch);
  const form = {
    madeDate: batch.labelProduction.madeDate,
    useByDate: batch.labelProduction.useByDate,
    batchId: batch.labelProduction.batchId,
  };
  const input = {
    activeBatch: batch, activeMenu: config.menu, labelData: released, form,
    selectedVariants: new Set(['p1:lean']), netWeightOverrides: {},
  };
  const withoutWeight = guard.validateLabelProduction(input);
  assert.match(withoutWeight.errors.join(' '), /High-Protein Beef Kofta.*actual packed net weight/);

  input.netWeightOverrides['p1:lean'] = '22.0 oz (624 g)';
  const withoutAddress = guard.validateLabelProduction(input);
  assert.match(withoutAddress.errors.join(' '), /verified PRPD street address/);

  batch.labelProduction.manufacturerAddress = '123 Test Street, The Colony, TX 75056';
  assert.match(guard.validateLabelProduction(input).errors.join(' '), /purchased ingredient and allergen panels/);
  batch.labelProduction.purchasedPanelsVerified = true;
  assert.equal(guard.validateLabelProduction(input).ok, true);
});
