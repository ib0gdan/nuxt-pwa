import { d as defineEventHandler, c as createError } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const subscribe_get = defineEventHandler(() => {
  throw createError({
    statusCode: 405,
    statusMessage: "Method Not Allowed. Use POST /api/push/subscribe"
  });
});

export { subscribe_get as default };
//# sourceMappingURL=subscribe.get.mjs.map
