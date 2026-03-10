<script setup lang="ts">
import { storeToRefs } from "pinia";
import { computed, onMounted } from "vue";
import { useRemindersStore } from "../../stores/reminders";

const store = useRemindersStore();
const { reminders } = storeToRefs(store);

onMounted(async () => {
  if (store.loading) {
    await store.init();
  }
});

const completedByDate = computed(() => {
  const map = new Map<string, number>();
  for (const reminder of reminders.value) {
    if (!reminder.completed) {
      continue;
    }
    map.set(reminder.date, (map.get(reminder.date) || 0) + 1);
  }

  return [...map.entries()]
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .slice(-7)
    .map(([date, value]) => ({ date, value }));
});

const maxValue = computed(() =>
  Math.max(...completedByDate.value.map((item) => item.value), 1),
);
</script>

<template>
  <section
    class="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow dark:bg-slate-900"
  >
    <h1 class="mb-5 text-xl font-semibold">Analytics</h1>
    <div
      v-if="!completedByDate.length"
      class="rounded-xl bg-slate-100 p-8 text-center text-sm text-slate-500 dark:bg-slate-800"
    >
      Пока нет выполненных задач.
    </div>
    <div v-else class="grid grid-cols-7 items-end gap-3">
      <div
        v-for="item in completedByDate"
        :key="item.date"
        class="flex flex-col items-center gap-2"
      >
        <div
          class="w-full rounded-t-lg bg-blue-600"
          :style="{
            height: `${Math.max((item.value / maxValue) * 200, 12)}px`,
          }"
        />
        <p class="text-xs text-slate-500">
          {{ item.date.slice(5) }}
        </p>
      </div>
    </div>
  </section>
</template>
