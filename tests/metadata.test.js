const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

test('homepage structured data and Vercel headers parse', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(match, 'homepage JSON-LD block is missing');
  const schema = JSON.parse(match[1]);
  assert.equal(schema['@context'], 'https://schema.org');

  const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  const siteHeaders = vercel.headers.find(entry => entry.source === '/(.*)').headers;
  assert.ok(siteHeaders.some(header => header.key === 'Strict-Transport-Security'));
  assert.ok(siteHeaders.some(header => header.key === 'Permissions-Policy'));
});

test('search files expose public pages and exclude the private order flow', () => {
  const robots = fs.readFileSync('robots.txt', 'utf8');
  const sitemap = fs.readFileSync('sitemap.xml', 'utf8');
  assert.match(robots, /Disallow: \/order/);
  assert.match(robots, /Sitemap: https:\/\/getprpd\.com\/sitemap\.xml/);
  assert.match(sitemap, /<loc>https:\/\/getprpd\.com\/<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/getprpd\.com\/faq<\/loc>/);
  assert.doesNotMatch(sitemap, /\/order/);
});
