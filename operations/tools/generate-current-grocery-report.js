#!/usr/bin/env node

const ORDER_CONFIG = require('../../config/order-config');
const PRODUCTION_DATA = require('../nutrition/production-data');
const COOK = require('../cook-day-core');
const METHODS = require('../cook-day-methods');
const GROCERY = require('../grocery-list-core');
const DASH = require('../grocery-dashboard');
const RUN = require('../production-run');
const RECURRING = require('../recurring-customers');
const CATALOG = require('../grocery-catalog').catalog;
const GROCERY_STATE = require('../grocery-state-store');
const COOK_LOG = require('../cook-log-store');
const fs = require('node:fs');

function amount(value, unit) {
  const number = Number(value) || 0;
  if (unit === 'g') {
    const pounds = number / 453.59237;
    return pounds >= 1
      ? `${number.toFixed(1)} g (${pounds.toFixed(pounds >= 10 ? 1 : 2)} lb)`
      : `${number.toFixed(1)} g (${(number / 28.3495).toFixed(1)} oz)`;
  }
  if (unit === 'each') return `${Number.isInteger(number) ? number : number.toFixed(1)} count`;
  return `${number.toFixed(1)} ${unit}`;
}

function activeConfig(data = PRODUCTION_DATA, config = ORDER_CONFIG) {
  const plannerOnly = Object.entries(data.meals)
    .filter(([, meal]) => meal.plannerOnly)
    .map(([id, meal]) => ({ id, name:meal.name, aliases:meal.aliases || [], category:meal.orderCategory || 'standard', packageType:meal.packageType || '' }));
  return {...config,menu:{...config.menu,mains:[...config.menu.mains,...plannerOnly.filter(row => !config.menu.mains.some(item => item.id === row.id))]}};
}

function defaultSettings(methods = METHODS) {
  return {
    buffer:{rawProteinBufferPct:5,rawProteinReserveByDish:methods.rawProteinReserveByDish || {},riceBufferPct:15,riceYieldFactor:2.75},
    sauceConfig:{...methods.weeklySauces,customerCupsTotal:0,kitchenUseCupsPerSauce:0,qcCupsPerSauce:Number(methods.weeklySauces?.qcCupsPerSauce) || 0},
    extras:[],
  };
}

// CLI-only overrides previously created a different demand than the reviewed kitchen.
function validateEnvironment(env = process.env) {
  const unsupported = ['PRPD_MANUAL_ORDERS_JSON','PRPD_EXCLUDE_CUSTOMERS','PRPD_RAW_PROTEIN_BUFFER_PCT'].filter(key => env[key] !== undefined && env[key] !== '');
  if (unsupported.length) throw new Error(`Review order and reserve changes in Cook Day Planner first. This report does not accept separate overrides: ${unsupported.join(', ')}.`);
}

async function currentOrders(config = activeConfig()) {
  const url = process.env.PRPD_CURRENT_ORDERS_URL || 'http://127.0.0.1:4173/api/current-orders';
  const response = await fetch(url, {headers:{accept:'application/json'},signal:AbortSignal.timeout(30000)});
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || `Order sync failed with ${response.status}.`);
  if (body.batch != null && Number(body.batch) !== Number(config.batch.number)) throw new Error('The current-order feed belongs to a different batch. No grocery report was generated.');
  const parsed = COOK.arrayRowsToOrders(body.rows, config);
  if (parsed.warnings.length) throw new Error(`Order import warnings must be resolved first:\n- ${parsed.warnings.join('\n- ')}`);
  return {body,orders:parsed.orders};
}

// Pure build: the report is a second presentation of the same compiled shopping plan.
// Saved pantry state changes purchases only, never production demand or review state.
function build(liveOrders, saved = null, options = {}) {
  const data = options.data || PRODUCTION_DATA;
  const methods = options.methods || METHODS;
  const config = activeConfig(data,options.config || ORDER_CONFIG);
  if (Number(methods.batch) !== Number(data.batch)) throw new Error('The recipe methods belong to a different batch. Review the recipe record before generating a grocery report.');
  const record = options.record || null;
  const recurring = RECURRING.materialize(liveOrders, RUN.read(record,'recurring:selections',{}),config.batch,data);
  const model = DASH.build({liveOrders:recurring.orders,record,data,methods,config,
    defaults:options.defaults || defaultSettings(methods),catalog:options.catalog || CATALOG,
    saved:saved || {onHand:{},buyPackages:{},catalog:{}}});
  return {...model,sourceOrders:recurring.orders,recurringWarnings:recurring.warnings,
    inventoryApplied:Boolean(saved),onHand:{...(saved?.onHand || {})},summary:GROCERY.summary(model.rows),
    dataNotice:data.notice || '',methodDataIsCurrent:Number(methods.batch) === Number(data.batch)};
}

function printReport(source, report, log = console.log) {
  if (report.blocked || !report.plan) throw new Error(`${report.message || 'No current production demand.'} No grocery purchase list was generated.`);
  const {plan,selection,settings} = report;
  log(`BATCH ${source.batch} GROCERY REPORT`);
  if (source.deliveryDate) log(`Delivery: ${source.deliveryDate}`);
  log(`Source: ${source.source || 'protected current-order feed'}${source.fetchedAt ? ` at ${source.fetchedAt}` : ''}`);
  if (report.inventoryApplied) log('Operating note: This full source report proves recipe coverage and shows saved Grocery Builder pack assumptions. Use the current owner shopping list for the actual store run and checkout range.');
  log(`Shared plan: ${plan.snapshot.id} | ${selection.mode}${report.exact ? ', snapshot matched' : ', planning preview'}`);
  const confirmedOrders=COOK.confirmedOrders(plan.orders), planningOrders=plan.orders.length-confirmedOrders.length;
  const confirmedItems=confirmedOrders.reduce((total,order)=>total+(order.items||[]).reduce((sum,item)=>sum+Number(item.qty||0),0),0);
  log(`Orders: ${confirmedOrders.length} confirmed${planningOrders?`; ${planningOrders} planning/unconfirmed`:''}`);
  log(`Finished items: ${confirmedItems} confirmed; ${plan.totalMeals} planned including unconfirmed; customer labels: ${plan.labelCount}`);
  const extraMeals = plan.productionExtras.reduce((sum,item) => sum + Number(item.ownerServings || 0),0);
  log(`Explicit internal meals: ${extraMeals}; total physical meals: ${plan.totalMeals + extraMeals}. Internal portions are not customer orders or labels.`);
  log(`Raw-protein purchasing reserve: ${Number(settings.buffer.rawProteinBufferPct)}%; rice allowance: ${Number(settings.buffer.riceBufferPct)}%.`);
  log(plan.diagnostics.releaseReady
    ? 'Shared calculation checks passed. Physical cooking, yield, pantry and purchased-package checks still apply.'
    : 'PLANNING ONLY, NOT RELEASED FOR PRODUCTION. Resolve the holds and decisions below in Cook Day Planner.');
  if (report.message) log(report.message);
  if (report.dataNotice) log(`Recipe scope: ${report.dataNotice}`);
  for (const warning of [...report.recurringWarnings,...plan.diagnostics.errors,...plan.diagnostics.holds,
    ...plan.diagnostics.decisions,...plan.diagnostics.warnings,...GROCERY.catalogValidationWarnings(report.rows)]) {
    log(`REVIEW: ${typeof warning === 'string' ? warning : warning.message || JSON.stringify(warning)}`);
  }
  log('');
  log('REVIEWED CUSTOMER DISH COUNTS');
  for (const count of plan.counts) log(`- ${count.name} (${count.tier}): ${count.qty}`);
  log('');
  log('SAUCE BATCHES AND CUPS');
  for (const group of plan.sauceGroups) {
    log(`- ${group.name}: ${amount(group.totalInputGrams,'g')} recipe input. Finished yield is not inferred from input weight.`);
    for (const cup of group.cupPlan) log(`  ${cup.name}: ${cup.cups} ${cup.audience === 'internal' ? 'internal' : 'customer'} cups${cup.gramsPerMeal == null ? ', fill requires measurement' : `, ${cup.gramsPerMeal} g per meal (${cup.weightBasis || 'finished'} basis)`}.`);
    for (const reserve of group.reserves) log(`  ${reserve.name}: ${reserve.kind === 'qc' ? `${reserve.cups} QC cup(s)` : 'internal recipe allocation'}, ${amount(reserve.grams,'g')} (${reserve.weightBasis || 'input'} basis).`);
  }
  log(`Customer recipe cups: ${plan.cups.totalCustomer}; internal cups: ${plan.cups.totalExtras}; QC cups: ${plan.cups.totalQc}.`);
  for (const sauce of plan.saucePlan.sauces || []) log(`- ${sauce.name}: ${sauce.customerCups} customer + ${sauce.qcCups} QC + ${sauce.kitchenUseCups} kitchen = ${sauce.totalCups} weekly cups.`);
  const cups = plan.requirements.find(row => row.key === 'sauce_cup');
  log(`Canonical cup-and-lid purchasing requirement: ${cups?.required || 0}.`);
  log('');
  log('PACKAGING COUNTS: REQUIRED / SAVED ON HAND / STILL NEEDED');
  for (const row of report.rows.filter(row => row.packaging))
    log(`- ${row.name}: ${amount(row.required,row.unit)} required / ${amount(row.onHand,row.unit)} marked on hand / ${amount(row.needed,row.unit)} still needed`);
  log('');
  log(report.inventoryApplied ? 'PURCHASE LIST AFTER SAVED STOCK' : 'FULL EMPTY-PANTRY REQUIREMENT');
  let section = '';
  for (const row of report.rows.filter(row => !row.nonPurchase && (!report.inventoryApplied || row.needed > 0))) {
    if (row.section !== section) { section = row.section; log(`\n[${section}]`); }
    const countHint = row.estimatedCount ? ` | ${row.estimatedCount.label}` : '';
    log(`- ${row.name}: ${amount(report.inventoryApplied ? row.needed : row.required,row.unit)}${countHint} | ${DASH.coverage(plan,row) || 'Coverage not recipe-specific'} | ${row.packages} x ${row.packageLabel} | $${row.estimatedCost.toFixed(2)}${row.configured ? '' : ' [PRICE UNVERIFIED]'}`);
  }
  log('');
  log('CATEGORY COST CHECK');
  for (const sectionName of [...new Set(report.rows.map(row => row.section))]) {
    const rows = report.rows.filter(row => row.section === sectionName);
    const usage = rows.reduce((sum,row) => sum + row.usageCost,0);
    const checkout = rows.filter(row => !row.nonPurchase && row.needed > 0).reduce((sum,row) => sum + row.estimatedCost,0);
    log(`- ${sectionName}: $${usage.toFixed(2)} consumed | $${checkout.toFixed(2)} ${report.inventoryApplied ? 'saved-stock' : 'empty-pantry'} checkout`);
  }
  log(`Food consumed estimate: $${report.summary.foodUsageCost.toFixed(2)}`);
  log(`Packaging consumed estimate: $${report.summary.packagingUsageCost.toFixed(2)}`);
  log(`${report.inventoryApplied ? 'Saved-stock' : 'Empty-pantry'} whole-package checkout, priced lines only: $${report.summary.estimatedCost.toFixed(2)}`);
  if (report.summary.unconfigured) log(`Warning: ${report.summary.unconfigured} purchased line(s) lack verified prices. This is not a final checkout quote.`);
}

async function main(args = process.argv.slice(2)) {
  validateEnvironment();
  const config = activeConfig();
  const batchKey = `batch:${config.batch.number}|delivery:${config.batch.deliveryDate}`.toLowerCase();
  const {body,orders} = await currentOrders(config);
  const record = COOK_LOG.loadLog(batchKey);
  const saved = args.includes('--saved') ? GROCERY_STATE.loadState(batchKey) : null;
  if (args.includes('--saved') && !saved) throw new Error('No saved Grocery Builder pantry state exists for this batch.');
  const report = build(orders,saved,{record,config});
  const lines = [];
  printReport(body,report,line => lines.push(line));
  const output = args.find(arg => arg.startsWith('--output='));
  if (output) {
    fs.writeFileSync(output.slice('--output='.length),lines.join('\n')+'\n','utf8');
    console.log(`Saved shared-plan report: ${output.slice('--output='.length)}`);
  } else console.log(lines.join('\n'));
  return report;
}

module.exports = {activeConfig,defaultSettings,validateEnvironment,currentOrders,build,printReport,main,amount};
if (require.main === module) main().catch(error => { console.error(error.stack || error.message || error); process.exitCode = 1; });
