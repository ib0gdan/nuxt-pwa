export default defineEventHandler(() => {
  throw createError({
    statusCode: 405,
    statusMessage: "Method Not Allowed. Use POST /api/push/subscribe",
  });
});
