# Skills Hub: Plan

**Status:** EXECUTED 06-11-26 by a parallel agent in worktree `.claude/worktrees/agent-a954e4036f712e20d` (branch `feat/skills-hub`, uncommitted). The orchestrator reviewed and re-verified it: typecheck pass; lint 0 errors (5 baseline warnings); 355/355 tests; `skills:sync --check` matches `superstacks@v6.1.1`; the `-s, --skill` flag is confirmed in the vercel-labs/skills docs; screenshots reviewed. Agent-reported only: build, perf budget (skills routes 236.8 KB / 300 KB), 41/41 asset URLs 302, e2e 106/106. Report: `process/general-plans/reports/skills-hub_REPORT_06-11-26.md` (in the worktree). Waiting on owner: nav-width change, copy review, commit/PR/deploy.
**Created:** 06-11-26
**Plan type:** COMPLEX single plan (one PR), general folder
**Harness note:** `.claude/` and `process/context/` are absent in this checkout. Runs under the Harness-Absent Fallback (`process/development-protocols/orchestration.md`).
**Runs in parallel with:** `process/features/ux-experience/active/phase-0_fix-broken_PLAN_06-11-26.md` (owner decision). The plans overlap only in `app/sitemap.ts` and `app/llms.txt/route.ts`; whichever PR merges second rebases.

## Overview

Add a top-level **Skills** menu item that opens `/skills`, a catalog of the AI agent skills Kunanon builds and uses. Visitors can install the whole pack or a single skill with one copied command, or download a ZIP. Each skill gets a page at `/skills/[slug]`.

References from the owner: aihero.dev/skills (catalog grouped by workflow stage; one-command install; Claude Code plugin with auto-updates) and rea.tools (copyable command and "ask your agent" prompt blocks, per-agent install paths).

## Decisions (owner, 06-11-26)

| Topic | Decision |
|---|---|
| Catalog source | `KunanonJ/superstacks` only (public, MIT, release v6.1.1, 20 skills). |
| Adapted skills | List all 20. Mark each skill **Original** or **Adapted from `<source>`** with a link, and keep the MIT notices. |
| Order | Build in parallel with UX Phase 0, on separate branches. |
| Nav | A new top-level item, as the owner asked ("another menu"). |

## Facts (researched 06-11-26)

- Skill folders: `plugins/superstacks/skills/<name>/SKILL.md`, some with `references/`.
- Frontmatter fields: `name`, `description` (starts "Use when..."), `license`, and optionally `disable-model-invocation: true` for user-invoked skills.
- `sources.lock.json` lists each upstream (`name`, `url`, pinned `sha`, `license`, `copyright`) and the skills taken from it:
  - obra/superpowers (Jesse Vincent): 3 skills
  - mattpocock/skills (Matt Pocock): 7 skills
  - cursor/plugins pstack (Lauren Tan): 2 skills
  - The other 8 skills are original.
- Release v6.1.1 assets: `<skill>.zip` (folder layout), `<skill>-flat.zip` (`SKILL.md` at the zip root, for claude.ai and ChatGPT upload), and `superstacks-plugin.zip`. Each is 0.3-11 KB; the plugin is 93 KB.
- Install paths, from the superstacks README:
  - Claude Code: `/plugin marketplace add KunanonJ/superstacks`, then `/plugin install superstacks@superstacks`
  - Codex: `codex plugin marketplace add KunanonJ/superstacks`
  - Cursor: copy `plugins/superstacks/` to `~/.cursor/plugins/local/superstacks/`
  - npx: `DISABLE_TELEMETRY=1 npx skills add KunanonJ/superstacks -g -s '*' --copy -y`
  - Plain copy of a skill folder
- The existing `public/skills.md` is a coding-guidelines file for agents working on this site, not a catalog. It keeps its URL.

## Information architecture

### `/skills` (index)

1. **Hero:** "Skills" eyebrow, a title such as "The agent skills I build with", one sentence on what a skill is, a version badge (`v6.1.1`, linked to the release), and "View on GitHub".
2. **Install the whole pack:** tabs for Claude Code, Codex, Cursor, `npx skills`, and ZIP (claude.ai / ChatGPT). Each tab has the exact command and a copy button. The Claude Code tab notes that plugins update automatically.
3. **Ask your agent:** a copyable prompt such as "Install the Superstacks skills from github.com/KunanonJ/superstacks using the steps in its README."
4. **Pipeline strip:** the README's flow (how, writing-plans, verify-loop, test-driven-development, verification-before-completion, code-review, interrogate, pr), each step linking to its skill.
5. **Catalog:** grouped by stage, with a one-row filter (All · Original · Adapted · Runs automatically · You invoke). Each card shows:
   - name and a short description (frontmatter with "Use when" kept);
   - an Original or Adapted badge with the source;
   - an Auto or `/name` badge, from `disable-model-invocation`;
   - actions: copy single-skill install, Download ZIP, Details.
6. **Credits:** upstream repos with license and copyright lines from `sources.lock.json`.

Proposed stage grouping (editorial; the owner reviews at the checkpoint):
- **Plan:** how, writing-plans, grilling, grill-with-docs, domain-modeling, interrogate
- **Build:** verify-loop, test-driven-development, diagnosing-bugs
- **Verify and ship:** verification-before-completion, code-review, pr
- **Operate and improve:** ticket-pipeline, workflow-profile, intake-triage, gardening, sample-review, steer-miner, mistake-to-constraint, writing-for-agents

### `/skills/[slug]` (detail)

1. Breadcrumb (Skills, then the skill name), title, description, and badges.
2. **Install this skill:** tabs:
   - `npx skills` (single skill)
   - ZIP for Claude Code or Codex (folder layout)
   - ZIP for claude.ai or ChatGPT (flat)
   - Plain copy (path in the repo)
   - "Included in the full pack" (plugin commands)
3. **When to use:** the frontmatter description.
4. **SKILL.md:** the full file in a monospace viewer with copy and "View on GitHub" (pinned to the release tag). No markdown renderer dependency in v1.
5. **Files:** the list (`SKILL.md`, `references/...`), each linking to GitHub at the tag.
6. **Credit** (adapted skills only): upstream repo, pinned SHA, license, copyright, and "Patched in Superstacks" when `patches/` touches it.
7. Previous/next and other skills in the same stage.

### Navigation and discovery

- `lib/content/landing.ts`: add `{ type: "link", label: "Skills", href: "/skills", icon: "skills" }` after Portfolio, and map `skills` to a lucide icon in `LandingTopNav`. Check desktop fit at 1024, 1280 and 1440, and the mobile menu at 390 (PR #51 fixed a 1024-1279 overlap).
- Footer: relabel the `/skills.md` link to "Agent guide", so it isn't confused with `/skills`.
- `app/sitemap.ts`: `/skills` plus 20 detail URLs. `app/llms.txt/route.ts`: a Skills section. Machine-readable `/skills.json` (name, description, install, zip URLs, source, license) for agents.
- JSON-LD: `SoftwareSourceCode` per skill, with `license`, `codeRepository`, `isBasedOn` (upstream, for adapted skills), and `author`.
- Per-skill OG image via the existing `renderOgCard` helper, eyebrow "Skill".

## Data flow

- `scripts/sync-skills.mjs` (new; `pnpm skills:sync [--tag v6.1.1]`) reads from GitHub at a release tag:
  - the skill folder list and file lists (GitHub contents API; uses `GITHUB_TOKEN` if set);
  - each `SKILL.md` (raw.githubusercontent.com at the tag), parsing frontmatter and keeping the body;
  - `sources.lock.json`, `patches/` names, release asset names and sizes.
- It writes `lib/content/skills.generated.json`, which is committed. The build never calls GitHub, so builds stay deterministic and rate limits can't break deploys. The owner re-runs the sync after cutting a release.
- `lib/content/skills.ts` holds the editorial overlay (page copy, stage grouping, install command templates) and helpers: `getAllSkills()`, `getSkillBySlug()`, `getSkillsByStage()`, `getAdjacentSkills()`, `skillInstallCommands(skill)`.
- Install command templates live in one place.
  - **Verify at execution:** confirm the single-skill `npx skills add` flag with `npx skills add --help`. The README uses `-s '*'` for all skills; never guess flags.

## Touchpoints

New:
- `scripts/sync-skills.mjs`
- `lib/content/skills.generated.json`, `lib/content/skills.ts`, `lib/content/skills.test.ts`
- `components/landing/skills/SkillsIndexPage.tsx`
- `components/landing/skills/SkillDetailPage.tsx`
- `components/landing/skills/SkillCard.tsx`
- `components/landing/skills/InstallTabs.tsx` (client)
- `components/landing/skills/CopyButton.tsx` (client, with `aria-live` feedback)
- `app/(landing)/skills/page.tsx`
- `app/(landing)/skills/[slug]/page.tsx` (`generateStaticParams`, `generateMetadata`, `notFound()`)
- `app/(landing)/skills/[slug]/opengraph-image.tsx`
- `app/skills.json/route.ts`

Changed:
- `lib/content/landing.ts` (nav item, footer label), `components/landing/LandingTopNav.tsx` (icon map)
- `app/sitemap.ts`, `app/llms.txt/route.ts`, `public/sitemap.md`
- `tests/e2e/routes.ts` (`/skills`, `/skills/verify-loop`), `scripts/check-first-load-budget.mjs` (routes)
- `package.json` (`skills:sync` script)

## Public Contracts

- New routes `/skills`, `/skills/[slug]` (20) and `/skills.json`. All are static.
- Outbound links to GitHub release assets and repo blobs at the pinned tag. No files are hosted on this site.
- No new env vars. `GITHUB_TOKEN` is used optionally by the sync script only.

## Blast Radius

The nav change shows on every landing route. Everything else is additive. There's no new runtime dependency; the client JS is limited to the tabs and copy buttons.

## Honesty rules

- No invented install counts, ratings or testimonials. Show only what the snapshot proves (version, file sizes, license).
- Adapted skills always show their upstream author and license. "Original" appears only for skills that `sources.lock.json` does not attribute elsewhere.

## Verification Evidence (to fill in during EXECUTE)

| Gate | Expected | Result |
|---|---|---|
| `lib/content/skills.test.ts` | 20 skills; every skill in exactly one stage; every adapted skill has source, license and copyright; ZIP URLs match the release assets in the snapshot; slugs unique | |
| Sync script on a fixture | Parses frontmatter, including `disable-model-invocation`, and writes a stable sorted JSON (no diff on re-run) | |
| typecheck / lint / test / build:cloudflare / perf:budget | green; skills routes within budget | |
| ZIP links | `curl -sI` every asset URL in the snapshot returns 302 or 200 | |
| Copy buttons | Clipboard holds the exact command; "Copied" is announced | |
| Nav fit | No overlap or wrap at 1024, 1280 and 1440; Skills reachable in the 390 mobile menu | |
| e2e smoke + axe | `/skills` and one detail page green | |
| Live check after an approved deploy | `/skills` 200, nav item present, one ZIP downloads | |

## Blockers that justify BLOCKED

- GitHub API unavailable while syncing (retry with `GITHUB_TOKEN`).
- The single-skill `npx skills` flag can't be confirmed. Then ship ZIP and copy-folder paths only for single skills, and note it.

## Out of scope

- Skills outside Superstacks (local `~/.claude` / `~/.agents` skills, company skills). Add them later by publishing them to a public repo and extending the sync.
- Rendering `SKILL.md` as rich markdown (v1 shows source).
- Comments, ratings, accounts, or gated downloads.

## Resume and Execution Handoff

- Execute anchor: this file.
- Branch suggestion: `feat/skills-hub` from `main`.
- Order:
  1. Sync script and snapshot.
  2. Content module and tests.
  3. Components.
  4. Routes.
  5. Nav, footer, sitemap, llms and JSON.
  6. OG images.
  7. Gates and screenshots at 390 and 1440.
- Report: `process/general-plans/reports/skills-hub_REPORT_<dd-mm-yy>.md`.
- Commit only when the owner asks.
