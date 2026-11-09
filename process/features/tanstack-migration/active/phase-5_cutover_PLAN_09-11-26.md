# Phase 5: Staging and cutover

**Status:** OUTLINE (finalised at phase entry).
**Created:** 09-11-26
**Umbrella:** `tanstack-migration_UMBRELLA_PLAN_09-11-26.md`

## Scope

Owner runs wrangler login; deploy the staging Worker fronk-website-start; parity crawl staging vs production clean; e2e, axe, visual and probe against staging; port perf:budget to the Vite manifest; switch build:cloudflare and wrangler.jsonc (main, assets, DO deleted_classes migration); merge on green (owner decision); verify production; rollback path documented.

## Gates

The exit gate in the umbrella table, plus the standard gates (typecheck, lint, unit tests, Next CI unchanged and green).

## Additions from the target architecture (09-11-26)

- `wrangler.jsonc` drops `r2_buckets`, both `durable_objects` and the self service binding; it adds `cache`, `ratelimits` and `triggers.crons`. Delete the `fronk-website-revalidate-cron` Worker a week after a clean run.
- Owner checks the Workers plan (Paid) before the cutover, and picks the one product analytics tool to keep next to Cloudflare Web Analytics; GTM is removed.
