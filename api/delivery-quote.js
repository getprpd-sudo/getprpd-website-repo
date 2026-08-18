const ORDER_CONFIG = require('../config/order-config');
const { quoteDeliveryZone } = require('./_delivery-zones');

function sendJson(response, status, body) {
  response.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'public, max-age=300, s-maxage=3600');
  response.end(JSON.stringify(body));
}

module.exports = async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return sendJson(response, 405, { status: 'error', message: 'Method not allowed.' });
  }

  const quote = quoteDeliveryZone(request.query?.zip, ORDER_CONFIG.policies);
  if (!quote.supported) {
    return sendJson(response, 200, {
      status: 'success',
      supported: false,
      reason: quote.reason,
    });
  }

  return sendJson(response, 200, {
    status: 'success',
    supported: true,
    policy: quote.policy,
  });
};

module.exports._test = { quoteDeliveryZone };
