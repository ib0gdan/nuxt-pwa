const KEY = "vibe-sync-client-id";

export const getClientId = (): string => {
  if (!import.meta.client) {
    return "server";
  }

  const existing = localStorage.getItem(KEY);
  if (existing) {
    return existing;
  }

  const generated = crypto.randomUUID();
  localStorage.setItem(KEY, generated);
  return generated;
};

