const assert = require('node:assert/strict');
const test = require('node:test');

process.env.PRPD_PLANNER_KEY = 'test-planner-key';
const invoiceApi = require('../api/planner-orders');
const orderApi = require('../api/order');

test('invoice resend authorization requires the exact protected planner key', () => {
  assert.equal(invoiceApi._test.keysMatch('test-planner-key', 'test-planner-key'), true);
  assert.equal(invoiceApi._test.keysMatch('test-planner', 'test-planner-key'), false);
  assert.equal(invoiceApi._test.keysMatch('', ''), false);
});

test('stored website order lines become itemized invoice rows', () => {
  const items = invoiceApi._test.parseInvoiceItemLines([
    '2x Creamy Cajun Chicken Pasta (Lean) - $21.98',
    '1x Chocolate Oreo Mousse - $6.99',
    'Delivery (Regional Delivery) - Free',
    'Partner discount (WELCOME10) - -$10.00',
  ].join('\n'));

  assert.deepEqual(items, [
    {
      name: 'Creamy Cajun Chicken Pasta', category: 'standard', tier: 'lean', variantLabel: '',
      qty: 2, unitPrice: 10.99, subtotal: 21.98,
    },
    {
      name: 'Chocolate Oreo Mousse', category: 'addon', tier: '', variantLabel: '',
      qty: 1, unitPrice: 6.99, subtotal: 6.99,
    },
  ]);
});

test('invoice resend reconstructs the customer order from the Orders sheet', () => {
  const headers = [
    'Submitted At', 'Batch', 'Delivery Date', 'First Name', 'Last Name', 'Phone', 'Items',
    'Exact Total', 'Total (Rounded)', 'Notes', 'Order ID', 'Email', 'Address', 'City', 'ZIP',
    'Delivery Notes', 'Meal Subtotal', 'Delivery Fee', 'Promo Code', 'Discount Amount',
  ];
  while (headers.length < 29) headers.push('');
  headers.push('State');
  while (headers.length < 36) headers.push('');
  headers.push('Fulfillment Method', 'Customer-Reported Source', 'Taxable Merchandise', 'Taxable Delivery', 'Tax Rate', 'Sales Tax Collected');

  const row = [];
  row[0] = '10/14/2026';
  row[2] = 'Saturday, October 17, 2026';
  row[3] = 'Mohammed';
  row[4] = 'Malik';
  row[6] = '1x Sweet Chili Chicken (Bulk) - $12.99\nDelivery (Regional Delivery) - Free\nPartner discount (WELCOME10) - -$10.00';
  row[7] = '$103.89';
  row[8] = '$104.00';
  row[10] = 'PRPD-B15-20261014-03FFE8DA';
  row[11] = 'meals@example.com';
  row[12] = '123 Test Street';
  row[13] = 'Dallas';
  row[14] = '75001';
  row[16] = 113.89;
  row[17] = 0;
  row[18] = 'WELCOME10';
  row[19] = 10;
  row[29] = 'TX';
  row[36] = 'Delivery';
  row[40] = 0;
  row[41] = 0;

  const order = invoiceApi._test.invoiceOrderFromRows([headers, row], 'PRPD-B15-20261014-03FFE8DA');
  assert.equal(order.email, 'meals@example.com');
  assert.equal(order.deliveryZoneLabel, 'Regional Delivery');
  assert.equal(order.items[0].unitPrice, 12.99);
  assert.equal(order.roundedTotal, 104);
});

test('resending an invoice preserves selected sauce counts and its extra-cup charge', () => {
  const headers=['Submitted At','Batch','Delivery Date','First Name','Last Name','Phone','Items','Exact Total','Total (Rounded)','Notes','Order ID'];
  const row=['','','','Test','Customer','','2x Savory Meal (Lean) - $20.00\n2x Sauce cup: PRPD Sweet Heat - selected\n2x Sauce cup: Garlic Herb Yogurt - selected\nExtra sauce cups: 1 - $1.00',21,21,'','test-order'];
  const order=invoiceApi._test.invoiceOrderFromRows([headers,row],'test-order');
  assert.equal(order.items.length,1);
  assert.deepEqual(order.sauces.selections,[{name:'PRPD Sweet Heat',qty:2},{name:'Garlic Herb Yogurt',qty:2}]);
  assert.equal(order.sauces.extraQty,1);
  assert.equal(order.sauces.extraSubtotal,1);
});

test('a completed-fulfillment invoice uses delivered-order copy without changing the default template', () => {
  const order = {
    orderId: 'PRPD-B15-MANUAL-20261014-NOUMAN',
    firstName: 'Nouman',
    email: 'nouman@example.com',
    deliveryDate: 'Saturday, October 17, 2026',
    fulfillmentMethod: 'delivery',
    deliveryAddress: '123 Test Street',
    deliveryUnit: '',
    deliveryCity: 'Bedford',
    deliveryState: 'TX',
    deliveryZip: '76022',
    items: [{
      name: 'Custom Lean Chicken Mince', category: 'standard', tier: 'lean',
      qty: 20, unitPrice: 15.99, subtotal: 319.80,
    }],
    sauces: { selections: [], extraQty: 0, extraSubtotal: 0 },
    mealSubtotal: 319.80,
    deliveryFee: 14.99,
    deliveryZoneLabel: 'Extended delivery',
    promoCode: '',
    discountAmount: 0,
    taxRate: 0,
    salesTax: 0,
    exactTotal: 334.79,
    roundedTotal: 335,
    menuEmailOptIn: false,
  };

  const pending = orderApi._test.buildCustomerInvoiceMessage(order);
  assert.match(pending.html, /Hi Nouman, your order is in\./);
  assert.match(pending.html, /awaiting payment and final confirmation from Rida/);

  const delivered = orderApi._test.buildCustomerInvoiceMessage({ ...order, fulfillmentCompleted: true });
  assert.match(delivered.html, /Hi Nouman, here is your invoice\./);
  assert.match(delivered.html, /delivered on Saturday, October 17, 2026\. The balance is still due\./);
  assert.match(delivered.html, /This invoice will be marked paid after Rida verifies payment\./);
  assert.doesNotMatch(delivered.html, /your order is in|awaiting payment and final confirmation|Your order is confirmed after/);
  assert.match(delivered.text, /Here is your invoice for the order delivered on Saturday, October 17, 2026\. The balance is still due\./);
  assert.equal(delivered.subject, 'PRPD Invoice - PRPD-B15-MANUAL-20261014-NOUMAN - $335.00');
});
