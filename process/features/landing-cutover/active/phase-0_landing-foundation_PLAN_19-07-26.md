# Phase 0 — Landing Foundation

**Date**: 19-07-26  
**Status**: CODE DONE  
**Parent**: `landing-cutover_UMBRELLA_PLAN_19-07-26.md`  
**Feature**: `landing-cutover`

## Goal

Wire the Next.js app so landing pages can render without FogLAMP chrome, with prisma tokens/fonts/content and `framer-motion` available.

## Work packages

### WP-0.1 — Dependencies

- Add `framer-motion` to [package.json](package.json) (lucide-react already present)
- `pnpm install`

### WP-0.2 — Fonts

- In root or landing layout: `next/font/google` for **Almarai** (300/400/700/800) and **Instrument_Serif** (italic support)
- Expose CSS variables e.g. `--font-almarai`, `--font-instrument-serif`
- Landing body uses Almarai; `font-serif` / italic segments use Instrument Serif

### WP-0.3 — Tokens + CSS

- Port prisma colors into Tailwind v4 theme (or scoped `@theme` / utility classes):
  - `primary` `#DEDBC8`
  - showcase palette from prisma `tailwind.config.js`
- Port noise overlays + keyframe animations used by Showcase from [prisma-landing/src/index.css](file:///Users/kunanonjarat/Developer/prisma-landing/src/index.css) and [prisma-landing/tailwind.config.js](file:///Users/kunanonjarat/Developer/prisma-landing/tailwind.config.js) into [app/globals.css](app/globals.css) under a clear `/* landing-cutover */` section (avoid breaking remaining system pages)

### WP-0.4 — Content module

- Copy [prisma-landing/src/content/fronk.ts](file:///Users/kunanonjarat/Developer/prisma-landing/src/content/fronk.ts) → `lib/content/landing.ts` (or `lib/landing/content.ts`)
- Copy intro greetings (including final **Welcome to KunanonJ**) → `lib/content/introGreetings.ts` (replace/extend existing if present)
- Ensure `profile.jpg` exists under `public/` (copy from prisma `public/profile.jpg` if missing)

### WP-0.5 — Route groups + layout split

- Introduce App Router groups:
  - `app/(landing)/layout.tsx` — no `Header`/`Footer`/`SiteShell`; black canvas; fonts; analytics kept via root
  - `app/(system)/` — move `/studio` and `/resume` under system layout with minimal chrome (or keep paths via re-exports; **URL paths must stay `/studio` and `/resume`**)
- Refactor [app/layout.tsx](app/layout.tsx) so FogLAMP `SiteShell`+`Header`+`Footer` are **not** forced on landing children
  - Preferred: root layout = html/body/providers/analytics/json-ld only; chrome only in `(system)` or legacy group
- Move `app/page.tsx` into `app/(landing)/page.tsx` (placeholder OK until Phase 1 — may temporarily re-export old home)

### WP-0.6 — Next image / media hosts

- Extend `images.remotePatterns` in [next.config.ts](next.config.ts) for:
  - `images.higgs.ai`
  - `d8j0ntlcm91z4.cloudfront.net` (if using `next/image` for icons)
  - `soft-zoom-63098134.figma.site` (showcase assets)
- Hero/Features videos may stay as `<video src>` (no image config required)

## Acceptance criteria

- [ ] `framer-motion` installed; typecheck passes
- [ ] Landing layout renders a blank black page at `/` without FogLAMP header/footer
- [ ] `/studio` and `/resume` still resolve (smoke)
- [ ] Content module + intro greetings committed in-repo
- [ ] Almarai + Instrument Serif load on landing layout

## Verification

1. `pnpm typecheck` (or project equivalent)
2. `pnpm dev` — `/` has no FogLAMP nav/footer
3. `/resume` and `/studio` load

## Out of scope

- Porting Hero/About/Features/Showcase UI (Phase 1–2)
- Redirects and deleting FogLAMP pages (Phase 2)
