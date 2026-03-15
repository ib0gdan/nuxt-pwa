import type { PushSubscriptionPayload } from "../../../types/push";
import { saveSubscription, saveUserTimezoneOffset } from "../../utils/storage";

interface SubscribeBody {
  userId: string;
  subscription: PushSubscriptionPayload;
  timezoneOffsetMinutes?: number;
}

export default defineEventHandler(async (event) => {
  const body = await readBody<SubscribeBody>(event);
  if (!body?.subscription || !body?.userId) {
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
