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
    [['/index.html', '/'], ['/order.html', '/order'], ['/faq.html', '/faq'], ['/privacy.html', '/privacy']]
  );
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

  assert.match(faq, /Browse the live weekly menu/);
  assert.match(faq, /Wednesday at 5:00 PM CT/);
  assert.match(faq, /weekly minimum is \$60/);
  assert.doesNotMatch(faq, /Never frozen/i);
});
