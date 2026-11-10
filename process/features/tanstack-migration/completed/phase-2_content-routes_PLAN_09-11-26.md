# Phase 2: Content routes

**Status:** DONE 09-11-26. Report: `../reports/phase-2_content-routes_REPORT_09-11-26.md`.
**Created:** 09-11-26
**Umbrella:** `tanstack-migration_UMBRELLA_PLAN_09-11-26.md`

## Scope

Every page route in src/routes with loaders and head(): landing pages, topic hubs (EN/TH, with <html lang=th> fixed), venture hubs, skills (index + 20, dynamicParams=false as a real 404), portfolio (index + 4), /design, /resume (server function, no draft mode), hidden /blog and /press. Real 404s via notFound(). Parity diff clean for every HTML route; e2e smoke + axe and the visual suite pass against the Start preview.

## Gates

The exit gate in the umbrella table, plus the standard gates (typecheck, lint, unit tests, Next CI unchanged and green).

## Additions from the target architecture (09-11-26)

- Prerender the 17 static page routes with `tanstackStart({ prerender: { enabled: true, crawlLinks: true } })`; dynamic slugs from `lib/content` replace `generateStaticParams`.
- Typed search params with `validateSearch` (Valibot, Standard Schema) for every filter: skills stage and origin, press type, examples persona, the English/Thai switch, blog tags.
- 404s through `notFound()` and the root `notFoundComponent`.

## Outcome and deviations (09-11-26)

- Every page route is on Start except `/studio` (Phase 3). Slug pages export a synchronous `*View` that both frameworks render; the resume and blog-post bodies moved to `components/resume/ResumeView.tsx` and `components/landing/BlogPostView.tsx`.
- Sanity pages (`/resume`, `/learn`, `/blog`, `/blog/$slug`) load through server functions in `src/server/content.functions.ts`. Query and the edge cache stay in Phase 4.
- Prerender covers 42 pages. The Thai topic pages are not reached by the prerender crawl and render on request.
- **Typed search params moved to Phase 7.** Today's pages keep no filter state in the URL, so adding it now would change behaviour against the parity reference; the redesigned filters in Phase 7 get them.
- `<html lang="th">` on Thai pages is an intended parity difference, recorded in `src/ported-routes.json`.

