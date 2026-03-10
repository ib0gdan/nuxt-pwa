<script setup lang="ts">
import { storeToRefs } from "pinia";
import { onMounted } from "vue";
import { usePush } from "../../composables/usePush";
import { useTheme } from "../../composables/useTheme";
import { useToasts } from "../../composables/useToast";
import { useRemindersStore } from "../../stores/reminders";

const remindersStore = useRemindersStore();
const { syncStatus } = storeToRefs(remindersStore);
const { enabled, loading, enablePush } = usePush();
const { mode, initTheme, toggle } = useTheme();
const { addToast: push } = useToasts();

onMounted(() => {
  initTheme();
});

const activatePush = async () => {
  const ok = await enablePush();
  push(ok ? "Push включены" : "Push не разрешены", ok ? "success" : "error");
};
</script>

<template>
  <section class="mx-auto grid max-w-3xl gap-4">
    <div class="rounded-2xl bg-white p-5 shadow dark:bg-slate-900">
      <h1 class="mb-4 text-xl font-semibold">Settings</h1>
      <div class="grid gap-3">
        <div
          class="flex items-center justify-between rounded-xl bg-slate-100 px-3 py-3 dark:bg-slate-800"
        >
          <div>
            <p class="text-sm font-medium">Push Notifications</p>
            <p class="text-xs text-slate-500">
              Текущий статус: {{ enabled ? "Включены" : "Выключены" }}
            </p>
          </div>
          <button
            class="rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-500 disabled:opacity-60"
            :disabled="loading"
            @click="activatePush"
          >
            {{ loading ? "Подключаем..." : "Включить push" }}
          </button>
        </div>

        <div
          class="flex items-center justify-between rounded-xl bg-slate-100 px-3 py-3 dark:bg-slate-800"
        >
          <div>
            <p class="text-sm font-medium">Dark Mode</p>
            <p class="text-xs text-slate-500">Текущая тема: {{ mode }}</p>
          </div>
          <button
            class="rounded-lg bg-slate-700 px-3 py-1.5 text-sm text-white hover:bg-slate-600"
            @click="toggle"
          >
            Toggle
          </button>
        </div>
      </div>
    </div>

    <SyncStatusBadge
      :online="syncStatus.online"
      :syncing="syncStatus.syncing"
      :pending-count="syncStatus.pendingCount"
      :last-synced-at="syncStatus.lastSyncedAt"
    />
  </section>
</template>
