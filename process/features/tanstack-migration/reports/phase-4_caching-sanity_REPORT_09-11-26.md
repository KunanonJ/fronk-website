# Phase 4 report: Caching and Sanity

**Date:** 09-11-26
**Plan:** `../active/phase-4_caching-sanity_PLAN_09-11-26.md`
**Branch:** `feat/start-cache`

## Result

Sanity reads go through TanStack Query, Sanity-backed responses are cached at the edge by the Worker cache and purged by tag, and the hourly purge runs inside the same Worker. Parity is unchanged on all 120 reference URLs. Production is unchanged.

## What landed

- **Query:** `@tanstack/react-query` 5.107.1 and `@tanstack/react-router-ssr-query` 1.167.3; a `QueryClient` per request in `getRouter()`; `queryOptions` for the resume, learn cards, blog index and blog posts; loaders use `ensureQueryData`, components `useSuspenseQuery`.
- **Worker cache:** `cache: { enabled: true }` in `wrangler.start.jsonc`. `src/lib/cache.ts` sets `Cache-Tag`, `CDN-Cache-Control: public, max-age=86400, stale-while-revalidate=86400` and browser `max-age=0, must-revalidate` on `/resume`, `/learn`, `/blog`, posts, `feed.xml`, `llms.txt` and `sitemap.xml`. OG images and icons are edge-cached for a day (browsers too, since the URLs carry no hash); the contributions API for an hour.
- **Purge:** `src/server.ts` answers `POST /api/revalidate` with `@sanity/webhook` 4.0.4 (Web Crypto signature check), maps the document type to tags with `lib/sanity/revalidation.ts`, and calls `ctx.cache.purge({ tags })`. `scheduled()` (cron `0 * * * *`) purges every content tag.
- **Devtools:** Router and Query panels through `@tanstack/react-devtools`, development builds only (absent from the production bundle).

## Evidence (local, 09-11-26)

| Check | Result |
|---|---|
| Webhook handler tests (real signatures via `encodeSignatureHeader`) | 5 passed: purge by type, bad and missing signatures, missing secret, no cache |
| Cache header tests | 4 passed |
| Response headers on the preview | `Cache-Tag` + `CDN-Cache-Control` on Sanity routes; OG and API lifetimes as above |
| Cron in the local Worker | `scheduled()` runs |
| Parity, all 120 URLs / smoke + axe | 0 differences / 118 passed |
| `pnpm test` / typecheck / lint / Next build | 467 passed / clean / clean / passes |
| Dev server with devtools | `/resume` renders from Sanity |

## Not verifiable locally (Phase 5, staging)

The local Worker runtime does not prove the Cloudflare cache: Phase 5 checks the purge on staging with a signed webhook, whether stale-while-revalidate works inside `CDN-Cache-Control`, and a cold `/resume` render's CPU time.
