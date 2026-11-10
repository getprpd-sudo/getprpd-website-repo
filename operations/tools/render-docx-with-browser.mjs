import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const [docxPath, outputDir, dependencyRoot] = process.argv.slice(2);
if (!docxPath || !outputDir || !dependencyRoot) {
  throw new Error('Usage: node render-docx-with-browser.mjs <docx> <output-dir> <dependency-root>');
}

fs.mkdirSync(outputDir, { recursive: true });
const bundlePath = path.join(dependencyRoot, 'node_modules', 'docx-preview', 'dist', 'docx-preview.min.js');
const zipBundlePath = path.join(dependencyRoot, 'node_modules', 'jszip', 'dist', 'jszip.min.js');
let zipBundle;
let bundle;
if (fs.existsSync(bundlePath) && fs.existsSync(zipBundlePath)) {
  zipBundle = fs.readFileSync(zipBundlePath, 'utf8');
  bundle = fs.readFileSync(bundlePath, 'utf8');
} else {
  const verifiedPreview = path.join(path.dirname(docxPath), '_batch15_grocery_browser_render', 'preview.html');
  const priorHtml = fs.readFileSync(verifiedPreview, 'utf8');
  const scripts = [...priorHtml.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((match) => match[1]);
  if (scripts.length < 2) throw new Error('Verified browser-render bundles were not found');
  [zipBundle, bundle] = scripts;
}
const encoded = fs.readFileSync(docxPath).toString('base64');
const htmlPath = path.join(outputDir, 'preview.html');
const pdfPath = path.join(outputDir, 'preview.pdf');
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;background:#777}.docx-wrapper{padding:20px!important}.docx-wrapper>section.docx{box-shadow:0 2px 12px #333;margin-bottom:20px!important}
@media print{@page{size:letter;margin:0}html,body,.docx-wrapper{background:#fff!important}.docx-wrapper{padding:0!important}.docx-wrapper>section.docx{box-shadow:none!important;margin:0!important;break-after:page;page-break-after:always}.docx-wrapper>section.docx:last-child{break-after:auto!important;page-break-after:auto!important}}
</style></head><body><div id="document"></div><script>${zipBundle}</script><script>${bundle}</script><script>
const binary=atob('${encoded}');
const bytes=new Uint8Array(binary.length);
for(let i=0;i<binary.length;i++) bytes[i]=binary.charCodeAt(i);
docx.renderAsync(bytes.buffer,document.getElementById('document'),null,{inWrapper:true,breakPages:true,ignoreLastRenderedPageBreak:false}).then(()=>{document.title='READY';});
</script></body></html>`;
fs.writeFileSync(htmlPath, html);

const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const result = spawnSync(chrome, [
  '--headless=new', '--disable-gpu', '--allow-file-access-from-files',
  '--no-pdf-header-footer',
  '--run-all-compositor-stages-before-draw', '--virtual-time-budget=10000',
  `--print-to-pdf=${pdfPath}`, `file:///${htmlPath.replace(/\\/g, '/')}`
], { encoding: 'utf8', timeout: 30000 });
if (result.error) throw result.error;
if (!fs.existsSync(pdfPath)) throw new Error(result.stderr || 'Chrome did not create a PDF');
console.log(pdfPath);
