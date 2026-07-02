/* Vivida service worker — web push only (no offline caching for now). */

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
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
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) =>
  event.waitUntil(self.clients.claim())
);
