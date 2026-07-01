import type { Instrumentation } from "next";

/**
 * Next.js instrumentation hook — loads the runtime-appropriate Sentry init and
 * forwards nested React Server Component render errors to Sentry.
 *
 * Two deploy targets, two server-side Sentry strategies:
 *
 *   • Vercel (Node runtime) — loads the full `@sentry/nextjs` server/edge SDK
 *     below (via sentry.server.config / sentry.edge.config).
 *   • Cloudflare (workerd) — does NOT. `@sentry/nextjs` server = `@sentry/node`
 *     + the entire OpenTelemetry Node auto-instrumentation suite (~5.5 MiB),
 *     which (a) can't run on workerd and (b) blows past Cloudflare's 3 MiB
 *     free-plan Worker size limit. There, server-side errors are captured by
 *     `@sentry/cloudflare` wrapping the Worker entry instead (see
 *     `cloudflare/worker.ts`).
 *
 * `NEXT_PUBLIC_BUILD_TARGET` is inlined at build time (set to "cloudflare" only
 * by the `opennextjs-cloudflare build` scripts in package.json). Turbopack then
 * dead-code-eliminates the `@sentry/nextjs` imports out of the Cloudflare
 * bundle entirely — there is deliberately NO top-level `@sentry/nextjs` import
 * in this file, so nothing drags the Node SDK in. Client/browser Sentry
 * (instrumentation-client.ts) is unaffected on both targets.
 */
const IS_CLOUDFLARE = process.env.NEXT_PUBLIC_BUILD_TARGET === "cloudflare";

export async function register() {
  if (IS_CLOUDFLARE) return;
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError: Instrumentation.onRequestError = async (
  ...args
) => {
  if (IS_CLOUDFLARE) return;
  const Sentry = await import("@sentry/nextjs");
  Sentry.captureRequestError(...args);
};
