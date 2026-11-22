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
- **Problem:** six choices need the owner's call:
  1. **Override style:** keep exact pins in `overrides` (`pnpm-workspace.yaml`; reproducible, but they go stale) or switch to `^` floors. pnpm accepts ranges as override values, so `pnpm update` would then pull in patches.
  2. **Sanity CLI telemetry:** the upgraded CLI collects usage and error telemetry. Its notice says to opt out with `npx sanity telemetry disable` (details: https://www.sanity.io/telemetry).
  3. **Build scripts:** pnpm 12 fails an install when a dependency's build script has no `allowBuilds` entry in `pnpm-workspace.yaml`. The pnpm 12 move (22-11-26) set `esbuild`, `sharp`, `unrs-resolver` and `workerd` to `false`, which keeps pnpm 10's behavior (no script runs; esbuild and workerd work through their platform packages) and ends the warning. Set one to `true` to run its script.
  4. **Agent skills (pnpm 12.11+):** every install prints `Agent skills awaiting approval: @tanstack/react-router, @tanstack/react-start.` A pending approval never fails an install. `pnpm approve` records a `permissions` entry in `pnpm-workspace.yaml` and links the approved skills into the agent skill folders that exist (`.agents/skills` is a link to `.claude/skills`); `skills: { dirs: [] }` turns the feature off.
  5. **`pmOnFail: ignore`:** keeps `pnpm-lock.yaml` one YAML document. Without it, pnpm 12 writes its own pinned version into a leading second document, and GitHub's dependency graph then sees no dependencies: Dependabot alerts and security updates stop and open alerts can close (GitHub's "Dependabot supported ecosystems" page, pnpm section). The cost: pnpm 11 and 12 no longer switch to the pinned version on a developer machine. CI and Workers Builds still install exactly 12.21.0. Remove the line once GitHub reads two-document lockfiles.
  6. **`minimumReleaseAge`:** pnpm 12 keeps its 1-day default (pnpm 10's was 0). A Dependabot security update to a release less than a day old fails `pnpm install --frozen-lockfile` (`ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION`) in CI and Workers Builds until the release is a day old. Keep it, or list a package under `minimumReleaseAgeExclude`, or set `minimumReleaseAge: 0` to return to pnpm 10's behavior.
- **Root cause:** policy decisions, not technical blockers.
- **Why deferred:** waiting on the owner.
- **Fix options:** each is a one-line config change once decided.

## P3: Platform majors and code hygiene

- **Added:** 02-11-26
- **Problem:**
  - **Node 22 end of life:** 2027-04-30. Done 21-11-26: `.node-version` and `engines` moved to Node 26.13.1, the Active LTS line (end of life 2029-04-30).
  - **pnpm 12:** done 22-11-26 (pnpm 10.34.9 to 12.21.0, #194).
  - **TypeScript peer warning:** `@sanity/workflow-blueprint` (through the Sanity CLI) wants `typescript@^6.0.3 || ^7.0.0`. The `typescript` alias points to `@typescript/typescript6@6.0.2`, the newest release of that package.
- **Root cause:** upstream release cadence. (The lint warnings listed here earlier were fixed in visual-redesign Phase 6a: lint is at 0.)
- **Why deferred:** each is a separate, testable change outside the upgrade's scope.
- **Fix options:**
  1. Done 21-11-26 (Node 26.13.1, branch `node-26-lts`); the next move is Node 27, Active LTS from 2027-10-20, before Node 26 leaves support on 2029-04-30.
  2. pnpm 12: done (settings moved to `pnpm-workspace.yaml`; `pnpm-lock.yaml` unchanged byte for byte).
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

## P3: Left open by the second UX/UI hunt (22-11-26)

- **Added:** 22-11-26, from `process/features/profile-site-redesign/completed/lts-upgrades-and-ux-hunt-2_PLAN_22-11-26.md`
- **Problem:**
  1. **Home's first-load stylesheets** are 35.9 of their 36 KB budget (`scripts/check-first-load-budget.mjs`). The next CSS that Home loads first will fail the budget.
  2. **Firefox moves Thai text after it lays it out** on the Thai hubs: a layout shift of 0.18 to 0.24 at 390 and 1024 px on the AI hub, with Noto Sans Thai already loaded.
  3. **Safari can land a chapter address 7 px low** on a cold load when Onest swaps in late: two paragraphs above the chapter rewrap, and WebKit has no scroll anchoring (2 of 12 loads with a 150 ms font delay under load).
  4. **TanStack Router leaves a skipped view transition's `ready` rejection unhandled:** navigating again while a page transition is starting logs "Transition was skipped. New ViewTransition started" as a page error, in all three engines. The page itself is fine.
- **Root cause:** (1) Home's sections share one first-load sheet set; (2) Firefox's Thai font matching, not the site (a preload with its own 80 KB budget was measured and did not help); (3) fallback font metrics differ from Onest's; (4) upstream.
- **Why deferred:** none breaks a page. (1) needs a trim pass of its own; (2) has no site-side fix found; (3) shows only on slow font loads; (4) needs an upstream fix.
- **Fix options:**
  1. Trim or move rules out of Home's first-load sheets before the next Home CSS change; re-run `pnpm build && node scripts/check-first-load-budget.mjs`.
  2. Re-measure after the next Firefox release; try `font-display: optional` for the Thai face on the hubs only if a shift above 0.1 persists.
  3. Size the Onest fallback face (`size-adjust`, `ascent-override`) to Onest's metrics, as the Thai fallback faces are sized.
  4. Report it to TanStack Router with the reproduction (hold a transition open 300 ms, then go Back), or catch the rejection where the router starts the transition if it becomes noisy.

## P3: `satori` moderate advisory through `@cf-wasm/og`

- **Added:** 22-11-26
- **Problem:** `pnpm audit --prod` reports GHSA-wx4j-mvgx-mqwp ("Satori-generated SVG has improper escaping", satori before 0.33.5). The path is `@cf-wasm/og` 0.5.0, then `@cf-wasm/satori` 0.4.2, then `satori` 0.32.0.
- **Root cause:** `@cf-wasm/satori` 0.4.2, the latest, depends on satori 0.32.0.
- **Why deferred:** the share images render only the site's own text and pictures, not visitor input, so the escaping flaw has no input to act on; and forcing satori through an override under a WASM wrapper risks breaking the share images.
- **Fix options:**
  1. When `@cf-wasm/og` or `@cf-wasm/satori` publishes a release on satori 0.33.5 or later, update and run `pnpm audit`.
  2. If exposure ever matters, try an override to satori 0.33.5 behind CI and a check that every share image still renders.
