"use client";

import { useEffect, useState } from "react";
import { GoogleAnalytics } from "@next/third-parties/google";
import { publicEnv } from "@/lib/env";
import {
  CONSENT_EVENT,
  clearAnalyticsCookies,
  readConsent,
  type ConsentValue,
} from "@/lib/consent";

/**
 * Production hosts where GA is allowed to run. Excludes localhost and Vercel
 * preview deploys (rickireign-<hash>.vercel.app), so the GA property only
 * reflects real production traffic.
 */
const PROD_HOSTS = new Set([
  "rickireign.vercel.app",
  "rickireign.com",
  "www.rickireign.com",
  "rickireign.gregoriomoreta4.workers.dev",
]);

/**
 * GA4 loader. Renders the GA script ONLY when a measurement id is configured,
 * the visitor has granted consent (global opt-in), AND we are on a production
 * host. Reads the consent cookie on mount and re-checks whenever the
 * ConsentBanner broadcasts a change, so accepting loads GA without a reload.
 */
export function Analytics() {
  const gaId = publicEnv.gaMeasurementId;
  const [consent, setConsent] = useState<ConsentValue | null>(null);

  useEffect(() => {
    const sync = () => setConsent(readConsent());
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    return () => window.removeEventListener(CONSENT_EVENT, sync);
  }, []);

  // GA's documented kill-switch: when consent is anything but granted, disable
  // tracking. This also stops a GA instance that was already loaded earlier in
  // the session if the visitor later withdraws consent.
  useEffect(() => {
    if (!gaId) return;
    (window as unknown as Record<string, boolean>)[`ga-disable-${gaId}`] =
      consent !== "granted";
    // On refusal/withdrawal, remove any GA cookies so no identifier lingers.
    if (consent === "denied") clearAnalyticsCookies();
  }, [gaId, consent]);

  // Only run GA on a production host (excludes localhost + preview deploys).
  // Computed at render — only reached client-side once consent === "granted".
  const isProdHost =
    typeof window !== "undefined" && PROD_HOSTS.has(window.location.hostname);

  if (!gaId || consent !== "granted" || !isProdHost) {
    return null;
  }

  return <GoogleAnalytics gaId={gaId} />;
}
