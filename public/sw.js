/* Vivida service worker, push plus an offline fallback for page navigation. */

const OFFLINE_CACHE = "vivida-offline-v1";
const OFFLINE_PAGE = "/offline.html";

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {};
  }
  const title = data.title || "Vivida";
  const options = {
    body: data.body || "",
    icon: "/apple-icon.png",
    badge: "/apple-icon.png",
    tag: data.tag || undefined,
    // Replace an earlier notification with the same tag instead of stacking.
    renotify: Boolean(data.tag),
    data: { url: data.url || "/dashboard" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || "/dashboard";
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((wins) => {
        // Focus an existing tab on the same path if one is open.
        for (const w of wins) {
          if (w.url.includes(target) && "focus" in w) return w.focus();
        }
        if (self.clients.openWindow) return self.clients.openWindow(target);
        return undefined;
      })
  );
});

// Activate immediately on update so pushes keep working after a deploy.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(OFFLINE_CACHE).then((cache) => cache.add(OFFLINE_PAGE))
  );
  self.skipWaiting();
});
self.addEventListener("activate", (event) =>
  event.waitUntil(self.clients.claim())
);

self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;
  event.respondWith(
    fetch(event.request).catch(async () => {
      const cached = await caches.match(OFFLINE_PAGE);
      return cached || Response.error();
    })
  );
});
