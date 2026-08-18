const zipcodes = require('zipcodes');

// Internal routing model. Do not expose the dispatch reference point in public copy or API responses.
const DISPATCH_REFERENCE = Object.freeze({ latitude: 33.2362, longitude: -96.7954 });
const ROAD_DISTANCE_FACTOR = 1.2;
const CORE_MAX_MILES = 25;
const REGIONAL_MAX_MILES = 35;
const SERVICE_MAX_MILES = 60;
const EARTH_RADIUS_MILES = 3958.8;

function radians(value) {
  return Number(value) * Math.PI / 180;
}

function straightLineMiles(from, to) {
  const latitudeDelta = radians(to.latitude - from.latitude);
  const longitudeDelta = radians(to.longitude - from.longitude);
  const fromLatitude = radians(from.latitude);
  const toLatitude = radians(to.latitude);
  const haversine = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(fromLatitude) * Math.cos(toLatitude) * Math.sin(longitudeDelta / 2) ** 2;
  return 2 * EARTH_RADIUS_MILES * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function safePolicy(zone, fallbackId) {
  if (!zone) return null;
  const minimumOrder = Number(zone.minimumOrder);
  const freeDeliveryThreshold = Number(zone.freeDeliveryThreshold);
  const deliveryFee = Number(zone.deliveryFee);
  if (![minimumOrder, freeDeliveryThreshold, deliveryFee].every(Number.isFinite)) return null;
  return {
    id: String(zone.id || fallbackId).slice(0, 40),
    label: String(zone.label || fallbackId).slice(0, 80),
    minimumOrder,
    freeDeliveryThreshold,
    deliveryFee,
  };
}

function quoteDeliveryZone(zipCode, policies, lookup = zipcodes.lookup) {
  const zip = String(zipCode || '').trim();
  if (!/^\d{5}$/.test(zip)) return { supported: false, reason: 'invalid-zip' };

  const location = lookup(zip);
  if (!location || location.state !== 'TX'
    || !Number.isFinite(Number(location.latitude))
    || !Number.isFinite(Number(location.longitude))) {
    return { supported: false, reason: 'outside-service-area' };
  }

  const straightMiles = straightLineMiles(DISPATCH_REFERENCE, location);
  const estimatedDrivingMiles = straightMiles * ROAD_DISTANCE_FACTOR;
  if (estimatedDrivingMiles > SERVICE_MAX_MILES) {
    return { supported: false, reason: 'outside-service-area' };
  }

  const zoneId = estimatedDrivingMiles <= CORE_MAX_MILES
    ? 'core'
    : estimatedDrivingMiles <= REGIONAL_MAX_MILES
      ? 'regional'
      : 'extended';
  const policy = safePolicy(policies?.deliveryZones?.[zoneId], zoneId);
  if (!policy) return { supported: false, reason: 'pricing-unavailable' };

  return {
    supported: true,
    zoneId,
    policy,
    // Retained server-side for audits and boundary review; never returned by the public endpoint.
    estimatedDrivingMiles: Math.round(estimatedDrivingMiles * 10) / 10,
    city: String(location.city || '').slice(0, 80),
  };
}

module.exports = {
  CORE_MAX_MILES,
  REGIONAL_MAX_MILES,
  SERVICE_MAX_MILES,
  quoteDeliveryZone,
  straightLineMiles,
};
