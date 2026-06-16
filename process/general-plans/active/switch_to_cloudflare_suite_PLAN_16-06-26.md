# Switch Fronk Website To Cloudflare Suite

**Date**: 16-06-26
**Complexity**: Complex
**Status**: ✅ COMPLETE - Cloudflare production domain, Sanity handoff, cron schedule, and old hosting cleanup verified
**Execution Model**: Standard complex plan, phased Cloudflare migration with production cutover approval gate

## Overview

Move the Fronk website from the current Railway-oriented deployment model to a Cloudflare-centered stack: Cloudflare DNS, Cloudflare Workers with OpenNext for the full-stack Next.js app, Workers static assets, R2-backed OpenNext cache for ISR, a scheduled Worker for revalidation, Cloudflare Web Analytics, and optional Cloudflare Turnstile/Images hardening. This plan builds on `process/general-plans/active/remove_railway_PLAN_16-06-26.md`: remove Railway only after the Cloudflare deployment is proven and production traffic is safely cut over.

## Quick Links

- [Context and Goals](#context-and-goals)
- [Phase Completion Rules](#phase-completion-rules)
- [Architecture Decisions](#architecture-decisions-final)
- [Execution Brief](#execution-brief)
- [Phased Execution Workflow](#phased-execution-workflow)
- [Cloudflare Suite Mapping](#cloudflare-suite-mapping)
- [Compatibility Risks](#compatibility-risks)
- [Phased Delivery Plan](#phased-delivery-plan)
- [Implementation Checklist](#implementation-checklist)
- [Touchpoints](#touchpoints)
- [Public Contracts](#public-contracts)
- [Blast Radius](#blast-radius)
- [Verification Evidence](#verification-evidence)
- [Resume and Execution Handoff](#resume-and-execution-handoff)
- [Sources](#sources)

## Context and Goals

The site is a Next.js 16 personal website with:

- App Router pages and route handlers.
- Sanity CMS and Studio access through `/studio`.
- Draft preview routes.
- Sanity webhook cache-tag revalidation at `/api/revalidate`.
- Scheduled revalidation at `/api/cron/revalidate`.
- Newsletter signup at `/api/subscribe`.
- Playwright visual/smoke tests and Vitest unit/integration tests.

Cloudflare's current Next.js guidance separates static Next.js on Pages from full-stack SSR Next.js on Workers. Because this app uses route handlers, draft mode, and cache revalidation, the default target is **Cloudflare Workers with the Cloudflare OpenNext adapter**, not Cloudflare Pages. The Sanity Studio UI is now kept outside the app Worker bundle; `/studio` is a lightweight launcher to the configured external Studio URL.

`process/context/all-context.md` is currently absent. Use this plan, live repo files, `process/_seeds/context/all-context.md.seed` only as a scaffold reference, and official Cloudflare docs as the execution context.

### Goals

- Deploy the full Next.js app on Cloudflare Workers using OpenNext.
- Use Cloudflare DNS/custom domain for production traffic.
- Use Workers static assets for Next/OpenNext output.
- Enable R2-backed cache for ISR/revalidation if available in the Cloudflare account.
- Replace Railway cron service with Cloudflare Cron Triggers, preferably a small separate scheduled Worker that calls the app's provider-neutral cron endpoint.
- Add Cloudflare Web Analytics as the primary Cloudflare-native RUM layer, while preserving existing analytics until user approves removal.
- Evaluate Cloudflare Turnstile for the newsletter signup API.
- Evaluate Cloudflare Images/Transformations for Next `<Image>` if Cloudflare image optimization is needed beyond Sanity CDN.
- Update repo docs/env/scripts from Railway-specific to Cloudflare-specific.
- Cut production over only after Cloudflare preview/prod verification passes.

### Non-Goals

- Remove Sanity Cloud or migrate content into Cloudflare D1/KV/R2.
- Replace Resend newsletter delivery.
- Remove existing GA/Umami analytics in the same phase unless user approves.
- Delete Railway services before Cloudflare deployment is live and approved.
- Convert the whole site to static export for Cloudflare Pages.
- Add Workers AI, Queues, Durable Objects, D1, Vectorize, or Workflows unless a concrete product requirement appears.

## Phase Completion Rules

A phase is NOT complete until:

1. **Integration Test** - Works with other system pieces.
2. **Manual Test** - User can perform the intended action or observe the intended state.
3. **Data Verification** - Cloudflare, DNS, Sanity, or repo state is confirmed with concrete output/screenshots.
4. **Error Handling** - Failure cases and rollback path are documented.
5. **User Confirmation** - User says "it works" or explicitly approves the next cutover/destructive step.

Status meanings:

- ⏳ PLANNED - Not started
- 🔨 CODE DONE - Written but not E2E tested
- 🧪 TESTING - Currently being tested
- ✅ VERIFIED - Tested AND confirmed working
- 🚧 BLOCKED - Has issues

After each phase, document:

- [ ] What was tested manually
- [ ] Repo, Cloudflare, DNS, Sanity, and external state verified
- [ ] Errors encountered and fixed
- [ ] User confirmation received

## Architecture Decisions Final

### AD-001: Cloudflare Workers With OpenNext Is The Primary App Host

**Decision:** Deploy the full-stack Next.js app to Cloudflare Workers through `@opennextjs/cloudflare` and `wrangler`.

**Rationale:** Cloudflare Pages docs direct full-stack Server Side Rendered Next.js apps to the Workers guide. This app has route handlers, draft preview, webhook logic, scheduled revalidation, and Sanity Studio, so static Pages is not a safe default.

**Implications:**

- Add `@opennextjs/cloudflare` and `wrangler`.
- Add `wrangler.jsonc` or `wrangler.toml`.
- Add `open-next.config.ts`.
- Add `preview` and `deploy` scripts that exercise the `workerd` runtime.
- Validate Next 16/React 19 compatibility with current OpenNext adapter before cutover.

### AD-002: R2 Is Used For OpenNext Cache/ISR If Enabled

**Decision:** Use Cloudflare R2 for OpenNext/Next caching if R2 is available on the account.

**Rationale:** Cloudflare automatic Next.js configuration can create R2 cache setup when R2 is enabled; otherwise deployment can proceed without cache and add R2 later.

**Implications:**

- Phase 1 must detect account R2 availability.
- If R2 is unavailable, first deployment can still happen but ISR/revalidation confidence is lower.
- `/api/revalidate` and `/api/cron/revalidate` must be tested against the Worker runtime, not only `next dev`.

### AD-003: Scheduled Revalidation Runs As A Separate Cron Worker

**Decision:** Prefer a separate small Worker with a Cron Trigger that calls `https://<site>/api/cron/revalidate` with `CRON_SECRET`.

**Rationale:** The OpenNext-generated Worker owns the Next app entrypoint. Keeping cron in a separate Worker avoids custom wrapper risk around generated OpenNext output and preserves the provider-neutral app endpoint.

**Implications:**

- Add `workers/revalidate-cron.ts` or equivalent.
- Add a second Wrangler config or multi-worker config if the repo standard supports it.
- Store `CRON_SECRET` as a Worker secret in both the app Worker and cron Worker.
- Test scheduled handler locally via Wrangler scheduled test path before deploying.

### AD-004: Cloudflare DNS Owns Production Domain Routing

**Decision:** Move production domain DNS to Cloudflare if it is not already Cloudflare-managed, then attach the Worker custom domain.

**Rationale:** Workers custom domains require Cloudflare-managed nameservers for the domain. DNS cutover is the production boundary and must be handled separately from code deployment.

**Implications:**

- Inventory current DNS before any change.
- Keep Railway live until Cloudflare custom domain is verified.
- Lower DNS TTL ahead of cutover when possible.
- Sanity webhook/CORS/studio URLs must be updated after the Cloudflare domain is live.

### AD-005: Cloudflare Web Analytics Is Additive First

**Decision:** Add Cloudflare Web Analytics as an additive analytics layer first. Remove GA/Umami only after user approves.

**Rationale:** Web Analytics is privacy-first and Cloudflare-native, but the current code already supports Umami and GA. Removing analytics in the same migration increases observability risk.

**Implications:**

- Add env-controlled Cloudflare beacon component or script.
- Update CSP if needed.
- Validate no duplicate analytics decision is made without explicit user input.

### AD-006: Turnstile Is A Security Enhancement, Not A Cutover Requirement

**Decision:** Plan Turnstile for `/api/subscribe` only after hosting migration is stable.

**Rationale:** Turnstile requires client widget integration and mandatory server-side token validation. It changes user-facing newsletter behavior, so it should not block infrastructure cutover.

**Implications:**

- Add separate tests for invalid/missing/valid Turnstile tokens.
- Keep Resend subscription behavior unchanged when Turnstile is disabled.
- Introduce `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` only in the hardening phase.

## Execution Brief

### Phase 1: Cloudflare Feasibility And Account Inventory

**What happens:** Confirm Cloudflare account/zone readiness, DNS ownership, R2 availability, Workers plan constraints, and current Railway/Sanity/DNS dependencies.

**Integration points:** Cloudflare account, DNS zone, Railway app, Sanity Manage, current env vars.

**Test:** Read-only checks only. Verify domain nameservers, available Cloudflare account/zone, and whether R2 is enabled.

**Verify:** User confirms target zone/account and whether intentional downtime is acceptable. Default is no downtime.

**Done when:** User approves proceeding to repo configuration.

### Phase 2: Repo Configuration For Workers/OpenNext

**What happens:** Add Cloudflare/OpenNext dependencies and configs, add scripts, keep Railway still live, and adapt code paths that are incompatible with Workers.

**Integration points:** `package.json`, `wrangler.*`, `open-next.config.ts`, `next.config.ts`, Sanity manifest static route, cron helper.

**Test:** `pnpm typecheck`, `pnpm test`, `pnpm exec eslint app components lib sanity scripts tests`, `pnpm preview` or equivalent Wrangler preview.

**Verify:** Local Worker preview serves public routes, API routes, and Studio assets.

**Done when:** A Cloudflare preview URL is deployable and the app runs in `workerd`.

### Phase 3: Cloudflare Service Integrations

**What happens:** Add R2 cache binding if available, Cloudflare Web Analytics, cron Worker, optional Turnstile/Images preparation.

**Integration points:** Cloudflare bindings/secrets, `app/api/cron/revalidate`, `app/api/subscribe`, analytics components, image config.

**Test:** Revalidation route, scheduled Worker local test, analytics beacon load, newsletter flow unchanged.

**Verify:** Cloudflare dashboard shows deployed Workers, secrets/bindings, cron events, and analytics site.

**Done when:** Cloudflare stack functions independently on preview domain.

### Phase 4: Production Cutover

**What happens:** Attach custom domain, update DNS, set prod env/secrets, update Sanity webhook/CORS/studio URLs, and run production smoke tests.

**Integration points:** DNS, Cloudflare Worker custom domain, Sanity Manage, `NEXT_PUBLIC_SITE_URL`, sitemap/RSS/OG metadata, `/studio`.

**Test:** `curl`/browser smoke for all public routes, Sanity webhook publish test, draft preview test, cron revalidation test, Playwright smoke if stable.

**Verify:** Production domain resolves through Cloudflare and app behavior matches current production.

**Done when:** User confirms Cloudflare production is working.

### Phase 5: Railway Removal And Documentation Finalization

**What happens:** Execute the Railway removal plan against repo and live services after Cloudflare cutover is verified.

**Integration points:** `remove_railway_PLAN_16-06-26.md`, Railway dashboard/CLI, docs/env/config.

**Test:** Railway references gone from repo except archived plans; no traffic reaches Railway.

**Verify:** Railway services are disabled/deleted only after explicit approval.

**Done when:** Cloudflare is the only active app hosting path.

### Expected Outcome

- `kunanonj.com` (or chosen production domain) runs from Cloudflare Workers.
- Static assets are served through Workers static assets.
- Revalidation works in Worker runtime.
- Scheduled revalidation is handled by Cloudflare Cron Trigger.
- Sanity Studio, draft preview, webhooks, sitemap, RSS, OG, newsletter, and e2e smoke routes work.
- Railway can be removed without production outage.

## Phased Execution Workflow

For each phase:

1. **Pre-Phase Research** - Read current code/docs and relevant Cloudflare docs; present findings and STOP.
2. **Detailed Planning** - Confirm exact files/services and risk boundaries; STOP for approval.
3. **Implementation** - Make only approved changes.
4. **Testing & Verification** - Run local, preview, and dashboard checks.
5. **User Confirmation** - Present what works, what was tested, and what the user should verify.

Do not cut DNS, delete Railway, or change Sanity production URLs until the user explicitly approves that phase.

## Cloudflare Suite Mapping

| Need                      | Cloudflare Product                    | Initial Plan                                             |
| ------------------------- | ------------------------------------- | -------------------------------------------------------- |
| Full-stack Next.js host   | Workers + OpenNext                    | Primary app runtime                                      |
| Static assets             | Workers Static Assets                 | OpenNext output under `.open-next/assets`                |
| ISR/cache                 | R2                                    | Enable if account supports it                            |
| Scheduled revalidation    | Workers Cron Triggers                 | Separate scheduled Worker calls app cron endpoint        |
| DNS/custom domain         | Cloudflare DNS + Worker custom domain | Cut over after preview verified                          |
| Analytics/RUM             | Cloudflare Web Analytics              | Add additive beacon first                                |
| Bot protection for signup | Turnstile                             | Optional hardening after cutover                         |
| Image transformations     | Cloudflare Images                     | Evaluate only if Sanity CDN/Next image needs change      |
| Secrets                   | Workers secrets                       | Store Sanity, Resend, Cron, analytics, Turnstile secrets |
| Logs/observability        | Workers Logs / Observability          | Enable for cutover and incident triage                   |

## Compatibility Risks

| Risk                                           | Why It Matters                                                                                                                   | Required Research/Test                                                       |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Runtime `fs` usage in `lib/sanity/manifest.ts` | Workers runtime does not behave like a normal Node filesystem; manifest serving may need static asset fetch or build-time import | Rewrite or adapt `/studio/static/[[...path]]/route.ts` before Worker preview |
| `next/cache` tag revalidation                  | Must work through OpenNext cache implementation, ideally with R2                                                                 | Test `/api/revalidate` and `/api/cron/revalidate` on preview Worker          |
| Sanity Studio bundle/static manifest           | `/studio` may have large assets and create-manifest behavior                                                                     | Test Studio route, manifest fetch, and Sanity Dashboard compatibility        |
| Image optimization                             | Cloudflare docs tie Next image optimization to Cloudflare Images                                                                 | Test existing `next/image`, Sanity remote images, generated OG images        |
| OpenNext and Next 16                           | Adapter support is current but must be proven with this exact app                                                                | Run `wrangler deploy` preview and Playwright smoke                           |
| Secrets at build vs runtime                    | Next `NEXT_PUBLIC_*` values are inlined at build while Worker secrets are runtime                                                | Split Cloudflare build vars and Worker secrets carefully                     |
| DNS cutover                                    | Incorrect DNS can take production offline                                                                                        | Inventory, lower TTL, and verify custom domain before Railway teardown       |

## Phased Delivery Plan

### Phase 1 - Cloudflare Feasibility And Inventory

**Status:** 🧪 TESTING - read-only inventory captured; user approval still required before repo configuration

**Implementation Summary:** Confirm Cloudflare account/zone, DNS nameservers, Workers availability, R2 availability, current Railway URLs, and Sanity external URLs.

**Files/Modules touched:** None.

**Test Procedure:**

```bash
sc worktree status --json
git status --short --branch
rg -n "Railway|railway|Nixpacks|nixpacks|Cloudflare|cloudflare|CRON_SECRET|NEXT_PUBLIC_SITE_URL" -S . -g '!node_modules' -g '!.next'
```

Cloudflare dashboard/MCP/CLI read-only checks:

- Confirm account and zone for production domain.
- Confirm R2 enabled or disabled.
- Confirm Workers plan/limits acceptable.
- Confirm DNS currently points where expected.

**Verification Queries:** Dashboard screenshots or CLI output for account/zone/R2/DNS. No mutation.

**Done Criteria:** User approves target Cloudflare account/zone and confirms no-downtime cutover requirement.

#### Phase 1 Inventory Findings - 2026-06-16

**Scope executed:** Read-only repo, DNS, Railway, and Cloudflare MCP/API inventory. No code, Cloudflare, DNS, Railway, or Sanity settings were mutated.

**Superconductor / Git state:**

- `sc worktree status --json`: branch `chore/regen-visual-baselines`, target branch `main`, `119` changed files.
- `git status --short --branch`: dirty worktree with existing `AGENTS.md`, `CLAUDE.md`, `.agents/`, `.codex/`, `.vc-*`, `.vibecode-backup/`, and `process/` changes.

**Cloudflare target selected by user:**

- Account: GoGoCash (`187ab61ed9dbc6e616cb23e6b95aa8f1`).
- Production domain: `kunanonj.com`.

**Cloudflare account inventory via MCP/API:**

- Workers: one existing Worker, `app-staging-proxy`, `usage_model: standard`, `compatibility_date: 2026-06-01`, no cron schedules.
- Worker custom domains: none.
- Pages projects: none.
- R2: account can list buckets; existing bucket `subgrid-storage`.
- Web Analytics API inventory: blocked by Cloudflare API authentication error for `GET /accounts/{account_id}/rum/site_info/list`.
- Zone/DNS API inventory: blocked by Cloudflare API authentication error for global zone lookup. Public DNS was used as fallback evidence.

**Public DNS and live edge inventory:**

- `kunanonj.com` nameservers are already Cloudflare: `hadlee.ns.cloudflare.com`, `odin.ns.cloudflare.com`.
- Apex `A` records resolve to Cloudflare IPs: `104.21.94.75`, `172.67.220.231`.
- Apex `AAAA` records resolve to Cloudflare IPs: `2606:4700:3033::6815:5e4b`, `2606:4700:3031::ac43:dce7`.
- `https://kunanonj.com` currently returns HTTP `404` through Cloudflare with Railway headers: `x-railway-edge`, `x-railway-fallback: true`.
- `www.kunanonj.com` has no public DNS resolution and `curl` cannot resolve it.

**Railway read-only inventory:**

- Railway workspace: GoGoCash.
- Project: `helpful-illumination` (`d65901f4-6a82-4c1f-967d-a19b91b75f31`).
- Environment: `production` (`23d88cc4-0f8d-4996-9ab4-46ce2adaa3ae`).
- Linked service: `fronk-website`, status `Failed`, region `Southeast Asia`, service ID `57e177e7-842e-4267-aa22-c4e2b8c29118`.
- Railway service domains: `https://kunanonj.com`, `https://fronk-website-production.up.railway.app`.
- Railway cron job: `cron-revalidate`, status `Offline`, schedule `0 * * * *`.

**Repo compatibility findings for Phase 2:**

- Runtime filesystem risk: `lib/sanity/manifest.ts` uses `node:fs/promises` and is reached by `app/studio/static/[[...path]]/route.ts`; this must be adapted before Workers preview is considered valid.
- Runtime filesystem risk: `lib/og/fonts.ts` uses `node:fs` `readFileSync`; OG image route behavior must be proven under OpenNext/workerd.
- Railway cleanup still needed in `README.md`, `.env.example`, `spec.md`, `package.json`, `scripts/setup-railway-cron.mjs`, and `scripts/cron-revalidate.mjs`.
- Cron endpoint implementation is provider-neutral enough to keep: `/api/cron/revalidate` validates `Authorization: Bearer <CRON_SECRET>` and calls `revalidateTag` for `posts`, `writing`, `pages`, and `ventures`.
- Current environment surface to move into Cloudflare build vars/secrets: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_SANITY_API_VERSION`, `SANITY_API_READ_TOKEN`, `SANITY_REVALIDATE_SECRET`, `SANITY_PREVIEW_SECRET`, `SANITY_AUTH_TOKEN`, `RESEND_API_KEY`, `RESEND_AUDIENCE_ID`, `CRON_SECRET`, `NEXT_PUBLIC_UMAMI_WEBSITE_ID`, `NEXT_PUBLIC_UMAMI_HOST`, `UMAMI_API_KEY`, `NEXT_PUBLIC_GA_ID`.

**Phase 1 unresolved decisions before Phase 2:**

- Confirm no-downtime cutover remains required. This plan assumes no downtime until the user says otherwise.
- Decide whether to create/serve `www.kunanonj.com` or intentionally leave it absent.
- Refresh Cloudflare zone/DNS/Web Analytics inventory from dashboard or with a token that can read those APIs before production cutover.
- Choose whether Phase 2 should only add Workers/OpenNext preview support or also begin docs/Railway wording cleanup.

### Phase 2 - Workers/OpenNext Repo Setup

**Status:** 🧪 TESTING - local Worker preview smoke passed; user confirmation still required

**Implementation Summary:** Add OpenNext and Wrangler, generate or write Cloudflare config, add preview/deploy scripts, and adapt runtime-incompatible code.

**Files/Modules touched:**

- `package.json`
- `pnpm-lock.yaml`
- `wrangler.jsonc` or `wrangler.toml`
- `open-next.config.ts`
- `next.config.ts`
- `lib/sanity/manifest.ts`
- `app/studio/static/[[...path]]/route.ts`
- `.gitignore`
- `.env.example`
- `README.md`

**Test Procedure:**

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm exec eslint app components lib sanity scripts tests
pnpm preview
```

Preview smoke:

- `/`
- `/writing`
- `/api/cron/revalidate` unauthorized path
- `/studio`
- `/studio/static/create-manifest.json`

**Verification Queries:** Worker preview URL loads; no runtime exception from `fs` manifest path; static assets load from OpenNext assets.

**Done Criteria:** App runs in local/preview Workers runtime with no major route failures.

#### Phase 2 Implementation Findings - 2026-06-16

**Scope executed:** Repo-only Cloudflare/OpenNext configuration and Worker-runtime compatibility fixes. No DNS, Cloudflare dashboard/API, Railway, or Sanity production settings were mutated.

**Files changed or added:**

- Added `@opennextjs/cloudflare@1.19.11` and `wrangler@4.100.0`.
- Added `open-next.config.ts`.
- Added `wrangler.jsonc` for `.open-next/worker.js`, Workers static assets, `nodejs_compat`, `global_fetch_strictly_public`, and the self-reference service binding.
- Added `public/_headers` for Next static asset caching and Sanity Studio manifest cache headers.
- Added `.dev.vars.example`; ignored real `.dev.vars` files, `.open-next/`, and `.wrangler/`.
- Updated `package.json` with `preview`, `deploy`, `upload`, and `cf-typegen` scripts.
- Updated `next.config.ts` with `initOpenNextCloudflareForDev()`.
- Removed runtime filesystem manifest route/module: `app/studio/static/[[...path]]/route.ts` and `lib/sanity/manifest.ts`.
- Updated `lib/sanity/manifest.test.ts` to assert Studio manifest delivery is static-asset based.
- Updated `lib/og/fonts.ts` and `app/opengraph-image.tsx` so missing bundled TTF files fall back instead of crashing page metadata in Workers.
- Added `lib/og/fonts.test.ts`.
- Updated README and `.env.example` with Cloudflare migration/deploy notes.

**TDD evidence:**

- RED: `pnpm exec vitest run lib/sanity/manifest.test.ts --reporter=dot` failed while the runtime route still existed.
- GREEN: the same test passed after removing the route/module and serving the manifest from public static assets.
- RED: `pnpm exec vitest run lib/og/fonts.test.ts --reporter=dot` failed because `loadOgFonts` did not exist.
- GREEN: OG font fallback test passed after lazy/non-fatal font loading was implemented.

**Verification evidence:**

- `pnpm typecheck` passed.
- `pnpm test` passed: 38 files, 152 tests.
- `pnpm exec eslint app components lib sanity scripts tests` passed with 0 errors and 3 existing warnings.
- `pnpm exec opennextjs-cloudflare build` passed and produced `.open-next/worker.js`.
- `pnpm preview` built successfully but could not start on default port `127.0.0.1:8787` because an unrelated Python listener already occupied the port.
- Equivalent Worker preview command passed on an alternate port: `CI=1 pnpm exec wrangler dev --port 8788`.
- Worker preview smoke at `http://localhost:8788`:
  - `/` -> 200 HTML.
  - `/writing` -> 200 HTML.
  - `/api/cron/revalidate` without bearer token -> 401 JSON.
  - `/studio` -> 200 HTML.
  - `/studio/static/create-manifest.json` -> 200 JSON from static assets.
  - `/opengraph-image` -> 200 PNG.
- Parseable changed files passed Prettier check.

**Remaining Phase 2 notes:**

- Default preview port conflict is local-machine state, not a source-code failure. If it persists, run the build and `wrangler dev --port 8788`.
- Phase 3 still owns R2 cache binding, the separate Cron Worker, Web Analytics, and optional Turnstile/Images.
- Production preview deployment, custom domain, Sanity external URL changes, DNS cutover, and Railway teardown remain blocked until explicit approval.

### Phase 3 - Cloudflare Bindings, Cron, And Observability

**Status:** 🧪 TESTING - repo/local wiring passed; external Cloudflare resources and secrets still pending

**Implementation Summary:** Configure R2 cache binding, Worker secrets, a separate cron Worker, Web Analytics, and optional Turnstile feature flag.

**Files/Modules touched:**

- `wrangler.*`
- `workers/revalidate-cron.ts`
- optional `workers/revalidate-cron.wrangler.*`
- `components/CloudflareAnalytics.tsx` or existing analytics integration
- `app/layout.tsx`
- `.env.example`
- `README.md`
- `app/api/subscribe/route.ts` and `lib/newsletter/subscribe.ts` only if Turnstile is approved in this phase

**Test Procedure:**

```bash
pnpm typecheck
pnpm test
pnpm exec eslint app components lib sanity scripts tests
pnpm wrangler dev --test-scheduled
```

Manual tests:

- Trigger scheduled Worker locally.
- Confirm it calls `/api/cron/revalidate` with `CRON_SECRET`.
- Confirm Web Analytics script loads only when configured.
- If Turnstile is implemented, submit newsletter form with missing/invalid token and verify rejection.

**Verification Queries:** Cloudflare dashboard shows Worker secrets, R2 binding, cron schedule, logs, and analytics site.

**Done Criteria:** Preview deployment has app Worker, cron Worker, secrets, and observability working.

#### Phase 3 Implementation Findings - 2026-06-16

**Scope executed:** Repo configuration, local Worker runtime validation, local scheduled-handler validation, and non-mutating Wrangler dry-runs. No Cloudflare resources, DNS, Railway services, Sanity settings, or production secrets were changed.

**Files changed or added:**

- Added R2 OpenNext incremental cache in `open-next.config.ts` with the installed adapter's `r2IncrementalCache` override.
- Added `NEXT_INC_CACHE_R2_BUCKET` binding to `wrangler.jsonc` with bucket name `fronk-website-opennext-cache`.
- Enabled Workers observability in `wrangler.jsonc`.
- Added `wrangler.revalidate-cron.jsonc` for the separate scheduled Worker, with hourly cron trigger `0 * * * *`, local preview env, and observability.
- Added `workers/revalidate-cron.ts` and `workers/revalidate-cron.test.ts`.
- Added `components/CloudflareAnalytics.tsx` and `components/CloudflareAnalytics.test.ts`.
- Wired `<CloudflareAnalytics />` into `app/layout.tsx` before existing Umami/GA scripts.
- Added `NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN` to env docs.
- Added `cron:preview` and `cron:deploy` scripts.
- Updated README with R2 bucket creation, Worker secret commands, Cron Worker test flow, and Cloudflare deployment notes.

**TDD evidence:**

- RED: `pnpm exec vitest run workers/revalidate-cron.test.ts components/CloudflareAnalytics.test.ts --reporter=dot` failed because the Phase 3 modules did not exist.
- GREEN: the same targeted test command passed after implementing the cron Worker and Cloudflare analytics component.

**Verification evidence:**

- `pnpm typecheck` passed.
- `pnpm test` passed: 40 files, 157 tests.
- `pnpm exec eslint app components lib sanity scripts tests workers` passed with 0 errors and 3 existing warnings.
- Parseable changed files passed Prettier check.
- `pnpm exec opennextjs-cloudflare build` passed with the R2 incremental cache override enabled.
- App Worker local preview showed `env.NEXT_INC_CACHE_R2_BUCKET (fronk-website-opennext-cache)` as a local R2 binding.
- App Worker smoke at `http://localhost:8788`:
  - `/` -> 200 HTML.
  - `/writing` -> 200 HTML.
  - `/api/cron/revalidate` without bearer token -> 401 JSON.
  - `/studio` -> 200 HTML.
  - `/studio/static/create-manifest.json` -> 200 JSON.
  - `/opengraph-image` -> 200 PNG.
- Cron Worker local preview with `--env local --test-scheduled --port 8789` invoked `/cdn-cgi/handler/scheduled?format=json` successfully.
- App Worker log confirmed the scheduled Worker call reached `/api/cron/revalidate` and returned 200 OK using local secrets.
- Non-mutating app Worker dry-run passed: `pnpm exec wrangler deploy --dry-run --outdir /tmp/fronk-app-worker`.
- Non-mutating cron Worker dry-run passed: `pnpm exec wrangler deploy --config wrangler.revalidate-cron.jsonc --env="" --dry-run --outdir /tmp/fronk-cron-worker`.

**External setup still pending before Phase 3 can be called fully verified:**

- Create or confirm Cloudflare R2 bucket `fronk-website-opennext-cache` in the GoGoCash account.
- Set app Worker secrets in Cloudflare: Sanity, Resend, Cron, and any analytics values.
- Set cron Worker `CRON_SECRET` and confirm `CRON_ENDPOINT_URL` points to the intended preview/production app Worker URL before enabling schedule.
- Create or confirm Cloudflare Web Analytics site/token; prior API inventory was blocked by Cloudflare API auth scope.
- Deploy preview app Worker and cron Worker before treating dashboard logs/cron events as verified.
- Turnstile remains deferred as post-hosting hardening; no newsletter behavior was changed in Phase 3.

### Phase 4 - Preview Deployment And Production Cutover

**Status:** 🧪 TESTING - app Worker preview deployed, smoke-tested, and user-confirmed; production cutover and cron schedule still gated

**Implementation Summary:** Deploy preview Worker, test all critical flows, then attach production custom domain and update Sanity external settings.

**Files/Modules touched:**

- README and deployment docs
- `.env.example`
- Cloudflare project/domain settings
- Sanity Manage settings

**Test Procedure:**

```bash
pnpm typecheck
pnpm test
pnpm exec eslint app components lib sanity scripts tests
PLAYWRIGHT_BASE_URL=https://<preview-or-prod-domain> pnpm exec playwright test smoke.spec.ts --project=desktop
curl -I https://<domain>/
curl -I https://<domain>/studio
```

Manual tests:

- Visit all public routes.
- Enter draft preview with `SANITY_PREVIEW_SECRET`.
- Publish/update a Sanity document and confirm webhook revalidation.
- Run scheduled revalidation and inspect logs.
- Confirm sitemap/feed/OG metadata uses production domain.

**Verification Queries:** DNS resolves to Cloudflare; Sanity webhook URL uses Cloudflare production domain; Cloudflare Worker logs show traffic.

**Done Criteria:** User confirms production domain works on Cloudflare.

#### Phase 4 Preview Deployment Attempt And Resolution - 2026-06-16

**Initial failed-attempt scope:** Preview-deploy prerequisites and app Worker deploy attempt only. No production custom domain was attached, no DNS was changed, no Sanity settings were changed, no Railway services were removed, and no cron schedule was activated.

**External Cloudflare changes made:**

- Created R2 bucket `fronk-website-opennext-cache` in the GoGoCash account.
- Uploaded available app Worker secrets for `fronk-website`: `SANITY_API_READ_TOKEN`, `SANITY_REVALIDATE_SECRET`, `SANITY_PREVIEW_SECRET`, and `CRON_SECRET`.
- Uploaded available cron Worker secret for `fronk-website-revalidate-cron`: `CRON_SECRET`.
- Created Worker records for `fronk-website` and `fronk-website-revalidate-cron` while setting secrets.
- Populated remote R2 incremental cache with 30 entries during `opennextjs-cloudflare deploy`.
- Uploaded static assets during deploy attempt before Worker version validation failed.

**Deploy blocker:**

- `pnpm exec opennextjs-cloudflare deploy` failed when Cloudflare rejected the Worker version.
- Cloudflare API error code: `10027`.
- Reported reason: Worker exceeded current account script size limit of 3 MiB.
- Largest reported bundle artifact: `.open-next/server-functions/default/handler.mjs`, around 26 MiB in Cloudflare's report.
- Local generated server bundle inspection showed `.open-next/server-functions/default` around 59 MiB and `handler.mjs` around 18 MiB on disk.
- Bundle inspection shows embedded Studio dependencies in the server handler, including `sanity` and `jsdom`; `app/studio/[[...tool]]/page.tsx` is the likely largest feature contributor.

**Resolution executed:**

- Replaced the embedded `/studio` route with a lightweight external Studio launcher using `NEXT_PUBLIC_SANITY_STUDIO_URL`.
- Added `sanity/studio-url.ts` and tests for Studio URL resolution.
- Added `app/studio/static/[[...path]]/route.ts` as a small Cloudflare `ASSETS` proxy for `public/studio/static/create-manifest.json`; this preserves the Sanity manifest URL without using Node `fs` or embedding the Studio runtime.
- Added `studio:dev`, `studio:build`, and `studio:deploy` scripts for the external Studio workflow.
- Updated README and env examples for the external Studio launcher.
- Rebuilt with `pnpm exec opennextjs-cloudflare build`; `handler.mjs` dropped from about 18 MiB locally to about 5.0 MiB.
- Redeployed the app Worker successfully to `https://fronk-website.bettergogocash.workers.dev`.
- Current app Worker version ID: `e006f0f3-5668-47c5-89ee-8bf16be3138c`.

**Post-resolution verification:**

- Cloudflare API inventory confirms R2 bucket `fronk-website-opennext-cache` exists.
- Cloudflare API inventory confirms Workers `fronk-website` and `fronk-website-revalidate-cron` exist.
- Cloudflare API inventory confirms no Worker custom domains are attached.
- Cloudflare API inventory confirms both `fronk-website` and `fronk-website-revalidate-cron` have empty cron schedules.
- Live preview smoke:
  - `/` -> `200 text/html`.
  - `/writing` -> `200 text/html`.
  - `/studio` -> `200 text/html`.
  - `/studio/static/create-manifest.json` -> `200 application/json`.
  - `/api/cron/revalidate` without auth -> `401 application/json`.
  - `/api/cron/revalidate` with local `CRON_SECRET` -> `200 application/json`, revalidated tags `posts`, `writing`, `pages`, `ventures`.
  - `/opengraph-image` -> `200 image/png`.
- `pnpm typecheck` passed.
- `pnpm test` passed: 42 files, 163 tests.
- Scoped ESLint passed with 0 errors and 3 pre-existing warnings.
- User preview confirmation recorded on 2026-06-16: "ok looks good".

**Pending before Phase 4 can be fully complete:**

- Attach the production custom domain only after explicit cutover approval.
- Update Sanity CORS, Studio URL, preview URLs, and webhook URL to the Cloudflare production domain after the domain is attached.
- Deploy the cron Worker schedule only after the target endpoint should be `https://kunanonj.com/api/cron/revalidate`; deploying it before cutover would run against the current apex host.

#### External Studio Readiness - 2026-06-16

**Scope executed:** Continued the next non-cutover task after preview confirmation: validate, deploy, and wire the standalone Sanity Studio path without changing DNS, Sanity production settings, cron schedules, or Railway.

**Changes made:**

- Ran `pnpm studio:build`; Sanity Studio built successfully.
- Sanity CLI installed the required runtime dependency `styled-components@^6.4.1`; this is now recorded in `package.json` and `pnpm-lock.yaml`.
- Added `dist/` and `.sanity/` to `.gitignore` because they are generated by local Studio build/deploy workflows.
- Removed generated local `dist/` and `.sanity/` artifacts from the worktree after the successful build.
- Switched Sanity CLI login from Google to GitHub after the Google account had no access to project `nkspfk4b`.
- Verified GitHub-authenticated Sanity access to project `nkspfk4b` and administrator membership.
- Deployed hosted Studio to `https://fronk-website.sanity.studio/`.
- Added Sanity deployment app ID `n3jbywdwz1dpo3ihh6cv1wtm` to `sanity.cli.ts` to avoid future deploy prompts.
- Added `NEXT_PUBLIC_SANITY_STUDIO_URL=https://fronk-website.sanity.studio/` to `wrangler.jsonc`.
- Redeployed the app Worker so `/studio` opens the hosted Studio URL.
- Current app Worker version ID after Studio URL wiring: `53ff53d6-7a17-47af-98f5-75bcdc26fba8`.

**Verification:**

- `pnpm studio:build` passed.
- `pnpm typecheck` passed.
- `pnpm test` passed: 42 files, 163 tests.
- `pnpm exec vitest run sanity/studio-url.test.ts --reporter=dot` passed.
- Scoped ESLint passed with 0 errors and 3 pre-existing warnings.
- `pnpm exec sanity deploy --yes` passed.
- Hosted Studio URL responded with `200 text/html` through Sanity auth.
- Cloudflare preview `/studio` responded with `200 text/html` and includes `https://fronk-website.sanity.studio/`.
- Cloudflare preview `/studio/static/create-manifest.json` responded with `200 application/json`.

**Resolved external blocker:**

- Initial `pnpm exec sanity deploy --no-build --yes` failed before deployment with: `You must login first - run "sanity login"`.
- Google login completed but the logged-in account had no access to project `nkspfk4b`.
- GitHub login completed and had the required project access; hosted Studio deploy then succeeded.

#### Production Cutover Preflight - 2026-06-16

**Scope executed:** Read-only production cutover readiness checks plus dry-run trigger checks. No Cloudflare custom domain, DNS record, Sanity CORS/webhook, cron schedule, or Railway setting was changed.

**Current Cloudflare state:**

- Zone `kunanonj.com` is active in Cloudflare account `GoGoCash` with zone ID `a3877987b5872980c295015832058a33`.
- Public nameservers are Cloudflare: `hadlee.ns.cloudflare.com`, `odin.ns.cloudflare.com`.
- Cloudflare DNS API currently returns no DNS records for the zone.
- Public DNS currently does not resolve `kunanonj.com`; `curl https://kunanonj.com/` fails with `Could not resolve host`.
- Cloudflare Workers custom domains list is empty.
- Worker scripts present: `app-staging-proxy`, `fronk-website`, `fronk-website-revalidate-cron`.
- Cron schedules are empty for all three Worker scripts.
- Current app Worker deployment remains `53ff53d6-7a17-47af-98f5-75bcdc26fba8`.

**Current Sanity external state:**

- CORS origins:
  - `http://localhost:3333`
  - `https://fronk-website-production.up.railway.app`
- Webhook:
  - Name: `webhook-setup`
  - Dataset: `*`
  - URL: `https://fronk-website-production.up.railway.app/api/revalidate`
  - Method: `POST`

**Dry-run/command discovery:**

- `pnpm exec wrangler triggers deploy --name fronk-website-revalidate-cron --triggers '0 * * * *' --dry-run` completed without mutating schedules.
- `pnpm exec wrangler triggers deploy --name fronk-website --routes 'kunanonj.com/*' --dry-run` completed without mutating routes.
- Cloudflare API supports Workers custom domain attachment via `PUT /accounts/{account_id}/workers/domains` with body `{ "hostname": "kunanonj.com", "service": "fronk-website" }`.
- Cloudflare API supports cron schedule update via `PUT /accounts/{account_id}/workers/scripts/fronk-website-revalidate-cron/schedules` with body `[{"cron":"0 * * * *"}]`.
- Sanity CLI supports CORS add/delete, but hook management is create/delete rather than in-place update.

**Recommended cutover sequence after explicit approval:**

1. Attach Worker custom domain `kunanonj.com` to service `fronk-website`.
2. Decide whether to also attach/serve `www.kunanonj.com`; if yes, attach it to `fronk-website` as a Worker custom domain too, or intentionally leave it absent.
3. Verify `https://kunanonj.com/`, `/studio`, `/studio/static/create-manifest.json`, `/api/cron/revalidate` unauthenticated `401`, and `/opengraph-image`.
4. Add Sanity CORS origin `https://kunanonj.com` with credentials.
5. Create a new Sanity webhook targeting `https://kunanonj.com/api/revalidate` using the existing `SANITY_REVALIDATE_SECRET`.
6. Publish/update a low-risk Sanity document and verify webhook delivery/logs plus site revalidation.
7. Deploy/activate the cron Worker schedule `0 * * * *`.
8. Verify cron-triggered revalidation against `https://kunanonj.com/api/cron/revalidate`.
9. Only after the Cloudflare production path is verified, proceed to Phase 5 Railway cleanup/removal with a separate explicit approval.

**Rollback before Railway removal:**

- Detach the Worker custom domain(s) from `fronk-website`.
- Delete the new Sanity Cloudflare webhook and keep or restore the Railway webhook.
- Remove the new Sanity Cloudflare CORS origin if needed.
- Clear the cron Worker schedule if it is misfiring.

#### Production Cutover Execution - 2026-06-16

**Scope executed:** User approved serving both apex and `www`. Attached Cloudflare Worker custom domains, updated Sanity CORS/webhook handoff, activated the separate Cron Worker schedule, and ran production smoke tests. Railway services/domains were not removed.

**Cloudflare custom domains and DNS:**

- Attached `kunanonj.com` to Worker service `fronk-website`; Cloudflare custom domain ID `7afe7c9c2097dcbb2a2998ebad0a0ed64c760694`.
- Attached `www.kunanonj.com` to Worker service `fronk-website`; Cloudflare custom domain ID `94c73c6096bf30992ace1fd9e78f8e83f5ffa69b`.
- Cloudflare DNS API now shows read-only Workers-managed proxied `AAAA 100::` records for both hostnames.
- Attempting to add manual proxied `A` placeholders was rejected by Cloudflare with `81062: A DNS record managed by Workers already exists on that host`; no manual DNS record was created.
- Public DNS via `1.1.1.1` returns Cloudflare edge A records for both hostnames: `172.67.220.231`, `104.21.94.75`.
- The local shell resolver still returns `curl: (6) Could not resolve host` for plain `curl https://kunanonj.com/`, while `dig @1.1.1.1` and forced Cloudflare IPv4 edge requests pass. Treat this as local resolver/cache behavior unless another network reproduces it.

**Sanity handoff:**

- Added Sanity CORS origins with credentials:
  - `https://kunanonj.com`
  - `https://www.kunanonj.com`
- Created Sanity webhook `Cloudflare revalidate`, dataset `*`, URL `https://kunanonj.com/api/revalidate`, method `POST`, with a configured webhook secret.
- Kept the existing Railway webhook `webhook-setup` in place as rollback until Phase 5 cleanup is explicitly approved.
- Verified real Sanity-origin delivery with a temporary unreferenced `author` document probe:
  - Probe document ID: `cloudflare-webhook-probe-1781623652618`.
  - Create attempt `atm-3FDxthVBfFnwXEkFIjWJcbTOsyK` returned `200` and revalidated `posts`.
  - Delete attempt `atm-3FDxubwzPsypVJJX7zHWpxAHbyH` returned `200` and revalidated `posts`.
  - Probe document was deleted; `pnpm exec sanity documents get cloudflare-webhook-probe-1781623652618` confirms it is not found.
  - `pnpm exec sanity hook logs "Cloudflare revalidate"` shows both attempts as `success` with result code `200`.

**Cron handoff:**

- Deployed Cron Trigger schedule `0 * * * *` on Worker `fronk-website-revalidate-cron`.
- Cloudflare API confirms the app Worker `fronk-website` has no cron schedules and the separate cron Worker has one hourly schedule.
- The first `triggers deploy` left the cron Worker on a secret-change version that returned Cloudflare `1101`; `pnpm cron:deploy` deployed the current Worker code and fixed the public health endpoint.
- Current cron Worker deployment version: `d07b56d0-a8ea-496d-a13a-861989f20aab`.
- `pnpm exec wrangler secret list --config wrangler.revalidate-cron.jsonc` confirms `CRON_SECRET` exists.

**Production smoke evidence:**

- `https://kunanonj.com/` -> `200 text/html` through Cloudflare IPv4 edge.
- `https://www.kunanonj.com/` -> `200 text/html` through Cloudflare IPv4 edge.
- `https://kunanonj.com/about` -> `200 text/html`.
- `https://kunanonj.com/writing` -> `200 text/html`.
- `https://kunanonj.com/studio` -> `200 text/html`.
- `https://kunanonj.com/studio/static/create-manifest.json` -> `200 application/json`.
- `https://kunanonj.com/opengraph-image` -> `200 image/png`.
- `GET /api/cron/revalidate` without auth -> `401 application/json`.
- `GET /api/cron/revalidate` with `CRON_SECRET` -> `200 application/json`, revalidated tags `posts`, `writing`, `pages`, `ventures`.
- Signed `POST /api/revalidate` using `SANITY_REVALIDATE_SECRET` -> `200 application/json`, revalidated tag `posts`.
- External DNS-over-HTTPS checks:
  - Google DNS resolves `kunanonj.com` A records to `172.67.220.231`, `104.21.94.75`.
  - Cloudflare DNS resolves `www.kunanonj.com` A records to `172.67.220.231`, `104.21.94.75`.
- External HTTP fetch checks:
  - Microlink fetch for `https://kunanonj.com/` returned `statusCode: 200`, title `Fronk Kunanon Jarat — Building fintech and AI from Bangkok.`, Cloudflare POP `EWR`.
  - Microlink fetch for `https://www.kunanonj.com/` returned `statusCode: 200`, same page metadata, Cloudflare POP `EWR`.
  - AllOrigins and Jina reader checks were inconclusive due to upstream timeout/5xx responses, not site-side 4xx/5xx responses.

**Remaining before Phase 5 Railway removal:**

- Completed on 2026-06-16 after explicit user approval.

### Phase 5 - Railway Removal And Cleanup

**Status:** ✅ COMPLETE

**Implementation Summary:** Executed repository and live teardown from the Railway removal plan after Cloudflare production was verified.

**Files/Modules touched:** See `remove_railway_PLAN_16-06-26.md`.

**Test Procedure:**

```bash
rg -n "Railway|railway|Nixpacks|nixpacks|up\\.railway|railway\\.app" -S . -g '!node_modules' -g '!.next' -g '!pnpm-lock.yaml'
pnpm typecheck
pnpm test
```

**Verification Queries:** Railway CLI shows removed services only after explicit approval. DNS and Sanity no longer reference Railway.

**Done Criteria:** User confirms Cloudflare is the only active app hosting path.

**Execution Evidence - 2026-06-16:**

- Removed old Sanity webhook and CORS origin that pointed at `fronk-website-production.up.railway.app`.
- Deleted the old cron service and web service from project `helpful-illumination`.
- Deleted the old project and unlinked the local directory from Railway.
- Updated repo docs/config/scripts to remove active Railway/Nixpacks deployment references.

## Implementation Checklist

- [x] Confirm Cloudflare target account and zone/domain selection.
- [x] Confirm whether the production domain already uses Cloudflare nameservers.
- [x] Confirm R2 availability and expected Workers availability.
- [x] Decide no-downtime cutover vs accepted downtime.
- [x] Add `@opennextjs/cloudflare` dependency.
- [x] Add `wrangler` dev dependency.
- [x] Add `wrangler.jsonc` or `wrangler.toml` for app Worker.
- [x] Add `open-next.config.ts`.
- [x] Add `preview` and `deploy` package scripts.
- [x] Fix `lib/sanity/manifest.ts` / `/studio/static` runtime `fs` issue for Workers.
- [x] Configure Worker env vars/secrets for Sanity, Resend, Cron, analytics in repo docs/config.
- [x] Configure R2 cache binding if R2 is enabled.
- [x] Create separate scheduled revalidation Worker.
- [x] Deploy Cloudflare Cron Trigger schedule after production endpoint is approved.
- [x] Add Cloudflare Web Analytics integration behind env/config.
- [x] Decide whether Turnstile belongs in the first Cloudflare migration or later hardening.
- [x] Run local Next tests.
- [x] Run Wrangler/OpenNext preview.
- [x] Deploy Cloudflare preview Worker.
- [x] Test public routes, API routes, Studio, and scheduled revalidation locally.
- [x] Attach custom domain.
- [x] Update Sanity webhook/CORS/studio URL to Cloudflare production domain.
- [x] Run production smoke tests.
- [x] Verify real Sanity webhook delivery on next content publish or approved CMS probe.
- [x] Update README and env docs to Cloudflare.
- [x] Execute Railway removal only after explicit approval.

## Risks and Mitigations

| Risk                                                             | Tier | Mitigation                                                                     |
| ---------------------------------------------------------------- | ---- | ------------------------------------------------------------------------------ |
| Workers runtime incompatibility breaks production route handlers | R1   | Require `workerd` preview and smoke tests before DNS cutover                   |
| Runtime `fs` manifest route fails on Workers                     | R1   | Rewrite before preview is considered green                                     |
| Revalidation tags do not work without R2/OpenNext cache setup    | R1   | Verify webhook and cron revalidation against deployed Worker                   |
| DNS cutover outage                                               | R0   | Keep Railway live, lower TTL, test Worker custom domain before switch          |
| Sanity Studio or Dashboard compatibility breaks                  | R1   | Test `/studio`, manifest, CORS, and dashboard URL before cutover               |
| Secrets split incorrectly between build and runtime              | R1   | Document build vars vs Worker secrets; verify sitemap/OG and API routes        |
| Adding too much Cloudflare suite at once increases scope         | R2   | Make Web Analytics additive and Turnstile/Images optional after core migration |

## Integration Notes

- `NEXT_PUBLIC_SITE_URL` must be set for Cloudflare build and production runtime behavior that depends on canonical URLs.
- `SANITY_REVALIDATE_SECRET`, `SANITY_PREVIEW_SECRET`, `SANITY_API_READ_TOKEN`, Resend secrets, and analytics IDs must be configured in Cloudflare.
- Existing Sanity Cloud remains the content source; Sanity assets still use `cdn.sanity.io` unless Cloudflare Images is explicitly adopted.
- Keep `pnpm build` behavior for normal CI until Cloudflare scripts are verified; do not break local development.
- Full `pnpm lint` now passes after generated/harness directories are ignored by ESLint; the remaining output is limited to 3 pre-existing warnings.

## Touchpoints

Repository:

- `package.json`
- `pnpm-lock.yaml`
- `wrangler.jsonc` or `wrangler.toml`
- `open-next.config.ts`
- `.env.example`
- `.gitignore`
- `README.md`
- `next.config.ts`
- `app/layout.tsx`
- `app/api/cron/revalidate/route.ts`
- `app/api/revalidate/route.ts`
- `app/api/subscribe/route.ts`
- `app/studio/static/[[...path]]/route.ts`
- `lib/sanity/manifest.ts`
- `scripts/cron-revalidate.mjs`
- `process/general-plans/active/remove_railway_PLAN_16-06-26.md`

External:

- Cloudflare account.
- Cloudflare zone/DNS.
- Workers app deployment.
- Optional R2 bucket/cache binding.
- Cron Worker and Cron Trigger.
- Worker secrets and build variables.
- Cloudflare Web Analytics site token.
- Optional Turnstile site/secret keys.
- Sanity webhook/CORS/studio URL settings.
- Railway services/domains for final removal.

## Public Contracts

Must remain stable:

- Public routes: `/`, `/about`, `/now`, `/ventures`, `/writing`, `/writing/[slug]`, `/contact`, `/resume`, `/studio`.
- API routes: `/api/revalidate`, `/api/draft`, `/api/draft/disable`, `/api/cron/revalidate`, `/api/subscribe`.
- Sanity content model and Studio schema.
- Newsletter API response shape.
- Sitemap, robots, feed, Open Graph image routes.

Expected new contracts:

- `pnpm preview` runs Cloudflare/OpenNext preview.
- `pnpm deploy` deploys to Cloudflare Workers.
- Wrangler config defines the app Worker.
- Cron Worker has a scheduled handler and Cloudflare Cron Trigger.
- Cloudflare docs replace Railway docs in README/env.

## Blast Radius

Medium to high:

- Deployment/runtime changes affect all public routes and API routes.
- DNS cutover affects production traffic.
- Sanity webhook/CORS updates affect content publishing and preview.
- R2/OpenNext cache affects ISR/revalidation semantics.
- Turnstile, if adopted, changes newsletter signup UX and API validation.

No database or CMS schema migration is expected.

## Verification Evidence

Required before Cloudflare repo setup is considered code-done:

```bash
pnpm typecheck
pnpm test
pnpm exec eslint app components lib sanity scripts tests
pnpm preview
```

Required before production cutover:

```bash
PLAYWRIGHT_BASE_URL=https://<cloudflare-preview-domain> pnpm exec playwright test smoke.spec.ts --project=desktop
curl -I https://<cloudflare-preview-domain>/
curl -I https://<cloudflare-preview-domain>/studio
```

Required after production cutover:

```bash
dig <production-domain>
curl -I https://<production-domain>/
PLAYWRIGHT_BASE_URL=https://<production-domain> pnpm exec playwright test smoke.spec.ts --project=desktop
```

Manual evidence:

- Cloudflare dashboard Worker deployment and logs.
- R2/cache binding if enabled.
- Cron Trigger event/log.
- Sanity webhook delivery success.
- Draft preview success.
- User confirms production site is correct.

## Acceptance Criteria

- Cloudflare Workers/OpenNext preview deploy succeeds.
- Cloudflare preview serves public routes and API routes.
- `/studio` and `/studio/static/create-manifest.json` work in Worker runtime.
- Sanity webhook revalidation succeeds on Cloudflare deployment.
- Scheduled revalidation runs via Cloudflare Cron Trigger.
- Production domain resolves through Cloudflare and serves the Worker app.
- Web Analytics is active if approved/configured.
- Turnstile is either explicitly deferred or fully tested on newsletter signup.
- README documents Cloudflare deployment and no longer centers Railway.
- Railway teardown is not executed until Cloudflare production is verified and user approves.

## Rollback Plan

Before DNS cutover:

- Keep Railway production live.
- Revert Cloudflare repo changes if preview fails.
- Remove Cloudflare preview Workers if no longer needed.

During DNS cutover:

- Restore previous DNS records to Railway if Cloudflare production fails.
- Restore Sanity webhook/CORS URLs to Railway domain.
- Keep exported env values for both providers.

After Railway deletion:

- Recreate Railway only from exported settings if needed.
- Prefer rolling back to a previous Cloudflare Worker deployment if the issue is Cloudflare-side.

## Resume and Execution Handoff

Before entering EXECUTE:

1. Read this file.
2. Read `remove_railway_PLAN_16-06-26.md`.
3. Re-check official Cloudflare Next.js/OpenNext docs because adapter requirements can change quickly.
4. Run `sc worktree status --json` and `git status --short --branch`.
5. Confirm target Cloudflare account/zone and no-downtime requirement.
6. Execute Phase 1 only, then stop with findings.

Next instruction for Cursor Plan mode / RIPER-5:

Attach this plan and say: `ENTER EXECUTE MODE for Phase 1 only: inventory Cloudflare account, DNS, R2, Railway, and Sanity dependencies; stop before code edits.`

## Sources

- Cloudflare Workers Next.js guide: `https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/`
- Cloudflare Pages Next.js guide: `https://developers.cloudflare.com/pages/framework-guides/nextjs/`
- Cloudflare Workers automatic configuration guide: `https://developers.cloudflare.com/workers/framework-guides/automatic-configuration/`
- Cloudflare Workers Cron Triggers: `https://developers.cloudflare.com/workers/configuration/cron-triggers/`
- Cloudflare Workers Static Assets: `https://developers.cloudflare.com/workers/static-assets/`
- Cloudflare Web Analytics: `https://developers.cloudflare.com/web-analytics/`
- Cloudflare Turnstile: `https://developers.cloudflare.com/turnstile/get-started/`
- Cloudflare Images framework integration: `https://developers.cloudflare.com/images/optimization/transformations/integrate-with-frameworks/`
