# Phase 3: Server surface

**Status:** OUTLINE (finalised at phase entry).
**Created:** 09-11-26
**Umbrella:** `tanstack-migration_UMBRELLA_PLAN_09-11-26.md`

## Scope

Server routes for /api/contact, /api/subscribe, /api/github/contributions, /api/revalidate (signature check without next-sanity), /api/cron/revalidate; sitemap.xml, robots.txt, feed.xml, llms.txt, skills.json, security.txt, manifest; icons and every OG image on satori + resvg (fonts bundled as assets, fixing the default-font segment images); /studio launcher + /studio/static via the ASSETS binding with the frame-ancestors CSP; the redirect map (9 x 308 plus trailing slash); response headers. Parity diff clean for every URL in the reference.

## Gates

The exit gate in the umbrella table, plus the standard gates (typecheck, lint, unit tests, Next CI unchanged and green).

## Additions from the target architecture (09-11-26)

- Contact and newsletter on `@tanstack/react-form-start` with one Valibot schema for client and server; POST server functions with `createCsrfMiddleware` and `.validator()`; field errors through `createServerValidate`.
- Turnstile on both forms (explicit-render widget; `siteverify` on the server) and a `ratelimits` binding keyed by IP and route. These are intended parity differences on `/contact` and the subscribe form; list them in the phase report.
- Bindings through `import { env } from "cloudflare:workers"`; secrets via `wrangler secret put` with `secrets.required`.
- Carried from Phase 2: with prerendered pages served as assets, `/about/` gets a 307 from the asset handler; Next sends 308. The redirect map must restore 308 for trailing slashes (check `assets.html_handling` against a Worker-side redirect).
- Typed search params moved to Phase 7 (see the Phase 2 plan).

