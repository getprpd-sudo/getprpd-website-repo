const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
const expected={
 breakfasts:['High Protein Omelette','Strawberry Cheesecake Protein Pancakes','PRPD Beef Bacon Breakfast Sandwich'],
 mains:['Halal Cart Chicken + Yellow Rice','Cheesy Achiote Chicken Tacos','Lemon Herb Chicken Orzo','Southwest Beef Taco Bowl','Garlic Butter Wild Argentine Shrimp + Rice','Creamy Cajun Chicken Pasta'],
 premium:['Premium NY Strip Steak'],addons:['Chicken Tikka Snack Wrap','Buffalo Chicken Pinwheels','Oven-Baked Popcorn Chicken'],desserts:[],exclusives:['Weekly Five: Cajun + Harissa Honey'],
};
const lanePrices={standard:[10.99,12.99],beef:[13.99,15.99],seafood:[14.99,16.99],premium:[21.99,26.99]};
function releaseErrors(config,{published=false}={}){
 const errors=[],checks=config.release?.checks||{};
 if(config.batch?.number!==17)errors.push('Not Batch17.');
 if(config.batch?.published!==published)errors.push('Published state does not match requested check.');
 if(config.batch?.remindersEnabled!==false)errors.push('Reminders must remain disabled.');
 if(config.release?.approvedByOwner!==true)errors.push('Owner website publication approval is missing.');
 if(!config.release?.approvalRecordedAt||!Number.isFinite(Date.parse(config.release.approvalRecordedAt)))errors.push('Approval recording time is missing.');
 for(const name of ['menuLineupApproved','pricesApproved','menuNutritionPassed','orderConfigurationPassed','visualReviewPassed','taxPolicyUnchanged'])if(checks[name]!==true)errors.push('Website check missing: '+name);
 if((config.release?.blockers||[]).length)errors.push('Website release blockers remain.');
 for(const[section,names]of Object.entries(expected))if(JSON.stringify((config.menu?.[section]||[]).map(x=>x.name))!==JSON.stringify(names))errors.push('Approved '+section+' lineup changed.');
 const dishes=Object.values(config.menu||{}).flat();
 if(dishes.length!==14)errors.push('Expanded menu must have13 individual dishes and1 bundle.');
 const bundle=config.menu.exclusives[0];
 if(bundle?.variants?.length!==4||bundle.variants.some(v=>v.components.reduce((n,x)=>n+x.qty,0)!==5||v.components.length!==2||!v.components.some(x=>x.id==='bw1')||v.components.some(x=>!['m6','bw1'].includes(x.id))))errors.push('WeeklyFive must have five meals of Cajun and exclusive Harissa.');
 if(!config.plannerOnly?.some(x=>x.id==='bw1'&&x.name==='Harissa Honey Chicken'&&x.bundleOnly))errors.push('Exclusive Harissa recipe missing.');
 if(JSON.stringify(dishes.filter(x=>x.newThisWeek).map(x=>x.name))!==JSON.stringify(['Lemon Herb Chicken Orzo','Oven-Baked Popcorn Chicken']))errors.push('Orzo and popcorn chicken must carry the new badge.');
 for(const item of dishes){
  if(item.category==='bundle'){for(const v of item.variants)if(v.price!==(v.id.startsWith('lean-')?49.95:59.95))errors.push('WeeklyFive price changed.');continue;}
  if(item.category==='addon'){if(item.price!==7.99)errors.push('Grab&Go price changed.');}
  else{const prices=lanePrices[item.category];if(!prices||config.prices?.[item.category]?.lean!==prices[0]||config.prices?.[item.category]?.bulk!==prices[1])errors.push('Approved category prices changed: '+item.name);}
  for(const m of[item.macros,item.bulkMacros].filter(Boolean))if(['cal','protein','carbs','fat'].some(k=>!Number.isFinite(Number(m[k]))))errors.push('Incomplete source macros: '+item.name);
 }
 if(config.sauceProgram?.enabled!==true||config.sauceProgram?.freeCupsPerOrder!==3||config.sauceProgram?.extraPrice!==1)errors.push('Standing selected-sauce policy changed.');
 if(Object.keys(config.sauceProgram?.creditsByDishId||{}).length||Object.keys(config.sauceProgram?.reservedByDishId||{}).length)errors.push('Optional sauces became automatic.');
 if(config.tax?.enabled!==false)errors.push('Tax policy changed from the approved disabled policy.');
 // Physical tests and exact-media/receipt checks are separate production gates.
 // A website publication must never manufacture those passes.
 return errors;
}
function promotedConfig(config){const result=JSON.parse(JSON.stringify(config));result.batch.published=true;result.batch.remindersEnabled=false;return result;}
if(require.main===module){
 const active=process.argv.includes('--check-active');
 const file=path.join(root,'config',active?'order-config.js':'order-config.batch17-draft.js');
 const config=require(file),errors=releaseErrors(config,{published:active});
 if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}
 else if(process.argv.includes('--promote')){
  fs.writeFileSync(path.join(root,'config/order-config.js'),'const ORDER_CONFIG = '+JSON.stringify(promotedConfig(config),null,2)+';\nif(typeof window!=="undefined")window.PRPD_ORDER_CONFIG=ORDER_CONFIG;\nif(typeof module!=="undefined"&&module.exports)module.exports=ORDER_CONFIG;\n');
  console.log('Owner-approved Batch17 website configuration promoted locally. Reminders remain off; physical production/printing holds remain.');
 }else console.log('Batch17 website guard passed. Physical readiness was not asserted; no files changed.');
}
module.exports={releaseErrors,promotedConfig};

