# Portfolio visuals: mockup, architecture, workflow - Plan

**Date**: 04-11-26
**Status**: COMPLETED 04-11-26 (approved "ok go"). Shipped in the PR that adds this file; live check recorded on the PR.
**Branch (on execute)**: `feat/portfolio-visuals` from `main`
**Harness note**: `.claude/` and `process/context/` are absent. Phases run in the main session per the Harness-Absent Fallback.

## Goal
Give each `/portfolio` project real visual content while screenshots are pending (#44):
1. **Mockup**: an illustrative UI of the product, drawn in code and clearly labelled as illustrative. It replaces the initials tile on cards and becomes the detail-page hero until a screenshot is registered.
2. **How it works**: a step-by-step workflow diagram.
3. **Architecture**: a layered diagram (who uses it, then app, then services, then hosting), with tech brand icons.

## Approach (recommended): data-driven React components, no new dependencies
- Diagrams are **HTML/CSS built from data in `lib/content/portfolio.ts`**, not images:
  - Theme-aware (dark and light via tokens), crisp at any size, responsive (horizontal on desktop, vertical on mobile).
  - Text stays in the DOM, so it's accessible and crawlable, and it's easy to edit later.
- Icons: `simple-icons` for tech brands (already used by `/stack`) and `lucide-react` for generic steps. Both are installed and every needed icon was confirmed. Consumer platforms (YouTube, TikTok and the like) appear as text with generic icons, not their logos.
- Server components, so page JS weight barely changes. The perf budget gets checked anyway.
- Rejected alternatives:
  - **Mermaid at runtime:** a heavy client bundle that would blow the perf budget, and it styles poorly in both themes.
  - **Mermaid or Excalidraw at build time:** adds puppeteer/CLI tooling for static images that can't adapt to the theme.
  - **Designed image files:** needs design time, and the owner already holds that task in #44.

## Honesty rules
- Workflow and architecture content restates only what each project's source showed in the 04-11-26 research. Nothing internal: no hostnames, IDs, balances, or staff or partner names.
- Mockups contain **no real data**: skeleton bars and generic labels only. Each carries a visible caption, "Illustrative mockup, not real data".

## Data model (additions to `PortfolioProject`)
```ts
type VisualIconId = /* brand ids (simple-icons) | generic ids (lucide) */;
workflow?: { title: string; steps: readonly { label: string; detail?: string; icon?: VisualIconId }[] };
architecture?: { layers: readonly { label: string; nodes: readonly { label: string; note?: string; icon?: VisualIconId }[] }[] };
mockup?:
  | { kind: "app-shell"; title: string; nav: readonly string[]; tiles: readonly string[] }
  | { kind: "email-report"; subject: string; status: string; columns: readonly string[] }
  | { kind: "form-preview"; fields: readonly string[]; action: string }
  | { kind: "review-queue"; title: string; columns: readonly string[] };
```

## Content per project

### TBH Intranet
- **Mockup** `app-shell`: "Intranet". Nav: Dashboard, HR, Approvals, Accounting, CRM, ARIA. Tiles: Leave requests, Pending approvals, Expenses, Company news (skeleton bars, no numbers).
- **How it works** (approval flow):
  1. Submit a request (leave, travel or expense)
  2. Approval chain (each approver in turn)
  3. Recorded in the HR or accounting module
  4. Requester notified (in app and push)
- **Architecture**:
  - Users: staff in the browser (installable web app)
  - Web app: Next.js 16, React 19, Tailwind, shadcn/ui
  - API: Express 5 with Zod; Socket.IO for real time
  - Services: PostgreSQL on Supabase via Prisma; Supabase Auth and Storage; ARIA AI (Gemini + Claude, embedding search); integrations (Google Gmail and Sheets, Bank of Thailand FX rates, PostHog)
  - Build and hosting: Turborepo monorepo, Vercel (hosting + cron), GitHub Actions CI

### Node Validator Automation
- **Mockup** `email-report`: subject "Validator health report". Status banner "All validators healthy". Columns: Validator, Balance, Runway, Status (skeleton rows, no values).
- **How it works**:
  1. Daily schedule (GitHub Actions, 08:58 Bangkok time)
  2. Read the validator set (P-Chain JSON-RPC)
  3. Compare with yesterday (burn rate, runway)
  4. Apply 4 alert rules
  5. Email the report (Resend, with a fallback path)
  6. Commit the day's snapshot (audit trail)
- **Architecture**:
  - Trigger: GitHub Actions cron
  - Job: a Node.js script with zero dependencies
  - Data source: Avalanche P-Chain JSON-RPC
  - Delivery: Resend email API
  - Storage: JSON snapshots committed to the repo

### Email Signature Generator
- **Mockup** `form-preview`: fields Name, Title, Email, Phone, Company. Live signature preview on the right. A "Copy signature" button.
- **How it works**:
  1. Pick the company (or open a company link)
  2. Fill in your details (checked as you type)
  3. Live preview (email-safe HTML)
  4. One-click copy (rich text, plain-text fallback, raw HTML for IT)
  5. Paste into Gmail
- **Architecture**:
  - Browser: a single page (HTML, CSS, JavaScript) where nothing typed is sent anywhere
  - Assets: logos and icons rendered by a Python script (Pillow, librsvg) to permanent PNG URLs
  - Hosting: GitHub Pages, deployed by GitHub Actions
  - Safeguards: a deploy check blocks image renames, and a daily job confirms the images are live

### AI Automation
- **Mockup** `review-queue`: "Clip review queue". Columns: Clip, Title, Score, Approve (thumbnail and checkbox skeletons, no real clips).
- **How it works** (Fando):
  1. Find clips (YouTube, Instagram, TikTok, Twitch, X)
  2. Gemini review (real match content? writes title + caption)
  3. Skip duplicates (perceptual image hashing)
  4. Human approval (Google Sheets queue)
  5. Trim and store (ffmpeg, 29-second cap, Cloud Storage)
  6. Publish and verify (CMS via a Playwright browser flow)
- **Architecture**:
  - Sources: YouTube Data API, Apify (Instagram), yt-dlp
  - Agents: Python on Google's Agent Development Kit, deployable to Vertex AI Agent Engine
  - Model: Gemini
  - Human in the loop: Google Sheets queue
  - Media and storage: ffmpeg, Google Cloud Storage
  - Publishing: Playwright browser automation
  - Also in the repo: a recruitment agent (FastAPI, Supabase, Resend)

## Touchpoints
- New:
  - `components/landing/portfolio/VisualIcon.tsx`: id to simple-icon or lucide
  - `PortfolioMockup.tsx`: 4 kinds in a browser or email frame, `role="img"` plus an aria-label and the visible caption
  - `PortfolioWorkflow.tsx`: `<ol>`, horizontal with connectors from `lg`, vertical timeline on mobile
  - `PortfolioArchitecture.tsx`: stacked layers with down-arrows, each layer an `<h3>` and a `<ul>` of node chips
- Edited:
  - `lib/content/portfolio.ts`: types and the content above
  - `components/landing/PortfolioCover.tsx`: screenshot, otherwise mockup, otherwise initials tile
  - `components/landing/PortfolioProjectPage.tsx`: hero = screenshot or mockup; full-width "How it works" and "Architecture" sections after the main grid
  - `lib/content/portfolio.test.ts`: data checks
  - `tests/e2e/routes.ts`: add `/portfolio/ai-automation` (the most complex diagram) to smoke and a11y
- Not touched: OG images, `/stack`, ventures.

## Blast radius
Portfolio pages only. Cards change from the initials tile to a mockup. Detail pages get longer.

## Verification
| Check | How |
|---|---|
| Unit | Each project has a mockup, at least 3 workflow steps and at least 2 architecture layers with at least 1 node each; labels non-empty |
| Types / lint / build / perf budget | `tsc`, eslint, `next build`, `pnpm perf:budget` (portfolio at or under 300 KB) |
| E2E | smoke + a11y (dark and light) on desktop, tablet and mobile, including the new route |
| Visual | Screenshots of a card grid and a detail page in dark and light at 375 and 1440px. Diagrams readable, no overflow. |

## Verification Evidence (EXECUTE, 04-11-26)
| Check | Result |
|---|---|
| Unit | `pnpm test` 320/320, including 4 new "portfolio visuals" tests (presence, 3+ steps, 2+ layers with nodes, mockup labels short and digit-free) |
| Types / lint | `tsc` 0 errors. eslint 0 errors (1 existing `<img>` warning in `Features.tsx`). Icon maps use `satisfies Record<…>`, so a missing icon is a type error. |
| Build / perf | `next build` PASS. `perf:budget` PASS: all `/portfolio` routes still 239.6 KB, since the diagrams are server-rendered. |
| E2E | smoke + a11y (dark and light) on desktop, tablet and mobile: 141/141, including the new `/portfolio/ai-automation` route |
| Visual | Screenshots at 1440px in dark (index, AI Automation detail) and light (Node Validator detail), and at 375px in light (AI Automation). No horizontal overflow. The stepper is horizontal from `lg` and a vertical timeline on mobile. Mockups follow the theme. |

## Deviations
- Files live under `components/landing/portfolio/` (`VisualIcon`, `PortfolioMockup` + `MockupStage`, `PortfolioWorkflow`, `PortfolioArchitecture`) plus `lib/content/visualIcons.ts` for the icon id union. Same scope as planned.
- The workflow uses a numbered stepper with a connecting line rather than arrow glyphs, which reads better at 5 and 6 steps.

## Resume and Execution Handoff
- Execute anchor: this file. Branch `feat/portfolio-visuals`, PR, CI green, squash merge, verify live.
- When #44 screenshots land, they take precedence over the mockup for the cover. The workflow and architecture sections stay.
