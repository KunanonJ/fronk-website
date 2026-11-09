# Phase 6: Cleanup and guardrails

**Status:** IN PROGRESS. Split into 6a (cleanup, nav without framer-motion, dev speed: EXECUTED 09-11-26 on `feat/redesign-cleanup`, report `../reports/phase-6a_cleanup_REPORT_09-11-26.md`) and 6b (Linux visual baselines in CI, migration head snapshot, closeout). Owner decisions taken 09-11-26: retire `/stock/velorah`; keep `/design`; Linux baselines in CI; hubs get the nav once it is slimmed.
**Created:** 09-11-26
**Umbrella:** `visual-redesign_UMBRELLA_PLAN_09-11-26.md`
**Covers audit findings:** 7 (budget), 9 and 10 (final sweep to 0), 19 (dead code and unused dependencies), 20 (stale baselines, lint warnings), plus the leftovers from ux-experience Phase 5
**Depends on:** Phases 1 to 5 (baselines are refreshed only after the visuals settle)

## Objective

Remove everything the old looks left behind. Then lock the new system in with tests, budgets and reviewed baselines, so the TanStack migration has an exact reference to prove parity against.

## Owner decisions (at entry)

1. **`/stock/velorah`** (a template page, noindex, the only user of the `--color-showcase-*` tokens and `liquid-glass`): keep it unindexed or retire it like `/showcase` (#53, a 308 to `/`).
2. **`/design`** (the Phase 0 review page, noindex): keep it as a living style sheet, or delete it.
3. **Visual tests in CI:** keep them local-only (macOS baselines, as today), or add Linux baselines so CI runs them.

## Known levers (verify at entry)

1. **Dead code** (`knip`, via `pnpm dlx` or as a devDependency). Candidates from the ux-audit:
   - `components/home/*`, `components/hud/*`, `components/hero/*` (the only `three` user);
   - `components/layout/{Header,Footer,MobileNav,SiteShell,FullscreenMenu,AppFrame,...}`;
   - `components/motion/SmoothScrollProvider.tsx` (the only `lenis` user) and `lib/motion/gsapClient.ts` (the only `gsap` user);
   - `components/content/{AboutFallback,NowFallback}.tsx`;
   - unused `components/ui/*` (`SectionHeader` and `Reveal` have no users today);
   - the unused `lib/sanity/fetch.ts` helpers;
   - `components/landing/{WordsPullUp,WordsPullUpMultiStyle,AnimatedLetter}.tsx`, once Phase 2 stops using them.

   Delete only what knip confirms, together with their tests.
2. **Dependencies:** remove `three`, `@types/three`, `gsap` and `lenis` if knip confirms them. Remove `framer-motion` if nothing uses it after Phases 1 to 5 (`LandingTopNav` is the last known user); otherwise move it to `LazyMotion`. Re-run `pnpm audit`.
3. **Aliases out** (finishing Phase 0's aliasing):
   - remove `--landing-canvas`/`--landing-ink`, `--font-instrument-serif`/`--font-almarai`/`--font-hanken`/`--font-mono-instrument`, the legacy `--bg`/`--fg` group (once `/resume` uses the new roles), `--color-cream`, and the HUD utilities marked `@deprecated` at the top of `app/globals.css`;
   - grep must find no remaining users before each removal.
4. **Ratchets to zero:**
   - `MAX_SUB_12PX = 0` in `lib/design/typeFloor.test.ts`;
   - the raw-hex ratchet at 0 outside its allowlist;
   - the probe's `tinyText` and `smallTargets` at 0 on every route at 390 and 1440, in both themes.
5. **Budgets:** lower `DEFAULT_BUDGET_KB` and `MARKETING_BUDGET_KB` in `scripts/check-first-load-budget.mjs` to the measured worst route plus about 5%, and update its comments, which still explain the budgets through framer-motion and the landing chrome.
6. **Visual baselines:**
   - delete the 21 stale snapshots in `tests/e2e/visual.spec.ts-snapshots/`;
   - add a theme dimension to `tests/e2e/visual.spec.ts` (light and dark);
   - regenerate for every route in `tests/e2e/routes.ts` against a clean preview;
   - review every image by hand, and commit.
7. **Lint and hygiene:**
   - the 5 baseline lint warnings (general backlog "P3: Platform majors and code hygiene"):
     - `<img>` in `components/landing/Features.tsx` (likely gone after Phase 2);
     - the `triggerRef.current` cleanups in `components/layout/{FullscreenMenu,MobileNav}.tsx` (gone if knip confirms the files dead);
     - the unused `_url`/`_init` in `lib/newsletter/subscribe.test.ts`;
   - the `AGENTS.md` H1/H2 build churn (general backlog P3): commit the form that `next build` writes.
8. **Migration hand-off:**
   - record a per-route `<head>` snapshot (title, meta, links, JSON-LD) from a fresh `next build`;
   - point the TanStack migration research report at it and at the new baselines.

## Gates

- **Cleanup:** knip reports no unused files or dependencies (each one left is justified in the report).
- **Ratchets and budgets:** every ratchet at 0; the budgets lowered and passing.
- **Sweeps:** the full axe and probe sweep (390 and 1440, light and dark, every route in `tests/e2e/routes.ts`) is clean; the visual suite passes against the fresh, reviewed baselines.
- **Standard gates.**
- **Production:** after the approved deploy, a spot check of 5 routes in both themes.

## Closeout

Run the umbrella closeout steps. In `process/general-plans/backlog/backlog.md`, remove or trim the entries this program resolved:
- "P2: Visual regression baselines are stale";
- "P3: Dead fallback components carry stale Manut copy";
- "P3: Dev-only hydration warning on the nav menu button under reduced motion" (if Phase 1 fixed it);
- "P3: `next build` rewrites the agent-rules heading in `AGENTS.md`";
- the lint-warning part of "P3: Platform majors and code hygiene".

## Out of scope

The TanStack migration itself, and unhiding the blog or press.
