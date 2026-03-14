import { d as defineEventHandler, u as useRuntimeConfig } from '../../../nitro/nitro.mjs';
import { g as getAllReminderEntries } from '../../../_/storage.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import '@netlify/blobs';

const pushHealth_get = defineEventHandler(async () => {
  const config = useRuntimeConfig();
  const entries = await getAllReminderEntries();
  return {
    ok: true,
    runtime: "production",
    vapid: {
      publicConfigured: Boolean(config.public.webPushPublicKey),
      privateConfigured: Boolean(config.webPushPrivateKey),
      subjectConfigured: Boolean(config.webPushSubject)
    },
    remindersUsersCount: entries.length,
    websocket: {
      used: false,
      reason: "Push pipeline uses Service Worker and Web Push transport"
    }
  };
});

export { pushHealth_get as default };
//# sourceMappingURL=push-health.get.mjs.map
