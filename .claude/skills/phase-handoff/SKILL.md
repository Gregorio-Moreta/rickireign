---
name: phase-handoff
description: Use when a rickireign.com build phase is finished and you're handing off to the next session — reconciling docs with git, verifying both builds, updating SESSION_STATE + CLAUDE.md, opening the PR (no merge), archiving the session transcript, and emitting the next kickoff prompt.
---

# Phase Handoff (rickireign.com)

The end-of-phase ritual for this repo, so sessions transition cleanly. Project-specific. Pairs with the memories: handoff-in-feature-pr, session-archive-convention, never-delete-branches, git-write-needs-main-session.

Run every step from the **main session** (subagents can't do git/network writes). Never put the literal `.env` substring in a Bash command (guard hook blocks it) — patch `.env.local` via a small node script or the Edit tool.

## Checklist

1. **Reconcile docs against git FIRST — trust git, not the doc.** `docs/SESSION_STATE.md` may be stale or written ahead of reality. Before anything, run `git status`, `git diff --stat`, read every untracked file, and check `gh pr list --head <branch> --state all`. Describe what *actually* shipped from the diff — don't repeat the doc's claims (e.g. a "CI green for <SHA>" line may point at a commit that predates uncommitted work).

2. **Verify — all must pass:**
   - `npm run lint && npx tsc --noEmit`
   - `npm run build` (Vercel) AND `npx opennextjs-cloudflare build` (Cloudflare) — they diverge; check both.
   - If pushed, confirm both CI deploys are green for the **real head SHA** (Vercel deployment Ready; Cloudflare Workers Build `success` via the `cloudflare-builds` MCP).

3. **Update docs (bundle into THIS phase's feature PR — not a separate docs PR):**
   - Rewrite `docs/SESSION_STATE.md` for the NEXT phase: where we are, what this phase *actually* delivered (every new file/behavior), next-phase scope, deploy-env status, phase-specific gotchas, open questions. Convert relative dates to absolute.
   - Refresh `CLAUDE.md`: mark this phase ✓ and bold the next; add durable facts/gotchas learned this phase.

4. **Commit:** Conventional Commits on the numbered feature branch (`NNN-summary`). Trailers:
   `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>` and the `Claude-Session:` line.
   If the message contains `.env`, write it to a temp file and `git commit -F` (keeps `.env` out of the Bash command). Run git from the main session with `dangerouslyDisableSandbox: true`.

5. **Push + PR (do NOT merge — await the human's sign-off):**
   - `git push -u origin <branch>`
   - `gh pr create --base main --head <branch>` (or update the existing PR if one exists) with a structured body + the `🤖 Generated with…` footer.
   - Never delete branches (no `--delete-branch`, no `branch -D`). Verify all branches remain on local + remote.

6. **Archive the session** (per session-archive-convention — a cold agent forgets this):
   - Copy the newest `*.jsonl` from `~/.claude/projects/-Users-gregoriomoreta-Desktop-Projects-Ricki-Reign-rickireign/` to `~/Documents/claude-archives/rickireign/`.
   - It's a snapshot up to that moment — offer to re-copy at the very end to capture the tail.

7. **Emit the next-session kickoff prompt** (copy-pasteable) telling the next session to: read `docs/SESSION_STATE.md` + `CLAUDE.md` + the relevant `docs/PLAN.md` sections + `DESIGN.md`; sync `main`; plan-first and get sign-off BEFORE code; only then cut `NNN-next` off main and push immediately; the phase scope; and carry-over gotchas.

8. **Update auto-memory** if this phase produced durable facts (env set, IDs, caveats) — add a note + a one-line MEMORY.md index entry.

## Reminders

- Secrets stay server-only (never `NEXT_PUBLIC_*`, never committed); public keys may be defaulted in `lib/env.ts`.
- Merge happens only after the human reviews/tests/confirms. The handoff prepares main to be ready-on-merge; it does not merge.
- Stateful code (e.g. an in-memory rate limiter) won't persist across Cloudflare Worker isolates — note such caveats rather than assuming a green build proves runtime behavior.
- Carry-over launch to-dos worth restating each handoff until done: verify a `rickireign.com` Brevo domain sender; lawyer review of `/privacy` + `/terms`.
