import type { PushSubscriptionPayload } from "../../../types/push";
import { saveSubscription } from "../../utils/storage";

interface SubscribeBody {
  userId: string;
  subscription: PushSubscriptionPayload;
}

export default defineEventHandler(async (event) => {
  const body = await readBody<SubscribeBody>(event);
  if (!body?.subscription || !body?.userId) {
    throw createError({ statusCode: 400, statusMessage: "userId and subscription are required" });
  }

  await saveSubscription(body.userId, body.subscription);
  return { ok: true };
});
