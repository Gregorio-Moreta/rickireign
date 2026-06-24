# Session State — post-ship (Phase 5 delivered; launch prep)

_Transient doc. Reflects state as Phase 5 (Verify & ship) is delivered (2026-06-23). All six build phases (0–5) are complete. Durable facts/rules live in `CLAUDE.md`._

## Where we are

**Phases 0–5 are complete.** Phase 5 (Verify & ship) is delivered on branch `005-verify-ship` (PR open, **not merged** — awaiting human sign-off; `main` is ready-on-merge).

- **Both prod targets were deployed from this branch and smoke-verified (2026-06-23):**
  - Vercel: `https://rickireign.vercel.app` (aliased) — all routes 200, `/blog`→308→`/journal`, bad slug→404.
  - Cloudflare: `https://rickireign.gregoriomoreta4.workers.dev` — same checks 200/308/404.
  - Phase 5 changed **no app code** (test/config/docs only), so the deployed app bundle equals `main`'s.
- **Full verification green** for head SHA `01c6102`: `lint` + `tsc` clean; Vitest **23/23**; Playwright **21 pass / 3 gated** on **both** server targets (`next start` :3000 and CF workerd preview :8787); live-forms **3/3** against **real Brevo**; `next build` + `opennextjs-cloudflare build` both succeed.
- Branches kept (no-delete rule): `000-foundation`, `001-content-model`, `002-home`, `docs/phase-2-handoff`, `003-forms-and-legal`, `fix/phase-3-forms-legal`, `004-blog`, `005-verify-ship`, `main`.

## What Phase 5 delivered (on `005-verify-ship`)

**The test runner — none existed before.** Two layers:

**Vitest unit (`tests/unit/`, node env, `fetch` mocked)** — server logic E2E can't prove deterministically:
- `validation.test.ts` — email normalise/max, CRLF header-injection guard on name, message bounds, honeypot.
- `rate-limit.test.ts` — under/at-limit, window reset, per-key isolation.
- `brevo.test.ts` — `createDoiContact` DOI call shape + "already exists" benign-success path; `sendContactEmail` reply-to + HTML escaping; error → not-ok.
- `turnstile.test.ts` — `verifyTurnstile` success/fail + fail-closed (missing secret, network error).

**Playwright E2E (`tests/e2e/`, chromium)** — critical flows, run against **both** deploy targets' local servers:
- `journal.spec.ts` — list → detail (article OG) → tag filter → 404 (bad slug + bad tag) → `/blog` 308 redirect.
- `nav.spec.ts` — SectionLink in-place scroll (clean URL), Journal route link, cross-route from `/privacy`, mobile menu.
- `calendly.spec.ts` — Discovery Call CTA opens Calendly with the right scheduling URL (assets stubbed, no network).
- `responsive.spec.ts` — 375/768/1024/1440, no horizontal overflow on `/` and `/journal`.
- `console.spec.ts` — no console errors across `/`, `/privacy`, `/terms`, `/journal`, a post.
- `forms.live.spec.ts` (**gated** by `RUN_LIVE_FORMS=1`) — **real Brevo**: newsletter DOI happy + invalid, contact submit.
- `fixtures.ts` — shared base that pre-seeds the `rr-consent` cookie so the consent modal scrim doesn't intercept clicks.

**Tooling:** `playwright.config.ts` (configurable `webServer` + Turnstile test-key injection), `vitest.config.ts` (`@/*` alias), `package.json` scripts (`test`, `test:watch`, `test:e2e`, `test:e2e:cf`, `test:e2e:live`), artifact dirs ignored in `.gitignore` + `eslint.config.mjs`, and a `tests/**` ESLint override for the Playwright-`use`/React-hooks clash.

## How to run the tests (the durable bit)
```bash
npm test               # Vitest unit (fast, no server, no secrets)
npm run test:e2e       # Playwright vs `next start` :3000 (Vercel-equivalent bundle)
npm run test:e2e:cf    # Playwright vs CF workerd preview :8787 (OpenNext target)
npm run test:e2e:live  # gated real-Brevo form flows (sends real email; needs Brevo secrets + sends DOI)
```
- E2E boots the server with Cloudflare's **always-pass Turnstile TEST keys** (injected via `playwright.config.ts` `webServer.env` when `TURNSTILE_TEST_KEYS=1`) because the real site key is **domain-locked** — on localhost the live widget logs errors and never solves. `next start` gives `process.env` precedence over the local env file, so the test keys override while **real Brevo secrets** still load.
- The default `test:e2e` run includes `forms.live.spec` but it **self-skips** unless `RUN_LIVE_FORMS=1`, so no email is sent and no secrets are needed for the green gate.

## There is no Phase 6 — next is launch prep, not a build phase
`docs/PLAN.md §7` ends at Phase 5. The site is feature-complete and live on both targets (dev/staging domains). The remaining work is **launch readiness**, all carry-over (see below). A future session would pick up those items or respond to new requests — **plan-first** as always.

## Deploy env status
- **Vercel:** prod + preview env set since Phase 3. Public keys (GA id, Turnstile site key, Calendly URL) default in `lib/env.ts`. No new env in Phases 4–5.
- **Cloudflare:** runtime secrets (`BREVO_*`, `TURNSTILE_SECRET_KEY`) set via `wrangler secret put` (persist across `npm run deploy`). Public keys default in code.

## Gotchas specific to Phase 5 (don't re-learn)
- **Consent modal blocks E2E clicks.** `ConsentBanner` renders a full-screen scrim (`layer-banner ... fixed inset-0`) on first visit (when `rr-consent` cookie is null), intercepting pointer events. The shared `tests/e2e/fixtures.ts` pre-seeds `rr-consent=denied` (domain-scoped, works for :3000 and :8787) so the modal never shows. Any new spec must `import { test } from "./fixtures"`, not `@playwright/test`.
- **Real Turnstile site key is domain-locked** → unusable in headless localhost. Use the always-pass TEST keys for E2E (see run section above). The MCP/agent path and prod hosts use the real keys.
- **`role="alert"` collides with Next's route announcer** (`#__next-route-announcer__`). Scope form-error assertions to the form (`form.getByRole("alert")`), not the page.
- **Playwright `await use(...)` fixture param** trips `react-hooks/rules-of-hooks` (React 19 `use`). Disabled for `tests/**` in `eslint.config.mjs`.
- **Don't run all specs per-viewport.** Responsive breakpoints are looped inside `responsive.spec.ts`; the form/live specs must run **once**, not once per viewport (would multiply real-email side-effects).
- **`npm audit` highs are tooling-only** (`wrangler`/`miniflare`/`undici`, `sanity` CLI `ws`/`typeid-js`) — not in the deployed runtime, pre-existing, not from Phase 5. A non-breaking `npm audit fix` maintenance pass is deferred.

## Open questions / carry-over (still matter — restate each handoff until done)
- **Brevo prod sender** — verify a `rickireign.com` domain sender (DOI + contact still send via a `brevosend.com` wrapper / the verified gmail).
- **Lawyer review** of `/privacy` + `/terms` before public launch.
- **Domain cutover** — Sanity/Studio + deploys point at `rickireign.vercel.app` (dev/staging); the apex still hosts the OLD site. Cut over when ready.
- **Sanity revalidation webhook + draft/preview** — deferred; posts rely on 60s ISR (new posts appear within the window, not instantly).
- **Real blog content + cover images** — the 2 seeded posts are placeholders; Ricki replaces/extends in the hosted Studio (`rickireign.sanity.studio`).
- **Sanity AI image add-on** — Studio ✨ Generate is wired but **plan-gated** ("Project is not allowed to use this feature"); enable in sanity.io/manage → Plan, or build a free auto-cover pipeline. The MCP `generate_image` path IS entitled meanwhile.
- **No-code tag management** — promote free-text tags to a reference `tag` doc type if Ricki wants to manage them in the Studio.
- **contactEmail** — `welcome@rickireign.com` live/monitored; confirm canonical vs `hello@`.
- **Calendly** — Discovery Call event is live; URL is the personal account (`gregorioe-moreta/discovery-call`) — swap if Ricki uses another.
- **Dependency hygiene** — run a non-breaking `npm audit fix` pass for the tooling-only advisories.

## If you're starting cold, know this
- All six phases done; prod is live + tested on both targets; content is real and queryable via the Sanity MCP (`perspective: "published"`).
- Run the test suites before any change that touches forms, nav, or the Journal (`npm test` + `npm run test:e2e`).
- Schema changes need `cd studio && npm run schema:deploy` + `npx sanity deploy`; Studio runs at `:3333`.
- Run the end-of-phase ritual with the **`/phase-handoff`** skill. Subagents can't do git/network writes — run git/`gh`/deploy from the main session. Never delete branches. See `CLAUDE.md` for the full rule set + Phase 0–5 gotchas.
