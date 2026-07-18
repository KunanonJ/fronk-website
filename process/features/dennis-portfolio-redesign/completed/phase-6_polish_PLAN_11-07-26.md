# Phase 6 — Full animation polish, a11y, perf

**Date**: 11-07-26  
**Program**: dennis-portfolio-redesign  
**Status**: ⏳ PLANNED  
**Depends on**: Phases 2–5 CODE DONE / ✅ VERIFIED  
**Report target**: `process/features/dennis-portfolio-redesign/reports/phase-6_polish_REPORT_11-07-26.md`

---

## Objective

Complete the **animation inventory** and ship-quality gates: micro-interactions, reduced-motion completeness, performance, e2e smoke. Content can stay as-is for you to finalize afterward.

## In scope

- Tick every item in `references/style-animation-inventory_11-07-26.md`
- Magnetic/hover only if a11y + perf OK
- ScrollTrigger polish on home/work/about
- Consistent page transitions on all public routes
- PRM: no smooth-scroll hijack, no loader loop, instant sections
- Perf budget (`analyze` / `perf:budget`); lazy GSAP where possible
- E2E smoke: home → work → about → contact → writing
- Keyboard + SR pass on menu and contact

## Out of scope

- Production deploy
- Final content polish (owner)

## Validation gates

1. Animation inventory checklist complete (or explicitly waived)  
2. E2E smoke green  
3. Reduced-motion documented  
4. Perf budget pass or owner-signed exception  
5. `pnpm test` + typecheck + lint + build green  
6. Program closeout report  
