# rickireign.com — project context for Claude Code

This file is loaded automatically every session. It's the operating brief. Two companion docs are authoritative and should be read before building:
- **`DESIGN.md`** (repo root) — the brand/design system. Source of truth for colors, typography, spacing, radii.
- **`docs/PLAN.md`** — the full project plan: IA, Sanity content model, component inventory, integrations, build phases, open decisions.

## What this is
A calm, premium marketing site that establishes **Ricki Reign as a founder, facilitator, and organizational leader**, lets people follow her (newsletter + socials), and routes them to work with her. A visitor should leave able to answer: **Who is Reign? What does she do? How do I work with her?**

**No payments. No user accounts.** Content site with a blog (later).

## Stack
- **Next.js (App Router) + TypeScript (strict) + Tailwind**, deployed on **Vercel**.
- **Sanity** (headless CMS) for content + blog. Remote MCP at `mcp.sanity.io` (OAuth).
- **Brevo** for newsletter (double opt-in, one general list) + contact email. Key server-only.
- **Calendly** for the "Book a Discovery Call" flow (embed via public scheduling URL).
- **GA4** via `@next/third-parties` (consent-gated). **Cloudflare Turnstile** on forms.

## Structure (per the plan)
Single-scroll home with sections: Hero → Guiding Questions → **The Practice** (her bookable somatic/leadership work) → **Founded & Led** (Exhale Under Pressure + Community Birth Village as separate businesses she runs, linking out) → Meet Reign → Who is this for? → Join the list (newsletter) → Connect (socials + contact). Plus `/blog` (later), `/privacy`, `/terms`.

**Do not** present the two businesses as "offerings" of this site, and **do not** include Brand Activations (not live yet). Section labels ("The Practice", "Founded & Led") are placeholders pending Ricki's decision.

## How we work (this is an agentic project)
- **Plan first, always.** For any non-trivial work, use `/ultraplan` or `/scaffold` and get my approval on the plan before code is written.
- **Parallel subagents in isolated worktrees:** `backend-builder` (Sanity + form endpoints), `frontend-builder` (UI), `qa-tester` (Playwright), `code-reviewer` (security + standards), `git-manager` (branches/commits/PRs). The backend contract is the source of truth; the frontend builds against it.
- **Review gates:** I sign off at the plan and again before any merge. Never merge without my approval.
- The installed plugin skills apply automatically: `house-style`, `secure-defaults`, `context-economy`, `git-conventions`. The `frontend-builder` uses **UI/UX Pro Max** for design intelligence (but `DESIGN.md` wins on brand) and runs its pre-delivery checklist.

## Version control
Numbered branches `NNN-short-summary` (`000`, `001`, …, mapping to plan phases) and **Conventional Commits**. The `git-manager` owns this. Never commit `.env*` or secrets (a guard hook enforces this).

## Security must-haves (see `secure-defaults`)
Secrets are server-only (Brevo key, Turnstile secret, Sanity tokens) — never `NEXT_PUBLIC_*`. Forms: server-side Zod validation + Turnstile + rate-limit. Sanity: read-only CDN client for public content; signed revalidation webhooks. Security headers/CSP set. Privacy policy + consent banner (GA + email collection).

## Don't
- Don't add Supabase — this project uses Sanity.
- Don't invent brand values — pull from `DESIGN.md`.
- Don't expand scope past the approved plan without checking in.
- Don't reach for a dependency the stack already covers.
