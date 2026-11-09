# Phase 7 design spec: bento canvas to live site

**Created:** 09-11-26
**Feature:** tanstack-migration (Phase 7, `active/phase-7_bento-redesign_PLAN_09-11-26.md`)
**Source:** Design canvas "KunanonJ bento site", https://claude.ai/artifact/X9f4PqkFMM4sxCw3pnDeNu (version `1794224603-99c8`, read 09-11-26).
**Status:** Reference (read-only extraction). Nothing here is implemented yet.

## 0. How the canvas is built (read this first)

- 20 page sources: `project/<Page>.dc.html` (Main, About, Contact, Resume, Portfolio, Project, Venture, Skills, Skill, Learn, Examples, Stack, Proof, Build, Topic, TopicTh, Blog, Post, Press, NotFound).
- Every other artboard (`<Page>-night`, `-tablet`, `-fold`, `-fold-cover`, `-phone`, `-phone-night`) is an 800-byte wrapper that `dc-import`s the page at a fixed width, with `dark="{{ true }}"` for night. So there is ONE layout per page; the frames only prove the breakpoints. Frame widths: desktop 1440, tablet 768, foldable open 673, phone 390, foldable cover 344.
- The `<helmet><style>` block (tokens, motion, breakpoints) is byte-identical across all 20 pages. Header, footer and the root wrapper are identical across pages except which menu row carries `aria-current="page"`. Only TopicTh adds Noto Sans Thai to the font link and sets `<html lang="th">` plus `font-family: 'Geist', 'Noto Sans Thai', ...` on `<main>`.
- Theme is a `dark` boolean prop that adds `.dark` to the `.kj` root. In the site this becomes `html.dark` via next-themes (`attribute="class"`, already wired in `src/routes/__root.tsx`).
- All styling is inline `style=""` plus the shared helmet CSS. Breakpoint rules use `!important` to beat the inline styles; in Tailwind these become responsive variants, not `!important`.
- Images are canvas blobs. They map to repo assets: headshot = `public/profile-portrait.webp` (or `public/profile.jpg`), GoGoCash = `public/brand/gogocash.svg`, Manut = `public/brand/manut-144.webp`, Resume logos = `lib/content/companyLogos.ts` (`public/brand/companies/*.webp`).
- Local copies used for this extraction: `<scratchpad>/artifact-files/f4279079-620d-4c86-816c-0cef1a268dba/project/` (re-read with the Artifact tool, `action: "read"`, `path: "project/<Page>.dc.html"`).

---

## 1. Tokens

### 1.1 Canvas variables (verbatim)

```css
.kj{--page:#f5f6fa;--surface:#ffffff;--tint:#e8ebff;--ink:#0b0d17;--ink2:#565b70;--muted:#80859b;--hair:rgba(11,13,23,.08);--hair2:rgba(11,13,23,.16);--signal:#2b3bff;--ember:#ff5a1f;--cta:#0b0d17;--oncta:#ffffff;--map:#d5d8e3;--river:#c9cefc;--shadow:0 1px 2px rgba(11,13,23,.04),0 16px 40px -16px rgba(11,13,23,.12);--pop:0 24px 60px -24px rgba(11,13,23,.28);--onphoto:#ffffff;--onphoto2:rgba(255,255,255,.74);--glass:rgba(255,255,255,.14);--glass2:rgba(255,255,255,.26);--water2:#232a3f;--glowop:.6;--starop:0;--sheen:rgba(255,255,255,.5);--ease:cubic-bezier(.2,.8,.2,1);--spring:cubic-bezier(.34,1.56,.64,1)}
.kj.dark{--page:#0b0d17;--surface:#151829;--tint:#1d2136;--ink:#e8ebff;--ink2:#a1a6bd;--muted:#7d83a0;--hair:rgba(232,235,255,.08);--hair2:rgba(232,235,255,.16);--signal:#8e97ff;--cta:#e8ebff;--oncta:#0b0d17;--map:#2a2f48;--river:#2b3a8f;--shadow:none;--pop:0 24px 60px -24px rgba(0,0,0,.6);--water2:#070a18;--glowop:1;--starop:.85;--sheen:rgba(255,255,255,.08)}
a{color:var(--signal)}a:hover{color:var(--ink)}
.kj :focus-visible{outline:2px solid var(--signal);outline-offset:3px}
```

Night keeps `--ember`, `--onphoto`, `--onphoto2`, `--glass`, `--glass2`, `--ease`, `--spring` from day.

### 1.2 Mapping to `src/styles/globals.css`

| Canvas | Day | Night | Site role today | Verdict |
|---|---|---|---|---|
| `--page` | #f5f6fa | #0b0d17 | `--page` (same both themes) | Reuse |
| `--surface` | #ffffff | #151829 | `--surface` | Reuse |
| `--tint` | #e8ebff | #1d2136 | `--surface-tint` | Reuse |
| `--ink` | #0b0d17 | #e8ebff | `--ink` | Reuse |
| `--ink2` | #565b70 | #a1a6bd | `--ink-2` | Reuse |
| `--hair` / `--hair2` | rgba(11,13,23,.08/.16) | rgba(232,235,255,.08/.16) | `--hairline` / `--hairline-strong` | Reuse |
| `--signal` | #2b3bff | #8e97ff | `--link` and `--focus` (identical values) | Reuse for links/focus. Canvas ALSO uses it for marker squares, timeline dots, heatmap, the hero accent line, the copied check. Site `--color-signal` is the palette (#2b3bff in both themes, "art only"). **NEW role needed**: `--accent` (day #2b3bff, night #8e97ff) so markers follow the theme; point `--link`/`--focus` at it. |
| `--ember` | #ff5a1f | #ff5a1f | `--ember` | Reuse. Note: 2.89:1 on light `--page`; canvas only places Ember squares on `--surface` (pass) or with a text label. |
| `--cta` / `--oncta` | #0b0d17 / #ffffff | #e8ebff / #0b0d17 | `--action` / `--on-action` = Signal #2b3bff / Paper in BOTH themes | **CONFLICT.** Canvas primary buttons, pressed chips and active segments are ink-inverse, not Signal blue. Either redefine `--action`/`--on-action` (also used by `::selection` and `lib/design/contrast.test.ts` pairs) or add `--cta`/`--on-cta`. Canvas has no hover colour for CTA (hover = lift + `--pop`), so `--action-hover` has no canvas value. Contrast: 19.37:1 day, 16.38:1 night. |
| `--muted` | #80859b | #7d83a0 | none | **NEW** (`--ink-3`). Used only for the muted words inside display `h1`s and one Stack bar. 3.38:1 on day page (passes 3:1 large text only); add a contrast-test pair restricted to display sizes. |
| `--shadow` | `0 1px 2px rgba(11,13,23,.04),0 16px 40px -16px rgba(11,13,23,.12)` | `none` | `--elev-card` (3 layers incl. a Signal-tinted 40px layer; none in dark) | **CHANGE** `--elev-card` to the canvas value. |
| `--pop` | `0 24px 60px -24px rgba(11,13,23,.28)` | `0 24px 60px -24px rgba(0,0,0,.6)` | none | **NEW** (`--elev-pop`: panels, hover lift, social pill). |
| `--map` | #d5d8e3 | #2a2f48 | none | **NEW** art-only (map strokes in Blog/Post banner art, Venture related-topics art). |
| `--river` | #c9cefc | #2b3a8f | none | **NEW** art-only (pixel squares in Press/404, river strokes in Blog/Post/Learn/Venture art). |
| `--onphoto` / `--onphoto2` | #ffffff / rgba(255,255,255,.74) | same | none | **NEW** (text on the Bangkok scene). |
| `--glass` / `--glass2` | rgba(255,255,255,.14) / .26 | same | none | **NEW** (glass badge, glass button, divider on the scene). |
| `--water2` | #232a3f | #070a18 | none | **NEW** (Bangkok card base colour under the SVG). |
| `--glowop` / `--starop` | .6 / 0 | 1 / .85 | none | **NEW** scalars for scene glow and stars. |
| `--sheen` | rgba(255,255,255,.5) | rgba(255,255,255,.08) | none | **NEW** (card hover sheen). |
| `--ease` | cubic-bezier(.2,.8,.2,1) | same | `--ease-smooth` = cubic-bezier(0.22,1,0.36,1) | **NEW** (`--ease-out-soft` or replace `--ease-smooth`; do not name it `--ease-out`, Tailwind owns that). |
| `--spring` | cubic-bezier(.34,1.56,.64,1) | same | none | **NEW**. |
| (unused by canvas) | | | `--surface-warm`, `--well`, `--action-hover`, `--error-text`, `--success-text` | Canvas errors are an Ember square + ink text; success is a Signal check icon. Keep the roles for the API error states the canvas does not draw (see 6). |

Scene art colours (Bangkok SVG, raw hex today, must become tokens or the raw-hex ratchet `lib/design/rawHex.test.ts` (MAX 0 for `components/landing`, `src/routes`) fails): sky day `#56648f -> #a9a3bb -> #e9c39b`, sky night `#0d1230 -> #2b2f5a -> #7a5a74`, water day `#5c6584 -> #232a3f`, water night `#1d2244 -> #070a18`, gold `#5e3a1e #c8904a #f4d391 #c8904a #55341b`, temple base `#7a5636`, doors `#3a2414`, bands `#f6dc9c`, spire `#e9c27a`, finial stroke `#f3d79a`, lights `#fff1c4`, trees `#121619`, bank `#1c1d26`, boat `#2b1d18 #b8322a #3a2a24`, halo `rgba(255,196,120,.55)`, skyline mist `rgba(34,38,64,.55)`, reflections `rgba(240,192,112,.42/.3)`, scrim `rgba(9,11,24,.9/.64/0)`. Also `background: #ffffff` behind the GoGoCash logo in the Venture h1.

### 1.3 Radii

| Value | Used for | Site today |
|---|---|---|
| 28px | every bento card, hero photo panel, Portfolio filter bar container, prev/next nav cards | `--radius-card: 24px` -> change to 28 or add |
| 24px | share panel, site menu, Learn language group | `--radius-panel: 32px` -> add 24 |
| 22px | Venture loop group and dial well | add or fold into 20/24 |
| 20px | inner wells (figures, persona/metric tiles, meta strip, SKILL.md box, mockup frame, skill cards inside stage grids) | none (new `--radius-well`) |
| 18px | code rows, blog post rows, venture filter rows | none |
| 16px | inputs/textarea, Venture loop step buttons | `--radius-input: 12px` -> change |
| 14px | menu and share rows (`.kj-row`) | none |
| 12px | header logo tile | none |
| 999px | every chip, pill, button, segmented control, search input | `--radius-chip: 8px` -> canvas chips are full pills; add `--radius-pill` |
| 2px | heatmap cells | none |

### 1.4 Spacing

- Page column: `max-width: 1000px; margin: 0 auto; padding: 40px 24px 96px; gap: 56px` (`.kj-col`). At <=380px: side padding 16px, gap 44px.
- `main`: flex column, gap 56px. Hero section gap 24px (36px on Home).
- Bento gap 20px; skill-card grids gap 12px; `bento-2` gap 20px (12/16px inside cards, 32/40px column-gap for two-column lists).
- Card padding `18px 20px 20px` (variants `18px 20px 12px|16px|24px|28px`, Skill cards `18px 16px 16px`). Card internal gap 10/12/14/16/18/20px.
- Card min-heights used: 290 (default row), 280/300/320/340 (hub/topic cards), 240 (Post footer pair), 160 (prev/next), 112 (Skill prev/next), 104 (persona tile), 120 (metric tile).
- Touch targets: every interactive element `min-height: 44px` (rows 44-60px, CTAs 56px, icon buttons 48px, 44px at <=380px).

### 1.5 Type scale (canvas values)

| Role | Size / line-height / tracking / weight | Site token |
|---|---|---|
| Home h1 | `clamp(36px, 5.6vw, 64px)` / 1.14 / -0.04em / 600 | `--text-h1` is `clamp(2.75rem, 2.1rem + 2.6vw, 4rem)` / 1.02 / 700 -> change or add `--text-display` |
| Page h1 | `clamp(36px, 5vw, 56px)` / 1.12 / -0.04em / 600 (TopicTh `clamp(32px, 5vw, 56px)`) | same as above |
| Bangkok title | `clamp(40px, 4.6vw, 52px)` / 1.05 / -0.035em / 600, preceded by "Based in" 24px/1.2/-0.01em/400 | new |
| Stat / big number | 40px / 1.05 / -0.03em / 600, `tabular-nums` (Learn language code 64px) | `--text-stat` clamp(2.75-4rem) -> change |
| Section-in-card title (h2/h3 in cards) | 20-24px / 1.2-1.3 / -0.02em / 600 (Stack `clamp(28px,3.6vw,40px)`, Blog cornerstone `clamp(24px,3vw,30px)`, Learn hubs `clamp(22-26px)`, `clamp(24-30px)`, `clamp(26-34px)`) | `--text-h3` close |
| Lead | 18px / 1.5-1.55 / ink2, max-width 470-620px | `--text-lead` ok |
| Body | 15px / 1.5-1.6 (long-form Post 17px / 1.7) | `--text-body` is 16-17px -> body in cards is smaller |
| Row title | 15-16px / 500 | |
| Small / meta | 13-14px / 500 | `--text-small` 14px |
| Kicker chip (card h2) | 13px / 500 | |
| Mono label | Geist Mono 12px, `letter-spacing: .06em`, uppercase, ink2 | `--text-label` ok |
| Mono numerals/indexes | Geist Mono 12-13px | |
| Header "K" | 21px / 700 / -0.02em | |

Floor: nothing below 12px (meets `lib/design/typeFloor.test.ts`). Weights used: 400, 500, 600, 700.

### 1.6 Fonts

`Geist:wght@400;500;600;700`, `Geist+Mono:wght@400;500`; Thai pages add `Noto+Sans+Thai:wght@400;500;600;700`. Stack `'Geist', system-ui, sans-serif`; mono `'Geist Mono', monospace`; Thai `'Geist', 'Noto Sans Thai', system-ui, sans-serif` with `line-height: 1.4` on Thai display text and 1.75 on Thai body, `letter-spacing: normal`. Root: `-webkit-font-smoothing: antialiased`. Site already self-hosts these (`src/fonts`, `--font-geist-sans`, `--font-geist-mono`, `--font-noto-thai`); keep self-hosting, do not add the Google Fonts link.

---

## 2. Motion system

### 2.1 CSS (verbatim from the shared helmet)

Global transitions and press feedback:

```css
.kj button{font:inherit;cursor:pointer}
.kj .kj-row:hover{background:var(--page)}
.kj .kj-icon:hover{border-color:var(--hair2)}
.kj,.kj *{transition-property:background-color,border-color,color,fill,stroke,box-shadow;transition-duration:.4s;transition-timing-function:cubic-bezier(.2,.8,.2,1)}
.kj-vt .kj,.kj-vt .kj *{transition:none !important}
.kj a,.kj button{transition:transform .35s var(--spring),background-color .3s var(--ease),color .3s var(--ease),border-color .3s var(--ease),box-shadow .35s var(--ease),opacity .3s var(--ease)}
.kj a:active,.kj button:active{transform:scale(.97)}
.kj .kj-row{transition:background-color .25s var(--ease),transform .4s var(--ease)}
.kj .kj-row:hover{transform:translateX(4px)}
.kj .kj-icon:hover{transform:translateY(-2px)}
.kj .kj-icon svg{animation:kj-spin .6s var(--spring) backwards}
```

Panel pop and menu stagger:

```css
.kj #share-panel,.kj #site-menu{transform-origin:top right;animation:kj-pop .42s var(--ease) backwards}
.kj #site-menu .kj-row{animation:kj-in .5s var(--ease) backwards}
.kj #site-menu .kj-row:nth-child(2){animation-delay:.03s}.kj #site-menu .kj-row:nth-child(3){animation-delay:.06s}.kj #site-menu .kj-row:nth-child(4){animation-delay:.09s}.kj #site-menu .kj-row:nth-child(5){animation-delay:.12s}.kj #site-menu .kj-row:nth-child(n+6){animation-delay:.15s}
```

Page entrance (header drop, section rise, h1 line reveal, bento stagger):

```css
.kj header{animation:kj-drop .8s var(--ease) backwards}
.kj main > :not(:has(.bento)){animation:kj-rise .9s var(--ease) backwards}
.kj main > :nth-child(2){animation-delay:.1s}.kj main > :nth-child(3){animation-delay:.2s}.kj main > :nth-child(n+4){animation-delay:.3s}
.kj h1 > *{animation:kj-line 1s var(--ease) backwards}
.kj h1 > :nth-child(2){animation-delay:.1s}.kj h1 > :nth-child(3){animation-delay:.2s}.kj h1 > :nth-child(n+4){animation-delay:.3s}
.kj h1 img{transition:transform .6s var(--spring)}.kj h1 img:hover{transform:rotate(-8deg) scale(1.12)}
.kj .bento > *,.kj .bento-2 > *{animation:kj-rise .9s var(--ease) backwards}
.kj .bento > :nth-child(1){animation-delay:.16s}.kj .bento > :nth-child(2){animation-delay:.24s}.kj .bento > :nth-child(3){animation-delay:.32s}.kj .bento > :nth-child(4){animation-delay:.4s}.kj .bento > :nth-child(5){animation-delay:.48s}.kj .bento > :nth-child(6){animation-delay:.56s}.kj .bento > :nth-child(n+7){animation-delay:.64s}
```

Stagger rule in words: header 0s; each direct `main` child that does not contain a `.bento` rises at 0 / .1 / .2 / .3s (capped); each h1 line at 0 / .1 / .2 / .3s; bento children at .16s + .08s per index, capped at .64s from the 7th; `bento-2` children rise with no per-index delay; menu rows .03s apart capped at .15s.

Hover lift and sheen (pointer devices only):

```css
.kj .bento > article::after,.kj .bento-2 > article::after{content:"";position:absolute;top:0;left:0;right:0;bottom:0;border-radius:inherit;pointer-events:none;background:linear-gradient(110deg,transparent 38%,var(--sheen) 50%,transparent 62%);opacity:0;transform:translateX(-70%);transition:transform 1.1s var(--ease),opacity .5s var(--ease)}
@media (hover:hover){.kj .bento > *,.kj .bento-2 > *{transition:transform .55s var(--ease),box-shadow .55s var(--ease),border-color .4s var(--ease),background-color .4s var(--ease)}.kj .bento > :hover,.kj .bento-2 > :hover{transform:translateY(-4px);box-shadow:var(--pop);border-color:var(--hair2)}.kj .bento > article:hover::after,.kj .bento-2 > article:hover::after{opacity:.6;transform:translateX(70%)}.kj a[style*="background: var(--cta)"]:hover{transform:translateY(-2px);box-shadow:var(--pop)}}
```

(The last selector targets CTA links by inline style; implement as a `.btn-cta:hover` class.)

Live dot, Bangkok scene and misc:

```css
.kj .kj-live{animation:kj-pulse 2.4s var(--ease) infinite}
.kj .kj-place{container-type:inline-size}
.kj .kj-place-scrim{background:linear-gradient(90deg,rgba(9,11,24,.9) 0%,rgba(9,11,24,.64) 40%,rgba(9,11,24,0) 72%)}
.kj .kj-place-blur{-webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px);-webkit-mask-image:linear-gradient(90deg,#000 28%,transparent 60%);mask-image:linear-gradient(90deg,#000 28%,transparent 60%)}
.kj .kj-place-art svg{transform-origin:72% 78%;animation:kj-drift 28s ease-in-out infinite alternate}
.kj .kj-clouds{animation:kj-clouds 70s linear infinite alternate}
.kj .kj-halo{animation:kj-breathe 6s ease-in-out infinite}
.kj .kj-stars circle{animation:kj-twinkle 3.4s ease-in-out infinite}.kj .kj-stars circle:nth-child(3n){animation-delay:1.1s}.kj .kj-stars circle:nth-child(3n+1){animation-delay:2.2s}
.kj .kj-boat{animation:kj-boat 22s ease-in-out infinite alternate}
.kj .kj-shimmer{animation:kj-shimmer 7s ease-in-out infinite alternate}
.kj .kj-badge{transition:transform .6s var(--spring)}.kj .kj-place:hover .kj-badge{transform:translateY(-3px) rotate(-6deg)}
.kj .kj-glass:hover{background:var(--glass2) !important;color:var(--onphoto) !important}
.kj .kj-sr{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
@container (max-width:560px){.kj .kj-place-body{min-height:680px !important;justify-content:flex-end !important;padding:24px !important}.kj .kj-place-art{bottom:auto !important;height:64% !important}.kj .kj-place-scrim{background:linear-gradient(0deg,rgba(9,11,24,.96) 0%,rgba(9,11,24,.8) 44%,rgba(9,11,24,0) 74%) !important}.kj .kj-place-blur{-webkit-mask-image:linear-gradient(0deg,#000 26%,transparent 54%) !important;mask-image:linear-gradient(0deg,#000 26%,transparent 54%) !important}}
```

Keyframes:

```css
@keyframes kj-rise{from{opacity:0;transform:translateY(18px) scale(.985);filter:blur(6px)}to{opacity:1;transform:none;filter:none}}
@keyframes kj-line{from{opacity:0;transform:translateY(.3em);filter:blur(10px)}to{opacity:1;transform:none;filter:none}}
@keyframes kj-drop{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:none}}
@keyframes kj-pop{from{opacity:0;transform:translateY(-8px) scale(.96);filter:blur(4px)}to{opacity:1;transform:none;filter:none}}
@keyframes kj-in{from{opacity:0;transform:translateX(10px)}to{opacity:1;transform:none}}
@keyframes kj-spin{from{opacity:0;transform:rotate(-90deg) scale(.6)}to{opacity:1;transform:none}}
@keyframes kj-pulse{0%{box-shadow:0 0 0 0 rgba(255,90,31,.55)}70%{box-shadow:0 0 0 9px rgba(255,90,31,0)}100%{box-shadow:0 0 0 0 rgba(255,90,31,0)}}
@keyframes kj-drift{from{transform:scale(1)}to{transform:scale(1.07) translateX(-1.5%)}}
@keyframes kj-clouds{to{transform:translateX(-70px)}}
@keyframes kj-breathe{0%,100%{opacity:var(--glowop)}50%{opacity:calc(var(--glowop) * .55)}}
@keyframes kj-twinkle{0%,100%{opacity:1}50%{opacity:.25}}
@keyframes kj-boat{to{transform:translateX(-90px)}}
@keyframes kj-shimmer{to{transform:translateX(26px);opacity:.45}}
@keyframes kj-reveal{from{clip-path:circle(0 at var(--vtx,92%) var(--vty,4%))}to{clip-path:circle(150% at var(--vtx,92%) var(--vty,4%))}}
```

Theme-switch reveal (View Transitions):

```css
::view-transition-old(root),::view-transition-new(root){animation:none;mix-blend-mode:normal}
::view-transition-new(root){animation:kj-reveal .8s cubic-bezier(.2,.8,.2,1)}
```

Reduced motion:

```css
@media (prefers-reduced-motion:reduce){.kj *,.kj *::before,.kj *::after{animation:none !important;transition-duration:.01ms !important}::view-transition-new(root),::view-transition-old(root){animation:none !important}}
```

Component-level transitions set inline by the page scripts (all `.15s` unless noted): chip/segment `background-color .15s, color .15s` (plus `border-color` on toggle chips), FAQ icon `transform .2s` (rotate 45deg when open), SKILL.md chevron `transform .15s` (rotate 180deg), Project flow fill `width .2s`, Venture dial `transform .45s cubic-bezier(.2,.7,.2,1)` (rotates +90deg per step forward), contact submit `opacity .15s`.

### 2.2 Durations and easings summary

| Effect | Duration | Easing | Notes |
|---|---|---|---|
| Colour/theme fallback | .4s | `--ease` | every element (`.kj *`) |
| Link/button transform | .35s | `--spring` | press `scale(.97)` on `:active` |
| Row nudge | .4s | `--ease` | `translateX(4px)` |
| Icon button lift | .35s | `--spring` | `translateY(-2px)`; svg spins in .6s on mount/swap |
| Panel pop | .42s | `--ease` | origin top right, blur 4px -> 0 |
| Menu rows | .5s | `--ease` | +.03s per row |
| Header drop | .8s | `--ease` | |
| Section rise | .9s | `--ease` | blur 6px -> 0, scale .985 -> 1 |
| h1 lines | 1s | `--ease` | blur 10px -> 0 |
| Card hover lift | .55s | `--ease` | -4px + `--pop` + `--hair2` border; sheen 1.1s |
| CTA hover | .35s | `--spring` | -2px + `--pop` |
| Live pulse | 2.4s infinite | `--ease` | Ember ring 0 -> 9px |
| Theme reveal | .8s | `cubic-bezier(.2,.8,.2,1)` | circle from click point |
| Scene loops | 3.4s / 6s / 7s / 22s / 28s / 70s | ease-in-out / linear | twinkle / halo / shimmer / boat / drift / clouds |

### 2.3 JS that drives motion and state

Theme toggle (verbatim from every page script; `go` flips the theme state):

```js
toggleTheme: function (e) { var go = function () { self.setState({ dark: !dark }); }; var d = document, r = d.documentElement; var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; if (!d.startViewTransition || still) { go(); return; } if (e && e.clientX) { r.style.setProperty("--vtx", e.clientX + "px"); r.style.setProperty("--vty", e.clientY + "px"); } r.classList.add("kj-vt"); var t = d.startViewTransition(function () { go(); return new Promise(function (res) { setTimeout(res, 40); }); }); var done = function () { r.classList.remove("kj-vt"); }; t.finished.then(done, done); },
```

Behaviour: no View Transitions API or reduced motion -> instant switch (the .4s colour transitions still soften it unless reduced motion). Otherwise: store click coordinates in `--vtx/--vty` on `<html>`, add `kj-vt` to kill CSS transitions during the snapshot, flip theme inside `startViewTransition`, wait 40ms for the DOM to settle, remove `kj-vt` when finished. Keyboard activation (no `clientX`) reveals from the default 92% / 4% (top right, where the toggle sits).

Clock tick (Home and Contact): `setInterval(..., 20000)` re-renders, cleared on unmount (see 3.8).

Everything else (panels, chips, steppers, FAQ, copy buttons) is plain state; motion comes from CSS keyframes firing on mount.

### 2.4 Implementation notes for motion

- Port to `src/styles/globals.css` as tokens + utilities (`.animate-rise`, `.animate-line`, `.bento` stagger), scoped to the landing shell rather than `.kj`.
- **View transition scoping:** the canvas `::view-transition-new(root)` rule applies to every view transition. Phase 7 also turns on router `defaultViewTransition` for page changes, which would replay the circular theme reveal on every navigation. Use view-transition types (`document.startViewTransition({ update, types: ["theme"] })` and `html:active-view-transition-type(theme)::view-transition-new(root)`) or a class on `<html>` set only during the theme switch, and give route changes their own (cross-fade) animation.
- **next-themes:** `setTheme` applies the class in an effect; the 40ms promise was enough in the canvas but call `flushSync` (or set the class directly, then `setTheme`) inside the update callback so the new snapshot is guaranteed dark/light. next-themes `disableTransitionOnChange` is the equivalent of `kj-vt` for the non-VT path; the canvas deliberately keeps the .4s fade on that path.
- **LCP/perf:** h1 lines start at `opacity:0` with `filter: blur(10px)` for 1s and every card animates `filter: blur(6px)`; this delays LCP and costs paint on low-end phones. Gate: Lighthouse no worse than the Phase 6 baseline. Consider dropping `filter` from `kj-rise` on cards, or starting the h1 at opacity > 0.
- The `.kj, .kj *` universal colour transition conflicts with Tailwind `transition-*` utilities on the same elements and runs on every hover; scope it to a theme-switch class if perf suffers.
- Selectors rely on DOM shape (`main > :not(:has(.bento))`, `.bento > :nth-child(n)`, `h1 > *`): keep `main`'s direct children and each h1 line as its own `display:block` span.
- Existing `globals.css` reduced-motion block sets durations to .01ms (keeps `backwards` fill final state) and must also cover the view-transition pseudo-elements; JS gate `lib/motion/motionRuntime.ts` already exists for the theme toggle check.

---

## 3. Shared components

### 3.1 Page shell

```html
<div class="kj {{themeClass}}" style="min-height: 100vh; background: var(--page); color: var(--ink); font-family: 'Geist', system-ui, sans-serif; -webkit-font-smoothing: antialiased">
  <div class="kj-col" style="max-width: 1000px; margin: 0 auto; padding: 40px 24px 96px; box-sizing: border-box; display: flex; flex-direction: column; gap: 56px">
    <header>...</header>
    <main id="main" style="display: flex; flex-direction: column; gap: 56px">...</main>
    <footer>...</footer>
  </div>
</div>
```

- Replaces `LandingLayout` + `LandingTopNav` (floating pill) + `LandingSiteFooter`. Keep the live "Skip to content" link (`components/landing/LandingLayout.tsx`); the canvas has none.
- Hero pattern on inner pages: eyebrow chip, h1 in 2-3 block lines with `--muted` connector words and a `--signal` final line (Home, Portfolio, Project) or plain, lead paragraph (18px ink2, max 620px), optional CTA row.

### 3.2 Header

Structure (compact; same on all pages):

```html
<header style="position: relative; z-index: 20; display: flex; align-items: center; justify-content: space-between; gap: 16px">
  <div style="display: flex; align-items: center; gap: 14px; min-width: 0">
    <a href="/" aria-label="Kunanon Jarat, home" style="position: relative; display: inline-flex; width: 44px; height: 44px; border-radius: 12px; background: var(--ink); align-items: center; justify-content: center">
      <span style="color: var(--page); font-weight: 700; font-size: 21px; letter-spacing: -0.02em">K</span>
      <span aria-hidden="true" style="position: absolute; right: 7px; bottom: 7px; width: 5px; height: 5px; background: var(--signal)"></span>
    </a>
    <a class="kj-email" href="mailto:fronk.kunanon@gmail.com" style="color: var(--ink); font-size: 16px; text-decoration: underline; text-decoration-color: var(--hair2); text-underline-offset: 6px; white-space: nowrap">fronk.kunanon@gmail.com</a>
  </div>
  <div style="display: flex; align-items: center; gap: 8px">
    <!-- 3x .kj-icon: 48x48, radius 999, border 1px var(--hair), bg var(--surface), color var(--ink), box-shadow var(--shadow); 18px stroke icons -->
    <button class="kj-icon" aria-label="Share this page" aria-expanded aria-controls="share-panel">[share icon]</button>
    <button class="kj-icon" aria-label="Switch to night mode | Switch to day mode">[sun when light | moon when dark]</button>
    <button class="kj-icon" aria-label="Open menu | Close menu" aria-expanded aria-controls="site-menu">[two-line icon | X]</button>
  </div>
  <!-- #share-panel or #site-menu, absolutely positioned: right 0; top 60px -->
</header>
```

Site menu (`<nav id="site-menu" aria-label="Site">`, width 360px, max-width 100%, padding 12px, border hair, radius 24, bg surface, `--pop`, gap 2px):

- Rows (`.kj-row`): min-height 44, padding 0 12, radius 14, 15px/500, ink, no underline. Order: Home, About, Ventures, Portfolio, Skills; mono label "LIBRARY" (12px .06em uppercase ink2, margin 10px 12px 4px); 2-col grid: Learn, Examples, Stack, Proof, Build; full-width CTA "Contact me" (min-height 48, radius 999, bg cta, color oncta, 15px/600, margin-top 10).
- Current page row: `aria-current="page"`, bg `--tint`, trailing 6px Signal square. Mapping in the canvas: Project -> Portfolio, Skill -> Skills, Topic/TopicTh -> Learn, Venture -> Ventures; Blog, Post, Press, Contact, Resume, 404 mark nothing. Source: `lib/content/landing.ts` `primaryNav` + `footerLibrary` + `navCta` (Blog stays out while `BLOG_PUBLIC` is false; Press stays out).

Share panel (`<section id="share-panel" aria-label="Share this page">`, width 340, same container styles): "Share" (13px ink2), page title (15px/600), then rows: Copy link (link icon -> Signal check, label "Copy link" -> "Link copied" in `aria-live="polite"`, right-aligned mono 12px URL label truncated at 130px), Post on X (`https://x.com/intent/post?text=<title>&url=<url>`), Share on LinkedIn (`https://www.linkedin.com/sharing/share-offsite/?url=<url>`), Email the link (`mailto:?subject=<title>&body=<url>`), More options (`navigator.share({ title, url })`).

States: share open / menu open are mutually exclusive (opening one closes the other; opening share resets "copied"). Icon swaps animate with `kj-spin`. Panels pop with `kj-pop`.

Breakpoints: email link hidden <=560px; icon buttons 44px at <=380px; panels `max-width: 100%` so they fit the 344px frame.

A11y to add (canvas cannot express it): Escape closes the open panel and returns focus to its trigger; outside click closes; move focus into the panel on open (first row); `aria-expanded` strings as shown; keep the menu a disclosure `<nav>` (not `role="menu"`); hide "More options" when `navigator.share` is missing; share URL and title come from the route's canonical URL and `head()` title, not hard-coded strings.

### 3.3 Theme toggle

Icon button in the header (see 3.2). Label states "Switch to night mode" (light) / "Switch to day mode" (dark). Icon shows the current mode (sun in day, moon in night). Logic in 2.3. Replaces `components/ThemeToggle.tsx` styling; keep next-themes and `color-scheme` handling in `globals.css`.

### 3.4 Share pill and share cards

Hero share pill (Resume, Project, Venture, Skills, Skill, Topic, TopicTh, Post): opens the header share panel.

```html
<button type="button" aria-controls="share-panel" aria-expanded="{{shareExpanded}}" style="display: inline-flex; align-items: center; gap: 10px; height: 56px; padding: 0 30px; border-radius: 999px; border: 1px solid var(--hair2); background: var(--surface); color: var(--ink); font-size: 17px; font-weight: 600">[share icon 18px]<span>Share</span></button>
```

TopicTh wraps the label in `<span lang="en">Share</span>`. Because the panel is anchored to the header (top right), the pill and the header button must share one state.

Share cards (inline, same actions as the panel): Resume "Share" card (rows like the panel + "Download PDF" CTA) and Venture "Share" card (span3: title + URL label, a 48px Copy link row, then four 48px `.kj-icon` buttons: X, LinkedIn, Email, More share options).

### 3.5 Bento grid and card variants

Grid containers:

```html
<div class="bento" style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px"> <!-- some pages add grid-auto-flow: row dense | dense -->
<div class="bento-2" style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px">
```

Span classes: `.span2` (`grid-column: span 2`), `.span3` (`grid-column: span 3`). Dense flow on Home, About, Contact, Project, Resume, Venture. Skill-card grids are `<ul class="bento">` with gap 12px.

Base card (`article`):

```html
<article aria-labelledby="card-x" style="position: relative; display: flex; flex-direction: column; gap: 16px; min-height: 290px; padding: 18px 20px 20px; box-sizing: border-box; border: 1px solid var(--hair); border-radius: 28px; background: var(--surface); box-shadow: var(--shadow); overflow: hidden">
  <h2 id="card-x" style="margin: 0; align-self: flex-start; padding: 7px 12px; border: 1px solid var(--hair); border-radius: 999px; background: var(--page); font-size: 13px; font-weight: 500">Experience</h2>
  ...
  <a href="/resume" style="position: absolute; right: 20px; bottom: 16px; display: inline-flex; align-items: center; min-height: 44px; font-size: 14px; font-weight: 500; text-decoration: none">Résumé →</a>
</article>
```

Variants found:

| Variant | Spec | Where |
|---|---|---|
| Base | above; gap 10-20; min-height 290 default | everywhere |
| Kicker chip heading | card `h2` as 13px pill on `--page` | most cards |
| Card with in-card title | kicker + 20-24px/600 `h3` | About, Topic, Proof |
| Flex-row card | `flex: <grow> 1 <basis>` inside a flex-wrap row instead of a grid cell (bases 260/280/400/440/560px, Post note `flex: 999 1 560px`) | Skills top row, About FAQ+Next, Resume Skills+Share, Post note+aside, Examples |
| Inner well | `padding: 14px; border: 1px solid var(--hair); border-radius: 20px; background: var(--page)` (no shadow) | skill cards in stage grids, figures, tiles, meta strip, SKILL.md box, quote panel |
| Tint nav card | `flex: 1 1 260px; min-height: 160px; padding: 18px 20px 20px; border-radius: 28px; background: var(--tint); text-align: center` (class `kj-icon` for lift) | Project prev/All/next |
| Prev/next pair | `nav.bento-2`, cards min-height 112 | Skill |
| Stats row | `dl` flex-wrap gap 20; `dt` mono label; `dd` 40px/600/-0.03em tabular | Venture, Proof tiles |
| Place card | Bangkok location card (3.8) | Home (span2), Contact (span3) |
| Figure placeholder | `figure` on `--tint`, radius 20, pixel-square SVG in `--river`/`--signal`, mono "[Banner image]" + domain + caption | Press, Blog, Post |
| Mockup frame | well with `padding: clamp(20px, 5vw, 56px) 6%`, `aspect-ratio: 16 / 10` SVG, caption "Illustrative mockup, not real data." | Portfolio, Project |

Card a11y: every card is `<article aria-labelledby>` pointing at its kicker `h2`; decorative SVG `aria-hidden="true"`; footer links are real `<a>` with 44px min-height; trailing arrows are text (`→`) inside the link.

### 3.6 Chips, pills and segmented controls

| Chip | Spec |
|---|---|
| Eyebrow chip (hero `p`) | `display: inline-flex; gap: 8px; padding: 7px 12px; border: 1px solid var(--hair2); border-radius: 999px; background: var(--surface); font-size: 13px; font-weight: 500` + 6px `--signal` square `aria-hidden` |
| Live pill (Home hero, Venture hero) | `padding: 10px 16px; border: 1px solid var(--hair2); border-radius: 999px; background: var(--surface); font-size: 15px; font-weight: 500` + 8px `--ember` square `.kj-live` + "Live" + ink2 text (`· Building GoGoCash and Manut AI` from `hero.status`) |
| Card kicker | see 3.5 |
| Meta tag | `min-height: 26px; padding: 0 10px; border: 1px solid var(--hair2); border-radius: 999px; background: var(--surface); font-size: 12px; font-weight: 500` ("Original" adds 6px Signal square; "Runs automatically"/"You invoke" in ink2 with `title` tooltip). Portfolio "Internal tool" variant: no border, bg `--tint` |
| Tech chip | `padding: 4px 10px; border: 1px solid var(--hair2); border-radius: 999px; Geist Mono 12px; ink2` |
| Info chip | `min-height: 40px; padding: 0 16px; border hair2; bg surface; 14px/500` (Learn "On this page", Resume skills list 40px, Skill meta 34px) |
| Segmented group | container `display: flex; flex-wrap: wrap; gap: 4px; padding: 5px; border: 1px solid var(--hair); border-radius: 999px (Portfolio 28px); background: var(--surface) or var(--page); box-shadow: var(--shadow)`; buttons `min-height: 44px; padding: 0 16-18px; border: 0; border-radius: 999px; 14px/500`; on `background: var(--cta); color: var(--oncta)`; off `transparent; color: var(--ink2)`; optional count `<span>` Geist Mono 12px |
| Single-select toggle chip | standalone pill `min-height: 44px; padding: 0 14-16px; 14px/500`; on `1px solid var(--cta); bg cta; color oncta`; off `1px solid var(--hair2); bg surface; color ink (Blog) or ink2 (Skills)`; count mono 12px |
| Multi-select chip (Contact topics) | on `1px solid var(--signal); background: var(--tint); color: var(--ink)` with a check icon; off `1px solid var(--hair2); bg surface; color ink2` |
| Result label | `p aria-live="polite"`, Geist Mono 12px, .06em, uppercase, ink2 |

All toggles use `<button type="button" aria-pressed="true|false">` inside `role="group"` with an `aria-label`/`aria-labelledby`. Do not convert to tabs unless panels get proper tab semantics.

### 3.7 Buttons and links

- Primary CTA: `<a>` `height: 56px; padding: 0 30px; border-radius: 999px; background: var(--cta); color: var(--oncta); font-size: 17px; font-weight: 600` (hover lift -2px + `--pop`). Submit uses 16px.
- Secondary CTA: same with `border: 1px solid var(--hair2); background: var(--surface); color: var(--ink)`.
- Small pill button (copy, filters): `min-height: 44px; padding: 0 14-18px; border: 1px solid var(--hair2); border-radius: 999px; background: var(--surface); 14px/500`.
- Glass button (on scene): `min-height: 44px; padding: 0 26px; border: 1px solid var(--glass2); background: var(--glass); backdrop-filter: blur(10px); color: var(--onphoto)`; hover `--glass2`.
- Text link: `--signal`, 14px/500, no underline, trailing `→`, `min-height: 44px` inline-flex. Global `a{color:var(--signal)} a:hover{color:var(--ink)}`.
- Copy button pattern (Contact email, 404 email, Skills/Skill commands, SKILL.md, prompt): icon swaps to a Signal check, label in `aria-live="polite"` "Copy" -> "Copied" (Contact "Copy email" -> "Copied", 404 "Copy email" -> "Email copied"); resets after 2000ms (Skills/Skill/Contact; 404 and header share stay copied until reopened). Reuse `components/landing/skills/CopyButton.tsx` behaviour.

### 3.8 "Based in Bangkok" location card

Structure (Home `span2`, Contact `span3`):

```html
<article class="span2 kj-place" aria-labelledby="card-map" style="grid-column: span 2; position: relative; isolation: isolate; border: 1px solid var(--hair); border-radius: 28px; background: var(--water2); box-shadow: var(--shadow); overflow: hidden">
  <div class="kj-place-art" aria-hidden="true" style="position: absolute; inset: 0"><svg viewBox="0 0 1000 420" preserveAspectRatio="xMaxYMax slice">...scene...</svg></div>
  <div class="kj-place-blur" aria-hidden="true" style="position: absolute; inset: 0"></div>
  <div class="kj-place-scrim" aria-hidden="true" style="position: absolute; inset: 0"></div>
  <div class="kj-place-body" style="position: relative; display: flex; flex-direction: column; justify-content: center; min-height: 420px; padding: 32px">
    <div style="display: flex; flex-direction: column; align-items: flex-start; max-width: 360px; color: var(--onphoto)">
      <span class="kj-badge" aria-hidden="true" style="width: 56px; height: 56px; border-radius: 999px; border: 1px solid var(--glass2); background: var(--glass); backdrop-filter: blur(10px)">[28px temple line icon]</span>
      <h2 id="card-map" style="margin: 22px 0 0; display: flex; flex-direction: column; gap: 2px; font-weight: 400">
        <span style="font-size: 24px; color: var(--onphoto2)">Based in</span>
        <span style="font-size: clamp(40px, 4.6vw, 52px); line-height: 1.05; letter-spacing: -0.035em; font-weight: 600">Bangkok</span>
      </h2>
      <p style="margin: 12px 0 0; display: inline-flex; gap: 8px; font-size: 15px; color: var(--onphoto2)">[clock icon]<span class="kj-sr">Local time in Bangkok: </span><span style="font-variant-numeric: tabular-nums">{{bkkTime}}</span> GMT+7</p>
      <span aria-hidden="true" style="align-self: stretch; height: 1px; margin: 22px 0; background: var(--glass2)"></span>
      <p style="margin: 0; font-size: 15px; line-height: 1.6">Building fintech and AI operator systems from Bangkok, for Thailand and SEA: AI transformation, ERP/CRM, internal systems, and tech startups.</p>
      <a class="kj-glass" href="/contact" style="margin-top: 24px">Say hello</a>   <!-- Contact page: href="#say-hello" -->
    </div>
  </div>
</article>
```

Scene layers (back to front): sky rect (`url(#kjp-sky-day|night)` by theme), 12 stars (`.kj-stars`, opacity `--starop`), 5 blurred clouds (`.kj-clouds`, `feGaussianBlur 14`), halo ellipse (`.kj-halo`, opacity `--glowop`), misty skyline (9 rects, blur 5), five copies of one prang/temple group (two at scale .3, two at .46, the full-size one at right) with gold gradient, tier pattern, door arches, window lights (opacity `--glowop`), tree canopy circles, river bank, water rect (`url(#kjp-water-day|night)`), glow reflections, `.kj-shimmer` strokes, `.kj-boat`. Copy the SVG from `project/Main.dc.html` lines 220-336; tokenise the colours (section 1.2).

Theme coupling: the sky and water gradient ids are swapped by JS (`skyFill`/`waterFill`), stars/glow by CSS vars. In React, either render both gradients and pick by `resolvedTheme`, or define the gradient stops with CSS custom properties so no JS is needed (preferred: avoids a hydration flash before next-themes resolves).

Clock logic (verbatim):

```js
var bkk = new Date(Date.now() + 7 * 3600000);
var bkkH = bkk.getUTCHours(), bkkM = bkk.getUTCMinutes();
var bkkTime = ((bkkH % 12) || 12) + ":" + (bkkM < 10 ? "0" : "") + bkkM + " " + (bkkH < 12 ? "AM" : "PM");
// componentDidMount: this.kjTick = setInterval(function () { self.setState({ kjNow: Date.now() }); }, 20000);
// componentWillUnmount: clearInterval(this.kjTick);
```

Implementation: `Intl.DateTimeFormat("en-US", { timeZone: "Asia/Bangkok", hour: "numeric", minute: "2-digit" })` gives the same "h:mm AM" string (Thailand has no DST, so fixed +7 is also correct). The HTML is cached at the edge (Worker cache), so a server-rendered time would be stale: render the time only after mount (keep a fixed-width placeholder with `tabular-nums` to avoid layout shift), or render server-side with `suppressHydrationWarning` and correct on mount. Tick every 20s; consider aligning to the next minute boundary. Wrap in `<time dateTime>` if desired. Do not add `aria-live` (a ticking clock must not announce).

Responsive: the card is a size container. At container width <=560px (phone, fold cover, and Home at 1-col) the body becomes `min-height: 680px`, content sits at the bottom (`justify-content: flex-end`, padding 24), art occupies the top 64%, scrim and blur masks run bottom-to-top.

A11y: all art `aria-hidden`; the heading reads "Based in Bangkok"; the time has an sr-only prefix; text sits on a 0.9-alpha dark scrim (verify 4.5:1 for `--onphoto2` 15px text over the scrim in both themes).

### 3.9 Footer

```html
<footer style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px; padding-top: 24px; border-top: 1px solid var(--hair); font-size: 13px; color: var(--ink2)">
  <span>© 2026 Kunanon Jarat · Bangkok</span>
  <span style="display: flex; flex-wrap: wrap; gap: 4px 18px"><a href="https://x.com/fkj98">X</a><a href="https://www.linkedin.com/in/kunanonj">LinkedIn</a><a href="https://github.com/KunanonJ">GitHub</a></span>  <!-- each a: inline-flex, min-height 44px -->
</footer>
```

Source: `lib/content/landing.ts` `socials`. Year should be computed. The live footer's Work, Library and Resources columns (agents.md, sitemap.md, llms.txt, skills.md, feed.xml when the blog is public) have no place in the canvas footer (see 6).

### 3.10 Form controls

- Label: Geist Mono 12px, .06em, uppercase, ink2.
- Input: `height: 52px; padding: 0 16px; border: 1px solid var(--hair2); border-radius: 16px; background: var(--page); font-size: 16px; outline-color: var(--signal); outline-offset: 2px`. Textarea same, `min-height: 160px`, rows 6.
- Error row (`id` referenced by `aria-describedby`, `aria-invalid` on the field): `display: flex; gap: 8px; font-size: 13px; color: var(--ink)` + 8px `--ember` square.
- Search input (Blog): pill (`border-radius: 999px`), 52px, left icon, padding-left 44px, label "Search posts" 13px/500 ink2 above.
- Fieldset/legend for topic chips; submit `aria-disabled` + "Sending..." label at opacity .6 while busy; success block `role="status"`; failure paragraph inside an `aria-live="polite"` wrapper.

### 3.11 Disclosure and steppers

- FAQ accordion (About): `h4 > button[aria-expanded][aria-controls]` min-height 56, 16px/500; plus icon rotates 45deg when open; answer `div[role=region][aria-labelledby]`, padding `0 40px 18px 4px`. First item open by default. Topic pages use a static `dl` (no disclosure).
- SKILL.md expander (Skill): first ~15 lines visible with a bottom fade mask; toggle `button[aria-expanded][aria-controls="skill-md"]` "Show all 43 lines" / "Show fewer lines" (line count must be computed).
- Steppers (`aria-pressed` buttons + `aria-live="polite"` output): Home "How I work" (Step 01-04 segmented pill, principle title + body), Venture core loop (4 stacked step buttons + rotating dial), Project approval flow (4-column numbered dots with a progress line `width: step*25%`, Previous/Next/Start again buttons, per-step icon).

---

## 4. Pages

Live routes in `src/routes/` (HTML pages): `_landing/index.tsx` `/`, `_landing/about.tsx`, `_landing/contact.tsx`, `_system/resume.tsx`, `_landing/portfolio/index.tsx`, `_landing/portfolio/$slug.tsx`, `_landing/ventures/$slug.tsx`, `_landing/skills/index.tsx`, `_landing/skills/$slug.tsx`, `_landing/learn.tsx`, `_landing/examples.tsx`, `_landing/stack.tsx`, `_landing/proof.tsx`, `_landing/build.tsx`, `_landing/topics/$slug.tsx`, `_landing/th/topics/$slug.tsx`, `_landing/blog/index.tsx`, `_landing/blog/$slug.tsx`, `_landing/press.tsx`, `_system/design.tsx`, `studio.tsx`; 404 via root `notFoundComponent` (`components/NotFound.tsx`). Non-HTML: `api/contact.ts`, `api/github/contributions.ts`, feeds, OG images, icons, manifest, robots, sitemap, llms.txt, skills.json, security.txt.

Width key used below: **D** = desktop 3-col (>=1024px, canvas 1440 frame, 1000px column), **T/F** = tablet 768 and foldable open 673 (2-col, 641-1023px), **P/C** = phone 390 and fold cover 344 (1-col, <=640px; <=380px tweaks apply at 344). `span3` becomes span 2 at T/F; everything is one column at P/C in DOM order. Dense flow can reorder at T/F (noted).

"Not in repo" lists only content or features with no source; UI microcopy that merely labels repo data is noted as microcopy.

### 4.1 Home (`Main`) -> `/` (`src/routes/_landing/index.tsx`)

- Hero: h1 three lines "Hi, I'm [inline round headshot] Kunanon Jarat." / "Founder of GoGoCash and" / "Manut AI." (Signal) beside the Live pill; row with primary CTA "Contact me" and lead "Building fintech and AI from Bangkok. Also IT Manager & AI Engineering Lead at The Binary Holdings." Source: `lib/content/landing.ts` `hero` (`statement`, `statementSecondary`, `status`, `primaryCta`), headshot `public/profile-portrait.webp`.
- Bento (dense): Experience (1) | Ventures (1) | Selected work (1) / Bangkok (span2) | How I work (1).
  - D: as listed. T/F: Experience | Ventures; Selected work | How I work (dense fills); Bangkok (2). P/C: Experience, Ventures, Selected work, Bangkok (stacked scene), How I work.
- Blocks and sources:
  - Experience: 4-entry timeline with Signal dot on the current role, bottom fade mask, "Résumé ->" link. Source: resume timeline (Sanity via `src/queries/content`, fallback `lib/content/resumeTimeline.fallback.ts`); canvas reformats "Nov 2025 — Present" to "Nov 2025 – Present" and composes "Founder, GoGoCash" from title + org.
  - Ventures: two tilted logos, "GoGoCash · Manut AI", "1,000+ users · 220+ merchants on GoGoCash", "See both ventures ->". Source: `landing.ts` `ventures`, `lib/content/ventures.ts` metrics.
  - Selected work: 3 numbered rows (TBH Intranet, AI Automation, Node Validator Automation) with summaries, "All work ->". Source: `lib/content/portfolio.ts` (titles/summaries exist; selection/order does not, see 6).
  - Bangkok card (3.8). Body copy exists as a variant in `src/server/text/llms.ts`; move it to `lib/content/landing.ts`.
  - How I work: Step 01-04 stepper over the four principles. Source: `lib/content/aboutPage.ts` `principles`.
- Filters: none (stepper is local state).
- Not in repo: greeting "Hi, I'm"; "See both ventures ->" target (no ventures index); the live clock (new feature). Live home blocks dropped by the canvas: About section with keyword tips, `Features`, `PortfolioStrip`, `ProofStrip`, `IntroLoader`, and the `#ventures` anchor that nav/footer/404 link to.

### 4.2 About -> `/about` (`_landing/about.tsx`)

- Hero (flex-wrap): text column (eyebrow "Fronk · Bangkok, Thailand", h1 "About Kunanon Jarat: / AI, ERP/CRM and / startups in Bangkok.", lead, CTAs "Contact me" (primary), "See my work" (secondary), "Read my story" (text link to `#story`)) + portrait panel (`flex: 1 1 280px; min-height: 440px`, bg tint, image cover, floating social pill X/LinkedIn/GitHub with `--pop`).
- Bento (dense): Story (span2) | Selected path (1) / How I work (span3, inner `bento-2` of 4 numbered principles) / Now (1) | Activity (span2) / Tech stack (span3, inner `bento-2` of 4 groups) / span3 flex row: FAQ (flex 2 1 400px) + Next (flex 1 1 260px).
  - D: as listed. T/F: Story (2); Selected path | Now (dense); How I work (2); Activity (2); Tech stack (2); FAQ + Next side by side at 768 (720px fits 680), wrapped at 673. P/C: DOM order; inner bento-2 lists go 1-col.
- Sources: `lib/content/aboutPage.ts` (hero, story, path, principles, now, techStack, next), `lib/content/faq.ts` (FAQ), `lib/content/landing.ts` socials. Activity heatmap: canvas draws a seeded fake 53x7 grid labelled "Illustrative mockup, not real data"; the live site uses real data (`src/routes/api/github/contributions.ts`, `components/landing/ContributionActivity.tsx`). Use the real data and drop the disclaimer. Heatmap: 8px cells, radius 2, gap 2, Signal at opacities, horizontally scrollable `role="region" tabindex="0"`, Less/More legend.
- Filters: none (FAQ is local).
- Not in repo: nothing factual (all copy found). Anchor ids differ: canvas `story`, `card-principles`, `card-now`, `card-faq`; live `#principles`, `#now`, `#faq` are linked from `lib/content/learn.ts` `learnOperatorNotes`; keep the live ids.

### 4.3 Contact -> `/contact` (`_landing/contact.tsx`)

- Hero: eyebrow "Contact", h1 "Building in fintech, AI or ops? / Let's talk.", lead.
- Bento (dense): Email me directly (1, min-h 290: mail icon, mailto with subject, Copy email pill) | Say hello form (span2, row span2) / Elsewhere (1: 5 numbered rows X, LinkedIn, GitHub, Telegram, Farcaster) / Who should write (span3) / Bangkok card (span3, CTA "Say hello" -> `#say-hello`).
  - D: Email over Elsewhere in col 1, form in cols 2-3 rows 1-2, then the two span3 cards. T/F: Email | Elsewhere; form (2); Who (2); Bangkok (2). P/C: Email, form, Elsewhere, Who, Bangkok.
- Form: Full name, Email, message textarea, topic multi-select chips (8), submit. Client validation mirrors `CONTACT_LIMITS` (name <=100, email <=254 + pattern, message 10-5000), focuses the first invalid field. Sources: `lib/content/contact.ts` (`CONTACT_TOPICS`, `CONTACT_LIMITS`, `contactPage`, `contactMessages`), `lib/site.ts` (Telegram, Farcaster), `/api/contact`.
- Filters: none.
- Not in repo: "Who should write" heading (body exists in `aboutPage.ts`), "Send another message", "Elsewhere". Canvas lacks: Turnstile widget (`lib/turnstile/client.ts`, used by `components/landing/ContactPage.tsx`), honeypot / `minFillMs`, and the server states `notConfigured`, `rateLimited`, `botCheck`, `tooLarge`.

### 4.4 Resume -> `/resume` (`_system/resume.tsx`, `SystemLayout`)

- Hero: eyebrow "Résumé", h1 "Kunanon Jarat. Founder. / IT Manager & AI Engineering Lead. / Based in Bangkok.", lead; actions "Download PDF" (primary, `/resume.pdf`) + Share pill; "Detailed / Compact" segmented control (hides bullet lists when compact).
- Bento (dense): Currently (span3, inner `ol` `grid-template-columns: repeat(auto-fit, minmax(240px, 1fr))`, 3 roles with logo/initials) / Experience (span3, inner `bento-2` two columns, 10 roles numbered 01-10) / University-era (`grid-column: 2 / span 2; grid-row: span 2`, 6 roles) + Education (1) + Affiliations (1) in col 1 / Certifications (span2, inner `bento-2`, 6 items) / span3 flex row: Skills chips (flex 2 1 560px, 12 chips) + Share card (flex 1 1 280px).
  - D: as listed (one empty cell right of Certifications). T/F: canvas bug, University's `2 / span 2` creates an implicit 3rd column between 641-1023px; implement as span 2 there. P/C: DOM order.
- Sources: Sanity resume + `lib/content/resumeTimeline.fallback.ts`, `lib/content/resumeProfile.ts`, `lib/content/companyLogos.ts`, `public/resume.pdf` (`pnpm pdf`).
- Filters: Detailed/Compact (candidate `?view=compact`, or local state).
- Not in repo: the Share card is new UI; content all found. Note the "Currently · Manut AI" bullet "Building an AI-augmented, self-hosted knowledge workspace." (in the repo) contradicts the Manut description used everywhere else.

### 4.5 Portfolio -> `/portfolio` (`_landing/portfolio/index.tsx`)

- Hero: eyebrow, h1 "Selected work: internal tools, / automations and / AI agents." (Signal last line), lead.
- Filter bar: segmented group (radius 28) All, Internal platform, Ops automation, Internal tool, AI agents + result label "N of 4 projects".
- Bento: TBH Intranet (span2) | Node Validator (1) / Email Signature (1) | AI Automation (span2). Filtered: the single match spans 3.
  - D: as listed. T/F: TBH (2); Node | Email; AI (2). P/C: stacked.
- Project card: kicker = category + mono index; mockup well (`aspect-ratio: 16 / 10`, caption "Illustrative mockup, not real data."); "Internal tool" tint tag + year; title h3; summary; tech chips (first 4 + "+N more"); "View project ->" with `aria-label`.
- Sources: `lib/content/portfolio.ts` (category, summary, stack, mockup kinds), `components/landing/portfolio/PortfolioMockup.tsx`.
- Filters: category -> typed search param `?category=` (enum from the categories in `portfolio.ts`).
- Not in repo: none.

### 4.6 Project -> `/portfolio/$slug` (example `tbh-intranet`, `_landing/portfolio/$slug.tsx`)

- Hero: eyebrow "Portfolio · Internal platform" + "All projects" back link, h1 "TBH Intranet. / One back office for / a multi-entity group.", lead, Share pill. Meta strip (well): Role, Organisation, Period, Access with icons.
- Bento (dense): Interface (span3, mockup) / The problem (1, Before/After dl) | What it does (span2, bullet list) / How it works (span3, approval-flow stepper) / Architecture (span2, 5 layers top to bottom with chevrons) | [How it is built + Tech stack] (1, stacked).
  - D: as listed. T/F: Interface (2); The problem | built+stack column (dense pulls it up); What it does (2); How it works (2); Architecture (2). P/C: DOM order. The flow `ol` stays 4 columns at every width.
- Prev / All projects / Next: three tint nav cards (`flex: 1 1 260px`, min-h 160), wrapping.
- Sources: `lib/content/portfolio.ts` (`period`, `access`, `mockup`, `workflow`, `architecture.layers`, sections "The problem" etc., `getAdjacentPortfolioProjects`), existing `PortfolioWorkflow.tsx`, `PortfolioArchitecture.tsx`.
- Filters: none (flow step is local).
- Not in repo: microcopy only ("Top to bottom", "Approval flow", step labels come from `workflow`). Only TBH is drawn; other slugs use different mockup kinds (`email-report`, `form-preview`, `review-queue`) and may lack a workflow.

### 4.7 Venture -> `/ventures/$slug` (example `gogocash`, `_landing/ventures/$slug.tsx`)

- Hero: eyebrow "Venture", h1 "[logo] GoGoCash / Shopping-to-earn / cashback." with Live pill "Live · 2023 — present", lead (`caseStudy.intro`), actions "Visit gogocash.co" (external), "Contact", Share pill.
- Bento (dense): stats `dl` (span3: Users 1,000+, Merchants 220+, Max cashback 30%) / What it is (1, tagline + body + category chips) | Where it stands (span2, body + inner `bento-2`: core-loop stepper | rotating dial) / My role (1, with headshot + "About ->") | Related topics (1, map art + links + "All topics ->") | Also building (1, other venture) / Share (span3).
  - D: as listed. T/F: stats (2); What it is | My role (dense); Where it stands (2); Related | Also building; Share (2). P/C: DOM order.
- Sources: `lib/content/ventures.ts` (metrics, `caseStudy.sections`, `timeline`, `stack` as chips, `url`), related links from the `RELATED` map in `src/routes/_landing/ventures/$slug.tsx` (filtered by `withoutHiddenBlogLinks`).
- Filters: none (loop step local).
- Not in repo: the 4 loop stages (Browse, Shop, Track cashback, Withdraw) exist only inside the "Where it stands" sentence; promote to a structured field. "Also building" is derived (the other venture). Manut is not drawn: it has no metrics (stats row must hide), sections "What it is / Why it matters in Thailand & SEA / My role", and no loop.

### 4.8 Skills -> `/skills` (`_landing/skills/index.tsx`)

- Hero: eyebrow "Skills" + release link pill "Superstacks v6.1.1 · Oct 2026 ->", h1 "The agent skills / I build with", lede, "View on GitHub" + Share pill, summary "20 skills · MIT license · 8 original, 12 adapted".
- Top flex row: Install the whole pack (flex 2 1 440px, min-h 290; 5 toggle chips Claude Code / Codex / Cursor / npx skills / ZIP controlling `#install-panel`; code rows with Copy) + Or ask your agent (flex 1 1 280px; prompt + Copy prompt) + The pipeline (flex 1 1 100%; 8 numbered links with chevrons, notes "(if one-way door)", "(draft)").
  - D: Install + Ask side by side, Pipeline full width. T/F: 740px needed, so each card is full width. P/C: stacked.
- Catalog: filter card ("All 20 skills" + summary + toggle chips All / Original / Adapted / Runs automatically / You invoke with counts), then one card per stage (Plan, Build, Verify and ship, Operate and improve) each with a count, blurb and a `ul.bento` 3-col grid of skill wells (name, meta tags, description, Copy install, ZIP, Details ->). Stage cards hide when the filter leaves them empty.
  - Grid: D 3-col, T/F 2-col, P/C 1-col.
- Credits card: `ul.bento-2` of 4 upstreams (name, license + copyright, pinned SHA link, adapted skill links).
- Sources: `lib/content/skills.ts` (`SKILL_STAGES`, `SKILL_PIPELINE`, install command templates, `PLUGIN_ZIP`), `lib/content/skills.generated.json` (version, `publishedAt`, sources with copyright, sizes), `components/landing/skills/*`.
- Filters: origin/invocation chips -> typed `?show=original|adapted|auto|user`; install tab -> optional `?install=claude-code|codex|cursor|npx|zip` (or local). The Phase 7 plan says "skills stage and origin"; the canvas has no stage filter (stages are fixed sections).
- Not in repo: none (all strings resolve from the snapshot and templates).

### 4.9 Skill -> `/skills/$slug` (example `verify-loop`, `_landing/skills/$slug.tsx`)

- Hero: breadcrumb (Skills > verify-loop), "Skill · Build", h1 "verify-loop / Run it red, then iterate until green.", description, meta chips (Original, Runs automatically, MIT, Superstacks v6.1.1 link), "View on GitHub" + Share pill.
- Bento: Install this skill (span2, 5 toggle chips: npx skills / ZIP for Claude Code / Codex / ZIP for claude.ai / ChatGPT / Plain copy / Full pack) | How it runs (1) / Files (1, file rows with sizes) | Origin (1) | More in Build (1) / SKILL.md (span3, expandable source with Copy + GitHub). Then prev/next `nav.bento-2` ("Previous · Plan interrogate", "Next · Build test-driven-development").
  - D: as listed. T/F: Install (2); How it runs | Files; Origin | More; SKILL.md (2); prev | next. P/C: stacked.
- Sources: `skills.ts` + snapshot (`files`, `zip`, `flatZip`, `content`, `license`, `source`, `patches`, `publishedAt`), existing `SkillDetailPage.tsx`/`InstallTabs.tsx`/`CopyButton.tsx`.
- Filters: install tab (local or `?install=`).
- Not in repo: the "How it runs" loop list (steps 04-06 with VERIFY_FAIL / VERIFY_PASS chips) is hand-picked from this one SKILL.md; there is no structured equivalent for the other 19 skills. Origin card for adapted skills (upstream, pinned SHA, patches) and the user-invoked variant are not drawn.

### 4.10 Learn -> `/learn` (`_landing/learn.tsx`)

- Hero: eyebrow, h1 "How I think about AI transformation, internal systems, and shipping from Bangkok." (max-width 880), lede "Topic hubs and operator notes.", info chips "03 Topic hubs", "03 Operator notes", "English · ไทย".
- Bento: AI hub (span2, min-h 340, river-line art) | Read the hubs in (1: big "EN/TH" code, status, vertical 2-option group) / ERP hub (1, min-h 320) | Startups hub (span2) / Operator notes (span3, 3 numbered items).
  - D: as listed. T/F: AI (2); language | ERP; Startups (2); notes (2). P/C: stacked.
- Hub card: "{lang} · {path}" mono line, title (`lang` attr), lede, "Open hub ->", plus "Read in English" / "อ่านภาษาไทย" alt link on the AI hub. Thai uses Noto line-heights (1.4 / 1.75).
- Sources: `lib/content/learn.ts`, `lib/content/topics/pillars.ts` (EN + TH h1/lede), `learnOperatorNotes`.
- Filters: language -> typed `?lang=en|th`.
- Not in repo: microcopy "Read the hubs in", "Topic hub · 0N", lede "Topic hubs and operator notes." (live `learnPage.description` is longer).

### 4.11 Examples -> `/examples` (`_landing/examples.tsx`)

- Hero: eyebrow, h1 "What changes when / the work is / operator-first.", lead.
- Persona picker card: "Show examples for" + count label, 3 tile buttons (flex 1 1 180px, min-h 104, radius 20; on = cta fill + Signal square) Builders / Operators / Founders.
- Cards: `ul` flex-wrap gap 20, `li` flex 1 1 260px, card min-h 320: persona kicker + mono index, h2 title, body, mono path + CTA link.
  - D: 3 per row. T/F: 2 then 1 (three cards need 3 x 260 + 40 = 820px; the column is 720px at 768). P/C: 1.
- Sources: `lib/content/examples.ts`.
- Filters: persona -> typed `?persona=builders|operators|founders`.
- Not in repo: none.

### 4.12 Stack -> `/stack` (`_landing/stack.tsx`)

- Hero: eyebrow, h1 "Tools evidenced in public GitHub, / not a wishlist. / TypeScript is the through-line.", lead.
- Filter bar: All 16, Build 4, Ship 8, Operate 4 + result label.
- Bento: Ship (span2, inner 2-col list) | Build (1) / Operate (1) | Through-line (span2: TS badge, Tools 16 / Groups 3 / GitHub orgs 2, proportional bar Build 4 / Ship 8 / Operate 4, two org links). Filtered: chosen group span3 with a 2-col list + Through-line span3.
  - D: as listed. T/F: Ship (2); Build | Operate; Through-line (2). P/C: stacked, inner lists 1-col.
- Tool row: `.kj-row` link, 2-letter mono badge, name, use, domain ->.
- Sources: `lib/content/stack.ts`, `lib/content/stackIcons.ts`.
- Filters: group -> typed `?group=build|ship|operate`.
- Not in repo: none (counts derived).

### 4.13 Proof -> `/proof` (`_landing/proof.tsx`)

- Hero: eyebrow, h1 "Honest signals: venture metrics / and case studies. / No invented scores.", lead.
- Venture metrics card: "03 published · GoGoCash"; 3 metric tile buttons (flex 1 1 180px, min-h 120; on = Signal border + tint) 1,000+ / 220+ / 30%; quote panel (well, `aria-live`): "Source · {where}", blockquote, "Read the GoGoCash case ->".
- `section.bento-2`: Manut AI case | GoGoCash case (logo, h3, tagline, description, Role/Timeline dl, focus chips, Live domain link, View ->).
  - D/T/F: 2-col. P/C: 1-col.
- Sources: `lib/content/proof.ts` (`getProofMetrics`, `getProofCards`), `lib/content/ventures.ts` (quotes = `caseStudy.sections` bodies and `description`).
- Filters: metric selection is local state.
- Not in repo: source labels ("GoGoCash case · Where it stands", "GoGoCash · Venture summary") are derived microcopy.

### 4.14 Build -> `/build` (`_landing/build.tsx`)

- Hero: eyebrow, h1 "A thin public board of / what's next, in flight, and / recently shipped.", lead.
- Filter bar: All 11, Site, GoGoCash, Manut (counts) + result label.
- Bento: Next (1) | In progress (1) | Shipped (`class="span3"` but inline `grid-column: auto`). Each column: header with marker square + count ("03 tickets"), ticket list (mono key, venture tag, title, body), empty state "Nothing here for this filter."
  - D: three columns side by side. T/F: Next | In progress, Shipped full width (the span3 rule wins). P/C: stacked.
- Sources: `lib/content/buildBoard.ts`.
- Filters: venture -> typed `?venture=site|gogocash|manut`.
- Not in repo: empty-state microcopy. KJ-21 and KJ-29 describe the old landing chrome (pill nav, keyword tips) and will be stale after Phase 7.

### 4.15 Topic -> `/topics/$slug` (example `ai-transformation-thailand`, `_landing/topics/$slug.tsx`)

- Hero: eyebrow "Topic" + language segmented nav (English current / ไทย, `hreflang`, `lang`), h1 "AI transformation / for Thailand and / SEA", lede, CTA "Talk about transformation" + Share pill.
- Bento: section 1 (span2, min-h 280, big mono numeral) | section 2 (1) / section 3 (1) | Operator proof (span2, bullets) / FAQ (span3, static `dl`, 3 Q/A) / `bento-2 span3`: Keep exploring (3 links) | Contact (CTA + email).
  - D: as listed. T/F: s1 (2); s2 | s3; proof (2); FAQ (2); explore | contact. P/C: stacked.
- Sources: `lib/content/topics/pillars.ts` (`sections`, `faqs`, `relatedLinks`, proof bullets), `components/landing/discovery/TopicHubPage.tsx`.
- Filters: language is a route switch (`/topics/x` <-> `/th/topics/x`), not a search param.
- Not in repo: none. Only one slug drawn; `erp-crm-internal-systems` and `tech-startup-thailand-sea` share the template.

### 4.16 Topic (Thai) -> `/th/topics/$slug` (`_landing/th/topics/$slug.tsx`)

- Same as 4.15 with Thai copy, `lang="th"` page, Noto Sans Thai; only 2 sections and 2 FAQs, so the grid is: s1 (span2, min-h 260) | s2 (1) / Operator proof (1, min-h 300) | FAQ (span2) / `bento-2 span3`: อ่านต่อ (English version, Manut, ติดต่อ) | ติดต่อ CTA.
  - T/F: s1 (2); s2 | proof; FAQ (2); pair. P/C: stacked.
- Sources: `pillars.ts` TH entries. Share pill label `lang="en"`.
- Not in repo: none.

### 4.17 Blog -> `/blog` (`_landing/blog/index.tsx`; hidden: `BLOG_PUBLIC = false`, noindex)

- Hero: eyebrow, h1 "Notes on fintech, / AI workspaces, and / shipping from Bangkok.", lead.
- Bento: Cornerstone (span2, min-h 320: banner figure + date/tags + title + excerpt + Read ->) | Archive (1: Posts 15 / Tags 17, Latest / First dates) / In these notes (1: GoGoCash and Manut filter rows with logos and "N posts tagged X") | Search or filter (span2: search input, All + 17 tag chips with counts, result label) / Posts (span3: numbered rows with date, title, excerpt, tag line, Read ->; empty state "No posts match your filters.").
  - D: as listed. T/F: Cornerstone (2); Archive | In these notes; Search (2); Posts (2). P/C: stacked.
- Sources: Sanity posts merged with `FALLBACK_BLOG_POSTS` (`lib/content/blog.ts`, 15 posts, `src/queries/content`).
- Filters: tag (single select; the venture rows set the same tag) and free-text search -> typed `?tag=&q=`.
- Not in repo: "Cornerstone" selection rule (canvas features `ai-transformation-thailand-smes`; blog.ts calls fallbacks "cornerstone" but has no featured flag), "In these notes", banner image (placeholder; repo has Unsplash stock `STOCK_BANNER`).

### 4.18 Post -> `/blog/$slug` (example `ai-transformation-thailand-smes`; canvas title says `/blog/post`)

- Hero: eyebrow "Blog" + "Back to Blog", date + tag chips, h1 "AI transformation / for Thai SMEs", excerpt, Share pill.
- Flex row: The note (flex 999 1 560px: 16/9 banner figure, body max-width 620, 17px/1.7) + aside (flex 1 1 280px, wraps: Details dl (Published, Written by, Tags) and Linked in this note (numbered internal links)).
  - D: note + aside side by side. T/F: aside under the note, its two cards side by side. P/C: stacked.
- Bento: More on this tag (span3: tag segmented AI / Thailand / SME with counts, "Latest N of M other posts tagged X", 3 rows). `bento-2`: Keep reading (15 posts, Back to Blog) | A second set of eyes (Contact me).
- Sources: Sanity post (Portable Text via `components/PortableText.tsx`) or fallback paragraphs; related = other posts sharing a tag.
- Filters: related tag is local state (no URL needed).
- Not in repo: "Linked in this note" (derive from body links), "More on this tag", "Keep reading", "A second set of eyes", banner image.

### 4.19 Press -> `/press` (`_landing/press.tsx`; hidden from nav, noindex)

- Hero: eyebrow, h1 "Selected coverage and / mentions.", lead "Click through to read the full piece."
- Filter bar: All · 4, Feature · 1, Product · 2, Profile · 1 + "Showing N of 4".
- Bento with count-driven spans: 4 shown -> A span2, B 1, C 1, D span2; 3 -> span3, 1, 1; 2 -> span3, span3; 1 -> span3. Card: type kicker + date, banner placeholder figure (flex 1 1 260px, min-h 180), h3 external link, description, "View on {domain} ->".
  - T/F: span3 -> span 2, span2 stays 2. P/C: stacked.
- Sources: `lib/content/press.ts` (`pressItems`, `source` = type, `formatPressDate`).
- Filters: type -> typed `?type=feature|product|profile`.
- Not in repo: banner images (placeholders; repo has Unsplash stock URLs), "View on ..." microcopy.

### 4.20 404 (`NotFound`) -> root `notFoundComponent` (`components/NotFound.tsx`)

- Hero: eyebrow "Page not found", h1 "Nothing lives here.", lead.
- `bento-2`: status card "404 · Not found" (Ember square + pixel grid in `--signal`/`--river`) | Try one of these (4 rows: Home, Portfolio, Ventures, Contact; min-h 60) / Broken link? (span2: mailto with prefilled subject + Copy email).
- Sources: `components/NotFound.tsx` copy, `components/ui/PixelGrid.tsx`.
- Not in repo: "Page not found" eyebrow, "Broken link?" card (new). Ventures link target (see 6).

---

## 5. Responsive rules

Canvas CSS (verbatim):

```css
@media (max-width:1023px){.kj .bento{grid-template-columns:repeat(2,minmax(0,1fr)) !important}.kj .span3{grid-column:span 2 !important}}
@media (max-width:640px){.kj .bento,.kj .bento-2{grid-template-columns:minmax(0,1fr) !important}.kj .span2,.kj .span3{grid-column:auto !important}}
@media (max-width:560px){.kj .kj-email{display:none !important}}
@media (max-width:380px){.kj .kj-col{padding-left:16px !important;padding-right:16px !important;gap:44px !important}.kj .kj-icon{width:44px !important;height:44px !important}}
```

| Width | Frame(s) | `.bento` | `.bento-2` | Other |
|---|---|---|---|---|
| >=1024px | desktop 1440 (column 1000px) | 3 cols; span2/span3 honoured | 2 cols | |
| 641-1023px | tablet 768, fold open 673 | 2 cols; `span3` -> span 2; `span2` -> span 2 | 2 cols | flex-wrap rows wrap by their `flex-basis` |
| 561-640px | (none drawn) | 1 col; spans reset | 1 col | |
| <=560px | phone 390, cover 344 | 1 col | 1 col | header email hidden; Bangkok card switches to stacked layout via container query (container <=560) |
| <=380px | cover 344 | 1 col | 1 col | column padding 16px, section gap 44px, header icon buttons 44px |

Tailwind 4 mapping: canvas breakpoints are max-width at 1023/640/560/380, so mobile-first equivalents are `min-width` 1024 (Tailwind `lg`, matches), 641 (not `sm`=640: at exactly 640px Tailwind `sm:` would already be 2-col; add `--breakpoint-*` 641px or use `min-[641px]:`), 561 and 381. Use `@container` for the Bangkok card (Tailwind 4 `@container` + `@max-[560px]:`). Drop the `!important` overrides by authoring spans responsively (`col-span-1 min-[641px]:col-span-2 lg:col-span-3`).

Other collapse behaviour:
- Flex-wrap rows (Skills install row, About FAQ+Next, Resume Skills+Share, Post note+aside, Examples cards, Project prev/next, persona and metric tiles, hero rows) wrap purely by `flex-basis`; no media queries.
- Fixed inner grids that do NOT collapse: Project flow `ol` (4 cols), menu Library grid (2 cols), Blog Archive counts (2 cols), Resume Currently (`auto-fit minmax(240px, 1fr)` collapses naturally).
- Horizontal scroll only inside the About heatmap region (`overflow-x: auto`, focusable).
- Display sizes use `clamp()` with `vw`; no other typographic breakpoints.

---

## 6. Gaps and questions

### Decisions needed

1. **CTA colour:** canvas primary = ink-inverse (`--cta`), site `--action` = Signal blue. Redefine `--action`/`--on-action` (affects `::selection`, contrast tests) or add `--cta`?
2. **Accent role:** add `--accent` (#2b3bff / #8e97ff) for markers, or keep markers on the palette Signal (which stays #2b3bff in dark, contrary to the canvas)?
3. **Ventures destination:** the menu "Ventures", Home "See both ventures", and 404 "Ventures" point at the GoGoCash case in the canvas. Live uses `/#ventures`, but the canvas Home has no ventures section or anchor. Options: add `id="ventures"` to the Home Ventures card, link `/ventures/gogocash`, or create a `/ventures` index (no canvas page).
4. **Footer:** canvas drops the live Work/Library/Resources columns, including the agent and SEO surfaces (`/agents.md`, `/sitemap.md`, `/llms.txt`, `/skills.md`). Keep them somewhere (footer row, menu) or remove?
5. **Resume chrome:** `/resume` lives in `_system` with `SystemLayout`; the canvas gives it full site chrome, Share and Detailed/Compact. Move it to `_landing`? Does Compact affect `pnpm pdf` output?
6. **Home Selected work:** which three projects and in what order (canvas: TBH Intranet, AI Automation, Node Validator; `portfolio.ts` order is TBH, Node, Email, AI and has no featured flag)?
7. **Retire old chrome?** Canvas has no IntroLoader, SmoothCursor, keyword tooltips, RouteFade, floating pill nav or Home About/Features/Proof strips. Confirm removal (and the tests that cover them).
8. **Typed search params scope:** canvas filters exist on Portfolio (category), Stack (group), Build (venture), Press (type), Examples (persona), Learn (lang), Skills (origin/invocation, install tab), Skill (install tab), Blog (tag, query), Resume (detail). The plan lists "skills stage and origin, press type, examples persona, English/Thai switch, blog tags". Which become URL state? Recommendation: all list filters to URL; install tabs, steppers, FAQ, metric tiles, related-tag tabs stay local.
9. **Sky by theme or by Bangkok time?** Canvas ties the day/night scene to the site theme, not the local Bangkok hour.
10. **Greeting copy:** Home h1 adds "Hi, I'm", which is not in `landing.ts`. Approve the new copy?

### Owner-supplied assets / content

11. Press banners: 4 images (canvas placeholders; repo uses Unsplash stock). Also confirm Press ships at all (hidden, noindex, and `proof.ts` notes the items are the owner's own sites, not real coverage).
12. Blog and Post banners (placeholders; repo uses Unsplash `STOCK_BANNER`). Blog remains hidden; design must keep no links to `/blog` outside the blog (canvas complies).
13. Venture core-loop stages and Skill "How it runs" step excerpts need structured data or must be omitted for entries without it.
14. Build board tickets KJ-21 and KJ-29 describe the pre-bento chrome; update `buildBoard.ts` after the redesign.
15. Resume "Currently · Manut AI" bullet conflicts with the Manut description elsewhere; confirm wording.

### Canvas gaps (template variants not drawn)

16. Venture: Manut (no metrics, different sections, no loop).
17. Project: Node Validator, Email Signature, AI Automation (other mockup kinds, possibly no workflow).
18. Skill: adapted skills (Origin card with upstream, SHA, patches), user-invoked skills, skills with no scripts.
19. Topic: the other two slugs in EN and TH (section/FAQ counts change the grid).
20. Post: Portable Text styles (headings, lists, code, images, quotes) beyond three paragraphs.
21. Contact: Turnstile widget placement, honeypot, and the error states `notConfigured`, `rateLimited`, `botCheck`, `tooLarge`.
22. Header panels: Escape/outside-click/focus handling (not expressible in the canvas format).
23. Resume University-era card at 641-1023px (implicit third column bug).

### Live routes with no canvas page

- `/design` (`_system/design.tsx`, design-system showcase): restyle with the new tokens, no canvas reference.
- `/studio` (Sanity Studio): out of scope.
- Route error boundary (`components/RouteError.tsx`): reuse the 404 layout?
- OG images (`opengraph-image.ts`, `portfolio|skills|topics|ventures.$slug.opengraph-image.ts`): not in the canvas; keep current art or restyle?
- `/ventures` index: does not exist (only `/ventures/$slug`).

### Canvas pages with no live route

- None. All 20 map (Post's canvas title `/blog/post` is the `$slug` template).

### Ratchet and gate risks to plan for

- Raw-hex ratchet (MAX 0) vs the Bangkok scene and the Venture logo backing: tokenise art colours in `globals.css`.
- Contrast tests: add pairs for `--muted` (display only), `--oncta`/`--cta`, `--onphoto2` over the scrim, Ember on `--surface`.
- LCP and the 200/255 KB budgets: blur-based entrance animations and the inline scene SVG (about 120 lines, five temple copies; use `<use href>` to dedupe).
- Visual baselines: entrance animations and the ticking clock must be disabled or frozen in Playwright (reduced motion + fixed clock) or every baseline flakes.
