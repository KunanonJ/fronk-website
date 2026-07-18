# Phase 2 — Home style + motion near-clone

**Date**: 11-07-26  
**Program**: dennis-portfolio-redesign  
**Status**: ⏳ PLANNED  
**Depends on**: Phase 1 ✅ VERIFIED  
**Report target**: `process/features/dennis-portfolio-redesign/reports/phase-2_home_REPORT_11-07-26.md`

---

## Objective

Rebuild `/` as a Dennis-like **style + motion** home: multilingual intro loader → portrait + name marquee hero → intro → recent work grid → writing strip → footer.

**Content:** keep or lightly adapt existing Fronk strings; placeholders OK. You replace final copy/images yourself.

## In scope

- Intro loader greeting cycle + reveal (PRM = skip)
- Hero: portrait slot (`public/profile.jpg`), giant name marquee, role line, location pill
- Intro section layout + About CTA
- Recent work grid styling + hover motion (real ventures only)
- Writing strip spacing/rhythm
- Remove Three.js particle field as primary hero
- Keep CMS `homePage` editable for your later content updates

## Out of scope

- Full `/ventures` page (Phase 3)
- Final marketing copy or new venture imagery (owner)
- Fake “More work N” counts

## Validation gates

1. Home section order matches reference IA  
2. Loader / marquee / reveals respect `prefers-reduced-motion`  
3. LCP: portrait or headline server-rendered; motion client-hydrated  
4. Suite + typecheck + lint; visual baselines for home  
5. Report written

## Blockers

- Cutout quality → ship with current `profile.jpg`; you replace later  
