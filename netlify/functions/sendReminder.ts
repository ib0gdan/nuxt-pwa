import type { Config, Handler } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import webpush from "web-push";

interface Reminder {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  completed: boolean;
}

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

const isDue = (item: Reminder): boolean => {
  const dueAt = new Date(`${item.date}T${item.time}:00`).getTime();
  return dueAt <= Date.now();
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

    // Дедупликация: не отправляем одно и то же напоминание повторно.
    const due = reminders.filter((item) => !item.completed && isDue(item));
    for (const reminder of due) {
      if (delivered.has(reminder.id)) {
        continue;
      }
      await webpush.sendNotification(
        subscription as unknown as webpush.PushSubscription,
        JSON.stringify({
          title: "Напоминание",
          body: `${reminder.title} — ${reminder.description || "Пора выполнить задачу"}`,
          reminderId: reminder.id,
        }),
      );
      delivered.add(reminder.id);
    }

    await writeJson(`delivered:${userId}`, [...delivered]);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ ok: true }),
  };
};

export const config: Config = {
  schedule: "*/1 * * * *",
};
