(function (root) {
  'use strict';

  const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
  const LABEL_ID = /^[a-z][a-z0-9_-]{0,31}$/i;
  const LABEL_TIERS = new Set(['lean', 'bulk', 'single']);

  function utcDate(value) {
    if (!ISO_DATE.test(String(value || ''))) return null;
    const [year, month, day] = String(value).split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.toISOString().slice(0, 10) === value ? date : null;
  }

  function deliveryDate(value) {
    const date = new Date(String(value || ''));
    if (Number.isNaN(date.getTime())) return null;
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  }

  function addDays(date, days) {
    const result = new Date(date.getTime());
    result.setUTCDate(result.getUTCDate() + days);
    return result;
  }

  function isoDate(date) {
    return date.toISOString().slice(0, 10);
  }

  function expectedBatchId(batchNumber, madeDate) {
    const [, month, day] = String(madeDate || '').split('-');
    return month && day ? `B${batchNumber}-${month}${day}` : '';
  }

  const MENU_SECTIONS = [
    ['breakfasts', 'Breakfast', ['lean', 'bulk']],
    ['mains', 'Main', ['lean', 'bulk']],
    ['desserts', 'Dessert', ['single']],
    ['addons', 'Add-on', ['single']],
  ];
  const REQUIRED_NUTRITION = [
    'calories', 'protein', 'carbs', 'fiber', 'fat', 'satFat', 'transFat',
    'cholesterol', 'sodium', 'sugars', 'addedSugar', 'vitaminD', 'calcium',
    'iron', 'potassium',
  ];
  const CONFIG_MACROS = {
    cal: 'calories', protein: 'protein', carbs: 'carbs', fiber: 'fiber', fat: 'fat',
  };

  function sameKeys(actual, expected) {
    const left = Object.keys(actual || {}).sort();
    const right = [...expected].sort();
    return left.length === right.length && left.every((key, index) => key === right[index]);
  }

  function validateTier(meal, tierKey, configuredMacros, description) {
    const errors = [];
    const tier = meal?.tiers?.[tierKey];
    if (!tier) return [`${description} is missing its ${tierKey} generated label tier.`];
    if (!String(tier.netWeight || '').trim()) errors.push(`${description} ${tierKey} is missing net weight.`);
    if (!String(tier.ingredients || '').trim()) errors.push(`${description} ${tierKey} is missing ingredients.`);
    if (!String(tier.allergens || '').trim()) errors.push(`${description} ${tierKey} is missing its allergen declaration.`);
    for (const field of REQUIRED_NUTRITION) {
      if (typeof tier.nutrition?.[field] !== 'number' || !Number.isFinite(tier.nutrition[field])) {
        errors.push(`${description} ${tierKey} is missing numeric nutrition field ${field}.`);
      }
    }
    if (!configuredMacros || typeof configuredMacros !== 'object') {
      errors.push(`${description} ${tierKey} has no matching customer-menu macro record.`);
    } else {
      for (const [configKey, labelKey] of Object.entries(CONFIG_MACROS)) {
        if (Number(configuredMacros[configKey]) !== Number(tier.nutrition?.[labelKey])) {
          errors.push(`${description} ${tierKey} ${labelKey} does not match the active customer menu.`);
        }
      }
    }
    return errors;
  }

  function validateLabelMenu(activeMenu, labelData) {
    const errors = [];
    if (!activeMenu || typeof activeMenu !== 'object') {
      return { ok: false, errors: ['The active customer menu is unavailable.'] };
    }
    const generatedMeals = labelData?.meals;
    if (!generatedMeals || typeof generatedMeals !== 'object') {
      return { ok: false, errors: ['The generated label dataset has no meals.'] };
    }

    const expectedIds = [];
    const seenNames = new Set();
    for (const [sectionKey, category, expectedTiers] of MENU_SECTIONS) {
      const items = activeMenu[sectionKey];
      if (!Array.isArray(items)) {
        errors.push(`The active customer menu section ${sectionKey} is unavailable.`);
        continue;
      }
      for (const item of items) {
        const id = String(item?.id || '');
        const name = String(item?.name || '');
        const description = name ? `${id} (${name})` : id || `an item in ${sectionKey}`;
        if (!id || !name) {
          errors.push(`The active customer menu contains an item without both an ID and name in ${sectionKey}.`);
          continue;
        }
        if (expectedIds.includes(id)) errors.push(`The active customer menu repeats ID ${id}.`);
        if (seenNames.has(name)) errors.push(`The active customer menu repeats dish name ${name}.`);
        expectedIds.push(id);
        seenNames.add(name);

        const generated = generatedMeals[id];
        if (!generated) {
          errors.push(`${description} has no generated label data.`);
          continue;
        }
        if (generated.name !== name) errors.push(`${description} is paired with stale generated label name ${generated.name || '(missing)'}.`);
        if (generated.category !== category) errors.push(`${description} has stale generated category ${generated.category || '(missing)'}.`);
        if (!sameKeys(generated.tiers, expectedTiers)) {
          errors.push(`${description} must have exactly ${expectedTiers.join(' and ')} label tier${expectedTiers.length === 1 ? '' : 's'}.`);
          continue;
        }
        if (!String(generated.description || '').trim()) errors.push(`${description} is missing its generated description.`);
        if (!String(generated.reheat || '').trim()) errors.push(`${description} is missing its generated handling instructions.`);
        expectedTiers.forEach((tierKey) => {
          const macros = tierKey === 'bulk' ? item.bulkMacros : item.macros;
          errors.push(...validateTier(generated, tierKey, macros, description));
        });
      }
    }

    for (const id of Object.keys(generatedMeals)) {
      if (!expectedIds.includes(id)) {
        errors.push(`Generated label item ${id} is not on the active customer menu and may be archived or stale.`);
      }
    }
    return { ok: errors.length === 0, errors };
  }

  function generatedTierErrors(mealId, meal, tierKey) {
    const description = `${meal?.name || mealId} (${tierKey})`;
    const tier = meal?.tiers?.[tierKey];
    const errors = [];
    if (!tier) return [`${description} has no generated label tier.`];
    if (!String(tier.label || '').trim()) errors.push(`${description} has no generated tier label.`);
    if (!String(tier.netWeight || '').trim()) errors.push(`${description} has no generated net weight.`);
    if (!String(tier.ingredients || '').trim()) errors.push(`${description} has no generated ingredient statement.`);
    if (!String(tier.allergens || '').trim()) errors.push(`${description} has no generated allergen statement.`);
    for (const field of REQUIRED_NUTRITION) {
      if (typeof tier.nutrition?.[field] !== 'number' || !Number.isFinite(tier.nutrition[field])) {
        errors.push(`${description} has invalid nutrition field ${field}.`);
      }
    }
    return errors;
  }

  function validateLabelPlanRows(rows, labelData) {
    const errors = [];
    const entries = [];
    const seen = new Set();
    if (!Array.isArray(rows) || !rows.length) {
      return { ok: false, errors: ['The exact label plan is empty.'], entries, totalLabels: 0 };
    }

    rows.forEach((row, index) => {
      const id = String(row?.id || '').trim();
      const tier = String(row?.tier || '').trim().toLowerCase();
      const labels = Number(row?.labels ?? row?.qty);
      const displayName = String(row?.name || labelData?.meals?.[id]?.name || id || `entry ${index + 1}`).trim();
      if (!LABEL_ID.test(id)) {
        errors.push(`Label plan entry ${index + 1} has an invalid meal ID.`);
        return;
      }
      if (!LABEL_TIERS.has(tier)) {
        errors.push(`${displayName} has unsupported label tier "${tier || 'missing'}".`);
        return;
      }
      if (!Number.isInteger(labels) || labels < 1 || labels > 200) {
        errors.push(`${displayName} (${tier}) must request between 1 and 200 exact individual labels.`);
        return;
      }
      const key = `${id}:${tier}`;
      if (seen.has(key)) {
        errors.push(`${displayName} (${tier}) appears more than once in the exact label plan.`);
        return;
      }
      seen.add(key);

      const meal = labelData?.meals?.[id];
      if (!meal) {
        errors.push(`${displayName} (${tier}) is in the locked orders but missing from the active generated label dataset. Regenerate and verify the current batch labels before printing.`);
        return;
      }
      if (!meal.tiers?.[tier]) {
        errors.push(`${displayName} (${tier}) is in the locked orders but that exact tier is missing from the active generated label dataset. Regenerate and verify the current batch labels before printing.`);
        return;
      }
      const tierErrors = generatedTierErrors(id, meal, tier);
      if (tierErrors.length) {
        errors.push(...tierErrors);
        return;
      }
      entries.push({ id, tier, labels, name: meal.name });
    });

    const ok = errors.length === 0 && entries.length === rows.length;
    return {
      ok,
      errors,
      entries: ok ? entries : [],
      totalLabels: ok ? entries.reduce((sum, entry) => sum + entry.labels, 0) : 0,
    };
  }

  function encodeLabelPrintPlan(rows, labelData) {
    const validation = validateLabelPlanRows(rows, labelData);
    return {
      ...validation,
      encoded: validation.ok
        ? validation.entries.map(entry => `${entry.id}:${entry.tier}:${entry.labels}`).join(',')
        : '',
    };
  }

  function parseLabelPrintPlan(encodedPlan, labelData) {
    if (typeof encodedPlan !== 'string' || !encodedPlan.trim()) {
      return { ok: false, errors: ['The URL exact label plan is empty.'], entries: [], totalLabels: 0 };
    }
    if (encodedPlan.length > 4096) {
      return { ok: false, errors: ['The URL exact label plan is too large.'], entries: [], totalLabels: 0 };
    }
    const rows = [];
    const syntaxErrors = [];
    encodedPlan.split(',').forEach((entry, index) => {
      const parts = entry.split(':');
      if (parts.length !== 3) {
        syntaxErrors.push(`URL label plan entry ${index + 1} is malformed.`);
        return;
      }
      const [id, tier, quantity] = parts;
      if (!/^\d+$/.test(quantity)) {
        syntaxErrors.push(`URL label plan entry ${index + 1} has an invalid quantity.`);
        return;
      }
      rows.push({ id, tier, labels: Number(quantity) });
    });
    if (syntaxErrors.length) {
      return { ok: false, errors: syntaxErrors, entries: [], totalLabels: 0 };
    }
    return validateLabelPlanRows(rows, labelData);
  }

  function validateLabelProduction({ activeBatch, activeMenu, labelData, form }) {
    const errors = [];
    const batchNumber = Number(activeBatch?.number);
    const configured = activeBatch?.labelProduction;
    const generated = labelData?.production;

    if (!Number.isInteger(batchNumber) || batchNumber < 1) errors.push('The active batch number is missing or invalid.');
    if (!configured) errors.push('The active batch has no controlled label-production dates.');
    if (!generated) errors.push('The generated label dataset has no production identity.');

    const menuValidation = validateLabelMenu(activeMenu, labelData);
    errors.push(...menuValidation.errors);

    if (errors.length) return { ok: false, errors };

    const made = utcDate(configured.madeDate);
    const useBy = utcDate(configured.useByDate);
    const delivery = deliveryDate(activeBatch.deliveryDate);
    if (!made) errors.push('The controlled made date is not a valid ISO date.');
    if (!useBy) errors.push('The controlled refrigerate-through date is not a valid ISO date.');
    if (!delivery) errors.push('The active delivery date is invalid.');

    if (made && delivery && isoDate(addDays(made, 1)) !== isoDate(delivery)) {
      errors.push('The controlled made date must be the day before delivery.');
    }
    if (made && useBy && isoDate(addDays(made, 3)) !== isoDate(useBy)) {
      errors.push('The controlled refrigerate-through date must be three days after the made date.');
    }
    if (configured.batchId !== expectedBatchId(batchNumber, configured.madeDate)) {
      errors.push('The controlled label batch ID does not match the batch number and made date.');
    }

    const expectedStatusPrefix = `batch-${batchNumber}-`;
    if (!String(labelData.status || '').startsWith(expectedStatusPrefix)) {
      errors.push('The label dataset status does not identify the active batch.');
    }
    if (Number(generated.batchNumber) !== batchNumber) errors.push('The label dataset batch number is stale.');
    if (generated.deliveryDate !== activeBatch.deliveryDate) errors.push('The label dataset delivery date is stale.');
    if (generated.madeDate !== configured.madeDate) errors.push('The label dataset made date is stale.');
    if (generated.useByDate !== configured.useByDate) errors.push('The label dataset refrigerate-through date is stale.');
    if (generated.batchId !== configured.batchId) errors.push('The label dataset batch ID is stale.');

    if (!form) {
      errors.push('The printable label fields are unavailable.');
    } else {
      if (form.madeDate !== configured.madeDate) errors.push('The printable made date does not match the active batch.');
      if (form.useByDate !== configured.useByDate) errors.push('The printable refrigerate-through date does not match the active batch.');
      if (form.batchId !== configured.batchId) errors.push('The printable batch ID does not match the active batch.');
    }

    return { ok: errors.length === 0, errors };
  }

  const api = {
    validateLabelMenu,
    validateLabelProduction,
    validateLabelPlanRows,
    encodeLabelPrintPlan,
    parseLabelPrintPlan,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.PRPD_LABEL_PRODUCTION_GUARD = api;
})(typeof window !== 'undefined' ? window : globalThis);
