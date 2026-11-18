# Phase 4: Home journey and testimonial notebook

**Status:** CODE DONE (18-11-26). Parallel lane (branch
`feat/home-journey-testimonial-notebook`, from `5721eab`); Linux baselines
and the review wait for the orchestrator.
**Evidence:** `../reports/phase-4_home-journey-notes_REPORT_18-11-26.md`
**Created:** 18-11-26, at `563b2a3`.
**Umbrella:** `profile-site-redesign_UMBRELLA_PLAN_18-11-26.md`
**Spec:** `../references/design-spec_18-11-26.md` section 8 (journey stage,
orbit, story, records card, notebook), 10, 11, 12 and 15.
**Inventory:** sections 6.6 (no testimonials), 6.8 (timeline data), 6.9
(tools data), 7.3 (résumé entries), 8.2 (claim audits) and 9.3 (owner rules).
**Report target:** `../reports/phase-4_home-journey-notes_REPORT_{dd-mm-yy}.md`
**Owner inputs:** R9 (Journey and story copy), R11 (testimonials), R18 (tool
icons).

## Objective

Finish the new Home's body on `/preview`: the `#journey` stage with its
orbit of pixel tool icons, the `#story` block with the career records card,
and the testimonial notebook, built in full and kept off until 3 or more
owner-cleared quotes exist (owner decision 5).

## Work

| Step | Scope |
| --- | --- |
| 4a | **Journey stage** (`components/profile/home/Journey.tsx`), 800 px tall at desktop and 640 px on phones. The wash (tint-3 radial on the left, tint-coral on the right, masked at top and bottom); a centred block: mono eyebrow "Journey", the H2 (max 9ch, R9), a lead (R9) and a small ghost pill "Read the story" to `#story` |
| 4b | **Orbit.** Tools from `lib/content/stack.ts` (16 today) plus a few file chips of our own (TS, MD, JSON, CSV) placed on an ellipse with depth: far items smaller and blurred. Icons are our own pixel art (R18 default: a pixel badge per tool built from its existing mono badge, in a tool colour; the option is brand glyphs from the CC0 `simple-icons` data, rasterised to pixels, used only to name the tool). Each item shows its name (14 px, 500) and a mono kind label at 12 px (the reference uses 10 px). Drag rotates the orbit (pointer events, `touch-action: pan-y`, `cursor: grab`); keyboard users get "previous" and "next" buttons; the idle float stops within 5 s or has a pause button; items rise in on entering view (`file-in`); under reduced motion everything is still and placed |
| 4c | **Story** (`#story`, `components/profile/home/Story.tsx`). A 12-column grid: on the left (7 columns) two paragraphs with bold key phrases, an H3 "Roles I'm open to", a paragraph from `lib/content/availability.ts` (Forward Deployed Engineer and AI engineering roles, Bangkok or remote; no relocation, travel, notice period or work authorisation) and chips; on the right (4 columns from column 9) the records card: mono headings "Employment" and "Education" over ordered lists (organisation, mono period, title) from `lib/content/resumeTimeline.fallback.ts`, a "Full résumé" link, and a dither floor along its bottom edge. Periods display without em dashes (the data uses them as parsed separators; format them for display, for example "Sep 2025 to now") |
| 4d | **Testimonials data.** `lib/content/testimonials.ts`: `{ quote, name, role, organisation?, initials, source, clearedOn }` entries, empty today, and a `TESTIMONIALS_MIN = 3` rule: with fewer cleared entries the Home renders no section, no heading and no link to it. The claim audits learn the file: quotes may appear nowhere else |
| 4e | **Notebook** (`components/profile/home/Notebook.tsx`). From 810 px a two-page spread (1008 x 480): a left leaf (lavender cover, mono label, italic serif line, mono "N notes") and a right leaf of stacked pages, a spiral of 28 x 9 rings down the gutter. Under 810 px one page that bleeds to the left edge, rings at 30 px. Spanned across a hinge on a dual-screen device, the spread opens across both screens with the hinge as its spine (spec section 10.1). Pages: cream paper, ruled lines every 32 px, a coral margin at 38 px, the quote in Patrick Hand, an initials avatar, the name and role, a mono page number. Turning: `--turn` registered with `@property`, `rotateY` around the left edge over 1 s, a moving shadow and the `page-cast` sweep; non-current pages are `inert` and `aria-hidden`. Autoplay after `min(18000, max(7000, 2000 + 180 * words))` ms, paused while hovered or focused or by the pause button (`aria-pressed`, "Pause notes" and "Play notes") with its conic countdown ring; no autoplay under reduced motion. Prev and next buttons (48 px; beside the book from 1180 px, under it below). Drag or swipe turns a page past 25 % of the leaf or on a quick flick. `role="group"`, `aria-roledescription="carousel"`, a polite live region names the visible authors |
| 4f | **Notebook QA without real quotes.** `/preview/system` shows the notebook with fixture entries whose text says plainly that they are samples ("Sample note one", "Sample person"). Fixtures live in the test and preview code only, never in `lib/content/testimonials.ts` |
| 4g | **Tests and gates** (below) |

## Touchpoints

New `components/profile/home/{Journey,Orbit,PixelIcon,Story,RecordsCard,Notebook}.tsx`
and tests; new `lib/content/testimonials.ts` and test; `lib/content/home.ts`
(Journey copy, file chips); a period formatter for display (for example in
`lib/landing/`); the claim audit tests; `src/routes/preview/index.tsx` and
`system.tsx`; e2e and visual tests.

## Public Contracts

None on live pages. `lib/content/testimonials.ts` and its 3-quote rule
become the contract for showing the section.

## Blast Radius

`/preview` only. `resumeTimeline.fallback.ts` is read, not edited; its
em-dash separators and the tests that parse them stay.

## Validation gates

1. The CI gates as in Phase 0 gate 1.
2. Orbit: a pointer drag rotates it; the keyboard buttons move it; it is
   still under reduced motion; its idle motion stops or pauses.
3. Notebook (on `/preview/system` with fixtures): keyboard prev, next and
   pause; focus pauses autoplay; non-current pages are inert; autoplay timing
   with fake timers; no autoplay or page-turn animation under reduced motion.
4. With zero to two cleared quotes, `/preview` has no notebook section and no
   link to it (unit and e2e).
5. Claim audits: quotes only from `testimonials.ts` with a `clearedOn` date;
   no new figure in the story copy; records match the résumé data.
6. Tap areas at 320 and 390 px; axe in both themes.
7. Visual: new baselines for `#journey`, `#story` and the notebook on
   `/preview/system`, reviewed against the spec. Existing baselines and
   parity unchanged.

Device matrix (spec section 10.1): at 344, 390, 820, 882, 1180 and 1440 px
wide nothing overlaps and nothing scrolls sideways (the notebook's arrows
under the book below 1180), and the tap-area test passes at 344. On a
spanned dual-screen viewport the notebook opens across the hinge.

## Blockers that justify BLOCKED

- The owner wants quotes shown before 3 are cleared.
- Brand glyphs (R18 option) are chosen but a tool has no glyph with a clear
  licence. Then that tool keeps its pixel badge.

## Resume and Execution Handoff

- **Execute anchor:** this file. Phase 3 must be merged.
- **Before code:** take R9 and R18. Show the Journey headline, lead and story
  lines as they would ship.
- **Research first:** the CSS `@property` support for `--turn` in the test
  browsers (Chromium, WebKit, Firefox) and a fallback without it.
