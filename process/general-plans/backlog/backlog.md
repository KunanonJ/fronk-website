# General Backlog

Actionable cross-cutting work that was deliberately deferred. Each entry says why it was deferred. Feature-specific items belong in `process/features/{feature}/backlog/`.

Entry format: Priority, Added, Problem, Root cause, Why deferred, Fix options.

---

## P2: Residual moderate advisories in `glob` and `minimatch`

- **Added:** 02-11-26, from `completed/completed_dependency-upgrade_PLAN_02-11-26.md`
- **Problem:** `pnpm audit` still reports 5 moderate findings from two advisories:
  - `glob` "AbortSignal cancellation bypass", fixed in >=14.0.2 (installed: 10.5.0 and 13.0.6)
  - `minimatch` "globparts amplification" DoS, fixed in >=11.0.1 (installed: 3.1.5, 9.0.9, 10.2.6)
- **Root cause:** both fixes are new majors. Their parents still declare older majors: `@opennextjs/cloudflare` (through `@opennextjs/aws` and `@node-minify/core`) and the ESLint plugins inside `eslint-config-next`.
- **Why deferred:** no fix exists within the current majors, and forcing a major through an override risks breaking OpenNext or lint. Exposure is limited to build and lint tooling; nothing ships in the Worker.
- **Fix options:**
  1. When OpenNext or `eslint-config-next` publish new releases, run `pnpm update` and `pnpm audit` again.
  2. If exposure ever matters, try a major-forcing override behind the full CI suite (typecheck, lint, test, build, `build:cloudflare`).

## P3: Owner decisions left open by the dependency upgrade

- **Added:** 02-11-26
- **Problem:** three choices need the owner's call:
  1. **Override style:** keep exact pins in `pnpm.overrides` (reproducible, but they go stale) or switch to `^` floors. pnpm accepts ranges as override values, so `pnpm update` would then pull in patches.
  2. **Sanity CLI telemetry:** the upgraded CLI collects usage and error telemetry. Its notice says to opt out with `npx sanity telemetry disable` (details: https://www.sanity.io/telemetry).
  3. **Ignored build scripts:** pnpm 10 skips the `esbuild` and `workerd` install scripts and warns on every install. Both work through their platform packages today. Decide with `pnpm approve-builds`, or add them to `ignoredBuiltDependencies` in `pnpm-workspace.yaml` to silence the warning.
- **Root cause:** policy decisions, not technical blockers.
- **Why deferred:** waiting on the owner.
- **Fix options:** each is a one-line config change once decided.

## P3: Platform majors and code hygiene

- **Added:** 02-11-26
- **Problem:**
  - **Node 22 end of life:** 2027-04-30. CI now pins 22.23.4; Node 24 is the current LTS (24.22.2 on 02-11-26).
  - **pnpm 12:** out (12.16.1); the repo stays on pnpm 10 (10.34.9).
  - **TypeScript peer warning:** `@sanity/workflow-blueprint` (through the Sanity CLI) wants `typescript@^6.0.3 || ^7.0.0`. The `typescript` alias points to `@typescript/typescript6@6.0.2`, the newest release of that package.
- **Root cause:** upstream release cadence. (The lint warnings listed here earlier were fixed in visual-redesign Phase 6a: lint is at 0.)
- **Why deferred:** each is a separate, testable change outside the upgrade's scope.
- **Fix options:**
  1. Plan the Node 24 move before 2027-04-30: bump `.node-version` and `engines`, then run CI.
  2. Evaluate pnpm 12 (lockfile and settings migration) as its own plan.
  3. Bump the `typescript` alias once `@typescript/typescript6` publishes 6.0.3.

## P3: Cloudflare suite leftovers

- **Added:** 02-11-26 by plan audit, from `completed/completed_switch_to_cloudflare_suite_PLAN_16-06-26.md`
- **Problem:**
  - **Turnstile:** the newsletter signup was meant to get Turnstile as "post-hosting hardening". It was never built (there is no Turnstile code in `app/`, `components/` or `lib/`).
  - **Web Analytics token:** `components/CloudflareAnalytics.tsx` renders nothing unless `NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN` is set and `NODE_ENV` is `production`. Nobody has confirmed the production value since cutover.
- **Root cause:** both were scoped as additive extras after the core migration.
- **Why deferred:** the hosting move came first. Turnstile changes the signup UX and API validation, so it needs its own plan.
- **Fix options:**
  1. Confirm the token is set wherever production builds run, and that Cloudflare Web Analytics shows traffic for kunanonj.com.
  2. Plan Turnstile as a small feature: site and secret keys, the widget on the signup form, server-side token verification, and tests.

## P3: QA and SEO gaps left by `website-power-upgrade`

- **Added:** 02-11-26 by plan audit, from `process/features/website-power-upgrade/completed/website-power-upgrade_UMBRELLA_PLAN_18-07-26_SUPERSEDED.md`
- **Problem:**
  - **No coverage gate:** Vitest coverage is configured in `vitest.config.mts` (v8 provider) but sets no thresholds, and CI runs `vitest run` without coverage.
  - **No `twitter-image` routes:** low impact. Next.js copies each page's `og:image` into its Twitter card, and since 02-11-26 every page built with `routeShareMeta()` has one (it falls back to the site card, `/opengraph-image`). Before that fix, `/`, `/about`, `/blog`, `/contact`, `/press`, `/showcase` and `/learn` shipped no share image at all.
- **Root cause:** the program was superseded before its QA phase (D) and closeout (E) finished.
- **Why deferred:** the owning program closed, and neither gap blocks anything today.
- **Fix options:**
  1. Measure current coverage, set `coverage.thresholds` slightly below it, and run coverage in CI.
  2. Add `twitter-image` routes only if X previews ever look wrong.

## P3: Harness and context router missing in this checkout

- **Added:** 04-11-26
- **Problem:** `.claude/` (RIPER-5 agents and skills) and `process/context/` (including `all-context.md`, referenced by `CLAUDE.md`) do not exist here, so every phase ran under the Harness-Absent Fallback.
- **Root cause:** `.claude/` is gitignored and this checkout started as a ZIP export; `process/context/` was never generated.
- **Why deferred:** needs the owner to reinstall the harness (`vc-setup`/`vc-update`) and then run `vc-generate-context`.
- **Fix options:** reinstall the harness, then `vc-generate-context` and `vc-audit-context`.

## P3: Portfolio screenshots

- **Added:** 04-11-26
- **Problem:** the four `/portfolio` projects show placeholder tiles; none of the source folders has product screenshots.
- **Why deferred:** the owner chose to supply images.
- **Fix options:** drop files in `public/portfolio/<slug>/` and register `cover`/`gallery` in `lib/content/portfolio.ts` (instructions at the top of that file; a test checks the files exist). Use internal screenshots only after redacting data.

## P2: Visual baselines go stale under the 1% tolerance

- **Added:** 10-11-26, from `process/features/recruiter-fit/reports/phase-1_resume-facts_REPORT_10-11-26.md`
- **Problem:** at `6d31e16`, 28 of the 88 committed Linux baselines differed from a fresh render in the pinned Playwright image, and the suite still passed. One example: the Home desktop baseline drew the "How I work" steps as "Step 01" in two rows, where the code renders "01" to "04" in one. Press pages also vary from run to run.
- **Root cause:** `playwright.config.ts` sets `maxDiffPixelRatio: 0.01`, so a small text or layout change passes against the old image and `--update-snapshots=changed` refreshes nothing.
- **Why deferred:** outside the recruiter-fit scope. Its Phase 2 re-renders every desktop baseline (the header changes), which clears the desktop half.
- **Fix options:**
  1. One housekeeping change: re-render every baseline with `--update-snapshots=all` and review the images.
  2. Lower the tolerance, or add `maxDiffPixels`, so that text changes fail. Find out first why Press varies between runs.
  3. Keep the tolerance and treat "re-render and compare bytes" as the step after any visible change (the header comment in `tests/e2e/visual.spec.ts` describes it).

## P3: `components/ui/Button.tsx` is used only by tests

- **Added:** 10-11-26, from the recruiter-fit Phase 1 report
- **Problem:** the old printed résumé was the last production user of `Button`. `components/ui/Button.test.tsx` and two design ratchets (`lib/design/typeFloor.test.ts`, `lib/design/rawHex.test.ts`) still read the file, so knip does not flag it.
- **Root cause:** the bento redesign moved every page to `components/bento/Buttons.tsx`.
- **Why deferred:** deleting it means editing two ratchet tests, and it has no user-facing effect.
- **Fix options:** delete `Button.tsx` and its test and drop "Button" from the two ratchet lists, or keep it if `/design` should show it again.
