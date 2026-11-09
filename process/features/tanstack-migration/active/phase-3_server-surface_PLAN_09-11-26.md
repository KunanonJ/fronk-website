# Phase 3: Server surface

**Status:** OUTLINE (finalised at phase entry).
**Created:** 09-11-26
**Umbrella:** `tanstack-migration_UMBRELLA_PLAN_09-11-26.md`

## Scope

Server routes for /api/contact, /api/subscribe, /api/github/contributions, /api/revalidate (signature check without next-sanity), /api/cron/revalidate; sitemap.xml, robots.txt, feed.xml, llms.txt, skills.json, security.txt, manifest; icons and every OG image on satori + resvg (fonts bundled as assets, fixing the default-font segment images); /studio launcher + /studio/static via the ASSETS binding with the frame-ancestors CSP; the redirect map (9 x 308 plus trailing slash); response headers. Parity diff clean for every URL in the reference.

## Gates

The exit gate in the umbrella table, plus the standard gates (typecheck, lint, unit tests, Next CI unchanged and green).
