import type { Reminder } from "../../types/reminder";

const toTimestampWithOffset = (
  date: string,
  time: string,
  timezoneOffsetMinutes?: number,
): number => {
  const dateParts = date.split("-").map((part) => Number(part));
  const timeParts = time.split(":").map((part) => Number(part));
  const year = dateParts[0] ?? Number.NaN;
  const month = dateParts[1] ?? Number.NaN;
  const day = dateParts[2] ?? Number.NaN;
  const hours = timeParts[0] ?? Number.NaN;
  const minutes = timeParts[1] ?? Number.NaN;
  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes)
  ) {
    return Number.NaN;
  }
  if (typeof timezoneOffsetMinutes === "number") {
    return (
      Date.UTC(year, month - 1, day, hours, minutes, 0) +
      timezoneOffsetMinutes * 60_000
    );
  }
  return new Date(`${date}T${time}:00`).getTime();
};

export const isDueReminder = (
  item: Pick<Reminder, "date" | "time" | "dueAt">,
  now = Date.now(),
  timezoneOffsetMinutes?: number,
): boolean => {
  const dueAt =
    typeof item.dueAt === "number"
      ? item.dueAt
      : toTimestampWithOffset(item.date, item.time, timezoneOffsetMinutes);
  return Number.isFinite(dueAt) && dueAt <= now;
};

export const collectDueUndelivered = (
  reminders: Reminder[],
  deliveredIds: Set<string>,
  now = Date.now(),
  timezoneOffsetMinutes?: number,
): Reminder[] =>
  reminders.filter(
    (item) =>
      !item.completed &&
      !deliveredIds.has(item.id) &&
      isDueReminder(item, now, timezoneOffsetMinutes),
  );

export const createPushPayload = (
  reminder: Pick<Reminder, "id" | "title" | "description">,
): string =>
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
  const value = error as
    | { statusCode?: number; body?: string; message?: string }
    | undefined;
  return {
    statusCode: value?.statusCode,
    body: value?.body,
    message: value?.message || String(error),
  };
};
