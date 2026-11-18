# Phase 7: Remaining pages

**Status:** PLANNED (18-11-26). Needs its own "ENTER EXECUTE MODE".
**Created:** 18-11-26, at `563b2a3`.
**Umbrella:** `profile-site-redesign_UMBRELLA_PLAN_18-11-26.md`
**Spec:** `../references/design-spec_18-11-26.md` sections 6, 9 (chapter,
fact strip, points, tiles), 10, 11, 12 and 13 (items 16, 18).
**Inventory:** sections 2.1 (routes), 6.11 (other page families), 7.5 to 7.8,
8.3 (filters, Thai hub checks), 9.4 (routes that must stay) and 10 (R6, R7,
R15).
**Report target:** `../reports/phase-7_remaining-pages_REPORT_{dd-mm-yy}.md`

## Objective

After the cutover, each remaining page family opts in to the new tokens
(`data-design="profile"`, spec section 2.13) as its layout is rebuilt from
the new primitives, so no page still looks like the bento canvas.
Thai pages get a typography pass. This can ship as several pull requests, one
per page family.

## Work

| Step | Pages | Scope |
| --- | --- | --- |
| 7a | `/topics/$slug` (4) and `/th/topics/$slug` (4) | A hub template from the case-study parts: hero (eyebrow, serif title, lead, the hiring buttons on the FDE hub, the language switch), chapters with kicker numbers for today's section cards (their big numbers become fact strips), the proof list, the FAQ as styled `details`, the explore links and the contact block. Article, FAQPage and BreadcrumbList JSON-LD and hreflang stay. The FDE hubs keep the availability pill and the hiring buttons |
| 7b | Thai typography | Instrument Serif and Onest have no Thai, so Thai text falls back to Noto Sans Thai. Evaluate Noto Serif Thai for Thai headings (weight, file size, the look beside the Latin serif) and show the owner both; default Noto Sans Thai. Line height for Thai body text at least 1.7; mono labels in Thai fall back to Noto Sans Thai; `lang="th"` on the page and `lang="en"` on English chrome labels (closes the backlog item about footer labels) |
| 7c | `/skills`, `/skills/$slug` (20) | A catalog of tiles and chips: the pipeline as case steps, install tabs and copy buttons as pills, credits in a fact strip. SoftwareSourceCode JSON-LD stays |
| 7d | `/learn`, `/examples`, `/stack`, `/proof`, `/build` | Reading layouts with the section header, tiles and chips. `/stack` reuses the pixel tool icons from Phase 4; `/proof` keeps "Delivery" before "Venture metrics" with dated tiles; `/build` turns its board columns into tiles. Every `?param=` filter keeps the prerendered default and applies after hydration |
| 7e | `/resume` | The screen layout in the records-card style with the Download PDF pill, Contact and Share. `ResumePrint` stays plain (no opacity, no letter-spacing, system font); `pnpm pdf` and the text read-back after the change |
| 7f | 404 and errors | `StatusPage` in the new style with a pixel illustration of our own; the 4 recovery links and the report email stay; no link to `/blog` or `/press` |
| 7g | `/design` | Replace the old design-system page with the new one (the content of `/preview/system`, which Phase 6 deleted). It stays noindex; fix its canonical (backlog P3). Lane D2 also turns back on the notebook's browser checks that Phase 6 parked in `tests/e2e/profile-journey.spec.ts` (each skipped with `NOTEBOOK_PAGE_GONE`), pointed at the samples on `/design`: the group "the notebook, with sample notes on /preview/system", the group "the notebook's layout (desktop Chromium)", and "the sample notebook matches its baseline at this width". Until then a tripwire in `lib/content/testimonials.test.ts` fails if three quotes are cleared |
| 7h | `/blog`, `/blog/$slug`, `/press` (hidden) | The hub and reading templates, lightly. They stay noindex and unlinked |
| 7i | Tests and gates | Below |

## Touchpoints

`components/landing/discovery/TopicHubPage.tsx` and parts,
`components/landing/skills/*`, `components/landing/library/*`,
`components/resume/ResumePage.tsx` and `ResumeCards.tsx` (screen only),
`components/landing/StatusPage.tsx`, `components/system/DesignSystemPage.tsx`,
`components/landing/blog/*`, `components/landing/PressPage.tsx`, their tests,
`src/styles/globals.css` (Thai rules), possibly `src/styles/fonts.css` (Noto
Serif Thai), baselines for every page touched.

## Public Contracts

Look only. URLs, titles, h1 text, JSON-LD, hreflang, filters and text
endpoints stay. If an h1 must change, the parity re-crawl records it as
intended and the owner approves it first.

## Blast Radius

Each family's pages and baselines. The shared primitives from Phase 0 are
not changed here; a needed change goes back through the spec and every page
that uses the primitive.

## Validation gates

1. The CI gates as in Phase 0 gate 1, plus smoke and axe on all routes in
   both themes.
2. Baselines regenerated for every page touched and reviewed against the
   spec; Thai hubs reviewed by the owner.
3. Parity re-crawled if any title, h1 or meta changed; otherwise unchanged.
4. Filters on `/skills`, `/stack`, `/build`, `/examples`, `/learn`,
   `/portfolio` and `/resume` work after hydration without mismatch warnings.
5. Tap areas at 320 and 390 px on the pages in the tap-area list.
6. `pnpm pdf` passes and reads back after 7e.
7. Axe with `wcag22aa` on each family as it moves, so every route carries the
   tag by the end of the phase; forced colors, text spacing and 200% zoom on
   one page per family (both Thai hubs among them); the WebKit phone project
   on each family; keyboard and screen reader passes on a topic hub and
   `/resume`.

Device matrix (spec section 10.1): every page family holds at 344, 390, 820,
882, 1180 and 1440 px wide, and the tap-area test passes at 344. This phase
also decides the folded-flat posture (`vertical-viewport-segments: 2`), which
spec section 10.1 leaves open.

## Blockers that justify BLOCKED

- The owner prefers a Thai serif that adds more than about 100 KB per page
  without a subset.
- A hub section has no equivalent in the template and would be dropped.

## Resume and Execution Handoff

- **Execute anchor:** this file. Phase 6 must be merged and checked live.
- **Order:** 7a and 7b first (indexed, highest priority in the sitemap), then
  7c, 7d, 7e, 7f, 7g, 7h. One pull request per step is fine.
