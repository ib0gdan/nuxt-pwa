import type { PushSubscriptionPayload } from "../../types/push";
import { base64ToUint8Array } from "../../utils/webpush";

const serializeSubscription = (
  subscription: PushSubscription,
): PushSubscriptionPayload => {
  const json = subscription.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
    throw new Error("Invalid subscription payload");
  }
  return {
    endpoint: json.endpoint,
    keys: {
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
    },
  };
};

export const requestNotificationsPermission =
  async (): Promise<NotificationPermission> => {
    if (!("Notification" in window)) {
      return "denied";
    }
    return Notification.requestPermission();
  };

export interface PushClientDiagnostics {
  secureContext: boolean;
  notificationPermission: NotificationPermission | "unsupported";
  hasServiceWorker: boolean;
  hasPushManager: boolean;
  hasSubscription: boolean;
  serviceWorkerScope: string | null;
}

const waitForServiceWorkerReady = async (
  timeoutMs = 10000,
): Promise<ServiceWorkerRegistration> => {
  const existing = await navigator.serviceWorker.getRegistration();
  if (existing) {
    return existing;
  }

  return Promise.race([
    navigator.serviceWorker.ready,
    new Promise<never>((_, reject) => {
      setTimeout(
        () => reject(new Error("Service worker is not ready")),
        timeoutMs,
      );
    }),
  ]);
};

export const ensurePushSubscription = async (
  vapidKey: string,
  userId: string,
  subscribeUrl = "/api/push/subscribe",
  forceRefresh = false,
): Promise<PushSubscriptionPayload | null> => {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return null;
  }

  if (!vapidKey) {
    return null;
  }

  const permission = await requestNotificationsPermission();
  if (permission !== "granted") {
    return null;
  }

  const registration = await waitForServiceWorkerReady();
  const existing = await registration.pushManager.getSubscription();
  if (existing && forceRefresh) {
    await existing.unsubscribe();
  }
  const activeSubscription = forceRefresh
    ? null
    : await registration.pushManager.getSubscription();
  const subscription =
    activeSubscription ||
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64ToUint8Array(vapidKey) as BufferSource,
    }));

  const payload = serializeSubscription(subscription);
  const response = await fetch(subscribeUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ subscription: payload, userId }),
  });
  if (!response.ok) {
    throw new Error("Failed to save push subscription");
  }
  return payload;
};

export const collectPushClientDiagnostics =
  async (): Promise<PushClientDiagnostics> => {
    if (!import.meta.client) {
      return {
        secureContext: false,
        notificationPermission: "unsupported",
        hasServiceWorker: false,
        hasPushManager: false,
        hasSubscription: false,
        serviceWorkerScope: null,
      };
    }
    const hasServiceWorker = "serviceWorker" in navigator;
    const hasPushManager = "PushManager" in window;
    const notificationPermission =
      "Notification" in window ? Notification.permission : "unsupported";
    if (!hasServiceWorker || !hasPushManager) {
      return {
        secureContext: window.isSecureContext,
        notificationPermission,
        hasServiceWorker,
        hasPushManager,
        hasSubscription: false,
        serviceWorkerScope: null,
      };
    }
    const registration = await navigator.serviceWorker.getRegistration();
    const subscription = registration
      ? await registration.pushManager.getSubscription()
      : null;
    return {
      secureContext: window.isSecureContext,
      notificationPermission,
      hasServiceWorker,
      hasPushManager,
      hasSubscription: Boolean(subscription),
      serviceWorkerScope: registration?.scope ?? null,
    };
  };
