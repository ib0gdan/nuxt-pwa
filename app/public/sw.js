import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { NetworkFirst, StaleWhileRevalidate } from "workbox-strategies";

cleanupOutdatedCaches();
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

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      clients.forEach((client) => {
        client.postMessage({ type: "trigger-sync" });
      });
    }),
  );
});

self.addEventListener("push", (event) => {
  let data = null;
  try {
    data = event.data?.json?.() ?? null;
  } catch {
    data = null;
  }
  const title = data?.title || "Vibe Sync";
  const body = data?.body || "У вас новое напоминание";

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(title, {
        body,
        badge: "/icons/icon-192.svg",
        icon: "/icons/icon-192.svg",
        data: { url: "/", reminderId: data?.reminderId ?? null },
      }),
      self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: "push-received",
            payload: {
              title,
              reminderId: data?.reminderId ?? null,
            },
          });
        });
      }),
    ]),
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
