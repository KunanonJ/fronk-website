# Remove Railway From Fronk Website

**Date**: 16-06-26
**Complexity**: Complex
**Status**: ✅ COMPLETE - Repository references removed; Sanity references removed; live app services deleted; local link removed
**Execution Model**: Standard complex plan with a hard approval gate before live Railway teardown

## Overview

Remove Railway-specific deployment, cron, environment, and documentation references from the Fronk website repository, then optionally tear down the live Railway project/services after an explicit external-state approval. Repository cleanup is reversible by git. Live service teardown is destructive and must not begin until the target hosting/downtime decision is confirmed.

## Quick Links

- [Context and Goals](#context-and-goals)
- [Phase Completion Rules](#phase-completion-rules)
- [Execution Brief](#execution-brief)
- [Phased Execution Workflow](#phased-execution-workflow)
- [Railway Touchpoint Inventory](#railway-touchpoint-inventory)
- [Phased Delivery Plan](#phased-delivery-plan)
- [Implementation Checklist](#implementation-checklist)
- [Touchpoints](#touchpoints)
- [Public Contracts](#public-contracts)
- [Blast Radius](#blast-radius)
- [Verification Evidence](#verification-evidence)
- [Resume and Execution Handoff](#resume-and-execution-handoff)

## Context and Goals

The app is a Next.js 16 personal site with Sanity Studio/CMS, draft preview, webhook revalidation, scheduled revalidation, newsletter signup, and Playwright/Vitest verification. The current repo still contains Railway deployment material:

- Railway/Nixpacks config files.
- Railway cron setup docs and helper script.
- README deployment instructions centered on Railway.
- Env comments and package scripts that mention Railway.
- Historical planning/design docs that describe Railway as the deploy target.

`process/context/all-context.md` is referenced by project workflow docs but is currently absent in this checkout. Use the live repo files and this plan as the execution anchor, and treat `process/_seeds/context/all-context.md.seed` only as a scaffold template, not current project truth.

### Goals

- Remove all Railway-specific source-controlled repo references.
- Preserve provider-neutral app functionality: Next.js routes, Sanity Studio, draft preview, webhook revalidation, cron endpoint, and newsletter signup.
- Replace Railway-specific docs with provider-neutral hosting guidance or a clear "hosting target TBD" note.
- Remove Railway-specific scripts/configs that cannot be reused outside Railway.
- Plan live Railway service teardown with explicit user approval, service/domain inventory, and rollback notes.

### Non-Goals

- Choose and implement a replacement hosting provider.
- Remove Sanity Cloud, Studio, Sanity webhooks, or CMS functionality.
- Remove the provider-neutral `/api/cron/revalidate` endpoint unless user explicitly expands scope.
- Modify unrelated untracked harness folders (`.claude`, `.codex`, `.agents`, `.vibecode-backup`) except if they contain source-controlled Railway references intended to land.

## Phase Completion Rules

A phase is NOT complete until:

1. **Integration Test** - Works with other system pieces.
2. **Manual Test** - User can perform the intended action or observe the intended state.
3. **Data Verification** - Repository or external service state is confirmed with concrete commands/screenshots.
4. **Error Handling** - Failure cases and rollback path are documented.
5. **User Confirmation** - User says "it works" or explicitly approves the next destructive step.

Status meanings:

- ⏳ PLANNED - Not started
- 🔨 CODE DONE - Written but not E2E tested
- 🧪 TESTING - Currently being tested
- ✅ VERIFIED - Tested AND confirmed working
- 🚧 BLOCKED - Has issues

After each phase, document:

- [ ] What was tested manually
- [ ] Repo or external state verified, with command/output or dashboard evidence
- [ ] Errors encountered and fixed
- [ ] User confirmation received

## Execution Brief

### Phase 1: Pre-Removal Inventory

**What happens:** Re-scan the repo for Railway/Nixpacks terms, inspect deployment docs/config/scripts, and classify each item as delete, generalize, or preserve.

**Integration points:** README, env template, package scripts, deployment config files, scheduled revalidation script, Sanity webhook docs, historical docs.

**Test:** `rg -n "Railway|railway|Nixpacks|nixpacks|up\\.railway|railway\\.app" -S .` returns the same or fewer expected touchpoints than this plan.

**Verify:** User confirms whether scheduled revalidation remains provider-neutral or should be removed entirely.

**Done when:** The executor presents the final touchpoint map and gets approval to edit repo files.

### Phase 2: Repository Removal

**What happens:** Delete Railway/Nixpacks-only config files, remove Railway CLI setup script and package entry, update README/env/spec/design docs, and generalize cron helper comments.

**Integration points:** `package.json` scripts, README deployment section, `.env.example`, `spec.md`, `docs/redesign/*`, config files, `scripts/*`.

**Test:** Unit/typecheck/test suite remains green; no source-controlled Railway/Nixpacks terms remain unless intentionally quoted in this plan.

**Verify:** `git diff --name-status` shows only scoped files; `rg` proves no remaining unwanted Railway strings.

**Done when:** Repo cleanup is complete, tests pass or known unrelated baseline blockers are reported, and user confirms the repo-facing removal is correct.

### Phase 3: Local Verification

**What happens:** Run automated checks and a repo-wide string audit.

**Integration points:** TypeScript, Vitest, ESLint, Prettier, Playwright smoke if local server is available.

**Test:** Run:

```bash
pnpm typecheck
pnpm test
pnpm exec eslint app components lib sanity scripts tests
rg -n "Railway|railway|Nixpacks|nixpacks|up\\.railway|railway\\.app" -S . -g '!node_modules' -g '!.next' -g '!pnpm-lock.yaml'
```

**Verify:** If full `pnpm lint` or `pnpm format:check` fails because current untracked local harness folders are included, report that as a pre-existing tooling-boundary blocker rather than hiding it.

**Done when:** Functional checks pass and any residual formatting/lint blockers are clearly scoped.

### Phase 4: Live Railway Teardown Preflight

**What happens:** Inventory external Railway state, DNS, Sanity webhooks/CORS, env vars, cron services, and custom domains. Export enough data to recreate if teardown was premature.

**Integration points:** Railway dashboard/CLI, DNS provider, Sanity Manage project, production domain, app availability.

**Test:** Read-only checks only. Example evidence:

```bash
railway status
railway variables
railway domain
```

Use dashboard screenshots or copied settings if CLI access is unavailable.

**Verify:** Confirm replacement hosting is live, or confirm intentional downtime. Confirm which domains currently point at Railway.

**Done when:** User gives explicit "approve live Railway teardown" after reviewing inventory.

### Phase 5: Live Railway Teardown

**What happens:** Disable cron first, detach domains/DNS, remove Sanity webhook/CORS entries that point to Railway URLs, delete Railway services/project, and revoke local Railway linkage if needed.

**Integration points:** Railway services, Railway project, DNS records, Sanity webhook URLs, Sanity CORS origins, local Railway CLI state.

**Test:** Confirm deleted/disabled resources no longer exist or no longer receive traffic.

**Verify:** DNS no longer points to Railway; Sanity has no Railway webhook or CORS origin; Railway dashboard shows no active project/services for this app.

**Done when:** User confirms external teardown is complete and expected site availability state is correct.

### Expected Outcome

- No repo-owned Railway/Nixpacks deployment config remains.
- README and env docs are provider-neutral.
- `package.json` has no Railway setup command.
- Provider-neutral scheduled revalidation is either preserved or explicitly removed by approved scope change.
- Live Railway resources are deleted only after explicit approval and external-state evidence.

## Phased Execution Workflow

For every phase:

1. **Pre-Phase Research** - Read exact files/services involved, identify blockers, and present findings. STOP.
2. **Detailed Planning** - Confirm exact files or external actions. STOP for approval.
3. **Implementation** - Make only approved scoped changes.
4. **Testing & Verification** - Run phase-specific checks and capture evidence.
5. **User Confirmation** - Present what changed, what was tested, and what user can verify.

Do not proceed from repository cleanup to live teardown without a separate explicit approval because live teardown is destructive external state.

## Railway Touchpoint Inventory

Known current touchpoints from initial scan:

| Path                                    | Current Railway Role                     | Planned Action                                                  |
| --------------------------------------- | ---------------------------------------- | --------------------------------------------------------------- |
| `railway.toml`                          | Railway web service config               | Delete                                                          |
| `railway.cron.toml`                     | Railway cron service config              | Delete                                                          |
| `nixpacks.toml`                         | Railway/Nixpacks web build config        | Delete                                                          |
| `nixpacks.cron.toml`                    | Railway/Nixpacks cron build config       | Delete                                                          |
| `scripts/setup-railway-cron.mjs`        | Railway CLI automation                   | Delete                                                          |
| `scripts/cron-revalidate.mjs`           | Cron helper with Railway comments        | Keep only if provider-neutralized                               |
| `package.json`                          | `setup:railway-cron` script              | Remove script                                                   |
| `.env.example`                          | Railway comments and Railway URL example | Rewrite as provider-neutral                                     |
| `README.md`                             | Railway deployment guide                 | Replace with provider-neutral deployment section or hosting TBD |
| `spec.md`                               | Railway wording in non-goals/user story  | Rewrite provider-neutral                                        |
| `docs/redesign/02-current-site-map.md`  | Historical deploy stack note             | Rewrite or annotate to remove Railway term                      |
| `docs/redesign/05-post-merge-polish.md` | Historical command/status notes          | Rewrite or annotate to remove Railway term                      |

External touchpoints to verify before teardown:

- Railway web service.
- Railway cron service, if still present.
- Railway custom/generated domains.
- DNS CNAME/A records pointing to Railway.
- Sanity webhook URL pointing to a Railway domain.
- Sanity CORS origins containing a Railway domain.
- Sanity Studio project URL containing a Railway domain.
- Any local `.railway` project linkage or Railway CLI auth on this machine.

## Phased Delivery Plan

### Phase 1 - Inventory and Scope Lock

**Status:** ⏳ PLANNED

**Implementation Summary:** Re-run Railway string scans, inspect config/docs/scripts, and lock whether cron functionality remains.

**Files/Modules touched:** None.

**Test Procedure:**

```bash
rg -n "Railway|railway|Nixpacks|nixpacks|up\\.railway|railway\\.app" -S . -g '!node_modules' -g '!.next' -g '!pnpm-lock.yaml'
```

**Verification Queries:** N/A for repo-only phase; record scan output.

**Done Criteria:** User approves the exact repository edit list.

### Phase 2 - Repo Cleanup

**Status:** ⏳ PLANNED

**Implementation Summary:** Delete Railway/Nixpacks-only files, remove Railway CLI setup path, generalize cron helper if retained, and update docs/env/spec references.

**Files/Modules touched:** See [Railway Touchpoint Inventory](#railway-touchpoint-inventory).

**Test Procedure:**

```bash
pnpm typecheck
pnpm test
pnpm exec eslint app components lib sanity scripts tests
```

**Verification Queries:**

```bash
git diff --name-status
rg -n "Railway|railway|Nixpacks|nixpacks|up\\.railway|railway\\.app" -S . -g '!node_modules' -g '!.next' -g '!pnpm-lock.yaml'
```

**Done Criteria:** No unwanted Railway/Nixpacks strings remain in source-controlled app/docs/config files.

### Phase 3 - External Teardown Preflight

**Status:** ✅ COMPLETE

**Implementation Summary:** Inventoried live hosting services/domains and dependent Sanity/DNS settings before deletion.

**Files/Modules touched:** None.

**Test Procedure:** Read-only dashboard/CLI inspection.

**Verification Queries:**

```bash
railway status
railway variables
railway domain
```

Dashboard equivalent is acceptable if CLI access is unavailable.

**Done Criteria:** User explicitly confirms replacement hosting or intentional downtime and approves teardown.

**Execution Evidence - 2026-06-16:**

- Cloudflare production was already verified for `kunanonj.com` and `www.kunanonj.com`.
- Sanity only needed removal of the old hosting-provider webhook and CORS origin; the Cloudflare webhook/origins were already verified.
- CLI inventory found project `helpful-illumination` (`d65901f4-6a82-4c1f-967d-a19b91b75f31`) in workspace `GoGoCash`.
- Environment `production` (`23d88cc4-0f8d-4996-9ab4-46ce2adaa3ae`) contained two app services:
  - `cron-revalidate` (`eb62f4c9-dd10-4415-ac19-d5d1b1ab836a`) with schedule `0 * * * *`.
  - `fronk-website` (`57e177e7-842e-4267-aa22-c4e2b8c29118`) with latest deployment `FAILED` and stopped, service domain `fronk-website-production.up.railway.app`, and old custom domain `kunanonj.com`.

### Phase 4 - External Teardown

**Status:** ✅ COMPLETE

**Implementation Summary:** Disable cron, detach domains, remove Sanity Railway URLs, delete Railway services/project, and clean local CLI linkage.

**Files/Modules touched:** External state only.

**Test Procedure:** Verify deleted resources and DNS/Sanity state after each action.

**Verification Queries:**

```bash
dig <domain>
```

Also capture Railway and Sanity dashboard evidence.

**Done Criteria:** No old hosting service/project/domain remains for this app, and user confirms expected production availability.

**Execution Evidence - 2026-06-16:**

- Removed Sanity webhook `webhook-setup`.
- Removed Sanity CORS origin `https://fronk-website-production.up.railway.app`.
- Verified remaining Sanity webhook list contains only `Cloudflare revalidate` -> `https://kunanonj.com/api/revalidate`.
- Verified remaining Sanity CORS origins:
  - `http://localhost:3333`
  - `https://www.kunanonj.com`
  - `https://kunanonj.com`
- Deleted service `cron-revalidate` (`eb62f4c9-dd10-4415-ac19-d5d1b1ab836a`).
- Deleted service `fronk-website` (`57e177e7-842e-4267-aa22-c4e2b8c29118`).
- `railway service list --json` returned `[]`.
- `railway status --json` after service deletion showed no service instances.
- Deleted project `helpful-illumination` (`d65901f4-6a82-4c1f-967d-a19b91b75f31`).
- `railway status --json` after project deletion reported: `Project is deleted. Run railway link to connect to a project.`
- `railway list --json` still shows the deleted project row with `deletedAt: 2026-06-18T15:32:22.500Z` and no services; this appears to be Railway's deletion-retention/purge window, not an active service.
- `railway unlink --yes --json` returned `{"success":true}`.
- Another workspace project, `attractive-enjoyment`, remains active and was intentionally not touched because it is unrelated to this app.

## Implementation Checklist

- [x] Re-run Railway/Nixpacks `rg` scan and save the touchpoint list.
- [x] Confirm whether `scripts/cron-revalidate.mjs` should be provider-neutralized or removed.
- [x] Delete `railway.toml`.
- [x] Delete `railway.cron.toml`.
- [x] Delete `nixpacks.toml`.
- [x] Delete `nixpacks.cron.toml`.
- [x] Delete `scripts/setup-railway-cron.mjs`.
- [x] Remove `setup:railway-cron` from `package.json`.
- [x] Update `README.md` to remove Railway deployment instructions and replace them with provider-neutral hosting notes.
- [x] Update `.env.example` comments and examples to remove Railway-specific language.
- [x] Update `spec.md` Railway wording.
- [x] Update `docs/redesign/*` Railway references or intentionally exclude historical docs only with user approval.
- [x] Run repo verification commands from Phase 2.
- [x] Present repo cleanup diff and await user confirmation.
- [x] Inventory live Railway services/domains/env without deletion.
- [x] Export/copy any env/domain settings needed for rollback.
- [x] Ask for explicit approval for live teardown.
- [x] Disable/delete live Railway resources in the approved order.
- [x] Verify DNS, Sanity webhooks/CORS, and Railway dashboard state.

## Final Verification Evidence - 2026-06-16

- Active app/docs scan returned no matches for old hosting-provider or Nixpacks strings outside migration plan artifacts:
  `rg -n "Railway|railway|Nixpacks|nixpacks|up\\.railway|railway\\.app|setup:railway|railway\\.toml" -S README.md .env.example package.json scripts spec.md docs app lib sanity workers wrangler.jsonc wrangler.revalidate-cron.jsonc .dev.vars.example public open-next.config.ts`
- `pnpm exec sanity hook list` shows only `Cloudflare revalidate` -> `https://kunanonj.com/api/revalidate`.
- `pnpm exec sanity cors list` shows only `http://localhost:3333`, `https://www.kunanonj.com`, and `https://kunanonj.com`.
- `curl --connect-to kunanonj.com:443:104.21.94.75:443 -I https://kunanonj.com/` returned `200`.
- `curl --connect-to www.kunanonj.com:443:104.21.94.75:443 -I https://www.kunanonj.com/` returned `200`.
- `railway status --json` now reports no linked project; before unlink it reported the project as deleted.
- `pnpm typecheck` passed.
- `pnpm test` passed: 42 files, 163 tests.
- `pnpm lint` passed with 0 errors and 3 pre-existing warnings after the ESLint generated/harness ignore boundary was fixed.
- `pnpm exec opennextjs-cloudflare build` passed and generated `.open-next/worker.js`.
- Bug-hunt follow-up fixed stale README route documentation and corrected `/studio` launcher token classes to use the project's defined Tailwind v4 design tokens.

## Risks and Mitigations

| Risk                                                                     | Tier | Mitigation                                                                              |
| ------------------------------------------------------------------------ | ---- | --------------------------------------------------------------------------------------- |
| Live site outage if Railway is deleted before replacement hosting exists | R0   | Require explicit replacement/downtime approval before teardown                          |
| Sanity publish webhooks stop updating content after Railway URL removal  | R1   | Update webhook URL to replacement host or document intentional disable                  |
| Cron scheduled revalidation removed unintentionally                      | R1   | Preserve provider-neutral `/api/cron/revalidate` unless user expands scope              |
| Historical docs lose useful provenance                                   | R2   | Ask before preserving any historical Railway references; otherwise remove literal terms |
| Full format baseline includes unrelated/untracked harness dirs           | R2   | Report baseline blocker separately; verify touched files directly                       |

## Integration Notes

- The public Next.js routes should not change.
- Sanity Studio remains embedded at `/studio`.
- Sanity Cloud remains the CMS provider.
- The webhook route `/api/revalidate` remains provider-neutral; only URLs/docs change.
- The cron endpoint `/api/cron/revalidate` remains provider-neutral unless explicitly removed.
- `CRON_SECRET` can remain if scheduled revalidation remains.

## Touchpoints

Repository:

- `README.md`
- `.env.example`
- `package.json`
- `spec.md`
- `docs/redesign/02-current-site-map.md`
- `docs/redesign/05-post-merge-polish.md`
- `scripts/cron-revalidate.mjs`
- `scripts/setup-railway-cron.mjs`
- `railway.toml`
- `railway.cron.toml`
- `nixpacks.toml`
- `nixpacks.cron.toml`

External:

- Railway project/services/domains/env.
- DNS provider records.
- Sanity Manage webhook/CORS/studio URL settings.
- Local Railway CLI linkage/auth.

## Public Contracts

Must remain stable unless user explicitly changes scope:

- Public routes: `/`, `/about`, `/now`, `/ventures`, `/writing`, `/writing/[slug]`, `/contact`, `/resume`, `/studio`.
- API routes: `/api/revalidate`, `/api/draft`, `/api/draft/disable`, `/api/cron/revalidate`, `/api/subscribe`.
- Env vars for app behavior: Sanity vars, Resend vars, analytics vars.

Expected public contract changes:

- Remove `setup:railway-cron` package script.
- Remove Railway/Nixpacks config files from repo.
- README no longer promises Railway deployment.

## Blast Radius

Low to medium for repo cleanup:

- Docs/config/script cleanup only.
- No app rendering behavior should change.
- No data model changes.
- No Sanity schema changes.

High for live teardown:

- Deleting Railway services can take the current production app offline.
- Removing DNS/Sanity webhook entries can break production content update flow unless replacement URLs exist.
- External teardown is not safely reversible without exported settings and provider reconfiguration.

## Verification Evidence

Required before repo cleanup is considered complete:

```bash
pnpm typecheck
pnpm test
pnpm exec eslint app components lib sanity scripts tests
rg -n "Railway|railway|Nixpacks|nixpacks|up\\.railway|railway\\.app" -S . -g '!node_modules' -g '!.next' -g '!pnpm-lock.yaml'
git diff --name-status
```

Optional, if a local/prod server is available after cleanup:

```bash
pnpm test:e2e --project=desktop
```

Required before live teardown is considered complete:

- Railway dashboard or CLI evidence showing services/project removed.
- DNS evidence showing no domain points to Railway.
- Sanity dashboard evidence showing no Railway webhook/CORS/studio URLs.
- User confirmation that expected production availability state is correct.

## Acceptance Criteria

- No source-controlled repo file contains Railway, railway, Nixpacks, nixpacks, `up.railway`, or `railway.app`, except this plan until archived/updated.
- Railway/Nixpacks config files are removed.
- Railway CLI setup script is removed.
- `package.json` has no Railway setup script.
- README deployment section is provider-neutral or explicitly says hosting target is TBD.
- `.env.example` has no Railway-specific comments or URL examples.
- Sanity, draft preview, webhook revalidation, and newsletter docs remain understandable.
- External Railway teardown is performed only after separate explicit approval.
- Teardown evidence is recorded before the work is marked verified.

## Rollback Plan

Repository rollback:

```bash
git revert <cleanup-commit>
```

or restore deleted files from git if execution is still uncommitted.

External rollback:

- Recreate Railway project/services from exported settings.
- Restore env vars.
- Restore domains/DNS.
- Restore Sanity webhook/CORS/studio URL settings.
- Redeploy and verify routes.

External rollback may not be instant. This is why live teardown requires explicit approval after inventory.

## Resume and Execution Handoff

Before entering EXECUTE:

1. Read this file.
2. Run the Railway/Nixpacks `rg` scan.
3. Re-check dirty worktree state with `git status --short --branch` and `sc worktree status --json`.
4. Confirm whether scheduled revalidation should be preserved as provider-neutral.
5. Execute Phase 1 only, then stop with findings.

Next instruction for Cursor Plan mode / RIPER-5:

Attach this plan and say: `ENTER EXECUTE MODE for Phase 1 only: inventory Railway touchpoints and stop before edits.`
