#!/usr/bin/env node
// Walk the locked Batch 11 planner without checking off production work.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const net = require('node:net');
const {spawn} = require('node:child_process');
const origin = process.env.PRPD_LOCAL_ORIGIN || 'http://127.0.0.1:4173';
const chromePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
async function freePort() {
  const server = net.createServer();
  await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
  const port = server.address().port;
  await new Promise(resolve => server.close(resolve));
  return port;
}
async function connect(port) {
  const tabs = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const tab = tabs.find(item=>item.type==='page');
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
  let serial=0;const pending=new Map();
  ws.onmessage=event=>{const message=JSON.parse(event.data);if(!pending.has(message.id))return;const entry=pending.get(message.id);pending.delete(message.id);message.error?entry.reject(new Error(message.error.message)):entry.resolve(message.result);};
  return {call(method,params={}){const id=++serial;return new Promise((resolve,reject)=>{pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});},close(){ws.close();}};
}
async function evalIn(cdp,expression) {
  const response=await cdp.call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
  if(response.exceptionDetails)throw new Error(response.exceptionDetails.text || 'Browser expression failed');
  return response.result.value;
}
async function until(cdp,expression,label,timeout=30000) {
  const start=Date.now();while(Date.now()-start<timeout){const result=await evalIn(cdp,expression);if(result)return result;await wait(250);}throw new Error(`Timed out: ${label}`);
}
async function main() {
  assert.ok(fs.existsSync(chromePath),`Chrome not found: ${chromePath}`);
  const profile=fs.mkdtempSync(path.join(os.tmpdir(),'prpd-planner-audit-'));
  const port=await freePort();
  const chrome=spawn(chromePath,['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check',`--remote-debugging-port=${port}`,`--user-data-dir=${profile}`,'about:blank'],{stdio:'ignore',windowsHide:true});
  let cdp;
  try {
    for(let i=0;i<80;i++){try{cdp=await connect(port);break;}catch{await wait(250);}}
    assert.ok(cdp,'CDP connection');
    await cdp.call('Page.enable');await cdp.call('Runtime.enable');
    await cdp.call('Emulation.setDeviceMetricsOverride',{width:1440,height:1050,deviceScaleFactor:1,mobile:false});
    await cdp.call('Page.navigate',{url:`${origin}/operations/cook-day-planner`});
    await until(cdp,'document.readyState === "complete" && Boolean(document.getElementById("syncOrdersBtn"))','planner page');
    await evalIn(cdp,'window.__auditErrors=[]; window.addEventListener("error",e=>window.__auditErrors.push(e.message)); document.getElementById("syncOrdersBtn").click()');
    await until(cdp,'!document.getElementById("syncOrdersBtn").disabled','order sync');
    await evalIn(cdp,'document.getElementById("cookDate").value="2026-09-19"');
    if(process.argv.includes('--refresh-reviewed-lock')) {
      const preserved=await evalIn(cdp,'JSON.stringify(Object.fromEntries(Object.entries(state.cookLog.fields).filter(([key])=>!key.startsWith("lock:"))))');
      assert.equal(await evalIn(cdp,'freezeCurrentBatchPlan({reuseLockedOrders:true,announce:false})'),true,'save reviewed revised recipe lock');
      assert.equal(await evalIn(cdp,'JSON.stringify(Object.fromEntries(Object.entries(state.cookLog.fields).filter(([key])=>!key.startsWith("lock:"))))'),preserved,'preserve production and packout records');
    }
    await evalIn(cdp,'document.getElementById("generateBtn").click()');
    await until(cdp,'document.getElementById("results").classList.contains("ready")','production packet');
    const state=await evalIn(cdp,'({badge:document.getElementById("batchLockBadge").textContent,status:document.getElementById("importStatus").textContent,metrics:document.getElementById("metrics").innerText,warning:document.getElementById("warnings").innerText})');
    assert.equal(state.badge,'Locked');
    assert.doesNotMatch(state.status,/Unlock, review|blocked|stopped|failed/i);
    if(process.argv.includes('--meatball-sauce')) {
      await evalIn(cdp,'document.querySelector("[data-kd-stage=sauces]").click()');
      const sauce=await evalIn(cdp,'(() => { const cards=[...document.querySelectorAll(".kd-content .kd-task")].filter(card=>card.querySelector("h3")?.textContent==="Meatball pasta · tomato sauce"); return {count:cards.length,text:cards[0]?.innerText || ""}; })()');
      assert.equal(sauce.count,1,'one combined meatball sauce card');
      assert.match(sauce.text,/4 Lean \+ 4 Bulk/i);
      assert.match(sauce.text,/1,?200 g/);
      assert.match(sauce.text,/128 g/);
      assert.match(sauce.text,/Stir until the paste is fully dispersed/);
      assert.match(sauce.text,/gentle simmer/);
      await evalIn(cdp,'[...document.querySelectorAll(".kd-content .kd-task")].find(card=>card.querySelector("h3")?.textContent==="Meatball pasta · tomato sauce").scrollIntoView()');
      const artifactDir=path.resolve(__dirname,'../../output/planner-meatball-sauce-2026-09-19');
      fs.mkdirSync(artifactDir,{recursive:true});
      const shot=await cdp.call('Page.captureScreenshot',{format:'png'});
      fs.writeFileSync(path.join(artifactDir,'sauce.png'),Buffer.from(shot.data,'base64'));
      await evalIn(cdp,'document.querySelector("[data-kd-stage=ahead]").click()');
      const pasta=await evalIn(cdp,'[...document.querySelectorAll(".kd-content .kd-task")].find(card=>card.querySelector("h3")?.textContent==="Meatball pasta · cook the pasta")?.innerText || ""');
      assert.match(pasta,/564 g/);
      assert.doesNotMatch(pasta,/Canned crushed tomatoes|Tomato paste|mozzarella/);
      await evalIn(cdp,'document.querySelector("[data-kd-stage=cook]").click();document.querySelector("[data-recipe=\\"dish:m4\\"]").open=true');
      const finish=await evalIn(cdp,'document.querySelector("[data-recipe=\\"dish:m4\\"] .kd-finish-sequence").innerText');
      assert.match(finish,/224 g/);
      assert.match(finish,/mozzarella/);
      assert.doesNotMatch(finish,/Canned crushed tomatoes|Tomato paste/);
      const browserErrors=await evalIn(cdp,'window.__auditErrors');
      assert.deepEqual(browserErrors,[]);
      await evalIn(cdp,'document.querySelector("[data-kd-stage=sauces]").click()');
      await cdp.call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
      assert.equal(await evalIn(cdp,'document.documentElement.scrollWidth>window.innerWidth+1'),false,'sauce mobile overflow');
      fs.writeFileSync(path.join(artifactDir,'browser-audit.json'),JSON.stringify({state,sauce,pasta,finish,browserErrors},null,2));
      console.log(JSON.stringify({state,sauce,pasta,finish,browserErrors},null,2));
      return;
    }
    const stages=[];
    const artifactDir=path.resolve(__dirname,'../../output/planner-audit-2026-09-18');
    fs.mkdirSync(artifactDir,{recursive:true});
    for(const stage of ['proteins','produce','sauces','ahead','cook','book']) {
      await evalIn(cdp,`document.querySelector('[data-kd-stage="${stage}"]').click()`);
      const view=await evalIn(cdp,'(() => { document.querySelectorAll(".kd-content details").forEach(card=>card.open=true); return {stage:document.querySelector(".kd-stage-heading h2")?.textContent,text:document.querySelector(".kd-content")?.innerText || "",cards:document.querySelectorAll(".kd-content .kd-task").length,recipes:document.querySelectorAll(".kd-content [data-recipe]").length,empty:document.querySelector(".kd-content .kd-empty")?.textContent || ""}; })()');
      assert.ok(view.text.length>30,`${stage} empty`);
      assert.doesNotMatch(view.text,/Missing raw-protein method|NaN|undefined|\[object Object\]/i,`${stage} invalid text`);
      if(stage==='sauces') {assert.match(view.text,/PRPD Sweet Heat Sauce/);assert.match(view.text,/270 g · 6 cups/);assert.match(view.text,/Valentina/);assert.match(view.text,/Hot-honey slider sauce/);}
      if(stage==='ahead') {
        assert.match(view.text,/Friday home-party chicken cook and box assembly/);
        assert.equal((view.text.match(/Plain rice · one shared pot/g)||[]).length,1);
        assert.match(view.text,/290 g dry/);
        assert.doesNotMatch(view.text,/cilantro finish|cilantro garnish allocation/);
        assert.ok(view.text.indexOf('PRPD lasagna tomato meat sauce')<view.text.indexOf('Lasagna ricotta layer'));
        assert.ok(view.text.indexOf('Lasagna ricotta layer')<view.text.indexOf('Assemble, fully bake'));
        assert.match(view.text,/Cook Cottage Pie beef filling/);assert.match(view.text,/Lemon-herb quinoa/);
      }
      if(stage==='cook') {assert.doesNotMatch(view.text,/Mediterranean Chicken Hummus Box/);assert.equal(view.recipes,12);}
      if(stage==='book')assert.equal(view.recipes,19);
      stages.push({stage,cards:view.cards,recipes:view.recipes,characters:view.text.length});
      fs.writeFileSync(path.join(artifactDir,`${stage}.txt`),view.text);
      await evalIn(cdp,'document.querySelector(".kd-stage-heading").scrollIntoView()');
      const shot=await cdp.call('Page.captureScreenshot',{format:'png'});
      fs.writeFileSync(path.join(artifactDir,`${stage}.png`),Buffer.from(shot.data,'base64'));
    }
    await evalIn(cdp,'document.querySelector("[data-view=packout]").click()');
    const packout=await evalIn(cdp,'({cards:[...document.querySelectorAll("#packoutContent .packout-card")].map(c=>({name:c.querySelector("h3")?.textContent,target:c.querySelector(".packout-count-banner strong")?.textContent})),text:document.getElementById("packoutProgressText").textContent})');
    assert.equal(packout.cards.length,5);
    assert.doesNotMatch(JSON.stringify(packout),/Owner Custom|Mediterranean Chicken Hummus Box/);
    assert.match(packout.text,/47 containers planned/);
    await evalIn(cdp,'document.querySelector("[data-view=cookmode]").click();document.querySelector("[data-cook-day=prep]").click()');
    const steps=[];
    for(let i=0;i<120;i++) {
      const step=await evalIn(cdp,'({day:document.querySelector(".cook-day-btn.active")?.dataset.cookDay,phase:document.querySelector(".cook-mode-hero h2")?.textContent,task:document.querySelector(".cook-action-card.current h3")?.textContent,detail:document.querySelector(".cook-live-reference")?.innerText || "",nextDisabled:document.getElementById("cookNext")?.disabled})');
      assert.ok(step.day && step.phase && step.task,`step ${i} missing heading`);
      assert.doesNotMatch(`${step.task} ${step.detail}`,/NaN|undefined|Missing raw-protein method|\[object Object\]/i,`step ${i} invalid text`);
      assert.ok(step.detail.length>=100,`step ${i} has incomplete detail: ${step.task}`);
      steps.push({day:step.day,phase:step.phase,task:step.task,detailChars:step.detail.length});
      if(step.nextDisabled)break;
      await evalIn(cdp,'document.getElementById("cookNext").click()');
    }
    assert.ok(steps.length<120,'step navigation terminates');
    assert.ok(steps.some(step=>step.day==='prep' && /Friday home-party chicken cook and box assembly/.test(step.task)),'party task on prep day');
    assert.equal(steps.some(step=>step.day==='cook' && /Mediterranean Chicken Hummus Box|Owner Custom/.test(step.task)),false,'party task leaked to cook day');
    assert.equal(steps.filter(step=>step.day==='prep' && /Lasagna: meat sauce, ricotta/.test(step.task)).length,1,'lasagna complete recipe runs once');
    assert.equal(steps.filter(step=>step.day==='prep' && /Sweet Heat Sauce/.test(step.task)).length,1,'Sweet Heat recipe once');
    assert.equal(steps.filter(step=>step.day==='prep' && /Plain rice/.test(step.task)).length,1,'shared rice once');
    assert.equal(steps.filter(step=>step.day==='cook' && /^Cook, finish, and portion/.test(step.task)).length,12,'every Cook Day dish once');
    assert.equal(steps.filter(step=>step.day==='cook' && /^Pack and verify /.test(step.task)).length,5);
    const browserErrors=await evalIn(cdp,'window.__auditErrors');
    assert.deepEqual(browserErrors,[]);
    await evalIn(cdp,'document.querySelector("[data-view=runbook]").click();document.querySelector("[data-kd-stage=ahead]").click()');
    await cdp.call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
    const overflow=await evalIn(cdp,'document.documentElement.scrollWidth>window.innerWidth+1');
    assert.equal(overflow,false,'mobile horizontal overflow');
    await evalIn(cdp,'document.querySelector(".kd-stage-heading").scrollIntoView()');
    const mobileShot=await cdp.call('Page.captureScreenshot',{format:'png'});
    fs.writeFileSync(path.join(artifactDir,'ahead-mobile.png'),Buffer.from(mobileShot.data,'base64'));
    fs.writeFileSync(path.join(artifactDir,'browser-audit.json'),JSON.stringify({state,stages,packout,steps,browserErrors},null,2));
    console.log(JSON.stringify({state,stages,packout,stepCount:steps.length,prepSteps:steps.filter(step=>step.day==='prep').length,cookSteps:steps.filter(step=>step.day==='cook').length,emptyDetailSteps:steps.filter(step=>step.detailChars===0).map(step=>step.task),steps,browserErrors},null,2));
  } finally {
    cdp?.close();chrome.kill();
    const tempRoot=path.resolve(os.tmpdir())+path.sep;
    if(path.resolve(profile).startsWith(tempRoot)&&path.basename(profile).startsWith('prpd-planner-audit-')) {
      for(let i=0;i<10;i++){try{fs.rmSync(profile,{recursive:true,force:true});break;}catch{await wait(200);}}
    }
  }
}
main().catch(error=>{console.error(error.stack||error.message);process.exitCode=1;});
