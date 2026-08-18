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

function orderRow(overrides = {}) {
  const values = {
    'Submitted At': '7/22/2026',
    Batch: 'Batch 3',
    'Delivery Date': 'Saturday',
    'First Name': 'Valid',
    'Last Name': 'Customer',
    Phone: '4695550100',
    Items: '1x Hot Honey Chicken Sliders (Lean) - $10.99',
    'Exact Total': 10.99,
    'Total (Rounded)': 11,
    'Order ID': 'ORDER-VALID',
    Email: 'valid@example.com',
    'Delivery Address': '123 Main Street',
    City: 'Frisco',
    'ZIP Code': '75035',
    ...overrides,
  };
  return Core.ORDER_HEADERS.map(header => values[header] ?? '');
}

test('business center normalizes shifted orders and calculates known direct cost', () => {
  const model = Core.summarize(samplePayload(), { expenses:[], adImports:[] });
  assert.equal(model.orders.length, 2);
  assert.equal(model.orders[1]['First Name'], 'Jake');
  assert.equal(model.orders[0].directCost, 9.4);
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
  const model = Core.summarize(samplePayload(), { expenses:[{ amount:5, batch:'Batch 3' }], adImports:[{ spend:20, batch:'Batch 3' }] });
  const result = Core.financials(Core.filterBatch(model, 3));
  assert.equal(result.booked, 56);
  assert.equal(result.collected, 29);
  assert.equal(Math.round(result.directCost * 100) / 100, 18.91);
  assert.equal(result.expenses, 5);
  assert.equal(result.operatingExpenses, 5);
  assert.equal(result.cashPurchases, 5);
  assert.equal(result.adSpend, 20);
  assert.equal(Math.round(result.contribution * 100) / 100, 12.09);
  assert.equal(result.cashMovement, 4);
});

test('finance keeps inventory and equipment purchases out of operating contribution', () => {
  const model = Core.summarize(samplePayload(), {
    expenses: [
      { amount:100, batch:'Batch 3', category:'Inventory purchase' },
      { amount:70, batch:'Batch 3', category:'Equipment' },
      { amount:12, batch:'Batch 3', category:'Delivery' },
    ],
    adImports:[],
  });
  const result = Core.financials(Core.filterBatch(model, 3));
  assert.equal(result.cashPurchases, 182);
  assert.equal(result.inventoryPurchases, 100);
  assert.equal(result.equipmentPurchases, 70);
  assert.equal(result.operatingExpenses, 12);
  assert.equal(Math.round(result.contribution * 100) / 100, 25.09);
  assert.equal(result.cashMovement, -153);
});

test('active Batch 4 recipes have mapped costs with the controlled cookie coating included', () => {
  const payload = samplePayload();
  payload.orders = [
    Core.ORDER_HEADERS,
    orderRow({
      Batch:'Batch 4',
      Items:'1x Peri Peri Chicken (Lean) - $10.99\n1x Meatball Arrabbiata Pasta (Bulk) - $15.99\n1x Chocolate-Dipped Cookie Dough Balls (Single) - $6.99',
    }),
  ];
  const model = Core.summarize(payload, { expenses:[], adImports:[] });
  const result = Core.financials(model);
  assert.deepEqual(result.unknownCostItems, []);
  assert.deepEqual(result.provisionalCostItems, []);
  assert.equal(result.directCost, 8.84);
});

test('current menu cost data has exact live-menu and tier parity', () => {
  const config = require('../config/order-config');
  const currentCosts = require('../api/_current-menu-costs-data.json');
  const menu = Object.values(config.menu).flat();
  const expectedKeys = menu.flatMap(item => {
    const name = item.name.trim().toLowerCase();
    return item.bulkMacros ? [`${name}|lean`, `${name}|bulk`] : [`${name}|single`];
  }).sort();
  assert.equal(currentCosts.batchNumber, config.batch.number);
  assert.deepEqual(Object.keys(currentCosts.directCosts).sort(), expectedKeys);

  const items = menu.map(item => item.bulkMacros
    ? `1x ${item.name} (Lean) - $10.99\n1x ${item.name} (Bulk) - $12.99`
    : `1x ${item.name} - $6.99`).join('\n');
  const result = Core.orderCost({ Batch: `Batch ${config.batch.number}`, Items: items });
  assert.deepEqual(result.unknown, []);
  assert.equal(result.lines.length, expectedKeys.length);
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

test('referral ledger earns credit only after the referred order is fully paid', () => {
  const model = Core.summarize(samplePayload(), { expenses:[], adImports:[] });
  const row = Core.referralProgramRows(model, [{
    code:'GYM10', ownerName:'North Frisco Athletics', programType:'Partner',
    referrerCredit:10, creditUsed:4, status:'Active',
  }])[0];
  assert.equal(row.redemptions, 1);
  assert.equal(row.paidReferrals, 1);
  assert.equal(row.earnedCredit, 10);
  assert.equal(row.creditUsed, 4);
  assert.equal(row.availableCredit, 6);
});

test('customer lifecycle groups order history, respects opt-outs, and excludes internal accounts', () => {
  const payload = {
    orders: [
      Core.ORDER_HEADERS,
      orderRow({ Batch:'Batch 5', 'First Name':'Current', Email:'current@example.com', 'Order ID':'CURRENT-5', 'Menu Email Opt-In':'Yes' }),
      orderRow({ Batch:'Batch 4', 'First Name':'Reorder', Email:'reorder@example.com', 'Order ID':'REORDER-4' }),
      orderRow({ Batch:'Batch 2', 'First Name':'Winback', Email:'winback@example.com', 'Order ID':'WINBACK-2' }),
      orderRow({ Batch:'Batch 4', 'First Name':'Opted', 'Last Name':'Out', Email:'opted@example.com', 'Order ID':'OPTED-4', 'Menu Email Opt-In':'No' }),
      orderRow({ Batch:'Batch 5', 'First Name':'Talal', 'Last Name':'Account', Email:'talal@example.com', 'Order ID':'TALAL-5' }),
    ],
    payments:[Core.PAYMENT_HEADERS], leads:[Core.LEAD_HEADERS], receivables:[Core.RECEIVABLE_HEADERS],
  };
  const model = Core.summarize(payload, { expenses:[], adImports:[] });
  const rows = Core.lifecycleRows(model, { currentBatch:5 });

  assert.equal(rows.length, 4);
  assert.equal(rows.find(row => row.email === 'current@example.com').segment, 'Current customer');
  assert.equal(rows.find(row => row.email === 'reorder@example.com').segment, 'Reorder due');
  assert.equal(rows.find(row => row.email === 'winback@example.com').segment, 'Win-back');
  assert.equal(rows.find(row => row.email === 'opted@example.com').segment, 'Do not email');
  assert.equal(rows.find(row => row.email === 'opted@example.com').draftType, '');
  assert.equal(rows.some(row => row.email === 'talal@example.com'), false);
});

test('ad reports are charged only to their assigned batch', () => {
  const payload = samplePayload();
  payload.payments.push(['Batch 1','Saturday','','Historical Client','Lean',1,0,0,11,11,0,'Zelle','','OLD-1','','']);
  const model = Core.summarize(payload, {
    expenses:[],
    adImports:[{ id:'ad-1', spend:25, batch:'Batch 3' }, { id:'ad-2', spend:10, batch:'Batch 1' }],
  });
  assert.equal(Core.financials(Core.filterBatch(model, 3)).adSpend, 25);
  assert.equal(Core.financials(Core.filterBatch(model, 1)).adSpend, 10);
  assert.equal(Core.financials(Core.filterBatch(model, 0)).adSpend, 35);
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
  assert.match(brief.actions[0].title, /Complete or correct 2 order records/);
  assert.match(brief.actions[1].title, /outstanding balances/);
});

test('operator brief validates customer contact fields and exempts internal family accounts only from profile warnings', () => {
  const payload = {
    orders: [
      Core.ORDER_HEADERS,
      orderRow(),
      orderRow({
        'First Name': 'Needs',
        'Last Name': 'Correction',
        Phone: '123',
        Email: 'not-an-email',
        'Delivery Address': 'Frisco',
        City: '75035',
        'ZIP Code': 'Texas',
        'Order ID': 'ORDER-BAD',
      }),
      orderRow({
        'First Name': 'Talal',
        'Last Name': 'Account',
        Phone: '',
        Email: '',
        'Delivery Address': '',
        City: '',
        'ZIP Code': '',
        'Order ID': 'ORDER-TALAL',
      }),
      orderRow({
        'First Name': 'Duaa',
        'Last Name': 'Hassan',
        Phone: '',
        Email: '',
        'Delivery Address': '',
        City: '',
        'ZIP Code': '',
        'Order ID': 'ORDER-DUAA',
      }),
      orderRow({
        'First Name': 'Rida',
        'Last Name': 'Khan',
        Phone: '',
        Email: '',
        'Delivery Address': '',
        City: '',
        'ZIP Code': '',
        'Order ID': 'ORDER-RIDA',
      }),
    ],
    payments: [Core.PAYMENT_HEADERS],
    leads: [Core.LEAD_HEADERS],
    receivables: [Core.RECEIVABLE_HEADERS],
  };
  const model = Core.summarize(payload, { expenses:[], adImports:[] });
  const brief = Core.operatorBrief(model, { now: new Date('2026-07-23T14:00:00Z'), batchNumber: 3 });

  assert.equal(brief.counts.orders, 5);
  assert.equal(brief.counts.meals, 5);
  assert.equal(brief.counts.incompleteOrders, 1);
  assert.equal(brief.incompleteOrders[0].customer, 'Needs Correction');
  assert.deepEqual(brief.incompleteOrders[0].missing, [
    'phone number needs confirmation',
    'valid email',
    'street address',
    'city',
    '5-digit ZIP',
  ]);
  assert.match(brief.actions[0].detail, /Needs Correction/);
  assert.doesNotMatch(brief.actions[0].detail, /Talal|Duaa|Rida/);
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
    adImports:[],
    lifecycle:{ 'customer@example.com':{ status:'Follow up', notes:'Asked for next menu', lastContact:'2026-08-03' } },
    growthSettings:{ googleReviewUrl:'https://g.page/r/example/review' },
    ignored:'not persisted',
  });
  assert.equal(result.outreach.gym.status, 'Contacted');
  assert.equal(result.expenses[0].amount, 12.34);
  assert.equal(result.lifecycle['customer@example.com'].status, 'Follow up');
  assert.equal(result.growthSettings.googleReviewUrl, 'https://g.page/r/example/review');
  assert.equal('ignored' in result, false);
  assert.throws(() => Store.validateState({ outreach:{}, expenses:[{ id:'e', date:'2026-07-22', amount:-1 }], adImports:[] }), /amount/i);
  assert.throws(() => Store.validateState({ outreach:{}, expenses:[], adImports:[], growthSettings:{ googleReviewUrl:'http://example.com' } }), /https/i);
});

test('marketing campaign pack uses the active menu and generates distinct tracked links', () => {
  const config = require('../operations/active/BATCH_7_DRAFT_ORDER_CONFIG');
  const campaign = Core.generateMarketingCampaign(config, { featuredMealId:'m4' });

  assert.equal(campaign.batchNumber, 7);
  assert.equal(campaign.featuredMeal, 'Sweet Chili Chicken with Vegetable Rice');
  assert.equal(campaign.assets.length, 5);
  assert.match(campaign.assets[0].caption, /Sweet Chili Chicken with Vegetable Rice/);
  assert.equal(new Set(campaign.assets.map(asset => asset.trackedUrl)).size, 5);
  campaign.assets.forEach((asset) => {
    const url = new URL(asset.trackedUrl);
    assert.equal(url.origin, 'https://getprpd.com');
    assert.equal(url.pathname, '/order');
    assert.match(url.searchParams.get('utm_campaign'), /^batch-7-/);
    assert.ok(url.searchParams.get('utm_content'));
  });
});

test('marketing summary and recommendations use recorded results without inventing data', () => {
  const config = require('../operations/active/BATCH_7_DRAFT_ORDER_CONFIG');
  const campaign = Core.generateMarketingCampaign(config);
  campaign.assets[0].status = 'Posted';
  campaign.assets[0].metrics = { views:1000, clicks:50, leads:8, paidOrders:3, revenue:180, spend:20 };
  const summary = Core.marketingSummary(campaign);

  assert.equal(summary.posted, 1);
  assert.equal(summary.clickRate, 0.05);
  assert.equal(summary.orderRate, 0.375);
  assert.equal(summary.roas, 9);
  assert.match(Core.marketingRecommendations(campaign)[0], /Weekly menu launch reel/);
});

test('business state persists sanitized marketing workflow and campaign history', () => {
  const config = require('../operations/active/BATCH_7_DRAFT_ORDER_CONFIG');
  const currentCampaign = Core.generateMarketingCampaign(config);
  currentCampaign.assets[0].status = 'Approved';
  currentCampaign.assets[0].notes = 'Use the clean plating shot.';
  const archived = { ...Core.generateMarketingCampaign(config), id:'older-campaign', batchNumber:4 };
  const state = Store.validateState({
    outreach:{ gym:{ status:'Meeting', tasting:'Scheduled', code:'gym10', offer:'Member tasting', nextAction:'2026-08-10' } }, expenses:[], adImports:[], lifecycle:{}, growthSettings:{},
    googleBusiness:{ status:'Verification pending', profileUrl:'https://maps.app.goo.gl/test', verificationMethod:'Video' },
    marketing:{ currentCampaign, history:[archived] },
  });

  assert.equal(state.marketing.currentCampaign.assets[0].status, 'Approved');
  assert.equal(state.marketing.currentCampaign.assets[0].notes, 'Use the clean plating shot.');
  assert.equal(state.marketing.history[0].batchNumber, 4);
  assert.equal(state.outreach.gym.code, 'GYM10');
  assert.equal(state.outreach.gym.tasting, 'Scheduled');
  assert.equal(state.googleBusiness.status, 'Verification pending');
});
