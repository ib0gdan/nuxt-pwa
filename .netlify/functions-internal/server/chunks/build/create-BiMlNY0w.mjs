import { _ as __nuxt_component_0 } from './ReminderForm-B3-LKQOt.mjs';
import { defineComponent, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent } from 'vue/server-renderer';
import { useRouter } from 'vue-router';
import { b as useToasts } from './server.mjs';
import { u as useRemindersStore } from './reminders-CiLr1Zg2.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'pinia';
import 'dexie';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "create",
  __ssrInlineRender: true,
  setup(__props) {
    const store = useRemindersStore();
    const { addToast: push } = useToasts();
    const router = useRouter();
    const onSubmit = async (payload) => {
      await store.create(payload);
      push("Напоминание добавлено", "success");
      await router.push("/");
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ReminderForm = __nuxt_component_0;
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "mx-auto max-w-2xl" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_ReminderForm, { onSubmit }, null, _parent));
      _push(`</section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/create.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=create-BiMlNY0w.mjs.map
