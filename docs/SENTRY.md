# Sentry

**Status: INSTALLED + live (dormant without a DSN).** `@sentry/nextjs` v10 lands on both deploy targets; the **Cloudflare** target additionally uses `@sentry/cloudflare` (see the split below). The historical "deferred plan" is kept at the bottom for context.

---

## Current architecture (implemented — branch `007-cf-sentry-bundle-fix`)

### Why a dual-SDK split exists

`@sentry/nextjs`'s **server** SDK is `@sentry/node` + the full **OpenTelemetry auto-instrumentation suite** (http, express, redis, postgres, mysql, mongo, graphql, vercel-ai, …). In this app that compiles to **~5.5 MiB raw** across two ~2.6 MiB chunks (an SSR copy + a Node copy). Gzipped, it pushed the OpenNext Cloudflare **Worker to ~3.27 MiB — over Cloudflare's 3 MiB free-plan Worker size limit** (measured after gzip; free = 3 MiB, paid = 10 MiB). Every `006`/`main` Cloudflare deploy since Sentry was added **failed** `wrangler` size validation, freezing CF prod on a pre-migration commit (its `/journal` then 500'd against the migrated tag data). Vercel (Node) was unaffected — no size limit there.

None of those Node instrumentations even **run** on Cloudflare's workerd (there's no express/redis/pg in the Worker), so on CF they were pure dead weight.

### The split

| Surface | SDK | Notes |
|---|---|---|
| **Client / browser** (both targets) | `@sentry/nextjs` (`instrumentation-client.ts`) | Unchanged. Browser error capture everywhere. |
| **Server on Vercel** (Node) | `@sentry/nextjs` (`sentry.server.config.ts` / `sentry.edge.config.ts` via `instrumentation.ts`) | Full server SDK — Node has no size limit. |
| **Server on Cloudflare** (workerd) | `@sentry/cloudflare` (`cloudflare/worker.ts`) | Workers-native, tiny, no OTel Node suite. Wraps the OpenNext Worker's fetch with `Sentry.withSentry`. |

### How the Node SDK is kept out of the Cloudflare bundle

- **`NEXT_PUBLIC_BUILD_TARGET=cloudflare`** is set only on the `opennextjs-cloudflare build` step (package.json `deploy`/`preview`/`upload`). Next inlines it, so it's a build-time constant that Turbopack uses for dead-code elimination.
- **`instrumentation.ts`** has **no top-level `@sentry/nextjs` import**. `register()` and `onRequestError` early-`return` when `NEXT_PUBLIC_BUILD_TARGET === "cloudflare"`, so the `@sentry/nextjs` (`sentry.server.config`) imports become unreachable and are tree-shaken out of the CF build. On Vercel the flag is unset → the full server SDK loads.
- **`app/global-error.tsx`** imports Sentry **dynamically inside its `useEffect`** (browser-only) instead of statically — a static import in a `"use client"` component gets bundled into SSR too, dragging the Node SDK back in. The effect only runs in the browser (where client Sentry is already loaded), so this costs nothing and keeps the server bundle clean.
- **`cloudflare/worker.ts`** is the wrangler `main` (see `wrangler.jsonc`): it imports the generated `.open-next/worker.js`, wraps its default `fetch` with `@sentry/cloudflare`'s `withSentry`, and re-exports the OpenNext Durable Objects. It reads the DSN from a wrangler.jsonc `var` (`NEXT_PUBLIC_SENTRY_DSN`, public). It is **excluded from the app `tsc`** (like OpenNext's own worker entry) because its import only exists after a build.

### Result (measured)

| Build | Worker gzip | vs 3 MiB free limit |
|---|---|---|
| Before (full `@sentry/nextjs` server) | **3268 KiB** | ❌ over by ~196 KiB |
| After (this branch) | **2486 KiB** | ✅ ~586 KiB headroom |

workerd boots and serves every route 200 (incl. `/journal`, `/journal/tag/*`), console-clean.

### Known dormant residual

`withSentryConfig` still injects a `@sentry/nextjs` SSR chunk (~2.6 MiB raw / ~600 KiB gzip) into the Cloudflare build via Turbopack — the webpack `autoInstrument*: false` options **do not apply under Turbopack**, so we can't switch it off cleanly. It is **harmless**: server Sentry is never `init()`-ed on CF (the guard above), workerd boots fine with it present, and we're comfortably under the limit. Leaving it keeps the `/monitoring` tunnel + client source-map upload working on CF without CSP changes. If the Worker later approaches 3 MiB again, the next lever is a Turbopack `resolveAlias` stubbing `@sentry/nextjs`'s server entry on the CF build (or the paid upgrade below).

### Future: upgrading to Workers Paid ($5/mo → 10 MiB limit)

If we ever want the *simplest* possible setup (one SDK, no split), a **Workers Paid** plan lifts the limit to 10 MiB and the entire `007` split becomes unnecessary. To revert:
1. Cloudflare dash → **Workers Paid** plan on the account.
2. Delete `cloudflare/worker.ts`; set `wrangler.jsonc` `main` back to `.open-next/worker.js`; drop the `vars.NEXT_PUBLIC_SENTRY_DSN` there.
3. Remove the `NEXT_PUBLIC_BUILD_TARGET=cloudflare` prefix from the `deploy`/`preview`/`upload` scripts.
4. Restore `instrumentation.ts` to the simple `import * as Sentry from "@sentry/nextjs"` form; revert `app/global-error.tsx` to a static import (optional — the dynamic import is harmless).
5. `npm uninstall @sentry/cloudflare`; remove `cloudflare/worker.ts` from `tsconfig` exclude.
Then `@sentry/nextjs` server SDK deploys as-is to both targets (~3.27 MiB, fits in 10 MiB).

---

## Historical: deferred setup plan (pre-install)

This doc originally captured *how* we'd add Sentry, adapted from the official [Sentry Next.js SDK guide](https://github.com/getsentry/sentry-for-ai/blob/main/skills/sentry-nextjs-sdk/SKILL.md) to this project's conventions (`CLAUDE.md`, `secure-defaults`, privacy-first posture). Retained for the privacy-deviation rationale below (still current).

## When it lands

- **Phase 0 (Foundation)** — install the SDK and add the config files *alongside* `next.config.ts` and `instrumentation.ts`, since those files are created in this phase anyway. Keep it **dormant in dev** (no DSN set locally = no-op) so it doesn't add noise during the build.
- **Phase 5 (Verify & ship)** — create the Sentry project, set the real DSN + auth token in Vercel, verify an error reaches the Issues dashboard, and confirm source maps upload on `next build`. This is the gate where observability actually goes live.

Prerequisite for either: a Sentry org/project + DSN (Ricki / account owner decision — see open items below).

## Files to create (App Router, `@sentry/nextjs >= 8.28.0`)

1. `instrumentation-client.ts` — browser init + `onRouterTransitionStart` export
2. `sentry.server.config.ts` — Node runtime init
3. `sentry.edge.config.ts` — Edge runtime init
4. `instrumentation.ts` — `register()` + `export const onRequestError = Sentry.captureRequestError`
5. `app/global-error.tsx` — `"use client"` error boundary that calls `Sentry.captureException`
6. Wrap `next.config.ts` with `withSentryConfig(...)`

Install:

```bash
npm install @sentry/nextjs --save
```

(We add config by hand rather than `npx @sentry/wizard` so we control the privacy-sensitive options below instead of accepting the wizard's defaults.)

## Env vars (see `.env.example` + `secure-defaults`)

| Variable | Where | Notes |
|---|---|---|
| `NEXT_PUBLIC_SENTRY_DSN` | client | Public by design — DSN is not a secret, but it *is* the ingestion endpoint. |
| `SENTRY_DSN` | server/edge | Server-side init. |
| `SENTRY_AUTH_TOKEN` | build-time only | **Secret.** Source-map upload auth. Never `NEXT_PUBLIC_*`. Store in Vercel build env / CI secret, never committed. |

Add all three to `.env.example` (with empty values) when the app is scaffolded.

## Project-specific deviations from the skill defaults

These matter because this is a privacy-first marketing site with a cookie/consent banner, GA consent-gating, and email collection (GDPR-relevant). The skill's defaults are tuned for a logged-in app, not this.

1. **`sendDefaultPii: false`** (skill suggests `true`). `true` attaches IP addresses and request data, which conflicts with the privacy policy and consent posture. Default to `false`; only revisit with legal sign-off.
2. **Session Replay** — the skill enables `replayIntegration()` with `replaysSessionSampleRate: 0.1`. Replay records user sessions (privacy-sensitive). Decision: **start with replay disabled** (or sample `0` + full text/input masking) until the privacy policy explicitly covers it and it's consent-gated alongside GA.
3. **`includeLocalVariables: true`** (server) — fine; keep, it aids debugging and runs server-side only.
4. **Sample rates** — `tracesSampleRate: 1.0` in dev, `0.1` in prod (matches skill; revisit if volume/cost warrants).
5. **CSP** — the Phase 0/6 security headers must not break Sentry. Use `tunnelRoute: "/monitoring"` so events proxy through our own domain (bypasses ad-blockers *and* avoids adding Sentry hosts to `connect-src`). Ensure the consent/headers **middleware `matcher` excludes** the tunnel and static assets:
   ```ts
   export const config = {
     matcher: ["/((?!monitoring|_next/static|_next/image|favicon.ico).*)"],
   };
   ```
6. **`enableLogs: true`** — optional; enable only if we actually use Sentry logging, otherwise drop to reduce surface.

## `withSentryConfig` options to use

```ts
export default withSentryConfig(nextConfig, {
  org: "___ORG_SLUG___",        // fill at Phase 5
  project: "___PROJECT_SLUG___",
  authToken: process.env.SENTRY_AUTH_TOKEN,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  silent: !process.env.CI,
});
```

## Verification (Phase 5, before/at deploy)

1. Throw a deliberate error in a server action and a client component.
2. Confirm both appear in Sentry Issues within ~30s.
3. Confirm `next build` uploads source maps (stack traces are un-minified in the dashboard).
4. Confirm `/monitoring` tunnel responds and isn't intercepted by middleware.
5. Confirm no Sentry traffic fires before consent if/when replay or PII is ever enabled.

## Open items (need owner decision)

- Create Sentry org/project + obtain DSN and auth token (account owner / Ricki).
- Privacy policy language for error monitoring (and Session Replay if ever enabled).
- Whether Session Replay is wanted at all on a calm marketing site (recommend: no, at least at launch).
