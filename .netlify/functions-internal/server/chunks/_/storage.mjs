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
const readJson = async (key, fallback) => {
  try {
    const raw = await store.get(key, { type: "text" });
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw);
  } catch (error) {
    console.error(`Failed to read from blobs: ${key}`, error);
    return fallback;
  }
};
const writeJson = async (key, value) => {
  try {
    await store.set(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to write to blobs: ${key}`, error);
  }
};
const getUserReminders = async (userId) => {
  return readJson(`reminders:${userId}`, []);
};
const setUserReminders = async (userId, reminders) => {
  await writeJson(`reminders:${userId}`, reminders);
};
const getAllReminderEntries = async () => {
  const listed = await store.list({ prefix: "reminders:" });
  const entries = await Promise.all(
    listed.blobs.map(async (blob) => ({
      userId: blob.key.replace("reminders:", ""),
      reminders: await getUserReminders(blob.key.replace("reminders:", ""))
    }))
  );
  return entries;
};
const saveSubscription = async (userId, subscription) => {
  await writeJson(`subscription:${userId}`, subscription);
};
const getSubscription = async (userId) => {
  return readJson(
    `subscription:${userId}`,
    null
  );
};
const getDeliveredIds = async (userId) => {
  return readJson(`delivered:${userId}`, []);
};
const deleteSubscription = async (userId) => {
  await store.set(`subscription:${userId}`, "");
};
const saveDeliveredIds = async (userId, ids) => {
  await writeJson(`delivered:${userId}`, ids);
};

export { getSubscription as a, getDeliveredIds as b, saveSubscription as c, deleteSubscription as d, getUserReminders as e, setUserReminders as f, getAllReminderEntries as g, saveDeliveredIds as s };
//# sourceMappingURL=storage.mjs.map
