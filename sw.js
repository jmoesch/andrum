const prefix = 'andrum-' + self.registration.scope + '-';
const cacheName = prefix + '1.4.4';
const assets = [
  "./index.html",
  "./sounds/in.wav",
  "./sounds/out.wav",
  "./manifest.webmanifest",
  "./icons/andrum-180.png",
  "./icons/andrum-192.png",
  "./icons/andrum-512.png",
  "./fonts/figtree-0.ttf",
  "./fonts/figtree-1.ttf",
  "./fonts/figtree-2.ttf",
  "./fonts/literata-3.ttf",
  "./fonts/literata-4.ttf"
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(cacheName).then(cache =>
    cache.addAll(assets.map(path => new Request(path, {cache: 'reload'})))
  ));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key.startsWith(prefix) && key !== cacheName) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});
const home = new URL('./', self.location.href).href;
const index = new URL('./index.html', home).href;
const localFiles = new Set(assets.map(path => new URL(path, home).href));
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  url.search = '';
  const key = request.mode === 'navigate' && url.href === home ? index : url.href;
  if (localFiles.has(key)) event.respondWith((async () => {
    const cache = await caches.open(cacheName);
    return await cache.match(key) || fetch(request);
  })());
});
