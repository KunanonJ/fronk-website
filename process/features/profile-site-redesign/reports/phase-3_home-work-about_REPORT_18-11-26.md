# Phase 3 report: Home work stack and About bento

**Plan:** `../active/phase-3_home-work-about_PLAN_18-11-26.md`
**Date:** 18-11-26. A parallel lane beside Phase 2, in the worktree
`t3-d754e545-956bbfbe9c58ffba` on the local branch
`feat/profile-work-stack-about-bento`, from `33d84b5` (Phases 0 and 1). One
local commit; nothing pushed, merged or deployed.
**Tree:** sha256 of the `git ls-files -s` entries of the 30 changed code
paths: `1afa8d03f4902afe` (this report and the plan status are not in it).
**Harness:** `.claude/agents/`, `.claude/skills/` and `process/context/` are
missing; the phase ran from the shared brief under the Harness-Absent
Fallback.
**Status:** CODE DONE (18-11-26), reviewed and fixed (section 9). Linux
baselines are not rendered here (the orchestrator batches them; open item 1).

## 1. Research answers (the plan's "Research first")

- **How `PortfolioMockup` scales.** One 640 x 400 SVG, `w-full h-auto`, with
  labels of 10 to 18 units. In a stack card's media column (about 290 to
  700 px wide) they render at 4.5 to 11 px, under the 12 px floor (spec 12,
  item 5), and the floor check in `profile.spec.ts` reads an SVG `<text>`'s
  declared size, so it would fail on every project. The mockup gains an
  optional `labels="bars"` mode that draws each label as a bar; the default
  output is byte for byte the same (a unit test compares it for all four
  mockup kinds), so the live pages and their parity do not move.
- **Which figures are cleared word for word.** Project outcomes in
  `lib/content/portfolio.ts` (TBH Intranet: adoption and build cycles; AI
  Automation: staffing and turnaround) and venture metrics in
  `lib/content/ventures.ts` (GoGoCash: users, merchants, maximum cashback,
  and two totals dated October 2026). The pixel digits can draw a count; a
  change ("from 4 months to 1 week") or a dated total cannot be drawn without
  dropping words that belong to it, so `aboutStats.ts` refuses both.
- **Canvas colours.** Chromium and WebKit both accept `oklch()` and
  `color-mix()` as a canvas `fillStyle` (probed), so each card's dither takes
  pixel colours derived in CSS from its own material tokens; no new token.
- **Accessible names in the engines.** A visually hidden span is absolutely
  positioned, so engines treat it as a block and insert a space before it:
  Chromium's own accessibility tree (read over CDP) and Playwright both named
  the card link "Read the case study : TBH Intranet". The card link now
  carries `aria-label`. The story's "(opens in a new tab)" note keeps its
  leading space inside the hidden span: "GoGoCash (opens in a new tab)" in
  both engines, with no visible gap before the punctuation that follows.

## 2. What was built (by plan step)

| Step | Files | What |
| --- | --- | --- |
| 3a Section header | `components/profile/home/SectionHeader.tsx` and test | Mono eyebrow with its hairline, serif `t-title` h2 with a measure in `ch` (13 by default, 10 for About), a lead on the h2's last baseline from 810 px and under it below. Documented props for Phase 4: `eyebrow`, `eyebrowId` (a section takes its name from it), `title`, `titleId`, `lead`, `titleMaxWidth`, `align` (`split` or `centred`, the notebook's form with hairlines on both sides), `className` |
| 3b Card model | `lib/landing/stackCards.ts` and test | A pure mapper from `STACK_ENTRIES` to cards: slug, `href` under `PROFILE_BASE` (`/preview/portfolio/<slug>`, `/preview/ventures/<slug>`), name, chips (category and period; "Venture" and "Since {year}"), the tagline, the evidence line (a project's first cleared outcome through `outcomeLine()`; GoGoCash's count as `landing.ts` words it), media (a registered screenshot, else the mockup, else a venture's logo and loop), the material hue (253, 79, 292, 327, 266, 301, wrapping) and the anchor. Unit tests hold every value to its content module |
| 3c Work stack | `WorkStack.tsx`, `StackCard.tsx`, `stackDepth.ts`, tests | `article#work` named "Selected work" by its eyebrow. Each `li` sticks at `104px + 14px * index` (only on screens 640 px tall or more). Card: grid 5fr / 7fr, gap 32, padding 36, radius 28, `min-height: min(72vh, 620px)`, ring line-soft, the material gradient of its hue, a dither over the right 60 % (densest at the right edge). Body: chips, title, summary in ink 68, evidence line, the dark "Read the case study" pill with the growing arrow; the link's `::after` covers the whole card, media and Illustration chip included (spec 6.12; the body column is not positioned, and the `::after` sits at z-index 3). Media: white frame, radius 20, `elev-frame`, a small mat, the "Illustration" chip, hidden from assistive technology. Depth: a passive scroll listener in `requestAnimationFrame` sets `--depth` (later cards' cover, summed); CSS scales the card by `1 - min(depth, 4) * .035` from the top centre and veils it at `depth * .12`; none of it under reduced motion, where the cards still stack. Focus: one frame after a card link takes keyboard focus (`:focus-visible`), once the browser has scrolled it into view, a link that the next card covers or that is not wholly on screen scrolls the page until its card rests uncovered (WCAG 2.4.11). Anchors: `#ventures` is placed from the list (which never sticks) after the fonts load and after each in-app navigation to it. Hover (fine pointers): the striped ring, the arrow, the frame at 1.015. Under 810 px: the compact card (media first at 16:10, a 22 px title, a 40 px round arrow pill whose name stays, chips and summary hidden, the evidence line and the chip kept, the dither over the top 70 %). 810 to 1179 px: padding 28, 30 px titles, 520 px minimum. GoGoCash carries `id="ventures"` |
| 3d About bento | `AboutBento.tsx`, `MessTile.tsx`, `StatsTile.tsx`, `MotionTile.tsx`, `PrincipleTile.tsx`, `PixelNumber.tsx`, tests | `section#about` named "About". Grid: one column under 600 px, two from 600 (wide tiles full width, principles two by two), twelve from 810 with every tile at span 6, and 7 + 5, 7 + 5, 3 x 4 from 1024; gap 12, 16 from 810. "In short": today's About story with its links. Mess: five chips, tidy in the server HTML; after hydration a tile still below the fold is scattered at once (turned, tinted, offsets clamped to the tile with container units, scaled .4 under 810 and .25 under 370) and tidies into a list with violet checks when 40 % of it is in view (.75 s ease-expo, staggered 80 ms); never under reduced motion; the italic serif line under it. Stats: the stats wash and a theme-invariant violet dither, three figures in our own 5 x 7 pixel digits (an SVG hidden from assistive technology, the figure kept as visually hidden text), mono labels in their source's words, a footnote that names the cases the figures come from. Every tile starts with an h3: "In short" (shown, `t-meta`), the mess and the stats tiles (for assistive technology only; the stats list is named by its h3), the motion tile's caption chip, and the four principles. Motion: 36 pixel blocks that scatter and gather into a 6 x 6 grid (`kj-gather`, 6 s loop) only once hydrated with motion allowed, with the 30 px pause control (labels "Pause the animation" / "Play the animation"); still and gathered in the server HTML and under reduced motion; a chip caption. Principles: the four of `aboutPage.principles`, each with a 64 px pixel icon of our own (Phase 1's `PixelArt`) that hops once on entering view and on hover, a 22 px title and 14 px text |
| 3e Content | `lib/content/homeWorkAbout.ts` and test; `lib/content/portfolioOutcomes.test.ts`, `ventureCase.test.ts` | The stack's entries (R7), the section copy (drafts marked), the stats' sources by reference, the story and principles from `aboutPage`. The module types no figure; the audits' source scans already read it, and both audits gained a block for the Home: the stack prints only a project's first cleared outcome line, the stats draw only figures an outcome or a metric states, GoGoCash counts its users as the venture does and shows no running total. `tests/siteSources.ts` needed no change (it scans `lib` and `components`) |
| 3f Tests | unit tests above; `tests/e2e/profile-work-about.spec.ts` | See section 3 |
| Shared files | `components/profile/preview/PreviewHome.tsx` and test, `components/landing/portfolio/PortfolioMockup.tsx` and new test, `tests/e2e/profile-shell.spec.ts` | The two Phase 3 blocks of the preview Home and their imports. The PreviewHome test's section regex accepts `article` and keeps only the three Home sections. `PortfolioMockup`: optional `labels` prop, default `"text"`. One selector in Phase 1's shell spec counts stylesheets only (deviation 17) |
| Stylesheet | `src/styles/profile/home-work-about.css` | Every rule in `@layer components`; motion under `prefers-reduced-motion: no-preference`; keyframes `kj-gather`, `kj-pixel-hop`, `kj-pixel-nudge` at top level; forced colours (system borders on the cards, frames and chips; washes and decoration removed). No token added to `globals.css` |

## 3. Gates

| # | Command | Result |
| --- | --- | --- |
| 1 | `pnpm typecheck` | pass |
| 1 | `pnpm lint` (`--max-warnings=0`) | pass, 0 warnings |
| 1 | `pnpm format:check` | pass (touched files formatted with `prettier --write`) |
| 1 | `pnpm knip` | pass |
| 1 | `pnpm test` | 139 files, 1,326 tests pass (Phase 1: 130 files, 1,267) |
| 1 | `pnpm build` | pass |
| 1 | `pnpm perf:budget` | pass: entry chunk 108.3 / 120 KB (unchanged); stylesheets 20.2 / 22 KB; preloaded fonts 51.2 / 56 KB; worst route 190.1 / 200 KB |
| 1 | Preview weight, measured by hand (previews are not prerendered, so `perf:budget` does not see them) | `/preview` 172.2 KB JS gzip (Phase 1: 152.2), CSS 25.7 KB gzip (Phase 1: 23.5); `profile.css` 25.0 KB raw, 5.6 KB gzip; `/preview/system` 158.7 KB JS |
| 2 to 7 | Browser gate: `PORT=3103 PLAYWRIGHT_WEB_SERVER="pnpm start" pnpm exec playwright test smoke.spec.ts a11y.spec.ts tests/e2e/profile --project=desktop --project=mobile --project=fold-closed --project=fold-open --project=tablet-landscape --project=webkit-phone --grep-invert "matches its baseline" --workers=2` | 516 passed, 211 skipped by project scope, 1 failed: Phase 1's "the preview's stylesheet is linked on /preview only", whose selector also matched the new `profileChrome-*.js` chunk (deviation 17). After narrowing it, `profile-shell.spec.ts` on the same six projects: 34 passed, 86 skipped by scope, 0 failed. Axe with `wcag22aa` ran on `/preview` in both themes (desktop and mobile) |
| 2 to 6 | `profile-work-about.spec.ts`, repeated: `--project=desktop --project=webkit-phone --repeat-each=3` | 69 passed, 9 skipped by project scope, 0 failed |
| 7 | Parity: `GATES_PORT=4303 node scripts/start-gates.mjs --parity-only` | 137 URLs compared, 0 differences; 137 crawled |
| 7 | Live baselines | no snapshot file changed |

What the browser checks in `profile-work-about.spec.ts` cover (desktop
Chromium at 1440 px and the WebKit phone at 390 px unless noted):

- Gate 2: each card sticks at `104 + 14 * index` px within 1 px; the list
  ends with the last card, which reaches 160 px and then leaves with the
  section; no sideways scroll.
- Gate 3: `/preview#ventures` lands the GoGoCash card at its sticky offset
  (146 px, below the 80 px bar) with nothing over it.
- Gate 4: the mess tile is scattered below the fold and tidies on entering
  view; under reduced motion it is tidy from the start, the motion tile is
  still and has no button; the pause button stops `kj-gather`; covered cards
  scale under 0.95 with a veil, and under reduced motion they do not scale
  but still stick.
- Gate 6: at 320, 344 and 390 px (desktop Chromium) each card's arrow pill is
  40 x 40 px, below the bar and uncovered at its resting position, and the
  pause button is 24 px or more and uncovered. Axe with `wcag22aa` runs on
  `/preview` in both themes through `a11y.spec.ts`; the 12 px floor, the
  24 px targets, forced colours, text spacing, zoom and more contrast run on
  every preview page through `profile.spec.ts`.
- Device matrix (desktop Chromium at 344, 390, 700, 820, 882, 1180 and
  1440 px): no sideways scroll, no tile overlapping another, no card body
  over its media, the scattered chips inside their tile, and the principles
  one, two or four to a row as spec 10.1 sets the bento.
- About anchor (desktop Chromium at 820 and 882 px): the section's top
  padding is 176 px, and the nav's About link lands the eyebrow at 96 px,
  below the 80 px bar.
- The work article is named "Selected work" and contains "Adoption: 50+
  employees"; the five cases are articles named by their titles; the case
  links point at the five `/preview/...` addresses; the stats are text; the
  story's links are named with their new-tab note.

Screenshots for review (1440 and 390 px, light and dark, the stack at rest
and stuck, the bento) were taken in scratch space and checked by eye against
spec 8.4, 8.5, 10 and 11; they are not committed and are not baselines.

## 4. Visual baselines (not rendered here)

- New: `tests/e2e/profile-work-about.spec.ts-snapshots/preview-{work,about}-{light,dark}-{fold-closed,fold-open,tablet-landscape}-linux.png`
  (12 element baselines on the matrix projects, under reduced motion).
- Changed: the full-page `/preview` baselines of `visual.spec.ts` (mobile and
  desktop, both themes), which Phase 1 already listed as to render; they now
  include both sections.
- Unchanged: all 96 live baselines. No snapshot file changed in this tree.

## 5. Deviations, with reasons

1. **Content module `lib/content/homeWorkAbout.ts`**, not `lib/content/home.ts`:
   the Phase 2 lane creates `home.ts` at the same time (lane instruction). The
   merge may fold them.
2. **One stack of five cards, GoGoCash carrying `id="ventures"`** (umbrella R7
   and plan step 3c). Spec 8.4 also describes a separate ventures group (an
   eyebrow, the heading and subheading from `landing.ts`, a second stack);
   R7 is the input of record, so that heading is not shown.
3. **Call to action "Read the case study"** for every card (plan step 3c and the
   Phase 0 design-system card), not spec 8.4's "View project" and the
   ventures' `linkLabel`.
4. **The card link is named by `aria-label`** ("Read the case study: {name}")
   instead of a visually hidden span (spec 6.12): the span yields "Read the
   case study : TBH Intranet" in Chromium's accessibility tree and Playwright.
   The visible label leads the name (WCAG 2.5.3); Phase 1 names its brand
   link the same way.
5. **`#ventures` lands at its sticky offset.** Spec 4.3 gives it
   `scroll-margin-top: 0` (shell.css), so it landed at 96 px and then stuck at
   146 px: it shifted after the jump and the next card covered its lower
   26 px. While the stack is sticky, `home-work-about.css` sets
   `calc(8px + 14px * index)` for it (50 px), so it lands at 146 px with the
   next card a gap below. `shell.css` is unchanged. The browser and the
   router measure a stuck card where it is stuck, so a jump from inside or
   below the stack missed; since the review, `WorkStack` places the card from
   the list after the fonts load and after each in-app navigation to
   `#ventures`, and the margin is the page without script (section 9).
6. **Stacking only on screens 640 px tall or more** (`min-height: 40rem`), the
   rule spec 8.1 gives the hero: on a shorter screen (a phone in landscape,
   200 % zoom) a stuck card taller than the space under the bar would keep
   its lower part, call to action included, out of view for good.
7. **Card media.** The project cards use `PortfolioMockup` in the new
   `labels="bars"` mode (textless, research above); the venture cards draw
   their logo and loop on a dotted canvas (Manut AI has no loop, so its three
   stack items, without arrows). All wear the Illustration chip and are
   hidden from assistive technology; a registered screenshot would get
   `alt=""` for the same reason.
8. **The "In short" tile shows `aboutPage.story` as /about prints it**, and the
   principles likewise (R13 default: recruiter-fit Phase 4 rewrites that copy
   at its source). Both carry em dashes today.
9. **Venture chips "Venture" and "Since 2023" / "Since 2025".** Spec 8.4 says
   "the start year"; "Since" keeps an active venture from reading as dated.
10. **Pixel figures are SVG, not canvas** (spec 8.5 says pixel SVG; plan step 3d
    said canvas): server-rendered, crisp at any zoom, `aria-hidden`, with the
    figure as visually hidden text.
11. **Stats labels are composed from content** ("{outcome label}: {unit} on
    {name}", or "{metric label} on {name}"), so no figure or count phrase is
    typed outside its module, and the footnote is built from the names of the
    cases the figures come from (section 9, finding 6).
12. **The story's links are the bento's own inline anchors**, not `TextLink`,
    whose new-tab note leaves an underlined visible space inside the link
    ("GoGoCash ,"). Not fixed in `TextLink` (Phase 0's file; open item 6).
13. **Dither direction `fade="right"`**: `ditherCells` names the dense edge for
    left and right (its test pins it), while its doc comment says "the edge
    the field thins toward", which holds for up and down only.
14. **Section paddings**: `#work` 112 px at every width (spec 8.4); `#about`
    128 px under 810 px and 176 px from 810 px, paired with shell.css's
    `scroll-margin-top` (-128 px, -176 px from the `tablet` breakpoint), as
    the Phase 1 review required. Phase 1's placeholder used `lg:pt-44`
    (1024 px), which left the eyebrow under the pill at 820 and 882 px.
15. **`PreviewHome.test.tsx` changed** (the other lane may change it too): its
    regex accepts `article` for `#work` and keeps only the three Home
    sections, because the GoGoCash card also has an id.
16. **The `#ventures` deep-link test ran under reduced motion only** (open
    item 5). Since the review a second test opens it with motion allowed, in
    Chromium and WebKit (section 9, finding 4).
17. **One selector in Phase 1's `profile-shell.spec.ts` narrowed.** "The
    preview's stylesheet is linked on /preview only" counted every
    `link[href*="/assets/profile"]`. `stackCards.ts` reads `PROFILE_BASE` from
    `lib/content/profileChrome.ts`, so that module is now shared by the
    chrome and the Home route and the build emits it as its own chunk,
    `profileChrome-*.js`, which `/preview` preloads. Since the review, the
    live `/` keeps the broad count of zero, and only the `/preview` count is
    narrowed to stylesheets (section 9, finding 5).

## 6. Owner inputs used and their defaults

| Input | Default used | Where |
| --- | --- | --- |
| R7 stack cards | TBH Intranet, AI Automation, Node Validator Automation, GoGoCash (`id="ventures"`), Manut AI | `STACK_ENTRIES` in `lib/content/homeWorkAbout.ts` |
| R8 stats figures | Only cleared counts: 50+ (TBH Intranet adoption), 1,000 (GoGoCash users), 220+ (GoGoCash merchants), read from `portfolio.ts` and `ventures.ts` | `aboutCopy.stats.figures`, `lib/landing/aboutStats.ts` |
| R9 About copy | Drafted (section 7), awaiting line-by-line approval; the story and principles are today's `aboutPage` copy | `lib/content/homeWorkAbout.ts` |
| R10 screenshots | Code-drawn illustrations, labelled; screenshots supported when registered as `cover` | `stackCards.ts`, `StackCard.tsx` |
| R13 recruiter-fit Phase 4 | Not merged: today's About copy and facts | `aboutCopy.brief`, `aboutCopy.principles` |

## 7. Draft copy awaiting approval

Each is marked DRAFT in `lib/content/homeWorkAbout.ts`. No figure is typed
in any of them; the numbers come from the content modules.

- Work h2: "Projects and ventures, from problem to outcome."
- Work lead: "Internal tools and AI agents at The Binary Holdings, and two ventures of my own."
- Card call to action: "Read the case study"
- Venture chips: "Venture", "Since 2023", "Since 2025"
- About eyebrow, h2 and lead: "About", "AI engineering, close to the work.", "How I work, and the results so far."
- Brief label (the tile's h3): "In short"
- Mess tile's h3, for assistive technology only: "What one system has to hold"
- Mess chips, each in the case copy's words: "Several legal entities", "Thai accounting requirements", "Multi-step approvals" (TBH Intranet, "The problem"), "A dozen disconnected tools", "Spreadsheets and five tabs" (Manut AI)
- Mess line: "Then one system holds it."
- Stats tile's h3, for assistive technology only, naming the list: "Results so far"
- Stats labels as they render: "Adoption: employees on TBH Intranet", "Registered users on GoGoCash", "Merchants on GoGoCash" (the first changed in the review, finding 6)
- Stats footnote, its words around the case names the module reads: "From the" ... "case study." / "case studies."; it renders "From the TBH Intranet and GoGoCash case studies."
- Motion caption (the tile's h3) and control: "The mess, then the system"; "Pause the animation", "Play the animation"

Not drafts: "Selected work" (`portfolioPage.title`, a smoke test reads it),
"Illustration" (owner decision 4), the story and the principles (`aboutPage`).

## 8. Open items

1. **Visual baselines (orchestrator):** the 12 new matrix baselines and the
   `/preview` full-page baselines (section 4).
2. **Case links:** `/preview/portfolio/<slug>` and `/preview/ventures/<slug>`
   do not exist until Phase 5; the tests read the addresses only.
3. **Owner approval** of the drafts (section 7) and of the stats selection (R8).
4. **The story and principles carry em dashes** until recruiter-fit Phase 4
   rewrites `aboutPage` (R13).
5. **Deep links in WebKit with smooth scrolling.** With motion allowed, one
   test load of `/preview#ventures` in the WebKit phone project (a repeated
   run with two workers busy) stopped about 392 px short of the card and
   stayed there; twelve idle loads (six with motion, six without) all landed
   at 146 px within about a second. Since the review, the stack places the
   card again once the fonts are in, and a motion-allowed test runs in
   Chromium and WebKit (section 9, findings 3 and 4). Still check `/#ventures`
   and the `/work` redirect on a real iPhone at Phase 6.
6. **Phase 0 primitives, not changed here:** `TextLink` with `tone="prose"`
   and `external` underlines a visible space before the punctuation after the
   link; the design-system card demo in `SystemPreview.tsx` uses the hidden
   ": name" span (named "Read the case study : TBH Intranet"); the
   `ditherCells` doc comment for `fade` holds for up and down only.
7. **Merging with the Phase 2 lane:** `PreviewHome.tsx` (imports and blocks),
   `PreviewHome.test.tsx` (its h1 test and this regex), `lib/content/home.ts`
   beside `homeWorkAbout.ts`, and `PortfolioMockup` if Phase 2 adds its own
   option (spec 8.2 wants the canvas mock's thumbnails textless too, which
   `labels="bars"` already draws).
8. **Preview weight:** `/preview` loads 172.2 KB of JavaScript gzip (200 KB
   budget); the stack reads `portfolio.ts` and `ventures.ts` whole, as the
   live Home does today.
9. **Spec updates** to record: the `#ventures` landing margin (deviation 5),
   the stacking height rule (deviation 6) and the `fade` naming (deviation 13).
10. **Umbrella status** for Phase 3 (the orchestrator updates the phase table).
11. **Firefox** is not installed here and was not run.

## 9. Code review and fixes

The coordinator's review of the Phase 3 commit (`b4a07cc`) raised the
findings below. They were fixed together with the Phase 2 review's findings
in one fix lane: worktree `t3-1784cc0a-ea5bcb3316195794`, branch
`fix/profile-home-review-findings`, one commit on `b4a07cc`, nothing pushed.
Sections 1 to 8 describe the first run; where a statement there described
code the review changed, it is corrected in place and points here. "Fails on
`b4a07cc`" means the new test was run against the base commit's source files
(tests unchanged) and failed, then passed on the fix.

### Findings, fixes and tests

| Finding | Fix | Test |
| --- | --- | --- |
| **High 1.** Tab into the work stack left the focused card link under the next card (WCAG 2.4.11). The check ran on `focusin`, before the browser scrolled the link into view; at 1440 x 900 the browser centred the first card's link, the card stuck at 104 px with its link at about 644 to 688 px, and the second card slid over it. | `WorkStack.tsx`: the check runs one `requestAnimationFrame` after focus (a newer focus cancels it), skips if `document.activeElement` changed, and acts only for a link that matches `:focus-visible`. The link counts as covered when the next card's top is above this card's bottom, or when the link is not wholly on screen (between the bar's scroll padding and the screen's bottom). It then scrolls to the card's resting place, computed from the list (`restingScrollTop`). | `profile-work-about.spec.ts`, desktop at 1440 x 900: "Tab from above into the first card, then on from card to card" (from the hero's motion toggle, the control just before the stack; after each Tab, once scrolling has stopped for 500 ms, the focused link is uncovered at its centre and edges and wholly between the bar and the screen's bottom). Fails on `b4a07cc`. "Shift+Tab back from About through the cards" (from About's first link) passed on `b4a07cc` too, since the old check handled that case, and stays as a guard. The script-focus test ("a link that takes focus in a covered card brings its card back") still runs on desktop and the WebKit phone. |
| **Medium 2.** Only the card body was clickable: `.pf-card__body { position: relative }` contained the stretched link's `::after`, so the media did nothing though hover showed the ring, the arrow and the zoom. | The body column is no longer positioned, so the `::after` covers the card. It also sits at z-index 3 inside the card (`.pf-card .pf-card__link::after`), above the media's Illustration chip (z-index 2), so a press there opens the case too. The card's veil (its own `::after`) still paints over it and lets presses through. | "a press anywhere on a card opens its case": on every card at rest, `elementFromPoint` at the media's centre and at the Illustration chip's centre is the card's link or inside it, at 1440 px (desktop) and 390 px (WebKit phone). Fails on `b4a07cc`. |
| **Medium 3.** `#ventures` landed covered, or did not move, when the jump started mid-stack or from below: the browser and the router measure a stuck card where it is stuck. | `WorkStack.tsx` places the GoGoCash card at the scroll where it rests, computed from the list, which never sticks (`restingScrollTop` for its index): on mount when the hash is `#ventures`, after `document.fonts.ready`; and after every in-app navigation to `#ventures`, through a new hook, `useAfterNavigation` in `lib/router/navigation.ts`, which subscribes to the router's `onRendered` event and so runs after the router's own hash scroll (Back and Forward included). Only while the stack sticks; the CSS margin stays as the page without script. | "a jump to #ventures while GoGoCash lies covered lands it uncovered" (Manut AI resting on it, then the router's own navigation to `/preview#ventures`) and "a jump to #ventures from the footer, below the stack" (the footer in view, then the same navigation), desktop and WebKit phone: once scrolling has stopped, the card's top is at 146 px and the card and its link are uncovered. Both fail on `b4a07cc`. Until Phase 6 the footer's Ventures link points at the live Home (`/#ventures`); the test checks that address, then makes the navigation the link makes once `PROFILE_BASE` is "" (the router's `navigate`, as a link click does). |
| **Medium-low 4.** The WebKit deep-link test ran only under reduced motion, which hid the default path. | No further code: fix 3 places the card again once the fonts are in. | "/preview#ventures with motion allowed: once the page stops scrolling, the card rests at 146 px", desktop Chromium and the WebKit phone. Not flaky here: the four `#ventures` tests 5 times each in both projects, 40 of 40 passed (dev server), and the full gate passed (below). Not marked `fixme`. |
| **Low 5.** Tests that passed on broken code. | (a) `homeWorkAbout.test.ts` checks `workCopy` and `aboutCopy` for digits each on its own (the spread let `aboutCopy`'s heading and lead hide `workCopy`'s). (b) `PortfolioMockup.test.tsx` compares each project's default output with a stored snapshot (`__snapshots__/PortfolioMockup.test.tsx.snap`, four mockups), written by the base file from `29ad1d7`, before the label option; today's file matches it byte for byte, and `labels="text"` must equal it too. (c) `profile-shell.spec.ts`: the live `/` keeps the broad `link[href*="/assets/profile"]` count of zero; only the `/preview` count is narrowed to stylesheets. | The tests themselves. (b) was run with the old `PortfolioMockup.tsx` in place to write the snapshot (`-u`), then with today's file: 4 of 4 pass. |
| **Low 6.** Stats labels were built from the figure's unit, not the outcome's own label, and the footnote typed its case names by hand. | `aboutStats.ts`: an outcome's line keeps its label and unit ("Adoption: employees on TBH Intranet"); a metric's stays "{metric label} on {venture}". Each stat carries its `source` (the case's name), and `statsFootnote()` builds the footnote from those names, once each, in order, inside the module's words (`aboutCopy.stats.footnote`: "From the", "case study.", "case studies."). | `aboutStats.test.ts` (the labels; one, two and three cases in the footnote; none). The claim audit in `portfolioOutcomes.test.ts`: each label is its source's own words plus " on {name}", and the footnote names every case the figures come from and no other project or venture. |
| **Low 7.** Printing showed the stack as last seen on screen. | A print block after the motion rules (same specificity, so it wins): items `position: static`, cards `transform: none`, veils `opacity: 0`, chips `translate: none; rotate: none`, and the motion tile's blocks `animation: none`. | "print lays the stack and the mess out flat": with two cards covered and the mess scattered, the screen styles are checked first (sticky, scaled, veiled, turned), then under `emulateMedia({ media: "print" })` every item is static and every card, veil and chip flat. Fails on `b4a07cc`. |
| **Low 8.** Four of the eight bento tiles had no heading or name (WCAG 1.3.1). | "In short" is an h3, keeping `t-meta`. The mess tile has an h3 for assistive technology only ("What one system has to hold"); so has the stats tile ("Results so far"), which also names its list (`aria-labelledby`); the motion tile's caption chip is its h3. The new lines are in `homeWorkAbout.ts`, marked DRAFT (section 7). | `AboutBento.test.tsx`: "starts every tile with an h3, and names the stats list". Axe with WCAG 2.2 on `/preview` in both themes (gate). |
| **9.** Leave `SectionHeader` alone (the Phase 4 lane extends it); fix the stale comment. | `SectionHeader` is unchanged. The comment on `workCopy.cta` now says the case's name is in the link's `aria-label`. | Read in the source. |
| **Nit 10.** `max-width: 50.5625rem` left a gap at fractional widths. | `home-work-about.css` uses `(width < 50.625rem)` in its four phone blocks, and the same form for its other upper bounds: `(50.625rem <= width < 73.75rem)` and `(width < 23.125rem)`. The build keeps the range syntax. | The device-matrix test and the gate. Phase 1's `shell.css` has the old form twice (open item 12). |

Other changes made for the review:

- **`lib/router/navigation.ts`:** adds `useAfterNavigation(callback)`;
  nothing existing changed. **`vitest.setup.ts`:** the router mock gains it
  as a no-op, so unit tests render `WorkStack` without a router.
- **`StatsTile`** takes a `heading`; **`MessTile`** takes a `heading`.

### Results of this run

| Gate | Result |
| --- | --- |
| `pnpm typecheck` | pass |
| `pnpm lint` (`--max-warnings=0`) | pass, 0 warnings |
| `pnpm format:check` | pass (touched files formatted with `prettier --write`) |
| `pnpm knip` | pass |
| `pnpm test` | 149 files, 1,406 tests pass |
| `pnpm build` (once, at the end) | pass; the Sanity schema deploy skips itself (`SANITY_AUTH_TOKEN` is not set) |
| `pnpm perf:budget` | pass: entry chunk 106.9 / 120 KB; stylesheets 20.2 / 22 KB (`about.html`); preloaded fonts 51.2 / 56 KB; worst route 191.0 / 200 KB (`/skills/code-review`) |
| Browser gate: `PORT=3106 PLAYWRIGHT_WEB_SERVER="pnpm start" pnpm exec playwright test smoke.spec.ts a11y.spec.ts tests/e2e/profile --project=desktop --project=mobile --project=fold-closed --project=tablet-landscape --project=webkit-phone --grep-invert "matches its baseline" --workers=1` | 562 passed, 0 failed, 315 skipped by project scope (9.3 min), on the production build |
| Parity: `GATES_PORT=4306 node scripts/start-gates.mjs --parity-only` | 137 URLs compared, 0 with differences |
| The new browser tests against `b4a07cc`'s source files (dev server, desktop) | 11 of 13 fail, as they should; the two that pass there are the Shift+Tab path (finding 1 of Phase 3) and the Chromium deep link (finding 4 of Phase 3) |
| Repeats (dev server) | the four `#ventures` tests 5 times in desktop and on the WebKit phone: 40 of 40; the keyboard, intro and tour tests 3 times on desktop: 21 of 21 |
| Live baselines | no snapshot file changed |

Not run here: the `fold-open` project (not in this lane's gate command),
Firefox (not installed), and the Linux visual baselines (the orchestrator
renders them). The built stylesheet keeps the range media queries as
written.

### Files changed

One commit on `b4a07cc`, shared by the Phase 2 and Phase 3 fixes. Code:
`components/profile/home/` (`WorkStack.tsx`, `AboutBento.tsx`,
`MessTile.tsx`, `MotionTile.tsx`, `StatsTile.tsx`, `Hero.tsx`,
`Headline.tsx`, `CanvasMock.tsx`, `IntroGate.tsx`),
`components/landing/IntroLoader.tsx`, `lib/content/home.ts`,
`lib/content/homeWorkAbout.ts`, `lib/landing/aboutStats.ts`,
`lib/motion/introSignal.ts`, `lib/router/navigation.ts`,
`src/styles/profile/home-hero.css`, `src/styles/profile/home-work-about.css`.
Tests: `AboutBento.test.tsx`, `CanvasMock.test.tsx`, `Headline.test.tsx`,
`Hero.test.tsx`, `Hero.ssr.test.ts`, `IntroGate.test.tsx` (all in
`components/profile/home/`), `components/profile/preview/PreviewHome.test.tsx`,
`components/landing/portfolio/PortfolioMockup.test.tsx` and its new
`__snapshots__/PortfolioMockup.test.tsx.snap`, `lib/content/home.test.ts`,
`lib/content/homeWorkAbout.test.ts`, `lib/content/portfolioOutcomes.test.ts`,
`lib/landing/aboutStats.test.ts`, `tests/e2e/profile-hero.spec.ts`,
`tests/e2e/profile-shell.spec.ts`, `tests/e2e/profile-work-about.spec.ts`,
the new `tests/routerContext.tsx`, and `vitest.setup.ts`. Reports: this one
and the other phase's. `SectionHeader.tsx` is untouched.

### Open items added by the review

12. **Phase 1's `shell.css`** has `(max-width: 50.5625rem)` and
    `(max-width: 23.124rem)` (about lines 224 and 241), the same gap at
    fractional widths; not changed here (Phase 1's partial).
13. **Owner approval** of the new drafts: the mess and stats headings, the
    first stats label's new form and the footnote's words (section 7).
