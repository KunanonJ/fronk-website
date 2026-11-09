# Phase 7: Bento redesign

**Status:** OUTLINE (finalised at phase entry, after Phase 6).
**Created:** 09-11-26
**Umbrella:** `tanstack-migration_UMBRELLA_PLAN_09-11-26.md`
**Design source:** the approved Design canvas (https://claude.ai/artifact/X9f4PqkFMM4sxCw3pnDeNu): 20 pages, day and night, phone, foldable and tablet frames, the Bangkok location card and the shared motion system.

## Scope

- `src/ui`: tokens and motion from the canvas's shared styles (day/night variables, entrance stagger, hover lift, panel pop, reduced-motion off switch); components for the header (share panel, theme toggle, site menu), cards, chips, the share pill and the Bangkok location card with its live GMT+7 clock.
- Typed search params (Valibot, `validateSearch`) for every redesigned filter: skills stage and origin, press type, examples persona, the English/Thai switch, blog tags.
- Router `defaultViewTransition` for page changes; the theme switch keeps its circular reveal through the View Transitions API.
- One route group per PR (landing, hubs, skills, portfolio, system pages, hidden blog/press), each with new Linux visual baselines replacing the parity baselines for that group.
- Content stays from `lib/content` and Sanity; nothing invented. Press banners need owner-supplied images.

## Gates

- Visual baselines regenerated and reviewed per group; smoke + axe pass in both themes; reduced motion removes all animation; the 200/255 KB budgets hold; Lighthouse/perf probe no worse than the Phase 6 baseline.
