import * as Sentry from "@sentry/cloudflare";
// The OpenNext-generated Worker: a `{ fetch }` default export plus the Durable
// Object classes. Regenerated on every `opennextjs-cloudflare build`; it lives
// under the gitignored `.open-next/` and only exists after a build. This
// wrapper is therefore intentionally NOT type-checked by the app's tsc program
// (see tsconfig `exclude`) — exactly like OpenNext's own worker entry. Wrangler
// (esbuild) resolves and bundles it at build time and strips these types.
import openNextHandler from "../.open-next/worker.js";
import {
  SentryCheckError,
  isSentryCheckAuthorized,
  sanitizeLabel,
} from "../lib/sentry-check";
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
 * DSN is public). Dormant when unset. Privacy-tuned to match the rest of the
 * app: no PII, and no request bodies (see `maxRequestBodySize` below).
 */
interface WorkerEnv {
  NEXT_PUBLIC_SENTRY_DSN?: string;
  SENTRY_RELEASE?: string;
  /** Set only for a verification run; absent the probe below is a 404. */
  SENTRY_CHECK_TOKEN?: string;
  /** Bound in wrangler.jsonc — gives every deploy a distinct Sentry release. */
  CF_VERSION_METADATA?: { id: string };
}

/** Minimal structural types — `@cloudflare/workers-types` is not a dependency. */
interface ExecutionContextLike {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}
type FetchHandler = (
  request: Request,
  env: WorkerEnv,
  ctx: ExecutionContextLike,
) => Promise<Response>;

const openNextFetch = (openNextHandler as unknown as { fetch: FetchHandler })
  .fetch;

/**
 * The Sentry tunnel path. MUST stay in sync with `tunnelRoute` in
 * `next.config.ts` — the two are independent literals by necessity (this file
 * is bundled by wrangler, not by Next).
 */
const TUNNEL_PATH = "/monitoring";
/** Worker-level probe. See `lib/sentry-check.ts`. */
const WORKER_PROBE_PATH = "/api/sentry-check/worker";

const handler = {
  async fetch(
    request: Request,
    env: WorkerEnv,
    ctx: ExecutionContextLike,
  ): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname.replace(/\/+$/, "") || "/";

    // Deliberate Worker-level error, to prove @sentry/cloudflare captures.
    //
    // This throws BEFORE delegating to OpenNext, which is the whole point: a
    // throw from inside Next is swallowed by OpenNext's own catch and never
    // reaches withSentry (see app/api/sentry-check/route.ts). Only an error
    // raised out here exercises withSentry's own capture path. Fail-closed:
    // without SENTRY_CHECK_TOKEN this falls through to OpenNext, which 404s.
    if (
      pathname === WORKER_PROBE_PATH &&
      request.method === "POST" &&
      isSentryCheckAuthorized(
        request.headers.get("x-sentry-check-token"),
        env.SENTRY_CHECK_TOKEN,
      )
    ) {
      throw new SentryCheckError(
        "cloudflare-worker",
        sanitizeLabel(url.searchParams.get("label")),
      );
    }

    // Guard the Sentry tunnel against a malformed request.
    //
    // OpenNext's `has` matcher (@opennextjs/aws routing/matcher.js) tests the
    // query condition with `new RegExp(value).test(query[key] ?? "")` and —
    // unlike its own header/cookie branches, and unlike Next's `matchHas` —
    // performs NO presence check. Sentry writes its conditions as `\d*`
    // (zero-or-more), so an ABSENT `o`/`p` still matches. The rewrite then
    // compiles with empty params, path-to-regexp throws, and OpenNext renders
    // its /500 — giving Cloudflare a free unauthenticated 5xx on a path that
    // 404s correctly on Vercel. Left alone it would also fire the console
    // capture below on every drive-by request to /monitoring.
    if (pathname === TUNNEL_PATH) {
      const orgId = url.searchParams.get("o");
      const projectId = url.searchParams.get("p");
      if (!orgId || !projectId) {
        return new Response("Not Found", { status: 404 });
      }
    }

    return openNextFetch(request, env, ctx);
  },
};

export default Sentry.withSentry(
  (env: WorkerEnv) => ({
    dsn: env.NEXT_PUBLIC_SENTRY_DSN,
    enabled: Boolean(env.NEXT_PUBLIC_SENTRY_DSN),
    // Distinguishes Cloudflare events from the Vercel ones — both targets serve
    // the same app and would otherwise be indistinguishable in the dashboard.
    environment: "cloudflare",
    // Without a release, Worker frames can never be resolved. CF_VERSION_METADATA
    // gives every deploy a distinct id for free (bound in wrangler.jsonc).
    release: env.SENTRY_RELEASE ?? env.CF_VERSION_METADATA?.id,
    tracesSampleRate: 0.1,
    sendDefaultPii: false,
    integrations: [
      // THE reason CF server monitoring was near-zero. OpenNext catches every
      // Next-level error and logs it (`error("NextJS request failed.", e)`)
      // instead of rethrowing, so withSentry only ever sees a finished 500
      // Response and captures nothing. Promoting Worker console.error to a real
      // event is what makes server-side capture work at all here — it costs no
      // bundle weight, unlike pulling the Node SDK back in.
      Sentry.captureConsoleIntegration({ levels: ["error"] }),
      // `sendDefaultPii: false` suppresses cookies and headers but NOT request
      // bodies — @sentry/cloudflare defaults maxRequestBodySize to "medium", so
      // /api/newsletter and /api/contact would attach submitted email addresses
      // and free-text messages. Off, to match the site's privacy posture.
      Sentry.httpServerIntegration({ maxRequestBodySize: "none" }),
    ],
  }),
  handler,
);
