import { d as defineEventHandler, r as readBody } from '../../../nitro/nitro.mjs';
import { g as getUserReminders, a as setUserReminders } from '../../../_/storage.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import '@netlify/blobs';

const toDueAt = (date, time) => {
  return (/* @__PURE__ */ new Date(`${date}T${time}:00`)).getTime();
};
const normalizeReminder = (item) => ({
  ...item,
  dueAt: typeof item.dueAt === "number" ? item.dueAt : toDueAt(item.date, item.time)
});
const applyOperation = (reminders, operation) => {
  if (operation.action === "create" || operation.action === "update") {
    const payload = operation.payload;
    if (!payload) {
      return reminders;
    }
    const filtered = reminders.filter((item) => item.id !== operation.reminderId);
    return [...filtered, normalizeReminder(payload)];
  }
  if (operation.action === "delete") {
    return reminders.filter((item) => item.id !== operation.reminderId);
  }
  return reminders;
};
const sync_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const userId = (body == null ? void 0 : body.userId) || "anonymous";
  const operations = (body == null ? void 0 : body.operations) || [];
  const current = (await getUserReminders(userId)).map(normalizeReminder);
  const merged = operations.reduce(applyOperation, current);
  const normalized = [...merged].sort((a, b) => {
    var _a, _b;
    const aTs = (_a = a.dueAt) != null ? _a : toDueAt(a.date, a.time);
    const bTs = (_b = b.dueAt) != null ? _b : toDueAt(b.date, b.time);
    if (aTs !== bTs) {
      return aTs - bTs;
    }
    return a.order - b.order;
  });
  await setUserReminders(userId, normalized);
  return {
    syncedIds: operations.map((item) => item.id),
    reminders: normalized
  };
});

export { sync_post as default };
//# sourceMappingURL=sync.post.mjs.map
