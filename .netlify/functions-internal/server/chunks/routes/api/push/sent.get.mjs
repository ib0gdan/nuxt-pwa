import { d as defineEventHandler, c as createError } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const sent_get = defineEventHandler(() => {
  throw createError({
    statusCode: 404,
    statusMessage: "Endpoint does not exist. Use /api/push/subscribe"
  });
});

export { sent_get as default };
//# sourceMappingURL=sent.get.mjs.map
