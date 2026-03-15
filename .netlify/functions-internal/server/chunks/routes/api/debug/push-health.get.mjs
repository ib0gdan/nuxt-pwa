import { d as defineEventHandler, c as createError } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const pushHealth_get = defineEventHandler(async () => {
  {
    throw createError({ statusCode: 404, statusMessage: "Not found" });
  }
});

export { pushHealth_get as default };
//# sourceMappingURL=push-health.get.mjs.map
