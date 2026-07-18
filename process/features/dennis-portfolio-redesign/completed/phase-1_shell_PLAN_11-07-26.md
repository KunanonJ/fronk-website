# Phase 1 — Shell chrome (nav, menu, footer)

**Date**: 11-07-26  
**Program**: dennis-portfolio-redesign  
**Status**: ⏳ PLANNED  
**Depends on**: Phase 0 ✅ VERIFIED  
**Report target**: `process/features/dennis-portfolio-redesign/reports/phase-1_shell_REPORT_11-07-26.md`

---

## Objective

Replace terminal HUD site chrome with Dennis-like shell used on every public route: minimal header, fullscreen navigation overlay, location pill, and rounded “Let’s work together” footer with local time + socials.

**Content:** keep existing Fronk strings/socials; owner will refine copy later. This phase is **style + chrome animation** only.

## In scope

- Remove/retire `AppFrame`, `TelemetryHUD`, status ticker as global chrome
- Header: “© Code by …” left; Work / About / Contact right (Dennis pattern)
- Fullscreen menu overlay (Navigation + Socials columns) with open/close motion + focus trap
- Location pill (“Located in Bangkok” + globe motif)
- Footer: giant “Let’s work together” / Get in touch + email + local time (Asia/Bangkok) + socials
- Wire Lenis (already mounted) + menu/page-chrome transitions
- Apply shell to all public layouts (not Studio)

## Out of scope

- Home section recomposition (Phase 2)
- Work/About/Contact page bodies (Phases 3–4)
- Rewriting marketing copy or replacing profile image (owner)

## Validation gates

1. Shell appears consistently on `/`, `/ventures`, `/about`, `/contact`, `/writing`, `/now`  
2. Menu open/close: Esc, focus trap, scroll lock, reduced-motion fade (no fancy if PRM)  
3. Suite + typecheck + lint green  
4. Visual smoke vs Phase 0 baselines updated  
5. Report written

## Blockers

- Focus-trap a11y regressions on mobile menu → must fix before ✅ VERIFIED  
