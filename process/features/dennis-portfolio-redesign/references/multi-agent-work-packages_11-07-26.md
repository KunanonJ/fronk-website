# Multi-agent work packages (WP-01…09)

**Date**: 11-07-26  
**Source of truth for execution**: Cursor plan `dennis_multi-agent_ac` (do not edit plan file during execute)  
**Locks**: Söhne (Inter until `woff2`), dark-only `#1C1D20`, minimal motion, breakpoints 375/768/1440, miniature desktop

## Parallelization

- Parallel: WP-02 ∥ WP-01; after WP-03: WP-06 ∥ WP-07 ∥ WP-08  
- Serial: WP-03 after WP-01+WP-02; WP-04 before/with WP-05; WP-09 last  

## Shared DoD

All WP ACs + `pnpm test` + `pnpm typecheck` + smoke at three widths + handoff report + file ownership respected.

## WP index

| WP | Agent | Depends | Owns (summary) |
|----|-------|---------|----------------|
| WP-01 | Foundation | — | globals.css, layout.tsx, globals.test.ts, theme dark-only, disable Lenis |
| WP-02 | Icons | — | components/icons/** |
| WP-03 | Shell | 01+02 | SiteShell, Header, nav, Footer, FullscreenMenu, LocationPill; unmount HUD |
| WP-04 | Loader | 03 | IntroLoader, introGreetings |
| WP-05 | Home | 03+04 | app/page.tsx, Hero/home; no Three.js |
| WP-06 | Work | 03 | ventures page, /work redirect |
| WP-07 | AboutContact | 03 | about, contact |
| WP-08 | Editorial | 03 | writing, now, not-found |
| WP-09 | QA | 04–08 | e2e + QA report |

See plan for full AC-01.x … AC-09.x checklists.
