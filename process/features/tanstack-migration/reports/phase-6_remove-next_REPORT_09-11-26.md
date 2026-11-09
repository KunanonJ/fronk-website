# Phase 6 report: Remove Next

**Date:** 09-11-26
**Plan:** `../active/phase-6_remove-next_PLAN_09-11-26.md`
**Branch:** `feat/remove-next`

## Result

The codebase is TanStack Start only. Next, OpenNext, `next-sanity`, `eslint-config-next`, the `app/` directory and the Vite-only `next/*` stand-ins are gone. Output is unchanged: all 120 reference URLs still match.

## What changed

- **Routes own their pages.** The 20 page modules were folded into their route files (metadata, loader, component in one place). The blog's metadata moved into `src/server/content.functions.ts`, next to the Sanity reads.
- **Server code in `src/server/`:** API handlers (`api/`), text endpoints (`text/`), OG and icon renderers (`og/`), server functions, cache purge and form guard. robots, sitemap and manifest are in `lib/seo/`.
- **Project modules instead of `next/*`:** `components/navigation/Link` (Router `Link` with the old `href` props), `components/ui/Image`, `components/ui/Script`, `lib/router/navigation` (`usePathname`, `notFound`), `lib/analytics/useReportWebVitals`, `lib/sanity/groq.ts`, `lib/seo/types.ts` (the metadata shapes this site uses), `lib/og/fonts.ts` (bundled TTFs).
- **Sanity:** `@sanity/client` directly; Next fetch-cache options removed (the Worker cache does that job).
- **Tooling:** ESLint flat config on the same plugins as before, installed directly; `tsconfig` without the Next plugin; Playwright on `vite preview` at 127.0.0.1; `perf:budget` measures `dist/client`; `@vitest/coverage-v8` so `pnpm test:coverage` works; knip entries for the Start layout (clean); scripts `dev`/`build`/`start` on Vite.
- **Tests:** component tests get a plain-anchor `Link` and neutral navigation hooks from `vitest.setup.ts`; the head-parity test renders the real route `head()`; path-based tests read `src/`.
- **CI:** the existing jobs now build and test Start; the `start` job became `parity` (`start-gates --parity-only`).
- **Docs:** README rewritten for Start (architecture, scripts, deploy, structure, routes).

## Evidence (local, 09-11-26)

| Check | Result |
|---|---|
| `pnpm typecheck` / `pnpm lint` | 0 errors, 0 warnings |
| `pnpm test` | 451 passed |
| knip | clean |
| `pnpm build` + perf budget | pass (worst 223.6 KB gz on a portfolio project; limit 255) |
| Parity, 120 URLs | 0 differences |
| CI e2e suite (smoke + axe, desktop) against `pnpm start` | 60 passed |

## Owner-gated follow-ups

1. Delete OpenNext's Durable Object classes with a `deleted_classes` migration: this permanently deletes their storage and ends the one-click rollback to the last Next version.
2. Delete the `fronk-website-revalidate-cron` Worker, then `workers/revalidate-cron.ts`, its wrangler file and the `/api/cron/revalidate` bridge.
