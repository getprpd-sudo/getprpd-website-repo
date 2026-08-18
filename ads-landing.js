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

  if (batch.published !== true) {
    cutoff.textContent = 'Next menu coming Monday';
    delivery.textContent = 'Fresh weekly delivery';
    mobileDeadline.textContent = 'Next menu coming Monday';
    grid.hidden = true;
    status.hidden = false;
    return;
  }

  cutoff.textContent = `Order by ${batch.cutoffLabel}`;
  delivery.textContent = `Delivery: ${batch.deliveryDate}`;
  mobileDeadline.textContent = batch.cutoffLabel;

  const picks = (menu.mains || []).filter(dish => dish.available !== false && dish.image).slice(0, 3);
  if (!picks.length) {
    grid.hidden = true;
    status.hidden = false;
    return;
  }

  for (const dish of picks) {
    const price = Number(prices[dish.category]?.lean || dish.price || 0);
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
    link.href = '/order';
    link.dataset.funnelDetail = `meal-${dish.id}`;
    link.textContent = 'Order →';
    footer.append(from, link);
    body.append(meta, title, description, footer);
    card.append(imageWrap, body);
    grid.append(card);
  }
}(window, document));
