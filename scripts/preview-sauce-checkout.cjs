// A loopback-only review of the real checkout. No customer data or order submission.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const config = structuredClone(require('../config/order-config'));
config.sauceProgram.enabled = true;
config.batch.cutoffIso = '2099-01-01T00:00:00-06:00';
config.batch.deliveryDate = 'Checkout design preview';
const mime = {'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2'};
const allowedRoot = new Set(['/order.html','/order.css','/order.js','/style.css','/script.js','/sauce-program.js','/phone-validation.js','/delivery-zones.js','/funnel-tracking.js','/google-ads.js','/config/menu-details.js','/config/menu-details.batch16-draft.js']);
const reviewPages = {'/batch16-review.html':'/config/batch16-review.js','/closed-menu.html':'/config/closed-menu-review.js','/draft-closed-menu.html':'/config/unpublished-review.js'};
const server = http.createServer((req,res)=>{
  const url = new URL(req.url, 'http://127.0.0.1');
  const pathname = decodeURIComponent(url.pathname);
  res.setHeader('Cache-Control','no-store');
  if(req.method !== 'GET') {res.writeHead(405);res.end('Review only. Order submission is disabled.');return;}
  if(pathname === '/api/order') {res.writeHead(403,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Review only. Order submission is disabled.'}));return;}
  if(pathname === '/api/promotions') {res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({promotions:[]}));return;}
  if(pathname === '/config/order-config.js') {res.writeHead(200,{'Content-Type':mime['.js']});res.end(`window.PRPD_ORDER_CONFIG=${JSON.stringify(config)};`);return;}
  if(Object.values(reviewPages).includes(pathname)) {
    delete require.cache[require.resolve('../config/order-config.batch16-draft')];
    const review=structuredClone(pathname === '/config/batch16-review.js' || pathname === '/config/unpublished-review.js' ? require('../config/order-config.batch16-draft') : require('../config/order-config'));
    review.batch.published=pathname !== '/config/unpublished-review.js';
    if(pathname === '/config/closed-menu-review.js') review.batch.cutoffIso='2020-01-01T00:00:00-06:00';
    res.writeHead(200,{'Content-Type':mime['.js']});res.end(`window.PRPD_ORDER_CONFIG=${JSON.stringify(review)};`);return;
  }
  if(pathname === '/' || pathname === '/operations/sauce-program-preview.html') {res.writeHead(302,{Location:'/order.html#checkout'});res.end();return;}
  // Serve only public checkout assets. Private operations records are excluded.
  if(!allowedRoot.has(pathname) && !reviewPages[pathname] && !pathname.startsWith('/assets/')) {res.writeHead(404);res.end('Not part of checkout review');return;}
  const file = path.resolve(root, '.'+(reviewPages[pathname] ? '/order.html' : pathname));
  if(!file.startsWith(root+path.sep)) {res.writeHead(404);res.end();return;}
  fs.readFile(file,(error,bytes)=>{
    if(error) {res.writeHead(404);res.end('Missing asset');return;}
    res.writeHead(200,{'Content-Type':mime[path.extname(file)] || 'application/octet-stream'});
    if(pathname === '/order.html' || reviewPages[pathname]) {
      let page=bytes.toString();
      if(reviewPages[pathname]) page=page.replace('/config/order-config.js?',reviewPages[pathname]+'?');
      if(pathname === '/batch16-review.html') page=page.replace('/config/menu-details.js?','/config/menu-details.batch16-draft.js?');
      res.end(page.replace('</body>',`<script>
        document.getElementById('orderSummary').insertAdjacentHTML('afterbegin','<p style="color:#e7f0cf;font-size:12px">DESIGN REVIEW · NO ORDERS SENT</p>');
      </script></body>`));
    } else res.end(bytes);
  });
});
server.listen(4791,'127.0.0.1',()=>console.log('Checkout review: http://127.0.0.1:4791/order.html#checkout'));
