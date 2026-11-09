# Phase 2 report: Home (09-11-26)

**Plan:** `../active/phase-2_home_PLAN_09-11-26.md`
**Branch:** `feat/redesign-home`
**Owner decisions (09-11-26):**
- keep the intro, restyled;
- hero: "Building fintech and AI from Bangkok." / "Founder of GoGoCash and Manut AI.";
- two ventures only (GoGoCash, Manut AI); Airplusauto is dropped everywhere.

## What changed

- **Hero** (`components/landing/Hero.tsx`), now a server component:
  - the CloudFront video and the `WordsPullUp` wordmark are gone;
  - a mono eyebrow ("Kunanon Jarat (Fronk) · Bangkok");
  - the owner's two-line statement as the h1, the second line in `ink-2`;
  - a one-line lead, then Contact (Signal) and See my work (ghost) pills;
  - a Paper card holding a `PixelGrid` in the live state plus a `Chip state="live"` reading "Building GoGoCash and Manut AI". The Ember squares come with that label.
- **Ventures** (`components/landing/Features.tsx`), now a server component:
  - two cards, each rendered once;
  - logo, number, title, summary, mono chips, and a unique link name ("GoGoCash case study", "Manut AI case study");
  - no video or photo cards, and no "Learn more" duplicates (findings 11, 17).
- **Proof strip** (`components/landing/home/ProofStrip.tsx`, new): the published metrics as stat tiles with tabular numerals. Only GoGoCash has published numbers, so that's 3 tiles.
- **Portfolio strip** (`components/landing/home/PortfolioStrip.tsx`, new): the 4 projects as numbered single-link cards, plus "All work" (finding 13).
- **About** (`components/landing/About.tsx`), now a server component: a short intro with keyword tooltips and a "More about me" pill. No framer-motion reveal.
- **Intro** (`components/landing/IntroLoader.tsx`): restyled to the page colours (light `#F5F6FA` with Ink text, dark Ink with Glaze) in Geist, Thai in Noto Sans Thai, with a mono Skip button. Timing unchanged.
- **Page order** (`app/(landing)/page.tsx`): Intro, Hero, Ventures, Proof, Portfolio, About.
- **Content** (`lib/content/landing.ts`): new `hero`, `about` and `ventures` shapes. Airplusauto is removed (it appeared only here), and the new copy uses no em-dashes.
- **Assets:** the Manut logo is now a 144 px WebP (`public/brand/manut-144.webp`, 2.8 KB vs the 73 KB PNG).
- **PixelGrid:** Glaze cells use a faint hairline tint in dark mode (noted in Phase 1).
- **Ratchets:** sub-12 px 30 → 27; raw hex 7 → 2 (only `SmoothCursor` is left).
- `tests/e2e/routes.ts`: the home heading pattern is updated.

## Verification Evidence

| Gate | Result |
|---|---|
| LCP on `/` (phone, 4x CPU, ~1.6 Mbps, 150 ms RTT, cold) | **0.93-1.03 s**, LCP element the h1 text (one run under load: 2.04 s). Production before: 13.1 s (video). Target < 2.5 s: pass |
| Requests to `d8j0ntlcm91z4.cloudfront.net` | None (the only host is the site) |
| JS on `/` (`perf:budget`) | 243.4 → 235.2 KB (-8.2 KB); worst route 292.1 → 287.6 KB |
| Images on `/` | 102 KB (production) → 5 KB |
| Link names on `/` | No name points at two destinations |
| Sub-12 px text / sub-24 px targets on `/` (probe) | 6 → 0 / 14 → 1 (the hidden skip link) |
| Intro (kept) | 1459 ms (throttled 1469 ms); skip clears in 302 ms; none under reduced motion |
| Layout at 390, 768, 1024, 1280, 1440 px, light and dark | No horizontal overflow; reviewed. The #51 wordmark overlap no longer applies (the wordmark is gone) |
| `pnpm typecheck` / `lint` / `test` | Pass; 0 errors (4 warnings, was 5); 92 files, 508/508 |
| `pnpm build:cloudflare` / `perf:budget` | Pass |
| e2e smoke + a11y (desktop + mobile, both themes) | 100/100 |
| Scripted review (20 routes × 2 viewports × 2 themes) | No overflow, no serif fallback, no page errors |

## Notes for later phases

- **framer-motion:** still on `/` through `LandingTopNav` (mobile menu animation) and `IntroLoader`'s parent tree. Phase 6 decides whether to drop it.
- **`WordsPullUp`, `WordsPullUpMultiStyle`, `AnimatedLetter`:** no longer used on `/`. Phase 6 confirms with knip whether anything else uses them before deleting.
- **`/contact`:** still a video hero, with LCP 8.7 s. Phase 3 replaces it.
