import { _ as __nuxt_component_0 } from './SyncStatusBadge-C5_f4RRS.mjs';
import { defineComponent, mergeProps, unref, ref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderComponent } from 'vue/server-renderer';
import { storeToRefs } from 'pinia';
import { u as useRemindersStore, g as getClientId } from './reminders-CiLr1Zg2.mjs';
import { e as useTheme, b as useToasts, c as useState, d as useRuntimeConfig } from './server.mjs';
import 'dexie';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'vue-router';

const base64ToUint8Array = (base64) => {
  const padding = "=".repeat((4 - base64.length % 4) % 4);
  const normalized = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(normalized);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
};
const serializeSubscription = (subscription) => {
  const json = subscription.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
    throw new Error("Invalid subscription payload");
  }
  return {
    endpoint: json.endpoint,
    keys: {
      p256dh: json.keys.p256dh,
      auth: json.keys.auth
    }
  };
};
const requestNotificationsPermission = async () => {
  if (!("Notification" in void 0)) {
    return "denied";
  }
  return Notification.requestPermission();
};
const waitForServiceWorkerReady = async (timeoutMs = 1e4) => {
  const existing = await (void 0).serviceWorker.getRegistration();
  if (existing) {
    return existing;
  }
  return Promise.race([
    (void 0).serviceWorker.ready,
    new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error("Service worker is not ready")),
        timeoutMs
      );
    })
  ]);
};
const ensurePushSubscription = async (vapidKey, userId, subscribeUrl = "/api/push/subscribe", forceRefresh = false) => {
  if (!("serviceWorker" in void 0) || !("PushManager" in void 0)) {
    return null;
  }
  if (!vapidKey) {
    return null;
  }
  const permission = await requestNotificationsPermission();
  if (permission !== "granted") {
    return null;
  }
  const registration = await waitForServiceWorkerReady();
  const existing = await registration.pushManager.getSubscription();
  if (existing && forceRefresh) {
    await existing.unsubscribe();
  }
  const activeSubscription = forceRefresh ? null : await registration.pushManager.getSubscription();
  const subscription = activeSubscription || await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: base64ToUint8Array(vapidKey)
  });
  const payload = serializeSubscription(subscription);
  const response = await fetch(subscribeUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      subscription: payload,
      userId,
      timezoneOffsetMinutes: (/* @__PURE__ */ new Date()).getTimezoneOffset()
    })
  });
  if (!response.ok) {
    throw new Error("Failed to save push subscription");
  }
  return payload;
};
const collectPushClientDiagnostics = async () => {
  {
    return {
      secureContext: false,
      notificationPermission: "unsupported",
      hasServiceWorker: false,
      hasPushManager: false,
      hasSubscription: false,
      serviceWorkerScope: null
    };
  }
};
const usePush = () => {
  const config = useRuntimeConfig();
  const enabled = useState("push-enabled", () => false);
  const loading = ref(false);
  const diagnostics = useState(
    "push-diagnostics",
    () => ({
      secureContext: false,
      notificationPermission: "default",
      hasServiceWorker: false,
      hasPushManager: false,
      hasSubscription: false,
      serviceWorkerScope: null
    })
  );
  const refreshDiagnostics = async () => {
    diagnostics.value = await collectPushClientDiagnostics();
  };
  const syncPushStatus = async () => {
    {
      enabled.value = false;
      return false;
    }
  };
  const enablePush = async () => {
    loading.value = true;
    try {
      const permission = await requestNotificationsPermission();
      if (permission !== "granted") {
        enabled.value = false;
        return false;
      }
      const subscription = await ensurePushSubscription(
        config.public.webPushPublicKey,
        getClientId(),
        "/api/push/subscribe",
        enabled.value
      );
      enabled.value = Boolean(subscription);
      await refreshDiagnostics();
      return enabled.value;
    } catch (error) {
      console.error("Error enabling push:", error);
      enabled.value = false;
      await refreshDiagnostics();
      return false;
    } finally {
      loading.value = false;
    }
  };
  return {
    enabled,
    loading,
    diagnostics,
    enablePush,
    syncPushStatus,
    refreshDiagnostics
  };
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "settings",
  __ssrInlineRender: true,
  setup(__props) {
    const remindersStore = useRemindersStore();
    const { syncStatus } = storeToRefs(remindersStore);
    const {
      enabled,
      loading,
      diagnostics
    } = usePush();
    const { mode } = useTheme();
    useToasts();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_SyncStatusBadge = __nuxt_component_0;
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "mx-auto grid max-w-3xl gap-4" }, _attrs))}><div class="rounded-2xl bg-white p-5 shadow dark:bg-slate-900"><h1 class="mb-4 text-xl font-semibold">Settings</h1><div class="grid gap-3"><div class="flex items-center justify-between rounded-xl bg-slate-100 px-3 py-3 dark:bg-slate-800"><div><p class="text-sm font-medium">Push Notifications</p><p class="text-xs text-slate-500"> Текущий статус: ${ssrInterpolate(unref(enabled) ? "Включены" : "Выключены")}</p><p class="text-xs text-slate-500"> Secure Context: ${ssrInterpolate(unref(diagnostics).secureContext ? "Да" : "Нет")} · Permission: ${ssrInterpolate(unref(diagnostics).notificationPermission)}</p><p class="text-xs text-slate-500"> SW: ${ssrInterpolate(unref(diagnostics).hasServiceWorker ? "Да" : "Нет")} · Push API: ${ssrInterpolate(unref(diagnostics).hasPushManager ? "Да" : "Нет")} · Subscription: ${ssrInterpolate(unref(diagnostics).hasSubscription ? "Да" : "Нет")}</p></div><div class="flex gap-2"><button class="rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-500 disabled:opacity-60"${ssrIncludeBooleanAttr(unref(loading)) ? " disabled" : ""}>${ssrInterpolate(unref(loading) ? "Подключаем..." : unref(enabled) ? "Обновить ключи" : "Включить push")}</button></div></div><div class="flex items-center justify-between rounded-xl bg-slate-100 px-3 py-3 dark:bg-slate-800"><div><p class="text-sm font-medium">Dark Mode</p><p class="text-xs text-slate-500">Текущая тема: ${ssrInterpolate(unref(mode))}</p></div><button class="rounded-lg bg-slate-700 px-3 py-1.5 text-sm text-white hover:bg-slate-600"> Toggle </button></div></div></div>`);
      _push(ssrRenderComponent(_component_SyncStatusBadge, {
        online: unref(syncStatus).online,
        syncing: unref(syncStatus).syncing,
        "pending-count": unref(syncStatus).pendingCount,
        "last-synced-at": unref(syncStatus).lastSyncedAt
      }, null, _parent));
      _push(`</section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/settings.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=settings-BMLqHWVi.mjs.map
