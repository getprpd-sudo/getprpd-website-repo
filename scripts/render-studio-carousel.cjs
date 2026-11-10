const path = require('path');
const { pathToFileURL } = require('url');
const { chromium } = require('playwright');

(async () => {
  const workspace = 'C:\\Users\\aazim\\Documents\\GETPRPD Website';
  const source = path.join(workspace, 'assets', 'marketing', 'batch-9-studio-carousel.html');
  const outputDirectory = path.join(workspace, 'assets', 'marketing');
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });

  await page.goto(pathToFileURL(source).href, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: 'html, body { height: auto !important; overflow: visible !important; }' });
  await page.evaluate(async () => document.fonts.ready);

  const slides = page.locator('.slide');
  const count = await slides.count();
  for (let index = 0; index < count; index += 1) {
    const slide = slides.nth(index);
    await slide.scrollIntoViewIfNeeded();
    await slide.screenshot({
      path: path.join(outputDirectory, `batch-9-studio-carousel-${index + 1}.png`),
      animations: 'disabled',
    });
  }

  await browser.close();
  process.stdout.write(`Rendered ${count} carousel pages.\n`);
})();
