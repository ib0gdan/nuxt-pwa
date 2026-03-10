export const base64ToUint8Array = (base64: string): Uint8Array => {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const normalized = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(normalized);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
};

