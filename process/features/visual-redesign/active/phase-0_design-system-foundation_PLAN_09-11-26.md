# Phase 0: Design system foundation

**Status:** SHIPPED in #62 (09-11-26) and verified in production: light default on a fresh visit, dark toggle, e2e+axe 100/100 live, fonts 2 requests (52 KB) per page. Decisions: D1 Geist + Geist Mono (owner), D2 `#F5F6FA` and D4 `#8E97FF` (recommendations applied), D3 light default now (owner). Evidence: `../reports/phase-0_design-system-foundation_REPORT_09-11-26.md`.
**Created:** 09-11-26
**Umbrella:** `visual-redesign_UMBRELLA_PLAN_09-11-26.md`
**Covers:** the token system, the light default, fonts, primitives, contrast and type-floor guards, and the probe script. From the ux-audit: finding 9 (12 px floor rule), finding 10 (24 px target rule), finding 7 (font bytes), and the ux-experience Phase 2 probe deliverable.
**Harness note:** runs under the Harness-Absent Fallback (no `.claude/` agents, no `process/context/`).

## Objective

The owner's palette and a two-family type system exist as tokens and primitives. The site defaults to light. Every route that hasn't been redesigned yet still renders coherently and passes axe in both themes, through token aliasing. Later phases rebuild pages on top of this without touching the foundation again.

## Decisions for the owner (at the execution checkpoint)

| ID | Question | Options | Recommendation |
|---|---|---|---|
| D1 | Font family | **A.** Geist + Geist Mono (variable, one file each; the OG cards already ship Geist TTFs in `lib/og/fonts/`). **B.** Hanken Grotesk (already loaded, warmer) + Geist Mono. **C.** Inter Tight + Inter + JetBrains Mono (the research default; three families) | **A.** The closest to helumi's system-grotesk feel, one variable file per family, and site and OG images share a typeface. A Thai fallback is added in every option: Noto Sans Thai (recommended) or IBM Plex Sans Thai. Both exist in `next/font/google` |
| D2 | Light page background | `#F5F6FA` (cool off-white, near helumi's `#f5f5f5`) or Mist `#E9EAF0` (the backdrop in the owner's palette images) | `#F5F6FA` for the page, with Mist kept as a "well" token for inset areas. Content-heavy pages read calmer on the lighter page |
| D3 | When first-time visitors get light | **Now:** in Phase 0, once every route passes axe and screenshot review in light (light has been axe-clean since #36). **Later:** at the end of Phase 2, so the video-led home is never shown inside a light shell | Phase 0, with screenshot review as the gate. Fall back to Phase 2 if the review shows a jarring intermediate state |
| D4 | Dark-mode link and focus colour | `#8E97FF` (7.40 on Ink, 6.71 on `#151829`) or `#7C86FF` (6.19 / 5.62) | `#8E97FF`. Larger margin on raised dark surfaces |

## Design

### 1. Tokens (`app/globals.css`)

Raw palette, defined once and used only inside `globals.css`:
- `--palette-signal: #2B3BFF`, `--palette-glaze: #E8EBFF`, `--palette-paper: #FFFFFF`, `--palette-ink: #0B0D17`, `--palette-clay: #FFE3D6`, `--palette-ember: #FF5A1F`;
- plus `--palette-mist: #E9EAF0` and `--palette-signal-hover: #1E2BD6`.

Role variables, set in `:root` (light) and `.dark`. Values come from the research report's role table and the contrast table in the umbrella:

| Role | Light | Dark |
|---|---|---|
| `--page` | `#F5F6FA` (D2) | Ink |
| `--surface` | Paper | `#151829` |
| `--surface-tint` | Glaze | `#1D2136` |
| `--surface-warm` | Clay | `#151829` with Clay at 8% (composited value) |
| `--well` | Mist | `#0F1220` (verify contrast at entry) |
| `--ink` | Ink | Glaze |
| `--ink-2` | `#565B70` | `#A1A6BD` |
| `--hairline` / `--hairline-strong` | Ink at 8% / 16% | Glaze at 8% / 16% |
| `--action` / `--action-hover` / `--on-action` | Signal / `#1E2BD6` / Paper | Signal / `#1E2BD6` / Paper |
| `--link`, `--focus` | Signal | `#8E97FF` (D4) |
| `--ember` (markers only) | Ember | Ember |
| `--error-text` | `#B3360A` | `#FF7A45` |
| `--success-text` | `#137036` | `#4ADE80` |
| `--elev-card` | soft stack: `0 1px 2px` Ink at 4%, `0 12px 32px -12px` Ink at 10%, `0 40px 80px -32px` Signal at 12% | `none` (hairlines instead) |

Mapped into the Tailwind v4 `@theme inline` block, next to the existing entries:
- `--color-page`, `--color-ink`, `--color-ink-2`, `--color-action`, `--color-link`, `--color-focus`, `--color-glaze`, `--color-clay`, `--color-ember`, `--color-hairline`, `--color-surface-tint`, `--color-surface-warm`, `--color-well`;
- `--shadow-card: var(--elev-card)`.

**Aliasing,** so un-migrated pages adopt the palette without per-file edits:
- `--landing-canvas: var(--page)` and `--landing-ink: var(--ink)`. This moves every `bg-landing`, `text-primary` and `border-primary/N` (the whole landing shell) onto the new roles.
- `--bg`, `--fg`, `--muted`, `--subtle`, `--border`, `--border-strong`, `--surface`, `--surface-2` and `--accent` point at the new roles. Used by `/resume`, `components/ui/*` and `@utility panel`.
- `--color-cream` (15 `bg-cream` uses, always paired with `text-black`) becomes Glaze. Ink-coloured text on Glaze is 16.38:1. It must **not** become Signal: black on Signal is about 3.2:1.
- Font aliases, so the 20 files with inline `fontFamily: "var(--font-instrument-serif), ..."` don't fall back to Times:
  - `--font-instrument-serif`, `--font-almarai` and `--font-hanken` point at the new sans;
  - `--font-mono-instrument` points at the new mono.

  Each later phase replaces the inline styles it touches with the `font-display` utility. Phase 6 removes the aliases once grep finds none.
- Leave the `--color-showcase-*` tokens and `liquid-glass` alone. They're used only by `/stock/velorah`; Phase 6 decides.

### 2. Scales (Tailwind v4 `@theme`)

- **Type,** fluid with `clamp()` between the mobile and desktop values. Tailwind v4 `--text-*` with `--line-height` / `--letter-spacing` / `--font-weight` sub-keys; check the sub-key syntax via Context7 at entry.
  - `display` 56 to 88 px, line-height 1.0, -0.045em, 700
  - `h1` 44 to 64, -0.04em
  - `h2` 32 to 44, -0.03em, 600
  - `h3` 22 to 28, -0.02em, 600
  - `lead` 18 to 20
  - `body` 16 to 17, line-height 1.6
  - `small` 14
  - `label` 12 px, mono, uppercase, +0.06em
  - `stat` 44 to 64, tabular numerals

  **No token below 12 px.** Existing `--text-display` (used by `app/(system)/resume/page.tsx` and `components/home/VentureCaseRow.tsx`) and `--text-hero` (1 user) are redefined or aliased; grep before changing them.
- **Spacing:** Tailwind's 4 px scale as-is. Section rhythm lives in the `Section` primitive: 64 px on phones, 96 px at `md`, 128 px at `lg`.
- **Radius:** `--radius-chip` 8 px, `--radius-input` 12 px, `--radius-card` 24 px, `--radius-panel` 32 px, pills `rounded-full`. Pixel squares stay at 0.
- **Motion:** keep `--ease-out-quint`; add `--ease-out: cubic-bezier(0.22, 1, 0.36, 1)`, the curve helumi and the intro already use. Durations 150 to 300 ms. The `@media (prefers-reduced-motion: reduce)` guard stays.

### 3. Fonts (D1; shown for option A)

- `app/layout.tsx`:
  - replace `Hanken_Grotesk`, `Instrument_Serif` and `Space_Mono` with `Geist` and `Geist_Mono` from `next/font/google`, `display: "swap"`, `subsets: ["latin"]`;
  - add `Noto_Sans_Thai` with `subsets: ["thai"]` and `preload: false`. Its `unicode-range` means only pages with Thai glyphs download it, in practice `/th/topics/*`.
- `app/(landing)/layout.tsx`: remove `Almarai`. Keep the `landing-root` wrapper and the skip link.
- `app/(landing)/contact/layout.tsx`: remove the `Inter` load (the contact page moves to the system sans).
- `app/(landing)/stock/velorah/layout.tsx`: leave it as it is (template page; Phase 6).
- `--font-sans` and `--font-display` in `@theme` point at the new sans; `--font-mono` at the new mono. `@utility font-display` stays as the one way to get display type.
- OG images (`lib/og/fonts.ts`, `lib/og/fonts/`) are untouched until Phase 4.

### 4. Primitives

Restyle the existing ones without breaking their APIs; `/resume` and the legacy modules use them:
- **`components/ui/Button.tsx`:**
  - `primary` becomes the action fill with `on-action` text;
  - `secondary` becomes surface plus hairline;
  - `ghost` becomes a link-style underline;
  - add `inverse` (Ink fill with Paper text; in dark, Glaze fill with Ink text) for the Phase 1 Contact pill;
  - `md` keeps `h-11` (44 px), and `sm` goes to at least `h-9` with a 24 px-plus hit area.
- **`components/ui/Card.tsx`:** add `tone: "paper" | "tint" | "warm" | "ink"`, radius-card, a hairline, and `shadow-card`. Keep `hover`.
- **`components/ui/Container.tsx`:** add `size="content"` (`max-w-6xl`) and `size="reading"` (about 680 px); keep the existing sizes.

New:
- **`components/ui/Chip.tsx`:** a 12 px mono-label chip.
  - `tone: "neutral" | "signal"`;
  - `state?: "live" | "failed"`, which adds an 8 px Ember square plus a text label. The rule: Ember always comes with words, and only on Paper or Ink.
- **`components/ui/Section.tsx`:** a section wrapper with the vertical rhythm, an optional `eyebrow` and heading slot, and an `aria-labelledby` wiring helper.
- **`components/ui/MonoLabel.tsx`:** the 12 px uppercase mono eyebrow, replacing ad-hoc `text-[10px] uppercase tracking-[...]` markup.
- **`components/ui/PixelGrid.tsx`:** a deterministic SVG grid of squares.
  - Props: `cols`, `rows`, `seed` and `density`. The pattern comes from the seed, never `Math.random`, so there's no hydration mismatch.
  - `state?: "idle" | "live" | "failed"` turns a few cells Ember **only** for live or failed. `idle` is Signal and Glaze only.
  - `aria-hidden` by default, or `role="img"` with `label`.
  - An optional slow "firing" animation for `live`, off under reduced motion.

Tests for each:
- the variants map to the right classes;
- `Chip` live and failed render the label text;
- `PixelGrid` output is identical for the same seed, has no Ember cells when idle, and is `aria-hidden` by default.

A review page:
- `app/(system)/design/page.tsx` (new): every primitive and token swatch in a grid, `robots: { index: false, follow: false }`.
- Not linked, not in `app/sitemap.ts` or `llms.txt`.
- Used for the screenshot review in both themes. Phase 6 decides whether it stays.

### 5. Guards

- **`lib/design/contrast.ts` (new):** WCAG relative luminance and contrast, with alpha compositing for rgba tokens over their background.
- **`lib/design/contrast.test.ts` (new):** parses the role variables from the `:root` and `.dark` blocks of `app/globals.css`. Asserts at least 4.5 for text pairs:
  - ink and ink-2 on page, surface, tint and warm;
  - on-action on action and action-hover;
  - link on page and surface;
  - error and success text on surface, tint and warm;
  - dark link on dark page and surfaces.

  Asserts at least 3 for non-text: focus ring against page and surface, Ember on surface (light Paper) and on page (dark Ink). Asserts that no Ember marker sits on a light page or tinted background (encoded as a forbidden-pair list).
- **`lib/design/typeFloor.test.ts` (new):** a ratchet. It counts `text-[Npx]` with N under 12 in `components/` and `app/`, and fails if the count is above `MAX_SUB_12PX`. That starts at today's count (31; recount at entry), each phase lowers it, and Phase 6 must reach 0.
- **`lib/design/rawHex.test.ts` (new):** a ratchet on 6-digit hex literals in `components/landing/**` and `app/**/*.tsx`. 9 today; the target is 0, except an allowlist for OG/icon renderers that can't read CSS variables (`app/icon.tsx`, `app/apple-icon.tsx`, `lib/og/*`).
- **`lib/design/globals.test.ts`:** rewrite it as the new foundation contract. The current version asserts the old look: `--color-cream: #dedbc8`, `--landing-ink: #dedbc8`, Almarai, Instrument Serif, `defaultTheme="dark"`, `#000000`/`#f0eee6`. Keep its print-palette, reduced-motion and no-Lenis assertions.

### 6. Theme default (D3)

- `app/layout.tsx` ThemeProvider: change `defaultTheme="dark"` to `defaultTheme="light"`, keeping `attribute="class"` and `enableSystem={false}`. Returning visitors keep their stored choice (next-themes `localStorage` key `theme`, which `tests/e2e/a11y.spec.ts` also seeds).
- `viewport.themeColor`: update the dark and light values to Ink and the D2 page colour.

### 7. Probe

`scripts/ux-probe.mjs` (new): the ux-audit and Phase 1 probe as a committed tool.
- Playwright with system Chrome; the phone profile 390x844, 4x CPU, about 1.6 Mbps, 150 ms RTT, cold cache.
- Prints LCP, the LCP element, CLS, TBT, transferred bytes by type, font requests, sub-12 px text count and sub-24 px tap targets for a route list.
- `BASE` comes from an env var (default `http://localhost:8795`).
- Add `"probe": "node scripts/ux-probe.mjs"` to `package.json`.

### 8. Docs

Update the design facts that describe the old look:
- `public/skills.md` §1.2 (the cream primary token line);
- `README.md` line 19 (the style line);
- `AGENTS.md` line 718 (the cutover design line).

## Touchpoints

**New:**
- `lib/design/contrast.ts` and `contrast.test.ts`, `lib/design/typeFloor.test.ts`, `lib/design/rawHex.test.ts`
- `components/ui/Chip.tsx`, `Section.tsx`, `MonoLabel.tsx`, `PixelGrid.tsx`, with tests
- `app/(system)/design/page.tsx`
- `scripts/ux-probe.mjs`

**Changed:**
- `app/globals.css`, `app/layout.tsx`, `app/(landing)/layout.tsx`, `app/(landing)/contact/layout.tsx`
- `components/ui/Button.tsx`, `Card.tsx`, `Container.tsx` (and their tests)
- `lib/design/globals.test.ts`
- `package.json` (the probe script)
- `public/skills.md`, `README.md`, `AGENTS.md`

## Public Contracts

- No URL, metadata, JSON-LD, sitemap, robots or API changes. `/design` is noindex, unlinked and unlisted.
- First-time visitors get the light theme (D3). Stored preferences are respected.
- The legacy CSS variable and font names stay as aliases until Phase 6. Nothing outside this repo consumes them.

## Blast Radius

- **Every route,** through tokens, fonts and the default theme. Mitigations:
  - aliasing;
  - the both-theme axe suite;
  - a screenshot review of every route in `tests/e2e/routes.ts` at 390 and 1440, light and dark, before and after.
- **`/resume` and its PDF export** use `components/ui/Button`, `Container` and the legacy `--bg`/`--fg` tokens. Gate: the page renders and `pnpm pdf` produces a readable PDF (print palette preserved).
- **Video heroes** (home, contact, and the Features video cards) keep their dark overlays, so in light mode they read as dark islands in a light shell. That's acceptable mid-program (D3 decides the timing); Phases 2 and 3 remove them.
- **Perf:** font requests should drop. Today 5 families load across the layouts: Hanken Grotesk, Instrument Serif and Space Mono at the root, Almarai in `(landing)`, and Inter on `/contact` and `/stock/velorah`. The SEO audit counted 9 font preloads on `/`. The target is 2 variable files, plus Thai only on Thai pages. JS is unaffected. Measure with `pnpm perf:budget` and the probe.

## Verification Evidence (to fill)

| Gate | Expected | Result |
|---|---|---|
| `contrast.test.ts` | Every declared pair passes in both themes; the forbidden Ember pairs are absent | |
| `typeFloor.test.ts` / `rawHex.test.ts` | Pass at the recorded baselines | |
| Primitive tests | All pass, including PixelGrid determinism and Ember-only-when-live/failed | |
| `pnpm typecheck` / `lint` / `test` | Green, 0 lint errors | |
| `pnpm build:cloudflare`, `pnpm perf:budget` | Pass; JS within ±1 KB of the baseline | |
| e2e smoke + a11y (desktop + mobile, both themes) against the preview | All pass | |
| Screenshot review, every route, 390/1440, light/dark, before/after | No unreadable text, no Times fallback, no broken layout; listed in the report | |
| Probe on `/`, `/about`, `/contact`, `/portfolio` | Baseline recorded; font requests on `/` drop from 9-10 to 2-3; LCP no worse | |
| `/resume` and `pnpm pdf` | Renders; the PDF is readable | |
| `/design` | 200, `noindex, nofollow`, absent from `sitemap.xml` and `llms.txt` | |
| Production (after an approved deploy) | Light default on a fresh profile; dark toggle works; axe clean | |

## Blockers that justify BLOCKED

- D1 to D4 are unanswered and the owner hasn't said "use your recommendations".
- Aliasing makes an un-migrated page fail axe in a way only a page redesign can fix. Then defer the light default (D3 fallback) and log the page for its phase.

## Out of scope

- Any page layout change. Pages adopt the tokens through aliases only; their redesigns are Phases 1 to 5.
- OG image restyle (Phase 4) and dead-code removal (Phase 6).

## Resume and Execution Handoff

- **Execute anchor:** this file. **Branch:** `feat/design-system-foundation` from `main`.
- **Order:**
  1. `contrast.ts` with its test (red), then tokens and aliases (green).
  2. Scales.
  3. Fonts (D1).
  4. Primitives with tests.
  5. Guard tests (ratchets plus the rewritten `globals.test.ts`).
  6. Theme default (D3).
  7. `/design` page.
  8. Probe script and baseline run.
  9. Docs.
  10. Gates and screenshot review.
  11. Report at `../reports/phase-0_design-system-foundation_REPORT_<dd-mm-yy>.md`.
- Before committing, check `AGENTS.md`: `next build` rewrites its heading (general backlog P3). Stage only the deliberate line 718 edit (`git add -p AGENTS.md`) and drop the heading churn.
- Open a PR when the gates pass. Merge only with the owner's approval (merge deploys production).
