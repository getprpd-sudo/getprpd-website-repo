const { chromium } = require('playwright');
const path = require('path');
const { pathToFileURL } = require('url');

(async () => {
  const root = path.resolve(__dirname, '..');
  const html = path.join(root, 'assets', 'marketing', 'batch-11-menu-live.html');
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });
  const page = await browser.newPage({ viewport: { width: 1080, height: 2200 }, deviceScaleFactor: 1 });
  const browserErrors = [];
  page.on('console', (message) => { if (message.type() === 'error') browserErrors.push(message.text()); });
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('response', (response) => { if (!response.ok()) browserErrors.push(`${response.status()} ${response.url()}`); });
  await page.goto('http://127.0.0.1:4173/assets/marketing/batch-11-menu-live.html', { waitUntil: 'networkidle' });
  await page.evaluate(async () => document.fonts.ready);
  await page.locator('img').first().waitFor({ state: 'visible' });
  await page.evaluate(() => Promise.all([...document.images].map((img) => img.complete ? Promise.resolve() : new Promise((resolve) => { img.onload = img.onerror = resolve; }))));
  await page.locator('[data-creative="feed"]').screenshot({ path: path.join(root, 'assets', 'marketing', 'batch-11-menu-live-feed.png') });
  await page.locator('[data-creative="story"]').screenshot({ path: path.join(root, 'assets', 'marketing', 'batch-11-menu-live-story.png') });
  const comparison = path.join(root, 'assets', 'marketing', 'batch-11-menu-live-qa-comparison.html');
  await page.setViewportSize({ width: 1600, height: 1040 });
  await page.goto(pathToFileURL(comparison).href, { waitUntil: 'networkidle' });
  await page.evaluate(async () => document.fonts.ready);
  await page.screenshot({ path: path.join(root, 'assets', 'marketing', 'batch-11-menu-live-qa-comparison.png') });
  await browser.close();
  if (browserErrors.length) throw new Error(`Browser errors:\n${browserErrors.join('\n')}`);
  console.log('Rendered Batch 11 feed post and story. Browser errors: 0.');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
