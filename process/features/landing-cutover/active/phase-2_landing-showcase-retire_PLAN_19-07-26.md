# Phase 2 — Showcase + Retire FogLAMP

**Date**: 19-07-26  
**Status**: CODE DONE  
**Parent**: `landing-cutover_UMBRELLA_PLAN_19-07-26.md`  
**Feature**: `landing-cutover`  
**Depends on**: Phase 1 complete

## Goal

Ship `/showcase`, redirect retired marketing routes, remove FogLAMP public pages/chrome from the live tree, and supersede the FogLAMP redesign program docs.

## Work packages

### WP-2.1 — Showcase

- Port `Showcase.tsx` + `SpotlightReveal.tsx` → `app/(landing)/showcase/page.tsx` + `components/landing/showcase/*`
- Replace router `Link` with `next/link`
- Port showcase keyframes/utilities if not fully done in Phase 0
- Verify spotlight cursor + splash intro + PRM path

### WP-2.2 — Redirects

Update [next.config.ts](next.config.ts) `redirects()`:

```ts
{ source: "/about", destination: "/#about", permanent: true },
{ source: "/ventures", destination: "/#ventures", permanent: true },
{ source: "/ventures/:slug", destination: "/#ventures", permanent: true },
{ source: "/contact", destination: "/#contact", permanent: true },
{ source: "/now", destination: "/", permanent: true },
{ source: "/writing", destination: "/", permanent: true },
{ source: "/writing/:slug", destination: "/", permanent: true },
{ source: "/work", destination: "/#ventures", permanent: true },
```

Note: Next.js hash redirects — if hash is stripped by the platform, use destination `/` plus client hash restore, or middleware. Prefer config redirects first; if Cloudflare/OpenNext drops hash, add a tiny client bridge on `/`.

### WP-2.3 — Delete / retire FogLAMP public pages

Remove (or move under `_archived/` only if needed for git history — prefer delete):

- `app/about/`, `app/contact/`, `app/now/`, `app/ventures/`, `app/writing/`
- FogLAMP-only home modules unused after cutover (`components/home/FeaturedWorkPreview`, `NarrativeBlock`, `ThreeStepEngage`, `AtmosphericCTA`, `WritingCallout`, old `Hero` if unused, FogLAMP `Header`/`Footer` if unused)
- Keep anything still imported by `/resume` or `/studio`

Update [app/sitemap.ts](app/sitemap.ts) to list `/`, `/showcase`, `/resume` only (plus any required system URLs).

### WP-2.4 — Process / context closeout

- Mark `foglamp-mood-portfolio_UMBRELLA_PLAN_18-07-26.md` and remaining FogLAMP phase plans **SUPERSEDED** by this cutover; move active FogLAMP plans to `dennis-portfolio-redesign/completed/`
- Update `process/features/CURRENT_FEATURES.md`: `landing-cutover` active; FogLAMP superseded
- Update `AGENTS.md` Learned Workspace Facts (public routes, design locks)
- Refresh `process/context/all-context.md` (or routed context) public-route notes if present

### WP-2.5 — Tests

- Update/remove e2e that assert FogLAMP routes/chrome
- Add smoke e2e: `/` loads KunanonJ wordmark; `/showcase` loads; redirected paths return 308/301

## Acceptance criteria

- [ ] `/showcase` matches prisma Showcase
- [ ] Retired marketing URLs redirect; `/` and `/showcase` are sole marketing UI
- [ ] `/resume` + `/studio` still work
- [ ] FogLAMP page routes gone from `app/`
- [ ] Sitemap + AGENTS + CURRENT_FEATURES updated
- [ ] FogLAMP umbrella marked superseded
- [ ] `pnpm typecheck` + relevant e2e green
- [ ] `pnpm run build:cloudflare` succeeds locally (deploy still gated)

## Verification

1. Manual click-through Home ↔ Showcase
2. Hit each old URL → lands on new experience
3. Cloudflare build green
4. No leftover imports to deleted components

## Out of scope

- Production deploy (`pnpm deploy`) without explicit approval
- CMS-driven landing content
