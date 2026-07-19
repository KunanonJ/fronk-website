# Phase 0 — FogLAMP foundation (tokens + Button)

**Date**: 18-07-26  
**Status**: ✅ CODE DONE  
**Depends on**: Umbrella approved  
**Report**: `reports/phase-0_foglamp-foundation_REPORT_18-07-26.md`

## Objective

Lock near-black tokens, grain, pill Button, themeColor; update `globals.test.ts`.

## Touchpoints

- `app/globals.css`, `app/layout.tsx`
- `components/ui/Button.tsx` (+ tests)
- `lib/design/globals.test.ts`

## Acceptance

1. `.dark --bg` is near-black (`#0a0a0a`), not `#1c1d20`
2. Grain opacity ≥ 0.05 in dark
3. Button: `rounded-full`, no CornerTicks, no mono uppercase primary
4. `themeColor` matches `--bg`
5. Söhne/Inter font contract preserved
6. Suite green for touched tests
