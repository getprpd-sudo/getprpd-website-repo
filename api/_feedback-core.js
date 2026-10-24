'use strict';

const crypto = require('node:crypto');

const TOKEN_PATTERN = /^[A-Za-z0-9_-]{40,60}$/;
const ORDER_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]{5,99}$/;
const MEAL_ID_PATTERN = /^[a-z][a-z0-9_-]{0,31}$/i;
const TIERS = new Set(['lean', 'bulk', 'single']);
const DISPLAY_OPTIONS = new Set(['first-name', 'initials', 'anonymous']);

function clean(value, maxLength = 200) {
  return String(value ?? '').replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, maxLength);
}

function sheetCell(value, maxLength = 200) {
  const text = clean(value, maxLength);
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}

function inputError(message) {
  const error = new Error(message);
  error.code = 'feedback_input';
  throw error;
}

function tokenHash(token) {
  return crypto.createHash('sha256').update(String(token || ''), 'utf8').digest('hex');
}

function stableToken(secret, orderId, batch) {
  if (!secret || String(secret).length < 24) throw new Error('Feedback token secret is not configured.');
  return crypto.createHmac('sha256', String(secret))
    .update(`prpd-feedback-v1|${batch}|${orderId}`, 'utf8')
    .digest('base64url');
}

function customerKey(secret, order) {
  const identity = clean(order.email, 254).toLowerCase()
    || clean(order.phone, 40).replace(/\D/g, '')
    || `${clean(order.customerName, 120).toLowerCase()}|${clean(order.orderId, 100)}`;
  return crypto.createHmac('sha256', String(secret)).update(identity, 'utf8').digest('hex').slice(0, 32);
}

function normalizeProvision(raw) {
  if (!raw || raw.action !== 'provision' || !Array.isArray(raw.orders)) inputError('Invalid feedback-label request.');
  const batch = Number(raw.batch);
  if (!Number.isInteger(batch) || batch < 1 || batch > 999) inputError('Feedback batch is invalid.');
  const batchId = clean(raw.batchId, 40);
  const deliveryDate = clean(raw.deliveryDate, 80);
  if (!batchId || !deliveryDate || raw.orders.length < 1 || raw.orders.length > 100) inputError('Feedback-label batch details are incomplete.');
  const seenOrders = new Set();
  const orders = raw.orders.map((entry, orderIndex) => {
    const orderId = clean(entry?.orderId, 100);
    const customerName = clean(entry?.customerName, 120);
    const customerFirstName = clean(entry?.customerFirstName, 60) || customerName.split(/\s+/)[0];
    if (!ORDER_ID_PATTERN.test(orderId) || seenOrders.has(orderId)) inputError(`Feedback order ${orderIndex + 1} has an invalid or duplicate reference.`);
    if (!customerName || !customerFirstName) inputError(`Feedback order ${orderIndex + 1} is missing its customer name.`);
    seenOrders.add(orderId);
    if (!Array.isArray(entry.meals) || !entry.meals.length || entry.meals.length > 40) inputError(`${customerName} has no feedback dishes.`);
    const seenMeals = new Set();
    const meals = entry.meals.map((meal, mealIndex) => {
      const id = clean(meal?.id, 32);
      const tier = clean(meal?.tier, 10).toLowerCase();
      const name = clean(meal?.name, 120);
      const image = clean(meal?.image, 300);
      const quantity = Number(meal?.quantity);
      const key = `${id}:${tier}`;
      if (!MEAL_ID_PATTERN.test(id) || !TIERS.has(tier) || !name || !Number.isInteger(quantity) || quantity < 1 || quantity > 50 || seenMeals.has(key)) {
        inputError(`${customerName} dish ${mealIndex + 1} is invalid or duplicated.`);
      }
      if (image && !/^\/assets\/[A-Za-z0-9_./-]+$/.test(image)) inputError(`${name} has an invalid image path.`);
      seenMeals.add(key);
      return { id, tier, name, image, quantity };
    });
    return {
      orderId, customerName, customerFirstName, meals,
      email: clean(entry.email, 254), phone: clean(entry.phone, 40),
    };
  });
  return { batch, batchId, deliveryDate, orders };
}

function normalizeSave(raw, expectedMeals) {
  if (!raw || raw.action !== 'save' || !TOKEN_PATTERN.test(String(raw.token || '')) || !Array.isArray(raw.meals)) {
    inputError('Invalid feedback submission.');
  }
  const expected = new Map((expectedMeals || []).map(meal => [`${meal.id}:${meal.tier}`, meal]));
  if (raw.meals.length > expected.size) inputError('Feedback includes an unexpected dish.');
  const seen = new Set();
  const meals = raw.meals.map((entry) => {
    const id = clean(entry?.id, 32);
    const tier = clean(entry?.tier, 10).toLowerCase();
    const key = `${id}:${tier}`;
    const score = Number(entry?.score);
    const liked = clean(entry?.liked, 500);
    const change = clean(entry?.change, 500);
    if (!expected.has(key) || seen.has(key)) inputError('Feedback includes an unexpected or duplicate dish.');
    if (!Number.isInteger(score) || score < 1 || score > 10) inputError('Every saved rating must be between 1 and 10.');
    seen.add(key);
    return { id, tier, score, liked, change };
  });
  const finalize = raw.finalize === true;
  if (finalize) {
    if (meals.length !== expected.size) inputError('Every unique dish must be reviewed before finishing.');
    if (meals.some(meal => meal.liked.length < 8)) inputError('Every dish needs a short note about what you liked.');
  }
  return {
    meals,
    overallNote: clean(raw.overallNote, 1000),
    testimonialConsent: raw.testimonialConsent === true,
    testimonialDisplay: DISPLAY_OPTIONS.has(raw.testimonialDisplay) ? raw.testimonialDisplay : 'first-name',
    finalize,
  };
}

function parseDeliveryDate(value) {
  const date = new Date(String(value || ''));
  if (Number.isNaN(date.getTime())) return null;
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addDays(date, days) {
  const copy = new Date(date.getTime());
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

module.exports = {
  TOKEN_PATTERN,
  clean,
  sheetCell,
  tokenHash,
  stableToken,
  customerKey,
  normalizeProvision,
  normalizeSave,
  parseDeliveryDate,
  addDays,
};
