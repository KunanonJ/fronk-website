# Phase 5: Case-study template

**Status:** CODE DONE (18-11-26)
**Evidence:** `../reports/phase-5_case-study_REPORT_18-11-26.md` (gates,
deviations, draft copy and open items; Linux baselines pending, rendered by
the orchestrator).
**Created:** 18-11-26, at `563b2a3`.
**Umbrella:** `profile-site-redesign_UMBRELLA_PLAN_18-11-26.md`
**Spec:** `../references/design-spec_18-11-26.md` section 9 (case-study
template), 10, 11, 12 and 13 (items 14, 15, 19).
**Inventory:** sections 6.2 (project page today), 6.3 (venture hubs), 7.1 and
7.2 (content), 8.3 (case-study evidence and Hiring tests), 9.1 (recruiter-fit
Phase 4) and 10 (R1, R3, R14).
**Report target:** `../reports/phase-5_case-study_REPORT_{dd-mm-yy}.md`
**Owner inputs:** R10 (screenshots), R12 (h1), R13 (recruiter-fit Phase 4
first).

## Objective

Build the reference's case-study template and render every project and
venture in it on `/preview/portfolio/<slug>` and `/preview/ventures/<slug>`,
from today's content, with nothing dropped and the recruiter evidence still
early on the page.

## Work

| Step | Scope |
| --- | --- |
| 5a | **View model** (`lib/content/caseStudy.ts`, working name). Pure mappers from `PortfolioProject` and `Venture` to one `CaseStudy` shape: slug, kind, h1 (today's text, "{name}. {tagline}", R12), lead (the summary), eyebrow (category and discipline), optional external link (the public URL or the venture site), cover (`screenshot` or `illustration`), meta items (Role, Organisation, Period, Access or status, Read time), the first cleared outcome, and chapters. Projects: the summary is the lead and the outcomes and "My part" are the evidence rows (5c); chapters cover the problem with its before and after, what it does (highlights as pixel-bullet points, showcase tiles), the workflow as steps, the architecture layers, the remaining sections, and the tech stack as chips. Ventures: what it is, where it stands (metric tiles dated "As of October 2026" where set), the loop (GoGoCash's four stages), the role, related topics, also building. A unit test proves every content field reaches the page |
| 5b | **Hero and cover** (`components/profile/case/CaseHero.tsx`, `CaseCover.tsx`). The pixel sky (`height: min(72vh, 620px)`, masked downward); a back link "All work" to `/portfolio` (40 px hit area, arrow nudges on hover); the eyebrow with a pinging status dot; the serif h1, the name as its display line and the tagline as a smaller line inside it (max 14ch); the lead, which is the summary (max 640 px); an optional ghost pill to the public site; the existing `SharePill`. The cover: radius 28 (14 under 720 px, bleeding to 12 px from the screen edges), paper-2 behind, the real image or the project's code-drawn illustration with a visible "Illustration" caption. Real images (R10) ship as AVIF or WebP at two or three widths with `srcset`, `sizes`, `width` and `height`, loaded eagerly; `fetchpriority="high"` only if `pnpm probe` measures the cover as the LCP element, because the evidence rows put it near the fold and the h1 is the likely LCP element |
| 5c | **Evidence rows, then meta** (`CaseEvidence.tsx`, `CaseMeta.tsx`). Directly under the hero and above the cover: `article` "Outcome" (the cleared outcomes) and `article` "My part", as full-width rows under 260 px each, so the outcome ends within 1.5 screens at 1440 x 900 and the cover keeps its name, `article` "Interface" (spec section 9.1). After the cover, the meta `dl` (Role, Organisation, Period, Access) in 4 columns from 1024 px and 2 below, hairline above |
| 5d | **Body and rail** (`CaseBody.tsx`, `CaseRail.tsx`). From 1100 px a grid of `minmax(0, 1080px) 188px` with the rail sticky at `var(--nav-h) + 28px`; below 1100 px no rail. The rail: mono "On this page", numbered links (12 px numbers; the reference uses 11 px), the active one in ink with an accent number and a pixel marker, `aria-current="location"`; scrollspy with `rootMargin: -20% 0px -60% 0px`; a click scrolls with a 112 px offset (a jump under reduced motion) and replaces the hash |
| 5e | **Chapters** (`CaseChapter.tsx`, `FactStrip.tsx`, `PointList.tsx`, `CaseSteps.tsx`): the kicker (pixel mark, number, slash, title in mono), an H2 in `t-h3` (max 26ch), prose at 17 px / 1.7 (max 64ch), chapter spacing `clamp(80px, 9vw, 128px)` with a hairline and 36 px above each new chapter |
| 5f | **Showcase** (`ShowcaseGrid.tsx`, `ShowcaseTile.tsx`, `CaseLightbox.tsx`). Full and half tiles (`--ratio`, tones default, deep, brand, paper; radius 24, 12 on phones); media is a real screenshot or a code-drawn illustration (static, or animated with a pause button); captions with a title; an "Illustration" label on code-drawn media. "View large" from 810 px opens a native `<dialog>`: a blurred veil, the tile grown from its place with a FLIP animation (560 ms open, 420 ms close; a fade under reduced motion), the caption below, close and pause buttons; Escape, the close button or a click on the empty stage closes it; scrolling is locked while open; focus moves in and returns to the tile |
| 5g | **End of page.** The `article` "Hiring" block (kept from today's pages and the smoke test: "Want work like this on your team?", the availability sentence, Résumé and Contact for hiring), then "More projects": the first two other cases in list order as lift cards (16:10 media, mono meta, 22 px title, summary, a small "Read the case study" pill; the media scales 1.03 on hover, the card .985 on press) and an "All work" link. Then the footer from Phase 1 |
| 5h | **SEO on the preview.** The preview pages render the same JSON-LD components as the live ones (CreativeWork or SoftwareApplication, BreadcrumbList) so Phase 6 can compare them, but stay noindex. Live pages, their Markdown twins and share images are untouched |
| 5i | **Tests and gates** (below) |

## Touchpoints

New `lib/content/caseStudy.ts` and test; new `components/profile/case/*` and
tests; new `src/routes/preview/portfolio/$slug.tsx` and
`src/routes/preview/ventures/$slug.tsx`; `PortfolioMockup.tsx` and the
venture card parts as media sources (read, possibly a size prop);
`components/bento/SharePill.tsx` (reused); e2e, a11y and visual tests.

## Public Contracts

None on live pages. The `CaseStudy` view model and the h1 rule (R12) become
Phase 6 contracts.

## Blast Radius

The preview case routes only.

## Validation gates

1. The CI gates as in Phase 0 gate 1.
2. All 7 preview case pages render without errors; the completeness test
   passes for each.
3. At 1440 x 900 the first outcome and "My part" are visible within 1.5
   screens on every project that has them (the evidence rule).
4. Rail: scrolling to a chapter marks it; clicking an item lands the chapter
   below the nav and updates the hash.
5. Viewer: opens from "View large" by keyboard, Escape closes it, focus
   returns, the page does not scroll while it is open, a fade under reduced
   motion.
6. Tap areas at 320 and 390 px; axe in both themes; no horizontal scroll at
   375 and 320 px with long figures.
7. Visual: new baselines for `tbh-intranet`, `ai-automation`, `kunanonj-com`
   and `gogocash` (light and dark, mobile and desktop), reviewed against the
   spec. Existing baselines and parity unchanged.

Device matrix (spec section 10.1): at 344, 390, 820, 882, 1180 and 1440 px
wide nothing overlaps and nothing scrolls sideways (meta and steps in two
columns from 600 to 1023, the rail from 1100), and the tap-area test passes
at 344.

## Blockers that justify BLOCKED

- The evidence rows cannot stay under 260 px for a project with long
  outcome lines. Then show the owner the lines and the options before any
  test changes.
- Recruiter-fit Phase 4 is mid-flight on the same content (R13).

## Resume and Execution Handoff

- **Execute anchor:** this file. Phase 1 must be merged; Phases 2 to 4 are not
  required.
- **Before code:** confirm R13 (recruiter-fit Phase 4 merged or deferred) and
  R12. Re-read `components/landing/portfolio/PortfolioProjectPage.tsx`,
  `ProjectCards.tsx`, `VentureHubPage.tsx` and `VentureCards.tsx` so no field
  is lost.
