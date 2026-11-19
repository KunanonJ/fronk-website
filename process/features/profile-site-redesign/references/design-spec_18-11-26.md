# Profile-site redesign: design spec

**Created:** 18-11-26
**Feature:** profile-site-redesign (`process/features/profile-site-redesign/`, phases 0 to 8)
**Sources:** a two-part teardown of the reference site (captured 18-11-26, kept outside the repo) and `references/codebase-inventory_18-11-26.md` (this repo at `563b2a3`). Repo facts marked with a file path were re-read on 18-11-26.
**Status:** Live (19-11-26): every page of kunanonj.com implements it, the tokens in `src/styles/globals.css` `:root` and `.dark` since Phase 8 folded section 2.13's scope. When a later change decides something marked "(not captured)" or "(ours)", it records the decision here; the phase reports in `../reports/` record each phase's decisions.

---

## 1. Provenance and rules

Provenance (the only line that names the reference): the design language and page format of the public portfolio tanvirux.com, captured 18-11-26 at 1280x800 and 390x844 (DOM, computed styles, the site's own CSS and client bundles, screenshots).

Rules for this file and for every phase that builds from it:

1. The repository is public. This file holds no third-party personal data or copy: no name, email, headline, body text, client or project names, testimonial authors, file paths or URLs from the reference beyond the provenance line. Reference content is described by role ("two-line serif headline", "case 1"). No screenshots. Reference code appears only as short CSS declarations of values.
2. Owner decisions of 18-11-26: the reference palette exactly (violet `#6e3cff`, coral `#ff7a3d` and their lavender and peach tints); a design-tool canvas mock in the Home hero; case media as a mix (real screenshots where shareable, code-drawn illustrations labelled as such otherwise); the testimonial notebook built but hidden until 3 or more real, owner-cleared quotes exist; the existing greeting intro kept.
3. Precedence: this repo's owner rules and tests win over the reference. Every deviation is listed with its reason in section 13.
4. Value labels: unmarked values are the reference's, as captured. "(ours)" marks a decision made in this spec. "(approx.)" marks a value measured from the 1280x800 screenshots (captured at 2x). "(not captured)" marks a gap in the teardown; the phase that needs it decides and records it here.
5. Units are CSS px at 1x. Desktop values are at 1280x800 unless stated. The repo's tests also measure at 1440x900, 768, 375x812, 390 and 320.
6. Writing: plain sentences, no em dashes, no emojis, dates dd-mm-yy. All visible copy comes from `lib/content/` or from the owner (section 15). Generic interface labels (Menu, Close, Light, Dark) are ours.

---

## 2. Tokens

### 2.1 Colours

The reference defines a full light set on the root and a full dark override. Values are exact.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--ink` | `#120e1f` | `#f1edfa` | text; dark pill fill |
| `--paper` | `#ffffff` | `#0f0c18` | page; nav pill; popover; ghost pills |
| `--paper-2` | `#f7f5fb` | `#17131f` | tiles; records card; cover backing; hover fill |
| `--paper-3` | `#efecf7` | `#201a2c` | deeper wells; dark theme-switch thumb |
| `--accent` | `#6e3cff` | `#8d6bff` | marks; focus ring; status dot; badge fill; active rail number |
| `--accent-ink` | `#4b23c2` | `#b9a4ff` | current nav link; italic accents; notebook cover line; selection text; inline links (ours) |
| `--accent-deep` | `#3b1e8f` | `#c5b3ff` | deep accent |
| `--accent-soft` | `#efe8ff` | `#241b44` | selection background |
| `--coral` | `#ff7a3d` | `#ff8a52` | pixel marks; striped ring; notebook margin line |
| `--coral-deep` | `#d9541c` | `#ff9e70` | live or failed squares (ours, section 2.12) |
| `--peach` | `#ffd9c4` | `#47283f` | sky pixels (top band) |
| `--tint-1` | `#fbf9ff` | `#130f1d` | footer sheet middle stop |
| `--tint-2` | `#f3eeff` | `#1c1630` | active nav pill; mess tile; footer sheet end |
| `--tint-3` | `#ddd0ff` | `#2c2250` | journey wash (left); sky pixels |
| `--tint-4` | `#c9b6ff` | `#3d306e` | sky pixels |
| `--tint-coral` | `#ffe9dc` | `#2d1a27` | journey wash (right) |
| `--on-accent` (ours) | `#ffffff` | `#0f0c18` | text on accent fills (5.60:1 light, 5.23:1 dark; section 12) |

Browser chrome colour (`theme-color`): `#f7f3ff` light, `#0f0c18` dark.

### 2.2 Ink mixes

The reference mixes ink with transparency: `color-mix(in srgb, var(--ink) N%, transparent)`. Composited values and contrast below were computed (ours) over `--paper`; the lowest value over any other surface the mix sits on is given after it.

| Token | Mix | Light on paper | Dark on paper | Allowed use (ours, section 12) |
|---|---|---|---|---|
| `--ink-80` | 80% | `#413e4c`, 10.37:1 | `#c4c0cd`, 10.83:1 | prose, leads, footer links |
| `--muted-strong` | 68% | `#5e5b67`, 6.63:1 | `#a9a5b2`, 8.01:1 | card summaries on case-card materials (lowest 5.74:1) |
| `--ink-60` | 60% | `#716e79`, 4.97:1 (lowest 4.64 on the sunset top) | `#9793a0`, 6.43:1 (lowest 5.92) | the text floor: meta, eyebrows, captions, rail, nav links |
| `--muted` | 52% | `#84828b`, 3.80:1 | `#85818e`, 5.08:1 | display text of 24 px or more only |
| `--ink-45` | 45% | `#94939a`, 3.05:1 | `#75717e`, 4.07:1 | non-text boundaries on paper only (inputs, inactive pager dots); never text |
| `--ink-30` | 30% | `#b8b7bc`, 2.00:1 | `#53505c`, 2.44:1 | decoration only |
| `--line` | 10% | | | hairlines, card rings |
| `--line-soft` | 6% | | | soft rings |
| `--line-strong` | 16% | | | strong rings |

### 2.3 Gradients and washes

| Token | Light | Dark |
|---|---|---|
| `--sunset` (hero sheet) | `linear-gradient(165deg, #ece4ff 0%, #f3edff 30%, #fff0e6 70%, #fff 100%)` | `linear-gradient(165deg, #1d1636 0%, #171128 32%, #1d1320 70%, #0f0c18 100%)` |
| `--dusk` | `linear-gradient(180deg, #fff 0%, #f3eeff 60%, #ffe9dc 100%)` | (not captured) ours: `linear-gradient(180deg, #0f0c18 0%, #1c1630 60%, #2d1a27 100%)` (paper, tint-2, tint-coral) |
| `--sunset-strong` | `linear-gradient(150deg, #6e3cff 0%, #9a63ff 40%, #ff7a3d 100%)` | (not captured) ours: same stops |
| Footer sheet | `linear-gradient(180deg, transparent 0%, var(--tint-1) 40%, var(--tint-2) 100%)` | same, tints switch |
| Case-page sky mask | `mask-image: linear-gradient(#000 35%, transparent)` | same |
| Marquee edge mask | `linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)` in the hero; 12% and 88% elsewhere | same |
| Journey washes | radial washes, `--tint-3` at left and `--tint-coral` at right, masked top and bottom (stops not captured) | same tokens |
| Notebook cover leaf | lavender gradient (stops not captured); ours: `linear-gradient(160deg, var(--tint-2), var(--tint-3))` | same tokens |
| Stats tile | dark violet radial gradient plus a dither field (stops not captured); ours, same in both themes: `radial-gradient(120% 120% at 20% 0%, #6e3cff 0%, #3b1e8f 55%, #120e1f 100%)`, numerals white (5.60:1 on the lightest stop) | same |

### 2.4 Case-card material

Each stacked case card is filled with a per-card hue:

- Light: `linear-gradient(160deg, oklch(.95 .03 H) 0%, oklch(.9 .055 H) 100%)`
- Dark: `linear-gradient(160deg, oklch(.27 .05 H) 0%, oklch(.22 .075 H) 100%)`
- General form: `oklch(L1 C H)` to `oklch(L2 C+.025 H)`; light L1 .95, L2 .9, C .03; dark L1 .27, L2 .22, C .05.
- Hues in card order: 253, 79, 292, 327, 266, 301. A seventh card wraps to 253 (ours).
- One exception (polish pass, 19-11-26): hue 79 in dark is `oklch(.28 .04 50)` to `oklch(.215 .055 25)`, copper to ember. At dark lightness hue 79 read olive, and its end fell outside sRGB and clipped to brown; the tokens keep the name `--material-79-*`.

Approximate sRGB endpoints and contrast (computed, ours; the CSS uses `oklch()`):

| H | Light start to end | Dark start to end | Ink (lowest) | `--ink-60` lowest | `--muted-strong` lowest |
|---|---|---|---|---|---|
| 253 | `#e1f0ff` to `#c5e1ff` | `#14273e` to `#001a3c` | 14.06 light, 13.08 dark | 4.50 light, 5.63 dark | light 5.74 or more on every hue |
| 79 | `#faedd9` to `#f2dbb6` | `#392316` to `#2e0d0c` (was `#332305` to `#2c1400`) | 14.01, 12.79 | 4.50, 5.54 | dark 6.68 or more |
| 292 | `#eeebff` to `#ded8ff` | `#27223d` to `#1c113a` | 13.88, 13.25 | 4.47, 5.70 | |
| 327 | `#fae8f9` to `#f2d2f1` | `#331d33` to `#2c0a2c` | 13.78, 13.33 | 4.46, 5.70 | |
| 266 | `#e5efff` to `#cddeff` | `#1b253f` to `#0a173d` | 13.98, 13.14 | 4.48, 5.66 | |
| 301 | `#f2eaff` to `#e4d6fe` | `#2b203b` to `#210f37` | 13.86, 13.28 | 4.47, 5.70 | |

`--ink-60` falls under 4.5:1 on the darker end of four light materials, so card summaries use `--muted-strong` (section 12).

### 2.5 Notebook paper

| Token | Value | Note |
|---|---|---|
| `--leaf` | `#fffdf8` | page paper |
| `--leaf-ink` | `#1f1a33` | quote text, 16.48:1 on leaf |
| Secondary text on leaf | `--leaf-ink` at 68% or more (ours) | 68% gives 5.76:1; 60% gives 4.43:1 |
| Rules | horizontal lines every 32 px, accent at 12% | |
| Margin line | coral, 38 px from the page's left edge | |
| Spiral rings | 28x9 each, gradient `#d6d0e4` to `#9a92b3` | |
| Dark theme | (not captured) ours: leaf, leaf-ink, rules and rings unchanged in dark (a paper object, like product shots that stay light); the cover leaf uses the dark tints | |

### 2.6 Showcase tile tones

| Tone | Light | Dark |
|---|---|---|
| default `--tile` | `#e1e2e5` | `#1d1a26` |
| deep `--tile-deep` | `#cfd2d7` | (not captured) ours: `#17131f` |
| brand | `var(--brand-wash, #dde7f4)` | `color-mix(in srgb, var(--brand-wash) 16%, var(--tile))` |
| paper | `#e1e2e5` | `#1d1a26` (ours: follows default) |

### 2.7 Radii

| Reference | Value | Repo token (ours) | Used for |
|---|---|---|---|
| sm | 10px | `--radius-tag` (new) | small tags |
| md | 16px | `--radius-mat` (new) | More-projects image mat, records card, dormant case mats |
| lg | 24px | `--radius-sheet` (exists, 24px) | tiles, phone menu, footer card, showcase tiles |
| cards | 28px | `--radius-bento` (exists, 28px) | stack cards, case cover, lightbox tile, hero sheet top corners |
| pill | 9999px | `rounded-full` | pills, chips, round buttons |
| component | 20px | `--radius-well` (exists) | popover, stack shot frame |
| component | 18px | `--radius-snug` (new) | phone stack card, lightbox tile under 640 |
| component | 14px | `--radius-row` (exists) | phone cover |
| component | 12px | `--radius-tile` (exists) | phone shot frame, phone showcase tile, phone menu links |
| component | 36px | inline | hero sheet bottom corners (`28px 28px 36px 36px`) |

### 2.8 Shadows

| Name (ours) | Value | Used for |
|---|---|---|
| `--elev-ring` (reference "card") | `0 0 0 1px var(--line)` | cards |
| `--elev-soft` | `0 0 0 1px var(--line), 0 12px 32px -16px #00000029` | soft lift |
| `--elev-lift` | `0 0 0 1px var(--line-strong), 0 20px 40px -20px #0003` | strong lift |
| `--elev-nav` light | `0 0 0 1px var(--line-soft), 0 10px 28px -14px #120e1f40` | nav pill, theme toggle |
| `--elev-nav` dark | `0 0 0 1px var(--line), 0 10px 28px -14px #000000b3` | nav pill, theme toggle |
| `--elev-pop` | `0 0 0 1px var(--line), 0 30px 60px -24px rgb(18 14 31 / .4), 0 12px 24px -16px rgb(110 60 255 / .35)` | Say hello popover (violet under-glow) |
| `--elev-frame` | `0 0 0 1px var(--line-soft), 0 24px 48px -32px rgba(18,14,31,.4)` | stack card shot frame |
| `--elev-float` | `0 0 0 1px var(--line-soft), 0 12px 24px -16px #120e1f66` | notebook buttons |
| `--elev-thumb` | `0 0 0 1px var(--line-soft), 0 6px 16px -8px #120e1f59` | theme-switch thumb |
| `--elev-mat` | `0 0 0 1px var(--line-soft), 0 24px 44px -36px #120e1f59` | dormant screenshot mat |
| `--elev-stage` | `0 40px 80px -40px rgba(18,14,31,.35)` | lightbox tile |

Rings that the reference writes as `box-shadow: 0 0 0 1px var(--line-soft)` (tiles, cover, cards) use the same value.

### 2.9 Easings

Tailwind 4 already owns `--ease-out` and `--ease-in-out`, and this repo's `--ease-soft` is a different curve (`cubic-bezier(.2,.8,.2,1)`), so the reference names are not reused (ours).

| Reference name | Value | Repo token (ours) |
|---|---|---|
| ease-expo (the reference default) | `cubic-bezier(.16,1,.3,1)` | `--ease-expo` (new) |
| ease-out | `cubic-bezier(.23,1,.32,1)` | `--ease-snappy` (new) |
| ease-soft | `cubic-bezier(.22,1,.36,1)` | `--ease-smooth` (exists, same curve) |
| ease-back | `cubic-bezier(.34,1.4,.64,1)` | `--ease-back` (new; not the repo's `--ease-spring` `(.34,1.56,.64,1)`) |
| ease-in-out | `cubic-bezier(.77,0,.175,1)` | `--ease-swap` (new) |
| ease-cubic | `cubic-bezier(.65,0,.35,1)` | `--ease-cubic` (new) |
| theme fade | `cubic-bezier(.4,0,.2,1)` | inline in the view-transition rule |
| lightbox close | `cubic-bezier(.32,.72,0,1)` | inline in the script |

Where the teardown writes "ease-out" or "ease-in-out" in a transition, this spec reads it as the reference token, not the CSS keyword (the captured CSS uses the variables). The CSS keyword `ease` is kept where it was explicit.

### 2.10 Durations

`--duration-fast: .1s`, `--duration-base: .24s`, `--duration-slow: .6s` (only `--duration-fast` was captured by name; the other two names are ours).

### 2.11 Layout tokens

| Token | Value | Resolved |
|---|---|---|
| `--wrap` (`--page-max`) | `1360px` | |
| `--read` | `760px` | |
| `--pad` | `max(clamp(20px, 5vw, 72px), calc((100vw - 1360px) / 2))` | 20 at 320 and 390; 40.5 at 810; 51.2 at 1024; 64 at 1280; 72 at 1440; 280 at 1920 |
| `.wrap` | `max-width: calc(var(--wrap) + var(--pad) * 2); padding-inline: var(--pad)` | content 1152 at 1280, 1296 at 1440, 350 at 390 |
| `--bar-top` | `32px` | nav distance from the top |
| `--bar-row` | `48px` | nav row height |
| `--nav-h` | `92px` | |
| `--screen` | `max(640px, 100svh)` | |

### 2.12 How the tokens feed the repo's role names (ours)

Existing components read role tokens, and `lib/design/globals.test.ts` requires `--cta`, `--oncta`, `--accent` and `--muted` in both themes and `--color-page`, `--color-ink`, `--color-ink-2`, `--color-action`, `--color-link`, `--color-focus`, `--color-ember`, `--color-hairline` in the Tailwind theme. The role names stay; their values change.

| Repo role | New value | Why |
|---|---|---|
| `--page` | `--paper` | the reference page is paper |
| `--surface` | `--paper` | pills, popover |
| `--surface-tint` | `--tint-2` | |
| `--surface-warm` | `--tint-coral` | |
| `--well` | `--paper-2` | |
| `--ink` | `--ink` | |
| `--ink-2` | `--ink-60` | secondary text floor |
| `--muted` | `--muted` (52%) | same role as today: display words only, 3:1 |
| `--hairline`, `--hairline-strong` | `--line`, `--line-strong` | |
| `--accent`, `--focus` | `--accent` | |
| `--link` | `--accent-ink` | 9.06:1 light, 9.04:1 dark |
| `--action`, `--on-action` | `--accent`, `--on-accent` | |
| `--cta`, `--oncta` | `--ink`, `--paper` | primary buttons stay ink (owner rule) and invert in dark |
| `--ember` | `--coral-deep` | coral fails 3:1 on light paper (2.59:1); coral-deep is 4.01:1 |
| `--error-text`, `--success-text` | unchanged | the reference draws no form states |
| Bangkok scene and `--onphoto`, `--glass*`, `--water2` | unchanged | art tokens; phase 8 decides if the scene survives |

Tailwind-facing names (ours). The guard bans these substrings, so new Tailwind colours avoid them: `--color-accent`, `--color-muted`, `--color-primary`, `--color-fg`, `--color-cream`, `--color-landing`, `--font-serif`, `--font-instrument-serif`, `--font-hanken`, `--font-almarai`, `--bg:`, `--fg:` (plus `--landing-canvas`, `--landing-ink`, `--grain-opacity`). So: accent family as `--color-mark` (exists), `--color-mark-ink`, `--color-mark-deep`, `--color-mark-soft`; ink mixes as `--color-ink-30`, `--color-ink-45`, `--color-ink-60`, `--color-ink-68`, `--color-ink-80`; muted stays `--color-ink-3`; papers and tints as `--color-paper`, `--color-paper-2`, `--color-paper-3`, `--color-tint-1` to `--color-tint-4`, `--color-tint-coral`, `--color-coral`, `--color-coral-deep`, `--color-peach`.

### 2.13 Delivering the tokens before cutover (ours)

The live site must not change before phase 6, and several names collide with live values (`--ink`, `--accent`, `--muted`, `--elev-pop`). So the new values live in one scoped block:

- Selector `[data-design="profile"]` for light, and `.dark [data-design="profile"], html.dark[data-design="profile"]` for dark. The block also sets `font-family: var(--font-sans); color: var(--ink)`.
- `src/routes/__root.tsx` already sets `<html lang>` from the path; it sets `data-design="profile"` the same way for `/preview/*` (phases 0 to 5), then for Home and the case routes (phase 6), then for each page phase 7 restyles. The new header and footer carry the attribute themselves, so the shell can go site-wide in phase 6 around page bodies that are not restyled yet.
- `lib/design/contrast.test.ts` parses only top-level `:root {` and `.dark {` blocks with a regex and does not evaluate `color-mix()`. Phase 0 extends it to the scoped blocks and to the composited mixes, so the pairs in sections 2.2 and 12 are tested before cutover.
- Phase 8 folds the block into `:root` and `.dark`, deletes the old values and the attribute.

---

## 3. Type

### 3.1 Families

| Role | Family | Weights | Repo variable (ours) |
|---|---|---|---|
| Display | Instrument Serif | 400, roman and italic | `--font-display` (exists) |
| Body and UI | Onest (variable) | 100 to 900; used 400, 500, 600 | `--font-sans` (exists) |
| Mono | JetBrains Mono (variable) | 100 to 800; used 500 | `--font-mono` (exists) |
| Hand | Patrick Hand | 400 | `--font-hand` (new) |

All four are SIL OFL fonts.

- Self-hosted woff2 in `src/fonts/`, `font-display: swap`, `unicode-range` subsets (Latin and Latin Extended), each family's OFL text shipped with the deployed fonts (rule from the brief).
- Fallback stacks (ours): `--font-sans: "Onest", "Onest Fallback", "Noto Sans Thai", ui-sans-serif, system-ui, sans-serif`; `--font-display: "Instrument Serif", "Instrument Serif Fallback", "Noto Sans Thai", ui-serif, Georgia, serif`; `--font-mono: "JetBrains Mono", "JetBrains Mono Fallback", "Noto Sans Thai", ui-monospace, monospace`; `--font-hand: "Patrick Hand", "Noto Sans Thai", cursive`.
- Size-adjusted fallback faces (ours): "Onest Fallback" on Arial, "Instrument Serif Fallback" on Times New Roman, "JetBrains Mono Fallback" on Courier New, as the repo does today for Geist. Phase 0 computes the overrides.
- Preload (ours): the Latin files of Onest and Instrument Serif roman (the hero h1 is the LCP element and is set in the serif). JetBrains Mono and Instrument Serif italic load on demand; Patrick Hand loads only when the notebook renders. Until cutover the preloads apply only on paths inside the token scope (section 2.13), so live pages do not download fonts they do not use.
- Glyph check (ours): U+2192 "→", used in repo copy such as "As stated in the résumé →", is outside the Google Fonts Latin and Latin Extended ranges, so it falls back unless phase 0 keeps it in a subset. Also check "é", "·", "’".
- Thai: no Thai in Onest, Instrument Serif, JetBrains Mono or Patrick Hand. Thai falls back to Noto Sans Thai for body, display and mono. Noto Serif Thai for Thai headings is to be evaluated in phase 7 (variable name `--font-thai-serif`, not `--font-serif-thai`, because the guard bans the substring `--font-serif`).

### 3.2 Roles

- Serif display: h1, h2, footer headline, statement lines, italic accents.
- Onest: body, UI, card titles (500), chapter headings (500).
- Mono: eyebrows, meta, kickers, labels: 12 px, 500, uppercase, letter-spacing .08em, tabular numbers.
- Patrick Hand: notebook quotes only.

### 3.3 Type classes

| Class | Size | Line height | Tracking | Family and weight | Notes |
|---|---|---|---|---|---|
| `t-display` | `--type-display: clamp(42px, 5.4vw + 10px, 96px)` (79.12 at 1280, 87.76 at 1440) | .98 | -.02em | serif 400 | `text-wrap: balance` |
| `t-hero` | `clamp(2.625rem, min(5.4vw + 0.625rem, 8.4svh + 0.25rem), 6rem)` (71.2 at 1280x800, 79.6 at 1440x900, 42 at 375 and 390; the rem floor keeps the h1 growing at 200% zoom, best-practices audit section 2) | .98 | -.02em | serif 400 | balance |
| `t-h2` / `t-title` | `--type-title: clamp(44px, 4.8vw + 10px, 84px)` (71.44 at 1280; 44 at 390) | .98 | -.015em | serif 400 | |
| `t-footer` | `clamp(36px, 4.2vw + 8px, 72px)` (61.76 at 1280; 36 at 390) | 1.02 | -.025em | serif 400 | |
| `t-statement` | `clamp(28px, 2vw + 14px, 44px)` | 1.18 | -.015em | serif 400 | |
| `t-italic` | inherits size | inherits | inherits | serif 400 italic | accent spans |
| `t-h3` | `clamp(24px, 1.6vw + 12px, 34px)` (32.48 at 1280; 24 at 390) | 1.15 | -.02em | Onest 500 | balance |
| stack card title | 40.72 at 1280; 22 at 390 (phone layout) | 1.08 (1.15 phone) | -.025em (-.02em phone) | Onest 500 | 40.72 equals `2.4vw + 10px` at 1280; bounds not captured; ours `clamp(28px, 2.4vw + 10px, 44px)` |
| `t-lead` | `clamp(18px, .6vw + 14px, 22px)` (21.68 at 1280) | 1.45 | -.01em | Onest 400 | `text-wrap: pretty` |
| hero bio (phone) | 16px | 24.8px | normal | Onest 400 | phone override of `t-lead` in the hero |
| `t-body` | 17px | 1.55 | normal | Onest 400 | pretty |
| case prose | 17px | 1.7 | normal | Onest 400, `--ink-80` | max 64ch; pretty; `> * + * { margin-top: 1em }` |
| `t-small` | 14px | 1.45 | normal | Onest 400 | |
| `t-meta` | 12px | 1.4 | .08em | mono 500 uppercase | tabular numbers |
| `t-nav` | 15px | 20px | -.005em | Onest 400 | `--ink-60`, hover `--ink`, current `--accent-ink` |
| `t-item` (phone menu link) | 19px | normal | normal | Onest 500 | |
| kicker | 12px | 1.55 | .08em | mono 500 uppercase | `--ink-60` |
| footer name | `clamp(28px, 2.4vw + 8px, 40px)` | `t-display` | | serif 400 | |
| testimonial h2 | `clamp(34px, 3vw + 10px, 56px)` | | | serif 400 | |
| notebook cover line | `clamp(26px, 2vw + 10px, 40px)` | 1.1 | | serif 400 italic, `--accent-ink` | |
| notebook quote | about 22px desktop; 19px on phones | 32px (phone, matches the 32px rules) | | Patrick Hand | |
| pull quote (dormant) | `clamp(32px, 14px + 2.6vw, 56px)` | 1.06 | -.01em | serif 400 italic, `--accent-ink` | max 22ch; balance |
| meta value | 16px | 22px | normal | Onest 500 | |
| fact strip item | 17px | normal | -.01em | Onest 500 | |
| point list item | 16px | 1.6 | normal | Onest 400; `strong` 600 | |
| showcase caption | 14px (16px from 810) | 1.5 | | Onest 400, `--ink-60` | title 16px/1.4 600 ink (18px from 810) |
| More-projects card title | 22px | 1.2 | -.015em | Onest 500 | |
| bring tile title / text | 22px 500 / 14px `--ink-60` | | | Onest | |
| orbit tool name / kind | 14px 500 / 12px mono (reference 10px) | | | | 12 px floor |
| rail link / number | 14px, 1.3 / 12px mono .06em (reference 11px) | | | | 12 px floor |
| canvas-mock labels | 12px (reference 9 to 11px) | | | Onest 500 | 12 px floor |
| Say hello address | 16px | | -.01em | Onest 500 | `select-all break-all` |
| theme-switch label | 15px | | | Onest 500 | |

Nothing anywhere renders under 12 px, including text drawn inside illustrations (section 12).

Units (ours, best-practices audit section 2): this table gives px at the default 16 px root. The code writes font sizes in rem (px divided by 16), so the reader's default font size applies, and every `clamp()` takes rem bounds with its largest value at most 2.5 times its smallest, so 200% zoom always doubles text (WCAG 1.4.4). Every clamp above meets the ratio; the largest is 96 / 42 = 2.29. The Instrument Serif scope sets `font-synthesis-weight: none`, because the face has one weight.

### 3.4 Thai

- Pages under `/th/*` keep `<html lang="th">`; chrome text keeps `lang="en"`.
- `:lang(th)` sets `letter-spacing: normal` and `text-transform: none` on `t-meta`, kickers and eyebrows (uppercase and tracking break Thai marks).
- Thai line heights from the current spec: 1.4 for display, 1.75 for body.

---

## 4. Layout grid and breakpoints

### 4.1 Breakpoints

| Width | Reference meaning | Repo name (ours) |
|---|---|---|
| 640 | Tailwind `sm` | `sm` |
| 810 (`50.625rem`) | custom `md`: nav links, theme toggle, two-column footer card, showcase lightbox, caption sizes | `tablet` (new `--breakpoint-tablet: 50.625rem`) |
| 1024 | `lg`: four-column meta row; 12-column bento (ours) | `lg` |
| 1280 | `xl`: footer pixel illustrations | `xl` |
| 1536 | `2xl` | `2xl` |
| 720 | case cover bleeds under 720 (`max-width: 719px`) | arbitrary |
| 1100 | case rail appears | arbitrary |
| 1180 | notebook arrows move beside the book; the hero's two columns start here (ours, section 10.1) | arbitrary |
| 600 (ours) | large phones and foldables opened in portrait: two-column About grid, More projects, showcase, steps and footer card (section 10.1) | arbitrary |
| 639 / 809 | showcase grid one column at 639 and under; tile zoom cursor and Enlarge button off at 809 and under | arbitrary |
| 370 (ours) | under 370 the nav's Say hello becomes a 48 px round icon button that keeps its accessible name (360 px phones and the Galaxy Z Fold cover screen at 344; measured, the full nav needs about 359 px) | arbitrary |

Hover effects are gated by `@media (hover: hover) and (pointer: fine)`. Tailwind's `md` (768) is not redefined, because 9 live components use `md:`; phase 8 decides whether to retire it.

### 4.2 Grids and containers

| Block | Rule |
|---|---|
| Hero copy | grid `6fr 6fr`, gap `28px 56px`, vertically centred; columns 548 px each at 1280 (620 at 1440). One column under 1180 (ours): the canvas mock needs about 560 px, which the 6fr column only gives from 1180; under it the copy comes first and the mock follows at up to 760 px wide (section 10.1) |
| Work stack list | `ul` grid, gap 24 |
| Stack card | grid `minmax(0, 5fr) minmax(0, 7fr)`, gap 32, padding 36 |
| About bento | 12 columns, gap 16; tiles span 7 + 5, 7 + 5, then 3 + 3 + 3 + 3. One column under 640 (measured at 390), gap 12. Ours, resolved 18-11-26: one column under 600; 600 to 809 two columns (Brief, mess, stats and motion tiles full width, the four principles two by two); 810 to 1023 twelve columns with every tile at span 6; 12-column spans from 1024 (section 10.1) |
| Journey story | 12 columns: text spans columns 1 to 7; records card spans 4 columns from column 9. One column under 1024 (ours), gap 56 |
| Case body | grid gap 40; from 1100: `grid-template-columns: minmax(0, 1080px) 188px; justify-content: space-between; column-gap: clamp(40px, 4vw, 72px)` (column 913 and rail 188 at 1280) |
| Case column | `min-width: 0; max-width: 1080px`; prose 64ch (724 px), headings 26ch (560 px), media full column |
| Case meta row | 2 columns, 4 from 1024; gap 24 by 24 |
| Fact strip | 1 column; 3 columns from 640; gap `14px 32px` |
| Showcase grid | `repeat(2, minmax(0, 1fr))`, gap `clamp(56px, 5vw, 88px) 20px`; full tiles `grid-column: 1 / -1`; one column under 640, gap 48 |
| More projects | 1 column; 2 from 640; gap `64px 32px`, from 810 `80px 40px` |
| Footer card | 1 column; from 810 `1.2fr 1fr 1fr`; ours with the longer page list: from 1024 `minmax(0, 1.2fr) minmax(0, 2fr) minmax(0, 1fr)` with the Pages list in 2 CSS columns (gap 24) |

### 4.3 Anchor offsets (ours, native scrolling)

The reference used a smooth-scroll library whose anchor offset of 96 px stacks with each target's `scroll-margin-top`: a target lands at `top - scrollMargin - 96`. The native equivalent:

- `html { scroll-padding-top: 96px }` gives the 96 px offset to every anchor jump, `scrollIntoView` and keyboard focus scrolling, so nothing focused or scrolled-to lands under the fixed nav.
- Per-target `scroll-margin-top` carries the reference's section values:

| Target | `scroll-margin-top` | Lands |
|---|---|---|
| `#work` | 80px | 176 px above the section top |
| `#about` | -176px from 810; -128px under 810 | 80 px (32 px on phones) below the section top |
| `#journey` | -96px | exactly on the section top |
| `#ventures`, `#story` | 0 | 96 px below the viewport top |
| case chapters `#ch-NN` | 16px | 112 px below the viewport top (the reference value) |

- `html { scroll-behavior: smooth }` sits inside `@media (prefers-reduced-motion: no-preference)`; reduced motion jumps.

### 4.4 Stacking order (ours)

Skip link when focused 110; intro overlay 100 (exists); nav 80 (popover and phone menu inside it); sections over the sticky hero 1; native `<dialog>` uses the top layer.

---

## 5. Motion

### 5.1 Rules

- No motion library. Keyframes and transitions in CSS; small scripts for scroll, IntersectionObserver and drag. The lightbox uses the Web Animations API (native).
- Every keyframe animation sits inside `@media (prefers-reduced-motion: no-preference)`; so do transitions of transform, filter, width and the registered properties. Colour, background, border, box-shadow and opacity transitions of 200 ms or less may sit outside it (the reference keeps nav and lightbox fades under reduced motion).
- Every new keyframe name starts with `kj-`, so the existing guard in `lib/design/globals.test.ts` (it flags `animation:` values starting with `kj-` outside no-preference blocks) covers it. Phase 0 widens the guard to every `animation:` value except `none`.
- Scripted motion checks `prefersReducedMotion()` (`lib/motion/motionRuntime.ts`) or `useReducedMotion()`.
- Anything that moves for more than 5 s has a pause control (section 6.11).
- The hero h1 never fades, hides or blurs on first render (section 8.1).

### 5.2 Keyframes

| Ours | Reference | Where | Timing | Frames |
|---|---|---|---|---|
| `kj-word-mark` | word-mark | coral pixel beside each word of a swapped h1 line | `var(--word, 500ms) step-end var(--at) both` | appears at scale 1; 1.6 at 15%; 2.2 at 30%; .4 at 55%; gone at the end (the exact hide point after 55% was not captured) |
| `kj-word-text` | word-text | each word of a swapped h1 line | same, `step-end` | hidden; visible at scale .35 at 30%; .65 at 45%; 1 at 55%; origin at the word's bottom outer corner |
| `kj-word-drift` | word-drift | same words | 250 ms (`word * .5`), `--ease-smooth`, delay `--at + 275ms` (`word * .55`) | `translateX(calc(var(--dir) * .08em))` to 0 |
| `kj-line-out` | line-out | the outgoing h1 line | .42s `--ease-smooth` both | opacity 1 to 0; `blur(0)` to `blur(4px)`; up .22em |
| `kj-file-in` | file-in | canvas mock; journey icons | 1.4s `--ease-expo` both; .5s delay on the mock | from `translateY(40px) scale(.96)` and opacity 0 |
| `kj-fade-up` | fade-up | hero chips .7s delay .2s; lead .9s delay 1.1s; actions .8s delay 1.3s; logo strip .9s delay 1.5s | `--ease-expo` both | from `translateY(12px)` and opacity 0 |
| `kj-marquee` | marquee | logo strip track | 44s linear infinite | to `translate(-50%)` |
| `kj-ping` | ping | status dot ring | 2.8s `--ease-expo`; ours: 1 iteration (reference infinite) | opacity .5 scale 1, to opacity 0 scale 2.6 at 70% |
| `kj-book-count` | book-count | notebook pause-button ring | linear forwards, duration set per page (section 8.7) | `--count` 0 to 1 |
| `kj-page-cast` | page-cast | the page uncovered by a turn | 1s `--ease-cubic` | `--cast` 0, 1, 0 |
| `kj-theme-fade` | theme-fade | `::view-transition-new(root)` for theme switches only | .56s `cubic-bezier(.4,0,.2,1)` both | 0% opacity 0 |

Not ported: the reference's dormant `rise`, `progress-fill`, the dormant quote marquee and the dormant image-lightbox keyframes. The repo's own `kj-rise` stays for old pages until phase 8 (the guard expects `animation: kj-rise` today).

### 5.3 Transitions

| Element | Properties | Duration and easing |
|---|---|---|
| Reveal | opacity; `translateY(24px)` (or `scale(.98)`) | .7s (.8s for scale) `--ease-expo` |
| Nav away | opacity 0, `blur(6px)`, `translateY(-12px)` | .15s out, .2s back, `--ease-snappy`; reduced motion: opacity only |
| Nav active pill | transform, width | .28s `--ease-snappy`; opacity .16s; reduced: opacity only |
| Nav link, rail link, back link, footer link | colour | .1s |
| Pill striped ring | opacity | .15s in, .12s out |
| Pill press | `scale(.97)` | .14s `--ease-snappy` |
| Ghost pill hover | `translateY(-1px)`, background `--paper-2` | (not captured) ours .24s `--ease-snappy` |
| Swap arrow | `--arrow-active` 0 to 1 | .6s `--ease-swap` |
| Card CTA arrow | width 0 to 16px, margin-left 0 to 8px, opacity 0 to 1, translate -6px to 0 | .22s `--ease-smooth` |
| Stack card shot frame | `scale(1.015)` on card hover | .6s `--ease-swap` |
| More-projects image | `scale(1.03)` on hover; mat `scale(.985)` on press | .4s `--ease-snappy` |
| Text-link arrow | `translate(4px)`; up-right arrows `translate(3px, -3px)` | .24s `--ease-smooth` |
| Back-link arrow | `translateX(-2px)` | .1s |
| Theme toggle | hover background `--paper-2` and icon `rotate(-14deg)`; press `scale(.94)` .14s; icons cross-fade opacity .2s and transform .32s `--ease-back`; the hidden icon sits at `rotate(90deg) scale(.6)` | |
| Theme-switch thumb | transform | .26s `--ease-snappy` |
| Say hello popover | from opacity 0, `translateY(-6px) scale(.97)` | .2s `--ease-expo`, both ways |
| Phone menu | from opacity 0, `translateY(-16px) scale(.98)` | .22s `--ease-expo` (the reference used a spring) |
| Mess-tile chips | position, rotation, tint to tidy list | .75s `--ease-expo`, staggered by `--d` |
| Showcase tile buttons | opacity .2s `ease`; transform .14s `--ease-snappy` | |
| Notebook page | `--turn` | 1s `--ease-cubic` |
| Canvas-mock selection (ours) | transform, width, height | .24s `--ease-expo` |

### 5.4 Registered properties

All registered in CSS with `@property` (ours; the reference registered two of them from script), at top level of the stylesheet:

| Property | Syntax | Inherits | Initial |
|---|---|---|---|
| `--turn` | `<number>` | yes | 0 |
| `--cast` | `<number>` | yes | 0 |
| `--count` | `<number>` | yes | 0 |
| `--arrow-active` | `<number>` | yes | 0 |
| `--field-resolve` | `<number>` | yes | 1 |

### 5.5 Scripted motion

| Behaviour | Rule |
|---|---|
| H1 rotation | swap every 4,200 ms (measured 4,202 ms), looping; section 8.1 |
| Nav hide on scroll | passive capture-phase scroll listener, rAF; section 7.3 |
| Nav scrollspy and case rail | IntersectionObserver; sections 7.2 and 9.6 |
| Reveal | IntersectionObserver; section 6.7 |
| Stack depth | scroll listener, rAF; section 8.4 |
| Canvas-mock selection and phone carousel | pointer and focus events; scroll position |
| Journey orbit | drag; slow spin (ours); section 8.6 |
| Notebook | autoplay timer, drag, page turns; section 8.7 |
| Lightbox | Web Animations API FLIP; section 9.10 |
| Smooth scroll calls (rail click, name mark) | `scrollIntoView` or `scrollTo` with `behavior: reduced ? "auto" : "smooth"` |
| Theme switch | View Transition with type `theme`; section 7.5 |

### 5.6 Hero entrance and the greeting intro (ours)

The intro (`components/landing/IntroLoader.tsx`) renders nothing on the server, appears after hydration on a first visit per session, and lasts 5,200 ms. The hero paints first, so the h1 stays the LCP element; the entrance would otherwise play underneath the overlay.

- A few-line inline script before first paint (beside the theme script; public pages have no CSP) sets `html[data-intro="pending"]` when the path is `/`, `sessionStorage["fronk-intro-seen"]` is not `"1"` and motion is allowed.
- Entrance animations apply under `html:not([data-intro="pending"]) .hero-stage` (returning visits, reduced motion handled separately) and under `html[data-intro="done"] .hero-stage`. While pending, the hero shows statically.
- `IntroLoader` sets `data-intro="done"` when its exit starts (skip included). The entrance then plays under the 700 ms overlay fade.
- The h1 rotation timer starts 4,200 ms after the hero becomes visible (intro done, or first paint without an intro).

### 5.7 Reduced motion

| Element | Under `prefers-reduced-motion: reduce` |
|---|---|
| Pill ring, swap arrow, card CTA arrow, text-link arrows, shot frame, image zoom | no transform or transition (ring may fade) |
| Nav away, nav active pill | opacity only |
| Smooth scrolling | `scroll-behavior: auto`; scripted scrolls jump |
| Hero chips, lead, actions, canvas mock, logo strip | shown at rest, no entrance |
| H1 | no rotation, no word stamp; the pause control is not rendered |
| Marquee | no animation, no edge mask, duplicate list hidden, list wraps centred with a 20 px row gap |
| Status dot | no ping |
| Reveal | final state, no observer |
| Mess tile | tidy state at once |
| Notebook | no flip, no page cast, no autoplay; buttons change pages at once |
| Showcase tiles | still frame; no pause button |
| Lightbox | tile fades 200 ms in, 160 ms out; no FLIP, no delay |
| Theme switch | no view transition |
| Orbit | static ring; no spin, drag still allowed |
| Stack depth | no scale or overlay; cards still stack |

The repo's global block (`globals.css`, a reduced-motion kill switch) stays, and it also disables every `::view-transition-*` animation.

---

## 6. Primitives

### 6.1 Pill

| Variant (ours) | Height | Padding | Text | Fill |
|---|---|---|---|---|
| dark, nav | 48 | 0 16px 0 22px with the swap arrow (approx.) | 15px 500 | `--cta` on `--oncta` |
| dark, hero | 44 | 0 16px 0 22px (approx.) | 16px 500 (approx.) | same |
| dark, footer | 52 | 0 16px 0 24px | 16px 500 | same |
| ghost, hero | 44 | 0 22px (approx.) | 16px 500 | `--paper`, ring `0 0 0 1px var(--line)`, `--ink` |
| ghost `sm` | 36 | 0 16px | 14px 500 | same |
| round ghost | 44 (tile, lightbox), 48 (notebook), 30 (phone tile) | | icon 14 to 16px | same, `--elev-float` on the notebook |
| round dark | 40 (phone stack CTA), 48 (nav Say hello under 360, ours) | | arrow only | dark |
| popover row | 40 | full width | 15px 500 | dark for the first row, text buttons for the rest |

- Radius 9999. Label and icon gap 8 to 10 (approx.).
- Striped ring (dark pill on hover and focus-visible; on stack cards when the card is hovered): a `::before` at `inset: -3px; padding: 3px; border-radius: inherit`, background `repeating-linear-gradient(to right, var(--coral) 0 6px, var(--accent) 6px 10px, var(--coral) 10px 18px, var(--accent) 18px 23px, var(--coral) 23px 30px, var(--accent) 30px 34px)`, masked to a 3 px ring with `mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)` (plus the `-webkit-mask-composite: xor` fallback), opacity 0 to 1.
- Press: `scale(.97)`.
- Ghost hover: `translateY(-1px)` and `--paper-2`.
- Swap arrow: two up-right arrows (an arrow rotated -45deg) inside a 16 px clipped circle. On hover and focus-visible `--arrow-active` goes 0 to 1: arrow A leaves to `translate(150%, -150%)`, arrow B arrives from `translate(-150%, 150%)` to 0. Icon from the repo's set (`components/bento/icons.tsx`) or `lucide-react` (already a dependency).
- Card CTA arrow: hidden at width 0 until the card is hovered (section 5.3).

### 6.2 Chip and badge

| Kind | Size | Text | Fill |
|---|---|---|---|
| Badge (accent) | 30 tall, padding 0 12px (approx.) | 14px 500 `--on-accent` | `--accent` |
| Chip | 26 tall, padding 0 10px (approx.) | 13px 500 `--ink` | `color-mix(in srgb, var(--paper) 72%, transparent)` |
| Illustration chip (ours) | chip | "Illustration" | chip; on card media, top-left at 8 px inset |

### 6.3 Eyebrow row

`t-meta` label in `--ink-60` followed by a hairline: the row is a flex row and its `::after` is `flex: 1; height: 1px; background: var(--line)`. Gap 16 (ours, not captured). Centred variant (testimonials): hairlines on both sides.

### 6.4 Tile

Radius 24, `--paper-2`, ring `0 0 0 1px var(--line-soft)`, padding `clamp(20px, 2.4vw, 36px)` (30.72 at 1280).

### 6.5 Status dot and dot

- Status dot: 8 px `--accent` circle; `::after` ring with `kj-ping` once (ours). Used in the case eyebrow.
- Dot: 7 px `--accent` circle, static. Used in the footer status line.

### 6.6 Pixel mark and pixel bullet

- Pixel mark: 8x8 `--accent` square, `margin-right: 4px`, plus a second pixel `box-shadow: 8px 8px 0 color-mix(in srgb, var(--accent) 35%, transparent)` (a two-pixel diagonal).
- Pixel bullet: 6x6 `--accent` square, `margin-top: .62em`, `flex: none`.
- Word-stamp mark: a `--coral` square of `.14em` at the word's outer bottom corner (`bottom: .1em`; left words `right: calc(100% + .05em)`, right words `left: calc(100% + .06em)`), `image-rendering: pixelated`.

### 6.7 Reveal (ours, replaces the reference's library component)

- Reference values kept: rise 24 px (12 px in the footer) or scale .98; .7s (.8s for scale) `--ease-expo`; reveal once when 15% is in view with root margin `0px 0px -8% 0px`; optional delay in ms.
- Content renders visible from the server (the reference shipped hidden markup). On hydration an observer checks each `[data-reveal]` element: elements already in view stay as they are; elements below the fold get `.is-pending` (opacity 0 and the start transform) and lose it when they enter. So nothing above the fold ever hides, and no-JS readers see everything.
- The pending state and transition live inside the no-preference block; under reduced motion the script does nothing.
- Never wraps an h1 or any hero block.

### 6.8 Dither canvas

- `<canvas>` with `image-rendering: pixelated`, device-pixel-ratio backing store (2560x1152 for a 1280x576 sky), `aria-hidden="true"`, `pointer-events: none`.
- Places: Home hero sky band; case-page sky (`height: min(72vh, 620px)`, mask section 2.3); each stack card (right 60% from 810; top 70% on phones); stats tile; records card floor; footer field (bottom 60%); Say hello popover strip (bottom 22%, behind content).
- Colours follow the theme: the script reads token values with `getComputedStyle` and redraws on theme change and resize (no raw hex in components).
- Hero sky: peach at the very top, then violet tints, thinning downward. Case sky: peach to lavender, dissolving downward. Dark: deep plum and indigo pixels.
- Algorithm and cell size (not captured). Ours: ordered 4x4 Bayer threshold over a density ramp; cells of 10 CSS px (the 1280 screenshot shows cells of about 10 to 12 px); drawn once per size and theme; an optional one-time resolve using `--field-resolve` under 1.2 s, never a loop.

### 6.9 Custom cursors (ours, our own drawings)

- Two 32x32 SVGs in `public/cursors/`: an arrow and a hand, two-tone (ink fill, paper outline 1.5 px) so they read on both themes.
- Fine pointers only, inside `@media (hover: hover) and (pointer: fine)`: `html, body` use the arrow with hotspot `2 1` and fallback `auto`; `a`, `button`, `label`, `summary`, `[role="button"]`, pills and lift cards use the hand with hotspot `10 2` and fallback `pointer`. Hotspots follow our drawings' tips.
- Pills keep the hand cursor (the reference lost it on pills through a later `cursor: pointer`).
- Draggables use the native `grab` and `grabbing`; showcase tiles `zoom-in` from 810.
- Class names avoid `smooth-cursor` (banned by the guard).

### 6.10 Focus, selection, links

- `:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px }` (lowest 4.56:1 against the sunset top in light, 4.65:1 in dark). Lift cards move the outline to their image mat. Dark pills also show the striped ring on focus-visible.
- `::selection { background: var(--accent-soft); color: var(--accent-ink) }`.
- Inline prose links (ours; the captured pages showed none): `--accent-ink`, underline, `text-decoration-color: color-mix(in srgb, var(--accent) 40%, transparent)`, `text-underline-offset: 3px`.
- Text links with arrows ("All projects →" style): `t-nav`, `--ink-60` to `--ink`, arrow in an `aria-hidden` span (except where a test pins the arrow in the name, section 12).

### 6.11 Motion toggle (ours)

A 30 px round ghost button (paper 72%, ring `--line`), pause or play icon 14 px. Its label switches ("Pause motion" / "Play motion" or the context's words) and it carries no `aria-pressed` (section 12). Used by the hero (rotation and marquee together), showcase tiles, the scene tile, the orbit and the notebook (its own button, section 8.7). Not rendered under reduced motion.

### 6.12 Card link pattern (ours)

Cards are `article` elements labelled by their title heading. The only link is the call to action; its `::after` covers the card (`position: absolute; inset: 0`) so the whole card is clickable. The link's name is its visible label plus the item name in a visually hidden span ("View project: TBH Intranet"), so the name contains the visible label. Chips, summaries and evidence lines stay readable to screen readers (the reference wrapped whole cards in one link).

---

## 7. Chrome

### 7.1 Fixed pill nav

- `header[data-site-chrome][lang="en"]` is the fixed bar itself (ours): `position: fixed; top: var(--bar-top); left: 0; right: 0; height: var(--bar-row); padding: 0 var(--pad); display: flex; justify-content: space-between; pointer-events: none`, children `pointer-events: auto`. Its box is 48 px tall. Mounted in `LandingLayout`, never in `__root.tsx` (a guard bans "Header" there).
- Left pill: `--paper`, `--elev-nav`, height 48, padding `0 8px 0 16px`. Inside: 32 px round avatar; the name in the serif (19px) with a `--accent` full stop; the links.
  - The name links home. On `/` it scrolls to the top instead (smooth, or instant under reduced motion) and replaces the URL with `/`.
  - From 810: `nav[aria-label="Primary"]` with Work (`/#work`), About (`/#about`), Journey (`/#journey`), Résumé (`/resume`). Each link `t-nav`, height 36, padding `0 12px`, pill radius. Measured link widths: Work 61, About 66, Journey 81.
  - Under 810: a text button "Menu" (accessible name "Open menu", then visible "Close" and name "Close menu"), 63x36, `t-nav`, `--ink-60`, `aria-expanded`, `aria-controls="site-menu"`. The surname shows from 640.
- Right cluster, gap 8 (approx.): theme toggle (from 810), then the dark Say hello pill (48 tall, 126 wide in the reference).
- Under 360 (ours): Say hello becomes a 48 px round icon button (mail icon, name "Say hello") so the bar fits at 320.

### 7.2 Active pill and scrollspy

- `--tint-2` pill with `box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--accent) 16%, transparent)` slides under the current link by inline width and transform.
- Hidden (opacity 0) at the top of Home. On case pages Work is current.
- `aria-current="page"` when the link's page or section parent is the current page (Work on `/portfolio/*` and `/ventures/*`; Résumé on `/resume`); `aria-current="location"` for the Home section in view (ours). Current text `--accent-ink`.
- Home scrollspy (not captured; ours, the rail's values): IntersectionObserver, `rootMargin: "-20% 0px -60% 0px"`, threshold 0, topmost intersecting section wins (`#work` including `#ventures`, `#about`, `#journey`).

### 7.3 Hide on scroll

- A new position is recorded only when it differs from the last recorded one by 6 px or more; then `away = y > lastY && y > 24`; the class toggles in rAF. Scrolling up by 6 px or more shows the bar. Measured: 0, 22, 24, 26 stay shown; 26 to 28 hides; 2920 to 2910 shows.
- Away state: opacity 0, `blur(6px)`, `translateY(-12px)`, and `pointer-events: none` (ours) so the invisible bar never covers taps. Links stay focusable; `:focus-within` brings the bar back.
- Never hides while focus is inside, the popover is open or the phone menu is open.

### 7.4 Say hello popover

- Trigger: the dark pill with the swap arrow, `aria-haspopup="dialog"`, `aria-expanded`. Same component in the footer. Built on the native `popover` attribute with `popovertarget` (ours, best-practices audit section 9), so it opens, light-dismisses and closes on Escape before hydration; script adds the copy action, focus placement and a mirrored `aria-expanded`. "Copy email" appears once script runs; the address, the mail link and the contact-form link work without it.
- Panel: `role="dialog"` (non-modal), labelled "Email Kunanon Jarat" (ours, from `PERSON_NAME`); `position: absolute; top: 100%; margin-top: 12px; right: 0`; width `min(300px, 100vw - 32px)`; radius 20; `--paper`; padding `16px 16px 40px`; `--elev-pop`; `isolation: isolate; overflow: hidden`; dither strip in the bottom 22% behind the content. Reference size 300x254 with three rows; ours about 300 tall with four.
- Content: `t-meta` label; the address (`site.email`) at 16px 500, -.01em, `select-all`, `break-all`, margin-top 8; then a grid of 40 px rows, gap 6, margin-top 16:
  1. dark full-width pill "Copy email" with a copy icon 16 px; after copying, a check icon and "Copied" (repo strings);
  2. text button "Compose in Gmail" (Gmail compose URL, new tab);
  3. text button "Open your mail app" (`mailto:`);
  4. text button "Use the contact form" to `/contact` (brief).
  Links close the panel. A visually hidden `aria-live="polite"` span announces "Copied".
- Motion: section 5.3.
- Behaviour (ours where the reference was not verified): Escape closes and returns focus to the trigger; a pointer-down outside closes; focus moves to the first row on open; route change closes.
- Footer instance (ours): opens above the trigger and centred on it, 12 px away, with CSS anchor positioning where supported, else fixed at the bottom centre of the viewport (a top-layer popover cannot use `bottom: 100%`). The nav instance sits fixed under the bar.

### 7.5 Theme toggle and phone theme switch

- next-themes stays: `attribute="class"`, `defaultTheme="light"`, `enableSystem={false}`, `disableTransitionOnChange`, storage key `theme`.
- Desktop toggle (from 810): 48 px round, `--paper`, `--elev-nav`; labels "Switch to night mode" / "Switch to day mode" (today's). Icon shows the theme it switches to (moon in light, sun in dark), as the reference does; check `ThemeToggle.test.tsx` if it pins the icon. Hover, press and icon motion: section 5.3.
- Switch animation: with motion allowed and View Transitions available, `document.startViewTransition({ update, types: ["theme"] })` (plus `html.kj-vt` for engines without types), the theme set inside `flushSync`. CSS, inside no-preference: `::view-transition-old(root) { animation: none }` and, scoped to the theme type, `::view-transition-new(root) { mix-blend-mode: normal; animation: kj-theme-fade .56s cubic-bezier(.4,0,.2,1) both }`. The new theme fades in over a frozen image of the old one. No click coordinates. Page transitions keep their own type `page` (0.28 s cross-fade).
- Browser chrome (ours): the two `theme-color` metas (`#f7f3ff` for light, `#0f0c18` for dark) keep their media attributes for first paint; on a theme change both metas take the active theme's colour, so the browser bar follows the site theme, not the OS.
- Phone switch (in the phone menu): a radio group (ours: native radio inputs in a `fieldset` with a visually hidden legend "Theme", so arrow keys work). Track: grid `1fr 1fr`, height 52, padding 4, pill radius, `--paper-2`, `box-shadow: inset 0 0 0 1px var(--line-soft)`. Thumb: `position: absolute; inset: 4px auto 4px 4px; width: calc(50% - 4px)`, pill radius, `--paper`, `--elev-thumb`; dark: `transform: translate(100%)` and `--paper-3`. Options: sun or moon 17 px plus "Light" / "Dark", 15px 500; unchecked label `--ink-60` (reference `--ink-45`). Each option 155x44 at 390.

### 7.6 Phone menu

- `nav#site-menu[aria-label="Site"]` (repo id and name; tests use them), under 810 only.
- Card: `position: absolute; left: var(--pad); right: var(--pad); top: calc(var(--bar-top) + var(--bar-row) + 10px)` (90), padding 12, radius 24, `--paper`, ring `--line`, `transform-origin: top`; no backdrop or scrim. 350 wide at 390.
- Links Work, About, Journey, Résumé, AI engineering and Contact (umbrella R1): `t-item`, block, radius 12, padding `12px 16px`, hover `--paper-2`; 326x48 each.
- Divider: margin-top 8, `border-top: 1px solid var(--line-soft)`, padding `12px 4px 4px`, then the theme switch.
- Height 248 with three links in the reference; about 390 with six (ours).
- Behaviour: focus moves to the first link on open; Escape closes and returns focus; outside pointer-down closes; navigation closes. Built on the native `popover` attribute like Say hello, so it works before hydration.

### 7.7 Footer

- `footer[data-site-chrome][lang="en"]`, `position: relative; overflow: hidden; padding-top: 40px`. Identical on every page. 955 px tall at 1280x800; 1195 at 390.
- Sheet: absolute, inset 0, the footer-sheet gradient (section 2.3), dither field over the bottom 60%.
- Inner `.wrap`: `position: relative; display: flex; flex-direction: column; justify-content: space-between; min-height: var(--screen); padding-top: clamp(96px, 14vh, 160px)`.
- Two pixel illustrations (from 1280 only, `aria-hidden`): squares `clamp(150px, 14vw, 240px)`; left at `calc(50% - clamp(260px, 25vw, 380px) - clamp(150px, 14vw, 240px))`, top `clamp(140px, 22vh, 240px)`; right mirrored, top `clamp(200px, 30vh, 320px)`. Ours: code-drawn, a one-time animation of 3 s or less on reveal, then still.
- Centre block, max 760, centred text:
  - Reveal (rise 12): `t-meta` eyebrow, then the `t-footer` headline, margin-top 20.
  - Reveal: `t-body`, margin-top 32, max 46ch, paragraphs 12 apart, `--ink-60`; the last sentence 500 and `--ink`.
  - Reveal, margin-top 40: the footer Say hello pill (52 tall) and popover.
- Footer card: margin `96px 0 32px`; radius 24; `color-mix(in srgb, var(--paper) 88%, transparent)` with `backdrop-filter: blur(10px)`; ring `--line-soft`; padding `clamp(24px, 3vw, 40px)`; grid gap 32 (section 4.2).
  - Name block: the name in the serif (`clamp(28px, 2.4vw + 8px, 40px)`), then 14px `--ink-60` with the 7 px dot: the availability label from `OPEN_TO_ROLES`.
  - Pages (`t-meta` heading, list margin-top 12): every public page the old site menu links, from `siteMenu` in `lib/content/landing.ts`: Home, About, Ventures (`/#ventures`), Portfolio, Résumé, Agent skills, AI engineering, Learn, Examples, Stack, Proof, Build, and Contact. This list is the crawl path for crawlers that do not run JavaScript and feeds prerender link discovery. No `/blog` or `/press` while hidden.
  - For agents group (`footerAgents`): agents.md, llms.txt, sitemap.md, skills.md.
  - Elsewhere (`socials`): X, LinkedIn, GitHub; new tab with `rel="noopener"` and a visually hidden "(opens in a new tab)".
  - Links 15px `--ink-80` to `--ink`; ours: `display: inline-flex; align-items: center; min-height: 28px; min-width: 24px`, list gap 4.
  - Bottom line, margin-top 40, `t-meta` `--ink-60`: "© {year} Kunanon Jarat · Bangkok" (today's string, year computed).
- Phones: headline 36px/36.72; body 17px; Say hello 134x52; card 350 wide, padding 24, one column with the name block, Pages and Elsewhere stacked 32 apart; illustrations hidden.

---

## 8. Home sections

### 8.0 Order and proportions

`main#main`: hero, `#work` (with `#ventures`), `#about`, `#journey` (with `#story`), testimonials (hidden), then the footer. The intro overlay stays on Home.

Reference heights at 1280 (document 10,033): hero 803; work 3,965; about 1,693; journey 1,530; testimonials 928; footer 955. At 390 (document 10,404): hero 1,046; work 2,262; about 2,891; journey 2,047; testimonials 962; footer 1,195.

Sections after the hero sit above it (`position: relative; z-index: 1; background: var(--paper)`) so they slide over the sticky hero.

### 8.1 Hero

**Stage and sheet**
- `section.hero-stage[aria-labelledby="hero-title"]`: `position: sticky; top: 0; height: var(--screen)` from 1024 (ours: not sticky and content height under 1024, and when the viewport is under 640 px tall, so no hero content is unreachable; the reference set `min-height: 0` under 810 and was 1,046 tall at 390).
- Sheet: absolute, `inset: 12px 12px 0` (10px under 810), radius `28px 28px 36px 36px`, `background: var(--sunset)`; dither sky band across the top (about the top 150 px at 1280, approx.).

**Copy column**
- Padding-top `calc(var(--nav-h) + 24px)` (116); `calc(var(--nav-h) + 28px)` on phones (120).
- Vertical rhythm (approx.): chips, then 24 to the h1, 32 to the lead, 32 to the actions.
- Chips row (ours, from `OPEN_TO_ROLES`): accent badge "Open to roles"; one chip per role ("Forward Deployed Engineer", "AI engineering"); a location chip ("Bangkok or remote"); then the motion toggle when rotation or the marquee runs. Wraps; gap 8. Replaces today's single pill with middle dots.
- H1 `#hero-title`, `t-hero`, `--ink` (the reference sets no accent colour in the h1).
- Lead: `t-lead`, `--ink-80`, max about 548 px; `hero.homeLead`.
- Actions, gap 10 (approx.): dark pill "Contact me" (`/contact`, swap arrow) and ghost pill "Résumé" (`/resume`), both 44 tall. The reference's two in-page anchors are covered by the nav.

**H1 rotation (ours, built on the reference's markup)**
- Accessible name fixed: `aria-label="Hi, I’m Kunanon Jarat. Forward deployed AI engineering from Bangkok."` (curly apostrophe, as `hero.greeting` and the parity reference hold it).
- Line 1 "Hi, I’m Kunanon Jarat." never moves.
- Line 2: a grid where the outgoing and incoming lines share `grid-area: 1 / 1`. Phrase 1 is "Forward deployed AI engineering from Bangkok."; the alternates are owner-approved lines (section 15).
- Server output and first render: the whole sentence, static, no stamp, no rotating-out line. Both lines are `aria-hidden` spans with literal spaces between words, so the parity gate (it strips tags from the first `<h1>` and compares the text) still reads "Hi, I’m Kunanon Jarat. Forward deployed AI engineering from Bangkok.". Alternates never appear in server HTML.
- Swap: every 4,200 ms. The old line becomes the rotating-out copy (`kj-line-out`) and stays until the next swap. The new line's words stamp in:
  - variables `--stagger: 70ms; --delay: 140ms; --word: 500ms`; per word `--at: calc(var(--delay) + var(--i) * var(--stagger))`;
  - word indices continue from line 1 (four words, so the first swapped word has `--i: 4` and starts at 420 ms, as the outgoing line finishes its .42 s fade);
  - `data-side` alternates by index, even left (`--dir: -1`), odd right (`--dir: 1`);
  - each word runs `kj-word-text`, `kj-word-mark` and `kj-word-drift` (section 5.2).
- Pauses on pointer hover over the line, while the motion toggle is set to paused, while the document is hidden and while the hero is off screen (ours). No rotation with fewer than two phrases or under reduced motion.

**Entrance**: section 5.6. Chips `kj-fade-up` .7s delay .2s; canvas mock `kj-file-in` 1.4s delay .5s; lead `kj-fade-up` .9s delay 1.1s; actions `kj-fade-up` .8s delay 1.3s; logo strip `kj-fade-up` .9s delay 1.5s; all `--ease-expo`. The h1 has no entrance.

Fit check (ours, estimated): at 1440x900 the h1 sets at 79.6 px in about 4 lines and the actions end near y 653; at 375x812 the h1 sets at 42 px in 3 to 4 lines, the chips take two rows and the actions end near y 556. Both keep "Open to roles", "Contact me" and "Résumé" in view as the recruiter smoke test requires.

### 8.2 Canvas mock

A design-tool window beside the copy (right column), showing the three featured projects.

**Desktop anatomy at 1280** (reference 548x406; inner positions approx., from the screenshot):

| Part | Position and size | Notes |
|---|---|---|
| Window | 548x406, radius about 16, `--paper`, ring `--line-soft`; width 100% of the column with `aspect-ratio: 548 / 406` | |
| Title bar | 28 tall, hairline below | three window dots 8 px, 11.5 px apart, first at 15 px; centred breadcrumb (wordmark, "/", "Selected work"); accent button at right 18 tall |
| Canvas | dotted: dots about 1.5 px every 16 px, about ink 16% (the reference's dot tokens were not captured) | |
| Layers panel | left 13, top 48, about 88x90 | tabs row, a group label, three rows about 16 apart, the active row accent with white text |
| Frame 1 (selected) | left 108, top 74, about 191x131 | name label above it, selection box with four 5 px square handles |
| Frame 2 | left 312, top 103, about 137x94 | partly under the inspector |
| Frame 3 | left 170, top 247, about 164x111 | |
| Inspector | right 13, top 48, about 105x122 | two tabs; two label and value fields; a dark "View project" button |
| Comment bubble | left 22, top 330, about 114x41 | 16 px avatar, name and time line, comment text |
| Named cursor | inside frame 1 | arrow plus an accent name chip |
| Toolbar | centred, bottom 12, about 122x26 | five tool icons, the first active |

**Our changes**
- Every label is 12 px (reference 9 to 11 px): Layers grows to about 104 px and the inspector to about 124 px; frames shrink to fit; long names end with an ellipsis.
- Under 1180 the Layers panel hides; under 1024 the phone layout applies.
- Thumbnails inside frames: a real screenshot where one is registered (`cover` in `lib/content/portfolio.ts`), otherwise a textless code-drawn block layout (bars and rectangles, no text under 12 px), and the frame's label row adds an "Illustration" chip.
- Semantics: chrome, Layers, toolbar, comment and cursor are `aria-hidden`. The frames are an `ul` of three links (accessible name "{name}: View project", to `/portfolio/{slug}`) in a group labelled "Featured projects". The inspector button is a link to the selected project. The title-bar button is decorative (`aria-hidden`, no pointer events) unless the owner wires it to sharing.
- Behaviour: hovering or focusing a frame moves the selection box (and handles), the active Layers row and the inspector fields to it (.24s `--ease-expo`).
- Comment bubble (ours): the owner's portrait, the first name, and the selected project's first cleared outcome (`outcomeLine()`), or its tagline when it has none.
- Named cursor (ours): label "You" by default (owner may change); glides in once with the window (1.4 s), then rests. No loop, so no pause control.

**Phones (390)**: full width 350, margin-top 32; title bar kept (title 13 px, button 22 tall); Layers and inspector hidden; the three frames become a horizontal carousel (235x183 each, 15 px gaps; ours: `overflow-x: auto; scroll-snap-type: x mandatory`, frames centred on snap). Pager below: buttons named "Show {name}", the active one `aria-current="true"`. Visual dots as the reference (active 24x7 accent pill; inactive 7x7) but each button is a 24x24 hit area with the dot drawn inside (ours), inactive dots `--ink-45` (3.05:1 non-text on paper).

### 8.3 Logo strip

- Under the hero copy, inside the stage. Eyebrow centred, `t-meta` `--ink-60`: "Where I’ve worked" (brief; typographic apostrophe). Ours: the motion toggle covers the strip too.
- Marquee: two copies of the list in a track (`width: max-content; display: flex`), `kj-marquee` 44s linear infinite; list `gap: 56px; padding-right: 56px` (72 for the large variant); hero edge mask 10% and 90%. Pauses on hover. The duplicate list is `aria-hidden="true"` (ours); the visible list is an `ul` labelled by the eyebrow.
- Items (ours): typographic wordmarks until hi-res SVG wordmarks exist: Onest 600, 20px, -.01em, `--ink-60` (no opacity or filter; the reference set logos 24 px tall at .55 opacity, white-inverted in dark). Not links.
- Reduced motion: static centred wrap, row gap 20, no mask, duplicate hidden.

### 8.4 Work stack

- `article#work[aria-labelledby]` labelled by its eyebrow "Selected work" (ours: an `article`, so the smoke test `getByRole("article", { name: "Selected work" })` keeps passing). Padding-top 112 (measured at 390; desktop not captured, same value).
- Header: eyebrow row "Selected work"; two-line serif `t-h2` (owner copy); a lead aligned right on the h2's baseline, `--ink-60`.
- List: `ul` grid, gap 24. Each `li` is sticky: `top: calc(104px + 14px * index)`.
- Card (`article`, section 6.12): grid section 4.2; radius 28; `min-height: min(72vh, 620px)` (576 at 1280x800); ring `--line-soft`; material fill (section 2.4); dither over the right 60%.
  - Body column, flex column gap 18: chips (category and period for projects; "Venture" and the start year for ventures), the title (section 3.3), the summary (16px `--muted-strong`, the project's tagline), the evidence line (ours: `outcomeLine()` of the first cleared outcome; a GoGoCash card shows its user count as `lib/content/landing.ts` words it), the CTA.
  - CTA: dark pill "View project" (ventures: their `linkLabel`), arrow grows in on card hover; the striped ring shows on card hover.
  - Media column: white frame, radius 20, `--elev-frame`, holding the real screenshot or the code-drawn illustration with the Illustration chip. Card hover scales the frame to 1.015.
- Depth (ours; the reference set it from script, algorithm not captured): on scroll, for each card, `depth` is the sum over later cards of how far each has slid over it (0 to 1 each). The card gets `transform: scale(1 - min(depth, 4) * .035)` from top centre and a `--paper` overlay at `opacity: depth * .12`. Off under reduced motion.
- Focus (ours, WCAG 2.4.11): when a link inside a covered card receives focus, the page scrolls so that card is back at its own resting position.
- Ventures group (ours): after the project stack, an eyebrow row "Ventures" with `id="ventures"`, the heading and subheading from `ventures` in `lib/content/landing.ts`, and a second sticky stack of the two venture cards. This keeps `/#ventures`, the redirects and the venture breadcrumbs working.
- Phones (390): cards 350x294 (about 340 with the evidence line), sticky as above; grid `minmax(0, 1fr) auto`, gap `20px 16px`, padding 20, radius 18; media first (16:10, 310x194, frame radius 12); title 22px/1.15 500 -.02em; CTA a 40x40 round dark pill with the arrow only (label visually hidden); chips and summary hidden; the Illustration chip and the evidence line stay (ours); dither over the top 70%.

### 8.5 About bento

- `section#about[aria-labelledby]`. Padding-top 128 (phone value). Header: eyebrow (owner copy), `t-h2` max 10ch, a one-line lead aligned right.
- Grid: section 4.2. Tiles: section 6.4.

| Row | Tile | Span | Content |
|---|---|---|---|
| 1 | Brief | 7 | `t-lead` paragraphs, `--ink-80` |
| 1 | Mess | 5 | `--tint-2`; five chips start scattered, rotated and tinted coral and violet, then tidy into a straight list with violet check circles when revealed (.75s `--ease-expo`, staggered); an italic serif line under them (30px `--accent-ink` on phones) |
| 2 | Stats | 7 | the stats gradient and a dither field; three large numerals drawn as pixel SVG, each with a `t-meta` label and a visually hidden text equivalent; a footnote |
| 2 | Scene | 5 | a code-drawn animation with a chip caption; ours: pause button (section 6.11) if it loops |
| 3 | Four tiles | 3 each | `--paper`; a 64 px code-drawn icon that animates once on reveal and on hover (no loop); title 22px 500; text 14px `--ink-60` |

- Phones: one column, gap 12; Brief at 18px; mess chips 48 to 61 tall; stats tile 208 tall; scene tile 380 tall; the four tiles 240 to 260 tall.

### 8.6 Journey

**Stage**
- `section#journey`. Stage height `var(--screen)` from 810 (800 at 1280x800); 640 on phones; phone wrapper padding-top 112.
- Washes: section 2.3.
- Centred block: eyebrow "Journey" (`t-meta`), `t-h2` max 9ch, `t-lead` (max 15rem on phones), ghost pill to `#story` (36 tall `sm` on phones). Copy: owner input.
- Orbit around the block: tool tiles `clamp(72px, 6.4vw, 100px)`, each with the tool name (14px 500) and its kind (12px mono, reference 10px); plus four pixel file tiles. Far items smaller and blurred (depth of field). Tiles rise in with `kj-file-in` (1.4s).
- Draggable ring (`cursor: grab`). Ours: a slow spin of 60 s per turn once in view (the reference rate was not measured), pausing on hover, focus and drag, with a pause button at the stage's bottom-right. Static under reduced motion.
- Semantics (ours): the tools are a real `ul` (names and kinds as text, in a sensible reading order); the 3D layout is visual only; file tiles are `aria-hidden`.
- Tile art (ours): our own pixel monogram tiles, not the tools' brand marks.

**Story (`#story`)**
- Grid: section 4.2. Text side: two paragraphs with bold key phrases; an `h3` (`t-h3`) about the roles sought; a paragraph; chips.
- Records card (right): radius 16, `--paper-2`, padding `clamp(20px, 2.4vw, 36px)` (reference "clamp", values not captured); `t-meta` headings "Experience" and "Education" (the résumé's own section names); an ordered list per heading: organisation (15px 500), period (12px mono), title (14px `--ink-60`) (sizes ours, not captured); a "Résumé" text link at the end (ours); dither floor along the bottom edge.
- Phones: one column, gap 56, records card under the text.

### 8.7 Testimonial notebook (built, hidden)

- Renders only when `lib/content/testimonials.ts` holds 3 or more owner-cleared entries (ours: a new module, empty until then). Never invented, never sample text in `lib/content/`. The preview route uses placeholder text that reads as a placeholder ("Placeholder note 1 of 3") with no person's name.
- Section: centred eyebrow row with rules both sides; serif h2 `clamp(34px, 3vw + 10px, 56px)`.
- Book: `role="group"`, `aria-roledescription="carousel"`, label owner copy.
- Desktop (from 810): a two-leaf spread 1008x480.
  - Left leaf: the cover (lavender gradient) with a `t-meta` label, an italic serif line (`clamp(26px, 2vw + 10px, 40px)/1.1`, `--accent-ink`) and a `t-meta` count of notes.
  - Right leaf: stacked pages. Each page is lined paper (section 2.5) with the quote in Patrick Hand (about 22px), an initials avatar, the name, the role, and a mono page number.
  - Spiral of 28x9 rings down the gutter.
- Pages (`article`): front and back faces with `backface-visibility: hidden`. `transform: rotateY(calc(var(--turn) * -180deg))` around the left edge, `transition: --turn 1s var(--ease-cubic)`. `--lift = sin(turn * 180deg)` grows a moving shadow and a darkening gradient mid-turn. Pages not showing are `inert` and `aria-hidden`.
- Page cast: after a one-step turn, `kj-page-cast` sweeps a shadow across the uncovered page.
- Autoplay: the next page after `M = min(18000, max(7000, 2000 + 180 * wordsOnVisiblePages))` ms (observed 13.34 s on the desktop spread, 16.94 s on a phone page). Paused while the pointer is over the notebook, while focus is inside, or when paused by the button.
- Countdown: on the pause button, `conic-gradient(var(--accent) calc(var(--count) * 1turn), transparent 0)` masked to a 2 px ring, `kj-book-count` linear forwards for `M`, restarted each page.
- Buttons: 48 px round ghost pills with `--elev-float`: previous and next (labels ours: "Previous page", "Next page") and pause ("Pause the notebook" / "Play the notebook"). From 1180, previous and next sit at the notebook's vertical centre outside the book; under 1180 they sit below it at the centre plus and minus 88 px; pause is centred under the book.
- Drag and swipe: pointer down on the book (not on a button or link); horizontal movement over 8 px picks a direction (vertical cancels); the page follows the pointer (`--turn` = distance / leaf width) and the page beneath gets `--cast = sin(pi * progress)`; release turns the page when dragged past 25% of the leaf width or flicked faster than 0.5 px/ms, otherwise it springs back. `cursor: grab`, `grabbing` while dragging; `touch-action: pan-y`.
- A breakpoint change resets to page 1.
- Live region: names the authors on view; ours, only after a user-initiated turn (silent during autoplay).
- Phones: one page per leaf. The book bleeds to the left edge (`width: calc(100% + var(--pad)); margin-left: calc(-1 * var(--pad)); padding-left: 30px; overflow-x: clip`), a 36 px cover strip on the left edge, rings at x 30. Page 340x591, rules every 32 px, margin line at 38 px, quote Patrick Hand 19px/32px. Controls below: previous at `calc(50% - 88px)`, pause centred, next mirrored, all 48.

---

## 9. Case-study template

Routes stay `/portfolio/<slug>` (5) and `/ventures/<slug>` (2). Every case page keeps its JSON-LD (CreativeWork or SoftwareApplication with Offer, plus BreadcrumbList) inside the page body, its title, description, canonical, OG image and Markdown twin.

### 9.1 Order

Reference at 1280x800 (two cases measured; y and height in px):

| Block | Case 1 (two-line h1, 4 meta items) | Case 2 (one-line h1, 3 meta items, external link) |
|---|---|---|
| Hero section | 0, 1449 | 0, 1418 |
| Sky | 0, 576 | 0, 576 |
| Back link | 163, 40 | 163, 40 |
| Eyebrow | 238, 17 | 238, 17 |
| h1 | 275, 155 | 275, 78 |
| Lead | 454, 31 | 377, 31 |
| External link pill | none | 440, 36 |
| Cover | 542, 722 (1152 wide) | 532, 722 |
| Meta | 1335, 114 | 1326, 92 |
| Status line | none | 1418, 47 |
| Body (column and rail) | 1529, 15858 | 1545, 8934 |
| More work | 17387, 906 | 10479, 906 |
| Footer | 18293, 955 | same |

Ours, top to bottom: fixed nav (Work current); hero; evidence rows (Outcome, My part); cover; meta row (and venture metrics); body with rail; Hiring panel; More projects; footer.

The evidence rows move above the cover because the repo's smoke tests require `article "Outcome"` and `article "My part"` as full-width rows, My part under Outcome, both above `article "Interface"`, each under 260 px tall, with the outcome ending within 1.5 screens (1,350 px) at 1440x900. In the reference order the meta row starts below y 1,400 at 1440, so it cannot carry the evidence (estimate for the intranet case in our order: Outcome ends near y 920).

### 9.2 Hero

- `section[aria-labelledby="hero-title"]`, `position: relative; overflow: hidden; padding-bottom: 24px; padding-top: calc(var(--nav-h) + 48px)` (140), from 810 `calc(var(--nav-h) + 80px)` (172).
- Sky: absolute at the top, `pointer-events: none`, `height: min(72vh, 620px)`, mask section 2.3, dither section 6.8.
- Back link (ours: labels and targets follow the BreadcrumbList parent): portfolio cases "All projects" to `/portfolio` (today's); venture cases "Ventures" to `/#ventures`. `t-nav`, `--ink-60` to `--ink`, left arrow 15 px, gap 6; a 40 px tall hit area by `margin-block: -10px; padding-block: 10px` (76x40 at 390).
- Eyebrow: `t-meta`, margin-top 40, `--ink-60` (reference `--ink-45`), the status dot first (margin-right 10). Text (ours): category and period for projects; "Venture" and the timeline for ventures.
- h1 `#hero-title`, `t-display`, margin-top 20, `--ink`, `max-width: 20ch` (ours; reference 14ch held only the name). The text stays exactly what the parity reference holds: "{name}. {tagline}" for projects, "{name} {tagline}" for ventures. Two spans with a literal space between: the name roman; the tagline in `t-italic` `--ink-60` (ours). The venture logo, when shown, has empty alt text.
- Lead: `t-lead`, margin-top 24, max 640, `--ink-60`: `summary` for projects, `caseStudy.intro` for ventures.
- Pills, margin-top 32, gap 8: the external link when the case has a public URL (ghost `sm`, up-right arrow that moves `translate(3px, -3px)` on hover, new tab with a visually hidden notice); then Share (ours, section 13 item 27).

### 9.3 Evidence rows (ours)

- `.wrap`, margin-top 48, rows 24 apart. Each row: `article`, full width of the wrap, `border-top: 1px solid var(--line)`, padding-top 24.
- `article "Outcome"`, only when the case has cleared outcomes:
  - heading `h2` styled `t-meta` "Outcome";
  - a fact strip of `outcomeLine()` items, label `--ink-60` and value 17px 500 ink;
  - the link "As stated in the résumé →" to `/resume` (exact name; a test pins it).
- `article "My part"`: heading `t-meta` "My part"; the `myPart` sentence, 17px/1.6 `--ink-80`.
- Ventures: the metrics `dl` (section 9.5) takes the Outcome position when the venture has metrics; the case section headed "My role" renders in the My part position (named by its heading) instead of as a chapter.
- Absent data renders nothing (a case with no cleared figure shows My part and no Outcome; the site's own case shows neither, by design).

### 9.4 Cover

- `article[aria-label="Interface"]` wrapping a `figure`, `.wrap` margin-top 56.
- Frame: `position: relative; overflow: hidden; border-radius: 28px; background: var(--paper-2); box-shadow: 0 0 0 1px var(--line-soft)`; `aspect-ratio` from the image's registered width and height (reference 2000/1253; class default 2/1); 16:10 for code-drawn covers.
- Image: `object-fit: cover; object-position: top`, `loading="eager"`, `fetchpriority="high"`, `sizes="(max-width: 1360px) 100vw, 1360px"`. Not clickable, no zoom, default cursor.
- Under 720: `margin-inline: calc(12px - var(--pad))` (12 px from the screen edges), radius 14 (366x229 at 390).
- Illustration caption (rule 14): when the cover is code-drawn, a `figcaption` under it, 14px `--ink-60`, starting with "Illustration" (default text ours: "Illustration, not real data.", keeping today's honesty wording).

### 9.5 Meta row and venture metrics

- `.wrap`, margin-top 48: `dl`, grid section 4.2, `border-top: 1px solid var(--line)`, padding-top 24. 270 px columns at 1280.
- Each item `div` with `min-width: 0`: `dt` `t-meta` `--ink-60`; `dd` margin-top 6, 16px/22px 500 `--ink`.
- Items: projects Role, Organisation, Period, Access; ventures Role, Started, Status, Offer. Three or four items; the grid keeps 4 columns.
- Venture metrics: the same `dl` grid, one `div` per metric with `dt` label, `dd` value, and the as-of month in `t-meta` inside the same `div` (a test reads `dl > div` and expects "As of October 2026" in it). The registered-user count always reads "1,000 registered users", never shortened.
- Optional status line after it (reference, 2 of 6 cases): `t-lead` `--ink-60`, padding-top 16. No data for it today.

### 9.6 Body grid, rail and phone contents

- Body: `.wrap`, margin-top 80; grid section 4.2. No reading progress bar, no back-to-top.
- Rail (from 1100): `order: 2`; the rail nav is sticky at `top: calc(var(--nav-h) + 28px)` (120).
  - `nav` labelled by its heading "On this page" (`t-meta`, margin-bottom 16, `--ink-60`).
  - `ol`: grid gap 2. Links: flex, baseline, gap 10, padding `6px 0`, 14px/1.3, `--ink-60` (reference `--ink-45`), hover and current `--ink`, colour .1s.
  - Number: min-width 18, mono 12px (reference 11px) .06em, `--ink-60` (reference `--ink-30`); current number `--accent`, with a 6x6 `--accent` square at `left: -14px; top: .32em`.
  - Rows about 30 px tall. Only top-level chapters are listed.
- Current item: `aria-current="location"`. Scrollspy: IntersectionObserver `rootMargin: "-20% 0px -60% 0px"`, threshold 0, topmost intersecting chapter wins.
- Click: scrolls to the chapter (section 4.3), replaces the URL hash with `#ch-NN`, marks the item current at once.
- Under 1100 (ours; the reference had no phone contents): a `details` "On this page" after the meta row, closed by default, holding the same list.

### 9.7 Chapters

- Column: a flex column of chapters, each revealed (rise 24, .7s).
- Two kinds: a numbered chapter (listed in the rail) and a continuation sub-chapter (a small `t-meta` label above its h2, no number, not listed).
- Spacing: between a numbered chapter and anything, `margin-top: clamp(80px, 9vw, 128px)` (115 at 1280; 80 at 390); a numbered chapter after another block also gets `border-top: 1px solid var(--line); padding-top: 36px`; between continuations, or a numbered chapter and its continuation, `margin-top: clamp(56px, 6vw, 88px)` (77 at 1280).
- Each chapter is `section#ch-NN`:
  1. Kicker: flex, centre, gap 8, margin `0 0 18px`, `500 12px/1.55` mono, .08em, uppercase, `--ink-60`: the pixel mark, the number "01", a "/" separator (`--ink-60`, ours; reference `--ink-30`), the chapter title.
  2. Head: `h2` `t-h3`, `max-width: 26ch` (32.48 px at 1280; 24/27.6 at 390). Ours: when a chapter has no separate headline, the kicker itself is the `h2`.
  3. Prose, margin-top 20 (section 3.3).
  4. Zero or more blocks (sections 9.8 and 9.9).
- Chapter rhythm in the reference: 8 to 11 chapters. Problem, decisions and outcome are prose chapters; there is no metrics or quote component in use.

### 9.8 Fact strip and point list

- Fact strip: margin-top 36, `padding: 18px 0`, `border-block: 1px solid var(--line)`, grid section 4.2. Each `li`: flex, baseline, gap 12, 17px 500 -.01em; a `t-meta` number first (`--ink-60`, ours; reference `--ink-30`). Used for before and after, outcomes and short facts.
- Point list: margin-top 28, grid gap 10, max 64ch. Each `li`: flex, gap 12, 16px/1.6, pixel bullet first; `strong` 600.

### 9.9 Showcase grid, tile, caption

- Grid: margin-top 40; section 4.2 (full 913 and half 446 at 1280).
- Tile: `position: relative; overflow: hidden; aspect-ratio: var(--ratio); background: var(--tile); border-radius: 24px; cursor: zoom-in`; radius 12 under 640; default cursor at 809 and under. Full tiles 16:10; half tiles square or near-square. Tones: section 2.6.
- Content (ours): a real screenshot (in a dormant mat if it needs a frame) or a code-drawn illustration (SVG, CSS or canvas). The reference used live animated recreations of UI and did before-and-after inside tile animations, not with sliders. Illustration tiles are `role="img"` with an `aria-label` describing them; text drawn inside renders at 12 px or more, or is replaced by bars.
- Buttons: 44 px round ghost pills, `position: absolute; right: 14px`; pause at `bottom: 14px` ("Pause the animation" / "Play the animation"; only when the tile animates); Enlarge at `top: 14px` (maximize icon 14 px; label ours "Enlarge"). Hidden until tile hover, focus-visible or pressed; always visible under `(hover: none)`; 30 px at 8 px inset under 640; Enlarge hidden at 809 and under.
- Caption: `figcaption`, grid gap 2, margin-top 14, max 60ch, 14px/1.5 `--ink-60`; a title span 16px/1.4 600 `--ink`. From 810: gap 4, margin-top 16, text 16px, title 18px. Illustration tiles start their caption with "Illustration".

### 9.10 Lightbox

- From 810 only. Opened by clicking a tile (not its buttons) or Enlarge.
- Native `<dialog>` with `showModal()`, labelled by the caption title.
  - Dialog: `position: fixed; inset: 0; width: 100vw; height: 100dvh; max-width: none; max-height: none; margin: 0; padding: 0; border: none; background: none; overflow: hidden`; `::backdrop` transparent.
  - Veil: absolute, inset 0, `rgba(11,11,14,.72)`, `backdrop-filter: blur(20px)`.
  - Stage: `--gap-y: clamp(16px, 3vh, 32px)`, full height, grid, centred, padding `var(--gap-y) clamp(16px, 2.5vw, 40px)`.
  - Wrap: `width: min(100%, 1760px, calc((100dvh - 2 * var(--gap-y) - 84px) * var(--ratio)))` (1069x668 at 1280x800).
  - Large tile: radius 28 (18 under 640), `--elev-stage`, default cursor, `transform-origin: 0 0`.
  - Close (white ghost round pill, 44) at top 16, right 16; large pause at bottom 16, right 16.
  - Caption below: text `rgba(255,255,255,.68)` (4.80:1 over the veil on a white page), title white, margin-top 16.
  - The in-page tile is `visibility: hidden` while open.
- Content (ours): the dialog renders its own instance of the tile's illustration or image, so nothing is moved between the page and the dialog.
- Open: veil opacity 0 to 1, 320 ms ease-out; tile FLIP from the in-page rect (`translate(dx, dy) scale(sx, sy)` to none), 560 ms `cubic-bezier(.16,1,.3,1)`; caption from opacity 0 and `translateY(6px)`, close and pause from opacity 0, 300 ms ease-out after a 260 ms delay. Reduced motion: the tile fades in over 200 ms.
- Close (Escape through the dialog's cancel event, the close button, or a click on the empty stage): caption and buttons fade out over 120 ms; veil 420 ms ease-in; tile back to its in-page rect, 420 ms `cubic-bezier(.32,.72,0,1)`. Reduced motion: fade out over 160 ms.
- While open: wheel and touchmove are prevented; ArrowUp, ArrowDown, PageUp, PageDown, Home, End and Space are prevented (Space still works on buttons). Focus lands on the large pause button, or close when the tile is still. Focus returns to the opener on close (ours, explicit).

### 9.11 Hiring panel

- `article` named exactly "Hiring" (heading `t-meta` "Hiring"), after the last chapter in the column.
- Panel style from the reference's dormant panel: radius 24, padding `clamp(24px, 3vw, 40px)`, `--paper`, ring `--line-soft`.
- Content from `portfolioPage.hire` (`lib/content/portfolio.ts`): the kicker "Hiring" and a `t-h3` line ("Want work like this on your team?"); then the availability sentence (`OPEN_TO_ROLES.sentence`), a ghost pill "Résumé" (`/resume`) and a dark pill "Contact" (`/contact?topic=hiring`). Tests pin both link names and targets.
- Required on project cases; recommended on venture cases (ours).

### 9.12 More projects

- `section`, padding `128px 0 128px`. Inside: `.wrap` with `border-top: 1px solid var(--line)` and padding-top 48.
- Head: flex, `align-items: end`, `justify-content: space-between`, gap 24: `h2` `t-h3` "More projects" (ours; the repo's pager is already named "More projects"); a text link "All projects →" to `/portfolio`.
- Cards: grid section 4.2, margin-top 40. Ours: the next two cases in list order, wrapping (projects in `portfolio.ts` order; ventures show the other venture and the first featured project). The reference picked the first two others in its own order; there is no previous and next pager and no contact block here.
- Card (section 6.12), full height:
  - image mat: `aspect-ratio: 16 / 10`, radius 16, `--paper-2`, ring `--line-soft`, `isolation: isolate; overflow: hidden`; the image covers, top-aligned (556x348 at 1280); illustrations carry the chip;
  - text block, margin-top 20, flex column gap 8, padding-inline 4: `t-meta` row (category and period, `--ink-60`, wrapping, gap 12); title 22px/1.2 -.015em 500; summary `t-small` max 46ch `--ink-60`; at the bottom (padding-top 12) a ghost `sm` CTA "View project" with the growing arrow.
- Hover (fine pointer): image `scale(1.03)` .4s; CTA ring; arrow grows. Press: mat `scale(.985)`. Focus-visible: 2 px accent outline on the mat.

### 9.13 Dormant components (available when a case needs them)

| Component | Values |
|---|---|
| Pull quote | padding-block `clamp(8px, 2vw, 24px)`; quote section 3.3 |
| Panel | radius 24, padding `clamp(24px, 3vw, 40px)`, `--paper`, ring `--line-soft` (used by the Hiring panel) |
| Small panel | radius 16, padding 22, same fill and ring |
| Steps | grid `repeat(auto-fit, minmax(150px, 1fr))`, gap 8, margin-top 32; each `li` padding 16, radius 14, `--paper`, ring `--line-soft` |
| Screenshot mat | padding `clamp(8px, 1vw, 12px)`, radius 16, `--paper`, `--elev-mat`; image radius 8 |
| Thumbnails | 2 columns, 3 from 720 when there are three, gap 14 |
| Phone gallery | panel `--tint-2` to `--tint-3`, radius 20 |
| Small label | the reference set it at 10.5 px mono; ours 12 px |

---

## 10. Phone layout rules (390)

The reference was captured at 390 with a desktop user agent, so its hover-gated states stayed on; on real touch screens `(hover: none)` rules apply (tile buttons visible). Ours also covers 375 and 320.

| Area | Rule at 390 |
|---|---|
| Global | `--pad` 20; column 350; the theme toggle is hidden (theme switch in the menu) |
| Nav | top 32, row 48. Left pill 186x48: avatar 32, first name in the serif 19px with the accent full stop (surname from 640), "Menu" 63x36. Right: Say hello 126x48. Under 370 (ours): Say hello as a 48 px round icon. From 370 to 809 the nav tightens (nav gap 8, pill padding 0 6, Menu padding 0 10, Say hello padding 0 14) so name, Menu and Say hello fit at 375 |
| Phone menu | section 7.6 |
| Popover | width `min(300px, 100vw - 32px)`, right-aligned to the trigger |
| Hero | not sticky, content height (1,046 in the reference); sheet inset 10; copy padding-top 120; chips first (badge 30, chips 26; two rows with our role chips); h1 42px/41.16, -.84px, 350 wide; lead 16px/24.8; actions 44 tall |
| Canvas mock | 350 wide, margin-top 32, carousel and pager (section 8.2) |
| Logo strip | eyebrow and marquee; same 44 s; edge mask |
| Work | padding-top 112; h2 44px/43.12; lead 17px; cards section 8.4 |
| About | padding-top 128; h2 44px, max 10ch; one column, gap 12; tile heights section 8.5 |
| Journey | wrapper padding-top 112; stage 640; h2 44px, max 9ch; lead 18px, max 15rem; ghost `sm` pill; story one column, gap 56; records card under the text |
| Notebook | section 8.7 |
| Footer | section 7.7 |
| Case hero | padding-top 140; back link 76x40; eyebrow margin-top 40; h1 42px/41.16 (max 20ch, ours); lead 18px/26.1 |
| Case evidence | rows full width, stacked, no sideways scroll at 375 and 320 (tests) |
| Case cover | 366x229 at x 12, radius 14 |
| Case meta | 2 columns of 163, gap 24; 293 tall for 4 items |
| Case body | rail hidden; our "On this page" disclosure; chapters 80 apart plus hairline plus 36; chapter h2 24px/27.6; prose 17px/28.9 |
| Fact strip | one column under 640, row gap 14 |
| Showcase | one column, gap 48; tiles radius 12 (a 16:10 tile is 350x219); captions 14px, title 16px 600, margin-top 14; pause 30x30 at 8 px inset; Enlarge hidden; tapping a tile does nothing |
| More projects | one column under 640 |

### 10.1 Foldables, tablets and dual screens (ours; owner request 18-11-26)

The owner asked for "mobile responsive for fold mobile and tablet as well". Layout follows the width of the page container (container queries on the site root), so the same rules hold in a resized window, a foldable that changes size when opened, and a tablet in either orientation. The canvas review (row 3) shows these sizes.

Device matrix (CSS px, as in the browser's device presets; each phase checks its pages against it):

| Device | Size | Range it falls in |
|---|---|---|
| Galaxy Z Fold, closed (cover screen) | 344 x 882 | under 370 |
| Small Android phones | 360 x 780 | under 370 |
| iPhone and most Android phones | 375 to 430 wide | 370 to 599 |
| Foldables opened, smaller models; phones in landscape | about 600 to 809 wide | 600 to 809 |
| iPad mini portrait | 768 x 1024 | 600 to 809 |
| iPad Air portrait | 820 x 1180 | 810 to 1023 |
| Galaxy Z Fold, open | 882 x 1104 | 810 to 1023 |
| Surface Pro portrait | 912 x 1368 | 810 to 1023 |
| iPad Pro portrait; iPad mini landscape | 1024 wide | 1024 to 1179 |
| iPad Air landscape | 1180 x 820 | desktop from 1180 |
| iPad Pro landscape | 1366 x 1024 | desktop |
| Surface Duo spanned (two screens, hinge between) | 1114 x 720 | dual screen |

Rules by range (everything not listed follows the phone rules of section 10 under 810, or the desktop rules from 1180):

| Range | Rules |
|---|---|
| Under 370 | The nav's Say hello is a 48 px round icon with its label kept for screen readers; the mess chips scatter at a quarter of their offsets (`--spread: .25`, so they stay inside the tile); the Outcome figures drop to 30 px and the footer headline to 34 px. Tap areas stay 24 px or more (the tap-area test runs at 344 too) |
| 370 to 809 | Phone rules; the tighter nav of section 10; mess chips at `--spread: .4` |
| 600 to 809 | The canvas carousel is 380 px tall with frames at 58 % width; the About grid has two columns (Brief, mess, stats and motion full width, the principles two by two); the records card puts Employment and Education side by side; showcase, steps, More projects and the footer card use two columns |
| 810 to 1179 | The hero stacks: copy first (max 680 px), then the full canvas mock (max 760 px) with its panels; the headline is `clamp(48px, 5.4cqi + 10px, 72px)`; stack cards pad 28 with 30 px titles and a 520 px minimum height; the notebook's arrows sit under the book beside the pause button |
| 810 to 1023 | About tiles all span 6 (pairs, the principles two by two); the story stacks with the records card full width in two columns; the case meta row and the approval steps use two columns; the rail stays hidden (under 1100) |
| Under 1280 | The footer's pixel illustrations are hidden (they would cover the centred call to action) |
| Dual screen, spanned across a vertical hinge (`@media (horizontal-viewport-segments: 2)`) | The hinge becomes the gap: the hero puts the copy on the first screen and the canvas on the second, with `column-gap` set to the hinge width plus twice `--pad` (from `env(viewport-segment-left 1 0)` minus `env(viewport-segment-right 0 0)`); the notebook opens as a two-page spread across the hinge, which replaces the spiral as its spine |
| Folded flat, hinge across the screen (`vertical-viewport-segments: 2`) | Not designed yet; phase 7 decides whether the hero and the notebook keep their content above the hinge |

How to check them: Playwright projects for 344 x 882, 390 x 844, 820 x 1180, 882 x 1104, 1180 x 820 and 1440 x 900; the spanned layout through Chromium's DevTools Protocol display-feature override (a vertical hinge of the device's width), since a plain viewport cannot trigger the viewport-segment media queries.

---

## 11. Dark theme specifics

- Mechanism: `.dark` on `<html>` (next-themes), not the reference's `data-theme` attribute. Light by default; the OS preference is ignored (the reference ignores it too). `color-scheme: dark` on the root in dark.
- Page `#0f0c18`; text `#f1edfa`; prose ink 80%; hairlines ink 10%.
- Nav pill and theme toggle: dark paper with `--elev-nav` dark (section 2.8).
- Dark pills invert: `--ink` fill `#f1edfa`, `--paper` text `#0f0c18` (16.79:1). Say hello, Contact me and card CTAs become light pills.
- Accent badge stays `--accent` (`#8d6bff`); its text is `#0f0c18` (ours; white was 3.70:1).
- Chips: paper 72% (`#0f0c18b8`).
- Hero sheet: `--sunset` dark (section 2.3). Dither skies redraw in deep plum and indigo; the case-page sky likewise.
- Stack cards: dark materials (section 2.4; deep navy for hue 253). Real screenshots stay as they are.
- Showcase tiles `#1d1a26`; brand tiles mix 16% of their wash into it; illustrations of light products stay light on the dark mat.
- Case cover backing `--paper-2` `#17131f`; the image is unchanged.
- Logo strip: our wordmarks use `--ink-60` (6.43:1), not the reference's inverted logos at .55 opacity.
- Theme icon: in dark the sun shows and the moon is hidden (`rotate(90deg) scale(.6)`, opacity 0).
- `theme-color` `#0f0c18` (section 7.5).
- Not captured, ours: `--dusk` and `--sunset-strong` dark (section 2.3); notebook paper stays light (section 2.5); deep tile tone `#17131f`; stats tile identical in both themes.
- Mixed with the repo: the Bangkok scene keeps its own day and night art tokens until phase 8 decides its future.

---

## 12. Accessibility fixes over the reference

Contrast figures from section 2 (computed, ours).

1. **Text contrast floor.** The reference sets `--ink-45` text (eyebrows, meta, rail labels, footer meta, the unchecked theme label) at 3.05:1 light and 4.07:1 dark, and `--ink-30` text (rail numbers, fact numbers, kicker separators) at 2.00:1 and 2.44:1. All text uses `--ink-60` or stronger: lowest 4.64:1 light, 5.92:1 dark. `--muted` (52%) is for display text of 24 px or more.
2. **Card summaries on light materials** use `--muted-strong` (lowest 5.74:1); `--ink-60` drops to 4.46:1 on four hues.
3. **Accent badge in dark**: `#0f0c18` text on `#8d6bff` (5.23:1) instead of white (3.70:1).
4. **Notebook secondary text**: leaf ink at 68% or more (5.76:1; 60% is 4.43:1).
5. **12 px floor**: canvas-mock labels (reference 9 to 11 px), rail numbers (11 px), orbit kind labels (10 px) and the dormant small label (10.5 px) are 12 px. Text drawn inside illustrations renders at 12 px or more, or is replaced by shapes.
6. **Tap areas at 24 px or more at 320 and 390**: carousel pager dots get 24x24 hit areas (reference 24x7 and 7x7); footer links are 28 px tall and at least 24 wide (reference 19 px tall, "X" 9 px wide); the nav fits at 320 (Say hello icon under 360).
7. **Pause controls** (WCAG 2.2.2) for everything that moves or updates for more than 5 s: the h1 rotation and the marquee (one hero toggle), the notebook autoplay, animated showcase tiles, a looping scene tile, the orbit spin. The status dot pings once. The reference paused the rotation and marquee only on hover.
8. **Toggle labels**: pause buttons switch their label and carry no `aria-pressed` (the reference did both, which announces contradictions).
9. **Focus never hidden** (WCAG 2.4.11): `scroll-padding-top: 96px` keeps focused and scrolled-to elements clear of the fixed nav; the away nav has `pointer-events: none` but stays focusable and returns on `:focus-within`; a focused link in a covered stack card scrolls its card back into place; the skip link sits above the nav.
10. **Popover and phone menu**: Escape, outside click, focus moved in and returned, `aria-expanded`, `aria-controls`, a labelled dialog. The reference verified only Escape.
11. **Phone theme switch**: native radios in a fieldset with a legend, so arrow keys and announcements work.
12. **H1 name stays fixed** during rotation (`aria-label`; visual lines `aria-hidden`), and the first render is complete and static (LCP).
13. **Card semantics**: cards are articles with one stretched link whose name includes its visible label (section 6.12), not whole-card links that hide their text from screen readers.
14. **Carousel live region** speaks only after user-initiated page turns.
15. **Marquee**: the duplicate copy is `aria-hidden`; the list is labelled.
16. **Canvas mock**: decorative chrome hidden; frames are named links; no fake focusable buttons.
17. **New-tab links** announce "(opens in a new tab)" (open repo backlog item).
18. **Arrows in link names**: new links keep arrows in `aria-hidden` spans. "As stated in the résumé →" keeps its arrow because a test pins that exact name (owner may approve a test change later).
19. **Phone table of contents** on case pages (the reference had none under 1100).
20. **Lightbox**: labelled modal dialog, focus placed and returned, Escape.
21. **Language**: chrome carries `lang="en"` on Thai pages (open backlog item); no uppercase or tracking on Thai text.
22. **Not-found and error pages** keep the site's StatusPage with nav, footer and recovery links (the reference served a stock 404 without its shell).
23. **Reduced motion** covers every item in section 5.7, including scripted motion and the view transition.
24. **Cursors**: our cursors keep a high-contrast two-tone drawing and apply to pills.
25. **WCAG 2.2 AA** (ours, best-practices audit section 6): axe runs with the `wcag22aa` tag on every page the redesign moves; dragging alternatives (2.5.7: orbit and notebook buttons) and consistent help (3.2.6: Say hello in the nav and the footer) are part of the design.
26. **Forced colors**: rings drawn as box-shadows vanish in forced-colors mode, so ringed primitives carry a transparent 1 px border and get system-colour borders; pixel art hides; current links are underlined.
27. **`prefers-contrast: more`**: `--ink-60` text moves to `--ink-80`, rings to `--line-strong`, chips to solid paper.
28. **`prefers-reduced-transparency`**: translucent chips, the motion toggle and the footer card become solid paper with no blur.
29. **Zoom and text spacing**: rem type and zoom-safe clamps (section 3.3); no fixed heights or clipped overflow on text, so WCAG text spacing (1.4.12) loses nothing.
30. **Canvas text**: figures drawn on canvas (PixelNumber) are also real text; canvases are `aria-hidden`.

---

## 13. Reconciliation with this repo

Each item: what wins and why. Items 1 to 20 are the owner's list of 18-11-26, expanded with the inventory's detail; 21 onward are found while writing this spec.

1. **Motion: no framer-motion, GSAP, Lenis or Rive.** Reason: owner rule (CSS-first motion), first-load budgets (entry chunk 113.7 of 120 KB gzip; marketing 200 KB), and the Lenis ban in `lib/design/globals.test.ts`. Reveals use IntersectionObserver plus classes (section 6.7); the popover and menu use CSS transitions; the page flip uses `@property` (section 5.4); animated tiles and pixel illustrations are code-drawn. Every animation sits inside `@media (prefers-reduced-motion: no-preference)` (the guard tests it; section 5.1 extends it). Anything moving longer than 5 s has a pause control.
2. **Scrolling: native.** Reason: the guard bans Lenis. `scroll-behavior: smooth` inside no-preference, the 96 px offset through `scroll-padding-top`, the reference's per-target values through `scroll-margin-top` (section 4.3). The router keeps `scrollRestoration: true`.
3. **LCP: the hero h1 never fades or hides.** Reason: owner rule and the `kj-line` guard. First render is the whole h1, static; the word stamp runs only on swaps (section 8.1). The reference stamped every word in on first load. The same holds for every page's h1 (no h1 inside a reveal).
4. **12 px text floor everywhere.** Reason: `lib/design/typeFloor.test.ts` and owner rule. Mock labels, rail numbers and tool kinds rise to 12 px (section 12 item 5).
5. **Tap areas of 24 px or more at 320 and 390.** Reason: the smoke tap-area test (WCAG 2.5.8) hit-tests every target after scrolling it into view. Pager dots get 24 px hit areas; footer links are padded (section 12 item 6). The fixed nav cannot cover targets (section 12 item 9).
6. **Theme.** Reason: tested setup (`defaultTheme="light"`, no forced theme) and owner choice. Keep next-themes with `.dark` on `<html>` (the reference uses `data-theme`), light default, system preference ignored. The switch becomes the reference's .56 s View Transition fade, scoped to the `theme` type (`kj-theme-fade` replaces the circular `kj-reveal`; the guard lines that pin `kj-reveal` change with this decision). Theme-color metas `#f7f3ff` and `#0f0c18` (the guard pins `#0b0d17` and `#f5f6fa` in `lib/seo/rootMetadata.ts`; it changes at cutover).
7. **URLs.** Reason: the SEO record says `/portfolio/*` and the venture pages must not redirect, and moving them touches about 40 files and 25 tests (inventory R1). Case studies stay at `/portfolio/<slug>` and `/ventures/<slug>`; the nav's Work goes to `/#work`; `id="ventures"` exists on the new Home (section 8.4); `/work` keeps its 308 to `/#ventures`; `run_worker_first` lists are unaffected.
8. **Recruiter path.** Reason: owner decision O9 and the smoke tests. The hero h1's text and accessible name stay "Hi, I’m Kunanon Jarat. Forward deployed AI engineering from Bangkok."; line 1 fixed, line 2 rotating with that first phrase and owner-approved alternates. "Open to roles", "Contact me" and "Résumé" stay in the hero, fully in view at 375x812 and 1440x900 (`section[aria-labelledby="hero-title"]`). The Primary nav keeps a "Résumé" link to `/resume` on every route but `/design`. Detail: the parity gate reads the first `<h1>` with tags stripped, so the server h1 holds only the canonical sentence with literal spaces between spans; the smoke test uses `toContainText`, which the first phrase satisfies (the rotation starts 4.2 s after the hero is visible).
9. **Nav links (default): Work, About, Journey, Résumé.** Reason: owner choice. AI engineering (today's third header link, decision O8) moves to the phone menu and the footer Pages list (umbrella R1), which keeps it one click from every page.
10. **Say hello gets a fourth row, "Use the contact form" to `/contact`.** Reason: owner choice; the contact form is the delivery path with spam protection.
11. **Footer Pages column lists every public page the old site menu linked, plus a "For agents" group; Elsewhere is X, LinkedIn, GitHub.** Reason: the old menu was the only crawl path for crawlers that do not run JavaScript (`components/bento/SiteHeader.tsx`), prerender discovers pages by following links, and the "For agents" row is an owner decision of 09-11-26. Telegram stays out (owner).
12. **Logo strip label "Where I’ve worked"; typographic wordmarks until hi-res SVG wordmarks exist.** Reason: the organisations are employers, a university and his own ventures, not clients; the self-hosted logos are favicon-sized (32 to 128 px).
13. **Testimonial notebook ships hidden until 3 or more owner-cleared quotes exist; never invent quotes.** Reason: none exist anywhere, and the honesty rules forbid invented testimonials (`lib/content/skills.ts`, portfolio and venture rules).
14. **Case media: real screenshots where shareable, otherwise code-drawn illustrations labelled "Illustration".** Reason: only one project has a real screenshot (a capture of today's Home, which must be re-shot after cutover); internal screenshots need redaction (issue #44). A chip on cards, a caption on case pages.
15. **Case pages keep the Hiring block and the evidence rule.** Reason: smoke tests. The template meets the rule by placing `article "Outcome"` and `article "My part"` as full rows above `article "Interface"` (the cover), estimated to end near y 920 at 1440x900, well inside 1,350 (section 9.1). The Hiring panel keeps its exact name and links.
16. **Fonts self-hosted as woff2 with their OFL licence files.** Reason: the repo self-hosts and never loads Google Fonts at runtime. Thai falls back to Noto Sans Thai for body and display; Noto Serif Thai is evaluated for Thai headings in phase 7; JetBrains Mono has no Thai. The font guard changes deliberately: the allowed set becomes Onest, Instrument Serif, JetBrains Mono, Patrick Hand, Noto Sans Thai and their fallbacks; "Instrument Serif" leaves the retired list; Inter stays banned; the alias ban on `--font-serif` stays (section 3.1 naming). OG images bundle Geist TTFs (`lib/og/fonts.ts`); phase 8 decides their faces.
17. **Custom cursors are our own drawings and apply to pills too.** Reason: the reference's files are not ours to copy, and its pills lost the cursor (section 6.9).
18. **404 and error pages keep the site's own StatusPage, restyled.** Reason: tests (status 404, h1 "Nothing lives here.", `nav "Recovery links"` with 4 links, no links to `/blog` or `/press`); the reference had a stock 404.
19. **Case pages keep their JSON-LD** (CreativeWork or SoftwareApplication with Offer, plus BreadcrumbList). Reason: SEO and the parity gate compares JSON-LD.
20. **No figure, outcome, client or quote appears unless it is already in `lib/content` or the owner clears it.** Reason: content-claim audits scan every source file (`lib/content/portfolioOutcomes.test.ts`, `ventureCase.test.ts`, `resumeFacts.test.ts`). New components read figures from the modules and never retype them; the user count reads "1,000 registered users"; GoGoCash totals carry "As of October 2026".
21. **Token delivery before cutover.** Reason: every merge to `main` deploys production, and names collide with live values. Scoped `data-design="profile"` block (section 2.13).
22. **Naming collisions.** Reason: guards and Tailwind defaults. Banned substrings (`--color-accent`, `--color-muted`, `--font-serif` and the others in section 2.12); Tailwind's `--ease-out`, `--ease-in-out`, `--radius-sm/md/lg` and `md` breakpoint are not overridden; the repo's `--ease-soft` is a different curve (section 2.9); new keyframes start with `kj-`.
23. **Guard tests that change, each with the owner decision recorded in the phase plan:** the palette pins and theme-color pins in `globals.test.ts` (phase 6), the font set (phase 0, when fonts are added), the view-transition lines (phase 1), the motion guard widened (phase 0), the contrast parser and pairs (phase 0), `sharedPrimitives.test.ts` strings (phase 6 or 7 as primitives are replaced), the class and structure assertions in about 20 component test files, and the smoke header-geometry test (Primary nav visible from 810, not 1024; no header email link or Share button; header 48 px tall) at cutover.
24. **Breakpoint `tablet` at 810.** Reason: redefining Tailwind's `md` would move 9 live components (section 4.1).
25. **Header and footer anatomy.** Reason: tests, print and the root guard. `header[data-site-chrome]` is the 48 px fixed bar (the "one row under 60 px" check stays meaningful); `data-site-chrome` stays on header and footer so print and the résumé PDF hide them; the shell stays in `LandingLayout` with `landing-root` and the skip link to `#main` (guarded).
26. **Accessible names kept**: `nav "Primary"`, `nav "Site"` with `id="site-menu"`, buttons "Open menu" and "Close menu", `section[aria-labelledby="hero-title"]` on every hero, and the article names "Selected work", "Outcome", "My part", "Interface", "Hiring". Reason: smoke and component tests.
27. **Share (not in the owner's list; owner to confirm).** The reference has no share control; today the header has a Share button, seven heroes have a Share pill, and the `/skills` pill is pinned at 56x56 under 640 (#119). Default (ours): the header Share button retires with the old header (no room in the pill nav); case heroes keep a ghost `sm` Share pill beside the external link, opening the existing share rows in a popover shaped like Say hello; phase 7 pages keep their pills and the 56 px rule.
28. **Intro sequencing and stacking.** Reason: the 5.2 s intro is kept (owner, #118). The hero entrance and rotation wait for it (section 5.6); the overlay (z 100) covers the nav (z 80).
29. **Floating pill nav reversal.** The owner retired a floating pill nav on 09-11-26 (phase 7 bento redesign); the 18-11-26 choice of the reference format brings a fixed pill nav back. Record it in the phase 1 plan.
30. **"Mobile as a miniature desktop"** (AGENTS.md owner preference) differs from the reference's phone layouts (compact cards, hidden chips and summaries). The reference's phone rules are followed here because the owner chose its format; confirm at the phase 2 review.
31. **Preview routes.** `/preview/*` pages are `noindex, nofollow`, unlinked, out of the sitemap, `llms.txt` and text endpoints, not in the parity route list, and deleted after cutover.
32. **Pages not yet restyled after cutover.** The fixed nav overlays content, so page bodies on the old layout need a `var(--nav-h)` top offset until phase 7 restyles them. Old bodies keep the old tokens (they read live role values outside the scope), so Instrument Serif never lands on old 600-weight headings.
33. **Recruiter-fit phase 4** (planned) rewrites the "Founder" framing on About, the venture pages ("My role"), FAQ and JSON-LD. Sequence it before phases 3 and 5 copy work, or fold it in, to avoid two baseline and parity churns.
34. **Budgets.** New scripts (nav, popover, reveal, rotation, mock, stack depth, orbit, notebook, lightbox, rail) stay small; the notebook, orbit and lightbox load on demand; no content module is imported from a route `head()` or the root (it would land in the entry chunk). Measure after phases 2 and 3 with `pnpm perf:budget`.
35. **Cutover gates.** Visual baselines (96, Linux container) refresh at phase 6 for every route, because the shell changes site-wide, and again per page in phase 7. Parity is re-crawled with `PARITY_SEEDS` and the added and removed URLs counted; the intended differences at cutover are limited to head tags (the theme-color metas, and font preloads if the normaliser keeps them) and the manifest body, because h1s, titles, descriptions and JSON-LD stay.
36. **knip.** Components replaced at cutover are deleted in the same PR; phase 8 removes old keyframes (with the `kj-rise` guard line), old tokens and the scope attribute.
37. **Manifest and OG.** `manifest.webmanifest` colours are `#000000` today; they move to the palette at cutover. OG cards and icons read the hand-kept mirror `lib/brand/tokens.ts`; phase 8 updates it and the OG fonts.
38. **Hidden pages.** No link to `/blog` or `/press` anywhere while they are hidden (tests on Home, the header and the 404).

Unresolved from the sources (each marked in place): the bento column count between 640 and 1023; the word-mark hide point after 55%; the hero layout between 810 and 1279 and the mock's inner sizes (approximate); dark values of `--dusk`, `--sunset-strong`, the notebook and the deep tile tone; stops of the journey washes, notebook cover and stats tile; the dither algorithm and cell size; the dotted-canvas tokens; the Home scrollspy thresholds; the orbit spin rate; stack-title clamp bounds; pill and chip paddings (approximate); the records-card padding and type sizes; the ghost-pill hover duration; whether "ease-out" and "ease-in-out" in transitions meant the tokens (read as tokens here).

---

## 14. Component-to-phase map

Phases 0 to 5 build on hidden `/preview/*` routes. "Repo files touched" lists the main existing files, not every new one.

| Phase | Builds | Preview route | Repo files touched (main) |
|---|---|---|---|
| 0 Foundation | fonts (woff2, OFL files, fallbacks, preloads); scoped token block light and dark; Tailwind names; type classes; `@property` registrations; keyframes; primitives: Pill (variants, ring, swap arrow, card CTA arrow), Chip, Badge, Illustration chip, EyebrowRow, Tile, StatusDot, Dot, PxMark, PxDot, word-stamp mark, Reveal, DitherCanvas, MotionToggle, card link pattern, cursors, focus and selection, link style | `/preview/primitives` | `src/styles/globals.css`, `src/styles/fonts.css`, `src/fonts/`, `src/routes/__root.tsx` (preloads, scope attribute), `lib/design/globals.test.ts`, `lib/design/contrast.test.ts` |
| 1 Shell | SiteNav (pill, Primary links, name mark, active pill, scrollspy, hide on scroll); Say hello popover with four rows; ThemeToggle (fade) and phone ThemeSwitch; PhoneMenu `#site-menu`; SiteFooter (sheet, dither, CTA, card with Pages, For agents, Elsewhere, status line, copyright; pixel illustrations); skip link above the nav; `scroll-padding-top`; z-index scale; theme-color follow | `/preview` layout | `components/landing/LandingLayout.tsx`, `components/ThemeToggle.tsx`, `lib/content/landing.ts` (new nav list) |
| 2 Hero and logo strip | HeroStage (sheet, sky, chips, h1 rotation and stamp, lead, actions, motion toggle); intro sequencing (pre-paint script, `data-intro`); CanvasMock (desktop, phone carousel and pager); LogoStrip (marquee, reduced-motion wrap) | `/preview/home` | `components/landing/IntroLoader.tsx` (sets `data-intro`), `lib/content/landing.ts` (alternates, wordmarks) |
| 3 Work stack and about bento | WorkStack (`article#work`, sticky cards, materials, depth, focus restore, evidence line, ventures group with `id="ventures"`); StackCard; AboutBento (Brief, Mess, Stats, Scene, four tiles) | `/preview/home` | `lib/content/portfolio.ts` (read only), `lib/content/aboutPage.ts` (read only) |
| 4 Journey and notebook | Journey (stage, washes, ToolOrbit with drag and spin, Story, RecordsCard); Notebook (spread, pages, flip, cast, autoplay, countdown, drag, controls, live region) behind the 3-quote rule; `lib/content/testimonials.ts` (empty) | `/preview/home` | `lib/content/stack.ts`, `lib/landing/experience.ts` (read only) |
| 5 Case-study template | CaseHero (sky, back link, eyebrow, h1, lead, external and Share pills); evidence rows; CaseCover (`article "Interface"`, Illustration caption); CaseMeta and venture metrics `dl`; CaseBody, CaseRail and phone contents; CaseChapter, Kicker, FactStrip, PointList; ShowcaseGrid, ShowcaseTile, captions, tile buttons; ShowcaseLightbox; HiringPanel; MoreProjects; JSON-LD unchanged | `/preview/portfolio/$slug`, `/preview/ventures/$slug` | `components/landing/portfolio/*`, `components/landing/discovery/*` (read; replaced at cutover) |
| 6 Cutover | Home and case routes render the new components; the shell goes site-wide; theme-color metas, manifest colours; parity re-crawl; baseline refresh; smoke test rewrites (header geometry, nav); old Home and case components deleted (knip) | none | `src/routes/_landing/index.tsx`, `src/routes/_landing/portfolio/$slug.tsx`, `src/routes/_landing/ventures/$slug.tsx`, `lib/seo/rootMetadata.ts`, `lib/seo/manifest.ts`, `tests/e2e/*`, `tests/fixtures/site-parity.json` |
| 7 Remaining pages | About, Contact, Portfolio index (`article "{name}"` cards with first outcomes), Résumé (print stays plain, PDF 2 pages), Skills and Skill (56 px Share rule), Learn, Examples, Stack, Proof, Build, Topic hubs EN and TH (Noto Serif Thai decision), StatusPage for 404 and errors, `/design`; hidden Blog and Press | none | page components under `components/landing/**`, `components/resume/*`, `components/system/DesignSystemPage.tsx` |
| 8 Cleanup and guardrails | fold the scope into `:root` and `.dark`; delete old tokens, keyframes and components; widen guards (motion, raw hex, type floor, contrast pairs); OG fonts and `lib/brand/tokens.ts`; retire Tailwind `md` if unused; docs (README, AGENTS.md), baseline tolerance review | none | `src/styles/globals.css`, `lib/design/*.test.ts`, `lib/og/*`, `lib/brand/tokens.ts` |

---

## 15. Content slots

"Owner input" means nothing in `lib/content/` holds it today; the phase that needs it asks the owner and adds the cleared text to the named module. Figures are always read from their module, never retyped.

### 15.1 Chrome

| Slot | Needs | Source |
|---|---|---|
| Nav avatar | portrait, 32 px | `hero.portraitSrc` (`lib/content/landing.ts`, `/profile-portrait.webp`) |
| Nav name | first name and surname | `PERSON_NAME` (`lib/content/identity.ts`) |
| Nav links | Work, About, Journey, Résumé | new list in `lib/content/landing.ts`; Résumé uses `RESUME_HREF` (`lib/content/availability.ts`) |
| Say hello label | "Say hello" | `place.cta.label` (`lib/content/landing.ts`) |
| Popover label | one short line | owner input (the Contact page card title "Email me directly" in `lib/content/contact.ts` fits) |
| Popover address | email | `site.email` (`lib/content/landing.ts`) |
| Popover rows | Copy email, Copied, Gmail, mail app, contact form | microcopy (repo "Copy email" and "Copied"); `/contact` |
| Theme labels | toggle and switch | today's `components/ThemeToggle.tsx` labels; "Light", "Dark" |
| Footer eyebrow, headline, two paragraphs | short copy, last sentence emphasised | owner input (candidates: `place.body` in `lib/content/landing.ts`, `OPEN_TO_ROLES.sentence`) |
| Footer status line | availability label | `OPEN_TO_ROLES.pill` (`lib/content/availability.ts`) |
| Footer Pages | all public pages the old menu linked | `siteMenu` and `footerLibrary` (`lib/content/landing.ts`) |
| Footer For agents | four files | `footerAgents` (`lib/content/landing.ts`) |
| Footer Elsewhere | X, LinkedIn, GitHub | `socials` (`lib/content/landing.ts`) |
| Footer illustrations | two pixel subjects | owner input |
| Copyright | "© {year} Kunanon Jarat · Bangkok" | today's `components/bento/SiteFooter.tsx` string |

### 15.2 Hero and canvas mock

| Slot | Needs | Source |
|---|---|---|
| Chips | label, roles, location | `OPEN_TO_ROLES.pill.label`, `.roles`, `.location` (`lib/content/availability.ts`) |
| H1 line 1 | "Hi, I’m Kunanon Jarat." | `hero.greeting`, `hero.name` (`lib/content/landing.ts`) |
| H1 phrase 1 | "Forward deployed AI engineering from Bangkok." | `hero.headline` and `hero.headlineAccent` (`lib/content/landing.ts`) |
| H1 alternates | one or more short lines, owner-approved | owner input (new field in `hero`); no rotation until then |
| Lead | one or two sentences | `hero.homeLead` (`lib/content/landing.ts`, built from `CURRENT_ROLE`) |
| Actions | Contact me, Résumé | `hero.primaryCta`, `hero.resumeCta` (`lib/content/landing.ts`) |
| Mock breadcrumb | wordmark and section | `site.wordmark` (`lib/content/landing.ts`) and "Selected work" |
| Mock frames and Layers | three projects | `getFeaturedPortfolioProjects()` (`lib/content/portfolio.ts`; owner default order) |
| Mock thumbnails | screenshot or textless illustration | `cover` or `mockup` (`lib/content/portfolio.ts`) |
| Mock inspector | role, category | `role`, `category` (`lib/content/portfolio.ts`) |
| Mock comment | first cleared outcome, else tagline | `outcomeLine()`, `outcomes`, `tagline` (`lib/content/portfolio.ts`) |
| Mock cursor name | a short label | owner input (default "You") |
| Logo strip label | "Where I’ve worked" | the brief; add to `lib/content/landing.ts` |
| Logo strip names | 6 to 8 organisations | owner picks from the organisations in `lib/content/resumeTimeline.fallback.ts` and `lib/content/companyLogos.ts` (cleared 10-11-26) |
| Hi-res SVG wordmarks | vector files | owner input (later) |

### 15.3 Work stack

| Slot | Needs | Source |
|---|---|---|
| Eyebrow | "Selected work" (the `article` name a smoke test reads) | `portfolioPage.title` (`lib/content/portfolio.ts`) |
| H2 and lead | two-line headline, one-line lead | owner input (candidate: `portfolioPage.headline` in `lib/content/portfolio.ts`) |
| Which cases, in what order | list | default `FEATURED_PORTFOLIO_SLUGS` then the two ventures; owner may add the other projects |
| Project cards | name, category, period, tagline, first outcome, media, slug | `lib/content/portfolio.ts` |
| Ventures heading | eyebrow, heading, subheading | `ventures.eyebrow`, `.heading`, `.subheading` (`lib/content/landing.ts`) |
| Venture cards | title, summary, evidence item, link label, href | `ventures.cards` (`lib/content/landing.ts`); metrics from `lib/content/ventures.ts` |
| Venture media | product screenshots | owner input (his own products; shareable?), else code-drawn illustration |

### 15.4 About bento

| Slot | Needs | Source |
|---|---|---|
| Eyebrow, H2, lead | short copy | owner input (candidates: `aboutPage.hero` in `lib/content/aboutPage.ts`) |
| Brief tile | one or two paragraphs | `aboutPage.story` (`lib/content/aboutPage.ts`) |
| Mess tile chips | five short labels | owner input (candidate: the five project categories in `lib/content/portfolio.ts`) |
| Mess tile line | one italic line | owner input |
| Stats tile | three figures with labels, a footnote | owner input on which; read from `lib/content/ventures.ts` metrics, `lib/content/portfolio.ts` outcomes, or counts of content |
| Scene tile and caption | animation and chip text | owner input (candidate: the Bangkok scene with `place` copy and the Bangkok clock) |
| Four tiles | title and text each | `aboutPage.principles` (`lib/content/aboutPage.ts`) |

### 15.5 Journey

| Slot | Needs | Source |
|---|---|---|
| Eyebrow, H2, lead, pill label | short copy | owner input ("Journey" from the nav) |
| Orbit tools | names and kinds | `stackItems` and `STACK_GROUPS` (`lib/content/stack.ts`); icon ids in `lib/content/stackIcons.ts` |
| File tiles | four file types | owner input (decorative) |
| Story paragraphs and bold phrases | two paragraphs | `aboutPage.story` (`lib/content/aboutPage.ts`); which phrases are bold: owner input |
| Roles sought | h3, paragraph, chips | heading: owner input; `OPEN_TO_ROLES.sentence`, `.roles`, `.location` (`lib/content/availability.ts`) |
| Records card | experience and education rows | `RESUME_TIMELINE_FALLBACK` (`lib/content/resumeTimeline.fallback.ts`) through `homeExperience()` and `compactPeriod()` (`lib/landing/experience.ts`); how many rows: owner input (default 4) |

### 15.6 Notebook

| Slot | Needs | Source |
|---|---|---|
| Quotes | 3 or more: quote, name, role, organisation, initials, cleared date (dd-mm-yy) | owner input; new `lib/content/testimonials.ts`, empty until cleared |
| Section eyebrow, h2, cover lines, carousel label | short copy | owner input |

### 15.7 Case pages

| Slot | Needs | Source |
|---|---|---|
| Back link | label and target | section 9.2 |
| Eyebrow | category and period; "Venture" and timeline | `category`, `period` (`lib/content/portfolio.ts`); `caseStudy.timeline` (`lib/content/ventures.ts`) |
| H1 | name and tagline, exact | `name`, `tagline` (both modules) |
| Lead | one or two sentences | `summary` (`lib/content/portfolio.ts`); `caseStudy.intro` (`lib/content/ventures.ts`) |
| External link | URL and label | `url`, `urlLabel` (public projects; ventures) |
| Outcome row | cleared outcomes | `outcomes` with `outcomeLine()` (`lib/content/portfolio.ts`) |
| My part row | one sentence | `myPart` (`lib/content/portfolio.ts`); ventures: the "My role" section in `caseStudy.sections` |
| Cover | screenshot or illustration | `cover` or `mockup` (`lib/content/portfolio.ts`); ventures: owner input |
| Meta row | four items | `role`, `organization`, `period`, `access`; ventures `role`, `year`, `status`, `offer.label` |
| Venture metrics | value, label, as-of month | `metrics` (`lib/content/ventures.ts`) |
| Chapters | headings and prose | `sections`, `highlights`, `beforeAfter`, `workflow`, `architecture`, `stack`, `gallery` (`lib/content/portfolio.ts`); `caseStudy.sections`, `loop`, `stack` (`lib/content/ventures.ts`) |
| Chapter headlines | optional `t-h3` lines | owner input |
| Showcase captions | title and line per tile | derived from `workflow.title` and the architecture layers; other captions owner input |
| Hiring panel | kicker, line, sentence, links | `portfolioPage.hire` (`lib/content/portfolio.ts`); `OPEN_TO_ROLES.sentence`; `RESUME_HREF`, `HIRING_CONTACT_HREF` (`lib/content/availability.ts`) |
| More projects | next two cases | `lib/content/portfolio.ts` list order; `lib/content/ventures.ts` |
| JSON-LD | unchanged | `lib/seo/portfolioJsonLd.ts`, `lib/seo/jsonLd.ts` |
| Site case cover | new screenshot after cutover | owner action (today's image shows the old Home) |

### 15.8 Not-found and error pages

| Slot | Needs | Source |
|---|---|---|
| Eyebrow, h1, lead, recovery links, report card | existing copy | `components/NotFound.tsx` and `components/landing/StatusPage.tsx` |
