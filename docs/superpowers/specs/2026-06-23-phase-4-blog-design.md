# Phase 4 — Blog (Journal): design

_Approved 2026-06-23. Branch `004-blog`. Companion to `docs/PLAN.md` (§3/§4/§7),
`docs/SESSION_STATE.md`, `CLAUDE.md`, `DESIGN.md`._

## Content decisions (settled with Ricki/the human)

- **Mixed content, one flexible `post` schema.** No "essay vs note" type field —
  short vs long is just whatever the body is; **tags** carry categorization
  (`essay`, `update`, `event`, … can emerge later with no schema change).
  Flexibility is the explicit priority because the blog's exact direction is
  still open.
- **Nav label: "Journal"** (not "Blog") — warmer, on-brand for "Ancestral
  Modernity".
- **2 on-brand placeholder posts** seeded now (no real drafts yet), easily
  replaced/edited in the Studio.
- **Full tag-filter pages** (indexable `/blog/tag/[slug]`) chosen over
  client-side filtering specifically for SEO (each tag = its own rankable URL).
- **Per-post SEO = Option B:** add the existing `seo` object to `post`, optional,
  with code falling back to derived values (title → `title`, description →
  `excerpt`, OG image → `coverImage`) when left blank. Strictly more flexible
  than deriving-only, defaults to identical behavior, and consistent with
  `siteSettings`/`homePage` which already carry `seo`.

## Routes (all Server Components, App Router)

- `app/blog/page.tsx` — post list. All published posts `order(publishedAt desc)`,
  `BlogCard` grid, graceful empty state, static page metadata.
- `app/blog/[slug]/page.tsx` — detail. `generateStaticParams` from slugs,
  `generateMetadata` (Option B), `notFound()` on unknown slug. Cover, title,
  meta row (date · author · tags), Portable Text body.
- `app/blog/tag/[tag]/page.tsx` — tag-filtered list (indexable). Static params
  from the distinct tag set; reuses the card grid; per-tag metadata.

Tags are free-text; URLs use a **slugified** tag resolved back via `lib/tags.ts`
+ a tags query.

## Data layer

`lib/sanity/queries.ts`: `POSTS_QUERY` (list fields), `POST_QUERY` (full incl.
`body`, `seo`, expanded `author`), `POST_SLUGS_QUERY`, `POSTS_BY_TAG_QUERY`,
`TAGS_QUERY` (`array::unique(*[_type=="post"].tags[])`). Fetched via existing
token-less `sanityFetch` (60s ISR). `lib/sanity/types.ts`: add `Author`,
`PostListItem`, `Post`; reuse `Seo`, `SanityImage`, `PortableTextValue`.

## Schema change (one deploy)

Add `seo` object (optional) to `studio/schemaTypes/documents/post.ts`. Then
`cd studio && npm run schema:deploy` + `npx sanity build` to validate. Deploy is
required before reads see the new field.

## Components

- `components/ui/BlogCard.tsx` — cover (`SanityImage`, degrades gracefully with
  no asset → text-only card), title, excerpt, date, tags; internal `next/link`
  (NOT `SectionLink`, which is for in-page anchors).
- `components/blog/PostBody.tsx` — richer Portable Text component map than
  `MeetReign` (headings h2/h3, paragraphs, blockquote, lists, link marks, inline
  images — the `body` schema allows image members).
- `lib/date.ts` (`Intl.DateTimeFormat` for `publishedAt`), `lib/tags.ts`
  (slugify + resolve).

## SEO

`generateMetadata` (detail): `title = seo.title ?? title`,
`description = seo.description ?? excerpt`,
`openGraph.images = urlFor(seo.ogImage ?? coverImage)` @ 1200×630,
`type: "article"` + `publishedTime` + author. List/tag pages: static/derived.
Add `app/sitemap.ts` + `app/robots.ts` (static routes + every post + every tag).

## Navigation

Add a top-level **Journal** link to `Nav` + `Footer` (real route → `next/link`,
alongside the Sanity-driven in-page section links).

## Seeding (Sanity MCP)

Publish `author` (Ricki Reign + bio) FIRST, then 2 placeholder posts (title,
slug, excerpt, Portable Text body, tags, `publishedAt`, no cover image)
referencing the author. Referenced doc before referrer (seeding gotcha).

## Verify & ship

`npm run lint && npx tsc --noEmit`; BOTH builds (`npm run build` +
`npx opennextjs-cloudflare build`); manual checks (`/blog`, a detail, a tag page,
404 on bad slug, OG tags in view-source, 375/768/1024/1440, no console errors).
No new CSP origins (Sanity image CDN already allowed). Then `/phase-handoff`
ritual → PR (no merge), branches kept.

## Deferred (not Phase 4 blockers)

Signature-verified Sanity publish webhook (posts appear within the 60s ISR window
until then); Brevo `rickireign.com` domain sender; lawyer review of legal pages.
