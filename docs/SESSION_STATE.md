# Session State — CF Sentry bundle fix shipped (next: content→Sanity + copy review)

_Transient handoff. Reflects `main` @ `3c569b6` as of 2026-07-01. Durable rules/gotchas live in `CLAUDE.md`._

## Where we are

Both build phases (0–5) + the home reframe (`006`, PR #9) shipped earlier. This session delivered **`007-cf-sentry-bundle-fix`** (PR #10, **merged to main**). **Both prod targets are now green and serving correctly** — the Cloudflare deploy that had been failing since Sentry landed is fixed.

- **Vercel** prod: `main` deploy READY.
- **Cloudflare** prod: `main` build `success` (Version `fe5873f4…`); all routes 200 incl. `/journal` (was 500). Worker gzip **2486 KiB** (< 3 MiB free limit).

## What `007-cf-sentry-bundle-fix` delivered (PR #10, merged)

The `@sentry/nextjs` **server** SDK (`@sentry/node` + full OpenTelemetry Node auto-instrumentation, ~5.5 MiB raw) pushed the OpenNext Worker to **3.27 MiB gzip — over Cloudflare's 3 MiB free-plan limit**, so every `006`/`main` CF deploy failed `wrangler` size validation. CF prod was frozen on a pre-migration commit whose `/journal` 500'd against the migrated tag data.

**Fix — dual-SDK split (no Sentry capability dropped; user chose free + trim over Workers Paid):**
- Client `@sentry/nextjs` on both targets (unchanged). Server: `@sentry/nextjs` on **Vercel** (Node), `@sentry/cloudflare` on **Cloudflare** (workerd) via `cloudflare/worker.ts` wrapping the OpenNext worker with `withSentry` + re-exporting the Durable Objects.
- `@sentry/nextjs` tree-shaken out of the CF build: `NEXT_PUBLIC_BUILD_TARGET=cloudflare` (set only on the `opennextjs-cloudflare build` step in package.json) is inlined → Turbopack DCEs the imports. `instrumentation.ts` has no top-level `@sentry/nextjs` import + early-returns on CF; `app/global-error.tsx` imports Sentry dynamically in `useEffect`.
- `cloudflare/worker.ts` is the wrangler `main` (excluded from app `tsc`). DSN is a public wrangler `var`.
- **Result: 3268 → 2486 KiB gzip.** Full detail + a **Workers-Paid revert path** in `docs/SENTRY.md`; `CLAUDE.md` has the `007` facts block + a 3 MiB gotcha.

Also this session: **`fix(turnstile)`** `appearance: "interaction-only"` (a reported "auto-approving checkbox" was investigated — **not a bug**; managed-mode auto-pass, server siteverify fails closed, both routes enforce the token — just a UX polish). Swept a large pile of Finder `" 2"`/`" 3"` duplicate dirs (`node_modules/@types/* 2` broke local `tsc` with a phantom `chai 2` type lib).

## Next phase — `008-content→Sanity` + copy review (scope)

**Goal (user's ask):** move as much **static/hardcoded text as possible into Sanity** so Ricki can edit copy in the Studio without code changes / PRs. The *layout* is considered satisfactory — this is a **content-plumbing + copy** phase, not a redesign.

**Deliverable already produced this session:** `docs/planning/ricki-copy-survey.md` — a **multiple-choice copy survey for Ricki** (grounded in the actual current copy, each question mapped to its Sanity field). **Send it to Ricki; her answers drive the copy edits.** Layout is explicitly out of scope per Ricki's own note.

**Already in Sanity (don't re-plumb):** `homePage` (hero, about, theWork, whoIsThisFor, guidingQuestions, newsletter, connect), `somaticsPage`, `siteSettings` (nav, social, seo, footerText, wordmark, contactEmail), `business` (Exhale, CBV), `post`/`author`/`tag`. Sections receive this via props from the page fetch — they are already content-driven.

**Still HARDCODED in code (candidates to move — audit for 008):**
- **Form microcopy** — `components/ui/ContactForm.tsx` + `NewsletterForm.tsx`: button labels ("Send message", "Subscribe"), placeholder ("you@example.com"), and status messages ("Please complete the verification below.", "Thank you — your message is on its way. Ricki will be in touch.", "Almost there — check your inbox…", "Something went wrong. Please try again.", "Network error. Please try again.").
- **Consent** — `components/analytics/ConsentBanner.tsx` + `CookieSettingsButton.tsx`: the whole banner body + "Cookie settings" label.
- **Nav/Footer chrome** — `components/layout/Nav.tsx` ("Close/Open menu" aria), `Footer.tsx` (link labels partly static). Note nav labels/wordmark ARE in `siteSettings`.
- **Journal index** — `app/journal/page.tsx`: the "Journal" title + description string (also used as metadata). `/journal/tag/[tag]` + `[slug]` metadata templates.
- **Legal** — `app/privacy/page.tsx` (~13 blocks) + `app/terms/page.tsx` (~5): fully hardcoded. **These also need lawyer review** — consider a `legalPage` doc (Portable Text) so edits don't need PRs, but treat legal text as sensitive (don't casually reword).
- **Fallbacks** — `app/global-error.tsx` copy, `not-found` copy, SEO/OG defaults in `lib/env.ts`/`layout.tsx`.

**Suggested approach for 008 (plan-first, get sign-off):** extend `siteSettings` with a `microcopy`/`forms`/`consent` group (or a dedicated `uiStrings` singleton) for global strings; add a `journalPage` singleton for the index intro; consider a `legalPage` doc type for privacy/terms. Keep the default-or-Sanity pattern (sensible in-code fallbacks so a missing field never breaks the build — same rule as `lib/env.ts`). Add fields incrementally; `cd studio && npm run schema:deploy && npx sanity deploy` after schema changes; migrate existing strings as content; verify both builds.

## Missing action items review (found this session)

- **⚠️ Identity inconsistency (live copy bug):** the reframe made the identity **"leadership strategist,"** but `siteSettings.footerText` = _"© Ricki Reign. Founder, facilitator, and organizational leader."_ and `siteSettings.seo.title` = _"Ricki Reign — Founder, Facilitator & Organizational Leader"_ still use the OLD identity. Reconcile in 008 (Survey Q3 asks Ricki which she prefers). Editable in Studio today — no code change needed.
- **Sentry CF source maps** not uploading (CF build logs "No auth token provided"): `SENTRY_AUTH_TOKEN` must be a Workers-Builds **build** var for CF map upload. Also the wrangler deploy wipes remote runtime `SENTRY_ORG`/`SENTRY_PROJECT` (harmless — build-time-only).
- **Verify Sentry error-capture in prod:** the `@sentry/cloudflare` wrapper is deployed + DSN bound, but a real triggered-error → Issues test on workerd is still pending (and the Vercel `@sentry/nextjs` path).

## Launch-prep carry-over (restate until done)

Verify Sentry in prod (trigger error + CF source maps + `/monitoring` tunnel under workerd) · **activate the Sanity publish webhook** (`SANITY_REVALIDATE_SECRET` on both deploys + register the hook at sanity.io/manage) · **domain cutover** (apex still serves the OLD site) · **Brevo `rickireign.com` domain sender** · **lawyer review** of `/privacy` + `/terms` (+ an error-monitoring line) · Ricki to review **copy (survey above) + brand-derived dark palette + AI card images** · optional **performance** pass (Turnstile widgets dominate Lighthouse) · Session Replay decision (off).

## Gotchas (phase-specific — full set in CLAUDE.md)

- **CF Worker size = 3 MiB gzip (free).** Only a real deploy enforces it; `build`/`preview` don't. Check: `npx wrangler deploy --dry-run --outdir /tmp/x` → "gzip: …". Current headroom ~586 KiB — adding heavy deps can breach it again (see `docs/SENTRY.md` for the paid-plan escape hatch).
- **Two Sentry server SDKs by target** — don't "consolidate" them back to one without re-checking the CF size limit.
- Schema changes need `cd studio && npm run schema:deploy` **and** `npx sanity deploy` (hosted Studio at rickireign.sanity.studio).
- New E2E specs `import { test } from "./fixtures"` (pre-seeds consent). `test:e2e` reuses an existing `:3000` server — kill any stale `next dev` first or the console-error spec fails on dev-mode eval-vs-CSP (that's an artifact, not a regression).
- Booking CTA is `role=link`. Commit multi-line messages with `git commit -F` (backticks get shell-mangled).
- **Sanity content is shared/global** across prod + the live old site — a schema/content migration affects both; publish referenced docs before repointing (reference order).

## If you're starting cold

`main` @ `3c569b6` is green on both targets. **Cut `008-content-to-sanity` off main and push immediately** (per the user: the branch is started in the NEXT/fresh session, not the one that wrote this). Plan-first: present the 008 plan (which strings → which Sanity fields) and get sign-off BEFORE code. Send `docs/planning/ricki-copy-survey.md` to Ricki; her answers shape the copy edits. Run `npm test` + `npm run test:e2e` before touching forms/nav/journal/theme. Never delete branches; git/deploy from the main session. See `CLAUDE.md` for the full rule set.
