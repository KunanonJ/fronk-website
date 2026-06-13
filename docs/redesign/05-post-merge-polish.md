# 05 — Post-merge polish: status & backlog

> **Purpose:** seamless handoff. PR #3 (the terminal-HUD redesign) is **merged to `main`**.
> Everything below is **net-new work on top of that**, most of it currently **uncommitted**
> on `redesign/terminal-hud`. This doc is the single source of truth for "what's done,
> what's pending, and how to continue."

**Last updated:** 2026-06-13 · **Branch:** `redesign/terminal-hud` · **Remote:** `KunanonJ/fronk-website`

**Build state (verified 2026-06-13, all current uncommitted changes):**

| Gate | Result |
|------|--------|
| `pnpm typecheck` (`tsc --noEmit`) | ✅ 0 errors |
| `pnpm lint` (eslint) | ✅ 0 errors (1 pre-existing `MobileNav` ref warning, unrelated) |
| `pnpm test` (vitest) | ✅ 27 files / 109 tests pass |

---

## 1. Done since PR #3 merged (currently UNCOMMITTED)

Four workstreams, all green, none committed yet (house rule: commit only when asked → tracked by **#9**).

### A. EO / structured data
- Canonical URLs across routes: `app/layout.tsx` (`alternates.canonical`), `about` / `now` / `contact` / `ventures` / `writing` / `writing/[slug]`.
- **`lib/seo/jsonLd.ts`** (untracked — TDD'd): `buildSiteJsonLd()` emits a schema.org `@graph` (Person / WebSite / Organization / ProfilePage cross-linked by `@id`); `buildProfilePageJsonLd()`; `PERSON_ID` / `WEBSITE_ID`. Wired into `app/layout.tsx` + `app/about/page.tsx`.
- `app/layout.tsx`: Twitter card `creator`/`site` `@fkj98` + preconnects.
- `app/sitemap.ts`: switched to `fetchAllPosts`, `staticUpdated = 2026-06-13`, posts use `post.publishedAt`.

### B. Copy / content
- Tagline **A** (problem→solution) + entity-answer hero/about copy: `lib/site.ts`, `components/Hero.tsx`, `components/content/AboutFallback.tsx`.
- `scripts/seed-content.mjs`: drift fix (old tagline + pre-P6 kicker).

### C. Brand
- `app/opengraph-image.tsx`: rebrand.

### D. Responsive P0 fixes (programmatically verified)
- `app/contact/page.tsx`: long email/URL no longer overflows (`min-w-0 break-all text-right`, label `flex-shrink-0`).
- `components/home/VentureCaseRow.tsx`: metric row → `grid grid-cols-2 … sm:grid-cols-3`; no clip/overlap at 360/390 (naive first fix clipped at 320).

### E. Dopamine micro-interaction **foundation**
- **`app/globals.css`**: `@keyframes hud-pulse` + `--animate-hud-pulse`; `.tick-armed` reticle splay (`scale(1.08)` on `.group:hover`); `@utility panel-live` (border-brighten + `translateY(-2px)`); both neutralised in the `prefers-reduced-motion` block.
- **`components/ui/Button.tsx`**: `active:translate-y-px` (75ms snap), `focus-visible:shadow` mint ring, per-variant `active:` tints (primary `bg-accent/15`, secondary `bg-surface-2`, ghost `text-accent`+`decoration-accent`), `tick-armed` corner ticks.

### Uncommitted file map
```
M app/about|contact|now|ventures|writing|writing/[slug] page.tsx   (canonical + copy/jsonLd)
M app/layout.tsx app/sitemap.ts app/opengraph-image.tsx
M app/globals.css
M components/Hero.tsx components/content/AboutFallback.tsx
M components/home/VentureCaseRow.tsx components/ui/Button.tsx
M lib/site.ts scripts/seed-content.mjs
M tests/e2e/visual.spec.ts-snapshots/{home,about}-{desktop,mobile,tablet}-darwin.png  (regenerated)
?? lib/seo/        <-- MUST be `git add`ed (layout.tsx imports it)
?? docs/content/   <-- article drafts (optional to track)
```

---

## 2. Pending backlog → GitHub issues

| # | Title | Priority |
|---|-------|----------|
| [#5](https://github.com/KunanonJ/fronk-website/issues/5) | Dopamine micro-interactions — per-component wiring (StatusTicker mint+pulse+touch-pause, `panel-live` on venture/writing panels, Header nav active-route, Footer/MobileNav/ThemeToggle states) | P1 |
| [#6](https://github.com/KunanonJ/fronk-website/issues/6) | Responsive — contact `break-words`+whole-row tap, Footer `min-w-0`/`break-all`, resume `h3` break, mobile padding scale | P1 |
| [#7](https://github.com/KunanonJ/fronk-website/issues/7) | Metric count-up animation (reduced-motion gated, SSR-no-flash, rAF cleanup, honest format) | P2 |
| [#8](https://github.com/KunanonJ/fronk-website/issues/8) | AEO `FAQPage` schema — blocked on owner-approved Q&A copy | P2 |
| [#9](https://github.com/KunanonJ/fronk-website/issues/9) | Land the post-merge changeset (commit split + PR) — tracking | — |

**Status update (2026-06-13, later):** CI is now hardened + gating `main` (perf-budget + e2e-smoke jobs, branch protection requiring both checks). Issues **#5, #6, #7 are implemented** and **#8's builder + `<FAQ>` component** are done (TDD; 129 unit tests green, build + perf + e2e-smoke all green). Remaining: **#8 visible FAQ wiring** is still gated on owner-approved Q&A copy (drafted, awaiting sign-off), and the darwin visual baselines need a regen pass to reflect the new padding/dopamine design.

Content **article** pipeline (separate from the above) lives in `docs/content/backlog.md` + the cornerstone draft `docs/content/best-ai-automation-platform-solo-founders.md`.

---

## 3. How to continue (gotchas baked in)

- **Verify gate:** `rtk proxy pnpm typecheck && rtk proxy pnpm lint && rtk proxy pnpm test` — rtk mangles piped output, so use `rtk proxy` (or run `pnpm` directly) when you need to read it.
- **Visual baselines won't update on a copy/style change** unless you delete first: `maxDiffPixelRatio:0.01` masks small text diffs and `--update-snapshots` reports "passed" without rewriting. Fix: `rm` the affected baseline PNG, then regen (nothing to match → fresh write).
- **Stale static prerender:** a deep `siteConfig` change can be served stale from `.next` on `build` (dev is fresh). If a built page looks stale → `rm -rf .next` clean build. Prod unaffected.
- **Playwright server reuse:** `reuseExistingServer:true` + a lingering `next dev`/`next-server` serves stale screenshots → `pkill -9 -f next` / fresh port before regen.
- **Sanity dataset is EMPTY** — the site runs 100% on code fallbacks, so all "content" edits are **code** edits.
- **`/tmp/*.mjs` can't resolve `@playwright/test`** — write probe scripts into the project dir.
- **Perf gate** is `pnpm perf:budget` (`scripts/check-first-load-budget.mjs`), **not** bundle-analyzer (inert under Turbopack). Budget ≤205kb gz.

---

## 4. Commit / PR plan (issue #9)

Suggested split (each green, each revertible):
1. `feat(seo): canonical URLs + JSON-LD @graph + twitter/preconnect/sitemap lastmod`
2. `feat(content): tagline + entity-answer hero/about copy + OG rebrand`
3. `fix(responsive): contact + venture-metric overflow at small breakpoints`
4. `feat(ui): dopamine micro-interaction foundation (globals + Button)`
5. `docs: post-merge polish status + backlog`

`git add lib/seo/` is required (layout imports it). Then PR → `main`. **Awaiting owner go-ahead.**
