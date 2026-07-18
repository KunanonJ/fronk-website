# HUD → Portfolio migration map (Phase 0)

Transitional map for retiring terminal/HUD chrome in Phase 1.
Do not remove these until Phase 1 shell ships.

| Current (HUD) | Phase 0 status | Phase 1 replacement |
|---------------|----------------|---------------------|
| `AppFrame` / `frame-hud` | Keep mounted; CSS deprecated | Remove; no window bezel |
| `TelemetryHUD` | Keep mounted; CSS deprecated | Remove |
| `label-mono` | Deprecated utility | Small Inter caps / nav labels |
| `ghost-number` | Deprecated utility | Large Inter display numerals if needed |
| `rule-hud` | Deprecated utility | Simple `border-t border-border` |
| `panel` / `panel-live` | Keep for ventures cards | Work-grid cards (Dennis pattern) |
| Status ticker | Keep on Hero until Phase 2 | Name marquee / drop |
| Three.js `HeroBackdrop` | Keep until Phase 2 | Portrait + hero-field plane |
| Space Mono `--font-mono-instrument` | Loaded; demoted | Drop from layout if unused |
| Mint `--accent` on dark | Now near-white `#fff` | Keep neutral accent |
| Pure black `--bg` | Now `#1c1d20` | Keep charcoal |

New tokens:

- `--hero-field` / `bg-hero-field` — mid-grey hero backdrop (`#999d9e` dark / `#c8cacb` light)
- `--font-inter` — portfolio grotesque (OFL; approximates Dennis Sans without copying it)

Motion:

- `createSmoothScroll` / `registerGsapPlugins` in `lib/motion/motionRuntime.ts` — must gate Lenis/GSAP
- `SmoothScrollProvider` wraps public `SiteShell`
- `ensureGsap()` in `lib/motion/gsapClient.ts` for Phase 2+ ScrollTrigger work
