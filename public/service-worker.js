// Service Worker for 青海全媒体广告平台
const CACHE_NAME = 'qinghai-media-v1';
const OFFLINE_URL = '/offline.html';

// 需要预缓存的资源
const PRECACHE_RESOURCES = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-72x72.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // 关键CSS和JS文件
  '/globals.css',
  // 关键页面
  '/media',
  '/plan',
  '/ai-chat',
  '/login',
  '/register'
];

// 安装事件 - 预缓存关键资源
self.addEventListener('install', (event) => {
  console.log('[Service Worker] 安装中...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] 预缓存关键资源');
        return cache.addAll(PRECACHE_RESOURCES);
      })
      .then(() => {
        console.log('[Service Worker] 安装完成');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[Service Worker] 安装失败:', error);
      })
  );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] 激活中...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] 删除旧缓存:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] 激活完成');
      return self.clients.claim();
    })
  );
});

// 获取事件 - 网络优先，缓存回退策略
self.addEventListener('fetch', (event) => {
  // 跳过非GET请求和chrome扩展请求
  if (event.request.method !== 'GET' || 
      event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  // 对于API请求，使用网络优先策略
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // API请求失败时返回离线响应
          return new Response(
            JSON.stringify({ 
              error: '网络连接失败，请检查网络连接',
              offline: true 
            }),
            { 
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
    );
    return;
  }

  // 对于页面和静态资源，使用缓存优先策略
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // 如果有缓存，返回缓存
        if (cachedResponse) {
          // 同时更新缓存（在后台）
          fetchAndCache(event.request);
          return cachedResponse;
        }

        // 否则从网络获取
        return fetchAndCache(event.request)
          .catch(() => {
            // 网络失败，尝试返回离线页面
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
            // 对于其他资源，返回错误
            return new Response('网络连接失败', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// 后台同步事件
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] 后台同步:', event.tag);
  if (event.tag === 'sync-offline-data') {
    event.waitUntil(syncOfflineData());
  }
});

// 推送通知事件
self.addEventListener('push', (event) => {
  console.log('[Service Worker] 推送通知:', event);
  
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body || '青海全媒体广告平台通知',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/'
    },
    actions: [
      {
        action: 'open',
        title: '打开'
      },
      {
        action: 'close',
        title: '关闭'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || '通知', options)
  );
});

// 通知点击事件
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] 通知点击:', event);
  event.notification.close();

  if (event.action === 'open') {
    const url = event.notification.data.url || '/';
    event.waitUntil(
      clients.openWindow(url)
    );
  }
});

// 辅助函数：获取并缓存资源
function fetchAndCache(request) {
  return fetch(request)
    .then((response) => {
      // 检查响应是否有效
      if (!response || response.status !== 200 || response.type !== 'basic') {
        return response;
      }

      // 克隆响应（响应流只能使用一次）
      const responseToCache = response.clone();

      // 缓存响应
      caches.open(CACHE_NAME)
        .then((cache) => {
          cache.put(request, responseToCache);
        });

      return response;
    });
}

// 同步离线数据
function syncOfflineData() {
  console.log('[Service Worker] 同步离线数据...');
  // 这里可以添加同步离线数据的逻辑
  // 例如：同步离线订单、用户操作等
  return Promise.resolve();
}

// 消息处理
self.addEventListener('message', (event) => {
  console.log('[Service Worker] 收到消息:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME)
      .then(() => {
        event.ports[0].postMessage({ success: true });
      });
  }
});