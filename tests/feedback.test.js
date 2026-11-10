'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const core = require('../api/_feedback-core');
const feedbackApi = require('../api/_feedback-service');
const guard = require('../operations/label-production-guard');

function order(overrides = {}) {
  return {
    orderId:'PRPD-B16-20261020-ABCD1234', customerName:'Sample Customer', customerFirstName:'Sample',
    email:'sample@example.com', phone:'4695550100',
    meals:[
      { id:'m1', tier:'lean', name:'Butter Chicken', image:'/assets/images/meals/menu/butter-chicken-lean.jpg', quantity:3 },
      { id:'m2', tier:'bulk', name:'Loaded Buffalo Chicken Potato', image:'/assets/images/meals/menu/loaded-buffalo-chicken-potato.jpg', quantity:1 },
    ],
    ...overrides,
  };
}

test('feedback tokens are stable, opaque, and do not expose the order reference', () => {
  const secret = 'this-is-a-long-private-test-secret';
  const token = core.stableToken(secret, order().orderId, 16);
  assert.match(token, core.TOKEN_PATTERN);
  assert.equal(token.includes('PRPD'), false);
  assert.equal(core.stableToken(secret, order().orderId, 16), token);
  assert.notEqual(core.stableToken(secret, `${order().orderId}X`, 16), token);
  assert.match(core.tokenHash(token), /^[a-f0-9]{64}$/);
});

test('provisioning validates one unique customer label per unique locked order', () => {
  const plan = core.normalizeProvision({ action:'provision', batch:16, batchId:'B16-1024', deliveryDate:'Saturday, October 24, 2026', orders:[order()] });
  assert.equal(plan.orders.length,1);
  assert.equal(plan.orders[0].meals.length,2);
  assert.throws(() => core.normalizeProvision({ action:'provision', batch:16, batchId:'B16-1024', deliveryDate:'Saturday, October 24, 2026', orders:[order(),order()] }),/duplicate/i);
});

test('bag-label guard reconciles count, customer names, unique dishes, and batch identity', () => {
  const plan = { schemaVersion:1, batch:16, batchId:'B16-1024', deliveryDate:'Saturday, October 24, 2026', orders:[order()] };
  const valid = guard.validateBagLabelPlan(plan,{ batch:16,batchId:'B16-1024',deliveryDate:'Saturday, October 24, 2026',declaredCount:'1' });
  assert.equal(valid.ok,true);
  assert.equal(valid.totalLabels,1);
  assert.equal(valid.orders[0].customerName,'Sample Customer');
  assert.equal(valid.orders[0].meals.length,2);
  assert.equal(guard.validateBagLabelPlan(plan,{ batch:16,batchId:'B16-1024',deliveryDate:'Saturday, October 24, 2026',declaredCount:'2' }).ok,false);
  assert.equal(guard.validateBagLabelPlan({ ...plan,batch:15 },{ batch:16,batchId:'B16-1024',deliveryDate:'Saturday, October 24, 2026',declaredCount:'1' }).ok,false);
});

test('saving or finishing a subset does not require the other dishes or optional notes', () => {
  const expected = order().meals;
  const subset = core.normalizeSave({ action:'save',token:'A'.repeat(43),finalize:true,
    meals:[{id:'m1',tier:'lean',score:1,liked:'Honest feedback',change:''}] },expected);
  assert.equal(subset.meals.length,1);
  assert.equal(subset.finalize,true);
  const draft = core.normalizeSave({ action:'save',token:'A'.repeat(43),finalize:false,
    meals:[{id:'m1',tier:'lean',score:8,liked:'Short',change:''}] },expected);
  assert.equal(draft.meals[0].liked,'Short');
  assert.equal(core.normalizeSave({action:'save',token:'A'.repeat(43),finalize:true,meals:[],overallNote:'Order note only'},expected).overallNote,'Order note only');
});

test('credit balance counts only active unexpired credit and stays capped by issuance logic', () => {
  const rows = [
    { value:{ 'Customer Key':'abc',Status:'active','Face Value':'5','Expires At':'2099-01-01' } },
    { value:{ 'Customer Key':'abc',Status:'queued','Face Value':'5','Expires At':'2099-01-01' } },
    { value:{ 'Customer Key':'abc',Status:'active','Face Value':'5','Expires At':'2020-01-01' } },
  ];
  assert.equal(feedbackApi._test.creditState(rows,'abc',new Date('2026-10-20T00:00:00Z')),5);
});

test('public feedback page is CSP-safe and deployed at a clean route', () => {
  const html = fs.readFileSync(path.join(__dirname,'..','feedback.html'),'utf8');
  const vercel = JSON.parse(fs.readFileSync(path.join(__dirname,'..','vercel.json'),'utf8'));
  assert.doesNotMatch(html,/<style\b|\sstyle\s*=|\son[a-z]+\s*=/i);
  for (const tag of html.matchAll(/<script\b([^>]*)>/gi)) assert.match(tag[1],/\ssrc\s*=/i);
  assert.ok(vercel.rewrites.some(entry => entry.source === '/feedback' && entry.destination === '/feedback.html'));
  assert.ok(vercel.rewrites.some(entry => entry.source === '/api/feedback' && entry.destination.includes('/api/lead')));
});

test('Label Studio has a separate four-up bag job and never puts identity in the QR URL', () => {
  const html = fs.readFileSync(path.join(__dirname,'..','operations','label-studio.html'),'utf8');
  const app = fs.readFileSync(path.join(__dirname,'..','operations','label-studio-app.js'),'utf8');
  assert.match(html,/id="bagPrintSheet"/);
  assert.match(html,/id="printBagLabelsButton"/);
  assert.match(app,/paginateLabels\(bagLabels, feedbackLabelMarkup\)/);
  assert.match(app,/getprpd\\\.com\\\/feedback/);
  assert.doesNotMatch(app,/feedback\?[^`'"\n]*(?:customer|name|email|phone|orderId)=/i);
});
