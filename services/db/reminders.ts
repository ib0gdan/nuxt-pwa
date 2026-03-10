import { db } from "./client";
import {
  enqueueOperation,
  getPendingQueue,
  removeQueueItems,
} from "../sync/offlineQueue";
import type { Reminder, ReminderInput, ReminderUpdate } from "../../types/reminder";
import { getClientId } from "../../utils/clientId";
import { createId } from "../../utils/id";

const sortReminders = (items: Reminder[]): Reminder[] =>
  [...items].sort((a, b) => {
    const aTs = new Date(`${a.date}T${a.time}:00`).getTime();
    const bTs = new Date(`${b.date}T${b.time}:00`).getTime();
    if (aTs !== bTs) {
      return aTs - bTs;
    }
    return a.order - b.order;
  });

export const getReminders = async (): Promise<Reminder[]> => {
  const items = await db.reminders.toArray();
  return sortReminders(items);
};

export const addReminder = async (payload: ReminderInput): Promise<Reminder> => {
  const now = new Date().toISOString();
  const currentCount = await db.reminders.count();
  const reminder: Reminder = {
    id: createId(),
    title: payload.title,
    description: payload.description,
    date: payload.date,
    time: payload.time,
    completed: false,
    createdAt: now,
    updatedAt: now,
    category: payload.category,
    order: currentCount + 1,
  };

  await db.reminders.put(reminder);
  // Любая локальная запись добавляется в offline-очередь для последующей синхронизации.
  await enqueueOperation("create", reminder.id, reminder);
  return reminder;
};

export const updateReminder = async (
  reminderId: string,
  payload: ReminderUpdate,
): Promise<Reminder | null> => {
  const existing = await db.reminders.get(reminderId);
  if (!existing) {
    return null;
  }

  const updated: Reminder = {
    ...existing,
    ...payload,
    updatedAt: new Date().toISOString(),
  };

  await db.reminders.put(updated);
  await enqueueOperation("update", reminderId, updated);
  return updated;
};

export const deleteReminder = async (reminderId: string): Promise<void> => {
  await db.reminders.delete(reminderId);
  await enqueueOperation("delete", reminderId);
};

export const replaceAllReminders = async (reminders: Reminder[]): Promise<void> => {
  await db.transaction("rw", db.reminders, async () => {
    await db.reminders.clear();
    await db.reminders.bulkPut(reminders);
  });
};

export const syncReminders = async (): Promise<void> => {
  const queue = await getPendingQueue();
  const userId = getClientId();

  // Сервер возвращает каноническую версию списка напоминаний пользователя.
  const response = await fetch("/api/reminders/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ operations: queue, userId }),
  });
  const data = (await response.json()) as { syncedIds: string[]; reminders: Reminder[] };

  await db.transaction("rw", db.queue, db.reminders, async () => {
    if (queue.length) {
      await removeQueueItems(data.syncedIds);
    }
    await db.reminders.clear();
    await db.reminders.bulkPut(data.reminders);
  });
  await db.meta.put({ key: "lastSyncedAt", value: new Date().toISOString() });
};
