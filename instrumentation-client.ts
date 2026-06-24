import * as Sentry from "@sentry/nextjs";

/**
 * Browser-side Sentry init. Dormant unless NEXT_PUBLIC_SENTRY_DSN is set, so it
 * is a no-op in dev / until observability goes live. Privacy-first defaults
 * (see docs/SENTRY.md): no PII, no Session Replay.
 */
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  // 100% traces in dev for debugging; sampled in prod to control volume/cost.
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  sendDefaultPii: false,
  // Session Replay intentionally NOT enabled (privacy — would need consent
  // gating + privacy-policy coverage first; see docs/SENTRY.md).
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
