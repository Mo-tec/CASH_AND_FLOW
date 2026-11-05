const CACHE='motec-money-manager-v71';
const CACHE_PREFIX='motec-money-manager-';
const FILES=['./business-context.js','./cloud-api.js','./api-config.js','./api-config.css','./assistant-learned-knowledge.js','./system-knowledge-registry.js','./assistant-knowledge.js','./assistant-policy.js','./assistant-owner.js','./assistant-history.js','./assistant-analysis.js','./assistant-data.js','./assistant-engine.js','./business-assistant.js','./business-assistant.css','./backup-merge.js','./index.html','./business.js','./ux.js','./ux.css','./chart-data.js','./luxury.js','./luxury.css','./totals-data.js','./cumulative.js','./workspace.js','./customer-data.js','./notebook-notes.js','./developer-tools.js','./firebase-config.js','./firebase-cloud.js','./reports.js','./report-pdf.js','./reports.css','./fold-ui.js','./ui-icons.js','./ui-language.js','./manifest.json','./mo-tec-64-v2.png','./mo-tec-180-v2.png','./mo-tec-192-v2.png','./mo-tec-512-v2.png','./mo-tec-maskable-512-v2.png'];
// Keep an existing open app on one version; activate the complete new cache after it closes.
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(async cache=>{
 await cache.addAll(FILES);
 // Optional SDK warm-up must never prevent the application shell installing.
 await Promise.allSettled(['firebase-app.js','firebase-auth.js','firebase-firestore.js'].map(file=>cache.add('https://www.gstatic.com/firebasejs/13.0.0/'+file)));
})));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith(CACHE_PREFIX)&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(url.origin===self.location.origin&&url.pathname.includes('/api/'))return;
 // Cache SDK code only, never Firestore/Auth responses or account data here.
 if(request.method==='GET'&&url.origin==='https://www.gstatic.com'&&/^\/firebasejs\/13\.0\.0\/[a-z0-9.-]+\.js$/.test(url.pathname)){
  event.respondWith(caches.open(CACHE).then(async cache=>{const saved=await cache.match(request);if(saved)return saved;const response=await fetch(request);if(response.ok)await cache.put(request,response.clone());return response;}));return;
 }
 if(request.method!=='GET'||url.origin!==self.location.origin)return;
 if(request.mode==='navigate'){
  event.respondWith(caches.open(CACHE).then(async cache=>(await cache.match('./index.html'))||fetch(request)));
  return;
 }
 event.respondWith(caches.open(CACHE).then(async cache=>(await cache.match(request))||fetch(request)));
});

