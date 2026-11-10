#!/usr/bin/env node
// Read-only: historical recipes are audited, never activated by this tool.
const {execFileSync}=require('node:child_process');
const path=require('node:path');
const data=require('../nutrition/production-data');
const methods=require('../cook-day-methods');
const kitchen=require('../kitchen-dashboard');
const core=require('../cook-day-core');
const library=JSON.parse(execFileSync(process.env.PYTHON || 'python',[path.join(__dirname,'export-planner-library.py')],{encoding:'utf8'}));
const normalize=name=>name.toLowerCase().replace(/[^a-z0-9]/g,'');
const latest=new Map(Object.entries(methods.methodHistoryByName).map(([name,rows])=>[normalize(name),rows.at(-1).method]));
for(const [name,method] of Object.entries(methods.methodsByName)) latest.set(normalize(name),method);
for(const [name,recipe] of Object.entries(data.recipeLibrary || {})) library[name]=recipe;
for(const [id,recipe] of Object.entries(data.meals)) {library[recipe.name]=recipe;latest.set(normalize(recipe.name),methods.meals[id]);}
const report=[];
for(const [name,recipe] of Object.entries(library)) {
  const sourceName=recipe.methodName || name;
  const versioned=methods.methodHistoryByName[sourceName]?.find(row=>row.batch===recipe.source?.batch)?.method;
  const method=versioned || latest.get(normalize(sourceName));
  if(!method){report.push({name,status:'blocked',errors:['No controlled planner method for this recipe.']});continue;}
  const id=Object.keys(data.meals).find(id=>data.meals[id].name===name)||'library';
  const selected={...data,meals:{[id]:recipe}};
  const local={...methods,meals:{[id]:method},productionExtras:id==='library'?[]:methods.productionExtras};
  const counts=Object.keys(recipe.tiers).map(tier=>({id,name,tier,qty:2}));
  try {
    const model=kitchen.build(counts,selected,local,core,0);
    const errors=[...(recipe.sourceErrors || []),...model.review.errors];
    if(recipe.source?.batch && !versioned) errors.push(`No matching method version for archived Batch ${recipe.source.batch}.`);
    report.push({name,source:recipe.source || 'current controlled build',status:errors.length?'blocked':'arithmetic-pass',tiers:counts.length,errors,decisions:model.review.decisions,productionChecks:model.review.warnings});
  }catch(error){report.push({name,status:'blocked',errors:[error.message]});}
}
console.log(JSON.stringify({recipes:report.length,passed:report.filter(r=>r.status==='arithmetic-pass').length,blocked:report.filter(r=>r.status==='blocked').length,report},null,2));
if(process.argv.includes('--strict') && report.some(r=>r.status==='blocked')) process.exitCode=1;
