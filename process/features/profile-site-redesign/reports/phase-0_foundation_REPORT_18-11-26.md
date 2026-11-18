# Phase 0 report: Foundation (fonts, tokens, primitives)

**Plan:** `../active/phase-0_foundation_PLAN_18-11-26.md`
**Date:** 18-11-26, on `feat/profile-site-redesign` at `563b2a3` plus the
uncommitted Phase 0 tree (nothing committed, pushed or deployed).
**Harness:** `.claude/agents/`, `.claude/skills/` and `process/context/` are
missing, so the phase ran in the main session under the Harness-Absent
Fallback (`process/development-protocols/orchestration.md`). Reinstalling the
harness and running `vc-generate-context` are recommended follow-ups.
**Status:** VERIFIED (18-11-26). `isZoomSafeClamp` is written (section 7),
and an independent code review's findings are fixed or recorded (section 10).
Every gate passes or has a recorded, pre-existing cause. After the fixes the
browser suites (smoke, axe and the profile checks on desktop, mobile, the
device matrix and the WebKit phone) ran 435 passed, 35 skipped, 0 failed.

## 1. Research answers (the plan's "Research first")

- **Attributes on `<html>`:** `src/routes/__root.tsx` reads the pathname with
  `useRouterState` and sets `lang`; it now sets `data-design="profile"` the
  same way for `/preview` and `/preview/*` only.
- **Tailwind and the new folders:** Tailwind 4 scans the project, so classes
  in `components/ds/` and `components/profile/` compile with no config
  (the build emits `text-ink-60`, `bg-tint-2` and the rest).
- **Fonts:** Google Fonts CSS2 API, Chrome user agent, 18-11-26: Instrument
  Serif v5, Onest v11, JetBrains Mono v24, Patrick Hand v25. File, subset,
  bytes and SHA-256 per file in `src/fonts/LICENSES/README.md`; OFL texts
  from `google/fonts` (`ofl/<family>/OFL.txt`).
- **Glyphs:** "é", "·", "’", "—" and "©" are in every family's Latin subset.
  "→" (U+2192) and "↗", "←" are only in Onest's `symbols` subset, so that
  file is declared for `U+2190-2199` alone (18 KB, loaded only where an
  arrow renders).
- **Fallback metrics:** next/font's formula over `@capsizecss/metrics` 4.5.0,
  checked first against the repo's Geist fallback (it reproduces 104.76%,
  95.94%, 28.16%). Onest on Arial 105.2 / 92.2 / 28.99; Instrument Serif on
  Times New Roman 83.94 / 117.94 / 36.93; JetBrains Mono on Courier New
  99.98 / 102.02 / 30.
- **Baseline status** (`web-features` 3.46.0):

| Feature | Status | Use in the design |
| --- | --- | --- |
| Container queries, viewport units (`svh`), `color-mix()`, `oklch()`, `:has()`, `<dialog>`, `inert`, cascade layers, logical properties, `font-synthesis-weight`, `clamp()`, forced-colors, prefers-contrast | widely available | used freely |
| Popover API (low since 2025-01-27), `@property` (2024-07-09), view transitions and view-transition classes (2025-10-14), `backdrop-filter` (2024-09-16), `text-wrap: balance` (2024-05-13), `@starting-style` (2024-08-06) | newly available | each with the fallback the design system lists |
| `text-wrap: pretty`, CSS anchor positioning, viewport segments, `prefers-reduced-transparency` | not Baseline | enhancements only |

The Popover API is newly available, not widely: Phase 1 keeps the scripted
fallback the design system's Engineering table names.

## 2. What was built

| Step | Files |
| --- | --- |
| 0a Guards | `lib/design/globals.test.ts`: the font pin adds Instrument Serif, Onest, JetBrains Mono and Patrick Hand (Instrument Serif leaves the retired list; Inter, Hanken Grotesk, Space Mono and Almarai stay banned); the motion guard now fails any `animation:` outside no-preference, with two named exceptions (`kj-reveal`, the theme view transition; `intro-word-in`, whose overlay never mounts under reduced motion); every keyframe is `kj-` or `intro-`; a "profile redesign scope" block. `tests/e2e/a11y.spec.ts`: `wcag22aa` for the preview routes, and a fixture that proves `target-size` runs |
| 0b Fonts | 12 woff2 files in `src/fonts/`, `src/fonts/LICENSES/` (four OFL texts and the sources README), 15 `@font-face` rules and three fallback faces in `src/styles/fonts.css` |
| 0c Tokens and classes | `src/styles/globals.css`: the `[data-design="profile"]` block and its dark form (palette, ink mixes, washes, materials, radii, shadows, easings, durations, layout, rem type sizes, font stacks, roles), `@property` registrations, the `prefers-contrast: more` block, scoped `::selection`, and in `@layer components` the focus ring, the `t-*` type classes, the `ds-*` primitives, the skip link, the marquee, hover rules for fine pointers, the reduced-transparency and forced-colors blocks, then `kj-ping` and `kj-marquee` and the motion rules under no-preference. Tailwind names from spec 2.12 and the `tablet` breakpoint in `@theme inline` |
| 0d Contrast | `lib/design/contrast.ts` reads `oklch()`, `transparent` and premultiplied `color-mix()`. `lib/design/contrast.test.ts` resolves the scope as the browser cascades it and checks 80 pairs per theme (text, large text, non-text, all six materials at both ends), the high-contrast floor (7:1), the theme colours and the type clamps. `lib/design/fluidType.ts` parses clamps; its `isZoomSafeClamp` is the owner's to write |
| 0e Primitives | `components/ds/`: `Pill.tsx` (Pill, `pillClass`, SwapArrow, CtaArrow), `labels.tsx` (Chip, Badge, EyebrowRow, StatusDot, PixelMark), `layout.tsx` (Wrap, Tile), `TextLink.tsx`, `MotionToggle.tsx`, `Reveal.tsx`, `ditherCells.ts`, `DitherField.tsx`; tests `primitives.test.tsx`, `Reveal.test.tsx`, `ditherCells.test.ts` |
| 0f Cursors | `public/cursors/arrow.svg`, `hand.svg`: our own pixel drawings, ink with a 1.5 px paper outline, tips at the CSS hotspots (2,1 and 10,2), fine pointers only, inside the scope |
| 0g Preview route | `src/routes/preview/route.tsx` (noindex, the two new preloads), `index.tsx`, `system.tsx`; `components/profile/preview/{PreviewLayout,PreviewHome,SystemPreview}.tsx`; `lib/seo/robots.ts` and test (`Disallow: /preview` in every allowing group); `vite.config.mts` (no prerender); `tests/e2e/routes.ts` (`PREVIEW_ROUTES`), `smoke.spec.ts` and `visual.spec.ts` (the previews in the render and visual loops); `playwright.config.ts` (fold-closed 344 x 882, fold-open 882 x 1104, tablet-landscape 1180 x 820, webkit-phone 390 x 844, all limited to `profile.spec.ts`); `tests/e2e/profile.spec.ts`; `scripts/check-first-load-budget.mjs` (stylesheet and font budgets); `.github/workflows/ci.yml` (a profile step in the visual job); `src/routeTree.gen.ts` (generated) |

## 3. Deviations from the plan, with reasons

1. **Serif fallback on Times New Roman, no Patrick Hand fallback face.** Plan
   0b said Georgia and "a system cursive"; spec 3.1, which the build follows,
   says Times New Roman and gives the hand font none (it loads only with the
   hidden notebook).
2. **Onest `symbols` subset added** for the arrows (the plan's glyph check),
   narrowed to `U+2190-2199`.
3. **Primitive files grouped by role** (`labels.tsx`, `layout.tsx`) and named
   as the design system names them: `PixelMark` with kinds instead of
   `PxMark` and `PxDot`, `StatusDot plain` for the static dot.
4. **No "soft" pill.** Plan 0e listed it; spec 6.1 defines dark and ghost
   only.
5. **No `html.js` class for Reveal.** Only script adds `is-pending` (spec
   6.7), which gives the same guarantee: nothing hides without script, under
   reduced motion, above the fold or around an h1.
6. **`--color-paper` unchanged.** It exists with another meaning; the other
   spec 2.12 names were added.
7. **Previews in their own list.** `PREVIEW_ROUTES` sits beside `ROUTES` in
   `tests/e2e/routes.ts`, because smoke's header and menu checks need site
   chrome the previews do not have yet.
8. **The parity reference changed in one place.** Gate 5 said "untouched",
   but Public Contracts adds `Disallow: /preview` to robots.txt, and the
   reference pins robots.txt's body. Only that body changed (14 inserted
   lines inside one JSON string); the unit test and the parity crawl both
   pass on it.
9. **CI runs the profile spec** in the visual job's container; the plan's
   touchpoints did not list `ci.yml`.
10. **Keyframes now: `kj-ping` and `kj-marquee`.** The others in spec 5.2
    arrive with their components, so no unused CSS ships early.
11. **No `.t-h2` alias.** `t-title` is the h2 class in spec 3.3.
12. **The Tile `span` prop** from the design system's planned API was left
    to Phase 3, which builds the grid that would read it.

## 4. Gates

| # | Gate | Command | Result |
| --- | --- | --- | --- |
| 1 | Types, lint, format, knip | `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm knip` | all pass, 0 warnings |
| 1 | Unit tests | `pnpm test` | 1,209 pass after `isZoomSafeClamp` and the review fixes (sections 7 and 10); 1 robots reference failure fixed (deviation 8) |
| 1 | Build, budgets | `pnpm build`, `pnpm perf:budget` | pass; entry 108.1 / 120 KB; worst route 189.6 / 200 KB; stylesheets 20.1 / 22 KB; preloaded fonts 51.2 / 56 KB |
| 2 | Primitive tests | `pnpm exec vitest run components/ds` | 29 pass |
| 3 | Ratchets | `typeFloor`, `rawHex`, `sharedPrimitives` in `pnpm test` | pass, no new allowlist entries |
| 4 | Visual | pinned image, `visual.spec.ts` and `profile.spec.ts` | 10 new baselines reviewed and added; existing ones unchanged; About mobile mismatch reproduced on the base commit (section 6) |
| 5 | Parity | `GATES_PORT=4273 node scripts/start-gates.mjs --parity-only` | 137 URLs compared, 0 differences; 137 crawled, none added or removed |
| 6 | Axe on `/preview/system` | `playwright test a11y.spec.ts --grep preview-system` | pass in both themes (mobile, tablet, desktop Chromium; desktop WebKit), with `wcag22aa` |
| 7 | Network | production build, fonts per page | `/` and `/about`: only `geist-latin`, `geist-mono-latin` (as before); `/preview/system`: the new faces |
| 8 | Licences | `src/fonts/LICENSES/` | four OFL texts, source and hash per file |
| 9 | WCAG 2.2 tag | the `target-size` fixture in `a11y.spec.ts` | fails as it must |
| 10 | Best practices | `profile.spec.ts`, desktop | forced colors, text spacing, zoom to 500%, more contrast, request origins: each failed on its fixture, then passed on `/preview/system` |
| 11 | WebKit phone | `profile.spec.ts --project=webkit-phone` | pass (no sideways scroll, 12 px floor, 24 px targets, both themes) |
| 12 | Budgets and clamps | `pnpm perf:budget`; contrast.test.ts | budgets set and pass; rem bounds pass; every clamp passes `isZoomSafeClamp` |
| matrix | Device matrix | `profile.spec.ts` at 344, 375, 768, 882, 1180, 1440 and WebKit 390 | pass |

The amended axe run found one real problem on the preview page: the ink
specimen set ink 52, 45 and 30 as 17 px text. The specimen now shows ink 52
at 28 px and ink 45 and 30 as bars, as the tokens' rules say.

Firefox is not installed on this machine, so the Firefox project failed to
launch; CI does not run Firefox for these specs.

## 5. Measurements

- The profile section adds about 6.0 KB gzip to `globals.css` and 1.0 KB to
  `fonts.css`. Every page downloads that render-blocking CSS until Phase 8
  removes the old design; the umbrella chose one stylesheet over two token
  sources. Phase 6 may revisit if the cutover pages show a regression.
- `/preview/system` still preloads the two Geist files from the root head;
  Phase 6 makes the preloads follow the scope.

## 6. Visual baselines (Linux)

Run in `mcr.microsoft.com/playwright:v1.64.1-noble` (linux/amd64, as CI, on an
arm64 Mac through emulation) with `--update-snapshots=missing`, so the 96
existing baselines are compared and only the new previews are written. The
image ships Node 26 without corepack, so pnpm 10.34.9 was installed with npm,
as CI's pnpm action does.

- `visual.spec.ts --project=mobile --project=desktop`: 92 passed, 6 passed on
  the retry (three portfolio pages, Press, Portfolio dark, and the new
  preview's first capture; slow emulated captures), 2 failed: About on
  mobile, light and dark (9,789 px tall against the 9,812 px baseline).
- **About is not a Phase 0 regression.** The same container rendered About
  from the untouched base commit `563b2a3`: the same 9,789 against 9,812, and
  its log shows the page height flipping between the two from one capture to
  the next. Phase 0's global additions cannot reach the page (the registered
  properties and `[data-reveal]` appear only in the profile code). Follow-up
  outside this phase: steady the About mobile capture or re-take its
  baseline.
- `profile.spec.ts` in desktop, fold-closed, fold-open, tablet-landscape and
  webkit-phone: 21 passed, 24 skipped by design.
- New baselines, reviewed against the spec (type, colour, both themes, the
  344 px reflow) and added: `visual.spec.ts-snapshots/preview-system-{light,dark}-{mobile,desktop}-linux.png`
  and `profile.spec.ts-snapshots/preview-system-{light,dark}-{fold-closed,fold-open,tablet-landscape}-linux.png`.
  No existing baseline changed (`git diff` on the snapshot folder is empty).

## 7. Open items

- **Closed: `isZoomSafeClamp`** in `lib/design/fluidType.ts` is written. A
  clamp passes when its largest size is at most 2.5 times its smallest, so
  500% browser zoom can still double every size (WCAG 1.4.4). The hero (2.29
  times) passes; `fluidType.test.ts` covers the rule, and the eight clamp
  checks in `contrast.test.ts` pass.
- **Preview baselines:** the review fixes (section 10) change
  `/preview/system`, so its 10 Linux baselines render again with Phase 1.
- **Design system re-sync at merge:** the artifact's planned API differs from
  the code in three places: `PillProps.arrow` is `"swap" | "none"` (the card
  arrow is `CtaArrow`), `PillProps` gains `icon`, and `TileProps.span` waits
  for Phase 3.
- **WCAG 2.2 on live pages** moves with each page family (Phases 6 and 7).

## 8. Regression checks

```
Regression: live pages (smoke and axe, CI's e2e job)
Command: PLAYWRIGHT_WEB_SERVER="pnpm start" pnpm exec playwright test smoke.spec.ts a11y.spec.ts --project=desktop
Result: PASS, 208 of 208

Regression: SEO parity
Command: GATES_PORT=4273 node scripts/start-gates.mjs --parity-only
Result: PASS, 137 URLs, 0 differences (robots.txt reference updated by design)

Regression: fonts on live pages
Command: Playwright request log on /, /about (production build)
Result: PASS, only the two Geist files, as before

Regression: live-page visual baselines (Linux, pinned image)
Command: playwright test visual.spec.ts --project=mobile --project=desktop --update-snapshots=missing
Result: PASS except About mobile, which fails the same way on base 563b2a3 (pre-existing, not Phase 0)
```

## 9. Skipped validators

- `.claude/skills/*/scripts` validators: the harness is not installed.
- Real-device and screen-reader passes belong to Phase 6.

## 10. Code review and fixes (18-11-26)

An independent review read the whole Phase 0 diff and probed the production
CSS in Chromium and WebKit. It found no change to how any live page renders,
plus 3 medium and 8 low issues. Ten were fixed the same day; one is a
recorded trade-off.

| # | Finding | Fix |
| --- | --- | --- |
| M1 | `Reveal` could leave content invisible: with a 0.15 threshold and a -8% bottom margin, a short block at the very end of the page, or a block taller than about 6 screens, never counted as seen | The observer now counts any visible pixel (`threshold: 0`, no margin). A unit test pins the options; a browser check scrolls `/preview/system` to the end and finds nothing pending |
| M2 | The scope switched when a navigation started, so the old page was restyled mid-transition (preview to live and back) | `__root.tsx` reads the scope from the matched routes (`profileDesign()` in `lib/design/scope.ts`, with tests), which change when the new page commits |
| M3 | `@theme inline` froze the Geist stacks into Tailwind's preflight and the `font-sans`, `font-mono`, `font-display` utilities, so `<code>` in the scope rendered Geist Mono | The scope sets `--default-font-family` and `--default-mono-font-family`; a guard keeps the frozen utilities out of `components/ds` and `components/profile` |
| L4 | Thai line heights applied only when an ancestor, not the element, carried `lang="th"` | Rules are now `:is(...):lang(th)`, which follows the inherited language either way |
| L5 | The card pill's label sat 10 px off centre (the collapsed arrow still took the gap) | The collapsed arrow cancels the gap with a negative margin, transitioned with its width |
| L6 | A block never scrolled into view printed blank (the no-preference query matches print) | A print rule shows pending blocks; a browser check covers it |
| L7 | The marquee moved before hydration, and forever without JavaScript, with no pause control (WCAG 2.2.2) | New `Marquee` primitive (`components/ds/Marquee.tsx`, with tests): it runs only with `data-running`, set once hydrated with motion allowed, when its toggle exists. `/preview/system` uses it, and Phase 2's logo strip will |
| L8 | The pixel cursors replaced the reader's own pointer even in forced colors | Cursors apply only with `forced-colors: none` and `prefers-contrast: no-preference` |
| L9 | `Disallow: /preview` in robots.txt hides the noindex from obedient crawlers | Kept on purpose: the umbrella plan requires the Disallow, the routes are unlinked and temporary, and Phase 6 deletes them. Recorded as a trade-off |
| L10 | The raw-hex ratchet did not scan the new folders | It scans `components/ds` and `components/profile` (no hex today) |
| L11 | The stylesheet and font budgets passed silently on 0 KB if the markup changed | The script fails when a page links no stylesheet, when a referenced asset is missing, or when no page preloads a font |

Gates after the fixes:

- `pnpm typecheck`, `pnpm lint`, `pnpm knip`: clean.
- `pnpm test`: 1,209 pass.
- `pnpm build`: pass.
- `pnpm perf:budget`: entry 108.2 / 120 KB, stylesheets 20.2 / 22 KB, fonts 51.2 / 56 KB.
- Parity: 137 URLs, 0 differences.
- Browser suites: see the status line.

The fixes change how `/preview/system` looks: the `<code>` labels, the Thai
sample's line height and the card pill's label. Its 10 Linux baselines
therefore render again with Phase 1, which adds the site chrome to every
preview page anyway.
