# Phase 5: Cleanup and guardrails

**Status:** SUPERSEDED 09-11-26 by visual-redesign (see its umbrella mapping table: `process/features/visual-redesign/completed/visual-redesign_UMBRELLA_PLAN_09-11-26.md`). Not executed; its findings are folded into the redesign phases.
**Created:** 06-11-26
**Umbrella:** `ux-experience_UMBRELLA_PLAN_06-11-26.md`
**Covers audit findings:** 19, 20
**Depends on:** Phases 1-4 (baselines are refreshed only after visuals settle)

## Objective

Remove what earlier redesigns left behind, and leave the site guarded against silent visual drift.

## Known work (verify at entry)

1. **Dead code.** Run `knip` (added as a devDependency or run once with `pnpm dlx`). The audit's alias-only scan flagged about 40 candidate modules: `components/home/*`, `components/hud/*`, `components/hero/*` (the only `three` user), `components/layout/{Header,Footer,MobileNav,SiteShell,AppFrame,...}`, `components/motion/SmoothScrollProvider.tsx` (the only `lenis` user), `lib/motion/gsapClient.ts` (the only `gsap` user), and `components/content/{AboutFallback,NowFallback}.tsx` (backlog P3). Delete only what knip confirms, together with their tests. Check `lib/design/globals.test.ts` for guarded tokens before removing CSS utilities.
2. **Unused dependencies.** Remove `three`, `@types/three`, `gsap` and `lenis` if knip confirms them. Re-run `pnpm audit`.
3. **Template stock page.** `/stock/velorah` is a template page, like the retired `/showcase`. The owner decides whether to keep it (unindexed) or retire it the same way. `/stock/asme` already redirects.
4. **Lint warnings** (backlog P3): copy `triggerRef.current` to a local inside the `FullscreenMenu` and `MobileNav` effects (if those files survive step 1), and fix the unused params in `lib/newsletter/subscribe.test.ts`.
5. **Visual baselines** (backlog P2): delete the retired-route baselines, regenerate for every route in `tests/e2e/routes.ts` against a clean `pnpm preview`, review every image by hand, and commit as a new baseline. Decide with the owner whether visual tests should run in CI on Linux (that needs Linux baselines) or stay local-only.
6. **`AGENTS.md` H1/H2 churn** (backlog P3): commit the H2 form that `next build` writes.

## Gates

`knip` reports no unused files or dependencies (or each one left is justified in the report), all standard gates pass, and the visual suite passes against the fresh baselines.

## Closeout

After this phase, run the umbrella closeout steps, and remove the backlog entries this program resolved from `process/general-plans/backlog/backlog.md`.
