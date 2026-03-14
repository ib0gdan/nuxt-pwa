import {
  ensurePushSubscription,
  requestNotificationsPermission,
} from "../services/push/subscribe";
import { getClientId } from "../utils/clientId";

export const usePush = () => {
  const config = useRuntimeConfig();
  const enabled = useState<boolean>("push-enabled", () => false);
  const loading = ref(false);

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
      );
      enabled.value = Boolean(subscription);
      return enabled.value;
    } catch (error) {
      console.error("Error enabling push:", error);
      enabled.value = false;
      return false;
    } finally {
      loading.value = false;
    }
  };

  return {
    enabled,
    loading,
    enablePush,
    syncPushStatus,
  };
};
