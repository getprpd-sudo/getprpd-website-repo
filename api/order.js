const { GoogleAuth } = require('google-auth-library');

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const GOOGLE_SERVICE_ACCOUNT_JSON = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
const GOOGLE_SERVICE_ACCOUNT_BASE64 = process.env.GOOGLE_SERVICE_ACCOUNT_BASE64;
const NOTIFICATION_EMAIL = 'getprpd@gmail.com';
const SENDER_EMAIL = 'PRPD Orders <orders@mail.getprpd.com>';

const ORDER_CUTOFF = '2026-07-15T17:00:00-05:00';
const BATCH_NUMBER = 2;
const DELIVERY_DATE = 'Saturday, July 18, 2026';
const MIN_ORDER_TOTAL = 60;
const FREE_DELIVERY_THRESHOLD = 75;
const DELIVERY_FEE = 6.99;
const MAX_QTY_PER_ITEM = 50;
const MAX_TOTAL_ITEMS = 250;
const MAX_BODY_BYTES = 50_000;

const CATALOG = {
  b1: ['Egg Bites', 'standard'],
  b2: ['French Toast', 'standard'],
  b3: ['Breakfast Quesadilla', 'standard'],
  b4: ['Grilled Cheese Breakfast Burrito', 'beef'],
  m1: ['Butter Chicken', 'standard'],
  m2: ['Halal Cart Chicken + Yellow Rice', 'standard'],
  m3: ['Loaded Buffalo Chicken Potato', 'standard'],
  m4: ['Peri Peri Drumsticks', 'standard'],
  m5: ['Mexican Streetcorn Chicken Bowl', 'standard'],
  m6: ['Beef Seekh Kabab Shawarma', 'beef'],
  m7: ['Meatball Arrabbiata Pasta', 'beef'],
  m8: ['Halal Boy Kibble', 'beef'],
  d1: ['Strawberry Cheesecake', 'dessert'],
  d2: ['Chocolate Oreo Mousse', 'dessert'],
  d3: ['High Protein Tiramisu', 'dessert'],
};

const PRICES = {
  standard: { lean: 10.99, bulk: 12.99 },
  beef: { lean: 13.99, bulk: 15.99 },
  dessert: { single: 6.99 },
};

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

function normalizeItems(rawItems) {
  if (!Array.isArray(rawItems) || rawItems.length === 0 || rawItems.length > 50) {
    throw new Error('Add at least one valid item to your order.');
  }

  const combined = new Map();
  for (const raw of rawItems) {
    const id = safeText(raw && raw.id, 10);
    const catalogItem = CATALOG[id];
    if (!catalogItem) throw new Error('An unknown menu item was submitted.');

    const [name, category] = catalogItem;
    const tier = category === 'dessert' ? 'single' : raw.tier === 'bulk' ? 'bulk' : 'lean';
    const qty = Math.floor(Number(raw.qty));
    if (!Number.isFinite(qty) || qty < 1) throw new Error(`Invalid quantity for ${name}.`);

    const key = `${id}:${tier}`;
    const nextQty = (combined.get(key)?.qty || 0) + qty;
    if (nextQty > MAX_QTY_PER_ITEM) throw new Error(`Too many servings of ${name}.`);
    combined.set(key, { id, name, category, tier, qty: nextQty });
  }

  const items = Array.from(combined.values()).map(item => {
    const unitPrice = PRICES[item.category][item.tier];
    return { ...item, unitPrice, subtotal: money(unitPrice * item.qty) };
  });
  const totalQty = items.reduce((sum, item) => sum + item.qty, 0);
  if (totalQty > MAX_TOTAL_ITEMS) throw new Error('Please text Rida directly for very large orders.');
  return items;
}

function validateAndBuildOrder(raw) {
  if (!raw || raw.action !== 'order') throw new Error('Invalid order request.');
  const orderId = safeText(raw.orderId, 50);
  if (!/^PRPD-B2-\d{8}-[A-F0-9]{4}$/.test(orderId)) throw new Error('Invalid order reference.');

  const firstName = safeText(raw.firstName, 60);
  const lastName = safeText(raw.lastName, 60);
  const phone = safeText(raw.phone, 30);
  const notes = safeText(raw.notes, 500);
  if (!firstName) throw new Error('First name is required.');
  if (!lastName) throw new Error('Last name is required.');
  if (phone.replace(/\D/g, '').length !== 10) throw new Error('A valid 10-digit phone number is required.');
  if (Date.now() >= new Date(ORDER_CUTOFF).getTime()) {
    throw new Error('Orders are closed for this week. Please contact Rida at (469) 545-0781.');
  }

  const items = normalizeItems(raw.items);
  const mealSubtotal = money(items.reduce((sum, item) => sum + item.subtotal, 0));
  if (mealSubtotal < MIN_ORDER_TOTAL) throw new Error('The $60 order minimum has not been met.');
  const deliveryFee = mealSubtotal > FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const exactTotal = money(mealSubtotal + deliveryFee);
  const roundedTotal = Math.ceil(exactTotal);
  if (!Number.isFinite(roundedTotal) || roundedTotal <= 0 || roundedTotal > 5000) {
    throw new Error('Invalid order total.');
  }

  const submittedAt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago', dateStyle: 'short', timeStyle: 'medium',
  }).format(new Date());

  return {
    orderId, firstName, lastName, phone, notes, items, submittedAt,
    fullName: `${firstName} ${lastName}`,
    mealSubtotal, deliveryFee, exactTotal, roundedTotal,
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

async function appendRange(client, range, values) {
  await client.request({
    url: sheetsUrl(`values/${encodeURIComponent(range)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`),
    method: 'POST',
    data: { values: [values] },
  });
}

async function updateRange(client, range, values) {
  await client.request({
    url: sheetsUrl(`values/${encodeURIComponent(range)}?valueInputOption=RAW`),
    method: 'PUT',
    data: { values: [values] },
  });
}

async function ensureTrackingHeaders(client) {
  const headers = await Promise.all([
    readRange(client, "'Orders'!K1"),
    readRange(client, "'Payment Log'!N1"),
  ]);
  if (safeText(headers[0]?.[0]?.[0], 50) !== 'Order ID') {
    await updateRange(client, "'Orders'!K1", ['Order ID']);
  }
  if (safeText(headers[1]?.[0]?.[0], 50) !== 'Order ID') {
    await updateRange(client, "'Payment Log'!N1", ['Order ID']);
  }
}

function itemLines(order) {
  return order.items.map(item => {
    const tier = item.category === 'dessert' ? '' : ` (${titleCase(item.tier)})`;
    return `${item.qty}x ${item.name}${tier} - $${item.subtotal.toFixed(2)}`;
  });
}

function paymentCounts(items) {
  return items.reduce((counts, item) => {
    counts[item.category] += item.qty;
    return counts;
  }, { standard: 0, beef: 0, dessert: 0 });
}

function tierSummary(items) {
  const tiers = new Set(items.filter(item => item.category !== 'dessert').map(item => item.tier));
  if (tiers.size === 0) return 'Dessert Only';
  if (tiers.size > 1) return 'Mixed';
  return titleCase(Array.from(tiers)[0]);
}

async function ensureOrderSaved(client, order) {
  const orderIds = await readRange(client, "'Orders'!K2:K");
  const exists = orderIds.some(row => safeText(row[0], 50) === order.orderId);
  if (exists) return false;

  const lines = itemLines(order).concat([
    `Delivery - ${order.deliveryFee ? `$${order.deliveryFee.toFixed(2)}` : 'Free'}`,
  ]).join('\n');
  await appendRange(client, "'Orders'!A:K", [
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
  ]);
  return true;
}

async function ensurePaymentLogSaved(client, order) {
  const rows = await readRange(client, "'Payment Log'!A2:N");
  if (rows.some(row => safeText(row[13], 50) === order.orderId)) return false;

  let index = rows.findIndex(row => !row.slice(0, 4).some(value => safeText(value, 200)));
  if (index === -1) index = rows.length;
  const targetRow = index + 2;
  const counts = paymentCounts(order.items);
  await updateRange(client, `'Payment Log'!A${targetRow}:N${targetRow}`, [
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
  ]);
  return true;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);
}

async function sendOrderEmail(order) {
  if (!RESEND_API_KEY) throw new Error('Resend is not configured.');
  const lines = itemLines(order);
  const text = [
    `New PRPD Order - ${order.fullName}`,
    '',
    `Order reference: ${order.orderId}`,
    `Batch: Batch ${BATCH_NUMBER}`,
    `Delivery: ${DELIVERY_DATE}`,
    `Submitted: ${order.submittedAt}`,
    `Phone: ${order.phone}`,
    '',
    'ORDER:',
    ...lines.map(line => `  ${line}`),
    '',
    `Meal subtotal: $${order.mealSubtotal.toFixed(2)}`,
    `Delivery: ${order.deliveryFee ? `$${order.deliveryFee.toFixed(2)}` : 'Free'}`,
    `Total due: $${order.roundedTotal.toFixed(2)}`,
    `Exact pre-round total: $${order.exactTotal.toFixed(2)}`,
    order.notes ? `Notes: ${order.notes}` : '',
  ].filter(Boolean).join('\n');

  const htmlItems = lines.map(line => `<li style="margin:6px 0">${escapeHtml(line)}</li>`).join('');
  const html = `<div style="font-family:Arial,sans-serif;color:#1E2E1E;line-height:1.5;max-width:620px">
    <h1 style="font-size:22px">New PRPD Order</h1>
    <p><strong>${escapeHtml(order.fullName)}</strong><br>${escapeHtml(order.phone)}</p>
    <p>Order reference: ${escapeHtml(order.orderId)}<br>Batch ${BATCH_NUMBER}<br>Delivery: ${escapeHtml(DELIVERY_DATE)}</p>
    <ul style="padding-left:20px">${htmlItems}</ul>
    <hr style="border:0;border-top:1px solid #d8d2c9">
    <p>Meals subtotal: <strong>$${order.mealSubtotal.toFixed(2)}</strong><br>
    Delivery: <strong>${order.deliveryFee ? `$${order.deliveryFee.toFixed(2)}` : 'Free'}</strong><br>
    Total due: <strong>$${order.roundedTotal.toFixed(2)}</strong></p>
    ${order.notes ? `<p>Notes: ${escapeHtml(order.notes)}</p>` : ''}
  </div>`;

  const result = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': `order-${order.orderId}`,
    },
    body: JSON.stringify({
      from: SENDER_EMAIL,
      to: [NOTIFICATION_EMAIL],
      subject: `New Order: ${order.fullName} - $${order.roundedTotal.toFixed(2)}`,
      text,
      html,
    }),
  });
  if (!result.ok) throw new Error(`Resend rejected the notification (${result.status}).`);
}

module.exports = async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return sendJson(response, 405, { status: 'error', message: 'Method not allowed.' });
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
        notificationSent: true,
      });
    }

    let notificationSent = true;
    try {
      await sendOrderEmail(order);
    } catch (emailError) {
      notificationSent = false;
      console.error('Order saved but notification failed:', emailError);
    }

    return sendJson(response, 200, {
      status: 'success',
      orderId: order.orderId,
      notificationSent,
    });
  } catch (error) {
    console.error('Order submission failed:', error);
    return sendJson(response, 502, {
      status: 'error',
      message: 'We could not confirm your order. Please try again or text Rida at (469) 545-0781.',
    });
  }
};

module.exports._test = {
  normalizeItems,
  validateAndBuildOrder,
  paymentCounts,
  tierSummary,
};
