# Phase 2 report: Content routes

**Date:** 09-11-26
**Plan:** `../active/phase-2_content-routes_PLAN_09-11-26.md`
**Branch:** `feat/start-content-routes`

## Result

Every page route renders through TanStack Start with no parity differences from the Phase 0 reference, apart from one intended fix: Thai pages now say `<html lang="th">`. 67 URLs are checked, including all 20 skills, every portfolio project, the topic and venture hubs in both languages, the hidden blog and its 16 posts, the four 404 probes and the `/stock/asme` redirect. Production is unchanged.

## What landed

- **Routes:** `_landing` (contact, press, portfolio and projects, skills and the 20 skills, stack, proof, build, examples, learn, blog and posts, topics, Thai topics, ventures, `/stock/asme` as a 308) and a `_system` layout for `/resume` and `/design`.
- **Shared views:** the slug pages export a synchronous `*View`; the resume and blog-post bodies live in `components/`. Next renders the same views, so both frameworks stay in step until Phase 6.
- **Loaders:** slug routes 404 through `notFound()` in the loader and return finished head tags (Next `Metadata` can hold `URL` objects, which Start won't serialise). File-based OG images keep their URL, size and alt; pages without one get the site-wide `opengraph-image`, as in Next.
- **Sanity:** server functions for the resume, learn cards, blog index and blog post; Vite-only stand-ins for `next-sanity` (on `@sanity/client`) and `next/headers` (draft mode always off).
- **Prerender:** 42 pages built at deploy (`autoSubfolderIndex: false`, pages only; Sanity routes and text/API endpoints render on request).
- **Gates:** `src/ported-routes.json` lists every HTML route with its e2e name, whether it seeds the crawl, and any intended differences. The gates script fails if its own preview dies instead of testing whatever else holds the port.

## Evidence (local, 09-11-26)

| Gate | Result |
|---|---|
| Parity diff, 67 URLs | 0 differences (Thai `htmlLang` recorded as intended) |
| Smoke + axe, 21 routes, desktop + mobile, light + dark | 118 passed |
| `pnpm typecheck`, `pnpm lint` | Clean |
| `pnpm test` | 430 passed |
| `pnpm build` (Next, with the refactored pages) | Passes |
| Linux visual baselines | Run by the CI `start` job |

## Problems found on the way

- **A stale preview answered the gates.** An earlier `vite preview` still held port 4173 (its command line is `vite.js preview`, so `pkill -f "vite preview"` missed it), new previews failed to bind, and checks hit an old build. The gates script now stops if its own preview exits.
- **Phase 1 font mismatch (fixed in #71):** Fontsource's Geist builds differ slightly in glyph widths from the Google Fonts files `next/font` downloads; Start now serves Next's exact files.

## Carried forward

- Phase 3: `/about/` gets 307 from the asset handler where Next sends 308; the redirect map restores it. `/studio`, text endpoints, APIs and OG images are Phase 3.
- Phase 7: typed search params for the redesigned filters (today's pages keep no filter state in the URL).
