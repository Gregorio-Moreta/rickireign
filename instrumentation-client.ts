import * as Sentry from "@sentry/nextjs";
import { publicEnv } from "@/lib/env";

/**
 * Browser-side Sentry init. Privacy-first defaults (see docs/SENTRY.md): no PII,
 * no Session Replay.
 *
 * The DSN now comes from `publicEnv` (committed default, env var overrides)
 * rather than straight from `process.env.NEXT_PUBLIC_SENTRY_DSN`. That variable
 * is inlined at `next build`, and on Cloudflare the build runs inside Workers
 * Builds where it was never set — so the SDK shipped `enabled: false` and
 * Cloudflare had NO browser error monitoring at all, with nothing in the build
 * or the page to say so. See `lib/env.ts`.
 *
 * Because the DSN is now always present, `enabled` has to carry the weight of
 * deciding WHERE we report. Localhost is excluded so `next dev` and the
 * Playwright E2E runs (which use `next start`, i.e. NODE_ENV=production, on
 * localhost) never spend quota or pollute the production project. Preview
 * deploys DO report — unlike GA, an error on a preview is worth seeing.
 */
const dsn = publicEnv.sentryDsn;

const isLocalhost =
  typeof window !== "undefined" &&
  /^(localhost|127\.0\.0\.1|\[?::1\]?)$/.test(window.location.hostname);

Sentry.init({
  dsn,
  enabled: Boolean(dsn) && !isLocalhost,
  // 100% traces in dev for debugging; sampled in prod to control volume/cost.
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  sendDefaultPii: false,
  // Session Replay intentionally NOT enabled (privacy — would need consent
  // gating + privacy-policy coverage first; see docs/SENTRY.md).
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
