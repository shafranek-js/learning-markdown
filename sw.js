// Offline-first application shell, versioned caches for GitHub Pages subpaths.
const VERSION='learning-markdown-v1.0.12';
const ROOT=new URL('./',self.registration.scope);
const urls=[
 './','./index.html','./manifest.json','./assets/icon.svg','./assets/icon-192.png','./assets/icon-512.png',
 './vendor/marked.js',
 './css/main.css','./css/utilities.css','./css/themes.css','./css/layout.css','./css/editor.css','./css/preview.css','./css/components.css','./css/layout-extra.css','./css/editor-extra.css',
 './js/app.js','./js/core/state.js','./js/core/history.js','./js/core/router.js','./js/core/validator.js','./js/core/sanitize.js',
 './js/ui/editor.js','./js/ui/toolbar.js','./js/ui/preview.js','./js/ui/resizer.js','./js/ui/modals.js',
 './js/data/lessons.js','./js/data/cheatsheet.js',
 './js/i18n/index.js','./js/i18n/en.js','./js/i18n/cs.js','./js/i18n/uk.js','./js/i18n/ro.js','./js/i18n/ru.js'
].map(path=>new URL(path,ROOT).href);
self.addEventListener('install',event=>{event.waitUntil(caches.open(VERSION).then(cache=>cache.addAll(urls)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('learning-markdown-')&&k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
 const req=event.request;if(req.method!=='GET')return;
 const u=new URL(req.url);if(u.origin!==self.location.origin||!u.pathname.startsWith(ROOT.pathname))return;
 // Prefer the network for navigations so a new deployment is visible immediately.
 // Fall back to the cached document when offline.
 if(req.mode==='navigate'){
  event.respondWith(fetch(req).then(response=>{
   if(response.ok){
    const copy=response.clone();
    event.waitUntil(caches.open(VERSION).then(cache=>cache.put(req,copy)).catch(()=>{}));
   }
   return response;
  }).catch(async()=>await caches.match(req,{ignoreVary:true})||await caches.match(new URL('./index.html',ROOT).href,{ignoreVary:true})||Response.error()));
  return;
 }
 event.respondWith(caches.match(req,{ignoreVary:true}).then(cached=>{
  const live=fetch(req).then(res=>{if(res.ok){const copy=res.clone();caches.open(VERSION).then(c=>c.put(req,copy));}return res;}).catch(()=>cached||Response.error());
  return cached||live;
 }));
});
