import { getStore } from '@netlify/blobs';

const createMemoryStore = () => {
  const map = /* @__PURE__ */ new Map();
  return {
    async get(key) {
      var _a;
      return (_a = map.get(key)) != null ? _a : null;
    },
    async set(key, value) {
      map.set(key, value);
    },
    async list(options) {
      var _a;
      const prefix = (_a = options == null ? void 0 : options.prefix) != null ? _a : "";
      const blobs = [...map.keys()].filter((key) => key.startsWith(prefix)).map((key) => ({ key }));
      return { blobs };
    }
  };
};
const createStore = () => {
  const siteID = process.env.NETLIFY_SITE_ID;
  const token = process.env.NETLIFY_API_TOKEN || process.env.NETLIFY_AUTH_TOKEN || process.env.NETLIFY_TOKEN;
  try {
    if (siteID && token) {
      return getStore({
        name: "vibe-sync",
        siteID,
        token,
        fetch: (url, init) => fetch(url, { ...init, signal: AbortSignal.timeout(5e3) })
      });
    }
    return getStore("vibe-sync");
  } catch {
    return createMemoryStore();
  }
};
const store = createStore();
const fallbackStore = createMemoryStore();
const readJson = async (key, fallback) => {
  try {
    const raw = await store.get(key, { type: "text" });
    if (!raw) {
      const local = await fallbackStore.get(key, { type: "text" });
      if (!local) {
        return fallback;
      }
      return JSON.parse(local);
    }
    return JSON.parse(raw);
  } catch (error) {
    console.error(`Failed to read from blobs: ${key}`, error);
    const local = await fallbackStore.get(key, { type: "text" });
    if (!local) {
      return fallback;
    }
    return JSON.parse(local);
  }
};
const writeJson = async (key, value) => {
  const serialized = JSON.stringify(value);
  try {
    await store.set(key, serialized);
  } catch (error) {
    console.error(`Failed to write to blobs: ${key}`, error);
    await fallbackStore.set(key, serialized);
    {
      throw error;
    }
  }
};
const getUserReminders = async (userId) => {
  return readJson(`reminders:${userId}`, []);
};
const setUserReminders = async (userId, reminders) => {
  await writeJson(`reminders:${userId}`, reminders);
};
const saveSubscription = async (userId, subscription) => {
  await writeJson(`subscription:${userId}`, subscription);
};

export { setUserReminders as a, getUserReminders as g, saveSubscription as s };
//# sourceMappingURL=storage.mjs.map
