const CACHE_NAME = 'alsaeed-app-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/school_logo.jpg'
];

// تثبيت الـ Service Worker وحفظ الملفات الأساسية
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// تفعيل وتحديث الكاش القديم
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// الاستجابة من الكاش عند انقطاع الإنترنت (Offline-First)
self.addEventListener('fetch', (event) => {
  // عدم التداخل مع طلبات Supabase API لكي تتعامل معها دالة المزامنة الخاصة بك
  if (event.request.url.includes('supabase.co')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        // في حال فشل الاتصال بالشبكة ولم تكن الصفحة في الكاش، قم بإرجاع الصفحة الرئيسية
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
