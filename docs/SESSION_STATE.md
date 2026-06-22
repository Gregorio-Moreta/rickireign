# Session State — handoff into Phase 4 (Blog)

_Transient doc. Reflects state as Phase 3 (Forms & legal) + its fix/hardening round are delivered (2026-06-22). When Phase 4 ships, rewrite this for Phase 5. Durable facts/rules live in `CLAUDE.md`._

## Where we are

**Phases 0–3 are complete.**
- Original Phase 3 is **merged to `main`** via **PR #5** (merge commit `d759724`).
- A **Phase 3 fix + hardening round** is delivered via a **new PR (`fix/phase-3-forms-legal` → main)** which bundles this handoff. `main` is Phase-4-ready the moment that PR merges. **Not merged yet — awaiting human sign-off.**

- **Both builds pass** (`npm run build` + `npx opennextjs-cloudflare build`); lint + tsc clean. Confirm both CI deploys green on the fix-PR head SHA before relying on it.
- **Live-tested end-to-end (real browser):** newsletter → Brevo DOI email **delivered**; **contact form → Brevo transactional email delivered** to `welcome@rickireign.com` (Brevo events confirm both). Calendly popup opens the real Discovery Call calendar. Consent accept/decline/withdraw + rate-limit 429 verified.
- Branches kept (no-delete rule): `000-foundation`, `001-content-model`, `002-home`, `docs/phase-2-handoff`, `003-forms-and-legal`, `fix/phase-3-forms-legal`, `main`.

### First steps in Phase 4
```bash
git checkout main && git pull origin main      # after the fix PR merges
git checkout -b 004-blog
git push -u origin 004-blog
```

## What the fix/hardening round delivered (in the new PR)

- **Calendly fixed** — the CTA pointed at a non-existent `discovery-call` event (404'd to Calendly's marketing page). Created a real **"Discovery Call"** one-on-one **60-min** event via the Calendly API (slug `discovery-call`, active); CSP `frame-src` now also allows the **apex** `https://calendly.com` (the popup iframes the apex; `*.calendly.com` did NOT match it).
- **Navigation fixed** — header/footer used bare `#anchor` hrefs that did nothing on `/privacy` `/terms` and littered the URL. New `components/layout/SectionLink.tsx` + `HashScroll.tsx` + `lib/scroll.ts`: smooth-scroll with a clean URL on home, navigate to `/#section` from other routes, sticky-nav offset, reduced-motion respected. `CtaButton` in-page targets scroll cleanly too.
- **Consent UX + GDPR** — `ConsentBanner` is now a **centered modal** (scrim, `role=dialog`, focus-trap, scroll-lock, reduced-motion). Footer **"Cookie settings"** (`CookieSettingsButton`) re-opens it (withdrawal as easy as consent). On decline/withdrawal: GA `ga-disable` flag set **and** `_ga`/`_gid` cookies deleted (`clearAnalyticsCookies`).
- **GA fixed** — was using the numeric **Stream ID**; corrected to measurement id **`G-RLM87R4BM5`** (committed default in `lib/env.ts`). GA now loads **only on production hosts** (allowlist in `Analytics.tsx`: `rickireign.vercel.app`, `rickireign.com`, `www`, the workers.dev host) — never localhost or preview.
- **Rate limiting** — `lib/rate-limit.ts` (in-memory sliding window, 5/IP/10min) on both API routes, layered on Turnstile + honeypot. **Caveat:** per-instance only (won't persist across Cloudflare isolates) — for hard global limits use Cloudflare WAF / Vercel Firewall.
- **Security headers** — added **HSTS** (`max-age=63072000; includeSubDomains`).
- **Legal** — privacy policy expanded for GDPR/CCPA (controller, lawful bases, cookie list, processors, international transfers, full rights + supervisory-authority complaint, children, no-sale); **Terms governing law = New York** (venue NY County). Both still want a lawyer review before public launch.
- **Icons** — social icons enlarged to 28px in 48px tap targets (≥ WCAG AAA).
- **Tooling** — added `.claude/skills/phase-handoff/` (this ritual as a `/phase-handoff` skill).

## What original Phase 3 delivered (already in `main`)

Newsletter DOI (`/api/newsletter`, Brevo list `3` + DOI template `1`), Contact (`/api/contact` → transactional to `siteSettings.contactEmail`), Turnstile on both, honeypot, server-only secret libs (`lib/{validation,turnstile,brevo,http,constants}.ts`), `/privacy` + `/terms` (`Prose`), the consent seam, CSP for Turnstile + Calendly, `zod`.

## Deploy env status

- **Vercel:** Phase 3 env set for **production** + the `003-forms-and-legal` preview branch (`BREVO_API_KEY`, `BREVO_LIST_ID`=3, `BREVO_DOI_TEMPLATE_ID`=1, `BREVO_SENDER_EMAIL`, `TURNSTILE_SECRET_KEY` `--sensitive`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `NEXT_PUBLIC_CALENDLY_URL`). **TODO at merge:** add the same env to the new `fix/phase-3-forms-legal` preview branch if you want its preview deploy functional, and confirm no stale numeric GA var overrides the `G-` default. Public keys (GA id, Turnstile site key, Calendly URL) all default in `lib/env.ts`, so prod works without build vars.
- **Cloudflare:** runtime secrets SET via `wrangler secret put` (account `gregoriomoreta4@gmail.com`); persist across `npm run deploy`. Public keys default in code.

## Phase 4 — Blog (the goal)

Per PLAN.md §3, §4 (`post`/`author` schemas already exist), §7. Routes `/blog` + `/blog/[slug]`, `BlogCard`, Portable Text for `post.body`, cover images via `SanityImage`, ordered by `publishedAt`, per-post SEO/OG. Decide content direction with Ricki (PLAN open #5) before building.

## Gotchas specific to Phase 4 (read before coding)
- **`post`/`author` schemas already in the Studio** (Phase 1) — confirm fields against `studio/schemaTypes` before assuming; seed via Sanity MCP (publish `author` before `post`).
- **Portable Text:** reuse the `MeetReign` `about.body` `PortableText` + component-map pattern.
- **Section nav:** use `SectionLink` for any new in-page anchors (keeps URLs clean + cross-page nav working).
- **ISR** is 60s time-based; consider the deferred publish webhook so new posts appear promptly.

## Open questions / deferred (still matter)
- **Brevo prod sender** — verify a `rickireign.com` domain sender; DOI + contact emails currently send FROM a Brevo `brevosend.com` wrapper of the gmail.
- **contactEmail** (PLAN open #3): `welcome@rickireign.com` is live + monitored (Brevo shows it opened); confirm it's the canonical address vs `hello@`.
- **Lawyer review** of `/privacy` + `/terms` before public launch.
- **Real content + assets** (PLAN open #6), **section names** (open #1), **Patreon** (open #4), **Sanity revalidation webhook + draft/preview** — deferred.
- **No test runner** — security-critical invariants covered only by manual/live testing; Phase 5 adds Playwright. Consider unit coverage for `lib/{validation,brevo,rate-limit}` if a runner lands sooner.
- **Calendly** event is real/active now; the URL is the personal account (`gregorioe-moreta/discovery-call`) — swap if Ricki uses a different account.

## If you're starting Phase 4 cold, know this
- Production on `main` is green on both targets; content is real and queryable via the Sanity MCP (`perspective: "published"`).
- Schema changes need `cd studio && npm run schema:deploy`; Studio runs at `:3333`.
- Run the end-of-phase ritual with the **`/phase-handoff`** skill.
- Subagents can't do git/network writes — run git/`gh`/deploy from the main session. Never delete branches. See `CLAUDE.md` for the full rule set + Phase 0–3 gotchas.
