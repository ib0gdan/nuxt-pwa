import { d as defineEventHandler, c as createError, u as useRuntimeConfig } from '../../../nitro/nitro.mjs';
import webpush from 'web-push';
import { g as getAllReminderEntries, a as getSubscription, b as getDeliveredIds, d as deleteSubscription, s as saveDeliveredIds } from '../../../_/storage.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import '@netlify/blobs';

const isDueReminder = (item, now = Date.now()) => {
  const dueAt = (/* @__PURE__ */ new Date(`${item.date}T${item.time}:00`)).getTime();
  return Number.isFinite(dueAt) && dueAt <= now;
};
const collectDueUndelivered = (reminders, deliveredIds, now = Date.now()) => reminders.filter((item) => !item.completed && !deliveredIds.has(item.id) && isDueReminder(item, now));
const createPushPayload = (reminder) => JSON.stringify({
  title: "\u041D\u0430\u043F\u043E\u043C\u0438\u043D\u0430\u043D\u0438\u0435",
  body: `${reminder.title} \u2014 ${reminder.description || "\u041F\u043E\u0440\u0430 \u0432\u044B\u043F\u043E\u043B\u043D\u0438\u0442\u044C \u0437\u0430\u0434\u0430\u0447\u0443"}`,
  reminderId: reminder.id
});
const shouldDropSubscription = (statusCode) => statusCode === 404 || statusCode === 410;
const toPushDeliveryError = (error) => {
  const value = error;
  return {
    statusCode: value == null ? void 0 : value.statusCode,
    body: value == null ? void 0 : value.body,
    message: (value == null ? void 0 : value.message) || String(error)
  };
};

const trigger_get = defineEventHandler(async () => {
  const config = useRuntimeConfig();
  const publicKey = config.public.webPushPublicKey;
  const privateKey = config.webPushPrivateKey;
  const subject = config.webPushSubject;
  if (!publicKey || !privateKey) {
    throw createError({
      statusCode: 500,
      statusMessage: "VAPID keys are missing"
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
          subscription,
          createPushPayload(reminder)
        );
        delivered.add(reminder.id);
        sentCount++;
        console.info("[push-debug] sent", { userId, reminderId: reminder.id });
        results.push({ userId, reminderId: reminder.id, status: "sent" });
      } catch (err) {
        const error = toPushDeliveryError(err);
        console.error("[push-debug] failed", {
          userId,
          reminderId: reminder.id,
          ...error
        });
        if (shouldDropSubscription(error.statusCode)) {
          await deleteSubscription(userId);
          console.info("[push-debug] subscription removed", {
            userId,
            statusCode: error.statusCode
          });
        }
        results.push({
          userId,
          reminderId: reminder.id,
          status: "failed",
          statusCode: error.statusCode,
          body: error.body,
          error: error.message
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
    results
  };
});

export { trigger_get as default };
//# sourceMappingURL=trigger.get.mjs.map
