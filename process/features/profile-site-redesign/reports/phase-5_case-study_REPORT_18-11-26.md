# Phase 5 report: Case-study template

**Plan:** `../active/phase-5_case-study_PLAN_18-11-26.md`
**Date:** 18-11-26. A parallel lane beside Phase 4, in the worktree
`t3-c658071c-4268a8338de60af6` on the local branch
`feat/profile-case-study-template`, from `5721eab` (Phases 0 to 3 merged,
Phase 1 verified). One local commit; nothing pushed, merged or deployed.
**Lane settings:** `PORT=3105`, `GATES_PORT=4305`, Playwright `--workers=2`.
**Harness:** `.claude/agents/`, `.claude/skills/` and `process/context/` are
missing; the phase ran from the shared brief under the Harness-Absent
Fallback.
**Status:** CODE DONE (18-11-26). Linux baselines are not rendered here (the
orchestrator batches them; open item 1).

## 1. Research answers (the plan's "Before code")

- **R13 and R12.** Recruiter-fit Phase 4 is not merged, so R13 is deferred:
  the template renders today's content and facts, with nothing dropped. R12
  keeps each page's h1 text: "{name}. {tagline}" for a project and "{name}
  {tagline}" for a venture, checked against the parity reference for all
  seven cases (unit and SSR tests).
- **Fields of today's pages.** `PortfolioProjectPage.tsx`, `ProjectCards.tsx`,
  `VentureHubPage.tsx` and `VentureCards.tsx` were read field by field. Every
  content field reaches the template (a unit test per case, in the view model
  and in the rendered page). Three things on the live pages are UI, not
  content, and are carried another way (deviation 15).
- **`SharePill` needs the bento chrome.** It opens the share panel through
  `useChrome()` (`components/bento/ChromeContext.tsx`), which throws without
  a `ChromeProvider`, and the panel itself is drawn by the old `SiteHeader`.
  The preview chrome has neither, so the hero's pill row provides the context
  and draws the same `SharePanel` under itself (deviation 1).
- **`PortfolioMockup` on the cover.** Its labels are 10 to 18 viewBox units.
  The cover draws it at 1.0 to 2.0 times its size from 810 px (labels of 12
  units and more then render at 12 px or more) and at 0.55 times on a phone.
  `profile.spec.ts` reads an SVG `<text>`'s declared size, so the default
  output would fail the 12 px floor on every preview page. A third label
  mode, `labels="floor"`, writes the labels of 12 units or more and draws the
  rest as bars; the cover shows it from 810 px and the bars below. The default
  and bars output are byte for byte as before (a hash test).
- **The related topics** of a venture page lived in the live route file
  (`RELATED` in `src/routes/_landing/ventures/$slug.tsx`), not in a content
  module. They moved to `lib/content/ventures.ts` as `VENTURE_RELATED_TOPICS`,
  which the live route now imports, so both pages read one list (parity: 0
  differences).
- **LCP.** `BASE=http://127.0.0.1:3105 pnpm probe` on three case pages
  (throttled phone profile): the LCP element is the lead paragraph on each,
  not the cover, so the cover loads eagerly with no `fetchpriority` (plan step
  5b, audit section 9). CLS 0.000, no text under 12 px, no target under 24 px.

## 2. What was built (by plan step)

| Step | Files | What |
| --- | --- | --- |
| 5a View model | `lib/content/caseStudy.ts` and test | Pure mappers `projectCase` and `ventureCase` to one `CaseStudy`: slug, kind, live path and preview href (`PROFILE_BASE`), name, tagline, the h1's first span (`titleName`, R12), the venture logo, back link, eyebrow, lead, byline, external link, first cleared outcome, evidence rows, cover, material hue, meta items, numbered chapters (`ch-01`...) of typed blocks (prose, facts, points, steps, layers, chips, links, showcase), and More projects. `caseCopy` holds the template's labels, most of them today's labels on the live case pages; new ones are marked DRAFT. `findProjectCase`, `findVentureCase`, `allCaseStudies`, `caseHeading`, `caseAccess`. The module types no figure: every line is read from `portfolio.ts`, `ventures.ts`, `availability.ts`, `homeWorkAbout.ts` and `profileChrome.ts` |
| 5b Hero and cover | `CaseHero.tsx`, `CaseActions.tsx`, `CaseCover.tsx`, `CaseMedia.tsx`; `PortfolioMockup.tsx` | `section[aria-labelledby="hero-title"]` under the floating bar: the pixel sky (`DitherField`, peach to the two lightest lavenders, `min(72vh, 620px)`, masked downward), the back link (40 px), the eyebrow after a status dot that pings once, the `t-display` h1 (the name, then the tagline as a smaller italic serif line inside it, max 20ch; a venture's logo inside it with empty alt), the lead (max 640 px), the byline, then the pills: the public site or source as a new tab (announced) and the reused `SharePill`. The cover: `article "Interface"` with a figure: a screenshot at its registered ratio on paper-2 (eager, `srcset`, `sizes`, width and height), or a drawing at 16:10 on the case's Home-card material with the caption "Illustration, not real data."; under 720 px it bleeds to 12 px from the screen's edges, radius 14 |
| 5c Evidence, then meta | `CaseEvidence.tsx`, `CaseMeta.tsx` | Directly under the hero's pills and above the cover: `article "Outcome"` (the cleared outcomes, the figure in the serif at 30 to 36 px over its label, and the link "As stated in the résumé →") and `article "My part"`, each a full-width row with a hairline above, heading on the left from 810 px. A venture's figures take the Outcome place (`article "Venture metrics"`, each running total with "As of October 2026" in its own `dl > div`), and its "My role" section the My part place. After the cover, the meta `dl`: two columns, four from 1024 px |
| 5d Body and rail | `CasePage.tsx`, `CaseRail.tsx`, `useChapterNav.ts` | The column beside a 188 px rail from 1100 px (`minmax(0, 1080px) 188px`); the rail's nav sticks at `--nav-h + 28px`, labelled "On this page", numbered links in 14 px with 12 px mono numbers, the current one ink with an accent number and a 6 px marker, `aria-current="location"`. Scrollspy: the chrome's `useScrollspy` (Phase 1), band `-20% 0px -60% 0px`, topmost chapter wins, the last one kept between chapters. A click scrolls the chapter to 112 px (smooth, a jump under reduced motion), replaces the hash without a new history entry, marks it at once and moves focus to the chapter; a modified click is left to the browser. Under 1100 px: a closed `details` "On this page" after the meta row with the same list, which closes when a link is followed. The links are plain anchors, so they work without script |
| 5e Chapters | `CaseChapter.tsx`, `FactStrip.tsx`, `PointList.tsx`, `CaseSteps.tsx`, `CaseLayers.tsx` | `section#ch-NN`, each revealed (`Reveal`, rise 24): the kicker (pixel mark, number, slash, title in mono), which is the chapter's h2 while no headline is cleared, named by its title; prose at 17 px / 1.7, max 64ch, ink 80; 80 to 128 px between chapters with a hairline and 36 px above each. Projects: The problem (prose, then Before and After as a fact strip where the copy names both), What it does (the highlights after pixel bullets, then the showcase), How it works (the workflow's steps as numbered cards under its name), Architecture (each layer a row, its parts as chips with their notes), the remaining sections, Tech stack (chips). Ventures: What it is (prose and its categories), Where it stands (prose and, for GoGoCash, the core loop as steps), the other sections, Related topics (links and "All topics") |
| 5f Showcase | `ShowcaseGrid.tsx`, `ShowcaseTile.tsx`, `ShowcaseArt.tsx`, `useFlowStep.ts`, `CaseLightbox.tsx`, `lightboxMotion.ts` | Tiles drawn from the case's data (spec 15.7): the workflow, its steps checked off in turn every 1.2 s once hydrated with motion allowed (a 44 px pause control, 30 px under 640; still, all steps done, in the server HTML and under reduced motion), and the architecture's layers with each part a bar; a registered gallery screenshot comes first. Two drawings sit side by side (square), one alone takes the full width (16:10). Captions start with "Illustration", then the title and the steps' or layers' names. "Enlarge" (from 810 px, shown on hover, focus or touch screens) or a press on the tile opens a native modal `<dialog>` labelled by the title: a veil with a 20 px blur, its own copy of the picture grown from the tile's place (a FLIP with the Web Animations API, 560 ms in, 420 ms out; a 200 ms fade in and 160 ms fade out under reduced motion), the caption, close and pause buttons. Escape (the cancel event), the close button or a press on the empty stage closes it; wheel, touch and scroll keys do nothing while it is open; focus lands on pause (or close) and returns to Enlarge; the page's tile steps aside while it is open |
| 5g End of page | `HiringPanel.tsx`, `MoreProjects.tsx` | `article "Hiring"` at the end of the column: the kicker, "Want work like this on your team?", the availability sentence, a ghost pill "Résumé" (`/resume`) and a dark pill "Contact" (`/contact?topic=hiring`). Then "More projects": the next two projects in list order, wrapping (a venture shows the other venture and the first featured project) as lift cards: a 16:10 mat (the screenshot, or the drawing on the case's material with the "Illustration" chip), mono meta, 22 px title, the tagline, a small "Read the case study" pill whose link covers the card and is named "Read the case study: {name}"; the picture scales 1.03 on hover and the mat .985 on press; focus shows on the mat. "All projects" to `/portfolio` |
| 5h SEO on the preview | `caseJsonLd.ts`; the two routes | Each preview page renders the live page's JSON-LD, from the same builders with the same input and the live addresses (BreadcrumbList and CreativeWork; SoftwareApplication with its Offer and BreadcrumbList), in the same order; a browser check compares them script for script with the live pages. The pages stay noindex and nofollow; live pages, Markdown twins and share images are untouched |
| Routes | `src/routes/preview/portfolio/$slug.tsx`, `src/routes/preview/ventures/$slug.tsx`, `src/routeTree.gen.ts` (regenerated by the build) | The head (title, description, noindex) is built in the loader, so the content modules stay in the loader's chunk and out of the entry chunk; an unknown slug, or a venture without a case study, is a 404 |
| Stylesheet | `src/styles/profile/case.css` | Every rule in `@layer components`, plain CSS on tokens, rem breakpoints (600, 640, 720, 810, 1024, 1100 px); movement only under `prefers-reduced-motion: no-preference`; forced colours (system borders on every ringed part, the sky hidden), more contrast and reduced transparency for the viewer's veil and caption. No keyframes and no token added to `globals.css` |
| 5i Tests | see section 3 | |

Shared files, smallest edits: `tests/e2e/routes.ts` (four `PREVIEW_ROUTES`
entries: the cases plan gate 7 baselines); `components/landing/portfolio/PortfolioMockup.tsx`
(the `floor` label mode) and its test; `lib/content/ventures.ts` and the live
venture route (the related topics, moved). `PreviewHome.tsx`,
`SystemPreview.tsx`, `globals.css`, the other phases' partials and the
umbrella plan are unchanged.

## 3. Gates

| # | Command | Result |
| --- | --- | --- |
| 1 | `pnpm typecheck` | pass |
| 1 | `pnpm lint` (`--max-warnings=0`) | pass, 0 warnings |
| 1 | `pnpm format:check` | pass (touched files formatted with `prettier --write`) |
| 1 | `pnpm knip` | pass |
| 1 | `pnpm test` | 153 files, 1,468 tests pass (76 new: the view model 35, the page 24, the showcase and viewer 13, the JSON-LD 2, `PortfolioMockup` 2) |
| 1 | `pnpm build` | pass (the Sanity schema deploy skips without `SANITY_AUTH_TOKEN`); `src/routeTree.gen.ts` regenerated |
| 1 | `pnpm perf:budget` | pass: entry chunk 105.8 / 120 KB; worst route 191.8 / 200 KB (`/skills/code-review`); stylesheets 20.2 / 22 KB; preloaded fonts 51.2 / 56 KB |
| 1 | Preview weight, by hand (previews are not prerendered, so `perf:budget` does not see them) | each case page 180.5 KB JS gzip (200 KB budget), 31.6 KB CSS gzip; `profile.css` 57.8 KB raw, 11.7 KB gzip (the case partial about 5.8 KB gzip of it) |
| 2 to 6 | Browser gate: `PORT=3105 PLAYWRIGHT_WEB_SERVER="pnpm start" pnpm exec playwright test smoke.spec.ts a11y.spec.ts tests/e2e/profile --project=desktop --project=mobile --project=fold-closed --project=fold-open --project=tablet-landscape --project=webkit-phone --grep-invert "matches its baseline" --workers=2` | 685 passed, 598 skipped by project scope, 9 failed, in 35.2 minutes, with the machine's load average between 30 and 76 (Spotlight indexing and other work besides this lane). The 9 failures were 30 s timeouts in `page.evaluate` and `setViewportSize` in Phase 1 and 2 checks on `/preview` (`profile-hero.spec.ts` 4, `profile-shell.spec.ts` 4), and the known "Contact leaves no empty cell" smoke flake on mobile. None was in this phase's checks |
| 2 to 6 | The same command with `--last-failed --workers=1` | the 9 pass (23.5 s) |
| 2 to 6 | This phase's checks inside that run | `profile-case.spec.ts`: 54 in desktop Chromium, plus axe on mobile, the rail on tablet-landscape, and rendering, the disclosure and a chapter address in the WebKit phone; the four new `PREVIEW_ROUTES` in smoke (8), axe with `wcag22aa` in both themes (16) and the `profile.spec.ts` fit check on six projects in both themes (48). All passed |
| 7 | Parity: `GATES_PORT=4305 node scripts/start-gates.mjs --parity-only` | 137 URLs compared, 0 with differences. The crawl found 138: the extra one is `/assets/icons-DHZn0pRF.js`, a JS chunk the crawler's metadata pattern takes for an icon by its name (deviation 21) |
| 4 | LCP: `BASE=http://127.0.0.1:3105 pnpm probe` on the site, intranet and GoGoCash cases (throttled phone profile, a loaded machine) | LCP element: the lead paragraph on all three; CLS 0.000; no text under 12 px, no target under 24 px |

What `profile-case.spec.ts` covers:

- Gate 2: all seven case pages answer 200 with their h1, the profile scope,
  noindex and no JS errors; an unknown slug is a 404; every case link on
  `/preview` (the canvas mock's frames and the work stack's cards) resolves
  to a page with an h1; every More projects link goes to another case.
- Gate 3: on the four projects with evidence, at 1440 x 900 Outcome and My
  part are full rows above Interface, each under 260 px, ending within 1,350
  px; at 800, 375 and 320 px they stack and nothing scrolls sideways; the
  longest figures ("10 people to 1 operator", "THB 169,000", "THB 13
  million") stay inside a 375 and a 320 px screen; GoGoCash's totals carry
  "As of October 2026" in their `dl > div`, and every count of registered
  users reads 1,000.
- Gate 4: scrolling marks the chapter in the rail (one current item); a rail
  click lands the chapter at 112 px within 3 px, below the bar, replaces the
  hash without a history entry, marks it and focuses it, with motion and
  without; under 1100 px the closed disclosure opens, lands a chapter and
  closes; a chapter address lands at 112 px.
- Gate 5: Enlarge by keyboard opens the dialog with focus on pause, the page
  tile hidden; PageDown, ArrowDown, End and the wheel leave the page where it
  was; Escape closes it and focus returns to Enlarge; the close button and a
  press beside the tile close it; the tile grows with a transform and, under
  reduced motion, only fades (read from its running animations); a reduced
  motion page has a still workflow and no pause control.
- Gate 6 and spec 10.1: at 344, 390, 820, 882, 1180 and 1440 px no sideways
  scroll, the meta row in 2 or 4 columns, the steps in 1 or 2 columns, the
  rail from 1100 px and the disclosure under it; at 320, 344 and 390 px every
  target 24 px or more, none overlapping or covered; the share panel fits a
  320 px screen and Escape returns focus to Share; axe with `wcag22aa` on the
  three cases `routes.ts` does not list, in both themes.
- Best practices (desktop Chromium): forced colours (every ringed part keeps
  a system-colour edge, pixel art hides), text spacing clips no text, 200 %
  zoom (720 x 450) keeps the h1 at 42 px with no sideways scroll, requests
  stay on the site, and the JSON-LD equals the live page's, script for
  script, on four cases.

## 4. Visual baselines (not rendered here)

- New, `visual.spec.ts` (through `PREVIEW_ROUTES`): `preview-case-intranet`,
  `preview-case-agents`, `preview-case-site` and `preview-case-gogocash`, light
  and dark, mobile and desktop (16 full-page PNGs; plan gate 7).
- New, `profile-case.spec.ts`: `preview-case-{light,dark}` on the three matrix
  projects (fold-closed 344, fold-open 882, tablet-landscape 1180): 6
  full-page PNGs of the intranet case (the umbrella's anchors for one case
  page).
- Unchanged: all 96 live baselines; no snapshot file changed in this tree.
- Reviewed by eye in scratch screenshots (not committed), against spec 9, 10,
  10.1 and 11: 1440 x 900 (light and dark, the hero, the cover, the
  chapters with the rail, the showcase, the steps and layers, the Hiring
  panel and More projects), the viewer open (dark), 882, 390 and 344 px.

## 5. Deviations, with reasons

1. **Share is the reused `SharePill`**, as the lane prompt asks, not spec 13
   item 27's ghost `sm` pill opening a Say-hello-shaped popover. The row
   provides the bento chrome's state and draws the same `SharePanel` (the
   share rows of the live pages) under itself, aligned to the row's start;
   Escape returns focus to the pill and a press outside the row closes it.
   The pill keeps its own sizes (56 px, a 56 px round icon under 640 px).
2. **The external link is a 52 px ghost pill** (`lg`), not spec 9.2's 36 px
   `sm`, so it sits level with the 56 px Share pill. Its up-right arrow moves
   `translate(3px, -3px)` on hover; the name carries "(opens in a new tab)".
3. **The hero's small text is ink 80**, not ink 60 (spec 9.2): the back link,
   the eyebrow, the lead and the byline sit on the pixel sky, where ink 60
   falls near 4:1 on its densest lavender pixels. The tagline (24 px and up,
   3:1 needed) stays ink 60. The sky also uses the two lightest lavenders
   (`--tint-3`, `--tint-2`) after peach, not the field's default `--tint-4`,
   so the eyebrow and the h1 sit on a calmer field.
4. **Outcome figures in the serif at 30 to 36 px**, each over its label, not
   spec 9.3's 17 px fact-strip text: spec 10.1 has "the Outcome figures drop
   to 30 px" under 370 px, and the owner-approved canvas draws them at 36 px.
   The rows are a 200 px heading column and the content from 810 px, as the
   canvas draws them; each stays under 260 px.
5. **A venture's figures are named "Venture metrics"** (the label /proof
   gives the same figures). Spec 9.3 places them without naming their row.
6. **Back links follow spec 9.2**, "All projects" to `/portfolio` and
   "Ventures" to `/preview#ventures` (the profile base's Home, `/#ventures`
   at cutover), not plan step 5b's "All work".
7. **The eyebrow is the category and the period** (spec 9.2 and 15.7), not
   plan step 5a's "category and discipline"; a venture's is "Venture" and its
   timeline.
8. **No chapter headlines.** They are owner input (spec 15.7) and none is
   cleared, so the kicker is each chapter's h2, named by its title (spec 9.7).
   The model keeps an optional `headline`, which the template draws as the
   plan's `t-h3` line (max 26ch) under the kicker once the owner gives one.
9. **The showcase draws the workflow and the architecture**, the two
   pictures spec 15.7 derives captions for, in "What it does"; their details
   stay in the How it works and Architecture chapters. The interface is the
   cover only (spec 9.4: not clickable, no zoom), so it is not repeated as a
   tile.
10. **A drawn cover and a More projects mat wear the case's Home-card
    material** (spec 2.4: the case's card on the Home stack, the next free
    hue for a project the stack leaves out), not spec 9.4's and 9.12's plain
    paper-2, which stays behind a screenshot. The owner-approved canvas draws
    the cover on a material, and the case keeps its colour from Home to page.
11. **`PortfolioMockup` gained `labels="floor"`** (research above). The live
    output is unchanged: the default and bars output are hash-tested, and
    parity reports 0 differences.
12. **Enlarge is named "Enlarge: {title}"**, not "Enlarge" alone (spec 9.9),
    so the buttons of two tiles differ for a screen-reader user.
13. **A contents link moves focus to its chapter** (a section with
    `tabindex="-1"` and no focus ring), so the next Tab continues there. A
    chapter still waiting to be revealed finishes its rise first, so it
    lands at 112 px, not 24 px above.
14. **The byline stays** ("By Kunanon Jarat · {role}", the name linked with
    `rel="author"` to `/about`): the live project pages print it for search,
    and spec 9.2 does not list it.
15. **Four live-page parts are carried another way.** A venture's "Also
    building" card becomes its More projects card (spec 9.12: name, timeline,
    tagline and a link to its case; the other venture's site link stays on
    its own case page). The venture Share card becomes the hero's Share pill
    (the same rows). The venture hero's Contact link becomes the Hiring
    panel's Contact (`/contact?topic=hiring`), which ventures now show too
    (spec 9.11: recommended). The venture "My role" card's footer (his
    portrait, his name and "About →") becomes the hero's byline, as on a
    project: "By Kunanon Jarat · Founder", the name linked to `/about` with
    `rel="author"`, the role read from `ventures.ts` (review finding 5). The
    portrait is not carried: the template has no place for it.
16. **The related topics moved** to `lib/content/ventures.ts`
    (`VENTURE_RELATED_TOPICS`): the live route file held them, and the brief
    keeps content in `lib/content/`, read and never retyped. The live route
    imports them; its output is unchanged.
17. **More projects' call to action is "Read the case study"** (plan step
    5g and Phase 3's card), not spec 9.12's "View project".
18. **One registered width for the one screenshot cover.** Only
    `kunanonj-com` has a real cover, a capture of today's Home that is
    re-shot after cutover (spec 15.7), so its `srcset` lists the one width it
    has; the two or three widths of plan step 5b come with the new capture.
19. **The viewer's close and pause buttons are the theme's ghost pills**,
    not a fixed white: they stay legible on the veil in both themes. Its
    caption is white at 68 % in both themes, as spec 9.10 sets.
20. **Matrix baselines for one case** (the intranet) in `profile-case.spec.ts`;
    `PREVIEW_ROUTES` lists the four cases plan gate 7 names, and the spec
    covers all seven (render, the evidence rule, axe on the other three).
21. **The live pages' chunks are split differently**, with no change to what
    they render. The preview case route imports modules the live pages share
    (`SharePill` and `SharePanel` bring `components/bento/icons.tsx`,
    `classes.ts` and `lib/utils/clipboard.ts`; the content modules bring
    `resumeTimeline.fallback.ts`), so the build now emits those four as their
    own chunks. Home preloads 32 module chunks instead of 28 (the same code);
    its entry chunk is 1.0 KB gzip smaller than in the Phase 3 build of the
    orchestrator's checkout. Parity holds (0 differences); the crawl counts
    one more URL because the `icons` chunk's name matches its icon pattern.
    **Accepted (review nit):** loading the preview's share panel on demand
    would not keep the live chunks as they were. The bundler gives a module
    reached from two chunks that load on demand (the live layout's and the
    preview route's) a chunk of its own, whether the preview reaches it by a
    static import or by a further dynamic one, so the four chunks stay split
    either way. Only a manual chunk rule could undo it, and that would
    reshape the live build for a preview that Phase 6 deletes.

## 6. Owner inputs used and their defaults

| Input | Default used | Where |
| --- | --- | --- |
| R10 screenshots | Code-drawn illustrations, labelled, where no screenshot is registered; the one registered cover (`kunanonj-com`) is shown as a screenshot | `caseStudy.ts`, `CaseMedia.tsx`, `ShowcaseArt.tsx` |
| R12 case h1 | Today's text kept: "{name}. {tagline}" and "{name} {tagline}", the tagline a smaller line inside the h1 | `CaseHero.tsx`; checked against the parity reference |
| R13 recruiter-fit Phase 4 | Deferred: today's content and facts, nothing dropped | every mapper reads the content modules |
| R2 share | The hero's Share pill stays on case pages | `CaseActions.tsx` |

## 7. Draft copy awaiting approval

Marked DRAFT in `lib/content/caseStudy.ts`. No figure is typed in any.

- Cover caption: "Illustration, not real data." (spec 9.4's default, the live
  caption's honesty wording)
- Contents label: "On this page"
- Viewer buttons: "Enlarge" (named "Enlarge: {title}"), "Close"
- Status words no venture uses yet: "Acquired", "Shut down", "Paused" ("Live"
  is the live pages' word)
- Accessible names composed from content, now patterns in `caseCopy.art`,
  each marked DRAFT (review finding 10): "Illustration of {workflow
  title}: {steps}", "Illustration of the architecture: {layers}",
  "Illustration of {venture}: {stages}". "Illustrative mockup of {name}" is
  the live project cards' wording, not new.

Reused, not new: "Read the case study", "Venture", "Pause the animation" and
"Play the animation" (Phase 3's drafts in `homeWorkAbout.ts`); "Illustration"
(owner decision 4); "Venture metrics" (/proof); the live case pages' labels
("Outcome", "My part", "Interface", "As stated in the résumé →", "What it
does", "How it works", "Architecture", "Tech stack", "Related topics", "All
topics", "The core loop", "Before", "After", "All projects", "Ventures",
"More projects", the Hiring panel's lines).

## 8. Open items

1. **Visual baselines (orchestrator):** the 16 `visual.spec.ts` PNGs and the
   6 `profile-case.spec.ts` matrix PNGs (section 4).
2. **Owner approval** of the drafts (section 7), and of chapter headlines if
   he wants them (deviation 8).
3. **Real screenshots** (R10, issue #44) and the site cover's re-shoot after
   cutover, with two or three widths each (deviation 18).
4. **Preview stylesheet weight:** `profile.css` is 11.7 KB gzip now (the
   case partial about 5.8 KB of it); a preview page loads 31.6 KB of CSS gzip.
   `perf:budget` covers prerendered pages only; Phase 6 removes the split.
5. **Phase 6 cutover:** swap the bodies of `/portfolio/<slug>` and
   `/ventures/<slug>` for `CasePage`, keep their heads and JSON-LD, delete
   the preview routes. `profile-case.spec.ts` mirrors the live smoke checks
   of case pages (the evidence rule, the Hiring links, the dated totals, the
   user count, the longest figures at 375 and 320 px), so those smoke tests
   should pass on the template unchanged.
6. **Spec updates to record:** deviations 2 to 5, 9, 10 and 12 to 14.
7. **Merge notes:** `caseStudy.ts` reads Phase 3's `homeWorkAbout.ts`
   (`STACK_ENTRIES`, `workCopy`, `aboutCopy`) and `lib/landing/stackCards.ts`
   (`materialHue`); `PortfolioMockup` has a third label mode; `routes.ts` has
   four new entries; `src/routeTree.gen.ts` regenerates with the build.
8. **Firefox** is not installed here and was not run.
9. **Umbrella status** for Phase 5 (the orchestrator updates the phase
   table).

## 9. Code review and fixes (18-11-26)

A fix pass on this phase's review, together with the Phase 4 review and the
router's scroll restoration (Phase 4 report, section 9), in the worktree
`t3-d8574179-f1f03c6bbcb3dbc5` on the local branch
`fix/profile-case-review-findings`, from `02de7bf` (Phases 2 and 3 with their
fixes, Phases 4 and 5, and one test fix). Lane settings: `PORT=3106`,
`GATES_PORT=4306`, Playwright `--workers=2`. One local commit; nothing
pushed, merged or deployed.

| # | Finding | Fix | Test |
| --- | --- | --- | --- |
| 1 | Medium. The cover's labelled drawing showed from 810 px, but the picture stays under 640 px wide up to a screen of about 892 px, so its 12-unit labels drew at 10.9 to 11.9 px; the floor check read the declared SVG size | The drawing is chosen by the picture's own width: `@container (min-width: 40rem)` on `.pf-case-art`, already an inline-size container; the viewport rule is gone | `profile-case.spec.ts`: at 820 and 882 px the cover writes no label (bars); at 900, 1024 and 1440 px it does, and every visible `text` renders at 12 px or more (`fontSize` times its `getScreenCTM()` scale). `profile.spec.ts`'s floor check multiplies SVG text by its drawn scale, with a fixture it must fail (a 12-unit label 580 px wide reads 10.9 px) |
| 2 | Medium. The share panel stayed open when keyboard focus left it and covered "As stated in the résumé →" under 810 px (WCAG 2.4.11) | The row closes the panel on `focusout` to a target outside it and leaves focus where it went; focus going nowhere (another window, the share sheet) keeps it open | Unit: blur inside the row, to nowhere, and to the link under it. Browser at 720 x 900: Tab out of the panel; it is hidden, focus is on the résumé link, and `elementFromPoint` at the link's centre lands in it |
| 3 | Medium. The previews took the Home's canonical and Open Graph tags, so Share copied `https://kunanonj.com/` | `src/lib/caseHead.ts` builds a case page's head as the live routes do (the same builders and input); the previews call it with `hidden`, which changes only `robots`. The live route files are untouched, so live HTML and chunks are as they were | Unit `caseHead.test.ts`, all five projects and both ventures: the helper equals the live route's own loader head, and the preview loader's head equals it but for robots, with canonical, og:url and og:image naming the live page. Browser: canonical, og:url, og:image and description of the intranet and GoGoCash previews equal the live pages' (one canonical each), and the Share copy row reads `kunanonj.com/portfolio/tbh-intranet` |
| 4 | Low. A case opened from More projects kept the last case's rail mark, pause and reveal state | `<CasePage key={slug} …/>` in both preview routes | Browser (desktop, tablet-landscape): scroll to ch-04, open the first card: no `[aria-current="location"]` in the rail |
| 5 | Low. Venture pages lost the live "My role" footer | Ventures get the byline, "By Kunanon Jarat · Founder", the name to `/about` with `rel="author"`, the role read from `ventures.ts` (deviation 15) | Unit: both ventures render that link, its rel and the line's text |
| 6 | Low. In forced colours the rail's current item was not underlined | `.pf-case-toc__link[aria-current] { text-decoration-line: underline }` in the forced-colours block | Browser: the current rail link reads `none` in ordinary colours and `underline` in forced colours |
| 7 | Low. The viewer's large picture showed a zoom-in cursor from 810 px | `.pf-lightbox .pf-lightbox__tile { cursor: default }` | Browser: the page's tile reads `zoom-in`, the viewer's `default` |
| 8 | Low. Focus fell to the page on close when the screen narrowed under 810 px while the viewer was open (Enlarge is `display: none` there) | Focus returns to Enlarge when it is drawn (`checkVisibility()`, else its display), else to the tile's figure (`tabIndex={-1}`, never a tab stop) | Unit: Enlarge set to `display: none`, Escape: the figure has focus. Browser: open at 1024, resize to 700, Escape: the figure "Architecture" has focus, not `body` |
| 9 | Low. The viewer blocked zoom | `isZoomGesture()`: a `wheel` with `ctrlKey`, or a `touchmove` with two touches or more, is not cancelled | Unit: one-finger touch and a plain wheel are cancelled; two fingers and a ctrl-wheel are not |
| 10 | Low. Three generated accessible names were drafts without the marker | Patterns in `caseCopy.art`, each `// DRAFT` (section 7) | The existing unit tests read the same names |
| 11 | Low, test. The viewer's keyboard test used no keyboard | The rail's "What it does" by Enter (focus moves to the chapter), then Tab to Enlarge; `opacity: 1` asserted; `force: true` dropped from the click test | itself |
| 12 | Low, test. Fixed sleeps | 300 ms: `settle(page)`. 30 ms: an init script wraps `Element.prototype.animate` and records the viewer tile's keyframes as they start. 1,500 ms: `page.clock` runs three 1.2 s ticks, with a motion-allowed control that moves a step | itself |
| 13 | Low, test. The evidence test skipped Outcome when it was missing | Outcome counts: 1 on the intranet and ai-automation cases, 0 on the other two | itself |
| 14 | Low, test. Every check ran under reduced motion | One pass per case with motion allowed, at 390 px where the pause control is 30 px: every target 24 px or more, apart and uncovered, then axe with WCAG 2.2 | itself |
| 15 | Low, test. The text-spacing check could not see text a tile clips | Each run of text is measured against its nearest clipping box on each axis (itself included), skipping 1 px visually hidden text; it runs at 1440, 600 and 390 px, with a fixture it must fail | itself. It found a real clip, which is fixed: at a 600 px screen a More projects venture card drew its logo and its loop's names 35 px past its 16:10 mat, with or without text spacing. Under 22rem of card picture the card draws the logo alone (a container query on `.pf-case-art`; the mat is decorative and the card's title says the same) |

Nits:

- `caseJsonLd.ts`: "its breadcrumb, then the work", the order the code and
  the live route use.
- The back link and the related topics take ink on hover again: the hover
  rule now outranks the ink 80 override.
- The disclosure's marks: `content: "+" / ""` and `"\2212" / ""`, each after
  a plain `content` fallback (both kept by the minifier).
- Deviation 21: recorded as accepted (section 5).

Baselines these fixes change (not rendered here; the orchestrator renders
them): every `preview-case-gogocash` image (the venture byline in the hero;
at phone and fold widths the Manut card in More projects draws its logo
alone) and the 882 px matrix image of the intranet case (`fold-open`: the
cover now draws bars, its picture being under 640 px wide). No live baseline
changes.

### Gates of the fix pass (final tree)

| # | Command | Result |
| --- | --- | --- |
| 1 | `pnpm typecheck` | pass |
| 2 | `pnpm lint` | pass, 0 warnings |
| 3 | `pnpm exec prettier --write` (touched files), `pnpm format:check` | pass |
| 4 | `pnpm knip` | pass |
| 5 | `pnpm test` | 164 files, 1,566 tests pass (26 new across both phases and the router) |
| 6 | `pnpm build` | pass, twice: the second after the stronger text-spacing check found the venture card's clip (finding 15, a CSS fix). Every browser check and parity below ran on the second build |
| 7 | `pnpm perf:budget` | pass: entry chunk 106.6 / 120 KB; worst route 192.2 / 200 KB (`/skills/code-review`); stylesheets 20.2 / 22 KB; preloaded fonts 51.2 / 56 KB |
| 8 | `PORT=3106 PLAYWRIGHT_WEB_SERVER="pnpm start" pnpm exec playwright test smoke.spec.ts a11y.spec.ts tests/e2e/profile --project=desktop --project=mobile --project=fold-closed --project=fold-open --project=tablet-landscape --project=webkit-phone --grep-invert "matches its baseline" --workers=2` | 768 passed, 5 failed, 861 skipped by project scope (7.4 min; another lane was testing on the machine). The 5 were the new motion-allowed tap and axe pass (finding 14): its tap check ended with a `scrollTo(0, 0)` that is smooth with motion allowed, so axe read the bar mid fade-in (3.1:1 and 1.9:1). The check now scrolls at once and lets the page settle first. Then that pass for all seven cases, twice each: 14 passed; and `profile-case.spec.ts` on all six projects: 94 passed, 0 failed. Everything else in the gate passed, the live smoke tests included |
| 9 | `GATES_PORT=4306 node scripts/start-gates.mjs --parity-only` | 137 URLs compared, 0 with differences (138 crawled: the extra is the `icons` chunk, deviation 21) |

Firefox is not installed here and was not run.
