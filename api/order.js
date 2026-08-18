const { GoogleAuth } = require('google-auth-library');
const ORDER_CONFIG = require('../config/order-config');
const PhoneValidation = require('../phone-validation');
const {
  assertExactKeys,
  isLikelyBot,
  requestSourceError,
  safeLogError,
} = require('./_security');
const { sendWebEvent } = require('./_tiktok');
const { findReferralCode, promotionFromReferral } = require('./_referral-program');
const { quoteDeliveryZone } = require('./_delivery-zones');

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const GOOGLE_SERVICE_ACCOUNT_JSON = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
const GOOGLE_SERVICE_ACCOUNT_BASE64 = process.env.GOOGLE_SERVICE_ACCOUNT_BASE64;
const NOTIFICATION_EMAIL = 'getprpd@gmail.com';
const CUSTOMER_REPLY_EMAIL = 'hello@getprpd.com';
const PAYMENT_EMAIL = 'payments@getprpd.com';
const SENDER_EMAIL = 'PRPD Orders <orders@mail.getprpd.com>';

const ORDER_CUTOFF = ORDER_CONFIG.batch.cutoffIso;
const BATCH_NUMBER = ORDER_CONFIG.batch.number;
const DELIVERY_DATE = ORDER_CONFIG.batch.deliveryDate;
const MIN_ORDER_TOTAL = ORDER_CONFIG.policies.minimumOrder;
const MAX_QTY_PER_ITEM = ORDER_CONFIG.policies.maxQtyPerItem;
const MAX_TOTAL_ITEMS = ORDER_CONFIG.policies.maxTotalItems;
const PROMOTIONS = ORDER_CONFIG.promotions || { codes: [] };
const MAX_BODY_BYTES = 50_000;
const ORDER_KEYS = new Set([
  'action', 'orderId', 'batch', 'deliveryDate', 'firstName', 'lastName', 'phone',
  'email', 'fulfillmentMethod', 'deliveryAddress', 'deliveryHasUnit', 'deliveryUnit', 'deliveryCity', 'deliveryState',
  'deliveryZip', 'deliveryInstructions',
  'items', 'mealSubtotal', 'deliveryFee', 'exactTotal', 'total', 'promoCode',
  'discountAmount', 'menuEmailOptIn', 'notes', 'submittedAt', 'website',
  'formStartedAt', 'utmSource', 'utmMedium', 'utmCampaign', 'utmContent',
  'utmTerm', 'landingPage', 'referrer', 'tiktokTtclid', 'tiktokTtp',
  'googleClickId', 'googleClickIdType', 'adMatchType', 'adDevice', 'adNetwork',
]);
const ORDER_ITEM_KEYS = new Set([
  'id', 'name', 'category', 'section', 'tier', 'qty', 'unitPrice', 'subtotal',
]);

const PRICES = ORDER_CONFIG.prices;

function catalogForConfig(config) {
  return Object.values(config?.menu || {}).flat().reduce((catalog, dish) => {
    catalog[dish.id] = {
      name: dish.name,
      category: dish.category,
      price: Number.isFinite(Number(dish.price)) ? Number(dish.price) : null,
      available: dish.available !== false,
      maxQty: dish.maxQty || MAX_QTY_PER_ITEM,
    };
    return catalog;
  }, {});
}

const CATALOG = catalogForConfig(ORDER_CONFIG);
const ORDERING_CLOSED_MESSAGE = 'Ordering is currently closed while the next menu is being finalized.';

function isMenuPublished(config = ORDER_CONFIG) {
  return config?.batch?.published === true;
}

function sendJson(response, status, body) {
  response.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.end(JSON.stringify(body));
}

function money(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function deliveryPolicyForZip(zipCode, policies = ORDER_CONFIG.policies) {
  const quote = quoteDeliveryZone(zipCode, policies);
  return quote.supported ? quote.policy : null;
}

function safeText(value, maxLength) {
  return String(value || '').replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, maxLength);
}

function titleCase(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : '';
}

function normalizePromoCode(value) {
  return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 32);
}

function promotionForCode(value, promotions = PROMOTIONS.codes || []) {
  const code = normalizePromoCode(value);
  if (!code) return null;
  const promotion = promotions.find(item =>
    item && item.active !== false && normalizePromoCode(item.code) === code
  );
  if (!promotion) return null;
  if (promotion.expiresIso) {
    const expiresAt = new Date(promotion.expiresIso).getTime();
    if (!Number.isFinite(expiresAt) || Date.now() >= expiresAt) return null;
  }
  return promotion;
}

function discountForPromotion(promotion, mealSubtotal) {
  const minimumOrder = Math.max(MIN_ORDER_TOTAL, Number(promotion?.minimumOrder) || 0);
  if (!promotion || mealSubtotal < minimumOrder) return 0;
  const value = Number(promotion.value);
  if (!Number.isFinite(value) || value <= 0) return 0;
  const rawDiscount = promotion.type === 'percent' ? mealSubtotal * (value / 100) : value;
  const configuredCap = Number(promotion.maxDiscount);
  const cap = Number.isFinite(configuredCap) && configuredCap > 0 ? configuredCap : rawDiscount;
  return money(Math.max(0, Math.min(rawDiscount, cap, mealSubtotal)));
}

function normalizeItems(rawItems, catalog = CATALOG) {
  if (!Array.isArray(rawItems) || rawItems.length === 0 || rawItems.length > 50) {
    throw new Error('Add at least one valid item to your order.');
  }

  const combined = new Map();
  for (const raw of rawItems) {
    assertExactKeys(raw, ORDER_ITEM_KEYS, 'Order item');
    const id = safeText(raw && raw.id, 10);
    const catalogItem = catalog[id];
    if (!catalogItem) throw new Error('An unknown menu item was submitted.');

    const { name, category, price, available, maxQty } = catalogItem;
    if (!available) throw new Error(`${name} is sold out for this batch.`);
    let tier;
    if (category === 'dessert' || category === 'addon') {
      if (raw.tier !== null && raw.tier !== undefined && raw.tier !== '' && raw.tier !== 'single') {
        throw new Error(`Invalid tier for ${name}.`);
      }
      tier = 'single';
    } else {
      if (raw.tier !== 'lean' && raw.tier !== 'bulk') throw new Error(`Invalid tier for ${name}.`);
      tier = raw.tier;
    }
    const qty = Math.floor(Number(raw.qty));
    if (!Number.isFinite(qty) || qty < 1) throw new Error(`Invalid quantity for ${name}.`);

    const key = `${id}:${tier}`;
    const nextQty = (combined.get(key)?.qty || 0) + qty;
    if (nextQty > maxQty) throw new Error(`Too many servings of ${name}.`);
    combined.set(key, { id, name, category, price, tier, qty: nextQty });
  }

  const items = Array.from(combined.values()).map(item => {
    const unitPrice = Number.isFinite(item.price) ? item.price : PRICES[item.category][item.tier];
    const { price, ...normalizedItem } = item;
    return { ...normalizedItem, unitPrice, subtotal: money(unitPrice * item.qty) };
  });
  const totalQty = items.reduce((sum, item) => sum + item.qty, 0);
  if (totalQty > MAX_TOTAL_ITEMS) throw new Error('Please text Rida directly for very large orders.');
  return items;
}

function isValidOrderId(orderId, batchNumber = BATCH_NUMBER) {
  const orderIdPattern = new RegExp(`^PRPD-B${batchNumber}-\\d{8}-[A-F0-9]{4}(?:[A-F0-9]{4})?$`);
  return orderIdPattern.test(orderId);
}

function validateAndBuildOrder(raw, availablePromotions = PROMOTIONS.codes || [], context = {}) {
  const catalog = context.catalog || CATALOG;
  const batchNumber = context.batchNumber ?? BATCH_NUMBER;
  const cutoffIso = context.cutoffIso ?? ORDER_CUTOFF;
  const policies = context.policies || ORDER_CONFIG.policies;
  assertExactKeys(raw, ORDER_KEYS, 'Order request');
  if (!raw || raw.action !== 'order') throw new Error('Invalid order request.');
  const orderId = safeText(raw.orderId, 50);
  if (!isValidOrderId(orderId, batchNumber)) throw new Error('Invalid order reference.');

  const firstName = safeText(raw.firstName, 60);
  const lastName = safeText(raw.lastName, 60);
  const phone = safeText(raw.phone, 30);
  const email = safeText(raw.email, 160).toLowerCase();
  const fulfillmentMethod = safeText(raw.fulfillmentMethod || 'delivery', 20).toLowerCase();
  const deliveryAddress = safeText(raw.deliveryAddress, 180);
  const deliveryHasUnit = raw.deliveryHasUnit === true;
  const deliveryUnit = safeText(raw.deliveryUnit, 80);
  const deliveryCity = safeText(raw.deliveryCity, 80);
  const deliveryState = safeText(raw.deliveryState, 2).toUpperCase();
  const deliveryZip = safeText(raw.deliveryZip, 10);
  const deliveryInstructions = safeText(raw.deliveryInstructions, 300);
  const notes = safeText(raw.notes, 500);
  const promoCode = normalizePromoCode(raw.promoCode);
  const promotion = promoCode ? promotionForCode(promoCode, availablePromotions) : null;
  const menuEmailOptIn = raw.menuEmailOptIn === true;
  const attribution = {
    utmSource: safeText(raw.utmSource, 160),
    utmMedium: safeText(raw.utmMedium, 160),
    utmCampaign: safeText(raw.utmCampaign, 160),
    utmContent: safeText(raw.utmContent, 160),
    utmTerm: safeText(raw.utmTerm, 160),
    landingPage: safeText(raw.landingPage, 500),
    referrer: safeText(raw.referrer, 500),
    tiktokTtclid: safeText(raw.tiktokTtclid, 500),
    tiktokTtp: safeText(raw.tiktokTtp, 500),
    googleClickId: safeText(raw.googleClickId, 500),
    googleClickIdType: safeText(raw.googleClickIdType, 20),
    adMatchType: safeText(raw.adMatchType, 40),
    adDevice: safeText(raw.adDevice, 40),
    adNetwork: safeText(raw.adNetwork, 40),
  };
  if (!firstName) throw new Error('First name is required.');
  if (!lastName) throw new Error('Last name is required.');
  if (!PhoneValidation.isValid(phone)) throw new Error('A valid U.S. 10-digit phone number is required.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('A valid email address is required.');
  if (!['delivery', 'pickup'].includes(fulfillmentMethod)) throw new Error('Choose delivery or pickup.');
  if (fulfillmentMethod === 'delivery') {
    if (!deliveryAddress) throw new Error('Delivery address is required.');
    if (typeof raw.deliveryHasUnit !== 'boolean') throw new Error('Please indicate whether the address has an apartment, suite, or unit number.');
    if (deliveryHasUnit && !deliveryUnit) throw new Error('Apartment, suite, or unit number is required for this address.');
    if (!deliveryCity) throw new Error('Delivery city is required.');
    if (deliveryState !== 'TX') throw new Error('Delivery state must be TX.');
    if (!/^\d{5}$/.test(deliveryZip)) throw new Error('A valid 5-digit ZIP code is required.');
  }
  if (promoCode && !promotion) throw new Error('That referral or partner code is not active.');
  if (promotion?.ownerEmail && promotion.ownerEmail.toLowerCase() === email) {
    throw new Error('A referral code cannot be used by its owner.');
  }
  if (promotion?.ownerPhone && promotion.ownerPhone.replace(/\D/g, '').slice(-10) === phone.replace(/\D/g, '').slice(-10)) {
    throw new Error('A referral code cannot be used by its owner.');
  }
  if (Date.now() >= new Date(cutoffIso).getTime()) {
    throw new Error('Orders are closed for this week. Please contact Rida at (469) 545-0781.');
  }

  const items = normalizeItems(raw.items, catalog);
  const mealSubtotal = money(items.reduce((sum, item) => sum + item.subtotal, 0));
  const deliveryPolicy = fulfillmentMethod === 'pickup'
    ? (policies.deliveryZones?.pickup || {
      id: 'pickup', label: 'Pickup', minimumOrder: policies.minimumOrder,
      city: 'Frisco', state: 'TX', freeDeliveryThreshold: policies.minimumOrder, deliveryFee: 0,
    })
    : deliveryPolicyForZip(deliveryZip, policies);
  if (!deliveryPolicy) {
    throw new Error('Delivery is not currently available for this ZIP. Please text Rida before placing the order.');
  }
  if (mealSubtotal < deliveryPolicy.minimumOrder) {
    throw new Error(`The $${deliveryPolicy.minimumOrder.toFixed(0)} ${deliveryPolicy.label} order minimum has not been met.`);
  }
  const deliveryFee = mealSubtotal >= deliveryPolicy.freeDeliveryThreshold ? 0 : deliveryPolicy.deliveryFee;
  const discountAmount = discountForPromotion(promotion, mealSubtotal);
  const exactTotal = money(Math.max(0, mealSubtotal + deliveryFee - discountAmount));
  const roundedTotal = Math.ceil(exactTotal);
  if (!Number.isFinite(roundedTotal) || roundedTotal <= 0 || roundedTotal > 5000) {
    throw new Error('Invalid order total.');
  }

  const submittedAt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago', dateStyle: 'short', timeStyle: 'medium',
  }).format(new Date());

  return {
    orderId, firstName, lastName, phone, email, fulfillmentMethod, deliveryAddress, deliveryHasUnit, deliveryUnit,
    deliveryCity, deliveryState, deliveryZip, deliveryInstructions, notes, items, submittedAt,
    fullName: `${firstName} ${lastName}`,
    mealSubtotal, deliveryFee, discountAmount, exactTotal, roundedTotal,
    deliveryZone: deliveryPolicy.id,
    deliveryZoneLabel: deliveryPolicy.label,
    pickupCity: fulfillmentMethod === 'pickup' ? safeText(deliveryPolicy.city || 'Frisco', 100) : '',
    pickupState: fulfillmentMethod === 'pickup' ? safeText(deliveryPolicy.state || 'TX', 2).toUpperCase() : '',
    deliveryMinimum: deliveryPolicy.minimumOrder,
    freeDeliveryThreshold: deliveryPolicy.freeDeliveryThreshold,
    promoCode: promotion ? normalizePromoCode(promotion.code) : '',
    promotionPartner: promotion ? safeText(promotion.partner, 100) : '',
    menuEmailOptIn,
    ...attribution,
  };
}

function normalizedHouseholdAddress(address, zip) {
  const street = safeText(address, 240).toLowerCase()
    .replace(/\b(apartment|apt|suite|ste|unit|#)\b/g, ' ')
    .replace(/\b(street)\b/g, 'st')
    .replace(/\b(road)\b/g, 'rd')
    .replace(/\b(avenue)\b/g, 'ave')
    .replace(/\b(drive)\b/g, 'dr')
    .replace(/\b(lane)\b/g, 'ln')
    .replace(/\b(boulevard)\b/g, 'blvd')
    .replace(/[^a-z0-9]/g, '');
  return street && zip ? `${street}|${safeText(zip, 10)}` : '';
}

async function assertReferralEligibility(client, order, promotion) {
  if (!promotion) return;
  const rows = await readRange(client, "'Orders'!A2:AK5000");
  const email = order.email.toLowerCase();
  const phone = order.phone.replace(/\D/g, '').slice(-10);
  const household = order.fulfillmentMethod === 'delivery'
    ? normalizedHouseholdAddress(order.deliveryUnit ? `${order.deliveryAddress} ${order.deliveryUnit}` : order.deliveryAddress, order.deliveryZip)
    : '';
  const previousOrder = promotion.firstOrderOnly && rows.some((row) => {
    const priorOrderId = safeText(row[10], 50);
    const priorEmail = safeText(row[11], 160).toLowerCase();
    const priorPhone = safeText(row[5], 30).replace(/\D/g, '').slice(-10);
    const priorHousehold = normalizedHouseholdAddress(row[12], row[14]);
    return priorOrderId !== order.orderId && ((email && priorEmail === email)
      || (phone && priorPhone === phone)
      || (household && priorHousehold === household));
  });
  if (previousOrder) throw new Error('Referral discounts apply to a customer\'s first PRPD order only.');

  const maxRedemptions = Math.max(0, Math.floor(Number(promotion.maxRedemptions) || 0));
  if (maxRedemptions) {
    const code = normalizePromoCode(promotion.code);
    const usedOrderIds = new Set(rows.filter(row => normalizePromoCode(row[18]) === code)
      .map(row => safeText(row[10], 50)).filter(Boolean));
    if (usedOrderIds.size >= maxRedemptions) {
      throw new Error('That referral or partner offer has reached its redemption limit.');
    }
  }
}

function getCredentials() {
  if (!GOOGLE_SERVICE_ACCOUNT_BASE64 && !GOOGLE_SERVICE_ACCOUNT_JSON) {
    throw new Error('Google Sheets is not configured.');
  }
  let credentials;
  try {
    const json = GOOGLE_SERVICE_ACCOUNT_BASE64
      ? Buffer.from(GOOGLE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8')
      : GOOGLE_SERVICE_ACCOUNT_JSON;
    credentials = JSON.parse(json);
  } catch {
    throw new Error('Google service account configuration is invalid.');
  }
  if (credentials.private_key) credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
  return credentials;
}

async function getSheetsClient() {
  if (!SHEET_ID) throw new Error('Google Sheet ID is not configured.');
  const auth = new GoogleAuth({
    credentials: getCredentials(),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return auth.getClient();
}

function sheetsUrl(path) {
  return `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/${path}`;
}

async function ensureSheetColumnCapacity(client, sheetTitle, minimumColumns) {
  const metadata = await client.request({
    url: `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}?fields=sheets(properties(sheetId,title,gridProperties(columnCount)))`,
    method: 'GET',
  });
  const sheet = (metadata.data.sheets || []).find(item => item.properties?.title === sheetTitle);
  if (!sheet) throw new Error(`Google Sheet tab "${sheetTitle}" was not found.`);

  const currentColumns = Number(sheet.properties?.gridProperties?.columnCount || 0);
  if (currentColumns >= minimumColumns) return false;

  await client.request({
    url: `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}:batchUpdate`,
    method: 'POST',
    data: {
      requests: [{
        appendDimension: {
          sheetId: sheet.properties.sheetId,
          dimension: 'COLUMNS',
          length: minimumColumns - currentColumns,
        },
      }],
    },
  });
  return true;
}

async function readRange(client, range) {
  const result = await client.request({
    url: sheetsUrl(`values/${encodeURIComponent(range)}`),
    method: 'GET',
  });
  return result.data.values || [];
}

async function updateRange(client, range, values) {
  await client.request({
    url: sheetsUrl(`values/${encodeURIComponent(range)}?valueInputOption=RAW`),
    method: 'PUT',
    data: { values: [values] },
  });
}

function hasCellValue(value) {
  return String(value ?? '').trim() !== '';
}

function nextRecordRow(rows, firstDataRow = 2) {
  let lastUsedIndex = -1;
  rows.forEach((row, index) => {
    if (Array.isArray(row) && row.some(hasCellValue)) lastUsedIndex = index;
  });
  return firstDataRow + lastUsedIndex + 1;
}

async function ensureTrackingHeaders(client) {
  await Promise.all([
    ensureSheetColumnCapacity(client, 'Orders', 37),
    ensureSheetColumnCapacity(client, 'Payment Log', 16),
  ]);
  const headers = await Promise.all([
    readRange(client, "'Orders'!K1"),
    readRange(client, "'Orders'!L1:P1"),
    readRange(client, "'Payment Log'!N1"),
    readRange(client, "'Orders'!Q1:AC1"),
    readRange(client, "'Payment Log'!O1:P1"),
    readRange(client, "'Orders'!AD1:AE1"),
    readRange(client, "'Orders'!AF1:AJ1"),
    readRange(client, "'Orders'!AK1"),
  ]);
  if (safeText(headers[0]?.[0]?.[0], 50) !== 'Order ID') {
    await updateRange(client, "'Orders'!K1", ['Order ID']);
  }
  const deliveryHeaders = ['Email', 'Delivery Address', 'City', 'ZIP Code', 'Delivery Instructions'];
  if (JSON.stringify(headers[1]?.[0] || []) !== JSON.stringify(deliveryHeaders)) {
    await updateRange(client, "'Orders'!L1:P1", deliveryHeaders);
  }
  if (safeText(headers[2]?.[0]?.[0], 50) !== 'Order ID') {
    await updateRange(client, "'Payment Log'!N1", ['Order ID']);
  }
  const growthHeaders = [
    'Meal Subtotal', 'Delivery Fee', 'Discount Code', 'Discount Amount',
    'Referral Partner', 'Menu Email Opt-In', 'UTM Source', 'UTM Medium',
    'UTM Campaign', 'UTM Content', 'UTM Term', 'Landing Page', 'Referrer',
  ];
  if (JSON.stringify(headers[3]?.[0] || []) !== JSON.stringify(growthHeaders)) {
    await updateRange(client, "'Orders'!Q1:AC1", growthHeaders);
  }
  const paymentGrowthHeaders = ['Discount Code', 'Referral Partner'];
  if (JSON.stringify(headers[4]?.[0] || []) !== JSON.stringify(paymentGrowthHeaders)) {
    await updateRange(client, "'Payment Log'!O1:P1", paymentGrowthHeaders);
  }
  const addressHeaders = ['State', 'Address Has Unit'];
  if (JSON.stringify(headers[5]?.[0] || []) !== JSON.stringify(addressHeaders)) {
    await updateRange(client, "'Orders'!AD1:AE1", addressHeaders);
  }
  const googleAdsHeaders = ['Google Click ID', 'Google Click ID Type', 'Ad Match Type', 'Ad Device', 'Ad Network'];
  if (JSON.stringify(headers[6]?.[0] || []) !== JSON.stringify(googleAdsHeaders)) {
    await updateRange(client, "'Orders'!AF1:AJ1", googleAdsHeaders);
  }
  if (safeText(headers[7]?.[0]?.[0], 50) !== 'Fulfillment Method') {
    await updateRange(client, "'Orders'!AK1", ['Fulfillment Method']);
  }
}

function itemLines(order) {
  return order.items.map(item => {
    const tier = item.category === 'dessert' || item.category === 'addon' ? '' : ` (${titleCase(item.tier)})`;
    return `${item.qty}x ${item.name}${tier} - $${item.subtotal.toFixed(2)}`;
  });
}

function paymentCounts(items) {
  return items.reduce((counts, item) => {
    const paymentGroup = item.category === 'premium'
      ? 'beef'
      : item.category === 'addon'
        ? 'standard'
        : item.category;
    counts[paymentGroup] += item.qty;
    return counts;
  }, { standard: 0, beef: 0, dessert: 0 });
}

function tierSummary(items) {
  const tieredItems = items.filter(item => item.category !== 'dessert' && item.category !== 'addon');
  const tiers = new Set(tieredItems.map(item => item.tier));
  if (tiers.size === 0) {
    const hasDessert = items.some(item => item.category === 'dessert');
    const hasAddon = items.some(item => item.category === 'addon');
    if (hasDessert && hasAddon) return 'Desserts + Add-ons';
    return hasAddon ? 'Add-ons Only' : 'Dessert Only';
  }
  if (tiers.size > 1) return 'Mixed';
  return titleCase(Array.from(tiers)[0]);
}

async function ensureOrderSaved(client, order) {
  const rows = await readRange(client, "'Orders'!A2:AZ");
  const exists = rows.some(row => row.some(value => safeText(value, 50) === order.orderId));
  if (exists) return false;

  const lines = itemLines(order).concat([
    `${order.fulfillmentMethod === 'pickup' ? 'Pickup' : `Delivery (${order.deliveryZoneLabel || 'DFW'})`} - ${order.deliveryFee ? `$${order.deliveryFee.toFixed(2)}` : 'Free'}`,
    ...(order.discountAmount > 0 ? [`Partner discount (${order.promoCode}) - -$${order.discountAmount.toFixed(2)}`] : []),
  ]).join('\n');
  const targetRow = nextRecordRow(rows);
  await updateRange(client, `'Orders'!A${targetRow}:AK${targetRow}`, [
    order.submittedAt,
    `Batch ${BATCH_NUMBER}`,
    DELIVERY_DATE,
    order.firstName,
    order.lastName,
    order.phone,
    lines,
    order.exactTotal,
    order.roundedTotal,
    order.notes,
    order.orderId,
    order.email,
    order.fulfillmentMethod === 'pickup' ? 'Pickup - exact location sent after confirmation' : (order.deliveryUnit ? `${order.deliveryAddress}, ${order.deliveryUnit}` : order.deliveryAddress),
    order.fulfillmentMethod === 'pickup' ? (order.pickupCity || 'Frisco') : order.deliveryCity,
    order.fulfillmentMethod === 'pickup' ? '' : order.deliveryZip,
    order.deliveryInstructions,
    order.mealSubtotal,
    order.deliveryFee,
    order.promoCode,
    order.discountAmount,
    order.promotionPartner,
    order.menuEmailOptIn ? 'Yes' : 'No',
    order.utmSource,
    order.utmMedium,
    order.utmCampaign,
    order.utmContent,
    order.utmTerm,
    order.landingPage,
    order.referrer,
    order.deliveryState,
    order.deliveryHasUnit ? 'Yes' : 'No',
    order.googleClickId,
    order.googleClickIdType,
    order.adMatchType,
    order.adDevice,
    order.adNetwork,
    titleCase(order.fulfillmentMethod),
  ]);
  return true;
}

async function ensurePaymentLogSaved(client, order) {
  const rows = await readRange(client, "'Payment Log'!A2:P");
  if (rows.some(row => safeText(row[13], 50) === order.orderId)) return false;

  let index = rows.findIndex(row => !row.slice(0, 4).some(value => safeText(value, 200)));
  if (index === -1) index = rows.length;
  const targetRow = index + 2;
  const counts = paymentCounts(order.items);
  await updateRange(client, `'Payment Log'!A${targetRow}:P${targetRow}`, [
    `Batch ${BATCH_NUMBER}`,
    DELIVERY_DATE,
    '',
    order.fullName,
    tierSummary(order.items),
    counts.standard,
    counts.beef,
    counts.dessert,
    order.roundedTotal,
    '',
    order.roundedTotal,
    '',
    order.notes,
    order.orderId,
    order.promoCode,
    order.promotionPartner,
  ]);
  return true;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);
}

function formattedDeliveryAddress(order) {
  if (order.fulfillmentMethod === 'pickup') {
    return `${order.pickupCity || 'Frisco'}, ${order.pickupState || 'TX'} - exact pickup address sent after confirmation`;
  }
  const street = order.deliveryUnit
    ? `${order.deliveryAddress}, ${order.deliveryUnit}`
    : order.deliveryAddress;
  return `${street}, ${order.deliveryCity}, ${order.deliveryState} ${order.deliveryZip}`;
}

function acquisitionLabel(order) {
  const source = safeText(order.utmSource, 160);
  const medium = safeText(order.utmMedium, 160);
  if (order.googleClickId || source.toLowerCase() === 'google') return 'Google Ads / Search';
  if (source) return medium ? `${source} / ${medium}` : source;
  if (order.promotionPartner) return `Referral / ${order.promotionPartner}`;
  return 'Direct / unattributed';
}

async function sendResendEmail(message, idempotencyKey) {
  if (!RESEND_API_KEY) throw new Error('Resend is not configured.');
  const result = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify(message),
  });
  if (!result.ok) throw new Error(`Resend rejected the email (${result.status}).`);
}

async function sendOwnerOrderEmail(order) {
  const lines = itemLines(order);
  const address = formattedDeliveryAddress(order);
  const isPickup = order.fulfillmentMethod === 'pickup';
  const acquisition = acquisitionLabel(order);
  const text = [
    `New PRPD Order - ${order.fullName}`,
    '',
    `Order reference: ${order.orderId}`,
    `Batch: Batch ${BATCH_NUMBER}`,
    `${isPickup ? 'Pickup week' : 'Delivery'}: ${DELIVERY_DATE}`,
    `Submitted: ${order.submittedAt}`,
    `Phone: ${order.phone}`,
    `Email: ${order.email}`,
    `${isPickup ? 'Pickup' : 'Delivery address'}: ${address}`,
    order.deliveryInstructions ? `${isPickup ? 'Pickup timing notes' : 'Delivery instructions'}: ${order.deliveryInstructions}` : '',
    '',
    'ORDER:',
    ...lines.map(line => `  ${line}`),
    '',
    `Meal subtotal: $${order.mealSubtotal.toFixed(2)}`,
    `${isPickup ? 'Pickup' : `Delivery (${order.deliveryZoneLabel || 'DFW'})`}: ${order.deliveryFee ? `$${order.deliveryFee.toFixed(2)}` : 'Free'}`,
    order.discountAmount > 0 ? `Partner discount (${order.promoCode}): -$${order.discountAmount.toFixed(2)}` : '',
    `Total due: $${order.roundedTotal.toFixed(2)}`,
    `Exact pre-round total: $${order.exactTotal.toFixed(2)}`,
    order.promotionPartner ? `Referral partner: ${order.promotionPartner}` : '',
    `Acquisition: ${acquisition}`,
    order.utmCampaign ? `Ad campaign: ${order.utmCampaign}` : '',
    order.utmTerm ? `Ad keyword: ${order.utmTerm}` : '',
    order.adMatchType ? `Match type: ${order.adMatchType}` : '',
    order.adDevice ? `Device: ${order.adDevice}` : '',
    order.adNetwork ? `Network: ${order.adNetwork}` : '',
    `Weekly menu email: ${order.menuEmailOptIn ? 'Opted in' : 'Not requested'}`,
    order.notes ? `Notes: ${order.notes}` : '',
  ].filter(Boolean).join('\n');

  const htmlItems = lines.map(line => `<li style="margin:6px 0">${escapeHtml(line)}</li>`).join('');
  const html = `<div style="font-family:Arial,sans-serif;color:#1E2E1E;line-height:1.5;max-width:620px">
    <h1 style="font-size:22px">New PRPD Order</h1>
    <p><strong>${escapeHtml(order.fullName)}</strong><br>${escapeHtml(order.phone)}<br>${escapeHtml(order.email)}</p>
    <p><strong>${isPickup ? 'Pickup' : 'Delivery address'}</strong><br>${escapeHtml(address)}</p>
    ${order.deliveryInstructions ? `<p><strong>${isPickup ? 'Pickup timing notes' : 'Delivery instructions'}:</strong> ${escapeHtml(order.deliveryInstructions)}</p>` : ''}
    <p>Order reference: ${escapeHtml(order.orderId)}<br>Batch ${BATCH_NUMBER}<br>${isPickup ? 'Pickup week' : 'Delivery'}: ${escapeHtml(DELIVERY_DATE)}</p>
    <ul style="padding-left:20px">${htmlItems}</ul>
    <hr style="border:0;border-top:1px solid #d8d2c9">
    <p>Meals subtotal: <strong>$${order.mealSubtotal.toFixed(2)}</strong><br>
    ${isPickup ? 'Pickup' : `Delivery (${escapeHtml(order.deliveryZoneLabel || 'DFW')})`}: <strong>${order.deliveryFee ? `$${order.deliveryFee.toFixed(2)}` : 'Free'}</strong><br>
    ${order.discountAmount > 0 ? `Partner discount (${escapeHtml(order.promoCode)}): <strong>-$${order.discountAmount.toFixed(2)}</strong><br>` : ''}
    Total due: <strong>$${order.roundedTotal.toFixed(2)}</strong></p>
    ${order.promotionPartner ? `<p><strong>Referral partner:</strong> ${escapeHtml(order.promotionPartner)}</p>` : ''}
    <p><strong>Acquisition:</strong> ${escapeHtml(acquisition)}<br>
    ${order.utmCampaign ? `Campaign: ${escapeHtml(order.utmCampaign)}<br>` : ''}
    ${order.utmTerm ? `Keyword: ${escapeHtml(order.utmTerm)}<br>` : ''}
    ${order.adMatchType ? `Match type: ${escapeHtml(order.adMatchType)}<br>` : ''}
    ${order.adDevice ? `Device: ${escapeHtml(order.adDevice)}<br>` : ''}
    ${order.adNetwork ? `Network: ${escapeHtml(order.adNetwork)}` : ''}</p>
    <p><strong>Weekly menu email:</strong> ${order.menuEmailOptIn ? 'Opted in' : 'Not requested'}</p>
    ${order.notes ? `<p>Notes: ${escapeHtml(order.notes)}</p>` : ''}
  </div>`;

  await sendResendEmail({
    from: SENDER_EMAIL,
    to: [NOTIFICATION_EMAIL],
    reply_to: order.email,
    subject: `New Order: ${order.fullName} - $${order.roundedTotal.toFixed(2)}`,
    text,
    html,
  }, `order-owner-${order.orderId}`);
}

async function sendCustomerConfirmationEmail(order) {
  const lines = itemLines(order);
  const address = formattedDeliveryAddress(order);
  const isPickup = order.fulfillmentMethod === 'pickup';
  const text = [
    `Thanks for your order, ${order.firstName}.`,
    '',
    'PRPD received your weekly order. It is awaiting payment and final confirmation from Rida.',
    `Order reference: ${order.orderId}`,
    `${isPickup ? 'Pickup week' : 'Delivery'}: ${DELIVERY_DATE}`,
    `${isPickup ? 'Pickup' : 'Delivery address'}: ${address}`,
    '',
    'YOUR ORDER:',
    ...lines.map(line => `  ${line}`),
    '',
    `Meals subtotal: $${order.mealSubtotal.toFixed(2)}`,
    `${isPickup ? 'Pickup' : `Delivery (${order.deliveryZoneLabel || 'DFW'})`}: ${order.deliveryFee ? `$${order.deliveryFee.toFixed(2)}` : 'Free'}`,
    order.discountAmount > 0 ? `Partner discount (${order.promoCode}): -$${order.discountAmount.toFixed(2)}` : '',
    `Total due: $${order.roundedTotal.toFixed(2)}`,
    '',
    `Zelle $${order.roundedTotal.toFixed(2)} to ${PAYMENT_EMAIL}.`,
    'Confirm that the recipient displays PRPD before sending.',
    `Include your name or order reference ${order.orderId} in the memo.`,
    'Your order is confirmed after Rida verifies the payment.',
    'Questions? Reply to this email or text (469) 545-0781.',
    order.menuEmailOptIn ? 'You asked to receive PRPD weekly menu and cutoff emails.' : '',
  ].filter(Boolean).join('\n');

  const htmlItems = lines.map(line => `<li style="margin:8px 0">${escapeHtml(line)}</li>`).join('');
  const html = `<div style="font-family:Arial,sans-serif;color:#1E2E1E;line-height:1.6;max-width:620px;margin:0 auto;background:#ECE7DF;padding:30px">
    <div style="background:#1E2E1E;color:#ECE7DF;padding:20px 24px;margin-bottom:24px">
      <div style="font-size:28px;font-weight:700;letter-spacing:2px">PRPD</div>
      <div style="font-size:11px;letter-spacing:2px;color:#A8C4AB">MEALS. PREPPED.</div>
    </div>
    <h1 style="font-size:24px;margin:0 0 10px">Thanks for your order, ${escapeHtml(order.firstName)}.</h1>
    <p style="margin:0 0 22px;color:#526452">We received your weekly order. It is awaiting payment and final confirmation from Rida.</p>
    <div style="background:#fff;padding:20px 22px;border:1px solid #d8d2c9;margin-bottom:18px">
      <p style="margin:0 0 6px"><strong>Order reference:</strong> ${escapeHtml(order.orderId)}</p>
      <p style="margin:0 0 6px"><strong>${isPickup ? 'Pickup week' : 'Delivery'}:</strong> ${escapeHtml(DELIVERY_DATE)}</p>
      <p style="margin:0"><strong>${isPickup ? 'Pickup' : 'Address'}:</strong> ${escapeHtml(address)}</p>
    </div>
    <div style="background:#fff;padding:20px 22px;border:1px solid #d8d2c9">
      <h2 style="font-size:16px;margin:0 0 12px">Your order</h2>
      <ul style="padding-left:20px;margin:0 0 18px">${htmlItems}</ul>
      <hr style="border:0;border-top:1px solid #d8d2c9;margin:16px 0">
      <p style="margin:4px 0">Meals subtotal: <strong>$${order.mealSubtotal.toFixed(2)}</strong></p>
      <p style="margin:4px 0">${isPickup ? 'Pickup' : `Delivery (${escapeHtml(order.deliveryZoneLabel || 'DFW')})`}: <strong>${order.deliveryFee ? `$${order.deliveryFee.toFixed(2)}` : 'Free'}</strong></p>
      ${order.discountAmount > 0 ? `<p style="margin:4px 0">Partner discount (${escapeHtml(order.promoCode)}): <strong>-$${order.discountAmount.toFixed(2)}</strong></p>` : ''}
      <p style="margin:10px 0 0;font-size:18px">Total due: <strong>$${order.roundedTotal.toFixed(2)}</strong></p>
    </div>
    <div style="background:#fff;padding:20px 22px;border:2px solid #6f9a73;margin-top:18px">
      <h2 style="font-size:16px;margin:0 0 10px">Pay by Zelle</h2>
      <p style="margin:4px 0;font-size:18px">Send <strong>$${order.roundedTotal.toFixed(2)}</strong> to <strong>${PAYMENT_EMAIL}</strong>.</p>
      <p style="margin:4px 0"><strong>Before sending:</strong> confirm that the recipient displays PRPD.</p>
      <p style="margin:8px 0 0;color:#526452">Include your name or order reference <strong>${escapeHtml(order.orderId)}</strong> in the memo. Your order is confirmed after Rida verifies the payment.</p>
    </div>
    ${order.menuEmailOptIn ? '<p style="margin:6px 0;color:#526452">You asked to receive PRPD weekly menu and cutoff emails.</p>' : ''}
    <p style="margin:0;color:#526452">Questions? Reply to this email or text <a href="sms:+14695450781" style="color:#1E2E1E">(469) 545-0781</a>.</p>
  </div>`;

  await sendResendEmail({
    from: SENDER_EMAIL,
    to: [order.email],
    reply_to: CUSTOMER_REPLY_EMAIL,
    subject: `PRPD Order Received - ${order.orderId}`,
    text,
    html,
  }, `order-customer-${order.orderId}`);
}

module.exports = async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return sendJson(response, 405, { status: 'error', message: 'Method not allowed.' });
  }

  const contentType = String(request.headers['content-type'] || '').toLowerCase();
  if (!contentType.includes('application/json')) {
    return sendJson(response, 415, { status: 'error', message: 'JSON content is required.' });
  }

  const contentLength = Number(request.headers['content-length'] || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return sendJson(response, 413, { status: 'error', message: 'Order request is too large.' });
  }

  let raw;
  try {
    raw = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
  } catch {
    return sendJson(response, 400, { status: 'error', message: 'Invalid JSON request.' });
  }
  if (Buffer.byteLength(JSON.stringify(raw || {}), 'utf8') > MAX_BODY_BYTES) {
    return sendJson(response, 413, { status: 'error', message: 'Order request is too large.' });
  }

  const sourceError = requestSourceError(request);
  if (sourceError) return sendJson(response, 403, { status: 'error', message: sourceError });
  if (isLikelyBot(raw)) {
    return sendJson(response, 200, {
      status: 'success',
      orderId: safeText(raw && raw.orderId, 50),
      accepted: true,
    });
  }

  // Publication is an explicit owner-controlled gate. Draft data can remain in
  // the repository without allowing a legitimate public order to be created.
  if (!isMenuPublished()) {
    return sendJson(response, 409, { status: 'error', message: ORDERING_CLOSED_MESSAGE });
  }

  let order;
  let resolvedPromotion = null;
  try {
    const promoCode = normalizePromoCode(raw?.promoCode);
    const staticPromotion = promoCode ? promotionForCode(promoCode) : null;
    if (staticPromotion) resolvedPromotion = staticPromotion;
    else if (promoCode) resolvedPromotion = promotionFromReferral(await findReferralCode(promoCode));
    const availablePromotions = resolvedPromotion ? [...(PROMOTIONS.codes || []), resolvedPromotion] : PROMOTIONS.codes || [];
    order = validateAndBuildOrder(raw, availablePromotions);
  } catch (error) {
    return sendJson(response, 400, { status: 'error', message: error.message });
  }

  let storageStage = 'connecting to Google Sheets';
  try {
    const client = await getSheetsClient();
    storageStage = 'checking referral eligibility';
    try {
      await assertReferralEligibility(client, order, resolvedPromotion);
    } catch (error) {
      return sendJson(response, 400, { status: 'error', message: error.message });
    }
    storageStage = 'preparing sheet columns and headers';
    await ensureTrackingHeaders(client);
    storageStage = 'saving the order row';
    const orderCreated = await ensureOrderSaved(client, order);
    storageStage = 'saving the payment row';
    const paymentCreated = await ensurePaymentLogSaved(client, order);

    if (!orderCreated && !paymentCreated) {
      return sendJson(response, 200, {
        status: 'success',
        orderId: order.orderId,
        duplicate: true,
        total: order.roundedTotal,
        fulfillmentMethod: order.fulfillmentMethod,
        deliveryFee: order.deliveryFee,
        deliveryZone: order.deliveryZone,
        deliveryZoneLabel: order.deliveryZoneLabel,
        discountAmount: order.discountAmount,
        promoCode: order.promoCode,
        notificationSent: true,
        customerConfirmationSent: true,
      });
    }

    const [ownerEmail, customerEmail, tiktokEvent] = await Promise.allSettled([
      sendOwnerOrderEmail(order),
      sendCustomerConfirmationEmail(order),
      sendWebEvent({
        request,
        event: 'PlaceAnOrder',
        eventId: order.orderId,
        pageUrl: order.landingPage,
        referrer: order.referrer,
        email: order.email,
        phone: order.phone,
        tiktokTtp: order.tiktokTtp,
        tiktokTtclid: order.tiktokTtclid,
        properties: {
          content_type: 'product',
          content_id: order.orderId,
          currency: 'USD',
          value: order.roundedTotal,
          quantity: order.items.reduce((sum, item) => sum + item.qty, 0),
          contents: order.items.map(item => ({
            content_id: item.id,
            content_name: item.name,
            quantity: item.qty,
            price: item.unitPrice,
          })),
        },
      }),
    ]);
    const notificationSent = ownerEmail.status === 'fulfilled';
    const customerConfirmationSent = customerEmail.status === 'fulfilled';
    const tiktokEventSent = tiktokEvent.status === 'fulfilled' && tiktokEvent.value.sent === true;
    if (!notificationSent) safeLogError('Order saved but owner notification failed.', ownerEmail.reason);
    if (!customerConfirmationSent) safeLogError('Order saved but customer confirmation failed.', customerEmail.reason);
    if (tiktokEvent.status === 'rejected') safeLogError('Order saved but TikTok event failed.', tiktokEvent.reason);

    return sendJson(response, 200, {
      status: 'success',
      orderId: order.orderId,
      total: order.roundedTotal,
      fulfillmentMethod: order.fulfillmentMethod,
      deliveryFee: order.deliveryFee,
      deliveryZone: order.deliveryZone,
      deliveryZoneLabel: order.deliveryZoneLabel,
      discountAmount: order.discountAmount,
      promoCode: order.promoCode,
      notificationSent,
      customerConfirmationSent,
      tiktokEventSent,
    });
  } catch (error) {
    safeLogError(`Order submission failed while ${storageStage}.`, error);
    return sendJson(response, 502, {
      status: 'error',
      message: 'We could not confirm your order. Please try again or text Rida at (469) 545-0781.',
    });
  }
};

module.exports._test = {
  normalizeItems,
  normalizePromoCode,
  promotionForCode,
  discountForPromotion,
  isValidOrderId,
  validateAndBuildOrder,
  assertReferralEligibility,
  normalizedHouseholdAddress,
  ensureSheetColumnCapacity,
  paymentCounts,
  tierSummary,
  nextRecordRow,
  ORDER_KEYS,
  ORDER_ITEM_KEYS,
  sendCustomerConfirmationEmail,
  acquisitionLabel,
  isMenuPublished,
  catalogForConfig,
  deliveryPolicyForZip,
};
