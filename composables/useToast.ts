// app/composables/useToasts.ts

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  text: string;
  type: ToastType;
}

// Экспортируем функцию, а не константу со стейтом
export const useToasts = () => {
  const toasts = useState<ToastMessage[]>("toasts", () => []);

  const addToast = (text: string, type: ToastType = "info") => {
    toasts.value.push({
      id: Math.random().toString(36).slice(2),
      text,
      type,
    });
  };

  const remove = (id: string) => {
    const index = toasts.value.findIndex((item) => item.id === id);
    if (index >= 0) {
      toasts.value.splice(index, 1);
    }
  };

  return {
    toasts,
    addToast,
    remove,
  };
};
