import type { QueueOperation } from "../../../types/sync";
import type { Reminder } from "../../../types/reminder";
import { getUserReminders, setUserReminders } from "../../utils/storage";

interface SyncBody {
  userId: string;
  operations: QueueOperation[];
}

const toDueAt = (date: string, time: string): number => {
  return new Date(`${date}T${time}:00`).getTime();
};

const normalizeReminder = (item: Reminder): Reminder => ({
  ...item,
  dueAt: typeof item.dueAt === "number" ? item.dueAt : toDueAt(item.date, item.time),
});

const applyOperation = (reminders: Reminder[], operation: QueueOperation): Reminder[] => {
  if (operation.action === "create" || operation.action === "update") {
    const payload = operation.payload as Reminder | undefined;
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

export default defineEventHandler(async (event) => {
  const body = await readBody<SyncBody>(event);
  const userId = body?.userId || "anonymous";
  const operations = body?.operations || [];
  const current = (await getUserReminders(userId)).map(normalizeReminder);
  const merged = operations.reduce(applyOperation, current);
  const normalized = [...merged].sort((a, b) => {
    const aTs = a.dueAt ?? toDueAt(a.date, a.time);
    const bTs = b.dueAt ?? toDueAt(b.date, b.time);
    if (aTs !== bTs) {
      return aTs - bTs;
    }
    return a.order - b.order;
  });

  await setUserReminders(userId, normalized);
  return {
    syncedIds: operations.map((item) => item.id),
    reminders: normalized,
  };
});
