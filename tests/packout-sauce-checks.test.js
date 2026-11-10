const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const crypto=require('node:crypto');
const source=fs.readFileSync(require.resolve('../operations/cook-day-planner.html'),'utf8');
function setup(){
 const fields={};
 const context={state:{cookLog:{fields}},CONFIG:{sauceProgram:{servingGrams:40}},METHODS:{meals:{
  sandwich:{sideCup:{name:'Sweet Heat',gramsPerMeal:40}},
  wings:{sideCup:{name:'Ranch',gramsPerMeal:40}},
 }},packoutPrefix:key=>`pack:${key}`,hashText:value=>crypto.createHash('sha256').update(value).digest('hex'),esc:value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;')};
 const names=['fieldChecked','packoutCardComplete','bagSaladCount','bagSaladReady','requiredBagSauces','bagSauceRows','bagSauceCheckKey','bagSaucesReady','bagSauceChecklist'];
 for(const name of names){const start=source.indexOf(`    function ${name}(`),end=source.indexOf('\n    function ',start+1);assert.ok(start>=0);vm.runInNewContext(source.slice(start,end),context);}
 return {context,fields};
}
test('selected cup quantities stay per order and are not multiplied by meal counts',()=>{
 const {context:c}=setup();const order={items:[{id:'meal',qty:22}],sauces:{selections:[{name:'Sweet Heat',qty:1},{name:'Garlic Herb Yogurt',qty:2}]}};
 assert.equal(c.bagSauceRows(order).reduce((sum,row)=>sum+row.cups,0),3);
 assert.match(c.bagSauceChecklist(order,'pack:one'),/3 loose cups to add/);
 assert.match(c.bagSauceChecklist(order,'pack:one'),/Customer selected/);
});
test('recipe cups and selected extras both remain in the physical bag target',()=>{
 const {context:c}=setup();const rows=c.bagSauceRows({items:[{id:'sandwich',qty:2},{id:'wings',qty:1}],sauces:[{name:'Sweet Heat',qty:3}]});
 assert.equal(rows.reduce((sum,row)=>sum+row.cups,0),6);
 assert.equal(rows.filter(row=>row.name==='Sweet Heat').length,2);
});
test('packed flag alone cannot complete a bag until every cup row is verified',()=>{
 const {context:c,fields}=setup();const order={key:'one',items:[],sauces:[{name:'A',qty:1},{name:'B',qty:2}]};
 fields['pack:one:packed']='1';assert.equal(c.packoutCardComplete(order),false);
 for(const row of c.bagSauceRows(order))fields[c.bagSauceCheckKey('pack:one',row)]='1';
 assert.equal(c.packoutCardComplete(order),true);
});
test('changed required quantity creates a fresh cup confirmation',()=>{
 const {context:c,fields}=setup();const order={key:'one',items:[{id:'wings',qty:1}]};
 const row=c.bagSauceRows(order)[0];fields[c.bagSauceCheckKey('pack:one',row)]='1';
 assert.equal(c.bagSaucesReady(order,'pack:one'),true);
 order.items[0].qty=2;assert.equal(c.bagSaucesReady(order,'pack:one'),false);
});
test('bags without loose cups need no invented sauce check',()=>{
 const {context:c,fields}=setup();const order={key:'one',items:[],sauces:[]};
 fields['pack:one:packed']='1';assert.equal(c.packoutCardComplete(order),true);
 assert.match(c.bagSauceChecklist(order,'pack:one'),/No loose cups/);
});
test('guided customer ticket uses the same persistent cup checklist',()=>{
 const start=source.indexOf('    function cookModeSinglePackout('),end=source.indexOf('\n    function ',start+1);
 assert.match(source.slice(start,end),/bagSauceChecklist\(order,packoutPrefix\(CORE.orderKey\(order\)\)\)/);
 assert.match(source,/button\.disabled=!complete && !ready/);
 assert.match(source,/if\(state.cookLog.fields\[key\]!=='1' && \(!order \|\| !bagSaucesReady/);
});
