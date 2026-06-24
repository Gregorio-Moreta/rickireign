"use client";

import { useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";
import {
  type Theme,
  THEME_EVENT,
  applyTheme,
  readStoredTheme,
  resolvedTheme,
  setTheme,
  systemTheme,
} from "@/lib/theme";

/**
 * Light/dark toggle. The theme is applied before paint by an inline script
 * (see app/layout.tsx); this button reflects and changes it via the theme
 * "store" (a custom event + the OS media query). useSyncExternalStore keeps it
 * in sync, handles SSR (server snapshot = light), and avoids set-state-in-effect.
 */

/** Subscribe to theme changes: explicit toggles + OS preference changes. */
function subscribe(onChange: () => void): () => void {
  window.addEventListener(THEME_EVENT, onChange);
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const onSystem = () => {
    // Follow the OS only until the visitor makes an explicit choice.
    if (readStoredTheme() === null) applyTheme(systemTheme());
    onChange();
  };
  mq.addEventListener("change", onSystem);
  return () => {
    window.removeEventListener(THEME_EVENT, onChange);
    mq.removeEventListener("change", onSystem);
  };
}

const getSnapshot = (): Theme => resolvedTheme();
const getServerSnapshot = (): Theme => "light";

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title="Toggle light/dark"
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded",
        "cursor-pointer text-on-surface",
        "transition-colors duration-200 hover:bg-surface-container",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-luminous-teal",
        "focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
        className,
      )}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

function MoonIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4" />
    </svg>
  );
}
