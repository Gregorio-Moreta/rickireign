# Session State — handoff into Phase 4 (Blog)

_Transient doc. Reflects state as Phase 3 (Forms & legal) is delivered (2026-06-18). When Phase 4 ships, rewrite this for Phase 5. Durable facts/rules live in `CLAUDE.md`._

## Where we are

**Phases 0–3 are complete.** 0/1/2 are merged to `main`; **Phase 3 is delivered via PR #5 (`003-forms-and-legal` → `main`)** and bundles this handoff, so `main` is Phase-4-ready the moment #5 merges.

- Phase 3 passed code review (`code-reviewer`: APPROVE WITH NITS, zero MUST-FIX). Applied: CR/LF guard on the contact name (header-injection), proxy-aware `publicOrigin()` for the DOI redirect, a shared `FALLBACK_CONTACT_EMAIL` constant, consent banner `role="region"`.
- **Both builds pass locally** (`npm run build` + `npx opennextjs-cloudflare build`). lint + tsc clean.
- **Live-tested end-to-end:** the newsletter form (real browser) → `/api/newsletter` → Turnstile → Brevo DOI → confirmation email **delivered** to the test inbox (Brevo events confirmed). API failure paths return correct 400s; honeypot silently 200s.
- Branches kept (no-delete rule): `000-foundation`, `001-content-model`, `002-home`, `docs/phase-2-handoff`, `003-forms-and-legal`, `main`.

### First steps in Phase 4
```bash
git checkout main && git pull origin main      # after PR #5 merges
git checkout -b 004-blog
git push -u origin 004-blog
```

## What Phase 3 delivered (in `main` once #5 merges)

- **Newsletter** (`components/ui/NewsletterForm.tsx` in the `Newsletter` shell) → `POST /api/newsletter`: Zod → Turnstile → **Brevo double opt-in** (list `3`, DOI template `1`), generic success (never reveals membership), honeypot-protected.
- **Contact** (`components/ui/ContactForm.tsx` built into `Connect`) → `POST /api/contact`: Zod → Turnstile → Brevo **transactional** email to `siteSettings.contactEmail` (fallback `welcome@rickireign.com`), visitor as reply-to, HTML-escaped, CR/LF-guarded name.
- **Server libs** (server-only, secrets from `process.env`): `lib/validation.ts` (Zod + honeypot), `lib/turnstile.ts` (fails closed), `lib/brevo.ts` (DOI + transactional + escape), `lib/http.ts` (`clientIp`, `publicOrigin`), `lib/constants.ts`.
- **Turnstile** widget (`components/ui/Turnstile.tsx`) on both forms; renders nothing if no site key.
- **Calendly** — `components/ui/BookingButton.tsx` (lazy popup) via `components/ui/CtaButton.tsx`; "Book a Discovery Call" CTAs (Hero/Practice/Who) open it, falling back to `#connect`.
- **Legal** — `app/privacy/page.tsx`, `app/terms/page.tsx` (hardcoded, brand-styled via `components/ui/Prose.tsx`, "last updated" June 18 2026). Footer already links them.
- **Consent** — `components/analytics/ConsentBanner.tsx` (global opt-in, cookie `rr-consent`); `Analytics.tsx` loads GA **only after Accept**, re-syncs on the consent event (`lib/consent.ts`).
- **Config** — `next.config.ts` CSP grown for Turnstile + Calendly (+ explicit `frame-src`); `lib/env.ts` adds `turnstileSiteKey` + `calendlyUrl` (committed public defaults); `.env.example` documents `BREVO_SENDER_EMAIL`; `app/globals.css` adds `layer-banner`. New dep: `zod`.

## Deploy env status (important)

- **Vercel:** ALL Phase 3 env set via CLI for **production** + the **`003-forms-and-legal` preview branch** — `BREVO_API_KEY`, `BREVO_LIST_ID` (3), `BREVO_DOI_TEMPLATE_ID` (1), `BREVO_SENDER_EMAIL`, `TURNSTILE_SECRET_KEY` (secrets `--sensitive`), `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `NEXT_PUBLIC_CALENDLY_URL`. (Public keys also default in `lib/env.ts`.)
- **Cloudflare:** the public keys default in code (no build var needed). **Runtime secrets still TODO** — `wrangler` isn't authed locally; run `npx wrangler login` then `wrangler secret put` for `BREVO_API_KEY` `BREVO_LIST_ID` `BREVO_DOI_TEMPLATE_ID` `BREVO_SENDER_EMAIL` `TURNSTILE_SECRET_KEY`, or add them in the dashboard as **Secrets**. Until then, forms won't work on the CF deploy (build stays green).

## Phase 4 — Blog (the goal)

Per PLAN.md §3, §4 (`post`/`author` schemas already exist), §7. Routes `/blog` + `/blog/[slug]`, `BlogCard`, Portable Text rendering for `post.body`, cover images via `SanityImage`, list ordered by `publishedAt`. Wire SEO/OG per post. Decide content direction with Ricki (PLAN open #5) before building.

## Gotchas specific to Phase 4 (read before coding)
- **`post`/`author` schemas are already in the Studio** (Phase 1) — likely no schema change, but confirm fields against `studio/schemaTypes`. Seed a couple of posts via the Sanity MCP (publish `author` before `post`).
- **Portable Text:** `next-sanity` exports `PortableText`; the Meet Reign section (`about.body`) already renders it — reuse that pattern + component map.
- **ISR/revalidation** is still 60s time-based (no webhook). For a blog, consider the publish webhook (deferred from Phase 2) so new posts appear promptly.
- **Reading-time / dates:** format `publishedAt` server-side; keep it timezone-stable.

## Open questions / deferred (still matter)
- **CF runtime secrets** — see Deploy env above (the one outstanding setup step).
- **Brevo prod sender** — verify a `rickireign.com` domain sender and swap `BREVO_SENDER_EMAIL` off the gmail before real launch (DOI + contact emails currently send FROM the gmail).
- **Calendly** URL is still a personal test link (`gregorioe-moreta/discovery-call`) — committed as the `lib/env.ts` default; swap for Ricki's real link.
- **contactEmail** (PLAN open #3): confirm `welcome@rickireign.com` vs `hello@`.
- **Real content + assets** (PLAN open #6), **section names** (open #1), **Patreon** (open #4), **Sanity revalidation webhook + draft/preview** — all still deferred.
- **No test runner** — the project has no `test` script; the security-critical Phase 3 invariants (fail-closed Turnstile, honeypot, no-enumeration, HTML escape) are covered only by manual/live testing. Phase 5 adds Playwright; consider unit coverage for `lib/validation`/`lib/brevo` if a runner lands sooner.

## If you're starting Phase 4 cold, know this
- Production on `main` is green on both targets; content is real and queryable (`*[_type=="homePage"][0]`, `*[_type=="siteSettings"][0]`, `*[_type=="post"]`) via the Sanity MCP (`perspective: "published"`).
- Schema changes need `cd studio && npm run schema:deploy`; Studio runs at `:3333`.
- Subagents run in `.claude/worktrees/` and can't do git/network writes — consolidate and run git/`gh`/deploy from the main session. Never delete branches. See `CLAUDE.md` for the full rule set + Phase 0–3 gotchas.
