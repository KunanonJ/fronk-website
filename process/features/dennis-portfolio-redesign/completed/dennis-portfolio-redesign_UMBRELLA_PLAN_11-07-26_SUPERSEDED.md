# Dennis Portfolio Redesign — Umbrella / Orchestration Plan

**Date**: 11-07-26 (revised same day)  
**Complexity**: Phase program  
**Status**: SUPERSEDED 18-07-26 by `active/foglamp-mood-portfolio_UMBRELLA_PLAN_18-07-26.md` (FogLAMP mood pivot)  
**Feature**: `dennis-portfolio-redesign`  
**Reference**: https://dennissnellenberg.com/  
**Work packages**: [`references/multi-agent-work-packages_11-07-26.md`](../references/multi-agent-work-packages_11-07-26.md)  
**Locks (revised)**: dark-only `#1C1D20`; Söhne (Inter until `woff2`); **minimal motion** (no Lenis-default, magnetic, sticky cursor); 375/768/1440 miniature desktop

**Owner decisions locked**:
- Identity = near-clone of **structure, style, and animations**
- Scope = all public pages (chrome + page templates)
- Content = **you update** (copy, portrait cutout, venture media, socials) via Sanity/static files — agents ship placeholders / keep existing strings unless blocking layout
- Portrait path remains `public/profile.jpg` until you replace it

---

## Program Goal Charter

North star:
- Make kunanonj.com feel like dennissnellenberg.com in **layout, typography, color, spacing, and motion** — a reusable style + animation system — while you supply final content yourself.

Definition of done:
- Public pages share one Dennis-like visual system: charcoal canvas, large grotesque type, generous whitespace, work-grid patterns, fullscreen menu, rounded contact footer.
- **Full motion set** ships (see Animation inventory below) with `prefers-reduced-motion` fallbacks.
- Content slots are wired (CMS + static fallbacks) so you can replace copy/images without code changes for routine edits.
- Terminal/HUD chrome (AppFrame, TelemetryHUD, Three.js particle hero) is gone from the public shell.
- Studio, resume PDF, Sanity fallbacks, and Cloudflare build paths stay functional.

What "verified" means (program level):
- Each phase’s gates pass (tests + lint + typecheck + visual/smoke).
- Phase 6: reduced-motion QA, perf budget, e2e smoke on core routes.
- Phase reports under `process/features/dennis-portfolio-redesign/reports/`.

Scope tiers → phase mapping:
- Tier 1 Foundation → Phase 0 *(done)*
- Tier 2 Shell style + chrome motion → Phase 1
- Tier 3 Home layout + hero/loader/marquee motion → Phase 2
- Tier 4 Work / About / Contact templates + section motion → Phases 3–4
- Tier 5 Writing / Now templates + sitewide transition polish → Phases 5–6

Explicitly out of scope:
- Writing final marketing copy, venture case narratives, or sourcing project images (you)
- Copying Dennis proprietary font/assets/JS/CSS
- `/studio` and `/resume` visual redesign
- Production deploy without your approval
- Inventing fake work counts or credentials

Hard safety constraints:
- No proprietary Dennis assets / “Dennis Sans” / source JS
- No production deploy or live Cloudflare/Sanity mutation without approval
- No fabricated metrics or case studies
- Keep Sanity fallbacks + `pnpm test` / typecheck / build green per phase
- Git-revertible phase commits; no force-push to `main`

---

## Content contract (you own content)

| Agent delivers | You update later |
|----------------|------------------|
| Layout structure, CSS tokens, type scale, spacing | Headlines, bios, CTAs |
| Motion system (Lenis, GSAP, transitions, loader) | Portrait / cutout image |
| Work-grid / about / contact **templates** | Venture titles, tags, years, images, links |
| CMS field wiring + static fallbacks | Sanity Studio edits / seed files |
| Placeholder or existing Fronk strings that fit the box | Final voice and accuracy |

Agents will **not** block a phase waiting for perfect copy. If a string is required for layout, existing Fronk content or a short placeholder stays until you replace it.

---

## Style system inventory (must cover)

| Layer | Target |
|-------|--------|
| Canvas | Charcoal `#1c1d20`; mid-grey hero field `#999d9e`-class |
| Type | Large Inter (or licensed Neue Montreal later); weight contrast; oversized cropped wordmarks |
| Chrome | Minimal top nav; “© Code by …” left; Work/About/Contact right |
| Menu | Fullscreen overlay: Navigation + Socials columns |
| Location pill | Side pill + globe motif (Bangkok) |
| Work | Large image/title grid + list rows (client / location / services / year columns when data exists) |
| About | Big H1 + numbered service blocks |
| Contact / footer | Giant “Let’s work together”, email, local time, socials, rounded top transition |
| Writing / Now | Same chrome + type rhythm; readable long-form |
| Grain / texture | Subtle or none — prefer flat matte like reference |

Legal: structure/style/motion only — not his images, font files, or code.

---

## Animation inventory (must cover)

| Motion | Behavior | Reduced-motion |
|--------|----------|----------------|
| Intro loader | Cycle multilingual Hellos, then reveal | Skip / instant reveal |
| Name marquee | Horizontal looping oversized name behind/under portrait | Static cropped title |
| Smooth scroll | Lenis on public routes | Native scroll |
| Scroll reveals | GSAP ScrollTrigger fades/slides on sections | Instant visible |
| Page transitions | Overlay or View Transitions between routes | Instant cut |
| Fullscreen menu | Open/close with focus trap + scroll lock | Simple fade/instant |
| Work hover | Image/title hover magnetic or scale (touch-safe) | Opacity/underline only |
| Footer time | Live local clock (Asia/Bangkok) | Still update, no anim |
| Optional magnetic cursor | Only if a11y/perf OK | Disabled |

Stack (locked): Lenis + GSAP ScrollTrigger + Next-native transitions (not Barba/jQuery).

---

## Route mapping

| Dennis | Fronk |
|--------|-------|
| `/` | `/` |
| `/work` | `/ventures` + redirect `/work` → `/ventures` |
| `/about` | `/about` |
| `/contact` | `/contact` |
| — | `/writing`, `/writing/[slug]`, `/now` — same style system |
| — | `/resume`, `/studio` — functional only |

Nav: **Work · About · Contact** (Writing/Now in footer/secondary).

---

## Phase sequence

| Phase | Plan | Style / animation focus | Content |
|-------|------|-------------------------|---------|
| 0 | `phase-0_foundation_*` | Tokens, Lenis/GSAP gates, Inter | n/a — **CODE DONE** |
| 1 | `phase-1_shell_*` | Header, menu, location pill, footer CTA motion | Keep existing site strings |
| 2 | `phase-2_home_*` | Loader, portrait hero, marquee, intro, work grid, writing strip | Placeholders OK; you replace later |
| 3 | `phase-3_work_*` | Work index layout + hover motion | Wire fields; you fill media/copy |
| 4 | `phase-4_about_contact_*` | About blocks + contact giant CTA | Keep/adapt existing; you refine |
| 5 | `phase-5_writing_now_*` | Journal/Now templates in system | Posts stay yours via Sanity |
| 6 | `phase-6_polish_*` | Full motion polish, a11y, perf | Content freeze optional |

Advance **one phase at a time** per `process/development-protocols/phase-programs.md`.

---

## Resume handoff

- **Phase 0**: CODE DONE — [`reports/phase-0_foundation_REPORT_11-07-26.md`](../reports/phase-0_foundation_REPORT_11-07-26.md)
- **Execute order**: WP-01 → WP-02 (∥) → WP-03 → WP-04 → WP-05; WP-06∥WP-07∥WP-08 → WP-09
- Phase plans map to WPs: Phase 1≈WP-01–03, Phase 2≈WP-04–05, Phase 3≈WP-06, Phase 4≈WP-07, Phase 5≈WP-08, Phase 6≈WP-09
