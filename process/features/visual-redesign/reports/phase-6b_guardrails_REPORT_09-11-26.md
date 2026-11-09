# Phase 6b report: visual baselines in CI, migration hand-off, closeout (09-11-26)

**Plan:** `../completed/phase-6_cleanup-guardrails_PLAN_09-11-26.md` (6a: `phase-6a_cleanup_REPORT_09-11-26.md`)
**Branch:** `feat/redesign-guardrails`
**Mode:** EXECUTE under the owner's standing approval.

## What changed

- **Visual regression in CI** (owner decision: Linux baselines plus a CI job):
  - `tests/e2e/visual.spec.ts` covers light and dark for every route in `tests/e2e/routes.ts`, except the CMS-driven `/resume` and `/blog`, at mobile (375) and desktop (1440);
  - the new CI job `visual` runs in `mcr.microsoft.com/playwright:v1.64.1-noble`;
  - the 68 baselines were captured by that job (bootstrap run with `--update-snapshots=all`), reviewed by hand as a contact sheet (themes applied, content present, Thai rendering, hub nav), and committed; the job now compares strictly;
  - the 21 stale darwin baselines are gone;
  - to refresh after an intentional change, run the Docker command in the spec header with `--update-snapshots=changed`.
- **Migration hand-off:**
  - `scripts/snapshot-heads.mjs` writes the head snapshot (title, meta, link tags, JSON-LD) of all 63 prerendered routes to `process/general-plans/references/head-snapshot_09-11-26.json`;
  - the TanStack research report gained a "Parity references" section (head snapshot, visual baselines, e2e suites, perf budgets, probe).
- **Dev speed:** `build:cloudflare` is now just `opennextjs-cloudflare build`. OpenNext already runs `pnpm build`, so the Sanity manifest and schema deploy run once instead of twice. This closes the backlog item.
- **Closeout:**
  - plans archived to `completed/`; `CURRENT_FEATURES.md` updated;
  - the old-look facts in `README.md`, `AGENTS.md` and `public/skills.md` are rewritten (cinematic/cream, framer-motion, Airplusauto);
  - resolved general-backlog entries removed (stale baselines, double Sanity steps, dead fallback components, the nav hydration warning, the `AGENTS.md` heading churn, the lint warnings);
  - leftovers are in `../backlog/open-items_09-11-26.md`.

## Verification Evidence

| Gate | Result |
|---|---|
| Visual bootstrap run (CI run 42594950395) | 68 captured; job green (container 26 s, build 28 s, capture 51 s) |
| Visual strict run | Recorded on PR #69 |
| Phase 6a live (#68) | e2e + axe 120/120 on kunanonj.com; `/stock/velorah` 308; live phone probe: LCP 1.30-1.75 s, CLS 0, 167-183 KB JS, no text under 12 px, no target under 24 px |
| `build:cloudflare` | Sanity manifest and schema step each run once; Worker bundles in about 31 s |
| Head snapshot | 63 routes; canonical, hreflang, OG and JSON-LD present |

## Program result (Phases 0-6, 09-11-26, #62-#69)

- **Look:** owner palette, light by default, Geist; every public route on role tokens. Legacy aliases are gone, with tests stopping them from coming back.
- **Accessibility:** axe clean in both themes on every route; no text under 12 px and no target under 24 px on 22 routes × 2 viewports × 2 themes.
- **Speed:**
  - phone LCP: home 13.1 s → 1.6-1.8 s, `/contact` 8-8.7 s → 1.6 s;
  - first-load JS budgets down from 205/300 KB to 200/255 KB;
  - dead code: 90 files and 6 packages removed.
- **Guardrails:** contrast, type-floor and raw-hex tests at 0; perf budgets; e2e smoke + axe; visual baselines in CI; knip clean.
