import { d as defineEventHandler, c as createError } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const trigger_get = defineEventHandler(async () => {
  {
    throw createError({ statusCode: 404, statusMessage: "Not found" });
  }
});

export { trigger_get as default };
//# sourceMappingURL=trigger.get.mjs.map
