const path = require('path');
const { pathToFileURL } = require('url');
const { chromium } = require('playwright');

(async () => {
  const workspace = 'C:\\Users\\aazim\\Documents\\GETPRPD Website';
  const source = path.join(workspace, 'assets', 'marketing', 'batch-9-instagram-story.html');
  const outputDirectory = path.join(workspace, 'assets', 'marketing');
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(source).href, { waitUntil: 'networkidle' });
  await page.evaluate(async () => document.fonts.ready);
  const stories = page.locator('.story');
  const count = await stories.count();
  for (let index = 0; index < count; index += 1) {
    const story = stories.nth(index);
    await story.scrollIntoViewIfNeeded();
    await story.screenshot({
      path: path.join(outputDirectory, `batch-9-instagram-story-${index + 1}.png`),
      animations: 'disabled',
    });
  }
  await browser.close();
  process.stdout.write(`Rendered ${count} story frames.\n`);
})();
