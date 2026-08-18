const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const vm = require('node:vm');

test('homepage structured data and Vercel headers parse', () => {
  let structuredDataElement;
  const document = {
    createElement: () => ({}),
    head: { appendChild: element => { structuredDataElement = element; } },
  };
  vm.runInNewContext(fs.readFileSync('structured-data.js', 'utf8'), { document });
  assert.equal(structuredDataElement.type, 'application/ld+json');
  const schema = JSON.parse(structuredDataElement.textContent);
  assert.equal(schema['@context'], 'https://schema.org');

  const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  const siteHeaders = vercel.headers.find(entry => entry.source === '/(.*)').headers;
  assert.ok(siteHeaders.some(header => header.key === 'Strict-Transport-Security'));
  assert.ok(siteHeaders.some(header => header.key === 'Permissions-Policy'));
  assert.deepEqual(
    vercel.redirects.map(({ source, destination }) => [source, destination]),
    [['/index.html', '/'], ['/order.html', '/order'], ['/halal-meal-prep-dfw.html', '/halal-meal-prep-dfw'], ['/faq.html', '/faq'], ['/privacy.html', '/privacy']]
  );
});

test('the paid-search landing route is focused, current-menu driven, and measurable', () => {
  const html = fs.readFileSync('halal-meal-prep-dfw.html', 'utf8');
  const app = fs.readFileSync('ads-landing.js', 'utf8');
  const css = fs.readFileSync('ads-landing.css', 'utf8');
  const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));

  assert.match(html, /data-funnel-stage="ads-landing"/);
  assert.match(html, /DFW HALAL MEAL PREP/);
  assert.match(html, /High-protein meals/);
  assert.match(html, /src="\/funnel-tracking\.js"/);
  assert.match(html, /src="\/config\/order-config\.js"/);
  assert.match(html, /<meta name="robots" content="noindex, follow"/);
  assert.equal((html.match(/href="\/order"/g) || []).length >= 6, true);
  assert.doesNotMatch(html, /<form|firstName|phone|deliveryAddress/);
  assert.match(app, /windowObject\.PRPD_ORDER_CONFIG/);
  assert.match(app, /batch\.published !== true/);
  assert.match(app, /dish\.macros\.protein/);
  assert.match(css, /\.ads-mobile-cta/);
  assert.ok(vercel.rewrites.some(route => route.source === '/halal-meal-prep-dfw' && route.destination === '/halal-meal-prep-dfw.html'));
});

test('search files expose the homepage, FAQ, privacy policy, and weekly order flow', () => {
  const robots = fs.readFileSync('robots.txt', 'utf8');
  const sitemap = fs.readFileSync('sitemap.xml', 'utf8');
  const order = fs.readFileSync('order.html', 'utf8');
  assert.doesNotMatch(robots, /Disallow: \/order/);
  assert.match(robots, /Sitemap: https:\/\/getprpd\.com\/sitemap\.xml/);
  assert.match(sitemap, /<loc>https:\/\/getprpd\.com\/<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/getprpd\.com\/faq<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/getprpd\.com\/order<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/getprpd\.com\/privacy<\/loc>/);
  assert.match(order, /<meta name="robots" content="index, follow"/);
  assert.match(order, /<link rel="canonical" href="https:\/\/getprpd\.com\/order"/);
});

test('privacy policy is public, linked, and describes the production data flow', () => {
  const homepage = fs.readFileSync('index.html', 'utf8');
  const faq = fs.readFileSync('faq.html', 'utf8');
  const order = fs.readFileSync('order.html', 'utf8');
  const privacy = fs.readFileSync('privacy.html', 'utf8');

  assert.match(homepage, /href="\/privacy"/);
  assert.match(faq, /href="\/privacy"/);
  assert.match(order, /href="\/privacy"/);
  assert.match(privacy, /<link rel="canonical" href="https:\/\/getprpd\.com\/privacy"/);
  assert.match(privacy, /Google Sheets/);
  assert.match(privacy, /Resend/);
  assert.match(privacy, /ask PRPD to correct or delete/i);
});

test('homepage presents Rida as the sole operator and targets the real intake form', () => {
  const homepage = fs.readFileSync('index.html', 'utf8');
  const faq = fs.readFileSync('faq.html', 'utf8');
  const homepageApp = fs.readFileSync('script.js', 'utf8');

  assert.match(homepage, /href="#intake-form"[^>]*>Build a Custom Plan/);
  assert.match(homepage, /id="intake-form"/);
  assert.match(homepage, /Rida handles/i);
  assert.match(homepage, /Orders[^<]*Cooking[^<]*Delivery/i);
  assert.match(homepage, /class="about__handwritten-strip"/);
  assert.match(homepage, /Delivered fresh every week/);
  assert.match(homepage, /Made by Rida, for you/);
  assert.match(homepage, /class="form-menu-route"/);
  assert.match(homepage, /class="btn btn--cream form-success__menu"/);
  assert.match(homepage, /href="\/order"[^>]*>Explore This Week's Menu/);
  assert.doesNotMatch(homepage, /href="[^"]*\.html/);
  assert.doesNotMatch(faq, /href="[^"]*\.html/);
  assert.doesNotMatch(homepage, /Aazim|about-aazim/i);
  assert.match(homepageApp, /menu-card__photo-overlay/);
  assert.match(homepageApp, /menu-card__photo-brand/);
  assert.match(homepageApp, /menu-card__name menu-card__name--sr/);
  assert.equal((homepage.match(/class="form-aside-card"/g) || []).length, 4);

  assert.match(faq, /Browse the live weekly menu/);
  assert.match(faq, /fresh menu normally opens every Monday/i);
  assert.match(faq, /Wednesday at 6:00 PM CT/);
  assert.match(faq, /Local delivery has a \$60 order minimum/);
  assert.match(faq, /Regional delivery has an \$80 order minimum/);
  assert.match(faq, /Extended delivery has a \$100 order minimum/);
  assert.match(faq, /Did the local order minimum change to \$100\?/);
  assert.match(faq, /do not repeatedly retry the transfer/i);
  assert.doesNotMatch(faq, /Never frozen/i);
});

test('public pages expose the schedule, text-only contact paths, icons, and manual referral pilot', () => {
  const pages = ['index.html', 'order.html', 'faq.html', 'privacy.html']
    .map(file => [file, fs.readFileSync(file, 'utf8')]);
  const homepage = pages.find(([file]) => file === 'index.html')[1];
  const order = pages.find(([file]) => file === 'order.html')[1];
  const faq = pages.find(([file]) => file === 'faq.html')[1];
  const privacy = pages.find(([file]) => file === 'privacy.html')[1];

  for (const [file, html] of pages) {
    assert.doesNotMatch(html, /href="tel:/i, `${file} must not offer phone-call links`);
    assert.match(html, /href="\/site\.webmanifest"/);
    assert.match(html, /favicon-512\.png/);
    assert.match(html, /favicon-32x32\.png/);
    assert.match(html, /favicon-16x16\.png/);
    assert.match(html, /apple-touch-icon\.png/);
  }

  assert.match(homepage, /Fresh menu every Monday/);
  assert.match(homepage, /Wednesday at 6:00 PM CT/);
  assert.match(homepage, /Saturday delivery/);
  assert.match(order, /Ordering is closed for this week/i);
  assert.match(order, /release a fresh menu every Monday/i);
  assert.match(order, /New menu opens/i);
  assert.match(order, /Delivery or pickup/i);
  assert.match(order, /Wednesday at 6:00 PM CT/);
  assert.match(order, /Saturday delivery/);
  assert.match(order, /referral pilot is approved manually/i);
  assert.match(faq, /manually approved referral pilot/i);
  assert.match(privacy, /Google Ads/);

  const manifest = JSON.parse(fs.readFileSync('site.webmanifest', 'utf8'));
  assert.equal(manifest.short_name, 'PRPD');
  assert.equal(manifest.theme_color, '#1E2E1E');
  assert.ok(manifest.icons.some(icon => icon.src === '/assets/images/favicon-512.png' && icon.sizes === '512x512'));
});

test('order form requires identity, contact, and complete delivery details with conditional unit entry', () => {
  const order = fs.readFileSync('order.html', 'utf8');
  const orderApp = fs.readFileSync('order.js', 'utf8');

  for (const field of ['firstName', 'lastName', 'phone', 'email', 'deliveryAddress', 'deliveryCity', 'deliveryState', 'deliveryZip']) {
    assert.match(order, new RegExp(`id="${field}"[^>]*required`));
  }
  assert.match(order, /id="deliveryAddress"[^>]*autocomplete="address-line1"/);
  assert.match(order, /id="deliveryHasUnit"[^>]*aria-controls="deliveryUnit"[^>]*aria-expanded="false"/);
  assert.match(order, /id="deliveryUnit"[^>]*autocomplete="address-line2"[^>]*hidden disabled/);
  assert.doesNotMatch(order, /id="deliveryUnit"[^>]*\srequired(?:\s|\/|>)/);
  assert.match(orderApp, /deliveryUnitInput\.required = hasUnit/);
  assert.match(orderApp, /deliveryHasUnitInput\.setAttribute\('aria-expanded', String\(hasUnit\)\)/);
});
