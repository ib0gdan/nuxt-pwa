import { useRemindersStore } from "../stores/reminders";

export default defineNuxtPlugin(() => {
  const store = useRemindersStore();

  const update = () => {
    store.setOnline(navigator.onLine);
    if (navigator.onLine) {
      void store.syncIfOnline();
    }
  };

  window.addEventListener("online", update);
  window.addEventListener("offline", update);
  update();
});
