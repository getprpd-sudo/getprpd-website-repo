const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.join(__dirname, '..');
const draftPath = path.join(projectRoot, 'config', 'order-config.batch16-draft.js');
const livePath = path.join(projectRoot, 'config', 'order-config.js');
const draft = require(draftPath);

const expectedSections = {
  breakfasts: [
    'Egg Bites with Potato Hash',
    'Grilled Cheese Breakfast Burrito',
    'Breakfast Quesadilla',
    'Chicken Shakshuka',
  ],
  addons: [
    'Chicken Tikka Snack Wrap',
    'Buffalo Chicken Pinwheels',
    'Mediterranean Chicken Hummus Box',
  ],
  mains: [
    'Hot Honey Chicken Sliders',
    'Butter Chicken',
    'Loaded Buffalo Chicken Potato',
    'BBQ Chicken Mac & Cheese',
    'Beef Seekh Kabab Shawarma',
    'Cajun Garlic Salmon',
  ],
  premium: ['Braised Beef Short Rib'],
  desserts: [],
};

function sameNames(actual, expected) {
  return JSON.stringify(actual.map(item => item.name)) === JSON.stringify(expected);
}

function releaseErrors(config) {
  const errors = [];
  const checks = config.release?.checks || {};
  const requiredWebsiteChecks = [
    'menuLineupApproved',
    'weeklyFiveApproved',
    'weeklySaucePairApproved',
    'menuNutritionPassed',
    'orderConfigurationPassed',
    'visualReviewPassed',
    'taxConfigurationPassed',
  ];

  if (config.batch?.number !== 16) errors.push('The staged menu is not Batch 16.');
  if (config.batch?.published !== false) errors.push('The staged source must remain unpublished until promotion.');
  if (config.batch?.remindersEnabled !== false) errors.push('Menu reminders must remain off for the initial release.');
  if (config.release?.approvedByOwner !== true) errors.push('Final owner publication approval is not recorded.');
  if ((config.release?.blockers || []).length > 0) errors.push('The website release blocker list is not empty.');
  requiredWebsiteChecks.forEach(check => {
    if (checks[check] !== true) errors.push(`Website release check not passed: ${check}.`);
  });

  Object.entries(expectedSections).forEach(([section, expected]) => {
    const actual = config.menu?.[section] || [];
    if (!sameNames(actual, expected)) errors.push(`${section}: the approved lineup changed.`);
  });
  const weeklyFive = config.menu?.exclusives?.[0];
  if (weeklyFive?.name !== 'Weekly Five: Butter Chicken + Sweet Chili') {
    errors.push('The approved Weekly Five changed.');
  }
  (weeklyFive?.variants || []).forEach(variant => {
    const savings = Math.round((Number(variant.compareAtPrice) - Number(variant.price)) * 100) / 100;
    if (savings !== 5) errors.push(`${variant.label}: bundle savings is not exactly $5.`);
  });

  if (config.sauceProgram?.enabled !== true) errors.push('The sauce program is not enabled.');
  if (config.sauceProgram?.freeCupsPerOrder !== 3) errors.push('The sauce allowance is not three free cups per order.');
  if (Number(config.sauceProgram?.extraPrice) !== 1) errors.push('The additional sauce price is not $1.');
  if (Object.keys(config.sauceProgram?.creditsByDishId || {}).length) errors.push('A meal still auto-assigns optional sauce credit.');
  if (Object.keys(config.sauceProgram?.reservedByDishId || {}).length) errors.push('A meal still reserves an optional sauce cup.');

  const dishes = Object.values(config.menu || {}).flat();
  dishes.forEach(dish => {
    if (!dish.taxClass || dish.taxClass === 'classification-pending') errors.push(`${dish.name}: tax classification is unresolved.`);
    if (dish.category !== 'bundle') {
      for (const macros of [dish.macros, dish.bulkMacros].filter(Boolean)) {
        if (['cal', 'protein', 'carbs', 'fat'].some(field => !Number.isFinite(Number(macros[field])))) {
          errors.push(`${dish.name}: customer nutrition is incomplete.`);
        }
      }
    }
  });
  if (dishes.some(dish => /shrimp|dessert|tiramisu/i.test(dish.name))) errors.push('A rejected seafood or dessert item reappeared.');

  return [...new Set(errors)];
}

function promotedConfig(config) {
  const promoted = JSON.parse(JSON.stringify(config));
  promoted.batch.published = true;
  promoted.batch.remindersEnabled = false;
  delete promoted.publishedArchive;
  return promoted;
}

function standaloneConfig(config) {
  return `// Batch 16 promoted by the guarded release tool.\nconst ORDER_CONFIG = ${JSON.stringify(config, null, 2)};\n\nif (typeof window !== 'undefined') window.PRPD_ORDER_CONFIG = ORDER_CONFIG;\nif (typeof module !== 'undefined' && module.exports) module.exports = ORDER_CONFIG;\n`;
}

const errors = releaseErrors(draft);
if (errors.length) {
  console.error('Batch 16 is not website-release-ready:');
  errors.forEach(error => console.error(`- ${error}`));
  process.exit(1);
}

if (process.argv.includes('--promote')) {
  const temporaryPath = `${livePath}.batch16-next`;
  fs.writeFileSync(temporaryPath, standaloneConfig(promotedConfig(draft)), 'utf8');
  fs.copyFileSync(temporaryPath, livePath);
  fs.unlinkSync(temporaryPath);
  console.log('Batch 16 passed every website release gate and is now the local live configuration.');
} else {
  console.log('Batch 16 passed every website release gate. No files were changed.');
}
