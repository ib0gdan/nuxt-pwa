<script setup lang="ts">
import type { Reminder } from "../../types/reminder";

const props = defineProps<{
  reminders: Reminder[];
}>();

const emit = defineEmits<{
  reorder: [orderedIds: string[]];
  toggle: [id: string, completed: boolean];
  delete: [id: string];
}>();

const draggingId = ref<string | null>(null);

const onDragStart = (event: DragEvent, reminderId: string) => {
  draggingId.value = reminderId;
  event.dataTransfer?.setData("text/plain", reminderId);
  event.dataTransfer?.setDragImage((event.target as HTMLElement) || new Image(), 0, 0);
};

const onDrop = (event: DragEvent, targetId: string) => {
  event.preventDefault();
  const sourceId = draggingId.value || event.dataTransfer?.getData("text/plain");
  if (!sourceId || sourceId === targetId) {
    draggingId.value = null;
    return;
  }

  const ids = props.reminders.map((item) => item.id);
  const sourceIndex = ids.indexOf(sourceId);
  const targetIndex = ids.indexOf(targetId);
  if (sourceIndex < 0 || targetIndex < 0) {
    draggingId.value = null;
    return;
  }

  ids.splice(sourceIndex, 1);
  ids.splice(targetIndex, 0, sourceId);
  draggingId.value = null;
  emit("reorder", ids);
};
</script>

<template>
  <div v-if="!reminders.length" class="rounded-2xl bg-white p-10 text-center text-sm text-slate-500 shadow dark:bg-slate-900">
    Пусто — создайте первое напоминание.
  </div>
  <div v-else class="grid gap-3">
    <div
      v-for="item in reminders"
      :key="item.id"
      @dragover.prevent
      @drop="onDrop($event, item.id)"
      @dragstart="onDragStart($event, item.id)"
    >
      <ReminderCard
        :reminder="item"
        draggable
        @toggle="(id, completed) => emit('toggle', id, completed)"
        @delete="emit('delete', $event)"
      />
    </div>
  </div>
</template>
