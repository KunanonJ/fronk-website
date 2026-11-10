# Recruiter fit: umbrella plan

**Status:** IN PROGRESS (11-11-26). Phases 1 and 2 are complete, merged
through pull request #109 (`fdcb904` on `main`) and live. Phase 3 is approved
for execution. Phase 4, the CV's framing for the two projects, is planned.
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
- Tier 4, the CV's framing for GoGoCash and Manut AI on every surface (owner
  decision 15): Phase 4.
- This program retires Tiers 1 to 4.

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
  "fine-tuning" as named practices. "RAG" only where the CV uses it: for the
  knowledge platform, which is ARIA, and in the résumé's skills list (owner
  decisions 11 and 13). No "solo-built" for the intranet.
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

8. **Pull request and merge (10-11-26).** "commit+pr if ci pass merge it":
   Phases 1 and 2 reached `main` through pull request #109.
9. **Housekeeping (11-11-26).** "All of them": the UPDATE PROCESS items after
   Phase 2.
10. **Phase 3 (11-11-26).** "ENTER EXECUTE MODE".
11. **"RAG" as a skill (11-11-26).** "Restore it, as in my CV": the résumé and
    its PDF list RAG under AI & Cloud. It had been taken off before the merge
    on the stricter reading of the wording rule.
12. **Résumé and Sanity (11-11-26).** "Fall back": when the Sanity read fails,
    the résumé shows the repo's data, not the error page.
13. **O4, the mapping (11-11-26).** Adoption by 50+ employees and build cycles
    from 4 months to 1 week describe the TBH Intranet ("Yes, both"). The video
    workflow, 10 people to 1 operator with a 30-minute turnaround, is the AI
    Automation case study ("Yes, that is Fando"). The private-data knowledge
    platform is ARIA, the intranet assistant.
14. **O1, the owner's part (11-11-26).** He wrote code for all four groups
    asked about: the TBH Intranet and ARIA; the AI Automation agents; the
    validator and signature tools; GoGoCash and Manut AI.
15. **The two projects' framing (11-11-26).** "CV framing everywhere":
    GoGoCash and Manut AI are independent projects, not ventures he is the
    "Founder" of, on About, the venture pages, the structured data and the
    text files. A separate change after Phase 3: Phase 4.
16. **GoGoCash's user count (11-11-26).** "1,000 registered users" on every
    page, in the CV's words.
17. **GoGoCash's figures (11-11-26).** THB 13 million cumulative gross
    merchandise value and THB 169,000 cashback paid are as of October 2026.
18. **This site as a project (11-11-26).** "Yes, add it": Phase 3 step 3f.

Earlier decisions that still bind this program are listed at the end of the
research file.

## Open owner inputs

Each has a default, so no phase waits on a reply unless the table says so.

| ID  | Question | Default until answered | Needed before |
| --- | --- | --- | --- |
| O1  | Which systems did you code yourself, and which did you lead? | **Answered 11-11-26:** he wrote code for all of them (decision 14) | Done |
| O2  | Is Manut AI still current, and does GoSpark join it or replace it? | **Answered 10-11-26:** the résumé lists all three. Still open for Phase 2: whether the hero lead names the ventures | Phase 2 (hero) |
| O3  | Which CV figures and partner names may be public? The labels are listed in the Phase 1 plan | **Answered 10-11-26:** all of them. Phase 3 still needs O4 before a figure reaches a case study | Done |
| O4  | Which CV items describe which case study? | **Answered 11-11-26:** decision 13 | Done |
| O5  | Is KK Venture Global the company the site calls FICO Corporation Thailand, and is The Monk Games - Bitkub Metaverse the one it calls The Monk Studios? | Use the CV's names, with the initials tile in place of the old logos | Phase 1 |
| O6  | Recruiter facts: notice period, work authorization, and how to state languages | Omitted | Phase 2 |
| O7  | Should the public PDF carry a phone number? | No | Phase 1 |
| O8  | May the header show inline links at desktop width? This changes the approved canvas header | **Answered 10-11-26:** yes | Done |
| O10 | Does "turn repeated mistakes into guardrails", on `/skills` and in the operating model, break the wording rule? Both predate this program | Left as it is | None |
| O11 | "The Binary Labs" is named once, on the email signature case study, and nowhere in the résumé | Left as it is | Phase 3 (optional) |
| O12 | The CV writes the current title as "IT Manager / AI Engineering Lead"; the site writes "&" | The site's form | None |
| O13 | Should "Contact me" on Home open the hiring form? | The general form | None |
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
| 1. Résumé and facts | `../completed/phase-1_resume-facts_PLAN_10-11-26.md` | O2, O3, O5, O7 (all have defaults) | One set of career facts on every surface, and a two-page PDF that parses | COMPLETE (10-11-26): merged in pull request #109, live. Report: `../reports/phase-1_resume-facts_REPORT_10-11-26.md` |
| 2. Recruiter path | `../completed/phase-2_recruiter-path_PLAN_10-11-26.md` | Phase 1 (headline and résumé target); O6, O8, O9 | Role, availability and résumé are visible above the fold and reachable from every page | COMPLETE (10-11-26): merged in pull request #109, live site checked. Report: `../reports/phase-2_recruiter-path_REPORT_10-11-26.md` |
| 3. Case-study evidence | `phase-3_case-study-evidence_PLAN_10-11-26.md` | Phases 1 and 2; O1, O3, O4 (all answered) | Case studies and Proof state cleared outcomes and the owner's part | APPROVED FOR EXECUTION (11-11-26) |
| 4. The CV's framing | `phase-4_cv-framing_PLAN_11-11-26.md` | Phase 3 | GoGoCash and Manut AI are independent projects on every surface, as in the CV | PLANNED (decision 15); needs its own execution approval |

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
  FDE hub proof list, the text endpoints; `/resume` for the fallback and the
  restored skill.
- Phase 4: About, the venture pages, JSON-LD, the page meta, the About share
  image, `llms.txt`, `llms-full.txt` and `about.md`.

## Verification Evidence

Each phase writes `../reports/phase-N_{topic}_REPORT_{dd-mm-yy}.md` with its
commands, results, regression checks and deviations.

- Phase 1: `../reports/phase-1_resume-facts_REPORT_10-11-26.md`. All seven
  gates pass on the local production build.
- Phase 2: `../reports/phase-2_recruiter-path_REPORT_10-11-26.md`. All gates
  pass locally, in CI and on the Cloudflare preview; the live site was
  checked after the merge (the report's "Closed out" section).

## Resume and Execution Handoff

- **Current state:** Phases 1 and 2 are on `main` (`fdcb904`) and live.
  Phase 3 is approved for execution with O1 and O4 answered; O5 to O7 stay
  on their defaults.
- **Execute anchor:** `process/features/recruiter-fit/active/phase-3_case-study-evidence_PLAN_10-11-26.md`.
- **Before EXECUTE of Phase 3:** re-read that plan, the research file and the
  Phase 2 report, and check drift since `fdcb904`.
- **Regression checks to carry forward:** the PDF text-layer read-back,
  `lib/content/resumeFacts.test.ts`, `lib/content/availability.test.ts` and
  the "recruiter path" block of `tests/e2e/smoke.spec.ts`.
- **Merging deploys.** Cloudflare Workers Builds deploys `main` to
  production, and every pull request gets a preview URL in a bot comment.
- **The CV** is the owner's file "Kunanon Jarat CV.pdf" (2 pages, PDF created
  2026-10-07), supplied in the planning session. It is not in the repo. Ask
  the owner for it if it is not at hand.
- **Harness:** `.claude/agents/`, `.claude/skills/` and `process/context/`
  were missing when this plan was written. Follow the Harness-Absent Fallback
  in `process/development-protocols/orchestration.md`, or reinstall the
  harness and run `vc-generate-context` first.
