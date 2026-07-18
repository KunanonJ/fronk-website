# Phase 0 — Foundation (tokens, motion, HUD teardown prep)

**Date**: 11-07-26  
**Program**: dennis-portfolio-redesign  
**Status**: 🔨 CODE DONE — see `reports/phase-0_foundation_REPORT_11-07-26.md`  
**Depends on**: —  
**Report target**: `process/features/dennis-portfolio-redesign/reports/phase-0_foundation_REPORT_11-07-26.md`

---

## Objective

Install motion foundations, flip design tokens from terminal/HUD toward Dennis charcoal portfolio language, wire reduced-motion gates, and capture visual baselines — without yet rebuilding every page section.

## In scope

- Add deps: `lenis` (or locomotive-scroll), `gsap` (+ ScrollTrigger) — client-only
- Ensure `useReducedMotion` (or equivalent) gates all new motion; tests green
- Rewrite `app/globals.css` tokens toward charcoal/grey/white portfolio palette; keep light theme coherent or dark-first with documented choice
- Font decision: load chosen grotesque for display/body; stop treating Space Mono as primary instrument chrome
- Deprecate (CSS/class level) HUD utilities that will be removed in Phase 1: document migration map
- Playwright/visual smoke baselines for `/`, `/ventures`, `/about`, `/contact` at key breakpoints (extend existing e2e harness)
- Reference note: `references/dennis-teardown_11-07-26.md` (IA + interaction inventory)

## Out of scope

- Fullscreen menu, portrait hero, work grid redesign (Phases 1–3)
- Removing AppFrame/TelemetryHUD components yet (prep only; removal in Phase 1)
- Production deploy

## Validation gates

1. `pnpm test` green  
2. `pnpm typecheck` + `pnpm lint` green  
3. `pnpm dev` boots; pages render (may look transitional)  
4. Reduced-motion media query disables Lenis/GSAP init in unit or component test  
5. Visual baseline suite runs (create or update)  
6. Durable report written

## Blockers that justify BLOCKED

- Cannot meet license for chosen display font → switch to OFL alternative and document
- Bundle analyzer shows GSAP+Lenis alone exceed existing first-load budget before any page work → pause and re-negotiate budget with owner

## Foundation vs follow-up

- **Foundation proof**: tokens + motion libs + a11y gate + baselines exist  
- **Follow-up**: shell/pages consume them in Phases 1–6  
