import { defineComponent, computed, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrRenderStyle, ssrInterpolate } from 'vue/server-renderer';
import { storeToRefs } from 'pinia';
import { u as useRemindersStore } from './reminders-fL9tzzYx.mjs';
import 'dexie';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "analytics",
  __ssrInlineRender: true,
  setup(__props) {
    const store = useRemindersStore();
    const { reminders } = storeToRefs(store);
    const completedByDate = computed(() => {
      const map = /* @__PURE__ */ new Map();
      for (const reminder of reminders.value) {
        if (!reminder.completed) {
          continue;
        }
        map.set(reminder.date, (map.get(reminder.date) || 0) + 1);
      }
      return [...map.entries()].sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime()).slice(-7).map(([date, value]) => ({ date, value }));
    });
    const maxValue = computed(
      () => Math.max(...completedByDate.value.map((item) => item.value), 1)
    );
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow dark:bg-slate-900" }, _attrs))}><h1 class="mb-5 text-xl font-semibold">Analytics</h1>`);
      if (!completedByDate.value.length) {
        _push(`<div class="rounded-xl bg-slate-100 p-8 text-center text-sm text-slate-500 dark:bg-slate-800"> Пока нет выполненных задач. </div>`);
      } else {
        _push(`<div class="grid grid-cols-7 items-end gap-3"><!--[-->`);
        ssrRenderList(completedByDate.value, (item) => {
          _push(`<div class="flex flex-col items-center gap-2"><div class="w-full rounded-t-lg bg-blue-600" style="${ssrRenderStyle({
            height: `${Math.max(item.value / maxValue.value * 200, 12)}px`
          })}"></div><p class="text-xs text-slate-500">${ssrInterpolate(item.date.slice(5))}</p></div>`);
        });
        _push(`<!--]--></div>`);
      }
      _push(`</section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/analytics.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=analytics-BNqxh94i.mjs.map
