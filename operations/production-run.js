(function (root, factory) {
  const api = factory(typeof module === 'object' && module.exports ? require('./cook-day-core') : root.PRPD_COOK_DAY);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PRPD_PRODUCTION_RUN = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (core) {
  'use strict';
  const copy = value => JSON.parse(JSON.stringify(value));
  function read(record, key, fallback = null) {
    const value = record?.fields?.[key];
    if (value == null || value === '') return fallback;
    try { return JSON.parse(value); } catch { throw new Error('The saved production plan is incomplete. Open the planner and review it before rebuilding.'); }
  }
  function sourceSignature(orders) {
    const rows = (orders || []).map(order => ({
      key: core.orderKey(order), customer: order.customer || '',
      sourceStatus: order.sourceStatus || 'active', notes: order.notes || '',
      planningOnly:order.planningOnly === true, recurringStatus:order.recurringStatus || '',
      confirmationStatus:order.confirmationStatus || '', labelsApproved:order.labelsApproved === true,
      fulfillment: order.fulfillment || '', address: order.address || '',
      phone:order.phone || '', email:order.email || '', city:order.city || '', zip:order.zip || '', deliveryNotes:order.deliveryNotes || '',
      sauces: (order.sauces?.selections || order.sauces || []).map(row => ({id:row.id,qty:Number(row.qty)})).sort((a,b)=>a.id.localeCompare(b.id)),
      items: (order.items || []).map(item => ({ id:item.id, tier:item.tier, qty:Number(item.sourceQty ?? item.qty), name:item.name || '' }))
        .sort((a,b) => `${a.id}:${a.tier}`.localeCompare(`${b.id}:${b.tier}`)),
    })).sort((a,b) => a.key.localeCompare(b.key));
    return JSON.stringify(rows);
  }
  function selectOrders(liveOrders, record) {
    const locked = record?.fields?.['lock:status'] === 'locked';
    if (locked) {
      const orders = read(record, 'lock:orders-json', []);
      if (!Array.isArray(orders) || !orders.length) throw new Error('The locked production plan has no saved orders. Review it in the planner first.');
      const source = record.fields['lock:source-signature'] || record.fields['plan:source-signature'];
      const changed = Boolean(source && source !== sourceSignature(liveOrders));
      return {orders:copy(orders), mode:'locked', changed,
        message:changed ? 'New order changes need review in the planner. Showing the existing locked count.' : 'Using the locked kitchen orders.'};
    }
    const saved = read(record, 'plan:orders-json', []);
    const source = record?.fields?.['plan:source-signature'];
    if (Array.isArray(saved) && saved.length && source) {
      if (source !== sourceSignature(liveOrders)) return {orders:[],mode:'changed',changed:true,
        message:'Orders changed since the kitchen plan was reviewed. Sync and run the planner first so shopping and cooking stay together.'};
      return {orders:copy(saved),mode:'reviewed',changed:false,message:'Using the reviewed kitchen orders.'};
    }
    return {orders:copy(core.includedOrders(liveOrders || [])),mode:'live',changed:false,
      message:'Live-order planning estimate. Run the planner to share a reviewed plan.'};
  }
  function settings(record, defaults = {}) {
    const locked = record?.fields?.['lock:status'] === 'locked';
    const prefix = locked ? 'lock:' : 'plan:';
    const buffer = read(record, `${prefix}buffer-json`, defaults.buffer || {});
    const sauceConfig = read(record, `${prefix}sauce-json`, defaults.sauceConfig || {});
    const extras = read(record, `${prefix}extras-json`, defaults.extras || []);
    if (!buffer || Array.isArray(buffer) || typeof buffer !== 'object' || !sauceConfig || Array.isArray(sauceConfig) || typeof sauceConfig !== 'object')
      throw new Error('Saved production settings are invalid. Review them in the planner.');
    if (!Array.isArray(extras) || extras.some(id => typeof id !== 'string')) throw new Error('Saved internal-extra choices are invalid. Review them in the planner.');
    return {buffer:copy(buffer),sauceConfig:copy(sauceConfig),extras:[...extras]};
  }
  function snapshotStatus(plan, record) {
    const locked = record?.fields?.['lock:status'] === 'locked';
    const expected = read(record, locked ? 'lock:engine-snapshot-json' : 'plan:engine-snapshot-json');
    if (!expected) return {ok:!locked,legacy:locked,message:locked ? 'This older lock predates the shared recipe record. Review it in the planner before treating a new estimate as the locked run.' : ''};
    if (expected.id === plan.snapshot.id) return {ok:true,legacy:false,message:''};
    const changed = [];
    for (const [key,label] of [['orderHash','orders'],['recipeHash','recipes'],['demandHash','quantities or settings']])
      if (expected[key] !== plan.snapshot[key]) changed.push(label);
    return {ok:false,legacy:false,message:`The shared plan changed (${changed.join(', ') || 'plan version'}). Review and run the planner before shopping or cooking.`};
  }
  // Recovery selects a complete review, never individual settings from different saves.
  // Candidate order is authoritative on a tie (callers put the server copy first).
  function mergeReviewedFields(baseRecord, candidates = []) {
    const base = copy(baseRecord || {});
    const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
    let chosen = null;
    let latest = -Infinity;
    for (const record of [...(Array.isArray(candidates) ? candidates : []), baseRecord]) {
      if (!isObject(record) || !isObject(record.fields)) continue;
      if (base.batchKey && record.batchKey !== base.batchKey) continue;
      const fields = record.fields;
      const stamp = typeof fields['plan:reviewed-at'] === 'string' ? Date.parse(fields['plan:reviewed-at']) : NaN;
      if (!Number.isFinite(stamp) || stamp <= latest) continue;
      try {
        const orders = JSON.parse(fields['plan:orders-json']);
        const source = JSON.parse(fields['plan:source-signature']);
        const buffer = JSON.parse(fields['plan:buffer-json']);
        const sauces = JSON.parse(fields['plan:sauce-json']);
        const extras = JSON.parse(fields['plan:extras-json']);
        const snapshot = JSON.parse(fields['plan:engine-snapshot-json']);
        if (!Array.isArray(orders) || !orders.length || orders.some(order => !isObject(order) || !Array.isArray(order.items)) ||
            !Array.isArray(source) || source.some(order => !isObject(order)) ||
            !isObject(buffer) || !isObject(sauces) || !Array.isArray(extras) || extras.some(id => typeof id !== 'string') ||
            !isObject(snapshot) || typeof snapshot.id !== 'string' || !snapshot.id.trim()) continue;
      } catch { continue; }
      chosen = fields;
      latest = stamp;
    }
    if (!chosen) return base;
    base.fields = Object.fromEntries(Object.entries(base.fields || {}).filter(([key]) => !key.startsWith('plan:')));
    for (const [key, value] of Object.entries(chosen)) if (key.startsWith('plan:')) base.fields[key] = copy(value);
    return base;
  }
  function reviewedFields({plan,orders,sourceOrders,buffer,sauceConfig,extras=[],previousReviewedAt}) {
    return {
      'plan:reviewed-at':new Date(Math.max(Date.now(), (Date.parse(previousReviewedAt) || 0) + 1)).toISOString(),
      'plan:orders-json':JSON.stringify(core.includedOrders(orders)),
      'plan:source-signature':sourceSignature(sourceOrders),
      'plan:buffer-json':JSON.stringify(buffer),
      'plan:sauce-json':JSON.stringify(sauceConfig),
      'plan:extras-json':JSON.stringify(extras),
      'plan:engine-snapshot-json':JSON.stringify(plan.snapshot),
    };
  }
  return {read,sourceSignature,selectOrders,settings,snapshotStatus,reviewedFields,mergeReviewedFields};
});
