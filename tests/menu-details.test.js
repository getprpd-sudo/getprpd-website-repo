const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const active = require('../config/order-config');
const draft = require('../config/order-config.batch16-draft');
const activeDetails = require('../config/menu-details');
const draftDetails = require('../config/menu-details.batch16-draft');

function publicItems(config) {
  return Object.values(config.menu).flat();
}

function verifyTier(tier, label) {
  assert.match(tier.ingredients, /[a-z]/i, `${label} needs ingredients`);
  assert.match(tier.allergens, /^(CONTAINS:|No major allergens identified)/, `${label} needs a major-allergen declaration`);
  assert.equal(typeof tier.allergenAdvisory, 'string', `${label} needs an allergen advisory field`);
  for (const key of ['calories', 'protein', 'carbs', 'fiber', 'fat', 'satFat', 'sugars', 'sodium', 'cholesterol']) {
    assert.ok(Number.isFinite(tier.nutrition[key]), `${label} needs numeric ${key}`);
    assert.ok(tier.nutrition[key] >= 0, `${label} needs nonnegative ${key}`);
  }
  assert.ok(tier.nutrition.fiber <= tier.nutrition.carbs, `${label} fiber cannot exceed total carbohydrate`);
  assert.ok(tier.nutrition.satFat <= tier.nutrition.fat, `${label} saturated fat cannot exceed total fat`);
}

for (const [config, details] of [[active, activeDetails], [draft, draftDetails]]) {
  test(`Batch ${config.batch.number} has customer-safe details for every displayed card`, () => {
    const batchDetails = details.batches[String(config.batch.number)];
    assert.ok(batchDetails);
    for (const item of publicItems(config)) {
      const record = batchDetails[item.id];
      assert.equal(record.name, item.name);
      assert.match(record.description, /[a-z]/i);
      if (record.type === 'bundle') {
        assert.deepEqual(Object.keys(record.variants), item.variants.map(variant => variant.id));
        for (const [variantId, variant] of Object.entries(record.variants)) {
          assert.equal(variant.components.length, 2, `${variantId} should explain both meals`);
          for (const component of variant.components) verifyTier(component, `${variantId} ${component.name}`);
        }
      } else {
        const expectedTiers = item.bulkMacros ? ['lean', 'bulk'] : ['single'];
        assert.deepEqual(Object.keys(record.tiers), expectedTiers);
        for (const [tierKey, tier] of Object.entries(record.tiers)) verifyTier(tier, `${item.name} ${tierKey}`);
        assert.match(record.reheat, /[a-z]/i);
        assert.ok(['fridge', 'freezer'].includes(record.storageMode));
      }
    }
  });
}

test('public detail payload excludes internal recipe gates and production notes', () => {
  const serialized = JSON.stringify([activeDetails, draftDetails]);
  for (const internalTerm of ['validation', 'confidence', 'assumptions', 'station', 'recommendation']) {
    assert.doesNotMatch(serialized, new RegExp(`"${internalTerm}"`, 'i'));
  }
});

test('the live detail payload exposes only the currently published Batch 16 menu', () => {
  const live = JSON.stringify(activeDetails);
  assert.deepEqual(Object.keys(activeDetails.batches), ['16']);
  assert.match(live, /Cajun Garlic Salmon|Butter Chicken \+ Sweet Chili|Grilled Cheese Breakfast Burrito/);
  assert.doesNotMatch(live, /Creamy Cajun Chicken Pasta|Chicken Enchilada Bake|Garlic Butter Wild Argentine Shrimp/);
  const ignore = fs.readFileSync(path.join(__dirname, '..', '.vercelignore'), 'utf8');
  assert.match(ignore, /config\/\*\.batch\*-draft\.js/);
});

test('order page exposes an accessible meal-details dialog and cautious allergy copy', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'order.html'), 'utf8');
  const app = fs.readFileSync(path.join(__dirname, '..', 'order.js'), 'utf8');
  const css = fs.readFileSync(path.join(__dirname, '..', 'order.css'), 'utf8');
  assert.match(html, /<dialog[^>]+id="mealDetailDialog"/);
  assert.ok(html.indexOf('/config/menu-details.js') < html.indexOf('/order.js'));
  assert.match(html, /zero cross-contact cannot be guaranteed/i);
  assert.match(html, /supplier labels can change/i);
  assert.match(app, /data-open-meal-details/);
  assert.match(app, /class="dish-img" role="button" tabindex="0" data-open-meal-details/);
  assert.match(app, /closest\('\.dish-img\[data-open-meal-details\]'\)/);
  assert.doesNotMatch(app, /browseOnly \? ' aria-disabled="true"'/);
  assert.match(app, /data-meal-detail-tier/);
  assert.match(app, /data-meal-detail-variant/);
  assert.match(app, /allergenAdvisory/);
  assert.doesNotMatch(app, /Nutrition update in progress/);
  assert.match(css, /\.meal-detail-dialog::backdrop/);
  assert.match(css, /@media \(max-width: 640px\)/);
});

test('Batch 16 separates major allergens from supplier and sensitivity advisories', () => {
  const meals = activeDetails.batches['16'];
  const expectedMajorAllergens = {
    b1: 'CONTAINS: EGG, MILK.',
    b2: 'CONTAINS: EGG, MILK, WHEAT.',
    b3: 'CONTAINS: EGG, MILK, WHEAT.',
    b4: 'CONTAINS: EGG, MILK, WHEAT.',
    m1: 'CONTAINS: EGG, MILK, SOY, WHEAT.',
    m2: 'CONTAINS: MILK, SOY.',
    m3: 'CONTAINS: MILK.',
    m4: 'CONTAINS: MILK, WHEAT.',
    m5: 'CONTAINS: EGG, MILK, SOY, WHEAT.',
    m6: 'CONTAINS: FISH.',
    m7: 'CONTAINS: MILK.',
    a1: 'CONTAINS: EGG, MILK, WHEAT.',
    a2: 'CONTAINS: MILK, WHEAT.',
    a3: 'CONTAINS: MILK, SESAME, WHEAT.',
  };
  for (const [mealId, expected] of Object.entries(expectedMajorAllergens)) {
    const tier = meals[mealId].tiers.lean || meals[mealId].tiers.single;
    assert.equal(tier.allergens, expected, `${mealId} allergen declaration`);
  }
  assert.equal(meals.m2.tiers.lean.allergens, 'CONTAINS: MILK, SOY.');
  assert.match(meals.m2.tiers.lean.allergenAdvisory, /may contain sesame and tree nuts/i);
  assert.equal(meals.m5.tiers.lean.allergens, 'CONTAINS: EGG, MILK, SOY, WHEAT.');
  assert.match(meals.m5.tiers.lean.allergenAdvisory, /sulfites, and mustard/i);
  assert.equal(meals.m7.tiers.lean.allergens, 'CONTAINS: MILK.');
  assert.match(meals.m7.tiers.lean.allergenAdvisory, /contains sulfites/i);
  assert.equal(meals.m3.tiers.lean.allergens, 'CONTAINS: MILK.');
});

test('Batch 16 publishes the owner-approved October 19 second-pass sodium reductions', () => {
  const meals = activeDetails.batches['16'];
  const expected = {
    b1: {lean: 740, bulk: 1080},
    b2: {lean: 980, bulk: 1400},
    b3: {lean: 1160, bulk: 1620},
    b4: {lean: 700, bulk: 980},
    m1: {lean: 1080, bulk: 1370},
    m2: {lean: 850, bulk: 1110},
    m3: {lean: 620, bulk: 820},
    m4: {lean: 850, bulk: 1000},
    m5: {lean: 1000, bulk: 1310},
    m6: {lean: 650, bulk: 880},
    m7: {lean: 850, bulk: 1130},
    a1: {single: 560},
    a2: {single: 730},
    a3: {single: 750},
  };
  for (const [mealId, tiers] of Object.entries(expected)) {
    for (const [tier, sodium] of Object.entries(tiers)) {
      assert.equal(meals[mealId].tiers[tier].nutrition.sodium, sodium, `${mealId} ${tier}`);
    }
  }
  const customerSizeAverage = Object.values(expected)
    .map(tiers => tiers.lean ?? tiers.single)
    .reduce((sum, sodium) => sum + sodium, 0) / Object.keys(expected).length;
  assert.ok(customerSizeAverage < 850, `customer-size average should stay below 850mg, got ${customerSizeAverage}`);
});
