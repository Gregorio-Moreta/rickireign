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

// Public Sanity config. The project id and dataset are genuinely public and
// constant (one project, one public dataset — no per-environment difference),
// so we commit safe defaults. This keeps the build deterministic on every
// target even when the NEXT_PUBLIC_* build vars aren't set: Cloudflare Workers
// Builds reads build vars from a separate (easily-missed) section and the
// wrangler.jsonc deploy wipes runtime vars, which broke the deploy once
// layout.tsx pulled the Sanity client into the build graph. An explicit env var
// still overrides. `||` (not `??`) so an empty value also falls back instead of
// producing an invalid empty config.
const SANITY_PROJECT_ID_DEFAULT = "zsuyhr45";
const SANITY_DATASET_DEFAULT = "production";

// Public Turnstile site key + Calendly URL. Both are rendered in the browser
// (genuinely public), so we commit defaults for the same reason as Sanity above:
// Cloudflare Workers Builds reads build vars from a separate, easily-missed
// section, and this keeps the deploy deterministic without one. An env var still
// overrides (e.g. to point a preview at a different widget). Keep real SECRETS
// (Turnstile secret, Brevo key) out of this file — they're server-only.
const TURNSTILE_SITE_KEY_DEFAULT = "0x4AAAAAADnIF3Wg90-SW3H_";
const CALENDLY_URL_DEFAULT = "https://calendly.com/gregorioe-moreta/discovery-call";

export const publicEnv = {
  /** GA4 measurement id (e.g. "G-XXXXXXXXXX"). Undefined disables analytics. */
  gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  /** Sanity project id (public). Falls back to the project's constant default. */
  sanityProjectId:
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || SANITY_PROJECT_ID_DEFAULT,
  /** Sanity dataset (public). Falls back to the constant `production` default. */
  sanityDataset: process.env.NEXT_PUBLIC_SANITY_DATASET || SANITY_DATASET_DEFAULT,
  /** Cloudflare Turnstile site key (public). Falls back to the committed default. */
  turnstileSiteKey:
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || TURNSTILE_SITE_KEY_DEFAULT,
  /** Calendly public scheduling URL. Falls back to the committed default. */
  calendlyUrl: process.env.NEXT_PUBLIC_CALENDLY_URL || CALENDLY_URL_DEFAULT,
} as const;
