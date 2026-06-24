import * as Sentry from "@sentry/nextjs";

/** Node-runtime Sentry init. Dormant unless SENTRY_DSN is set. */
const dsn = process.env.SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  sendDefaultPii: false,
  // Server-only: capturing locals aids debugging and never reaches the client.
  includeLocalVariables: true,
});
