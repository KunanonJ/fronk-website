# Skills Hub: Execution Report

**Plan:** `process/general-plans/active/skills-hub_PLAN_06-11-26.md` (untracked in the main checkout)
**Branch:** `feat/skills-hub` (from `main` at `2e878d4`), changes uncommitted
**Date:** 06-11-26
**Status:** DONE_WITH_CONCERNS (all gates green; concerns are owner-review items below)

## What shipped

- `/skills`: hero (version badge linked to the release, View on GitHub), whole-pack install tabs (Claude Code, Codex, Cursor, `npx skills`, ZIP), "Or ask your agent" prompt with copy, the README pipeline strip, the catalog grouped by stage with a CSS-only filter (All, Original, Adapted, Runs automatically, You invoke), and credits from `sources.lock.json`.
- `/skills/[slug]` (20 pages, `dynamicParams = false`): breadcrumb, badges, single-skill install tabs (`npx skills`, folder ZIP, flat ZIP, plain copy, full pack), "How it runs", the full `SKILL.md` with copy and "View on GitHub" at the tag, files list, credit (upstream, license, copyright, pinned SHA, patches, HumanLayer excerpt on `pr`), stage siblings, previous/next. Breadcrumb and `SoftwareSourceCode` JSON-LD. Per-skill OG card (eyebrow "Skill").
- `/skills.json`: static machine-readable catalog (no SKILL.md bodies).
- Nav: top-level "Skills" after Portfolio (lucide `Blocks`, verified in lucide-react 1.66.0). Footer `/skills.md` relabelled "Agent guide".
- Sitemap (`/skills` + 20), `llms.txt` Skills section, `public/sitemap.md`, e2e routes, perf budget routes, `pnpm skills:sync`.
- Data: `scripts/sync-skills.mjs` writes `lib/content/skills.generated.json` from GitHub at the tag (tree, SKILL.md files, `sources.lock.json`, `patches/`, release assets). The build only reads the JSON.

## Files

Created: `scripts/sync-skills.mjs`, `scripts/sync-skills.test.ts`, `lib/content/skills.generated.json`, `lib/content/skills.ts`, `lib/content/skills.test.ts`, `lib/seo/skillsJsonLd.ts`, `components/landing/skills/{SkillsPageShell,SkillsIndexPage,SkillDetailPage,SkillCard,SkillParts,InstallTabs,CopyButton}.tsx`, `app/(landing)/skills/page.tsx`, `app/(landing)/skills/[slug]/page.tsx`, `app/(landing)/skills/[slug]/opengraph-image.tsx`, `app/skills.json/route.ts`, this report.

Changed: `lib/content/landing.ts`, `components/landing/LandingTopNav.tsx`, `app/sitemap.ts`, `app/llms.txt/route.ts`, `public/sitemap.md`, `tests/e2e/routes.ts`, `scripts/check-first-load-budget.mjs`, `package.json`.

## Verification Evidence

| Gate | Result |
|---|---|
| `lib/content/skills.test.ts` | 24 tests pass: 20 skills; each in exactly one stage; 12 adapted with source, 40-char SHA, license, copyright; 8 original only where the lock attributes nothing; ZIP URLs equal `releases/download/v6.1.1/<name>` and exist in the snapshot; slugs unique; nav placement |
| Sync script | `scripts/sync-skills.test.ts` 8 tests (frontmatter scalars, `disable-model-invocation`, nested `metadata`, lists, block scalars, CRLF, error cases; order-independent serialisation). Live: two runs then `--check` exit 0; delete + regenerate is byte-identical (sha1 `896a79c9`) |
| `pnpm typecheck` | 0 errors |
| `pnpm lint` | 0 errors, 5 warnings (the same 5 pre-existing) |
| `pnpm test` | 76 files, 355/355 pass (baseline 323 + 32 new) |
| `pnpm build:cloudflare` | exit 0; `/skills` and `/skills.json` static, 20 `/skills/[slug]` SSG; schema deploy skipped (no token) |
| `pnpm perf:budget` | PASS. `/skills` and every `/skills/<slug>`: 236.8 KB gz / 300 KB (portfolio is 241.1). Snapshot text found in 0 client chunks |
| ZIP links | `curl -sI` on all 41 snapshot asset URLs: 41 x 302 |
| Copy buttons | Playwright: Enter on "Copy install command for verify-loop" puts the exact command on the clipboard; live region reads "Copied the install command for verify-loop"; SKILL.md copy returns all 2113 chars |
| Tabs | ArrowRight moves focus and `aria-selected` to Codex and shows only its panel; End/Home work |
| Filter | Original 8 cards / 2 stages, Adapted 12 / 4, Auto 10 / 4, You invoke 10 / 2; radios move with arrow keys |
| Nav fit | One row at 768, 900, 1024, 1180, 1280, 1440, top and scrolled; clearance >= 25 px both sides (was -15 px scrolled before the fix below). Skills present in the 390 mobile menu |
| Quality floors | Audit of `main` at 390 and 1440, both themes: no text under 13 px, no target under 24x24, no duplicate accessible names, no horizontal overflow |
| e2e smoke + axe (prod server, port 3100) | Skills only: 12/12. Full smoke + a11y, desktop + mobile: 106/106 |
| axe, all impacts + best-practice + WCAG 2.2 AA | 0 violations on `/skills`, `/skills/verify-loop`, `/skills/pr` at 375 and 1440, dark and light |
| Live check after deploy | Not run (no deploy in this task) |

Build, perf and e2e ran before a final Prettier pass over the new files (formatting only); typecheck, lint and unit tests were re-run after it.

## Deviations

1. **Nav fit fix.** Six links overflowed the 720 px scrolled pill by 15 px. Top-level desktop icons now show from `lg` (1024 px), and from `lg` the scrolled pill is 800 px (was 720). Mobile and the Library dropdown keep their icons.
2. **No auto-update claim** on the Claude Code tab: not verifiable from the README.
3. **Invocation shown as "You invoke" / "Runs automatically"**, not `/name`: plugin skills may be namespaced, and Context7 was over quota, so the slash syntax was not verified.
4. **"When to use" became "How it runs"**: the description is already the page lede, so the section explains invocation instead of repeating it.
5. **Card ZIP button hides the visible size** (kept in the accessible name) so three actions fit one row; sizes are visible on detail pages.
6. Own `SkillsPageShell` instead of `LibraryPageShell`, to keep the 13 px eyebrow floor without editing a shared component.
7. Sync reads the git tree API (one call) rather than the contents API per folder.

## Owner review

- Copy: hero title and lede, stage names and blurbs, pipeline intro, "Or ask your agent" prompt, ZIP tab wording, origin line for originals, detail title "`<name>: agent skill`".
- Stage grouping (editorial, from the plan).
- `npx skills` single-skill command `-s <name>`: confirmed from vercel-labs/skills `docs/commands.md` (`-s, --skill <skills...>`); not executed.

## Open items

- Pre-existing (not from this branch): with reduced motion, `next dev` reports a hydration mismatch on the mobile menu `motion.button` (`tabindex` from `whileTap`). Seen on `/portfolio` too.
- `next dev` rewrites the heading level in `AGENTS.md`; reverted here.
- `/skills` HTML is 267 KB raw / 26 KB gzip (half is the RSC payload).
