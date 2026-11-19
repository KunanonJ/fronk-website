# Phase 4 report: Home journey and testimonial notebook

**Plan:** `../completed/phase-4_home-journey-notes_PLAN_18-11-26.md`
**Date:** 18-11-26. A parallel lane beside Phase 5, in the worktree
`t3-7173b6a5-2e448b31155db157` on the local branch
`feat/home-journey-testimonial-notebook`, from `5721eab` (Phases 0 to 3
merged, Phase 1 verified). One local commit; nothing pushed, merged or
deployed.
**Lane settings:** `PORT=3104`, `GATES_PORT=4304`, Playwright `--workers=2`.
**Tree:** sha256 of the `git ls-files -s` entries of the 27 changed code
paths: `203fd81239d3dcab` (this report and the plan status are not in it).
**Harness:** `.claude/agents/` and `process/context/` are missing; the phase
ran from the shared brief (`fronk-redesign-lane`) under the Harness-Absent
Fallback, with the gates of `fronk-gates`.
**Status:** CODE DONE (18-11-26). Linux visual baselines are not rendered
here (the orchestrator batches them; open item 1).

## 1. Research answers (the plan's "Research first")

- **`@property` for `--turn`.** `--turn`, `--cast` and `--count` are
  registered in `globals.css` (Phase 0); this phase registers two angles of
  its own, `--orbit-offset` and `--orbit-spin`, at the top of its partial.
  Registered properties are Baseline 2024 (Chromium 85, Safari 16.4,
  Firefox 128; newly available, Phase 0's table). Checked here in Chromium
  and WebKit: a turning page reads a `--turn` between 0 and 1 300 ms in and 1
  after the turn, and the orbit's spin animates `--orbit-spin`, in both
  engines (`profile-journey.spec.ts`). Firefox is not installed. **Fallback
  without it:** an unregistered `--turn` changes discretely, so a page flips
  at once, as under reduced motion; `rotateY(calc(var(--turn) * -180deg))`
  still places it and the mid-turn shadow stays at 0. The orbit's angles
  read `var(--orbit-offset, 0deg)` and `var(--orbit-spin, 0deg)`, so the ring
  stays placed; a discrete 0 to 360 degree spin lands where it started, so
  the ring simply holds still; the buttons and the drag still turn it.
- **CSS trigonometry for the orbit.** `cos()`, `sin()` and `round()` inside
  `calc()` drive `translate`, `scale`, `filter`, `opacity` and `z-index`
  (Baseline 2023, widely available since late 2025). Probed in both engines:
  same computed translations, integer z-indices (`calc(round(sin(a) * 10) +
  11)`), and an animated registered angle. So the server HTML is already a
  placed, complete ring; script only adds the spin, the drag and the buttons.
- **Hit testing over the ring (WebKit):** with the stage scrolled into view,
  `elementFromPoint` on the heading returns the `h2`, so the copy (z 30)
  sits above the tiles (z 1 to 21) in WebKit as in Chromium.
- **Found while testing, outside this phase:** (1) WebKit restores the scroll
  position once more as the page hydrates, so a scroll made just after load
  snaps back to the top within 100 ms; the spec's scroll helper now checks
  that its position holds (Phase 3's open item 5 may share this cause).
  (2) Under reduced motion the global rule leaves `transition: all 0.00001s`,
  which WebKit ends on a later frame rather than at once, so a test reads a
  page's new `--turn`, or the ring's new angle, a frame or more late (more on
  a busy machine). The checks poll briefly or read the value the script
  set. Neither is a user-facing problem.

## 2. What was built (by plan step)

| Step | Files | What |
| --- | --- | --- |
| 4a Stage | `components/profile/home/Journey.tsx`, `Orbit.tsx` | `section#journey` named by its h2. The stage is `min-height: var(--screen)` from 810 px and 640 px on phones, under the section's 112 px top padding there. Washes: tint-3 radial on the left, tint-coral on the right, a paper to tint-1 fade, masked at top and bottom. The centred copy is Phase 3's `SectionHeader` (centred, no hairline, h2 at 9ch, lead in `t-lead`) and a ghost `sm` pill "Read the story" to `#story`, on a soft paper halo above the ring |
| 4b Orbit | `Orbit.tsx`, `PixelIcon.tsx`, `lib/landing/journey.ts` (`orbitRing`), `lib/content/homeJourney.ts` | The 16 tools of `stack.ts` and four file tiles (`.ts`, `.md`, `.json`, `.csv`) on an ellipse (42 by 35 % of the stage; 44 by 36 % on phones), placed by CSS from each slot's angle plus `--orbit-offset` and `--orbit-spin`. Depth: tiles scale from 0.62 to 1.1, blur up to 2.8 px at the back, and stack by depth. Names and kinds (the /stack group, 12 px mono) show on the near arc only: about seven from 1180 px, one at a time at the front below it; under 810 px the kinds are visually hidden and kept for screen readers. The tools are a real `ul` named "Tools I use", in /stack's order; file tiles are `aria-hidden`. **R18:** our own pixel badges, the /stack two-letter badge drawn in our own 5 x 7 letters on a rounded pixel tile, in four palette tones (violet, ink, coral, tint) so no two neighbours match; server-rendered SVG, decorative. Drag on the ring (pointer events, 8 px to start, `touch-action: pan-y`, `cursor: grab`); the copy and the controls above the ring keep their clicks and text selection. "Turn the tools left" and "Turn the tools right" buttons (44 px) move one slot (0.7 s, `--ease-expo`); a 60 s turn once hydrated with motion allowed, held on hover (fine pointers), with focus inside, while dragged, while off screen, and by its pause button ("Pause the orbit" / "Play the orbit"); tiles still below the fold rise in with Phase 2's `kj-file-in` (1.4 s, 40 ms stagger). Reduced motion: still and placed; the buttons and the drag still turn it. The controls render after hydration |
| 4c Story | `Story.tsx`, `RecordsCard.tsx`, `lib/landing/journey.ts` (`careerRecords`, `displayPeriod`) | `#story`: 12 columns from 1024 px (text on 1 to 7, the card on 9 to 12), one column below, gap 56. Two paragraphs with bold key phrases (drafted from the résumé, section 7), an h3 "Roles I’m open to", the cleared `OPEN_TO_ROLES.sentence` and its three chips. Records card (`aside` "Career records", radius 16, paper 2): h3 "Employment" with the four newest roles of the résumé's Currently and Experience, h3 "Education" with Kasetsart University; each row the organisation (15 px 500), the period in 12 px mono without an em dash ("Sep 2025 to now", "Jan to Oct 2025"), the title (14 px ink 60); "Full résumé" to `/resume`; a dither floor. Employment and Education sit side by side from 600 to 1023 px. `resumeTimeline.fallback.ts` is read only |
| 4d Data | `lib/content/testimonials.ts` and test | `Testimonial` (`quote`, `name`, `role`, `organisation?`, `initials`, `source`, `clearedOn` as dd-mm-yy), `TESTIMONIALS` (empty), `TESTIMONIALS_MIN = 3`, `notebookEntries()` (every cleared entry from three, otherwise none), the notebook's draft copy. The claim audit: a clearance date on every quote, and every quote in this file and no other source file (with a fixture the check must fail) |
| 4e Notebook | `Notebook.tsx`, `notebookRules.ts`, `Notes.tsx` | From 810 px a spread (max 1008 wide, at least 480 tall): the lavender cover (mono label, italic serif line, "3 notes") and a pile of lined pages (leaf paper, rules every 32 px, a coral margin at 38 px, Patrick Hand quote, initials avatar, name, role, mono page number) bound by 12 rings; pages pile in one grid cell, so the book grows to its longest note and nothing clips. Under 810 px one 340 px page bleeds to the left edge with a 36 px cover strip and the rings at x 30. Spanned across a hinge, the spread opens across both screens with the hinge as its spine (spiral hidden). A page turns over its left edge (`--turn`, 1 s `--ease-cubic`) with a moving shadow; a forward one-step turn runs `kj-page-cast` on the page it uncovers. Only the open page is not `inert` (`aria-hidden` on the rest). Autoplay after `min(18000, max(7000, 2000 + 180 * words))` ms, held on hover, focus inside, off screen, a hidden tab and by the pause button, whose ring counts down (`kj-book-count`); none under reduced motion, where pages change at once. Previous, pause and next are 48 px round ghost pills with `--elev-float`: beside the book at its middle from 1180 px (pause under it), all three under it below 1180, 88 px apart. Drag or swipe: 8 px picks a direction, a turn past 25 % of the leaf or a flick over 0.5 px/ms, else it springs back. A polite live region names the page after a reader's turn, never during autoplay. A breakpoint change reopens page one. Without JavaScript every note shows in a sideways-scrolling row. `Notes` renders nothing below three cleared quotes, and loads the notebook's code on demand (spec 13, item 34) |
| 4f Samples | `components/profile/preview/sampleNotes.ts`, `SystemPreview.tsx` | `/preview/system` gains "Notebook, with sample notes": three notes that say they are samples ("Sample note one…", "Sample person"), with no clearance date, so the 3-quote rule would drop them anywhere else. Never in `lib/content` |
| 4g Tests | section 3 | Unit tests for the content, the helpers and every component; browser checks in `tests/e2e/profile-journey.spec.ts` |
| Shared files | `components/profile/preview/PreviewHome.tsx`, `components/profile/home/SectionHeader.tsx` and test, `tests/e2e/profile-shell.spec.ts` | PreviewHome: the Phase 4 block (`<Journey />`, `<Notes />`) and its imports, the old placeholder's `EyebrowRow` import removed. SectionHeader: two options, `rule` (default true; false sets the eyebrow as a plain mono label) and `leadSize` (`"body"` default, or `"lead"`); a test pins that the default output is unchanged. Phase 1's shell spec: one locator (deviation 22). `tests/e2e/routes.ts` needed no change: both previews are already listed |
| Stylesheet | `src/styles/profile/home-journey.css` | Everything in `@layer components`; `@property --orbit-offset` and `--orbit-spin` and the keyframes `kj-orbit-spin`, `kj-page-cast`, `kj-book-count` outside it. Motion only under no-preference; forced colours (system edges on the records card, the cover and the pages; washes, tiles, shadows, rings and the countdown removed); a print rule so a stage never scrolled into view still prints its ring. No token added to `globals.css` |

## 3. Gates

| # | Command | Result |
| --- | --- | --- |
| 1 | `pnpm typecheck` | pass |
| 1 | `pnpm lint` (`--max-warnings=0`) | pass, 0 warnings |
| 1 | `pnpm format:check` | pass (touched files formatted with `prettier --write`) |
| 1 | `pnpm knip` | pass |
| 1 | `pnpm test` | 157 files, 1,450 tests pass (Phases 1 to 3 merged: 1,392) |
| 1 | `pnpm build` | pass |
| 1 | `pnpm perf:budget` | pass: entry chunk 107.5 / 120 KB (deviation 21); stylesheets 20.2 / 22 KB; preloaded fonts 51.2 / 56 KB; worst route 191.1 / 200 KB (`/skills/code-review`), unchanged by this phase |
| 1 | Preview weight, by hand (previews are not prerendered) | `/preview` 187.5 KB JS gzip (36 files), CSS 30.9 KB gzip; `/preview/system` 163.5 KB JS; `profile.css` 51.6 KB raw, 11.0 KB gzip. No live page loads Phase 4 code: 1,357 chunk references of the prerendered pages scanned for its markers, 0 hits |
| 2 | Orbit (`profile-journey.spec.ts`, desktop Chromium and the WebKit phone) | pass: a pointer drag on the ring turns it (and a drag that starts on the heading does not); the buttons turn it one slot (18 degrees); under reduced motion it has no animation and no pause button and the buttons still turn it; with motion it turns while in view and holds by its button, with focus inside and on hover (desktop); tiles below the fold wait and rise in |
| 3 | Notebook (`profile-journey.spec.ts` on `/preview/system`; unit `Notebook.test.tsx` with fake timers) | pass: previous, next and pause by keyboard; only the open page is not `inert`; the live region speaks after a reader's turn and stays silent during autoplay; autoplay after 7,000 ms for the first sample (`page.clock` and fake timers), held by focus, hover and the pause button, which names what it will do and has no `aria-pressed`; a page reads a mid-turn `--turn` 300 ms in with motion and turns within a frame under reduced motion, where nothing turns on its own; a 45 % drag turns the page and a short, slow one springs back |
| 4 | Hidden below three quotes (unit `Notes.test.tsx`, `testimonials.test.ts`; e2e) | pass: zero, one or two cleared quotes render nothing; three render the section and the notebook; `/preview` has no notebook section, heading, carousel or link (the e2e follows the content: it expects the notebook once three are cleared) |
| 5 | Claim audits | pass: `testimonials.test.ts` (a clearance date on every quote; every quote only in `testimonials.ts`, with a fixture the check must fail; samples never in the content module and dropped by the 3-quote rule), `homeJourney.test.ts` (no figure in the story; only the résumé's organisations; the cleared availability), `journey.test.ts` (records as the résumé has them, no dash in any period); `portfolioOutcomes`, `ventureCase` and `resumeFacts` unchanged and passing |
| 6 | Tap areas and axe | pass: at 320, 344 and 390 px the story pill, both orbit buttons, the pause button and "Full résumé" are 24 px or more and uncovered; axe with `wcag22aa` on `/preview` and `/preview/system` in both themes (`a11y.spec.ts`); `profile.spec.ts`'s 12 px floor, 24 px targets, forced colours, text spacing, zoom, more contrast and request origins on both previews |
| 7 | Visual baselines | not rendered here (section 4) |
| matrix | 344, 390, 820, 882, 1180 and 1440 px (desktop Chromium), and a spanned hinge | pass: no sideways scroll; at rest every name is fully on or off, none collides with another, the copy or the controls, none is covered; one name under 1180 px, the near arc from 1180; the story beside the card from 1024 px and above it below, Employment and Education side by side from 600 to 1023 px; the notebook's arrows beside it from 1180 px and under it 88 px apart below, 48 px each; one page bleeding to x 0 with a 36 px strip under 810 px; spanned at 1114 x 720 with a 34 px hinge, the cover ends at the hinge, the pages start after it, the spiral hides |
| e2e | `PORT=3104 PLAYWRIGHT_WEB_SERVER="pnpm start" pnpm exec playwright test smoke.spec.ts a11y.spec.ts tests/e2e/profile --project=desktop --project=mobile --project=fold-closed --project=fold-open --project=tablet-landscape --project=webkit-phone --grep-invert "matches its baseline" --workers=2` | First full run: 577 passed, 1 failed (Phase 1's anchor check, deviation 22), 420 skipped by project scope. Second: 577 passed, 1 failed: this phase's drag test in the WebKit phone read the ring's computed angle, which under reduced motion trails the script's value by a few frames on a busy machine (the global 0.01 ms transition); the test now reads the value the script writes, and passed 12 of 12 repeated, with the whole spec passing on all six projects (29 passed). Final run, on the committed tree: 578 passed, 0 failed, 420 skipped by project scope (4.8 min), including axe with WCAG 2.2 on both previews in both themes; the known mobile Contact flake did not occur |
| e2e | `profile-journey.spec.ts`, desktop and the WebKit phone, `--repeat-each=2` | 58 passed, 0 failed |
| parity | `GATES_PORT=4304 node scripts/start-gates.mjs --parity-only` | 137 URLs compared, 0 with differences; 137 crawled |
| live | Live baselines | no snapshot file changed |

Screenshots for review (1440, 1180, 882, 820, 390 and 344 px, light and dark:
the stage, the story and the sample notebook) were taken in scratch space and
checked by eye against spec 8.6, 8.7, 10, 10.1 and 11; they are not committed
and are not baselines. Two layout bugs found that way are fixed: the phone
cover strip sat at 30 px instead of 0 (an absolute grid child placed in a
column takes that column as its box), and the ruled paper drew a stray rule
under the page's top edge (the ruled layer repeated upward).

## 4. Visual baselines (not rendered here)

- New: `tests/e2e/profile-journey.spec.ts-snapshots/preview-{journey,story,notebook}-{light,dark}-{fold-closed,fold-open,tablet-landscape}-linux.png`
  (18 element baselines on the matrix projects, under reduced motion: the
  Journey's stage, `#story`, and the sample notebook on `/preview/system`).
- Changed: the full-page `/preview` baselines of `visual.spec.ts` (the
  Journey replaces the Phase 1 placeholder) and every `/preview/system`
  baseline (`visual.spec.ts` and `profile.spec.ts`'s three matrix images: the
  sample notebook section is new).
- Unchanged: all 96 live baselines; no snapshot file changed in this tree.
- Reviewed by eye in scratch screenshots (not committed) against spec 8.6,
  8.7, 10, 10.1 and 11: 1440, 1180, 882, 820, 390 and 344 px, light and dark.

## 5. Deviations, with reasons

1. **Content module `lib/content/homeJourney.ts`**, as the lane prompt names it,
   not `lib/content/home.ts` (plan touchpoints): Phase 2 owns `home.ts`.
2. **Helpers in a new `lib/landing/journey.ts`**: `displayPeriod` words a
   period with "to" and "now"; `experience.ts`'s `compactPeriod` (spec 15.5)
   writes an en dash, and `homeExperience()` joins the title and the company,
   which the card shows apart.
3. **Pause buttons switch their label and carry no `aria-pressed`** (spec 12,
   item 8; the `MotionToggle` contract). Plan 4e asked for both, which
   announces a contradiction ("Play notes, pressed"). The labels are the
   plan's and the canvas's, "Pause notes" and "Play notes" (spec 8.7: "Pause
   the notebook").
4. **Records card wording from plan 4c and the canvas:** the heading
   "Employment" (spec 8.6: "Experience") and the link "Full résumé" (spec:
   "Résumé").
5. **Orbit names on the near arc only** (about seven from 1180 px, one at a
   time below), not on every tile with a blur as in the reference: with 20
   tiles, names at the back and the sides collide or sit behind nearer tiles,
   and blurred or scaled text breaks the 12 px floor and the contrast floor.
   Depth (scale, blur) applies to the tiles alone, so every name renders at
   its size. Wherever the ring stops, every name is fully on or fully off:
   each reads the depth of its item's nearest slot (review finding 2; at
   first only a ring at rest had this), so axe never meets half-transparent
   text. All names stay in the list for screen readers.
6. **Orbit controls together at the stage's bottom-right from 810 px:** spec
   8.6 puts the pause button there; the plan places previous and next
   nowhere; the canvas put them at the bottom centre, where the front tiles
   pass. Under 810 px they sit centred in a 64 px band of their own under
   the ring (review finding 1), where no name can pass under them.
7. **Each tool's kind is its /stack group** (Build, Ship, Operate), as spec
   15.5 sources it, not the canvas's per-tool words ("Language", "Edge"),
   which would be new copy.
8. **Samples read "Sample note one…" by "Sample person"** (plan 4f), not spec
   8.7's "Placeholder note 1 of 3" with no name; neither names a real person.
9. **The carousel's group is the notebook's wrapper** (book, controls and
   live region together, as the ARIA carousel pattern has it), not the book
   alone (spec 8.7).
10. **Claim audits in their own files:** the testimonial audit in
    `lib/content/testimonials.test.ts`, the story's in
    `lib/content/homeJourney.test.ts` and the records' in
    `lib/landing/journey.test.ts`, instead of new blocks in
    `portfolioOutcomes.test.ts` or `resumeFacts.test.ts`, which the Phase 5
    lane may edit. `pnpm test` runs them the same.
11. **Autoplay also holds while the notebook is off screen or the tab is
    hidden** (ours); spec 8.7 lists hover, focus and the button.
12. **A drag turns one page within the pile and does not wrap** (the buttons
    wrap), and a pointer that rests 100 ms before letting go is not a flick.
13. **Without JavaScript the notes line up in a sideways-scrolling row** (not
    in the spec): the brief's rule that no content hides without script.
14. **Story drafted from the résumé** (R9's default sources), not from
    `aboutPage.story` (spec 15.5), which the About bento already prints on
    the same page. Playbux reads "product launches", as its résumé bullets
    say (the canvas grouped it under "business systems and IT projects").
15. **Story text in ink 80** (spec 2.2: prose), not the canvas's ink 60.
16. **Four roles on the records card** (spec 15.5's default); the canvas
    showed six. `recordsCopy.roles` changes it.
17. **Phone tiles at 46 px** (canvas 52): twenty tiles on a 150 to 190 px
    radius bunch at the front at 52 px.
18. **Breakpoints as rem media queries**, as Phases 1 to 3 do, not the
    container queries spec 10.1 mentions.
19. **Phase 2's `kj-file-in` keyframes reused** from `home-hero.css`, not
    redefined in this partial.
20. **The cover's small text in ink 68** (`--muted-strong`): ink 60 is 4.39:1
    on the cover's tint-3 end.
21. **Live entry chunk 106.9 to 107.5 KB gzip**: the notebook's on-demand
    import made the bundler move Vite's dynamic-import helper into the entry
    chunk. Every live page's total first-load JavaScript is unchanged
    (`/about` 155.0 KB, `/portfolio` 157.7 KB and the worst route 191.1 KB
    before and after; the topic hubs and `/proof` 0.1 KB lighter), and no
    live page loads Phase 4 code (1,357 chunk references scanned). The
    preview Home without the notebook code: 189.1 to 187.5 KB.
22. **One check in Phase 1's `profile-shell.spec.ts` narrowed.** "Each
    section lands where its scroll margin puts it… and its content clears
    the bar" read a section's first child as its eyebrow. `#journey`'s first
    child is the stage, which starts under the bar by design (spec 4.3 lands
    `#journey` on the section top; the bar floats over the wash), so the
    check failed at 1440 and 820 px while the eyebrow sat near 265 px. It
    now reads `#<section> .pf-section-head > :first-child`, the eyebrow the
    comment names, for all three sections; nothing else in that file changed.
23. **This phase's element baselines hide the fixed chrome** (an injected
    style on `[data-site-chrome]` and `.ds-skip`). An element taller than the
    viewport is captured beyond it, and the skip link, parked just above the
    viewport, is then drawn over the section (seen in scratch captures of
    the Journey and the notebook). Phase 3's tall element baselines (`#work`,
    `#about`) may show the same; worth a look when the orchestrator renders
    them.
24. **Play plays at once** (review finding 4, a spec decision): pressing Play
    lifts the hover and focus holds until the pointer and the focus have
    both left the stage, so the button never offers to pause a ring that
    stands still. Pause, a drag and an off-screen stage still hold it.

## 6. Owner inputs used and their defaults

| Input | Default used | Where |
| --- | --- | --- |
| R9 Journey and story copy | Drafted (section 7), awaiting line-by-line approval | `lib/content/homeJourney.ts` |
| R11 Testimonials | Hidden: `TESTIMONIALS` is empty, so the Home renders no notebook; the notebook is built and reviewed on `/preview/system` with samples | `lib/content/testimonials.ts`, `Notes.tsx` |
| R18 Orbit icons | Our own pixel badges from each tool's /stack mono badge, in palette tones | `PixelIcon.tsx` |

## 7. Draft copy awaiting approval

Each is marked DRAFT in its module. No line states a figure.

`lib/content/homeJourney.ts`:
- Journey h2: "From smart contracts to AI engineering."
- Journey lead: "Engineering first, then the delivery around it."
- Pill: "Read the story"
- Story, paragraph 1: "I studied **electrical engineering at Kasetsart
  University**, then started on smart contracts at Bitkub and blockchain
  development at KK Venture Global."
- Story, paragraph 2: "From there I moved into delivery: **business
  systems** at KK Venture Global, IT projects at Coins.co.th, product
  launches at Playbux, then AI projects at Aiden Labs. Today I lead **IT and
  AI engineering at The Binary Holdings**."
- Roles h3: "Roles I’m open to" (the paragraph and chips are the cleared
  availability)
- Records: "Career records" (its name for screen readers), "Employment",
  "Full résumé"
- Orbit: "Tools I use" (the list's name), "Turn the tools left", "Turn the
  tools right", "Pause the orbit", "Play the orbit"

`lib/content/testimonials.ts` (shown only once three quotes are cleared):
- Eyebrow "Recommendations", h2 "What it is like to work with me.", carousel
  name "Recommendations", cover "Notes" and "Notes from people I have worked
  with.", count "{n} notes", page names "Note {n} of {total}", "Pause notes",
  "Play notes" ("Previous page" and "Next page" are spec 8.7's)

Not drafts: "Journey" (the nav's label), the /stack tool names and groups,
the résumé's organisations, titles and periods, "Education", and the
availability sentence and chips.

## 8. Open items

1. **Visual baselines (orchestrator):** the 18 new matrix baselines and the
   changed `/preview` and `/preview/system` baselines (section 4).
2. **Owner approvals:** the drafts (section 7) and R18; R11 when three
   recommendations are cleared (add them to `TESTIMONIALS` with `clearedOn`;
   the Home then shows the notebook with no code change).
3. **Spec updates to record:** deviations 3 to 6, 9, 11 to 13 and 17 in
   spec 8.6, 8.7 and 15.5.
4. **Firefox** is not installed here and was not run; the dual-screen spread
   is checked through Chromium's emulation only.
5. **Touch hardware:** the drag and swipe are driven by a mouse in the
   browser checks; check them on a phone at Phase 6.
6. **Scroll restoration at hydration** (section 1): found and fixed in the
   review pass (section 9). It was TanStack's restore, in every engine, on
   live pages too; one residual is recorded there.
7. **Preview weight:** `/preview` loads 187.5 KB of JavaScript gzip (200 KB
   budget), `/preview/system` 163.5 KB; `profile.css` 51.6 KB raw, 11.0 KB
   gzip.
8. **Umbrella status** for Phase 4 (the orchestrator updates the table).
9. **Merging with the Phase 5 lane:** shared files touched here are
   `PreviewHome.tsx` (the Phase 4 block and two imports),
   `SectionHeader.tsx` and its test (two new options, default output
   unchanged), `SystemPreview.tsx` (one new section at the end) and
   `profile-shell.spec.ts` (one locator). `src/styles/profile/case.css` and
   `tests/e2e/routes.ts` are untouched.

## 9. Code review and fixes (18-11-26)

A fix pass on this phase's review, together with the Phase 5 review (Phase 5
report, section 9), in the worktree `t3-d8574179-f1f03c6bbcb3dbc5` on the
local branch `fix/profile-case-review-findings`, from `02de7bf` (Phases 2
and 3 with their fixes, Phases 4 and 5, and one test fix). Lane settings:
`PORT=3106`, `GATES_PORT=4306`, Playwright `--workers=2`. One local commit;
nothing pushed, merged or deployed.

| # | Finding | Fix | Test |
| --- | --- | --- | --- |
| 1 | Medium. On phones with motion allowed the controls (134 px wide with the pause button, z 31, y 572 to 616) covered the front tool's name (y 584 to 601) | Under 810 px the controls have a 64 px band of their own under the ring: the ring layer ends above it (`inset-block-end: var(--orbit-band)`), the controls sit centred in it, and the stage's bottom padding grows by the band, so the copy stays centred on the ring. From 810 px they stay at the bottom right (deviation 6) | `profile-journey.spec.ts`, at 344 and 390 px with motion allowed: Pause pressed, then all 20 positions stepped with real clicks on "Turn the tools right", each turn awaited: no name overlaps another, the copy or a control, none is covered, one name shows and none is half drawn |
| 2 | Medium. Names stayed half transparent whenever the ring stopped between slots (hover, focus, pause, off screen, a drag release): 7 degrees past rest left "TypeScript" at 44 % opacity, about 3:1 | Each name reads the depth of its item's nearest slot, `--rest: sin(round(nearest, var(--a) - 20deg, 360deg / var(--n)) + 20deg)`, in both opacity rules, so any stop shows each name fully on or off (deviation 5) | With motion allowed: in desktop Chromium, hover at three moments of the turn; in both projects, the spin paused by its button and drags of 5, 9 and 13 degrees (each checked to turn the ring). Each time, with no turn or rise under way, `labelReport().half` is 0. The matrix check also runs with motion allowed (held by its button) at all six widths |
| 3 | Low. Screen readers met the tool list before the Journey's heading | `Orbit` renders the copy, then the ring, then the controls. The layers' z-index keeps the drawing and the hit testing as they were | Unit: the h2 precedes the list, and the list the controls, in DOM order |
| 4 | Low, tests | Motion-allowed passes for the label and matrix checks (above). Fixed sleeps gone: the 300 ms mid-turn sleep (the page's `--turn` transition is read from `getAnimations()`: 1,000 ms, running), the four 400 ms sleeps (the spin's `CSSAnimation.playState` and `expect.poll` on its angle) and the 150 ms hold (`visit` waits for a hydration signal, `.pf-orbit__controls` on the Home and `.pf-book[data-ready]` on `/preview/system`, and starts from `about:blank`, since opening the same address again is a reload after which the browser restores the last scroll position late; `scrollTop` scrolls until the place holds). Real Tab presses (Option+Tab in WebKit, whose Tab alone reaches only text fields) from a starting point, and real clicks. The notebook's keyboard test runs with motion allowed and presses its pause button. `testimonials.test.ts` scans every source for a `quote:` string or words typed inside a `<blockquote>`, with fixtures it must fail. `labelReport` skips 1 px words and looks through names faded to nothing | themselves |
| 4b | The quirk real clicks exposed: after Play, hover and focus kept the ring still while the button already offered "Pause the orbit" | Play plays at once: it sets `data-play` on the stage, which lifts the hover and focus-within holds until the pointer and the focus have both left the stage (the pointer is tracked with pointerenter and pointerleave); Pause clears it (deviation 24) | Unit: `data-play` after Play, kept while focus stays inside after the pointer leaves, cleared when focus leaves too, and by Pause. Browser: after a real click on Play, with the pointer and focus on it, the spin runs; once both have left it runs; the keyboard back to the controls holds it; in desktop Chromium hover holds it |
| 5 | Low. The on-demand notebook had no error boundary and reserved no space | `Notes` wraps its section in an error boundary that renders nothing, so a failed `Notebook-*.js` costs the section, not the Home. The Suspense fallback is an empty `pf-book-wrap pf-book-wrap--pending` of the book's least height plus its controls (556 px; 667 px under 810) | Unit `Notes.unavailable.test.tsx`: the module's import rejects; the reserved place shows while it loads, then the section goes and the rest of the page (an h1 and a paragraph after it) renders |
| 6 | Low. 1 px breakpoint gaps | Range syntax: `(37.5rem <= width < 64rem)` and `(width < 50.625rem)` twice in `home-journey.css`, `(23.125rem <= width < 50.625rem)` and `(width < 23.125rem)` in `shell.css` (the Phase 3 fix agent's open item). `Notebook.tsx`'s spread query reads `(width >= 50.625rem)`, in step | no `max-width` gap value is left in `src/styles/profile` |
| 7 | Low. A mouse drag on a page selected the quote | `.pf-book[data-ready] { user-select: none }` (the server HTML stays selectable), and the selection is cleared when a drag starts | Unit: the selection is cleared once a press has moved 8 px sideways, not before |
| 8 | Low. In dark theme the records card and the cover glowed | Both use `var(--elev-mat)` | visual baselines (orchestrator) |
| 9 | Low. `.pf-orbit` reused `--tile` as a size | `--orbit-tile` | gates |
| 10 | Low. `SectionHeader` gaps | Two options: `titleClassName` (a class added to the h2) and `actions` (under the header). The notebook's h2 size moves to `.pf-notes__title`; Journey's "Read the story" pill moves into `actions` (32 px under the lead, 24 under 810 px, as before). The default output is unchanged | Unit: the output with the new options left out is byte for byte the old one; the class and the actions render, in order |
| 11 | Low. On phones the spin re-blurred about 8 tiles every frame | The depth blur applies from 810 px only | gates |
| 12 | Nit. The story's lines were marked only in a doc comment | `// DRAFT` on each run of the two paragraphs | gates |

### The WebKit flake: root cause and fix

**Root cause (in every engine, live pages included).** `src/router.tsx`
turns TanStack's scroll restoration on. The router starts with its reset flag
set (`router-core/router.js`, `this._scroll = { n: true }`), and its first
`onRendered`, emitted in the hydration commit, restores
(`scroll-restoration.js`): without a hash it calls `scrollTo(0, 0)` (or a
saved position), with one it scrolls the hash's target into view. A scroll
made before hydration ended was undone. WebKit hydrates later, so Phase 1's
shell test, which scrolled right after `networkidle`, met it there first. On
the live site a visitor who scrolled while the page was still loading was
pulled back to the top.

**Fix.** `src/lib/scrollRestoration.ts` gives the router its
`scrollRestoration` as a function, which TanStack asks before each restore.
On the client its first answer (the restore at hydration) is no once the
visitor has scrolled: a wheel, a touch move or a scroll key since the client
script started, or, on a page without a hash, the page no longer at the top.
Every later restore (navigations in the app, Back and Forward) runs as
before. On the server it always answers yes, so the router's inline restore
script stays in the HTML and the live HTML is unchanged. A deep link the
visitor has not moved from still lands on its anchor.

**Residual.** A visitor who scrolls a deep-link page before the client script
has even started (while it downloads) is still taken back to the anchor at
hydration: input before the script runs is unseen, and the position alone
cannot tell a visitor's scroll from the browser's own jump to the anchor.

**Tests.** Unit `scrollRestoration.test.ts` (8): restore on an unmoved page
and on a deep link; skip after the page has left the top, or after a wheel, a
touch move or a scroll key, a deep link included; keys that do not scroll do
not count; every later navigation restores. Browser
(`profile-shell.spec.ts`, desktop Chromium and the WebKit phone): with the
page's scripts held, so it is parsed and drawn but not hydrated, a scroll to
600 px survives hydration on `/preview` (signal: Say hello's copy button,
rendered only on the client) and on the live `/about` (signal: the live theme
switch's label for the day theme in the dark theme); a deep link to `#ch-03`
of a case page lands at 112 px and stays there after hydration. Phase 1's
test "the bar hides on the way down" now scrolls only after `visit` has seen
the hydration signal.

Baselines these fixes change (not rendered here; the orchestrator renders
them): under 810 px the Journey's stage (the controls' band, no depth blur:
`preview-journey-*-fold-closed` and the mobile `/preview` images); in both
themes the records card and the notebook's cover (their shadow:
`preview-story-*`, `preview-notebook-*`, the `/preview` and
`/preview/system` images). No live baseline changes.

### Gates of the fix pass (final tree)

One pass for both phases; the full table is in the Phase 5 report
(section 9). In short: typecheck, lint (0 warnings), format, knip, 1,566 unit
tests (164 files), two builds (the second for a Phase 5 CSS fix) and the
perf budget pass. The browser gate on all six projects: 768 passed, 5 failed
(a Phase 5 test-only issue, then fixed: 14 of 14 and the whole case spec, 94
of 94), 861 skipped by project scope; every check of
`profile-journey.spec.ts` and `profile-shell.spec.ts` passed in every
project, the WebKit phone included, and so did the live smoke tests. Parity:
137 URLs compared, 0 with differences, so the router change leaves every
live page's HTML as it was.

### The Journey stage cut short at 1180 x 820 (18-11-26)

A later fix in the worktree `t3-04f25844-5caa56d6e748a950`, local branch
`fix/journey-stage-orbit-clip`, from `c0410c2`; `PORT=3106`,
`GATES_PORT=4306`, Playwright `--workers=2`. One local commit; nothing
pushed, merged or deployed.

- **Defect.** CI's render of the Journey's stage on tablet-landscape (an
  image 1180 x 821) cut the near names (Turborepo's "BUILD" in half) and the
  turn buttons along one line about 50 px above the stage's bottom, with
  nothing drawn below it. Local captures showed the same cut at fold-open
  (882 x 1104, the buttons) and at 1440 x 900.
- **Cause.** Nothing in the page clipped them: their only clipping box, the
  stage (`overflow: clip`), holds them (at 1180 x 820 Turborepo's name ends
  at 782 of 820 px, the buttons at 796). The cut was the screen's bottom
  edge. The bar's 96 px scroll padding (`shell.css`) leaves 724 px for a
  stage a screen tall, so the element screenshot's first step, a centring
  scroll into view (Chromium's `DOM.scrollIntoViewIfNeeded`), put its top
  at 48 and its bottom 48 px past the screen (`scrollIntoView` start and
  nearest: 96 px). As the stage is no taller than the viewport, Playwright
  captured without `captureBeyondViewport` (it compares sizes, not places),
  and Chromium drew nothing past the edge. WebKit's capture draws the whole
  box; phones' 640 px stage fits under the bar.
- **Fix** (`home-journey.css`). `.pf-journey__stage` gets
  `scroll-margin-block-start: -96px`, which cancels the scroll padding: in
  Chromium and WebKit every `scrollIntoView` alignment, and Playwright's
  scroll in Chromium, now land the stage whole with its top at the screen's,
  as the `#journey` anchor does. Under 810 px it is 0, so the 640 px stage
  still lands below the bar. Nothing is drawn differently.
- **Test** (`profile-journey.spec.ts`, desktop Chromium). At 1180 x 820 and
  1440 x 900, under reduced motion and with motion allowed (held by its
  button), the stage is scrolled into view as an element screenshot does;
  then every shown name (more than 3) and every control button must lie
  inside the stage, inside every ancestor whose overflow is not visible or
  that contains its paint, and inside the viewport (`clipReport`). On
  `c0410c2` it fails: "Turborepo, Build" 10.2 px and both turn buttons
  24.3 px past the viewport.
- **Baselines (orchestrator).** The `preview-journey-*` images on
  tablet-landscape and fold-open change (whole now); fold-closed does not.
  None rendered here.
- **Gates (final tree).** Typecheck, lint (0 warnings), format and knip
  pass; 1,566 unit tests (164 files) pass; `pnpm build` (one of `c0410c2` to
  reproduce, one of the fix) and the perf budget pass. Browsers, production
  build, `profile-journey.spec.ts` and `profile.spec.ts` on desktop,
  fold-closed, fold-open, tablet-landscape and the WebKit phone, baselines
  left out: 110 passed, 0 failed, 135 skipped by project scope. Parity: 137
  URLs compared, 0 with differences.
