import * as Sentry from "@sentry/nextjs";

/** Edge-runtime Sentry init. Dormant unless a DSN is set; falls back to the
 *  public DSN (see sentry.server.config). */
const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  sendDefaultPii: false,
});
