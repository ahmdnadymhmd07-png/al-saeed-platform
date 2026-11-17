const CACHE_NAME = 'alsaeed-offline-v1';

// تخزين صفحة البداية فور التثبيت
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(['/', '/index.html', '/school_logo.png', '/school_logo.jpg']);
    })
  );
});

// تفعيل فوري وحذف أي كاش قديم
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// اعتراض الطلبات: فتح من الكاش فوراً لو مفيش نت، وتخزين أي ملف جديد تلقائياً
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // نتجاهل طلبات التعديل والحذف (POST/PUT/DELETE) لأن AppContext بيعالجها في طابور الأوفلاين
  if (request.method !== 'GET') return;

  // نتجاهل روابط Supabase من كاش الملفات (بياناتها محفوظة في localStorage)
  if (request.url.includes('supabase.co')) return;

  // لصفحات الموقع (Navigation): افتح من الكاش فوراً لو النت فاصل
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', copy));
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // لملفات الكود والصور والخطوط (JS, CSS, Images):
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
