<script setup lang="ts">
import { useToasts } from "~~/composables/useToast";

const { toasts, remove } = useToasts();

const colorByType: Record<string, string> = {
  success: "bg-emerald-600",
  error: "bg-rose-600",
  info: "bg-slate-800",
};
</script>

<template>
  <div class="fixed bottom-4 right-4 z-50 flex w-80 flex-col gap-2">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="flex items-center justify-between rounded-xl px-3 py-3 text-sm text-white shadow-lg"
        :class="colorByType[toast.type]"
      >
        <p class="pr-2">
          {{ toast.text }}
        </p>
        <button
          class="rounded px-2 py-1 text-xs hover:bg-white/20"
          @click="remove(toast.id)"
        >
          Закрыть
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
