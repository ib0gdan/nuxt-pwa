import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { NetworkFirst, StaleWhileRevalidate } from "workbox-strategies";

cleanupOutdatedCaches();
// Предкеш критичных ресурсов, собранных в манифесте Workbox.
precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  ({ request }) => request.mode === "navigate",
  new NetworkFirst({
    cacheName: "pages-cache",
  }),
);

registerRoute(
  ({ request }) =>
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "image",
  new StaleWhileRevalidate({
    cacheName: "asset-cache",
  }),
);

registerRoute(
  ({ url }) => url.pathname.startsWith("/api/"),
  new NetworkFirst({
    cacheName: "api-cache",
  }),
);

self.addEventListener("sync", (event) => {
  if (event.tag !== "vibe-sync-reminders") {
    return;
  }

  // Отправляем сигнал активным вкладкам, чтобы запустить sync на клиенте.
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      clients.forEach((client) => {
        client.postMessage({ type: "trigger-sync" });
      });
    }),
  );
});

self.addEventListener("push", (event) => {
  const data = event.data?.json();
  const title = data?.title || "Vibe Sync";
  const body = data?.body || "У вас новое напоминание";

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      badge: "/icons/icon-192.svg",
      icon: "/icons/icon-192.svg",
      data: { url: "/" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      const active = clients.find((client) => "focus" in client);
      if (active) {
        return active.focus();
      }
      return self.clients.openWindow("/");
    }),
  );
});
