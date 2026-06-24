# Session State — home reframe + launch hardening delivered (next: final production-readiness pass)

_Transient handoff. Reflects branch `006-home-reframe` as of 2026-06-24. Durable rules/gotchas live in `CLAUDE.md`._

## Where we are

All six build phases (0–5) shipped earlier. This session delivered a large **post-launch reframe + hardening** pass on branch **`006-home-reframe`** (8 commits, 56 files, +6,149/−3,223). **Pushed, not yet PR'd/merged** (PR is the next step). lint + tsc clean; **both builds green** (Vercel `next build` + `opennextjs-cloudflare build`); Vitest 23/23; Playwright 36 pass / 3 gated (incl. new a11y + theme specs); workerd preview boots 200.

This branch was **not** a numbered build phase — it began as the home **narrative reframe** (driven by Ricki's 6/22 voice notes + chat, captured in `docs/planning/ricki-input/`) and grew to absorb most of the launch-prep carry-over.

## What `006-home-reframe` actually delivered

**1. Home narrative reframe** (`feat(home)` f358cf5) — the spine now *explains* rather than *converts*:
- Hero identity → **leadership strategist** (not "founder/facilitator/somatic"); **all booking CTAs removed from home**; only a soft "Follow along" remains.
- Merged **"The Practice" + "Founded & Led" → one "The Work"** section (`#work`): three arena cards — Exhale, CBV (external links) + **Somatics** (internal). About (`MeetReign`) **moved above** The Work.
- New **`/somatics`** page — frames the practice as bio and is the **only** page with a booking CTA.
- Nav + `siteSettings.nav`: `#practice`/`#founded` → `#work`. Retired `PracticeSection`/`FoundedAndLed`; new `components/sections/TheWork.tsx`. Schema: `homePage.theWork` + `somaticsPage` singleton; Studio redeployed.

**2. Imagery + polish** (c9cfd6c) — AI on-brand abstract card covers for all three arenas (via the entitled Sanity `generate_image`); strictly uniform fixed-height cards; expanded About bio (it had none).

**3. Booking resilience** (c9cfd6c) — `BookingButton` is now a **real link** (progressive enhancement) with a **watchdog fallback**: if the Calendly popup doesn't mount in ~3.5s (ad/privacy blocker or hang) it opens the scheduling page (new tab, or same tab if popup-blocked). The discovery CTA is now `role=link` — E2E selector updated.

**4. Site-wide dark mode + section separation** (`feat(theme)` d89252b):
- Follow-system default + persisted toggle. Pre-paint inline script sets `.dark` on `<html>` (no flash); `ThemeToggle` (nav, desktop+mobile) via `useSyncExternalStore`; `lib/theme.ts`.
- **Brand-DERIVED dark palette** under `.dark` in `globals.css` (DESIGN.md only specs light) — Earth-Charcoal surfaces, Sand-Stone text, same Forest/Teal accents. **Flagged for Ricki's review.**
- `Section` gained a `tone` (base/alt/contrast) + a new `band` token (dark in both themes) → fixes the "sections blend" issue.

**5. Accessibility** (2363a1f + b1ab848 + e89e021):
- Visible **input borders** (was a 10%-opacity hairline); **"Follow along"** secondary button uses `primary` (was invisible-on-dark `primary-container`); **luminous-teal focus rings** (forest-green was invisible on dark).
- `@axe-core/playwright` + `tests/e2e/a11y.spec.ts` — **0 WCAG 2.0/2.1 A/AA violations** across 5 pages × both themes.
- Lighthouse-only fixes: legal "Last updated" contrast; "Visit site" label-in-name (WCAG 2.5.3); journal cards `h3`→`h2` (heading-order). **Lighthouse a11y = 100** on /, /somatics, /journal.

**6. CSP hardening** (b1ab848) — added `upgrade-insecure-requests` + `Cross-Origin-Opener-Policy: same-origin`. Documented why `script-src` keeps `'unsafe-inline'` (a nonce is incompatible with static/ISR caching + App Router inline hydration scripts).

**7. Sentry — installed, DSN-gated, VERIFIED** (b1ab848 + cde286a):
- `@sentry/nextjs` v10 + all config files per `docs/SENTRY.md`, privacy-tuned: **no PII, no Session Replay, no logs**; server `includeLocalVariables`; `tunnelRoute: "/monitoring"` (no CSP connect-src change). `app/global-error.tsx`, `instrumentation(.client/.server/.edge)`, `withSentryConfig` (env-driven org/project/token). Server/edge DSN **falls back to `NEXT_PUBLIC_SENTRY_DSN`** so one build var covers all on Cloudflare.
- **Verified end-to-end**: a real server error reached Sentry Issues (RICKI-REIGN-1), then resolved; temporary `/sentry-example-page` + route created and **deleted** (never committed).
- **Sentry project:** org `example-1wv`, project `ricki-reign`, DSN `https://03bea0b82197b6f523bbfc36d73506d1@o4511575656497152.ingest.us.sentry.io/4511621914361856` (public).

**8. Sanity publish webhook** (e89e021) — `app/api/revalidate` verifies the Sanity HMAC signature (`@sanity/webhook`) then `revalidatePath("/", "layout")`. **Not yet active** (needs `SANITY_REVALIDATE_SECRET` on deploys + registering the webhook in sanity.io/manage). Note: Next 16 changed `revalidateTag` to `(tag, profile)`; we use `revalidatePath`.

**9. Tags → reference doc type** (e89e021) — new `tag` document (title + URL-safe slug); `post.tags` is now references (no-code management). Migrated the 3 existing tags + both posts. Queries expand refs (`tags[]->{title, slug}`), `POSTS_BY_TAG_QUERY` matches `$tagSlug` (not reserved `$tag`); removed the string `TagInput`/`postTags`/`lib/tags`; sitemap adds `/somatics`. Schema + Studio redeployed.

**10. Maintenance** — `npm audit fix` evaluated and **reverted** (no benefit; tooling-only transitive advisories, big lockfile churn). `.gitignore` broadened to `/.open-next*`, `/playwright-report*`, `/test-results*` after Finder-style " 2" duplicate dirs leaked a Brevo key into a commit (caught by GitHub push protection — nothing reached the remote).

## Deploy-env status (set this session)

- **Vercel** (project `rickireign`): added `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG=example-1wv`, `SENTRY_PROJECT=ricki-reign` (Production + `006-home-reframe` preview) via CLI; **user added `SENTRY_AUTH_TOKEN`** (Production + preview, `--sensitive`). Plus the existing Brevo/Turnstile/Calendly/GA/Sanity from Phase 3.
- **Cloudflare** (Worker `rickireign`): **user added** all four Sentry vars as **Workers-Builds *build* vars** (DSN/org/project plaintext, `SENTRY_AUTH_TOKEN` as Secret). Plus the existing runtime secrets.
- **`.env.local`**: **user added all 4 Sentry values**. ⚠️ This means **local dev now reports to Sentry** (DSN active). If dev noise is unwanted, comment out `NEXT_PUBLIC_SENTRY_DSN` in `.env.local` (the dormant-in-dev design); `SENTRY_ORG`/`PROJECT` are build-time only and harmless.

## Next phase — final production-readiness pass (scope)

1. **Open PR + merge `006-home-reframe` → main**, then **deploy both targets** and smoke-verify.
2. **Verify Sentry in PROD**: deploy, trigger an error, confirm it appears in Issues, confirm **source maps upload** on build (auth token), confirm the **`/monitoring` tunnel** works under workerd.
3. **Activate the Sanity publish webhook**: set `SANITY_REVALIDATE_SECRET` (Vercel + Cloudflare + `.env.local`) and register the webhook (sanity.io/manage → API → Webhooks → `https://<site>/api/revalidate`, same secret, trigger create/update/delete).
4. **Domain cutover** — apex still serves the OLD site; deploys/Studio point at `*.vercel.app`.
5. **Brevo `rickireign.com` domain sender** (DOI + contact still use the gmail wrapper).
6. **Lawyer review** of `/privacy` + `/terms` — now also needs an **error-monitoring** line (Sentry) and confirm cookie language.
7. **Ricki review**: final copy (hero/The Work/somatics drafts in Studio) + the **dark palette** (brand-derived, unreviewed) + the AI card images.
8. **Optional**: a **performance** pass (Lighthouse perf 54–74 — the two Turnstile widgets are the main cost; consider lazy-loading them on interaction); **Session Replay** decision (off now).

## Phase-specific gotchas (don't re-learn)

- **Dark mode:** plain `.dark { --color-* }` (unlayered) overrides the `@theme` tokens, so the whole site flips with no per-component `dark:` classes. `inverse-surface`/`inverse-on-surface` are **deliberately NOT flipped** (footer stays a dark band). `primary` → light green in dark (so outline button + nav hover stay visible); filled `primary-container`/`on-primary` buttons + the `*-fixed` pairs are left theme-invariant. Anti-FOUC inline script in `<head>` + `suppressHydrationWarning` on `<html>`. `ThemeToggle` uses `useSyncExternalStore` (avoids React 19 set-state-in-effect lint).
- **Sentry:** Turbopack `next build` AND OpenNext both build fine with v10; workerd boots with it present. Get the DSN via the Sentry MCP `find_dsns` (org `example-1wv`). The verify path: a temporary `/sentry-example-page` + `/api/sentry-example-api` (server `throw`) — delete after.
- **Booking CTA is now `role=link`**, not button — any new test must use `getByRole("link", { name: /discovery call/i })`.
- **Tags:** deterministic ids `tag-<slug>`; publish tag docs **before** repointing posts (reference order). `POSTS_BY_TAG_QUERY` param is `$tagSlug`.
- **Commit messages with backticks get shell-mangled** by zsh → always `git commit -F <file>` for multi-line messages.
- **Finder " 2" duplicate dirs** (`.open-next 2`, `playwright-report 2`, …) dodge anchored gitignore and can leak secrets — the globs now catch them; delete any you see.
- **Lighthouse needs the prod build** (`next start`), not dev. Dev's HMR websocket means `waitUntil: "networkidle"` never settles — use `domcontentloaded` in headless checks.

## Open questions / carry-over (restate until done)

- Activate webhook + verify Sentry in prod (above). Domain cutover. Brevo domain sender. Lawyer review (+ error-monitoring line). Ricki's copy + dark-palette + AI-image review. Performance pass. Session Replay decision. Calendly is still the personal account (`gregorioe-moreta/discovery-call`).

## If you're starting cold

- All work is on `006-home-reframe` (pushed). Run `npm test` + `npm run test:e2e` before touching forms/nav/journal/theme. Schema changes need `cd studio && npm run schema:deploy` + `npx sanity deploy`. Never delete branches. Run git/gh/deploy from the main session. See `CLAUDE.md` for the full rule set + all phase gotchas.
