const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'order.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'order.html'), 'utf8');
const details = require('../config/menu-details');
const config = require('../config/order-config');

function functionBlock(name, nextName) {
  const start = source.indexOf(`    function ${name}(`);
  const end = source.indexOf(`\n    function ${nextName}(`, start);
  assert(start >= 0 && end > start);
  return source.slice(start, end);
}

function harness(batches = details.batches, batch = batches === details.batches ? config.batch.number : 16) {
  const context = vm.createContext({ MENU_DETAILS_BY_BATCH: batches, displayedMenuBatchNumber: batch });
  vm.runInContext(`${functionBlock('escapeMealDetail', 'detailNutritionHtml')}\nthis.badges = cardAllergenBadgesHtml;`, context);
  return context;
}

function meal(tiers) { return { type: 'meal', tiers }; }
function tier(allergens, label) { return { allergens, label }; }

// Assertions use rendered text and source records, including incomplete future records.
test('current meals with recorded major allergens render a positive Contains declaration', () => {
  const context = harness();
  for (const dish of Object.values(config.menu).flat().filter(dish => dish.category !== 'bundle')) {
    const result = context.badges(dish.id);
    const tiers = Object.values(details.batches[config.batch.number]?.[dish.id]?.tiers || {});
    // Removing a recipe-required sauce can remove the last recorded major
    // allergen. Keep the contact fallback instead of inventing a declaration.
    const declared = tiers.length > 0 && tiers.every(tier => /^CONTAINS:\s*\w/i.test(tier?.allergens || ''));
    if (declared) {
      assert.match(result, /<strong>Contains:<\/strong>/, dish.name);
      assert.doesNotMatch(result, /pending/i, dish.name);
    } else {
      assert.match(result, /Allergen details pending/, dish.name);
    }
    assert.doesNotMatch(result, /allergen.free|safe for|suitable for/i, dish.name);
  }
});

test('matching portion declarations collapse to one badge regardless of source order', () => {
  const context = harness({ 16: { meal: meal({ lean: tier('CONTAINS: MILK, EGG.'), bulk: tier('CONTAINS: EGG, MILK.') }) } });
  const result = context.badges('meal');
  assert.equal((result.match(/class="dish-allergen-badge"/g) || []).length, 1);
  assert.match(result, /Contains:<\/strong> Egg, Milk/);
  assert.doesNotMatch(result, /Lean|Bulk/);
});

test('different Lean and Bulk declarations remain labeled by portion', () => {
  const context = harness({ 16: { meal: meal({ lean: tier('CONTAINS: MILK.'), bulk: tier('CONTAINS: MILK, WHEAT.') }) } });
  const result = context.badges('meal');
  assert.match(result, /Lean · Contains:<\/strong> Milk/);
  assert.match(result, /Bulk · Contains:<\/strong> Milk, Wheat/);
});

test('archive cards use their displayed batch rather than the unpublished current batch', () => {
  const context = harness({ 16: { meal: meal({ lean: tier('CONTAINS: MILK.') }) }, 15: { meal: meal({ lean: tier('CONTAINS: FISH.') }) } }, 15);
  assert.match(context.badges('meal'), /Fish/);
  assert.doesNotMatch(context.badges('meal'), /Milk/);
  context.displayedMenuBatchNumber = 16;
  assert.match(context.badges('meal'), /Milk/);
});

test('Weekly Five union comes from all component declarations and flags selection dependence', () => {
  const context = harness({ 16: { x0: { type: 'bundle', variants: {
    first: { components: [tier('CONTAINS: MILK, SOY.'), tier('CONTAINS: WHEAT.')] },
    second: { components: [tier('CONTAINS: MILK, WHEAT.')] },
  } } } });
  const result = context.badges('x0');
  assert.match(result, /Bundle allergens:<\/strong> Milk, Soy, Wheat/);
  assert.match(result, /varies by selection/);
  assert.equal((result.match(/class="dish-allergen-badge"/g) || []).length, 1);
});

test('bundle union includes a component unique to a later variant', () => {
  const context = harness({ 16: { bundle: { type: 'bundle', variants: {
    first: { components: [tier('CONTAINS: MILK.')] },
    second: { components: [tier('CONTAINS: SESAME.')] },
  } } } });
  assert.match(context.badges('bundle'), /Milk, Sesame/);
});

test('missing, incomplete or unverified allergen data gives a contact fallback without an absence claim', () => {
  const records = {
    missingTiers: meal({}),
    missingPortion: meal({ lean: tier('CONTAINS: MILK.'), bulk: {} }),
    nullPortion: meal({ lean: null }),
    empty: meal({ single: tier('CONTAINS: .') }),
    unverified: meal({ single: tier('No major allergens declared.') }),
    missingComponent: { type: 'bundle', variants: { first: { components: [null] } } },
    missingVariant: { type: 'bundle', variants: { first: null } },
  };
  const context = harness({ 16: records });
  for (const id of ['absent', ...Object.keys(records)]) {
    const result = context.badges(id);
    assert.match(result, /Allergen details pending\. Contact us before ordering\./, id);
    assert.doesNotMatch(result, /Contains:|allergen.free|no major|safe for|suitable for/i, id);
  }
});

test('all dynamic badge labels and declarations are escaped', () => {
  const context = harness({ 16: { meal: meal({
    one: tier('CONTAINS: <IMG SRC=X ONERROR="X">.', '<svg onload="x">'),
    two: tier('CONTAINS: MILK.', 'Other'),
  }) } });
  const result = context.badges('meal');
  assert.doesNotMatch(result, /<img|<svg|onerror="|onload="/i);
  assert.match(result, /&lt;svg onload=&quot;x&quot;&gt;/);
  assert.match(result, /&lt;img src=x onerror=&quot;x&quot;&gt;/);
});

test('main card rendering includes the positive summary and retains the full details action', () => {
  const context = harness({ 16: { fixture: meal({ lean: tier('CONTAINS: MILK, SOY.') }) } });
  const nodes = new Map(['batchMeta', 'orderCutoff', 'successDelivery', 'activeDeliveryDay', 'closedDeliveryCopy', 'closedDeliveryDay', 'grid-mains'].map(id => [id, { textContent: '', innerHTML: '', replaceChildren() { this.innerHTML = ''; } }]));
  Object.assign(context, {
    IS_MENU_PUBLISHED: true, BATCH: { number: 16, deliveryDate: 'Saturday, October 24, 2026' }, MENU: { mains: [{ id: 'fixture', name: 'Fixture meal', category: 'standard' }] }, MENU_SECTIONS: ['mains'],
    window: { PRPD_ORDER_CONFIG: {} },
    document: { getElementById: id => nodes.get(id), querySelector: () => ({}) },
    isOrderingClosed: () => true, getDishPhoto: () => '', isVariantDish: () => false, isSingleSize: () => false,
    tierOrderRowHtml: () => '<span>price and portions</span>', bundleOrderGroupsHtml: () => '',
    photoPlaceholderHtml: () => '', photoOverlayHtml: () => '', photoCropClass: () => '',
  });
  vm.runInContext(`${functionBlock('renderMenu', 'initMenuFilters')}\nrenderMenu();`, context);
  const result = nodes.get('grid-mains').innerHTML;
  assert.match(result, /Contains:<\/strong> Milk, Soy/);
  assert.match(result, /Ingredients, allergens &amp; facts/);
  assert.match(result, /price and portions/);
});

test('asset cache versions advance and the full detail disclaimer covers optional sauce allergens', () => {
  for (const asset of ['order.css', 'order.js', 'menu-details.js']) {
    assert.ok(html.includes(asset + '?v='), `${asset} needs a cache revision`);
  }
  assert.match(html, /Optional sauces have their own ingredients and allergens/);
  assert.match(html, /Review each sauce's current declaration/);
  assert.doesNotMatch(html, /PRPD Sweet Heat contains egg; Garlic Herb Yogurt contains egg and milk/);
  assert.match(html, /Supplier labels can change/);
});
