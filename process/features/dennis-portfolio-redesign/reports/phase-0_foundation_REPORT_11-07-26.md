# Phase 0 foundation — REPORT

**Date**: 11-07-26  
**Program**: dennis-portfolio-redesign  
**Plan**: `active/phase-0_foundation_PLAN_11-07-26.md`  
**Status**: 🔨 CODE DONE — gates verified locally; awaiting owner ✅ VERIFIED

---

## What shipped

1. **Deps**: `lenis@1.3.25`, `gsap@3.15.0`
2. **Motion gates**: `lib/motion/motionRuntime.ts` — `prefersReducedMotion`, `createSmoothScroll`, `registerGsapPlugins` (PRM → no Lenis/GSAP init). Tests in `motionRuntime.test.ts`.
3. **Providers**: `SmoothScrollProvider` wraps public `SiteShell`; `ensureGsap()` in `lib/motion/gsapClient.ts` for Phase 2+.
4. **Tokens**: Charcoal portfolio palette (`#1c1d20` dark, `--hero-field`), Inter grotesque, HUD utilities marked `@deprecated`.
5. **Fonts**: Geist → Inter (`--font-inter`); Space Mono demoted (transitional HUD only).
6. **Docs**: `references/dennis-teardown_11-07-26.md`, `references/hud-migration-map_11-07-26.md`
7. **Visual baselines**: Chromium mobile/tablet/desktop snapshots refreshed for all public routes.

## Verification evidence

| Gate | Result |
|------|--------|
| `pnpm test` | 174 passed |
| `pnpm typecheck` (`tsc --noEmit`) | clean |
| eslint on touched TS | clean |
| `pnpm dev` http://localhost:3000 | 200 |
| Motion PRM unit tests | green (factory not called when reduce) |
| Playwright visual (mobile/tablet/desktop) | 21 passed after `--update-snapshots` |
| Playwright smoke firefox/webkit | skipped — browsers not installed locally |

## Not in this phase (by design)

- AppFrame / TelemetryHUD still mounted (Phase 1 removes)
- No portrait hero / fullscreen menu / work grid rebuild

## Next

- Owner confirms Phase 0 look is acceptable → mark ✅ VERIFIED  
- Then **ENTER EXECUTE MODE** for Phase 1: `active/phase-1_shell_PLAN_11-07-26.md`
