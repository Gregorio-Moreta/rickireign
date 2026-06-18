"use client";

import { useCallback, type MouseEvent } from "react";
import { Button } from "@/components/ui/Button";
import { publicEnv } from "@/lib/env";

/**
 * "Book a Discovery Call" CTA → opens the Calendly scheduling popup.
 *
 * The Calendly widget assets are lazy-loaded on first click (no cost on initial
 * page load). When `NEXT_PUBLIC_CALENDLY_URL` is unset, this degrades to a plain
 * anchor pointing at `fallbackHref` (e.g. the "#connect" section), so the CTA
 * always does something sensible.
 */

declare global {
  interface Window {
    Calendly?: { initPopupWidget: (opts: { url: string }) => void };
  }
}

const WIDGET_CSS = "https://assets.calendly.com/assets/external/widget.css";
const WIDGET_JS = "https://assets.calendly.com/assets/external/widget.js";

function ensureCalendlyAssets(): Promise<void> {
  if (!document.querySelector(`link[href="${WIDGET_CSS}"]`)) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = WIDGET_CSS;
    document.head.appendChild(link);
  }
  if (window.Calendly) return Promise.resolve();

  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${WIDGET_JS}"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = WIDGET_JS;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Calendly script failed to load."));
    document.head.appendChild(script);
  });
}

export function BookingButton({
  children,
  variant = "primary",
  className,
  fallbackHref = "#connect",
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "tertiary";
  className?: string;
  fallbackHref?: string;
}) {
  const url = publicEnv.calendlyUrl;

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      if (!url) return;
      event.preventDefault();
      ensureCalendlyAssets()
        .then(() => window.Calendly?.initPopupWidget({ url }))
        .catch(() => {
          // Asset load failed — fall back to the scheduling page directly.
          window.open(url, "_blank", "noopener,noreferrer");
        });
    },
    [url],
  );

  if (!url) {
    return (
      <Button href={fallbackHref} variant={variant} className={className}>
        {children}
      </Button>
    );
  }

  return (
    <Button variant={variant} className={className} onClick={handleClick}>
      {children}
    </Button>
  );
}
