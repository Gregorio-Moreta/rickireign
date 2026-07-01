import * as Sentry from "@sentry/cloudflare";
// The OpenNext-generated Worker: a `{ fetch }` default export plus the Durable
// Object classes. Regenerated on every `opennextjs-cloudflare build`; it lives
// under the gitignored `.open-next/` and only exists after a build. This
// wrapper is therefore intentionally NOT type-checked by the app's tsc program
// (see tsconfig `exclude`) — exactly like OpenNext's own worker entry. Wrangler
// (esbuild) resolves and bundles it at build time and strips these types.
import openNextHandler from "../.open-next/worker.js";
// Re-export the Durable Objects OpenNext defines so wrangler can still bind
// them (harmless while no DO cache is configured; keeps us forward-compatible).
export {
  DOQueueHandler,
  DOShardedTagCache,
  BucketCachePurge,
} from "../.open-next/worker.js";

/**
 * Cloudflare Worker entry (wrangler `main`).
 *
 * Wraps the OpenNext handler with `@sentry/cloudflare` so server-side errors on
 * workerd are captured WITHOUT bundling `@sentry/nextjs`'s Node SDK + the
 * OpenTelemetry auto-instrumentation suite (~5.5 MiB — over the 3 MiB free-plan
 * Worker limit, and inert on workerd anyway). The Node SDK is tree-shaken out
 * of the Cloudflare build via `NEXT_PUBLIC_BUILD_TARGET` (see instrumentation.ts).
 *
 * The DSN is read from the Worker runtime `env` (a wrangler.jsonc `var` — the
 * DSN is public, the same value as the build-inlined NEXT_PUBLIC_SENTRY_DSN).
 * Dormant when unset. Privacy-tuned to match the rest of the app: no PII.
 */
interface SentryEnv {
  NEXT_PUBLIC_SENTRY_DSN?: string;
}

export default Sentry.withSentry(
  (env: SentryEnv) => ({
    dsn: env.NEXT_PUBLIC_SENTRY_DSN,
    enabled: Boolean(env.NEXT_PUBLIC_SENTRY_DSN),
    tracesSampleRate: 0.1,
    sendDefaultPii: false,
  }),
  openNextHandler,
);
