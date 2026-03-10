const TAG = "vibe-sync-reminders";

export const registerBackgroundSync = async (): Promise<void> => {
  if (!("serviceWorker" in navigator) || !("SyncManager" in window)) {
    return;
  }

  const registration = await navigator.serviceWorker.ready;
  await registration.sync.register(TAG);
};

export const triggerBackgroundSync = async (): Promise<void> => {
  if (navigator.onLine) {
    const { syncReminders } = await import("../db/reminders");
    await syncReminders();
    return;
  }

  await registerBackgroundSync();
};

export const backgroundSyncTag = TAG;
