# Website Power Upgrade — Umbrella

- **Date:** 18-07-26
- **Status:** ACTIVE
- **Feature:** `website-power-upgrade`
- **Predecessor:** `dennis-portfolio-redesign/active/foglamp-mood-portfolio_UMBRELLA_PLAN_18-07-26.md` (CODE COMPLETE, deployed `e61f4eb`). This program continues it: executes the open owner follow-ups and the deferred power features, within the FogLAMP design locks.

## Owner decisions (locked 18-07-26)

- Scope: venture case pages + SEO/sharing + QA/CI hardening. Sanity CMS activation **out of scope**.
- Typeface: free Söhne-lookalike (**Hanken Grotesk**) replaces the Inter fallback now; `public/fonts/soehne/` drop-in upgrade path preserved.
- Production deploy to kunanonj.com at the end: **approved**.

## Design locks carried forward

FogLAMP mood: near-black `#0a0a0a`, grain 0.05–0.07, pill CTAs, minimal motion, honest metrics only, routes otherwise unchanged. Perf budget: landing JS ≤205kb gz, CSS <30kb.

## Phases

| Phase | Scope | Status |
|---|---|---|
| A | Typeface: Inter → Hanken Grotesk (`next/font/google`), tokens, contract test, AGENTS.md lock | pending |
| B | `/ventures/[slug]` case pages: resolver w/ code fallback, Sanity schema fields, FogLAMP UI, sitemap/metadata/JSON-LD, e2e | pending |
| C | SEO/sharing: per-page OG+twitter images, JSON-LD enrichment, webmanifest | pending |
| D | QA/CI: axe scan, coverage gate, test-results hygiene, visual-CI strategy | pending |
| E | Full gates + adversarial review + production deploy + program report | pending |

## Out of scope

Sanity dataset seeding; `/studio` and `/resume` redesign; new marketing copy (code-fallback copy reuses existing honest facts only).
