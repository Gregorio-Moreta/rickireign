---
name: phase-handoff
description: Use when a rickireign.com build phase is finished and you're handing off to the next session — reconciling docs with git, verifying both builds, running the two-model final review, updating SESSION_STATE + CLAUDE.md, opening the PR (no merge), publishing the phase close-out artifact + updating the block artifact (block review when the block's fifth phase closes), archiving the session transcript, and emitting the next kickoff prompt whose first line is `Phase NNN — Theme`.
---

# Phase Handoff (rickireign.com)

The end-of-phase ritual for this repo, so sessions transition cleanly. It's project-specific. It pairs with the memories: handoff-in-feature-pr, handoff-defer-branch-to-fresh-session, session-archive-convention, never-delete-branches, git-write-needs-main-session. **All handoff docs and artifact sources ride this phase's PR, never `main` directly.**

**Phase conventions** (chat title `Phase NNN — Theme`, 5-phase blocks, artifact titles/icons, `docs/phases/` layout, templates + fill rules, publishing rules) live in `~/.claude/skills/phase-kickoff/SKILL.md`. Follow them exactly. `<Project>` = **`Rickireign`**. Registry: `docs/phases/INDEX.md`. If this session was opened in the parent folder (`~/Desktop/Projects/Ricki_Reign`), run every git/gh/npm command from `rickireign/` and write memory to `~/.claude/projects/-Users-gregoriomoreta-Desktop-Projects-Ricki-Reign-rickireign/memory/`.

Run every step from the **main session** (subagents can't do git/network writes). The guard hook blocks any Bash command containing the literal dot-env substring. Patch the local env file via a small node script or the Edit tool.

## Checklist

1. **Reconcile docs against git FIRST, and trust git over the doc.** `docs/SESSION_STATE.md` may be stale or written ahead of reality. Before anything, run `git status` and `git diff --stat`, read every untracked file, and check `gh pr list --head <branch> --state all`. Describe what *actually* shipped from the diff. Don't repeat the doc's claims: a "CI green for <SHA>" line, for example, may point at a commit that predates uncommitted work.

2. **Verify. All must pass.** Keep the exact commands, numbers and head SHA for the close-out.
   - `npm run lint && npx tsc --noEmit`
   - `npm test`, plus the E2E suites the phase touched (`npm run test:e2e` / `test:e2e:cf`; see CLAUDE.md for the port and `--workers=1` gotchas)
   - `npm run build` (Vercel) AND `npx opennextjs-cloudflare build` (Cloudflare). They diverge, so check both.
   - If pushed, confirm both CI deploys are green for the **real head SHA**: Vercel deployment Ready, and Cloudflare Workers Build `success` via the `cloudflare-builds` MCP.

3. **Final review: two independent passes over `git diff main...HEAD`.** Skip only if both already ran on this exact head SHA. Run the `phase-reviewer-fable` agent (Fable 5.1, `max`) and the `phase-reviewer-opus` agent (Opus 5.5, `max`). Fix now or carry forward, and re-verify after fixes. Record every finding, its resolution, and which agent ran each pass.

3b. **Compose the next kickoff prompt now.** The rules are in generic phase-handoff step 3b.
   - **Line 1 is exactly `Phase NNN — Theme`.** Take the theme from the block plan row. If block BB has no plan page (e.g. 012), coin the theme now from the next scope: 2–5 Title Case words that will become the branch slug. Never leave `<Theme>`.
   - Include the wording about planning in plan mode on the current branch and syncing after approval.
   - Point it at `docs/SESSION_STATE.md` + `CLAUDE.md` + `docs/phases/INDEX.md` + the relevant `docs/PLAN.md` sections + `DESIGN.md`.

4. **Update docs.** Bundle them into THIS phase's feature PR, not a separate docs PR.
   - Rewrite `docs/SESSION_STATE.md` for the NEXT phase: where we are, what this phase *actually* delivered (every new file/behavior), next-phase scope, deploy-env status, phase-specific gotchas, open questions. Convert relative dates to absolute. End with the 3b kickoff prompt.
   - Refresh `CLAUDE.md`: mark this phase ✓ and bold the next, and add durable facts/gotchas learned this phase.

5. **Commit** with Conventional Commits on the numbered feature branch (`NNN-summary`).
   - Trailers: `Co-Authored-By: Claude <Fable 5.1 | Opus 5.5 — the model that did the work> <noreply@anthropic.com>` and the `Claude-Session:` line.
   - **Stage explicit paths only.** Never stage everything at once (no `-A`, no bare `.`, no `commit -a`).
   - **`.playwright-mcp/` must never be committed.** One of its tracked logs is over 100 MB, and GitHub rejects the push. If `git status` shows it, `git restore .playwright-mcp/`, then untrack it for good in this commit (`git rm -r --cached .playwright-mcp`, and add `/.playwright-mcp/` to `.gitignore`).
   - If the commit message would contain the dot-env substring, write it to a temp file and `git commit -F`.
   - Run git from the main session with `dangerouslyDisableSandbox: true`.

6. **Push + PR. Do NOT merge; await the human's sign-off.**
   - `git push -u origin <branch>`
   - `gh pr create --base main --head <branch>` (or `--base <prev-branch>` if this phase was stacked, or update the existing PR) with a structured body + the `🤖 Generated with…` footer.
   - Never delete branches (no `--delete-branch`, no `branch -D`). Verify all branches remain on local + remote.

7. **Phase close-out artifact.** Fill `~/.claude/skills/phase-kickoff/templates/phase-closeout.html` into `docs/phases/NNN-slug/closeout.html`.
   - Build it from git + the step 2 evidence + the step 3 findings, not from the plan's claims.
   - `SHORT_SHA` = the reviewed/verified commit.
   - Status pill = `PR open — awaiting sign-off` (this repo never self-merges).
   - Pre-protocol phases (011): the plan-vs-actual rows come from SESSION_STATE's scope, and the footer links read `none (pre-protocol)`.
   - Run the fill gates, then publish it (title `Rickireign Phase NNN Close-out`, icon `report`, description `Phase NNN — Theme: …`).
   - Then `gh pr edit` to add the link to the PR body, and record it in `docs/phases/INDEX.md` (Status `PR open`, PR #, Close-out link) and in the `plan.md` header if that file exists.

8. **Update the block artifact**, `docs/phases/blocks/block-BB-plan.html` (a living page). Set the phase to **Closed** with Close-out/PR links. Update Progress `n/5`, the Updated date and the exit-criteria statuses, add a change-log line, and drop `class="current"`. Read, then republish to the same URL. If block BB has no plan page yet (Block 03 until the 012 kickoff), skip this step and make sure the kickoff prompt says the page must be created.

9. **Block review**, only if `NNN % 5 == 4`. Fill `block-review.html` into `docs/phases/blocks/block-BB-review.html` from the five close-outs + git, and publish it (title `Rickireign Block BB Review`, icon `review`). Link it from INDEX.md's block row and set that row's Status to `Closed`. Set Progress 5/5 on the block page and add a final change-log line linking the review.

10. **Check the kickoff prompt.** If steps 4–9 changed any fact in it (PR number, must-do-first findings), update SESSION_STATE, then read and republish the close-out.

11. **Commit + push the artifact bookkeeping** on the same branch, so the PR carries it. Use explicit paths:
    - `docs/phases/` (INDEX.md, closeout.html, the block page source, plan.md), `docs/SESSION_STATE.md` and `CLAUDE.md`.
    - On the **first handoff after the protocol was adopted (011)**, also `.claude/skills/phase-handoff/SKILL.md`, so PR #14 carries the protocol bootstrap to `main`.
    - After pushing, confirm both deploys are green on the new head (Vercel Ready; Cloudflare Workers Build `success`).

12. **Archive the session** per session-archive-convention (a cold agent forgets this).
    - Copy `<session-id>.jsonl` (the UUID in your scratchpad path) from `~/.claude/projects/-Users-gregoriomoreta-Desktop-Projects-Ricki-Reign-rickireign/`, or from `-Users-gregoriomoreta-Desktop-Projects-Ricki-Reign/` if the session was opened in the parent folder.
    - Copy it to `~/Documents/claude-archives/rickireign/` as `YYYY-MM-DD-phase-NNN-slug.jsonl`.
    - It's a snapshot up to that moment, so offer to re-copy at the very end to capture the tail.

13. **Update auto-memory** (the rickireign memory dir) if this phase produced durable facts (env set, IDs, caveats). Add a note and a one-line MEMORY.md index entry.

14. **Report:** the close-out link, the block link (+ review link), the PR link, deploy status on the final head, and the kickoff prompt.

## Reminders

- Secrets stay server-only (never `NEXT_PUBLIC_*`, never committed). Public keys may be defaulted in `lib/env.ts`.
- Merge happens only after the human reviews, tests and confirms. The handoff prepares main to be ready-on-merge; it doesn't merge, and it doesn't cut the next branch.
- Stateful code (e.g. an in-memory rate limiter) won't persist across Cloudflare Worker isolates. Note such caveats rather than assuming a green build proves runtime behavior.
- Carry-over launch to-dos worth restating each handoff until done: verify a `rickireign.com` Brevo domain sender, and get a lawyer review of `/privacy` + `/terms`.
