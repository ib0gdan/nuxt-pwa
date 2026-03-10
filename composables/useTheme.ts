export type ThemeMode = "light" | "dark";

export const useTheme = () => {
  const mode = useState<ThemeMode>("theme-mode", () => "light");

  const applyMode = (value: ThemeMode) => {
    mode.value = value;
    if (!import.meta.client) {
      return;
    }
    document.documentElement.classList.toggle("dark", value === "dark");
    localStorage.setItem("vibe-sync-theme", value);
  };

  const initTheme = () => {
    if (!import.meta.client) {
      return;
    }
    const stored = localStorage.getItem("vibe-sync-theme");
    const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    applyMode((stored as ThemeMode) || preferred);
  };

  const toggle = () => {
    applyMode(mode.value === "dark" ? "light" : "dark");
  };

  return { mode, initTheme, toggle, applyMode };
};

