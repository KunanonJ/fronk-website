# Phase 3: Case-study evidence

**Status:** APPROVED FOR EXECUTION (11-11-26). O1, O3 and O4 are answered.
**Created:** 10-11-26, at `6d31e16`. Updated 11-11-26, at `fdcb904`, with the
owner's answers and the lessons of Phase 2.
**Umbrella:** `recruiter-fit_UMBRELLA_PLAN_10-11-26.md`
**Research:** `../references/recruiter-ux-review_10-11-26.md` (findings 5 and
10, and the CV comparison)
**Report target:** `../reports/phase-3_case-study-evidence_REPORT_{dd-mm-yy}.md`

## Objective

Each case study states what changed and what the owner's part was, from
cleared facts only. `/proof` shows delivery proof beside the venture metrics.

## Dependencies

- **Phases 1 and 2:** merged in pull request #109 and live.
- **O1, O3 and O4:** answered (below).

## Owner answers (11-11-26)

Recorded in the umbrella plan as decisions 10 to 18.

- **Execution:** "ENTER EXECUTE MODE". The owner is asked again before the
  merge.
- **O4, the mapping:**

| CV item | Case study | Answer |
| --- | --- | --- |
| Internal platform: adoption by 50+ employees | TBH Intranet | "Yes, both" |
| Internal platform: build cycles from 4 months to 1 week | TBH Intranet | "Yes, both" |
| Video workflow: 10 people to 1 operator, 30-minute turnaround | AI Automation | "Yes, that is Fando" |
| Private-data knowledge platform (Google ADK, Gemini, RAG) | ARIA, on the TBH Intranet page | "ARIA, the intranet assistant" |
| Lunar AI Agent (Aiden Labs) | None on the site | Backlog: needs source material |
| GoGoCash: gross merchandise value and cashback paid | `/ventures/gogocash` and `/proof` | As of October 2026 |

- **O1, the owner's part:** he wrote code for all four groups asked about:
  the TBH Intranet and ARIA; the AI Automation agents; the validator and
  signature tools; GoGoCash and Manut AI.
- **GoGoCash's user count:** "1,000 registered users" on every page.
- **This site as a project (3f):** yes.
- **"RAG" as a skill:** restore it on the résumé, as in the CV.
- **Résumé and Sanity:** fall back to the repo's data when the read fails.

## Lessons from Phases 1 and 2 that change this phase

- **Both languages.** The Thai topic hubs and any Thai string are part of
  every search and every content change. The Thai FDE hub is now a tested
  route, `topic-hub-fde-th`, with baselines.
- **Text endpoints are public surfaces.** `/llms-full.txt` and the Markdown
  twins print what the content modules hold.
- **A hard constraint is the owner's to interpret.** Where two approved rules
  pull apart, ship the stricter reading and ask.
- **Verbs.** "Wrote code for" is the owner's answer to O1. It is not
  "solo-built", which stays banned for the intranet, and it adds no claim
  about how much.
- **Baselines:** re-render with `--update-snapshots=all` and compare bytes;
  the 1% tolerance hides small changes. Finish with a compare-only run, as
  CI's `visual` job does. `/resume` has no baseline: it is CMS-driven.
- **Parity:** re-crawl with the README command (`PARITY_SEEDS`), then count
  the URLs added and removed. This phase adds URLs on purpose (step 3f).
- **Run the gates on CI's Node:** `npx -y -p node@22 -c '<commands>'`.
- **Check the preview.** The pull request's Cloudflare preview runs the real
  Workers runtime; run the recruiter-path tests against it.
- **Review the fixes too.** In Phase 2 a second review found a regression in
  the first round of review fixes, and seven false statements in the report.
- **Prove new fact tests can fail** by breaking the fact they guard.

## Work

| Step | Scope |
| --- | --- |
| 3a | **Data model.** Optional `outcomes` (a value, a label and the CV line it restates) and `myPart` on `PortfolioProject`. A test proves a project without them renders as it does today |
| 3b | **Project page.** An Outcome card and a "My part" card after the role tiles. One outcome line on the portfolio index cards and on Home's Selected work. The Markdown twin, `llms-full.txt` and the CreativeWork JSON-LD carry the same lines |
| 3c | **Case-study content.** TBH Intranet: adoption by 50+ employees; build cycles from 4 months to 1 week; ARIA described with the CV's words for the knowledge platform. AI Automation: staffing from 10 people to 1 operator; a 30-minute turnaround. "My part" on all four case studies, from the CV's verbs and the O1 answer. The owner sees every line before the merge |
| 3d | **Proof.** A Delivery row of tiles that link to their case studies, beside the venture metrics. Rewrite the lead so it no longer repeats the h1. GoGoCash's gross merchandise value and cashback paid, as of October 2026, on `/ventures/gogocash` and `/proof` |
| 3e | **FDE hub proof list,** English and Thai: the cleared outcome lines |
| 3f | **This site as a portfolio project,** written only from what the repo shows: a fifth entry in `lib/content/portfolio.ts`, with its page, Markdown twin, share image, sitemap entry and parity entries |
| 3g | **One user count.** "1,000 registered users" wherever GoGoCash's users are counted: Home, the venture page, the FAQ, the build board and both languages of the hubs |
| 3h | **Résumé.** "RAG" back in the AI & Cloud skills, with a new PDF. A failed Sanity read shows the repo's résumé, not the error page, and that response is not edge-cached |

## Touchpoints

- Content: `lib/content/portfolio.ts` (type and projects),
  `lib/content/proof.ts`, `lib/content/pageMeta.ts` (`proof` lead),
  `lib/content/ventures.ts`, `lib/content/landing.ts`, `lib/content/faq.ts`,
  `lib/content/buildBoard.ts`, `lib/content/topics/pillars.ts`,
  `lib/content/resumeTimeline.fallback.ts`, `lib/content/freshness.ts`
- Components: `components/landing/portfolio/PortfolioProjectPage.tsx`,
  `ProjectCards.tsx`, `PortfolioIndexPage.tsx`,
  `components/landing/home/HomeCards.tsx`,
  `components/landing/library/ProofPage.tsx`
- Server and SEO: `src/server/text/portfolioMd.ts`, `llmsFull.ts`,
  `lib/seo/portfolioJsonLd.ts`, `src/server/content.functions.ts`,
  `lib/sanity/fetch.ts`, `src/routes/_landing/resume.tsx`
- Tests: `lib/content/portfolio.test.ts`, `lib/content/resumeFacts.test.ts`,
  `components/landing/portfolio/portfolio.test.tsx`,
  `components/landing/library/library.test.tsx`,
  `components/landing/home/home.test.tsx`,
  `components/landing/discovery/VentureHubPage.test.tsx`, `hubLayout.test.ts`,
  `components/resume/ResumePage.test.tsx`, `src/server/text/pageMd.test.ts`,
  `lib/content/ventureCase.test.ts`, `tests/e2e/smoke.spec.ts`
- References: `tests/fixtures/site-parity.json`, `src/ported-routes.json`,
  `public/resume.pdf`, and the Linux baselines for home, portfolio,
  portfolio-project, portfolio-diagrams, proof, venture-hub, topic-hub-fde,
  topic-hub-fde-th and build

## Public Contracts

- `PortfolioProject` gains two optional fields. Existing projects stay valid.
- `/portfolio/{slug}.md`, `/llms-full.txt` and the CreativeWork JSON-LD gain
  the outcome lines.
- Step 3f adds URLs: the new project's page, its Markdown twin and its share
  image. No other URL changes.
- `/resume` answers 200 with the repo's data when Sanity cannot be read.

## Blast Radius

- Portfolio index and project pages, Home (Selected work and the Ventures
  card), `/proof`, the GoGoCash venture page, the FAQ on About, the build
  board, both FDE hubs, `/resume` and its PDF.
- The honesty rule at the top of `lib/content/portfolio.ts` gains one source:
  owner-stated outcomes from the CV, each mapped by the owner. Update that
  comment.
- Wording stays inside the rule: no "evals" or "guardrails"; "RAG" only for
  ARIA, the knowledge platform, and in the résumé's skills list; no
  "solo-built" for the intranet.

## Validation gates

1. `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm knip`, `pnpm test`,
   on Node 26 and on Node 22.23.4.
2. `pnpm build`, then `pnpm perf:budget`.
3. Smoke and axe at desktop in both themes.
4. Linux baselines regenerated and reviewed for the pages listed above, then
   a compare-only run.
5. Parity re-crawl with `PARITY_SEEDS`; the URLs added and removed are
   counted and explained; 0 differences from the gate.
6. **Clearance audit, as a unit test.** Every outcome on a case study, on
   `/proof` and in the FDE hub proof list restates a line of
   `lib/content/resumeTimeline.fallback.ts`, and names the owner answer that
   mapped it. The report lists them with the reply that cleared each.
7. **Regression.** Phase 1: the PDF text-layer check and the fact tests.
   Phase 2: the "recruiter path" browser tests.
8. **Preview.** The recruiter-path tests against the pull request's
   Cloudflare preview.
9. **Review.** One independent review of the phase, then one of its fixes.

## Verification Evidence

Filled during EXECUTE (11-11-26). The report,
`../reports/phase-3_case-study-evidence_REPORT_11-11-26.md`, holds the
detail.

| Gate | Command or check | Result |
| --- | --- | --- |
| 1 | typecheck, lint, format, knip and unit tests on Node 26.12.0 and on Node 22.23.4 | pass on both: 925 tests in 107 files, on one tree |
| 2 | `pnpm build`, `pnpm perf:budget` | pass on both; entry chunk 107.9 KB of 120 KB on Node 22.23.4 |
| 3 | smoke and axe, desktop, on the production build | 178 passed, 25 of them new |
| 4 | Linux baselines re-rendered, the changed pages copied back, then CI's comparison | 96 of 96; 48 changed or new, 4 of them new; 9 stale since before the program left alone |
| 5 | parity re-crawl with `PARITY_SEEDS`, then the gate | 135 URLs: 3 added, 0 removed; 0 differences |
| 6 | clearance audit, `lib/content/portfolioOutcomes.test.ts` and `lib/content/ventureCase.test.ts` | pass; each figure and the reply that cleared it are in the report |
| 7 | PDF text layer; the "recruiter path" browser tests | 844 words, whole and in order; pass |
| 8 | the recruiter-path and case-study tests against the pull request's preview | recorded in the pull request |
| 9 | three review rounds, each followed by its fixes | see the report; 104 mutations caught, none survived |

## Blockers that justify BLOCKED

- A figure the owner cleared contradicts another surface. Stop and reconcile
  before publishing either.
- The résumé fallback cannot be made without caching the fallback at the
  edge for longer than the page's own cache rules allow.

## Out of scope and follow-ups

- "Founder" becomes the CV's "independent project" on every surface: Phase 4,
  `phase-4_cv-framing_PLAN_11-11-26.md`.
- New case studies for Lunar AI Agent: a backlog item once the owner supplies
  source material.
- Real screenshots in place of the illustrative mockups: the slot already
  exists (`cover` and `gallery` in `lib/content/portfolio.ts`).
- The older issues in `../backlog/open-items_11-11-26.md`.

## Resume and Execution Handoff

- **Execute anchor:** this file. Supporting context: the umbrella plan, the
  research file, and the Phase 1 and Phase 2 reports.
- **Order:** 3h and 3g first (small, independent). Then 3a and 3b, then 3c to
  3e, which fill them. 3f last: it adds URLs.
- **Before the merge:** show the owner every outcome line and every "My
  part" line, and ask.
- **Close out** with the report, a commit recommendation, then UPDATE PROCESS.
  Phase 4 follows.
