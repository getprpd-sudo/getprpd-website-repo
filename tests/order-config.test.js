const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const config = require('../config/order-config');
const orderApi = require('../api/order');

const dishes = Object.values(config.menu).flat();

test('weekly order config has unique, server-priceable dishes', () => {
  const ids = dishes.map(dish => dish.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(dishes.length > 0);

  for (const dish of dishes) {
    assert.ok(dish.name);
    assert.ok(config.prices[dish.category]);
    assert.ok(Number.isFinite(dish.macros.cal));
    assert.ok(Number.isFinite(dish.macros.protein));

    if (dish.category === 'dessert') {
      assert.ok(Number.isFinite(config.prices[dish.category].single));
    } else {
      assert.ok(Number.isFinite(config.prices[dish.category].lean));
      assert.ok(Number.isFinite(config.prices[dish.category].bulk));
      assert.ok(dish.bulkMacros);
    }
  }
});

test('weekly config remains valid UTF-8 text', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'config', 'order-config.js'), 'utf8');
  assert.doesNotMatch(source, /\uFFFD/);
  assert.match(source, /jalapeño/);
});

test('server totals lean, bulk, and dessert tiers from shared prices', () => {
  const items = orderApi._test.normalizeItems([
    { id: 'b1', tier: 'lean', qty: 2 },
    { id: 'b1', tier: 'bulk', qty: 1 },
    { id: 'm6', tier: 'bulk', qty: 1 },
    { id: 'd1', qty: 2 },
  ]);

  assert.deepEqual(items.map(item => [item.id, item.tier, item.qty, item.subtotal]), [
    ['b1', 'lean', 2, 21.98],
    ['b1', 'bulk', 1, 12.99],
    ['m6', 'bulk', 1, 15.99],
    ['d1', 'single', 2, 13.98],
  ]);
});

test('server combines duplicate lines and rejects unknown menu IDs', () => {
  const items = orderApi._test.normalizeItems([
    { id: 'm2', tier: 'lean', qty: 1 },
    { id: 'm2', tier: 'lean', qty: 2 },
  ]);
  assert.equal(items.length, 1);
  assert.equal(items[0].qty, 3);
  assert.throws(
    () => orderApi._test.normalizeItems([{ id: 'not-real', tier: 'lean', qty: 1 }]),
    /unknown menu item/i,
  );
});

test('server accepts new references and open-page legacy references', () => {
  assert.equal(orderApi._test.isValidOrderId('PRPD-B2-20260714-A4F2C91D'), true);
  assert.equal(orderApi._test.isValidOrderId('PRPD-B2-20260714-A4F2'), true);
  assert.equal(orderApi._test.isValidOrderId('PRPD-B1-20260714-A4F2C91D'), false);
  assert.equal(orderApi._test.isValidOrderId('PRPD-B2-20260714-NOTHEX99'), false);
});

test('order page consumes the shared config instead of duplicating it', () => {
  const orderHtml = fs.readFileSync(path.join(__dirname, '..', 'order.html'), 'utf8');
  assert.match(orderHtml, /<script src="\/config\/order-config\.js"><\/script>/);
  assert.doesNotMatch(orderHtml, /const MENU\s*=\s*\{/);
  assert.doesNotMatch(orderHtml, /const BATCH\s*=\s*\{/);
});
