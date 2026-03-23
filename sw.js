const CACHE_NAME = "slide-maker-v1";
const assets = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./env.js",
  "./icon.svg"
];

self.addEventListener("install", installEvent => {
  installEvent.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      cache.addAll(assets);
    })
  );
});

self.addEventListener("fetch", fetchEvent => {
  fetchEvent.respondWith(
    caches.match(fetchEvent.request).then(res => {
      return res || fetch(fetchEvent.request);
    })
  );
});