"use client";

import { useEffect, useState } from "react";
import { GoogleAnalytics } from "@next/third-parties/google";
import { publicEnv } from "@/lib/env";
import { CONSENT_EVENT, readConsent, type ConsentValue } from "@/lib/consent";

/**
 * GA4 loader. Renders the GA script ONLY when a measurement id is configured
 * AND the visitor has granted consent (global opt-in). Reads the consent cookie
 * on mount and re-checks whenever the ConsentBanner broadcasts a change, so
 * accepting loads GA immediately without a reload.
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

  if (!gaId || consent !== "granted") {
    return null;
  }

  return <GoogleAnalytics gaId={gaId} />;
}
