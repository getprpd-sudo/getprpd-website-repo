(function(root,factory){
  const node=typeof module!=='undefined' && module.exports;
  const api=factory(node?require('./cook-day-core'):root.PRPD_COOK_DAY,
    node?require('./kitchen-workflow'):root.PRPD_KITCHEN_WORKFLOW,
    node?require('./grocery-list-core'):root.PRPD_GROCERY_CORE,
    node?require('../config/order-config'):root.PRPD_ORDER_CONFIG);
  if(node) module.exports=api;
  if(root) root.PRPD_PRODUCTION_ENGINE=api;
})(typeof window!=='undefined'?window:globalThis,function(core,workflow,grocery,defaultConfig){
  'use strict';
  const SCHEMA='production-content-v3';
  const clone=value=>value===undefined?undefined:JSON.parse(JSON.stringify(value));
  const slug=value=>String(value||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const sum=(rows,field)=>rows.reduce((n,row)=>n+Number(row[field]||0),0);
  const unique=rows=>[...new Set(rows)];
  function canonical(value){
    if(value===undefined) return 'null';
    if(value===null || typeof value!=='object') return JSON.stringify(value);
    if(Array.isArray(value)) return '['+value.map(canonical).join(',')+']';
    return '{'+Object.keys(value).filter(key=>value[key]!==undefined).sort().map(key=>JSON.stringify(key)+':'+canonical(value[key])).join(',')+'}';
  }
  // Deterministic 128-bit content checksum, not an authentication primitive.
  function fingerprint(value){
    const text=canonical(value),mask=(1n<<64n)-1n;
    let a=14695981039346656037n,b=7809847782465536322n;
    for(let i=0;i<text.length;i++) {const n=BigInt(text.charCodeAt(i));a=((a^n)*1099511628211n)&mask;b=((b^n)*14029467366897019727n)&mask;}
    return a.toString(16).padStart(16,'0')+b.toString(16).padStart(16,'0');
  }
  function freeze(value){
    if(value && typeof value==='object' && !Object.isFrozen(value)){Object.values(value).forEach(freeze);Object.freeze(value);}return value;
  }
  function compareSnapshots(previous,current){
    const fields={orders:'orderHash',recipes:'recipeHash',extras:'extrasHash',buffer:'bufferHash',demand:'demandHash',sauces:'sauceHash',batch:'batchHash'};
    const changed=Object.entries(fields).filter(([,key])=>previous?.[key]!==current?.[key]).map(([label])=>label);
    if(previous?.schemaVersion!==current?.schemaVersion) changed.unshift('schema');
    return {same:Boolean(previous&&current&&previous.id===current.id),changed,requiresReview:changed.length>0};
  }
  function quantity(item,amount=item.baseAmount){
    const basis=item.quantityBasis || item.weightBasis || (item.unit==='each'?'count':/_dry$/.test(item.key)?'dry-input':/_raw$/.test(item.key)?'raw-input':'recipe-input');
    return {value:amount,unit:item.unit||'g',basis,measured:false};
  }
  function stableRecipeId(record,name){return String(record.recipeId || `recipe:${slug(name||record.name)}`);}
  function packageType(row,record,method,config){
    const configured=Object.values(config?.menu||{}).flatMap(value=>Array.isArray(value)?value:[]).find(item=>item.id===row.id&&item.name===record.name);
    return row.packageType || record.packageType || method.packageType || configured?.packageType ||
      (/dessert/i.test(record.category||'')?'dessert_cup':/add-on|grab.?go/i.test(record.category||'')?'grab_go':'meal_container');
  }
  function registryFrom(data,methods){
    const bySlot={},current=[],historical=[],errors=[];
    for(const [slot,record] of Object.entries(data.meals||{})){
      const method=methods.meals?.[slot],id=stableRecipeId(record,record.name);
      const version=fingerprint({record:{...record,id:undefined},method:{...method,recipeName:undefined},adjustments:(methods.groceryAdjustments||[]).filter(row=>row.dishId===slot).map(({dishId,...row})=>row)});
      const ref={id,version,name:record.name,status:'current',category:record.category||'',tiers:Object.keys(record.tiers||{}),components:(method?.prepBatches||[]).map(batch=>({id:`${id}/component:${batch.componentId||slug(batch.name)}`,version:fingerprint(batch),name:batch.name,type:batch.type,sourceRef:batch.componentRef||null}))};
      if(current.some(row=>row.id===id&&row.version!==version)) errors.push(`Conflicting current versions for stable recipe ${id}.`);
      bySlot[slot]=ref;if(!current.some(row=>row.id===id&&row.version===version))current.push(ref);
    }
    for(const [name,record] of Object.entries(data.recipeLibrary||{})){
      const id=stableRecipeId(record,name),version=fingerprint(record);
      if(!current.some(row=>row.id===id))historical.push({id,version,name,status:'historical',tiers:Object.keys(record.tiers||{})});
    }
    current.sort((a,b)=>a.id.localeCompare(b.id));historical.sort((a,b)=>a.id.localeCompare(b.id));
    return {bySlot,current,historical,errors};
  }
  function compileProduction(options={}){
    if(!core||!workflow||!grocery) throw new Error('Production engine dependencies must load before compilation.');
    const data=clone(options.data||{meals:{}}),methods=clone(options.methods||{meals:{}}),config=clone(options.config||defaultConfig||{});
    const errors=[],holds=[],warnings=[],decisions=[];
    // Validate before JSON cloning can turn non-finite values into null.
    function numeric(value,path){if(typeof value==='number'&&!Number.isFinite(value))errors.push(`${path}: non-finite number.`);else if(value&&typeof value==='object')Object.entries(value).forEach(([key,child])=>numeric(child,`${path}.${key}`));}
    numeric(options.data,'recipes');numeric(options.methods,'methods');numeric(options.buffer,'buffer');
    const registry=registryFrom(data,methods);errors.push(...registry.errors);
    if(data.batch&&methods.batch&&data.batch!==methods.batch)errors.push('Recipe and method batches differ; rebuild from matching source versions.');
    const included=(options.orders||[]).filter(order=>order.included!==false&&
      !/^(?:cancelled|canceled|hold|on hold|skipped|excluded)$/i.test(order.sourceStatus||'')&&core.orderStatusFromNotes(order.notes)==='active');
    const orderKeys=new Set();
    for(const [index,order] of included.entries()){
      const identity=String(order.orderId||order.id||order.key||((order.customer&&(order.submittedAt||order.phone||order.email))?core.orderKey(order):''));
      if(!identity)errors.push(`Order ${index+1}: stable order identity is missing.`);
      else if(orderKeys.has(identity))errors.push(`Duplicate order identity ${identity}.`);else orderKeys.add(identity);
      for(const item of order.items||[]){
        if(!item.id||!item.tier||!Number.isInteger(Number(item.qty))||Number(item.qty)<=0)errors.push(`Order ${identity||index+1}: invalid item identity, tier or quantity.`);
        if(item.ingredientOverrides&&Object.keys(item.ingredientOverrides).length)errors.push(`Order ${identity||index+1}: ingredient overrides require a controlled recipe version; they cannot be silently ignored.`);
      }
    }
    const orders=clone(core.includedOrders(included)),sourceCounts=options.counts===undefined?core.aggregateCounts(orders):options.counts;
    const pendingOrders=orders.filter(order=>order.planningOnly===true||order.recurringStatus==='planning'||order.confirmationStatus==='unconfirmed');
    if(pendingOrders.length)holds.push(`${pendingOrders.length} planning order${pendingOrders.length===1?' is':'s are'} unconfirmed. Ingredients are included, but revenue, customer labels and pack-out stay excluded until confirmation.`);
    const groups=new Map();
    for(const row of sourceCounts||[]){
      if(!row?.id||!row.tier||!Number.isInteger(Number(row.qty))||Number(row.qty)<0){errors.push('Production demand requires an identified recipe/tier and non-negative whole count.');continue;}
      if(Number(row.qty)===0)continue;
      const record=data.meals?.[row.id],method=methods.meals?.[row.id];
      if(!record?.tiers?.[row.tier]||!method){errors.push(`Missing controlled recipe or method for ${row.id}:${row.tier}.`);continue;}
      const packaging=packageType(row,record,method,config),key=`${row.id}:${row.tier}`;
      const prior=groups.get(key);
      if(prior&&prior.packageType!==packaging)errors.push(`Conflicting packaging for ${key}.`);
      groups.set(key,{...row,id:row.id,tier:row.tier,qty:Number(row.qty)+(prior?.qty||0),name:record.name,category:record.category,packageType:packaging,recipeRef:{id:registry.bySlot[row.id].id,version:registry.bySlot[row.id].version}});
    }
    const counts=[...groups.values()].sort((a,b)=>a.recipeRef.id.localeCompare(b.recipeRef.id)||a.tier.localeCompare(b.tier));
    for(const count of counts)for(const item of data.meals[count.id].tiers[count.tier].ingredients||[]){
      if(!item.key||!item.unit||!Number.isFinite(item.amount)||item.amount<0)errors.push(`${count.name}: invalid ingredient ${item.key||'(missing key)'}.`);
    }
    for(const order of orders)for(const item of order.items||[])if(!data.meals?.[item.id]?.tiers?.[item.tier])errors.push(`Order ${order.orderId||order.id||order.customer}: unknown item ${item.id}:${item.tier}.`);
    if(options.counts!==undefined && options.orders?.length){
      const ordered=core.aggregateCounts(orders),keys=new Set([...ordered,...counts].map(row=>`${row.id}:${row.tier}`));
      for(const key of keys){const selected=counts.find(row=>`${row.id}:${row.tier}`===key)?.qty||0,wanted=ordered.find(row=>`${row.id}:${row.tier}`===key)?.qty||0;if(selected!==wanted)errors.push(`Order/demand mismatch ${key}: ${selected} planned, ${wanted} ordered.`);}
    }
    const optional=methods.productionExtras||[],extraSelection=options.extras;
    optional.forEach(extra=>{extra.id ||= `extra:${registry.bySlot[extra.dishId]?.id||extra.dishId}:${extra.tier||'lean'}:${slug(extra.label)}`;});
    if(extraSelection!==undefined){
      const selected=new Set(Array.isArray(extraSelection)?extraSelection.map(value=>typeof value==='string'?value:value.id):Object.keys(extraSelection).filter(key=>extraSelection[key]));
      for(const id of selected)if(!optional.some(extra=>extra.id===id))errors.push(`Unknown internal extra ${id}.`);
      optional.forEach(extra=>{if(extra.optional)extra.enabled=selected.has(extra.id);});
      for(const extra of optional.filter(row=>row.optional&&row.enabled))if(!counts.some(row=>row.id===extra.dishId&&row.tier===(extra.tier||'lean')))errors.push(`Internal extra ${extra.id} requires its active recipe/tier.`);
    }
    const requestedBuffer=typeof options.buffer==='number'?{rawProteinBufferPct:options.buffer}:options.buffer||{};
    const validateRange=(value,name,min,max)=>{if(value!==undefined&&(!Number.isFinite(Number(value))||value===null||value===''||Number(value)<min||Number(value)>max))errors.push(`${name} must be between ${min} and ${max}.`);};
    validateRange(requestedBuffer.rawProteinBufferPct,'Raw protein reserve',0,20);
    validateRange(requestedBuffer.riceBufferPct,'Rice reserve',0,30);
    validateRange(requestedBuffer.riceYieldFactor,'Rice planning yield factor',1,4);
    for(const [id,value] of Object.entries(requestedBuffer.rawProteinReserveByDish||methods.rawProteinReserveByDish||{})){
      validateRange(value,`Protein reserve for ${id}`,0,30);if(!data.meals[id])errors.push(`Unknown reserve recipe ${id}.`);
    }
    const buffer=core.bufferSettings({...requestedBuffer,rawProteinReserveByDish:requestedBuffer.rawProteinReserveByDish||methods.rawProteinReserveByDish||{}});
    const activeRefs=counts.map(row=>({id:row.recipeRef.id,version:row.recipeRef.version,tier:row.tier,qty:row.qty,packageType:row.packageType}));
    const stableItem=item=>({id:registry.bySlot[item.id]?.id||item.id,tier:item.tier,qty:Number(item.qty),packageType:groups.get(`${item.id}:${item.tier}`)?.packageType||item.packageType||'',notes:item.notes||'',customizations:item.customizations||null,ingredientOverrides:item.ingredientOverrides||null});
    // Source-row positions, fetchedAt, sourceQty and UI expansion flags are not order truth.
    const canonicalOrders=orders.map(order=>({identity:String(order.orderId||order.id||order.key||core.orderKey(order)),customer:order.customer||'',phone:order.phone||'',email:order.email||'',address:order.address||'',city:order.city||'',zip:order.zip||'',fulfillment:order.fulfillment||'',notes:order.notes||'',deliveryNotes:order.deliveryNotes||'',planningOnly:order.planningOnly===true,recurringStatus:order.recurringStatus||'',confirmationStatus:order.confirmationStatus||'',labelsApproved:order.labelsApproved===true,items:(order.items||[]).map(stableItem).sort((a,b)=>canonical(a).localeCompare(canonical(b)))})).sort((a,b)=>a.identity.localeCompare(b.identity));
    const sauceConfig={...methods.weeklySauces,customerCupsTotal:0,kitchenUseCupsPerSauce:0,...clone(options.sauceConfig||{})};
    if (config.sauceProgram?.enabled) Object.assign(sauceConfig,{
      enabled:true,selectionMode:'order-selections',eligibleMealIds:[],
      sauces:clone(config.sauceProgram.choices || []),
      policy:'Make only the cups customers selected. Required recipe cups remain separate.',
    });
    // Optional sauce changes are order changes even when meal quantities stay the same.
    canonicalOrders.forEach(row => {
      const source=orders.find(order=>String(order.orderId||order.id||order.key||core.orderKey(order))===row.identity);
      row.sauces=(source?.sauces?.selections || source?.sauces || []).map(sauce=>({id:sauce.id,qty:Number(sauce.qty)})).sort((a,b)=>a.id.localeCompare(b.id));
    });
    const policyIds=object=>JSON.parse(JSON.stringify(object,(key,value)=>key==='dishId'?registry.bySlot[value]?.id||value:key==='dishIds'||key==='eligibleMealIds'?value?.map(id=>registry.bySlot[id]?.id||id).sort():value));
    const snapshot={schemaVersion:SCHEMA,orderHash:fingerprint(canonicalOrders),recipeHash:fingerprint({recipes:activeRefs.map(({qty,packageType,...ref})=>ref),sharedSeasoning:policyIds(methods.sharedProteinSeasoning||[]),adjustments:policyIds(methods.groceryAdjustments||[]),packaging:methods.extraPackaging||[],labelExemptCustomers:methods.labelExemptCustomers||[],cupPolicy:policyIds(methods.weeklySauces||{})}),demandHash:fingerprint(activeRefs),extrasHash:fingerprint(policyIds(optional.filter(extra=>!extra.optional||extra.enabled))),bufferHash:fingerprint({...buffer,rawProteinReserveByDish:Object.fromEntries(Object.entries(buffer.rawProteinReserveByDish).map(([id,value])=>[registry.bySlot[id]?.id||id,value]))}),sauceHash:fingerprint(policyIds(sauceConfig)),batchHash:fingerprint(options.orderSnapshot||{batch:config.batch?.number||data.batch||null}),recipeRefs:activeRefs.map(({qty,packageType,...ref})=>ref)};
    snapshot.id=fingerprint(snapshot);
    const empty={schemaVersion:SCHEMA,snapshot,registry,counts,orders,plannedCounts:[],recipes:[],dishIngredients:{},component:{prepBatches:[],proteins:[],produce:[],proteinGroups:[],seasoningGroups:[],proteinStoragePools:[]},operational:{totals:[],warnings:[],buffer},productionExtras:[],cups:{customer:[],extras:[],qc:[],totalCustomer:0,totalExtras:0,totalQc:0,total:0},adjustments:[],extraPackaging:[],packaging:[],requirements:[],customerNotes:[],produce:[],sauceReserves:[],sauceGroups:[],saucePlan:{sauces:[]},labelCount:0,methods,buffer,totalMeals:sum(counts,'qty'),conservation:{ingredients:[],cups:{},packaging:{},tiers:[]}};
    const finish=result=>freeze({...result,diagnostics:{errors:unique(errors),holds:unique(holds),warnings,decisions,rows:result.coverage?.rows||[],ok:errors.length===0,releaseReady:counts.length>0&&errors.length===0&&holds.length===0&&decisions.length===0}});
    if(errors.length||!counts.length)return finish(empty);
    const coverage=core.auditPlanCoverage(counts,data,methods);
    coverage.errors.forEach(error=>(error.includes('production release hold:')?holds:errors).push(error));
    if(errors.length)return finish({...empty,coverage});
    const customerNotes=core.customerNotePlan(orders,data,methods),component=core.componentPlan(counts,data,methods,buffer),operational=core.operationalIngredientTotals(counts,data,methods,buffer);
    const dishIngredients=Object.fromEntries(unique(counts.map(row=>row.id)).map(id=>[id,core.operationalIngredientTotals(counts.filter(row=>row.id===id),data,methods,buffer).totals]));
    const recipes=counts.map(row=>{
      const method=methods.meals[row.id],plan=core.componentPlan([row],data,methods,buffer),ingredients=core.operationalIngredientTotals([row],data,methods,buffer).totals;
      const sourceTier=data.meals[row.id].tiers[row.tier];
      const group=component.seasoningGroups.find(item=>item.allocations.some(allocation=>allocation.dishId===row.id)),protein=group&&ingredients.find(item=>item.key===group.proteinKey);
      const assigned=group&&plan.prepBatches.some(batch=>workflow.route(batch,{method}).consumes&&batch.ingredients.some(item=>item.key===group.proteinKey));
      const recipe={...row,key:`${row.id}:${row.tier}`,method,ingredients,
        portionIngredients:clone(sourceTier.ingredients || []),tierAssumptions:clone(sourceTier.assumptions || []),
        prep:plan.prepBatches,proteins:plan.proteins,title:`${row.name} · ${row.tier.charAt(0).toUpperCase()+row.tier.slice(1)}`,
        customerQty:row.qty,extraQty:sum(core.resolvedProductionExtras([row],data,methods),'ownerServings'),
        productionGroup:method.productionGroup||(plan.proteins[0]?core.proteinProductionGroup(plan.proteins[0]).key:/breakfast/i.test(row.category)?'breakfast':/dessert/i.test(row.category)?'dessert':'other'),
        seasonedProtein:group&&protein?{key:group.proteinKey,grams:protein.baseAmount*(1+(group.totalRaw?sum(group.baseSeasoning,'grams')/group.totalRaw:0))}:null,
        sharedSeasoningAmounts:group&&!assigned?ingredients.filter(item=>item.key===group.proteinKey||group.baseSeasoning.some(spice=>spice.key===item.key)).map(item=>({...item,baseAmount:item.key===group.proteinKey?item.baseAmount:group.baseSeasoning.find(spice=>spice.key===item.key).grams*protein.baseAmount/group.totalRaw})):[],
        sharedSeasoningKeys:group?[group.proteinKey,...group.baseSeasoning.map(item=>item.key)]:[],
        customerNotes:customerNotes.flatMap(note=>note.items.filter(item=>item.id===row.id&&item.tier===row.tier).map(item=>({customer:note.customer,qty:item.qty,actions:item.actions}))),
        packAllocation:core.dishPackAllocation(orders,row.id,methods.labelExemptCustomers)};
      recipe.productionQty=recipe.customerQty+recipe.extraQty;
      for(const batch of recipe.prep.filter(item=>['sauce','topping'].includes(item.type)))batch.sauceGroupRef=batch.sharedSauceFamily||batch.componentRef||`${recipe.recipeRef.id}/${slug(batch.name)}`;
      recipe.ingredientUse=workflow.ingredientUse(recipe);errors.push(...recipe.ingredientUse.errors);
      recipe.inputs=ingredients.map(item=>({key:item.key,quantity:quantity(item),reserve:quantity(item,item.bufferedAmount-item.baseAmount)}));
      recipe.output={quantity:{value:null,unit:'g',basis:'cooked-output',measured:false},status:'measurement-required'};
      for(const batch of method.prepBatches||[])for(const message of batch.unmeasured||[])decisions.push({id:row.id,name:row.name,message});
      if(method.panBatch?.yieldStatus==='unverified')warnings.push({id:row.id,name:row.name,message:'Finished yield and pan coverage need a measured production check.'});
      return recipe;
    });
    const productionExtras=core.resolvedProductionExtras(counts,data,methods),adjustments=core.groceryAdjustmentPlan(counts,data,methods),extraPackaging=core.extraPackagingRequirements(counts,data,methods);
    for(const batch of component.prepBatches.filter(item=>['sauce','topping'].includes(item.type)))batch.sauceGroupRef=batch.sharedSauceFamily||batch.componentRef||`${registry.bySlot[batch.dishId]?.id}/${slug(batch.name)}`;
    const saucePlan=core.weeklySaucePlan(orders,sauceConfig),plannedCounts=core.productionPlan(counts,buffer);
    const selectedCups=saucePlan.customerCupMode==='order-selections' ? saucePlan.sauces.map(sauce=>({key:`selected:${sauce.id}`,batchGroup:`selected:${sauce.id}`,name:sauce.name,cups:sauce.customerCups,gramsPerMeal:sauce.gramsPerCup,weightBasis:'finished',destinations:clone(sauce.destinations || [])})) : [];
    const customerCups=[...core.sideCupPlan(counts,methods),...selectedCups],extraCups=core.sideCupPlan(productionExtras.map(extra=>({id:extra.dishId,name:extra.label,tier:extra.tier||'lean',qty:extra.ownerServings})),methods);
    const sauceReserves=compileSauceReserves(recipes,productionExtras,adjustments);
    const qc=sauceReserves.filter(row=>row.kind==='qc'&&row.cups).map(row=>({key:`qc:${row.id}`,name:row.name,cups:row.cups,gramsPerMeal:row.grams/row.cups,weightBasis:row.weightBasis,family:row.family,destinations:[]}));
    const cups={customer:customerCups,extras:extraCups,qc,totalCustomer:sum(customerCups,'cups'),totalExtras:sum(extraCups,'cups'),totalQc:sum(qc,'cups')};cups.total=cups.totalCustomer+cups.totalExtras+cups.totalQc;
    const labelCount=sum(core.aggregateCounts(core.labelRequiredOrders(orders,methods.labelExemptCustomers)),'qty');
    const packaging=[...grocery.packagingRequirements(plannedCounts,orders,saucePlan,labelCount,grocery.dishSpecificSauceCupCount(plannedCounts,methods,saucePlan,sauceConfig)),...grocery.dishSpecificPackagingRequirements(plannedCounts,methods),...extraPackaging];
    const requirements=grocery.applyRequirementAdjustments(grocery.mergeRequirements(operational.totals,saucePlan,packaging),adjustments);
    const sauceGroups=compileSauceGroups(recipes,cups,sauceReserves);
    const produce=component.produce.map(item=>({...item,destinations:recipes.flatMap(recipe=>{
      const ingredient=recipe.ingredients.find(row=>row.key===item.key);
      if(!ingredient) return [];
      const cut=workflow.normalizeProduceCut(recipe.method.produceCuts?.[item.key]||workflow.defaultProduceCuts[item.key]||'Check recipe cut before preparing');
      const destination={...ingredient,name:recipe.title,recipeRef:recipe.recipeRef,cut};
      const deliveryComponent=recipe.method.deliveryDayProduceComponent;
      const deliveryPrep=deliveryComponent && recipe.prep.find(task=>task.componentRef===deliveryComponent);
      const hold=Number(deliveryPrep?.ingredients.find(row=>row.key===item.key)?.baseAmount || 0);
      if(!hold) return [destination];
      const held={...destination,name:`${recipe.title} · kachumber`,baseAmount:hold,
        cut:/juice/i.test(ingredient.name) ? 'Reserve measured juice for delivery day' : 'Keep whole and refrigerated. Cut on delivery day'};
      const prepAmount=ingredient.baseAmount-hold;
      return prepAmount>0.001 ? [{...destination,baseAmount:prepAmount},held] : [held];
    })}));
    if(saucePlan.customerCupMode==='order-selections') for(const sauce of saucePlan.sauces) for(const ingredient of sauce.ingredients.filter(item=>item.station==='Cold Prep & Produce')) {
      const destination={...ingredient,name:`Selected bag sauce: ${sauce.name}`,baseAmount:ingredient.totalGrams,unit:'g',cut:workflow.defaultProduceCuts[ingredient.key] || 'Prepare for sauce'};
      const row=produce.find(item=>item.key===ingredient.key);
      if(row){row.baseAmount+=ingredient.totalGrams;row.destinations.push(destination);}
      else produce.push({...ingredient,baseAmount:ingredient.totalGrams,unit:'g',destinations:[destination]});
    }
    const conservation={ingredients:recipes.flatMap(recipe=>recipe.ingredients.map(item=>{
      const used=recipe.ingredientUse.rows.filter(row=>row.key===item.key).reduce((n,row)=>n+row.amount,0),finish=recipe.ingredientUse.finish.find(row=>row.key===item.key)?.baseAmount||0;
      const difference=item.baseAmount-used-finish;if(Math.abs(difference)>.001)errors.push(`${recipe.title}: ${item.key} does not conserve ingredient demand.`);
      return {recipeRef:recipe.recipeRef,tier:recipe.tier,key:item.key,unit:item.unit,input:item.baseAmount,allocated:used,finish,difference};
    })),cups:{customer:cups.totalCustomer,extras:cups.totalExtras,qc:cups.totalQc,total:cups.total},packaging:{sauceCups:requirements.find(row=>row.key==='sauce_cup')?.required||0},tiers:Object.entries(dishIngredients).flatMap(([id,ingredients])=>ingredients.map(item=>{
      const tierSum=recipes.filter(recipe=>recipe.id===id).reduce((n,recipe)=>n+recipe.ingredients.filter(row=>row.key===item.key&&row.unit===item.unit).reduce((s,row)=>s+row.baseAmount,0),0);
      const difference=tierSum-item.baseAmount;
      if(Math.abs(difference)>.001)errors.push(`${data.meals[id].name}: ${item.key} tier allocations differ from whole-dish demand by ${difference.toFixed(4)} ${item.unit}. Assign fixed batch quantities to one explicit component.`);
      return {id,key:item.key,unit:item.unit,wholeDish:item.baseAmount,tierSum,difference};
    }))};
    if((!saucePlan.sauces?.length||saucePlan.customerCupMode==='order-selections')&&conservation.packaging.sauceCups!==cups.total)errors.push(`Cup conservation failed: ${cups.total} planned, ${conservation.packaging.sauceCups} packaged.`);
    return finish({...empty,coverage,recipes,dishIngredients,component,operational,productionExtras,adjustments,extraPackaging,customerNotes,produce,cups,sauceReserves,sauceGroups,saucePlan,plannedCounts,labelCount,packaging:errors.length?[]:packaging,requirements:errors.length?[]:requirements,conservation});
  }
  function compileSauceReserves(recipes,extras,adjustments){
    const reserves=[],seen=new Set();
    for(const recipe of recipes)for(const batch of (recipe.method.prepBatches||[]).filter(row=>['sauce','topping'].includes(row.type))){
      const family=batch.sharedSauceFamily||batch.componentRef||`${recipe.recipeRef.id}/${slug(batch.name)}`;
      const compiled=recipe.prep.find(row=>row.name===batch.name);
      for(const extra of extras.filter(item=>item.dishId===recipe.id&&(item.tier||'lean')===recipe.tier)){
        const grams=batch.componentRef?(extra.ingredients||[]).reduce((n,item)=>n+Number(item.allocations?.[batch.componentRef]||0),0)
          : !batch.oncePerDish&&compiled?sum(compiled.ingredients.filter(item=>(item.unit||'g')==='g'),'baseAmount')*extra.ownerServings/recipe.productionQty:0;
        if(grams>0)reserves.push({id:`${extra.id}:${batch.componentRef||slug(batch.name)}`,kind:'internal',family,variant:batch.sauceVariant||'',dishId:recipe.id,tier:recipe.tier,name:extra.label,grams,cups:0,weightBasis:'recipe-input',ingredients:[],use:batch.sauceUse||'Internal production allocation, separate from customers.',subtractDestination:true});
      }
      const key=`${recipe.id}:${batch.componentRef}`;if(seen.has(key))continue;seen.add(key);
      const ingredients=adjustments.filter(item=>item.dishId===recipe.id&&/\bQC\b/i.test(item.reason||'')&&batch.ingredientKeys?.includes(item.key)&&Number(item.delta)>0);
      const matchingCup=core.sideCupDefinitions(recipe.method).find(cup=>cup.componentRef===batch.componentRef||cup.batchGroup===batch.sharedSauceFamily);
      const grams=sum(ingredients,'delta');
      if(grams&&matchingCup){const fill=Number(matchingCup.gramsPerMeal),cupCount=fill?grams/fill:0;reserves.push({id:`qc:${key}`,kind:'qc',family,variant:batch.sauceVariant||'',dishId:recipe.id,tier:null,name:`${recipe.name} QC cup`,grams,cups:Number.isInteger(Math.round(cupCount*1e6)/1e6)?Math.round(cupCount):0,weightBasis:matchingCup.weightBasis||'finished',ingredients:ingredients.map(item=>({...item,baseAmount:item.delta})),use:'Separate quality-check reserve, not a customer portion.',subtractDestination:false});}
    }
    return reserves;
  }
  function compileSauceGroups(recipes,cups,reserves){
    const groups=new Map();
    for(const recipe of recipes)for(const batch of recipe.prep.filter(item=>['sauce','topping'].includes(item.type))){
      const family=batch.sharedSauceFamily||batch.componentRef||`${recipe.recipeRef.id}/${slug(batch.name)}`;
      const group=groups.get(family)||{family,name:batch.name,totalInputGrams:0,cupPlan:[],incorporated:[],reserves:[],variants:[]};
      const rawBatch=recipe.method.prepBatches.find(item=>item.name===batch.name)||{};
      const definitions=core.sideCupDefinitions(recipe.method);
      const matched=definitions.filter(cup=>cup.componentRef&&cup.componentRef===rawBatch.componentRef||cup.batchGroup===rawBatch.sharedSauceFamily||cup.batchGroup===rawBatch.componentRef||slug(cup.name)===slug(batch.name)||slug(batch.name)===slug(cup.name)+'-cups'||rawBatch.sauceDelivery==='incorporated-and-cup'&&definitions.length===1);
      const input=sum(batch.ingredients.filter(item=>(item.unit||'g')==='g'),'baseAmount');group.totalInputGrams+=input;
      const linked=[...cups.customer.map(row=>({...row,audience:'customer'})),...cups.extras.map(row=>({...row,audience:'internal'}))].filter(cup=>matched.some(def=>(def.batchGroup||def.name)===(cup.batchGroup||cup.name)));
      for(const row of linked)if(!group.cupPlan.some(item=>item.key===row.key&&item.audience===row.audience))group.cupPlan.push(row);
      const cupQuantity=matched.reduce((n,cup)=>n+Number(cup.gramsPerMeal?.[recipe.tier]??cup.gramsPerMeal??0)*Number(cup.cupsPerMeal||1)*recipe.qty,0);
      const internal=sum(reserves.filter(row=>row.family===family&&row.kind==='internal'&&row.dishId===recipe.id&&row.tier===recipe.tier),'grams');
      if(!matched.length||rawBatch.sauceDelivery==='incorporated-and-cup')group.incorporated.push({id:recipe.id,name:recipe.name,tier:recipe.tier,qty:recipe.qty,inputGrams:Math.max(0,input-cupQuantity-internal),basis:'recipe-input'});
      group.variants.push({variant:rawBatch.sauceVariant||'',sourceRef:rawBatch.componentRef||null,dishId:recipe.id,tier:recipe.tier,inputGrams:input,delivery:matched.length?(rawBatch.sauceDelivery||'cup'):'incorporated'});
      groups.set(family,group);
    }
    for(const group of groups.values()){group.reserves=reserves.filter(row=>row.family===group.family);group.totalInputGrams+=sum(group.reserves.filter(row=>row.kind==='qc'),'grams');}
    return [...groups.values()];
  }
  return {SCHEMA,compileProduction,fingerprint,compareSnapshots,registryFrom,quantity};
});
