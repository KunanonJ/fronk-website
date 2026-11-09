# Phase 5: Staging and cutover

**Status:** OUTLINE (finalised at phase entry).
**Created:** 09-11-26
**Umbrella:** `tanstack-migration_UMBRELLA_PLAN_09-11-26.md`

## Scope

Owner runs wrangler login; deploy the staging Worker fronk-website-start; parity crawl staging vs production clean; e2e, axe, visual and probe against staging; port perf:budget to the Vite manifest; switch build:cloudflare and wrangler.jsonc (main, assets, DO deleted_classes migration); merge on green (owner decision); verify production; rollback path documented.

## Gates

The exit gate in the umbrella table, plus the standard gates (typecheck, lint, unit tests, Next CI unchanged and green).
