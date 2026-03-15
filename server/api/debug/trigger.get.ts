import webpush from "web-push";
import {
  deleteSubscription,
  getAllReminderEntries,
  getDeliveredIds,
  getSubscription,
  saveDeliveredIds,
} from "../../utils/storage";
import {
  collectDueUndelivered,
  createPushPayload,
  shouldDropSubscription,
  toPushDeliveryError,
} from "../../utils/push-delivery";

export default defineEventHandler(async () => {
  if (process.env.NODE_ENV === "production") {
    throw createError({ statusCode: 404, statusMessage: "Not found" });
  }
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
  console.info("[push-debug] start", { users: entries.length });

  for (const entry of entries) {
    const { userId, reminders } = entry;
    const subscription = await getSubscription(userId);

    if (!subscription) {
      continue;
    }

    const delivered = new Set(await getDeliveredIds(userId));
    const now = Date.now();

    const due = collectDueUndelivered(reminders, delivered, now);

    let sentCount = 0;

    for (const reminder of due) {
      try {
        await webpush.sendNotification(
          subscription as unknown as webpush.PushSubscription,
          createPushPayload(reminder),
        );
        delivered.add(reminder.id);
        sentCount++;
        console.info("[push-debug] sent", { userId, reminderId: reminder.id });
        results.push({ userId, reminderId: reminder.id, status: "sent" });
      } catch (err: unknown) {
        const error = toPushDeliveryError(err);
        console.error("[push-debug] failed", {
          userId,
          reminderId: reminder.id,
          ...error,
        });

        if (shouldDropSubscription(error.statusCode)) {
          await deleteSubscription(userId);
          console.info("[push-debug] subscription removed", {
            userId,
            statusCode: error.statusCode,
          });
        }

        results.push({
          userId,
          reminderId: reminder.id,
          status: "failed",
          statusCode: error.statusCode,
          body: error.body,
          error: error.message,
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
