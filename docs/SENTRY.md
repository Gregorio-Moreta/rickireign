# Sentry — deferred setup plan

**Status:** Not installed. There is no Next.js app in the repo yet. This doc captures *how* we'll add Sentry once the app skeleton exists, adapted from the official [Sentry Next.js SDK guide](https://github.com/getsentry/sentry-for-ai/blob/main/skills/sentry-nextjs-sdk/SKILL.md) to this project's conventions (`CLAUDE.md`, `secure-defaults`, privacy-first posture).

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
