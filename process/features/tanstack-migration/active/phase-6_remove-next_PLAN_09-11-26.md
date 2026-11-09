# Phase 6: Remove Next

**Status:** DONE 09-11-26 (two owner-gated cleanups listed below). Report: `../reports/phase-6_remove-next_REPORT_09-11-26.md`.
**Created:** 09-11-26
**Umbrella:** `tanstack-migration_UMBRELLA_PLAN_09-11-26.md`

## Scope

Shared components on Router APIs (Link, useLocation, notFound); shims, app/, next, @opennextjs/cloudflare, next-sanity, next-themes (if replaced), next config files and Next-specific tests removed; tooling (budget script, _headers, tsconfig, Vitest) on Vite; knip clean; docs (README, AGENTS.md, context) updated.

## Gates

The exit gate in the umbrella table, plus the standard gates (typecheck, lint, unit tests, Next CI unchanged and green).

## Carried from Phase 3 (09-11-26)

- Move the contact form to a POST server function with `@tanstack/react-form-start` (`createServerValidate`, `createCsrfMiddleware`) once Next no longer renders it; drop the `/api/contact` fetch.

## Outcome (09-11-26)

- `app/` is gone. Each route file owns its metadata, loader and component; server-only code lives in `src/server/` (API handlers, text endpoints, OG renderers, server functions); robots, sitemap and manifest in `lib/seo/`.
- The `next/*` stand-ins became project modules: `components/navigation/Link`, `components/ui/Image`, `components/ui/Script`, `lib/router/navigation`, `lib/analytics/useReportWebVitals`; `next-sanity` is `@sanity/client` plus `lib/sanity/groq.ts`; `next/og` is `@cf-wasm/og`; Next's metadata types are `lib/seo/types.ts`.
- Removed: `next`, `next-sanity`, `@opennextjs/cloudflare`, `@next/bundle-analyzer`, `eslint-config-next`, `next.config.ts`, `open-next.config.ts`, `next-env.d.ts`, the draft and Next revalidate routes. ESLint uses the same plugins directly; Vitest coverage works (`@vitest/coverage-v8`); knip is clean.
- CI: the existing jobs build and test Start; the `start` job became `parity` (parity diff only).
- Owner-gated, not done: delete OpenNext's Durable Object classes (a `deleted_classes` migration permanently deletes their storage and ends the one-click rollback to the Next version), and delete the old `fronk-website-revalidate-cron` Worker plus `workers/revalidate-cron.ts`.
- Not done here: the contact form's move to a server function (`createServerValidate`); it now can, and it belongs with the owner-requested code review.

