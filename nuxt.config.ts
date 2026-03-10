// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@pinia/nuxt", "@nuxtjs/tailwindcss", "@vite-pwa/nuxt"],
  css: ["~/assets/css/main.css"],
  nitro: {
    preset: "netlify",
  },
  runtimeConfig: {
    webPushPrivateKey: process.env.WEB_PUSH_PRIVATE_KEY,
    webPushPublicKey: process.env.NUXT_PUBLIC_WEB_PUSH_PUBLIC_KEY,
    webPushSubject:
      process.env.WEB_PUSH_SUBJECT || "mailto:admin@vibe-sync.app",
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "/api",
      webPushPublicKey: process.env.NUXT_PUBLIC_WEB_PUSH_PUBLIC_KEY || "",
    },
  },
  pwa: {
    registerType: "autoUpdate",
    strategies: "injectManifest",
    filename: "sw.js",
    manifest: {
      name: "Vibe Sync",
      short_name: "VibeSync",
      description: "Offline-first reminders with push notifications",
      theme_color: "#0f172a",
      background_color: "#020617",
      display: "standalone",
      icons: [
        {
          src: "/icons/icon-192.svg",
          sizes: "192x192",
          type: "image/svg+xml",
        },
        {
          src: "/icons/icon-512.svg",
          sizes: "512x512",
          type: "image/svg+xml",
        },
        {
          src: "/icons/icon-512-maskable.svg",
          sizes: "512x512",
          type: "image/svg+xml",
          purpose: "maskable",
        },
      ],
    },
    injectManifest: {
      globPatterns: ["**/*.{js,css,html,png,svg,ico,json,txt}"],
    },
    devOptions: {
      enabled: true,
      suppressWarnings: true,
      type: "module",
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 60,
    },
  },
} as unknown as Parameters<typeof defineNuxtConfig>[0]);
