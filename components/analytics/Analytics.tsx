"use client";

import { GoogleAnalytics } from "@next/third-parties/google";
import { publicEnv } from "@/lib/env";

/**
 * GA4 loader, structured for the Phase 3 consent banner.
 *
 * Renders the GA script ONLY when a measurement id is configured AND consent
 * has been granted. The consent flag is hard-coded `true` here so the wiring
 * is in place; the real check drops in during Phase 3 without touching layout.
 */
export function Analytics() {
  const gaId = publicEnv.gaMeasurementId;

  // Phase 3: gate on consent banner (replace with the real consent state).
  const consentGranted = true;

  if (!gaId || !consentGranted) {
    return null;
  }

  return <GoogleAnalytics gaId={gaId} />;
}
