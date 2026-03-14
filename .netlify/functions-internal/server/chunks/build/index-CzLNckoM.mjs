import { defineComponent, mergeProps, unref, ref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrRenderClass, ssrInterpolate, ssrRenderAttr, ssrRenderComponent } from 'vue/server-renderer';
import { b as useToasts, _ as _export_sfc } from './server.mjs';
import { _ as __nuxt_component_0$2 } from './SyncStatusBadge-C5_f4RRS.mjs';
import { _ as __nuxt_component_0$3 } from './ReminderForm-B3-LKQOt.mjs';
import { storeToRefs } from 'pinia';
import { u as useRemindersStore } from './reminders-DItiFgkI.mjs';
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
import 'vue-router';
import 'dexie';

const _sfc_main$3 = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "grid gap-3" }, _attrs))}><!--[-->`);
  ssrRenderList(4, (n) => {
    _push(`<div class="animate-pulse rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><div class="mb-3 h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-800"></div><div class="mb-2 h-3 w-full rounded bg-slate-200 dark:bg-slate-800"></div><div class="h-3 w-2/3 rounded bg-slate-200 dark:bg-slate-800"></div></div>`);
  });
  _push(`<!--]--></div>`);
}
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/SkeletonList.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const __nuxt_component_0$1 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$3, [["ssrRender", _sfc_ssrRender]]), { __name: "SkeletonList" });
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "ReminderCard",
  __ssrInlineRender: true,
  props: {
    reminder: {},
    draggable: { type: Boolean }
  },
  emits: ["toggle", "delete"],
  setup(__props, { emit: __emit }) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<article${ssrRenderAttrs(mergeProps({
        class: "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900",
        draggable: __props.draggable,
        "data-id": __props.reminder.id
      }, _attrs))}><div class="mb-2 flex items-center justify-between gap-2"><h3 class="${ssrRenderClass([{ "line-through opacity-60": __props.reminder.completed }, "text-base font-semibold"])}">${ssrInterpolate(__props.reminder.title)}</h3><span class="rounded-lg bg-slate-100 px-2 py-1 text-xs dark:bg-slate-800">${ssrInterpolate(__props.reminder.category)}</span></div><p class="mb-3 text-sm text-slate-600 dark:text-slate-300">${ssrInterpolate(__props.reminder.description || "Без описания")}</p><p class="mb-4 text-xs text-slate-500">${ssrInterpolate(__props.reminder.date)} · ${ssrInterpolate(__props.reminder.time)}</p><div class="flex items-center gap-2"><button class="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500">${ssrInterpolate(__props.reminder.completed ? "Сделать активным" : "Выполнено")}</button><button class="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-500"> Удалить </button></div></article>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ReminderCard.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_0 = Object.assign(_sfc_main$2, { __name: "ReminderCard" });
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "ReminderList",
  __ssrInlineRender: true,
  props: {
    reminders: {}
  },
  emits: ["reorder", "toggle", "delete"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    ref(null);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ReminderCard = __nuxt_component_0;
      if (!__props.reminders.length) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "rounded-2xl bg-white p-10 text-center text-sm text-slate-500 shadow dark:bg-slate-900" }, _attrs))}> Пусто — создайте первое напоминание. </div>`);
      } else {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "grid gap-3" }, _attrs))}><!--[-->`);
        ssrRenderList(__props.reminders, (item) => {
          _push(`<div>`);
          _push(ssrRenderComponent(_component_ReminderCard, {
            reminder: item,
            draggable: "",
            onToggle: (id, completed) => emit("toggle", id, completed),
            onDelete: ($event) => emit("delete", $event)
          }, null, _parent));
          _push(`</div>`);
        });
        _push(`<!--]--></div>`);
      }
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ReminderList.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_1 = Object.assign(_sfc_main$1, { __name: "ReminderList" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const store = useRemindersStore();
    const { filteredReminders, loading, error, filter, sortDirection, syncStatus } = storeToRefs(store);
    const { addToast: push } = useToasts();
    const availableFilters = ["all", "active", "completed"];
    const createNew = async (payload) => {
      await store.create(payload);
      push("Напоминание создано", "success");
    };
    const toggleCompleted = async (id, completed) => {
      await store.patch(id, { completed });
      push("Статус обновлён", "info");
    };
    const removeReminder = async (id) => {
      await store.remove(id);
      push("Напоминание удалено", "success");
    };
    const reorderReminders = async (orderedIds) => {
      await store.reorder(orderedIds);
      push("Порядок обновлён", "info");
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_SkeletonList = __nuxt_component_0$1;
      const _component_ReminderList = __nuxt_component_1;
      const _component_SyncStatusBadge = __nuxt_component_0$2;
      const _component_ReminderForm = __nuxt_component_0$3;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "grid gap-6 lg:grid-cols-[1fr_360px]" }, _attrs))}><section class="space-y-4"><div class="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow dark:bg-slate-900"><div class="flex flex-wrap items-center gap-2"><!--[-->`);
      ssrRenderList(availableFilters, (item) => {
        _push(`<button class="${ssrRenderClass([
          unref(filter) === item ? "bg-blue-600 text-white" : "bg-slate-200 dark:bg-slate-800",
          "rounded-xl px-3 py-1.5 text-sm"
        ])}">${ssrInterpolate(item)}</button>`);
      });
      _push(`<!--]--></div><select class="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-950"${ssrRenderAttr("value", unref(sortDirection))}><option value="asc">Сначала ранние</option><option value="desc">Сначала поздние</option></select></div>`);
      if (unref(error)) {
        _push(`<div class="rounded-2xl bg-red-50 p-4 text-red-600 dark:bg-red-900/20">${ssrInterpolate(unref(error))}</div>`);
      } else if (unref(loading)) {
        _push(ssrRenderComponent(_component_SkeletonList, null, null, _parent));
      } else {
        _push(ssrRenderComponent(_component_ReminderList, {
          reminders: unref(filteredReminders),
          onToggle: toggleCompleted,
          onDelete: removeReminder,
          onReorder: reorderReminders
        }, null, _parent));
      }
      _push(`</section><aside class="space-y-4">`);
      _push(ssrRenderComponent(_component_SyncStatusBadge, {
        online: unref(syncStatus).online,
        syncing: unref(syncStatus).syncing,
        "pending-count": unref(syncStatus).pendingCount,
        "last-synced-at": unref(syncStatus).lastSyncedAt
      }, null, _parent));
      _push(ssrRenderComponent(_component_ReminderForm, { onSubmit: createNew }, null, _parent));
      _push(`</aside></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-CzLNckoM.mjs.map
