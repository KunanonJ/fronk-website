# Phase 6: Remove Next

**Status:** OUTLINE (finalised at phase entry).
**Created:** 09-11-26
**Umbrella:** `tanstack-migration_UMBRELLA_PLAN_09-11-26.md`

## Scope

Shared components on Router APIs (Link, useLocation, notFound); shims, app/, next, @opennextjs/cloudflare, next-sanity, next-themes (if replaced), next config files and Next-specific tests removed; tooling (budget script, _headers, tsconfig, Vitest) on Vite; knip clean; docs (README, AGENTS.md, context) updated.

## Gates

The exit gate in the umbrella table, plus the standard gates (typecheck, lint, unit tests, Next CI unchanged and green).

## Carried from Phase 3 (09-11-26)

- Move the contact form to a POST server function with `@tanstack/react-form-start` (`createServerValidate`, `createCsrfMiddleware`) once Next no longer renders it; drop the `/api/contact` fetch.

