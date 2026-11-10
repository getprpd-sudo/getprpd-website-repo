(function(root,factory){
  const api=factory();
  if(typeof module!=='undefined' && module.exports) module.exports=api;
  if(root) root.PRPD_RECURRING_CUSTOMERS=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  // Customer preferences reference stable recipe names, never menu slot IDs or
  // copied ingredient weights. Activation is stored separately for each batch.
  const profiles=[{id:'nouman',name:'Nouman Ali Khan',aliases:['Nouman Khan','Nouman'],
    recipes:['High-Protein Beef Kofta & Roasted Vegetables','Custom Lebanese-Style Chicken Breast','Custom Lean Chicken Mince'],
    productionNote:'October 14 preference: cut the cucumber, tomato and onion into small even cubes and toss with lime, salt and black pepper. Chicken qeema needs slightly more salt or kick; record any owner-approved seasoning adjustment before packing.'}];
  const normalize=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const match=(p,o)=>[p.name,...(p.aliases||[])].some(n=>normalize(n)===normalize(o.customer));
  const noumanKofta='High-Protein Beef Kofta & Roasted Vegetables';
  const batch18Samples=[
    {id:'cucumber-dill-tzatziki',name:'Cucumber Dill Tzatziki'},
    {id:'mango-chipotle-lime',name:'Mango Chipotle Lime'},
    {id:'lemon-tahini',name:'Lemon Tahini'},
  ];
  function applyNoumanKoftaPlan(order,batch) {
    if(batch.number<18 || !match(profiles[0],order) ||
      !order.items.some(item=>item.name===noumanKofta || item.recipeName===noumanKofta)) return;
    order.notes=[order.notes,'Delivery day: prepare the kachumber fresh near departure. Verify it is 40°F or colder and add the sealed salad boxes to the insulated bag just before departure.'].filter(Boolean).join(' ');
    if(batch.number!==18) return;
    const selections=order.sauces?.selections || order.sauces || [];
    order.sauces=[...selections,...batch18Samples.filter(sample=>!selections.some(row=>row.id===sample.id))
      .map(sample=>({...sample,qty:1,ownerSample:true}))];
    order.notes+=' Kofta service: two 40 g Sweet Heat cups per meal; any optional sauce samples are separate.';
  }
  function recipeOptions(profile,data){
    return profile.recipes.flatMap(name=>{
      const entry=Object.entries(data.meals).find(([,m])=>m.name===name || (m.aliases||[]).includes(name));
      return entry?Object.keys(entry[1].tiers).map(tier=>({recipeName:name,id:entry[0],tier,name:entry[1].name})):[];
    });
  }
  function materialize(imported, selections, batch, data, customers=profiles){
    const orders=(imported||[]).filter(o=>!o.recurringProfileId).map(o=>({...o,items:(o.items||[]).map(i=>({...i}))}));
    const warnings=[];
    for(const profile of customers){
      const selection=selections?.[profile.id];
      const status=selection?.status || (selection?.enabled?'confirmed':'off');
      const existing=orders.filter(o=>match(profile,o));
      // A real incoming order takes priority. Do not add its saved template too.
      if(existing.length){
        if(status!=='off') warnings.push(`${profile.name}: using the synced order, not adding the saved plan again.`);
        continue;
      }
      if(status==='off') continue;
      if(!['planning','confirmed'].includes(status)) throw new Error(`${profile.name}: saved order status must be off, planning or confirmed.`);
      const options=recipeOptions(profile,data);
      const items=[];
      for(const [key,value] of Object.entries(selection.quantities||{})){
        const qty=Number(value);
        if(qty===0) continue;
        const option=options.find(o=>`${o.recipeName}|${o.tier}`===key);
        if(!option) throw new Error(`${profile.name}: saved recipe is unavailable. Review the recipe selection.`);
        if(!Number.isInteger(qty)||qty<0||qty>500) throw new Error(`${profile.name}: quantities must be whole meals from 0 to 500.`);
        items.push({...option,qty});
      }
      if(!items.length) throw new Error(`${profile.name}: enter at least one meal or switch this customer off.`);
      orders.push({orderId:`PRPD-B${batch.number}-RECURRING-${profile.id.toUpperCase()}`,customer:profile.name,
        recurringProfileId:profile.id,recurringStatus:status,planningOnly:status==='planning',
        labelsApproved:selection.labelsApproved===true,
        confirmationStatus:status==='planning'?'unconfirmed':'confirmed',amountStatus:status==='planning'?'pending':'set separately',
        sourceStatus:status==='planning'?'planning':'active',included:true,items,
        submittedAt:status==='planning'?'Owner-directed planning order':'Owner-confirmed custom order',
        fulfillment:selection.fulfillment||'',address:selection.address||'',city:selection.city||'',zip:selection.zip||'',
        phone:selection.phone||'',email:selection.email||'',
        total:selection.total||'',
        notes:[status==='planning'
          ? 'Owner-directed unconfirmed planning order. Amount pending. Do not invoice or count as booked revenue.'
          : 'Owner-confirmed saved customer plan. Quantities use the current recipe log. No automatic repeat charge or payment confirmation.',
          batch.number>=18 && profile.id==='nouman' && items.every(item=>item.recipeName===noumanKofta)
            ? '' : profile.productionNote || ''].filter(Boolean).join(' ')});
    }
    for(const order of orders) applyNoumanKoftaPlan(order,batch);
    return {orders,warnings};
  }
  return {profiles,recipeOptions,materialize,match};
});
