import { defineStore } from "pinia";
import type {
  Reminder,
  ReminderFilter,
  ReminderInput,
  ReminderUpdate,
} from "../types/reminder";
import type { QueueOperation, SyncStatus } from "../types/sync";
import {
  addReminder,
  deleteReminder,
  getReminders,
  syncReminders,
  updateReminder,
} from "../services/db/reminders";
import { db } from "../services/db/client";
import { triggerBackgroundSync } from "../services/sync/backgroundSync";
import { createId } from "../utils/id";
import { getClientId } from "../utils/clientId";

type SortDirection = "asc" | "desc";

const toDueAt = (date: string, time: string): number => {
  return new Date(`${date}T${time}:00`).getTime();
};

const initialSyncStatus: SyncStatus = {
  online: true,
  syncing: false,
  lastSyncedAt: null,
  pendingCount: 0,
};

export const useRemindersStore = defineStore("reminders", {
  state: () => ({
    reminders: [] as Reminder[],
    loading: true,
    error: null as string | null,
    storageMode: "indexeddb" as "indexeddb" | "network",
    filter: "all" as ReminderFilter,
    sortDirection: "asc" as SortDirection,
    syncStatus: initialSyncStatus,
  }),
  getters: {
    filteredReminders(state): Reminder[] {
      const filtered = state.reminders.filter((item) => {
        if (state.filter === "active") {
          return !item.completed;
        }
        if (state.filter === "completed") {
          return item.completed;
        }
        return true;
      });

      return filtered.sort((a, b) => {
        const aTs = new Date(`${a.date}T${a.time}:00`).getTime();
        const bTs = new Date(`${b.date}T${b.time}:00`).getTime();
        return state.sortDirection === "asc" ? aTs - bTs : bTs - aTs;
      });
    },
    completedToday(state): number {
      const today = new Date().toISOString().split("T")[0];
      return state.reminders.filter((item) => item.completed && item.date === today).length;
    },
  },
  actions: {
    async syncThroughApi(operations: QueueOperation[]) {
      const response = await fetch("/api/reminders/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operations, userId: getClientId() }),
      });
      if (!response.ok) {
        throw new Error("Failed to sync reminders via API");
      }
      const data = (await response.json()) as { reminders: Reminder[] };
      this.reminders = data.reminders;
      this.syncStatus.lastSyncedAt = new Date().toISOString();
      return data.reminders;
    },
    async init() {
      try {
        this.error = null;
        this.syncStatus.online = import.meta.client ? navigator.onLine : true;
        await this.refresh();
        this.loading = false;
        await this.updatePendingCount();
        const lastSynced = await db.meta.get("lastSyncedAt");
        this.syncStatus.lastSyncedAt = lastSynced?.value ?? null;
      } catch (err) {
        console.error("Critical DB Error:", err);
        this.storageMode = "network";
        this.error = "Локальная база недоступна. Переключено на сетевой режим без офлайн-кеша.";
        if (this.syncStatus.online) {
          try {
            await this.syncThroughApi([]);
          } catch (networkError) {
            console.error("Network fallback init failed:", networkError);
          }
        }
        this.loading = false;
      }
    },
    async refresh() {
      if (this.storageMode === "network") {
        if (!this.syncStatus.online) {
          return;
        }
        await this.syncThroughApi([]);
        return;
      }
      this.reminders = await getReminders();
    },
    async create(payload: ReminderInput) {
      if (this.storageMode === "network") {
        const now = new Date().toISOString();
        const created: Reminder = {
          id: createId(),
          title: payload.title,
          description: payload.description,
          date: payload.date,
          time: payload.time,
          dueAt: toDueAt(payload.date, payload.time),
          completed: false,
          createdAt: now,
          updatedAt: now,
          category: payload.category,
          order: this.reminders.length + 1,
        };
        await this.syncThroughApi([
          {
            id: createId(),
            action: "create",
            reminderId: created.id,
            payload: created,
            createdAt: now,
          },
        ]);
        await this.updatePendingCount();
        return created;
      }
      const created = await addReminder(payload);
      this.reminders.push(created);
      await this.updatePendingCount();
      await this.syncIfOnline();
      return created;
    },
    async patch(reminderId: string, payload: ReminderUpdate) {
      const index = this.reminders.findIndex((item) => item.id === reminderId);
      const backup = index >= 0 ? this.reminders[index] : null;
      if (backup) {
        this.reminders[index] = {
          ...backup,
          ...payload,
          dueAt: toDueAt(payload.date ?? backup.date, payload.time ?? backup.time),
          updatedAt: new Date().toISOString(),
        };
      }

      if (this.storageMode === "network") {
        if (!backup) {
          return null;
        }
        await this.syncThroughApi([
          {
            id: createId(),
            action: "update",
            reminderId,
            payload: this.reminders[index],
            createdAt: new Date().toISOString(),
          },
        ]);
        await this.updatePendingCount();
        return this.reminders[index];
      }

      const saved = await updateReminder(reminderId, payload);
      if (!saved && backup) {
        this.reminders[index] = backup;
      }
      await this.updatePendingCount();
      await this.syncIfOnline();
      return saved;
    },
    async remove(reminderId: string) {
      const backup = [...this.reminders];
      this.reminders = this.reminders.filter((item) => item.id !== reminderId);
      try {
        if (this.storageMode === "network") {
          await this.syncThroughApi([
            {
              id: createId(),
              action: "delete",
              reminderId,
              createdAt: new Date().toISOString(),
            },
          ]);
          await this.updatePendingCount();
          return;
        }
        await deleteReminder(reminderId);
        await this.updatePendingCount();
        await this.syncIfOnline();
      } catch (error) {
        this.reminders = backup;
        throw error;
      }
    },
    async reorder(orderedIds: string[]) {
      const byId = new Map(this.reminders.map((item) => [item.id, item]));
      const reordered: Reminder[] = orderedIds
        .map((id, index) => {
          const item = byId.get(id);
          if (!item) {
            return null;
          }
          return { ...item, order: index + 1 };
        })
        .filter((item): item is Reminder => Boolean(item));

      this.reminders = reordered;
      if (this.storageMode === "network") {
        const now = new Date().toISOString();
        await this.syncThroughApi(
          reordered.map((item) => ({
            id: createId(),
            action: "update" as const,
            reminderId: item.id,
            payload: item,
            createdAt: now,
          })),
        );
        await this.updatePendingCount();
        return;
      }
      await Promise.all(
        reordered.map((item) => updateReminder(item.id, { order: item.order })),
      );
      await this.updatePendingCount();
      await this.syncIfOnline();
    },
    async syncIfOnline() {
      if (this.storageMode === "network") {
        if (!this.syncStatus.online) {
          return;
        }
        try {
          this.syncStatus.syncing = true;
          await this.syncThroughApi([]);
        } finally {
          this.syncStatus.syncing = false;
          await this.updatePendingCount();
        }
        return;
      }
      if (!this.syncStatus.online) {
        await triggerBackgroundSync();
        return;
      }

      try {
        this.syncStatus.syncing = true;
        await syncReminders();
        await this.refresh();
        this.syncStatus.lastSyncedAt = new Date().toISOString();
      } finally {
        this.syncStatus.syncing = false;
        await this.updatePendingCount();
      }
    },
    setFilter(filter: ReminderFilter) {
      this.filter = filter;
    },
    setSortDirection(direction: SortDirection) {
      this.sortDirection = direction;
    },
    setOnline(value: boolean) {
      this.syncStatus.online = value;
    },
    async updatePendingCount() {
      if (this.storageMode === "network") {
        this.syncStatus.pendingCount = 0;
        return;
      }
      this.syncStatus.pendingCount = await db.queue.count();
    },
  },
});
