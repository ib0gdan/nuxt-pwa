<script setup lang="ts">
import type { ReminderCategory, ReminderInput } from "../../types/reminder";

const emit = defineEmits<{
  submit: [payload: ReminderInput];
}>();

const form = reactive<ReminderInput>({
  title: "",
  description: "",
  date: "",
  time: "",
  category: "other",
});

const categories: ReminderCategory[] = ["work", "personal", "health", "other"];

const setNextMinute = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 1);

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  form.date = `${year}-${month}-${day}`;

  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  form.time = `${hours}:${minutes}`;
};

const handleSubmit = () => {
  emit("submit", { ...form });
  form.title = "";
  form.description = "";
  form.date = "";
  form.time = "";
  form.category = "other";
};
</script>

<template>
  <form
    class="space-y-4 rounded-2xl bg-white p-5 shadow dark:bg-slate-900"
    @submit.prevent="handleSubmit"
  >
    <h2 class="text-lg font-semibold">Новое напоминание</h2>
    <div class="grid gap-2">
      <label class="text-sm font-medium">Title</label>
      <input
        v-model="form.title"
        class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-blue-500 focus:ring dark:border-slate-700 dark:bg-slate-950"
        required
      />
    </div>
    <div class="grid gap-2">
      <label class="text-sm font-medium">Description</label>
      <textarea
        v-model="form.description"
        class="min-h-[90px] rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-blue-500 focus:ring dark:border-slate-700 dark:bg-slate-950"
      />
    </div>
    <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
      <div class="grid gap-2">
        <label class="text-sm font-medium">Date</label>
        <input
          v-model="form.date"
          type="date"
          class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-blue-500 focus:ring dark:border-slate-700 dark:bg-slate-950"
          required
        />
      </div>
      <div class="grid gap-2">
        <div class="flex items-center justify-between">
          <label class="text-sm font-medium">Time</label>
          <button
            type="button"
            class="text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400"
            @click="setNextMinute"
          >
            +1 мин
          </button>
        </div>
        <input
          v-model="form.time"
          type="time"
          class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-blue-500 focus:ring dark:border-slate-700 dark:bg-slate-950"
          required
        />
      </div>
      <div class="grid gap-2">
        <label class="text-sm font-medium">Category</label>
        <select
          v-model="form.category"
          class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-blue-500 focus:ring dark:border-slate-700 dark:bg-slate-950"
        >
          <option v-for="item in categories" :key="item" :value="item">
            {{ item }}
          </option>
        </select>
      </div>
    </div>
    <button
      type="submit"
      class="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
    >
      Создать
    </button>
  </form>
</template>
