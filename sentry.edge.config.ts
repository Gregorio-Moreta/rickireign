import * as Sentry from "@sentry/nextjs";

/** Edge-runtime Sentry init (middleware / edge routes). Dormant unless set. */
const dsn = process.env.SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  sendDefaultPii: false,
});
