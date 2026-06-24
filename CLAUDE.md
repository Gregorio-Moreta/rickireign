# rickireign.com — project brief for Claude Code

Loaded every session. This is the durable operating memory. Two companion docs are authoritative:
- **`DESIGN.md`** (root) — brand/design system ("Ancestral Modernity"). Source of truth for colors, type, spacing, radii.
- **`docs/PLAN.md`** — full plan: IA, Sanity content model (§4), component inventory (§5), build phases (§7).
- **`docs/SESSION_STATE.md`** — transient handoff for the phase currently in flight. Read it to see where we are.

## What this is
A calm, premium marketing site establishing **Ricki Reign** as a founder, facilitator, and organizational leader; lets people follow her (newsletter + socials) and routes them to work with her. A visitor should leave able to answer: who is Reign, what does she do, how do I work with her. **No payments, no user accounts.** Single-scroll home + `/journal` (blog) + `/privacy` `/terms`.

## Stack & architecture
- **Next.js 16 (App Router) + TypeScript strict + Tailwind v4** (tokens in `app/globals.css` `@theme`, no `tailwind.config.ts`). React 19. Top-level `app/` `components/` `lib/` — **no `src/`**, import alias `@/*`.
- **Dual deploy: Vercel AND Cloudflare Workers** (via OpenNext, `@opennextjs/cloudflare`). Both are live and must stay green.
- **Sanity v6** for content — **standalone Studio** in `studio/` (its own package), project `zsuyhr45`, public `production` dataset. App reads published content with a **token-less CDN client**.
- **GA4** via `@next/third-parties` (consent seam in place, gating is Phase 3). **Brevo** (newsletter, Phase 3), **Calendly** (booking), **Cloudflare Turnstile** (forms, Phase 3).
- Node **24** is pinned (`.node-version`) so local/Vercel/Cloudflare all use npm 11.

## Repo layout
- `app/`, `components/{layout,ui,analytics}/`, `lib/` (`env.ts`, `cn.ts`, `fonts.ts`, `sanity/{client,image,queries}.ts`) — the Next.js app.
- `studio/` — standalone Sanity Studio (`sanity.config.ts`, `sanity.cli.ts`, `structure.ts`, `schemaTypes/{documents,objects}`). Has its own `package.json` + lockfile; excluded from the app's tsc & eslint.
- `next.config.ts` — security headers + CSP. `wrangler.jsonc` + `open-next.config.ts` — Cloudflare. `vercel.json` — pins Vercel framework.

## Rules for every session
- **Plan first.** Non-trivial work gets a plan approved before code (the human signs off at the plan and again before merge).
- **Never delete branches.** No `gh pr merge --delete-branch`, no `git branch -D`, no `git push --delete` unless explicitly asked for a named branch. Every branch lives on **both** local and the remote. Numbered branches `NNN-summary` (`000-foundation`, `001-content-model`, `002-…`), Conventional Commits, co-author trailer `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
- **Secrets server-only.** Only genuinely public values get `NEXT_PUBLIC_*`. Server secrets (Brevo key, Turnstile secret, Sanity tokens) are never `NEXT_PUBLIC_`, never committed (`.env*` gitignored except `.env.example`). On Cloudflare, `NEXT_PUBLIC_*` are **plaintext build vars** (correct — they're public); un-prefixed secrets become encrypted secrets (Phase 3).
- **Sanity reads are token-less** (public dataset via CDN). The app must never carry a write/editor token.
- Subagents exist (`frontend-builder`, `backend-builder`, `code-reviewer`, `git-manager`, `qa-tester`) and run in **isolated worktrees** under `.claude/worktrees/` — their output must be consolidated onto the working branch. They are **sandboxed and cannot do git writes** or interactive logins — run `git add/commit/push`, `gh pr`, and `vercel`/`sanity` logins **from the main session** (Bash with `dangerouslyDisableSandbox: true` for git/network).
- The `house-style`, `secure-defaults`, `context-economy`, `git-conventions` skills apply automatically; `frontend-builder` uses UI/UX Pro Max (DESIGN.md wins on brand).

## Commands (exact)
```bash
# App
npm run dev                       # dev server :3000
npm run build                     # next build (Turbopack) — the Vercel build
npm run lint && npx tsc --noEmit  # must be clean before commit
npm test                          # Vitest unit (lib/*; fast, no server, no secrets)
npm run test:e2e                  # Playwright E2E vs `next start` :3000 (Vercel-equivalent)
npm run test:e2e:cf               # Playwright E2E vs CF workerd preview :8787 (OpenNext)
npm run test:e2e:live             # gated real-Brevo form flows (RUN_LIVE_FORMS; SENDS real email)
npm run deploy                    # opennextjs-cloudflare build && deploy (also the CF dashboard deploy cmd)
npm run preview                   # build + run the Worker locally (workerd)
npx opennextjs-cloudflare build   # produce .open-next/worker.js only

# Studio (standalone — run from studio/)
cd studio && npm run dev          # Studio :3333
cd studio && npm run schema:deploy  # = sanity schema deploy (needed before MCP/typegen see new types)
cd studio && npx sanity build       # validate Studio compiles
cd studio && npx sanity deploy      # deploy Studio to *.sanity.studio hosting

# Sanity auth + seed
npx sanity@latest login --provider github   # CLI login (interactive; run via `! ...` in-session)
# Seeding/content: use the Sanity MCP (create_documents → publish_documents). Do NOT use `sanity init` (its TUI doesn't drive through the agent).

# Deploy/inspect
vercel --prod                     # deploy main to Vercel prod (CLI is authed; `! vercel login` if not)
gh pr create --base main --head <branch>   # PRs from the main session
```

## Key decisions & why
- **Dual deploy (Vercel + Cloudflare).** The human wants both as a safety net; treat both as first-class. (Expanded beyond the original Vercel-only plan, deliberately.)
- **Standalone Studio, not embedded `/studio`.** Embedding compiles the Studio into *both* the Vercel and Cloudflare builds (slow, heavy), needs Studio CORS+CSP, and ties Studio updates to app redeploys. Sanity recommends standalone for new Next.js. The app only `next-sanity`-fetches.
- **Token-less CDN read client + public dataset.** Public marketing content; `secure-defaults`. Server-side reads in Server Components mean the public site needs **no CORS** and **no token** anywhere.
- **CORS scoped to `localhost:3000` + `https://rickireign.vercel.app`, never `*.vercel.app`.** A credentialed wildcard would let any `*.vercel.app` site ride a logged-in editor's session. The Studio (browser-credentialed) is the only thing that needs CORS; the site itself doesn't (SSR).
- **Sanity/Studio points at `rickireign.vercel.app` (dev/staging), not `rickireign.com`.** The real domain still hosts the *old* site we're replacing; cut over later.
- **One dataset; environment differences come from Vercel's built-ins** (`VERCEL_ENV`/`VERCEL_URL`), not per-env datasets — keep it simple.

## Gotchas (don't re-learn these the hard way)
- **EPIPE on Vercel build:** `initOpenNextCloudflareForDev()` only guards on AsyncLocalStorage, so it runs during `next build` and crashes with `unhandledRejection: write EPIPE`. It is guarded in `next.config.ts` with `if (process.env.NODE_ENV === "development")` + dynamic import. Keep that guard.
- **Cloudflare `npm ci` "Missing esbuild from lock":** caused by an npm-version mismatch (CF defaulted to Node 22/npm 10 reading an npm-11 lockfile). Fixed by `.node-version` = 24. Keep local npm and CI aligned.
- **Vercel "No Output Directory named public":** Vercel auto-detected framework "Other". Fixed by `vercel.json` `{"framework":"nextjs"}`.
- **Cloudflare deploy via `wrangler.jsonc` overrides remote Worker config:** it wipes dashboard *runtime* vars and re-enables `workers_dev`/`preview_urls` each deploy. Manage runtime env via `wrangler.jsonc` `vars` / `wrangler secret put`. (Build vars used by `next build` are separate Workers-Builds settings and are NOT wiped.)
- **`NEXT_PUBLIC_*` are inlined at `next build` time** → on Cloudflare they must be **Workers-Builds *build* vars**, NOT the runtime Variables section (which `next build` never reads and `wrangler.jsonc` wipes). Phase 2 deploys failed repeatedly (`/_not-found` threw "Missing NEXT_PUBLIC_SANITY_*") until this was understood. Because the Sanity `projectId`/`dataset` are public constants, `lib/env.ts` now commits them as defaults (`process.env.… || "zsuyhr45"` / `"production"`) so the build can't break on a missing build var; an env var still overrides. Apply the same default-or-build-var rule to future public keys (Turnstile site key, Calendly URL); keep real **secrets** out of `lib/env.ts` and out of `NEXT_PUBLIC_*`.
- **ESLint flat config ignores `.gitignore`.** Generated/foreign dirs must be in `eslint.config.mjs` `globalIgnores`: `.next`, `.open-next`, `.wrangler`, `.vercel`, `studio/**`. Otherwise ESLint walks bundled JS and reports thousands of errors.
- **App `tsconfig.json` excludes `studio`** (its `**/*.ts` include would otherwise typecheck the Studio with the wrong config).
- **`@sanity/image-url` is a required direct dep** — `next-sanity` does NOT bundle it. Import the **named** `createImageUrlBuilder` (default export is deprecated); `SanityImageSource` is on the package's main entry (not `/lib/types/types`).
- **Sanity seeding order:** publish referenced docs (e.g. `business`) **before** creating the doc that references them (`homePage`), or the mutation fails "references non-existent document." Singletons use a fixed `_id` (`siteSettings`, `homePage`) so the Studio Structure maps to them.
- **The guard hook blocks any Bash command containing the literal `.env`** (even in an echo/grep comment). Avoid that substring in commands.

## Deploy targets (reference)
- **Vercel:** project `rickireign` (prod `https://rickireign.vercel.app`). Deployment Protection is off. (A duplicate `rickireign-zb6j` project was removed — keep a single project.)
- **Cloudflare:** Worker `rickireign` (prod `https://rickireign.gregoriomoreta4.workers.dev`). Dashboard deploy command = `npm run deploy`.

## Build phases (docs/PLAN.md §7)
0 Foundation ✓ · 1 Content model ✓ · 2 Home ✓ (PR #4) · 3 Forms & legal ✓ (PR #5 + fix-round PR #6) · 4 Blog ✓ (PR #7) · 5 Verify & ship ✓ (PR #8, merged). All six build phases complete. Post-launch work now lands on numbered branches that are **not** build phases: **`006-home-reframe` ✓ delivered (home reframe + dark mode + a11y + CSP + Sentry + webhook + tags→reference; PR open, not merged).** **Next is a final production-readiness pass** (see `docs/SESSION_STATE.md`), not a build phase.

## Phase 3 facts (Forms & legal — don't re-learn)
- **Brevo:** account `gregorioe.moreta@gmail.com`. Newsletter list id `3` ("Newsletter — rickireign.com"); DOI template id `1` (tagged `optin`, confirm button → `{{ doubleoptin }}` — required for forms hosted OUTSIDE Brevo). Transactional sender = `BREVO_SENDER_EMAIL` (currently the verified gmail; verify a `rickireign.com` domain sender for prod). Server secrets read straight from `process.env` in `lib/{brevo,turnstile}.ts` (imported only by `app/api/{newsletter,contact}/route.ts`), never `lib/env.ts`.
- **Turnstile:** dev/CI used Cloudflare's official TEST keys (always-pass). Real widget keys are now live; the **public site key + Calendly URL are committed as defaults in `lib/env.ts`** (public values — same default-or-build-var rule as Sanity), so Cloudflare needs no build vars for them. The **secret** key is server-only.
- **Deploy env (both targets set):** Vercel env (secrets + public) set via `vercel env add` (CLI authed) for **production** and the **preview branch** — preview needs the branch arg (`vercel env add NAME preview <branch> --value … --yes --force`); plain `preview` refuses to auto-pick "all branches" non-interactively. **Cloudflare runtime secrets** (`BREVO_*`, `TURNSTILE_SECRET_KEY`) set via `wrangler secret put` after `wrangler login` (account `gregoriomoreta4@gmail.com`) — they persist across the wrangler.jsonc deploy (encrypted *secrets* aren't wiped; plaintext *vars* are). `wrangler` is **not** authed in CI (deploys run in Workers Builds), so secret changes need a local `wrangler login` or the dashboard (Settings → Variables and Secrets → type *Secret*).
- **CSP** grew for Turnstile (`challenges.cloudflare.com` script/frame/connect) + Calendly (`assets.calendly.com` script/style, `*.calendly.com` frame/img). `frame-src` is now explicit (was falling back to `default-src 'self'`).
- **Booking CTAs** open Calendly by **label match** (`/discovery call/i` in `CtaButton`), NOT a Sanity content/schema change — the live site shares one dataset, so CTAs must stay valid anchors there too; unmatched labels fall back to the `#connect` anchor.

## Phase 3 fix-round facts (don't re-learn)
- **Calendly:** real **"Discovery Call"** event (one-on-one, 60 min, slug `discovery-call`, active) created via the Calendly API. CSP `frame-src` must include the **apex `https://calendly.com`** (the popup iframes the apex; `*.calendly.com` does NOT match it). Calendly event-type creation IS possible via the API now but needs a Personal Access Token (not stored — used transiently, then revoked).
- **GA:** the working id is the **measurement id `G-RLM87R4BM5`** (NOT the numeric Stream ID — that loads a broken tag, no data, no cookies). Committed as the `lib/env.ts` default. GA loads **only on production hosts** (allowlist in `Analytics.tsx`) — never localhost/preview. On consent decline/withdrawal: `ga-disable-<id>` flag set + `_ga`/`_gid` cookies deleted.
- **Consent** is a centered modal (`role=dialog`, focus-trap, scroll-lock); footer **"Cookie settings"** re-opens it (GDPR withdrawal). Global opt-in: GA never loads pre-consent.
- **In-page nav** uses `SectionLink` + `HashScroll` + `lib/scroll.ts` (smooth scroll, clean URL on home, `/#section` from other routes, sticky-nav offset). Don't reintroduce bare `#anchor` hrefs — they break nav on `/privacy` `/terms`.
- **Rate limiting** (`lib/rate-limit.ts`) is in-memory/per-instance only — won't persist across Cloudflare isolates; it's a layer on Turnstile, not a global guarantee.
- **Security headers** now include **HSTS**. **Legal** text is expanded for GDPR/CCPA + NY governing law, but still wants a lawyer review before public launch.
- **End-of-phase ritual:** use the **`/phase-handoff`** skill (`.claude/skills/phase-handoff/`).

## Phase 4 facts (Blog / "Journal" — don't re-learn)
- **Routes:** `/journal` (index), `/journal/[slug]` (detail, `generateStaticParams` + per-post `generateMetadata`), `/journal/tag/[tag]` (indexable tag pages). Plus `app/sitemap.ts` + `app/robots.ts`. All Server Components, 60s ISR via the existing `sanityFetch`. The folder is `app/journal/`; **`/blog/*` 308-redirects to `/journal/*`** (`next.config.ts`). (Internal component dir is still `components/blog/` — name only, not a URL.)
- **`tag` is a RESERVED key in Sanity `QueryParams`** (typed `never`). A GROQ param `$tag` fails tsc — `POSTS_BY_TAG_QUERY` uses **`$tagName`** (`{ tagName: tag }`).
- **Tags are free-text strings** → slugified for URLs (`lib/tags.ts` `slugifyTag`), resolved back via `TAGS_QUERY` + `resolveTagSlug`.
- **Per-post SEO = the optional `seo` object on `post`** (added Phase 4, schema deployed). `generateMetadata` uses it if filled, else derives `title`/`excerpt`/`coverImage` (Option B). Same default-or-override rule as the rest of the content model.
- **`PostBody`** is a richer Portable Text map than `MeetReign` (headings, lists, blockquote, link marks with external `target=_blank rel=noopener`, inline images sized from the asset ref `image-<id>-<W>x<H>-<fmt>`). Reuse it; don't re-derive the block map.
- **Seeded content:** `author` `Ricki Reign` (`_id author-ricki-reign`) + 2 published posts (`leading-from-the-body`, `ancestral-remembering`). Placeholders — Ricki replaces in the Studio. Publish author before posts (reference order).
- **"Journal"** is the nav label (not "Blog"); a real route → `next/link` in `Nav` + `Footer`, NOT a `SectionLink` anchor.
- Blog adds **no new env or CSP origins** (Sanity image CDN already allowed).
- **Card uniformity:** `BlogCard` clamps title to 2 lines + excerpt to 3 lines (reserved via `min-h-[Nlh]`), pins tags to a common bottom, and **always renders a 3:2 cover** — posts with no image get `CoverFallback` (branded gradient panel). The **detail page also renders `CoverFallback`** when a post has no cover (same consistency). Mixed cover/no-cover cards looked ragged; don't reintroduce a conditional cover.
- **Slugs are enforced URL-safe** (`post.slug` has a custom `slugify` + a `validation` regex `^[a-z0-9-]+$`). A slug with a space 404s the `/journal/[slug]` route — this guard prevents it on manual entry.
- **Hosted Studio is DEPLOYED** at **https://rickireign.sanity.studio** (`studioHost: "rickireign"` + `deployment.appId` in `studio/sanity.cli.ts`). This is the **no-code editor for Ricki** (add/edit/remove posts in the browser; changes hit the live site within the 60s ISR window). Reads/writes the **same `production` dataset** as the site — no separate staging content. Redeploy Studio after schema/structure changes: `cd studio && npx sanity deploy`.
- **AI cover images** for the 2 seeded posts were made via the Sanity **`generate_image` MCP** (on-brand abstract, no faces/text). Gotcha: `generate_image` writes the asset to the **DRAFT** — you must `publish_documents` to make the cover live.
- **One-click AI covers in the Studio:** `@sanity/assist` is installed + `assist()` is in `studio/sanity.config.ts`; `post.coverImage` has an `instruction` prompt subfield + `options.aiAssist.imageInstructionField` (pre-filled with the brand art direction). Editors click **✨ Generate** on the cover to get on-brand art — runs through the authenticated Studio session, **no app/site write token** (token-less site preserved). AI Assist is an **experimental** Sanity feature. `CoverFallback` remains the silent safety net if a post still has no image.
  - **GOTCHA / blocked:** the in-Studio Generate currently errors **"Project is not allowed to use this feature"** — AI **image** generation is gated by the Sanity **plan/add-on** (enable in sanity.io/manage → Plan). The button + wiring are left in place (user chose "decide later") and will work once enabled. The **agent/MCP `generate_image` path IS entitled** for this project (it made the 2 seeded covers) — use that to generate covers on request meanwhile.
- **Tags: free-type + preset picker.** Custom `studio/components/TagInput.tsx` (wired via `components: { input }` on `post.tags`) lets editors free-type any tag AND pick from the preset `POST_TAGS` (`studio/schemaTypes/postTags.ts`) shown as a datalist + one-click chips. **Stores plain strings**, so `/journal/tag` queries/types are unchanged. (Native `options.list` only renders checkboxes — no free-type; `sanity-plugin-tags` stores objects — would ripple into queries. Hence the custom input.) Add a preset by appending `POST_TAGS` + redeploy. No-code editor-managed tags (reference `tag` doc type) deferred.

## Phase 5 facts (Verify & ship — don't re-learn)
- **Two test layers, both green.** **Vitest** (`tests/unit/`, node, `fetch` mocked) covers `lib/{validation,brevo,rate-limit,turnstile}` — the server logic E2E can't prove deterministically (DOI call shape, honeypot, CRLF guard, rate-limit windows, Turnstile fail-closed). **Playwright** (`tests/e2e/`, chromium) covers the flows against **both** deploy targets' local servers (`test:e2e` → `next start`; `test:e2e:cf` → CF workerd preview): Journal list→detail→tag→404, `/blog` 308, in-page nav, Calendly out-link, responsive, no console errors.
- **Consent modal blocks E2E clicks.** `ConsentBanner` renders a full-screen scrim on first visit (cookie `rr-consent` null). The shared **`tests/e2e/fixtures.ts`** pre-seeds `rr-consent=denied` (domain-scoped → works on :3000 and :8787). **New specs must `import { test } from "./fixtures"`, not `@playwright/test`.**
- **Turnstile in E2E:** the real site key is **domain-locked** (unusable headless on localhost — the widget logs errors and never solves). E2E injects Cloudflare's **always-pass TEST keys** via `playwright.config.ts` `webServer.env` when `TURNSTILE_TEST_KEYS=1`. `next start` gives `process.env` precedence over the local env file, so the test keys override the public site key while **real Brevo secrets still load** → live forms hit real Brevo.
- **Live form tests are gated** behind `RUN_LIVE_FORMS=1` (`test:e2e:live`) because the happy paths **send real email** (DOI + transactional). The default `test:e2e` includes the spec but it self-skips → green gate sends nothing.
- **`role="alert"` collides with Next's route announcer** — scope form-error assertions to the form (`form.getByRole("alert")`).
- **Playwright `await use(...)` fixture param** trips `react-hooks/rules-of-hooks` (React 19 `use`); disabled for `tests/**` in `eslint.config.mjs`. **Don't run every spec per-viewport** — responsive loops viewports inside one spec so live/form specs run once (not 4× real emails).
- **`npm audit` highs are tooling-only** (`wrangler`/`miniflare`/`undici`, `sanity` CLI `ws`/`typeid-js`) — not in the deployed runtime, pre-existing. A non-breaking `npm audit fix` pass is deferred (carry-over).
- **Phase 5 added no app code, no new env, no CSP origin** — test/config/docs only. Both prod targets were deployed from `005-verify-ship` and smoke-verified (routes 200, `/blog`→308→`/journal`, bad slug→404).

## Home reframe + hardening facts (`006-home-reframe` — don't re-learn)
- **Home now EXPLAINS, doesn't convert.** Identity = **leadership strategist**; **no booking CTA on home**. "The Practice" + "Founded & Led" merged into one **"The Work"** (`#work`) with 3 arena cards (Exhale, CBV external; **Somatics** → internal **`/somatics`**). About is above The Work. `/somatics` is the **only** page with a booking CTA. `homePage.theWork` + `somaticsPage` singleton (schema + Studio deployed). Driven by Ricki's 6/22 input in `docs/planning/ricki-input/`.
- **Dark mode** (site-wide, follow-system + persisted toggle): plain `.dark { --color-* }` in `globals.css` (unlayered → overrides `@theme`) flips everything with no per-component `dark:` classes. The dark palette is **brand-DERIVED** (DESIGN.md only specs light) — **flag for Ricki**. `inverse-surface`/`*-fixed`/filled-button tokens are **deliberately not flipped** (footer/buttons stay constant); `primary` → light green in dark. Anti-FOUC inline script in `<head>` (`lib/theme.ts` `THEME_INIT_SCRIPT`) + `suppressHydrationWarning` on `<html>`; `ThemeToggle` via `useSyncExternalStore`. `Section` has a `tone` (base/alt/contrast) + a `band` token for the "contrast" band.
- **Booking** `BookingButton` is now a **link** (`role=link`) with a ~3.5s watchdog fallback to the scheduling page if the popup is blocked/hung. Tests use `getByRole("link", { name: /discovery call/i })`.
- **Sentry** installed (`@sentry/nextjs` v10), **DSN-gated dormant**, privacy-tuned (no PII/Replay/logs), `tunnelRoute: "/monitoring"`. Server/edge DSN falls back to `NEXT_PUBLIC_SENTRY_DSN`. **Verified working.** Project: org `example-1wv`, project `ricki-reign`; DSN is public (in `.env.example` shape). Env set on Vercel + Cloudflare (build vars) + `.env.local`. Both builds + workerd OK with it. `docs/SENTRY.md` is the plan.
- **Sanity publish webhook** `app/api/revalidate` (HMAC verify + `revalidatePath("/","layout")`) — **built, NOT activated** (needs `SANITY_REVALIDATE_SECRET` on deploys + registering the hook). Next 16 changed `revalidateTag` → `(tag, profile)`; use `revalidatePath`.
- **Tags are now a `tag` reference doc type** (title + URL-safe slug; no-code in Studio). `post.tags` = references; queries expand `tags[]->{title, slug}`; `POSTS_BY_TAG_QUERY` param is **`$tagSlug`**. The old free-text `TagInput`/`postTags`/`lib/tags` are **deleted** (supersedes the Phase 4 "tags are free-text strings" note).
- **a11y:** `@axe-core/playwright` + `tests/e2e/a11y.spec.ts` (5 pages × both themes) = **0 violations**; Lighthouse a11y 100. Lighthouse perf 54–74 (the two **Turnstile** widgets dominate — a perf pass is deferred). Inputs have visible borders; focus rings are luminous-teal.
- **CSP** added `upgrade-insecure-requests` + `Cross-Origin-Opener-Policy: same-origin`. `script-src` keeps `'unsafe-inline'` **on purpose** — a nonce is incompatible with static/ISR caching + App Router inline hydration scripts (documented in `next.config.ts`).
- **`npm audit fix` is not worth it** — only churns the lockfile; the advisories are tooling-only (not in the deployed runtime).
- **Finder " 2" duplicate dirs** (`.open-next 2`, etc.) dodge anchored gitignore and leaked a Brevo key once (caught by GitHub push protection). `.gitignore` now globs `/.open-next*`, `/playwright-report*`, `/test-results*`.

## Launch-prep carry-over (restate until done)
Remaining for the **final production-readiness pass**: **merge + deploy** `006-home-reframe`; **verify Sentry in prod** (source maps + `/monitoring` tunnel under workerd); **activate the publish webhook** (`SANITY_REVALIDATE_SECRET` + register the hook); **domain cutover** (apex still hosts the old site); Brevo **`rickireign.com` domain sender**; **lawyer review** of `/privacy`+`/terms` (+ an error-monitoring line); Ricki to review **copy + the brand-derived dark palette + AI card images**; optional **performance** pass (Turnstile) and **Session Replay** decision. (Done this branch: publish webhook built, tags→reference, `npm audit fix` assessed.)

## Don't
Don't add Supabase (this is Sanity). Don't invent brand values (DESIGN.md). Don't embed the Studio. Don't expand scope past the approved plan without checking in. Don't reach for a dependency the stack already covers.
