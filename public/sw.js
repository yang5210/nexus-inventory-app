const CACHE_NAME = 'nexus-cache-v2'; // 升级版本号以触发更新

// 定义需要缓存的外部资源
const EXTERNAL_URLS = [
  'https://cdn.tailwindcss.com',
  'https://aistudiocdn.com/react@^19.2.0',
  'https://aistudiocdn.com/react-dom@^19.2.0/'
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // 强制等待中的 Service Worker 立即激活
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching files');
      // 尝试预缓存核心外部资源
      return Promise.all(
        EXTERNAL_URLS.map(url => 
          fetch(url).then(res => {
            if (res.ok) return cache.put(url, res);
          }).catch(err => console.warn('Failed to pre-cache', url))
        )
      );
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache');
            return caches.delete(cacheName); // 清理旧缓存
          }
        })
      );
    }).then(() => self.clients.claim()) // 立即接管页面
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  
  // 只处理 GET 请求
  if (request.method !== 'GET') return;

  // 策略 1: HTML 页面导航 - 网络优先，缓存兜底 (Network First)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            return caches.match('/index.html').then(index => index || caches.match('/'));
          });
        })
    );
    return;
  }

  // 策略 2: 静态资源 (JS, CSS, 图片) - 立即使用缓存，后台更新 (Stale-While-Revalidate)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'error') {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          return networkResponse;
        })
        .catch((error) => {
          // 网络请求失败，忽略
        });

      return cachedResponse || fetchPromise;
    })
  );
});