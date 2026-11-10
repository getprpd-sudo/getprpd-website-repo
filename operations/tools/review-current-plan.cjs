#!/usr/bin/env node
// Rebuilds the shared reviewed plan from the protected current-order feed.
const config=require('../../config/order-config');
const data=require('../nutrition/production-data');
const methods=require('../cook-day-methods');
const core=require('../cook-day-core');
const engine=require('../production-engine');
const run=require('../production-run');
const recurring=require('../recurring-customers');
const store=require('../cook-log-store');
const reportTool=require('./generate-current-grocery-report');

async function main(){
  const active=reportTool.activeConfig(data,config);
  const batchKey=`batch:${active.batch.number}|delivery:${active.batch.deliveryDate}`.toLowerCase();
  const record=store.loadLog(batchKey);
  if(!record) throw new Error('The current batch has no saved cook log.');
  if(record.fields['lock:status']==='locked') throw new Error('The production plan is locked. Unlock it in Cook-Day Planner before reviewing new orders.');
  const {body,orders:imported}=await reportTool.currentOrders(active);
  const savedSelections=run.read(record,'recurring:selections',{});
  const materialized=recurring.materialize(imported,savedSelections,active.batch,data);
  const sourceOrders=materialized.orders;
  const orders=core.includedOrders(sourceOrders);
  const settings=run.settings(record,reportTool.defaultSettings(methods));
  const plan=engine.compileProduction({orders,data,methods,config:active,...settings});
  if(!plan.diagnostics.ok) throw new Error(`The plan has calculation errors: ${plan.diagnostics.errors.join('; ')}`);
  const summary={
    mode:process.argv.includes('--commit')?'commit':'dry-run',batch:body.batch,source:body.source||'protected current-order feed',
    importedOrders:imported.length,plannedOrders:orders.length,customerMeals:plan.totalMeals,
    internalMeals:plan.productionExtras.reduce((sum,item)=>sum+Number(item.ownerServings||0),0),
    physicalMeals:plan.totalMeals+plan.productionExtras.reduce((sum,item)=>sum+Number(item.ownerServings||0),0),
    labels:plan.labelCount,sauceCups:plan.cups.totalCustomer+plan.cups.totalExtras+plan.cups.totalQc,
    snapshot:plan.snapshot.id,warnings:materialized.warnings,
  };
  if(!process.argv.includes('--commit')) return console.log(JSON.stringify(summary,null,2));
  const fields={...record.fields,...run.reviewedFields({plan,orders,sourceOrders,
    ...settings,previousReviewedAt:record.fields['plan:reviewed-at']})};
  const saved=store.saveLog({...record,fields});
  const verify=store.loadLog(batchKey);
  if(!verify || verify.fields['plan:engine-snapshot-json']!==JSON.stringify(plan.snapshot))
    throw new Error('The reviewed plan did not verify after saving.');
  console.log(JSON.stringify({...summary,reviewedAt:saved.fields['plan:reviewed-at']},null,2));
}
main().catch(error=>{console.error(error.stack||error.message);process.exitCode=1});
