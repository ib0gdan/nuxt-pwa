import { useRemindersStore } from "../stores/reminders";

export default defineNuxtPlugin(() => {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data?.type !== "trigger-sync") {
      return;
    }
    const store = useRemindersStore();
    void store.syncIfOnline();
  });
});

