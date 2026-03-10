import { storeToRefs } from "pinia";
import { useRemindersStore } from "../stores/reminders";

export const useReminders = () => {
  const store = useRemindersStore();
  const refs = storeToRefs(store);

  return {
    ...refs,
    init: store.init,
    refresh: store.refresh,
    create: store.create,
    patch: store.patch,
    remove: store.remove,
    reorder: store.reorder,
    syncIfOnline: store.syncIfOnline,
    setFilter: store.setFilter,
    setSortDirection: store.setSortDirection,
    setOnline: store.setOnline,
  };
};
