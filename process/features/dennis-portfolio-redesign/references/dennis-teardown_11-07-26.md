# Dennis Snellenberg teardown (IA + interactions)

**Reference:** https://dennissnellenberg.com/  
**Date:** 11-07-26  
**Purpose:** Near-clone structure/interactions for Fronk — do not copy assets, “Dennis Sans”, or source JS/CSS.

## Stack observed on reference

- Locomotive Scroll (`has-scroll-smooth`)
- GSAP 3.9 + ScrollTrigger
- Barba.js page transitions
- jQuery (legacy)
- Custom font: “Dennis Sans”
- Dark canvas: `rgb(28, 29, 32)` / `#1c1d20`
- Hero field grey: ~`#999d9e`

## Fronk rebuild stack (locked)

- Lenis (not Locomotive) + GSAP ScrollTrigger
- Next View Transitions / custom overlays (not Barba/jQuery)
- Inter (OFL) as grotesque stand-in
- Portrait: `public/profile.jpg`

## Home IA

1. Multilingual intro loader (Hello / Bonjour / …)
2. `home-header`: portrait cutout, giant name marquee, role line, location pill, minimal nav
3. `home-intro`: brand statement + About CTA
4. `work-grid` / recent work cards
5. More work CTA
6. Footer: “Let’s work together”, email, local time, socials

## Other routes

| Path | Pattern |
|------|---------|
| `/work` | Large work list: client, location, services, year |
| `/about` | H1 statement, numbered service blocks, credentials |
| `/contact` | Giant CTA + contact details |

## Interactions to recreate

- Fullscreen menu (Navigation + Socials)
- Smooth scroll + scroll-triggered reveals
- Page transitions between routes
- Location pill (Fronk: Bangkok)
- Reduced-motion: skip loader loop, disable smooth scroll

## Honesty constraints for Fronk

- Real ventures only — no fake archive counts
- No Awwwards jury claims unless true
- No proprietary asset reuse
