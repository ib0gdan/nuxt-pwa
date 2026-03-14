import { getStore } from "@netlify/blobs";
import type { PushSubscriptionPayload } from "../../types/push";
import type { Reminder } from "../../types/reminder";

type ListedBlob = { key: string };
type BlobStore = {
  get: (key: string, options?: { type?: "text" }) => Promise<string | null>;
  set: (key: string, value: string) => Promise<void>;
  list: (options?: { prefix?: string }) => Promise<{ blobs: ListedBlob[] }>;
};

const createMemoryStore = (): BlobStore => {
  const map = new Map<string, string>();
  return {
    async get(key) {
      return map.get(key) ?? null;
    },
    async set(key, value) {
      map.set(key, value);
    },
    async list(options) {
      const prefix = options?.prefix ?? "";
      const blobs = [...map.keys()]
        .filter((key) => key.startsWith(prefix))
        .map((key) => ({ key }));
      return { blobs };
    },
  };
};

const createStore = (): BlobStore => {
  const siteID = process.env.NETLIFY_SITE_ID;
  const token =
    process.env.NETLIFY_API_TOKEN ||
    process.env.NETLIFY_AUTH_TOKEN ||
    process.env.NETLIFY_TOKEN;

  try {
    if (siteID && token) {
      return getStore({
        name: "vibe-sync",
        siteID,
        token,
        fetch: (url, init) =>
          fetch(url, { ...init, signal: AbortSignal.timeout(5000) }),
      }) as unknown as BlobStore;
    }
    return getStore("vibe-sync") as unknown as BlobStore;
  } catch {
    return createMemoryStore();
  }
};

const store = createStore();
const fallbackStore = createMemoryStore();

const readJson = async <T>(key: string, fallback: T): Promise<T> => {
  try {
    const raw = await store.get(key, { type: "text" });
    if (!raw) {
      const local = await fallbackStore.get(key, { type: "text" });
      if (!local) {
        return fallback;
      }
      return JSON.parse(local) as T;
    }
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`Failed to read from blobs: ${key}`, error);
    const local = await fallbackStore.get(key, { type: "text" });
    if (!local) {
      return fallback;
    }
    return JSON.parse(local) as T;
  }
};

const writeJson = async <T>(key: string, value: T): Promise<void> => {
  const serialized = JSON.stringify(value);
  try {
    await store.set(key, serialized);
  } catch (error) {
    console.error(`Failed to write to blobs: ${key}`, error);
    await fallbackStore.set(key, serialized);
    if (process.env.NODE_ENV === "production") {
      throw error;
    }
  }
};

export const getUserReminders = async (userId: string): Promise<Reminder[]> => {
  return readJson<Reminder[]>(`reminders:${userId}`, []);
};

export const setUserReminders = async (
  userId: string,
  reminders: Reminder[],
): Promise<void> => {
  await writeJson(`reminders:${userId}`, reminders);
};

export const getAllReminderEntries = async (): Promise<
  Array<{ userId: string; reminders: Reminder[] }>
> => {
  const listed = await store.list({ prefix: "reminders:" });
  const entries = await Promise.all(
    listed.blobs.map(async (blob) => ({
      userId: blob.key.replace("reminders:", ""),
      reminders: await getUserReminders(blob.key.replace("reminders:", "")),
    })),
  );
  return entries;
};

export const saveSubscription = async (
  userId: string,
  subscription: PushSubscriptionPayload,
): Promise<void> => {
  await writeJson(`subscription:${userId}`, subscription);
};

export const getSubscription = async (
  userId: string,
): Promise<PushSubscriptionPayload | null> => {
  return readJson<PushSubscriptionPayload | null>(
    `subscription:${userId}`,
    null,
  );
};

export const getDeliveredIds = async (userId: string): Promise<string[]> => {
  return readJson<string[]>(`delivered:${userId}`, []);
};

export const deleteSubscription = async (userId: string): Promise<void> => {
  const results = await Promise.allSettled([
    store.set(`subscription:${userId}`, ""),
    fallbackStore.set(`subscription:${userId}`, ""),
  ]);
  if (
    process.env.NODE_ENV === "production" &&
    results[0].status === "rejected"
  ) {
    throw results[0].reason;
  }
};

export const saveDeliveredIds = async (
  userId: string,
  ids: string[],
): Promise<void> => {
  await writeJson(`delivered:${userId}`, ids);
};
