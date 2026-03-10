<script setup lang="ts">
import { onMounted } from "vue";
import { useTheme } from "../composables/useTheme";

const { initTheme } = useTheme();

onMounted(() => {
  initTheme();
});
</script>

<template>
  <div
    class="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100"
  >
    <NuxtRouteAnnouncer />
    <div class="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6">
      <header class="mb-6 flex flex-wrap items-center justify-between gap-3">
        <NuxtLink
          to="/"
          class="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400"
        >
          Vibe Sync
        </NuxtLink>
        <nav class="flex items-center gap-2 text-sm">
          <NuxtLink
            to="/"
            class="rounded-xl px-3 py-2 hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            Dashboard
          </NuxtLink>
          <NuxtLink
            to="/create"
            class="rounded-xl px-3 py-2 hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            Create
          </NuxtLink>
          <NuxtLink
            to="/analytics"
            class="rounded-xl px-3 py-2 hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            Analytics
          </NuxtLink>
          <NuxtLink
            to="/settings"
            class="rounded-xl px-3 py-2 hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            Settings
          </NuxtLink>
        </nav>
      </header>
      <main class="flex-1">
        <NuxtPage />
      </main>
    </div>
    <ToastContainer />
  </div>
</template>
