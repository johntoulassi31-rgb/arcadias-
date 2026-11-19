const CACHE_NAME="arcadias-shell-v3";
const APP_SHELL=["./index.html","./styles.css","./icon.svg","./manifest.webmanifest","./src/main.js","./src/world.js","./assets/ardencourt-world.svg","./assets/asterion-frontier.svg"];
self.addEventListener("install",event=>{event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith("arcadias-")&&key!==CACHE_NAME).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",event=>{
 const request=event.request;
 if(request.method!=="GET")return;
 const url=new URL(request.url);
 if(url.origin!==self.location.origin)return;
 if(request.mode==="navigate"){
  event.respondWith(fetch(request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put("./index.html",copy));}return response;}).catch(()=>caches.match("./index.html")));
  return;
 }
 if(url.pathname.includes("/assets/")||/\.(?:css|js|svg|png|webp|jpg|woff2?)$/i.test(url.pathname)){
  event.respondWith(caches.match(request).then(cached=>{const fresh=fetch(request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(request,copy));}return response;}).catch(()=>cached);return cached||fresh;}));
 }
});
