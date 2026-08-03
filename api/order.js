const { GoogleAuth } = require('google-auth-library');
const ORDER_CONFIG = require('../config/order-config');
const {
  assertExactKeys,
  isLikelyBot,
  requestSourceError,
  safeLogError,
} = require('./_security');
const { sendWebEvent } = require('./_tiktok');

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const GOOGLE_SERVICE_ACCOUNT_JSON = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
const GOOGLE_SERVICE_ACCOUNT_BASE64 = process.env.GOOGLE_SERVICE_ACCOUNT_BASE64;
const NOTIFICATION_EMAIL = 'getprpd@gmail.com';
const CUSTOMER_REPLY_EMAIL = 'hello@getprpd.com';
const SENDER_EMAIL = 'PRPD Orders <orders@mail.getprpd.com>';

const ORDER_CUTOFF = ORDER_CONFIG.batch.cutoffIso;
const BATCH_NUMBER = ORDER_CONFIG.batch.number;
const DELIVERY_DATE = ORDER_CONFIG.batch.deliveryDate;
const MIN_ORDER_TOTAL = ORDER_CONFIG.policies.minimumOrder;
const FREE_DELIVERY_THRESHOLD = ORDER_CONFIG.policies.freeDeliveryThreshold;
const DELIVERY_FEE = ORDER_CONFIG.policies.deliveryFee;
const MAX_QTY_PER_ITEM = ORDER_CONFIG.policies.maxQtyPerItem;
const MAX_TOTAL_ITEMS = ORDER_CONFIG.policies.maxTotalItems;
const PROMOTIONS = ORDER_CONFIG.promotions || { codes: [] };
const MAX_BODY_BYTES = 50_000;
const ORDER_KEYS = new Set([
  'action', 'orderId', 'batch', 'deliveryDate', 'firstName', 'lastName', 'phone',
  'email', 'deliveryAddress', 'deliveryCity', 'deliveryZip', 'deliveryInstructions',
  'items', 'mealSubtotal', 'deliveryFee', 'exactTotal', 'total', 'promoCode',
  'discountAmount', 'menuEmailOptIn', 'notes', 'submittedAt', 'website',
  'formStartedAt', 'utmSource', 'utmMedium', 'utmCampaign', 'utmContent',
  'utmTerm', 'landingPage', 'referrer', 'tiktokTtclid', 'tiktokTtp',
]);
const ORDER_ITEM_KEYS = new Set([
  'id', 'name', 'category', 'section', 'tier', 'qty', 'unitPrice', 'subtotal',
]);

const PRICES = ORDER_CONFIG.prices;
const CATALOG = Object.values(ORDER_CONFIG.menu).flat().reduce((catalog, dish) => {
  catalog[dish.id] = {
    name: dish.name,
    category: dish.category,
    price: Number.isFinite(Number(dish.price)) ? Number(dish.price) : null,
    available: dish.available !== false,
    maxQty: dish.maxQty || MAX_QTY_PER_ITEM,
  };
  return catalog;
}, {});

function sendJson(response, status, body) {
  response.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.end(JSON.stringify(body));
}

function money(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
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
  if (!promotion || mealSubtotal < MIN_ORDER_TOTAL) return 0;
  const value = Number(promotion.value);
  if (!Number.isFinite(value) || value <= 0) return 0;
  const rawDiscount = promotion.type === 'percent' ? mealSubtotal * (value / 100) : value;
  const configuredCap = Number(promotion.maxDiscount);
  const cap = Number.isFinite(configuredCap) && configuredCap > 0 ? configuredCap : rawDiscount;
  return money(Math.max(0, Math.min(rawDiscount, cap, mealSubtotal)));
}

function normalizeItems(rawItems) {
  if (!Array.isArray(rawItems) || rawItems.length === 0 || rawItems.length > 50) {
    throw new Error('Add at least one valid item to your order.');
  }

  const combined = new Map();
  for (const raw of rawItems) {
    assertExactKeys(raw, ORDER_ITEM_KEYS, 'Order item');
    const id = safeText(raw && raw.id, 10);
    const catalogItem = CATALOG[id];
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

function isValidOrderId(orderId) {
  const orderIdPattern = new RegExp(`^PRPD-B${BATCH_NUMBER}-\\d{8}-[A-F0-9]{4}(?:[A-F0-9]{4})?$`);
  return orderIdPattern.test(orderId);
}

function validateAndBuildOrder(raw) {
  assertExactKeys(raw, ORDER_KEYS, 'Order request');
  if (!raw || raw.action !== 'order') throw new Error('Invalid order request.');
  const orderId = safeText(raw.orderId, 50);
  if (!isValidOrderId(orderId)) throw new Error('Invalid order reference.');

  const firstName = safeText(raw.firstName, 60);
  const lastName = safeText(raw.lastName, 60);
  const phone = safeText(raw.phone, 30);
  const email = safeText(raw.email, 160).toLowerCase();
  const deliveryAddress = safeText(raw.deliveryAddress, 180);
  const deliveryCity = safeText(raw.deliveryCity, 80);
  const deliveryZip = safeText(raw.deliveryZip, 10);
  const deliveryInstructions = safeText(raw.deliveryInstructions, 300);
  const notes = safeText(raw.notes, 500);
  const promoCode = normalizePromoCode(raw.promoCode);
  const promotion = promoCode ? promotionForCode(promoCode) : null;
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
  };
  if (!firstName) throw new Error('First name is required.');
  if (!lastName) throw new Error('Last name is required.');
  if (phone.replace(/\D/g, '').length !== 10) throw new Error('A valid 10-digit phone number is required.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('A valid email address is required.');
  if (!deliveryAddress) throw new Error('Delivery address is required.');
  if (!deliveryCity) throw new Error('Delivery city is required.');
  if (!/^\d{5}$/.test(deliveryZip)) throw new Error('A valid 5-digit ZIP code is required.');
  if (promoCode && !promotion) throw new Error('That referral or partner code is not active.');
  if (Date.now() >= new Date(ORDER_CUTOFF).getTime()) {
    throw new Error('Orders are closed for this week. Please contact Rida at (469) 545-0781.');
  }

  const items = normalizeItems(raw.items);
  const mealSubtotal = money(items.reduce((sum, item) => sum + item.subtotal, 0));
  if (mealSubtotal < MIN_ORDER_TOTAL) throw new Error('The $60 order minimum has not been met.');
  const deliveryFee = mealSubtotal > FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
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
    orderId, firstName, lastName, phone, email, deliveryAddress, deliveryCity,
    deliveryZip, deliveryInstructions, notes, items, submittedAt,
    fullName: `${firstName} ${lastName}`,
    mealSubtotal, deliveryFee, discountAmount, exactTotal, roundedTotal,
    promoCode: promotion ? normalizePromoCode(promotion.code) : '',
    promotionPartner: promotion ? safeText(promotion.partner, 100) : '',
    menuEmailOptIn,
    ...attribution,
  };
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
  const headers = await Promise.all([
    readRange(client, "'Orders'!K1"),
    readRange(client, "'Orders'!L1:P1"),
    readRange(client, "'Payment Log'!N1"),
    readRange(client, "'Orders'!Q1:AC1"),
    readRange(client, "'Payment Log'!O1:P1"),
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
    `Delivery - ${order.deliveryFee ? `$${order.deliveryFee.toFixed(2)}` : 'Free'}`,
    ...(order.discountAmount > 0 ? [`Partner discount (${order.promoCode}) - -$${order.discountAmount.toFixed(2)}`] : []),
  ]).join('\n');
  const targetRow = nextRecordRow(rows);
  await updateRange(client, `'Orders'!A${targetRow}:AC${targetRow}`, [
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
    order.deliveryAddress,
    order.deliveryCity,
    order.deliveryZip,
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
  const address = `${order.deliveryAddress}, ${order.deliveryCity}, TX ${order.deliveryZip}`;
  const text = [
    `New PRPD Order - ${order.fullName}`,
    '',
    `Order reference: ${order.orderId}`,
    `Batch: Batch ${BATCH_NUMBER}`,
    `Delivery: ${DELIVERY_DATE}`,
    `Submitted: ${order.submittedAt}`,
    `Phone: ${order.phone}`,
    `Email: ${order.email}`,
    `Delivery address: ${address}`,
    order.deliveryInstructions ? `Delivery instructions: ${order.deliveryInstructions}` : '',
    '',
    'ORDER:',
    ...lines.map(line => `  ${line}`),
    '',
    `Meal subtotal: $${order.mealSubtotal.toFixed(2)}`,
    `Delivery: ${order.deliveryFee ? `$${order.deliveryFee.toFixed(2)}` : 'Free'}`,
    order.discountAmount > 0 ? `Partner discount (${order.promoCode}): -$${order.discountAmount.toFixed(2)}` : '',
    `Total due: $${order.roundedTotal.toFixed(2)}`,
    `Exact pre-round total: $${order.exactTotal.toFixed(2)}`,
    order.promotionPartner ? `Referral partner: ${order.promotionPartner}` : '',
    order.utmSource ? `Attribution: ${order.utmSource}${order.utmCampaign ? ` / ${order.utmCampaign}` : ''}` : '',
    `Weekly menu email: ${order.menuEmailOptIn ? 'Opted in' : 'Not requested'}`,
    order.notes ? `Notes: ${order.notes}` : '',
  ].filter(Boolean).join('\n');

  const htmlItems = lines.map(line => `<li style="margin:6px 0">${escapeHtml(line)}</li>`).join('');
  const html = `<div style="font-family:Arial,sans-serif;color:#1E2E1E;line-height:1.5;max-width:620px">
    <h1 style="font-size:22px">New PRPD Order</h1>
    <p><strong>${escapeHtml(order.fullName)}</strong><br>${escapeHtml(order.phone)}<br>${escapeHtml(order.email)}</p>
    <p><strong>Delivery address</strong><br>${escapeHtml(address)}</p>
    ${order.deliveryInstructions ? `<p><strong>Delivery instructions:</strong> ${escapeHtml(order.deliveryInstructions)}</p>` : ''}
    <p>Order reference: ${escapeHtml(order.orderId)}<br>Batch ${BATCH_NUMBER}<br>Delivery: ${escapeHtml(DELIVERY_DATE)}</p>
    <ul style="padding-left:20px">${htmlItems}</ul>
    <hr style="border:0;border-top:1px solid #d8d2c9">
    <p>Meals subtotal: <strong>$${order.mealSubtotal.toFixed(2)}</strong><br>
    Delivery: <strong>${order.deliveryFee ? `$${order.deliveryFee.toFixed(2)}` : 'Free'}</strong><br>
    ${order.discountAmount > 0 ? `Partner discount (${escapeHtml(order.promoCode)}): <strong>-$${order.discountAmount.toFixed(2)}</strong><br>` : ''}
    Total due: <strong>$${order.roundedTotal.toFixed(2)}</strong></p>
    ${order.promotionPartner ? `<p><strong>Referral partner:</strong> ${escapeHtml(order.promotionPartner)}</p>` : ''}
    ${order.utmSource ? `<p><strong>Attribution:</strong> ${escapeHtml(order.utmSource)}${order.utmCampaign ? ` / ${escapeHtml(order.utmCampaign)}` : ''}</p>` : ''}
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
  const address = `${order.deliveryAddress}, ${order.deliveryCity}, TX ${order.deliveryZip}`;
  const text = [
    `Thanks for your order, ${order.firstName}.`,
    '',
    'PRPD received your weekly order. It is awaiting payment and final confirmation from Rida.',
    `Order reference: ${order.orderId}`,
    `Delivery: ${DELIVERY_DATE}`,
    `Delivery address: ${address}`,
    '',
    'YOUR ORDER:',
    ...lines.map(line => `  ${line}`),
    '',
    `Meals subtotal: $${order.mealSubtotal.toFixed(2)}`,
    `Delivery: ${order.deliveryFee ? `$${order.deliveryFee.toFixed(2)}` : 'Free'}`,
    order.discountAmount > 0 ? `Partner discount (${order.promoCode}): -$${order.discountAmount.toFixed(2)}` : '',
    `Total due: $${order.roundedTotal.toFixed(2)}`,
    '',
    'Rida will text you shortly to confirm payment and Saturday delivery.',
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
      <p style="margin:0 0 6px"><strong>Delivery:</strong> ${escapeHtml(DELIVERY_DATE)}</p>
      <p style="margin:0"><strong>Address:</strong> ${escapeHtml(address)}</p>
    </div>
    <div style="background:#fff;padding:20px 22px;border:1px solid #d8d2c9">
      <h2 style="font-size:16px;margin:0 0 12px">Your order</h2>
      <ul style="padding-left:20px;margin:0 0 18px">${htmlItems}</ul>
      <hr style="border:0;border-top:1px solid #d8d2c9;margin:16px 0">
      <p style="margin:4px 0">Meals subtotal: <strong>$${order.mealSubtotal.toFixed(2)}</strong></p>
      <p style="margin:4px 0">Delivery: <strong>${order.deliveryFee ? `$${order.deliveryFee.toFixed(2)}` : 'Free'}</strong></p>
      ${order.discountAmount > 0 ? `<p style="margin:4px 0">Partner discount (${escapeHtml(order.promoCode)}): <strong>-$${order.discountAmount.toFixed(2)}</strong></p>` : ''}
      <p style="margin:10px 0 0;font-size:18px">Total due: <strong>$${order.roundedTotal.toFixed(2)}</strong></p>
    </div>
    <p style="margin:22px 0 6px">Rida will text you shortly to confirm payment and Saturday delivery.</p>
    ${order.menuEmailOptIn ? '<p style="margin:6px 0;color:#526452">You asked to receive PRPD weekly menu and cutoff emails.</p>' : ''}
    <p style="margin:0;color:#526452">Questions? Reply to this email or text <a href="tel:+14695450781" style="color:#1E2E1E">(469) 545-0781</a>.</p>
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

  let order;
  try {
    order = validateAndBuildOrder(raw);
  } catch (error) {
    return sendJson(response, 400, { status: 'error', message: error.message });
  }

  try {
    const client = await getSheetsClient();
    await ensureTrackingHeaders(client);
    const orderCreated = await ensureOrderSaved(client, order);
    const paymentCreated = await ensurePaymentLogSaved(client, order);

    if (!orderCreated && !paymentCreated) {
      return sendJson(response, 200, {
        status: 'success',
        orderId: order.orderId,
        duplicate: true,
        total: order.roundedTotal,
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
      discountAmount: order.discountAmount,
      promoCode: order.promoCode,
      notificationSent,
      customerConfirmationSent,
      tiktokEventSent,
    });
  } catch (error) {
    safeLogError('Order submission failed.', error);
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
  paymentCounts,
  tierSummary,
  nextRecordRow,
  ORDER_KEYS,
  ORDER_ITEM_KEYS,
  sendCustomerConfirmationEmail,
};
