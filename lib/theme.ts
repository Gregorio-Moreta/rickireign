/**
 * Light/dark theme preference. Client-only helpers — guarded for SSR.
 *
 * The applied theme is whichever the visitor explicitly chose (persisted in
 * localStorage), else their OS preference. We toggle a `dark` class on
 * <html> (the dark `--color-*` tokens in globals.css cascade from there) and
 * set `color-scheme` so native UI (scrollbars, form controls) matches. An
 * inline script in the document head applies this before first paint to avoid
 * a flash (see app/layout.tsx).
 */

export const THEME_KEY = "rr-theme";
export const THEME_EVENT = "rr-themechange";

export type Theme = "light" | "dark";

/** Inline, dependency-free script that applies the theme before paint. */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('${THEME_KEY}');var d=t?t==='dark':matchMedia('(prefers-color-scheme: dark)').matches;var r=document.documentElement;r.classList.toggle('dark',d);r.style.colorScheme=d?'dark':'light';}catch(e){}})();`;

export function readStoredTheme(): Theme | null {
  if (typeof localStorage === "undefined") return null;
  const v = localStorage.getItem(THEME_KEY);
  return v === "light" || v === "dark" ? v : null;
}

export function systemTheme(): Theme {
  if (typeof window === "undefined" || !window.matchMedia) return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/** The theme currently in effect (explicit choice, else system). */
export function resolvedTheme(): Theme {
  return readStoredTheme() ?? systemTheme();
}

export function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

/** Persist an explicit choice, apply it, and notify any open toggles. */
export function setTheme(theme: Theme): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // localStorage unavailable (private mode / blocked) — apply for the session.
  }
  applyTheme(theme);
  window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: theme }));
}
