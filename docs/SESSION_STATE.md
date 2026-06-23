# Session State — handoff into Phase 5 (Verify & ship)

_Transient doc. Reflects state as Phase 4 (Blog / "Journal") is delivered (2026-06-23). When Phase 5 ships, rewrite this. Durable facts/rules live in `CLAUDE.md`._

## Where we are

**Phases 0–4 are complete.**
- Phases 0–3 are **merged to `main`** (Phase 3 + its fix/hardening round via PR #5 and PR #6).
- **Phase 4 (Blog) is delivered on branch `004-blog`** via a feature PR (this handoff bundled in). **Not merged yet — awaiting human sign-off.** `main` is Phase-5-ready the moment it merges.
- **Both builds pass locally** for head SHA `11d68c2` (`npm run build` + `npx opennextjs-cloudflare build`); lint + tsc clean. CI (Vercel deploy + Cloudflare Workers Build) was triggered on push — **confirm both green for `11d68c2` before merge** (visible on the PR).
- Branches kept (no-delete rule): `000-foundation`, `001-content-model`, `002-home`, `docs/phase-2-handoff`, `003-forms-and-legal`, `fix/phase-3-forms-legal`, `004-blog`, `main`.

### First steps in Phase 5
```bash
git checkout main && git pull origin main      # after the 004-blog PR merges
git checkout -b 005-verify-ship
git push -u origin 005-verify-ship
```

## What Phase 4 delivered (on `004-blog`)

**Routes (all Server Components, App Router; 60s ISR via existing `sanityFetch`):**
- `app/blog/page.tsx` — Journal index. All published posts `order(publishedAt desc)`, `PostGrid` of `BlogCard`s, graceful empty state, static metadata.
- `app/blog/[slug]/page.tsx` — post detail. `generateStaticParams` (pre-renders known slugs), `generateMetadata` (per-post SEO, article OG), `notFound()` on unknown slug. Cover, title, date·author meta, tags footer, Portable Text body.
- `app/blog/tag/[tag]/page.tsx` — indexable tag-filtered list. Static params from distinct tags; per-tag metadata; `notFound()` for unknown tag.
- `app/sitemap.ts` + `app/robots.ts` — static routes + every post + every tag page; robots allow-all → sitemap.

**Components / libs:**
- `components/ui/BlogCard.tsx` — whole-card link (title `after:absolute` overlay) + independently-clickable tag links; cover degrades gracefully to a text-only card when no asset.
- `components/blog/PostGrid.tsx`, `components/blog/PostBody.tsx` — `PostBody` is a richer Portable Text map than `MeetReign` (h2/h3, normal, blockquote, bullet/number lists, strong/em/link marks with external `target=_blank rel=noopener`, inline images sized from the asset ref).
- `lib/date.ts` (`formatDate`, UTC `Intl.DateTimeFormat`), `lib/tags.ts` (`slugifyTag` + `resolveTagSlug` — tags are free-text, slugified for URLs and resolved back for the GROQ query).

**Data + schema:**
- `lib/sanity/queries.ts`: `POSTS_QUERY`, `POST_QUERY`, `POST_SLUGS_QUERY`, `POSTS_BY_TAG_QUERY` (param **`tagName`**, not `tag` — see gotcha), `TAGS_QUERY` (`array::unique`).
- `lib/sanity/types.ts`: `Author`, `PostListItem`, `Post`.
- `studio/schemaTypes/documents/post.ts`: added optional **`seo`** object (Option B). **Schema deployed** (`npm run schema:deploy`) + Studio build validated.

**Nav:** added a top-level **"Journal"** link (real route → `next/link`) to `Nav` (desktop + mobile) and `Footer`, alongside the Sanity-driven in-page section links.

**Card uniformity + covers (post-review fix):** `BlogCard` clamps title (2 lines) + excerpt (3 lines) via `min-h-[Nlh]`, pins tags to a shared bottom, and **always renders a 3:2 cover**; imageless posts get `components/ui/CoverFallback.tsx` (branded gradient + dotted texture + wordmark). The 2 seeded posts got **on-brand AI cover images** via the Sanity `generate_image` MCP (somatic dune forms; woven roots/fibers).

**Hosted Studio DEPLOYED:** **https://rickireign.sanity.studio** (`studioHost` + `deployment.appId` in `studio/sanity.cli.ts`) — the **no-code editor for Ricki**. Add/edit/remove posts in the browser; live within 60s ISR. Add/remove round-trip verified end-to-end. Same `production` dataset as the site.

**One-click AI covers:** `@sanity/assist` enabled in the Studio; `post.coverImage` has a pre-filled brand prompt + `aiAssist.imageInstructionField`. Editors click ✨ Generate for on-brand art — runs in the authenticated Studio session, no app write token (site stays token-less). Experimental; `CoverFallback` is the safety net. **BLOCKED:** the Studio Generate button errors "Project is not allowed to use this feature" — AI image gen is a Sanity **plan/add-on** entitlement (enable in sanity.io/manage → Plan). Left in place per user ("decide later"); works once enabled. The **MCP `generate_image` path is entitled** and made the 2 seeded covers — use it to generate covers on request meanwhile.

**Preset tags:** `POST_TAGS` in `post.ts` constrains tags to a fixed list (Essay, Note, Somatic Leadership, Ancestral Wisdom, Organizational Leadership, Practice, Community, Ritual & Rest) for consistent `/blog/tag` grouping. Add tags by appending the list + redeploying schema/Studio. No-code editor-managed tags (reference `tag` doc type) deferred.

**Seeded content (Sanity MCP, published):** `author` **Ricki Reign** (`_id author-ricki-reign`) + 2 posts — `leading-from-the-body` (tags: Somatic Leadership, Essay) and `ancestral-remembering` (tags: Ancestral Wisdom, Essay). Author published before posts (reference order). On-brand placeholders, replaceable in the Studio.

**Runtime-verified locally (dev server + curl):** `/blog` lists both; detail `<title>` + `og:type=article` + body render; `/blog/tag/essay` shows both; bad slug + bad tag → 404; sitemap includes post + tag URLs; robots correct.

## Design spec

`docs/superpowers/specs/2026-06-23-phase-4-blog-design.md` — the approved Phase 4 design + the content decisions (one flexible `post` schema, Journal label, indexable tag pages, Option B SEO).

## Phase 5 — Verify & ship (the goal)

Per PLAN.md §7: Playwright flows (newsletter happy + invalid + DOI, contact submit, out-links resolve, nav, **blog: list → detail → tag → 404**, responsive, no console errors) → `/ship-check` → Vercel + Cloudflare prod deploy. This is where the **test runner finally lands** (none today — see open items).

## Deploy env status
- **Vercel:** Phase 3 env set for production + the `003-forms-and-legal` preview branch. Public keys (GA id, Turnstile site key, Calendly URL) default in `lib/env.ts`, so prod works without build vars. Blog adds **no new env or CSP origins** (Sanity image CDN already allowed).
- **Cloudflare:** runtime secrets set via `wrangler secret put` (persist across `npm run deploy`). Public keys default in code.

## Gotchas specific to Phase 4 (don't re-learn)
- **`tag` is a RESERVED key in Sanity `QueryParams`** (typed `never` — it's a fetch-option name). A GROQ param named `$tag` fails tsc. `POSTS_BY_TAG_QUERY` uses **`$tagName`**; pass `{ tagName: tag }`.
- **Tags are free-text strings**, slugified for URLs (`slugifyTag`) and resolved back via `TAGS_QUERY` + `resolveTagSlug`. Two tags slugifying to the same value would collide (first match wins) — fine at this scale.
- **Portable Text inline images** size from the asset ref (`image-<id>-<W>x<H>-<fmt>`) since the body query returns the raw block (no `asset->metadata`). If that parse ever fails it falls back to 1280×853.
- **BlogCard cover degrades** to a text-only card with no asset (consistent with the home sections' no-assets pattern) — no posts have covers yet.
- **`generateStaticParams` pre-renders known posts/tags at build**; new posts appear within the 60s ISR window. The signature-verified publish webhook is still deferred (would make them appear instantly).
- **`generate_image` MCP writes to the DRAFT** — must `publish_documents` afterwards to make the cover live.
- **Redeploy the hosted Studio** (`cd studio && npx sanity deploy`) after any schema/structure change so editors see new fields.

## Open questions / deferred (still matter)
- **Test runner** — none yet; Phase 5 adds Playwright. Blog correctness is currently covered only by the manual curl smoke test above.
- **Sanity revalidation webhook + draft/preview** — deferred; posts rely on 60s ISR.
- **Real blog content + cover images** — the 2 seeded posts are placeholders; Ricki replaces/extends in the Studio. Cover images optional.
- **Brevo prod sender** — verify a `rickireign.com` domain sender (DOI + contact still send via a `brevosend.com` wrapper).
- **Lawyer review** of `/privacy` + `/terms` before public launch.
- **contactEmail** — `welcome@rickireign.com` live/monitored; confirm canonical vs `hello@`.
- **Calendly** — real/active Discovery Call event; URL is the personal account (`gregorioe-moreta/discovery-call`) — swap if Ricki uses another.

## If you're starting Phase 5 cold, know this
- Production on `main` is green on both targets; content is real and queryable via the Sanity MCP (`perspective: "published"`), now including `author` + 2 `post`s.
- Schema changes need `cd studio && npm run schema:deploy`; Studio runs at `:3333`.
- Run the end-of-phase ritual with the **`/phase-handoff`** skill.
- Subagents can't do git/network writes — run git/`gh`/deploy from the main session. Never delete branches. See `CLAUDE.md` for the full rule set + Phase 0–4 gotchas.
