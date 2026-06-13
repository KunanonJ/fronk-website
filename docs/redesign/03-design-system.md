# Redesign Design System — matveyan → Fronk

> The new token layer that replaces "Soft Brutalism" with the matveyan "terminal/HUD" language.
> Grounds every value in either matveyan's **measured** styles (`01-matveyan-teardown.md`) or the current `app/globals.css`.
> This is the **single source of truth** for Phase 1 of `04-upgrade-plan.md`.

---

## 1. Identity shift (before → after)

| Axis | Current "Soft Brutalism" | Target "Terminal HUD" |
|---|---|---|
| Mood | Warm, playful, paper | Cold, precise, instrument |
| BG | `#f5f5f0` paper / `#0a0a0a` dark | **Pure `#000`** (dark-only — see §6) |
| Borders | **2px ink** + hard offset shadow `4px 4px 0` | **1px `rgba(255,255,255,.1)` hairline**, no shadow |
| Corners | Sharp + shadow lift | Sharp (radius 0) + **corner crop-mark ticks** |
| Accent | Mint `#10b981` everywhere | Monochrome shell; **color only when earned** |
| Display font | **Syne** 700/800 | **Inter weight-contrast** (300 + 600), uppercase |
| Mono | Geist Mono (incidental) | **Instrument font** — labels/HUD/eyebrows/buttons |
| Texture | Faint grain (keep) | Faint grain (keep, slightly stronger) |
| Chrome | Header + footer | + **window frame, telemetry HUD, status ticker** |

---

## 2. Fonts (decision: reduce, don't add)

matveyan = `Inter 18pt` (Light/SemiBold) + `Cartograph Mono CF` (Bold, **PAID**).

**Decision:** *drop Syne, reuse what's loaded, add zero paid fonts.*

| Role | New choice | Why |
|---|---|---|
| Body + headlines (weight-contrast) | **Geist Sans** (already loaded) — or swap to **Inter** for 1:1 fidelity | Geist is a near-Inter grotesque; using 300+600 weights gives matveyan's light/semibold contrast. Keeping Geist = 0 new bytes. |
| **Instrument font** (HUD, labels, eyebrows, buttons, ticker) | **Geist Mono** (already loaded) | Replaces the paid Cartograph Mono CF. Clean technical mono, zero new cost. |
| Display (Syne) | **REMOVED** | matveyan uses weight-contrast Inter, not a separate display face. Dropping Syne **saves ~2 weights** of font load. |

> ⚠️ **`Cartograph Mono CF` is commercial (Connary Fagen) — do NOT use it.** If you want more "terminal character" than Geist Mono, the free OFL options are **Space Mono**, **IBM Plex Mono**, or **Martian Mono**. Recommendation: ship with **Geist Mono** (zero-cost, already present); treat a characterful mono as an optional later polish. → **OPEN DECISION for the user.**

Weights needed: Geist Sans **300, 400, 600** (currently only default); Geist Mono **300, 400**. (matveyan headline base 300 + emphasis 600.)

---

## 3. Color tokens (new `:root`, dark-only)

```css
:root {
  /* Canvas */
  --bg:            #000000;   /* pure black (matveyan body) */
  --fg:            #ffffff;   /* primary text */
  --muted:         rgba(255,255,255,0.55);  /* secondary text/descriptions */
  --subtle:        rgba(255,255,255,0.35);  /* tertiary / captions */
  --faint:         rgba(255,255,255,0.10);  /* hairlines, borders, frame, dividers */
  --faint-2:       rgba(255,255,255,0.04);  /* panel fills, hover wells */
  --surface:       #0a0a0a;  /* slightly-raised panels (rare) */

  /* Earned accents — used ONLY in content, never in shell chrome */
  --pos:           #34d399;  /* ticker up / positive (reuse current mint family) */
  --neg:           #f87171;  /* ticker down / negative */
  --accent:        #34d399;  /* single brand accent for the rare highlight (links on hover) */

  /* Instrument */
  --hud:           rgba(255,255,255,0.55);  /* HUD telemetry text */
  --grain-opacity: 0.035;    /* was 0.02 — nudge up for matte-black feel */
}
```

**Rule of discipline:** the **shell** (frame, nav, buttons, HUD, ticker labels, dividers) uses only `--fg`, `--muted`, `--subtle`, `--faint`. Color (`--pos/--neg/--accent`, venture brand colors, real logos) appears **only inside content** (venture cards, ticker deltas, inline logos). This is what makes it read as "designed," not "rainbow."

---

## 4. The motif primitives (new utilities)

```css
/* Window frame — fixed hairline bezel inset 10px (matveyan measured) */
@utility app-frame {            /* applied to a fixed decorative div in SiteShell */
  position: fixed; inset: 10px; z-index: 50;
  border: 1px solid var(--faint);
  pointer-events: none;
}

/* Tick-button — transparent, hairline, sharp, mono uppercase + corner marks */
@utility btn-hud {
  display: inline-flex; align-items: center; gap: .5rem;
  font-family: var(--font-mono);
  font-size: 12px; font-weight: 300; letter-spacing: .04em;
  text-transform: uppercase; color: var(--fg);
  border: 1px solid var(--faint); background: transparent;
  padding: 18px 20px; border-radius: 0;
  transition: border-color .15s ease, background-color .15s ease;
  /* corner crop-marks drawn with a layered SVG/::before+::after — see component */
}
@utility btn-hud-hover { &:hover { border-color: rgba(255,255,255,.35); background: var(--faint-2); } }

/* Mono instrument label / eyebrow */
@utility label-hud {
  font-family: var(--font-mono);
  font-size: 12px; font-weight: 300; letter-spacing: .08em;
  text-transform: uppercase; color: var(--muted);
}

/* Hairline rule */
@utility rule-hud { border-top: 1px solid var(--faint); }
```

Corner crop-mark ticks: render as a small reusable `<CornerTicks/>` (4 absolutely-positioned 8px L-shaped SVG/box marks) layered on any framed element — buttons, section corners, the left rail brackets. Keep it one component, parametrized.

---

## 5. Type scale (Tailwind `@theme` additions)

| Token | Value | Use |
|---|---|---|
| Hero headline | `clamp(2rem, 1rem+4vw, 3.25rem)`, wt 300, +0.06em, UPPERCASE; emphasis spans wt 600 | Home/specialization statement |
| Case/section big title | `clamp(2.5rem, 1rem+6vw, 5.5rem)`, wt 600, UPPERCASE | Venture titles, case-detail H1 |
| Section heading (light) | `clamp(1.75rem, 1rem+2.5vw, 2.75rem)`, wt 300, UPPERCASE | PROBLEM/SOLUTION-style |
| Footer wordmark | `clamp(4rem, 2rem+16vw, 12rem)`, wt 600, tight, glow-gradient | Giant name footer |
| Body | `1rem`/`1.6`, wt 400, `--muted` | Descriptions |
| Label/HUD | `12px`, mono, wt 300, +0.08em | Eyebrows, HUD, ticker |
| Big ghost number | `clamp(3rem, 2rem+8vw, 7rem)`, wt 600, `--faint`→`--faint-2` | Connective background figures |

---

## 6. Open decisions (need the user) — surfaced in chat, not assumed

1. **Dark-only vs keep light/dark toggle.** matveyan is dark-only. Cleanest fidelity = drop `next-themes` + `ThemeToggle`, go pure-black. But you currently default-dark with system support, and **print/PDF depends on a light palette** (which we keep regardless via `@media print`). → *Recommend: dark-only for the live site; keep the light palette scoped to `@media print` so `/resume` PDF still works.*
2. **WebGL coin field** — full Three.js fidelity (~+150kb, perf cost) vs a lighter Canvas2D/CSS particle field vs a static grainy still. → big perf/effort lever (see plan).
3. **Mono font** — Geist Mono (free, loaded) vs add Space Mono/IBM Plex Mono for more terminal character.
4. **Theme of the "objects"** — coins are crypto; Fronk isn't. What's the honest equivalent field (venture glyphs / build-blocks / typographic particles)?
5. **Status ticker content** — must be honest (no fake market data). What real signals? (currently building, ships count, Bangkok local time, latest post, etc.)
