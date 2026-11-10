# Phase 4: The CV's framing for the two projects

**Status:** PLANNED (11-11-26). The owner chose the direction; execution
needs its own "ENTER EXECUTE MODE".
**Created:** 11-11-26, at `fdcb904`
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

## Work

| Step | Scope |
| --- | --- |
| 4a | **Inventory.** Every "Founder", "founder", "founded" and its Thai equivalents in `lib`, `components`, `src` and the share-image code, with the proposed replacement beside each. The owner approves the list |
| 4b | **Content.** Apply the approved lines in the content modules, English and Thai |
| 4c | **Structured data and share images.** The Person and Organization JSON-LD, the page meta, the About share image |
| 4d | **Tests and references.** A fact test that no surface says "Founder" for the two projects; the parity re-crawl; the baselines for About, the venture pages and Home |

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

- **Execute anchor:** this file, after Phase 3 is merged.
- **Start with 4a** and take the owner's approval of the wording there.
