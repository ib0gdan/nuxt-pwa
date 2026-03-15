import { d as defineEventHandler, r as readBody, c as createError } from '../../../nitro/nitro.mjs';
import { s as saveSubscription, a as saveUserTimezoneOffset } from '../../../_/storage.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import '@netlify/blobs';

const subscribe_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  if (!(body == null ? void 0 : body.subscription) || !(body == null ? void 0 : body.userId)) {
    throw createError({ statusCode: 400, statusMessage: "userId and subscription are required" });
  }
  try {
    await saveSubscription(body.userId, body.subscription);
    if (typeof body.timezoneOffsetMinutes === "number") {
      await saveUserTimezoneOffset(body.userId, body.timezoneOffsetMinutes);
    }
    console.info("[push-subscribe] saved", { userId: body.userId });
    return { ok: true };
  } catch (error) {
    console.error("[push-subscribe] failed", { userId: body.userId, error });
    throw createError({ statusCode: 503, statusMessage: "Failed to persist subscription" });
  }
});

export { subscribe_post as default };
//# sourceMappingURL=subscribe.post.mjs.map
