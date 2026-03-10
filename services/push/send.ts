import webpush from "web-push";
import type { PushSubscriptionPayload } from "../../types/push";

export interface PushReminderPayload {
  title: string;
  body: string;
  reminderId: string;
}

const initWebPush = (publicKey?: string, privateKey?: string, subject?: string) => {
  if (!publicKey || !privateKey) {
    throw new Error("WEB_PUSH_PUBLIC_KEY and WEB_PUSH_PRIVATE_KEY are required");
  }
  webpush.setVapidDetails(subject || "mailto:admin@vibe-sync.app", publicKey, privateKey);
};

export const sendPushNotification = async (
  subscription: PushSubscriptionPayload,
  payload: PushReminderPayload,
  options: {
    publicKey?: string;
    privateKey?: string;
    subject?: string;
  },
) => {
  initWebPush(options.publicKey, options.privateKey, options.subject);
  return webpush.sendNotification(
    subscription as unknown as webpush.PushSubscription,
    JSON.stringify(payload),
  );
};
