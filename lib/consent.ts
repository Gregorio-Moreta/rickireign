/**
 * Cookie-backed analytics consent (global opt-in). GA does not load until the
 * visitor explicitly accepts. Client-only helpers — guarded for SSR.
 */

export const CONSENT_COOKIE = "rr-consent";
export const CONSENT_EVENT = "rr-consentchange";
/** Fired when the user asks to review/change their choice (footer "Cookie settings"). */
export const CONSENT_REOPEN_EVENT = "rr-consentreopen";
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

/** Re-open the consent banner so the visitor can change or withdraw consent
 *  (GDPR: withdrawing must be as easy as giving). Wired to the footer link. */
export function reopenConsent(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CONSENT_REOPEN_EVENT));
}

/**
 * Delete Google Analytics cookies (_ga, _ga_*, _gid). Called when consent is
 * refused/withdrawn so no analytics identifier lingers on the visitor's device
 * without a legal basis (DPA best practice). Best-effort across the host and its
 * registrable domain.
 */
export function clearAnalyticsCookies(): void {
  if (typeof document === "undefined") return;
  const names = document.cookie
    .split(";")
    .map((c) => c.split("=")[0].trim())
    .filter((n) => n === "_gid" || n.startsWith("_ga"));
  if (names.length === 0) return;

  const host = window.location.hostname;
  const registrable = host.split(".").slice(-2).join(".");
  const domains = ["", host, `.${host}`, `.${registrable}`];
  const expiry = "Thu, 01 Jan 1970 00:00:00 GMT";

  for (const name of names) {
    for (const domain of domains) {
      document.cookie =
        `${name}=; path=/; expires=${expiry}` +
        (domain ? `; domain=${domain}` : "");
    }
  }
}
