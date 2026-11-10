# Phase 3: Case-study evidence

**Status:** PLANNED (10-11-26). Content waits on owner inputs O1 and O4 (O3 is answered: all figures may be public).
**Created:** 10-11-26, at `6d31e16`
**Umbrella:** `recruiter-fit_UMBRELLA_PLAN_10-11-26.md`
**Research:** `../references/recruiter-ux-review_10-11-26.md` (findings 5 and
10, and the CV comparison)
**Report target:** `../reports/phase-3_case-study-evidence_REPORT_{dd-mm-yy}.md`

## Objective

Each case study states what changed and what the owner's part was, from
cleared facts only. `/proof` shows delivery proof beside the venture metrics.

## Dependencies

- **Phases 1 and 2 verified.**
- **O1:** which systems the owner coded and which he led. It decides the "My
  part" text.
- **O3:** which figures may be public.
- **O4:** which CV items describe which case study.

Without O3 and O4 the data model and the page layout can still be built, but
no figure reaches a page. Without O1, "My part" restates the role the page
already shows.

## Lessons from Phase 1 that change this phase

- **O3 is answered:** every CV figure and partner name may be public. O4, the
  mapping of figures to case studies, is still open, and so is O1.
- **Both languages.** The Thai topic hubs and any Thai string are part of
  every search and every content change.
- **Text endpoints are public surfaces.** `/llms-full.txt` and the Markdown
  twins print what the content modules hold.
- **Baselines:** re-render with `--update-snapshots=all` and compare bytes;
  the 1% tolerance hides small changes. Use the container steps in the
  Phase 1 report.
- **Review before the commit,** and prove new fact tests can fail by breaking
  the fact they guard.

## Mapping to confirm (O4)

Nothing here is assumed until the owner confirms it.

| CV item | Likely case study | Status |
| --- | --- | --- |
| Internal platform: adoption and build-cycle time | TBH Intranet | To confirm |
| Video workflow: staffing change and turnaround | AI Automation | To confirm |
| Private-data knowledge platform (Google ADK, Gemini, RAG) | None on the site. It may be ARIA or a separate system | To confirm |
| Lunar AI Agent (Aiden Labs) | None on the site | Backlog: needs source material |
| GoGoCash: gross merchandise value, cashback paid, role-based agents | `/ventures/gogocash` and `/proof` | To confirm, with an as-of month |

## Work

| Step | Scope |
| --- | --- |
| 3a | **Data model.** Optional `outcomes` (a value and a label each) and `myPart` on `PortfolioProject`. A test proves a project without them renders as it does today |
| 3b | **Project page.** An Outcome card and a "My part" card after the role tiles. One outcome line on the portfolio index cards and on Home's Selected work. The Markdown twin and `llms-full.txt` carry the same lines |
| 3c | **Case-study content.** Add the confirmed and cleared outcomes and the owner's part for TBH Intranet and AI Automation |
| 3d | **Proof.** A Delivery row of tiles that link to their case studies, beside the venture metrics. Rewrite the lead so it no longer repeats the h1. Add GoGoCash's cleared figures with their as-of month |
| 3e | **FDE hub proof list.** Add the cleared outcome lines |
| 3f | **Optional, owner yes or no:** list the public repo of this site as a portfolio project (an open question since 09-11-26). Default: backlog |

## Touchpoints

- `lib/content/portfolio.ts` (type and projects), `lib/content/proof.ts`,
  `lib/content/pageMeta.ts` (`proof` lead), `lib/content/ventures.ts`,
  `lib/content/topics/pillars.ts`, `lib/content/freshness.ts`
- `components/landing/portfolio/PortfolioProjectPage.tsx`, `ProjectCards.tsx`,
  `PortfolioIndexPage.tsx`, `components/landing/home/HomeCards.tsx`,
  `components/landing/library/ProofPage.tsx`
- `src/server/text/portfolioMd.ts`, `llmsFull.ts`, `lib/seo/portfolioJsonLd.ts`
- Tests: `lib/content/portfolio.test.ts`,
  `components/landing/portfolio/portfolio.test.tsx`,
  `components/landing/library/library.test.tsx`,
  `components/landing/home/home.test.tsx`, `src/server/text/pageMd.test.ts`,
  `lib/content/ventureCase.test.ts`
- References: the parity fixture and the Linux baselines for portfolio,
  portfolio-project, portfolio-diagrams, proof, venture-hub, topic-hub-fde
  and home

## Public Contracts

- `PortfolioProject` gains two optional fields. Existing projects stay valid.
- `/portfolio/{slug}.md`, `/llms-full.txt` and the CreativeWork JSON-LD gain
  the outcome lines.
- No URL changes.

## Blast Radius

- Portfolio index and project pages, Home (Selected work), `/proof`, the
  GoGoCash venture page and the FDE hub.
- The honesty rule at the top of `lib/content/portfolio.ts` gains one source:
  owner-stated outcomes from the CV, each cleared. Update that comment.
- Wording stays inside the rule: no "evals" or "guardrails"; "RAG" only for
  the knowledge platform.

## Validation gates

1. `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm knip`, `pnpm test`.
2. `pnpm build`, then `pnpm perf:budget`.
3. Smoke and axe at desktop in both themes.
4. Linux baselines regenerated and reviewed for the pages listed above.
5. Parity re-crawl and 0 differences.
6. **Clearance audit.** Every figure on a changed page appears in the
   owner's O3 answer, and every mapping in the O4 answer. The report lists
   them by label with the reply that cleared each.
7. **Regression.** Phase 1: the PDF text-layer check and the fact-consistency
   search. Phase 2: the Home above-the-fold assertions and the one-click
   résumé check.

## Verification Evidence

To be filled during EXECUTE and copied into the report.

| Gate | Command or check | Result |
| --- | --- | --- |
| 1 to 5 | CI gates, baselines, parity | pending |
| 6 | clearance audit | pending |
| 7 | regression checks for Phases 1 and 2 | pending |

## Blockers that justify BLOCKED

- O3 or O4 is unanswered when the phase reaches step 3c. Steps 3a and 3b may
  finish; the phase is not verified until content exists.
- A figure the owner clears contradicts another surface. Stop and reconcile
  before publishing either.

## Out of scope and follow-ups

- New case studies for the knowledge platform and Lunar AI Agent: write a
  backlog item once the owner supplies source material.
- Real screenshots in place of the illustrative mockups: the slot already
  exists (`cover` and `gallery` in `lib/content/portfolio.ts`).

## Resume and Execution Handoff

- **Execute anchor:** this file. Supporting context: the umbrella plan, the
  research file, and the Phase 1 and Phase 2 reports.
- **Start with** 3a and 3b, which need no owner input. Take O1, O3 and O4 at
  the execution checkpoint.
- **Close out** with the report, a commit recommendation, then UPDATE PROCESS
  to archive the program.
