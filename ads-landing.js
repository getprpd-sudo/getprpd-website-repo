(function initializeAdsLanding(windowObject, documentObject) {
  'use strict';

  const config = windowObject.PRPD_ORDER_CONFIG;
  if (!config) return;

  const { batch, menu, prices } = config;
  const cutoff = documentObject.getElementById('adsCutoff');
  const delivery = documentObject.getElementById('adsDelivery');
  const mobileDeadline = documentObject.getElementById('adsMobileDeadline');
  const grid = documentObject.getElementById('adsMenuGrid');
  const status = documentObject.getElementById('adsMenuStatus');
  const heroDeliveryDay = documentObject.getElementById('adsHeroDeliveryDay');
  const localDeliveryDay = documentObject.getElementById('adsLocalDeliveryDay');
  const receiveDeliveryDay = documentObject.getElementById('adsReceiveDeliveryDay');
  const scheduleAnswer = documentObject.getElementById('adsScheduleAnswer');

  const deliveryDayMatch = String(batch.deliveryDate || '').match(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/i);
  const deliveryDay = deliveryDayMatch ? deliveryDayMatch[1] : 'the published delivery day';

  heroDeliveryDay.textContent = deliveryDay;
  localDeliveryDay.textContent = deliveryDay;
  receiveDeliveryDay.textContent = deliveryDay;
  scheduleAnswer.textContent = batch.published === true
    ? `Order by ${batch.cutoffLabel} for delivery on ${batch.deliveryDate}. The live order page reflects any owner-approved schedule change.`
    : 'Ordering is currently closed. The next published menu will show its exact cutoff and delivery date here.';

  if (batch.published !== true) {
    cutoff.textContent = 'Ordering currently closed';
    delivery.textContent = 'Fresh weekly delivery';
    mobileDeadline.textContent = 'Ordering currently closed';
    grid.hidden = true;
    status.textContent = 'Ordering is currently closed. The next published weekly menu will appear here.';
    status.hidden = false;
    return;
  }

  cutoff.textContent = `Order by ${batch.cutoffLabel}`;
  delivery.textContent = `Delivery: ${batch.deliveryDate}`;
  mobileDeadline.textContent = batch.cutoffLabel;

  // Use every photographed part of the live menu so the preview stays balanced
  // even when the newest main dishes are still waiting on photography.
  const picks = [
    ...(menu.mains || []),
    ...(menu.breakfasts || []),
    ...(menu.desserts || []),
    ...(menu.addons || []),
  ].filter(dish => dish.available !== false && dish.image).slice(0, 4);
  if (!picks.length) {
    grid.hidden = true;
    status.textContent = `This week's menu is live for ${batch.deliveryDate}. View every dish, price, and macro on the full order page.`;
    status.hidden = false;
    return;
  }

  for (const dish of picks) {
    const price = Number(prices[dish.category]?.lean ?? prices[dish.category]?.single ?? dish.price ?? 0);
    const card = documentObject.createElement('article');
    card.className = 'ads-meal-card';

    const imageWrap = documentObject.createElement('div');
    imageWrap.className = 'ads-meal-card__image';
    const image = documentObject.createElement('img');
    image.src = dish.images?.lean || dish.image;
    image.alt = dish.name;
    image.loading = 'lazy';
    image.addEventListener('error', () => { imageWrap.classList.add('is-placeholder'); image.remove(); });
    const brand = documentObject.createElement('span');
    brand.textContent = 'PRPD';
    imageWrap.append(image, brand);

    const body = documentObject.createElement('div');
    body.className = 'ads-meal-card__body';
    const meta = documentObject.createElement('p');
    meta.className = 'ads-meal-card__meta';
    meta.textContent = `${dish.macros.protein}g protein · ${dish.macros.cal} cal`;
    const title = documentObject.createElement('h3');
    title.textContent = dish.name;
    const description = documentObject.createElement('p');
    description.textContent = dish.description;
    const footer = documentObject.createElement('div');
    const from = documentObject.createElement('span');
    from.textContent = price ? `From $${price.toFixed(2)}` : 'Weekly menu';
    const link = documentObject.createElement('a');
    link.href = '/order?promo=WELCOME10';
    link.dataset.funnelDetail = `meal-${dish.id}`;
    link.textContent = 'Order →';
    footer.append(from, link);
    body.append(meta, title, description, footer);
    card.append(imageWrap, body);
    grid.append(card);
  }
}(window, document));
