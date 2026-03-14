import { getAllReminderEntries } from "../../utils/storage";

export default defineEventHandler(async () => {
  const config = useRuntimeConfig();
  const entries = await getAllReminderEntries();
  return {
    ok: true,
    runtime: process.env.NODE_ENV || "development",
    vapid: {
      publicConfigured: Boolean(config.public.webPushPublicKey),
      privateConfigured: Boolean(config.webPushPrivateKey),
      subjectConfigured: Boolean(config.webPushSubject),
    },
    remindersUsersCount: entries.length,
    websocket: {
      used: false,
      reason: "Push pipeline uses Service Worker and Web Push transport",
    },
  };
});
