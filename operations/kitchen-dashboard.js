(function (root, factory) {
  const node=typeof module !== 'undefined' && module.exports;
  const api = factory(node ? require('./kitchen-workflow') : root.PRPD_KITCHEN_WORKFLOW,
    node ? require('./production-engine') : root.PRPD_PRODUCTION_ENGINE);
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.PRPD_KITCHEN = api;
})(typeof window !== 'undefined' ? window : globalThis, function (workflow, engine) {
  'use strict';
  const rawTypes = new Set(['marinade','marinade-finish','protein-mix','protein-portion','form-and-marinate','protein-cook-ahead']);
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const number = n => Number(Number(n || 0).toFixed(Number(n) < 10 ? 2 : 1)).toLocaleString('en-US');
  const amount = item => `${number(item.baseAmount ?? item.amount ?? item.grams)} ${item.unit || 'g'}`;
  const tierName = tier => tier.charAt(0).toUpperCase() + tier.slice(1);
  const gramsPerTsp={salt:6,garlic_powder:3.1,onion_powder:2.4,paprika:2.3,smoked_paprika:2.3,
    cumin:2.1,coriander:1.8,chili_powder:2.7,black_pepper:2.3,cinnamon:2.6,baking_powder:4,
    cayenne:1.8,thyme:1,turmeric:3,oregano:1,white_pepper:2.4};
  const fractions=[[0.25,'¼'],[0.5,'½'],[0.75,'¾']];
  function mixedNumber(value) {
    const rounded=Math.max(.25,Math.round(Number(value||0)*4)/4),whole=Math.floor(rounded),part=rounded-whole;
    const fraction=fractions.find(([n])=>Math.abs(n-part)<.01)?.[1] || '';
    return `${whole || ''}${whole&&fraction?' ':''}${fraction}` || '¼';
  }
  function spoonMeasure(item) {
    const grams=Number(item.baseAmount ?? item.amount ?? item.grams ?? 0);
    const perTsp=Number(item.measure?.gramsPerTsp || gramsPerTsp[item.key] || 0);
    if((item.unit || 'g')!=='g' || !perTsp || grams<=0) return '';
    const quarterTeaspoons=Math.max(1,Math.round((grams/perTsp)*4));
    if(quarterTeaspoons>=12) {
      const tbsp=Math.floor(quarterTeaspoons/12),remainder=quarterTeaspoons-(tbsp*12);
      return `${tbsp} Tbsp${remainder?` + ${mixedNumber(remainder/4)} tsp`:''}`;
    }
    return `${mixedNumber(quarterTeaspoons/4)} tsp`;
  }
  function packetMeasure(item) {
    const grams=Number(item.baseAmount ?? item.amount ?? item.grams ?? 0);
    const gramsPerPacket=Number(item.measure?.gramsPerPacket || 0);
    if((item.unit || 'g')!=='g' || !gramsPerPacket || grams<=0) return '';
    return `${mixedNumber(grams/gramsPerPacket)} ${grams/gramsPerPacket>1?'packets':'packet'}`;
  }
  function pieceMeasure(item) {
    const grams=Number(item.baseAmount ?? item.amount ?? item.grams ?? 0);
    const gramsPerPiece=Number(item.measure?.gramsPerPiece || 0);
    if((item.unit || 'g')!=='g' || !gramsPerPiece || grams<=0) return '';
    const pieces=Math.max(1,Math.round(grams/gramsPerPiece));
    const name=item.measure?.pieceName || 'piece';
    const plural=item.measure?.pieceNamePlural || `${name}s`;
    return `${pieces} ${pieces===1?name:plural}`;
  }
  function displayAmount(item) {
    return packetMeasure(item) || pieceMeasure(item) || spoonMeasure(item) || amount(item);
  }
  const ingredientList = (items,options={}) => `<ul class="kd-ingredients">${items.map(i => `<li><b>${escape(options.exact?amount(i):displayAmount(i,options.practical===true))}</b><span>${escape(i.name)}</span></li>`).join('')}</ul>`;
  const referenceDetails = (label,lines) => lines?.length ? `<details class="kd-reference-notes"><summary>${escape(label)}</summary>${steps(lines)}</details>` : '';
  const operatorSteps = job => steps(job.operatorSteps || job.steps || [],job.ingredients,job.stepIngredientKeys)
    + referenceDetails('Recipe notes',job.referenceNotes);
  const produceOrder = ['strawberry','blueberry','banana','apple','lemon','lime','onion','red_onion','green_onion','garlic','ginger','green_bell_pepper','jalapeno','tomato','zucchini','potato','carrot','celery','broccoli','green_beans','lettuce','cucumber','olives','spinach','canned_peas_carrots','canned_peas','corn','cilantro','parsley','basil','rosemary'];
  const pantryVegetableKeys = ['canned_peas_carrots','corn'];
  const produceFamilies=[
    {id:'fruit',name:'Fruit & citrus',keys:['strawberry','blueberry','banana','apple','lemon','lime']},
    {id:'onions',name:'Onions',keys:['onion','red_onion','green_onion']},
    {id:'aromatics',name:'Garlic & ginger',keys:['garlic','ginger']},
    {id:'peppers',name:'Peppers',keys:['green_bell_pepper','jalapeno']},
    {id:'vegetables',name:'Vegetables',keys:['tomato','zucchini','potato','carrot','celery','broccoli','green_beans','lettuce','cucumber','olives','spinach']},
    {id:'other',name:'Open & drain + other produce',keys:['canned_peas_carrots','canned_peas','corn']},
    {id:'herbs',name:'Fresh herbs',keys:['cilantro','parsley','basil','rosemary']},
  ];
  function consolidateSauces(jobs) {
    const groups=new Map(), remaining=[];
    for(const job of jobs) {
      if(!job.sharedSauceFamily) { remaining.push(job); continue; }
      const group=groups.get(job.sharedSauceFamily) || {family:job.sharedSauceFamily,jobs:[]};
      group.jobs.push(job);groups.set(job.sharedSauceFamily,group);
    }
    for(const group of groups.values()) {
      const totals=new Map();
      for(const job of group.jobs) for(const i of job.ingredients) {
        const prior=totals.get(i.key) || {...i,baseAmount:0};
        prior.baseAmount+=i.baseAmount;totals.set(i.key,prior);
      }
      const reserveJobs=group.jobs.filter(job=>job.sauceReserve);
      const destinations=group.jobs.filter(job=>!job.sauceReserve).map(j=>({id:j.recipe.id,name:j.recipe.name,tier:j.recipe.tier,qty:j.recipe.qty,variant:j.sauceVariant,use:j.sauceUse,
        delivery:j.sauceDelivery || 'cup',grams:j.ingredients.reduce((s,i)=>s+i.baseAmount,0),greenAddition:j.ingredients.filter(i=>i.key==='jalapeno').reduce((s,i)=>s+i.baseAmount,0)}));
      const reserves=reserveJobs.map(job=>({name:job.name,use:job.sauceUse,grams:job.ingredients.reduce((sum,item)=>sum+item.baseAmount,0)}));
      const splitGarlicSauce=destinations.every(destination=>['green','white'].includes(destination.variant));
      if(!splitGarlicSauce) {
        const allSteps=[...new Set(group.jobs.flatMap(job=>job.steps || []))];
        remaining.push({key:`shared-sauce:${group.family}`,stage:'sauces',type:'shared-prepared-sauce',sharedPreparedSauce:true,flavorCategory:group.jobs[0].flavorCategory || 'savory',
          name:group.jobs[0].name.replace(/\s*·.*$/,''),ingredients:[...totals.values()],destinations,reserves,steps:allSteps});
        continue;
      }
      remaining.push({key:`shared-sauce:${group.family}`,stage:'sauces',shared:true,name:'Garlic sauces: one base, two finishes',
        ingredients:[...totals.values()].filter(i=>i.key!=='jalapeno'),destinations,reserves,
        greenAddition:destinations.reduce((n,d)=>n+d.greenAddition,0)});
    }
    return remaining;
  }
  function consolidateTierJobs(jobs) {
    const grouped=new Map(), output=[];
    for(const job of jobs) {
      if(job.shared || job.sharedPreparedSauce) { output.push(job); continue; }
      const groupKey=`${job.stage}:${job.recipe?.id || ''}:${job.name}`;
      const prior=grouped.get(groupKey);
      if(!prior) {
        const copy={...job,recipe:{...job.recipe},pieceTargets:(job.pieceTargets || []).map(target=>({...target})),preparedPull:job.preparedPull ? {...job.preparedPull,finishIngredients:job.preparedPull.finishIngredients.map(item=>({...item}))} : null,ingredients:job.ingredients.map(item=>({...item})),tierRows:[{tier:job.recipe.tier,qty:job.recipe.qty}],
          pullRows:job.preparedPull ? [{tier:job.recipe.tier,qty:job.recipe.qty,...job.preparedPull,finishIngredients:job.preparedPull.finishIngredients.map(item=>({...item}))}] : [],
          tierIngredientRows:[{tier:job.recipe.tier,qty:job.recipe.qty,ingredients:job.ingredients.map(item=>({...item}))}]};
        grouped.set(groupKey,copy);output.push(copy);continue;
      }
      prior.recipe.qty+=job.recipe.qty;
      prior.tierRows.push({tier:job.recipe.tier,qty:job.recipe.qty});
      prior.tierIngredientRows.push({tier:job.recipe.tier,qty:job.recipe.qty,ingredients:job.ingredients.map(item=>({...item}))});
      if(job.customerPieceCount) {
        prior.customerPieceCount=Number(prior.customerPieceCount || 0)+Number(job.customerPieceCount || 0);
        prior.ownerPieceCount=Number(prior.ownerPieceCount || 0)+Number(job.ownerPieceCount || 0);
        prior.reservePieces=Number(prior.reservePieces || 0)+Number(job.reservePieces || 0);
        prior.totalPieceCount=Number(prior.totalPieceCount || 0)+Number(job.totalPieceCount || 0);
        for(const target of job.pieceTargets || []) {
          const found=(prior.pieceTargets || []).find(row=>row.tier===target.tier && row.gramsPerPiece===target.gramsPerPiece);
          if(found) { found.pieces+=Number(target.pieces || 0); found.totalGrams+=Number(target.totalGrams || 0); }
          else (prior.pieceTargets ||= []).push({...target});
        }
      }
      if(prior.preparedPull && job.preparedPull) {
        prior.pullRows.push({tier:job.recipe.tier,qty:job.recipe.qty,...job.preparedPull,finishIngredients:job.preparedPull.finishIngredients.map(item=>({...item}))});
        prior.preparedPull.grams+=job.preparedPull.grams;
        prior.preparedPull.rawGrams+=job.preparedPull.rawGrams;
        for(const item of job.preparedPull.finishIngredients) {
          const found=prior.preparedPull.finishIngredients.find(candidate=>candidate.key===item.key);
          if(found) found.baseAmount=Number(found.baseAmount || 0)+Number(item.baseAmount || 0);
          else prior.preparedPull.finishIngredients.push({...item});
        }
      }
      for(const item of job.ingredients) {
        const found=prior.ingredients.find(candidate=>candidate.key===item.key);
        if(found) { found.baseAmount=Number(found.baseAmount || 0)+Number(item.baseAmount || 0); found.bufferedAmount=Number(found.bufferedAmount || 0)+Number(item.bufferedAmount || 0); }
        else prior.ingredients.push({...item});
      }
    }
    for(const job of output.filter(item=>item.tierRows?.length>1)) {
      const rows=[...job.tierRows.reduce((map,row)=>map.set(row.tier,(map.get(row.tier)||0)+row.qty),new Map())];
      job.audienceLabel=rows.sort((a,b)=>['lean','bulk','single'].indexOf(a[0])-['lean','bulk','single'].indexOf(b[0]))
        .map(([tier,qty])=>`${qty} ${tierName(tier)}`).join(' + ')+' meals';
    }
    return output;
  }
  const sumIngredients = jobs => [...jobs.reduce((map,job)=>{
    for(const item of job.ingredients) {
      const key=`${item.key}:${item.unit || 'g'}`;
      const prior=map.get(key) || {...item,baseAmount:0};
      prior.baseAmount+=Number(item.baseAmount || 0); map.set(key,prior);
    }
    return map;
  },new Map()).values()];

  function sideCupJobs(recipes) {
    const groups=new Map();
    for(const recipe of recipes) {
      const side=recipe.method.sideCup;
      if(!side?.ingredientKeys?.length) continue;
      const key=side.batchGroup || recipe.id;
      const group=groups.get(key) || {key:`side-cup:${key}`,type:'side-cup-batch',stage:'sauces',name:side.name,
        steps:side.steps || [side.instruction],gramsPerMeal:side.gramsPerMeal,weightBasis:side.weightBasis,qty:0,parts:[],destinations:[]};
      group.qty+=recipe.qty;
      group.parts.push({ingredients:recipe.ingredients.filter(i=>side.ingredientKeys.includes(i.key))});
      group.destinations.push({name:recipe.name,tier:recipe.tier,qty:recipe.qty});
      groups.set(key,group);
    }
    return [...groups.values()].map(group=>({...group,ingredients:sumIngredients(group.parts)}));
  }

  function sharedWorkSteps(group) {
    if(group.family==='rice') {
      const total=group.ingredients.find(item=>item.key==='rice_dry')?.baseAmount || 0;
      if(group.group==='shared-plain-base') return [
        `Cook ${number(total)} g dry rice as one PLAIN base pot. Keep Halal Cart yellow rice in its separate recipe pot. The purchase allowance is spare stock, not extra rice to cook.`,
        'Weigh the complete cooked base. Split into the labeled destination pans in proportion to their dry-input shares below, before adding any finishing ingredients.',
        'Keep BOTH shares plain on Prep Day. Rapid-cool in protected shallow pans and record both checkpoints. Refrigerate the separate measured finish for Cook Day.',
      ];

      return [`Cook ${number(total)} g dry rice in one pot. The grocery allowance is spare stock, not extra rice to cook.`,
        ...(group.group==='cilantro-garlic-lime' ? ['Add the displayed cilantro, garlic, and lime to this one pot. Do not create separate flavored rice batches.'] : []),
        'Weigh the finished rice. Divide the actual cooked yield using the shares below, then rapid-cool in shallow labeled pans and refrigerate.'];
    }
    if(group.family==='instant-mash') {
      const keys=new Set(group.ingredients.map(item=>item.key));
      return [
        'Use Idahoan Original packaged potato flakes and only the displayed ingredients. Do not add an unlisted herb or substitute a different garlic product.',
        ...(keys.has('garlic') ? ['Gently soften the displayed fresh minced garlic in the listed butter. Retain the complete garlic and butter allocation; do not substitute garlic powder.'] : []),
        'Add the displayed water and salt. Bring to a full boil, then remove the pot from the heat.',
        'Add the cold milk. Sprinkle in the flakes'+(keys.has('garlic_powder')?' and displayed garlic powder':'')+', stir gently until evenly moistened, and let stand for 2 minutes. '+(keys.has('rosemary')?'Fold in the displayed rosemary. ':'')+'Whip lightly with a fork or spoon. Do not blend or add unmeasured liquid.',
        'Record the complete finished yield, divide by the displayed destination shares, then rapid-cool in shallow labeled pans and refrigerate.',
      ];
    }
    if(group.family==='egg') return [
      'Whisk the complete displayed whole-egg and liquid-egg-white batch until uniform. Add no cheese.',
      'Cook until fully set, then record the finished combined yield.',
      `Divide the cooked egg base between ${group.destinations.map(row=>row.name).join(' and ')} using the measured recipe-input shares below. Rapid-cool and refrigerate.`,
    ];
    if(group.family==='vegetable') return [
      `${group.operation==='roast'?'Roast':'Cook'} the complete listed vegetable batch${group.temperature?` at ${group.temperature}°F`:''} until the destination-specific endpoint below is reached.`,
      `Divide the cooked batch between ${group.destinations.map(row=>row.name).join(' and ')} using the raw shares shown below.`,
    ];
    if(group.family==='potato') return [
      ...(group.group==='batch16-potato-roast' ? [
        'Combine the complete potato and broccoli pull. Apply the displayed salt, garlic powder, paprika, and a light cooking-oil drizzle to all of it.',
        'Roast at 400 F until browned and tender. Keep labeled tray zones only so the two finished destinations are easy to divide.',
        'Record the two finished yields separately, then rapid-cool in shallow labeled pans and refrigerate.',
      ] : [
      `${group.operation==='roast'?'Roast':'Cook'} the complete listed potato batch${group.temperature?` at ${group.temperature}°F`:''} until browned and tender.`,
      `Divide the cooked batch between ${group.destinations.map(row=>row.name).join(' and ')} using the raw shares shown below.`,
      ]),
    ];
    return [...new Set(group.parts.flatMap(part=>part.steps || []))];
  }

  function consolidatePhysicalWork(jobs) {
    const groups=new Map(),remaining=[];
    for(const job of jobs) {
      const spec=workflow.physicalWorkSpec(job,job.recipe);
      if(!spec) {remaining.push(job);continue;}
      const sharedRice=spec.family==='rice' && ['plain-rice','cilantro-garlic-lime','shared-plain-base'].includes(spec.group);
      const group=groups.get(spec.key) || {...spec,key:spec.key,type:sharedRice?'shared-rice':'shared-work-batch',stage:'ahead',parts:[],destinations:[]};
      group.parts.push(job);
      const primary=job.ingredients.filter(item=>spec.primaryKeys.includes(item.key));
      group.destinations.push({id:job.recipe?.id,name:job.recipe?.name || job.name,tier:job.recipe?.tier,qty:job.recipe?.qty,
        grams:primary.reduce((sum,item)=>sum+Number(item.baseAmount || 0),0),notes:[job.instruction,...(job.steps || [])].filter(Boolean)});
      groups.set(spec.key,group);
    }
    for(const group of groups.values()) {
      group.ingredients=sumIngredients(group.parts);
      if(group.group==='shared-plain-base') {
        group.baseIngredients=group.ingredients.filter(item=>item.key==='rice_dry');
        const finishParts=group.parts.filter(part=>part.ingredients.some(item=>item.key!=='rice_dry'));
        group.finishGroups=[...finishParts.reduce((map,part)=>{
          const key=part.recipe?.id || part.key;
          const prior=map.get(key)||{id:key,name:part.recipe?.name || part.name,parts:[],dryGrams:0,steps:part.recipe?.method?.riceFinishSteps || []};
          prior.parts.push({ingredients:part.ingredients.filter(item=>item.key!=='rice_dry')});
          prior.dryGrams+=part.ingredients.filter(item=>item.key==='rice_dry').reduce((sum,item)=>sum+Number(item.baseAmount||0),0);
          map.set(key,prior);return map;
        },new Map()).values()].map(group=>({...group,ingredients:sumIngredients(group.parts)}));
      }
      group.steps=sharedWorkSteps(group);
      remaining.push(group);
    }
    return remaining;
  }

  function consolidateRiceJobs(jobs) {
    return consolidatePhysicalWork(jobs);
  }

  function consolidatePrepFlows(jobs) {
    const groups=new Map(),remaining=[];
    for(const job of jobs) {
      const flow=job.recipe?.method?.prepFlowGroup || (/dessert/i.test(job.recipe?.category || '') ? 'dessert' : '');
      if(!flow || job.stage!=='ahead') {remaining.push(job);continue;}
      const key=`${job.recipe.id}:${flow}`;
      const group=groups.get(key) || {key:`flow:${key}`,type:'prep-flow',stage:'ahead',name:job.recipe.method.prepFlowTitle || job.recipe.name,
        recipe:job.recipe,audienceLabel:job.audienceLabel,parts:[],ingredients:[]};
      group.parts.push(job);groups.set(key,group);
    }
    for(const group of groups.values()) {group.ingredients=sumIngredients(group.parts);remaining.push(group);}
    return remaining;
  }
  const steps = (lines, items = [], refs = []) => `<ol class="kd-steps">${lines.map((line,index) => {
    const used = (refs[index] || []).map(key => items.find(i => i.key === key)).filter(Boolean);
    return `<li>${escape(line)}${used.length ? `<small>${used.map(i=>`${escape(amount(i))} ${escape(i.name)}`).join(' · ')}</small>` : ''}</li>`;
  }).join('')}</ol>`;

  function countDifferences(counts, orders, core) {
    const entered = new Map();
    for (const c of counts) entered.set(`${c.id}:${c.tier}`, (entered.get(`${c.id}:${c.tier}`) || 0) + Number(c.qty));
    const sold = new Map(core.aggregateCounts(core.includedOrders(orders)).map(c=>[`${c.id}:${c.tier}`,c.qty]));
    return [...new Set([...entered.keys(),...sold.keys()])].flatMap(key => {
      const actual = entered.get(key) || 0, expected = sold.get(key) || 0;
      return actual === expected ? [] : [{key, production:actual, ordered:expected}];
    });
  }

  function review(counts, data, methods, core, compiled) {
    const plan=compiled?.productionPlan || engine.compileProduction({counts,data,methods,buffer:0});
    return planReview(plan);
  }

  function planReview(plan) {
    const diagnostic=plan.diagnostics;
    return {errors:[...diagnostic.errors,...diagnostic.holds],decisions:diagnostic.decisions,
      warnings:diagnostic.warnings,rows:diagnostic.rows};
  }

  // Compatibility entry point. All operational calculations belong to the engine.
  function build(counts, data, methods, core, buffer, orders=[],skipReview=false) {
    return buildFromPlan(engine.compileProduction({counts,data,methods,buffer,orders}),counts,skipReview);
  }

  function buildFromPlan(plan, presentationOrder=plan.counts, skipReview=false) {
    const clone=value=>structuredClone(value);
    const active=clone(plan.counts),component=clone(plan.component),customerNotes=clone(plan.customerNotes);
    const recipes=clone(plan.recipes);
    const order=new Map(presentationOrder.map((row,index)=>[`${row.id}:${row.tier}`,index]));
    recipes.sort((a,b)=>(order.get(a.key) ?? 999)-(order.get(b.key) ?? 999));
    const jobs = [];
    const emittedOncePerDish = new Set();
    for (const recipe of recipes) {
      for (const [index,tierBatch] of recipe.prep.entries()) {
        const batch=tierBatch.oncePerDish ? component.prepBatches.find(item=>item.dishId===recipe.id && item.name===tierBatch.name) || tierBatch : tierBatch;
        const onceKey = `${recipe.id}:${batch.name}`;
        if (batch.oncePerDish && emittedOncePerDish.has(onceKey)) continue;
        if (batch.oncePerDish) emittedOncePerDish.add(onceKey);
        if (batch.cookAhead) {
          const sharedGroup = component.seasoningGroups.find(group =>
            group.allocations.some(allocation => allocation.dishId === recipe.id) &&
            batch.ingredients.some(item => item.key === group.proteinKey));
          const protein = batch.ingredients.find(item => item.key === sharedGroup?.proteinKey)
            || batch.ingredients.find(item=>recipe.proteins.some(p=>p.key===item.key));
          const groupAllocation = sharedGroup?.allocations.find(allocation => allocation.dishId === recipe.id);
          const baseKeys = new Set((sharedGroup?.baseSeasoning || []).map(item=>item.key));
          const finishIngredients = groupAllocation && protein ? (groupAllocation.finishSeasoning || []).map(item => {
            const tierIngredient=batch.ingredients.find(candidate=>candidate.key===item.key);
            return {...item,baseAmount:!baseKeys.has(item.key) && tierIngredient
              ? Number(tierIngredient.baseAmount || 0)
              : Number(item.grams || 0) * Number(protein.baseAmount || 0) / Number(groupAllocation.baseAmount || 1),unit:'g'};
          }) : [];
          jobs.push({ ...batch, key:`${recipe.key}:cook-ahead:${index}`, recipe,
            name:`Cook ${batch.dish} chicken`, stage:'ahead', steps:batch.cookAhead.steps,
            ingredients:[], alreadyPrepared:batch.ingredients,
            preparedPull:protein ? {
              grams:sharedGroup?seasonedSplit(sharedGroup,{baseAmount:protein.baseAmount}):batch.ingredients.filter(i=>i.unit==='g').reduce((sum,i)=>sum+i.baseAmount,0),
              rawGrams:protein.baseAmount,
              groupName:sharedGroup?.name || batch.name,
              finishIngredients,
            } : null,
            equipmentLane:batch.cookAhead.lane || 'stovetop',
            ovenTemperatureF:batch.cookAhead.temperatureF || 0 });
        }
        const routing=workflow.route(batch,recipe);
        if (routing.stage==='proteins' || routing.stage==='produce') continue;
        if(!batch.ingredients.length && !batch.steps?.length) continue;
        const sourceBatch=recipe.method.prepBatches?.find(source=>source.name===batch.name);
        jobs.push({...batch, ingredientSections:batch.ingredientSections || sourceBatch?.ingredientSections, recipe, key:`${recipe.key}:prep:${index}`,
          audienceLabel:batch.oncePerDish ? 'Whole batch' : batch.audienceLabel,
          stage:routing.stage});
      }
    }
    const produce = clone(plan.produce).sort((a,b)=>{
      const rank=k=>produceOrder.includes(k)?produceOrder.indexOf(k):999;
      return rank(a.key)-rank(b.key)||a.name.localeCompare(b.name);
    });
    const consolidatedJobs=consolidatePrepFlows(consolidatePhysicalWork(consolidateTierJobs(consolidateSauces(jobs))));
    for(const reserve of plan.sauceReserves) {
      const job=consolidatedJobs.find(item=>item.key===`shared-sauce:${reserve.family}` || item.sauceGroupRef===reserve.family);
      if(!job) continue;
      if(reserve.subtractDestination) {
        const destination=job.destinations?.find(item=>item.id===reserve.dishId && item.tier===reserve.tier && item.variant===reserve.variant);
        if(destination) destination.grams-=reserve.grams;
      }
      for(const item of reserve.ingredients) {
        const ingredient=job.ingredients.find(candidate=>candidate.key===item.key);
        if(ingredient) ingredient.baseAmount+=item.baseAmount;
        else job.ingredients.push(clone(item));
      }
      (job.reserves ||= []).push(clone(reserve));
    }
    for(const group of plan.sauceGroups) {
      const job=consolidatedJobs.find(item=>item.key===`shared-sauce:${group.family}` || item.sauceGroupRef===group.family);
      if(!job) continue;
      job.cupRows=clone(group.cupPlan);
      job.totalInputGrams=group.totalInputGrams;
      job.incorporated=clone(group.incorporated);
      if(!job.destinations) job.sauceDestinations=[
        ...group.incorporated.map(row=>({...clone(row),grams:row.inputGrams,use:'Incorporated recipe input. Measure finished yield.'})),
        ...group.cupPlan.flatMap(row=>row.destinations.map(destination=>({...clone(destination),use:`${row.name}: ${cupFillText(row)}.`}))),
      ];
      for(const destination of job.destinations || []) {
        const variant=group.variants.find(row=>row.dishId===destination.id && row.tier===destination.tier && row.variant===destination.variant);
        if(variant) destination.delivery=variant.delivery;
      }
    }
    consolidatedJobs.push(...sideCupJobs(recipes));
    const selectedSauceCups=(plan.saucePlan?.customerCupMode==='order-selections' ? plan.saucePlan.sauces : []).map(sauce=>({
      name:sauce.name,batchGroup:`selected:${sauce.id}`,cups:sauce.customerCups,gramsPerMeal:sauce.gramsPerCup,weightBasis:'finished',destinations:clone(sauce.destinations || []),
    }));
    if(plan.saucePlan?.customerCupMode==='order-selections') for(const sauce of plan.saucePlan.sauces) {
      const family=sauce.componentRef || sauce.id;
      const shared=consolidatedJobs.find(item=>[family,sauce.id].some(key=>item.key===`shared-sauce:${key}` || item.sauceGroupRef===key));
      const selectedRow=selectedSauceCups.find(row=>row.batchGroup===`selected:${sauce.id}`);
      const selectedIngredients=sauce.ingredients.map(item=>({...clone(item),baseAmount:item.totalGrams,unit:'g'}));
      if(shared) {
        shared.name=sauce.name;
        shared.totalInputGrams=Number(shared.totalInputGrams || shared.ingredients.reduce((sum,item)=>sum+Number(item.baseAmount||0),0))
          + selectedIngredients.reduce((sum,item)=>sum+Number(item.baseAmount||0),0);
        for(const item of selectedIngredients) {
          const existing=shared.ingredients.find(candidate=>candidate.key===item.key && (candidate.unit || 'g')===(item.unit || 'g'));
          if(existing) existing.baseAmount=Number(existing.baseAmount || 0)+Number(item.baseAmount || 0);
          else shared.ingredients.push(item);
        }
        (shared.cupRows ||= []).push(selectedRow);
        shared.steps=sauce.id==='sweet-heat' ? [
          'Whisk the complete displayed batch once until uniform. This includes recipe-required cups and extra cups selected for customer bags.',
          'Fill the complete combined cup count at the stated net weight; seal, label and refrigerate.',
          'Weigh the actual remaining sauce or transfer loss. The input allowance does not authorize extra customer cups.',
        ] : [...new Set([...(shared.steps || []),...(sauce.steps || [])])];
        continue;
      }
      consolidatedJobs.push({key:`selected-sauce:${sauce.id}`,stage:'sauces',type:'side-cup-batch',name:sauce.name,
        qty:sauce.customerCups,gramsPerMeal:sauce.gramsPerCup,weightBasis:'finished',ingredients:selectedIngredients,
        steps:sauce.steps || [],cupRows:[selectedRow],
      });
    }
    for(const job of consolidatedJobs.filter(item=>item.type==='mise-en-place' && item.recipe?.method?.panBatch)) {
      const proteinJob=consolidatedJobs.find(item=>item.preparedPull && item.recipe?.id===job.recipe.id);
      if(proteinJob) job.preparedPanProtein={grams:proteinJob.preparedPull.grams,groupName:proteinJob.preparedPull.groupName};
    }
    const productionExtras=clone(plan.productionExtras);
    const ownerExtraMeals=productionExtras.reduce((sum,item)=>sum+Number(item.ownerServings || 0),0);
    const model={ counts:active, recipes, component, jobs:consolidatedJobs, produce, customerNotes,
      productionExtras,
      sideCups:clone(plan.cups.customer),extraSideCups:clone(plan.cups.extras),qcSideCups:clone(plan.cups.qc),
      totalMeals:plan.totalMeals, internalMeals:(plan.orders || []).filter(isInternalOrder).reduce((sum,order)=>sum+(order.items || []).reduce((n,item)=>n+Number(item.qty || 0),0),0), ownerExtraMeals, productionPlan:plan };
    model.review=skipReview?{errors:[],decisions:[],rows:[]}:planReview(plan);
    return model;
  }

  function seasonedSplit(group, allocation) {
    const base = (group.baseSeasoning || []).reduce((sum,i)=>sum+Number(i.grams || 0),0);
    return allocation.baseAmount * (1 + (group.totalRaw ? base/group.totalRaw : 0));
  }

  function workingSteps(lines=[]) {
    const boilerplate=[
      /weigh the exact raw .*pull/i,
      /keep raw .* isolated and weigh the exact/i,
      /keep covered and refrigerated while/i,
      /^cover, label, and refrigerate/i,
      /^retrieve the labeled measured recipe kit/i,
      /^stage the .* container and verify/i,
      /^use the controlled .* recipe quantities shown/i,
      /^add every listed side cup, seal, label/i,
      /^record (?:the )?finished (?:count and )?yield,? (?:then )?rapid-cool,? cover,? label,? and refrigerate/i,
      /^record (?:the )?finished yield,? cover,? label,? and refrigerate/i,
      /^label, date, and refrigerate/i,
      /^keep cold and dry/i,
    ];
    return lines.filter(line=>line && !boilerplate.some(pattern=>pattern.test(line))).map(line=>{
      let cleaned=String(line).replace(/\bdisplayed\b/gi,'listed').replace(/\s+remainder\b/gi,'');
      const rawApplication=cleaned.match(/^Keep raw (chicken|beef|turkey) isolated and apply the (?:complete )?listed (.+?)(?:\.)?$/i);
      if(rawApplication) return `Mix the listed ${rawApplication[2].replace(/[.]$/,'')}, then coat the ${rawApplication[1].toLowerCase()} evenly.`;
      cleaned=cleaned.replace(/^Coat only the labeled ([^,]+), cover, and refrigerate\.?$/i,'Coat the $1 evenly.');
      cleaned=cleaned.replace(/^Keep the onion submerged, cover, label, and refrigerate\.?$/i,'Keep the onion submerged in the brine.');
      cleaned=cleaned.replace(/,?\s*cover,? label,? and refrigerate(?: overnight)?\.?$/i,'.');
      return cleaned;
    });
  }

  function pieceTarget(job,verb='Make') {
    if(!job.customerPieceCount) return '';
    const noun=escape(job.pieceNoun || 'piece');
    const pluralNoun=job.customerPieceCount===1?noun:(/(?:s|x|z|ch|sh)$/i.test(noun)?`${noun}es`:/[^aeiou]y$/i.test(noun)?`${noun.slice(0,-1)}ies`:`${noun}s`);
    const rows=(job.pieceTargets || []).map(row=>{
      const weight=Number(row.gramsPerPiece || 0);
      return `${row.pieces} ${escape(tierName(row.tier))}${weight ? ` × ${number(weight)} g raw` : ''}`;
    });
    return `<div class="kd-shape-target"><b>${escape(verb)} ${job.customerPieceCount} ${pluralNoun}${job.ownerPieceCount ? ` + ${job.ownerPieceCount} owner spare` : ''}</b><span>${rows.join(' · ')}</span>${job.pieceWeightNote?`<small>${escape(job.pieceWeightNote)}</small>`:''}</div>`;
  }

  function explicitSauceSteps(job) {
    const names=job.ingredients.map(item=>item.name);
    const naturalList=names.length<2 ? names.join('') : `${names.slice(0,-1).join(', ')}, and ${names.at(-1)}`;
    const cupRows=job.cupRows || [];
    const cupCount=cupRows.reduce((sum,row)=>sum+Number(row.cups||0),0);
    const fills=[...new Set(cupRows.map(cupFillText))].join(' and ');
    const rewritten=workingSteps(job.steps || []).map(line=>{
      if(/whisk (?:every|the) displayed/i.test(line)) return `Whisk ${naturalList} until completely smooth and uniform.`;
      if(/combine the displayed/i.test(line)) return `Combine ${naturalList} in the order shown until uniform.`;
      if(/fill .*cups?/i.test(line)) return cupCount ? `Fill ${cupCount} cup${cupCount===1?'':'s'} at ${fills}; seal and refrigerate.` : line;
      if(/record yield, fill the displayed/i.test(line)) return cupCount ? `Fill ${cupCount} cup${cupCount===1?'':'s'} at ${fills}; seal and refrigerate.` : '';
      if(/record yield, fill/i.test(line)) return cupCount ? `Fill ${cupCount} cup${cupCount===1?'':'s'} at ${fills}; seal and refrigerate.` : '';
      return line;
    }).filter(Boolean);
    return [...new Set(rewritten)];
  }

  function proteinCards(model) {
    const claimed = new Set();
    const proteinKeys = new Set(model.component.proteinGroups.map(group=>group.key));
    const categories = [...new Set(model.component.proteinGroups.map(g=>g.category))];
    return categories.map(category => {
      const groups = model.component.proteinGroups.filter(g=>g.category===category);
      const shared = model.component.seasoningGroups.filter(s=>groups.some(g=>g.key===s.proteinKey));
      const pools = model.component.proteinStoragePools || [];
      const sharedCards = shared.map(s => {
        s.allocations.forEach(a=>claimed.add(`${a.dishId}:${s.proteinKey}`));
        const pooled = pools.some(p=>p.seasoningGroupId===s.id);
        const isBatch16Shared=String(s.id || '').includes('batch16-shared-aromatic-chicken');
        const commonOilNote=isBatch16Shared ? '<p class="kd-rule"><b>Cooking oil:</b> use only a light avocado-oil drizzle when each labeled pull reaches the pan. It is not a separate seasoning split.</p>' : '';
        const finishText=a=>{
          const shown=(a.finishSeasoning || []).filter(item=>!/(^|_)oil$/i.test(item.key || '') && !/oil/i.test(item.name || ''));
          if(shown.length) return shown.map(i=>`${escape(displayAmount({...i,baseAmount:i.grams,unit:'g'},true))} ${escape(i.name)}`).join(' · ');
          if(isBatch16Shared) return 'No additional seasoning';
          return escape(a.finishNote || (pooled ? 'Hold in the master container.' : 'No additional seasoning'));
        };
        return `<article class="kd-task kd-shared"><header><div><span class="kd-eyebrow">Season together</span><h3>${escape(s.name)}</h3></div><b>${number(s.totalRaw)} g raw</b></header>
          <div class="kd-form">${escape(s.proteinForm || 'Matching cuts')}</div>
          ${ingredientList(s.baseSeasoning.map(item=>({...item,baseAmount:item.grams})),{practical:true})}${commonOilNote}<div class="kd-pull-table"><div class="kd-pull-head"><span>Dish</span><span>Seasoned pull</span><span>Finish</span></div>${s.allocations.map(a=>`<div class="kd-pull-row"><b>${escape(a.dish)}</b><strong>${number(seasonedSplit(s,a))} g</strong><span>${finishText(a)}</span></div>`).join('')}</div></article>`;
      }).join('');
      const separate = groups.flatMap(g=>g.allocations.filter(a=>!claimed.has(`${a.dishId}:${g.key}`)).map(a=>{
        const batches = model.component.prepBatches.filter(b=>{
          if(b.dishId!==a.dishId || !rawTypes.has(b.type) || b.type==='protein-cook-ahead') return false;
          const batchProteinKeys=b.ingredients.filter(i=>proteinKeys.has(i.key)).map(i=>i.key);
          return batchProteinKeys.includes(g.key) || batchProteinKeys.length===0;
        });
        const cookingJob=model.jobs.find(job=>job.stage==='ahead' && (job.recipe?.id===a.dishId) && job.ingredients.some(i=>i.key===g.key));
        const form = batches.map(b=>b.proteinForm).filter(Boolean).join(' / ');
        const wingRows=model.recipes.filter(recipe=>recipe.id===a.dishId && recipe.method.wingPiecesByTier);
        const wingPieces=wingRows.reduce((sum,recipe)=>sum+recipe.qty*Number(recipe.method.wingPiecesByTier[recipe.tier] || 0),0);

        return `<article class="kd-task"><header><div><span class="kd-eyebrow">${escape(g.name)}</span><h3>${escape(a.dish)}</h3></div><b>${number(a.baseAmount)} g raw</b></header>
          ${wingPieces ? `<p class="kd-rule"><b>Count at least ${wingPieces} individual split flats/drumettes for these boxes.</b> Weigh the actual raw pull; modeled grams are provisional.</p>` : ''}${form ? `<div class="kd-form">${escape(form)}</div>` : ''}${batches.map(b=>`${batches.length>1?`<h4>${escape(b.name)}</h4>`:''}${pieceTarget(b,'Shape')}<div class="kd-recipe-grid kd-protein-recipe-grid"><div>${ingredientList(b.ingredients.filter(i=>i.key!==g.key),{practical:true})}</div><div>${steps(workingSteps(b.operatorSteps || b.steps || []),b.ingredients,b.stepIngredientKeys)}</div></div>${referenceDetails('Validation notes',b.unmeasured)}`).join('')}
          ${!batches.length ? cookingJob ? `<p class="kd-rule"><b>${escape(cookingJob.name)}</b> uses this complete pull in Batch recipes.</p>` : '<p class="kd-alert">Missing raw-protein method. Do not start this pull.</p>' : ''}</article>`;
      })).join('');
      return `<section class="kd-protein-category"><div class="kd-section-title"><h2>${escape(category==='poultry'?'Chicken':category==='beef'?'Beef':category==='seafood'?'Seafood':category)}</h2><span>${number(groups.reduce((s,g)=>s+g.baseAmount,0))} g recipe pull</span></div>
        <p class="kd-rule">${groups.map(g=>`${escape(g.name)}: <b>${number(g.baseAmount)} g</b> + ${number(g.reserveAmount)} g plain reserve`).join(' · ')}</p><div class="kd-protein-shared">${sharedCards}</div><div class="kd-protein-cards">${separate}</div></section>`;
    }).join('') || '<p>No raw protein in this selection.</p>';
  }

  function allocationDetails(destinations=[], reserves=[]) {
    if(!destinations.length && !reserves.length) return '';
    const dishes=new Set(destinations.map(row=>row.id || row.name)).size;
    const uses=[...new Set([...destinations,...reserves].map(row=>row.use).filter(Boolean))];
    return `<details class="kd-allocation-details"><summary>Allocation details${dishes?` · ${dishes} dish${dishes===1?'':'es'}`:''}${reserves.length?' · reserves':''}</summary><div class="kd-allocation-table"><table><thead><tr><th>Dish / reserve</th><th>Tier</th><th>Portions</th><th>Allocation</th></tr></thead><tbody>${destinations.map(row=>`<tr><th scope="row">${escape(row.name)}</th><td>${escape(tierName(row.tier || ''))}</td><td>${number(row.qty ?? row.cups)}</td><td>${row.grams==null?'—':`${number(row.grams)} g`}</td></tr>`).join('')}${reserves.map(row=>`<tr><th scope="row">${escape(row.name)}</th><td>Reserve</td><td>${row.cups==null?'—':number(row.cups)}</td><td>${number(row.grams)} g</td></tr>`).join('')}</tbody></table></div>${uses.length?`<ul class="kd-allocation-notes">${uses.map(use=>`<li>${escape(use)}</li>`).join('')}</ul>`:''}</details>`;
  }

  function cupFillText(row) {
    const fill=Number(row.gramsPerMeal || 0).toLocaleString('en-US',{maximumFractionDigits:2});
    return row.weightBasis==='raw-input' ? `${fill} g recipe share; record the finished cup weight`
      : row.gramsPerMeal ? `${fill} g net` : 'equal measured portions';
  }

  function cupPolicy(row) {
    const exception=/dressing|syrup|topping|compote|cheesecake|custard|alfredo/i.test(row.name || '');
    const grams=Number(row.gramsPerMeal || 0);
    const name=String(row.name || '');
    const expected=/honey (?:barbecue|bbq) mustard/i.test(name) ? 45
      : /sweet heat|garlic herb yogurt|bottled ranch/i.test(name) ? 40
      : /bbq|barbecue|sweet chili/i.test(name) ? 30
        : 45;
    return {exception,expected,valid:!grams || exception || Math.abs(grams-expected)<.01};
  }

  function cupDestinations(destinations=[]) {
    if(!destinations.length) return 'Quality check';
    const dishes=new Set(destinations.map(row=>row.id || row.name)).size;
    return `<details class="kd-cup-destinations"><summary>${dishes} dish${dishes===1?'':'es'}</summary><ul>${destinations.map(row=>`<li>${escape(row.name)} · ${row.cups} ${escape(tierName(row.tier || ''))}</li>`).join('')}</ul></details>`;
  }

  function sauceBatchSummary(job) {
    const cups=job.cupRows || [];
    const incorporated=(job.incorporated || (job.destinations || []).filter(row=>row.delivery==='incorporated')).reduce((sum,row)=>sum+Number(row.qty || 0),0);
    const reserveGrams=(job.reserves || []).reduce((sum,row)=>sum+Number(row.grams || 0),0);
    const reserveCups=(job.reserves || []).reduce((sum,row)=>sum+Number(row.cups || 0),0);
    const displayCups=[...cups.reduce((map,row)=>{
      const key=[row.gramsPerMeal || '',row.weightBasis || 'finished',row.audience || 'customer'].join(':');
      const prior=map.get(key)||{...row,cups:0};prior.cups+=Number(row.cups||0);map.set(key,prior);return map;
    },new Map()).values()];
    const lines=displayCups.map(row=>`${row.cups}${row.audience==='internal'?' owner':''} cup${row.cups===1?'':'s'} × ${cupFillText(row)}`);
    if(incorporated) lines.push(`used directly in ${incorporated} meal portion${incorporated===1?'':'s'}`);
    if(reserveGrams) lines.push(`${reserveCups?`${reserveCups} reserve cup${reserveCups===1?'':'s'} · `:''}${number(reserveGrams)} g reserve`);
    return lines.length ? `<p class="kd-batch-summary">${lines.map(escape).join(' <span aria-hidden="true">·</span> ')}</p>` : '';
  }

  function ingredientSectionList(items,sections=[],options={}) {
    if(!sections.length) return ingredientList(items,options);
    const shown=new Set();
    const groups=sections.map(section=>{
      const selected=items.filter(item=>(section.ingredientKeys || []).includes(item.key) && !shown.has(item.key));
      selected.forEach(item=>shown.add(item.key));
      return selected.length?`<section class="kd-ingredient-section"><h4>${escape(section.title)}</h4>${ingredientList(selected,options)}</section>`:'';
    });
    const remainder=items.filter(item=>!shown.has(item.key));
    if(remainder.length) groups.push(`<section class="kd-ingredient-section"><h4>Other measured ingredients</h4>${ingredientList(remainder,options)}</section>`);
    return groups.join('');
  }

  function cupAllocationDetails(job) {
    if(!(job.cupRows || []).some(row=>String(row.batchGroup || '').startsWith('selected:'))) return '';
    return `<details class="kd-reference-notes"><summary>Cup destinations</summary><ul>${job.cupRows.map(row=>{
      const destinations=(row.destinations || []).map(destination=>`${escape(destination.customer || destination.name || 'Recipe meals')} ${number(destination.cups ?? destination.qty)}${destination.tier?' '+escape(tierName(destination.tier)):''}`).join(', ');
      return `<li><b>${number(row.cups)} cups</b>: ${String(row.batchGroup || '').startsWith('selected:')?'Selected for customer bags':'Required by recipe'}${destinations?' · '+destinations:''}</li>`;
    }).join('')}</ul></details>`;
  }

  function jobCard(job) {
    if(job.type==='prep-flow') return `<article class="kd-task kd-flow" data-job="${escape(job.key)}"><header><div><span class="kd-eyebrow">${escape(job.audienceLabel || `${job.recipe.qty} meals`)} · complete recipe</span><h3>${escape(job.name)}</h3></div></header>${job.parts.map((part,index)=>`<section class="kd-flow-part"><h4>${index+1}. ${escape(part.name)}</h4><div class="kd-recipe-grid">${ingredientList(part.ingredients)}${steps(workingSteps(part.steps),part.ingredients,part.stepIngredientKeys)}</div></section>`).join('')}</article>`;
    if(job.type==='side-cup-batch') { const displayJob={...job,cupRows:job.cupRows || [{name:job.name,cups:job.qty,gramsPerMeal:job.gramsPerMeal,weightBasis:job.weightBasis}]}; return `<article class="kd-task kd-shared" data-job="${escape(job.key)}"><header><h3>${escape(job.name)}</h3><b>${job.qty} cups</b></header>${sauceBatchSummary(displayJob)}<div class="kd-recipe-grid">${ingredientList(job.ingredients,{practical:true})}${steps(explicitSauceSteps(displayJob))}</div></article>`; }
    if(['shared-rice','shared-work-batch'].includes(job.type)) {
      const primaryTotal=job.destinations.reduce((sum,row)=>sum+Number(row.grams || 0),0);
      const basis=job.family==='rice'?'dry share':job.family==='instant-mash'?'recipe-input share':'raw-input share';
      const notes=[...new Set(job.destinations.flatMap(row=>row.notes || []))];
      if(job.group==='shared-plain-base') return `<article class="kd-task kd-shared" data-job="${escape(job.key)}"><header><div><span class="kd-eyebrow">One plain base cook · ${job.destinations.length} destinations</span><h3>${escape(job.name)}</h3></div><b>${number(primaryTotal)} g dry rice</b></header><div class="kd-recipe-grid">${ingredientList(job.baseIngredients)}${steps(job.steps)}</div><div class="kd-allocations">${job.destinations.map(d=>`<span><b>${escape(d.name)}</b>: cooked share from ${number(d.grams)} g dry input</span>`).join('')}</div>${(job.finishGroups||[]).map(finish=>`<section class="kd-flow-part"><h4>Friday finish: ${escape(finish.name)}</h4><p>Use only its cooked share from ${number(finish.dryGrams)} g dry input. Keep the other share plain.</p><div class="kd-recipe-grid">${ingredientList(finish.ingredients)}${steps(finish.steps.length?finish.steps:['Add only these measured ingredients to this recipe share on Cook Day. Keep all other rice plain.'])}</div></section>`).join('')}</article>`;

      return `<article class="kd-task kd-shared" data-job="${escape(job.key)}"><header><div><span class="kd-eyebrow">One ${escape(job.family.replace('-', ' '))} batch · ${job.destinations.length} destination${job.destinations.length===1?'':'s'}</span><h3>${escape(job.name)}</h3></div><b>${number(primaryTotal)} g ${escape(basis)}</b></header><div class="kd-recipe-grid">${ingredientList(job.ingredients,{practical:true})}${steps(workingSteps(job.steps))}</div><div class="kd-allocations">${job.destinations.map(d=>`<span><b>${escape(d.name)}</b>: one cooked share from ${number(d.grams)} g ${escape(basis)}</span>`).join('')}</div>${referenceDetails('Recipe-specific endpoints',notes)}</article>`;
    }
    if(job.sharedPreparedSauce) {
      const total=job.ingredients.reduce((sum,item)=>sum+Number(item.baseAmount||0),0);
      return `<article class="kd-task kd-shared" data-job="${escape(job.key)}"><header><h3>${escape(job.name)}</h3><b>${job.cupRows?.reduce((sum,row)=>sum+Number(row.cups||0),0) || 'Batch'}${job.cupRows?.length?' cups':''}</b></header>${sauceBatchSummary(job)}${job.totalInputGrams?`<p class="kd-batch-summary">${number(job.totalInputGrams)} g total input. Fill only the stated cups; weigh actual reserve and transfer loss.</p>`:''}<div class="kd-recipe-grid">${ingredientList(job.ingredients,{practical:true})}${steps(explicitSauceSteps(job))}</div>${cupAllocationDetails(job)}</article>`;
    }
    if(job.shared) {
      const total=job.ingredients.reduce((n,i)=>n+i.baseAmount,0), green=job.destinations.filter(d=>d.variant==='green').reduce((n,d)=>n+d.grams-d.greenAddition,0);
      const sauceGroup = variant => {
        const rows=job.destinations.filter(d=>d.variant===variant).sort((a,b)=>a.name.localeCompare(b.name)||a.tier.localeCompare(b.tier));
        const reserves=(job.reserves || []).filter(reserve=>reserve.variant===variant);
        const grams=rows.reduce((n,d)=>n+d.grams,0)+reserves.reduce((n,reserve)=>n+reserve.grams,0);
        if(!rows.length && !reserves.length) return '';
        const uses=[...new Set(rows.map(row=>row.use).filter(Boolean))];
        return `<section class="kd-sauce-group kd-sauce-${variant}"><h4>${escape(variant==='green'?'Green':'White')} <b>${number(grams)} g</b></h4>${uses.map(use=>`<p>${escape(use)}</p>`).join('')}</section>`;
      };
      return `<article class="kd-task kd-shared" data-job="${escape(job.key)}"><header><h3>${escape(job.name)}</h3><b>${number(total)} g base</b></header>${sauceBatchSummary(job)}<div class="kd-recipe-grid">${ingredientList(job.ingredients)}${steps([
        'Blend the base smooth.',
        ...(green?[`Move ${number(green)} g base to the green bowl; blend in ${number(job.greenAddition)} g jalapeño.`]:[]),
        'Cover, refrigerate, and portion below.'
      ])}</div><div class="kd-sauce-destinations">${sauceGroup('green')}${sauceGroup('white')}</div></article>`;
    }
    const panBatch=!job.preparedPull && job.type==='mise-en-place' ? job.recipe?.method?.panBatch : null;
    const panBasisTotal=panBatch && job.tierRows ? job.tierRows.reduce((sum,row)=>sum+row.qty*Number(panBatch.portionBasis?.[row.tier] || 0),0) : 0;
    const panProteinText=job.preparedPanProtein ? ` Use all cooled Enchilada chicken made from the ${number(job.preparedPanProtein.grams)} g seasoned pull above.` : '';
    const panCallout=panBasisTotal ? `<div class="kd-pan-callout"><b>Pan capacity must be checked</b><span>Recipe portion weights do not prove pan fit. Use the actual interior dimensions and assembled fill depth; leave rim headspace and split into another pan if needed.${panProteinText}</span></div>` : '';
    const panIngredientOrder=['small_tortilla','large_tortilla','corn','enchilada_sauce','mozzarella','red_onion'];
    const displayIngredients=panBatch ? job.ingredients.slice().sort((a,b)=>panIngredientOrder.indexOf(a.key)-panIngredientOrder.indexOf(b.key)) : job.ingredients;
    const isSauce=job.stage==='sauces';
    const ownerMeals=(job.productionExtras || []).reduce((sum,extra)=>sum+Number(extra.ownerServings || 0),0);
    const customerMeals=Number(job.recipe?.qty || 0);
    const audience=ownerMeals
      ? `${customerMeals+ownerMeals} ${tierName(job.recipe?.tier)} meals · ${ownerMeals} for home`
      : (job.audienceLabel || `${customerMeals} ${tierName(job.recipe?.tier)} meals`);
    const tierIngredients=panBatch?.separateTiers && job.tierIngredientRows?.length>1
      ? job.tierIngredientRows.map(row=>`<section><h4>${escape(tierName(row.tier))} · ${row.qty} meals</h4>${ingredientList(row.ingredients,{practical:isSauce})}</section>`).join('')
      : displayIngredients.length ? ingredientSectionList(displayIngredients,job.ingredientSections || [],{practical:isSauce}) : '';
    const displayedSteps=isSauce ? steps(explicitSauceSteps(job)) : steps(workingSteps(job.operatorSteps || job.steps || []),job.ingredients,job.stepIngredientKeys)+referenceDetails('Recipe notes',job.referenceNotes);
    const shortRibBase=job.name==='Braise and debone the short ribs; chill the jus overnight'
      ? job.ingredients.find(item=>item.key==='short_rib_cooked')
      : null;
    const shortRibPull=shortRibBase
      ? `<p class="kd-pull-callout"><b>Cook ${number(Number(shortRibBase.baseAmount || 0)*1.05)} g raw bone-in short ribs</b><span>${number(shortRibBase.baseAmount)} g base pull + ${number(Number(shortRibBase.baseAmount || 0)*0.05)} g 5% reserve. Weigh this total before searing.</span></p>`
      : '';
    return `<article class="kd-task" data-job="${escape(job.key)}"><header><div><span class="kd-eyebrow">${escape(audience)}${job.equipmentLane ? ' · '+escape(job.equipmentLane):''}${job.ovenTemperatureF ? ' · '+job.ovenTemperatureF+'°F':''}</span><h3>${escape(job.name)}</h3></div>${job.totalInputGrams!=null?`<b>${number(job.totalInputGrams)} g batch</b>`:''}</header>${sauceBatchSummary(job)}
      ${pieceTarget(job,job.type==='protein-mix'?'Shape':'Make')}
      ${job.preparedPull ? `<div class="kd-pull-callout"><b>Take out ${number(job.preparedPull.grams)} g seasoned chicken</b><span>From the ${escape(job.preparedPull.groupName)} (${number(job.preparedPull.rawGrams)} g raw allocation).${job.preparedPull.finishIngredients.length ? ` Add ${job.preparedPull.finishIngredients.map(i=>`${number(i.baseAmount)} g ${escape(i.name)}`).join(', ')} before cooking.` : ' Do not season again.'}</span>${job.pullRows?.length>1 ? `<div class="kd-pull-breakdown">${job.pullRows.map(row=>`<span><b>${escape(tierName(row.tier))} · ${row.qty}:</b> ${number(row.grams)} g seasoned pull${row.finishIngredients.length ? ` + ${row.finishIngredients.map(i=>`${number(i.baseAmount)} g ${escape(i.name)}`).join(', ')}` : ''}</span>`).join('')}</div>`:''}</div>` : job.alreadyPrepared ? '<p class="kd-rule">Use the labeled seasoned pull from the protein station. Do not season again.</p>' : ''}
      ${shortRibPull}${panCallout}${job.recipe?.method?.prepDayOnly ? `<p class="kd-pull-callout"><b>Cook the labeled pull made from ${job.recipe.proteins.map(item=>`${amount(item)} ${escape(item.name)}`).join(' + ')}</b><span>Seasoning is already included in that labeled bowl. Use all of it; do not weigh out raw meat again.</span></p>` : ''}${job.showProductionExtras ? (job.productionExtras || []).map(extra=>`<p class="kd-rule"><b>Whole-pan quantity included:</b> ${escape(extra.note)} Do not add these ingredients again.</p>`).join('') : ''}<div class="kd-recipe-grid">${tierIngredients}${displayedSteps}</div>
      ${referenceDetails('Validation notes',job.unmeasured)}</article>`;
  }

  function onePanRatio(method, recipes) {
    const pan=method.panBatch;
    if(!pan) return {total:0,html:''};
    const total=recipes.reduce((sum,recipe)=>sum+recipe.qty*Number(pan.portionBasis?.[recipe.tier] || 0),0);
    if(!total) return {total:0,html:''};
    if(!workflow.panRatioCompatible(recipes,pan.portionBasis)) return {total:0,html:'<p class="kd-alert"><b>Keep Lean and Bulk allocations separate.</b> These recipes are not proportional, so mixing one pan and changing only the slice weight cannot preserve both recipes. Use separate marked sections or pans until a common formula is approved.</p>'};
    return {total,html:`<div class="kd-pan-callout"><b>Combined-batch portion control</b><span>Weigh the finished food across all pans, excluding pan weight. Use ${number(total)} total parts: ${recipes.slice().sort((a,b)=>['lean','bulk','single'].indexOf(a.tier)-['lean','bulk','single'].indexOf(b.tier)).map(recipe=>`${recipe.qty} ${tierName(recipe.tier)} at ${number(pan.portionBasis[recipe.tier])} parts each`).join(' · ')}.</span></div>`};
  }

  function cookDayProteinPulls(recipes) {
    const method=recipes[0]?.method;
    if(!method?.proteinCook || method.proteinCook.prepDayComplete) return [];
    const rows=recipes.flatMap(recipe=>(recipe.proteins || []).map(protein=>{
      const seasoned=recipe.seasonedProtein?.key===protein.key;
      return {key:protein.key,name:protein.name,tier:recipe.tier,qty:recipe.qty,
        grams:seasoned ? recipe.seasonedProtein.grams : protein.baseAmount,
        rawGrams:protein.baseAmount,seasoned};
    }));
    const groups=[...rows.reduce((map,row)=>{
      const key=`${row.key}:${row.seasoned?'seasoned':'raw'}`;
      const group=map.get(key) || {key,name:row.name,seasoned:row.seasoned,grams:0,rawGrams:0,rows:[]};
      group.grams+=Number(row.grams || 0);group.rawGrams+=Number(row.rawGrams || 0);group.rows.push(row);map.set(key,group);return map;
    },new Map()).values()];
    return groups.map(group=>{
      const proteinName=String(group.name || 'protein').replace(/,\s*raw\b/i,'').replace(/^raw\s+/i,'').toLowerCase();
      const headline=group.seasoned
        ? `Cook today: ${number(group.grams)} g seasoned ${/chicken|leg quarter/i.test(proteinName)?'chicken':proteinName}`
        : `Cook today: ${number(group.grams)} g raw ${proteinName}`;
      const basis=group.seasoned
        ? `Use the complete labeled pull made from ${number(group.rawGrams)} g raw ${proteinName}. Do not season it again.`
        : 'Use the complete labeled recipe pull from the Protein station.';
      return {headline,basis,breakdown:group.rows.length>1 ? group.rows.map(row=>`${tierName(row.tier)} ${row.qty}: ${number(row.grams)} g ${row.seasoned?'seasoned':'raw'}`) : []};
    });
  }

  function cookDayProteinCallout(recipes) {
    return cookDayProteinPulls(recipes).map(pull=>`<div class="kd-pull-callout"><b>${escape(pull.headline)}</b><span>${escape(pull.basis)}</span>${pull.breakdown.length?`<div class="kd-pull-breakdown">${pull.breakdown.map(row=>`<span>${escape(row)}</span>`).join('')}</div>`:''}</div>`).join('');
  }

  function actionStep(title,body,className='') {
    return `<li class="kd-action-step ${className}"><h4>${escape(title)}</h4>${body}</li>`;
  }

  function inlineIngredientLine(items) {
    if(!items.length) return '';
    return `<p class="kd-use-line"><b>Use while finishing:</b> ${items.map(item=>`<span><strong>${escape(displayAmount(item,true))}</strong> ${escape(item.name)}</span>`).join('')}</p>`;
  }

  function containerBuildStep(recipe) {
    const rows=packRows(recipe),notes=cookPackNotes(recipe);
    const warning=rows.some(row=>row.hold) ? '<div class="kd-alert"><b>Stop:</b> correct the recorded cup weight before release.</div>' : '';
    const build=`<p>For <b>each</b> container:</p><ul class="kd-container-build">${rows.map(row=>{
      const itemName=String(row.name).replace(/^Cooked\s+([A-Z])/,(_,letter)=>`cooked ${letter.toLowerCase()}`);
      return `<li class="${row.hold?'kd-pack-hold':''}">Add <strong>${escape(row.amount)}</strong> ${escape(itemName)}.</li>`;
    }).join('')}</ul>`;
    const noteBlock=notes.length ? `<div class="kd-tier-notes">${notes.map(note=>`<p>${escape(note)}</p>`).join('')}</div>` : '';
    return actionStep(`Fill ${recipe.qty} ${tierName(recipe.tier)} container${recipe.qty===1?'':'s'}`,warning+build+noteBlock,'kd-fill-step');
  }

  function stagingReadinessCard(recipe) {
    const prefix='dish:'+recipe.id+':';
    const field=(suffix,label,placeholder,maxlength=240) => {
      const key=escape(prefix+suffix);
      return '<label>'+escape(label)+'<input type="text" maxlength="'+maxlength+'" data-log-key="'+key+'" data-cook-log-key="'+key+'" placeholder="'+escape(placeholder)+'"></label>';
    };
    return '<details class="cook-quick-log"><summary>Stage components and record delays</summary>'
      +'<p>Before filling, confirm every component is ready. Finish missing starches or vegetables before pulling the other cold stock. Stage counted containers, matching lids, approved labels and a clean utensil for each component.</p>'
      +'<div class="cook-quick-grid">'
      +field('staging-locations','Component locations','Protein / starch / vegetables / sauce: shelf or labeled tray')
      +field('staging-waiting-on','Waiting on','Missing component, searching, rework or equipment delay')
      +field('staging-timing','Timing note','5 meals: setup __, fill __, labels __, fridge __, delays __ min',360)
      +'</div><p>Keep bulk food refrigerated and use a short filling run. Return finished meals to their assigned shelf. Keep dirty tools separate and retain necessary handwashing and glove changes.</p></details>';
  }

  function combinedCookCard(recipes, productionExtras=[], phase='complete') {
    const first=recipes[0], method=first.method;
    const dishExtras=(productionExtras || []).filter(extra=>extra.dishId===first.id && Number(extra.ownerServings || 0)>0);
    const extrasByTier=dishExtras.reduce((map,extra)=>{
      const tier=extra.tier || 'lean';
      map[tier]=(map[tier] || 0)+Number(extra.ownerServings || 0);
      return map;
    },{});
    const tiers=recipes.map(recipe=>({...recipe,qty:recipe.qty+Number(extrasByTier[recipe.tier] || 0)}))
      .sort((a,b)=>['lean','bulk','single'].indexOf(a.tier)-['lean','bulk','single'].indexOf(b.tier));
    const proteinPulls=cookDayProteinPulls(tiers);
    const allocation=first.packAllocation;
    const customerBuilds=recipes.flatMap(recipe=>recipe.customerNotes || []);
    const deferredSteps=[...new Set(recipes.flatMap(recipe=>recipe.prep.filter(batch=>workflow.route(batch,recipe).stage==='cook').flatMap(batch=>batch.steps || [])))];
    let finishSteps=method.cookPackSteps || workingSteps([...new Set([...deferredSteps,...(method.cookDayReservations || []),...(method.steps || [])])]).slice(0,4);
    if(phase==='protein') finishSteps=method.proteinCook?.recipeSteps || [];
    if(phase==='components') finishSteps=method.cookDayComponentSteps || method.cookPackSteps || method.steps || [];
    if(phase==='assembly') finishSteps=method.cookDayAssemblySteps || [];
    if(phase==='cold') finishSteps=['Verify every component and the cooked chicken are 41 F or below. Use the recorded chilled yield; do not cook the chicken again.',...(method.coldAssemblySteps || [])];
    if(phase==='complete' && method.packMode==='finished-tier-batch') {
      const division=tiers.map(recipe=>`weigh the finished ${tierName(recipe.tier)} batch and divide it evenly among ${recipe.qty} ${tierName(recipe.tier)} container${recipe.qty===1?'':'s'}`).join('; then ');
      finishSteps=[...finishSteps.slice(0,2),`${division.charAt(0).toUpperCase()}${division.slice(1)}.`];
    }
    const namedKits=phase==='components' ? (method.cookDayComponentPrepNames || []) : phase==='protein' ? (method.proteinCook?.cookIngredientPrepNames || []) : [];
    const namedKit=phase==='components' ? method.cookDayComponentPrepName : method.cookIngredientPrepName;
    const kitNames=namedKits.length ? namedKits : namedKit ? [namedKit] : [];
    const kitKeys=phase==='components' ? (method.cookDayComponentKeys || []) : method.cookIngredientKeys;
    const kitSources=recipes.map(recipe=>{
      if(!kitNames.length) return {ingredients:recipe.ingredients};
      if(!kitNames.every(name=>recipe.prep.some(batch=>batch.name===name))) return {ingredients:null};
      const parts=kitNames.flatMap(name=>recipe.prep.find(batch=>batch.name===name).ingredients);
      // Named kits retain their allocated oil/salt/garlic shares. Ingredients
      // outside those kits (for example sandwich bacon and cheese) still belong here.
      return {ingredients:[...parts,...recipe.ingredients.filter(item=>kitKeys?.includes(item.key) && !parts.some(part=>part.key===item.key))]};
    });
    const missingKit=Boolean(kitNames.length && kitSources.some(source=>!source.ingredients));
    const kitIngredients=kitKeys?.length && !missingKit ? sumIngredients(kitSources).filter(item=>kitKeys.includes(item.key)) : [];
    if(phase==='components') {
      const batchAmount=key=>amount(kitIngredients.find(item=>item.key===key) || {baseAmount:0});
      const concise={
        'Lemon Herb Chicken Orzo':[
          `Boil ${batchAmount('barilla_orzo_dry')} dry Orzo together to package directions; drain.`,
          'Sauté the onion in the listed finish oil; add garlic.',
          'Add the listed water, lemon, parsley and salt. Toss with the cooked Orzo.',
        ],
        'Creamy Cajun Chicken Pasta':[
          `Heat all the prepared Cajun sauce together. Add ${batchAmount('protein_pasta')} dry spaghetti and ${batchAmount('water')} water. Cover and simmer, stirring, until tender.`,
          'Off heat, mix in cream cheese if not already in the sauce. Add green onion.',
        ],
        'High Protein Omelette':['Whisk all the listed eggs, whites and salt together.','Warm the prepared mushrooms and jalapeno; add the egg mixture and cook to 160 F. Melt in mozzarella; toast the bread.'],
        'PRPD Beef Bacon Breakfast Sandwich':['Whisk eggs and whites; cook patties to 160 F. Cook beef bacon to its package directions.','Toast muffins and melt the listed mozzarella onto the patties.'],
        'Strawberry Cheesecake Protein Pancakes':['Mix one batch: combine the wet ingredients, then fold in the dry ingredients.','Use the listed griddle oil. Cook the full batter until the pancake centers are set.'],
        'Southwest Beef Taco Bowl':['Warm the listed garlic in the vegetables’ existing oil, if not already added.','Reserve the listed cilantro and lime for plating.'],
      };
      finishSteps=concise[first.name] || finishSteps;
    }
    const kitList=ingredientSectionList(kitIngredients,method.cookIngredientSections || [],{exact:phase==='components'});
    const measuredKit=missingKit ? '<p class="kd-alert"><b>Stop: the named measured kit is missing. Review this recipe before cooking.</b></p>' : (kitIngredients.length ? (method.cookIngredientCollapsible && phase!=='protein' ? `<details class="kd-reference-notes kd-measured-kit"><summary>${escape(method.cookIngredientHeading || 'Measured ingredients')}</summary>${kitList}</details>` : `<section class="kd-measured-kit"><h4>${phase==='components'?'Full batch':escape(method.cookIngredientHeading || 'Measured ingredients')}</h4>${kitList}</section>`) : '');
    const validationNotes=phase==='components' ? '' : referenceDetails('Test and yield details',method.cookValidationNotes || []);
    const pullLine=!['cold','components','assembly'].includes(phase) && proteinPulls.length ? `<div class="kd-cook-pulls">${proteinPulls.map(pull=>`<p><b>${escape(pull.headline)}</b><span>${escape(pull.basis)}</span></p>`).join('')}</div>` : '';
    const buildCards=tiers.map(recipe=>{
      const build=packRows(recipe,recipes).filter(row=>row.kind!=='cup');
      return `<section class="kd-build-card"><h5>Fill ${recipe.qty} ${escape(tierName(recipe.tier))} container${recipe.qty===1?'':'s'}</h5><ul>${build.map(row=>`<li class="${row.hold?'kd-pack-hold':''}"><b>${escape(row.amount)}</b> ${escape(row.name)}</li>`).join('')}</ul></section>`;
    }).join('');
    const looseCupRows=[...tiers.reduce((map,recipe)=>{
      for(const cup of recipe.method.sideCupComponents || (recipe.method.sideCup?[recipe.method.sideCup]:[])) {
        const count=recipe.qty*(Number(cup.cupsPerMeal)||1);
        const key=`${cup.name}|${cup.gramsPerMeal || ''}|${cup.weightBasis || ''}`;
        const row=map.get(key) || {...cup,count:0};
        row.count+=count;
        map.set(key,row);
      }
      return map;
    },new Map()).values()];
    const looseCups=looseCupRows.length ? `<section class="kd-cook-action kd-cook-action-sauces"><span class="kd-cook-action-number">3</span><div><h4>Stage loose bag sauces</h4><ul>${looseCupRows.map(row=>`<li><b>${number(row.count)} cups</b> · ${escape(row.name)} · ${escape(cupFillText(row))}</li>`).join('')}</ul><p>Keep these sealed cups out of the meal containers. Add them to each customer bag during Pack-out.</p></div></section>` : '';
    const customerSetAside=allocation?.separate?.length ? allocation.separate.map(row=>`<span>${escape(row.customer)} · ${row.qty} ${escape(tierName(row.tier))} · no labels</span>`).join('') : '';
    const ownerSetAside=dishExtras.map(extra=>`<span>Home · ${Number(extra.ownerServings || 0)} ${escape(tierName(extra.tier || 'lean'))} · no labels</span>`).join('');
    const customers=(customerSetAside || ownerSetAside) ? `<div class="kd-pack-customers"><b>Set aside first</b>${customerSetAside}${ownerSetAside}</div>` : '';
    const physicalMeals=tiers.reduce((n,r)=>n+r.qty,0);
    const ownerMeals=dishExtras.reduce((n,extra)=>n+Number(extra.ownerServings || 0),0);
    const cookOnly=['protein','components'].includes(phase);
    const actionTitle=phase==='protein'?'Cook protein':phase==='components'?'':phase==='cold'?'Cold assembly after raw-station closure':phase==='assembly'?'Finish before plating':'Cook and finish';
    const firstAction=finishSteps.length ? `<section class="kd-cook-action"><span class="kd-cook-action-number">1</span><div>${actionTitle?`<h4>${actionTitle}</h4>`:''}${measuredKit}${steps(finishSteps)}${validationNotes}${phase==='protein'?'<p>Move the finished batch to labeled safe holding. Start protected chilling for cold-wrap chicken now; follow the cooling checkpoints. Finish the remaining components before plating.</p>':''}</div></section>` : '';
    return `<article class="kd-task kd-cook-table-card" data-recipe="dish:${escape(first.id)}" data-cook-phase="${escape(phase)}"><header><div><span class="kd-eyebrow">${physicalMeals} meals${ownerMeals ? ` · ${ownerMeals} for home` : ''}</span><h3>${escape(first.name)}</h3></div><b>${cookOnly?'One batch':tiers.map(r=>`${escape(tierName(r.tier))} ${r.qty}`).join(' · ')}</b></header>
      ${customerBuilds.length?`<div class="kd-customer-exceptions"><b>Special portions</b>${customerBuilds.flatMap(note=>note.actions.map(action=>`<p>${escape(note.customer)} · ${note.qty}: ${escape(action.text)}</p>`)).join('')}</div>`:''}
      ${pullLine}<div class="kd-cook-actions kd-action-list">${firstAction}${!cookOnly?`<section class="kd-cook-action"><span class="kd-cook-action-number">${finishSteps.length?'2':'1'}</span><div><h4>Build containers</h4>${stagingReadinessCard(first)}<!-- Finish / assembly quantities --><div class="kd-build-grid">${buildCards}</div></div></section>${looseCups}`:''}</div>${!cookOnly?customers:''}
    </article>`;
  }

  const aheadStations = [
    {id:'protein-cooking',name:'Slow roasts, braises & cooked proteins',hint:'Start the slow roast or braise first. Record the raw pull and the finished edible yield.'},
    {id:'sauce-bases',name:'Hot sauce bases',hint:'Cook the Butter Chicken and Shakshuka tomato bases side by side in separate pots, then blend or reduce each to its own endpoint.'},
    {id:'sides',name:'Potatoes & cooked vegetables',hint:'Run coordinated potato and vegetable trays once, then divide every finished batch into its labeled destination.'},
    {id:'grains',name:'Rice, pasta & grains',hint:'One coordinated starch station. Keep unlike recipes measured and labeled; cook shared rice only once.'},
    {id:'cold-kits',name:'Measured & cold kits',hint:'Stage chilled ingredients and dry breads without repeating the produce work.'},
    {id:'assembly',name:'Pan & filling assembly',hint:'Build the measured pans and fillings in recipe order.'},
    {id:'desserts',name:'Desserts & Prep Day breakfast',hint:'Finish the pancakes and chilled desserts together near the end of Prep Day. Eggs and beef bacon stay for Cook Day.'},
    {id:'other',name:'Other Prep Day work',hint:'Complete the remaining measured jobs.'},
  ];
  function aheadStation(job) {
    if(job.preparedPanProtein) return 'assembly';
    if(job.preparedPull) return 'protein-cooking';
    if(aheadStations.some(station=>station.id===job.aheadWorkstation)) return job.aheadWorkstation;
    if(job.type==='dessert' || /dessert/i.test(job.recipe?.category || '')) return 'desserts';
    if(job.type==='prep-flow') return 'protein-cooking';
    if(job.type==='protein-cook-ahead') return 'protein-cooking';
    if(job.ingredients?.some(item=>/_raw$/.test(item.key))) return 'protein-cooking';
    if(job.recipe?.method?.prepDayOnly) return 'protein-cooking';
    if(['shared-rice','shared-work-batch'].includes(job.type)) return job.family==='rice'?'grains':'sides';
    if(job.type==='starch-ahead' || job.type==='grain') {
      if(job.ingredients.some(i=>/potato/.test(i.key))) return 'sides';
      return 'grains';
    }
    if(job.type==='side') {
      if(job.ingredients.some(item=>item.key==='potato')) return 'sides';
      if(job.ingredients.some(item=>workflow.defaultProduceCuts[item.key])) return 'sides';
      return 'cold-kits';
    }
    if(job.type==='vegetable-ahead') return 'sides';
    if(job.type==='cook-ahead') return 'desserts';
    if(job.type==='dessert') return 'desserts';
    if(job.type==='mix' || (job.type==='mise-en-place' && job.recipe?.method?.panBatch)) return 'assembly';
    if(['cold-kit','mise-en-place','measured-prep'].includes(job.type)) return 'cold-kits';
    return 'other';
  }
  function prepSequence(model) {
    const ahead=(model.jobs || []).filter(job=>job.stage==='ahead' && !job.hidePrepCard
      && job.name!=='Toss wings with clean mango habanero after cooking');
    const early=ahead.filter(job=>['protein-cook-ahead','prep-flow'].includes(job.type)
      && job.recipe && cookStation([job.recipe])==='braise'
      && !job.preparedPull && !job.preparedPanProtein && !job.deferred);
    const earlyKeys=new Set(early.map(job=>job.key));
    const late=ahead.filter(job=>!earlyKeys.has(job.key) && (
      aheadStation(job)==='protein-cooking' || job.preparedPull || job.preparedPanProtein
      || rawTypes.has(job.type) || job.ingredients?.some(item=>/_raw$/.test(item.key))));
    const lateKeys=new Set(late.map(job=>job.key));
    const clean=ahead.filter(job=>!earlyKeys.has(job.key) && !lateKeys.has(job.key));
    return {early,clean,late,hasRawPrep:Boolean(model.component?.proteins?.length),
      reset:[
        'Protect and refrigerate ready-to-eat components; keep cooling checkpoints running.',
        'Wash and rinse tools and work surfaces, then sanitize the raw-handling zone.',
        'Wash hands and change contaminated gloves or apron before returning to clean work.',
      ]};
  }

  function aheadWorkstations(jobs) {
    let visibleIndex=0;
    return aheadStations.map(station=>{
      const stationJobs=jobs.filter(job=>aheadStation(job)===station.id)
        .sort((a,b)=>(a.sequence||999)-(b.sequence||999)||a.name.localeCompare(b.name));
      if(!stationJobs.length) return '';
      const index=visibleIndex++;
      const riceGrams = jobs => jobs.reduce((sum,job) => sum + job.ingredients
        .filter(item => /(^|_)rice_dry$/.test(item.key)).reduce((n,item) => n + Number(item.baseAmount || 0), 0), 0);
      const dryRice=station.id==='grains' ? riceGrams(stationJobs) : 0;
      const deferredRice=station.id==='grains' ? riceGrams(stationJobs.filter(job=>job.deferred)) : 0;
      const totalLabel=dryRice ? `${number(dryRice-deferredRice)} g dry rice${deferredRice ? ` · ${number(deferredRice)} g hold dry` : ''}${stationJobs.some(job=>job.ingredients.some(i=>i.key==='quinoa_dry'))?' + quinoa below':''}` : `${stationJobs.length} job${stationJobs.length===1?'':'s'}`;
      return `<section class="kd-workstation" data-workstation="${station.id}"><header class="kd-workstation-heading"><div><span class="kd-eyebrow">Station ${index+1}</span><h3>${escape(station.name)}</h3><p>${escape(station.hint)}</p></div><b>${totalLabel}</b></header><div class="kd-workstation-jobs">${stationJobs.map(job=>job.deferred?`<div class="kd-deferred"><span class="kd-status">Cook tomorrow</span>${jobCard(job)}</div>`:jobCard(job)).join('')}</div></section>`;
    }).join('');
  }

  function sauceWorkstations(model) {
    const sauceOrder=[
      /Quick-pickle red onion/i,/lasagna tomato meat sauce/i,/Lasagna ricotta layer/i,
      /Garlic Herb Yogurt/i,/Cucumber Dill Tzatziki/i,/Mango Chipotle Lime/i,
      /Lemon Tahini/i,/BBQ Mac customer sauce cups/i,/bottled ranch/i,/mango habanero dip/i,
    ];
    const rank=job=>{const index=sauceOrder.findIndex(pattern=>pattern.test(job.name || ''));return index<0?99:index;};
    const currentPizza=model.recipes.some(recipe=>recipe.name==='Beef Bacon Breakfast Pizza');
    const jobs=model.jobs.filter(job=>job.stage==='sauces' && !job.hidePrepCard)
      .sort((a,b)=>currentPizza?rank(a)-rank(b)||(a.sequence||999)-(b.sequence||999):(a.sequence||999)-(b.sequence||999));
    const qcRows=model.qcSideCups || [];
    const cupRows=[...(model.sideCups || []),...(model.extraSideCups || []),...qcRows];
    if(!jobs.length && !cupRows.length) return '<div class="kd-empty">No separate sauce work for this selection.</div>';
    const incorporatedPortions=jobs.reduce((sum,job)=>{
      if(job.sauceDelivery==='incorporated') return sum+(Number(job.recipe?.qty)||0);
      return sum+(job.destinations || []).filter(destination=>destination.delivery==='incorporated').reduce((n,destination)=>n+(Number(destination.qty)||0),0);
    },0);
    const totalCups=Math.max(0,cupRows.reduce((sum,row)=>sum+row.cups,0));
    const filledRows=cupRows;
    const totalLabel=`${totalCups} cups${incorporatedPortions?` · ${incorporatedPortions} incorporated portions`:''}`;
    const nonstandard=filledRows.filter(row=>{
      const selected=String(row.batchGroup || '').startsWith('selected:')
        && model.productionPlan?.saucePlan?.sauces.find(sauce=>row.batchGroup===`selected:${sauce.id}`);
      return selected ? Math.abs(row.gramsPerMeal-selected.gramsPerCup)>=.01 : !cupPolicy(row).valid;
    });
    return `<section class="kd-workstation" data-workstation="sauce-mix-fill"><header class="kd-workstation-heading"><div><h3>Mix &amp; fill sauces</h3><p>Each card includes the complete batch and exact cup count. There is no separate fill step.</p></div><b>${totalLabel}</b></header>${nonstandard.length?`<div class="kd-alert"><b>Recipe correction required before release.</b> ${nonstandard.map(row=>`${escape(row.name)} is recorded at ${escape(cupFillText(row))}`).join(' · ')}.</div>`:''}<div class="kd-workstation-jobs">${jobs.map(jobCard).join('')}</div></section>`;
  }

  function produceRow(item) {
    const cuts=[...new Set(item.destinations.map(destination=>destination.cut || (pantryVegetableKeys.includes(item.key)?'Open, drain and weigh':'Prepare as listed')))];
    const destinations=Object.values(item.destinations.reduce((map,destination)=>{
      const name=destination.name.replace(/ · (Lean|Bulk|Single)$/,'');
      const cut=destination.cut || (pantryVegetableKeys.includes(item.key)?'Open, drain and weigh':'Prepare as listed');
      const key=`${name}:${cut}`;
      const row=map[key] ||= {name,cut,grams:0,unit:destination.unit};row.grams+=destination.baseAmount;return map;
    },{}));
    return `<div class="kd-produce-row" role="row"><b role="cell">${escape(item.name)}</b><span role="cell">${cuts.map(cut=>`${escape(cut)}${cuts.length>1 ? ` · ${number(destinations.filter(row=>row.cut===cut).reduce((sum,row)=>sum+row.grams,0))} ${escape(item.unit)}` : ''}`).join('<br>')}</span><strong role="cell">${escape(amount(item))}</strong><details role="cell"><summary>${destinations.length} use${destinations.length===1?'':'s'}</summary><div>${destinations.map(row=>`<p><span>${escape(row.name)}${cuts.length>1?` · ${escape(row.cut)}`:''}</span><b>${number(row.grams)} ${escape(row.unit)}</b></p>`).join('')}</div></details></div>`;
  }

  function produceWorkgroups(model) {
    const claimed=new Set();
    const knownKeys=new Set(produceFamilies.flatMap(family=>family.keys));
    const sections=produceFamilies.map(family=>{
      const rows=model.produce.filter(item=>family.keys.includes(item.key) || (family.id==='other' && !knownKeys.has(item.key)));
      rows.forEach(item=>claimed.add(item.key));
      return rows.length ? `<section class="kd-produce-group" data-produce-group="${family.id}"><header><h3>${escape(family.name)}</h3><b>${rows.length} item${rows.length===1?'':'s'}</b></header><div class="kd-produce-table" role="table" aria-label="${escape(family.name)} prep">${rows.map(produceRow).join('')}</div></section>` : '';
    });
    return sections.join('') || '<div class="kd-empty">No produce work for this run.</div>';
  }

  function pantryVegetables(model) {
    return produceWorkgroups({...model,produce:model.produce.filter(item=>pantryVegetableKeys.includes(item.key))});
  }

  const cookStations = [
    {id:'braise',name:'Slow roast & braise finish',hint:'Use the recorded edible meat and pan gravy or jus yields from Batch recipes.'},
    {id:'poultry',name:'Chicken',hint:'Keep each seasoned pull labeled. Probe each batch to its recipe endpoint.'},
    {id:'ground-beef',name:'Ground beef',hint:'Cook the separate recipes together in this work block.'},
    {id:'steak',name:'Steak',hint:'Use the measured steak cuts and sides.'},
    {id:'seafood',name:'Fish & seafood',hint:'Complete after other hot proteins, using clean pans and utensils.'},
    {id:'breakfast',name:'Eggs & breakfast',hint:'Use the exact tier counts and measured batter or egg mixture.'},
    {id:'dessert',name:'Desserts',hint:'Finish and count the chilled portions.'},
    {id:'other',name:'Other finish work',hint:'Complete any remaining controlled recipe.'},
  ];
  function cookStation(recipes) {
    if(recipes[0]?.name==='Braised Beef Short Rib') return 'braise';
    return recipes[0].productionGroup || 'other';
  }
  const openingChecks=[
    'Before opening food, inspect cutters, peelers, pan handles, racks, tongs, mixer attachments and the packing table for loose or missing screws, cracked parts or other foreign material.',
    'If hardware is loose, missing or found in food, stop and isolate the equipment and affected food. Locate the part and resolve the food-safety decision before restarting; do not rely on a visual look at the food alone.',
    'Verify the probe and refrigerator readings, protected cooling space, labeled component locations and covered clean packaging before beginning.',
  ];
  const rawClosureChecks=[
    'Finish every hot/raw protein job first. Record endpoints and yields and move cooked food into labeled protected safe holding.',
    'Remove raw meat, raw-contact crumbs, utensils, gloves and disposables from the clean assembly area. Discard contaminated coating and wash, rinse and sanitize shared tools and surfaces.',
    'Wash hands and change contaminated gloves or apron. Mark the raw station CLOSED. Do not reopen it during cold assembly.',
    'Release cold assembly only when its chicken and all other cold components have measured 41 F or below. Continue recording cooling checkpoints; do not seal warm food.',
  ];
  const isInternalOrder=order=>String(order?.customer || '').trim().toLowerCase()==='home';
  function checklistCard(title,lines,key) {
    return `<section class="kd-primary-block" data-kitchen-check="${escape(key)}"><h3>${escape(title)}</h3>${steps(lines)}<label>Time / initials / action<input type="text" maxlength="360" data-log-key="safety:${escape(key)}:record" data-cook-log-key="safety:${escape(key)}:record" placeholder="Record the actual inspection and any hold or corrective action"></label></section>`;
  }
  function cookSequence(grouped) {
    const sequence=recipe=>recipe.method.productionSequence ?? recipe.method.cookDayEquipment?.sequence ?? 50;
    const stations=grouped.some(recipes=>recipes[0].name==='Beef Bacon Breakfast Pizza')
      ? [...cookStations].sort((a,b)=>(a.id==='breakfast'?-1:0)-(b.id==='breakfast'?-1:0))
      : cookStations;
    const hot=stations.flatMap(station=>{
      const groups=grouped.filter(recipes=>cookStation(recipes)===station.id)
        .sort((a,b)=>(a[0].name==='Beef Bacon Breakfast Pizza'?-1:0)-(b[0].name==='Beef Bacon Breakfast Pizza'?-1:0)
          ||sequence(a[0])-sequence(b[0])||a[0].name.localeCompare(b[0].name));
      return groups.length?[{...station,groups}]:[];
    });
    return {hot,cold:grouped.filter(recipes=>recipes[0].method.coldAssembly===true)};
  }
  function remainingComponentGroups(grouped) {
    const work=grouped.filter(recipes=>recipes[0].method.cookDayComponentSteps?.length && recipes[0].method.cookDayComponentKeys?.length);
    const family=recipes=>/\borzo\b|\bpasta\b/i.test(recipes[0].name)?'pasta':cookStation(recipes)==='breakfast'?'breakfast':'finish';
    return [{id:'pasta',name:'Pasta'},{id:'breakfast',name:'Eggs & breakfast'},{id:'finish',name:'Other finishing'}]
      .map(group=>({...group,groups:work.filter(recipes=>family(recipes)===group.id)})).filter(group=>group.groups.length);
  }
  function cookWorkstations(grouped, productionExtras=[], context={}) {
    const run=cookSequence(grouped);
    const pizzaFirst=grouped.some(recipes=>recipes[0].name==='Beef Bacon Breakfast Pizza');
    const plating=run.hot.map(station=>{
      const groups=station.groups.filter(recipes=>!recipes[0].method.coldAssembly);
      return groups.length?`<section class="kd-workstation kd-pack-category"><h3>${escape(station.name)}</h3>${groups.map(recipes=>combinedCookCard(recipes,productionExtras,'assembly')).join('')}</section>`:'';
    }).join('')+(run.cold.length?`<section class="kd-workstation kd-pack-category"><h3>Chilled wraps and boxes</h3>${run.cold.map(recipes=>combinedCookCard(recipes,productionExtras,'cold')).join('')}</section>`:'');
    if(grouped.some(recipes=>Array.isArray(recipes[0].method.cookDayComponentSteps))) {
      const proteins=run.hot.filter(station=>!['breakfast','dessert','other'].includes(station.id));
      const componentGroups=remainingComponentGroups(grouped);
      const completed=context.prepCompleted ? `<section class="kd-primary-block kd-prep-complete"><h3>Prep already done</h3><p>${escape(context.prepCompleted)}</p><p>Use those prepared components. The steps below cover the work still to do.</p></section>` : '';
      return completed+checklistCard('Cook Day opening and hardware inspection',openingChecks,'cook-opening')
        +(pizzaFirst?'<p class="kd-rule"><b>Start first:</b> Preheat the pizza stone now. Cook and pack the breakfast pizza in the first hot work block; use its measured Cook Day bacon and eggs.</p>':'')
        +'<section class="kd-primary-block" data-cook-step="proteins"><h2>1. Cook the proteins</h2><p>Keep the chicken batches labeled. Prepare the Popcorn coating immediately before its chicken cook. Move each cooked batch into protected safe holding; start chilling cold-wrap chicken while you finish the rest.</p>'
        +proteins.map(station=>`<section class="kd-workstation kd-cook-station" data-cook-station="${station.id}"><header class="kd-workstation-heading"><div><h3>${escape(station.name)}</h3><p>${escape(station.hint)}</p></div></header>${station.groups.map(recipes=>combinedCookCard(recipes,productionExtras,'protein')).join('')}</section>`).join('')+'</section>'
        +checklistCard('Close and sanitize the raw station',rawClosureChecks.slice(0,3),'raw-closure')
        +'<section class="kd-primary-block" data-cook-step="components"><h2>2. Finish remaining cooking</h2>'
        +componentGroups.map(group=>`<section class="kd-workstation" data-component-group="${group.id}"><h3>${group.name}</h3>${group.groups.map(recipes=>combinedCookCard(recipes,productionExtras,'components')).join('')}</section>`).join('')+'</section>'
        +'<section class="kd-primary-block" data-cook-step="plating"><h2>3. Plate and pack</h2><p>Cold-wrap components must be 41 F or below before assembly.</p>'
        +plating+'</section>';
    }
    return checklistCard('Cook Day opening and hardware inspection',openingChecks,'cook-opening')
      +'<p class="kd-rule">Keep raw loading separate from clean food. Before any clean plating during hot work, remove raw tools, wash hands and sanitize the shared station. Return food to safe holding between short runs.</p>'
      +(pizzaFirst?'<p class="kd-rule"><b>Start first:</b> Preheat the pizza stone; cook the pizza bacon and eggs fresh. Finish the breakfast pizza before the other meal builds.</p>':'')
      +run.hot.map((station,index)=>`<section class="kd-workstation kd-cook-station" data-cook-station="${station.id}"><header class="kd-workstation-heading"><div><span class="kd-eyebrow">Hot work ${index+1}</span><h3>${escape(station.name)}</h3><p>${escape(station.hint)}</p></div><b>${station.groups.length} ${station.groups.length===1?'dish':'dishes'}</b></header><div class="kd-workstation-jobs">${station.groups.map(recipes=>combinedCookCard(recipes,productionExtras,recipes[0].method.coldAssembly?'protein':'complete')).join('')}</div></section>`).join('')
      +checklistCard('Close and sanitize the raw station before cold assembly',rawClosureChecks,'raw-closure')
      +(run.cold.length?`<section class="kd-workstation" data-cook-station="cold-assembly"><header><h3>Cold assembly after raw-station closure</h3><p>Use only released chilled chicken and cold components. No raw food is opened here.</p></header>${run.cold.map(recipes=>combinedCookCard(recipes,productionExtras,'cold')).join('')}</section>`:'');
  }

  function recipeCard(recipe, mode='cook') {
    const m = recipe.method;
    const items = recipe.ingredients;
    const additions=(recipe.ingredientUse || workflow.ingredientUse(recipe)).finish;
    const prepared=items.flatMap(item=>{
      const grams=item.baseAmount-(additions.find(row=>row.key===item.key)?.baseAmount || 0);
      return grams>.001?[{...item,baseAmount:grams}]:[];
    });
    const measured = mode==='reference' ? ingredientList(items) : `${prepared.length?`<h4>Prepared</h4>${ingredientList(prepared)}`:''}${additions.length?`<h4>Add now</h4>${ingredientList(additions)}`:''}`;
    const endpoint = m.temperature || 'Endpoint not recorded';
    return `<details class="kd-task kd-recipe" data-recipe="${escape(recipe.key)}"><summary><div><span class="kd-eyebrow">${recipe.qty} ${escape(tierName(recipe.tier))} · ${escape(m.cookDayEquipment?.lane || m.proteinCook?.lane || 'finish')}</span><h3>${escape(recipe.name)}</h3><small>${escape(endpoint)}</small></div><span class="kd-tier">${escape(tierName(recipe.tier))}</span></summary><div class="kd-recipe-body">
      ${recipe.customerNotes?.length ? `<div class="kd-alert kd-customer-alert"><b>Customer-specific build. Keep portions separate.</b><ul>${recipe.customerNotes.flatMap(note=>note.actions.map(action=>`<li>${escape(note.customer)} · ${note.qty} portion${note.qty===1?'':'s'}: ${escape(action.text)}</li>`)).join('')}</ul></div>`:''}
      ${mode==='reference' ? recipe.prep.map(b=>`<section class="kd-reference-part"><h4>${escape(b.name)}</h4><div class="kd-recipe-grid">${ingredientList(b.ingredients)}${steps(b.steps,b.ingredients,b.stepIngredientKeys)}</div></section>`).join('') : ''}
      <div class="kd-recipe-grid"><div>${measured}</div><div><h4>${mode==='reference'?'Cook & finish':'Steps'}</h4>${steps(m.steps || [],items,m.stepIngredients)}</div></div>
      <div class="kd-portion"><h4>Pack ${escape(tierName(recipe.tier))}</h4>${steps(m.assemblyGuide?.[recipe.tier] || [m.plating])}</div>
      ${mode==='reference' ? `<small class="kd-source">${escape(m.source || 'Controlled internal recipe')} · current controlled quantities</small>` : ''}</div></details>`;
  }

  const humanize=value=>String(value||'').replace(/^shared-/,'').replace(/[-_]+/g,' ').replace(/\b\w/g,letter=>letter.toUpperCase());
  function exactPackNotes(recipe) {
    const assembly=workingSteps(recipe.method.assemblyGuide?.[recipe.tier] || []);
    const assumptions=(recipe.tierAssumptions || []).filter(line=>
      /\b(receives|pack|portion|container|squares?|slices?|cups?|pieces?|logs?|cold box)\b/i.test(line) &&
      !/research basis|record .*yield|do not estimate/i.test(line));
    return [...new Set([...assembly,...assumptions])].slice(0,5);
  }

  function cookPackNotes(recipe) {
    const generic=[
      /^approved (?:lean|bulk|single) blueprint/i,
      /working raw equivalent/i,
      /production reserve/i,
      /record (?:the )?(?:finished )?yield/i,
      /rapid-cool|cover, label|refrigerate promptly/i,
    ];
    return exactPackNotes(recipe).filter(note=>/\bcooked\b/i.test(note) || !generic.some(pattern=>pattern.test(note))).slice(0,3);
  }

  function packRows(recipe,batchRecipes) {
    const ingredients=recipe.portionIngredients || [];
    const activeIngredientKeys=new Set(ingredients.filter(item=>Number(item.amount || 0)>0).map(item=>item.key));
    const cups=recipe.method.sideCupComponents || (recipe.method.sideCup ? [recipe.method.sideCup] : []);
    if(batchRecipes?.length && recipe.method.cookDayComponentSteps && ['Lemon Herb Chicken Orzo','Creamy Cajun Chicken Pasta'].includes(recipe.name)) {
      const perMeal=(row,key)=>Number(row.portionIngredients?.find(item=>item.key===key)?.amount || 0);
      const share=(key,name)=>({name,amount:`finished batch weight × ${number(perMeal(recipe,key))} ÷ ${number(batchRecipes.reduce((sum,row)=>sum+row.qty*perMeal(row,key),0))}`,kind:'finished-component'});
      if(recipe.name==='Creamy Cajun Chicken Pasta')return [
        share('chicken_thigh_raw','cooked Cajun chicken'),
        share('protein_pasta','finished creamy pasta, including sauce'),
      ];
      return [
        {name:'cooked chicken',amount:recipe.tier==='bulk'?'210 g':'160 g',kind:'finished-component'},
        share('barilla_orzo_dry','finished lemon-herb Orzo'),
        share('zucchini','prepared zucchini and carrot'),
      ];
    }
    if(recipe.method.packMode==='finished-tier-batch') {
      return [
        {name:`of the finished ${tierName(recipe.tier)} ${recipe.method.finishedPackName || recipe.name} batch`,amount:'1 equal portion',kind:'finished-batch'},
        ...cups.map(cup=>({name:cup.name,amount:`${Number(cup.cupsPerMeal)||1} cup${Number(cup.cupsPerMeal)===1?'':'s'} × ${cupFillText(cup)}`,kind:'cup',hold:!cupPolicy(cup).valid})),
      ];
    }
    const cupRefs=new Set(cups.flatMap(cup=>[cup.componentRef,cup.batchGroup].filter(Boolean)));
    if(recipe.method.packBuildByTier?.[recipe.tier]) {
      return [
        ...recipe.method.packBuildByTier[recipe.tier].map(row=>({...row,kind:row.kind || 'finished-component'})),
        ...cups.map(cup=>({name:cup.name,amount:`${Number(cup.cupsPerMeal)||1} cup${Number(cup.cupsPerMeal)===1?'':'s'} × ${cupFillText(cup)}`,kind:'cup',hold:!cupPolicy(cup).valid})),
      ];
    }
    const rows=[],components=new Map(),preparedKeys=new Set(),preparedComponents=[],incorporatedKeys=new Set();
    const preparedTypes=new Set(['cook-ahead','protein-cook-ahead','dessert','sauce','topping','starch-ahead','vegetable-ahead','grain']);
    for(const batch of recipe.method.prepBatches || []) {
      if(['marinade','protein-portion','protein-mix'].includes(batch.type)) {
        for(const key of batch.ingredientKeys || []) if(!/_raw$/.test(key)) incorporatedKeys.add(key);
      }
      if(!preparedTypes.has(batch.type)) continue;
      const keys=batch.ingredientKeys || [];
      if(/fill .*cups?/i.test(batch.name || '')) {
        keys.forEach(key=>preparedKeys.add(key));
        continue;
      }
      if(batch.componentRef && cupRefs.has(batch.componentRef)) {
        keys.forEach(key=>preparedKeys.add(key));
        continue;
      }
      if(keys.length && !keys.some(key=>activeIngredientKeys.has(key))) continue;
      keys.forEach(key=>preparedKeys.add(key));
      const rawLabel=String(batch.name || 'Prepared component');
      let label=rawLabel.replace(/^(?:Bake|Boil|Cook|Finish|Make|Mix|Prepare|Roast)\s+/i,'').replace(/^and\s+/i,'');
      if(/Buffalo chicken filling/i.test(rawLabel)) label='Buffalo chicken filling';
      else if(/enchilada pans/i.test(rawLabel)) label='finished enchilada bake';
      else if(/fully bake the lasagna/i.test(rawLabel)) label='finished lasagna';
      else if(/pancakes and prepare both finishes/i.test(rawLabel)) label='prepared pancakes';
      preparedComponents.push({ref:batch.componentRef || '',name:label,amount:'one measured tier share'});
    }
    const seasoning=item=>item.measure?.type==='spice' || /Dry Prep & Seasonings/i.test(item.station || '') ||
      /salt|pepper|paprika|cumin|coriander|chili|seasoning|garlic powder|onion powder/i.test(item.name || '');
    for(const item of ingredients) {
      if(preparedKeys.has(item.key) || incorporatedKeys.has(item.key)) continue;
      const refs=Object.keys(item.allocations || {});
      const nonCupRefs=refs.filter(ref=>!cupRefs.has(ref));
      if(nonCupRefs.length) {
        for(const ref of nonCupRefs) {
          if(/marinade|season|cooking/i.test(ref) || seasoning(item)) continue;
          const component=components.get(ref) || {label:humanize(ref),sources:[]};
          const sourceAmount=Number(item.allocations?.[ref] || 0);
          if(sourceAmount>0) component.sources.push(`${number(sourceAmount)} ${item.unit || 'g'} ${item.name}`);
          components.set(ref,component);
        }
        continue;
      }
      if(refs.length || seasoning(item)) continue;
      const value=Number(item.amount || 0),unit=item.unit || 'g';
      if(value<=0) continue;
      if(/_raw$/.test(item.key)) rows.push({name:`Cooked ${String(item.name).replace(/,?\s*raw\b/i,'')}`,amount:`complete share from ${number(value)} ${unit} raw`,kind:'protein'});
      else if(/_dry$/.test(item.key)) rows.push({name:`Cooked ${String(item.name).replace(/,?\s*dry\b/i,'')}`,amount:`complete share from ${number(value)} ${unit} dry`,kind:'starch'});
      else rows.push({name:String(item.name).replace(/,\s*raw\b/i,''),amount:`${number(value)} ${unit}`,kind:'direct'});
    }
    for(const component of components.values()) rows.push({name:component.label,amount:component.sources.length===1?`batch share made from ${component.sources[0]}`:'one equal measured batch share',kind:'component'});
    for(const component of preparedComponents) {
      if(component.ref && components.has(component.ref)) continue;
      if(rows.some(row=>row.name.toLowerCase()===component.name.toLowerCase())) continue;
      rows.push({...component,kind:'component'});
    }
    for(const cup of cups) rows.push({name:cup.name,amount:`${Number(cup.cupsPerMeal)||1} cup${Number(cup.cupsPerMeal)===1?'':'s'} × ${cupFillText(cup)}`,kind:'cup',hold:!cupPolicy(cup).valid});
    return rows;
  }

  function packCard(recipes) {
    const first=recipes[0],tiers=recipes.slice().sort((a,b)=>['lean','bulk','single'].indexOf(a.tier)-['lean','bulk','single'].indexOf(b.tier));
    const allocation=first.packAllocation;
    const customers=allocation?.separate?.length ? `<div class="kd-pack-customers"><b>Set aside before general labeling</b>${allocation.separate.map(row=>`<span>${escape(row.customer)} · ${row.qty} ${escape(tierName(row.tier))} · no labels</span>`).join('')}</div>` : '';
    const totalContainers=tiers.reduce((sum,recipe)=>sum+recipe.qty,0);
    return `<article class="kd-task kd-pack-card" data-pack-recipe="${escape(first.id)}"><header><div><span class="kd-eyebrow">${totalContainers} container${totalContainers===1?'':'s'}</span><h3>${escape(first.name)}</h3></div><b>${tiers.map(recipe=>`${recipe.qty} ${escape(tierName(recipe.tier))}`).join(' · ')}</b></header>${customers}${tiers.map(recipe=>{
      const rows=packRows(recipe,recipes),notes=exactPackNotes(recipe);
      return `<section class="kd-pack-tier"><h4>${escape(tierName(recipe.tier))} · make ${recipe.qty}</h4>${rows.some(row=>row.hold)?'<div class="kd-alert"><b>Cup record must be corrected to its recipe-controlled weight before this tier is released.</b></div>':''}<div class="kd-pack-spec">${rows.map(row=>`<div class="kd-pack-row ${row.hold?'kd-pack-hold':''}"><span>${escape(row.name)}</span><b>${escape(row.amount)}</b></div>`).join('')}</div>${notes.length?`<ul class="kd-pack-notes">${notes.map(note=>`<li>${escape(note)}</li>`).join('')}</ul>`:''}</section>`;
    }).join('')}</article>`;
  }

  function packMeals(model) {
    const grouped=[...model.recipes.reduce((map,recipe)=>{const group=map.get(recipe.id)||[];group.push(recipe);map.set(recipe.id,group);return map;},new Map()).values()];
    const rank=category=>({breakfast:0,main:1,'signature special':2,'internal custom meal':3,dessert:4,'add-on':5,'grab & go':5}[String(category).toLowerCase()] ?? 9);
    const sections=[...grouped.reduce((map,recipes)=>{const category=recipes[0].category || 'Other';const rows=map.get(category)||[];rows.push(recipes);map.set(category,rows);return map;},new Map())]
      .sort((a,b)=>rank(a[0])-rank(b[0]));
    const heading=category=>String(category).toLowerCase()==='add-on'?'Grab & Go':category;
    return sections.map(([category,groups])=>`<section class="kd-pack-category"><div class="kd-section-title"><h2>${escape(heading(category))}</h2><span>${groups.reduce((sum,recipes)=>sum+recipes.reduce((n,recipe)=>n+recipe.qty,0),0)} containers</span></div>${groups.map(packCard).join('')}</section>`).join('') || '<div class="kd-empty">No meals to pack.</div>';
  }

  const stages = [
    {id:'all',name:'Full run',hint:'The complete production packet in kitchen order.'},
    {id:'prep',name:'Prep list',hint:'Clean produce prep first. Raw protein prep follows the clean jobs in Batch recipes.'},
    {id:'batch',name:'Batch recipes',hint:'Early braise and reset, clean sauces and make-ahead jobs, then raw prep and dependent protein cooking.'},
    {id:'cook',name:'Cook & pack',hint:'Cook the proteins, finish pasta and breakfast components, then plate and pack.'},
    {id:'book',name:'Recipe book',hint:'Controlled recipe detail, source and validation reference.'},
  ];

  function daySplitBoard(model) {
    const todayTasks=[];
    const tomorrowTasks=[];
    const seen=new Set();
    for (const recipe of model.recipes || []) {
      if (seen.has(recipe.id)) continue;
      seen.add(recipe.id);
      const prepCards=recipe.method?.prepBatches || [];
      for (const card of prepCards) {
        const task={dish:recipe.name,name:card.name?.replace(/^DO TODAY\s*[—-]\s*/i,'') || ''};
        if (!task.name) continue;
        if (card.deferred===true) tomorrowTasks.push(task);
        else todayTasks.push(task);
      }
      for (const instruction of recipe.method?.cookDayReservations || []) {
        if (instruction) tomorrowTasks.push({dish:recipe.name,name:instruction});
      }
    }
    const row=task=>`<li><b>${escape(task.dish)}</b><span>${escape(task.name)}</span></li>`;
    return `<section class="kd-day-split" aria-label="Prep Day and Cook Day split"><article class="kd-day-column kd-today"><header><span class="kd-eyebrow">Prep Day</span><h3>DO TODAY · ${todayTasks.length} JOBS</h3><p>Every cooking, sauce, vegetable, starch, cold-kit, dessert, and protein-prep job assigned for today.</p></header><ol>${todayTasks.map(row).join('') || '<li>No Prep Day recipe is assigned.</li>'}</ol></article><article class="kd-day-column kd-tomorrow"><header><span class="kd-eyebrow">Cook Day</span><h3>RESERVE FOR TOMORROW · ${tomorrowTasks.length} JOBS</h3><p>Raw-protein cooking, fresh cutting, final baking, and assembly that must not be completed today.</p></header><ol>${tomorrowTasks.map(row).join('') || '<li>No Cook Day work is reserved.</li>'}</ol></article></section>`;
  }

  function render(model, activeStage='all', query='', context={}) {
    const aliases={produce:'prep',proteins:'batch',sauces:'batch',ahead:'batch',pack:'cook'};
    const stage = stages.find(s=>s.id===(aliases[activeStage] || activeStage)) || stages[0];
    const stageName=activeStage==='produce'?'Produce':activeStage==='proteins'?'Raw protein preparation':stage.name;
    let content = '';
    if (stage.id==='all') content=stages.filter(s=>!['all','book'].includes(s.id))
      .map(s=>render(model,s.id,query,{...context,embedded:true})).join('');
    const produceBlock=()=>checklistCard('Prep Day opening and hardware inspection',openingChecks,'prep-opening')+`<section class="kd-primary-block" data-prep-step="produce"><div class="kd-section-title"><div><span class="kd-eyebrow">Clean prep</span><h2>Produce</h2></div><span>Group common cuts, cover and refrigerate</span></div>${produceWorkgroups(model)}</section>`;
    const proteinBlock=()=>`<section class="kd-primary-block" data-prep-step="raw"><div class="kd-section-title"><div><span class="kd-eyebrow">After clean batches</span><h2>Raw protein preparation</h2></div><span>Keep cooked components protected; open one cold raw pull at a time</span></div>${proteinCards(model)}</section>`;
    if (stage.id==='prep') content=produceBlock();
    if (stage.id==='batch') {
      const sequence=prepSequence(model);
      const reset=(key)=>`<section class="kd-primary-block" data-prep-step="${key}"><h3>Sanitation reset</h3><ol>${sequence.reset.map(line=>`<li>${escape(line)}</li>`).join('')}</ol></section>`;
        content=(sequence.early.length?`<section class="kd-primary-block" data-prep-step="early"><h2>Start the slow roast or braise</h2><p>Start this measured batch after produce prep. Set its timer and sanitize the raw area before working on clean batches.</p>${aheadWorkstations(sequence.early)}</section>${reset('early-reset')}`:'')
        +`<section class="kd-primary-block" data-prep-step="sauces"><div class="kd-section-title"><div><span class="kd-eyebrow">Clean measured batches</span><h2>Sauces &amp; cups</h2></div></div>${sauceWorkstations(model)}</section>
        <section class="kd-primary-block" data-prep-step="clean-ahead"><h2>Potatoes, vegetables, grains and cold kits</h2><p>These are the remaining clean Prep Day jobs. Keep cooked food protected while it cools; record the cooling checkpoints.</p>${aheadWorkstations(sequence.clean) || '<div class="kd-empty">No clean make-ahead batches for this run.</div>'}</section>`
        +(sequence.hasRawPrep?proteinBlock()+reset('raw-reset'):'')
        +(sequence.late.length?`<section class="kd-primary-block" data-prep-step="late-protein"><h2>Complete cook-ahead proteins</h2><p>Use the labeled raw pulls prepared above. Keep raw-loading utensils separate from cooked-food utensils; reset after raw handling. Record finished yield and cooling checkpoints.</p>${aheadWorkstations(sequence.late)}</section>${reset('late-reset')}`:'');
    }
    if (activeStage==='produce') content=produceBlock();
    if (activeStage==='proteins') content=proteinBlock();
    if (stage.id==='cook') {
      const grouped=[...model.recipes.filter(recipe=>!recipe.method.prepDayOnly).reduce((map,recipe)=>{const group=map.get(recipe.id)||[];group.push(recipe);map.set(recipe.id,group);return map;},new Map()).values()]
        .sort((a,b)=>(a[0].method.cookDayEquipment?.sequence || 50)-(b[0].method.cookDayEquipment?.sequence || 50));
      content=cookWorkstations(grouped,model.productionExtras,context);
    }
    if (stage.id==='book') content=`<label class="kd-search">Find a recipe<input type="search" id="kdRecipeSearch" value="${escape(query)}" placeholder="Search the selected recipes"></label>${model.recipes.filter(r=>r.name.toLowerCase().includes(query.toLowerCase())).map(r=>recipeCard(r,'reference')).join('')}`;
    if(context.embedded) return `<section class="kd-dashboard"><h3>${escape(stageName)}</h3>${content}</section>`;
    const issues=[...model.review.errors,...model.review.decisions.map(d=>`${d.name}: ${d.message}`)];
    const productionChecks=(model.review.warnings || []).map(d=>`${d.name}: ${d.message}`);
    return `<section class="kd-dashboard"><header class="kd-heading"><div><span class="kd-eyebrow">${context.preview?'Planning preview · not locked':context.locked?'Locked production':'Editable kitchen run'}</span><h2>Your kitchen, in order.</h2></div><div class="kd-total"><b>${model.totalMeals + model.ownerExtraMeals}</b><span>${model.totalMeals-(model.internalMeals || 0)} customer meals${model.internalMeals?` + ${model.internalMeals} internal home meals`:''}${model.ownerExtraMeals ? ` + ${model.ownerExtraMeals} unlabeled owner spares` : ''} · ${new Set(model.counts.map(c=>c.id)).size} dishes</span></div></header>
      ${context.preview ? '<p class="kd-preview">Preview only. Final labels and customer pack-out require reconciled, locked orders.</p>':''}
      <p class="kd-rule"><b>Run order:</b> Prep list → Batch recipes → Cook &amp; pack → Customer pack-out.</p>
      ${model.customerNotes?.length ? `<details class="kd-review-details"><summary>Customer notes · ${model.customerNotes.length} orders</summary>${model.customerNotes.map(note=>`<p><strong>${escape(note.customer)}:</strong> ${escape(note.note)}</p>`).join('')}<p>Special portions also appear beside the affected dish.</p></details>`:''}
      ${issues.length ? `<details class="kd-review-details kd-review-hold"><summary>${issues.length} recipe decision${issues.length===1?'':'s'} before production</summary><ul>${issues.map(i=>`<li>${escape(i)}</li>`).join('')}</ul></details>`:''}
      ${productionChecks.length ? `<details class="kd-review-details"><summary>Production checks · ${productionChecks.length}</summary><ul>${productionChecks.map(i=>`<li>${escape(i)}</li>`).join('')}</ul></details>`:''}
      <nav class="kd-nav" aria-label="Kitchen work stages">${stages.map((s,i)=>`<button type="button" data-kd-stage="${s.id}" aria-current="${stage.id===s.id?'step':'false'}"><b>${i+1}. ${s.name}</b></button>`).join('')}</nav>
      <div class="kd-stage-heading"><div><h2>${escape(stage.name)}</h2><p>${escape(stage.hint)}</p></div>${!context.preview ? '<button type="button" class="btn" data-open-packout>Customer pack-out</button>':''}</div>
      <div class="kd-content">${content}</div><footer class="kd-safety">Cooling: 135°F to 70°F within 2 hours, then to 41°F or below within 6 hours total. Record times and temperatures in Cook Log. Unverified prep is not marked complete automatically.</footer></section>`;
  }
  return {ingredientSectionList,openingChecks,rawClosureChecks,checklistCard,cookSequence,remainingComponentGroups,isInternalOrder,build,buildFromPlan,render,review,countDifferences,stages,recipeCard,combinedCookCard,packCard,packMeals,packRows,produceWorkgroups,jobCard,sideCupJobs,seasonedSplit,consolidateSauces,consolidateTierJobs,consolidatePhysicalWork,consolidateRiceJobs,consolidatePrepFlows,aheadStations,aheadStation,aheadWorkstations,prepSequence,cookStations,cookStation,cookWorkstations,pantryVegetables,cookDayProteinCallout,daySplitBoard,displayAmount,cupPolicy};
});
