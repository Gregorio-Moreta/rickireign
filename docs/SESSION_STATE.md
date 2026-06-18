# Session State — handoff into Phase 3 (Forms & legal)

_Transient doc. Reflects state as Phase 2 (Home) is delivered (2026-06-18). When Phase 3 ships, rewrite this for Phase 4. Durable facts/rules live in `CLAUDE.md`._

## Where we are

**Phases 0 (Foundation), 1 (Content model), and 2 (Home) are complete.** 0 and 1 are merged to `main`; **Phase 2 is delivered via PR #4 (`002-home` → `main`)** and bundles this handoff, so `main` is Phase-3-ready the moment #4 merges.

- Phase 2 passed code review (`code-reviewer`: APPROVE WITH NITS — all SHOULD-FIX applied: `sanityFetch` now `T | null`, CSP comment corrected).
- **Both deploys are green.** Vercel `https://rickireign.vercel.app` and Cloudflare `https://rickireign.gregoriomoreta4.workers.dev`. Cloudflare was verified via Workers Builds: commit `02c7ddd` build outcome **success** (earlier Phase 2 commits failed until the env-defaults fix — see below).
- Branches kept (no-delete rule): `000-foundation`, `001-content-model`, `002-home`, `docs/phase-2-handoff`, `main` — all on local + remote.

### First steps in Phase 3
```bash
git checkout main && git pull origin main      # after PR #4 merges
git checkout -b 003-forms-and-legal
git push -u origin 003-forms-and-legal
```

## What Phase 2 delivered (in `main` once #4 merges)

- **Home sections 1–8 wired to Sanity** (`app/page.tsx`, Server Component): Hero (+ Current Focus card), Guiding Questions, The Practice (+ OfferingCard), Founded & Led (+ BusinessCard, hardened external links), Meet Reign (+ Portable Text body, collapses to one column when no portrait), Who is this for? (dark `earth-charcoal` band), and **presentational shells** for Join the list + Connect.
- **Read layer**: `lib/sanity/fetch.ts` (`sanityFetch<T>` → `Promise<T | null>`, 60s time-based ISR) and `lib/sanity/types.ts` (hand-written content types — **no typegen**; keep in sync with `queries.ts`).
- **Components**: `components/sections/*` (8 sections); `components/ui/SanityImage.tsx` (next/image via `urlFor`, optional static `fallbackSrc`); `components/ui/SocialLinks.tsx` (shared Footer + Connect, platform→icon map). `Nav`/`Footer` now consume `siteSettings` with fallbacks.
- **Hero portrait**: `public/ricki-reign.jpg` (432×432, the only real asset) shown via the fallback; a Sanity `hero.portrait` upload overrides it with **no code change**. `about.portrait` is still empty (Meet Reign renders photo-less, single column).
- **Config**: `next.config.ts` adds `images.remotePatterns` for `cdn.sanity.io` and the CSP `img-src` now actively allows it; `app/globals.css` gains a `shadow-ambient` utility (DESIGN.md elevation).
- **`lib/env.ts`**: the public Sanity `projectId` (`zsuyhr45`) and `dataset` (`production`) are now **committed defaults** (env still overrides) — see the CF gotcha below.

## Phase 3 — Forms & legal (the goal)

Per PLAN.md §6 + §7. The Newsletter and Connect **shells already exist** — Phase 3 swaps in the real logic (remove `disabled`, attach the action) rather than building UI from scratch.

1. **Newsletter** — `POST /api/newsletter` → Zod validation → Turnstile verify → **Brevo double opt-in** (create contact, confirmation email; only confirmed contacts stored) → generic success (don't reveal whether the email already exists). Wire into `components/sections/Newsletter.tsx`.
2. **Contact** — `POST /api/contact` → Zod → Turnstile → Brevo **transactional** email to `siteSettings.contactEmail` (`welcome@rickireign.com`). Build the contact form into `components/sections/Connect.tsx` (currently socials + email CTA only).
3. **Turnstile** on both forms (`@cloudflare/turnstile` widget; site key public, secret server-only).
4. **Legal** — `/privacy` + `/terms` route pages (Footer already links them) + a **cookie/consent banner** that gates GA (the consent seam is already in place from Phase 0; gating is Phase 3).
5. **Calendly** — "Book a Discovery Call" CTAs (currently `#connect`) open a Calendly popup/embed via `NEXT_PUBLIC_CALENDLY_URL`.

### Entry point & order of work
1. Branch `003-forms-and-legal` (above).
2. **Env** — add server secrets `BREVO_API_KEY`, `TURNSTILE_SECRET_KEY`; public `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `NEXT_PUBLIC_CALENDLY_URL`. Document all in `.env.example`. On Cloudflare: **runtime secrets via `wrangler secret put`** (encrypted, NOT build vars); the **public** keys need to be **Workers Builds → Build vars** (or, if truly public-constant, defaulted in `lib/env.ts` like the Sanity ones).
3. **Route handlers** `app/api/newsletter/route.ts`, `app/api/contact/route.ts` — server-only, validate + authorize on the server, never trust client input.
4. **Wire forms** into the existing shells.
5. **`/privacy`, `/terms`** + consent banner.
6. `code-reviewer`, then PR (no merge, no branch delete).

## Gotchas specific to Phase 3 (read before coding)

- **Secrets are server-only.** `BREVO_API_KEY` and `TURNSTILE_SECRET_KEY` are never `NEXT_PUBLIC_*`, never committed. They must NOT live in `lib/env.ts` (that file is client-safe / public-only). Read them directly from `process.env` inside the route handlers.
- **Cloudflare: build vars vs runtime vars (learned the hard way in Phase 2).** `next build` **inlines** `NEXT_PUBLIC_*` at build time, so those must be set as **Workers Builds → Build → Variables** (a separate section that the `wrangler.jsonc` deploy does NOT wipe). Runtime-only values (Brevo/Turnstile secrets) go via `wrangler secret put` / `wrangler.jsonc vars` (the dashboard "runtime" Variables section gets wiped on every `npm run deploy`). The Sanity `projectId`/`dataset` no longer need build vars (defaulted in `lib/env.ts`); the new public Turnstile/Calendly keys WILL — or default them too.
- **CSP must grow.** `next.config.ts` currently allows GA + `cdn.sanity.io`. Phase 3 must add: Turnstile (`script-src` + `frame-src https://challenges.cloudflare.com`), Calendly (`frame-src https://*.calendly.com`, `script-src https://assets.calendly.com`). The reference list is already in the `next.config.ts` comment. `form-action 'self'` is already set (fine for same-origin POSTs to `/api/*`).
- **Verify BOTH builds before pushing** (`npm run build` + `npx opennextjs-cloudflare build`) — Phase 2 proved they diverge, and the Cloudflare Workers Builds MCP (`cloudflare-builds`) can confirm the deployed build outcome.

## Open questions / deferred (still matter)

- **Real content + assets** (PLAN.md open #6): seeded copy and social URLs are plausible placeholders Ricki refines in the Studio. Only one real photo so far (`public/ricki-reign.jpg`, 432×432 — a higher-res original is welcome). A Sanity `about.portrait` upload would activate the Meet Reign two-column layout.
- **Section names** (PLAN.md open #1): "The Practice" / "Founded & Led" are placeholders — they come from Sanity (`homePage.practice.title` / `foundedAndLed.title`), never hard-coded.
- **contactEmail** (PLAN.md open #3): confirm `welcome@rickireign.com` vs `hello@`.
- **Calendly** URL in `.env.local` is a personal test link.
- **Patreon** (PLAN.md open #4): `social.platform` enum + `SocialLinks` already support it; add the URL once live.
- **Sanity revalidation webhook** + **draft/preview mode + server-only read token**: still deferred (60s ISR for now).
- **`wrangler.jsonc` `compatibility_date` = 2025-09-01**: wrangler warns it's old; bump when convenient (low priority).
- **`client.ts` throw message** is now slightly stale (defaults always resolve, so it can't fire) — harmless, tidy whenever.

## If you're starting Phase 3 cold, know this
- Production on `main` is green on both targets; the content is real and queryable now (`*[_type=="homePage"][0]`, `*[_type=="siteSettings"][0]` via the Sanity MCP, `perspective: "published"`).
- The Newsletter/Connect **shells are designed to swap** — Phase 3 is mostly backend (route handlers + integrations) with thin UI on top.
- Schema changes need `cd studio && npm run schema:deploy`; Studio runs at `:3333` (`cd studio && npm run dev`).
- Subagents run in `.claude/worktrees/` and can't do git/network writes — consolidate their output and run git/`gh`/deploy from the main session. Never delete branches. See `CLAUDE.md` for the full rule set + Phase 0–2 gotchas.
