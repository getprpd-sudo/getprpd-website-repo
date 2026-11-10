const assert = require('node:assert/strict');
const test = require('node:test');

test('customer confirmation sends an itemized, unpaid order receipt to the customer', async () => {
  const modulePath = require.resolve('../api/order');
  const originalFetch = global.fetch;
  const originalKey = process.env.RESEND_API_KEY;
  let request;

  process.env.RESEND_API_KEY = 're_test_confirmation';
  delete require.cache[modulePath];
  global.fetch = async (url, options) => {
    request = { url, options };
    return { ok: true, status: 200 };
  };

  try {
    const orderApi = require('../api/order');
    await orderApi._test.sendCustomerConfirmationEmail({
      orderId: 'PRPD-B3-20260721-A1B2C3D4',
      firstName: 'Jane',
      email: 'jane@example.com',
      deliveryAddress: '123 Main Street',
      deliveryHasUnit: true,
      deliveryUnit: 'Apt 204',
      deliveryCity: 'Frisco',
      deliveryState: 'TX',
      deliveryZip: '75035',
      items: [{
        name: 'High Protein Omelette', category: 'standard', tier: 'lean', qty: 2, unitPrice: 10.99, subtotal: 21.98,
      }, {
        name: 'Chicken Bowl', category: 'standard', tier: 'bulk', qty: 1, unitPrice: 35.03, subtotal: 35.03,
      }],
      mealSubtotal: 57.01,
      deliveryFee: 9.99,
      deliveryZoneLabel: 'Local Delivery',
      discountAmount: 15,
      promoCode: 'TEST15',
      menuEmailOptIn: true,
      salesTax: 0,
      taxRate: 0,
      exactTotal: 52,
      roundedTotal: 52,
    });

    assert.equal(request.url, 'https://api.resend.com/emails');
    assert.equal(request.options.headers['Idempotency-Key'], 'order-customer-PRPD-B3-20260721-A1B2C3D4');
    const message = JSON.parse(request.options.body);
    assert.deepEqual(message.to, ['jane@example.com']);
    assert.equal(message.reply_to, 'hello@getprpd.com');
    assert.equal(message.subject, 'PRPD Invoice - PRPD-B3-20260721-A1B2C3D4 - $52.00');
    assert.match(message.text, /2x High Protein Omelette \(Lean\) - \$21\.98/);
    assert.match(message.text, /Partner discount \(TEST15\): -\$15\.00/);
    assert.match(message.text, /Delivery \(Local Delivery\): \$9\.99/);
    assert.match(message.text, /Total due: \$52\.00/);
    assert.match(message.text, /weekly menu and cutoff emails/i);
    assert.match(message.text, /awaiting payment and final confirmation/i);
    assert.match(message.text, /Zelle \$52\.00 to payments@getprpd\.com/);
    assert.match(message.text, /recipient displays PRPD/i);
    assert.match(message.text, /Include your name or order reference PRPD-B3-20260721-A1B2C3D4 in the memo/);
    assert.match(message.html, /Pay by Zelle/);
    assert.match(message.html, /payments@getprpd\.com/);
    assert.match(message.html, /background:#173c2b/);
    assert.match(message.html, /<thead>/);
    assert.match(message.html, />ITEM<\/th>/);
    assert.match(message.html, />QTY<\/th>/);
    assert.match(message.html, />AMOUNT<\/th>/);
    assert.match(message.html, /High Protein Omelette/);
    assert.match(message.html, />Lean<\/td>/);
    assert.match(message.html, /\$10\.99/);
    assert.doesNotMatch(message.text, /\(469\) 715-7120|Recipient: Rida Khan/);
    assert.doesNotMatch(message.text, /payment received|paid in full/i);
  } finally {
    global.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = originalKey;
    delete require.cache[modulePath];
  }
});

test('pickup confirmation says pickup, omits a customer delivery address, and keeps the location private', async () => {
  const modulePath = require.resolve('../api/order');
  const originalFetch = global.fetch;
  const originalKey = process.env.RESEND_API_KEY;
  let request;

  process.env.RESEND_API_KEY = 're_test_pickup_confirmation';
  delete require.cache[modulePath];
  global.fetch = async (url, options) => {
    request = { url, options };
    return { ok: true, status: 200 };
  };

  try {
    const orderApi = require('../api/order');
    await orderApi._test.sendCustomerConfirmationEmail({
      orderId: 'PRPD-B6-20260812-A1B2C3D4',
      firstName: 'Pickup',
      email: 'pickup@example.com',
      fulfillmentMethod: 'pickup',
      pickupCity: 'Frisco', pickupState: 'TX',
      deliveryAddress: '', deliveryHasUnit: false, deliveryUnit: '',
      deliveryCity: '', deliveryState: '', deliveryZip: '',
      items: [{ name: 'Hot Honey Chicken Sliders', category: 'standard', tier: 'lean', qty: 6, unitPrice: 10.99, subtotal: 65.94 }],
      mealSubtotal: 65.94,
      deliveryFee: 0,
      deliveryZoneLabel: 'Pickup',
      discountAmount: 0,
      promoCode: '',
      menuEmailOptIn: false,
      salesTax: 0,
      taxRate: 0,
      exactTotal: 65.94,
      roundedTotal: 66,
    });

    const message = JSON.parse(request.options.body);
    assert.match(message.text, /Pickup: Frisco, TX - exact pickup address sent after confirmation/);
    assert.match(message.text, /Pickup: Free/);
    assert.doesNotMatch(message.text, /Delivery address:/);
    assert.doesNotMatch(message.text, /\d+ Main Street/);
    assert.match(message.html, /exact pickup address sent after confirmation/);
  } finally {
    global.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = originalKey;
    delete require.cache[modulePath];
  }
});

test('customer invoice fails closed when item rows and totals do not reconcile', () => {
  const orderApi = require('../api/order');
  assert.throws(() => orderApi._test.buildCustomerInvoiceMessage({
    orderId: 'PRPD-B15-20261014-03FFE8DA',
    firstName: 'Test',
    email: 'test@example.com',
    fulfillmentMethod: 'delivery',
    deliveryAddress: '123 Test Street',
    deliveryCity: 'Dallas',
    deliveryState: 'TX',
    deliveryZip: '75001',
    items: [{ name: 'Test Meal', category: 'standard', tier: 'lean', qty: 1, unitPrice: 10.99, subtotal: 10.99 }],
    mealSubtotal: 20.99,
    deliveryFee: 0,
    discountAmount: 0,
    salesTax: 0,
    exactTotal: 20.99,
    roundedTotal: 21,
  }), /item total does not match/i);
});
