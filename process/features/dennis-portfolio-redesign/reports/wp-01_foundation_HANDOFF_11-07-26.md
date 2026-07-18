# WP-01 Foundation handoff

**Status**: DONE  
**Date**: 11-07-26

## Done
- Dark-only public theme (`forcedTheme="dark"`, `themeColor: #1c1d20`)
- Inter fallback documented until Söhne `public/fonts/soehne/`
- Lenis CSS import removed; `SmoothScrollProvider` unmounted from SiteShell
- `globals.test.ts` updated for WP-01 ACs

## Verify
- `pnpm test` (globals contract)
- `pnpm typecheck`
