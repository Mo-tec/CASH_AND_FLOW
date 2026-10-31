const CACHE='motec-money-manager-v50';
const CACHE_PREFIX='motec-money-manager-';
const FILES=['./index.html','./business.js','./ux.js','./ux.css','./chart-data.js','./luxury.js','./luxury.css','./totals-data.js','./cumulative.js','./workspace.js','./customer-data.js','./notebook-notes.js','./developer-tools.js','./firebase-config.js','./firebase-cloud.js','./reports.js','./report-pdf.js','./reports.css','./fold-ui.js','./ui-icons.js','./ui-language.js','./manifest.json','./mo-tec-64-v2.png','./mo-tec-180-v2.png','./mo-tec-192-v2.png','./mo-tec-512-v2.png','./mo-tec-maskable-512-v2.png'];
// Keep an existing open app on one version; activate the complete new cache after it closes.
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith(CACHE_PREFIX)&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin)return;
 if(request.mode==='navigate'){
  event.respondWith(caches.open(CACHE).then(async cache=>(await cache.match('./index.html'))||fetch(request)));
  return;
 }
 event.respondWith(caches.open(CACHE).then(async cache=>(await cache.match(request))||fetch(request)));
});

