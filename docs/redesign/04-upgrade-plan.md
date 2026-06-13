# Fronk Website → matveyan-style Redesign — Master Plan

> Goal: re-skin kunanonj.com from "Soft Brutalism" to matveyan.com's **dark terminal/HUD** language — including the animations & parallax — without breaking content, CMS, perf budget, the resume-PDF pipeline, or CI.
> Read alongside: `01-matveyan-teardown.md` (target, measured), `02-current-site-map.md` (before), `03-design-system.md` (new tokens).
> Methodology: **TDD-first, phase-by-phase, commit-at-green, each phase independently revertible.**

---

## 0. Strategy in one breath

The whole site's look lives in **~6 shared utilities + the token block in `app/globals.css`**. So we **flip the foundation once** (Phase 1) and ~20 components shift at once; then we **restyle the shell + primitives** (Phases 2–3); then we **build the net-new instrument layer** — HUD, ticker, parallax hero (Phases 4–5); then we **recompose each page** into matveyan's structures (Phases 6–7); then **motion polish + a11y + perf QA** (Phase 8).

**Order matters:** foundation → shell → primitives → instruments → composition → polish. Each phase is shippable on its own and leaves `main` green.

---

## 1. DISSENT — risks, blast radius, reversibility (read before approving)

| Concern | Assessment |
|---|---|
| **Blast radius** | Phase 1 touches `globals.css` tokens/utilities → **cascades to ~20 components** + breaks 2 guardrail tests by design. Largest single blast; everything after is localized. |
| **Biggest risk** | **Perf budget.** A faithful WebGL coin field can blow the 150kb landing-JS cap by itself. Mitigated by the Phase-5 fork (lightweight canvas default) + lazy-load + static LCP fallback + bundle-analyzer gate. |
| **Honesty risk** | matveyan shows a **live market ticker** and **15 yrs / 6 cases**. Fronk has **2 ventures** and no market data. We must NOT fake tickers or invent cases (violates the repo's honesty rules). The ticker becomes an **honest "now" strip**; ventures stay 2 but rendered rich. |
| **Identity risk** | This is a full visual-identity change (warm→cold). It's **R1** (costly to reverse perceptually) but **fully git-revertible** per phase. |
| **What momentum hides** | The current site is *lean and accessible*. The redesign adds client JS, WebGL, and continuous motion — each a CWV/a11y liability. The plan front-loads the `useReducedMotion` hook + perf harness (Phase 0) so we never fly blind. |
| **Rollback** | `git revert` the phase's commit(s). Tokens are the cascade point: reverting Phase 1 restores the whole look. No data migrations except the optional `/ventures/[slug]` Sanity schema (additive, removable). |

---

## 2. Decisions to lock BEFORE coding (NO MAGIC — owner must choose)

**LOCKED 2026-06-13** (owner decisions in **bold ✔**); remaining are my defaults, confirm-as-we-go.

| # | Decision | Options | Choice |
|---|---|---|---|
| **D1** | Theme model | (a) dark-only · (b) keep light/dark | ✔ **(b) KEEP light + dark.** Build the terminal look in **dark** as the reference, **design a coherent light variant** (paper bg + dark hairlines + same HUD/frame/mono motifs), keep `next-themes` + `ThemeToggle`. ⚠️ ~2× the token/styling work — both palettes must be intentional (matveyan only gives us the dark reference; the light terminal is our own design). |
| **D2** | Background field fidelity | (A) Three.js · (B) lightweight canvas · (C) CSS/SVG | ✔ **(A) FULL THREE.JS** (max fidelity). Mandatory mitigations: `next/dynamic`+`await import('three')`, `ssr:false`, **static server-rendered headline as the LCP element**, reduced-motion→static still, **merge gated on Lighthouse + bundle-analyzer**. If it busts the 150kb landing-JS budget, surface to owner before shipping (do not silently exceed). |
| **D3** | The "objects" theme | coins are crypto; Fronk isn't | Default: **venture/builder glyphs or abstract typographic particles** (honest to founder·builder·writer). Confirm visual at Phase 5. |
| **D4** | Instrument (mono) font | Geist Mono · Space/IBM Plex/JetBrains · Cartograph (PAID — excluded) | ✔ **SPACE MONO** (OFL, free) — wired in Phase 1 as `--font-mono` (weights 400/700) for all HUD labels/eyebrows/ticker/code. Geist Mono dropped. |
| **D-color** | Accent discipline | colorless · earned mint · other hue | ✔ **KEEP MINT as earned accent** (links, focus, `.`, primary CTA — used sparingly). Shell stays monochrome; mint is the one earned highlight. |
| **D5** | Status ticker content (honest) | real signals only | `BUILDING: GoGoCash · Manut` · `BKK <local time>` · `LATEST: <post>` · real `USERS 1,000+` etc. No fake market data. Confirm at Phase 4. |
| **D6** | Ghost numbers | honest metrics or decorative | Real GoGoCash/Manut figures or omit. No invented numbers. |
| **D7** | `/resume` in nav | keep hidden · expose | Default keep current (hidden) unless owner says expose. |
| **D8** | `/ventures/[slug]` case pages | add · external links | ✔ **ADD** rich case-detail route + additive Sanity `ventureCase` schema (static fallback). Built as its **own later PR** (Phase 7b). |
| **D9** | Headshot | matveyan is faceless | Keep on `/about`; drop from hero. |

---

## 3. Phases (TDD loop each: RED → GREEN → REFACTOR → full suite+lint+typecheck+build green → commit)

### Phase 0 — Foundations & instrumentation · R2
*No visual change; make the redesign measurable and motion-safe.*
- Add `lib/hooks/useReducedMotion.ts` (client `matchMedia` hook) + test. **Every later JS animation imports this.**
- Stand up **Playwright visual-regression harness**: `playwright.config.ts` + `tests/e2e/` with baseline screenshots at 320/375/768/1024/1440/1920 (the repo has Playwright installed but no config). This is the safety net for a visual-heavy redesign (owner's web-testing rules).
- Perf baseline: **qualitative** for now — the current site ships ~zero client-animation JS, so it's trivially within budget. The `@next/bundle-analyzer` + Lighthouse gate is **wired at Phase 5** (where Three.js makes it load-bearing), not here — avoids a premature dep. *(Note: `next/dist/bundle-analyzer` is NOT the analyzer wrapper — it's a static artifact dir; verified.)*
- Decision sign-off (D1–D9) captured in this doc.
- **Exit:** `useReducedMotion` + Playwright harness (visual + smoke + a11y/reduced-motion) run green; suite/typecheck/lint/build green.

### Phase 1 — Token & utility flip (the cascade) · R1 · highest leverage
- Rewrite `app/globals.css` `:root` → black/white/hairline palette (`03-design-system.md §3`); keep the light palette **only inside `@media print`**.
- Fonts (`layout.tsx`): **drop Syne**; set body=Geist (or add Inter — D-minor), wire **mono instrument** (Geist Mono) weights 300/400; sans weights 300/400/600 for weight-contrast.
- Replace brutalist utilities → motif utilities: `border-brutal`(2px)→hairline 1px; `shadow-brutal`→removed; `card-brutal`→`panel-hud` (hairline, faint fill, no shadow); `sticker`→`label-hud`; add `app-frame`, `btn-hud`, `rule-hud`, `<CornerTicks>`, fluid type scale + ghost-number style.
- **RED first:** rewrite `lib/design/globals.test.ts` + `components/ui/Badge.test.tsx` to assert the NEW tokens/classes (tests change *with* the design — that's correct TDD here, not cheating).
- Strengthen grain overlay opacity `0.02→0.035`.
- **Exit:** site renders dark/hairline everywhere (rough but coherent), suite green. **This is the single most impactful commit.**

### Phase 2 — Shell chrome · R1
- `SiteShell`: add fixed **window-frame** (1px inset 10px) + corner ticks; keep Studio-gating/skip-link/per-route fade.
- `Header`: hairline top bar, mono tick nav links, drop Syne wordmark + mint dot; remove `ThemeToggle` if D1=dark-only.
- `Footer`: **giant ghosted wordmark** ("KUNANON"/"FRONK") with top→bottom glow; hairline dividers; keep socials/pages data.
- `MobileNav`: reskin (keep its solid focus-trap/Esc/scroll-lock a11y logic).
- **Exit:** chrome reads as matveyan; suite green.

### Phase 3 — UI primitives restyle · R2 (per-component TDD)
- `Button` → tick-button (1px, sharp, mono uppercase, `<CornerTicks>`, hairline-brighten hover); keep variant/size API.
- `Card` → `panel-hud`; `Badge` → mono `label-hud`; `SectionHeader` → mono kicker + weight-contrast title; `PageHeader` → mono eyebrow + uppercase weight-contrast H1; `Prose` → dark terminal typography (preserve print); `CompanyLogo` → dark chip.
- **Exit:** all inner pages inherit the look; suite green.

### Phase 4 — The instrument layer (net-new client) · R2
- `<TelemetryHUD>` (client, fixed bottom-right): live `CURSOR X/Y`, `SCROLL` (0–1), `TIME` — `requestAnimationFrame`, **hidden on touch + when `useReducedMotion`**. Mirrors matveyan's measured HUD.
- `<StatusTicker>` (bottom strip): honest "now" signals (D5), red/green only where truthful; CSS marquee, **pauses on reduced-motion**.
- Scroll→CSS-var bridge: a small client effect writing `--scroll-progress`/`--hero-*` to drive Phase-5 recede (matches measured curve in `01-…§4.1`).
- **Exit:** HUD + ticker live on home; reduced-motion verified; suite green.

### Phase 5 — The hero · R1 · biggest perf gate
- Hero recede: scale `1→.89`, opacity `1→0`, blur `0→9.4px` over 1vh (measured curve), via the Phase-4 scroll vars; **static server-rendered LCP element** (headline) so LCP never depends on the canvas.
- Background field per **D2 = (A) full Three.js**: a wireframe-polyhedra "systems field" reacting to cursor+scroll, **lazy `dynamic(import, {ssr:false})`** in `HeroBackdrop`, reduced-motion → static schematic grid (the WebGL chunk is never even requested, since `useReducedMotion` returns `true` on the server snapshot). Full GPU cleanup + WebGL-context-failure guard on `HeroField`.
- **Perf gate (measured 2026-06-13, see §5):** Three.js is **provably excluded from first-load** (480kb async-only chunk; home first-load 193.6kb gz ≤ the content pages' ~197kb). The 150kb fear about Three.js was wrong — three is budget-neutral; the framework floor (~194–197kb, uniform) is the real cost, so the **budget was re-baselined to ≤205kb (owner-approved)** and the D2 canvas fallback is moot (it'd reclaim ~0kb). Gate enforced by `pnpm perf:budget`.
- **Exit:** hero matches matveyan feel; three async-isolated; `pnpm perf:budget` + unit/typecheck/lint/build green. *(Lighthouse LCP/CLS field-verification folded into Phase 8 QA, where CWV lives.)*

### Phase 6 — Home composition · R1
- Specialization statement block (weight-contrast headline + slash eyebrow + dual tick-CTAs + inline color accents).
- Ventures as **alternating "case cards"** (text↔visual), each in its product brand color, real screenshots; **big ghost numbers** between (D6, honest).
- Writing CTA in terminal style.
- **Exit:** home is a faithful matveyan-style narrative with honest Fronk content; suite green.

### Phase 7 — Inner pages · R1
- `/ventures`: alternating cases; **(D8) optional `/ventures/[slug]`** cinematic case-detail template (big overlapping title + intro + PROBLEM/SOLUTION editorial + brand-panel screen showcases, Fancybox-style zoom) + additive Sanity `ventureCase` schema with static fallback. *(Largest sub-scope — can be its own PR.)*
- `/resume`: re-lay to **3-column technical résumé** (experience / skills / projects) with index numbers + fade-out tail; **preserve `@media print`→PDF**; (D7) nav decision.
- `/about` `/now` `/contact` `/writing`(+`[slug]`): reskin to terminal editorial (mono eyebrows, hairlines, weight-contrast headings). Keep Sanity + fallbacks intact.
- **Exit:** every route on-language; CMS + PDF intact; suite green.

### Phase 8 — Motion polish, a11y, perf, QA · R1
- Scroll-reveal via `IntersectionObserver` (reduced-motion gated), reusing existing fade keyframes.
- Micro-interactions: tick hovers, nav, footer wordmark glow, ticker.
- **Full QA:** visual regression across all breakpoints + both motion settings; Lighthouse (CWV budget); cross-browser (Chrome/Firefox/Safari); keyboard nav; WCAG contrast on pure-black; reduced-motion E2E.
- **Exit:** budgets met, a11y passes, all green → done.

---

## 4. Test strategy (owner is strict TDD)
- **Unit/component (Vitest):** tokens/utility presence (`globals.test.ts` rewritten), restyled component classes/behavior, `useReducedMotion`, HUD math (scroll-progress calc), ticker honesty (no fabricated fields), safe content fallbacks unchanged.
- **Visual regression (Playwright, stood up Phase 0):** per-section screenshots at 6 breakpoints, light(print)+dark, reduced-motion on/off.
- **Behavioral, not implementation:** assert *the look/behavior*, not call sequences. A behavior-preserving refactor must not break tests.
- **Per phase:** write the failing test first, watch it fail for the right reason, minimum code to green, full suite + `tsc` + `eslint` + `pnpm build` green, commit.

## 5. Performance plan (gating, non-negotiable)
- Lazy-load any WebGL (`await import`, `ssr:false`); static LCP fallback; animate only `transform/opacity/filter`; `will-change` narrowly; ticker/HUD throttled to RAF.
- **Tooling reality (measured Phase 5):** Next 16 prints no First-Load-JS table, and `@next/bundle-analyzer` is a *silent no-op under the default Turbopack build*. So the gate is measured from the shipped output — `pnpm perf:budget` (`scripts/check-first-load-budget.mjs`) reads each prerendered route's HTML and gzip-sums exactly the chunks the browser fetches; `pnpm analyze` forces the webpack treemap for module detail.
- **Budget re-baselined Phase 5 (owner-approved 2026-06-13):** landing JS **≤205kb gzip** (was an unmeasured 150kb), CSS <30kb, LCP <2.5s, CLS <0.1, INP <200ms. *Why:* the measured floor is **~194–197kb gz, uniform across every route** — pure React 19 + Next 16 App Router + shell, present before Phase 5. The hero adds ~0 to first load: **Three.js (480kb) is async-only and provably excluded** from every content route's first-load set; Sanity Studio (~1.3MB gz) is isolated to `/studio`. The 150kb target predated measuring the framework floor and was unreachable on this stack regardless of the hero. The gate's job is now **regression detection** (no app code leaking a heavy dep into first load), enforced by `pnpm perf:budget`. A phase that busts the re-baselined budget doesn't merge.

## 6. Honesty guardrails (repo rules)
- **No fabricated data:** ticker = real "now" signals; ghost numbers = real metrics or omitted; no invented cases — design richly for the **2 real ventures**.
- Inline "brand logos" = real venture/tech marks only.
- Keep all Sanity fallbacks honest and intact.

## 7. Rollback
Per-phase `git revert`. Phase 1 is the cascade point — reverting it restores the entire prior look. Only additive, removable migration is the optional `ventureCase` Sanity schema (Phase 7).

---

## 8. Suggested PR sequence
`P0 harness` → `P1 tokens(cascade)` → `P2 shell` → `P3 primitives` → `P4 HUD+ticker` → `P5 hero(+perf gate)` → `P6 home` → `P7 inner pages (+case-detail as its own PR)` → `P8 QA/polish`. Each green, each revertible.
