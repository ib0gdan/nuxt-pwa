import { defineStore } from 'pinia';
import Dexie from 'dexie';

class VibeSyncDB extends Dexie {
  constructor() {
    super("vibe-sync-db");
    this.version(1).stores({
      reminders: "id, completed, date, time, createdAt, updatedAt, category, order",
      queue: "id, action, reminderId, createdAt",
      meta: "key"
    });
  }
}
const db = new VibeSyncDB();
const createId = () => crypto.randomUUID();
const enqueueOperation = async (action, reminderId, payload) => {
  const operation = {
    id: createId(),
    action,
    reminderId,
    payload,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  await db.queue.put(operation);
  return operation;
};
const getPendingQueue = async () => {
  return db.queue.orderBy("createdAt").toArray();
};
const removeQueueItems = async (ids) => {
  await db.queue.bulkDelete(ids);
};
const getClientId = () => {
  {
    return "server";
  }
};
const sortReminders = (items) => [...items].sort((a, b) => {
  const aTs = (/* @__PURE__ */ new Date(`${a.date}T${a.time}:00`)).getTime();
  const bTs = (/* @__PURE__ */ new Date(`${b.date}T${b.time}:00`)).getTime();
  if (aTs !== bTs) {
    return aTs - bTs;
  }
  return a.order - b.order;
});
const getReminders = async () => {
  const items = await db.reminders.toArray();
  return sortReminders(items);
};
const addReminder = async (payload) => {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const currentCount = await db.reminders.count();
  const reminder = {
    id: createId(),
    title: payload.title,
    description: payload.description,
    date: payload.date,
    time: payload.time,
    completed: false,
    createdAt: now,
    updatedAt: now,
    category: payload.category,
    order: currentCount + 1
  };
  await db.reminders.put(reminder);
  await enqueueOperation("create", reminder.id, reminder);
  return reminder;
};
const updateReminder = async (reminderId, payload) => {
  const existing = await db.reminders.get(reminderId);
  if (!existing) {
    return null;
  }
  const updated = {
    ...existing,
    ...payload,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  await db.reminders.put(updated);
  await enqueueOperation("update", reminderId, updated);
  return updated;
};
const deleteReminder = async (reminderId) => {
  await db.reminders.delete(reminderId);
  await enqueueOperation("delete", reminderId);
};
const syncReminders = async () => {
  const queue = await getPendingQueue();
  const userId = getClientId();
  const response = await fetch("/api/reminders/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ operations: queue, userId })
  });
  const data = await response.json();
  await db.transaction("rw", db.queue, db.reminders, async () => {
    if (queue.length) {
      await removeQueueItems(data.syncedIds);
    }
    await db.reminders.clear();
    await db.reminders.bulkPut(data.reminders);
  });
  await db.meta.put({ key: "lastSyncedAt", value: (/* @__PURE__ */ new Date()).toISOString() });
};
const reminders = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  addReminder,
  deleteReminder,
  getReminders,
  syncReminders,
  updateReminder
}, Symbol.toStringTag, { value: "Module" }));
const TAG = "vibe-sync-reminders";
const registerBackgroundSync = async () => {
  if (!("serviceWorker" in void 0) || !("SyncManager" in void 0)) {
    return;
  }
  const registration = await (void 0).serviceWorker.ready;
  await registration.sync.register(TAG);
};
const triggerBackgroundSync = async () => {
  if ((void 0).onLine) {
    const { syncReminders: syncReminders2 } = await Promise.resolve().then(() => reminders);
    await syncReminders2();
    return;
  }
  await registerBackgroundSync();
};
const initialSyncStatus = {
  online: true,
  syncing: false,
  lastSyncedAt: null,
  pendingCount: 0
};
const useRemindersStore = defineStore("reminders", {
  state: () => ({
    reminders: [],
    loading: true,
    error: null,
    storageMode: "indexeddb",
    filter: "all",
    sortDirection: "asc",
    syncStatus: initialSyncStatus
  }),
  getters: {
    filteredReminders(state) {
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
        const aTs = (/* @__PURE__ */ new Date(`${a.date}T${a.time}:00`)).getTime();
        const bTs = (/* @__PURE__ */ new Date(`${b.date}T${b.time}:00`)).getTime();
        return state.sortDirection === "asc" ? aTs - bTs : bTs - aTs;
      });
    },
    completedToday(state) {
      const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      return state.reminders.filter((item) => item.completed && item.date === today).length;
    }
  },
  actions: {
    async syncThroughApi(operations) {
      const response = await fetch("/api/reminders/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operations, userId: getClientId() })
      });
      if (!response.ok) {
        throw new Error("Failed to sync reminders via API");
      }
      const data = await response.json();
      this.reminders = data.reminders;
      this.syncStatus.lastSyncedAt = (/* @__PURE__ */ new Date()).toISOString();
      return data.reminders;
    },
    async init() {
      try {
        this.error = null;
        this.syncStatus.online = false ? (void 0).onLine : true;
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
    async create(payload) {
      if (this.storageMode === "network") {
        const now = (/* @__PURE__ */ new Date()).toISOString();
        const created2 = {
          id: createId(),
          title: payload.title,
          description: payload.description,
          date: payload.date,
          time: payload.time,
          completed: false,
          createdAt: now,
          updatedAt: now,
          category: payload.category,
          order: this.reminders.length + 1
        };
        await this.syncThroughApi([
          {
            id: createId(),
            action: "create",
            reminderId: created2.id,
            payload: created2,
            createdAt: now
          }
        ]);
        await this.updatePendingCount();
        return created2;
      }
      const created = await addReminder(payload);
      this.reminders.push(created);
      await this.updatePendingCount();
      await this.syncIfOnline();
      return created;
    },
    async patch(reminderId, payload) {
      const index = this.reminders.findIndex((item) => item.id === reminderId);
      const backup = index >= 0 ? this.reminders[index] : null;
      if (backup) {
        this.reminders[index] = {
          ...backup,
          ...payload,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
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
            createdAt: (/* @__PURE__ */ new Date()).toISOString()
          }
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
    async remove(reminderId) {
      const backup = [...this.reminders];
      this.reminders = this.reminders.filter((item) => item.id !== reminderId);
      try {
        if (this.storageMode === "network") {
          await this.syncThroughApi([
            {
              id: createId(),
              action: "delete",
              reminderId,
              createdAt: (/* @__PURE__ */ new Date()).toISOString()
            }
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
    async reorder(orderedIds) {
      const byId = new Map(this.reminders.map((item) => [item.id, item]));
      const reordered = orderedIds.map((id, index) => {
        const item = byId.get(id);
        if (!item) {
          return null;
        }
        return { ...item, order: index + 1 };
      }).filter((item) => Boolean(item));
      this.reminders = reordered;
      if (this.storageMode === "network") {
        const now = (/* @__PURE__ */ new Date()).toISOString();
        await this.syncThroughApi(
          reordered.map((item) => ({
            id: createId(),
            action: "update",
            reminderId: item.id,
            payload: item,
            createdAt: now
          }))
        );
        await this.updatePendingCount();
        return;
      }
      await Promise.all(
        reordered.map((item) => updateReminder(item.id, { order: item.order }))
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
        this.syncStatus.lastSyncedAt = (/* @__PURE__ */ new Date()).toISOString();
      } finally {
        this.syncStatus.syncing = false;
        await this.updatePendingCount();
      }
    },
    setFilter(filter) {
      this.filter = filter;
    },
    setSortDirection(direction) {
      this.sortDirection = direction;
    },
    setOnline(value) {
      this.syncStatus.online = value;
    },
    async updatePendingCount() {
      if (this.storageMode === "network") {
        this.syncStatus.pendingCount = 0;
        return;
      }
      this.syncStatus.pendingCount = await db.queue.count();
    }
  }
});

export { getClientId as g, useRemindersStore as u };
//# sourceMappingURL=reminders-d2dtA4vc.mjs.map
