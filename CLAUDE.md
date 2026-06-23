# rickireign.com — project brief for Claude Code

Loaded every session. This is the durable operating memory. Two companion docs are authoritative:
- **`DESIGN.md`** (root) — brand/design system ("Ancestral Modernity"). Source of truth for colors, type, spacing, radii.
- **`docs/PLAN.md`** — full plan: IA, Sanity content model (§4), component inventory (§5), build phases (§7).
- **`docs/SESSION_STATE.md`** — transient handoff for the phase currently in flight. Read it to see where we are.

## What this is
A calm, premium marketing site establishing **Ricki Reign** as a founder, facilitator, and organizational leader; lets people follow her (newsletter + socials) and routes them to work with her. A visitor should leave able to answer: who is Reign, what does she do, how do I work with her. **No payments, no user accounts.** Single-scroll home + `/blog` (later) + `/privacy` `/terms`.

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
0 Foundation ✓ · 1 Content model ✓ · 2 Home ✓ (PR #4) · 3 Forms & legal ✓ (PR #5 + fix-round PR #6, both merged) · 4 Blog ✓ (branch `004-blog`, PR open, not merged) · **5 Verify & ship**.

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
- **Routes:** `/blog` (index), `/blog/[slug]` (detail, `generateStaticParams` + per-post `generateMetadata`), `/blog/tag/[tag]` (indexable tag pages). Plus `app/sitemap.ts` + `app/robots.ts`. All Server Components, 60s ISR via the existing `sanityFetch`.
- **`tag` is a RESERVED key in Sanity `QueryParams`** (typed `never`). A GROQ param `$tag` fails tsc — `POSTS_BY_TAG_QUERY` uses **`$tagName`** (`{ tagName: tag }`).
- **Tags are free-text strings** → slugified for URLs (`lib/tags.ts` `slugifyTag`), resolved back via `TAGS_QUERY` + `resolveTagSlug`.
- **Per-post SEO = the optional `seo` object on `post`** (added Phase 4, schema deployed). `generateMetadata` uses it if filled, else derives `title`/`excerpt`/`coverImage` (Option B). Same default-or-override rule as the rest of the content model.
- **`PostBody`** is a richer Portable Text map than `MeetReign` (headings, lists, blockquote, link marks with external `target=_blank rel=noopener`, inline images sized from the asset ref `image-<id>-<W>x<H>-<fmt>`). Reuse it; don't re-derive the block map.
- **Seeded content:** `author` `Ricki Reign` (`_id author-ricki-reign`) + 2 published posts (`leading-from-the-body`, `ancestral-remembering`). Placeholders — Ricki replaces in the Studio. Publish author before posts (reference order).
- **"Journal"** is the nav label (not "Blog"); a real route → `next/link` in `Nav` + `Footer`, NOT a `SectionLink` anchor.
- Blog adds **no new env or CSP origins** (Sanity image CDN already allowed).
- **Card uniformity:** `BlogCard` clamps title to 2 lines + excerpt to 3 lines (reserved via `min-h-[Nlh]`), pins tags to a common bottom, and **always renders a 3:2 cover** — posts with no image get `CoverFallback` (branded gradient panel). Mixed cover/no-cover cards looked ragged; don't reintroduce a conditional cover.
- **Hosted Studio is DEPLOYED** at **https://rickireign.sanity.studio** (`studioHost: "rickireign"` + `deployment.appId` in `studio/sanity.cli.ts`). This is the **no-code editor for Ricki** (add/edit/remove posts in the browser; changes hit the live site within the 60s ISR window). Reads/writes the **same `production` dataset** as the site — no separate staging content. Redeploy Studio after schema/structure changes: `cd studio && npx sanity deploy`.
- **AI cover images** for the 2 seeded posts were made via the Sanity **`generate_image` MCP** (on-brand abstract, no faces/text). Gotcha: `generate_image` writes the asset to the **DRAFT** — you must `publish_documents` to make the cover live.

## Don't
Don't add Supabase (this is Sanity). Don't invent brand values (DESIGN.md). Don't embed the Studio. Don't expand scope past the approved plan without checking in. Don't reach for a dependency the stack already covers.
