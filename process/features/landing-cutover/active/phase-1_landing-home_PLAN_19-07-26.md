# Phase 1 — Landing Home

**Date**: 19-07-26  
**Status**: CODE DONE  
**Parent**: `landing-cutover_UMBRELLA_PLAN_19-07-26.md`  
**Feature**: `landing-cutover`  
**Depends on**: Phase 0 complete

## Goal

Replace `/` with the prisma-landing Home experience, including the smoothed Apple-style intro ending on **Welcome to KunanonJ**.

## Work packages

### WP-1.1 — Port client components

Copy/adapt from prisma-landing into `components/landing/` (all `"use client"` where motion/state needed):

| Source | Target |
|--------|--------|
| `IntroLoader.tsx` | `components/landing/IntroLoader.tsx` |
| `Hero.tsx` | `components/landing/Hero.tsx` |
| `About.tsx` | `components/landing/About.tsx` |
| `Features.tsx` | `components/landing/Features.tsx` |
| `WordsPullUp.tsx` | `components/landing/WordsPullUp.tsx` |
| `WordsPullUpMultiStyle.tsx` | `components/landing/WordsPullUpMultiStyle.tsx` |
| `AnimatedLetter.tsx` | `components/landing/AnimatedLetter.tsx` |

Adaptations:

- Replace `react-router-dom` `Link` with `next/link`
- Import content from `lib/content/landing` (or chosen path)
- Keep Tailwind class names; fix any v3→v4 breaks found in smoke
- Preserve IntroLoader timing/crossfade/blur + final welcome string

### WP-1.2 — Home page

- Rewrite `app/(landing)/page.tsx` to compose IntroLoader → Hero → About → Features → contact footer (match prisma `Home.tsx`)
- Drop Sanity `fetchHomePage` / FogLAMP home sections from `/`
- Metadata: use landing site title/description from content module

### WP-1.3 — Hash scroll

- Ensure `#about`, `#ventures`, `#contact` ids exist and `scroll-behavior: smooth` works on landing (respect PRM)

## Acceptance criteria

- [ ] `/` visually/behaviorally matches prisma Home (intro + sections + footer)
- [ ] Intro ends on **Welcome to KunanonJ**, session-once, PRM skips
- [ ] Nav / CTAs scroll to hash sections; About CTA points to `/showcase` (page may 404 until Phase 2 — acceptable temporary, or stub)
- [ ] No FogLAMP Header/Footer on `/`
- [ ] `pnpm typecheck` green; manual smoke on 375 / 768 / 1440

## Verification

1. Clear `sessionStorage.fronk-intro-seen` → reload → full intro
2. Second load → no intro
3. Click See ventures / nav links → correct sections
4. Console clean of React/hydration errors

## Out of scope

- Showcase page implementation (Phase 2)
- Deleting old `components/home/*` FogLAMP modules (Phase 2 cleanup)
- Production deploy
