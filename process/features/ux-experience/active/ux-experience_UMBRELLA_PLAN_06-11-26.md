# UX Experience: Umbrella

**Date:** 06-11-26
**Complexity:** Phase program (6 phases)
**Status:** IN PROGRESS. Phase 0 shipped (#53, 08-11-26). Phase 1 executed 09-11-26 and its PR is open. Phase 2 is next.
**Feature:** `ux-experience`
**Evidence:** `../reports/ux-audit_REPORT_06-11-26.md` (live-site audit, findings 1-20)
**Harness note:** `.claude/` and `process/context/` are absent in this checkout. Phases run directly in the main session under the Harness-Absent Fallback (`process/development-protocols/orchestration.md`), with the same plan files and approval gates.

## Program Goal Charter

North star:
- A first-time visitor on a phone can see who Kunanon is, reach his work and writing, and contact him, without waiting on animation or losing a message.

Definition of done:
- The `/contact` form delivers every valid message to the owner's inbox and shows an honest error with an email fallback when delivery fails.
- No page shows template copy that contradicts the founder positioning. `/showcase` redirects to `/`.
- The first-visit intro finishes within 1.5 s and can be skipped. Route changes never cover content for more than about 300 ms.
- Mobile LCP is under 2.5 s on `/`, `/about` and `/blog` under the audit's throttling profile, and the per-route JS budget is lowered and enforced.
- No text under 12 px, no tap target under 24x24 CSS px, and axe reports no serious or critical violations on any public route.
- Home links to the portfolio and recent writing, About leads with the profile, and the blog filter fits in one row on a phone.
- Dead code and unused dependencies from earlier redesigns are removed, and the visual baselines are refreshed and reviewed.

What "verified" means (program level):
- Every phase passes `pnpm typecheck`, `pnpm lint` (0 errors), `pnpm test`, `pnpm build:cloudflare` and `pnpm perf:budget`, plus that phase's own gates.
- User-facing claims are checked in a running build (local `pnpm preview` or production after an approved deploy), never inferred from code alone.
- Speed claims use the audit's probe profile (390x844, 4x CPU, ~1.6 Mbps, 150 ms RTT, cold cache) and record before and after numbers in the phase report.

Scope tiers to phases:
- Tier 1, broken and trust-damaging (findings 1-3): Phase 0
- Tier 2, waiting and speed (findings 4-8): Phases 1 and 2
- Tier 3, readability and accessibility (findings 9-12): Phase 3
- Tier 4, information architecture and content (findings 13-18): Phase 4
- Tier 5, hygiene and guardrails (findings 19-20): Phase 5
- This program retires Tiers 1-5.

Explicitly out of scope:
- A visual redesign or a new design system. Improvements stay within the current landing look.
- New content such as articles, case studies or portfolio screenshots (owner-supplied; already in the general backlog).
- SEO/AEO work owned by `sea-discovery`. Do not de-index or redirect its authority routes.
- Node 24 and pnpm 12 migrations (general backlog).

Hard safety constraints (non-negotiable, per phase):
- No production deploy (`pnpm deploy`, `wrangler deploy`) and no Worker secret changes without explicit owner approval in chat.
- Never commit secrets. The Resend key and addresses live in Worker secrets or `.dev.vars`, with only names in `.env.example`.
- Commit only when the owner asks. One branch and PR per phase, never a push to `main`.
- Keep `/studio`, `/resume` and its PDF export, and every route listed in the `landing-cutover` locks working.
- Respect `prefers-reduced-motion` everywhere motion is touched.

## Locks (owner decisions, 06-11-26)

| Topic | Decision |
|---|---|
| Contact delivery | Keep the form and send it as email through Resend. |
| Intro and route wipe | Shorten both: intro within 1.5 s and skippable; route wipe becomes a fade of about 250 ms. |
| `/showcase` | Remove it, permanently redirect to `/`, and drop it from the sitemap. |

## Phases

| Phase | Plan | Proves | Depends on |
|---|---|---|---|
| 0 Fix what's broken | `phase-0_fix-broken_PLAN_06-11-26.md` | Real contact delivery, founder-voice contact copy, `/showcase` retired | none |
| 1 Remove waiting | `phase-1_remove-waiting_PLAN_06-11-26.md` | Intro within 1.5 s and skippable, about 250 ms route fade, idle cursor costs no frames | none (can run in parallel with 0) |
| 2 Speed | `phase-2_speed_PLAN_06-11-26.md` | Mobile LCP under 2.5 s on key routes; JS trimmed and budget tightened | 1 (the intro and splash affect what's measured) |
| 3 Readability and a11y | `phase-3_readability-a11y_PLAN_06-11-26.md` | 12 px text floor, 24 px targets, link purpose, self-hosted logos, axe in CI | 0 (contact form markup settled) |
| 4 IA and content | `phase-4_ia-content_PLAN_06-11-26.md` | Home surfaces work and writing; About and blog reordered for phones; copy consistent | 3 (shared typography and spacing) |
| 5 Cleanup and guardrails | `phase-5_cleanup_PLAN_06-11-26.md` | knip-verified dead code and dependencies removed; visual baselines refreshed | 1-4 (baselines last, once visuals settle) |

Related, outside this program: `process/general-plans/active/skills-hub_PLAN_06-11-26.md` (the new `/skills` catalog) runs in parallel with Phase 0, on its own branch, by owner decision. Phase 4's home strips should link to it once it ships.

Every phase runs the required loop from `phase-programs.md`: re-research at entry, an execution approval checkpoint, execute, validate, a regression check, then a report in `../reports/`.

## Measurement

The audit probe (Playwright driving system Chrome) produced the baseline numbers. Phase 2 commits a repeatable version to `scripts/` so every later phase can re-measure. Until then, phases reuse the report's method by hand.

## Closeout

After Phase 5 validation:

1. Archive this umbrella and the phase plans to `completed/`.
2. Update `process/features/CURRENT_FEATURES.md` and the AGENTS.md workspace facts.
3. Move anything left open to `backlog/` with the reason.
