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
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (!url) return;
      // Let modifier/middle clicks use the native anchor (open in a new tab).
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) {
        return;
      }
      event.preventDefault();

      let settled = false;

      // Reliable fallback to the scheduling page: try a new tab, and if a popup
      // blocker stops that, navigate the current tab instead (never blocked).
      const goToCalendly = () => {
        if (settled) return;
        settled = true;
        const opened = window.open(url, "_blank", "noopener,noreferrer");
        if (!opened) window.location.href = url;
      };

      // If the popup overlay hasn't mounted a few seconds after the assets
      // should have loaded, assume the widget was blocked (ad/privacy
      // extension) or hung, and fall back so the visitor still reaches booking.
      // The overlay container appears the moment initPopupWidget runs — even
      // while the iframe loads — so a merely-slow Calendly won't trip this.
      const watchdog = setTimeout(() => {
        if (!settled && !document.querySelector(".calendly-overlay")) goToCalendly();
      }, 3500);

      ensureCalendlyAssets()
        .then(() => {
          if (settled) return;
          if (window.Calendly) {
            settled = true;
            clearTimeout(watchdog);
            window.Calendly.initPopupWidget({ url });
          } else {
            goToCalendly();
          }
        })
        .catch(() => goToCalendly());
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

  // Rendered as a real link to the scheduling page so it works even if our JS
  // (or the Calendly widget) is blocked entirely — progressive enhancement. The
  // click handler upgrades it to the in-page popup when the widget is available.
  return (
    <Button
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      variant={variant}
      className={className}
      onClick={handleClick}
    >
      {children}
    </Button>
  );
}
