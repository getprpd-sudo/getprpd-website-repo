#!/usr/bin/env node
// Prints the exact locked-order queue from the existing Label Studio UI.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const net = require('node:net');
const { spawn } = require('node:child_process');
const config = require('../../config/order-config.js');
const productionData = require('../nutrition/production-data.js');
const cook = require('../cook-day-core.js');
const methods = require('../cook-day-methods.js');
const recurring = require('../recurring-customers.js');
const run = require('../production-run.js');
const cookLog = require('../cook-log-store.js');

const origin = process.env.PRPD_LOCAL_ORIGIN || 'http://127.0.0.1:4173';
const productionDate = config.batch?.labelProduction?.madeDate;
if (!/^\d{4}-\d{2}-\d{2}$/.test(String(productionDate || ''))) {
  throw new Error('Active order config is missing a valid label-production made date.');
}
const reviewProof = process.argv.includes('--review-proof');
const currentOrders = process.argv.includes('--current-orders');
if (currentOrders && (reviewProof || process.argv.includes('--proof'))) throw new Error('Choose final current orders or a review proof, not both.');
if (currentOrders && (!config.batch.published || !Number.isFinite(Date.parse(config.batch.cutoffIso)) || Date.now() < Date.parse(config.batch.cutoffIso))) {
  throw new Error('Final current-order export requires the published batch cutoff to have passed.');
}
const defaultName = `PRPD_Batch_${config.batch.number}_${reviewProof ? 'DRAFT_Review_Proof' : 'Label_Studio'}_${productionDate}.pdf`;
const output = path.resolve(process.argv.slice(2).find(arg => !arg.startsWith('--')) || `output/pdf/${defaultName}`);
const jobArg = process.argv.slice(2).find(arg => arg.startsWith('--job='));
const printJob = jobArg ? jobArg.slice('--job='.length).trim().toLowerCase() : 'meals';
if (!['meals', 'bags'].includes(printJob)) throw new Error(`Unsupported print job: ${printJob}`);
const refreshLock = process.argv.includes('--refresh-lock');
const proof = process.argv.includes('--proof') || reviewProof;
if (reviewProof && printJob !== 'meals') throw new Error('Review proof exports support meal labels only.');
const planningCustomerArg = process.argv.slice(2).find(arg => arg.startsWith('--include-planning-customer='));
const planningCustomer = planningCustomerArg ? planningCustomerArg.slice('--include-planning-customer='.length).trim() : '';
const chromePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

async function port() {
  const server = net.createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const found = server.address().port;
  await new Promise(resolve => server.close(resolve));
  return found;
}

async function connect(portNumber) {
  const response = await fetch(`http://127.0.0.1:${portNumber}/json/list`);
  const tabs = await response.json();
  const tab = tabs.find(item => item.type === 'page');
  if (!tab) throw new Error('No Chrome page target was available.');
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  let id = 0;
  const pending = new Map();
  ws.onmessage = event => {
    const message = JSON.parse(event.data);
    if (!message.id || !pending.has(message.id)) return;
    const entry = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) entry.reject(new Error(message.error.message));
    else entry.resolve(message.result);
  };
  return {
    call(method, params = {}) {
      const callId = ++id;
      return new Promise((resolve, reject) => {
        pending.set(callId, { resolve, reject });
        ws.send(JSON.stringify({ id: callId, method, params }));
      });
    },
    close() { ws.close(); },
  };
}

async function evaluate(cdp, expression) {
  const result = await cdp.call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || 'Browser evaluation failed.');
  return result.result.value;
}

async function until(cdp, expression, description, timeout = 30000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    const result = await evaluate(cdp, expression);
    if (result) return result;
    await wait(250);
  }
  throw new Error(`Timed out waiting for ${description}.`);
}

async function navigate(cdp, url) {
  await cdp.call('Page.navigate', { url });
  await until(cdp, 'document.readyState === "complete"', 'page load');
}

async function main() {
  if (!fs.existsSync(chromePath)) throw new Error(`Chrome not found: ${chromePath}`);
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'prpd-label-studio-'));
  const portNumber = await port();
  const chrome = spawn(chromePath, [
    '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    `--remote-debugging-port=${portNumber}`, `--user-data-dir=${profile}`, 'about:blank',
  ], { stdio: 'ignore', windowsHide: true });
  let cdp;
  try {
    for (let i = 0; i < 80; i += 1) {
      try { cdp = await connect(portNumber); break; } catch { await wait(250); }
    }
    if (!cdp) throw new Error('Could not connect to headless Chrome.');
    await cdp.call('Page.enable');
    await cdp.call('Runtime.enable');
    let planner;
    if (proof || currentOrders) {
      const response = await fetch(`${origin}/api/current-orders`, { headers: { accept: 'application/json' } });
      if (!response.ok) throw new Error(`Current-order feed returned ${response.status}.`);
      const body = await response.json();
      if (Number(body.batch) !== Number(config.batch.number)) throw new Error('Order-feed batch differs from active menu.');
      const plannerOnly = Object.entries(productionData.meals).filter(([, meal]) => meal.plannerOnly)
        .map(([id, meal]) => ({ id, name: meal.name, aliases: meal.aliases || [], category: meal.orderCategory || 'standard', packageType: meal.packageType || '' }));
      const parseConfig = { ...config, menu: { ...config.menu, mains: [...config.menu.mains, ...plannerOnly] } };
      const parsed = cook.arrayRowsToOrders(body.rows, parseConfig);
      if (parsed.warnings.length) throw new Error(`Current-order parse warnings: ${parsed.warnings.join('; ')}`);
      let orders = cook.includedOrders(parsed.orders);
      if (planningCustomer) {
        const batchKey = `batch:${config.batch.number}|delivery:${config.batch.deliveryDate}`.toLowerCase();
        const record = cookLog.loadLog(batchKey);
        if (!record) throw new Error('No reviewed production plan exists for this batch.');
        const materialized = recurring.materialize(orders, run.read(record, 'recurring:selections', {}), config.batch, productionData);
        if (materialized.warnings.length) throw new Error(`Recurring-order warnings: ${materialized.warnings.join('; ')}`);
        const selection = run.selectOrders(materialized.orders, record);
        if (selection.changed || !selection.orders.length) throw new Error(selection.message || 'The reviewed production plan is stale.');
        orders = selection.orders;
      }
      const normalizedPlanningCustomer = planningCustomer.toLowerCase();
      const labelOrders = orders.map(order => {
        if (!normalizedPlanningCustomer || String(order.customer || '').trim().toLowerCase() !== normalizedPlanningCustomer) return order;
        return { ...order, planningOnly:false, recurringStatus:'confirmed', confirmationStatus:'confirmed' };
      });
      if (planningCustomer && !labelOrders.some(order => String(order.customer || '').trim().toLowerCase() === normalizedPlanningCustomer)) {
        throw new Error(`Planning customer was not found in the reviewed production plan: ${planningCustomer}`);
      }
      const eligible = cook.labelRequiredOrders(labelOrders, methods.labelExemptCustomers);
      const counts = cook.aggregateCounts(eligible);
      const plan = cook.labelPlan(counts, {}, 4, []);
      if (!Number.isInteger(plan.totalLabels) || plan.totalLabels <= 0 || plan.totalSheets !== Math.ceil(plan.totalLabels / 4)) {
        throw new Error(`Invalid current-batch label plan: ${plan.totalLabels} labels / ${plan.totalSheets} sheets. Reconcile before printing.`);
      }
      const parameters = new URLSearchParams({
        plan: plan.rows.map(row => `${row.id}:${row.tier}:${row.labels}`).join(','),
        count: String(plan.totalLabels), made: config.batch.labelProduction.madeDate,
        useBy: config.batch.labelProduction.useByDate, batch: config.batch.labelProduction.batchId,
      });
      if (reviewProof) parameters.set('reviewProof', '1');
      planner = { url: `/operations/label-studio?${parameters}`, status: planningCustomer ? `confirmed orders plus owner-approved planning labels for ${planningCustomer}` : 'confirmed current-order feed', badge: planningCustomer ? 'Approved production labels' : 'Confirmed customer labels', orders: orders.length, excluded: methods.labelExemptCustomers, rows: plan.rows };
      if (currentOrders && printJob === 'bags') {
        const dishById = new Map(Object.values(parseConfig.menu).filter(Array.isArray).flat().map(dish => [dish.id, dish]));
        const bagOrders = eligible.map(order => {
          const grouped = new Map();
          for (const item of order.items || []) {
            const quantity = Math.max(0, Math.floor(Number(item.qty) || 0));
            if (!quantity) continue;
            const dish = dishById.get(item.id);
            if (!dish) throw new Error(`Feedback dish ${item.id} has no current definition.`);
            const tier = item.tier || (dish.category === 'addon' || dish.category === 'dessert' ? 'single' : 'lean');
            const key = `${item.id}:${tier}`;
            const entry = grouped.get(key) || {id:item.id,tier,name:item.name || dish.name,image:dish.image || '',quantity:0};
            entry.quantity += quantity;
            grouped.set(key,entry);
          }
          const customerName = String(order.customer || '').trim();
          return {orderId:String(order.orderId || '').trim(),customerName,customerFirstName:customerName.split(/\s+/)[0] || '',email:String(order.email || ''),phone:String(order.phone || ''),meals:[...grouped.values()]};
        }).filter(order => order.meals.length);
        planner.bagPlan = {schemaVersion:1,batch:config.batch.number,batchId:config.batch.labelProduction.batchId,deliveryDate:config.batch.deliveryDate,createdAt:new Date().toISOString(),orders:bagOrders};
        planner.bagPlanKey = `prpdBagLabelPlan:${config.batch.labelProduction.batchId}`;
        parameters.set('bagPlan',planner.bagPlanKey);
        parameters.set('bagCount',String(bagOrders.length));
        planner.url = `/operations/label-studio?${parameters}`;
      }
    } else {
    await navigate(cdp, `${origin}/operations/cook-day-planner`);
    await until(cdp, 'Boolean(document.getElementById("syncOrdersBtn"))', 'planner controls');
    await evaluate(cdp, 'document.getElementById("syncOrdersBtn").click()');
    await until(cdp, '!document.getElementById("syncOrdersBtn").disabled', 'current-order sync');
    const syncStatus = await evaluate(cdp, 'document.getElementById("importStatus").textContent');
    if (/failed|error|fallback|warning/i.test(syncStatus)) throw new Error(`Order sync: ${syncStatus}`);
    if (refreshLock && await evaluate(cdp, 'document.getElementById("batchLockBadge").textContent === "Locked"')) {
      await evaluate(cdp, 'document.getElementById("unlockBatchBtn").click(); document.getElementById("unlockBatchBtn").click()');
      await until(cdp, 'document.getElementById("batchLockBadge").textContent === "Draft"', 'old lock release');
    }
    await evaluate(cdp, `document.getElementById("cookDate").value = ${JSON.stringify(productionDate)}; document.getElementById("cookDate").dispatchEvent(new Event("change", {bubbles:true})); document.getElementById("lockBatchBtn").click()`);
    const firstPass = await until(cdp,
      '(() => { const badge=document.getElementById("batchLockBadge")?.textContent; const status=document.getElementById("importStatus")?.textContent || ""; const labelsReady=!document.getElementById("openLabelStudioBtn")?.disabled; return labelsReady || /Unlock, review|Cannot lock|blocked|stopped/i.test(status) ? {badge,status,labelsReady} : null; })()',
      'locked packet validation');
    if (/Unlock, review/i.test(firstPass.status)) {
      await evaluate(cdp, 'document.getElementById("unlockBatchBtn").click(); document.getElementById("unlockBatchBtn").click()');
      await until(cdp, 'document.getElementById("batchLockBadge").textContent === "Draft"', 'old lock release');
      await evaluate(cdp, 'document.getElementById("lockBatchBtn").click()');
    }
    const lockResult = await until(cdp,
      '(() => { const badge=document.getElementById("batchLockBadge")?.textContent; const status=document.getElementById("importStatus")?.textContent || ""; const labelsReady=!document.getElementById("openLabelStudioBtn")?.disabled; return labelsReady || /Cannot lock|blocked|stopped/i.test(status) ? {badge,status,labelsReady} : null; })()',
      'batch lock');
    if (lockResult.badge !== 'Locked') throw new Error(`Batch did not lock: ${lockResult.status}`);
    await until(cdp, '!document.getElementById("openLabelStudioBtn").disabled', 'exact Label Studio queue');
    planner = await evaluate(cdp,
      '(() => { window.__labelUrl=""; window.open = url => { window.__labelUrl=url; return null; }; document.getElementById("openLabelStudioBtn").click(); return {url:window.__labelUrl,status:document.getElementById("importStatus").textContent,badge:document.getElementById("batchLockBadge").textContent}; })()');
    if (!planner.url) throw new Error('Planner did not provide a Label Studio URL.');
    }
    if (planner.bagPlan) {
      await navigate(cdp, `${origin}/operations/label-studio`);
      await evaluate(cdp, `localStorage.setItem(${JSON.stringify(planner.bagPlanKey)},${JSON.stringify(JSON.stringify(planner.bagPlan))})`);
    }
    await navigate(cdp, new URL(planner.url, origin).href);
    await until(cdp, 'document.getElementById("printSheet")?.querySelectorAll(".meal-label").length > 0', 'meal-label render');
    if (printJob === 'bags') {
      const bagStatus = await until(cdp,
        '(() => { const status = document.getElementById("bagLabelStatus")?.textContent; if (status?.startsWith("Bag-label printing is blocked:")) return { error: status }; const button = document.getElementById("printBagLabelsButton"); return button && !button.disabled && document.getElementById("bagPrintSheet")?.querySelector(".feedback-label") ? { ready: true } : null; })()',
        'customer bag-label render');
      if (bagStatus.error) throw new Error(bagStatus.error);
    }
    const studio = await evaluate(cdp,
      '({blocked:document.body.classList.contains("label-print-blocked"),labels:document.getElementById("printSheet").querySelectorAll(".meal-label").length,pages:document.getElementById("printSheet").querySelectorAll(".print-page").length,status:document.getElementById("selectionCount")?.textContent,warning:document.querySelector(".print-blocked-message")?.textContent,gate:document.getElementById("productionGate")?.textContent,selected:[...document.querySelectorAll("[data-sheet]:checked")].map(input=>({key:input.dataset.sheet,labels:document.querySelector(`[data-label-quantity=\"${input.dataset.sheet}\"]`)?.value}))})');
    const expectedLabels = Number(new URL(planner.url, origin).searchParams.get('count'));
    const expectedPages = Math.ceil(expectedLabels / 4);
    if (!Number.isInteger(expectedLabels) || expectedLabels <= 0 || studio.blocked || studio.labels !== expectedLabels || studio.pages !== expectedPages) {
      throw new Error(`Label Studio queue did not validate: ${JSON.stringify({expectedLabels,expectedPages,studio})}`);
    }
    if (reviewProof) {
      const review = await evaluate(cdp, '({proofOnly:window.PRPD_LABEL_DATA?.proofOnly,currentReviewProof:window.PRPD_LABEL_DATA?.currentReviewProof,marks:document.querySelectorAll("#printSheet .label-proof-mark").length,provisional:[...document.querySelectorAll("#printSheet .meal-label")].every(label=>label.textContent.includes("Made (provisional)")&&label.textContent.includes("Net wt. (unverified)")),badText:/undefined|NaN/.test(document.getElementById("printSheet").textContent)})');
      if (!review.proofOnly || !review.currentReviewProof || review.marks !== expectedLabels || !review.provisional || review.badText) {
        throw new Error(`Review proof safety check failed: ${JSON.stringify(review)}`);
      }
      studio.review = review;
    }
    if (currentOrders) {
      const clean = await evaluate(cdp, '({marks:document.querySelectorAll("#printSheet .label-proof-mark").length,badText:/\\b(?:draft|provisional|unverified|unknown|estimated|AI-generated)\\b/i.test(document.getElementById("printSheet").textContent)})');
      if (clean.marks || clean.badText) throw new Error(`Final label copy check failed: ${JSON.stringify(clean)}`);
      studio.finalCopy = clean;
    }
    let bagStudio = null;
    if (printJob === 'bags') {
      bagStudio = await evaluate(cdp,
        '({labels:document.getElementById("bagPrintSheet").querySelectorAll(".feedback-label").length,pages:document.getElementById("bagPrintSheet").querySelectorAll(".print-page").length,names:[...document.getElementById("bagPrintSheet").querySelectorAll(".bag-customer-name")].map(node=>node.textContent.trim()),qrImages:[...document.getElementById("bagPrintSheet").querySelectorAll(".bag-qr-frame img")].map(img=>({ready:img.complete&&img.naturalWidth>0,data:/^data:image\\/png;base64,/.test(img.src)}))})');
      const expectedBagLabels = Number(new URL(planner.url, origin).searchParams.get('bagCount'));
      const expectedBagPages = Math.ceil(expectedBagLabels / 4);
      if (!Number.isInteger(expectedBagLabels) || expectedBagLabels <= 0 || bagStudio.labels !== expectedBagLabels || bagStudio.pages !== expectedBagPages || bagStudio.names.length !== expectedBagLabels || bagStudio.qrImages.some(image => !image.ready || !image.data)) {
        throw new Error(`Customer bag-label queue did not validate: ${JSON.stringify({expectedBagLabels,expectedBagPages,bagStudio})}`);
      }
      await evaluate(cdp, 'document.body.dataset.printJob="bags"');
    } else {
      await evaluate(cdp, 'document.body.dataset.printJob="meals"');
    }
    fs.mkdirSync(path.dirname(output), { recursive: true });
    const pdf = await cdp.call('Page.printToPDF', { printBackground: true, preferCSSPageSize: true, displayHeaderFooter: false });
    fs.writeFileSync(output, Buffer.from(pdf.data, 'base64'));
    console.log(JSON.stringify({ output, printJob, planner, studio, bagStudio }, null, 2));
  } finally {
    if (cdp) cdp.close();
    chrome.kill();
    // The unique profile was created by this process under the OS temp directory.
    const tempRoot = path.resolve(os.tmpdir()) + path.sep;
    const resolvedProfile = path.resolve(profile);
    if (resolvedProfile.startsWith(tempRoot) && path.basename(resolvedProfile).startsWith('prpd-label-studio-')) {
      for (let i = 0; i < 10; i += 1) {
        try { fs.rmSync(resolvedProfile, { recursive: true, force: true }); break; } catch { await wait(200); }
      }
    }
  }
}

main().catch(error => { console.error(error.stack || error.message); process.exitCode = 1; });
