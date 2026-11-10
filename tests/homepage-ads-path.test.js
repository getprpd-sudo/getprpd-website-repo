const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const script=fs.readFileSync(require.resolve('../script.js'),'utf8');
const tracking=fs.readFileSync(require.resolve('../funnel-tracking.js'),'utf8');
const start=script.indexOf('function homepageOrderingOpen('),end=script.indexOf('\nrenderWeeklyHomepage();',start);
function homepage(batch){
 const elements=Object.fromEntries(['heroCutoff','weeklyCutoff','weeklyDelivery','homeMenuStatus'].map(key=>[key,{textContent:''}]));
 const link={textContent:'Order This Week',dataset:{}};
 const context={window:{PRPD_ORDER_CONFIG:{batch,menu:{mains:[],breakfasts:[],desserts:[],addons:[]},prices:{}}},document:{getElementById:id=>elements[id] || null,querySelectorAll:()=>[link]}};
 vm.runInNewContext(script.slice(start,end),context);
 return {context,elements,link};
}
test('homepage closes at the actual cutoff even while the old batch remains published',()=>{
 const {context:c,elements,link}=homepage({published:true,cutoffIso:'2026-10-28T18:00:00-05:00',deliveryDate:'Saturday, October 31, 2026',cutoffLabel:'Wednesday at 6 PM'});
 assert.equal(c.homepageOrderingOpen({published:true,cutoffIso:'2026-10-28T18:00:00-05:00'},Date.parse('2026-10-28T22:59:59Z')),true);
 assert.equal(c.homepageOrderingOpen({published:true,cutoffIso:'2026-10-28T18:00:00-05:00'},Date.parse('2026-10-28T23:00:00Z')),false);
 c.renderWeeklyHomepage();
 assert.equal(elements.weeklyDelivery.textContent,'Announced with the next menu');
 assert.equal(elements.homeMenuStatus.textContent,'Recent Menu');
 assert.equal(link.textContent,'Browse Recent Menu');
});
test('unpublished or invalid-cutoff batches cannot advertise open ordering',()=>{
 const {context:c}=homepage({});
 for(const batch of [{published:false,cutoffIso:'2099-01-01'}, {published:true}, {published:true,cutoffIso:'invalid'}])assert.equal(c.homepageOrderingOpen(batch),false);
});
test('an open homepage restores current ordering and delivery information',()=>{
 const {context:c,elements,link}=homepage({published:true,cutoffIso:'2099-01-01T00:00:00Z',deliveryDate:'Upcoming Saturday',cutoffLabel:'Wednesday 6 PM'});
 c.renderWeeklyHomepage();
 assert.equal(elements.weeklyDelivery.textContent,'Upcoming Saturday');
 assert.equal(link.textContent,'Order This Week');
});
test('homepage ad attribution survives navigation to checkout with click ID and ad details',()=>{
 const stored=new Map(),sessionStorage={getItem:key=>stored.get(key)||null,setItem:(key,value)=>stored.set(key,String(value))};
 const url='https://getprpd.com/?utm_source=google&utm_medium=cpc&utm_campaign=homepage_test&gclid=test-fixture-only&matchtype=e&device=m&network=g';
 const w={location:{search:new URL(url).search,href:url,pathname:'/'},sessionStorage,crypto:{getRandomValues:bytes=>bytes.fill(1)},innerWidth:390,fetch:()=>Promise.resolve({ok:true})};
 const d={referrer:'',documentElement:{clientWidth:390},addEventListener:()=>{}};
 vm.runInNewContext(tracking,{window:w,document:d,URLSearchParams});
 for(const [key,value] of Object.entries({utm_campaign:'homepage_test',gclid:'test-fixture-only',matchtype:'e',device:'m',network:'g'}))assert.equal(stored.get(key),value);
 w.location={search:'',href:'https://getprpd.com/order',pathname:'/order'};
 vm.runInNewContext(tracking,{window:w,document:d,URLSearchParams});
 assert.equal(stored.get('gclid'),'test-fixture-only');
 assert.equal(stored.get('matchtype'),'e');
 assert.equal(stored.get('landing_page'),url);
});
