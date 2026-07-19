# Landing Cutover — Umbrella

**Date**: 19-07-26  
**Complexity**: Phase program  
**Status**: CODE DONE (pending deploy approval)  
**Feature**: `landing-cutover`  
**Source prototype**: `/Users/kunanonjarat/Developer/prisma-landing` (Vite SPA at `:5173`)  
**Deploy**: keep Next.js + OpenNext + Cloudflare Workers (`pnpm run build:cloudflare`)  
**User locks**: **1C** full public UI cutover · **2A** port into existing Next stack

## Goal

Retire the FogLAMP / multi-page marketing design on [kunanonj.com](https://kunanonj.com/) and ship the prisma-landing experience (Apple-style intro → Home → Showcase) as the only public marketing UI, without abandoning the OpenNext worker deploy, `/studio`, or `/resume`.

## Locks

- Public **cinematic** marketing UI = prisma-landing Home + Showcase (`/`, `/showcase`)
- Intro: smooth multilingual loader ending on **Welcome to KunanonJ** (session-once, PRM skip)
- No `react-router-dom` in production — App Router + `next/link`
- No FogLAMP `Header` / `Footer` / `SiteShell` chrome on landing routes
- Keep `/studio` (Sanity) and `/resume` (CV utility) as system routes with minimal layout
- **Amended by `sea-discovery` (19-07-26):** keep `/about`, `/blog`, `/contact`, `/press`, `/topics/*`, `/th/topics/*`, and `/ventures/[slug]` **indexed** — do not redirect them into anchors
- `/ventures` index may redirect to `/#ventures`; named case hubs (`/ventures/manut`, etc.) must resolve
- FogLAMP redesign program (`dennis-portfolio-redesign` / `foglamp-mood-portfolio_*`) marked **SUPERSEDED** at closeout
- Production deploy still requires explicit approval (not implied by this plan)

## Route map (target)

| Path | Behavior |
|------|----------|
| `/` | New Home (IntroLoader + Hero + About + Ventures + contact footer) |
| `/showcase` | Creative Studio showcase page |
| `/resume` | Keep existing resume page (minimal layout, no FogLAMP marketing chrome) |
| `/studio/**` | Keep Sanity Studio |
| `/about` | Indexed authority page (sea-discovery) |
| `/blog`, `/blog/[slug]` | Indexed content engine (sea-discovery) |
| `/contact`, `/press` | Indexed conversion / PR |
| `/topics/*`, `/th/topics/*` | Indexed category pillars (sea-discovery) |
| `/ventures` | 308 → `/#ventures` |
| `/ventures/[slug]` | Indexed product case hubs (sea-discovery) |
| `/now` | 308 → `/` |
| `/writing` | 308 → `/blog` |
| `/writing/:slug` | 308 → `/blog/:slug` |
| `/work` | 308 → `/#ventures` |

## Phases

| Phase | Plan | Proves |
|-------|------|--------|
| 0 Foundation | `phase-0_landing-foundation_PLAN_19-07-26.md` | Deps, fonts, tokens, content module, landing route-group layout (no FogLAMP chrome) |
| 1 Home | `phase-1_landing-home_PLAN_19-07-26.md` | `/` matches prisma Home + intro behavior |
| 2 Showcase + retire | `phase-2_landing-showcase-retire_PLAN_19-07-26.md` | `/showcase`, redirects, FogLAMP pages removed, sitemap/context/AGENTS updated, FogLAMP umbrella superseded |

## Out of scope

- Changing Cloudflare account / worker name / custom domain wiring
- Rewriting Sanity schemas for the new landing (static content module is source of truth for v1)
- Porting Writing / Now as first-class pages (retired via redirect)
- Production `pnpm deploy` without explicit user approval
- Keeping prisma-landing as a long-term deploy target (reference only after port)

## Closeout

After Phase 2 validation:

1. Move FogLAMP active plans → `dennis-portfolio-redesign/completed/` with `_SUPERSEDED` suffix (or status headers)
2. Update `process/features/CURRENT_FEATURES.md` and `AGENTS.md` Learned Workspace Facts
3. Offer UPDATE PROCESS + `vc-git-manager` for commit split
