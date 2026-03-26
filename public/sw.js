// KurbanApp — Service Worker (Offline Cache + PWA)
const CACHE_NAME = "kurbanapp-v1";
const OFFLINE_URLS = [
  "/",
  "/manifest.json",
];

self.addEventListener("install", (event) => {
  console.log("[KurbanApp PWA] Service Worker Kuruldu!");
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_URLS);
    })
  );
});

self.addEventListener("activate", (event) => {
  console.log("[KurbanApp PWA] Service Worker Aktifleşti!");
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Sadece GET isteklerini yakala
  if (event.request.method !== "GET") return;
  // Supabase API isteklerini cache'leme, her zaman ağdan çek
  if (event.request.url.includes("supabase.co")) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(event.request).then((networkResponse) => {
        // Başarılı yanıtları cache'e ekle
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === "basic") {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Offline fallback: HTML istekleri için ana sayfayı döndür
        if (event.request.destination === "document") {
          return caches.match("/");
        }
      });
    })
  );
});
