import * as Sentry from "@sentry/nextjs";

/**
 * Next.js instrumentation hook. Loads the runtime-appropriate Sentry init
 * (both are dormant unless a DSN is set), and forwards nested React Server
 * Component render errors to Sentry via onRequestError.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
