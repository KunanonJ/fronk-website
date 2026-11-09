# TanStack Start migration: umbrella plan

**Status:** IN PROGRESS. Phase 0 (parity harness) executed 09-11-26; Phase 1 (scaffold) next.
**Created:** 09-11-26
**Research:** `process/general-plans/references/tanstack-start-migration-research_REPORT_09-11-26.md`. That report covers the API mapping, the inventory, the risks and the parity references.
**Owner ask:** move kunanonj.com from Next.js (OpenNext on Workers) to TanStack Start on Cloudflare Workers. Use the TanStack suite where it replaces hand-rolled code, and prove parity against the redesigned site.

## Owner decisions (09-11-26)

1. **Merging:** merge every phase PR on green, *including the cutover* once the parity gates pass. Rollback is through the Cloudflare dashboard (Workers deployments).
2. **Staging:** a separate staging Worker (`fronk-website-start`) is checked on real Cloudflare before cutover. The owner runs `wrangler login` once, and only that staging Worker is deployed from this machine.
3. **Draft mode:** dropped. `/resume` shows published Sanity content only.

## Approach

- **Side by side, one repo:**
  - the Start app lives in `src/` (routes, router, server entry) and reuses `components/` and `lib/` through the `@/` alias;
  - Next keeps `app/` and stays the production build until Phase 5;
  - every phase merges to `main` with no production change until the cutover PR.
- **Shims first, then native code:**
  - in the Vite build only, `next/link`, `next/navigation`, `next/image` and `next/script` alias to small adapters on TanStack Router, so the 60+ shared components run under Start unchanged;
  - `metadataToHead()` turns the existing Next `Metadata` objects (`routeShareMeta`, `generateMetadata`) into Start `head()` output, so all SEO logic is reused, not rewritten;
  - Phase 6 swaps shared code to Router APIs and deletes the shims and Next.
- **Parity is mechanical:**
  - one crawler (`scripts/parity-crawl.mjs`) records, for every route, the status, redirect target, selected headers, normalised head tags, JSON-LD and text-endpoint bodies, against any base URL (local Next, local Start, staging, production);
  - `scripts/parity-diff.mjs` compares two crawls;
  - the visual baselines (68), e2e smoke + axe, and the perf probe are the other gates.

## Phases

| Phase | Plan | Exit gate |
|---|---|---|
| 0 Parity harness | `phase-0_parity-harness_PLAN_09-11-26.md` | A crawl of the Next preview is committed as the reference; diff tool tested |
| 1 Scaffold | `phase-1_scaffold_PLAN_09-11-26.md` | Start, Vite and the Cloudflare plugin build and run under workerd; `__root` with fonts, theme, analytics and site JSON-LD; shims; `metadataToHead`; `/` and `/about` reach head parity with Next |
| 2 Content routes | `phase-2_content-routes_PLAN_09-11-26.md` | Every page route ported (landing, hubs, skills, portfolio, system, hidden blog/press); 404s are real; parity diff clean for HTML routes; e2e and visual pass against Start |
| 3 Server surface | `phase-3_server-surface_PLAN_09-11-26.md` | APIs (contact, subscribe, contributions, revalidate, cron), sitemap, robots, feed, llms, `skills.json`, `security.txt`, manifest, icons, OG images, Studio static, headers, redirects; parity diff clean for every route |
| 4 Caching and Sanity | `phase-4_caching-sanity_PLAN_09-11-26.md` | Sanity reads through server functions and TanStack Query; a response cache with webhook purge; the hourly cron in `src/server.ts`; draft mode removed |
| 5 Staging and cutover | `phase-5_cutover_PLAN_09-11-26.md` | Staging Worker parity clean against production; perf budget ported; `build:cloudflare` and `wrangler.jsonc` switched; production verified live |
| 6 Remove Next | `phase-6_remove-next_PLAN_09-11-26.md` | Shared code on Router APIs; Next, OpenNext, shims and `app/` removed; tooling and tests on Vite; knip clean |

Each phase follows the same loop: research at entry → execute → gates → PR → merge on green → verify → report in `../reports/`.

## Program-wide rules

- Pin exact versions taken from the registry at phase entry. On 09-11-26: `@tanstack/react-start` 1.169.5, `@tanstack/react-router` 1.170.46, `@tanstack/react-query` 5.107.1, `@tanstack/react-form` 1.33.5, `@cloudflare/vite-plugin` 1.67.0, `vite` 8.3.6.
- No production behaviour changes before Phase 5. Next's CI jobs keep running unchanged; Start adds its own job from Phase 1.
- Fix known Next debts only where they block parity (e.g. `<html lang="th">` on Thai pages, noted in the research report). Record the rest in `../backlog/`.
- Test runtime-rendered pages, not just prerenders (lesson from the ISR fix, #61).
