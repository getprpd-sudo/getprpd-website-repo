'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
process.env.PRPD_FEEDBACK_TOKEN_SECRET='isolated-reward-test-secret-at-least-24';
process.env.GOOGLE_SHEET_ID='isolated-test-sheet';
const rewards=require('../api/_feedback-rewards');
const core=require('../api/_feedback-core');
const api=require('../api/_feedback-service')._test;
const now='2026-10-26T18:00:00.000Z',today='2026-10-26';
function indexed(rows){return rows.map(value=>({value}));}
function store(initial=[]){
  const state={credits:indexed(initial),claims:new Set(),commits:0,failBefore:false,failAfter:false};
  return {state,readState:async()=>({credits:structuredClone(state.credits),claimIds:new Set(state.claims),sheetId:12}),
    commit:async requests=>{
      if(state.failBefore){state.failBefore=false;throw new Error('Network failed before commit');}
      const ids=requests.filter(r=>r.addNamedRange).map(r=>r.addNamedRange.namedRange.namedRangeId);
      // Mirrors Sheets batch validation: reject every operation if any request is invalid.
      if(new Set(ids).size!==ids.length||ids.some(id=>state.claims.has(id)))throw new Error('Named range ID already exists');
      const append=requests.find(r=>r.appendCells);
      assert.equal(append.appendCells.fields,'userEnteredValue');
      const row=append.appendCells.rows[0].values.map(c=>c.userEnteredValue.numberValue??c.userEnteredValue.stringValue);
      ids.forEach(id=>state.claims.add(id));
      state.credits.push({value:Object.fromEntries(api.CREDIT_HEADERS.map((h,i)=>[h,String(row[i]??'')]))});state.commits++;
      if(state.failAfter){state.failAfter=false;throw new Error('Response lost after commit');}
    }};
}
function issue(db,count=6,extra={}){return rewards.issueMilestones({customerKey:'customer-a',legacyKey:'legacy-a',uniqueDishCount:count,
  order:{orderId:'PRPD-ORDER-ONE',batch:16,customerName:'Test'},now,today,...db,...extra});}
function qualified(name,overrides={}){return {'Order ID':'PRPD-ORDER-ONE','Reward Customer Key':'customer-a','Canonical Dish ID':rewards.canonicalDishId(name),'Qualified At':now,...overrides};}

test('only distinct recipes count across batch IDs, quantities and Lean/Bulk portions',()=>{
  assert.equal(rewards.canonicalDishId('Butter Chicken'),rewards.canonicalDishId('BUTTER CHICKEN (Bulk)'));
  const meals=rewards.uniqueMeals([{id:'m2',name:'Butter Chicken',tier:'lean',quantity:3},{id:'m9',name:'Butter Chicken',tier:'bulk',quantity:2}]);
  assert.equal(meals.length,1);assert.equal(meals[0].quantity,5);assert.deepEqual(meals[0].portions,['lean','bulk']);
  assert.deepEqual(rewards.uniqueMeals(meals)[0].portions,['lean','bulk']);
  assert.notEqual(rewards.canonicalDishId('Butter Chicken'),rewards.canonicalDishId('Loaded Buffalo Chicken Potato'));
  const rows=indexed([qualified('Butter Chicken'),qualified('BUTTER CHICKEN (Bulk)',{'Order ID':'PRPD-B17-DIFFERENT'}),qualified('Loaded Buffalo Chicken Potato')]);
  assert.equal(rewards.progress(rows,'customer-a').uniqueDishCount,2);
});
test('draft, demo and other-customer records cannot inflate lifetime progress',()=>{
  const rows=indexed([qualified('One'),qualified('Two',{'Qualified At':''}),qualified('Three',{'Order ID':'SAMPLE-ORDER-001'}),qualified('Four',{'Reward Customer Key':'someone-else'})]);
  assert.equal(rewards.progress(rows,'customer-a').uniqueDishCount,1);
  assert.equal(rewards.progress(rows,null).identityReview,true);
});
test('server contact identity survives email changes and ignores name-only identities',()=>{
  const secret='test-secret-that-is-long-enough';
  assert.equal(rewards.customerIdentity(secret,{Phone:'+1 (469) 555-0100',Email:'old@example.com'}),rewards.customerIdentity(secret,{Phone:'4695550100',Email:'new@example.com'}));
  assert.equal(rewards.customerIdentity(secret,{Name:'Same Name','Order ID':'PRPD-ORDER-ONE'}),null);
  assert.notEqual(rewards.customerIdentity(secret,{'Customer ID':'person-a',Phone:'4695550100'}),rewards.customerIdentity(secret,{'Customer ID':'person-b',Phone:'4695550100'}));
});
test('5 distinct dishes earn nothing; 6 and 12 award one $5 block each',async()=>{
  const db=store();assert.equal((await issue(db,5)).amount,0);assert.equal(db.state.credits.length,0);
  const sixth=await issue(db,6);assert.equal(sixth.amount,5);assert.equal(db.state.credits.length,1);
  const twelfth=await issue(db,12);assert.equal(twelfth.amount,5);assert.equal(db.state.credits.length,2);
  assert.equal(db.state.credits[0].value['Expires At'],'2027-01-24');
});
test('repeat finalization and concurrent retries cannot issue a milestone twice',async()=>{
  const db=store();await Promise.all([issue(db),issue(db),issue(db)]);assert.equal(db.state.commits,1);
  await issue(db);assert.equal(db.state.credits.length,1);
});
test('lost response after atomic commit reconciles without issuing a second credit',async()=>{
  const db=store();db.state.failAfter=true;const result=await issue(db);
  assert.equal(db.state.credits.length,1);assert.deepEqual(result.alreadyRecorded,[6]);
  await issue(db);assert.equal(db.state.commits,1);
});
test('failure before commit is retryable and creates no claim or credit',async()=>{
  const db=store();db.state.failBefore=true;await assert.rejects(issue(db),/before commit/);
  assert.equal(db.state.credits.length,0);assert.equal(db.state.claims.size,0);
  assert.equal((await issue(db)).amount,5);
});
test('concurrent customer issuance serializes wallet capacity and preserves existing credits',async()=>{
  const old=Array.from({length:5},(_,i)=>({'Order ID':`OLD-${i}`,'Customer Key':'legacy-a',Status:'active','Face Value':'5','Expires At':'2099-01-01'}));
  const db=store(old);const original=structuredClone(db.state.credits);
  await Promise.all([issue(db,6),issue(db,12)]);
  assert.equal(rewards.activeBalance(db.state.credits,today),30);assert.equal(db.state.credits.length,7);
  assert.equal(db.state.credits.filter(r=>r.value.Status==='queued').length,1);
  assert.deepEqual(db.state.credits.slice(0,5),original);
});
test('a rejected atomic payload does not leave its sequence claim behind',async()=>{
  const db=store();const payload=rewards.issuanceRequests({customerKey:'customer-a',block:1,sequence:1,sheetId:12,row:[]});
  db.state.claims.add(payload.milestone);
  await assert.rejects(db.commit(payload.requests),/already exists/);
  assert.equal(db.state.claims.has(payload.version),false);assert.equal(db.state.credits.length,0);
  assert.deepEqual(payload.requests.map(r=>Object.keys(r)[0]),['addNamedRange','addNamedRange','appendCells']);
});
test('contactless orders remain saved without creating reward money',async()=>{
  const db=store();const result=await issue(db,12,{customerKey:null});
  assert.equal(result.status,'identity-review');assert.equal(db.state.commits,0);
});

function sheetsFake(){
  const tables={
    'Feedback Tokens':[api.TOKEN_HEADERS], 'Meal Feedback':[api.MEAL_HEADERS], 'Feedback Credits':[api.CREDIT_HEADERS],
    Orders:[['Order ID','Phone','Email','First Name','Last Name']],
  };const claims=new Set();
  const client={tables,claims,async request({url,method='GET',data}){
    const u=new URL(url);const decoded=decodeURIComponent(u.pathname);
    if(decoded.includes('/values/')){
      const range=decoded.split('/values/')[1].replace(/:append$/,'');const m=/^'([^']+)'!A(\d+):?/.exec(range);assert(m,range);
      const title=m[1],row=Number(m[2])-1;assert(tables[title],title);
      if(method==='GET')return {data:{values:structuredClone(tables[title])}};
      if(method==='PUT'){for(let i=0;i<data.values.length;i++)tables[title][row+i]=data.values[i];return {data:{}};}
      if(method==='POST'){tables[title].push(...data.values);return {data:{}};}
    }
    if(method==='GET')return {data:{sheets:[{properties:{sheetId:12,title:'Feedback Credits'}}],namedRanges:[...claims].map(namedRangeId=>({namedRangeId}))}};
    if(decoded.endsWith(':batchUpdate')){
      const ids=data.requests.filter(r=>r.addNamedRange).map(r=>r.addNamedRange.namedRange.namedRangeId);
      if(ids.some(id=>claims.has(id)))throw new Error('Named range ID already exists');
      const rows=data.requests.find(r=>r.appendCells)?.appendCells.rows||[];
      ids.forEach(id=>claims.add(id));for(const row of rows)tables['Feedback Credits'].push(row.values.map(c=>c.userEnteredValue.numberValue??c.userEnteredValue.stringValue));return {data:{}};
    }
    throw new Error(`Unexpected fake request ${method} ${decoded}`);
  }};return client;
}
function addToken(client,{orderId='PRPD-B16-ORDERONE',names=['One','Two','Three','Four','Five','Six'],phone='4695550100',date='2026-10-24',expires='2099-01-01'}={}){
  const token=core.stableToken(process.env.PRPD_FEEDBACK_TOKEN_SECRET,orderId,16);
  const meals=names.map((name,i)=>({id:`m${i}`,name,tier:'lean',quantity:1}));
  client.tables['Feedback Tokens'].push([now,core.tokenHash(token),orderId,16,'B16','legacy-a','Test','Test Customer',date,expires,'active',JSON.stringify(meals),'']);
  client.tables.Orders.push([orderId,phone,'server@example.com','Test','Customer']);
  return {token,meals};
}
function submission(order,finalize=true){return {action:'save',token:order.token,finalize,meals:order.meals.map(m=>({id:m.id,tier:m.tier,score:1,liked:'This needs improvement',change:'Please improve the texture'}))};}
test('full service awards all honest scores including1, from server Orders identity, once',async()=>{
  const client=sheetsFake(),order=addToken(client);
  const raw={...submission(order),customerKey:'forged-customer',customerId:'forged-id',email:'forged@example.com'};
  const result=await api.saveFeedback(client,raw);assert.equal(result.body.credit.amount,5);assert.equal(result.body.rewardProgress.uniqueDishCount,6);
  const expected=rewards.customerIdentity(process.env.PRPD_FEEDBACK_TOKEN_SECRET,{'Phone':'4695550100',Email:'server@example.com'});
  assert.equal(client.tables['Feedback Credits'][1][12],expected);
  await api.saveFeedback(client,raw);assert.equal(client.tables['Feedback Credits'].length,2);
});
test('another delivery of the same dishes with changed IDs and Bulk portions earns no extra block',async()=>{
  const client=sheetsFake(),first=addToken(client);await api.saveFeedback(client,submission(first));
  const next=addToken(client,{orderId:'PRPD-B17-ORDERTWO'});next.meals=next.meals.map((m,i)=>({...m,id:`changed${i}`,tier:'bulk'}));
  client.tables['Feedback Tokens'][2][11]=JSON.stringify(next.meals);
  const result=await api.saveFeedback(client,submission(next));assert.equal(result.body.rewardProgress.uniqueDishCount,6);
  assert.equal(result.body.credit.amount,0);assert.equal(client.tables['Feedback Credits'].length,2);
});
test('incomplete individual reviews do not qualify, and edits preserve previously qualified progress',async()=>{
  const client=sheetsFake(),order=addToken(client);const partial=submission(order,false);partial.meals.forEach(m=>{m.liked='Short';});await api.saveFeedback(client,partial);
  assert.equal(client.tables['Feedback Credits'].length,1);
  const completed=await api.saveFeedback(client,submission(order,false));assert.equal(completed.body.rewardProgress.uniqueDishCount,6);assert.equal(completed.body.credit.amount,5);
  const edit=submission(order,false);edit.meals[0].liked='';
  const saved=await api.saveFeedback(client,edit);assert.equal(saved.body.rewardProgress.uniqueDishCount,6);
});
test('missing server contacts hold rewards; expiry and delivery-date token gates still apply',async()=>{
  const client=sheetsFake(),order=addToken(client,{phone:''});client.tables.Orders[1][2]='';
  const result=await api.saveFeedback(client,submission(order));assert.equal(result.body.saved,true);assert.equal(result.body.credit.status,'identity-review');assert.equal(client.tables['Feedback Credits'].length,1);
  const future=addToken(client,{orderId:'PRPD-FUTURE-ORDER',date:'2098-01-01'});assert.equal((await api.saveFeedback(client,submission(future))).status,425);
  const expired=addToken(client,{orderId:'PRPD-EXPIRED-ORDER',expires:'2020-01-01'});assert.equal((await api.saveFeedback(client,submission(expired))).status,410);
  assert.equal((await api.saveFeedback(client,{...submission(order),token:'A'.repeat(43)})).status,404);
});
test('provisioning collapses Lean/Bulk into one review and public portion label preserves both',()=>{
  const plan=core.normalizeProvision({action:'provision',batch:16,batchId:'B16',deliveryDate:'2026-10-24',orders:[{orderId:'PRPD-ORDER-ONE',customerName:'Test',meals:[{id:'m1',name:'Butter Chicken',tier:'lean',quantity:2},{id:'m2',name:'Butter Chicken',tier:'bulk',quantity:3}]}]});
  assert.equal(plan.orders[0].meals.length,1);const order=api.publicOrder({value:{'Meals JSON':JSON.stringify(plan.orders[0].meals)}},[]);
  assert.equal(order.meals[0].quantity,5);assert.equal(order.meals[0].portionLabel,'LEAN + BULK');
});
test('frontend states do not promise $5 for every delivery or unlock before the server confirms',()=>{
  const source=fs.readFileSync(path.join(__dirname,'../feedback.js'),'utf8');const html=fs.readFileSync(path.join(__dirname,'../feedback.html'),'utf8');
  assert.doesNotMatch(source,/credit unlocked|to earn \$5/);assert.doesNotMatch(html,/One credit per delivered order/);
  assert.match(html,/every 6 different dishes/);assert.match(html,/Any 1–10 score/);
  const nodes=Object.fromEntries(['successTitle','successCopy','creditDetail','success','doneButton'].map(k=>[k,{classList:{add(){}},focus(){},scrollIntoView(){}}]));
  const a=source.indexOf('  function showCompletion('),b=source.indexOf("\n  $('overallNote').addEventListener",a);
  const context=vm.createContext({$:id=>nodes[id],rewardProgress:{uniqueDishCount:5,remaining:1,identityReview:false}});
  vm.runInContext(source.slice(a,b)+'\nthis.show=showCompletion;',context);
  context.show({credit:{earned:false,amount:0,status:'no-new-milestone'}});assert.equal(nodes.successTitle.textContent,'Your feedback is saved.');assert.match(nodes.creditDetail.textContent,/1 more/);
  context.show({credit:{earned:true,amount:10,status:'queued'}});assert.match(nodes.successTitle.textContent,/\$10/);assert.match(nodes.creditDetail.textContent,/\$30.*queued/);
  context.show({credit:{earned:false,status:'pending'}});assert.equal(nodes.doneButton.disabled,false);assert.equal(nodes.doneButton.textContent,'Retry reward processing');
});

test('legacy wallets across verified server contact changes remain capped together',async()=>{
  const client=sheetsFake(),order=addToken(client);
  const oldOrder={email:'old@example.com',phone:'4695550100',customerName:'Test Customer',orderId:'PRPD-OLD-ORDER'};
  const oldKey=core.customerKey(process.env.PRPD_FEEDBACK_TOKEN_SECRET,oldOrder);
  client.tables.Orders.push([oldOrder.orderId,oldOrder.phone,oldOrder.email,'Test','Customer']);
  const legacy=Array.from({length:6},(_,i)=>[now,`LEGACY-${i}`,15,'Test',oldKey,5,'2099-01-01','active','','']);
  client.tables['Feedback Credits'].push(...structuredClone(legacy));
  const result=await api.saveFeedback(client,submission(order));
  assert.equal(result.body.credit.amount,5);assert.equal(result.body.credit.status,'queued');
  assert.deepEqual(client.tables['Feedback Credits'].slice(1,7),legacy);
});


test('a different customer earns their own sixth-dish milestone',async()=>{
  const db=store();await issue(db);await issue(db,6,{customerKey:'customer-b',legacyKey:'legacy-b'});
  assert.equal(db.state.credits.length,2);assert.notEqual(db.state.credits[0].value['Reward Key'],db.state.credits[1].value['Reward Key']);
});
test('client identity fields cannot qualify an order missing from the server Orders table',async()=>{
  const client=sheetsFake(),order=addToken(client);client.tables.Orders.splice(1);
  const result=await api.saveFeedback(client,{...submission(order),phone:'4695550100',email:'pretend@example.com',customerId:'pretend-id'});
  assert.equal(result.body.saved,true);assert.equal(result.body.credit.status,'identity-review');assert.equal(client.tables['Feedback Credits'].length,1);
});


test('six complete dishes out of ten earn during autosave without order finalization',async()=>{
  const client=sheetsFake(),order=addToken(client,{names:Array.from({length:10},(_,i)=>`Different dish ${i+1}`)});
  const raw=submission(order,false);raw.meals=raw.meals.slice(0,8);
  raw.meals[6].liked='';raw.meals[7].liked='Short';
  const result=await api.saveFeedback(client,raw);
  assert.equal(result.body.finalized,false);assert.equal(result.body.rewardProgress.uniqueDishCount,6);assert.equal(result.body.credit.amount,5);
  assert.equal(client.tables['Meal Feedback'].length,9);assert.equal(client.tables['Feedback Credits'].length,2);
  assert.equal(client.tables['Meal Feedback'].filter(row=>row[16]).length,7); // header plus six qualified dishes
  const repeat=await api.saveFeedback(client,raw);assert.equal(repeat.body.credit.amount,0);assert.equal(client.tables['Feedback Credits'].length,2);
});
test('optional order note and testimonial preferences save with zero dish reviews',async()=>{
  const client=sheetsFake(),order=addToken(client);
  const result=await api.saveFeedback(client,{action:'save',token:order.token,meals:[],finalize:true,overallNote:'Please use less packaging',testimonialConsent:true,testimonialDisplay:'anonymous'});
  assert.equal(result.body.finalized,true);assert.equal(result.body.credit.amount,0);assert.equal(client.tables['Meal Feedback'].length,1);
  const loaded=await api.getFeedback(client,order.token);
  assert.equal(loaded.body.order.overallNote,'Please use less packaging');assert.equal(loaded.body.order.testimonialConsent,true);assert.equal(loaded.body.order.testimonialDisplay,'anonymous');
});
test('autosave response displays server-confirmed credit inline before the order is finished',async()=>{
  const source=fs.readFileSync(path.join(__dirname,'../feedback.js'),'utf8');
  const nodes=Object.fromEntries(['saveStatus','rewardHeadline','lifetimeProgress','rewardNotice','uniqueDishTotal','nextMilestone','lifetimeMeter'].map(id=>[id,{textContent:'',children:Array.from({length:6},()=>({classList:{toggle(){}},setAttribute(){}})),setAttribute(){},classList:{remove(){},add(){},toggle(){}}}]));
  const response={finalized:false,credit:{earned:true,amount:5,status:'active'},rewardProgress:{uniqueDishCount:6,remaining:6,identityReview:false}};
  const context=vm.createContext({$:id=>nodes[id],saving:false,queuedSave:false,rewardProgress:{},payload:()=>({finalize:false}),
    fetch:async()=>({ok:true,json:async()=>response})});
  const helperStart=source.indexOf('  function applySavedResult('),helperEnd=source.indexOf('  function showCompletion(',helperStart);
  const saveStart=source.indexOf('  async function save('),saveEnd=source.indexOf('  function scheduleSave(',saveStart);
  vm.runInContext(source.slice(helperStart,helperEnd)+source.slice(saveStart,saveEnd)+'\nthis.save=save;',context);
  await context.save(false);
  assert.match(nodes.rewardNotice.textContent,/\$5 credit earned and recorded/);assert.match(nodes.lifetimeProgress.textContent,/6 different dishes/);
});
test('six-of-ten screen lets a customer save without completing the other dishes',()=>{
  const source=fs.readFileSync(path.join(__dirname,'../feedback.js'),'utf8');
  const meals=Array.from({length:10},(_,i)=>({id:`m${i}`,tier:'lean'}));const state=Object.fromEntries(meals.slice(0,6).map(m=>[`${m.id}:lean`,{score:1,liked:'Needs improvement'}]));
  const nodes=Object.fromEntries(['progressText','scoreText','progressFill','rewardText','doneButton','consentCard'].map(id=>[id,{style:{},classList:{toggle(){}},disabled:true}]));
  const context=vm.createContext({$:id=>nodes[id],meals,state,mealKey:m=>`${m.id}:${m.tier}`,isMealComplete:m=>Boolean(state[`${m.id}:${m.tier}`]?.liked),writtenCommentExists:()=>true,document:{querySelectorAll:()=>[]}});
  const start=source.indexOf('  function refreshProgress('),end=source.indexOf('  function mealCard(',start);
  vm.runInContext(source.slice(start,end)+'\nrefreshProgress();',context);
  assert.equal(nodes.doneButton.disabled,false);assert.equal(nodes.doneButton.textContent,'Save feedback and optional note');assert.match(nodes.rewardText.textContent,/Each completed dish counts on its own/);
});
