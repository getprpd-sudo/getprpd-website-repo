const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('ads-landing.js', 'utf8');

function render({ published = true, cutoffIso }) {
  const nodes = new Map();
  const document = {
    getElementById(id) {
      if (!nodes.has(id)) nodes.set(id, { textContent: '', hidden: false });
      return nodes.get(id);
    },
  };
  vm.runInNewContext(source, {
    window: { PRPD_ORDER_CONFIG: {
      batch: { published, cutoffIso, cutoffLabel: 'Wednesday at 6 PM CT', deliveryDate: 'Saturday, October 31, 2026' },
      menu: {}, prices: {},
    } },
    document,
    Date: class extends Date { static now() { return Date.parse('2026-10-28T23:00:00Z'); } },
  });
  return nodes;
}

test('landing page stops promising an order deadline at the exact cutoff and afterwards', () => {
  for (const cutoffIso of ['2026-10-28T18:00:00-05:00', '2026-10-27T18:00:00-05:00']) {
    const nodes = render({ cutoffIso });
    assert.equal(nodes.get('adsCutoff').textContent, 'Ordering currently closed');
    assert.equal(nodes.get('adsMobileDeadline').textContent, 'Ordering currently closed');
    assert.match(nodes.get('adsScheduleAnswer').textContent, /currently closed/);
    assert.equal(nodes.get('adsMenuGrid').hidden, true);
  }
});

test('published future menu displays its approved dates', () => {
  const nodes = render({ cutoffIso: '2026-10-28T18:01:00-05:00' });
  assert.equal(nodes.get('adsCutoff').textContent, 'Order by Wednesday at 6 PM CT');
  assert.match(nodes.get('adsScheduleAnswer').textContent, /Order by Wednesday/);
});

test('unpublished and missing or invalid cutoff states do not advertise open ordering', () => {
  for (const options of [
    { published: false, cutoffIso: '2026-10-29T18:00:00-05:00' },
    { cutoffIso: undefined },
    { cutoffIso: 'invalid' },
  ]) {
    assert.equal(render(options).get('adsCutoff').textContent, 'Ordering currently closed');
  }
});
