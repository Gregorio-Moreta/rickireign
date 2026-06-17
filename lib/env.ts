/**
 * Typed, client-safe access to PUBLIC environment variables.
 *
 * SECURITY: only `NEXT_PUBLIC_*` values may live here — anything imported into a
 * client component is shipped to the browser. Server-only secrets (Brevo key,
 * Turnstile secret, Sanity read token) must NEVER be read in this file.
 *
 * Next.js statically inlines `process.env.NEXT_PUBLIC_*`, so each must be
 * referenced by its full literal name (no dynamic access).
 */

export const publicEnv = {
  /** GA4 measurement id (e.g. "G-XXXXXXXXXX"). Undefined disables analytics. */
  gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
} as const;
