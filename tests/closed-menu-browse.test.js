const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('order.js', 'utf8');
const html = fs.readFileSync('order.html', 'utf8');
const css = fs.readFileSync('order.css', 'utf8');

function functionSource(name, nextName) {
  const start = source.indexOf(`    function ${name}(`);
  assert.notEqual(start, -1, `${name} should exist`);
  const end = source.indexOf(`\n    function ${nextName}(`, start);
  assert.notEqual(end, -1, `${nextName} should follow ${name}`);
  return source.slice(start, end).trim();
}

function classList() {
  const values = new Set();
  return {
    toggle(name, force) {
      if (force === undefined ? !values.has(name) : force) values.add(name);
      else values.delete(name);
    },
    contains(name) { return values.has(name); },
  };
}

function element() {
  return {
    hidden: false,
    disabled: false,
    textContent: '',
    innerHTML: '',
    classList: classList(),
    replaceChildren() { this.innerHTML = ''; this.replaced = true; },
  };
}

function availabilityHarness({ published, cutoffIso, publishedArchive, restoredItems = 0 }) {
  const nodes = new Map([
    ['orderForm', element()],
    ['welcomeOffer', element()],
    ['orderClosed', element()],
    ['mobileCartBar', element()],
    ['orderPageTitle', element()],
    ['closedMenuTitle', element()],
    ['closedMenuDescription', element()],
    ['closedMenuEyebrow', element()],
    ['browseRecentMenuLink', element()],
  ]);
  const controls = [element(), element(), element()];
  const document = {
    body: element(),
    getElementById(id) { return nodes.get(id); },
    querySelectorAll() { return controls; },
  };
  const context = vm.createContext({
    BATCH: { cutoffIso },
    IS_MENU_PUBLISHED: published,
    window: { PRPD_ORDER_CONFIG: { publishedArchive } },
    document,
    getOrderLines: () => Array.from({ length: restoredItems }, () => ({})),
  });
  vm.runInContext(`${functionSource('isOrderingClosed', 'applyOrderAvailability')}\nthis.isOrderingClosed = isOrderingClosed;`, context);
  vm.runInContext(`${functionSource('applyOrderAvailability', 'createOrderId')}\nthis.applyOrderAvailability = applyOrderAvailability;`, context);
  return { context, nodes, controls, document };
}

function renderHarness({ published, closed, publishedArchive, menu }) {
  const ids = ['batchMeta', 'orderCutoff', 'successDelivery', 'activeDeliveryDay', 'closedDeliveryCopy', 'closedDeliveryDay', 'grid-mains'];
  const nodes = new Map(ids.map(id => [id, element()]));
  const menuLink = element();
  const context = vm.createContext({
    IS_MENU_PUBLISHED: published,
    BATCH: { number: 16, deliveryDate: 'Saturday, October 24, 2026', cutoffLabel: 'Wednesday at 6:00 PM CT' },
    MENU: menu,
    MENU_SECTIONS: ['mains'],
    window: { PRPD_ORDER_CONFIG: { publishedArchive } },
    document: {
      getElementById(id) { return nodes.get(id); },
      querySelector() { return menuLink; },
    },
    isOrderingClosed: () => closed,
    getDishPhoto: dish => dish.image || '',
    isVariantDish: () => false,
    isSingleSize: () => false,
    tierOrderRowHtml: (dish, tier) => `<div class="tier-order-row"><div class="tier-order-info"><strong>${tier} · $12.99</strong><span>500 Calories · 50g Protein</span></div><div class="qty-ctrl"><button class="qty-btn">+</button></div></div>`,
    bundleOrderGroupsHtml: () => '',
    photoPlaceholderHtml: dish => `<span>${dish.name} photo pending</span>`,
    photoOverlayHtml: dish => `<strong>${dish.name}</strong>`,
    photoCropClass: () => '',
    cardAllergenBadgesHtml: () => '',
  });
  vm.runInContext(`${functionSource('renderMenu', 'initMenuFilters')}\nthis.renderMenu = renderMenu;`, context);
  return { context, nodes };
}

test('a published menu remains readable after cutoff while a restored cart cannot act', () => {
  const harness = availabilityHarness({
    published: true,
    cutoffIso: new Date(Date.now() + 60_000).toISOString(),
    restoredItems: 3,
  });

  assert.equal(harness.context.applyOrderAvailability(), false);
  assert.equal(harness.nodes.get('orderForm').hidden, false);

  harness.context.BATCH.cutoffIso = new Date(Date.now() - 60_000).toISOString();
  assert.equal(harness.context.applyOrderAvailability(), true);
  assert.equal(harness.nodes.get('orderForm').hidden, false);
  assert.equal(harness.nodes.get('orderForm').classList.contains('order-layout--browse'), true);
  assert.equal(harness.document.body.classList.contains('is-menu-browse-only'), true);
  assert.equal(harness.nodes.get('orderClosed').classList.contains('visible'), true);
  assert.equal(harness.nodes.get('mobileCartBar').hidden, true);
  assert.equal(harness.controls.every(control => control.disabled), true);
  assert.match(harness.nodes.get('closedMenuDescription').textContent, /Text MENU/);
  assert.doesNotMatch(harness.nodes.get('closedMenuDescription').textContent, /active cutoff|tonight/i);
});

test('an unpublished draft stays hidden unless an archive is explicitly published', () => {
  const draft = availabilityHarness({
    published: false,
    cutoffIso: new Date(Date.now() + 60_000).toISOString(),
  });
  assert.equal(draft.context.applyOrderAvailability(), true);
  assert.equal(draft.nodes.get('orderForm').hidden, true);
  assert.equal(draft.document.body.classList.contains('is-menu-browse-only'), false);
  assert.equal(draft.nodes.get('browseRecentMenuLink').hidden, true);
  assert.match(draft.nodes.get('closedMenuTitle').textContent, /next menu is coming soon/i);
  assert.doesNotMatch(draft.nodes.get('closedMenuDescription').textContent, /recent dishes/i);

  const archive = availabilityHarness({
    published: false,
    cutoffIso: new Date(Date.now() + 60_000).toISOString(),
    publishedArchive: { published: true, menu: { mains: [] } },
  });
  assert.equal(archive.context.applyOrderAvailability(), true);
  assert.equal(archive.nodes.get('orderForm').hidden, false);
  assert.equal(archive.document.body.classList.contains('is-menu-browse-only'), true);
  assert.equal(archive.nodes.get('browseRecentMenuLink').hidden, false);
});

test('closed rendering shows the last published dishes and removes add controls', () => {
  const current = renderHarness({
    published: true,
    closed: true,
    menu: { mains: [{ id: 'recent', name: 'Recent Meal', category: 'standard', image: '/recent.jpg' }] },
  });
  current.context.renderMenu();
  const rendered = current.nodes.get('grid-mains').innerHTML;
  assert.match(rendered, /Recent Meal/);
  assert.match(rendered, /\/recent\.jpg/);
  assert.match(rendered, /500 Calories · 50g Protein/);
  assert.match(rendered, /is-browse-only/);
  assert.doesNotMatch(rendered, /qty-btn|qty-ctrl/);
});

test('draft dish names never render, while an explicitly published archive can render', () => {
  const hiddenDraft = renderHarness({
    published: false,
    closed: true,
    menu: { mains: [{ id: 'draft', name: 'Secret Draft Meal', category: 'standard' }] },
  });
  hiddenDraft.nodes.get('grid-mains').innerHTML = 'stale';
  hiddenDraft.context.renderMenu();
  assert.equal(hiddenDraft.nodes.get('grid-mains').innerHTML, '');
  assert.equal(hiddenDraft.nodes.get('grid-mains').replaced, true);

  const archived = renderHarness({
    published: false,
    closed: true,
    menu: { mains: [{ id: 'draft', name: 'Secret Draft Meal', category: 'standard' }] },
    publishedArchive: {
      published: true,
      batch: { number: 15, published: true, deliveryDate: 'Saturday, October 17, 2026', cutoffLabel: 'Wednesday at 6:00 PM CT' },
      menu: { mains: [{ id: 'archive', name: 'Published Archive Meal', category: 'standard' }] },
    },
  });
  archived.context.renderMenu();
  const rendered = archived.nodes.get('grid-mains').innerHTML;
  assert.match(rendered, /Published Archive Meal/);
  assert.doesNotMatch(rendered, /Secret Draft Meal/);
});

test('closed banner and browse styling preserve the existing next-menu reminder', () => {
  assert.match(html, /Ordering is closed for this week\. Browse our recent menu\./);
  assert.match(html, /href="sms:\+14695450781\?&amp;body=MENU"/);
  assert.match(css, /body\.is-menu-browse-only \.order-layout--browse/);
  assert.match(css, /body\.is-menu-browse-only \.checkout-section/);
  assert.doesNotMatch(css, /body\.is-menu-browse-only[^}]*filter:\s*blur/i);
});

test('archived category prices do not inherit the next unpublished menu prices', () => {
  const context = vm.createContext({
    IS_MENU_PUBLISHED: false,
    PRICES: {standard:{lean:99,bulk:100}},
    window:{PRPD_ORDER_CONFIG:{publishedArchive:{published:true,prices:{standard:{lean:10.99,bulk:12.99}}}}},
    isVariantDish:()=>false,
    isSingleSize:()=>false,
  });
  vm.runInContext(`${functionSource('getPrice','getDishPhoto')}\nthis.getPrice=getPrice;`,context);
  assert.equal(context.getPrice({category:'standard'},'lean'),10.99);
  assert.equal(context.getPrice({category:'standard'},'bulk'),12.99);
  context.IS_MENU_PUBLISHED=true;
  assert.equal(context.getPrice({category:'standard'},'lean'),99);
});

test('menu filters keep an approved archive visible but hide a draft with no archive', () => {
  for (const approved of [true,false]) {
    const nodes = new Map(['menuFilterBar','menuFilterEmpty','menu-mains','card-archive'].map(id=>[id,element()]));
    nodes.get('menuFilterBar').querySelectorAll=()=>[];
    const context=vm.createContext({
      IS_MENU_PUBLISHED:false,
      window:{PRPD_ORDER_CONFIG:{publishedArchive:approved?{published:true,menu:{mains:[]}}:undefined}},
      MENU_SECTIONS:['mains'],MENU:{mains:[{id:'archive'}]},
      document:{getElementById:id=>nodes.get(id),addEventListener:()=>{}},
      isVariantDish:()=>false,
    });
    vm.runInContext(`${functionSource('initMenuFilters','initMenuNavigation')}\nthis.initMenuFilters=initMenuFilters;`,context);
    context.initMenuFilters();
    assert.equal(nodes.get('menu-mains').hidden,!approved);
    assert.equal(nodes.get('menuFilterBar').hidden,!approved);
  }
});


test('expired relative cutoff copy never appears on a closed published menu or archive', () => {
  const menu = { mains: [{ id: 'recent', name: 'Recent Meal', category: 'standard' }] };
  for (const archive of [false, true]) {
    const harness = renderHarness({
      published: !archive, closed: true, menu,
      publishedArchive: archive ? {
        published: true, batch: { number: 16, cutoffLabel: 'Late orders open until 11:59 PM CT tonight' }, menu,
      } : undefined,
    });
    harness.context.BATCH.cutoffLabel = 'Late orders open until 11:59 PM CT tonight';
    harness.context.renderMenu();
    assert.equal(harness.nodes.get('orderCutoff').textContent, 'Ordering closed');
  }
});

test('an open published menu keeps its approved cutoff wording', () => {
  const harness = renderHarness({
    published: true, closed: false,
    menu: { mains: [{ id: 'current', name: 'Current Meal', category: 'standard' }] },
  });
  harness.context.BATCH.cutoffLabel = 'Order by Wednesday at 6:00 PM CT';
  harness.context.renderMenu();
  assert.equal(harness.nodes.get('orderCutoff').textContent, 'Order by Wednesday at 6:00 PM CT');
});
