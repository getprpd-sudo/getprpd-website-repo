const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const draft = require('../config/order-config.batch15-draft');
const orderApi = require('../api/order');

test('Batch 15 is owner-approved for publication and reminders remain off for the initial release', () => {
  assert.equal(draft.batch.number, 15);
  assert.equal(draft.batch.published, true);
  assert.equal(draft.batch.remindersEnabled, false);
  assert.equal(draft.release.approvedByOwner, true);
  assert.deepEqual(draft.release.blockers, []);
  assert.ok(draft.release.productionHolds.length > 0);
});

test('Batch 15 draft has the approved menu structure and explicit tax classes', () => {
  const dishes = Object.values(draft.menu).flat();
  assert.equal(draft.menu.breakfasts.length, 4);
  assert.equal(draft.menu.mains.length, 6);
  assert.equal(draft.menu.premium.length, 1);
  assert.equal(draft.menu.desserts.length, 3);
  assert.equal(draft.menu.addons.length, 3);
  assert.equal(draft.menu.exclusives.length, 1);
  assert.equal(new Set(dishes.map(dish => dish.id)).size, dishes.length);
  assert.ok(dishes.every(dish => dish.taxClass && dish.taxClass !== 'classification-pending'));
  assert.equal(draft.tax.enabled, false);
});

test('Weekly Five exposes Lean and Bulk with an exact five-dollar bundle savings', () => {
  const bundle = draft.menu.exclusives[0];
  assert.deepEqual(bundle.variants.map(variant => variant.price), [49.95, 49.95, 59.95, 59.95]);
  assert.ok(bundle.variants.every(variant => variant.compareAtPrice - variant.price === 5));
  const catalog = orderApi._test.catalogForConfig(draft);
  const items = orderApi._test.normalizeItems([
    { id: bundle.id, tier: 'lean-cajun3-cart2', qty: 1 },
    { id: bundle.id, tier: 'bulk-cajun2-cart3', qty: 1 },
  ], catalog);
  assert.deepEqual(items.map(item => item.subtotal), [49.95, 59.95]);
  const orderSource = fs.readFileSync(path.join(__dirname, '..', 'order.js'), 'utf8');
  assert.match(orderSource, /bundleOrderGroupsHtml/);
  assert.match(orderSource, /bundle-choice-groups/);
  assert.match(orderSource, /compareAtPrice - price/);
});

test('Weekly Five keeps its phone stack while giving laptop pricing enough room', () => {
  const css = fs.readFileSync(path.join(__dirname, '..', 'order.css'), 'utf8');

  assert.match(css, /\.dish-card\.is-exclusive\s*\{[^}]*grid-template-columns:\s*minmax\(220px, 31%\) minmax\(0, 1fr\)/s);
  assert.match(css, /\.bundle-choice-group__head\s*\{[^}]*display:\s*grid;[^}]*grid-template-columns:\s*minmax\(0, 1fr\) auto/s);
  assert.match(css, /\.bundle-choice-group__head > div:last-child\s*\{\s*justify-items:\s*end;/);
  assert.match(css, /@media \(max-width: 560px\)[\s\S]*?\.dish-card\.is-exclusive\s*\{\s*grid-template-columns:\s*1fr;\s*\}[\s\S]*?\.bundle-choice-groups\s*\{\s*grid-template-columns:\s*1fr;\s*\}/);
});

test('Short rib publishes with calculated nutrition and keeps the bone-removal production control', () => {
  const shortRib = draft.menu.premium.find(dish => dish.id === 'm7');
  assert.equal(shortRib.available, undefined);
  assert.deepEqual(shortRib.macros, { cal: 680, protein: 45, carbs: 40, fiber: 4, fat: 37 });
  assert.deepEqual(shortRib.bulkMacros, { cal: 885, protein: 60, carbs: 54, fiber: 5, fat: 49 });
  assert.match(shortRib.description, /Boneless portions/);
  assert.match(shortRib.productionStatus, /bones-and-trim-removed/);
});

test('requested photos use the closer non-destructive crops', () => {
  assert.equal(draft.menu.mains.find(dish => dish.id === 'm1').imageCrop, 'landscape-closer');
  assert.equal(draft.menu.addons.find(dish => dish.id === 'a2').imageCrop, 'portrait-low');
});

test('Lasagna uses the locked 12-sheet calculated recipe', () => {
  const lasagna = draft.menu.mains.find(dish => dish.id === 'm4');
  assert.deepEqual(lasagna.macros, { cal: 530, protein: 51, carbs: 38, fiber: 5, fat: 19 });
  assert.deepEqual(lasagna.bulkMacros, { cal: 710, protein: 67, carbs: 51, fiber: 7, fat: 26 });
  assert.match(lasagna.nutritionStatus, /12-sheet/);
});

test('Sweet Chili uses the calculated plain-rice identity', () => {
  const sweetChili = draft.menu.mains.find(dish => dish.id === 'm1');
  assert.equal(sweetChili.name, 'Sweet Chili Chicken with Rice');
  assert.deepEqual(sweetChili.macros, { cal: 490, protein: 44, carbs: 42, fiber: 1, fat: 16 });
  assert.deepEqual(sweetChili.bulkMacros, { cal: 650, protein: 58, carbs: 55, fiber: 2, fat: 21 });
  assert.equal(sweetChili.macrosPending, undefined);
  assert.equal(sweetChili.nutritionReview, undefined);
  assert.match(sweetChili.nutritionStatus, /pending-cooked-rice-yield-record/);
});

test('Tiramisu stages the successful five-cup calculation and keeps release gates visible', () => {
  const tiramisu = draft.menu.desserts.find(dish => dish.id === 'd3');
  assert.equal(tiramisu.name, 'High Protein Tiramisu');
  assert.deepEqual(tiramisu.macros, { cal: 460, protein: 22, carbs: 45, fiber: 1, fat: 21 });
  assert.equal(tiramisu.macrosPending, false);
  assert.equal(tiramisu.nutritionReview, true);
  assert.equal(tiramisu.imageCrop, 'square-raised');
  for (const gate of ['coffee', 'cup-weight', 'panels', 'hold']) {
    assert.match(tiramisu.nutritionStatus, new RegExp(gate));
  }
});
