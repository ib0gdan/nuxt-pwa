<script setup lang="ts">
import type { Reminder } from "../../types/reminder";

defineProps<{
  reminder: Reminder;
  draggable?: boolean;
}>();

const emit = defineEmits<{
  toggle: [id: string, completed: boolean];
  delete: [id: string];
}>();
</script>

<template>
  <article
    class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
    :draggable="draggable"
    :data-id="reminder.id"
  >
    <div class="mb-2 flex items-center justify-between gap-2">
      <h3 class="text-base font-semibold" :class="{ 'line-through opacity-60': reminder.completed }">
        {{ reminder.title }}
      </h3>
      <span class="rounded-lg bg-slate-100 px-2 py-1 text-xs dark:bg-slate-800">{{ reminder.category }}</span>
    </div>
    <p class="mb-3 text-sm text-slate-600 dark:text-slate-300">
      {{ reminder.description || "Без описания" }}
    </p>
    <p class="mb-4 text-xs text-slate-500">
      {{ reminder.date }} · {{ reminder.time }}
    </p>
    <div class="flex items-center gap-2">
      <button
        class="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500"
        @click="emit('toggle', reminder.id, !reminder.completed)"
      >
        {{ reminder.completed ? "Сделать активным" : "Выполнено" }}
      </button>
      <button
        class="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-500"
        @click="emit('delete', reminder.id)"
      >
        Удалить
      </button>
    </div>
  </article>
</template>
