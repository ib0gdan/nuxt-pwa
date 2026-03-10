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

export const ensurePushSubscription = async (
  vapidKey: string,
  userId: string,
  subscribeUrl = "/api/push/subscribe",
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

  const registration = await navigator.serviceWorker.ready;
  const existing = await registration.pushManager.getSubscription();
  const subscription =
    existing ||
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64ToUint8Array(vapidKey) as BufferSource,
    }));

  const payload = serializeSubscription(subscription);
  await fetch(subscribeUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ subscription: payload, userId }),
  });
  return payload;
};
