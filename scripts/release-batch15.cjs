const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.join(__dirname, '..');
const draftPath = path.join(projectRoot, 'config', 'order-config.batch15-draft.js');
const livePath = path.join(projectRoot, 'config', 'order-config.js');
const draft = require(draftPath);

function releaseErrors(config) {
  const errors = [];
  const checks = config.release?.checks || {};
  const requiredChecks = [
    'shortRibRecipeLocked',
    'exactCostAuditPassed',
    'menuNutritionPassed',
    'orderConfigurationPassed',
    'visualReviewPassed',
    'taxConfigurationPassed',
  ];

  if (config.batch?.number !== 15) errors.push('The staged menu is not Batch 15.');
  if (config.batch?.published !== true) errors.push('Set batch.published to true only after final owner approval.');
  if (config.batch?.remindersEnabled !== false) errors.push('Menu reminders must remain off for the initial release.');
  if (config.release?.approvedByOwner !== true) errors.push('Final owner publication approval is not recorded.');
  if ((config.release?.blockers || []).length > 0) errors.push('The staged release blocker list is not empty.');

  requiredChecks.forEach(check => {
    if (checks[check] !== true) errors.push(`Release check not passed: ${check}.`);
  });

  const dishes = Object.values(config.menu || {}).flat();
  dishes.forEach(dish => {
    if (!dish.taxClass || dish.taxClass === 'classification-pending') {
      errors.push(`${dish.name}: tax classification is unresolved.`);
    }
    if (dish.available === false || dish.releaseReady === false || dish.macrosPending === true) {
      errors.push(`${dish.name}: product release gate is still closed.`);
    }
    if (dish.category !== 'bundle') {
      const macroFields = ['cal', 'protein', 'carbs', 'fat'];
      if (!dish.macros || macroFields.some(field => !Number.isFinite(Number(dish.macros[field])))) {
        errors.push(`${dish.name}: Lean nutrition is incomplete.`);
      }
      if (!['dessert', 'addon'].includes(dish.category)
        && (!dish.bulkMacros || macroFields.some(field => !Number.isFinite(Number(dish.bulkMacros[field]))))) {
        errors.push(`${dish.name}: Bulk nutrition is incomplete.`);
      }
    }
  });

  const weeklyFive = config.menu?.exclusives?.[0];
  (weeklyFive?.variants || []).forEach(variant => {
    const savings = Math.round((Number(variant.compareAtPrice) - Number(variant.price)) * 100) / 100;
    if (savings !== 5) errors.push(`${variant.label}: bundle savings is not exactly $5.`);
  });

  if (config.tax?.enabled) {
    if (!(Number(config.tax.rate) > 0 && Number(config.tax.rate) < 0.2)) {
      errors.push('Enabled sales-tax rate is invalid.');
    }
  }

  return [...new Set(errors)];
}

function standaloneConfig(config) {
  return `// Batch 15 promoted by the guarded release tool.\nconst ORDER_CONFIG = ${JSON.stringify(config, null, 2)};\n\nif (typeof window !== 'undefined') window.PRPD_ORDER_CONFIG = ORDER_CONFIG;\nif (typeof module !== 'undefined' && module.exports) module.exports = ORDER_CONFIG;\n`;
}

const errors = releaseErrors(draft);
if (errors.length) {
  console.error('Batch 15 is not release-ready:');
  errors.forEach(error => console.error(`- ${error}`));
  process.exit(1);
}

if (process.argv.includes('--promote')) {
  const temporaryPath = `${livePath}.batch15-next`;
  fs.writeFileSync(temporaryPath, standaloneConfig(draft), 'utf8');
  fs.copyFileSync(temporaryPath, livePath);
  fs.unlinkSync(temporaryPath);
  console.log('Batch 15 passed every release gate and is now the local live configuration.');
} else {
  console.log('Batch 15 passed every release gate. No files were changed.');
}
