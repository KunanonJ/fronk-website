# Phase 11: SEO/AEO audit fixes (P1, code) - Plan

**Date**: 04-11-26
**Feature**: `sea-discovery`
**Status**: COMPLETED 04-11-26. Merged as #35 (squash `e5c9517`) and verified live: `/about` h1 "Kunanon Jarat", `/feed.xml` 15 items, Thai pages `lang="th"` + `og:locale` `th_TH`, RSS `<link rel="alternate">` in `<head>`. Archived in UPDATE PROCESS. Full audit: `../reports/seo-aeo-audit_REPORT_04-11-26.md`.
**Branch**: `fix/seo-audit-p1` (from `main` at `8d62622`)
**Source**: SEO/AEO audit run 04-11-26 against the live site plus code. Findings 4 to 8 were confirmed in code during research.
**Harness note**: `.claude/` and `process/context/` are absent. Phases run in the main session per the Harness-Absent Fallback.

## Scope

Five code fixes. Not in scope: owner/dashboard actions from the same audit (GSC/Bing verification, Crawler Hints, the `www` to apex redirect, unpublishing `/blog/hello-world` in Sanity), the thin-content rewrite, and the P2 items.

| # | Finding (confirmed) | Fix |
|---|---|---|
| 4 | `lib/content/faq.ts:23` (feeds FAQPage JSON-LD) and `lib/content/aboutPage.ts:89` call Manut "an all-in-one workspace for solo entrepreneurs". Every other surface (who-is, `/ventures/manut`, Organization JSON-LD, llms.txt) says ERP/CRM with Intelligence AI for automotive SMEs. | Rewrite both to match the venture description. Drop the unverifiable FAQ details ("Notion on steroids", MongoDB, Meta). |
| 5 | The `/about` h1 is "Built for the curious" (`aboutPage.hero.title`, rendered in `components/landing/stock/AsmeCuriousHero.tsx:188`). The support line is generic newsletter copy. | h1 becomes **"Kunanon Jarat"** with the same styling. Support line becomes "Notes on building fintech, ERP/CRM and AI systems from Bangkok. New posts by email." The newsletter form and Manifesto button are unchanged. |
| 6 | Thai pillars (`/th/topics/*`) render under `<html lang="en">` with `og:locale` `en_US`. | `TopicHubPage` sets `lang="th"` on its `<main>` for Thai pillars. `routeShareMeta` gains an optional `locale` (default `en_US`), and Thai pages pass `th_TH`. Root `<html lang>` stays `en`. Splitting the app into per-locale root layouts is a larger restructure for little gain, since Google relies on content and hreflang (already reciprocal). |
| 7 | `/feed.xml` uses Sanity posts only (`app/feed.xml/route.ts:16`), so it is empty when Sanity returns nothing, while `/blog`, the sitemap and llms.txt use `resolveBlogCards` (Sanity plus fallbacks). No page has `<link rel="alternate" type="application/rss+xml">`, because `routeShareMeta`'s `alternates` replaces the root layout's `types`. The feed's `atom:link rel="self"` and 4 site links point to `/rss.xml`, a 308 redirect. | Build feed items from `resolveBlogCards(posts)`. Add `types: { "application/rss+xml": "/feed.xml" }` to `routeShareMeta` alternates. Point `rel="self"` at `/feed.xml` and drop the duplicate alternate. Update the `/rss.xml` links in `public/agents.md`, `public/sitemap.md`, `lib/content/landing.ts` (footer) and `app/llms.txt/route.ts` to `/feed.xml`. The `/rss.xml` redirect stays for old subscribers. |
| 8 | Fallback blog posts mention hub paths as plain text (e.g. "Case hub: /ventures/manut." in `lib/content/blog.ts`), rendered as `<p>{text}</p>` in `components/landing/BlogPostPage.tsx:99`. | Add a `linkifyInternalPaths()` helper that turns `/topics/…`, `/ventures/…`, `/blog/…`, `/about` and `/portfolio/…` mentions into Next `<Link>`s, leaving trailing punctuation outside the link. The post strings stay unchanged. |

## Touchpoints

- `lib/content/faq.ts`, `lib/content/aboutPage.ts` (items 4 and 5)
- `lib/seo/routeMeta.ts` (`locale` option and RSS `types`) and `lib/seo/routeMeta.test.ts`
- `app/(landing)/th/topics/[slug]/page.tsx` (pass `locale: "th_TH"`), `components/landing/discovery/TopicHubPage.tsx` (`lang` on `<main>`)
- `app/feed.xml/route.ts`, plus a new `app/feed.xml/route.test.ts` or a pure item builder in `lib/content/blog.ts` with a test
- `public/agents.md`, `public/sitemap.md`, `lib/content/landing.ts`, `app/llms.txt/route.ts` (`/rss.xml` to `/feed.xml`)
- New `lib/content/linkify.ts` and `lib/content/linkify.test.ts`, used in `components/landing/BlogPostPage.tsx`
- Tests that assert old copy, if any (`lib/content/aboutPage.test.ts` checks only that the title is non-empty; the e2e about pattern also matches "Founder, Bangkok")

## Public Contracts

- `routeShareMeta()` gains an optional `locale?: "en_US" | "th_TH"`. The default stays `en_US`, so existing callers are unchanged.
- Every page using `routeShareMeta` now advertises the RSS feed in `<head>`.
- `/feed.xml` content changes from Sanity-only to Sanity plus fallbacks (same set as `/blog`).
- No route, schema, auth or env changes.

## Blast Radius

- **/about:** visible headline text changes, and the FAQ JSON-LD answer for Manut changes.
- **RSS:** subscribers see about 15 items appear (the fallback posts). Expected and correct.
- **Head tags:** one extra `<link rel="alternate">` on every page that uses `routeShareMeta`.
- **Merge overlap with PR #34 (Portfolio):** both touch `lib/content/landing.ts`, `app/llms.txt/route.ts` and `public/sitemap.md`, but different lines. Rebase on whichever merges second.

## Implementation Checklist

1. Item 4: edit `faq.ts:23` and `aboutPage.ts:89`. Add a test asserting no "solo entrepreneurs" copy remains in `FAQ_ITEMS`/`aboutPage`, and that the Manut FAQ answer mentions automotive.
2. Item 5: edit `aboutPage.hero.title` and `support`. Test that the hero title contains "Kunanon Jarat".
3. Item 6: `locale` option in `routeShareMeta` plus a test. Thai page passes `th_TH`. `TopicHubPage` adds `lang` for Thai.
4. Item 7: extract `buildRssItems(cards, base)` (pure), switch the route to `resolveBlogCards`, fix the self link, add RSS `types` to `routeShareMeta` plus a test, update the 4 `/rss.xml` links.
5. Item 8: `linkifyInternalPaths(text)` returns text/link segments, with tests for trailing punctuation, multiple paths per paragraph and non-matches (e.g. "AR/AP", URLs). Render in `BlogPostPage`. Add a test that every path mentioned in `FALLBACK_BLOG_POSTS` resolves to a known topic, venture or blog slug, or `/about`.
6. Verify (below), update this plan's evidence table, and offer a commit and PR.

## Verification Evidence (EXECUTE, 04-11-26)

| Check | Command | Result |
|---|---|---|
| Types | `pnpm exec tsc --noEmit` | PASS (0 errors after the build regenerated `.next/types`; stale `.next/dev` from an earlier dev server removed) |
| Lint | `eslint` on changed files | PASS |
| Unit | `pnpm test` | PASS: 302 tests, including new `rss.test.ts`, `linkify.test.ts` and new cases in `faq`, `aboutPage` and `routeMeta` |
| Build | `pnpm exec next build` | PASS |
| HTML | `next start` + curl | `/about` h1 "Kunanon Jarat", new support line, FAQ JSON-LD Manut answer updated, 0 "solo entrepreneurs". `/th/topics/*`: `<main lang="th">` and `og:locale` `th_TH`; EN pillar unchanged. RSS `<link rel="alternate">` on `/`, `/about`, `/blog` and a Thai page. `/feed.xml` has 15 items with self link `/feed.xml`; `/rss.xml` returns 308 to `/feed.xml`. llms.txt, agents.md and footer point to `/feed.xml`. A fallback post renders `<a href="/ventures/manut">` and `<a href="/topics/erp-crm-internal-systems">`. |
| Layout | Playwright screenshot of `/about` at 375 and 1440px | No horizontal overflow (h1 is 219px wide at 375px) |
| Smoke e2e | `smoke.spec.ts` (desktop, tablet, mobile) | PASS 42/42 |
| A11y e2e | `a11y.spec.ts` (desktop, tablet, mobile) | Fails on 12 routes with `color-contrast`, **pre-existing**: a per-route axe diff of live `main` vs this branch shows identical violations (0 added, 0 removed). Mostly small text at `text-primary/45` to `/50`. Earlier "passes" were timing: on a cold server, axe ran before scroll-reveal content became visible. Follow-up, out of scope here. Fixed separately in #36 (`process/general-plans/completed/completed_a11y-contrast_PLAN_04-11-26.md`). |
| CI + live | PR #35 checks; production after merge | All checks green, including perf budget (worst 286.6 of 300 KB). Live verified: see Status line. |

## Deviations

- `components/content/AboutFallback.tsx` and `NowFallback.tsx` still carry the old Manut copy, but no page renders them (dead code). Left for a cleanup pass.
- `tests/e2e/routes.ts` about pattern: "Built for the curious" replaced with "Kunanon Jarat". Comment in `AsmeCuriousHero.tsx` updated.

## Resume and Execution Handoff

- Execute anchor: `process/features/sea-discovery/active/phase-11_audit-fixes_PLAN_04-11-26.md`
- Branch `fix/seo-audit-p1` from `main`. Commit per item or as one `fix(seo)` commit, then open a PR.
- Owner follow-ups from the audit, outside this plan: GSC and Bing verification plus sitemap submit; Crawler Hints; Cloudflare `www` to apex 301; unpublish `/blog/hello-world` in Sanity; expand thin posts. P2 items stay in the audit notes.
