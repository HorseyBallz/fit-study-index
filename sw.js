// Hulko offline support: the page and its files are fetched fresh when online and kept in a cache,
// so the tracker still opens without a connection (your data is in the browser's own storage, not here)
const CACHE="fsi-v4";
const CORE=["./","index.html","logo-en.webp","logo-cz.webp","logo-en-1.webp","logo-en-15.webp","logo-en-2.webp","logo-cz-1.webp","logo-cz-15.webp","logo-cz-2.webp","manifest.webmanifest","icon-192.png","icon-512.png","icon-180.png","favicon-64.png","favicon.svg"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
// network first, cache as the fallback; fonts and the QR library (other hosts) are cached the same way once used
self.addEventListener("fetch",e=>{
  // the user count (/api/…) is always asked fresh and never kept
  const r=e.request;if(r.method!=="GET"||new URL(r.url).pathname.startsWith("/api/"))return;
  e.respondWith(fetch(r).then(res=>{if(res.ok||res.type==="opaque"){const copy=res.clone();caches.open(CACHE).then(c=>c.put(r,copy))}return res})
    .catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||(r.mode==="navigate"?caches.match("./"):undefined))));
});
