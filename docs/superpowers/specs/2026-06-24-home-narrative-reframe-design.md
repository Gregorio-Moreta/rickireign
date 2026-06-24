# Home narrative reframe — design spec

**Date:** 2026-06-24 · **Branch:** `006-home-reframe`
**Source of intent:** `docs/planning/ricki-input/2026-06-22-chat-and-voice-notes.md`
(Ricki's two voice notes + the 6/22 text chat).

## North star

> "rickireign.com's goal is not necessarily to convert, it's to explain."

The home page's job is to **explain who Ricki is**, build **credibility + likability**,
and route the curious *deeper* — not to sell a service. This is a **copy + structure**
reframe, **not** a visual redesign. Ricki explicitly loves the existing layout
("the layout itself is amazing… a really beautiful page"). All brand tokens,
components, and card styling are preserved.

### The three corrections Ricki named

1. **Central identity = leadership strategist** — not "somatic facilitator," not the
   fragmented list "founder, facilitator, and organizational leader." *Through* that
   one identity she works across three arenas: **organizational leadership**
   (Exhale Under Pressure), **community readiness** (Community Birth Village), and
   **personal somatic development** (her Somatic practice — her *least* prominent area,
   which the current site over-emphasizes).
2. **Kill the "book a service" feel.** "Book a Discovery Call" currently runs *all the
   way through* (Hero, The Practice, Who Is This For). No booking CTA up front. Booking
   may appear **only softly, after her work is introduced, and only attached to Somatics**
   (the one offering that lives on *this* site; Exhale & CBV sell on their own sites).
3. **"The Practice" and "Founded & Led" are redundant** ("these are the things I do…
   and also these are the things I do"). Merge them. Reframe any somatic content as
   **bio** — *"a little more about me and how I got here"* — not a pitch.

## Chosen approach (Approach 1 — approved)

Home explains and links out; **Somatics earns a dedicated `/somatics` page** that holds
the **only** booking on the site.

### New home section order

1. **Hero** — identity reframe (leadership strategist). **Remove** "Book a Discovery
   Call"; keep only the soft **"Follow along"** CTA (scrolls to newsletter/connect).
2. **Guiding Questions** — unchanged (reflective tone supports "explain," not "sell").
3. **Meet Reign** (About) — **moved up** from #5. The credibility + likability spine:
   *who she is, why*.
4. **The Work** — **NEW merged section** replacing *both* The Practice and Founded & Led.
   Three uniform arena cards. **No booking CTA.**
5. **Who Is This For** — kept, **discovery CTA removed**.
6. **Newsletter** — kept ("follow her" *is* the site's real goal).
7. **Connect** — kept (socials + email, soft).

**Removed from home:** the standalone "The Practice" section and **all three**
"Book a Discovery Call" CTAs.

### "The Work" section

One section, three uniform cards, framed as *arenas of one leadership identity* so a
visitor **understands each arena before clicking** (her requirement). Order reflects
prominence — Somatics **last** (least prominent).

| Card | Links to | Source |
|------|----------|--------|
| Exhale Under Pressure | its live site (new tab) | existing `business.externalUrl` |
| Community Birth Village | its live site (new tab) | existing `business.externalUrl` |
| Somatics | **internal `/somatics`** | new internal link (not external) |

Section intro establishes the single-identity → three-arenas logic in 1–2 sentences.

### `/somatics` page

A dedicated, Sanity-editable Server Component route. Reframes the practice as
*"a little more about me and how I got here"* — **not** a sales page. Absorbs the old
`practice` content (intro + offering items), explains what the somatic work *is* and
who it's for, and closes with **one soft "Book a Discovery Call"** — the **only**
Calendly/booking on the entire site, appearing only after deep navigation.

### Copy reframe (drafts — final wording is Ricki's; approved as good-enough to ship and iterate)

- **Hero heading:** keep **"Lead from steadiness."** (calm, on-brand, never the problem).
- **Hero subheading (draft):** *"Ricki Reign is a leadership strategist — working across
  organizations, communities, and individuals, bridging ancestral wisdom with modern
  leadership."* (Replaces "founder, facilitator, and organizational leader…")
- **"The Work" intro (draft):** a 1–2 sentence frame: one identity (leadership strategist)
  expressed across three arenas, each a "learn more" invitation.

## Technical design

### Sanity schema (`studio/`)

- **`homePage` doc:** add a `theWork` object (title, intro, `businesses` reference array
  reused from the existing `foundedAndLed.businesses`, and a `somatics` sub-object:
  title, tagline, blurb, link label → `/somatics`). **Retire** `practice` and
  `foundedAndLed` from the home doc once their content is migrated.
- **New `somaticsPage` singleton** (fixed `_id`, like `homePage`/`siteSettings`):
  title, intro, body (Portable Text), offering items (migrated from `practice.items`),
  a soft booking CTA (label + target), and `seo`.
- Migrate existing `practice` content into `somaticsPage`; preserve the two `business`
  docs untouched (their `externalUrl`s already work).
- Requires `cd studio && npm run schema:deploy` + `npx sanity deploy`.

### App (`app/`, `components/`, `lib/`)

- **New section component** `components/sections/TheWork.tsx` — merges the markup of
  `PracticeSection` + `FoundedAndLed`; three uniform cards; Somatics card uses
  `next/link` to `/somatics`, the two businesses keep the hardened external `Button`.
- **Delete/retire** `PracticeSection.tsx` and `FoundedAndLed.tsx` after the merge
  (keep their card markup patterns).
- **`app/page.tsx`** — reorder per the new spine; drop Practice/Founded; move `MeetReign`
  above `TheWork`.
- **New route `app/somatics/page.tsx`** — Server Component, `sanityFetch` the
  `somaticsPage` singleton, render via `Section`/`Container`/`Prose`/`CtaButton`
  (reuse `MeetReign`/`PostBody` block patterns; do not re-derive).
- **Hero** — wire the new subheading from Sanity; ensure only the soft CTA renders.
- **`WhoIsThisFor`** — remove the discovery CTA (or render none when target is absent).
- **Booking** — `CtaButton` label-match (`/discovery call/i` → Calendly popup) is
  unchanged; it now only renders on `/somatics`. CSP/env unchanged (no new origins).
- **Queries/types** (`lib/sanity/queries.ts`, `types.ts`) — add `THE_WORK`/`somaticsPage`
  fields; drop retired ones.

### Nav + scroll

- `components/layout/Nav.tsx` + `Footer.tsx`: collapse `#practice` + `#founded` into a
  single **"The Work" `#work`** anchor. `/somatics` is a deeper page, **not** in primary
  nav. Keep `SectionLink`/`HashScroll` mechanics (no bare `#anchor` hrefs).

### Tests (gotchas honored)

- Run `npm test` + `npm run test:e2e` **before and after** (touches nav + sections).
- Update `tests/e2e/nav.spec.ts` for the new `#work` anchor and removed anchors; check
  `console.spec.ts` / `responsive.spec.ts` still pass (add `/somatics` to coverage).
- New specs must `import { test } from "./fixtures"` (consent cookie). E2E uses Turnstile
  TEST keys (real key domain-locked).
- Verify **both** builds (`npm run build` + `npx opennextjs-cloudflare build`) before push.

## Out of scope (separate tracks — do not bundle)

- The four launch-prep items (Sentry, `npm audit fix`, Sanity publish webhook,
  tags → reference type) — sequence **after** this redesign, each its own small plan.
- Final copy approval from Ricki (drafts ship; she refines in Studio).
- Lawyer review, Brevo domain sender, domain cutover — unchanged launch-prep carry-over.

## Success criteria

- Home reads as "about Ricki — who she is, what she does, why"; **no booking CTA** on
  the home page; About precedes The Work; The Practice + Founded & Led are one section.
- `/somatics` exists, frames the practice as bio, and is the **only** page with booking.
- Exhale & CBV cards still link to their live sites; Somatics card links to `/somatics`.
- `lint` + `tsc` clean; Vitest green; Playwright green on **both** targets; both builds
  succeed. Schema + Studio deployed.
