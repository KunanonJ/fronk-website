# matveyan.com — Design Teardown

> Captured 2026-06-13 via live browser inspection (Playwright) of https://matveyan.com.
> Reference screenshots in `./screens/`. All values are **measured computed styles**, not guesses.
> Purpose: ground the Fronk-website redesign in real facts. See `02-current-site-map.md` and `03-upgrade-plan.md`.

---

## 0. One-line essence

A **dark "trading-terminal / HUD" technical-brutalism** portfolio for a fintech product designer. Pure-black canvas, monospace instrument labels, a hairline window-frame, corner crop-marks, a **live telemetry HUD** (cursor/scroll/time), a **WebGL parallax coin field**, a **market ticker**, giant ghosted numbers, and disciplined color that appears *only* through brand logos / product mockups. It reads like a Bloomberg terminal designed by an art director.

---

## 1. Tech stack (observed)

| Concern | Implementation |
|---|---|
| Build | **Vite** (hashed assets: `style-BQJhYy7k.js`, `style-B4h1bHr3.css`) — a static multi-page site, **not** an SPA/Next app |
| Pages | Plain `.html` files: `index`, `crocowallet.html`, `cryptoportfolio.html`, `telegramwallet.html`, `cryptowidget.html`, `cryptoicon.html`, `fintechdesignsystem.html` + `cv.pdf` |
| 3D / parallax | **Three.js** (`three.module-*.js` + custom `home-scene-*.js`) — the floating coins are a real **WebGL scene** |
| Lightbox/gallery | **Fancybox v5** (fancyapps) — `--f-*` CSS vars; used to zoom case-study screens |
| Fonts | `Inter 18pt` (Light 300 + SemiBold 600), `Cartograph Mono CF` (Bold), `icomoon` (icons), tiny `Times` fallback |
| Analytics | Yandex Metrika |
| Scroll engine | CSS-variable driven (`--hero-scale/opacity/blur`, `--footer-opacity`) updated on scroll; coins driven in the Three.js loop |

**Implication for us:** matveyan is a hand-built Vite static site. We're porting its *design language* onto a Next 16 + Sanity app — not cloning its codebase. Three.js fidelity is a deliberate (costly) choice, not free.

---

## 2. Design tokens (measured)

### Color
- Background: **`#000` pure black** (`body` and `html` both `rgb(0,0,0)`).
- Text: **`#fff`** primary; secondary text is white at lowered opacity (~0.5).
- **Hairlines / borders / dividers / buttons: `rgba(255,255,255,0.1)`** — a single, ruthless 10%-white line is the entire "chrome" system.
- **Accent color is *earned*, never decorative**: it appears only via (a) inline brand logos (Behance blue, Dribbble pink, Android green, Apple), (b) product mockups in their own brand colors (Croco lime `#c8f560`-ish, Telegram blue `#2aabee`-ish, purple cards), and (c) ticker deltas (red `-`, green `+`). The shell itself is monochrome.
- Subtle film **grain/noise** texture over the black (atmospheric, low-contrast).

### Type
| Role | Font | Size | Weight | Tracking | Transform |
|---|---|---|---|---|---|
| Hero / statement headline | Inter 18pt | responsive (≈30–48px) | **300 base + 600 emphasis spans** | +2px | UPPERCASE |
| Section heading (case body: PROBLEM/SOLUTION) | Inter 18pt | ≈44–48px | 300 (light) | normal | UPPERCASE |
| Big case title (CROCO WALLET) | Inter 18pt | huge (≈90px+) | 600 | normal | UPPERCASE |
| Body / description | Inter 18pt | ~16px | 300/400 | normal | none, gray |
| **HUD / labels / eyebrows / buttons** | **Cartograph Mono CF** | **12px** | 300 | +1px | UPPERCASE |
| Footer wordmark "MATVEYAN" | Inter 18pt | massive (≈160px) | 600 | tight | UPPERCASE |

The signature type move: **weight contrast inside one uppercase line** — light Inter with semibold words pulled out (`**UI** × **UX** for capital…`, `I **SPECIALIZE IN** …`, `I have more than **15 YEARS OF EXPERIENCE**`).

### The window frame
```css
position: fixed;
inset: 10px;                 /* 10px gap on all sides */
border: 1px solid rgba(255,255,255,0.1);
pointer-events: none;        /* decorative */
```
A fixed hairline rectangle framing the whole viewport — the "instrument bezel."

### Buttons (the "tick-button")
```css
font: 300 12px/1.2 "Cartograph Mono CF"; text-transform: uppercase;
border: 1px solid rgba(255,255,255,0.1);
background: transparent;
padding: 18px 20px;
border-radius: 0;            /* sharp corners — NOTHING is rounded in the shell */
```
+ **corner crop-mark ticks** (small `┐┌┘└` marks) drawn at the four corners via pseudo-elements / SVG. Same tick motif decorates nav links (a small tick above each) and section corners (`+` marks, `[` brackets on the left rail).

### Motion easing
- Hero scroll recede is eased (see §4) — feels like `easeOutCubic`-ish on opacity, gentler on scale.
- Micro-transitions are short (`~.15s ease`, per the `--f-button-transition: all .15s ease`).

---

## 3. Page-by-page anatomy

### 3.1 Home — `/` (7163px tall, ~8 viewports)

Sections top→bottom:

**A. Hero** — `screens/matveyan-01-hero.jpeg`
- Top nav: left = `▮▮▮ MATVEY AN` logo + a waveform glyph; right = `CV BEHANCE DRIBBBLE LINKEDIN MAIL` (mono, uppercase, each with a corner tick). External links open in new tab.
- Centerpiece: logo mark (3 bars) → headline **`UI × UX FOR CAPITAL, DATA AND CONTROL`** (× is an icomoon glyph) → subcopy *"I design fintech platforms, industrial dashboards and design systems for companies where decisions cost millions"* → **`WRITE TO TELEGRAM`** tick-button.
- Background: **WebGL coin field** — XRP, IOTA, BTC, Polkadot, Stellar, etc. as grainy 3D coins scattered at varying depths, parallaxing to **cursor + scroll**.
- Bottom-left: avatar + *"I make complex financial systems simple for users."*
- **Bottom ticker bar** (fixed, fades on scroll): `BTC 63 562 -0.28% | IMOEX 2 515.33 -0.22% | S&P500 71 717 -0.33%` — live market data, red/green deltas, mono.
- Bottom-center: `▢ SCROLL DOWN` cue.
- **Bottom-right telemetry HUD**: `CURSOR X: 720 / CURSOR Y: 450 / SCROLL: 0.000 / TIME: 18.35` — tracks real cursor position, scroll progress (0→1), and a running timer. **This is the single most distinctive element.**

**B. Specialization** — `screens/matveyan-02-specialize.jpeg`
- Mono eyebrow: `NEO BANKING / BROKERAGE / TRADING / INVESTMENT / CRYPTO`.
- Statement headline with **inline color platform icons**: `I SPECIALIZE IN 🤖🍎 MOBILE APP DESIGN, ◈ DESIGN-SYSTEM DEVELOPMENT, AND COMPLEX 🌐 WEB INTERFACES FOR FINANCIAL` (Android green, Apple, diamond, globe — the only color in the section).
- Subcopy (availability statement) + **dual** tick-buttons: `WRITE TO TELEGRAM` · `DOWNLOAD CV`.

**C. Selected cases — intro** — `screens/matveyan-03-cases-intro.jpeg`
- Heading `SELECTED FINTECH CASES` + inline **Behance** (blue) & **Dribbble** (pink script) logos.
- Subhead `I HAVE MORE THAN **15 YEARS OF EXPERIENCE**`; caption `FREELANCE, OFFICE, REMOTE WORK, PERSONAL PROJECTS...`.
- **Client logo wall**: SBER · CUNEX · (chevrons) · cryptocopy · EVAA PROTOCOL · ICE MARKETS.

**D. Six case cards** — `screens/matveyan-04-case1.jpeg`, `-05-case2.jpeg`
- Each card = **split layout that alternates** text-left/mockup-right ↔ mockup-left/text-right.
- Text block: mono eyebrow (`APP DESIGN` / `CONCEPT`) → big title (`CROCOWALLET`, `TELEGRAM WALLET`) → gray description → `VIEW CASE` tick-button → links to the case `.html`.
- Visual block: **floating, overlapping device mockups** with depth/parallax, rendered in the **product's own brand color** (Croco lime, Telegram blue).
- Connective tissue: **giant ghosted numbers** (e.g. `$ 16,948.73`) bleeding between cases as background texture.
- Cases: CrocoWallet, CryptoPortfolio, Telegram Wallet, CryptoWidget, Fintech Design System, CryptoIcon.

**E. Experience / Skills / Personal Projects** — `screens/matveyan-06-experience.jpeg`
- **3-column technical résumé**:
  - **EXPERIENCE** — timeline entries: `2022–NOW · SBER` (mono) → `SENIOR DESIGNER` (bold) → description; faint right-aligned index `01/02/…`; thin divider; **oldest entry fades to low opacity**.
  - **SKILLS** — labelled list (UI & UX, Design System, AI Tools: Codex/ChatGPT/Claude, Design Management, Motion & Prototype, Presentation, Icon Design, 3D), each label + description + index.
  - **PERSONAL PROJECTS** — CryptoIcon (logo + `VIEW PROJECT`), Fintech Design System (`SOON` tag).

**F. Footer** — `screens/matveyan-07-footer.jpeg`
- **Giant full-width `MATVEYAN` wordmark** rising out of the dark with a top→bottom glow/gradient fade (letters emerge from black). HUD reads `SCROLL: 1.000`.

### 3.2 Case-study detail — e.g. `crocowallet.html` (12,891px tall)
- `screens/matveyan-08-casepage-hero.jpeg` — breadcrumb `HOME / CROCO WALLET`; **massive full-width title overlapping a cinematic 3D phone render** floating over moon-like terrain; intro paragraph.
- `screens/matveyan-09-casepage-body.jpeg` — editorial narrative: big **light-weight** section headings (`PROBLEM`, `SOLUTION`, …) + constrained body columns (~580px), generous vertical rhythm.
- `screens/matveyan-10-casepage-screens.jpeg` — **full-detail product screens on brand-color panels**, side-by-side, Fancybox-zoomable.

### 3.3 Mobile — `screens/matveyan-11-mobile-hero.jpeg`
- Nav wraps to two rows (`MATVEY AN`+waveform / link row).
- Content stacks, centered; **WebGL coin field persists**; single CTA.
- Ticker reflows to a 2+1 grid.
- **Cursor-HUD hidden on touch** (no pointer). Frame border persists.

---

## 4. Animation & parallax — the measured spec (the part to "align")

### 4.1 Hero scroll-recede (CSS custom properties, updated on scroll)
Measured `--hero-*` across one viewport of scroll (vh = 900):

| scrollY | `--hero-scale` | `--hero-opacity` | `--hero-blur` | `--footer-opacity` |
|---:|---:|---:|---:|---:|
| 0 | 1.000 | 1.000 | 0.00px | 1.000 |
| 150 | 0.972 | 0.767 | 2.33px | 0.246 |
| 300 | 0.943 | 0.528 | 4.72px | 0.004 |
| 500 | 0.916 | 0.302 | 6.98px | 0.000 |
| 700 | 0.897 | 0.143 | 8.57px | 0.000 |
| 900 | 0.887 | 0.056 | 9.44px | 0.000 |

Behavior: as you scroll the first viewport, the hero **scales 1.0→~0.89, fades 1.0→~0 (≈out by 1vh), and blurs 0→~9.4px** — it *recedes into depth* behind the incoming content. The fixed bottom **ticker/HUD bar fades out fast** (≈gone by 300px). Curve ≈ progress `p = scrollY/vh`: `opacity ≈ (1−p)^1.6`, `scale ≈ 1 − 0.113·easeOut(p)`, `blur ≈ 10·easeOut(p)px`.

### 4.2 WebGL coin field (Three.js)
- Full-viewport fixed canvas (1440×900 at desktop) behind all content.
- Coins parallax to **cursor** (subtle camera/offset on mousemove) and **scroll** (depth drift). Continuous slow idle rotation/bob. Grainy matte material, low-key lighting.

### 4.3 Live telemetry HUD
- Updates every frame: `CURSOR X/Y` = pointer coords; `SCROLL` = `scrollY / (scrollHeight − vh)` to 3 decimals; `TIME` = seconds since load (2-dec).
- Bottom-right, mono 12px. Hidden on touch.

### 4.4 Market ticker
- Bottom bar; symbols with last price + signed % delta; green up / red down; mono. Fades with hero on scroll.

### 4.5 Scroll-reveal
- Section content fades/translates in on enter (IntersectionObserver-style), subtle.

### 4.6 Micro-interactions
- Tick-buttons: border + corner marks brighten on hover (~.15s).
- Nav links: corner tick + slight emphasis on hover.
- Footer wordmark: glow gradient tied to scroll near the bottom.

---

## 5. The motif kit (what makes it "matveyan")

1. **Pure-black canvas** + low film grain.
2. **1px `rgba(255,255,255,.1)` window frame** inset 10px.
3. **Corner crop-mark ticks** on buttons / nav / section corners; sharp 0-radius everywhere.
4. **Cartograph Mono 12px uppercase** instrument labels & eyebrows.
5. **Inter weight-contrast** headlines (light + semibold) in UPPERCASE.
6. **Live telemetry HUD** (cursor / scroll / time).
7. **Market ticker** with red/green deltas.
8. **WebGL parallax field** of thematic objects.
9. **Big ghosted numbers** as connective background typography.
10. **Color only via real logos/product art** — never decorative.
11. **3-column technical résumé** with index numbers + fade-out tail.
12. **Giant wordmark footer** emerging from the dark.

---

## 6. Adapting the metaphor to Fronk (theme translation)

matveyan's instrument metaphor is **fintech/trading terminal**. Fronk is *founder · builder · writer*. The HUD/terminal language still fits a "builder" identity, but the *thematic objects* must change:
- Coin field → **a field of thematic 3D objects** that mean something for Fronk (e.g. ventures' glyphs, geometric "build blocks", or a typographic/particle field) — NOT crypto coins.
- Market ticker → a **"now / status" ticker** (e.g. currently-building, shipping count, location, local time, writing streak) — same instrument feel, honest content.
- "Selected fintech cases" → **Ventures** (alternating cards, real product screenshots/brand colors).
- Experience/Skills/Personal Projects → **Resume** (3-col technical résumé — near 1:1).
- Inline brand logos → Fronk's venture logos / tech-stack marks.
- Giant ghosted numbers → meaningful Fronk metrics (or de-emphasize if no honest numbers exist).

The **discipline** (monochrome shell, color only when earned, mono labels, hairlines, HUD) transfers wholesale. The **content** must stay honest (no fake tickers/metrics — see plan's "honesty" guardrail).
