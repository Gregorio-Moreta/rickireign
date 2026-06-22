"use client";

import { reopenConsent } from "@/lib/consent";

/**
 * Footer control that re-opens the consent banner so visitors can change or
 * withdraw their cookie choice at any time (GDPR: withdrawal must be as easy as
 * giving consent). Styled to match the surrounding footer links.
 */
export function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button type="button" onClick={reopenConsent} className={className}>
      Cookie settings
    </button>
  );
}
