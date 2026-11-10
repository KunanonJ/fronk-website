# Recruiter fit: umbrella plan

**Status:** IN PROGRESS (10-11-26). Phase 1 complete; Phase 2 approved for
execution; Phase 3 planned.
**Created:** 10-11-26, at `6d31e16`
**Owner goal:** make kunanonj.com fit a recruiter or hiring manager who is
looking for a Forward Deployed Engineer (FDE) or an AI team member.
**Research:** `../references/recruiter-ux-review_10-11-26.md`
**Protocol:** `process/development-protocols/phase-programs.md`. One phase at
a time, each through the 10-step loop.

## Program Goal Charter

North star:

- A recruiter can tell within ten seconds what Kunanon does and that he is
  open to roles, reach a correct two-page résumé in one click, and find
  evidence of delivered outcomes, with every fact the same on the site, in
  the PDF and in his CV.

Definition of done:

- Home states the role and the availability above the fold at 375 px and at
  1440 px, and the résumé is one click from every page at desktop width.
- `/resume` and `public/resume.pdf` carry the CV's facts. The PDF is two A4
  pages, has contact links, and its text layer extracts in reading order with
  whole words.
- No surface disagrees with the CV on an employer name, a title or a date:
  the résumé, Home, About, the FAQ, the FDE hub, `llms.txt`, `llms-full.txt`
  and JSON-LD.
- Each case study states the outcome and the owner's part, from cleared facts
  only.
- Contact has a hiring path, and every recruiter call to action reaches it.

What "verified" means (program level):

- The CI gates pass on the local production build: typecheck, lint with 0
  warnings, format, knip, unit tests, build, first-load budget, and smoke and
  axe in both themes.
- Linux visual baselines are regenerated in the pinned Playwright image for
  every page a phase changes, and every changed image is reviewed.
- The parity reference is re-crawled when titles, meta, JSON-LD or text
  endpoints change by design.
- The phase report records commands and results. Phase 1 also records the PDF
  text-layer transcript.
- "Verified" covers the local production build. The live site is checked
  after the owner deploys, and that check is recorded separately.

Scope tiers to phase mapping:

- Tier 1, one set of facts and a résumé that parses: Phase 1.
- Tier 2, the recruiter path through Home, navigation, the FDE hub and
  Contact: Phase 2.
- Tier 3, evidence in case studies and on Proof: Phase 3.
- This program retires Tiers 1 to 3.

Explicitly out of scope (deferred tier):

- The bento design system, its tokens and its motion.
- The intro overlay and the footer (owner decisions of 09-11-26).
- Blog and Press visibility, and indexing of `/resume` (it stays noindex).
- Thai mirrors of changed pages.
- Off-site profiles such as LinkedIn and the GitHub bio. They are owner
  items, listed as follow-ups in the Phase 1 report.
- New case studies that need source material the repo does not hold (the
  knowledge platform, Lunar AI Agent). They wait in `../backlog/` until the
  owner supplies it.
- New runtime dependencies.

Hard safety constraints (non-negotiable, per phase):

- **Honesty.** A claim appears only if it is in the repo, in the CV or in a
  recorded owner answer. No "evals", "guardrails", "observability" or
  "fine-tuning" as named practices. "RAG" only for the knowledge platform, as
  the CV uses it. No "solo-built" for the intranet.
- **Clearance.** A figure or a partner name from the CV is published only
  after the owner clears it (input O3, answered "all of them" on 10-11-26).
  `/llms-full.txt` prints every résumé bullet, so the résumé counts as a
  public, AI-readable surface. A figure still needs its O4 mapping before it
  is attached to a case study.
- **Privacy.** The repository is public. The owner's phone number, the CV
  file and local file paths never enter it.
- **No outward action without the owner asking:** no deploy, no Sanity
  write, no push and no pull request.
- `public/resume.pdf` is generated from the site, never edited by hand.
- `/resume` stays noindex, `BLOG_PUBLIC` stays false, and no page links to
  `/blog` or `/press`.

## Owner decisions (10-11-26)

1. **Facts.** Where the site and the CV disagree, the CV is correct (the table
   in the research file). Accepted with "go".
2. **Lead role.** FDE and AI engineering lead on the site and in its PDF. The
   CV keeps its own headline for other applications. Accepted with "go" on the
   recommendation.
3. **Execution.** Phase 1 approved: "ENTER EXECUTE MODE". Phase 2 approved the
   same way after Phase 1 closed.
4. **Figures and partner names (O3).** "All of them": every figure and partner
   name in the CV may be public.
5. **Projects on the résumé (O2).** "All three": GoGoCash, Manut AI and
   GoSpark.
6. **Hero (O9).** "Forward deployed AI engineering": the Home h1 becomes "Hi,
   I'm Kunanon Jarat. Forward deployed AI engineering from Bangkok."
7. **Header (O8).** "Yes, add the links": Work, Résumé and AI engineering show
   inline at 1024 px and wider.

Earlier decisions that still bind this program are listed at the end of the
research file.

## Open owner inputs

Each has a default, so no phase waits on a reply unless the table says so.

| ID  | Question | Default until answered | Needed before |
| --- | --- | --- | --- |
| O1  | Which systems did you code yourself, and which did you lead? | No new "built" or "coded" claim. Verbs follow the CV | Phase 3 |
| O2  | Is Manut AI still current, and does GoSpark join it or replace it? | **Answered 10-11-26:** the résumé lists all three. Still open for Phase 2: whether the hero lead names the ventures | Phase 2 (hero) |
| O3  | Which CV figures and partner names may be public? The labels are listed in the Phase 1 plan | **Answered 10-11-26:** all of them. Phase 3 still needs O4 before a figure reaches a case study | Done |
| O4  | Which CV items describe which case study? | No mapping is assumed, so no figure reaches a case study | Phase 3 |
| O5  | Is KK Venture Global the company the site calls FICO Corporation Thailand, and is The Monk Games - Bitkub Metaverse the one it calls The Monk Studios? | Use the CV's names, with the initials tile in place of the old logos | Phase 1 |
| O6  | Recruiter facts: notice period, work authorization, and how to state languages | Omitted | Phase 2 |
| O7  | Should the public PDF carry a phone number? | No | Phase 1 |
| O8  | May the header show inline links at desktop width? This changes the approved canvas header | **Answered 10-11-26:** yes | Done |
| O9  | Final wording of the role-first hero | **Answered 10-11-26:** "Forward deployed AI engineering from Bangkok." The owner may still edit it in `lib/content/landing.ts` | Done |

## Approach decisions

INNOVATE was skipped with the owner's "go". These are the choices it would
have produced.

| Decision | Chosen | Rejected, and why |
| --- | --- | --- |
| Where the recruiter path lives | Inside the existing pages: Home, the FDE hub, the résumé and Contact | A new `/hire` page: it would repeat the FDE hub, which already holds the positioning and sits in the menu. An audience toggle: more state than the problem needs |
| Source of the PDF | Generated from site content by a rebuilt print layout | Shipping the hand-made CV file: two sources drift again, its headline differs from the site, and it carries a phone number |
| Home of résumé data | The repo fallback, which production already renders because Sanity has no `resumeProfile` document | Moving it to Sanity: CMS-driven content is excluded from the visual tests, and nothing there needs migrating |
| Header | Keep the canvas icon buttons and add inline text links at desktop width | Replacing the menu: it holds the Library group and is the crawlable navigation. Leaving the header alone: the résumé stays two steps away |
| Hero | A role-first h1 | Keeping the venture h1 and adding only a pill: the h1 is what gets read |

## Phases

| Phase | Plan | Depends on | Green proves | Status |
| --- | --- | --- | --- | --- |
| 1. Résumé and facts | `../completed/phase-1_resume-facts_PLAN_10-11-26.md` | O2, O3, O5, O7 (all have defaults) | One set of career facts on every surface, and a two-page PDF that parses | COMPLETE (10-11-26): verified locally, committed as `29c835e`, archived. Report: `../reports/phase-1_resume-facts_REPORT_10-11-26.md` |
| 2. Recruiter path | `phase-2_recruiter-path_PLAN_10-11-26.md` | Phase 1 (headline and résumé target); O6, O8, O9 | Role, availability and résumé are visible above the fold and reachable from every page | PLANNED |
| 3. Case-study evidence | `phase-3_case-study-evidence_PLAN_10-11-26.md` | Phases 1 and 2; O1, O3, O4 | Case studies and Proof state cleared outcomes and the owner's part | PLANNED, waits on O1, O3 and O4 for content |

Phase 1 comes first because it removes contradictions a background check
would find, and because Phase 2 points every new button at the résumé.

## Touchpoints

Program level. Each phase plan lists its files.

- Content: `lib/content/` (identity, landing, résumé fallback, about, FAQ,
  topics, contact, portfolio, proof, page meta, freshness).
- Components: `components/resume/`, `components/bento/` (header, menu, chips),
  `components/landing/` (home, discovery, contact, portfolio, library).
- Routes and scripts: `src/routes/_landing/`, `scripts/generate-resume-pdf.mjs`.
- Tests and references: unit tests beside each file, `tests/e2e/`, the Linux
  baselines, `tests/fixtures/site-parity.json`, `src/ported-routes.json`.

## Public Contracts

- No URL is added, removed or redirected. `/contact` gains an optional
  `topic` search parameter in Phase 2.
- `/resume.pdf` keeps its path. Its content, length and file name on download
  change in Phase 1.
- `/llms.txt`, `/llms-full.txt`, the Markdown twins and JSON-LD change by
  design in Phases 1 and 3, because they read the same content modules.
- Menu labels change in Phase 2 (a Résumé row is added, "Skills" becomes
  "Agent skills").

## Blast Radius

- Phase 1: Home (Experience card), About, the FAQ, the FDE hub proof line,
  `/resume` on screen and in print, the text endpoints.
- Phase 2: the header on every page, Home, About, Contact, the FDE hub, the
  portfolio project pages.
- Phase 3: portfolio index and project pages, `/proof`, venture pages, the
  FDE hub proof list, the text endpoints.

## Verification Evidence

Each phase writes `../reports/phase-N_{topic}_REPORT_{dd-mm-yy}.md` with its
commands, results, regression checks and deviations.

- Phase 1: `../reports/phase-1_resume-facts_REPORT_10-11-26.md`. All seven
  gates pass on the local production build.

## Resume and Execution Handoff

- **Current state:** Phase 1 is complete and committed (`29c835e`). Phase 2 is
  approved for execution with O8 and O9 answered; O6 stays on its default.
- **Execute anchor:** `process/features/recruiter-fit/active/phase-2_recruiter-path_PLAN_10-11-26.md`.
- **Before EXECUTE of Phase 2:** re-read that plan, the research file and the
  Phase 1 report, and check drift since `29c835e`.
- **Regression checks to carry forward:** the PDF text-layer read-back and
  `lib/content/resumeFacts.test.ts`.
- **The CV** is the owner's file "Kunanon Jarat CV.pdf" (2 pages, PDF created
  2026-10-07), supplied in the planning session. It is not in the repo. Ask
  the owner for it if it is not at hand.
- **Harness:** `.claude/agents/`, `.claude/skills/` and `process/context/`
  were missing when this plan was written. Follow the Harness-Absent Fallback
  in `process/development-protocols/orchestration.md`, or reinstall the
  harness and run `vc-generate-context` first.
