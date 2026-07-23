const assert = require('node:assert/strict');
const test = require('node:test');
const Core = require('../api/_business-center-core');
const Store = require('../operations/business-center-store');

function samplePayload() {
  const orderHeader = Core.ORDER_HEADERS;
  const order = ['7/22/2026','Batch 3','Saturday','Rida','Customer','4695550100','2x Hot Honey Chicken Sliders (Lean) - $21.98\n1x Cookie Dough Cup - $6.99',28.97,29,'','ORDER-1','rida@example.com','','Frisco','75035','',28.97,0,'GYM10',2.90,'North Frisco Athletics','Yes','tiktok','paid','batch3','','','',''];
  const shifted = ['', '', ...['7/22/2026','Batch 3','Saturday','Jake','Miller','4695550101','1x Premium NY Strip Steak (Bulk) - $26.99',26.99,27,'','ORDER-2']];
  const paymentHeader = Core.PAYMENT_HEADERS;
  const payment = ['Batch 3','Saturday','7/22','Rida Customer','Lean',2,0,1,29,29,0,'Zelle','','ORDER-1','GYM10','North Frisco Athletics'];
  const leadHeader = Core.LEAD_HEADERS;
  const lead = ['7/20','Website Form','Rida Customer','4695550100','Frisco','Gym','','Build Muscle','','','','','tiktok','paid','batch3','','','','','LEAD-1'];
  const receivable = ['Talal account','Batch 1 + Batch 2 + Batch 3',1190,0,1190,'Payment requested','7/22/2026','Do not double-count'];
  return { orders:[orderHeader,order,shifted], payments:[paymentHeader,payment], leads:[leadHeader,lead], receivables:[Core.RECEIVABLE_HEADERS,receivable], fetchedAt:'2026-07-22T12:00:00Z' };
}

test('business center normalizes shifted orders and calculates known direct cost', () => {
  const model = Core.summarize(samplePayload(), { expenses:[], adImports:[] });
  assert.equal(model.orders.length, 2);
  assert.equal(model.orders[1]['First Name'], 'Jake');
  assert.equal(model.orders[0].directCost, 8.98);
  assert.equal(model.orders[1].directCost, 9.51);
  assert.deepEqual(model.orders[0].unknownCostItems, []);
});

test('batch list includes payment-only history and consolidated receivables stay separate', () => {
  const payload = samplePayload();
  payload.payments.push(['Batch 1','Saturday','','Historical Client','Lean',1,0,0,11,11,0,'Zelle','','OLD-1','','']);
  const model = Core.summarize(payload, { expenses:[], adImports:[] });
  assert.deepEqual(model.batchIds, [3, 1]);
  assert.equal(Core.receivableRows(model)[0].balance, 1190);
  assert.equal(Core.financials(model).booked, 56);
});

test('finance summary separates booked, collected, direct cost, and additional expenses', () => {
  const model = Core.summarize(samplePayload(), { expenses:[{ amount:5, batch:'Batch 3' }], adImports:[{ spend:20 }] });
  const result = Core.financials(Core.filterBatch(model, 3));
  assert.equal(result.booked, 56);
  assert.equal(result.collected, 29);
  assert.equal(Math.round(result.directCost * 100) / 100, 18.49);
  assert.equal(result.expenses, 5);
  assert.equal(result.adSpend, 20);
  assert.equal(Math.round(result.contribution * 100) / 100, 12.51);
});

test('source and referral summaries use UTM and partner fields', () => {
  const model = Core.summarize(samplePayload(), { expenses:[], adImports:[] });
  const tiktok = Core.sourceRows(model).find(row => row.source === 'tiktok');
  assert.equal(tiktok.leads, 1);
  assert.equal(tiktok.orders, 1);
  const partner = Core.referralRows(model)[0];
  assert.equal(partner.partner, 'North Frisco Athletics');
  assert.equal(partner.code, 'GYM10');
});

test('operator brief prioritizes missing details, balances, and unmatched recent leads', () => {
  const payload = samplePayload();
  payload.leads.push([
    '7/22/2026 10:00 AM', 'Website Form', 'New Lead', '4695550999', 'Prosper', 'TikTok', '',
    'Fat Loss', '', '', '', '', 'tiktok', 'organic', '', '', '', '/order', '', 'LEAD-2',
  ]);
  payload.payments.push(['Batch 3','Saturday','','Jake Miller','Bulk',1,1,0,27,0,27,'','','ORDER-2','','']);
  const model = Core.summarize(payload, { expenses:[], adImports:[] });
  const brief = Core.operatorBrief(model, {
    now: new Date('2026-07-23T14:00:00Z'),
    batchNumber: 3,
    deliveryDate: 'Saturday, July 25, 2026',
    cutoffIso: '2026-07-22T17:00:00-05:00',
    cutoffLabel: 'Wednesday at 5:00 PM CT',
  });
  assert.equal(brief.counts.orders, 2);
  assert.equal(brief.counts.meals, 4);
  assert.equal(brief.counts.recentLeads, 1);
  assert.equal(brief.counts.incompleteOrders, 2);
  assert.equal(brief.money.currentOutstanding, 27);
  assert.equal(brief.money.consolidatedOutstanding, 1190);
  assert.equal(brief.cutoff.state, 'closed');
  assert.match(brief.actions[0].title, /Complete 2 order records/);
  assert.match(brief.actions[1].title, /outstanding balances/);
});

test('TikTok CSV parser handles quoted campaign names and totals', () => {
  const result = Core.importTikTokCsv('Campaign name,Cost,Impressions,Clicks (destination),Conversions,Date\n"DFW, Launch",20.50,10000,125,3,2026-07-20\nRetarget,5,1000,20,1,2026-07-21', 'report.csv');
  assert.equal(result.spend, 25.5);
  assert.equal(result.impressions, 11000);
  assert.equal(result.clicks, 145);
  assert.equal(result.conversions, 4);
  assert.equal(result.campaigns[0].name, 'DFW, Launch');
});

test('business state validation strips unsupported data and validates amounts', () => {
  const result = Store.validateState({
    outreach:{ gym:{ status:'Contacted', owner:'Rida', notes:'Follow up Friday', lastContact:'2026-07-22' } },
    expenses:[{ id:'e1', date:'2026-07-22', batch:'Batch 3', vendor:'Store', category:'Marketing', amount:12.34, notes:'' }],
    adImports:[], ignored:'not persisted',
  });
  assert.equal(result.outreach.gym.status, 'Contacted');
  assert.equal(result.expenses[0].amount, 12.34);
  assert.equal('ignored' in result, false);
  assert.throws(() => Store.validateState({ outreach:{}, expenses:[{ id:'e', date:'2026-07-22', amount:-1 }], adImports:[] }), /amount/i);
});
