# Phase 3a report: Server surface at parity

**Date:** 09-11-26
**Plan:** `../active/phase-3_server-surface_PLAN_09-11-26.md`
**Branch:** `feat/start-server-surface`

## Result

Every URL in the Phase 0 reference (120: pages, text endpoints, redirects, icons and OG images, the contributions API, `/studio`) now matches through TanStack Start, with one intended difference (`<html lang="th">` on Thai pages). Production is unchanged.

## What landed

- **Text endpoints:** `robots.txt`, `sitemap.xml` and `manifest.webmanifest` serialised by `lib/seo/metadataRoutes.ts` (unit-tested against the reference bodies); `feed.xml`, `llms.txt`, `skills.json` and `.well-known/security.txt` reuse the Next handlers.
- **Images:** `/icon`, `/apple-icon`, `/opengraph-image` and the skill, portfolio, topic and venture OG images run the Next handlers on `@cf-wasm/og` 0.5.0 in workerd; the Geist TTFs are bundled, so cards render in the brand font.
- **APIs:** contact, subscribe and GitHub contributions reuse the Next handlers through a `next/server` stand-in.
- **Redirects:** `src/lib/redirects.ts` (15 unit tests) holds next.config's nine 308s and the trailing-slash rule; `src/server.ts` applies them before Start. `assets.run_worker_first: ["/*/"]` sends trailing-slash paths to the Worker, so `/about/` gets 308 like Next instead of the asset handler's 307.
- **Studio:** `/studio` launcher with Next's studio viewport and the frame-ancestors CSP header.

## Evidence (local, 09-11-26)

| Gate | Result |
|---|---|
| Parity diff, all 120 reference URLs | 0 differences (Thai `htmlLang` intended) |
| Smoke + axe | 118 passed |
| `pnpm typecheck`, `pnpm lint` | Clean, 0 warnings |
| `pnpm test` | 448 passed |
| `pnpm build` (Next) | Passes |

## Next

3b: forms on TanStack Form with Valibot, server functions, Turnstile and the rate-limit binding. Phase 4 then moves `/api/revalidate` and the hourly cron into `src/server.ts` with the Worker cache.
