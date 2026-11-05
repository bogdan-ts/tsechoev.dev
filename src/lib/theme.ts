export type Theme = "dark" | "light";
let fallbackTheme: Theme | null = null;
export const THEME_EVENT = "portfolio-theme";
export function readTheme(): Theme {
  try {
    const saved = localStorage.getItem("portfolio-theme");
    if (saved === "dark" || saved === "light") return saved;
  } catch {}
  if (fallbackTheme) return fallbackTheme;
  return typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}
export function setTheme(theme: Theme) {
  fallbackTheme = theme;
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem("portfolio-theme", theme);
  } catch {}
  window.dispatchEvent(new Event(THEME_EVENT));
}
export function subscribeTheme(listener: () => void) {
  window.addEventListener(THEME_EVENT, listener);
  window.addEventListener("storage", listener);
  const media =
    typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-color-scheme: light)")
      : null;
  media?.addEventListener("change", listener);
  return () => {
    window.removeEventListener(THEME_EVENT, listener);
    window.removeEventListener("storage", listener);
    media?.removeEventListener("change", listener);
  };
}
