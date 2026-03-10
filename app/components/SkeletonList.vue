<template>
  <div class="grid gap-3">
    <div
      v-for="n in 4"
      :key="n"
      class="animate-pulse rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
    >
      <div class="mb-3 h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
      <div class="mb-2 h-3 w-full rounded bg-slate-200 dark:bg-slate-800" />
      <div class="h-3 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
    </div>
  </div>
</template>

