# Session State — handoff into Phase 2 (Home)

_Transient doc. Reflects state as of end of Phase 1 (2026-06-17). When Phase 2 ships, rewrite this for Phase 3. Durable facts/rules live in `CLAUDE.md`._

## Where we are

**Phase 0 (Foundation) and Phase 1 (Content model) are both MERGED to `main` and deployed.**

- `main` HEAD: `5e90850` (Merge PR #2). Contains the Next.js + Tailwind v4 foundation (Phase 0, PR #1, merge `8eafb06`) and the Sanity content model (Phase 1, PR #2).
- **Production is live on both targets** (auto-deployed from `main`): Vercel `https://rickireign.vercel.app`, Cloudflare `https://rickireign.gregoriomoreta4.workers.dev`. Both were green at merge.
- Branches kept (per the no-delete rule): `000-foundation`, `001-content-model`, `main` all exist locally and on the remote.

### ⚠️ Local git is not synced
At handoff the working copy is on **`001-content-model`** and local `main` is behind `origin/main`. **First thing in Phase 2:**
```bash
git checkout main && git pull origin main      # sync local main to 5e90850
git checkout -b 002-home                        # cut Phase 2 branch
git push -u origin 002-home                     # keep it on the remote immediately
```

## What Phase 1 delivered (already in `main`)

- **Standalone Sanity Studio** in `studio/` (Sanity v6). Project `zsuyhr45`, public `production` dataset. Schema deployed.
- **Content model** (`studio/schemaTypes/`, per PLAN.md §4): documents `siteSettings` (singleton, `_id: siteSettings`), `homePage` (singleton, `_id: homePage`), `business`, `author`, `post`; objects `cta`, `seo`. Singletons locked via `studio/structure.ts` + config action/template filters.
- **App read layer** (`lib/`): `lib/sanity/client.ts` (token-less CDN client, `useCdn: true`, `perspective: "published"`, project/dataset via `lib/env.ts`), `lib/sanity/image.ts` (`urlFor`), `lib/sanity/queries.ts` (`SITE_SETTINGS_QUERY`, `HOME_PAGE_QUERY`, `BUSINESSES_QUERY`).
- **Seeded + published content** (via Sanity MCP): `siteSettings`, `homePage`, and two `business` docs — Exhale Under Pressure (`_id 2df16ade-50f4-46c7-9ada-4a7aafee5519`) and Community Birth Village (`_id 2a5224d0-511f-463f-a74d-1e4ee493c51b`). `homePage.foundedAndLed.businesses` references both. **Copy is plausible placeholder, not Ricki's real words; no images uploaded.**
- Code review: APPROVE WITH NITS; all should-fix applied (env via `lib/env.ts`, `perspective: published`, explicit `HOME_PAGE_QUERY` projection, `cta.href` validation, Studio `engines`). One nit rejected with reason (kept `@sanity/image-url` — `next-sanity` doesn't bundle it).
- Env: the human added `NEXT_PUBLIC_SANITY_PROJECT_ID` + `NEXT_PUBLIC_SANITY_DATASET` as **plaintext build vars** on both Vercel and Cloudflare. `.env.local` has them locally (`zsuyhr45` / `production`).

## Phase 2 — Home (the goal)

Build the single-scroll home page's **sections 1–6** (PLAN.md §3) and wire them to the Phase 1 Sanity content. UI/design work is the `frontend-builder` + **UI/UX Pro Max**, against `DESIGN.md` tokens. Sections + their `homePage` fields:

1. **Hero** — `hero{ heading, subheading, ctas[]{label,href,style}, portrait, currentFocus{label,items[]} }` (+ `CurrentFocusCard`)
2. **Guiding Questions** — `guidingQuestions[]{ question, note }`
3. **The Practice** — `practice{ title, intro, items[]{title,description,icon}, ctaLabel, ctaTarget }` (+ `OfferingCard`)
4. **Founded & Led** — `foundedAndLed{ title, intro, businesses[]->{name,tagline,description,image,externalUrl,order} }` (+ `BusinessCard`; external links get `target="_blank" rel="noopener noreferrer"`)
5. **Meet Reign** — `about{ label, title, body (portable text), portrait, quote }` (+ `Quote`)
6. **Who is this for?** — `whoIsThisFor{ title, points[], ctaLabel, ctaTarget }`

`newsletter` and `connect` content exist on `homePage` but their **forms are Phase 3** (Newsletter DOI + Contact + Turnstile). Build the section shells in Phase 2 only if cheap; the live form logic is Phase 3.

### Entry point & order of work
1. Sync git + branch `002-home` (above).
2. **Wire `app/page.tsx`** (Server Component): fetch `HOME_PAGE_QUERY` and `SITE_SETTINGS_QUERY` from `lib/sanity/client.ts`, pass data into section components. Use `client.fetch(QUERY, {}, { next: { revalidate: <N> } })` — start with time-based revalidation (e.g. 60s); a signed Sanity revalidation webhook is deferred.
3. **Wire `Nav` and `Footer`** (`components/layout/`) to `siteSettings` (`wordmark`, `nav[]`, `social[]`, `contactEmail`, `footerText`). They currently use hard-coded placeholder anchors from Phase 0.
4. **Build the section components** (Hero → WhoIsThisFor) in `components/` against DESIGN.md. The layout primitives already exist: `Container`, `Section` (8rem/4rem rhythm), `Button` (primary/secondary/tertiary). Map `cta.style` → `Button` variant.
5. Run the `code-reviewer`, then open a PR (no merge, no branch delete).

## Gotchas specific to Phase 2 (read before coding)

- **`next/image` for Sanity images needs `images.remotePatterns` for `cdn.sanity.io` in `next.config.ts` — NOT configured yet.** Add it (hostname `cdn.sanity.io`) or images won't optimize. CSP `img-src` already allows `cdn.sanity.io` (separate concern). Use `urlFor(img).width(...).url()` from `lib/sanity/image.ts`.
- **No images are seeded.** `hero.portrait`, `about.portrait`, `business.image`, `seo.ogImage` are all empty. Components must render gracefully without images; don't assume they exist. Real assets are pending from Ricki.
- **Include `_key` in array projections and use it as the React `key`** (questions, practice items, businesses, ctas, nav, social). It's already on the seeded data.
- **Portable Text:** `about.body` is Portable Text — render with `PortableText` from `next-sanity`. Quote uses Caslon italic (`font-display italic` + `text-quote`, per DESIGN.md).
- **Verify BOTH builds before pushing:** `npm run build` (Vercel) **and** `npx opennextjs-cloudflare build` (Cloudflare). Phase 1 proved they can diverge.
- The `HOME_PAGE_QUERY` currently returns section objects whole (e.g. `hero`, `practice`). That's fine, but tighten projections per component if you want precise generated types.

## Open questions / deferred (still matter)

- **Section names** (PLAN.md open #1): "The Practice" and "Founded & Led" are placeholders pending Ricki ("Work With Reign" / "Ways to Work Together"; "Organizations Led by Ricki Reign"). Seeded with the placeholders — don't hard-code them in components; they come from `homePage.practice.title` / `foundedAndLed.title`.
- **Real content + assets** (PLAN.md open #6): seeded copy and social URLs (`instagram.com/rickireign`, `youtube @rickireign`) are placeholders; Ricki refines in the Studio. No real photography yet.
- **contactEmail** (PLAN.md open #3): seeded `welcome@rickireign.com` — confirm vs `hello@`.
- **Calendly** URL in `.env.local` is a personal test link; the discovery-call CTA wiring is also touched in Phase 3.
- **Patreon** (PLAN.md open #4): `social.platform` enum includes it; add the link once live.
- **Sanity revalidation webhook** + **draft/preview mode + server-only read token**: deferred to Phase 2 decision / Phase 3.
- **`wrangler.jsonc` `compatibility_date` = 2025-09-01**: wrangler warns it's old; bump when convenient (low priority).

## If you're starting Phase 2 cold, know this
- Production on `main` is green on both Vercel and Cloudflare. Your job is to not break that — run both builds locally before every push.
- The content is real and queryable now: `*[_type=="homePage"][0]` and `*[_type=="siteSettings"][0]` return seeded published data (check with the Sanity MCP `query_documents`, `perspective: "published"`, or just render the page).
- Schema changes require `cd studio && npm run schema:deploy` to propagate to MCP/typegen; the Studio itself runs at `:3333` via `cd studio && npm run dev`.
- Subagents run in `.claude/worktrees/` and can't do git/network writes — consolidate their output and run git/`gh`/deploy commands from the main session. Never delete branches. See `CLAUDE.md` for the full rule set and the Phase 1 gotchas (EPIPE guard, Node 24 pin, Vercel framework pin, ESLint ignores, Cloudflare config override).
