import webpush from "web-push";
import {
  getAllReminderEntries,
  getDeliveredIds,
  getSubscription,
  saveDeliveredIds,
} from "../../utils/storage";

export default defineEventHandler(async () => {
  const config = useRuntimeConfig();
  const publicKey = config.public.webPushPublicKey;
  const privateKey = config.webPushPrivateKey;
  const subject = config.webPushSubject;

  if (!publicKey || !privateKey) {
    throw createError({
      statusCode: 500,
      statusMessage: "VAPID keys are missing",
    });
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);

  const entries = await getAllReminderEntries();
  const results = [];

  for (const entry of entries) {
    const { userId, reminders } = entry;
    const subscription = await getSubscription(userId);

    if (!subscription) {
      continue;
    }

    const delivered = new Set(await getDeliveredIds(userId));
    const now = Date.now();

    const due = reminders.filter((item) => {
      if (item.completed) return false;
      const dueAt = new Date(`${item.date}T${item.time}:00`).getTime();
      return dueAt <= now;
    });

    let sentCount = 0;

    for (const reminder of due) {
      if (delivered.has(reminder.id)) {
        continue;
      }

      try {
        await webpush.sendNotification(
          subscription as unknown as webpush.PushSubscription,
          JSON.stringify({
            title: "Напоминание",
            body: `${reminder.title} — ${reminder.description || "Пора выполнить задачу"}`,
            reminderId: reminder.id,
          }),
        );
        delivered.add(reminder.id);
        sentCount++;
        results.push({ userId, reminderId: reminder.id, status: "sent" });
      } catch (err: unknown) {
        const error = err as { statusCode?: number; body?: string };
        console.error(`Failed to send push to user ${userId}:`, error);
        
        if (error.statusCode === 410 || error.statusCode === 404) {
           console.log(`Subscription expired for user ${userId}, removing...`);
           // TODO: Можно реализовать удаление подписки
        }

        results.push({
          userId,
          reminderId: reminder.id,
          status: "failed",
          statusCode: error.statusCode,
          body: error.body,
          error: String(error),
        });
      }
    }

    if (sentCount > 0) {
      await saveDeliveredIds(userId, [...delivered]);
    }
  }

  return {
    ok: true,
    processed: entries.length,
    results,
  };
});
