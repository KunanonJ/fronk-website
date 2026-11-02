# Website Power Upgrade — Umbrella

- **Date:** 18-07-26
- **Status:** SUPERSEDED (closed by the 02-11-26 plan audit; see "Audit 02-11-26" below)
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

## Audit 02-11-26

A plan audit closed this program. The phase table above was never updated, but most of the work landed in code. The FogLAMP design the program built on was replaced by `landing-cutover` on 19-07-26. The predecessor plan now lives at `dennis-portfolio-redesign/completed/foglamp-mood-portfolio_UMBRELLA_PLAN_18-07-26_SUPERSEDED.md`.

| Phase | Outcome | Evidence (02-11-26) |
|---|---|---|
| A | Landed | `Hanken_Grotesk` from `next/font/google` in `app/layout.tsx`; contract test in `lib/design/globals.test.ts`. The AGENTS.md typeface lock was never added. |
| B | Landed | `app/(landing)/ventures/[slug]/page.tsx` and `opengraph-image.tsx`; `sanity/schemas/venture.ts`; listed in `app/sitemap.ts`; in the e2e route list (`tests/e2e/routes.ts`) |
| C | Mostly landed | 3 `opengraph-image` routes, JSON-LD in 6 files, `app/manifest.ts` with a test. No `twitter-image` routes. |
| D | Mostly landed | axe e2e (`tests/e2e/a11y.spec.ts`), a visual-CI strategy (darwin-only baselines excluded in CI), `/test-results/` gitignored. Vitest coverage is configured but has no thresholds, so there is no coverage gate. |
| E | Superseded | No program report exists. Release and deploy moved to `landing-cutover`. |

The leftover gaps (no coverage thresholds, no `twitter-image` routes) are in `process/general-plans/backlog/backlog.md`.
