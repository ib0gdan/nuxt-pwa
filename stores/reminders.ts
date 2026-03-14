import { defineStore } from "pinia";
import type {
  Reminder,
  ReminderFilter,
  ReminderInput,
  ReminderUpdate,
} from "../types/reminder";
import type { SyncStatus } from "../types/sync";
import {
  addReminder,
  deleteReminder,
  getReminders,
  syncReminders,
  updateReminder,
} from "../services/db/reminders";
import { db } from "../services/db/client";
import { triggerBackgroundSync } from "../services/sync/backgroundSync";

type SortDirection = "asc" | "desc";

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
        this.error = "Ошибка доступа к локальной базе данных. Попробуйте очистить место на устройстве или перезагрузить страницу.";
        this.loading = false;
      }
    },
    async refresh() {
      this.reminders = await getReminders();
    },
    async create(payload: ReminderInput) {
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
          updatedAt: new Date().toISOString(),
        };
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
      await Promise.all(
        reordered.map((item) => updateReminder(item.id, { order: item.order })),
      );
      await this.updatePendingCount();
      await this.syncIfOnline();
    },
    async syncIfOnline() {
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
      this.syncStatus.pendingCount = await db.queue.count();
    },
  },
});
