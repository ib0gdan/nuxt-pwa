import { onMounted, onUnmounted, ref } from "vue";

export const useOnline = () => {
  const online = ref<boolean>(import.meta.client ? navigator.onLine : true);

  const update = () => {
    online.value = navigator.onLine;
  };

  onMounted(() => {
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
  });

  onUnmounted(() => {
    window.removeEventListener("online", update);
    window.removeEventListener("offline", update);
  });

  return { online };
};

