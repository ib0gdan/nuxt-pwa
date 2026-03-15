export default defineEventHandler(() => {
  throw createError({
    statusCode: 404,
    statusMessage: "Endpoint does not exist. Use /api/push/subscribe",
  });
});
