const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');

const html = fs.readFileSync(
  path.join(__dirname, '..', 'operations', 'label-studio.html'),
  'utf8'
);
const app = fs.readFileSync(
  path.join(__dirname, '..', 'operations', 'label-studio-app.js'),
  'utf8'
);

test('Avery 5168 uses the official portrait sheet and rotated safe-inset artwork', () => {
  const printCss = html.slice(html.indexOf('@media print'));

  assert.match(printCss, /@page\s*\{\s*size:\s*letter portrait;/);
  assert.match(printCss, /\.print-page\s*\{[\s\S]*?width:\s*8\.5in;[\s\S]*?height:\s*11in;/);
  assert.match(printCss, /\.print-slot\s*\{[\s\S]*?width:\s*3\.5in;[\s\S]*?height:\s*5in;[\s\S]*?border-radius:\s*0\.1in;/);
  assert.match(printCss, /\.print-slot \.meal-label\s*\{[\s\S]*?width:\s*5in;[\s\S]*?height:\s*3\.5in;[\s\S]*?transform-origin:\s*0 0;[\s\S]*?transform:\s*translate\(3\.43in, 0\.1in\) rotate\(90deg\) scale\(0\.96\);/);
  assert.match(app, /return `<div class="print-slot">\$\{markup\}<\/div>`;/);
  assert.doesNotMatch(app, /foreignObject/);
});

test('Avery 5168 slots match the official portrait positions with no row gap', () => {
  const expected = [
    [1, '0.5in', '0.5in'],
    [2, '0.5in', '4.5in'],
    [3, '5.5in', '0.5in'],
    [4, '5.5in', '4.5in'],
  ];

  for (const [slot, top, left] of expected) {
    const rule = new RegExp(
      `\\.print-slot:nth-child\\(${slot}\\) \\{ top: ${top}; left: ${left}; \\}`
    );
    assert.match(html, rule);
  }
});

test('a validated URL print plan can reproduce a reviewed production queue', () => {
  assert.match(app, /function applyPrintPlan\(params\)/);
  assert.match(app, /tierKey === 'single' && meal\?\.category === 'Dessert' && meal\.tiers\.lean/);
  assert.match(app, /sheetQuantities\.set\(key, sheets\)/);
  assert.match(app, /if \(!applyPrintPlan\(params\) && params\.get\('printProof'\) === 'all'\)/);
});

test('next-menu labels remain a separate 15-dish review dataset', () => {
  const source = fs.readFileSync(
    path.join(__dirname, '..', 'operations', 'nutrition', 'next-menu-label-data.js'),
    'utf8'
  );
  const context = { window: {} };
  vm.runInNewContext(source, context);

  assert.equal(Object.keys(context.window.PRPD_NEXT_LABEL_DATA.meals).length, 15);
  assert.equal(context.window.PRPD_NEXT_LABEL_DATA.status, 'draft');
  assert.match(html, /new URLSearchParams\(window\.location\.search\)\.get\('menu'\) === 'next'/);
  assert.match(html, /Review July 25 draft/);
});

test('all 27 next-menu labels match the controlled nutrition calculator', () => {
  const verifier = path.join(
    __dirname,
    '..',
    'operations',
    'nutrition',
    'verify_next_menu_labels.py'
  );
  const output = execFileSync('python', [verifier], {
    cwd: path.join(__dirname, '..'),
    encoding: 'utf8',
  });

  assert.match(output, /Verified 15 dishes and 27 label builds\./);
});

test('active studio exposes only the manual BBQ label needed for this batch', () => {
  assert.match(html, /meal\.name === 'BBQ Chicken Mac & Cheese'/);
  assert.match(html, /x1: \{ \.\.\.manualBbq, category: 'Main', manualOnly: true \}/);
  assert.doesNotMatch(html, /meal\.name === 'Premium NY Strip Steak'/);
});
