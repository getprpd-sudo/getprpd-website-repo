const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const menu = require('../config/order-config');
const details = require('../config/menu-details').batches[String(menu.batch.number)];
const context = { window: {} };
vm.runInNewContext(
  fs.readFileSync(path.join(__dirname, '../operations/nutrition/next-menu-label-data.js'), 'utf8'),
  context,
);
const labels = context.window.PRPD_NEXT_LABEL_DATA;

test('current public meal nutrition agrees with the controlled label data', () => {
  assert.equal(menu.batch.number, 19);
  assert.equal(labels.production.batchNumber, menu.batch.number);
  const nutrients = [
    'calories', 'protein', 'carbs', 'fiber', 'fat', 'satFat', 'transFat',
    'cholesterol', 'sodium', 'sugars', 'addedSugar', 'vitaminD', 'calcium', 'iron', 'potassium',
  ];
  for (const section of Object.values(menu.menu)) {
    for (const item of section) {
      if (item.variants) continue;
      const labelMeal = labels.meals[item.id];
      assert.ok(labelMeal, `Missing label data for ${item.name}`);
      for (const [tier, publicTier] of Object.entries(details[item.id].tiers)) {
        const labelTier = labelMeal.tiers[tier];
        assert.ok(labelTier, `Missing ${tier} label for ${item.name}`);
        for (const key of nutrients) {
          if (publicTier.nutrition[key] === undefined) continue;
          assert.equal(labelTier.nutrition[key], publicTier.nutrition[key], `${item.name} ${tier} ${key}`);
        }
        for (const [key, value] of Object.entries({
          calories: tier === 'bulk' ? item.bulkMacros?.cal : item.macros.cal,
          protein: tier === 'bulk' ? item.bulkMacros?.protein : item.macros.protein,
          carbs: tier === 'bulk' ? item.bulkMacros?.carbs : item.macros.carbs,
          fiber: tier === 'bulk' ? item.bulkMacros?.fiber : item.macros.fiber,
          fat: tier === 'bulk' ? item.bulkMacros?.fat : item.macros.fat,
        })) {
          assert.equal(labelTier.nutrition[key], value, `${item.name} ${tier} order-menu ${key}`);
        }
      }
    }
  }
});
