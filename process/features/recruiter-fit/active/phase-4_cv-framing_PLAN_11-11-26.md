# Phase 4: The CV's framing for the two projects

**Status:** PLANNED (11-11-26). The owner chose the direction; execution
needs its own "ENTER EXECUTE MODE".
**Created:** 11-11-26, at `fdcb904`. Updated 11-11-26, at `28f0d06`, with
decision 26 (step 4e) and the lessons of Phase 3.
**Umbrella:** `recruiter-fit_UMBRELLA_PLAN_10-11-26.md`
**Research:** the Phase 2 report, "Open, for the owner", and the pre-merge
review of pull request #109.
**Report target:** `../reports/phase-4_cv-framing_REPORT_{dd-mm-yy}.md`

## Objective

GoGoCash and Manut AI are described the way the CV describes them, as
independent projects, on every surface. Today the résumé and Home do; About,
the venture pages, the structured data and the text files say "Founder".

## Owner decision (11-11-26)

"CV framing everywhere." Asked: "Your CV calls GoGoCash and Manut AI
'Independent projects', and the résumé now does too. About, the two venture
pages, the structured data and two text files still call you their 'Founder'.
Which framing should the rest of the site use?"

## What is not decided yet

The exact words. The CV's are "Independent project" with "Live platform" or
"In development". The plan step below proposes each replacement line; the
owner approves the wording before execution.

| Where "Founder" stands today | Open question |
| --- | --- |
| About hero: "Founder of GoGoCash and Manut AI. ..." | Which sentence replaces it |
| About heading: "AI engineering lead and founder, Bangkok." | Drop "and founder", or another second noun |
| About arc chips: GoGoCash "Founder" | The chip's detail |
| Venture pages: `role: "Founder"`, and "My role" bodies that open "Founder." | The role label |
| FAQ: "a ... cashback platform Fronk founded in 2023" | Whether "founded" is the same claim |
| Person JSON-LD `jobTitle`, the founder Organization nodes | Which schema.org relation fits an independent project |
| Page meta and the About share image | The description line |
| `llms.txt`, `llms-full.txt`, `about.md` | Follow the content modules |
| GoGoCash page, older copy that is not in the CV (O15): "220+ merchants", "up to 30% back", the merchant names, "in production and growing", "funded by affiliate commissions", and the "My role" sentence | Keep each, or the wording to use |

## Lessons from Phase 3 that change this phase

- **Check a claim against the running system, not the code.** Phase 3 came
  close to publishing "purged every hour" because the code asks for it; the
  live cache was 17 hours old. A sentence about caching, deploys or what a
  page does needs an observation behind it.
- **A fix needs its own review.** Each of three review rounds found a flaw
  in the round before's fix. Review the fix commits, and aim the mutation
  checks at them too.
- **A wording check has two directions.** An audit that only hunts the
  wrong fact also fails on harmless edits. For each new pattern, write one
  edit it must catch and one it must let pass.
- **The audits read every source file.** The fact test of 4d should scan
  with `tests/siteSources.ts`, in both languages: the Thai user count
  needed a pattern of its own.
- **Fill the report from the final tree.** Run the gates on both Node
  versions after the last fix, print the tree's hash with each run, and
  write the numbers only then.
- **Show the owner the line, not a summary of it.** The merge questions
  quoted every line that would ship, and all eight came back approved.

## Work

| Step | Scope |
| --- | --- |
| 4a | **Inventory.** Every "Founder", "founder", "founded" and its Thai equivalents in `lib`, `components`, `src` and the share-image code, with the proposed replacement beside each. The owner approves the list |
| 4b | **Content.** Apply the approved lines in the content modules, English and Thai |
| 4c | **Structured data and share images.** The Person and Organization JSON-LD, the page meta, the About share image |
| 4d | **Tests and references.** A fact test that no surface says "Founder" for the two projects; the parity re-crawl; the baselines for About, the venture pages and Home |
| 4e | **ARIA's stack, in one sentence (decision 26, 11-11-26).** "Both are true": ARIA uses Google ADK and Gemini with RAG, as the résumé says, and Claude as well, as the site says. Today the FDE hub, the FAQ and the intranet case study say "Gemini and Claude models with embedding search". The owner approves the sentence in 4a. The wording test in `lib/content/resumeFacts.test.ts` lets "RAG" stand in the résumé data only, so it gains the places this sentence goes |

## Touchpoints

`lib/content/aboutPage.ts`, `lib/content/ventures.ts`, `lib/content/faq.ts`,
`lib/content/identity.ts`, `lib/content/identityMeta.ts`,
`lib/content/pageMeta.ts`, `lib/content/topics/pillars.ts`,
`lib/seo/jsonLd.ts`, the About share image, `src/server/text/` (through the
content modules), and their tests.

## Blast Radius

About, both venture pages, Home's Ventures card if its labels change, the
text endpoints and the JSON-LD of every page that carries the Person node
(the parity reference changes on most URLs, as in Phase 1).

## Validation gates

The gates of Phase 3, items 1 to 5 and 7 to 9, plus the fact test of 4d.

## Blockers that justify BLOCKED

- The owner does not approve a replacement for a line.
- A structured-data change would drop the link between the person and the
  two products with nothing to replace it.

## Resume and Execution Handoff

- **Execute anchor:** this file. Phase 3 is merged (`28f0d06`).
- **Start with 4a** and take the owner's approval of the wording there.
