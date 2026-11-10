const test = require('node:test');
const assert = require('node:assert/strict');
const { catalog, version } = require('../operations/grocery-catalog.js');
const grocery = require('../operations/grocery-list-core.js');

test('latest receipt-backed weight prices replace default shopping rates', () => {
  const pricesPerPound = {
    chicken_breast_raw: 2.49,
    onion: 1.18,
    jalapeno: 1.32,
    zucchini: 1.42,
  };
  for (const [key, price] of Object.entries(pricesPerPound)) {
    assert.equal(catalog[key].price, price, key);
    assert.equal(catalog[key].packageSize, 453.592, key);
    assert.equal(catalog[key].confidence, 'verified', key);
    assert.match(catalog[key].store, key === 'onion' || key === 'jalapeno' ? /receipt 2026-10-15/ : /receipt 2026-10-01/, key);
  }
  assert.equal(version, '2026-10-19.2');
  assert.equal(catalog.protein_pasta.packageSize, 411);
  assert.equal(catalog.protein_pasta.price, 2.88);
  assert.equal(catalog.protein_pasta.confidence, 'verified');
  assert.match(catalog.protein_pasta.store, /Walmart receipt 2026-10-15/);
  assert.match(catalog.protein_pasta.query, /Barilla Protein Plus spaghetti/);
  assert.equal(catalog.kroger_protein_pasta.confidence, 'legacy');
  assert.equal(catalog.barilla_protein_plus_rotini.confidence, 'planning');
  assert.equal(catalog.chicken_thigh_raw.packageSize, 40 * 453.592);
  assert.equal(catalog.chicken_thigh_raw.price, 80.80);
  assert.equal(catalog.chicken_thigh_raw.confidence, 'verified');
  assert.match(catalog.chicken_thigh_raw.packageLabel, /40 lb/);
  assert.match(catalog.chicken_thigh_raw.store, /\$2\.02\/lb case price/);
  assert.equal(catalog.ginger.packageSize, 100);
  assert.equal(catalog.ginger.price, 3.97 * 100 / 453.592);
  assert.equal(catalog.ginger.confidence, 'verified');
  assert.match(catalog.ginger.store, /receipt 2026-10-01 at \$3.97\/lb/);
  assert.match(catalog.ginger.packageLabel, /not a whole piece or package/);
  assert.equal(catalog.tomato.packageSize, 454);
  assert.equal(catalog.tomato.price, 0.75 * 454 / 453.592);
  assert.equal(catalog.tomato.confidence, 'verified');
  assert.match(catalog.tomato.store, /receipt 2026-10-15 at \$0.75\/lb/);
  assert.match(catalog.tomato.store, /not a package size/);
});

test('receipt prices do not turn unverified package or steak-cut assumptions into facts', () => {
  assert.equal(catalog.pink_salmon_raw.price, 12.47);
  assert.equal(catalog.pink_salmon_raw.packageSize, 907.184);
  assert.equal(catalog.pink_salmon_raw.confidence, 'planning');
  assert.match(catalog.pink_salmon_raw.store, /owner record, not receipt-verified/);
  assert.match(catalog.pink_salmon_raw.packageLabel, /verify panel and usable yield/);
  assert.equal(catalog.shan_biryani.price, 2.29);
  assert.equal(catalog.shan_biryani.packageSize, 50);
  assert.equal(catalog.shan_biryani.confidence, 'planning');
  assert.match(catalog.shan_biryani.store, /verify 50 g package assumption/);
  assert.equal(catalog.ny_strip_raw.price, 10.99);
  assert.equal(catalog.ny_strip_raw.packageSize, 453.592);
  assert.equal(catalog.ny_strip_raw.confidence, 'planning');
  assert.match(catalog.ny_strip_raw.store, /exact NY strip cut not printed/);
});

test('ground-beef prices preserve their exact recipe identities', () => {
  assert.equal(catalog.beef_90_raw.price, 5.73);
  assert.match(catalog.beef_90_raw.store, /Restaurant Depot receipt 2026-10-15/);
  assert.match(catalog.beef_90_raw.packageLabel, /90\/10/);
  assert.equal(catalog.beef_96_raw.price, 5.70);
  assert.equal(catalog.beef_96_raw.confidence, 'verified');
  assert.match(catalog.beef_96_raw.store, /Owner-confirmed current 96\/4 purchase price/);
  assert.equal(catalog.shan_seekh.price, 2.49);
  assert.equal(catalog.shan_butter_chicken.price, 2.49);
  assert.equal(catalog.shawarma_bread.packageSize, 8);
  assert.equal(catalog.shawarma_bread.price, 5);
});

test('Grocery Builder uses revised defaults when no manual price is saved', () => {
  const rows = grocery.buildPurchaseRows([
    { key: 'chicken_thigh_raw', name: 'Thighs', unit: 'g', required: 907.184 },
    { key: 'ginger', name: 'Ginger', unit: 'g', required: 453.592 },
  ], catalog);
  assert.equal(rows[0].packagePrice, 80.80);
  assert.equal(rows[0].usageCost, 4.04);
  assert.equal(rows[0].packages, 1);
  assert.equal(rows[1].packagePrice, 3.97 * 100 / 453.592);
  assert.equal(rows[1].usageCost, 3.97);
});

test('receipt-default refresh preserves saved manual prices, pantry and purchase overrides', () => {
  const saved = {
    onHand: { chicken_thigh_raw: 453.592 },
    catalog: { chicken_thigh_raw: { price: 78 }, ginger: { price: 0.80 }, tomato: { price: 0.97 } },
    buyPackages: { chicken_thigh_raw: 3 },
  };
  const before = structuredClone(saved);
  const [row, ginger, tomato] = grocery.buildPurchaseRows([
    { key: 'chicken_thigh_raw', name: 'Thighs', unit: 'g', required: 907.184 },
    { key: 'ginger', name: 'Ginger', unit: 'g', required: 200 },
    { key: 'tomato', name: 'Tomato', unit: 'g', required: 908 },
  ], catalog, saved);
  assert.equal(row.packagePrice, 78);
  assert.equal(row.usageCost, 3.90);
  assert.equal(row.onHand, 453.6);
  assert.equal(row.needed, 453.6);
  assert.equal(row.suggestedPackages, 1);
  assert.equal(row.packages, 3);
  assert.equal(row.estimatedCost, 234);
  assert.equal(ginger.packageSize, 100);
  assert.equal(ginger.packagePrice, 0.80);
  assert.equal(ginger.usageCost, 1.60);
  assert.equal(tomato.packageSize, 454);
  assert.equal(tomato.packagePrice, 0.97);
  assert.equal(tomato.usageCost, 1.94);
  assert.deepEqual(saved, before);
  assert.equal(catalog.chicken_thigh_raw.price, 80.80);
});

test('all refreshed catalog rows retain the prior unit basis of saved manual prices', () => {
  const priorUnits = {
    chicken_thigh_raw: 18143.68,
    chicken_breast_raw: 453.592,
    pink_salmon_raw: 907.184,
    shan_biryani: 50,
    ny_strip_raw: 453.592,
    onion: 453.592,
    tomato: 454,
    ginger: 100,
    jalapeno: 453.592,
    zucchini: 453.592,
  };
  for (const [key, size] of Object.entries(priorUnits)) {
    assert.equal(catalog[key].packageSize, size, `${key} price-unit basis changed`);
  }
});

test('October 14 owner receipts lock tortilla and grab-and-go packaging costs', () => {
  assert.equal(catalog.small_tortilla.packageSize, 16);
  assert.equal(catalog.small_tortilla.price, 7.31);
  assert.equal(catalog.small_tortilla.confidence, 'verified');
  assert.match(catalog.small_tortilla.store, /Owner receipt record 2026-10-14/);
  assert.equal(catalog.grab_go_container.packageSize, 50);
  assert.equal(catalog.grab_go_container.price, 17.99);
  assert.equal(catalog.grab_go_container.confidence, 'verified');
});
