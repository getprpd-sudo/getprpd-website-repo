// Generated documentation follows the same data as the kitchen. No copied menu
// list or weekly quantities: run after changing the active recipe data/methods.
const fs = require('node:fs');
const path = require('node:path');
const data = require('../nutrition/production-data');
const methods = require('../cook-day-methods');
const core = require('../cook-day-core');
const kitchen = require('../kitchen-dashboard');
const counts = Object.entries(data.meals).flatMap(([id,meal])=>Object.keys(meal.tiers).map(tier=>({id,name:meal.name,tier,qty:1})));
const review = kitchen.review(counts,data,methods,core);
const text = [
  `# Batch ${data.batch}: Current recipe and cook record`, '',
  `Generated from production data ${data.version} and methods ${methods.version}. One-serving reference only. Live orders in the planner determine batch quantities.`, '',
  'Use Kitchen Guide for the executable recipe and Cook Log for actual yields. The former July front page is preserved in `../records/batches/HISTORICAL_COOK_RECORD_JULY_2026.md`.', '',
  '## Before production', '',
  ...review.errors.map(e=>`- STOP: ${e}`),
  ...review.decisions.map(d=>`- ${d.name}: ${d.message}`),
  '- A 96/4 label requires actual 96/4 beef. Draining 90/10 does not establish the same nutrition.',
  '- Imported customer counts, production counts and label counts must reconcile. A manual recipe quantity is not an assigned customer order.', '',
  '## Current recipes', '',
  '| Recipe | Tier | Raw protein per meal | Cook / release | Record |',
  '|---|---|---|---|---|',
  ...counts.map(c=>{
    const recipe=data.meals[c.id].tiers[c.tier],method=methods.meals[c.id];
    const protein=recipe.ingredients.filter(i=>method.proteinCook?.recipeKeys?.includes(i.key)).map(i=>`${i.amount} ${i.unit} ${i.name}`).join(', ') || 'No raw meat';
    return `| ${c.name} | ${c.tier} | ${protein} | ${method.proteinCook?.prepDayComplete?'Cook chicken ahead; finish chilled or bake prepared pan':'Follow complete Cook Day recipe'} | Finished yield, ${c.tier} portion weight, container count, changes |`;
  }), '',
  '## Record once per dish and tier', '',
  '1. Actual starting protein or mixture weight, without pooled reserve.',
  '2. Cooking endpoint and finished edible yield. Bone weight is not edible meat.',
  '3. Actual containers and weighed portions. Do not use raw ingredient totals as cooked net weights.',
  '4. Cooling times and temperatures, substitutions, shortages, taste and reheating observations.', '',
  'For Nouman kofta, 330 g raw beef plus 16.5 g Shan Seekh Kabab mix gives 346.5 g mixture per meal: five approximately 69.3 g uncooked logs. Weigh the real complete mixture and divide evenly. This does not add beef or change the controlled customer label macros.', '',
  '## Source ownership', '',
  '## Saved returning recipes', '',
  'These recipes are retained for future menus, not automatically added to this batch.', '',
  ...Object.entries(data.recipeLibrary || {}).flatMap(([name,recipe])=>[
    `### ${name}`, '', methods.methodsByName[name]?.source || '', '',
    ...Object.entries(recipe.tiers).flatMap(([tier,build])=>[
      `#### ${tier}`, '', ...build.ingredients.map(i=>`- ${i.amount} ${i.unit} ${i.name}`), '',
      ...build.assumptions.map(a=>`- ${a}`), '',
    ]),
    ...methods.methodsByName[name].prepBatches.flatMap(card=>[card.name, '', ...card.steps.map((s,i)=>`${i+1}. ${s}`), '']),
    'Cook and finish:', '', ...methods.methodsByName[name].steps.map((s,i)=>`${i+1}. ${s}`), '',
  ]),
  '- Formula and nutrition source: `../nutrition/batch10_recipes.py` and the controlled custom builds in `../nutrition/generate_production_data.py`.',
  '- Generated ingredient weights: `../nutrition/production-data.js`.',
  '- Executable methods: `../cook-day-methods.js`. Historical versions remain references, not live menu slots.',
  '- Dashboard and invariants: `../kitchen-dashboard.js`; tests: `tests/kitchen-dashboard.test.js`.', '',
].join('\n');
fs.writeFileSync(path.join(__dirname,'../active/CURRENT_MENU_COOK_RECORD.md'),text);
console.log(`Generated current cook record: ${counts.length} tiers, ${review.decisions.length} open recipe decision(s).`);
