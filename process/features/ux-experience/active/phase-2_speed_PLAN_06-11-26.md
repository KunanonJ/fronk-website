# Phase 2: Speed

**Status:** OUTLINE. Re-research at phase entry, then complete the plan before asking for EXECUTE approval.
**Created:** 06-11-26
**Umbrella:** `ux-experience_UMBRELLA_PLAN_06-11-26.md`
**Covers audit findings:** 6 (mobile LCP 4-10.7 s), 7 (240-310 KB JS per route)
**Depends on:** Phase 1 (the intro and route wipe change what a measurement sees)

## Objective

Mobile LCP under 2.5 s on `/`, `/about` and `/blog` under the audit profile, and a lower JS budget enforced in CI.

## Known levers (verify at entry)

1. **Video heroes.** Home and about make a `<video>` their LCP element. Home renders 3 `<video>` elements, 2 with the same source. Videos are hot-linked from a third-party CloudFront bucket (`d8j0ntlcm91z4.cloudfront.net/user_.../hf_*.mp4`), so they can vanish without notice. Plan:
   - Extract one poster frame per video, encode it as AVIF or WebP, serve it from `public/`, and make it the LCP element (`fetchpriority="high"`, preloaded).
   - Attach the video `src` only after `load` or idle, with `preload="none"`. Skip it on `Save-Data` and reduced motion.
   - Render one video per hero; remove the duplicates.
   - Self-host the videos (Workers assets or R2) after checking file sizes.
2. **Blog index images: 982 KB.** Use `next/image` with correct `sizes`, lazy-load below the fold, and use thumbnails sized for the card.
3. **Sanity code in public bundles (~165 KB raw on `/`).** Find which client import pulls `@sanity/client` or `next-sanity` into landing chunks (candidates: a shared `lib/sanity` import in a client component, or draft/visual-editing code). Keep Sanity on the server and out of client graphs.
4. **framer-motion (~147 KB raw chunk).** Move to `LazyMotion` + `m` with `domAnimation`, or replace simple reveals (`WordsPullUp*`, `AnimatedLetter`) with CSS. Check usage in `Hero`, `Features`, `LandingTopNav`, `IntroLoader` and `RouteSplash`.
5. **CSS (116 KB raw).** Check for duplicated Tailwind layers and unused `@utility` blocks after Phase 5's dead-code pass. Lower priority.

## Deliverables

- `scripts/ux-probe.mjs` (or a Playwright spec), committed: the audit's probe as a repeatable tool, printing LCP, CLS, TBT and bytes per route.
- Lower thresholds in `scripts/check-first-load-budget.mjs` (current budget: 205 KB gz). The new number is set from measured after-values plus about 5%.

## Gates

Probe before and after table in the report. LCP under 2.5 s on the three routes, CLS at or below 0.05, no visual regression in hero framing (manual screenshot review), plus all standard gates.

## Out of scope

Replacing the video art direction. That is the owner's call; this phase only changes how media loads.
