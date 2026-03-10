import { defineComponent, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate } from 'vue/server-renderer';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "SyncStatusBadge",
  __ssrInlineRender: true,
  props: {
    syncing: { type: Boolean },
    online: { type: Boolean },
    pendingCount: {},
    lastSyncedAt: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "rounded-2xl bg-white p-4 shadow dark:bg-slate-900" }, _attrs))}><p class="text-xs uppercase tracking-wide text-slate-500"> Статус синка </p><p class="mt-1 text-sm font-medium">${ssrInterpolate(__props.online ? "Онлайн" : "Оффлайн")} · ${ssrInterpolate(__props.syncing ? "Синхронизация..." : "Ожидание")}</p><p class="mt-1 text-xs text-slate-500"> В очереди: ${ssrInterpolate(__props.pendingCount)} · Последний sync: ${ssrInterpolate(__props.lastSyncedAt || "—")}</p></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/SyncStatusBadge.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_0 = Object.assign(_sfc_main, { __name: "SyncStatusBadge" });

export { __nuxt_component_0 as _ };
//# sourceMappingURL=SyncStatusBadge-C5_f4RRS.mjs.map
