# rickireign.com

A calm, premium marketing site establishing **Ricki Reign** as a founder, facilitator, and organizational leader — letting people follow her (newsletter + socials) and routing them to work with her. No payments, no user accounts.

## Stack

- **Next.js** (App Router) + **TypeScript** (strict) + **Tailwind v4**
- **Sanity** (headless CMS) — content + blog *(later phase)*
- **Brevo** (newsletter, double opt-in + contact) *(later phase)*
- **Calendly** (discovery-call booking) · **GA4** via `@next/third-parties` (consent-gated)
- Deployed on **Vercel**

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

Copy `.env.example` to `.env.local` and fill the values. Phase 0 only needs `NEXT_PUBLIC_GA_MEASUREMENT_ID` (analytics no-ops cleanly if unset). Secrets are **server-only** — never `NEXT_PUBLIC_*`.

## Scripts

```bash
npm run dev      # dev server
npm run build    # production build
npm run start    # serve the production build
npm run lint     # eslint
npx tsc --noEmit # typecheck
```

## Project docs

- **`DESIGN.md`** — brand/design system ("Ancestral Modernity"); source of truth for colors, type, spacing, radii.
- **`docs/PLAN.md`** — full plan: IA, Sanity content model, components, integrations, build phases.
- **`CLAUDE.md`** — operating brief for agentic development.

Design tokens live in `app/globals.css` (Tailwind v4 `@theme`), mapped from `DESIGN.md`. Security headers + CSP are in `next.config.ts`.
