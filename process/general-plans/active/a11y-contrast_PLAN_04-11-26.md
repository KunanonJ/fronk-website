# Accessibility: colour contrast in both themes - Plan

**Date**: 04-11-26
**Status**: EXECUTING (user: "continue until cover all", 04-11-26)
**Branch**: `fix/a11y-contrast` (from `main` at `e5c9517`)
**Harness note**: `.claude/` and `process/context/` are absent. Phases run in the main session per the Harness-Absent Fallback.

## Problem (measured on the live site, 04-11-26)

`tests/e2e/a11y.spec.ts` reports serious `color-contrast` violations on every landing route once scroll-reveal content is visible. The spec only passed earlier when axe ran before the reveal finished (cold server), and it is not in CI.

- **Dark theme (default):** small labels at `text-primary/30`-`/55` fall under 4.5:1. Examples: the footer "Library" label (`/50`, 4.04) on all 16 routes, the `/stack` table header (`/45`, 3.47), `/proof` and `/build` labels (`/40`, about 3.0), the `/build` "· site" tag (`/30`, 2.15), the `/resume` `text-subtle` token (4.48), and the `/contact` "OR" (`text-gray-400` on white, 2.6).
- **Light theme (user toggle):**
  - Muted text at `/50`-`/60` falls under 4.5:1 on the cream canvas (`/60` = 4.33).
  - Library cards hardcode dark surfaces (`bg-[#101010]`, `bg-white/5`) and white borders while their text uses the theme ink, so in light mode the text is dark on dark (about 1.05:1, effectively invisible) on `/proof`, `/press`, `/blog`, `/build`, `/learn` and `/examples`.

## Fix

1. **Muted text:** raise `text-primary/30`-`/60` on text to `/70` in landing components. `/70` passes on both the black and cream canvases and on `#141414`/white cards. Not touched: the search icon (non-text) and the input placeholder (not checked by axe).
2. **Theme-aware surfaces** in library/landing components:
   - `bg-[#101010]` becomes `bg-surface` (existing token: `#141414` dark, `#ffffff` light).
   - Unprefixed `bg-white/N` and `border-white/N` become `bg-primary/N` and `border-primary/N` (same alpha, so dark is visually unchanged).
   - Untouched: classes already behind `dark:`, the About hero (always over video with white text) and `/showcase` (own palette).
3. **Tokens:** dark `--subtle` 0.5 to 0.55 and light `--subtle` 0.62 to 0.7 (used by `/resume`).
4. **`/contact` "OR":** `text-gray-400` becomes `text-gray-600`.
5. **Test reliability:** `a11y.spec.ts` scrolls the page to trigger reveals before scanning, and scans both dark and light themes. Add the desktop a11y run to CI (`e2e-smoke` job) so regressions fail PRs.

## Touchpoints

`components/landing/{ProofPage,PressPage,BlogIndex,BlogPostPage,BuildPage,LearnPage,ExamplesPage,StackPage,AboutPageContent,LandingSiteFooter,ContributionActivity,LibraryPageShell,EditorialStubPage,Features,FormaContactPage,LandingTopNav}.tsx`, `components/landing/discovery/{VentureHubPage,TopicHubPage}.tsx`, `app/not-found.tsx`, `app/globals.css`, `tests/e2e/a11y.spec.ts`, `.github/workflows/ci.yml`.

## Public Contracts

None (styling only). CI gains an a11y step.

## Blast Radius

- **Visual:** dark mode gets slightly brighter muted labels; card surfaces go from `#101010` to `#141414`. Light mode cards become light with visible text and borders.
- **CI time:** about +1 minute for the desktop a11y run.

## Verification Evidence

| Check | Result |
|---|---|
| New `a11y.spec.ts` (dark + light, reduced motion) and `smoke.spec.ts`, desktop + tablet + mobile vs `next start` | PASS 132/132 (84 a11y + 48 smoke) |
| Extra routes not in `ROUTES` (2 blog posts, EN/TH topic hub, 2 venture hubs, a portfolio project, 404), dark + light, 1440 and 375px | 0 serious/critical violations |
| Screenshots | Light: cards render white with readable text and borders (`/proof`, `/press`, `/blog`, home Features). Dark: unchanged apart from slightly brighter muted labels. |
| typecheck / lint / unit / build / perf budget | 0 errors / 0 errors (1 existing `<img>` warning) / 315 pass / pass / PASS (worst 286.9 of 300 KB) |

## Deviations

- Two more always-dark spots found by the light scan were fixed the same way: home `Features` info cards (`bg-[#212121]` became `bg-surface dark:bg-[#212121]`, title `#E1E0CC` became `text-primary`, list `text-gray-400` became `text-gray-600 dark:text-gray-400`), and the two-tone Ventures heading (`text-gray-500`, 4.3:1 at mobile size, became `text-primary/70`).
- `/build` inset `bg-black/40` became `bg-primary/5 dark:bg-black/40` so dark mode stays identical.
- Kept on purpose: the input placeholder (`placeholder:text-primary/40`, not checked by axe) and the always-white contact card's `text-gray-500` (4.8:1, passes).

## Resume and Execution Handoff

- Execute anchor: this file.
- After merge, archive with the other 04-11-26 plans in UPDATE PROCESS.
