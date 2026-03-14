import { defineComponent, reactive, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrInterpolate, ssrRenderList, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ReminderForm",
  __ssrInlineRender: true,
  emits: ["submit"],
  setup(__props, { emit: __emit }) {
    const form = reactive({
      title: "",
      description: "",
      date: "",
      time: "",
      category: "other"
    });
    const categories = ["work", "personal", "health", "other"];
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<form${ssrRenderAttrs(mergeProps({ class: "space-y-4 rounded-2xl bg-white p-5 shadow dark:bg-slate-900" }, _attrs))}><h2 class="text-lg font-semibold">Новое напоминание</h2><div class="grid gap-2"><label class="text-sm font-medium">Title</label><input${ssrRenderAttr("value", unref(form).title)} class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-blue-500 focus:ring dark:border-slate-700 dark:bg-slate-950" required></div><div class="grid gap-2"><label class="text-sm font-medium">Description</label><textarea class="min-h-[90px] rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-blue-500 focus:ring dark:border-slate-700 dark:bg-slate-950">${ssrInterpolate(unref(form).description)}</textarea></div><div class="grid grid-cols-1 gap-3 md:grid-cols-3"><div class="grid gap-2"><label class="text-sm font-medium">Date</label><input${ssrRenderAttr("value", unref(form).date)} type="date" class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-blue-500 focus:ring dark:border-slate-700 dark:bg-slate-950" required></div><div class="grid gap-2"><div class="flex items-center justify-between"><label class="text-sm font-medium">Time</label><button type="button" class="text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400"> +1 мин </button></div><input${ssrRenderAttr("value", unref(form).time)} type="time" class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-blue-500 focus:ring dark:border-slate-700 dark:bg-slate-950" required></div><div class="grid gap-2"><label class="text-sm font-medium">Category</label><select class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-blue-500 focus:ring dark:border-slate-700 dark:bg-slate-950"><!--[-->`);
      ssrRenderList(categories, (item) => {
        _push(`<option${ssrRenderAttr("value", item)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).category) ? ssrLooseContain(unref(form).category, item) : ssrLooseEqual(unref(form).category, item)) ? " selected" : ""}>${ssrInterpolate(item)}</option>`);
      });
      _push(`<!--]--></select></div></div><button type="submit" class="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"> Создать </button></form>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ReminderForm.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_0 = Object.assign(_sfc_main, { __name: "ReminderForm" });

export { __nuxt_component_0 as _ };
//# sourceMappingURL=ReminderForm-B3-LKQOt.mjs.map
