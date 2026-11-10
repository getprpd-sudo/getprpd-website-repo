#!/usr/bin/env node
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const net = require('node:net');
const { spawn } = require('node:child_process');

const origin = process.env.PRPD_LOCAL_ORIGIN || 'http://127.0.0.1:4173';
const chromePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

async function freePort() {
  const server = net.createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  await new Promise(resolve => server.close(resolve));
  return port;
}

async function connect(port) {
  const tabs = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const page = tabs.find(item => item.type === 'page');
  const socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let serial = 0;
  const pending = new Map();
  socket.onmessage = event => {
    const message = JSON.parse(event.data);
    if (!pending.has(message.id)) return;
    const entry = pending.get(message.id);
    pending.delete(message.id);
    message.error ? entry.reject(new Error(message.error.message)) : entry.resolve(message.result);
  };
  return {
    call(method, params = {}) {
      const id = ++serial;
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
        socket.send(JSON.stringify({ id, method, params }));
      });
    },
    close() { socket.close(); },
  };
}

async function evaluate(cdp, expression) {
  const response = await cdp.call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.text || 'Browser expression failed');
  return response.result.value;
}

async function until(cdp, expression, label, timeout = 30000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    if (await evaluate(cdp, expression)) return;
    await wait(250);
  }
  throw new Error(`Timed out: ${label}`);
}

async function main() {
  assert.ok(fs.existsSync(chromePath), `Chrome not found: ${chromePath}`);
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'prpd-day-split-'));
  const port = await freePort();
  const chrome = spawn(chromePath, [
    '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, 'about:blank',
  ], { stdio: 'ignore', windowsHide: true });
  let cdp;
  try {
    for (let attempt = 0; attempt < 80; attempt++) {
      try { cdp = await connect(port); break; } catch { await wait(250); }
    }
    assert.ok(cdp, 'CDP connection');
    await cdp.call('Page.enable');
    await cdp.call('Runtime.enable');
    await cdp.call('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1200, deviceScaleFactor: 1, mobile: false });
    await cdp.call('Page.navigate', { url: `${origin}/operations/cook-day-planner` });
    await until(cdp, 'document.readyState === "complete" && Boolean(document.getElementById("syncOrdersBtn"))', 'planner load');
    await evaluate(cdp, 'document.getElementById("syncOrdersBtn").click()');
    await until(cdp, '!document.getElementById("syncOrdersBtn").disabled', 'order sync');
    await evaluate(cdp, 'document.getElementById("generateBtn").click()');
    await until(cdp, 'document.getElementById("results").classList.contains("ready")', 'generated planner');
    await evaluate(cdp, 'document.querySelector("[data-view=runbook]").click(); document.querySelector("[data-kd-stage=all]").click()');
    await until(cdp, 'Boolean(document.querySelector(".kd-day-split"))', 'day split');
    const proof = await evaluate(cdp, `(() => {
      const today=document.querySelector('.kd-day-column.kd-today')?.innerText || '';
      const tomorrow=document.querySelector('.kd-day-column.kd-tomorrow')?.innerText || '';
      const body=document.body.innerText;
      document.querySelector('.kd-day-split').scrollIntoView({block:'start'});
      return {today,tomorrow,body};
    })()`);
    assert.match(proof.today, /DO TODAY/);
    assert.match(proof.today, /Stage Tikka wrap tortillas and vegetables/);
    assert.match(proof.today, /Hot Honey Slider assembly/);
    assert.match(proof.today, /Braise and debone the short ribs/);
    assert.match(proof.today, /Butter Chicken sauce/);
    assert.match(proof.tomorrow, /RESERVE FOR TOMORROW/);
    assert.match(proof.tomorrow, /Cook the seasoned chicken/i);
    assert.doesNotMatch(proof.body, /Complete the component exactly as written|complete measured recipe kit/i);
    const shot = await cdp.call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    const outputDir = path.resolve(__dirname, '../../output/current-planner');
    fs.mkdirSync(outputDir, { recursive: true });
    const outputPath = path.join(outputDir, 'batch-16-day-split.png');
    fs.writeFileSync(outputPath, Buffer.from(shot.data, 'base64'));
    console.log(outputPath);
  } finally {
    cdp?.close();
    chrome.kill();
    for (let attempt = 0; attempt < 10; attempt++) {
      try { fs.rmSync(profile, { recursive: true, force: true }); break; } catch { await wait(200); }
    }
  }
}

main().catch(error => { console.error(error.stack || error.message); process.exitCode = 1; });
