const CACHE_NAME = 'nexus-cache-v5';

// 定义需要预缓存的资源
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/vite.svg',
  '/manifest.json',
  'https://cdn.tailwindcss.com',
  'https://aistudiocdn.com/react@^19.2.0',
  
  // Local Source Files - 确保这些文件在离线时可用
  '/src/index.tsx',
  '/src/App.tsx',
  '/src/hooks/useLocalStorage.ts',
  '/src/components/Icons.tsx',
  '/src/components/InventoryView.tsx',
  '/src/components/ShippedView.tsx',
  '/src/components/ItemGroup.tsx',
  '/src/components/ItemCard.tsx',
  '/src/components/ItemFormModal.tsx',
  '/src/components/ConfirmationModal.tsx',
  '/src/components/DefaultRemarkModal.tsx'
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // 强制等待中的 Service Worker 立即激活
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Pre-caching files');
      // 尝试缓存所有核心文件
      return cache.addAll(PRECACHE_URLS).catch(err => {
        console.error('Pre-cache failed:', err);
        // 即使预缓存部分失败，也不要阻断 Service Worker 的安装，
        // 这样 runtime caching (运行时缓存) 仍有机会在用户浏览时补充缓存。
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache', cacheName);
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

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cachedResponse = await cache.match(request);
      
      // 构造网络请求 Promise
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          // 检查响应是否有效
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'error') {
            return networkResponse;
          }
          
          // 复制响应放入缓存 (Stale-While-Revalidate 更新策略)
          cache.put(request, networkResponse.clone());
          
          return networkResponse;
        })
        .catch((error) => {
          console.log('Fetch failed (offline):', error);
          // 离线回退策略
          // 如果是页面导航请求（如刷新或访问根路径），且网络不可用，返回缓存的 index.html
          if (request.mode === 'navigate') {
            return cache.match('/index.html');
          }
          // 其他资源如果缓存没有且网络失败，将返回 undefined (浏览器报网络错误)
        });

      // 优先返回缓存，同时后台发起网络请求更新缓存
      return cachedResponse || fetchPromise;
    })
  );
});