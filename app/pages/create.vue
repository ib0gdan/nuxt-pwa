<script setup lang="ts">
import { useRouter } from "vue-router";
import type { ReminderInput } from "../../types/reminder";
import { useToasts } from "../../composables/useToast";
import { useRemindersStore } from "../../stores/reminders";

const store = useRemindersStore();
const { addToast: push } = useToasts();
const router = useRouter();

const onSubmit = async (payload: ReminderInput) => {
  await store.create(payload);
  push("Напоминание добавлено", "success");
  await router.push("/");
};
</script>

<template>
  <section class="mx-auto max-w-2xl">
    <ReminderForm @submit="onSubmit" />
  </section>
</template>
