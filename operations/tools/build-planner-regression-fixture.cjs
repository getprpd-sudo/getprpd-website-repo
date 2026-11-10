#!/usr/bin/env node
// Explicit maintenance tool; tests consume checked-in JSON, never live menus.
// Prints to stdout. It does not rewrite fixtures or any production artifact.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {execFileSync} = require('node:child_process');
const root = path.resolve(__dirname, '../..');
const source = fs.readFileSync(path.join(root,'operations/cook-day-methods.js'),'utf8');
const boundary = source.indexOf('  // Batch 11 approved rotation.');
if (boundary < 0) throw new Error('Historical method snapshot boundary missing.');
const context = {module:{exports:{}}};
vm.runInNewContext(source.slice(0,boundary)+'\nreturn data;\n});',context);
const methods = context.module.exports;
const python = process.env.PYTHON || 'python';
const archived = JSON.parse(execFileSync(python,[path.join(__dirname,'archived_recipe_data.py'),'NEXT_MENU_NUTRITION_2026-09-12.md','10'],{encoding:'utf8'}));
const customs = JSON.parse(execFileSync(python,['-c',"import sys,json;sys.path.insert(0,'operations/nutrition');import generate_production_data as g;d=g.generate(include_archived_custom=True);print(json.dumps({k:d['meals'][k] for k in ('p1','p2','p3')}))"],{cwd:root,encoding:'utf8'}));
const meals = Object.fromEntries(Object.entries(methods.dishNames).map(([id,name])=>{
  if(!archived[name]) throw new Error(`Missing historical recipe ${name}`);
  const category=id[0]==='d'?'Dessert':id[0]==='a'?'Grab & Go':id[0]==='b'?'Breakfast':'Main';
  return [id,{...archived[name],category}];
}));
const data={batch:10,version:'regression-2026-09-21',
  notice:'Regression scenarios with Batch 10 identities, not a delivered-batch reconstruction or production lock. Public quantities use the September 12 controlled document, except the approved September 16 bean-free Enchilada revision. Private custom quantities are preserved from the generator. Method safety and routing corrections are included.',meals:{...meals,...customs}};
// Regression scenarios retain Batch 10 identities, with the subsequently
// approved bean-free Enchilada. This is not a delivered-batch reconstruction.
data.meals.m4={...data.meals.m4,...require('../nutrition/production-data').recipeLibrary['Chicken Enchilada Bake'],
  source:{document:'generate_production_data.py:recipeLibrary',revision:'bean-free September 16'}};
// Avoid duplicating every method in the immutable file. These maps are not
// needed by the renderer. Per-dish identities remain recorded in dishNames.
delete methods.methodsByName;
delete methods.methodHistoryByName;
console.log(JSON.stringify(process.argv.includes('--methods')?methods:data,null,2));
