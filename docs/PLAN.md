# rickireign.com — Project Plan (v1, for review)

Inputs this plan reconciles: the **DESIGN.md** ("Ancestral Modernity" design system, authoritative for brand), the **Phase 2 feature doc** (authoritative for content/structure), and the existing **Stitch prototype** (visual reference only — it's a static single-file HTML page, so this is a fresh Next.js build).

Stack: **Next.js (App Router) + TypeScript + Tailwind + Sanity (CMS) + Brevo (email) + Vercel.** No payments, no user accounts.

---

## 1. Goal & success metric

A calm, premium site that establishes Ricki as a **founder, facilitator, and organizational leader**, lets people **follow** her (newsletter + socials), and routes them to **work with her** — either her own somatic/leadership practice or the separate businesses she runs.

A visitor leaves able to answer: **Who is Reign? What does she do? How do I work with Reign?** Every section below maps back to one of those three.

---

## 2. The naming decision (needs Ricki's input)

Your feature doc says: don't call the section "offerings," and **don't present the two businesses as offerings of rickireign.com** — present them as separate businesses she runs. So this plan splits one muddled idea into **two distinct sections**:

- **Her own practice** (bookable *with her*): options — **"Work With Reign," "The Practice,"** or **"Ways to Work Together."**
- **The businesses she founded/leads** (link out, booking happens on their sites): options — **"Founded & Led," "Organizations Led by Ricki Reign,"** or **"Founder's Businesses."**

→ *Decision for Ricki.* Plan proceeds with placeholders "The Practice" and "Founded & Led."

Also: **Brand Activations is removed** (not live yet; Community Birth Village replaces it per your notes).

---

## 3. Information architecture

**Routes**
- `/` — single-scroll home (primary page)
- `/blog` + `/blog/[slug]` — *Phase 4, later*
- `/contact` — contact (also surfaced as a home section)
- `/privacy`, `/terms` — legal (footer links)

**Home sections (in order)**
1. **Hero** — "Ricki Reign," founder/facilitator/organizational-leader tagline, two CTAs, portrait + "Current Focus" card.
2. **Guiding Questions** — kept from the prototype (strong, on-brand).
3. **The Practice** *(was "Offerings")* — her somatic + leadership work, bookable with her. Cards: Leadership Performance, Somatic Training, Ancestral Remembering. Primary CTA: **Book a Discovery Call**.
4. **Founded & Led** *(new)* — Exhale Under Pressure + Community Birth Village as separate businesses she runs, each linking out to its own site to book. Framed around her as founder.
5. **Meet Reign** — origin story + portrait + pull-quote (kept).
6. **Who is this for?** — the four-point checklist + discovery-call CTA (kept).
7. **Join the list** *(new)* — newsletter email capture (Brevo double opt-in).
8. **Connect** *(upgraded)* — Instagram, YouTube (Patreon later) + a real contact form (replaces the prototype's `mailto:`).
9. **Footer** — wordmark, Contact / Privacy / Terms, socials.

**Success-metric mapping:** *Who* → Hero + Meet Reign. *What* → Guiding Questions + The Practice + Founded & Led. *How* → Discovery-call CTA (her practice) + out-links (businesses) + newsletter (stay connected).

---

## 4. Sanity content model

Schemas the `backend-builder` will create (field → type):

**`siteSettings`** (singleton)
- `wordmark` (string, "Ricki Reign")
- `nav` (array of {label, anchor})
- `social` (array of {platform: enum[instagram, youtube, patreon, email], url})
- `contactEmail` (string — `welcome@rickireign.com`)
- `footerText` (string)
- `seo` (object → see `seo` below)

**`homePage`** (singleton)
- `hero` (object: heading, subheading, ctas[ref `cta`], portrait[image], currentFocus{label, items[]})
- `guidingQuestions` (array of {question, note})
- `practice` (object: title, intro, items[array of {title, description, icon}], ctaLabel, ctaTarget)
- `foundedAndLed` (object: title, intro, businesses[ref `business`])
- `about` (object: label, title, body[portable text], portrait[image], quote)
- `whoIsThisFor` (object: title, points[array of string], ctaLabel, ctaTarget)
- `newsletter` (object: title, body)
- `connect` (object: title, body)

**`business`** (document) — *Exhale Under Pressure, Community Birth Village*
- `name`, `tagline`, `description` (text), `image` (image), `externalUrl` (url — "book here"), `order` (number)

**`post`** (document) — *Phase 4*
- `title`, `slug`, `excerpt`, `coverImage`, `body` (portable text), `publishedAt`, `author` (ref), `tags[]`

**`author`** (document) — `name`, `image`, `bio`

**Reusable objects:** `cta` {label, href, style: enum[primary, secondary, tertiary]}, `seo` {title, description, ogImage}.

Notes: the public site reads **published** content via the read-only CDN client; drafts/preview use the server-only read token. Real portrait assets (the prototype uses temporary Google-hosted URLs) get uploaded into Sanity.

---

## 5. Component inventory (mapped to DESIGN.md tokens)

**Primitives / layout**
- `Container` (max `1200px`, desktop margin `60px`, mobile `20px`)
- `Section` (vertical rhythm `8rem` desktop / `4rem` mobile — the "breath")
- `Nav` (sticky, `backdrop-blur(12px)`, uppercase Hanken `label-md` links, Caslon wordmark)
- `Footer`
- `Button` — primary (solid forest `#2d4032`, white text, 8px radius, subtle lift), secondary (outlined forest), tertiary (teal `#118fab` text + chevron, no bg)

**Sections**
- `Hero`, `CurrentFocusCard`
- `GuidingQuestions`
- `PracticeSection` + `OfferingCard`
- `FoundedAndLedSection` + `BusinessCard` (external link, `target="_blank" rel="noopener noreferrer"`)
- `AboutSection` + `Quote` (Caslon italic `quote-italic`, grainy texture)
- `WhoIsThisFor` (checklist, dark `earth-charcoal` band)
- `NewsletterForm`, `ContactForm`, `SocialLinks`
- `BookingButton` / `CalendlyEmbed` — opens the Calendly popup (or inline embed) for the discovery call
- `BlogCard` — *Phase 4*

**Type & effects (from DESIGN.md):** `display-lg`/`headline-lg`/`body-lg`/`label-md`/`quote-italic` styles; `ancestral-grid` dotted background, `soft-mask`, `somatic-float` (gentle), tonal layering, ambient long-blur shadows tinted with primary. **All motion respects `prefers-reduced-motion`** (UI/UX Pro Max checklist). Fonts: Libre Caslon Text (display/headings) + Hanken Grotesk (body/UI) via `next/font`.

**Design discipline:** UI/UX Pro Max generates/refines the per-section design system; `DESIGN.md` wins on brand; every component passes the pre-delivery checklist (SVG icons, cursor-pointer, focus states, 4.5:1 contrast, responsive 375/768/1024/1440).

---

## 6. Integrations

- **Booking (her practice):** the "Book a Discovery Call" CTA opens a **Calendly** embed (popup widget via her public scheduling URL; `react-calendly` or the official embed script). Public `NEXT_PUBLIC_CALENDLY_URL` only — no secret needed for the embed. (Optional Calendly API token later if she wants event data in-app.) The two businesses keep booking on their own sites.
- **Newsletter (general list):** `POST /api/newsletter` → Zod validation → Turnstile verify → **Brevo DOI** create-contact (confirmation email; only confirmed contacts stored) → generic success message. Server-only `BREVO_API_KEY`.
- **Contact:** `POST /api/contact` → Zod validation → Turnstile verify → Brevo **transactional** email to `welcome@rickireign.com` (optionally also add as a contact).
- **Analytics:** GA4 via `@next/third-parties` `<GoogleAnalytics>`, **consent-gated** for EU visitors.
- **Security headers / CSP:** set in `next.config`, allowing only the third parties actually used (Google Fonts, GA, Turnstile, Sanity image CDN).
- **Sanity revalidation:** signature-verified webhook triggers ISR revalidation on publish.
- **Legal/privacy:** Privacy Policy + cookie/consent banner (required given GA + email collection).

---

## 7. Build phases (the sequence agents follow)

- **Phase 0 — Foundation:** Next.js + TypeScript scaffold; Tailwind config ported from DESIGN.md tokens; fonts; base layout (`Nav`, `Footer`, `Container`, `Section`, `Button`); Sanity client wiring; GA + security headers; `.env.example`.
- **Phase 1 — Content model:** Sanity schemas (`siteSettings`, `homePage`, `business`, `author`, `post`) + Studio + seed content.
- **Phase 2 — Home:** build sections 1–6 wired to Sanity (Hero → Who is this for). *This is where front-end quality is won.*
- **Phase 3 — Forms & legal:** Newsletter (DOI) + Contact + Turnstile; Privacy/Terms; consent banner.
- **Phase 4 — Blog (later):** post list + detail, once direction is set.
- **Phase 5 — Verify & ship:** Playwright flows (signup happy + invalid + DOI, contact submit, out-links resolve, nav, responsive, no console errors) → `/ship-check` → Vercel deploy.

Phases 0–1 and the two tracks within Phase 2 (frontend vs Sanity wiring) are where parallel subagents help; Phase 3 is mostly backend with a thin UI.

---

## 8. Open decisions (need you / Ricki)

1. **Section names** — "The Practice" vs "Work With Reign"; "Founded & Led" vs "Organizations Led by Ricki Reign." *(Ricki)*
2. ~~"Book a Discovery Call" target~~ **RESOLVED:** her practice books via an embedded **Calendly** widget (popup from the CTA, or inline on a small `/book` section) using her public scheduling link — kept separate from the two businesses, which book on their own sites. *(You'll grab a temporary Calendly account + link for testing.)*
3. **Email** — confirm `welcome@rickireign.com` as the canonical address (prototype uses `hello@`).
4. **Patreon** — add once verified live.
5. **Blog** — scope, content types, and timing for Phase 4.
6. **Assets** — real portrait/photography to upload to Sanity (replacing the temporary Stitch image URLs).

---

*Confirmed by you already: newsletter is a single general list; no Sanity account yet (Phase 1 includes standing it up).*
