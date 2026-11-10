const path = require('path');
const { pathToFileURL } = require('url');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const source = path.join(root, 'assets', 'marketing', 'batch-14-final-call-story.html');
const output = path.join(root, 'assets', 'marketing', 'batch-14-final-call-story.png');
const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const result = spawnSync(chrome, [
  '--headless=new',
  '--disable-gpu',
  '--hide-scrollbars',
  '--window-size=1080,1920',
  `--screenshot=${output}`,
  pathToFileURL(source).href,
], { encoding: 'utf8' });

if (result.status !== 0) {
  process.stderr.write(result.stderr || 'Story rendering failed.\n');
  process.exitCode = result.status || 1;
} else {
  process.stdout.write(`${output}\n`);
}
