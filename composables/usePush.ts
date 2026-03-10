import { ensurePushSubscription, requestNotificationsPermission } from "../services/push/subscribe";
import { getClientId } from "../utils/clientId";

export const usePush = () => {
  const config = useRuntimeConfig();
  const enabled = useState<boolean>("push-enabled", () => false);
  const loading = ref(false);

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
    } finally {
      loading.value = false;
    }
  };

  return {
    enabled,
    loading,
    enablePush,
  };
};
