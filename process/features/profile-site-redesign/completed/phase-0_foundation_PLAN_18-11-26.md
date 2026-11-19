# Phase 0: Foundation (fonts, tokens, primitives)

**Status:** VERIFIED (18-11-26). Executed after the owner's "ENTER EXECUTE
MODE", reviewed and fixed the same day, and committed locally (not pushed)
once the owner approved local commits for parallel lanes.
**Evidence:** `../reports/phase-0_foundation_REPORT_18-11-26.md` (research
answers, deviations, every gate with its command and result).
**Created:** 18-11-26, at `563b2a3`.
**Umbrella:** `profile-site-redesign_UMBRELLA_PLAN_18-11-26.md`
**Spec:** `../references/design-spec_18-11-26.md` sections 1 to 6, 11, 12 and 13.
**Inventory:** `../references/codebase-inventory_18-11-26.md` sections 1.3,
1.4, 1.5, 3 and 8.
**Report target:** `../reports/phase-0_foundation_REPORT_{dd-mm-yy}.md`
**Design system:** https://claude.ai/artifact/3KT7Wet8Goh1q8MF2sqaQG (tokens,
component APIs in `components/index.d.ts`, the Accessibility and Engineering
rules). **Audit:** `../references/best-practices-audit_18-11-26.md` sections
1 to 10, 13 and 14.

## Objective

Add the reference's design system to the repo without moving the live site:
the four font families, the light and dark tokens, the type classes, the
layout variables, the motion catalogue, and the primitives every later phase
builds with. A hidden page, `/preview/system`, shows them all in both themes.

Foundation proof only. No page content, no chrome (Phase 1), no Home section
(Phases 2 to 4).

## Work

| Step | Scope |
| --- | --- |
| 0a | **Guards first, with the decision recorded.** In `lib/design/globals.test.ts`, replace the six-family font pin with the new set: Geist and Geist Mono (until Phase 8), Noto Sans Thai, Instrument Serif, Onest, JetBrains Mono, Patrick Hand. Lift the Instrument Serif ban only; keep the bans on Inter, Hanken Grotesk, Space Mono, Almarai and the legacy aliases (`--font-serif`, `--font-instrument-serif`, `--font-almarai`, `--font-hanken`). Keep the Lenis ban and the motion contract. Each changed assertion carries a comment naming owner decision 2 or 6 of the umbrella. In `tests/e2e/a11y.spec.ts`, add the `wcag22aa` tag for the `/preview/*` routes only (axe-core 4.14 leaves its WCAG 2.2 rule, `target-size`, off unless the tag is named; live pages get it when they move in Phases 6 and 7), and prove it runs with a fixture that must fail |
| 0b | **Fonts.** Self-host woff2 files under `src/fonts/`: Instrument Serif 400 normal and italic (latin, latin-ext), Onest variable 100-900 (latin, latin-ext, cyrillic), JetBrains Mono variable 100-800 (latin, latin-ext), Patrick Hand 400 (latin, latin-ext). Take them from the upstream Google Fonts or Fontsource releases, record the source, version and SHA-256 of each file, and add the SIL OFL licence texts (`src/fonts/LICENSES/`). Add `@font-face` rules to `src/styles/fonts.css` with `font-display: swap`, `unicode-range` subsets and size-adjusted fallback faces (Georgia for the serif, Arial for Onest, Courier New for the mono, a system cursive for the hand). Declared faces download only when used, so live pages fetch nothing new. Do not preload them on live pages |
| 0c | **Tokens and classes.** The scoped block of spec section 2.13 in `src/styles/globals.css`: `[data-design="profile"]` (light) and `.dark [data-design="profile"], html.dark[data-design="profile"]` (dark), which `__root.tsx` sets on `<html>` for `/preview/*` only, the way it sets `lang`. It holds every token in spec section 2: paper, ink, accent, coral, peach and tint scales, the ink alpha mixes (`color-mix`), gradients, the case-card material formula, notebook paper, radii, shadows, easings, durations, `--wrap`, `--read`, `--pad`, `--nav-h`, `--screen`, and the font roles named in spec section 3.1, each ending in Noto Sans Thai and a system fallback. Tailwind-facing names follow spec section 2.12 (no banned substrings such as `--color-accent` or `--font-serif`), a new `tablet` breakpoint sits at 810 px (`--breakpoint-tablet: 50.625rem`, spec section 4.1), and every new keyframe starts with `kj-` so the existing motion guard covers it. Then the type classes of spec section 3 (`.t-display`, `.t-title`, `.t-h2`, `.t-footer`, `.t-statement`, `.t-h3`, `.t-lead`, `.t-body`, `.t-small`, `.t-meta`, `.t-italic`, `.t-nav`, `.t-item`), `.wrap`, the primitive classes, `::selection`, the focus ring, and the keyframes, all keyframes and transitions inside `@media (prefers-reduced-motion: no-preference)`. Nothing outside the scope changes. Best practices (audit sections 2 to 5): font sizes in rem (the spec's px divided by 16); every fluid size a `clamp()` with rem bounds whose largest value is at most 2.5 times its smallest, and the hero size `clamp(2.625rem, min(5.4vw + 0.625rem, 8.4svh + 0.25rem), 6rem)` (spec 3.3); `font-synthesis-weight: none` in the scope; primitive classes in `@layer components` and custom utilities through `@utility`, never unlayered (unlayered rules beat Tailwind's utilities); logical properties in new rules; `@property` registrations at the top level (spec 5.4); and three reader-preference blocks: `prefers-contrast: more` (`ink-60` text to `ink-80`, rings to `line-strong`, solid chips), `prefers-reduced-transparency: reduce` (solid paper, no backdrop blur) and `forced-colors: active` (system-colour borders on ringed primitives, decorative pixels hidden, current links underlined) |
| 0d | **Contrast.** Extend `lib/design/contrast.test.ts` to read the scoped blocks, composite alpha colours over their backgrounds, and check every text pair at 4.5:1 (3:1 for display sizes and non-text). Expected from the spec values: meta and eyebrow text at the reference's ink 45% is about 3.1:1 on white and fails, so meta text uses ink 60% (about 4.9:1) and ink 45% is kept for decoration only; coral (about 2.6:1 on white) is never text; white on accent (about 5.6:1) passes for the role chip. Record every pair and its ratio in the report. A pair that only passes with a new palette value goes to the owner. The test also reads the `prefers-contrast: more` values, checks that the `theme-color` token equals the values Phase 6 will put in the metas, and checks the type clamps: rem bounds and a ratio of 2.5 or less |
| 0e | **Primitives** in `components/ds/`, with the props of the design system's `components/index.d.ts` (an icon-only control cannot be built without a label), a transparent 1 px border on every ringed primitive so forced-colors mode keeps its outline, and the dither canvas's device pixel ratio capped at 2: `Wrap`; `EyebrowRow` (single and centred rules); `Pill` (primary, ghost, soft, small, round; the striped coral and violet hover ring; `:active` scale) with `SwapArrow` and `CtaArrow`; `Chip`; `Tile`; `StatusDot` (pinging dot); `PxMark` and `PxDot` (pixel kicker mark and bullet); `Reveal` (IntersectionObserver adds a class; the hidden state lives under `prefers-reduced-motion: no-preference` and an `html.js` class, so nothing is hidden without JavaScript or with reduced motion; it must never wrap the hero h1); `Dither` (a canvas field drawn once per size and theme from a seeded, pure `ditherCells()` function: cell size, colour stops read from CSS variables, density falloff, device pixel ratio, `image-rendering: pixelated`, ResizeObserver and a theme observer, no animation loop, `aria-hidden`). Text sizes stay at 12 px or more; no raw hex in components |
| 0f | **Cursors.** Draw our own pixel arrow and hand cursors (`public/cursors/arrow.svg`, `hand.svg`), applied only under `(hover: hover) and (pointer: fine)`, the hand on links, buttons, labels and pills alike |
| 0g | **Preview route.** `src/routes/preview/route.tsx` (layout: `data-design="profile"` on `<html>` from `__root.tsx`, preload of the Onest and Instrument Serif latin files, `noindex, nofollow` meta, skip link, a temporary theme button that calls `setTheme`) and `src/routes/preview/system.tsx` (every token swatch, type class, primitive and state in both themes, with a reduced-motion note). Add `Disallow: /preview` to every group in `lib/seo/robots.ts` and its test. Keep `/preview` out of the sitemap, `llms.txt`, the parity route list and the prerender (an explicit exclusion in `vite.config.mts`). Add a `preview-system` entry to `tests/e2e/routes.ts`, and Playwright projects for the device matrix of spec section 10.1 (344 x 882, 882 x 1104 and 1180 x 820 beside today's 375, 768 and 1440) and a WebKit phone project at 390 x 844, all scoped to the preview routes. New checks on `/preview/system` (audit section 14), each written first against a fixture it must fail: forced colors (`forcedColors: 'active'`, Chromium), WCAG text spacing (line height 1.5, paragraphs 2em, letters .12em, words .16em: no clipped or overlapping text), 200% zoom (text grows, nothing overlaps), `prefers-contrast: more`, and request origins (only the site, the hosts `components/CloudflareAnalytics.tsx` loads, and Turnstile's on `/contact`). Measure the CSS and the Home first-view font bytes (gzip) and add both to `pnpm perf:budget` at the measurement plus 10%. When the phase merges, re-sync the design system artifact's tokens from the CSS and record any difference |
| 0h | **Tests and gates** (below) |

## Touchpoints

`lib/design/globals.test.ts`, `lib/design/contrast.test.ts`,
`src/styles/fonts.css`, `src/styles/globals.css` (the scoped block), `src/routes/__root.tsx` (the attribute), new font files and licences
in `src/fonts/`, new `components/ds/*` with tests, `tests/e2e/a11y.spec.ts`
(the `wcag22aa` tag for preview routes), `playwright.config.ts` (device and
WebKit phone projects), new best-practice checks under `tests/e2e/`,
`scripts/check-first-load-budget.mjs` (CSS and font budgets), new
`public/cursors/*.svg`, new `src/routes/preview/route.tsx` and
`system.tsx`, `src/routeTree.gen.ts` (generated), `lib/seo/robots.ts` and its
test, `vite.config.mts` (prerender exclusion), `tests/e2e/routes.ts`, new
baselines for `preview-system`.

## Public Contracts

- New hidden URLs: `/preview` (an empty shell until Phase 1) and
  `/preview/system`. Both noindex and nofollow, disallowed in `robots.txt`,
  absent from the sitemap and every text endpoint.
- `robots.txt` gains `Disallow: /preview` in each group. Nothing else in any
  public response changes.

## Blast Radius

The preview routes only. `fonts.css` grows by `@font-face` rules that no live
page uses; `globals.css` gains the scoped block, which matches no live page. The guards change as listed in 0a.

## Validation gates

1. `pnpm typecheck`, `pnpm lint` (0 warnings), `pnpm format:check`,
   `pnpm knip`, `pnpm test`, `pnpm build`, `pnpm perf:budget`: all pass.
2. Unit: `ditherCells()` is deterministic (same seed and size give the same
   cells) and density follows the falloff; `Reveal` renders visible content
   with no IntersectionObserver and under reduced motion; `Pill` variants keep
   their accessible names and the arrows are `aria-hidden`; contrast pairs
   for both themes pass.
3. `typeFloor`, `rawHex` and `sharedPrimitives` pass without new allowlist
   entries.
4. Visual: new baselines for `preview-system` in both themes at the device
   matrix's anchors (spec section 10.1), made in the pinned Playwright image and reviewed against the
   spec. All 96 existing baselines pass unchanged.
5. Parity: `node scripts/start-gates.mjs --parity-only` passes with the
   existing reference, untouched.
6. Axe on `/preview/system` in both themes with reduced motion: no serious or
   critical violations.
7. Network check on the production build: `/preview/system` loads the new
   woff2 files; `/` and `/about` load none of them; the entry chunk size is
   unchanged.
8. Licence check: every font file has its OFL text and recorded source.
9. Axe with `wcag22aa` on the preview routes, and its failing fixture caught.
10. Forced colors, text spacing, 200% zoom, `prefers-contrast` and
    request-origin checks pass on `/preview/system`, each having first failed
    on its fixture.
11. The WebKit phone project passes on `/preview/system`.
12. CSS and font budgets recorded and enforced; the type-clamp check passes.

## Blockers that justify BLOCKED

- A font's licence or source cannot be confirmed.
- A text pair needs a palette value the reference does not have (the owner
  chose the reference palette exactly).
- The scoped block changes a live page's computed styles (an existing
  baseline moves). Then stop and fix the scope before going on.

## Resume and Execution Handoff

- **Execute anchor:** this file.
- **Research first:** confirm how `__root.tsx` sets attributes on
  `<html>` per path (as it does for `lang`), how Tailwind 4 picks up
  `components/ds/` and `components/profile/` classes, and the exact upstream
  font files and versions. Check, in the web-features data, the Baseline
  status of each feature the design system uses (container queries, `svh`,
  `cqi`, `color-mix()`, `oklch()`, `:has()`, the Popover API, `@property`,
  view transition types, `backdrop-filter`, `text-wrap: pretty`, CSS anchor
  positioning, viewport segments) and confirm each has the fallback the
  design system's Engineering table names. Record the answers in the report
  before writing code.
- **Commit shape:** one commit for the guards and fonts (0a, 0b), one for the
  tokens and primitives (0c to 0f), one for the preview route and tests (0g,
  0h). Process files go in a separate commit after UPDATE PROCESS.
