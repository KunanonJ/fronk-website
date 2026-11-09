# Phase 1 report: Scaffold

**Date:** 09-11-26
**Plan:** `../active/phase-1_scaffold_PLAN_09-11-26.md`
**Branch:** `feat/start-scaffold`

## Result

TanStack Start, Vite and the Cloudflare plugin build next to Next and run under workerd. `/` and `/about` render through Start with no head differences from the Phase 0 reference crawl, and pass smoke and axe in both themes. Next's build and CI are unchanged; production is still the Next Worker.

## What landed

- **Dependencies (exact pins):** `@tanstack/react-start` 1.169.5, `@tanstack/react-router` 1.170.46, `@cloudflare/vite-plugin` 1.67.0, `vite` 8.3.6, Fontsource Geist / Geist Mono / Noto Sans Thai 5.3.0, `web-vitals` 6.2.3. Scripts `start:dev`, `start:build`, `start:preview`.
- **Config:** `vite.config.mts` (ESM only: the `.ts` name made Vite load it with `require`), with the `@/` alias, `next/*` shim aliases and the `NEXT_PUBLIC_*` defines; `wrangler.start.jsonc` for the staging Worker `fronk-website-start`.
- **Worker entry:** `src/server.ts` is wrangler `main` and Start's server entry. It delegates to `handler.fetch`; Phase 4 adds the Sanity webhook purge and `scheduled()` (target architecture).
- **App shell:** `src/router.tsx` (preload on intent, scroll restoration), `src/routes/__root.tsx` (fonts, `globals.css`, theme colours, ThemeProvider, RouteFade, analytics, site JSON-LD, the Next 404 as `notFoundComponent`), `_landing` layout, `/` and `/about` reusing the Next page modules.
- **SEO:** `lib/seo/metadataToHead.ts` turns Next `Metadata` into Start `head()` (title template, `metadataBase`, OG/Twitter inheritance, file OG images); the root metadata moved to `lib/seo/rootMetadata.ts` and `app/layout.tsx` imports it.
- **Shims:** `next/link`, `next/navigation`, `next/image`, `next/script`, `next/web-vitals` in `src/shims/`, aliased in the Vite build only.
- **Gates:** `scripts/start-gates.mjs` runs the preview, the parity diff for `src/ported-routes.json`, then smoke + axe (and Linux visual baselines with `--visual`). New CI job `start` runs it in the pinned Playwright container.
- **Lint:** Next's document and image rules are off for `src/**` (the Start app is not Next), and the shims' `_`-prefixed dropped props are allowed.

## Evidence (local, 09-11-26)

| Gate | Result |
|---|---|
| `pnpm start:build` | Builds in about 3 s |
| Parity diff `/`, `/about` vs reference | 2 URLs compared, 0 with differences |
| Smoke + axe (desktop + mobile, light + dark) | 14 passed |
| `pnpm typecheck`, `pnpm lint` | Clean, 0 warnings |
| `pnpm test` | 71 files, 430 tests passed |
| `pnpm build` (Next) | Passes |
| Visual baselines | Run by the CI `start` job in the Linux container; an earlier same-platform run showed 0 differing pixels between Start and Next |

## Problems fixed on the way

- **Dark theme-colour meta dropped:** Router's head dedupe keeps one meta per `name`, so both theme-colour metas render directly in `<head>`.
- **Gates script hang:** killing the `pnpm` wrapper left `vite preview` running with the script's stderr open, so the run never ended after all gates passed. It now spawns vite directly in its own process group, kills the group on exit, and times out the readiness probe.
- **Lint error in the web-vitals shim:** the callback ref is now updated in an effect, not during render.

## Next

Phase 2 (content routes): port every page route, prerender the 17 static ones, typed search params for filters (Valibot), real 404s.
