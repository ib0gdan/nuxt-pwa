import type { Reminder } from "../../types/reminder";

export const isDueReminder = (
  item: Pick<Reminder, "date" | "time" | "dueAt">,
  now = Date.now(),
): boolean => {
  const dueAt = typeof item.dueAt === "number"
    ? item.dueAt
    : new Date(`${item.date}T${item.time}:00`).getTime();
  return Number.isFinite(dueAt) && dueAt <= now;
};

export const collectDueUndelivered = (
  reminders: Reminder[],
  deliveredIds: Set<string>,
  now = Date.now(),
): Reminder[] =>
  reminders.filter((item) => !item.completed && !deliveredIds.has(item.id) && isDueReminder(item, now));

export const createPushPayload = (reminder: Pick<Reminder, "id" | "title" | "description">): string =>
  JSON.stringify({
    title: "Напоминание",
    body: `${reminder.title} — ${reminder.description || "Пора выполнить задачу"}`,
    reminderId: reminder.id,
  });

export const shouldDropSubscription = (statusCode?: number): boolean =>
  statusCode === 404 || statusCode === 410;

export interface PushDeliveryError {
  statusCode?: number;
  body?: string;
  message: string;
}

export const toPushDeliveryError = (error: unknown): PushDeliveryError => {
  const value = error as { statusCode?: number; body?: string; message?: string } | undefined;
  return {
    statusCode: value?.statusCode,
    body: value?.body,
    message: value?.message || String(error),
  };
};
