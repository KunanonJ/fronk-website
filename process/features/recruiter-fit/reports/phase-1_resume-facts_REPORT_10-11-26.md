# Phase 1 report: Résumé and facts

**Plan:** `../completed/phase-1_resume-facts_PLAN_10-11-26.md`
**Status:** VERIFIED on the local production build (10-11-26). Committed on
the branch as `29c835e`. It reaches `main` through pull request #109, a
squash merge, so that hash is not on `main`. Not deployed. The live site is
checked after the owner deploys. Phase 2 regenerated the PDF once: one word
left its skills line (see the Phase 2 report), so the word counts below
describe the file as Phase 1 left it.
**Base:** `6d31e16`

## Owner answers used (10-11-26)

- **Execution:** "ENTER EXECUTE MODE" for Phase 1.
- **O3, figures and partner names:** "All of them". Every figure and partner
  name in the CV may be public.
- **O2, projects on the résumé:** "All three": GoGoCash, Manut AI, GoSpark.
- **Defaults taken, not yet answered:** O5 (the CV's employer names, with
  initials tiles) and O7 (no phone number in the public PDF).

## What changed

**1a. Facts sync**

- `lib/content/currentRole.ts` holds the current role once: title,
  organisation and start month. The identity summary, the FDE hub proof line
  and the first résumé row read it. The start month is now September 2025.
- `lib/content/resumeTimeline.fallback.ts` follows the CV: one current role,
  nine past roles, three independent projects, training in two lines, and
  skills in four labelled groups with AI first.
- VaporFund is a launch inside the Playbux role, no longer an employer.
  KK Venture Global replaces FICO Corporation Thailand in the résumé, the
  About story, the About arc and the FAQ.
- The résumé headline and meta description lead with the AI role.
- `lib/content/resumeFacts.test.ts` keeps the résumé, the summary, the FDE
  hub, About and the FAQ on one set of facts, and requires a note on any role
  that overlaps the one above it.

**1b. Print résumé and PDF**

- `components/resume/ResumePrint.tsx` is rebuilt on the CV's structure: a
  header with contact links and the availability line, then Summary,
  Experience, Independent projects, Core skills, Education and training.
- `scripts/generate-resume-pdf.mjs` refuses to write a PDF that is longer
  than two pages, has no email link, or links to the placeholder host.
- `public/resume.pdf` is regenerated: 2 pages (was 6), 106 KB (was 256 KB).

**1c. Screen résumé**

- The summary and the availability line sit under the h1. Actions are
  Download PDF, Contact and Share. Downloads save as
  `Kunanon-Jarat-Resume.pdf`.
- New Independent projects card, grouped Skills card, the overlap note under
  a role, and a "Case studies" link from the current role to `/portfolio`.
- The two Experience columns split where their heights are closest.

## Root cause of the broken PDF text layer: two causes, both confirmed

1. **Opacity.** Every entry after the first in a section was faded with an
   inline `opacity`. Chromium draws such an element as a transparency group,
   and its text left the PDF in fragments and out of order. Removing the fade
   restored reading order for every entry.
2. **The variable site font.** With the fade gone, medium and semibold text
   still split after an "m" ("Sum m ary", "rem ote"). Printing the real page
   under eight CSS overrides showed that kerning, ligature, spacing and
   text-rendering settings change nothing; only a static system font removes
   it. The printed résumé now uses Arial, Helvetica, sans-serif. The same
   strings printed from a minimal page with Geist did not split, so the
   trigger is specific to the full page and is not fully explained.

## Gates

Local run on Node v26.12.0 (CI pins 22.23.4), with the environment values CI
uses.

| Gate | Command or check | Result |
| --- | --- | --- |
| Baseline | `pnpm typecheck`, `pnpm test` before any change | Pass: 98 files, 763 tests |
| 1 | `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm knip`, `pnpm test` | Pass: 0 lint issues, 100 files, 797 tests |
| 2 | `pnpm build`, `pnpm perf:budget` | Pass: worst route 185.9 KB of 200 KB, entry chunk 107.5 KB of 120 KB |
| 3 | `smoke.spec.ts` and `a11y.spec.ts`, desktop, both themes, full run | Pass: 90 tests |
| 4 | Linux baselines in `mcr.microsoft.com/playwright:v1.64.1-noble` | Pass: 88 tests against the committed baselines, 8 skipped (CMS-driven). 12 baselines refreshed and reviewed: home, about and topic-hub-fde, both themes, both viewports |
| 5 | Parity re-crawl, then `node scripts/start-gates.mjs --parity-only` | Pass: 132 URLs, 0 differences. The reference changed on 70 lines, all intended |
| 6 | PDF text layer read back with pypdf, word by word against the printed page | Pass: 2 pages, A4; 844 of 844 words whole and in order; 6 link annotations (email, site, LinkedIn, GitHub, two project sites); availability line present; no phone number, no initials, no index numbers. A second extractor agrees on the order |
| 6 | Generator guard, `MAX_PAGES=1` | Pass: the script fails and writes no file |
| 7 | Search of `components`, `lib` and `src` for stale facts | Pass after the review fix below: no "November 2025" in English or Thai, no "FICO", no "Strategic Advisor"; "VaporFund" only in the Playbux bullet |

Regression checkpoint: none. This is the first phase of the program.

### What the parity diff showed before the reference was refreshed

67 of 132 URLs differed, in four fields only: `jsonLd` (65 URLs, the Person
description), `body` (2 text endpoints), `h1` and `tags` (both `/resume`).
Sixteen distinct replacements, each one a fact this phase changed.

## Deviations from the plan

- **`CURRENT_ROLE` has its own module** and `identity.ts` re-exports it. Home
  imports the résumé data, and the identity module is kept out of that chunk.
- **No `status` field.** "In development" sits in the period column, so the
  text endpoints print it without a special case.
- **Availability is a marked sentence, not a chip.** The line is too long for
  a pill at 375 px. Phase 2 introduces the pill on Home and can reuse it here.
- **A static print font**, for the second root cause above.
- **Print details:** periods use a plain hyphen, as the CV does; a "Live at"
  bullet is dropped where the entry already prints its site link; margins are
  12 mm top and bottom, 14 mm at the sides.
- **`components/ui/Container.tsx` is deleted.** Only the old print layout used
  it, and knip fails on unused files. `lib/design/rawHex.test.ts` no longer
  lists it.
- **`splitColumns` takes a weight.** The CV's longer bullets left the second
  Experience column half empty, so the split now follows height.
- **Six logo files are removed:** FICO and VaporFund, and four that no row
  uses any more (Moralis, Buffalo, Udemy, The Monk Studios). If O5 confirms
  that The Monk Games is the same company, its logo can come back from git
  history.
- **`tests/e2e/smoke.spec.ts`:** the "Live at" bullets it checks moved from
  Currently to Independent projects.

## Independent review before the commit

One reviewer read the diff against the plan, using the method in
`.codex/agents/vc-code-reviewer.toml`. No critical finding. Seven findings,
all fixed or recorded:

| Severity | Finding | Outcome |
| --- | --- | --- |
| High | The Thai FDE hub still said November 2025. The fact-consistency search and the test covered English only | Fixed. `CURRENT_ROLE` has a Thai form, the Thai hub reads it, and the test checks both languages and that no hub types another date by hand |
| Medium | The overlap test skipped silently when a period did not parse | Fixed. A test now requires every role's period to be "Mon YYYY" to "Mon YYYY" or "Present", and the overlap test must find exactly the CV's two overlapping pairs |
| Low | Four logo mappings and files that no row uses were left behind | Fixed. Removed, as the plan says |
| Low | A print test named periods but did not assert them | Fixed. It now checks each entry's title, period, organisation, note and bullets |
| Low | `MAX_PAGES=abc` disabled the page limit | Fixed. The generator rejects it |
| Low | A CMS section titled "Constructor" would hit `Object.prototype` and crash the page | Fixed. The lookups are Maps |
| Low | Plan drift and a stale comment | Recorded under Deviations; comment fixed |

The fixes were checked by breaking four facts one at a time (the Thai month,
an overlap note, a period's format, VaporFund as an employer). Each made the
fact tests fail; the files were restored byte for byte. Gates 1, 2, 3, 5 and
6 were then run again and pass.

The reviewer could not check the CV itself, which is not in the repo.

## Findings outside this phase

- **Baselines drift under the tolerance.** The visual suite allows 1% of
  pixels to differ, so this phase's text changes passed against the old
  baselines without refreshing them. A full re-render in the container showed
  38 baselines whose bytes differ from the committed files: the 12 this phase
  refreshed, and 26 on pages it does not touch. The same re-render of the
  untouched commit (`git archive` of `6d31e16`) gave 28 differing baselines,
  so that drift predates this phase. The only files that differ with this
  change and not without it are the About, Home and FDE hub baselines, plus
  one Press file; a different Press file differs only without it, so Press
  varies from run to run. One cause of the older drift is visible: the
  committed Home desktop baseline still drew the "How I work" steps as
  "Step 01" in two rows, where the code renders "01" to "04" in one.
- **The documented baseline command does not work from a Mac.** The
  `docker run` in `tests/e2e/visual.spec.ts` mounts the host's `node_modules`,
  which are macOS builds. This phase copied the repo into the container,
  installed and built there, and copied the changed PNGs back.
- **`components/ui/Button.tsx` is now used only by its tests.**

## Open, for the owner

- **O5:** is KK Venture Global the company the site called FICO Corporation
  Thailand, and The Monk Games - Bitkub Metaverse the one it called The Monk
  Studios? If so, say whether their old logos may return.
- **O7:** the public PDF has no phone number. Say if it should.
- **The summary's first sentence** is the approved identity headline. It is
  yours to rewrite: `RESUME_SUMMARY_FALLBACK` in
  `lib/content/resumeTimeline.fallback.ts`.
- **LinkedIn:** align its dates, employer names and headline with the CV.
- **After deploy:** download the PDF from the live site and confirm it is
  the two-page file.

## What green proves, and what it does not

- **Proves:** on the local production build, one set of career facts reaches
  the résumé, Home, About, the FAQ, the FDE hub, the text endpoints and
  JSON-LD; the PDF is two pages with contact links and a text layer that two
  extractors read whole and in order.
- **Does not prove:** how a specific applicant-tracking system parses the
  file; the same gates on CI's Node 22; the live site.

## How to read the PDF back

Any PDF text extractor works. With Python and `pypdf`:

```python
from pypdf import PdfReader
reader = PdfReader("public/resume.pdf")
print(len(reader.pages))                     # 2
print(reader.pages[0].extract_text())        # whole words, reading order
```

Compare the words, in order, with the printed page's own text: load
`/resume` in Chromium with print media emulated and read `innerText` of
`[data-resume-print]`. This phase found 844 words in both. Check the link
annotations too: one `mailto:` and the site, LinkedIn and GitHub.

## Closed out (10-11-26)

- **Commit:** `29c835e` holds the execution changes (code, tests, the PDF,
  the parity reference and 12 baselines).
- **UPDATE PROCESS**, approved by the owner: the plan is archived to
  `../completed/`, the lessons are in the Phase 2 and 3 plans, two entries are
  in `process/general-plans/backlog/backlog.md`, item 1 of
  `process/features/visual-redesign/backlog/open-items_09-11-26.md` is marked
  resolved, and four workspace facts are in `AGENTS.md`.
- **Next phase:** `../completed/phase-2_recruiter-path_PLAN_10-11-26.md`
  (complete).
