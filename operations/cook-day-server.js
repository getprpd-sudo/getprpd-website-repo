const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const cookLogStore = require('./cook-log-store');
const businessCenterStore = require('./business-center-store');
const businessCenterCore = require('../api/_business-center-core');
const { GoogleAuth } = require('google-auth-library');

const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.env.PRPD_PLANNER_PORT || 4173);
const KEY_FILE = path.join(__dirname, '.planner-key');
const REMOTE_URL = process.env.PRPD_PLANNER_API_URL || 'https://getprpd.vercel.app/api/planner-orders';
const REMOTE_BUSINESS_URL = process.env.PRPD_BUSINESS_API_URL || 'https://getprpd.vercel.app/api/business-data';
const REMOTE_TIKTOK_REPORT_URL = process.env.PRPD_TIKTOK_REPORT_API_URL || 'https://getprpd.vercel.app/api/tiktok-report';
const LOCAL_SHEET_ID = process.env.GOOGLE_SHEET_ID || '1NV0QIpRINRP5IUs550kKPdYSQZcOrTm9ncHkTcXilFg';
const BUSINESS_SNAPSHOT_FILE = path.join(__dirname, 'private-data', 'business-center', 'sheets-snapshot.json');

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.otf': 'font/otf', '.ttf': 'font/ttf',
};

function json(response, status, body) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  response.end(JSON.stringify(body));
}

async function proxyOrders(response) {
  try {
    const key = fs.readFileSync(KEY_FILE, 'utf8').trim();
    if (!key) throw new Error('Planner key is empty.');
    const upstream = await fetch(REMOTE_URL, {
      headers: { 'x-prpd-planner-key': key, 'accept': 'application/json' },
      signal: AbortSignal.timeout(15000),
    });
    const body = await upstream.json().catch(() => ({ error: 'Invalid sync response.' }));
    json(response, upstream.status, body);
  } catch (error) {
    json(response, 502, { error: 'Live sync is unavailable. CSV and pasted-row import still work.' });
  }
}

function plannerKey() {
  const key = fs.readFileSync(KEY_FILE, 'utf8').trim();
  if (!key) throw new Error('Planner key is empty.');
  return key;
}

function findLocalServiceAccount() {
  const match = fs.readdirSync(ROOT).find(name => /(?:website|service-account).*\.json$/i.test(name));
  return match ? path.join(ROOT, match) : '';
}

function localGoogleCredentials() {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_BASE64) {
    return JSON.parse(Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8'));
  }
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  }
  const credentialFile = findLocalServiceAccount();
  if (!credentialFile) throw new Error('Local Google credentials were not found.');
  return JSON.parse(fs.readFileSync(credentialFile, 'utf8'));
}

async function readBusinessDataLocally() {
  const credentials = localGoogleCredentials();
  if (credentials.private_key) credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
  const auth = new GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'] });
  const client = await auth.getClient();
  const ranges = {
    orders: "'Orders'!A1:AC5000",
    payments: "'Payment Log'!A1:P5000",
    leads: "'Website Leads'!A1:T5000",
    receivables: "'Accounts Receivable'!A1:H500",
  };
  const entries = await Promise.all(Object.entries(ranges).map(async ([name, range]) => {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${LOCAL_SHEET_ID}/values/${encodeURIComponent(range)}`;
    const result = await client.request({ url, method: 'GET' });
    return [name, result.data.values || []];
  }));
  return { fetchedAt: new Date().toISOString(), source: 'local-readonly', ...Object.fromEntries(entries) };
}

async function readCurrentOrdersFallback() {
  const upstream = await fetch(REMOTE_URL, {
    headers: { 'x-prpd-planner-key': plannerKey(), accept: 'application/json' },
    signal: AbortSignal.timeout(15000),
  });
  if (!upstream.ok) throw new Error('Current orders fallback is unavailable.');
  const body = await upstream.json();
  const rows = Array.isArray(body.rows) ? body.rows : [];
  const includesHeader = Array.isArray(rows[0]) && rows[0].some(value => String(value || '').trim() === 'Batch');
  return {
    fetchedAt: body.fetchedAt || new Date().toISOString(),
    source: 'protected-orders-fallback',
    partial: true,
    missing: ['Payment Log', 'Website Leads'],
    orders: includesHeader ? rows : [businessCenterCore.ORDER_HEADERS, ...rows],
    payments: [businessCenterCore.PAYMENT_HEADERS],
    leads: [businessCenterCore.LEAD_HEADERS],
    receivables: [businessCenterCore.RECEIVABLE_HEADERS],
  };
}

function rawOrderBatch(row) {
  if (!Array.isArray(row)) return 0;
  const value = row.find(cell => /^batch\s*\d+$/i.test(String(cell || '').trim()));
  return businessCenterCore.batchNumber(value);
}

function readHistoricalSnapshot(current) {
  if (!fs.existsSync(BUSINESS_SNAPSHOT_FILE)) return current;
  const snapshot = JSON.parse(fs.readFileSync(BUSINESS_SNAPSHOT_FILE, 'utf8'));
  const currentRows = Array.isArray(current.orders) ? current.orders.slice(1) : [];
  const currentBatches = new Set(currentRows.map(rawOrderBatch).filter(Boolean));
  const snapshotRows = Array.isArray(snapshot.orders) ? snapshot.orders.slice(1) : [];
  const historicalRows = snapshotRows.filter(row => !currentBatches.has(rawOrderBatch(row)));
  return {
    ...snapshot,
    fetchedAt: current.fetchedAt,
    snapshotAt: snapshot.fetchedAt || '',
    source: 'historical-snapshot-plus-live-orders',
    partial: false,
    orders: [businessCenterCore.ORDER_HEADERS, ...historicalRows, ...currentRows],
  };
}

async function proxyBusinessData(response) {
  try {
    const upstream = await fetch(REMOTE_BUSINESS_URL, {
      headers: { 'x-prpd-planner-key': plannerKey(), accept: 'application/json' }, signal: AbortSignal.timeout(15000),
    });
    if (upstream.ok) return json(response, 200, await upstream.json());
    return json(response, 200, await readBusinessDataLocally());
  } catch {
    try { return json(response, 200, await readBusinessDataLocally()); }
    catch {
      try { return json(response, 200, readHistoricalSnapshot(await readCurrentOrdersFallback())); }
      catch { return json(response, 502, { error: 'Business data sync is unavailable.' }); }
    }
  }
}

async function proxyTikTokReport(request, response) {
  try {
    const localUrl = new URL(request.url, `http://${request.headers.host || '127.0.0.1'}`);
    const upstreamUrl = new URL(REMOTE_TIKTOK_REPORT_URL);
    for (const key of ['startDate', 'endDate']) {
      const value = localUrl.searchParams.get(key);
      if (value) upstreamUrl.searchParams.set(key, value);
    }
    const upstream = await fetch(upstreamUrl, {
      headers: { 'x-prpd-planner-key': plannerKey(), accept: 'application/json' },
      signal: AbortSignal.timeout(15000),
    });
    return json(response, upstream.status, await upstream.json().catch(() => ({ error: 'Invalid TikTok report response.' })));
  } catch {
    return json(response, 502, { error: 'TikTok reporting sync is unavailable. CSV import still works.' });
  }
}

function readRequestBody(request, limit = 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    request.on('data', (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(new Error('Request is too large.'));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on('end', () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')); }
      catch { reject(new Error('Invalid JSON.')); }
    });
    request.on('error', reject);
  });
}

async function handleCookLog(request, response) {
  try {
    if (request.method === 'GET') {
      const url = new URL(request.url, `http://${request.headers.host || '127.0.0.1'}`);
      const record = cookLogStore.loadLog(url.searchParams.get('batchKey') || '');
      return json(response, 200, { record });
    }
    if (request.method === 'POST') {
      const record = cookLogStore.saveLog(await readRequestBody(request));
      return json(response, 200, { status: 'saved', record });
    }
    return json(response, 405, { error: 'Method not allowed.' });
  } catch (error) {
    return json(response, 400, { error: error.message || 'Cook log could not be saved.' });
  }
}

async function handleBusinessState(request, response) {
  try {
    if (request.method === 'GET') return json(response, 200, { state: businessCenterStore.loadState() });
    if (request.method === 'POST') {
      const state = businessCenterStore.saveState(await readRequestBody(request, 2 * 1024 * 1024));
      return json(response, 200, { status: 'saved', state });
    }
    return json(response, 405, { error: 'Method not allowed.' });
  } catch (error) {
    return json(response, 400, { error: error.message || 'Business Center state could not be saved.' });
  }
}

function serveFile(requestPath, response) {
  let decoded;
  try { decoded = decodeURIComponent(requestPath.split('?')[0]); } catch { return json(response, 400, { error: 'Invalid path.' }); }
  const aliases = {
    '/operations/label-studio': 'operations/label-studio.html',
    '/operations/cook-day-planner': 'operations/cook-day-planner.html',
    '/operations/grocery-list': 'operations/grocery-list.html',
    '/operations/business-center': 'operations/business-center.html',
  };
  const relative = decoded === '/' ? 'operations/cook-day-planner.html' : aliases[decoded] || decoded.replace(/^\/+/, '');
  const filePath = path.resolve(ROOT, relative);
  if (filePath !== ROOT && !filePath.startsWith(`${ROOT}${path.sep}`)) return json(response, 403, { error: 'Forbidden.' });
  fs.stat(filePath, (statError, stat) => {
    if (statError || !stat.isFile()) return json(response, 404, { error: 'Not found.' });
    response.writeHead(200, {
      'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
    });
    fs.createReadStream(filePath).pipe(response);
  });
}

const server = http.createServer(async (request, response) => {
  const pathname = request.url.split('?')[0];
  if (pathname === '/api/cook-log') return handleCookLog(request, response);
  if (pathname === '/api/business-state') return handleBusinessState(request, response);
  if (request.method !== 'GET') return json(response, 405, { error: 'Method not allowed.' });
  if (pathname === '/api/current-orders') return proxyOrders(response);
  if (pathname === '/api/business-data') return proxyBusinessData(response);
  if (pathname === '/api/tiktok-report') return proxyTikTokReport(request, response);
  serveFile(request.url, response);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`PRPD Cook-Day Planner: http://127.0.0.1:${PORT}/operations/cook-day-planner.html`);
});
