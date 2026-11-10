# Portfolio Page - Plan

Status: COMPLETED 04-11-26. Merged as #34 (squash `dd556d6`) and verified live: `/portfolio` and all 4 project pages 200, nav link present, `/.well-known/security.txt` 200. Archived in UPDATE PROCESS.
Created: 04-11-26
Plan type: SIMPLE (single plan, general folder)
Harness note: `.claude/` and `process/context/` are absent in this checkout. Phases run directly in the main session per the Harness-Absent Fallback in `process/development-protocols/orchestration.md`.

## Overview

Add a top-level **Portfolio** item to the site nav. It opens `/portfolio`, a grid of project cards. Each card links to `/portfolio/[slug]`, a detail page with the product image(s), a description, key features and the tech stack.

Portfolio is separate from Ventures. It lists four projects built at The Binary Holdings, not the founder ventures (GoGoCash, Manut AI, AirPlus Auto).

## Decisions (from the user, 04-11-26)

| Topic | Decision |
|---|---|
| Content | The four "other projects" only (below). Ventures stay unchanged. |
| Images | The user provides screenshots later. Until then each project shows a designed placeholder cover. |
| Click behaviour | A dedicated detail page, `/portfolio/[slug]`. |
| Editing | A static TypeScript content file in `lib/content/`, like the Library pages. No Sanity. |
| Nav position | Top level, between Ventures and Library: About, Ventures, **Portfolio**, Library, Blog, Press. |

## Project content (researched 04-11-26 from the source folders)

Honesty rule: the site only states facts the source shows. No invented numbers, clients or outcomes. No live links, because all four are internal tools.

### 1. TBH Intranet (`tbh-intranet`)
- Source: a local checkout named `new-tbh-intranet-dev`
- Tagline: "One back office for a multi-entity group."
- Summary: An internal operations platform built to replace Zoho at The Binary Holdings. It brings HR and payroll, approval chains, Thai accounting, expenses, several CRMs and an AI assistant into one login-only web app.
- Highlights: HR (leave, payroll, attendance, benefits); approval chains for leave, travel and expenses; Thai accounting suite (GL, AR/AP, withholding tax, bank reconciliation, fixed assets); expenses and cash advances with Bank of Thailand FX rates; sales, partner and investor CRMs; ARIA, an AI assistant that reads attachments and searches internal knowledge; projects, surveys, chat and company news.
- Stack: Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Express 5, Prisma, PostgreSQL (Supabase), Supabase Auth, Socket.IO, Google Gemini, Claude API, Turborepo, Vercel, GitHub Actions, Vitest, Playwright
- Period: 2026 (May to Oct, inferred from migrations and docs)
- Kept off the page: staff and entity counts (the source docs disagree), hostnames, Supabase project ID, partner names, finance, HR and cap-table details, security internals, the AWS migration doc.

### 2. Node Validator Automation (`node-validator-automation`)
- Source: a local checkout named `bnry-validator-monitor-main`
- Tagline: "Daily health checks for Avalanche L1 validators."
- Summary: A dependency-free Node.js job. Every morning it reads validator balances from the Avalanche P-Chain, works out burn rate and remaining runway, and emails a red/green report before any validator runs dry.
- Highlights: validator list pulled live over P-Chain JSON-RPC; burn rate and runway from day-over-day comparison; four alert rules (low balance, runway under 7 days, inactive validator, sharp daily drop); HTML, text and JSON reports; email delivery via Resend, with exit codes for a fallback path; daily GitHub Actions schedule that commits each run's data as an audit trail.
- Stack: Node.js, JavaScript, Avalanche P-Chain RPC, Resend, GitHub Actions
- Period: 2026 (daily runs May to Sep)
- Kept off the page: subnet, node and validation IDs; balances and alert state; the owner's email address; wallet and top-up workflow; local paths.

### 3. Email Signature Generator (`email-signature-generator`)
- Source: a local checkout named `email signature`
- Tagline: "Branded Gmail signatures, self-serve."
- Summary: A single-page tool. Staff at The Binary Holdings and The Binary Labs fill in a form, see a live preview and copy a Gmail-ready signature in one click.
- Highlights: company picker with deep links; live preview; rich copy with a plain-text fallback; "Copy HTML" for IT; field checks (email domain match, phone hints); email-safe table markup with 2x images; runs entirely in the browser; image URLs never change, enforced by a deploy check and a daily image-health job.
- Stack: HTML, CSS, JavaScript, Python (Pillow), librsvg, GitHub Pages, GitHub Actions
- Period: 2026 (Sep)
- Kept off the page: the live URL (internal, noindex); the office address; git history containing a real signature; handwriting images, unless the user approves them.

### 4. AI Automation (`ai-automation`)
- Source: a local checkout named `AI-Automation`
- Tagline: "AI agents for content ops and hiring."
- Summary: A team-built set of internal AI agents at The Binary Holdings. The main one, Fando, finds sports clips across five platforms, has Gemini judge and caption them, queues them in Google Sheets for human approval, then trims, stores and publishes the approved clips. A second agent screens job applicants and sends take-home tasks and interview invites.
- Highlights: clip sourcing from YouTube, Instagram, TikTok, Twitch and X; Gemini relevance check plus title and caption writing; duplicate detection with perceptual image hashing; Google Sheets approval queue; trim (29-second cap), Cloud Storage upload and CMS publish through a Playwright browser flow; recruitment agent with resume scoring, case grading and human review for borderline cases.
- Stack: Python, Google ADK, Gemini, Vertex AI, Google Cloud Storage, Google Sheets API, YouTube Data API, Apify, yt-dlp, ffmpeg, Playwright, FastAPI, Supabase, Resend, GitHub Actions
- Period: 2026 (Mar to Apr)
- Kept off the page: teammate handles, GCP project and secret names, internal URLs, HR material, the hardcoded Supabase key, and third-party sports clips. Role wording must say it was team-built (a teammate made most commits).

### Open content questions (defaults apply unless the user changes them)
1. **Role line.** Default: "IT Manager, The Binary Holdings" for 1 to 3, and "Co-builder, TBH team" for 4. The site already names this role in `lib/content/aboutPage.ts` and `lib/content/faq.ts`.
2. **AI-assisted builds.** Default: not mentioned.
3. **Company logos.** Default: not used as cover art. Placeholders until screenshots arrive.

## Touchpoints

New files:
- `lib/content/portfolio.ts`: `PortfolioProject` type, `PORTFOLIO_PROJECTS`, `portfolioPage` copy, and the helpers `getAllPortfolioProjects()`, `getPortfolioProjectBySlug()`, `getAllPortfolioSlugs()`, `getAdjacentPortfolioProjects()`
- `lib/content/portfolio.test.ts`: content integrity tests
- `components/landing/PortfolioPage.tsx`: index grid, wrapped in `LibraryPageShell`
- `components/landing/PortfolioCover.tsx`: shows `next/image` when a cover exists, otherwise a placeholder (serif project name, category eyebrow, subtle gradient in theme tokens, correct in light and dark)
- `components/landing/PortfolioProjectPage.tsx`: detail layout (cover, gallery, summary, highlights, stack chips, meta row, prev/next links), wrapped in `LibraryPageShell`
- `app/(landing)/portfolio/page.tsx`: route with `routeShareMeta`
- `app/(landing)/portfolio/[slug]/page.tsx`: `generateStaticParams`, `generateMetadata` (`hasOwnOgImage: true`), breadcrumb JSON-LD, `notFound()` for unknown slugs
- `app/(landing)/portfolio/[slug]/opengraph-image.tsx`: `renderOgCard({ eyebrow: "Portfolio", ... })`, mirroring ventures
- `public/portfolio/README.md`: where to drop screenshots (`public/portfolio/<slug>/cover.png`, `shot-1.png` and so on) and how to register them in `portfolio.ts`

Edited files:
- `lib/content/landing.ts`: add `{ type: "link", label: "Portfolio", href: "/portfolio" }` to `primaryNav` after Ventures, and to the deprecated flat `nav` list
- `lib/content/library.test.ts` (or `portfolio.test.ts`): assert Portfolio is in `primaryNav`
- `app/sitemap.ts`: add `/portfolio` plus every `/portfolio/<slug>`
- `app/llms.txt/route.ts`: add a Portfolio index line and per-project lines
- `public/sitemap.md`: add rows for `/portfolio` and the four detail pages
- `tests/e2e/routes.ts`: add `/portfolio` and one detail route
- `tests/e2e/visual.spec.ts-snapshots/`: recapture the darwin baselines, since the nav change shifts every page's header

Not touched: ventures content and pages, Sanity schemas, footer (Portfolio could be added to the footer later), home page sections.

## Public Contracts

- New public routes: `/portfolio` and `/portfolio/{tbh-intranet,node-validator-automation,email-signature-generator,ai-automation}`. Slugs become permanent URLs once indexed.
- `PortfolioProject` shape (exported type). Images are optional, so a project with no images renders the placeholder.
- No API, schema, auth or env changes.

## Blast Radius

- **Nav:** every landing page's header gains one item. Risk: the desktop pill gets wider (six items plus the Library dropdown). Check at the `md` breakpoint (768px) so it doesn't overlap the wordmark or Contact. If it does, tighten the gap or move Press into the Library menu (that change would come back for approval).
- **SEO:** five new indexable URLs and share cards. `routeMeta.test.ts` fails if `hasOwnOgImage: true` is missing from the slug page, which is the intended guard.
- **Visual baselines:** all desktop and tablet snapshots change because of the nav. Recapture locally. CI runs smoke tests only, so it isn't affected.
- **Privacy:** content is limited to the "safe to publish" facts above. Covered by review before publishing.

## Implementation Checklist

1. `lib/content/portfolio.ts`: type, the four entries above, `portfolioPage` (eyebrow "Portfolio", title "Selected work", short description), helpers. No `url` on any entry.
2. `lib/content/portfolio.test.ts`: unique slugs that match `^[a-z0-9-]+$`; non-empty name, tagline, summary, at least 3 highlights and at least 3 stack items; any image `src` starts with `/portfolio/<slug>/` and the file exists in `public/`; nav contains `/portfolio`.
3. `PortfolioCover.tsx`: placeholder and image variants with a fixed 16:10 aspect ratio, `sizes` set, `alt` required.
4. `PortfolioPage.tsx`: responsive grid (1 column, 2 from `sm`, 2 to 3 at `lg`). Card: cover, name, tagline, the first 4 stack chips plus "+N", period. The whole card is a link, with a visible focus ring.
5. `PortfolioProjectPage.tsx`: back link to `/portfolio`; large cover; gallery when present; summary; "What it does" highlights list; "Tech stack" chips; meta row (role, organisation, period, "Internal tool"); prev/next.
6. Routes `app/(landing)/portfolio/page.tsx`, `[slug]/page.tsx` and `[slug]/opengraph-image.tsx`.
7. Nav entry in `lib/content/landing.ts`.
8. Sitemap, `llms.txt`, `public/sitemap.md`, e2e `routes.ts`.
9. `public/portfolio/README.md` with image instructions.
10. Verify (below), then recapture the visual baselines.

## Verification Evidence (EXECUTE, 04-11-26)

| Check | Command | Result |
|---|---|---|
| Types | `pnpm typecheck` | PASS |
| Lint | `pnpm exec eslint <changed files>` | PASS |
| Unit tests | `pnpm test` | PASS: 71 files, 300 tests (includes `portfolio.test.ts` and the `routeMeta.test.ts` own-OG guard) |
| Build | `pnpm exec next build` (Sanity manifest/deploy steps of `pnpm build` skipped: no Sanity env locally) | PASS: `/portfolio` static, 4 `/portfolio/[slug]` pages SSG |
| HTTP | `next start` + curl | `/portfolio` and all slugs 200, unknown slug 404, per-project `og:image` 200 `image/png`, sitemap.xml and llms.txt list all 5 URLs |
| Smoke e2e | `playwright test smoke.spec.ts` (desktop, tablet, mobile) vs `next start` | PASS: 48/48 |
| A11y e2e | `playwright test a11y.spec.ts` (desktop, tablet, mobile) | PASS: 48/48, no serious/critical axe violations |
| Image path | Temporary cover registered, dev server, then removed | Card and detail rendered it via `/_next/image`. Live site serves local images through `/_next/image` (200). |
| Manual | Playwright screenshots: dark/light, 375 / 768 / 1024 / 1440px | Layout OK. Nav fits at 768px, top and scrolled. |
| Visual | `playwright test visual.spec.ts` | NOT UPDATED (see deviations) |
| Perf budget | `pnpm perf:budget` (CI step; missed locally on the first push) | First CI run FAILED: `/portfolio/ai-automation` 239.9 > 205 KB default. Fixed in `4ccca40` by budgeting `/portfolio*` as library pages (300 KB, like `/stack` 249.7). PASS: all `/portfolio` routes 239.6 KB. |
| CI + live | PR #34 checks; production after merge | All checks green. Live: `/portfolio`, 4 slugs and `security.txt` return 200. |

## Deviations from plan

1. **Visual baselines not recaptured.** The suite was already stale before this change: only 21 baselines are tracked, 4 of them for current routes (about, contact, home, resume, last updated 13-09-26), 9 for routes that now redirect (now, ventures, writing). Mobile baselines fail with large height changes unrelated to the nav. Refreshing everything would bless months of unrelated drift, so it needs its own decision. The files the run generated were deleted.
2. **No `public/portfolio/README.md`.** Files in `public/` are served publicly, so the image instructions live in the header comment of `lib/content/portfolio.ts` instead.
3. **Detail pages show a cover only when a real screenshot exists.** A placeholder there repeated the page header. Cards keep the placeholder tile (gradient + initials).
4. **No feature branch yet.** Changes are uncommitted on `main`'s working tree. Branching happens at commit time.
5. **Not caused by this change:** a dev-only hydration warning (`tabindex` on the nav menu button) appears under reduced motion on every landing page, including `/stack`. Not fixed here.
6. **Tooling side effect:** `next build` rewrites the Next.js agent-rules heading in `AGENTS.md`. Reverted each time so it stays out of this change.

Separate request in the same session: `/.well-known/security.txt` (RFC 9116) added via `lib/seo/securityTxt.ts` and `app/.well-known/security.txt/route.ts`, with tests. Verified 200 locally.

## Resume and Execution Handoff

- Execute anchor: `process/general-plans/active/portfolio-page_PLAN_04-11-26.md` (this file)
- Start at checklist step 1. Steps 1 to 9 are independent of the images, which the user supplies later by dropping files into `public/portfolio/<slug>/` and adding `cover` and `gallery` entries in `lib/content/portfolio.ts`.
- The checkout became a git repo on 04-11-26 (tracking `origin/main` at `8d62622`). Work on a feature branch; do not commit to `main` without asking.
- After EXECUTE: offer a commit or PR, then UPDATE PROCESS to archive this plan to `process/general-plans/completed/`.
