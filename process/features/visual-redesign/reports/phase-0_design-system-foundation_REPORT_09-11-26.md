# Phase 0 report: Design system foundation (09-11-26)

**Plan:** `../active/phase-0_design-system-foundation_PLAN_09-11-26.md`
**Branch:** `feat/design-system-foundation`
**Mode:** EXECUTE under the Harness-Absent Fallback. The owner chose "Merge, start Phase 0".

## Decisions

| ID | Decision | Source |
|---|---|---|
| D1 font | Geist + Geist Mono, with Noto Sans Thai for Thai | Owner (09-11-26) |
| D2 light page | `#F5F6FA`, with Mist `#E9EAF0` as the `--well` token | Plan recommendation; one token to change |
| D3 light default | Now, in Phase 0 | Owner ("start Phase 0: ... light default") |
| D4 dark link/focus | `#8E97FF` | Plan recommendation; one token to change |
| Nav icons | Keep, quieter (applies in Phase 1) | Owner (09-11-26) |

## What changed

### Tokens (`app/globals.css`)
- **Palette:** the owner's palette (`--palette-*`), defined once.
- **Role tokens** for light (`:root`, now the default) and dark (`.dark`): `--page`, `--surface`, `--surface-tint`, `--surface-warm`, `--well`, `--ink`, `--ink-2`, `--hairline(-strong)`, `--action(-hover)`, `--on-action`, `--link`, `--focus`, `--ember`, `--error-text`, `--success-text`, `--elev-card`.
- **Tailwind mapping:** all mapped into `@theme` (`bg-page`, `text-ink`, `bg-action`, `ring-focus`, `fill-signal`...).
- **Scales:** the type scale (`text-h1` to `text-label`, plus `text-stat`, nothing under 12 px), radii (`rounded-chip/input/card/panel`), `shadow-card` and `--ease-smooth`. Tailwind already defines `--ease-out`, so the plan's name would have changed every existing `ease-out` transition.
- **Legacy aliases,** so un-migrated pages adopt the palette with no per-file edits:
  - `--landing-canvas` and `--landing-ink` point at page and ink;
  - `--bg`, `--fg`, `--muted` and friends point at the roles;
  - `--color-cream` is now Glaze (black on Glaze is 16.4:1);
  - the retired font variable names (`--font-hanken`, `--font-almarai`, `--font-instrument-serif`, `--font-mono-instrument`, `--font-inter-contact`) now point at Geist.

### Fonts and theme
- **`app/layout.tsx`:**
  - Geist and Geist Mono replace Hanken Grotesk, Instrument Serif and Space Mono;
  - Noto Sans Thai is added with `preload: false` and the Thai subset;
  - `defaultTheme="light"`;
  - `themeColor` is now Ink / `#F5F6FA`.
- **`app/(landing)/layout.tsx`:** Almarai removed; uses `font-sans`.
- **`app/(landing)/contact/layout.tsx`:** the Inter load removed.
- **`components/landing/Hero.tsx`:** the wordmark is now lg 13.5vw and xl 14vw (was 14.5vw / 15vw). Geist sets "KunanonJ" about 7% wider than Almarai, which cut the wordmark-to-lede gap from 40-99 px to between -13 and +16 px, so it overlapped at 1024, 1280 and 1440 px. It's back to 39-96 px, matching production.

### Primitives (`components/ui/`)
- **Restyled on tokens, APIs kept:**
  - `Button`: primary uses the action colour; a new `inverse` variant;
  - `Card`: new `tone` (paper, tint, warm or ink), radius-card, hairline, `shadow-card`;
  - `Container`: new `reading` and `content` sizes.
- **New:**
  - `Chip`: a 12 px mono chip; `state="live" | "failed"` adds an Ember square plus a word, on its Paper fill;
  - `Section`: 64/96/128 px rhythm, labelled by its heading;
  - `MonoLabel`;
  - `PixelGrid`: seeded and deterministic; Ember only when live or failed; decorative unless labelled.

### Guards (`lib/design/`)
- **`contrast.ts`:** WCAG luminance and contrast with alpha compositing.
- **`contrast.test.ts`:** parses the role tokens from `globals.css` and checks 56 pairs in both themes (text ≥ 4.5, focus and Ember ≥ 3). Also encodes the palette rules: Signal fails on Ink, Ember fails on the light tints, and cream is Glaze, never Signal.
- **`typeFloor.test.ts`:** a sub-12 px ratchet. Baseline 35; Phase 6 must reach 0.
- **`rawHex.test.ts`:** a raw-hex ratchet. Baseline 7; icon/OG renderers and the layout's `themeColor` are allowlisted.
- **`globals.test.ts`:** rewritten as the new foundation contract. It keeps the print, reduced-motion and no-Lenis checks.
- **`sourceScan.ts`:** a shared file-walk helper for the ratchets.

### Review page and probe
- **`app/(system)/design/page.tsx`:** every token and primitive, with a theme toggle. `noindex, nofollow`, unlinked, and not in `sitemap.xml` or `llms.txt`.
- **`scripts/ux-probe.mjs`** plus `pnpm probe`: the audit probe as a committed tool (LCP, CLS, TBT, bytes by type, font requests, sub-12 px text, sub-24 px targets). Resources are classified by file type, because next/font preloads fonts through `<link>`.

### Docs
- `public/skills.md` §1.2, `README.md` (style line), `AGENTS.md` (the design line only; the build's heading churn was dropped).

## Verification Evidence

| Gate | Expected | Result |
|---|---|---|
| `contrast.test.ts` | Every declared pair passes in both themes | 56/56 |
| `typeFloor.test.ts` / `rawHex.test.ts` | Pass at the recorded baselines | Pass (35 / 7); primitives have 0 of each |
| Primitive tests | All pass | 21/21 (`components/ui`) |
| `pnpm typecheck` / `lint` / `test` | Green, 0 lint errors | Pass; 5 baseline warnings; 90 files, 499/499 |
| `pnpm build:cloudflare`, `pnpm perf:budget` | Pass; JS within ±1 KB of the baseline | Pass; worst route 292.1 KB (was 291.6 KB) |
| e2e smoke + a11y (desktop + mobile, both themes) | All pass | 100/100 |
| Screenshot review | No unreadable text, no Times fallback, no broken layout | 20 routes × 2 viewports × 2 themes, scripted: no horizontal overflow, no serif-fallback text, no page errors, theme applied. Hand review of the contact sheets (phone light/dark, desktop light); the one defect found, the hero overlap, is fixed above |
| Probe: font requests | Fewer on `/` | Production before: 9-10 requests (123-171 KB) on `/`, `/about`, `/contact`, `/portfolio`. Branch: 2 requests (52 KB) on each; Thai topic 3 (78 KB, Noto Sans Thai only there) |
| Probe: LCP | No worse | Not comparable yet: the baseline is production and the branch run is the local preview. Re-run against production after deploy. Heroes are unchanged in this phase (video LCP on `/` and `/contact` until Phases 2 and 3) |
| `/resume` and `pnpm pdf` | Renders; PDF readable | Renders in both themes. The PDF exports (6 pages, same as the committed file); the committed `public/resume.pdf` is left unchanged in this PR |
| `/design` | 200, `noindex, nofollow`, absent from sitemap and llms | Pass |
| Production (after #62 deployed) | Light default on a fresh profile; dark toggle works; axe clean | Pass: a fresh visit gets light (`#F5F6FA`, Geist); the toggle switches to dark (`#0B0D17`) and stores it; e2e smoke + a11y 100/100 against kunanonj.com. Probe, production before → after: fonts 9-10 → 2 requests (123-171 → 52 KB); LCP `/` 13.1 → 12.6 s, `/about` 1.94 → 1.99 s, `/contact` 8.6 → 8.0 s, `/portfolio` 2.09 → 2.24 s (no change beyond noise; the video heroes go in Phases 2-3) |

## Notes for later phases

- **Video heroes:** in light mode, home and contact show their video heroes as dark islands in a light shell (expected; D3). Phases 2 and 3 replace them.
- **`/resume`:** the h1 wraps onto two lines on desktop now that Geist replaced the serif. The PDF print stylesheet is still the old terminal look; with Space Mono retired, the exported PDF falls back to Menlo. Phase 5 restyles both.
- **`/stock/velorah`:** its display font is now Geist through the alias (template page, noindex); Phase 6 decides its fate.
- **OG images:** they keep their own fonts in `lib/og/fonts/` until Phase 4.
