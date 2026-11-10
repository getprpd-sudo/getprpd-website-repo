const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const Core = require('../api/_business-center-core');
const current = require('../api/_current-menu-costs-data.json');
const history = require('../api/_historical-menu-costs-data.json');
const root = path.resolve(__dirname, '..');

test('exact preserved batch snapshot wins over current same-name costs', () => {
  const old = Core.orderCost({ Batch: 'Batch 7', Items: '1x Meatball Arrabbiata Pasta (Lean) - $10.99' });
  const now = Core.orderCost({ Batch: `Batch ${current.batchNumber}`, Items: '1x Meatball Arrabbiata Pasta (Lean) - $10.99' });
  assert.equal(old.amount, history.snapshots['7'].directCosts['meatball arrabbiata pasta|lean']);
  assert.equal(old.amount, 3.88);
  assert.equal(now.amount, current.directCosts['meatball arrabbiata pasta|lean']);
  assert.notEqual(old.amount, now.amount);
  assert.equal(old.lines[0].costBasis, 'preserved batch planning snapshot');
  assert.deepEqual(old.provisional, ['Meatball Arrabbiata Pasta']);
});

test('unavailable historical batch never borrows an identically named current or legacy rate', () => {
  const result = Core.orderCost({ Batch: 'Batch 12', Items: '1x Chicken Biryani (Lean) - $10.99' });
  assert.equal(result.amount, null);
  assert.equal(result.lines[0].cost, null);
  assert.equal(result.complete, false);
  assert.equal(result.lines[0].costBasis, 'batch cost snapshot unavailable');
});

test('a supplied preserved bundle snapshot is used verbatim, never recomputed', () => {
  // Synthetic fixture only. This does not invent a production Batch12 record.
  const context = vm.createContext({
    PRPDCurrentMenuCosts: { batchNumber: 99, directCosts: { 'fixture bundle|split': 999 } },
    PRPDHistoricalMenuCosts: { snapshots: { '98': { batchNumber: 98, directCosts: { 'fixture bundle|split': 12.34 } } } },
  });
  vm.runInContext(fs.readFileSync(path.join(root, 'api/_business-center-core.js'), 'utf8'), context);
  const result = context.PRPDBusinessCore.orderCost({ Batch:'Batch 98', Items:'2x Fixture Bundle (Split) - $40' });
  assert.equal(result.amount, 24.68);
  assert.equal(result.complete, true);
  assert.equal(result.provisional.length, 1);
});

test('missing costs withhold total cost and contribution but preserve cash accounting', () => {
  const fields = { Batch:'Batch 12', 'First Name':'Test', 'Order ID':'HISTORY-TEST', 'Total (Rounded)':50, Items:'1x Unavailable historical dish (Lean) - $50' };
  const payload = {
    orders:[Core.ORDER_HEADERS, Core.ORDER_HEADERS.map(h => fields[h] || '')],
    payments:[Core.PAYMENT_HEADERS, ['Batch 12','','','Test','Lean',1,0,0,50,50,0,'Zelle','','HISTORY-TEST']],
  };
  const model = Core.summarize(payload, { expenses:[{ batch:'Batch 12', category:'Inventory purchase', amount:10 }], adImports:[] });
  const totals = Core.financials(model);
  assert.equal(totals.booked, 50);
  assert.equal(totals.collected, 50);
  assert.equal(totals.cashMovement, 40);
  assert.equal(totals.costComplete, false);
  for (const key of ['directCost', 'contribution', 'directCostPct', 'contributionPct']) assert.equal(totals[key], null, key);
  assert.equal(Core.batchRows(model)[0].contribution, null);
});

test('current custom builds use current registry output, not Batch8 constants', () => {
  for (const name of ['High-Protein Beef Kofta & Roasted Vegetables', 'Custom Lebanese-Style Chicken Breast', 'Custom Lebanese-Style Chicken Breast Meal']) {
    const result = Core.orderCost({ Batch:`Batch ${current.batchNumber}`, Items:`1x ${name} (Lean) - $17` });
    assert.equal(result.amount, current.plannerOnlyCosts[`${name.toLowerCase()}|lean`]);
    assert.equal(result.complete, true);
    assert.equal(result.provisional.length, 1);
  }
  assert.notEqual(current.plannerOnlyCosts['high-protein beef kofta & roasted vegetables|lean'], 6.01);
});

test('browser and Node choose identical preserved snapshots', () => {
  const context = vm.createContext({});
  for (const file of ['operations/costing/current-menu-costs.js', 'operations/costing/historical-menu-costs.js', 'api/_business-center-core.js']) {
    vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context);
  }
  for (const batch of [7, 12, 13]) {
    const order = { Batch:`Batch ${batch}`, Items:'1x Chicken Biryani (Lean) - $10.99' };
    assert.deepEqual(JSON.parse(JSON.stringify(context.PRPDBusinessCore.orderCost(order))), Core.orderCost(order));
  }
  assert.deepEqual(JSON.parse(JSON.stringify(context.PRPDHistoricalMenuCosts)), history);
});

test('finance UI labels unavailable totals and planning estimates without zero-cost profit', () => {
  const app = fs.readFileSync(path.join(root, 'operations/business-center-app.js'), 'utf8');
  const page = fs.readFileSync(path.join(root, 'operations/business-center.html'), 'utf8');
  assert.match(app, /value === null \? 'Unavailable'/);
  assert.match(app, /Total cost and contribution are withheld, not treated as zero/);
  assert.match(app, /Planning estimate, not actual margin/);
  assert.ok(page.indexOf('historical-menu-costs.js') < page.indexOf('_business-center-core.js'));
});
