# Dependency Upgrade + Security Remediation (02-11-26)

- **Status:** ✅ COMPLETE. Archived 02-11-26 through UPDATE PROCESS (user-approved). Verified locally on Node 26.12.0, then in CI on Node 22.23.4 through PR #32 (all 4 checks green), and deployed to production when PR #32 merged as `57ef4a0` (see Verification evidence).
- **Approval:** user, in chat on 2026-11-02 ("please upgrade all of it")
- **Type:** SIMPLE (manifest + lockfile; code changes only if verification forces them)
- **Executor:** orchestrator directly (the vc-* agents are not present in this checkout; there is no `.claude/`)

## Why

`pnpm audit` on 2026-11-02 reported 84 vulnerabilities (5 critical, 31 high, 40 moderate, 8 low) across 19 packages.

- **Production-facing:** `next` 16.3.5 has 11 advisories, including 3 critical RCEs, all fixed in 16.4.1.
  - The site uses `next/og` ImageResponse (`lib/og/render.tsx`, `app/icon.tsx`, `app/apple-icon.tsx`, 3 `opengraph-image.tsx` routes).
  - It also uses `next/image` (6 files, 5 remote hosts).
  - `use cache` and Server Actions are not used.
- **Stale overrides:** 8 security entries in `pnpm.overrides` were exact pins that had become vulnerable. `pnpm update` cannot move an override.
- **Outdated:** 27 of 41 direct dependencies had newer versions.

## Scope

### Direct dependencies

| Package | From | To | Kind |
|---|---|---|---|
| next | 16.3.5 | 16.4.3 | exact pin, security |
| eslint-config-next | 16.3.5 | 16.4.3 | exact pin, tracks next |
| @next/bundle-analyzer | ^16.3.5 | ^16.4.3 | tracks next |
| react / react-dom | 19.3.0 | 19.3.1 | exact pin |
| wrangler | 4.131.2 | 4.156.1 | exact pin |
| @opennextjs/cloudflare | 1.20.6 | 1.20.15 | exact pin |
| framer-motion | ^13.3.0 | ^14.9.0 | MAJOR |
| three / @types/three | ^0.186.0 | ^0.187.0 | MAJOR (0.x minor) |
| sanity / @sanity/vision | ^6.13.2 | ^6.21.0 | in range |
| @sanity/client | ^8.6.1 | ^8.14.1 | in range |
| @sanity/code-input | ^7.3.8 | ^7.3.14 | in range |
| next-sanity | ^13.3.4 | ^13.4.0 | in range |
| lucide-react | ^1.46.0 | ^1.66.0 | in range |
| simple-icons | ^16.31.0 | ^16.36.0 | in range |
| styled-components | ^6.5.3 | ^6.6.0 | in range |
| lenis | ^1.3.26 | ^1.3.27 | in range |
| eslint | ^10.10.0 | ^10.14.0 | in range |
| @playwright/test | ^1.63.0 | ^1.64.1 | in range |
| @axe-core/playwright | ^4.13.0 | ^4.14.0 | in range |
| @types/node | ^26.5.1 | ^26.6.6 | in range |
| @vitejs/plugin-react | ^6.1.1 | ^6.2.1 | in range |
| jsdom | ^30.0.1 | ^30.1.3 | in range |
| prettier | ^3.9.6 | ^3.9.10 | in range |
| vitest | ^5.0.1 | ^5.0.5 | in range |

### `pnpm.overrides`

These stay exact pins, matching the existing convention. Each is bumped to the newest patched release in the same major.

| Override | From | To |
|---|---|---|
| dompurify | 3.4.11 | 3.4.17 |
| tar | 7.5.16 | 7.5.22 |
| undici@>=7 | 7.28.0 | 7.30.1 |
| adm-zip | 0.6.0 | 0.6.1 (one moderate advisory has no fix upstream) |
| brace-expansion@5 | 5.0.7 | 5.0.12 |
| js-yaml | 4.2.0 | 4.3.2 |
| postcss | 8.5.10 | 8.5.32 |
| smol-toml | 1.6.1 | 1.9.1 |

### Package manager

`packageManager` moves from pnpm@10.28.1 to pnpm@10.34.9, the latest 10.x. CI's `pnpm/action-setup@v4` reads this field because `ci.yml` pins no version.

### Added during execution (found by the post-upgrade audit and engines check)

| Change | From | To | Reason |
|---|---|---|---|
| override `undici@<7` | 6.27.0 | 6.29.1 | OpenNext 1.20.15 now pulls undici 6 through `@dotenvx/dotenvx` (declares `^6.28.1`). The old pin forced it below the parent's own minimum, and 11 advisories applied. |
| override `glob@10` | (new) | 10.5.0 | `@node-minify/core` pins `glob: "10.3.3"` exactly (high: CLI command injection). |
| override `postcss-selector-parser@6` | (new) | 6.1.5 | `@tailwindcss/typography` 0.5.20 (latest) pins `6.0.10` exactly. |
| `.node-version` | 22.12.0 | 22.23.4 | Latest 22.x, a security release. jsdom 30.1.3 and its deps need `^22.22.2`, and Sanity CLI's `skills` needs `>=22.20.0`. |
| `engines.node` | >=22.12.0 | >=22.22.2 | Matches the real minimum. 33 locked packages had already excluded 22.12.0 before this upgrade (e.g. ESLint 10 needs `^22.13.0`). |

## Breaking-change review (done before editing)

- **next 16.4** ([release notes](https://nextjs.org/blog/next-16-4)): no breaking changes; the new features are opt-in.
  - The Turbopack shared runtime chunk and shorter production CSS class names may shift `perf:budget` numbers.
  - The new default `experimental.agentUpgrade: 'security'` only prints upgrade nudges.
- **framer-motion 14.0.0:** the only change removes internal compat APIs that 13.5.1 had restored. The site uses public APIs only: `motion`, `AnimatePresence`, `useReducedMotion`, `useInView`, `useScroll`, `useTransform`.
- **three r187** (Migration Guide): the changes cover TSL, PMREM/`CubeUVReflectionMapping`, WebGPU light registration, XR camera, `setViewport`/`setScissor` with render targets, and `iridescenceThicknessRange`. `components/hero/HeroField.tsx` uses none of these.

## Touchpoints

- **Execution:** `package.json`, `pnpm-lock.yaml`, `.node-version`. No source files needed changes.
- **UPDATE PROCESS (doc and process sync):** `README.md`, `AGENTS.md`, `CLAUDE.md`, `process/development-protocols/orchestration.md`, `process/features/CURRENT_FEATURES.md`, `process/general-plans/backlog/backlog.md`, and this plan's move to `completed/`.

## Steps

1. ✅ Snapshot the project as a backup and diff base (no git here).
2. ✅ Apply the version, override and `packageManager` edits to `package.json`.
3. ✅ Run `pnpm install`, then `pnpm update` to refresh transitive dependencies within their ranges.
4. ✅ Run `pnpm audit` and `pnpm outdated`, then apply the follow-up fixes listed under "Added during execution".
5. ✅ Verify the way CI does:
   - `pnpm typecheck`, `pnpm lint`, `pnpm test`
   - `pnpm build` with CI env vars (schema deploy self-skips without `SANITY_AUTH_TOKEN`)
   - `pnpm perf:budget`
   - OpenNext bundle, and the e2e smoke test

## What's Functional Now

- The site builds and runs on Next.js 16.4.3 and React 19.3.1. That clears all 11 Next.js advisories, including the 3 critical RCEs (this site was exposed to the `next/og` ImageResponse one).
- framer-motion 14 and three r187 work without code changes. The smoke suite renders every route, including the hero and the animations, with no JS errors.
- `pnpm audit` has no critical, high or low findings, and every direct dependency is on its latest version.
- The Cloudflare path builds: OpenNext 1.20.15 accepts Next 16.4.3 and produces the Worker bundle.
- CI is pinned to a Node release (22.23.4) that every locked package supports.

## Public Contracts

None changed: no routes, APIs, env vars, content schemas or app config. The Sanity schema was not deployed during verification (`SANITY_AUTH_TOKEN` unset).

## Blast Radius

- **Every route:** the Next.js and React runtime changed under the whole site. Covered by the build, the smoke suite and the perf budget.
- **Animations and 3D:** framer-motion (8 landing components) and three (`components/hero/HeroField.tsx`).
- **CI and tooling:** Node and pnpm versions, ESLint, Vitest/jsdom, Playwright, the Sanity CLI (new telemetry notice), wrangler and OpenNext.
- **Not touched:** application source, content, the Sanity schema, and the Cloudflare bindings in `wrangler.jsonc`.

## Verification evidence

Run locally on 2026-11-02 with Node 26.12.0, pnpm 10.34.9 and CI's env vars:

| Check | Result |
|---|---|
| `pnpm audit` | 84 → 5 (0 critical, 0 high, 5 moderate, 0 low) |
| `pnpm outdated` | 0 direct dependencies outdated |
| `pnpm typecheck` (TS 7) / `pnpm typecheck:tsc6` | pass / pass |
| `pnpm lint` | 0 errors, 5 warnings (`no-img-element`, ref-cleanup `exhaustive-deps`, unused `_url`/`_init` in a test) |
| `pnpm test` | 69 files, 283/283 passed |
| `pnpm build` | pass: Next.js 16.4.3 (Turbopack), 53 static pages, schema deploy self-skipped |
| `pnpm perf:budget` | PASS; worst route 286.4 KB / 300 KB; Three.js excluded from `/` first load |
| E2E smoke (`smoke.spec.ts --project=desktop`, `pnpm start`) | 14/14 passed |
| `pnpm build:cloudflare` (OpenNext 1.20.15) | pass: "Next.js version : 16.4.3", `.open-next/worker.js` produced |

### Residual (accepted)

- **`minimatch`** (moderate, needs >=11.0.1) and **`glob`** (moderate, needs >=14.0.2): both fixes are majors that OpenNext and the ESLint plugins do not accept yet. These are build and lint tooling only.
- **`adm-zip`** symlink-following advisory: no upstream fix. This was the baseline state; it is no longer flagged after 0.6.1.
- **Peer warnings:**
  - ESLint plugins inside `eslint-config-next` declare support only up to `^9`. This predates the upgrade (ESLint was already 10.x), and lint passes.
  - New: `@sanity/workflow-blueprint` (via Sanity CLI) wants `typescript@^6.0.3 || ^7`, while the `typescript` alias points to `@typescript/typescript6@6.0.2`, its latest. Harmless; it only affects Sanity workflow tooling.
- **Sanity CLI telemetry:** the upgraded CLI collects usage telemetry. Opt out with `npx sanity telemetry disable`.

### CI on Node 22.23.4 (PR #32, 02-11-26)

Ported to the git clone (`~/Developer/fronk-website`, branch `chore/deps-upgrade-2026-11`) and verified by PR #32:

| Check | Result |
|---|---|
| CI / typecheck-lint-test-build | pass on Node 22.23.4 and pnpm 10.34.9 (69/69 test files; perf budget worst route 286.8 KB / 300 KB) |
| CI / e2e-smoke | pass (14/14) |
| Workers Builds: fronk-website | pass (non-production `wrangler versions upload`) |
| AccessLint | pass |

### Production deploy (PR #32 merged, 02-11-26)

Merged as `57ef4a0`. On that commit, Workers Builds (`npx wrangler deploy`), typecheck-lint-test-build and e2e-smoke all passed. A smoke test of kunanonj.com afterwards found:

- the homepage serving a new static asset set
- `/showcase`, `/about`, `/blog`, `/resume` and `/studio` returning 200
- the retirement redirects returning 308
- the `next/og` image routes (`/opengraph-image` plus the venture and topic cards) returning PNGs

The smoke test also found that most pages shipped no `og:image`. That predated this upgrade and was fixed separately (see the `twitter-image` note in `process/general-plans/backlog/backlog.md`).

### Still not verified

- E2E on mobile, tablet, WebKit and Firefox, and the darwin visual baselines (CI does not run these either).

## Rollback

Restore `package.json`, `pnpm-lock.yaml` and `.node-version` from the pre-upgrade snapshot (or from the git clone), then run `pnpm install`.

## Resume and Execution Handoff

This work was done in `~/Developer/fronk-website-main`, which is not a git repo. To land it:

1. Copy `package.json`, `pnpm-lock.yaml` and `.node-version` (plus the `README.md` version lines) into the git clone as one execution commit.
2. Copy the process changes as a separate commit: this archived plan, `AGENTS.md`, `CLAUDE.md`, `process/development-protocols/orchestration.md`, `process/features/CURRENT_FEATURES.md`, and `process/general-plans/backlog/`.
3. Push and confirm CI is green on Node 22.23.4. Done 02-11-26: steps 1-3 landed as PR #32, every check passed, and it merged as `57ef4a0`, which deployed to production.
4. Deferred follow-ups live in `process/general-plans/backlog/backlog.md`.

## Lessons Learned

- **Exact-pin overrides go stale silently.** 8 of the 19 vulnerable packages were held back by the repo's own security overrides, and `undici@<7` was forcing a version below its parent's declared minimum (`^6.28.1`). pnpm warns about neither. Re-check every override against the patched ranges on each upgrade.
- **Node version drift is silent too.** 33 locked packages already excluded CI's Node 22.12.0 before this upgrade (ESLint 10 needs `^22.13.0`), because pnpm only enforces `engines` with `engine-strict`. The lockfile records each package's `engines.node`, so comparing it with `.node-version` is scriptable.
- **Triage advisories by dependency path.** The 84 findings reduced to one production-facing fix (`next`). Everything else came in through the Sanity CLI or devDependencies.
- **`pnpm update` defaults to `--depth Infinity`.** After editing `package.json`, it refreshes transitive dependencies within their ranges. That is what cleared the leftover transitive advisories.
- **OpenNext runs `pnpm build` itself,** so `build:cloudflare` runs the Sanity manifest and schema deploy twice (see the backlog).
- **Read `plan-lifecycle.md` before writing a plan.** This plan first shipped without the Public Contracts, Blast Radius and Resume sections that the direct-plan contract requires.
