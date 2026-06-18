/**
 * Cookie-backed analytics consent (global opt-in). GA does not load until the
 * visitor explicitly accepts. Client-only helpers — guarded for SSR.
 */

export const CONSENT_COOKIE = "rr-consent";
export const CONSENT_EVENT = "rr-consentchange";
export const CONSENT_MAX_AGE = 60 * 60 * 24 * 180; // 180 days

export type ConsentValue = "granted" | "denied";

export function readConsent(): ConsentValue | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${CONSENT_COOKIE}=(granted|denied)`),
  );
  return (match?.[1] as ConsentValue | undefined) ?? null;
}

export function writeConsent(value: ConsentValue): void {
  if (typeof document === "undefined") return;
  document.cookie = `${CONSENT_COOKIE}=${value}; path=/; max-age=${CONSENT_MAX_AGE}; samesite=lax`;
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
}
