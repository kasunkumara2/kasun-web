const cacheName = 'kasun-portfolio-v1';
const staticAssets = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './images/profile.jpg'
];

// ඇප් එක ඉන්ස්ටෝල් වන විට අවශ්‍ය ෆයිල් සේව් කිරීම
self.addEventListener('install', async e => {
  const cache = await caches.open(cacheName);
  await cache.addAll(staticAssets);
  return self.skipWaiting();
});

// ඉන්ටර්නෙට් නැති විට සේව් කරගත් ෆයිල් ලබා දීම
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => {
      return res || fetch(e.request);
    })
  );
});
