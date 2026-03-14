import {
  type PushClientDiagnostics,
  collectPushClientDiagnostics,
  ensurePushSubscription,
  requestNotificationsPermission,
  showLocalTestNotification,
} from "../services/push/subscribe";
import { getClientId } from "../utils/clientId";

export const usePush = () => {
  const config = useRuntimeConfig();
  const enabled = useState<boolean>("push-enabled", () => false);
  const loading = ref(false);
  const diagnostics = useState<PushClientDiagnostics>(
    "push-diagnostics",
    () => ({
      secureContext: false,
      notificationPermission: "default" as NotificationPermission,
      hasServiceWorker: false,
      hasPushManager: false,
      hasSubscription: false,
      serviceWorkerScope: null as string | null,
    }),
  );

  const refreshDiagnostics = async () => {
    diagnostics.value = await collectPushClientDiagnostics();
  };

  const syncPushStatus = async (): Promise<boolean> => {
    if (!import.meta.client) {
      enabled.value = false;
      return false;
    }
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      enabled.value = false;
      return false;
    }
    if (Notification.permission !== "granted") {
      enabled.value = false;
      return false;
    }
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      enabled.value = false;
      return false;
    }
    const subscription = await registration.pushManager.getSubscription();
    enabled.value = Boolean(subscription);
    await refreshDiagnostics();
    return enabled.value;
  };

  const enablePush = async (): Promise<boolean> => {
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
        enabled.value,
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
    showLocalTestNotification,
    syncPushStatus,
    refreshDiagnostics,
  };
};
