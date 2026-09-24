/**
 * Gate + error type for the deliberate Sentry capture probes.
 *
 * WHY THIS EXISTS: observability fails silently. A missing build var ships a
 * disabled SDK with no error, no warning and a green build — which is exactly
 * how Cloudflare ran in production with zero browser error monitoring while
 * every config file looked correct. Nothing short of triggering a real error
 * and finding it in Sentry Issues proves capture works. These probes make that
 * a 30-second check to re-run after any Next / OpenNext / Sentry upgrade, after
 * a build-var change, and after the domain cutover.
 *
 * FAIL-CLOSED: with `SENTRY_CHECK_TOKEN` unset — the normal, resting state —
 * every probe returns a bare 404, indistinguishable from a route that does not
 * exist. `tests/e2e/sentry-check.spec.ts` asserts that gate stays shut. The
 * token is server-only (never `NEXT_PUBLIC_*`) and is meant to be set for the
 * duration of a verification run and then removed.
 *
 * Deliberately dependency-free and Node-API-free: this module is imported by
 * BOTH the Next.js bundle and `cloudflare/worker.ts`, which esbuild bundles for
 * workerd. `node:crypto`'s `timingSafeEqual` is therefore not available.
 */

/**
 * The error the probes throw. A dedicated class so the resulting Sentry issue
 * is trivially identifiable — and so it can be archived or muted in one click
 * once verification is done.
 */
export class SentryCheckError extends Error {
  constructor(surface: string, label: string) {
    super(`SentryCheck: deliberate test error (${surface}) [${label}]`);
    this.name = "SentryCheckError";
  }
}

/**
 * Constant-time-ish string comparison. Compares every character regardless of
 * where the first mismatch is, so a timing signal can't be used to guess the
 * token character by character. Length IS leaked (an unequal length returns
 * immediately) — acceptable for a throwaway probe token that is unset except
 * during a verification run.
 */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * True only when a probe token is configured AND the caller presented it.
 *
 * `expected` is passed in rather than read from `process.env` here because the
 * two callers read it from different places: the Next.js route handler from
 * `process.env`, the Cloudflare Worker from its runtime `env` binding (workerd
 * has no populated `process.env`).
 */
export function isSentryCheckAuthorized(
  provided: string | null | undefined,
  expected: string | null | undefined,
): boolean {
  if (!expected || !provided) return false;
  return safeEqual(provided, expected);
}

/**
 * Clamp a caller-supplied label to a short, boring character set before it goes
 * into an error message (and therefore into a Sentry issue title). Keeps the
 * probe from being used to write arbitrary text into the dashboard.
 */
export function sanitizeLabel(raw: string | null | undefined): string {
  const cleaned = (raw ?? "").replace(/[^a-zA-Z0-9._-]/g, "").slice(0, 48);
  return cleaned || "unlabeled";
}
