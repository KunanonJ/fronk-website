# Post-migration code review (09-11-26)

The owner asked for a code review after the TanStack Start migration, covering
quality, security, console errors and warnings, and long-term maintainability.
The review covered three areas (security, correctness, maintainability) and
shipped as four PRs. Each was merged on green CI and verified on production.

## What shipped

| PR  | Scope           | Main changes                                                                                                                                                                                                                                                                                  |
| --- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #80 | Security        | Open redirect on `//host/` closed; `serializeJsonLd` at all 16 JSON-LD sites; RSS links escaped; security headers (Worker + `public/_headers`); `/api/contact` same-site JSON only, streamed size limit, 405; `/api/subscribe` removed; Sanity webhook 5-minute replay window; OG 404 for unknown slugs |
| #81 | Correctness     | `shellComponent` + `RouteError` (root and default); Sanity timeout/retries, failures throw and are never edge-cached (`routeCacheHeaders`); Query `staleTime: Infinity`; Link uses plain anchors for files, `/api`, `/studio` and exact active matching; Thai topic hubs prerendered; one Sanity read per post |
| #82 | Maintainability | Dead code (draft mode, test-only helpers, flat nav, unused cache tags); typed head tags (no `as never[]`); `withImageCache`; Next leftovers (`"use client"`, theme-provider passthrough, snapshot script, stale comments, AGENTS.md block); `ContactPage` rename; knip pinned                         |
| #83 | Tooling         | CI gates: Prettier, `--max-warnings=0`, knip; one-time format; Dependabot (grouped, 7-day cooldown); exact pins (vitest, Playwright = container image); `@types/node` 22; build guard for missing public env                                                                                     |

## Verification

- Every PR passed the full CI suite: typecheck, lint, format, knip, unit
  tests, build, perf budget, smoke + axe, Linux visual baselines and the
  parity crawl (120/120 URLs, 0 differences).
- Production probes after each merge:
  - `//example.org/` now 308s to `/example.org`;
  - security headers present on static and Worker responses;
  - contact returns 403, 405, 413 and 415 as designed;
  - OG images return 404 for unknown slugs and 200 for known ones;
  - `/blog/<unknown>` is not edge-cached;
  - the 404 page has a title;
  - `/th/topics/*` are static with `lang="th"`.

## Accepted or deferred

- **Advisories (moderate):** satori <0.33.5 is bundled by `@cf-wasm/og` 0.5.0,
  which is the latest release, and OG text comes only from repo content.
  minimatch reaches us through ESLint, a dev-only dependency. Revisit both
  when Dependabot proposes updates.
- **Owner actions:**
  - clean `.env.example` and `.dev.vars.example` (read token, preview secret,
    audience ID and the subscribe note are obsolete);
  - confirm deleting the legacy Durable Object classes and the old cron Worker;
  - create the Turnstile keys;
  - pick the analytics tool.
- **Not done:**
  - `wrangler types`, to generate `Env` instead of the hand-written binding types;
  - import-order linting;
  - moving the parity reference to `tests/fixtures`;
  - `process/context/all-context.md` (CLAUDE.md routes to it; generate it with
    the `vc-generate-context` skill).
