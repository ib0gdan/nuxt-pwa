import type { QueueOperation } from "../../../types/sync";
import type { Reminder } from "../../../types/reminder";
import { getUserReminders, setUserReminders } from "../../utils/storage";

interface SyncBody {
  userId: string;
  operations: QueueOperation[];
}

const normalizeReminder = (item: Reminder): Reminder => ({
  ...item,
  dueAt: typeof item.dueAt === "number" ? item.dueAt : undefined,
});

const applyOperation = (
  reminders: Reminder[],
  operation: QueueOperation,
): Reminder[] => {
  if (operation.action === "create" || operation.action === "update") {
    const payload = operation.payload as Reminder | undefined;
    if (!payload) {
      return reminders;
    }
    const filtered = reminders.filter(
      (item) => item.id !== operation.reminderId,
    );
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
    const aTs = a.dueAt ?? new Date(`${a.date}T${a.time}:00`).getTime();
    const bTs = b.dueAt ?? new Date(`${b.date}T${b.time}:00`).getTime();
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
