'use strict';

const crypto = require('node:crypto');
const POLICY = Object.freeze({ program:'unique-dishes-v1', every:6, amount:5, expiryDays:90, walletCap:30 });

function hash(value) { return crypto.createHash('sha256').update(String(value)).digest('hex').slice(0,40); }
function normalizedDishName(name) {
  return String(name || '').normalize('NFKC').toLowerCase()
    .replace(/\s*\((?:lean|bulk|single)\)\s*$/i,'')
    .replace(/^(?:lean|bulk|single)\s*[:·-]\s*/i,'')
    .replace(/&/g,' and ').replace(/[’']/g,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim().replace(/\s+/g,' ');
}
function canonicalDishId(name) {
  const normalized = normalizedDishName(name);
  return normalized ? `dish_${hash(normalized)}` : '';
}
function uniqueMeals(meals) {
  const dishes = new Map();
  for (const meal of meals || []) {
    const canonicalId = canonicalDishId(meal.name);
    if (!canonicalId) continue;
    const prior = dishes.get(canonicalId);
    if (prior) {
      prior.quantity += Number(meal.quantity) || 0;
      prior.portions = [...new Set([...prior.portions, ...(meal.portions || [meal.tier])])];
    } else dishes.set(canonicalId, { ...meal, canonicalDishId:canonicalId, portions:meal.portions || [meal.tier] });
  }
  return [...dishes.values()];
}
// The caller supplies a matching server-read Orders row, never request form data.
function customerIdentity(secret, serverOrder) {
  if (!serverOrder) return null;
  if (!secret || String(secret).length < 24) throw new Error('Feedback reward identity secret is not configured.');
  const customerId = String(serverOrder['Customer ID'] || '').trim();
  let phone = String(serverOrder.Phone || '').replace(/\D/g,'');
  if (phone.length === 11 && phone.startsWith('1')) phone = phone.slice(1);
  const email = String(serverOrder.Email || '').trim().toLowerCase();
  const identity = customerId ? `customer:${customerId}` : /^\d{10}$/.test(phone) ? `phone:${phone}`
    : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? `email:${email}` : '';
  if (!identity) return null;
  return crypto.createHmac('sha256',String(secret)).update(`prpd-reward-customer-v1|${identity}`).digest('hex').slice(0,32);
}
function valueOf(row) { return row.value || row; }
function qualifiedDishIds(rows, customerKey) {
  return new Set((rows || []).map(valueOf).filter(row => customerKey && row['Reward Customer Key'] === customerKey
    && /^dish_[a-f0-9]{40}$/.test(row['Canonical Dish ID'] || '')
    && !Number.isNaN(Date.parse(row['Qualified At'] || ''))
    && !/^SAMPLE-/i.test(row['Order ID'] || '')).map(row => row['Canonical Dish ID']));
}
function progress(rows, customerKey) {
  const count = qualifiedDishIds(rows,customerKey).size;
  const nextMilestone = (Math.floor(count/POLICY.every)+1)*POLICY.every;
  return { uniqueDishCount:count, every:POLICY.every, amount:POLICY.amount, nextMilestone,
    remaining:nextMilestone-count, identityReview:!customerKey };
}
function ownedCredits(rows, customerKey, legacyKeys) {
  const keys = new Set(Array.isArray(legacyKeys) ? legacyKeys : [legacyKeys].filter(Boolean));
  return rows.filter(row => { const v=valueOf(row); return v['Reward Customer Key'] === customerKey
    || keys.has(v['Customer Key']); });
}
function activeBalance(rows, today) {
  return rows.map(valueOf).filter(v => v.Status === 'active' && v['Expires At'] >= today)
    .reduce((sum,v) => sum + (Number(v['Face Value']) || 0),0);
}
function rewardKey(customerKey, block) { return `reward_${hash(`${POLICY.program}|${customerKey}|${block}`)}`; }
function claim(id,sheetId) {
  return { addNamedRange:{ namedRange:{ namedRangeId:id,name:`PRPD_${id}`,
    range:{sheetId,startRowIndex:0,endRowIndex:1,startColumnIndex:0,endColumnIndex:1} } } };
}
function issuanceRequests({ customerKey, block, sequence, sheetId, row }) {
  const milestone = rewardKey(customerKey,block);
  const version = `sequence_${hash(`${customerKey}|${sequence}`)}`;
  return { milestone,version,requests:[claim(version,sheetId),claim(milestone,sheetId),{
    appendCells:{sheetId,rows:[{values:row.map(value => ({userEnteredValue:typeof value === 'number'
      ? {numberValue:value} : {stringValue:String(value ?? '')}}))}],fields:'userEnteredValue'},
  }] };
}
async function issueMilestones({ customerKey,legacyKey,legacyKeys,uniqueDishCount,order,now,today,readState,commit }) {
  if (!customerKey) return { earned:false,amount:0,status:'identity-review',milestones:[] };
  const issued=[]; const recorded=[];
  const expires = new Date(now); expires.setUTCDate(expires.getUTCDate()+POLICY.expiryDays);
  for (let block=1;block<=Math.floor(uniqueDishCount/POLICY.every);block++) {
    let complete=false;
    for (let attempt=0;attempt<5 && !complete;attempt++) {
      const state=await readState();
      const key=rewardKey(customerKey,block);
      const prior=state.credits.find(row => valueOf(row)['Reward Key'] === key);
      if (prior) { recorded.push(block*POLICY.every);complete=true;break; }
      const owned=ownedCredits(state.credits,customerKey,legacyKeys || legacyKey);
      const status=activeBalance(owned,today)+POLICY.amount>POLICY.walletCap?'queued':'active';
      const row=[now,order.orderId,order.batch,order.customerName,legacyKey,POLICY.amount,
        expires.toISOString().slice(0,10),status,'','',key,block*POLICY.every,customerKey];
      const batch=issuanceRequests({customerKey,block,sequence:state.credits.filter(row=>valueOf(row)['Reward Customer Key']===customerKey).length+1,sheetId:state.sheetId,row});
      try {
        await commit(batch.requests);
        issued.push({threshold:block*POLICY.every,amount:POLICY.amount,status});complete=true;
      } catch (error) {
        const current=await readState();
        if (current.credits.some(row => valueOf(row)['Reward Key'] === key)) {
          recorded.push(block*POLICY.every);complete=true;
        } else if (!current.claimIds.has(batch.version)) throw error;
      }
    }
    if (!complete) throw new Error('Reward issuance is busy. Please retry.');
  }
  return { earned:issued.length>0,amount:issued.length*POLICY.amount,
    status:issued.some(item=>item.status==='queued')?'queued':issued.length?'active':'no-new-milestone',
    milestones:issued,alreadyRecorded:recorded };
}
module.exports={POLICY,canonicalDishId,uniqueMeals,customerIdentity,qualifiedDishIds,progress,
  ownedCredits,activeBalance,rewardKey,issuanceRequests,issueMilestones};
