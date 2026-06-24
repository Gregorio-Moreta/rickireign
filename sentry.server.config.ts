import * as Sentry from "@sentry/nextjs";

/** Node-runtime Sentry init. Dormant unless a DSN is set. Falls back to the
 *  public DSN so a single (build-inlined) NEXT_PUBLIC_SENTRY_DSN covers client
 *  + server — simplifies the Cloudflare build-var setup. */
const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  sendDefaultPii: false,
  // Server-only: capturing locals aids debugging and never reaches the client.
  includeLocalVariables: true,
});
