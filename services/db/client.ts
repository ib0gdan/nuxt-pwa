import Dexie, { type Table } from "dexie";
import type { Reminder } from "../../types/reminder";
import type { QueueOperation } from "../../types/sync";

export class VibeSyncDB extends Dexie {
  reminders!: Table<Reminder, string>;
  queue!: Table<QueueOperation, string>;
  meta!: Table<{ key: string; value: string }, string>;

  constructor() {
    super("vibe-sync-db");
    this.version(1).stores({
      reminders: "id, completed, date, time, createdAt, updatedAt, category, order",
      queue: "id, action, reminderId, createdAt",
      meta: "key",
    });
  }
}

export const db = new VibeSyncDB();
