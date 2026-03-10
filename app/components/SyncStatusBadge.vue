<script setup lang="ts">
defineProps<{
  syncing: boolean;
  online: boolean;
  pendingCount: number;
  lastSyncedAt: string | null;
}>();
</script>

<template>
  <div class="rounded-2xl bg-white p-4 shadow dark:bg-slate-900">
    <p class="text-xs uppercase tracking-wide text-slate-500">
      Статус синка
    </p>
    <p class="mt-1 text-sm font-medium">
      {{ online ? "Онлайн" : "Оффлайн" }} · {{ syncing ? "Синхронизация..." : "Ожидание" }}
    </p>
    <p class="mt-1 text-xs text-slate-500">
      В очереди: {{ pendingCount }} · Последний sync: {{ lastSyncedAt || "—" }}
    </p>
  </div>
</template>

