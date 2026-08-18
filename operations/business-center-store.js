const fs = require('node:fs');
const path = require('node:path');

const SCHEMA_VERSION = 3;
const DATA_DIR = path.join(__dirname, 'private-data', 'business-center');
const DATA_FILE = path.join(DATA_DIR, 'state.json');

function cleanText(value, max = 500) {
  return String(value ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max);
}

function money(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0 || number > 1_000_000) throw new Error('Amount is invalid.');
  return Math.round(number * 100) / 100;
}

function optionalHttpsUrl(value) {
  const text = cleanText(value, 500);
  if (!text) return '';
  let parsed;
  try { parsed = new URL(text); } catch { throw new Error('Growth link is invalid.'); }
  if (parsed.protocol !== 'https:') throw new Error('Growth links must use HTTPS.');
  return parsed.toString();
}

function count(value, max = 100_000_000) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0 || number > max) throw new Error('Marketing metric is invalid.');
  return Math.round(number);
}

function validateCampaign(campaign) {
  if (typeof campaign !== 'object' || Array.isArray(campaign)) throw new Error('Marketing campaign is invalid.');
  const assets = Array.isArray(campaign.assets) ? campaign.assets.slice(0, 20).map((asset) => ({
    id: cleanText(asset.id, 100),
    title: cleanText(asset.title, 150),
    platform: cleanText(asset.platform, 80),
    format: cleanText(asset.format, 80),
    status: ['Idea', 'Needs footage', 'Edited', 'Approved', 'Posted'].includes(asset.status) ? asset.status : 'Idea',
    publishWindow: cleanText(asset.publishWindow, 100),
    hook: cleanText(asset.hook, 500),
    caption: cleanText(asset.caption, 4000),
    shotList: Array.isArray(asset.shotList) ? asset.shotList.slice(0, 20).map(item => cleanText(item, 300)).filter(Boolean) : [],
    trackedUrl: optionalHttpsUrl(asset.trackedUrl),
    postUrl: optionalHttpsUrl(asset.postUrl),
    notes: cleanText(asset.notes, 1500),
    metrics: {
      views: count(asset.metrics?.views),
      clicks: count(asset.metrics?.clicks),
      leads: count(asset.metrics?.leads),
      paidOrders: count(asset.metrics?.paidOrders),
      revenue: money(asset.metrics?.revenue),
      spend: money(asset.metrics?.spend),
    },
  })).filter(asset => asset.id && asset.title) : [];
  return {
    id: cleanText(campaign.id, 100),
    batchNumber: count(campaign.batchNumber, 10_000),
    name: cleanText(campaign.name, 160),
    featuredMealId: cleanText(campaign.featuredMealId, 100),
    featuredMeal: cleanText(campaign.featuredMeal, 160),
    deliveryDate: cleanText(campaign.deliveryDate, 100),
    cutoffLabel: cleanText(campaign.cutoffLabel, 100),
    generatedAt: cleanText(campaign.generatedAt, 40),
    assets,
  };
}

function validateMarketing(input) {
  const currentCampaign = input?.currentCampaign ? validateCampaign(input.currentCampaign) : null;
  const history = Array.isArray(input?.history)
    ? input.history.slice(0, 12).map(validateCampaign).filter(campaign => campaign.id !== currentCampaign?.id)
    : [];
  return { currentCampaign, history };
}

function validateState(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Business Center state is invalid.');
  const outreachEntries = Object.entries(input.outreach || {});
  if (outreachEntries.length > 200) throw new Error('Too many outreach records.');
  const outreach = {};
  for (const [rawId, raw] of outreachEntries) {
    const id = cleanText(rawId, 100);
    if (!/^[a-z0-9-]+$/i.test(id) || !raw || typeof raw !== 'object') throw new Error('Outreach record is invalid.');
    outreach[id] = {
      status: ['Not contacted', 'Draft ready', 'Contacted', 'Follow up', 'Meeting', 'Partner', 'Passed'].includes(raw.status) ? raw.status : 'Not contacted',
      owner: cleanText(raw.owner, 80), notes: cleanText(raw.notes, 1000), lastContact: cleanText(raw.lastContact, 30),
      nextAction: cleanText(raw.nextAction, 30), code: cleanText(raw.code, 32).toUpperCase().replace(/[^A-Z0-9_-]/g, ''),
      offer: cleanText(raw.offer, 200), tasting: ['Not offered', 'Offered', 'Scheduled', 'Completed', 'Declined'].includes(raw.tasting) ? raw.tasting : 'Not offered',
    };
  }
  const expenses = Array.isArray(input.expenses) ? input.expenses.slice(0, 1000).map(entry => ({
    id: cleanText(entry.id, 80), date: cleanText(entry.date, 20), batch: cleanText(entry.batch, 40),
    vendor: cleanText(entry.vendor, 100), category: cleanText(entry.category, 80), amount: money(entry.amount), notes: cleanText(entry.notes, 500),
  })).filter(entry => entry.id && entry.date) : [];
  const adImports = Array.isArray(input.adImports) ? input.adImports.slice(0, 100).map(entry => ({
    id: cleanText(entry.id, 80), importedAt: cleanText(entry.importedAt, 40), fileName: cleanText(entry.fileName, 180),
    platform: cleanText(entry.platform, 40) || 'TikTok', source: cleanText(entry.source, 20) || 'csv',
    batch: cleanText(entry.batch, 40), dateFrom: cleanText(entry.dateFrom, 30), dateTo: cleanText(entry.dateTo, 30),
    spend: money(entry.spend), impressions: Math.max(0, Math.round(Number(entry.impressions) || 0)),
    clicks: Math.max(0, Math.round(Number(entry.clicks) || 0)), conversions: Math.max(0, Math.round(Number(entry.conversions) || 0)),
    campaigns: Array.isArray(entry.campaigns) ? entry.campaigns.slice(0, 100).map(row => ({
      name: cleanText(row.name, 180), spend: money(row.spend), impressions: Math.max(0, Math.round(Number(row.impressions) || 0)),
      clicks: Math.max(0, Math.round(Number(row.clicks) || 0)), conversions: Math.max(0, Math.round(Number(row.conversions) || 0)),
    })) : [],
  })).filter(entry => entry.id) : [];
  const lifecycleEntries = Object.entries(input.lifecycle || {});
  if (lifecycleEntries.length > 500) throw new Error('Too many lifecycle records.');
  const lifecycle = {};
  for (const [rawEmail, raw] of lifecycleEntries) {
    const email = cleanText(rawEmail, 254).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email) || !raw || typeof raw !== 'object') {
      throw new Error('Lifecycle record is invalid.');
    }
    lifecycle[email] = {
      status: ['Not contacted', 'Draft ready', 'Contacted', 'Follow up', 'Converted', 'Do not contact'].includes(raw.status)
        ? raw.status
        : 'Not contacted',
      notes: cleanText(raw.notes, 1000),
      lastContact: cleanText(raw.lastContact, 30),
    };
  }
  const growthSettings = {
    googleReviewUrl: optionalHttpsUrl(input.growthSettings?.googleReviewUrl),
  };
  const googleBusiness = {
    status: ['Not started', 'Profile created', 'Verification pending', 'Verified'].includes(input.googleBusiness?.status)
      ? input.googleBusiness.status
      : 'Not started',
    profileUrl: optionalHttpsUrl(input.googleBusiness?.profileUrl),
    verificationMethod: cleanText(input.googleBusiness?.verificationMethod, 100),
    notes: cleanText(input.googleBusiness?.notes, 1000),
    updatedAt: cleanText(input.googleBusiness?.updatedAt, 40),
  };
  const marketing = validateMarketing(input.marketing);
  return { schemaVersion: SCHEMA_VERSION, updatedAt: new Date().toISOString(), outreach, expenses, adImports, lifecycle, growthSettings, googleBusiness, marketing };
}

function readJson(filePath) {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch { return null; }
}

function loadState() {
  const stored = readJson(DATA_FILE) || readJson(`${DATA_FILE}.bak`) || {};
  return {
    schemaVersion: SCHEMA_VERSION,
    updatedAt: stored.updatedAt || null,
    outreach: stored.outreach || {},
    expenses: stored.expenses || [],
    adImports: stored.adImports || [],
    lifecycle: stored.lifecycle || {},
    growthSettings: stored.growthSettings || { googleReviewUrl: '' },
    googleBusiness: stored.googleBusiness || { status: 'Not started', profileUrl: '', verificationMethod: '', notes: '', updatedAt: '' },
    marketing: stored.marketing || { currentCampaign: null, history: [] },
  };
}

function saveState(input) {
  const state = validateState(input);
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const temp = `${DATA_FILE}.${process.pid}.tmp`;
  if (fs.existsSync(DATA_FILE)) fs.copyFileSync(DATA_FILE, `${DATA_FILE}.bak`);
  fs.writeFileSync(temp, `${JSON.stringify(state, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' });
  fs.renameSync(temp, DATA_FILE);
  return state;
}

module.exports = { SCHEMA_VERSION, validateState, loadState, saveState, DATA_FILE };
