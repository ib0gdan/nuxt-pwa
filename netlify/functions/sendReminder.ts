import type { Config, Handler } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import webpush from "web-push";
import type { Reminder } from "../../types/reminder";
import {
  collectDueUndelivered,
  createPushPayload,
  shouldDropSubscription,
  toPushDeliveryError,
} from "../../server/utils/push-delivery";

interface PushSubscriptionPayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

const siteID = process.env.NETLIFY_SITE_ID;
const token = process.env.NETLIFY_API_TOKEN || process.env.NETLIFY_AUTH_TOKEN || process.env.NETLIFY_TOKEN;
const store = siteID && token
  ? getStore({ name: "vibe-sync", siteID, token })
  : getStore("vibe-sync");

const readJson = async <T>(key: string, fallback: T): Promise<T> => {
  const raw = await store.get(key, { type: "text" });
  if (!raw) {
    return fallback;
  }
  return JSON.parse(raw) as T;
};

const writeJson = async <T>(key: string, value: T): Promise<void> => {
  await store.set(key, JSON.stringify(value));
};

const deleteSubscription = async (userId: string): Promise<void> => {
  await store.set(`subscription:${userId}`, "");
};

export const handler: Handler = async () => {
  const publicKey = process.env.NUXT_PUBLIC_WEB_PUSH_PUBLIC_KEY;
  const privateKey = process.env.WEB_PUSH_PRIVATE_KEY;
  const subject = process.env.WEB_PUSH_SUBJECT || "mailto:admin@vibe-sync.app";

  if (!publicKey || !privateKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, message: "Missing VAPID keys" }),
    };
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);

  const list = await store.list({ prefix: "reminders:" });
  const failures: Array<{ userId: string; reminderId: string; statusCode?: number }> = [];
  let sentCount = 0;

  for (const blob of list.blobs) {
    const userId = blob.key.replace("reminders:", "");
    const reminders = await readJson<Reminder[]>(blob.key, []);
    const subscription = await readJson<PushSubscriptionPayload | null>(
      `subscription:${userId}`,
      null,
    );
    if (!subscription) {
      continue;
    }

    const delivered = new Set(
      await readJson<string[]>(`delivered:${userId}`, []),
    );

    const due = collectDueUndelivered(reminders, delivered);
    for (const reminder of due) {
      try {
        await webpush.sendNotification(
          subscription as unknown as webpush.PushSubscription,
          createPushPayload(reminder),
        );
        delivered.add(reminder.id);
        sentCount += 1;
        console.info("[push-cron] sent", { userId, reminderId: reminder.id });
      } catch (error) {
        const info = toPushDeliveryError(error);
        console.error("[push-cron] failed", { userId, reminderId: reminder.id, ...info });
        failures.push({ userId, reminderId: reminder.id, statusCode: info.statusCode });
        if (shouldDropSubscription(info.statusCode)) {
          await deleteSubscription(userId);
          console.info("[push-cron] subscription removed", { userId, statusCode: info.statusCode });
          break;
        }
      }
    }

    await writeJson(`delivered:${userId}`, [...delivered]);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ ok: true, sentCount, failures }),
  };
};

export const config: Config = {
  schedule: "*/1 * * * *",
};
