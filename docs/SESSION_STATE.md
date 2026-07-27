# Session State — 011 Sentry live on both targets

_Transient handoff. Reflects `011-sentry-prod` (branch off `main` @ `d8fe740`) as of 2026-07-27. Durable rules/gotchas live in `CLAUDE.md`._

## Where we are

**`010-launch-prep` (PR #13) is MERGED.** `011-sentry-prod` is cut off the resulting `main`, pushed, and **not merged — do not merge without the human.**

Error monitoring is now genuinely live on both deploy targets, verified by triggering real production errors rather than by reading config.

## What was actually wrong (the report was mostly misdiagnosed)

| Reported symptom | Verdict |
|---|---|
| Vercel `/monitoring` → 404 | **Correct behaviour.** The rewrite only matches with `?o=`, which the SDK always sends. |
| CF `/monitoring` → 500 | Real, but an **`@opennextjs/aws`** routing bug, not Sentry, and cosmetic — no client ever sends that shape. |
| "No Sentry in any of the 14 chunks" | **False on Vercel** (SDK + DSN + source maps all present, 33 maps uploaded). **True on Cloudflare.** |
| "DSN isn't reaching `next build` on either target" | **Half right** — Cloudflare only, and it explains just the *browser* half. |

**The two real faults:**

1. **CF browser SDK inert.** `NEXT_PUBLIC_SENTRY_DSN` is inlined at build time and was never a Workers-Builds build var, so `enabled: Boolean(undefined)` = false. The `wrangler.jsonc` DSN is a *runtime* var and never reaches the build.
2. **CF server capture near-zero — not in the report, and the bigger find.** OpenNext catches every Next-level error and `console.error`s it instead of rethrowing, so `withSentry` only sees a finished 500 Response and captures nothing.

## Verified in production (real events, both targets)

| Path | Result |
|---|---|
| Browser error, Vercel | `POST /monitoring?o=…&p=…&r=us` → **200** |
| Browser error, Cloudflare | `POST /monitoring?…` → **200** (produced **zero** requests before the fix) |
| Node server, Vercel | `POST /api/sentry-check` → 500 |
| Cloudflare, escapes OpenNext | `POST /api/sentry-check/worker` → 500, **no** `x-opennext` |
| Cloudflare, swallowed by OpenNext | `POST /api/sentry-check` → 500 **with** `x-opennext: 1` |
| Tunnel, both targets | `POST` → 401 from Sentry; bare `GET` → 404 (CF was 500) |

Worker size **2491 KiB gzip** vs the 3072 KiB free-plan limit (+4 KiB on the 2487 baseline).

## STILL OPEN — finish these

1. **Confirm the events in Sentry Issues.** The Sentry MCP OAuth was never completed, so "Sentry accepted the envelope (200)" is proven but "it appears in Issues with readable frames" is **not**. Re-run `mcp__sentry__authenticate`, then check org `example-1wv` / project `ricki-reign` for `SentryCheckError` and the `SentryCheck client …` messages.
2. **Tear down the probe token** (it is currently SET on both targets):
   ```bash
   npx wrangler secret delete SENTRY_CHECK_TOKEN     # then verify the probes 404 again
   vercel env rm SENTRY_CHECK_TOKEN production --yes && vercel --prod
   ```
   Then archive/mute the `SentryCheckError` issue.
3. **CF source maps.** `SENTRY_AUTH_TOKEN` must be a Workers-**Builds** *build* secret. A runtime secret of that name exists on the Worker and does **nothing** for the build. It only takes effect on a Workers Builds run — i.e. on merge to `main`.

## Incident during this session (read before deploying CF again)

A local `npm run deploy` **broke Cloudflare production for ~9 minutes**. Wrangler reported `6 new uploaded (24 already uploaded)` — all files accounted for — yet 2 of 16 chunks 404'd, including the Turbopack runtime, so no JavaScript ran at all on an apparently-healthy 200 page. Recovered with `npx wrangler versions deploy <id>@100% --yes`.

Cause: Cloudflare deletes the previous deployment's assets immediately while new ones are still propagating. **Always deploy CF with `npx wrangler deploy --old-asset-ttl 3600`, then verify every `/_next/static/...` the page references returns 200 (they converge over ~20–30s) before declaring success.** The successful retry went 5 → 1 → 0 broken assets across three passes.

Also: after a rollback, the first fetch can still be the *previous* version's cached HTML for up to 60s (`s-maxage=60`). Re-check with `?v=$RANDOM` before concluding the rollback failed.

## Solved: the `cloudflare/worker.ts` build false-fail

The long-standing "local `tsc`/`next build` fails on `cloudflare/worker.ts`" gotcha is **not** about `.open-next/worker.js` being absent and **not** a broken tsconfig `exclude`. `exclude` only filters the root file set; the untracked, unused, 530 KB `cloudflare-env.d.ts` (from `npm run cf-typegen`) **imports** `./cloudflare/worker`, which drags it into the program. `rm cloudflare-env.d.ts` → `tsc` clean with `.open-next` absent. That is also why Cloudflare's CI never hit it: a fresh clone has no such file. The `typescript.ignoreBuildErrors` workaround is no longer needed.

## Owed by Ricki (unchanged from 009/010)

New Somatics service titles · her own About bio · guiding questions · confirm the hero headline · testimonials decision · Exhale/CBV `externalUrl` (their "Visit site" buttons go nowhere) · `hero.currentFocus` still blends the two things she wants separated. All no-code at https://rickireign.sanity.studio.

## If you're starting cold

`010` is merged. **`011-sentry-prod` is pushed with both prod targets deployed from it and verified** — but **not merged**. Finish the three open items above, then open/merge the PR with the human. Never delete branches; git/deploy from the main session.
