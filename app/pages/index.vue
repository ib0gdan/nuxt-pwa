<script setup lang="ts">
import { storeToRefs } from "pinia";
import { onMounted } from "vue";
import { useRemindersStore } from "../../stores/reminders";
import type { ReminderFilter, ReminderInput } from "../../types/reminder";
import { useToasts } from "../../composables/useToast";

const store = useRemindersStore();
const { filteredReminders, loading, error, filter, sortDirection, syncStatus } =
  storeToRefs(store);
const { addToast: push } = useToasts();

const availableFilters: ReminderFilter[] = ["all", "active", "completed"];

onMounted(async () => {
  await store.init();
});

const createNew = async (payload: ReminderInput) => {
  await store.create(payload);
  push("Напоминание создано", "success");
};

const toggleCompleted = async (id: string, completed: boolean) => {
  await store.patch(id, { completed });
  push("Статус обновлён", "info");
};

const removeReminder = async (id: string) => {
  await store.remove(id);
  push("Напоминание удалено", "success");
};

const reorderReminders = async (orderedIds: string[]) => {
  await store.reorder(orderedIds);
  push("Порядок обновлён", "info");
};
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-[1fr_360px]">
    <section class="space-y-4">
      <div
        class="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow dark:bg-slate-900"
      >
        <div class="flex flex-wrap items-center gap-2">
          <button
            v-for="item in availableFilters"
            :key="item"
            class="rounded-xl px-3 py-1.5 text-sm"
            :class="
              filter === item
                ? 'bg-blue-600 text-white'
                : 'bg-slate-200 dark:bg-slate-800'
            "
            @click="store.setFilter(item)"
          >
            {{ item }}
          </button>
        </div>
        <select
          class="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-950"
          :value="sortDirection"
          @change="
            store.setSortDirection(
              ($event.target as HTMLSelectElement).value as 'asc' | 'desc',
            )
          "
        >
          <option value="asc">Сначала ранние</option>
          <option value="desc">Сначала поздние</option>
        </select>
      </div>

      <div v-if="error" class="rounded-2xl bg-red-50 p-4 text-red-600 dark:bg-red-900/20">
        {{ error }}
      </div>

      <SkeletonList v-else-if="loading" />
      <ReminderList
        v-else
        :reminders="filteredReminders"
        @toggle="toggleCompleted"
        @delete="removeReminder"
        @reorder="reorderReminders"
      />
    </section>

    <aside class="space-y-4">
      <SyncStatusBadge
        :online="syncStatus.online"
        :syncing="syncStatus.syncing"
        :pending-count="syncStatus.pendingCount"
        :last-synced-at="syncStatus.lastSyncedAt"
      />
      <ReminderForm @submit="createNew" />
    </aside>
  </div>
</template>
