"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CONSENT_EVENT, readConsent, writeConsent } from "@/lib/consent";

/**
 * Cookie consent banner (global opt-in). Shows until the visitor chooses; the
 * choice is stored in a cookie and broadcast so <Analytics> can load or stay
 * off. GA never loads before "Accept" (see lib/consent + Analytics).
 *
 * Renders nothing on the server / first paint to avoid a hydration mismatch
 * (consent lives in a cookie read on the client), then appears if unset.
 */
export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const sync = () => setVisible(readConsent() === null);
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    return () => window.removeEventListener(CONSENT_EVENT, sync);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="layer-banner fixed inset-x-0 bottom-0 p-4 sm:p-6"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-4 rounded-lg border border-primary-container/10 bg-surface-container-lowest p-5 shadow-ambient sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <p className="font-sans text-body-md text-on-surface-variant text-pretty">
          We use cookies to understand how the site is used. Analytics stays off
          until you accept. See our{" "}
          <Link
            href="/privacy"
            className="text-secondary underline underline-offset-4 hover:text-luminous-teal"
          >
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => writeConsent("denied")}
            className="px-5 py-2.5"
          >
            Decline
          </Button>
          <Button
            variant="primary"
            onClick={() => writeConsent("granted")}
            className="px-5 py-2.5"
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
