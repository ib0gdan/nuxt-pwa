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
      return getStore({ name: "vibe-sync", siteID, token });
    }
    return getStore("vibe-sync");
  } catch {
    return createMemoryStore();
  }
};
const store = createStore();
const readJson = async (key, fallback) => {
  const raw = await store.get(key, { type: "text" });
  if (!raw) {
    return fallback;
  }
  return JSON.parse(raw);
};
const writeJson = async (key, value) => {
  await store.set(key, JSON.stringify(value));
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
