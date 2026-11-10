const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const draft=require('../config/order-config.batch16-draft');
const engine=require('../operations/production-engine');
const kitchen=require('../operations/kitchen-dashboard');
const cookCore=require('../operations/cook-day-core');
const groceryCatalog=require('../operations/grocery-catalog').catalog;
const root=path.resolve(__dirname,'..');
const generated=spawnSync('python',['-c',[
  'import json,sys',
  'from unittest.mock import patch',
  'sys.path.insert(0, "operations/nutrition")',
  'import generate_production_data as g',
  'config=json.loads(sys.stdin.read())',
  'with patch.object(g.subprocess, "check_output", return_value=json.dumps(config)):',
  ' print(json.dumps(g.generate()))',
].join('\n')],{cwd:root,input:JSON.stringify(draft),encoding:'utf8'});
if(generated.status!==0)throw new Error(generated.stderr);
const data=JSON.parse(generated.stdout);
const context={window:{PRPD_ORDER_CONFIG:draft,PRPD_PRODUCTION_DATA:data},console};
vm.runInNewContext(fs.readFileSync(path.join(root,'operations/cook-day-methods.js'),'utf8'),context);
const methods=context.window.PRPD_COOK_METHODS;

test('Batch 16 records owner publication approval while the staged source remains unpublished',()=>{
  assert.equal(draft.batch.published,false);
  assert.equal(draft.batch.remindersEnabled,false);
  assert.equal(draft.release.approvedByOwner,true);
  assert.equal(draft.release.checks.menuLineupApproved,true);
  assert.equal(draft.release.checks.weeklyFiveApproved,true);
  assert.equal(draft.release.checks.weeklySaucePairApproved,true);
  assert.equal(draft.sauceProgram.freeCupsPerOrder,3);
  assert.equal(draft.sauceProgram.extraPrice,1);
  assert.deepEqual(draft.sauceProgram.choices.map(choice=>choice.id),['sweet-heat','garlic-herb-yogurt']);
  for(const choice of draft.sauceProgram.choices){
    assert.equal(choice.gramsPerCup,40);
    assert.equal(choice.batchSizeCups,5);
    assert.equal(choice.batchIngredients.reduce((sum,item)=>sum+item.grams,0),225);
    assert.ok(choice.batchIngredients.every(item=>Number.isInteger(item.grams)));
  }
  assert.equal(methods.groceryAdjustments.length,0,'future menus must not inherit Batch 14 pantry substitutions');
  assert.deepEqual(
    JSON.parse(JSON.stringify(methods.productionExtras.map(extra=>({
      dishId:extra.dishId,
      tier:extra.tier,
      ownerServings:extra.ownerServings,
      optional:extra.optional,
      enabled:extra.enabled,
    })))),
    [
      {dishId:'m1',tier:'lean',ownerServings:1,optional:false,enabled:true},
      {dishId:'m4',tier:'lean',ownerServings:1,optional:false,enabled:true},
      {dishId:'m2',tier:'lean',ownerServings:2,optional:false,enabled:true},
    ],
    'Batch 16 must include only the four owner-approved unlabeled home meals',
  );
});

test('optional sauces never autofill and recipe-required cups remain independent',()=>{
  const compile=(id,tier)=>engine.compileProduction({
    orders:[{orderId:`cup-${id}`,customer:'Cup audit',items:[{id,tier,qty:1}],sauces:[]}],
    data,
    methods,
    config:draft,
    extras:[],
  });
  const butter=compile('m2','lean');
  assert.equal(butter.saucePlan.totalPhysicalCups,0);
  assert.equal(butter.requirements.some(row=>row.key==='sauce_cup'),false);
  const shortRib=compile('m7','lean');
  assert.equal(shortRib.saucePlan.totalPhysicalCups,0);
  assert.equal(shortRib.requirements.some(row=>row.key==='sauce_cup'),false);
  const hummus=compile('a3','single');
  assert.equal(hummus.saucePlan.totalPhysicalCups,0);
  assert.equal(hummus.requirements.some(row=>row.key==='sauce_cup'),false);
  const salmon=compile('m6','lean');
  assert.equal(salmon.saucePlan.totalPhysicalCups,0);
  assert.equal(salmon.requirements.some(row=>row.key==='sauce_cup'),false);
  const bbqMac=compile('m4','lean');
  assert.equal(bbqMac.saucePlan.totalPhysicalCups,0,'optional order-level sauces must not autofill');
  assert.equal(bbqMac.cups.totalCustomer,1,'BBQ Mac gets one matching required BBQ cup');
  assert.equal(bbqMac.cups.customer[0].name,'G Hughes Sugar-Free BBQ Sauce');
  assert.equal(bbqMac.requirements.some(row=>row.key==='sauce_cup'),true);
  const sweetChili=compile('bw1','bulk');
  assert.equal(sweetChili.saucePlan.totalPhysicalCups,0,'optional order-level sauces must not autofill');
  assert.equal(sweetChili.cups.totalCustomer,1,'Sweet Chili gets one matching required Sweet Chili cup');
  assert.equal(sweetChili.cups.customer[0].name,'G Hughes Sugar-Free Sweet Chili Sauce');
  assert.equal(sweetChili.requirements.some(row=>row.key==='sauce_cup'),true);
});

test('Batch 16 short rib uses Idahoan Original mash and never stale fresh-potato or Betty Crocker instructions',()=>{
  const methodText=JSON.stringify(methods.meals.m7);
  const recipeText=JSON.stringify(data.meals.m7.tiers);
  assert.match(methodText,/Idahoan Original/);
  assert.match(methodText,/owner-tested Idahoan Original formula/);
  assert.match(methodText,/Do not (?:use .*|peel, cut, boil, or mash )fresh potatoes/i);
  assert.doesNotMatch(methodText,/Betty Crocker/);
  assert.match(recipeText,/Idahoan Original/);
  assert.match(recipeText,/owner-tested Idahoan Original mash/);
  assert.match(recipeText,/controlled low-salt mash formula/);
  assert.match(recipeText,/Do not (?:use .*|peel, cut, boil, or mash )fresh potatoes/i);
  assert.doesNotMatch(recipeText,/Betty Crocker/);
  assert.deepEqual(JSON.parse(JSON.stringify(methods.meals.m7.groceryOverrides.short_rib_cooked)),{
    lean:302.4,
    bulk:403.2,
    unit:'g',
    name:'Bone-in beef short ribs, raw',
    station:'Meat & Seafood',
    applyRawProteinReserve:true,
    confidence:'planning',
    note:'Raw bone-in pull at the provisional USDA 49.6% cooked-edible planning benchmark, not a measured PRPD yield. The configured raw-protein reserve is added separately.',
  });
});

test('Batch 16 draft archives only the currently published menu for closed browsing',()=>{
  assert.equal(draft.publishedArchive.published,true);
  assert.equal(draft.publishedArchive.batch.number,16);
  assert.equal(draft.publishedArchive.batch.published,true);
  assert.equal(draft.publishedArchive.prices.standard.lean,10.99);
  const archivedNames=Object.values(draft.publishedArchive.menu).flat().map(item=>item.name);
  const stagedNames=Object.values(draft.menu).flat().map(item=>item.name);
  assert.ok(archivedNames.includes('Butter Chicken'));
  assert.ok(archivedNames.includes('Hot Honey Chicken Sliders'));
  assert.ok(!archivedNames.includes('Creamy Cajun Chicken Pasta'));
  assert.ok(!archivedNames.includes('Chicken Enchilada Bake'));
  assert.ok(stagedNames.includes('Butter Chicken'));
  assert.ok(stagedNames.includes('Hot Honey Chicken Sliders'));
  assert.ok(stagedNames.includes('Loaded Buffalo Chicken Potato'));
  assert.ok(stagedNames.includes('Braised Beef Short Rib'));
  assert.ok(!stagedNames.includes('Premium NY Strip Steak'));
  assert.ok(stagedNames.includes('Chicken Shakshuka'));
  assert.ok(stagedNames.includes('Grilled Cheese Breakfast Burrito'));
  assert.ok(stagedNames.includes('BBQ Chicken Mac & Cheese'));
  assert.ok(stagedNames.includes('Cajun Garlic Salmon'));
  assert.ok(stagedNames.includes('Buffalo Chicken Pinwheels'));
  assert.ok(stagedNames.includes('Mediterranean Chicken Hummus Box'));
  assert.ok(!stagedNames.includes('French Toast'));
  assert.ok(!stagedNames.includes('Meatball Arrabbiata Pasta'));
  assert.ok(!stagedNames.some(name=>/Shrimp/.test(name)));
  assert.equal(draft.menu.desserts.length,0);
  assert.ok(!stagedNames.includes('Blueberry Vanilla Protein Baked Oatmeal Squares'));
  assert.ok(!stagedNames.includes('BBQ Chicken Lavash Flatbread'));
  assert.ok(!stagedNames.includes('Caprese Protein Pasta Box'));
});

test('only explicitly approved Batch 16 cards are marked owner-approved',()=>{
  const approved=Object.values(draft.menu).flat().filter(item=>item.ownerApproved).map(item=>item.name).sort();
  assert.deepEqual(approved,[
    'BBQ Chicken Mac & Cheese',
    'Beef Seekh Kabab Shawarma',
    'Braised Beef Short Rib',
    'Breakfast Quesadilla',
    'Buffalo Chicken Pinwheels',
    'Butter Chicken',
    'Cajun Garlic Salmon',
    'Chicken Shakshuka',
    'Chicken Tikka Snack Wrap',
    'Egg Bites with Potato Hash',
    'Grilled Cheese Breakfast Burrito',
    'Hot Honey Chicken Sliders',
    'Loaded Buffalo Chicken Potato',
    'Mediterranean Chicken Hummus Box',
    'Weekly Five: Butter Chicken + Sweet Chili',
  ]);
  assert.equal(draft.menu.exclusives[0].image,'/assets/images/meals/menu/batch-13-2026-10-03/butter-chicken-sweet-chili-bundle-overhead-batch-13.jpg');
  assert.equal(draft.menu.exclusives[0].imageCrop,'rotate-180');
  assert.equal(draft.menu.mains.find(item=>item.id==='m3').imageCrop,'square-low');
  assert.equal(draft.menu.mains.find(item=>item.id==='m5').image,'/assets/images/meals/beef-seekh-shawarma-landscape-v2.png');
  assert.equal(draft.menu.mains.find(item=>item.id==='m5').imageCrop,undefined);
  assert.equal(draft.menu.premium.find(item=>item.id==='m7').imageCrop,'landscape-low');
  assert.equal(draft.menu.addons.find(item=>item.id==='a1').imageCrop,'landscape-tikka-close');
});

test('selected slider return uses thighs, one pickle per slider, and shared Sweet Heat without a required cup',()=>{
  const slider=draft.menu.mains.find(item=>item.id==='m1');
  assert.equal(slider.name,'Hot Honey Chicken Sliders');
  assert.equal(slider.image,'/assets/images/meals/menu/batch-6-2026-08-15/hot-honey-chicken-sliders.webp');
  const lean=data.meals.m1.tiers.lean.ingredients;
  assert.ok(lean.some(item=>item.key==='chicken_thigh_raw' && item.amount===100 && /75%/.test(item.note)));
  assert.ok(lean.some(item=>item.key==='kings_hawaiian_roll' && item.amount===3));
  assert.ok(lean.some(item=>item.key==='pickles' && item.amount===15 && /one drained pickle chip per slider/i.test(item.note)));
  assert.ok(lean.some(item=>item.key==='salt' && item.amount===.5));
  assert.ok(lean.some(item=>item.allocations?.['batch13-sweet-heat']>0));
  assert.equal(lean.some(item=>item.key==='chicken_breast_cooked'),false);
  assert.deepEqual(slider.macros,{cal:525,protein:37,carbs:60,fiber:2,fat:15});
  assert.deepEqual(slider.bulkMacros,{cal:685,protein:46,carbs:80,fiber:3,fat:20});
  const plan=engine.compileProduction({orders:[{orderId:'slider',customer:'Slider audit',items:[{id:'m1',tier:'lean',qty:1}],sauces:[]}],data,methods,config:draft,extras:[]});
  assert.equal(plan.requirements.some(row=>row.key==='sauce_cup'),false);
});

test('Batch 16 corrected cold boxes and Butter Chicken are reflected in recipe data and methods',()=>{
  assert.equal(data.meals.a2.tiers.single.ingredients.find(item=>item.key==='chicken_thigh_raw').amount,100);
  assert.equal(data.meals.a3.tiers.single.ingredients.find(item=>item.key==='chicken_thigh_raw').amount,100);
  assert.equal(data.meals.a2.tiers.single.ingredients.find(item=>item.key==='small_tortilla').amount,1);
  assert.match(JSON.stringify(methods.meals.a2),/exactly four pinwheel pieces/i);
  const butter=data.meals.m2.tiers.lean.ingredients;
  assert.equal(butter.find(item=>item.key==='chicken_thigh_raw').amount,200);
  assert.equal(butter.find(item=>item.key==='tomato_paste').amount,10);
  assert.equal(butter.find(item=>item.key==='crushed_tomatoes').amount,130);
  assert.equal(butter.some(item=>item.key==='water'),false);
  assert.equal(data.meals.m2.tiers.bulk.ingredients.find(item=>item.key==='chicken_thigh_raw').amount,250);
  assert.equal(data.meals.b3.tiers.lean.ingredients.find(item=>item.key==='chicken_thigh_raw').amount,120);
  assert.equal(data.meals.b3.tiers.bulk.ingredients.find(item=>item.key==='chicken_thigh_raw').amount,160);
  assert.equal(data.meals.b4.tiers.lean.ingredients.find(item=>item.key==='chicken_thigh_raw').amount,130);
  assert.equal(data.meals.b4.tiers.bulk.ingredients.find(item=>item.key==='chicken_thigh_raw').amount,180);
  assert.match(JSON.stringify(methods.meals.m2),/blend completely smooth/i);
});

test('Breakfast Quesadilla uses only Mission medium tortillas and one shared Prep Day egg cook',()=>{
  const lean=data.meals.b3.tiers.lean.ingredients;
  const bulk=data.meals.b3.tiers.bulk.ingredients;
  assert.equal(lean.find(item=>item.key==='small_tortilla').amount,2);
  assert.equal(bulk.find(item=>item.key==='small_tortilla').amount,3);
  assert.equal([...lean,...bulk].some(item=>item.key==='corn_street_tortilla'),false);
  const kit=methods.meals.b3.prepBatches.find(task=>task.name==='Breakfast Quesadilla wrap and cheese kit');
  assert.deepEqual(JSON.parse(JSON.stringify(kit.ingredientKeys)),['mozzarella','small_tortilla']);
  assert.match(kit.instruction,/2 Lean or 3 Bulk Mission 70-calorie/i);
  assert.doesNotMatch(JSON.stringify(methods.meals.b3),/keep uncracked|white corn|4 Lean or 6 Bulk/i);
  assert.equal(methods.meals.b3.prepBatches.filter(task=>task.name==='Cook shared Quesadilla and Burrito egg base').length,1);
});

test('oven-shaped Seekh and Nouman kofta carry an 8 percent reserve without shrinking customer pieces',()=>{
  const counts=[
    {id:'m5',name:data.meals.m5.name,tier:'lean',qty:7},
    {id:'p1',name:data.meals.p1.name,tier:'lean',qty:10},
  ];
  const plan=cookCore.componentPlan(counts,data,methods,{rawProteinBufferPct:5,rawProteinReserveByDish:methods.rawProteinReserveByDish,riceBufferPct:15,riceYieldFactor:2.75});
  const seekh=plan.prepBatches.find(task=>task.dishId==='m5' && task.pieceNoun==='seekh log');
  const kofta=plan.prepBatches.find(task=>task.dishId==='p1' && task.pieceNoun==='kofta log');
  assert.deepEqual({sold:seekh.customerPieceCount,spare:seekh.reservePieces,total:seekh.totalPieceCount},{sold:7,spare:1,total:8});
  assert.deepEqual({sold:kofta.customerPieceCount,spare:kofta.reservePieces,total:kofta.totalPieceCount},{sold:50,spare:4,total:54});
  assert.equal(methods.rawProteinReserveByDish.m5,100/7);
  assert.equal(methods.rawProteinReserveByDish.p1,8);
  assert.equal(seekh.ingredients.find(item=>item.key==='beef_90_raw').bufferedAmount,1360);
  assert.equal(kofta.ingredients.find(item=>item.key==='beef_96_raw').bufferedAmount,3564);
  assert.equal(seekh.ingredients.find(item=>item.key==='shan_seekh').bufferedAmount,27.2);
  assert.equal(kofta.ingredients.find(item=>item.key==='shan_seekh').bufferedAmount,178.2);
  assert.match(seekh.pieceWeightNote,/Never reduce a customer log/i);
  assert.match(kofta.pieceWeightNote,/Never shrink a customer log/i);
});

test('Batch 16 Loaded Buffalo keeps chicken salt-free and seasons the complete shared vegetable roast',()=>{
  const recipeIngredients=Object.values(data.meals.m3.tiers).flatMap(tier=>tier.ingredients);
  assert.equal(recipeIngredients.some(item=>item.key==='salt' && item.note==='component:potato-roast'),true);
  const vegetableTask=methods.meals.m3.prepBatches.find(task=>task.name==='Loaded Buffalo potatoes and broccoli');
  assert.ok(vegetableTask);
  assert.equal((vegetableTask.formulaIngredients||[]).some(item=>(item.sourceKey||item.key)==='salt'),true);
  assert.match(JSON.stringify(methods.meals.m3),/Add no salt/);
  assert.match(JSON.stringify(methods.meals.m3),/Season the complete roast once/);
});

test('Batch 16 planner completion is Saturday at midnight',()=>{
  assert.equal(draft.batch.labelProduction.completedAt,'2026-10-24T00:00:00-05:00');
  const planner=fs.readFileSync(path.join(root,'operations/cook-day-planner.html'),'utf8');
  assert.match(planner,/labelProduction\?\.completedAt/);
  assert.match(planner,/plannedPackTime\(\)/);
});

test('next-menu production counts chosen sauces once and exposes them in Prep Day and shopping',()=>{
  const orders=[{orderId:'review',customer:'Review',items:[{id:'m2',tier:'lean',qty:5}],sauces:[{id:'sweet-heat',name:'PRPD Sweet Heat',qty:2},{id:'garlic-herb-yogurt',name:'Garlic Herb Yogurt',qty:2}]}];
  const plan=engine.compileProduction({orders,data,methods,config:draft,extras:[]});
  assert.deepEqual(plan.diagnostics.errors,[]);
  assert.equal(plan.saucePlan.totalPhysicalCups,4);
  assert.equal(plan.requirements.find(row=>row.key==='sauce_cup').required,4);
  assert.equal(plan.requirements.find(row=>row.key==='sriracha').required,15);
  const model=kitchen.buildFromPlan(plan);
  const html=kitchen.render(model,'batch');
  assert.match(html,/PRPD Sweet Heat/);
  assert.match(html,/Garlic Herb Yogurt/);
  assert.match(html,/2 cups/);
  const changed=engine.compileProduction({orders:[{...orders[0],sauces:[{id:'sweet-heat',name:'PRPD Sweet Heat',qty:1}]}],data,methods,config:draft,extras:[]});
  assert.notEqual(plan.snapshot.orderHash,changed.snapshot.orderHash);
  assert.equal(changed.saucePlan.totalPhysicalCups,1);
});

test('Batch 16 renders one physical card for house sauce cups and incorporated use',()=>{
  const orders=[{
    orderId:'shared-sauce-review',customer:'Review',
    items:[{id:'a1',tier:'single',qty:1},{id:'m1',tier:'lean',qty:1}],
    sauces:[{id:'sweet-heat',name:'PRPD Sweet Heat',qty:1},{id:'garlic-herb-yogurt',name:'Garlic Herb Yogurt',qty:1}],
  }];
  const plan=engine.compileProduction({orders,data,methods,config:draft,extras:[]});
  assert.deepEqual(plan.diagnostics.errors,[]);
  const model=kitchen.buildFromPlan(plan);
  assert.equal(model.jobs.filter(job=>job.key==='shared-sauce:batch13-sweet-heat').length,1);
  assert.equal(model.jobs.filter(job=>job.key==='shared-sauce:garlic-herb-yogurt').length,1);
  assert.equal(model.jobs.some(job=>job.key==='selected-sauce:sweet-heat'),false);
  assert.equal(model.jobs.some(job=>job.key==='selected-sauce:garlic-herb-yogurt'),false);
  const html=kitchen.render(model,'batch');
  assert.equal((html.match(/<h3>PRPD Sweet Heat<\/h3>/g)||[]).length,1);
  assert.equal((html.match(/<h3>Garlic Herb Yogurt<\/h3>/g)||[]).length,1);
});

test('Batch 16 combines shared breakfast eggs and coordinated potato roasting into one card each',()=>{
  const orders=[{
    orderId:'shared-work-review',customer:'Review',sauces:[],
    items:[{id:'b1',tier:'lean',qty:1},{id:'b2',tier:'lean',qty:1},{id:'b3',tier:'lean',qty:1},{id:'m3',tier:'lean',qty:1}],
  }];
  const model=kitchen.buildFromPlan(engine.compileProduction({orders,data,methods,config:draft,extras:[]}));
  const eggs=model.jobs.filter(job=>job.key==='egg:shared-breakfast-eggs');
  assert.equal(eggs.length,1);
  assert.deepEqual(new Set(eggs[0].destinations.map(row=>row.id)),new Set(['b2','b3']));
  const potatoes=model.jobs.filter(job=>job.group==='batch16-potato-roast');
  assert.equal(potatoes.length,1);
  assert.deepEqual(new Set(potatoes[0].destinations.map(row=>row.id)),new Set(['b1','m3']));
  const card=kitchen.jobCard(potatoes[0]);
  assert.match(card,/Apply the listed salt, garlic powder, paprika, and a light cooking-oil drizzle to all of it/);
  assert.doesNotMatch(card,/Loaded Buffalo potato and broccoli portion salt-free/);
  assert.doesNotMatch(card,/only to the Egg Bite hash portion/);
});

test('Batch 16 shared chicken renders one common salt base and no separate oil finish',()=>{
  const orders=[{
    orderId:'shared-chicken-review',customer:'Review',sauces:[],
    items:[{id:'b3',tier:'lean',qty:1},{id:'b4',tier:'lean',qty:1},{id:'m1',tier:'lean',qty:1},{id:'a3',tier:'single',qty:1}],
  }];
  const plan=engine.compileProduction({orders,data,methods,config:draft,extras:[]});
  const group=plan.component.seasoningGroups.find(row=>String(row.id).includes('batch16-shared-aromatic-chicken'));
  assert.ok(group);
  assert.equal(group.baseSeasoning.some(item=>item.key==='salt'),true);
  assert.equal(group.allocations.some(row=>row.finishSeasoning.some(item=>item.key==='salt')),false);
  const html=kitchen.render(kitchen.buildFromPlan(plan),'prep');
  assert.match(html,/Cooking oil:<\/b> use only a light avocado-oil drizzle/);
  assert.doesNotMatch(html,/salt-free aromatic/i);
});

test('Batch 16 customer bag sauces never return to meal containers',()=>{
  const orders=[{
    orderId:'loose-cup-review',customer:'Review',sauces:[],
    items:[{id:'m4',tier:'lean',qty:1},{id:'bw1',tier:'bulk',qty:1}],
  }];
  const html=kitchen.render(kitchen.buildFromPlan(engine.compileProduction({orders,data,methods,config:draft,extras:[]})),'cook');
  assert.match(html,/Stage loose bag sauces/);
  assert.match(html,/Keep every cup out of the meal container/);
  assert.doesNotMatch(html,/Pack one sealed 30 g matching (?:BBQ|Sweet Chili) sauce cup with every meal/);
});

test('Batch 16 kitchen measures never render eighth-teaspoon fractions',()=>{
  for(const grams of [.3,.7,1.1,2.9,6.7]){
    const text=cookCore.dualAmount({unit:'g',measure:{type:'spice',gramsPerTsp:3.1}},grams);
    assert.doesNotMatch(text,/⅛|1\/8/);
  }
});

test('Batch 16 short-rib card exposes the complete raw pull including reserve',()=>{
  const orders=[{orderId:'short-rib-review',customer:'Review',sauces:[],items:[{id:'m7',tier:'lean',qty:5}]}];
  const html=kitchen.render(kitchen.buildFromPlan(engine.compileProduction({orders,data,methods,config:draft,extras:[]})),'batch');
  assert.match(html,/Cook 1,587\.6 g raw bone-in short ribs/);
  assert.match(html,/1,512 g base pull \+ 75\.6 g 5% reserve/);
});

test('every Batch 16 recipe tier resolves its named method without production errors',()=>{
  assert.equal(Object.keys(data.meals).length,18);
  assert.equal(Object.values(data.meals).reduce((sum,record)=>sum+Object.keys(record.tiers||{}).length,0),30);
  const failures=[];
  for(const [id,record] of Object.entries(data.meals)){
    for(const tier of Object.keys(record.tiers||{})){
      const plan=engine.compileProduction({
        orders:[{orderId:`smoke-${id}-${tier}`,customer:'Smoke',items:[{id,tier,qty:1}],sauces:[]}],
        data,
        methods,
        config:draft,
        extras:[],
      });
      if(plan.diagnostics.errors.length)failures.push({id,tier,name:record.name,errors:plan.diagnostics.errors});
    }
  }
  assert.deepEqual(failures,[]);
});

test('the three final owner choices are staged and rejected substitutes stay out',()=>{
  assert.equal(data.meals.b4.name,'Chicken Shakshuka');
  assert.equal(data.meals.a2.name,'Buffalo Chicken Pinwheels');
  assert.equal(data.meals.a3.name,'Mediterranean Chicken Hummus Box');
  assert.equal(data.meals.m5.name,'Beef Seekh Kabab Shawarma');
  assert.equal(data.meals.b2.name,'Grilled Cheese Breakfast Burrito');
  assert.equal(data.meals.m4.name,'BBQ Chicken Mac & Cheese');
  assert.equal(data.meals.m6.name,'Cajun Garlic Salmon');
  assert.equal(draft.menu.mains.find(item=>item.id==='m6').image,'','Cajun salmon must use the honest branded placeholder');
  assert.equal(Object.values(data.meals).some(meal=>/Shrimp/.test(meal.name)),false);
  assert.equal(Object.values(data.meals).some(meal=>meal.name==='Caprese Protein Pasta Box'),false);
  const publicCards=[...draft.menu.breakfasts,...draft.menu.mains,...draft.menu.premium,...draft.menu.desserts,...draft.menu.addons];
  assert.equal(publicCards.reduce((sum,item)=>sum+1+(item.bulkMacros?1:0),0),25);
  for(const item of publicCards){
    for(const macros of [item.macros,item.bulkMacros].filter(Boolean)){
      assert.ok(Object.values(macros).every(Number.isFinite),`${item.name} must not expose pending/null macros`);
    }
  }
  assert.match(groceryCatalog.protein_pasta.query,/Barilla Protein Plus spaghetti/);
  assert.match(groceryCatalog.kroger_protein_pasta.query,/Kroger/);
  assert.match(groceryCatalog.barilla_protein_plus_rotini.packageLabel,/00076808533583/);
  assert.equal(groceryCatalog.barilla_protein_plus_rotini.confidence,'planning');
});

test('final owner choices preserve exact structured quantities and the incorporated BBQ finish',()=>{
  const ingredients=(id,tier)=>data.meals[id].tiers[tier].ingredients;
  const find=(rows,key,note='')=>rows.find(item=>item.key===key && (!note || item.note.includes(note)));
  const burritoLean=ingredients('b2','lean');
  const burritoBulk=ingredients('b2','bulk');
  assert.equal(find(burritoLean,'beef_90_raw').amount,120);
  assert.equal(find(burritoBulk,'beef_90_raw').amount,180);
  assert.equal(find(burritoLean,'small_tortilla').amount,2);
  assert.equal(find(burritoBulk,'small_tortilla').amount,3);
  const macLean=ingredients('m4','lean');
  const macBulk=ingredients('m4','bulk');
  assert.equal(find(macLean,'chicken_thigh_raw').amount,180);
  assert.equal(find(macBulk,'chicken_thigh_raw').amount,250);
  assert.equal(find(macLean,'protein_mac').amount,50);
  assert.equal(find(macBulk,'protein_mac').amount,60);
  const macSauce=find(macLean,'bbq_sauce');
  assert.equal(macSauce.amount,50);
  assert.equal(find(macLean,'apple_cider_vinegar').amount,5);
  assert.equal(find(macLean,'water').amount,5);
  assert.deepEqual(macSauce.allocations,{'bbq-incorporated':20,'bbq-side-cup':30});
  const loadedLean=ingredients('m3','lean');
  const loadedBulk=ingredients('m3','bulk');
  assert.equal(find(loadedLean,'chicken_thigh_raw').amount,200);
  assert.equal(find(loadedBulk,'chicken_thigh_raw').amount,250);
  const salmonLean=ingredients('m6','lean');
  const salmonBulk=ingredients('m6','bulk');
  assert.equal(find(salmonLean,'pink_salmon_raw').amount,220);
  assert.equal(find(salmonBulk,'pink_salmon_raw').amount,300);
  assert.equal(find(salmonLean,'quinoa_dry').amount,50);
  assert.equal(find(salmonBulk,'quinoa_dry').amount,65);
  assert.equal(find(salmonLean,'green_beans').amount,120);
  assert.equal(find(salmonBulk,'green_beans').amount,150);
  const pinwheels=ingredients('a2','single');
  assert.equal(find(pinwheels,'small_tortilla').amount,1);
  assert.equal(pinwheels.some(item=>item.key==='lavash'),false);
  assert.match(JSON.stringify(methods.meals.a2),/one 70-calorie Mission Carb Balance medium flour tortilla/i);
  assert.match(JSON.stringify(methods.meals.a2),/exactly four pinwheel pieces/i);
  assert.doesNotMatch(JSON.stringify(methods.meals.a2),/lavash/i);
});
