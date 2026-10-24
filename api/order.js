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
  'items', 'sauces', 'mealSubtotal', 'deliveryFee', 'exactTotal', 'total', 'promoCode',
  'discountAmount', 'taxableSubtotal', 'taxableDelivery', 'taxRate', 'salesTax',
  'menuEmailOptIn', 'notes', 'submittedAt', 'website',
  'discoverySource',
  'formStartedAt', 'utmSource', 'utmMedium', 'utmCampaign', 'utmContent',
  'utmTerm', 'landingPage', 'referrer', 'tiktokTtclid', 'tiktokTtp',
  'googleClickId', 'googleClickIdType', 'adMatchType', 'adDevice', 'adNetwork',
]);
const ORDER_ITEM_KEYS = new Set([
  'id', 'name', 'category', 'section', 'tier', 'qty', 'unitPrice', 'subtotal',
]);
const SAUCE_SELECTION_KEYS = new Set(['id', 'qty']);

const PRICES = ORDER_CONFIG.prices;
const DISCOVERY_SOURCES = new Set([
  '', 'Google Search', 'Instagram', 'TikTok', 'Friend or family', 'Gym or trainer',
  'Mosque or community', 'Creator or food page', 'Other',
]);

function catalogForConfig(config) {
  return Object.values(config?.menu || {}).flat().reduce((catalog, dish) => {
    catalog[dish.id] = {
      name: dish.name,
      category: dish.category,
      price: Number.isFinite(Number(dish.price)) ? Number(dish.price) : null,
      available: dish.available !== false,
      taxClass: safeText(dish.taxClass || 'classification-pending', 60),
      maxQty: dish.maxQty || MAX_QTY_PER_ITEM,
      servingCount: Number.isFinite(Number(dish.servingCount)) ? Number(dish.servingCount) : 1,
      variants: Array.isArray(dish.variants)
        ? dish.variants.map(variant => ({
            id: safeText(variant.id, 40),
            label: safeText(variant.label, 100),
            price: Number.isFinite(Number(variant.price)) ? Number(variant.price) : null,
          })).filter(variant => variant.id && variant.label)
        : [],
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

function calculateSalesTax(items, mealSubtotal, deliveryFee, discountAmount, taxPolicy = ORDER_CONFIG.tax) {
  if (!taxPolicy?.enabled) {
    return { taxableSubtotal: 0, taxableDelivery: 0, taxRate: 0, salesTax: 0 };
  }

  const rate = Number(taxPolicy.rate);
  if (!Number.isFinite(rate) || rate < 0 || rate > 0.2) {
    throw new Error('Sales-tax configuration is invalid.');
  }
  const taxableClasses = new Set(taxPolicy.taxableClasses || []);
  const unresolved = items.filter(item => !item.taxClass || item.taxClass === 'classification-pending');
  if (unresolved.length) {
    throw new Error('Sales-tax classification is incomplete for one or more menu items.');
  }

  const merchandise = money(Math.max(0, mealSubtotal));
  const taxableMerchandise = money(items.reduce((sum, item) => (
    taxableClasses.has(item.taxClass) ? sum + item.subtotal : sum
  ), 0));
  const taxableRatio = merchandise > 0 ? Math.min(1, taxableMerchandise / merchandise) : 0;
  const taxableDiscount = money(Math.max(0, discountAmount) * taxableRatio);
  const taxableSubtotal = money(Math.max(0, taxableMerchandise - taxableDiscount));
  const taxableDelivery = taxPolicy.deliveryMode === 'all-when-any'
    ? (taxableSubtotal > 0 ? money(deliveryFee) : 0)
    : taxPolicy.deliveryMode === 'none'
      ? 0
      : money(Math.max(0, deliveryFee) * taxableRatio);
  const salesTax = money((taxableSubtotal + taxableDelivery) * rate);
  return { taxableSubtotal, taxableDelivery, taxRate: rate, salesTax };
}

function roundedFoodSubtotal(value) {
  return Math.ceil(money(value));
}

function orderMinimumReached(mealSubtotal, minimumOrder) {
  return roundedFoodSubtotal(mealSubtotal) >= Number(minimumOrder);
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

    const { name, category, price, available, maxQty, servingCount, taxClass } = catalogItem;
    let selectedPrice = price;
    const variants = Array.isArray(catalogItem.variants) ? catalogItem.variants : [];
    if (!available) throw new Error(`${name} is sold out for this batch.`);
    let tier;
    let variantLabel = '';
    if (variants.length > 0) {
      const variant = variants.find(option => option.id === raw.tier);
      if (!variant) throw new Error(`Choose a valid weekly split for ${name}.`);
      tier = variant.id;
      variantLabel = variant.label;
      if (Number.isFinite(variant.price)) selectedPrice = variant.price;
    } else if (category === 'dessert' || category === 'addon') {
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
    combined.set(key, { id, name, category, price: selectedPrice, tier, variantLabel, servingCount, taxClass, qty: nextQty });
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

function normalizeSauceSelections(rawSelections, items, sauceProgram = ORDER_CONFIG.sauceProgram) {
  const disabled = !sauceProgram?.enabled;
  const provided = Array.isArray(rawSelections) ? rawSelections : [];
  if (rawSelections !== undefined && !Array.isArray(rawSelections)) {
    throw new Error('Sauce selections are invalid.');
  }
  if (disabled) {
    if (provided.length) throw new Error('Sauce selection is not available for this menu.');
    return {
      enabled: false, selections: [], requestedSelections: [], totalCredits: 0,
      reservedCredits: 0, selectableCredits: 0, selectedQty: 0,
      extraQty: 0, extraSubtotal: 0,
    };
  }

  const choices = new Map((sauceProgram.choices || []).map(choice => [safeText(choice?.id, 60), {
    id: safeText(choice?.id, 60),
    name: safeText(choice?.name, 100),
  }]).filter(([id, choice]) => id && choice.name));
  if (choices.size === 0) throw new Error('Sauce choices are not configured.');

  const requested = new Map();
  for (const raw of provided) {
    assertExactKeys(raw, SAUCE_SELECTION_KEYS, 'Sauce selection');
    const id = safeText(raw?.id, 60);
    if (!choices.has(id)) throw new Error('An unknown sauce was submitted.');
    const qty = Number(raw?.qty);
    if (!Number.isSafeInteger(qty) || qty < 1) throw new Error('Sauce quantities must be whole cups.');
    requested.set(id, (requested.get(id) || 0) + qty);
  }

  if (provided.length && !items.some(item => Number(item.qty) > 0)) throw new Error('Add food before selecting sauces.');
  const summary = require('../sauce-program').quote(Object.fromEntries(requested), items, sauceProgram);
  const { totalCredits, reservedCredits, selectableCredits, selectedQty, extraQty } = summary;
  const maxExtraCups = Math.max(0, Number(sauceProgram.maxExtraCups) || 50);
  if (extraQty > maxExtraCups) throw new Error(`Choose no more than ${maxExtraCups} extra sauce cups.`);
  const extraPrice = Number(sauceProgram.extraPrice);
  if (!Number.isFinite(extraPrice) || extraPrice < 0) throw new Error('Extra sauce pricing is invalid.');

  const final = new Map(requested);
  const toSelection = ([id, qty]) => ({ id, name: choices.get(id).name, qty });
  return {
    enabled: true,
    selections: Array.from(final.entries()).filter(([, qty]) => qty > 0).map(toSelection),
    requestedSelections: Array.from(requested.entries()).filter(([, qty]) => qty > 0).map(toSelection),
    totalCredits,
    reservedCredits,
    selectableCredits,
    selectedQty,
    extraQty,
    extraSubtotal: money(extraQty * extraPrice),
  };
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
  const taxPolicy = context.tax || ORDER_CONFIG.tax;
  const sauceProgram = context.sauceProgram ?? ORDER_CONFIG.sauceProgram;
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
  const discoverySource = safeText(raw.discoverySource, 60);
  if (!DISCOVERY_SOURCES.has(discoverySource)) throw new Error('Invalid discovery source.');
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
  if (promoCode && !promotion) throw new Error('That referral or partner code is not active.');
  const pickupReferralVerification = fulfillmentMethod === 'pickup' && promotion?.firstOrderOnly;
  if (fulfillmentMethod === 'delivery' || pickupReferralVerification) {
    if (!deliveryAddress) {
      throw new Error(pickupReferralVerification
        ? 'A home street address is required to verify first-order pickup eligibility.'
        : 'Delivery address is required.');
    }
    if (typeof raw.deliveryHasUnit !== 'boolean') throw new Error('Please indicate whether the address has an apartment, suite, or unit number.');
    if (deliveryHasUnit && !deliveryUnit) throw new Error('Apartment, suite, or unit number is required for this address.');
    if (fulfillmentMethod === 'delivery' && !deliveryCity) throw new Error('Delivery city is required.');
    if (deliveryState !== 'TX') throw new Error('Address state must be TX.');
    if (!/^\d{5}$/.test(deliveryZip)) throw new Error('A valid 5-digit ZIP code is required.');
  }
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
  const sauces = normalizeSauceSelections(raw.sauces, items, sauceProgram);
  const mealSubtotal = money(items.reduce((sum, item) => sum + item.subtotal, 0) + sauces.extraSubtotal);
  const deliveryPolicy = fulfillmentMethod === 'pickup'
    ? (policies.deliveryZones?.pickup || {
      id: 'pickup', label: 'Pickup', minimumOrder: policies.minimumOrder,
      city: 'Frisco', state: 'TX', freeDeliveryThreshold: policies.minimumOrder, deliveryFee: 0,
    })
    : deliveryPolicyForZip(deliveryZip, policies);
  if (!deliveryPolicy) {
    throw new Error('Delivery is not currently available for this ZIP. Please text Rida before placing the order.');
  }
  if (!orderMinimumReached(mealSubtotal, deliveryPolicy.minimumOrder)) {
    throw new Error(`The $${deliveryPolicy.minimumOrder.toFixed(0)} ${deliveryPolicy.label} order minimum has not been met.`);
  }
  const deliveryFee = mealSubtotal >= deliveryPolicy.freeDeliveryThreshold ? 0 : deliveryPolicy.deliveryFee;
  const discountAmount = discountForPromotion(promotion, mealSubtotal);
  const taxableItems = sauces.extraQty > 0
    ? items.concat([{ taxClass: sauceProgram.taxClass || 'classification-pending', subtotal: sauces.extraSubtotal }])
    : items;
  const tax = calculateSalesTax(taxableItems, mealSubtotal, deliveryFee, discountAmount, taxPolicy);
  const exactTotal = money(Math.max(0, mealSubtotal + deliveryFee - discountAmount + tax.salesTax));
  const roundedTotal = taxPolicy?.enabled ? exactTotal : Math.ceil(exactTotal);
  if (!Number.isFinite(roundedTotal) || roundedTotal <= 0 || roundedTotal > 5000) {
    throw new Error('Invalid order total.');
  }

  const submittedAt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago', dateStyle: 'short', timeStyle: 'medium',
  }).format(new Date());

  return {
    orderId, firstName, lastName, phone, email, fulfillmentMethod, deliveryAddress, deliveryHasUnit, deliveryUnit,
    deliveryCity, deliveryState, deliveryZip, deliveryInstructions, notes, discoverySource, items, submittedAt,
    fullName: `${firstName} ${lastName}`, sauces,
    mealSubtotal, deliveryFee, discountAmount, ...tax, exactTotal, roundedTotal,
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
  const household = normalizedHouseholdAddress(
    order.deliveryUnit ? `${order.deliveryAddress} ${order.deliveryUnit}` : order.deliveryAddress,
    order.deliveryZip,
  );
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
    ensureSheetColumnCapacity(client, 'Orders', 42),
    ensureSheetColumnCapacity(client, 'Payment Log', 20),
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
    readRange(client, "'Orders'!AL1"),
    readRange(client, "'Orders'!AM1:AP1"),
    readRange(client, "'Payment Log'!Q1:T1"),
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
  if (safeText(headers[8]?.[0]?.[0], 50) !== 'Customer-Reported Source') {
    await updateRange(client, "'Orders'!AL1", ['Customer-Reported Source']);
  }
  const taxHeaders = ['Taxable Merchandise', 'Taxable Delivery', 'Tax Rate', 'Sales Tax Collected'];
  if (JSON.stringify(headers[9]?.[0] || []) !== JSON.stringify(taxHeaders)) {
    await updateRange(client, "'Orders'!AM1:AP1", taxHeaders);
  }
  if (JSON.stringify(headers[10]?.[0] || []) !== JSON.stringify(taxHeaders)) {
    await updateRange(client, "'Payment Log'!Q1:T1", taxHeaders);
  }
}

function itemLines(order) {
  const mealLines = order.items.map(item => {
    const tier = item.variantLabel
      ? ` (${item.variantLabel})`
      : item.category === 'dessert' || item.category === 'addon'
        ? ''
        : ` (${titleCase(item.tier)})`;
    return `${item.qty}x ${item.name}${tier} - $${item.subtotal.toFixed(2)}`;
  });
  const sauceLines = (order.sauces?.selections || []).map(selection => (
    `${selection.qty}x Sauce cup: ${selection.name} - selected`
  ));
  if (Number(order.sauces?.extraQty) > 0) {
    sauceLines.push(`Extra sauce cups: ${order.sauces.extraQty} - $${Number(order.sauces.extraSubtotal).toFixed(2)}`);
  }
  return mealLines.concat(sauceLines);
}

function paymentCounts(items) {
  return items.reduce((counts, item) => {
    if (item.variantLabel) {
      counts.standard += item.qty * (Number(item.servingCount) || 1);
      return counts;
    }
    const paymentGroup = item.category === 'premium' || item.category === 'seafood'
      ? 'beef'
      : item.category === 'addon'
        ? 'standard'
        : item.category;
    counts[paymentGroup] += item.qty;
    return counts;
  }, { standard: 0, beef: 0, dessert: 0 });
}

function tierSummary(items) {
  const hasExclusive = items.some(item => item.variantLabel);
  const tieredItems = items.filter(item => item.category !== 'dessert' && item.category !== 'addon' && !item.variantLabel);
  const tiers = new Set(tieredItems.map(item => item.tier));
  if (tiers.size === 0) {
    if (hasExclusive) return 'Weekly Five';
    const hasDessert = items.some(item => item.category === 'dessert');
    const hasAddon = items.some(item => item.category === 'addon');
    if (hasDessert && hasAddon) return 'Desserts + Add-ons';
    return hasAddon ? 'Add-ons Only' : 'Dessert Only';
  }
  if (tiers.size > 1 || hasExclusive) return 'Mixed';
  return titleCase(Array.from(tiers)[0]);
}

async function ensureOrderSaved(client, order) {
  const rows = await readRange(client, "'Orders'!A2:AZ");
  const exists = rows.some(row => row.some(value => safeText(value, 50) === order.orderId));
  if (exists) return false;

  const lines = itemLines(order).concat([
    `${order.fulfillmentMethod === 'pickup' ? 'Pickup' : `Delivery (${order.deliveryZoneLabel || 'DFW'})`} - ${order.deliveryFee ? `$${order.deliveryFee.toFixed(2)}` : 'Free'}`,
    ...(order.discountAmount > 0 ? [`Partner discount (${order.promoCode}) - -$${order.discountAmount.toFixed(2)}`] : []),
    ...(order.salesTax > 0 ? [`Sales tax - $${order.salesTax.toFixed(2)}`] : []),
  ]).join('\n');
  const targetRow = nextRecordRow(rows);
  await updateRange(client, `'Orders'!A${targetRow}:AP${targetRow}`, [
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
    order.fulfillmentMethod === 'pickup' && !order.deliveryAddress
      ? 'Pickup - exact location sent after confirmation'
      : (order.deliveryUnit ? `${order.deliveryAddress}, ${order.deliveryUnit}` : order.deliveryAddress),
    order.fulfillmentMethod === 'pickup' ? (order.pickupCity || 'Frisco') : order.deliveryCity,
    order.fulfillmentMethod === 'pickup' && !order.deliveryAddress ? '' : order.deliveryZip,
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
    order.discoverySource,
    order.taxableSubtotal,
    order.taxableDelivery,
    order.taxRate,
    order.salesTax,
  ]);
  return true;
}

async function ensurePaymentLogSaved(client, order) {
  const rows = await readRange(client, "'Payment Log'!A2:T");
  if (rows.some(row => safeText(row[13], 50) === order.orderId)) return false;

  let index = rows.findIndex(row => !row.slice(0, 4).some(value => safeText(value, 200)));
  if (index === -1) index = rows.length;
  const targetRow = index + 2;
  const counts = paymentCounts(order.items);
  await updateRange(client, `'Payment Log'!A${targetRow}:T${targetRow}`, [
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
    order.taxableSubtotal,
    order.taxableDelivery,
    order.taxRate,
    order.salesTax,
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
  if (order.discoverySource) return `Customer-reported / ${order.discoverySource}`;
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
    order.salesTax > 0 ? `Sales tax (${(order.taxRate * 100).toFixed(2)}%): $${order.salesTax.toFixed(2)}` : '',
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
    ${order.salesTax > 0 ? `Sales tax (${(order.taxRate * 100).toFixed(2)}%): <strong>$${order.salesTax.toFixed(2)}</strong><br>` : ''}
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

function customerInvoiceVariant(item) {
  if (item.variantLabel) return item.variantLabel;
  if (item.category === 'dessert' || item.category === 'addon' || !item.tier) return '';
  return titleCase(item.tier);
}

function assertCustomerInvoiceIntegrity(order) {
  if (!order || !Array.isArray(order.items) || order.items.length === 0) {
    throw new Error('Invoice requires at least one item.');
  }
  if (!order.orderId || !order.firstName || !order.email) {
    throw new Error('Invoice customer details are incomplete.');
  }

  const lineSubtotal = money(order.items.reduce((sum, item) => {
    const qty = Number(item.qty);
    const subtotal = Number(item.subtotal);
    if (!item.name || !Number.isInteger(qty) || qty < 1 || !Number.isFinite(subtotal) || subtotal < 0) {
      throw new Error('Invoice contains an invalid item line.');
    }
    if (Number.isFinite(Number(item.unitPrice))) {
      const extended = money(Number(item.unitPrice) * qty);
      if (Math.abs(extended - money(subtotal)) > 0.01) {
        throw new Error(`Invoice unit price mismatch for ${item.name}.`);
      }
    }
    return sum + subtotal;
  }, 0) + Number(order.sauces?.extraSubtotal || 0));
  const mealSubtotal = Number(order.mealSubtotal);
  const deliveryFee = Number(order.deliveryFee || 0);
  const discountAmount = Number(order.discountAmount || 0);
  const salesTax = Number(order.salesTax || 0);
  const roundedTotal = Number(order.roundedTotal);
  const amounts = [mealSubtotal, deliveryFee, discountAmount, salesTax, roundedTotal];
  if (amounts.some(amount => !Number.isFinite(amount) || amount < 0)) {
    throw new Error('Invoice contains an invalid total.');
  }
  if (Math.abs(lineSubtotal - money(mealSubtotal)) > 0.01) {
    throw new Error('Invoice item total does not match the meal subtotal.');
  }
  if (discountAmount > mealSubtotal + deliveryFee) {
    throw new Error('Invoice discount exceeds the eligible subtotal.');
  }

  const exactTotal = money(mealSubtotal + deliveryFee - discountAmount + salesTax);
  if (Number.isFinite(Number(order.exactTotal)) && Math.abs(exactTotal - money(order.exactTotal)) > 0.01) {
    throw new Error('Invoice exact total does not match its components.');
  }
  const acceptedTotals = [exactTotal, Math.ceil(exactTotal)];
  if (!acceptedTotals.some(total => Math.abs(total - roundedTotal) <= 0.01)) {
    throw new Error('Invoice total due does not match its components.');
  }
  return { lineSubtotal, exactTotal, roundedTotal };
}

function buildCustomerInvoiceMessage(order) {
  assertCustomerInvoiceIntegrity(order);
  const lines = itemLines(order);
  const address = formattedDeliveryAddress(order);
  const isPickup = order.fulfillmentMethod === 'pickup';
  const fulfillmentCompleted = order.fulfillmentCompleted === true;
  const deliveryDate = order.deliveryDate || DELIVERY_DATE;
  const mealInvoiceRows = order.items.map((item, index) => {
    const quantity = Number(item.qty) || 0;
    const subtotal = Number(item.subtotal) || 0;
    const unitPrice = Number.isFinite(Number(item.unitPrice))
      ? Number(item.unitPrice)
      : quantity > 0
        ? subtotal / quantity
        : subtotal;
    const variant = customerInvoiceVariant(item);
    const background = index % 2 === 0 ? '#ffffff' : '#f3f8f2';
    return `<tr style="background:${background}">
      <td style="padding:12px 10px;border-bottom:1px solid #d9e4d7;color:#173c2b;font-weight:600">${escapeHtml(item.name)}</td>
      <td style="padding:12px 10px;border-bottom:1px solid #d9e4d7;color:#496455">${variant ? escapeHtml(variant) : '&mdash;'}</td>
      <td style="padding:12px 10px;border-bottom:1px solid #d9e4d7;color:#173c2b;text-align:center">${quantity}</td>
      <td style="padding:12px 10px;border-bottom:1px solid #d9e4d7;color:#173c2b;text-align:right;white-space:nowrap">$${unitPrice.toFixed(2)}</td>
      <td style="padding:12px 10px;border-bottom:1px solid #d9e4d7;color:#173c2b;text-align:right;white-space:nowrap;font-weight:700">$${subtotal.toFixed(2)}</td>
    </tr>`;
  }).join('');
  const sauceStartIndex = order.items.length;
  const sauceInvoiceRows = (order.sauces?.selections || []).map((selection, index) => {
    const background = (sauceStartIndex + index) % 2 === 0 ? '#ffffff' : '#f3f8f2';
    return `<tr style="background:${background}">
      <td style="padding:12px 10px;border-bottom:1px solid #d9e4d7;color:#173c2b;font-weight:600">${escapeHtml(selection.name)} sauce</td>
      <td style="padding:12px 10px;border-bottom:1px solid #d9e4d7;color:#496455">45 g cup</td>
      <td style="padding:12px 10px;border-bottom:1px solid #d9e4d7;color:#173c2b;text-align:center">${Number(selection.qty)}</td>
      <td style="padding:12px 10px;border-bottom:1px solid #d9e4d7;color:#173c2b;text-align:right;white-space:nowrap">Selected</td>
      <td style="padding:12px 10px;border-bottom:1px solid #d9e4d7;color:#173c2b;text-align:right;white-space:nowrap;font-weight:700">$0.00</td>
    </tr>`;
  }).join('');
  const extraSauceRow = Number(order.sauces?.extraQty) > 0 ? `<tr style="background:${(sauceStartIndex + (order.sauces?.selections || []).length) % 2 === 0 ? '#ffffff' : '#f3f8f2'}">
      <td style="padding:12px 10px;border-bottom:1px solid #d9e4d7;color:#173c2b;font-weight:600">Extra sauce cups</td>
      <td style="padding:12px 10px;border-bottom:1px solid #d9e4d7;color:#496455">After free order allowance</td>
      <td style="padding:12px 10px;border-bottom:1px solid #d9e4d7;color:#173c2b;text-align:center">${Number(order.sauces.extraQty)}</td>
      <td style="padding:12px 10px;border-bottom:1px solid #d9e4d7;color:#173c2b;text-align:right;white-space:nowrap">$${(Number(order.sauces.extraSubtotal) / Number(order.sauces.extraQty)).toFixed(2)}</td>
      <td style="padding:12px 10px;border-bottom:1px solid #d9e4d7;color:#173c2b;text-align:right;white-space:nowrap;font-weight:700">$${Number(order.sauces.extraSubtotal).toFixed(2)}</td>
    </tr>` : '';
  const invoiceRows = mealInvoiceRows + sauceInvoiceRows + extraSauceRow;
  const deliveryLabel = isPickup ? 'Pickup' : `Delivery (${escapeHtml(order.deliveryZoneLabel || 'DFW')})`;
  const deliveryValue = order.deliveryFee ? `$${order.deliveryFee.toFixed(2)}` : 'Free';
  const text = [
    'PRPD INVOICE',
    '',
    `Hi ${order.firstName},`,
    '',
    fulfillmentCompleted
      ? `Here is your invoice for the order delivered on ${deliveryDate}. The balance is still due.`
      : 'PRPD received your weekly order. It is awaiting payment and final confirmation from Rida.',
    `Invoice: ${order.orderId}`,
    `${isPickup ? 'Pickup week' : 'Delivery'}: ${deliveryDate}`,
    `${isPickup ? 'Pickup' : 'Delivery address'}: ${address}`,
    '',
    'YOUR ORDER:',
    ...lines.map(line => `  ${line}`),
    '',
    `Meals subtotal: $${order.mealSubtotal.toFixed(2)}`,
    `${isPickup ? 'Pickup' : `Delivery (${order.deliveryZoneLabel || 'DFW'})`}: ${order.deliveryFee ? `$${order.deliveryFee.toFixed(2)}` : 'Free'}`,
    order.discountAmount > 0 ? `Partner discount (${order.promoCode}): -$${order.discountAmount.toFixed(2)}` : '',
    order.salesTax > 0 ? `Sales tax (${(order.taxRate * 100).toFixed(2)}%): $${order.salesTax.toFixed(2)}` : '',
    `Total due: $${order.roundedTotal.toFixed(2)}`,
    '',
    `Zelle $${order.roundedTotal.toFixed(2)} to ${PAYMENT_EMAIL}.`,
    'Confirm that the recipient displays PRPD before sending.',
    `Include your name or order reference ${order.orderId} in the memo.`,
    fulfillmentCompleted
      ? 'This invoice will be marked paid after Rida verifies the payment.'
      : 'Your order is confirmed after Rida verifies the payment.',
    'Questions? Reply to this email or text (469) 545-0781.',
    order.menuEmailOptIn ? 'You asked to receive PRPD weekly menu and cutoff emails.' : '',
  ].filter(Boolean).join('\n');

  const html = `<!doctype html><html><body style="margin:0;padding:0;background:#edf3eb;font-family:Arial,sans-serif;color:#173c2b">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#edf3eb">
      <tr><td align="center" style="padding:24px 12px">
        <table role="presentation" width="680" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:680px;background:#ffffff;border:1px solid #cbdac8;border-radius:14px;overflow:hidden">
          <tr><td style="background:#173c2b;padding:26px 28px;color:#ffffff">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr>
              <td style="font-size:30px;font-weight:800;letter-spacing:3px;color:#ffffff">PRPD</td>
              <td align="right" style="font-size:13px;font-weight:700;letter-spacing:1px;color:#ffffff">INVOICE</td>
            </tr></table>
            <div style="margin-top:5px;font-size:11px;letter-spacing:2px;color:#b9d2bb">MEALS. PREPPED.</div>
          </td></tr>
          <tr><td style="padding:26px 28px 14px">
            <h1 style="font-size:24px;line-height:1.25;margin:0 0 8px;color:#173c2b">${fulfillmentCompleted
              ? `Hi ${escapeHtml(order.firstName)}, here is your invoice.`
              : `Hi ${escapeHtml(order.firstName)}, your order is in.`}</h1>
            <p style="margin:0;color:#58705f;line-height:1.55">${fulfillmentCompleted
              ? `This invoice is for your order delivered on ${escapeHtml(deliveryDate)}. The balance is still due.`
              : 'Your weekly order is awaiting payment and final confirmation from Rida.'}</p>
          </td></tr>
          <tr><td style="padding:8px 28px 20px">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#f3f8f2;border:1px solid #d9e4d7;border-radius:8px">
              <tr><td style="padding:16px 18px;line-height:1.7;color:#173c2b">
                <strong>Invoice:</strong> ${escapeHtml(order.orderId)}<br>
                <strong>${isPickup ? 'Pickup week' : 'Delivery'}:</strong> ${escapeHtml(deliveryDate)}<br>
                <strong>${isPickup ? 'Pickup' : 'Address'}:</strong> ${escapeHtml(address)}
              </td></tr>
            </table>
          </td></tr>
          <tr><td style="padding:0 28px 24px">
            <table width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border-collapse:collapse;border:1px solid #d9e4d7">
              <thead><tr style="background:#24563d;color:#ffffff">
                <th align="left" style="padding:12px 10px;font-size:12px;letter-spacing:.4px">ITEM</th>
                <th align="left" style="padding:12px 10px;font-size:12px;letter-spacing:.4px">TYPE</th>
                <th align="center" style="padding:12px 10px;font-size:12px;letter-spacing:.4px">QTY</th>
                <th align="right" style="padding:12px 10px;font-size:12px;letter-spacing:.4px">PRICE</th>
                <th align="right" style="padding:12px 10px;font-size:12px;letter-spacing:.4px">AMOUNT</th>
              </tr></thead>
              <tbody>${invoiceRows}</tbody>
            </table>
          </td></tr>
          <tr><td style="padding:0 28px 24px">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border-collapse:collapse">
              <tr><td style="padding:5px 0;color:#58705f">Meals subtotal</td><td align="right" style="padding:5px 0;color:#173c2b;font-weight:700">$${order.mealSubtotal.toFixed(2)}</td></tr>
              <tr><td style="padding:5px 0;color:#58705f">${deliveryLabel}</td><td align="right" style="padding:5px 0;color:#173c2b;font-weight:700">${deliveryValue}</td></tr>
              ${order.discountAmount > 0 ? `<tr><td style="padding:5px 0;color:#58705f">Discount (${escapeHtml(order.promoCode)})</td><td align="right" style="padding:5px 0;color:#173c2b;font-weight:700">-$${order.discountAmount.toFixed(2)}</td></tr>` : ''}
              ${order.salesTax > 0 ? `<tr><td style="padding:5px 0;color:#58705f">Sales tax (${(order.taxRate * 100).toFixed(2)}%)</td><td align="right" style="padding:5px 0;color:#173c2b;font-weight:700">$${order.salesTax.toFixed(2)}</td></tr>` : ''}
              <tr><td style="padding:14px 0 0;border-top:2px solid #173c2b;font-size:19px;font-weight:800;color:#173c2b">Total due</td><td align="right" style="padding:14px 0 0;border-top:2px solid #173c2b;font-size:19px;font-weight:800;color:#173c2b">$${order.roundedTotal.toFixed(2)}</td></tr>
            </table>
          </td></tr>
          <tr><td style="padding:0 28px 24px">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#f3f8f2;border:2px solid #6f9a73;border-radius:8px">
              <tr><td style="padding:18px 20px;color:#173c2b;line-height:1.55">
                <div style="font-size:16px;font-weight:800;margin-bottom:6px">Pay by Zelle</div>
                Send <strong>$${order.roundedTotal.toFixed(2)}</strong> to <strong>${PAYMENT_EMAIL}</strong>.<br>
                Confirm that the recipient displays PRPD before sending.<br>
                <span style="color:#58705f">Include your name or invoice ${escapeHtml(order.orderId)} in the memo. ${fulfillmentCompleted
                  ? 'This invoice will be marked paid after Rida verifies payment.'
                  : 'Your order is confirmed after Rida verifies payment.'}</span>
              </td></tr>
            </table>
          </td></tr>
          <tr><td style="background:#173c2b;padding:18px 28px;color:#ffffff;font-size:13px;line-height:1.5">
            Questions? Reply to this email or text <a href="sms:+14695450781" style="color:#ffffff;text-decoration:underline">(469) 545-0781</a>.
            ${order.menuEmailOptIn ? '<br><span style="color:#b9d2bb">You asked to receive PRPD weekly menu and cutoff emails.</span>' : ''}
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body></html>`;

  return {
    subject: `PRPD Invoice - ${order.orderId} - $${order.roundedTotal.toFixed(2)}`,
    text,
    html,
  };
}

async function sendCustomerConfirmationEmail(order, options = {}) {
  const message = buildCustomerInvoiceMessage(order);
  const idempotencyKey = options.idempotencyKey || `order-customer-${order.orderId}`;

  await sendResendEmail({
    from: SENDER_EMAIL,
    to: [order.email],
    reply_to: CUSTOMER_REPLY_EMAIL,
    ...message,
  }, idempotencyKey);
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
        taxableSubtotal: order.taxableSubtotal,
        taxableDelivery: order.taxableDelivery,
        taxRate: order.taxRate,
        salesTax: order.salesTax,
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
      taxableSubtotal: order.taxableSubtotal,
      taxableDelivery: order.taxableDelivery,
      taxRate: order.taxRate,
      salesTax: order.salesTax,
      promoCode: order.promoCode,
      sauces: order.sauces,
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
  buildCustomerInvoiceMessage,
  assertCustomerInvoiceIntegrity,
  acquisitionLabel,
  isMenuPublished,
  catalogForConfig,
  deliveryPolicyForZip,
  roundedFoodSubtotal,
  orderMinimumReached,
  calculateSalesTax,
  normalizeSauceSelections,
  SAUCE_SELECTION_KEYS,
};
