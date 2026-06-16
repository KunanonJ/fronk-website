# Current Fronk Site — Map (ground truth)

> Produced by a 5-analyst codebase sweep (2026-06-13), every claim `file:line`-grounded. Condensed here; this is the "before" the plan transforms.

## Aesthetic today: "Soft Brutalism"
Warm paper `#f5f5f0` / ink `#0a0a0a` (light) · `#0a0a0a` / paper (dark) · **mint** `#10b981`/`#34d399` · **2px ink borders** + **hard offset shadows** `4px 4px 0` · **Syne** display + Geist Sans (body) + Geist Mono · light/dark via `next-themes` (`defaultTheme="dark"`). Pure opposite of matveyan's cold-black hairline HUD.

## Token system — all in `app/globals.css` (no `tailwind.config`, Tailwind v4 CSS-first `@theme inline`)
- Colors `:42–64`; print override `:245–259`; easing `--ease-out-quint` `:32`; keyframes `:165–217`.
- **Absent:** no spacing scale, **no radius token** (already square via `rounded-none` — matches HUD), **no fluid type / `clamp()`**, no big-number style.
- Brutalist `@utility`s `:111–161`: `font-display`, `border-brutal`(2px), `shadow-brutal`, `sticker`, `card-brutal(+hover)`, `stagger`. **Restyling these cascades to ~20 components — the single highest-leverage lever.**
- ⚠️ `lib/design/globals.test.ts` guards these tokens/utilities; `components/ui/Badge.test.tsx:8,13` asserts `sticker`/`border-brutal` → **both go RED on restyle (rewrite with the design).**

## Fonts (owner's belief "Syne+Geist Mono" was incomplete)
Three families via `next/font/google` (`layout.tsx:65–82`): **Geist** (body), **Geist Mono** (labels, already used in 8 files), **Syne** 700/800 (display only). Inter absent. Mono foundation for HUD labels already exists.

## Routes & gaps vs matveyan
| matveyan | Fronk today | Gap |
|---|---|---|
| Hero (wordmark+HUD+ticker+WebGL) | `Hero.tsx` 2-col wordmark + headshot + pulsing badge | No HUD/ticker/ghost-numbers/WebGL; has a headshot matveyan lacks |
| WebGL coin field | `HeroCanvas.tsx` = **static CSS 48px grid** (misnomer, not canvas) | Net-new WebGL/canvas; mount slot+z-layer reusable |
| Specialization statement | featured-section kicker / About "How I work" | Needs the statement block |
| Selected **cases** (alternating) | `/ventures` 3-col grid, `VentureCard` | Only **2 ventures** (GoGoCash, Manut), uniform grid, link **external**, **no `/ventures/[slug]`** |
| Case **detail** page | — none — | Missing route + schema |
| 3-col technical résumé | `/resume` stacked cards (dense, good content) — **hidden from nav** | Re-layout to 3-col; un-hide decision |
| Giant wordmark footer | `Footer.tsx` small `text-2xl` wordmark | Net-new giant ghosted wordmark |
| Ticker / ghost numbers / cursor-HUD | — none — | Net-new |

**Fronk HAS that matveyan lacks:** `/now`, `/writing`+`[slug]` (full Sanity blog), `/contact` (8 channels), `/about` (long-form), Sanity CMS+`/studio`, light/dark toggle, headshot imagery.

## Motion today
**Zero JS motion.** CSS-only: `fade-up/in/slide-down/scale-in` keyframes + `stagger` (mount, not scroll). One `animate-ping` dot. `scroll-behavior:smooth` only. **`prefers-reduced-motion` CSS block exists** (`:300–314`) — but **no `matchMedia`/`useReducedMotion` JS hook** anywhere → every new JS animation must self-guard. `cssVar()` helper + `@theme` tokenization reusable.

## Stack & constraints
Next **16.2.6** (Turbopack-only, **no webpack config**, no `next lint`, **no JS-size in build output**), React 19.2, Tailwind v4 CSS-first, Sanity Cloud + `/studio`, pnpm 10.28.1, Cloudflare Workers/OpenNext deployment, separate Cloudflare Cron Worker. **No three/gsap/framer (direct).** Tests: Vitest (16 files) + `@playwright/test` installed **but no `playwright.config.ts`/`tests/e2e/`** (only used by `pnpm pdf`). `pnpm pdf` renders `/resume`→PDF via `@media print` (`:243–298`) — **preserve**. CI: typecheck→lint→test→build must stay green.

## Perf budget (the gating risk)
Landing JS **<150kb gzip**, CSS <30kb, LCP <2.5s, CLS <0.1, INP <200ms. Current baseline is *extremely lean* (≈zero client-anim JS). **Three.js (~40–50kb gzip core + scene) can consume the entire budget alone.** Mitigations mandatory: lazy `await import`, `ssr:false`, static server-rendered LCP fallback, evaluate `ogl`(~10–15kb)/raw-canvas; measure via Lighthouse/bundle-analyzer (build output won't tell you).

## Font licensing
**Cartograph Mono CF = PAID (Connary Fagen) — do not ship.** Inter = OFL (safe). Free mono with terminal character: **JetBrains Mono** (Apache), **IBM Plex Mono** / **Space Mono** (OFL), or **Geist Mono** (already wired, zero-cost).
