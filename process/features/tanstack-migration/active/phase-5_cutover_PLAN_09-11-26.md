# Phase 5: Staging and cutover

**Status:** DONE 09-11-26. Production is TanStack Start (version 9f694ce7 from a clean checkout of main, then Workers Builds 3b71dc3f after #77). All 120 reference URLs match on kunanonj.com; 77 Worker invocations during the crawl, all ok.
**Created:** 09-11-26
**Umbrella:** `tanstack-migration_UMBRELLA_PLAN_09-11-26.md`

## Scope

Owner runs wrangler login; deploy the staging Worker fronk-website-start; parity crawl staging vs production clean; e2e, axe, visual and probe against staging; port perf:budget to the Vite manifest; switch build:cloudflare and wrangler.jsonc (main, assets, DO deleted_classes migration); merge on green (owner decision); verify production; rollback path documented.

## Gates

The exit gate in the umbrella table, plus the standard gates (typecheck, lint, unit tests, Next CI unchanged and green).

## Additions from the target architecture (09-11-26)

- `wrangler.jsonc` drops `r2_buckets`, both `durable_objects` and the self service binding; it adds `cache`, `ratelimits` and `triggers.crons`. Delete the `fronk-website-revalidate-cron` Worker a week after a clean run.
- Owner checks the Workers plan (Paid) before the cutover, and picks the one product analytics tool to keep next to Cloudflare Web Analytics; GTM is removed.
- Carried from Phase 4: on staging, send a signed test webhook and confirm the tag purge (`ctx.cache.purge` returns success and the next request misses), check stale-while-revalidate inside `CDN-Cache-Control`, and measure a cold `/resume` render's CPU time. Set `SANITY_REVALIDATE_SECRET` on the Worker and point the Sanity webhook at the Start Worker at cutover.

## Staging results (09-11-26, https://fronk-website-start.myinternal.workers.dev)

- Parity: all 120 reference URLs match (one extra crawled JS asset, not a page).
- Worker cache: `/resume` and OG images return `cf-cache-status: HIT`.
- Purge: a signed webhook for `resumeProfile` purges `resume` (next `/resume` MISS, then HIT); `/blog` stays cached; a `post` webhook purges `/blog`. A bad signature gets 401.
- CPU: a cold `/resume` render takes 60-139 ms CPU (wall 126-289 ms). Prerendered pages never reach the Worker.
- Secrets reach `process.env` in the shared handlers (contact returned "That didn't send." with a fake Resend key, not "not connected").
- Not verified: stale-while-revalidate inside `CDN-Cache-Control` (needs a one-day expiry; purges drive freshness here, so the risk is low).

## Cutover design

- `wrangler.jsonc` is the Start production config: `src/server.ts` main, Worker cache, hourly cron, `FORM_RATE_LIMIT`, `run_worker_first` for trailing slashes. The R2 bucket and the self service binding go (bindings are per version, so a rollback restores them).
- OpenNext's Durable Object classes stay bound and are exported as empty classes, so the v1 migration still matches and a dashboard rollback to the Next version works. Phase 6 deletes them with a migration.
- `src/server.ts` also answers the old cron Worker's `GET /api/cron/revalidate` (Bearer `CRON_SECRET`) until that Worker is deleted.
- `build:cloudflare` builds Start (`vite build` between the Sanity steps); `deploy`, `upload` and `preview` use wrangler with the Vite output; `deploy:staging` builds against `wrangler.start.jsonc`.

## Cutover incident (09-11-26)

The Workers Builds production deploy of #76 failed while the PR's `versions upload` had worked. Wrangler 4.156 hands `wrangler deploy` to `opennextjs-cloudflare deploy` when `next.config.*`, `open-next.config.*` and `@opennextjs/cloudflare` all exist. With the owner's go-ahead, production was deployed from a clean worktree of main with `open-next.config.ts` removed; #77 removed it from the repo, and the next Workers Builds deploy succeeded. Production stayed on the last Next version until then.

