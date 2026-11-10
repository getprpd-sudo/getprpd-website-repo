const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const root = path.resolve(__dirname, '..');
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });
  const page = await browser.newPage({ viewport: { width: 1080, height: 2200 }, deviceScaleFactor: 1 });
  const browserErrors = [];
  page.on('console', (message) => { if (message.type() === 'error') browserErrors.push(message.text()); });
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('response', (response) => { if (!response.ok()) browserErrors.push(`${response.status()} ${response.url()}`); });
  await page.goto('http://127.0.0.1:4173/assets/marketing/batch-13-menu-live.html', { waitUntil: 'networkidle' });
  await page.evaluate(async () => document.fonts.ready);
  await page.locator('img').first().waitFor({ state: 'visible' });
  await page.evaluate(() => Promise.all([...document.images].map((img) => img.complete ? Promise.resolve() : new Promise((resolve) => { img.onload = img.onerror = resolve; }))));
  await page.locator('[data-creative="feed"]').screenshot({ path: path.join(root, 'assets', 'marketing', 'batch-13-menu-live-feed.png') });
  await page.locator('[data-creative="story"]').screenshot({ path: path.join(root, 'assets', 'marketing', 'batch-13-menu-live-story.png') });
  await browser.close();
  if (browserErrors.length) throw new Error(`Browser errors:\n${browserErrors.join('\n')}`);
  console.log('Rendered Batch 13 feed post and story. Browser errors: 0.');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
