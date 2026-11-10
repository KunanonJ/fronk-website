# Phase 4: Caching and Sanity

**Status:** DONE 09-11-26 (staging checks carried to Phase 5). Report: `../reports/phase-4_caching-sanity_REPORT_09-11-26.md`.
**Created:** 09-11-26
**Umbrella:** `tanstack-migration_UMBRELLA_PLAN_09-11-26.md`

## Scope

Sanity reads through createServerFn + TanStack Query (ensureQueryData in loaders); a response cache (Workers Cache API) for Sanity-backed routes with purge from the webhook and the hourly cron in src/server.ts (fetch + scheduled); draft-mode routes removed; runtime renders tested, not only prerenders.

## Gates

The exit gate in the umbrella table, plus the standard gates (typecheck, lint, unit tests, Next CI unchanged and green).

## Additions from the target architecture (09-11-26)

- Response cache is the Worker cache (`cache: { enabled: true }`), not the Cache API or KV: Sanity-backed routes send `Cache-Tag` plus a CDN lifetime from route `headers()`, with browser `max-age=0`.
- `src/server.ts` answers `POST /api/revalidate` itself (HMAC check without next-sanity, tag map from `lib/sanity/revalidation.ts`, `ctx.cache.purge({ tags })`) and adds `scheduled()` for the hourly purge; `triggers.crons` moves into `wrangler.start.jsonc`.
- Query: `@tanstack/react-router-ssr-query` with `setupRouterSsrQueryIntegration`; one `QueryClient` per request in `getRouter()`.
- Devtools (`@tanstack/react-devtools` with Router, Query and Form panels) in development only.
- Verify on the staging Worker whether stale-while-revalidate works inside `CDN-Cache-Control`, and measure a cold `/resume` render's CPU time.

## Outcome (09-11-26)

- Query: one `QueryClient` per request in `getRouter()` with `setupRouterSsrQueryIntegration`; Sanity reads are `queryOptions` in `src/queries/content.ts`, loaded with `ensureQueryData` and read with `useSuspenseQuery`.
- Worker cache: `cache.enabled` plus `Cache-Tag` and `CDN-Cache-Control` (one day, stale-while-revalidate) on `/resume`, `/learn`, `/blog`, posts, the feed, llms and the sitemap; browsers get `max-age=0, must-revalidate`. OG images and icons are edge-cached for a day, the contributions API for an hour.
- `src/server.ts` answers the Sanity webhook (`@sanity/webhook` signature check, existing tag map, `ctx.cache.purge`) and runs `scheduled()` hourly to purge every content tag. `/api/cron/revalidate` and the draft routes are not ported (the cron Worker and draft mode go away).
- Devtools (Router + Query) in development only.
- **Carried to Phase 5 (needs the staging Worker):** confirm `ctx.cache.purge` on Cloudflare, whether stale-while-revalidate works inside `CDN-Cache-Control`, and the CPU time of a cold `/resume` render.

