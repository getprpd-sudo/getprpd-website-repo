(function(root,factory){
  const api=factory();
  if(typeof module!=='undefined' && module.exports) module.exports=api;
  if(root) root.PRPD_KITCHEN_WORKFLOW=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  // One routing/consumption contract for the dashboard, guided tickets and audit.
  // Staging an ingredient is not the same as using it in a finished component.
  const operations=Object.freeze({
    marinade:['proteins',true], 'marinade-finish':['proteins',true],
    'protein-mix':['proteins',true], 'protein-portion':['proteins',true],
    'form-and-marinate':['proteins',true], 'protein-cook-ahead':['ahead',true],
    sauce:['sauces',true], topping:['sauces',true],
    'starch-ahead':['ahead',true], grain:['ahead',true],
    'vegetable-ahead':['ahead',true], mix:['ahead',true],
    'bake-ahead':['ahead',true], 'cook-ahead':['ahead',true], dessert:['ahead',true],
    'measured-prep':['ahead',false], 'cold-kit':['cook',false],
    'mise-en-place':['cook',false], 'garnish-kit':['produce',false],
    // Historical side kits only cut/stage ingredients. They are not cooked.
    side:['ahead',false],
  });
  const defaultProduceCuts=Object.freeze({onion:'Dice',red_onion:'Dice',garlic:'Mince',ginger:'Grate or mince',green_bell_pepper:'Dice',red_bell_pepper:'Thin strips',jalapeno:'Finely mince',green_onion:'Thinly slice',zucchini:'Even bite-size pieces',potato:'Even small cubes',broccoli:'Bite-size florets',blueberry:'Wash; keep whole',green_beans:'Trim',lettuce:'Shred and dry',cucumber:'Dice',tomato:'Dice',olives:'Drain and slice',parsley:'Finely chop',cilantro:'Chop; keep dry',lemon:'Juice; weigh juice',lime:'Juice; weigh juice',canned_peas_carrots:'Drain; weigh drained amount',corn:'Drain if canned; weigh recipe amount',pickles:'Drain; slice',cannellini_beans:'Drain and rinse'});
  function normalizeProduceCut(cut) {
    const clean=String(cut || '').trim().replace(/\.$/,'');
    if (/^juice; weigh (?:the )?juice$/i.test(clean)) return 'Juice; weigh juice';
    if (/^drain; slice(?: for serving)?$/i.test(clean)) return 'Drain; slice';
    if (/^chop(?:; keep dry| for garnish)?$/i.test(clean)) return 'Chop; keep dry';
    return clean;
  }
  function route(batch,recipe={}) {
    const definition=operations[batch.type];
    const dessertRecipe=/dessert/i.test(recipe.category || '');
    const dessert=dessertRecipe && batch.type==='measured-prep';
    return {known:Boolean(definition),stage:batch.stage || (dessertRecipe && batch.type==='topping' ? 'ahead' : definition?.[0]) || 'ahead',
      consumes:!batch.deferred && (batch.consumesIngredients ??
        (dessert || definition?.[1] || (batch.stage==='ahead' && recipe.method?.prepDayOnly)))===true};
  }
  function ingredientUse(recipe) {
    const errors=[],used=new Map(),rows=[];
    const add=(key,amount,owner,unit)=>{
      if(!Number.isFinite(amount)||amount<0) errors.push(`${recipe.title}: invalid amount in ${owner} for ${key}.`);
      const source=recipe.ingredients.find(i=>i.key===key);
      if(!source) errors.push(`${recipe.title}: ${owner} has no recipe source for ${key}.`);
      else if(unit && source.unit!==unit) errors.push(`${recipe.title}: ${owner} uses a different unit for ${key}.`);
      used.set(key,(used.get(key)||0)+amount); rows.push({key,amount,owner});
    };
    for(const item of recipe.sharedSeasoningAmounts || []) add(item.key,item.baseAmount,'Shared protein seasoning',item.unit);
    for(const batch of recipe.prep) {
      const routing=route(batch,recipe);
      if(!routing.known) errors.push(`${recipe.title}: unregistered operation type ${batch.type}.`);
      if(!['produce','proteins','sauces','ahead','cook'].includes(routing.stage)) errors.push(`${recipe.title}: invalid station ${routing.stage}.`);
      if(!routing.consumes) continue;
      for(const item of batch.ingredients) {
        if(item.deferredUntilCook || batch.cookDayIngredientKeys?.includes(item.key)) continue;
        const key=recipe.ingredients.some(source=>source.key===item.key)?item.key:(item.sourceKey || item.key);
        add(key,Number(item.baseAmount),batch.name,item.unit);
      }
    }
    for(const key of recipe.method.sideCup?.ingredientKeys || []) {
      const item=recipe.ingredients.find(i=>i.key===key);
      if(item) add(key,item.baseAmount,recipe.method.sideCup.name,item.unit);
      else errors.push(`${recipe.title}: side cup references missing ingredient ${key}.`);
    }
    const finish=recipe.ingredients.flatMap(item=>{
      const remainder=item.baseAmount-(used.get(item.key)||0);
      if(remainder<-.001) errors.push(`${recipe.title}: ${item.key} is allocated ${(-remainder).toFixed(3)} ${item.unit} more than its recipe amount.`);
      // Formula exports are rounded to four decimals. Sub-milligram residuals
      // are rounding noise, not another ingredient addition at the stove.
      return remainder>.001?[{...item,baseAmount:remainder}]:[];
    });
    return {finish,rows,errors};
  }
  function panRatioCompatible(recipes,portionBasis) {
    if(recipes.length<2) return true;
    const normalized=recipes.map(r=>new Map(r.ingredients.map(i=>[`${i.key}:${i.unit}`,i.baseAmount/r.qty/portionBasis[r.tier]])));
    const keys=new Set(normalized.flatMap(m=>[...m.keys()]));
    return [...keys].every(key=>normalized.every(m=>Math.abs((m.get(key)||0)-(normalized[0].get(key)||0))<.00001));
  }
  function canonicalRiceGroup(value) {
    const key=String(value || 'common').trim().toLowerCase();
    return ['common','plain','plain-rice','rice'].includes(key) ? 'plain-rice' : key;
  }
  function physicalWorkSpec(batch,recipe={}) {
    if(!batch || batch.stage!=='ahead' || batch.deferred) return null;
    const keys=(batch.ingredients || []).map(item=>item.key);
    const explicit=String(batch.workBatchGroup || '').trim();
    const operation=String(batch.workOperation || '').trim().toLowerCase();
    const temperature=Number(batch.ovenTemperatureF || 0);
    const declaredPrimary=(batch.workPrimaryKeys || []).filter(key=>keys.includes(key));
    if(keys.includes('rice_dry') && ['grain','starch-ahead'].includes(batch.type)) {
      const group=canonicalRiceGroup(explicit || recipe.method?.riceBatchGroup || batch.prepWave || 'common');
      if(!['plain-rice','cilantro-garlic-lime'].includes(group)) return null;
      const sharedBase=recipe.method?.sharedPlainRiceBase===true;
      return {key:sharedBase?'rice:shared-plain-base':`rice:${group}`,family:'rice',group:sharedBase?'shared-plain-base':group,flavorGroup:group,primaryKeys:['rice_dry'],name:sharedBase?'Plain rice base · cook once, split, then finish':group==='plain-rice'?'Plain rice · one shared pot':`${batch.prepWaveName || batch.name} · one batch`};
    }
    if(keys.includes('instant_potato_flakes')) {
      const group=explicit || 'package-ratio';
      return {key:`instant-mash:${group}`,family:'instant-mash',group,primaryKeys:[...keys],name:'Packaged instant mash · one batch'};
    }
    if(explicit && keys.length && keys.every(key=>['egg','egg_white'].includes(key))) {
      return {key:`egg:${explicit}`,family:'egg',group:explicit,primaryKeys:keys,name:batch.workBatchName || batch.prepWaveName || batch.name};
    }
    if(explicit && operation) {
      const primaryKeys=declaredPrimary.length ? declaredPrimary : keys.filter(key=>key==='potato' || Object.hasOwn(defaultProduceCuts,key));
      if(primaryKeys.length) return {key:`${operation}:${temperature||'controlled'}:${explicit}`,family:primaryKeys.includes('potato')?'potato':'vegetable',group:explicit,operation,temperature,primaryKeys,name:batch.workBatchName || batch.prepWaveName || batch.name};
    }
    const inferredProduceKeys=keys.filter(key=>key==='potato' || Object.hasOwn(defaultProduceCuts,key));
    if(batch.type==='vegetable-ahead' && batch.prepWave==='broccoli' && inferredProduceKeys.length===1) {
      const inferredOperation=/roast/i.test(`${batch.name} ${batch.prepWaveName || ''}`) ? 'roast' : 'cook';
      const group=String(batch.prepWave).trim().toLowerCase();
      return {key:`${inferredOperation}:${temperature||'controlled'}:${group}`,family:inferredProduceKeys[0]==='potato'?'potato':'vegetable',group,operation:inferredOperation,temperature,primaryKeys:inferredProduceKeys,name:batch.prepWaveName || batch.name};
    }
    return null;
  }
  return {operations,defaultProduceCuts,normalizeProduceCut,route,ingredientUse,panRatioCompatible,canonicalRiceGroup,physicalWorkSpec};
});
