# Phase 2 report: Home hero and logo strip

**Plan:** `../completed/phase-2_home-hero_PLAN_18-11-26.md`
**Date:** 18-11-26. Parallel lane in its own worktree, branch
`feat/profile-home-hero-logo-strip`, started at `33d84b5` (Phases 0 and 1
committed). One local commit (amended once to record the final gate runs);
nothing pushed, merged or deployed.
**Lane settings:** `PORT=3102`, `GATES_PORT=4302`, Playwright `--workers=2`.
**Tree:** sha256 of the sorted changed and new code files (24 files), excluding this report and the plan: `472a5efbc94ca276`.
**Harness:** `.claude/agents/`, `.claude/skills/` and `process/context/` are
missing; the phase ran from the shared brief under the Harness-Absent
Fallback.
**Status:** CODE DONE (18-11-26), reviewed and fixed (section 9). Linux
visual baselines are not rendered here (the orchestrator batches them; open
item 1).

## 1. Research answers (the plan's "Research first")

- **How `IntroLoader` ends:** it renders nothing on the server, starts after
  hydration (`requestAnimationFrame`) when `sessionStorage["fronk-intro-seen"]`
  is not `"1"` and motion is allowed, and starts its 700 ms exit at 4,500 ms
  (or at once on a key, click, tap, scroll or Skip). It marks the session seen
  when the exit starts. It is mounted only on the live Home route
  (`src/routes/_landing/index.tsx`).
- **Covers and mockups at 186 x 127 px:** none of the three featured projects
  (`FEATURED_PORTFOLIO_SLUGS`: TBH Intranet, AI Automation, Node Validator
  Automation) registers a `cover`. Their `PortfolioMockup` drawings are
  640 x 400 SVGs with 11 to 13 px labels, which would render at about 3.5 px in
  a 186 px frame, under the 12 px floor (spec 8.2 and 12 item 5). The frames
  therefore draw textless screens of each mockup kind (deviation 3); a cover,
  once registered, shows as an image instead.
- **The dual-screen layout can be tested:** Chromium matches
  `(horizontal-viewport-segments: 2)` only with the DevTools device-metrics
  override carrying a `displayFeature` (the display-features override alone
  does not); the browser check uses it.

## 2. What was built (by plan step)

| Step | Files | What |
| --- | --- | --- |
| 2a Stage | `components/profile/home/Hero.tsx`, `src/styles/profile/home-hero.css` | `section.pf-hero[aria-labelledby="hero-title"]` under the floating bar (the page's top padding is removed for it). Sheet inset 10 px (12 px from 810), radius 28 28 36 36, `--sunset`, a dither sky band (`DitherField`, peach to violet tints, masked downward). Copy grid: one column on phones, copy (max 680 px) over the full canvas (max 760 px) from 810, `6fr / 6fr` with gap 28 x 56 from 1180, the hinge as the gap on a spanned dual screen. From 810 the stage is sticky with `min-height: var(--screen)`; its offset is `min(0px, 100svh - its height)`, measured by a ResizeObserver, so a stage taller than the screen scrolls until its last line shows, then holds (before the script measures it, and without script, the fallback height of 100000 px keeps it from sticking; the first fallback, 200svh, did stick, see section 9). The sections after it get `position: relative; z-index: 1; background: var(--paper)` (spec 8.0), so they slide over it. Keyboard focus inside the stage (`.pf-hero:has(:focus-visible)`) unsticks it, so the browser scrolls a focused control into view where it really is (WCAG 2.4.11); this replaced a script that scrolled back by the covered amount. |
| 2b Headline | `components/profile/home/Headline.tsx` | `h1#hero-title.t-hero` with `aria-label` = the live Home's sentence; line 1 and line 2 are `aria-hidden` block spans with a literal space between them, so the parity gate reads "Hi, I’m Kunanon Jarat. Forward deployed AI engineering from Bangkok." (tested against the parity reference). Line 2 is a grid cell holding the phrase, the line leaving (`kj-line-out`, removed when its animation ends) and, with two or more phrases, every phrase unseen so the height never changes: empty `aria-hidden` spans whose `data-text` CSS draws (`::before { content: attr(data-text) }`), rendered on the server and the client whatever the motion setting, so the h1's text is only what shows. With two or more phrases and motion allowed it swaps every 4,200 ms once the hero can be seen; it holds while the pointer is on the line, while keyboard focus (`:focus-visible`) is inside the hero and not on the motion toggle, while the hero's toggle is paused, while the tab is hidden and while the h1 is off screen. New words stamp in (`kj-word-text`, `kj-word-mark`, `kj-word-drift`; 70 ms stagger from word 4, sides alternating). The first render is static; the h1 never animates. Size: `t-hero` (42 px floor), `clamp(3rem, 5.4vw + 0.625rem, 4.5rem)` from 810 to 1179 (spec 10.1), max 12em. |
| 2c Chips, lead, buttons | `Hero.tsx` | Badge "Open to roles" and chip "Bangkok or remote" (`OPEN_TO_ROLES`, a hidden comma between them for screen readers); lead `hero.homeLead` in `--ink-80` (16 px / 1.55 on phones, `t-lead` from 810); dark pill "Contact me" with the swap arrow (`/contact`) and ghost pill "Résumé" (`/resume`), both `size="hero"` (44 px). |
| 2d Canvas mock | `components/profile/home/CanvasMock.tsx` | A `role="group"` named "Featured projects" holding a `ul` of three frame links named "{name}: open the case study", to `/preview/portfolio/<slug>` (from `PROFILE_BASE`). Window bar (three dots, "Kunanon / Selected work", a decorative Share chip), dotted canvas, Layers panel, inspector (Design and Prototype tabs, the name, Area, Period, and "Open project", a pointer-only span that clicks the selected frame's link; nothing inside `aria-hidden` takes focus), comment bubble ("K", "Kunanon · just now", a cleared operating principle), a named cursor "Kunanon", a five-tool toolbar: all `aria-hidden`. Each frame: a one-line name row above, the picture (textless drawing on the project's card material, spec 2.4 hues 253, 79, 292), and beside the link an `aria-hidden` overlay with the "Illustration" chip and, on the selected frame, the discipline badge. Hover or focus selects a frame: selection box and handles, the Layers row and the inspector follow. Once the hero can be seen the cursor visits frames 3, 2 and 1 at 0.9, 2.1 and 3.3 s and rests (under 5 s, so no pause control); a reader's own choice stops it for good, and so does a pause on the hero's motion toggle; none under reduced motion or on phones. Under 810 the panels, comment, cursor and toolbar go and the frames become a scroll-snap row (67 % wide, 58 % from 600) with a pager of three buttons "Show {name}" (26 px hit areas, dots inside, the current one `aria-current="true"`, a polite announcement "{name}, n of 3" after a press; hidden but kept in place when scripting is off). |
| 2e Logo strip | `components/profile/home/LogoStrip.tsx`, `components/ds/Marquee.tsx` | Centred `t-meta` eyebrow "Where I’ve worked", then the `Marquee` primitive (moves only after hydration and with its pause control; second copy `aria-hidden`; still, centred wrap under reduced motion) with the nine names as Onest 600 20 px wordmarks in `--ink-60`. Paused on hover (fine pointers). The Marquee gained an optional controlled state (`playing`, `onPlayingChange`, with a test), so the hero owns one play state: its toggle pauses the strip and holds the headline. |
| 2f Entrance and intro | `lib/motion/introSignal.ts`, `components/profile/home/IntroGate.tsx`, `components/landing/IntroLoader.tsx` (two calls), `home-hero.css` | The hero's server HTML starts with an inline script (TanStack's `ScriptOnce`: server only, with the router's CSP nonce when one is set, and it removes itself, so hydration matches) that sets `html[data-intro="pending"]` when the intro will play (same test as IntroLoader: unseen session, motion allowed). IntroLoader's changes: `markIntroDone()` (sets `data-intro="done"`) when its exit starts, and, since the review, `markIntroPending()` in a layout effect on the same test, so a visit made in the app (where no inline script runs) is marked before paint; timing and markup unchanged. Entrance under `html:not([data-intro="pending"])`, only with `prefers-reduced-motion: no-preference`: chips `kj-fade-up` .7 s at .2 s, canvas `kj-file-in` 1.4 s at .5 s, lead .9 s at 1.1 s, buttons .8 s at 1.3 s, strip .9 s at 1.5 s, all `--ease-expo`; the h1 has none. The rotation clock and the cursor tour wait for `useIntroDone()`. `/preview` mounts `IntroLoader` before the hero, as the live Home route does. |
| 2g Tests | see section 3 | Unit tests for the content module, the signal, the gate, the headline, the canvas mock, the strip, the stage (client and server HTML), the Marquee's controlled state and IntroLoader's signal; browser checks in `tests/e2e/profile-hero.spec.ts`. |

Content: `lib/content/home.ts` reads every line from `lib/content`:
`hero` (`landing.ts`), `OPEN_TO_ROLES` (`availability.ts`), `PERSON_NAME`
(its first name), `portfolioPage.title`,
`getFeaturedPortfolioProjects()`, the résumé's "Currently" and "Experience"
employers (`resumeTimeline.fallback.ts`), the venture names (`ventures.ts`),
and the About page's operating principles. Shared files, smallest edits:
`components/profile/preview/PreviewHome.tsx` (the Phase 2 block and its
imports) and its test, `tests/e2e/routes.ts` (the `/preview` heading pattern).

## 3. Gates

| # | Command | Result |
| --- | --- | --- |
| 1 | `pnpm typecheck` | pass |
| 1 | `pnpm lint` (`--max-warnings=0`) | pass, 0 warnings |
| 1 | `pnpm format:check` | pass (touched files formatted with `prettier --write`) |
| 1 | `pnpm knip` | pass |
| 1 | `pnpm test` | 137 files, 1,308 tests pass (Phase 1: 130 files, 1,267) |
| 1 | `pnpm build` | pass |
| 1 | `pnpm perf:budget` | pass: entry chunk 108.3 / 120 KB (as in Phase 1); `/` 163.7 / 200 KB; stylesheets 20.2 / 22 KB; preloaded fonts 51.2 / 56 KB; worst route 190.0 KB (`/skills/code-review`) |
| 2 | Recruiter facts on `/preview` at 1440 x 900 and 375 x 812 (`profile-hero.spec.ts`, desktop Chromium and the WebKit phone) | pass: the h1 (name = the canonical sentence), "Open to roles", "Contact me" and "Résumé" fully in view |
| 3 | Unit: `Headline.test.tsx`, `Hero.test.tsx`, `Hero.ssr.test.ts`, `IntroGate.test.tsx`, `CanvasMock.test.tsx`, `LogoStrip.test.tsx`, `lib/content/home.test.ts`, `Marquee.test.tsx`, `IntroLoader.test.tsx` | pass: 4.2 s swaps with fake timers; held on hover, focus, the toggle, a pending intro; none with one phrase or reduced motion; the name is the canonical sentence after a swap; the server h1, run through the parity extractor, equals the parity reference's `/` h1; IntroLoader marks `data-intro="done"` at its exit and not before |
| 4 | LCP: `BASE=http://127.0.0.1:3102 pnpm probe / /preview /preview/system`, three runs (throttled phone profile) | `/preview`: LCP element `span`, line 2 of the h1, in every run, 2.7 to 4.1 s; CLS 0.000. `/` (live, unchanged): `span` or `p`, 2.4 to 3.1 s. Lab numbers on a machine shared with the other lane, so noisy. Browser check: the last LCP entry sits in `h1#hero-title`, at opacity 1, and the h1 has no animation |
| 5 | Tap areas at 320, 344 and 390 px in the hero (`profile-hero.spec.ts`): frame links, pager buttons, hero buttons (the marquee toggle is not rendered under reduced motion; 30 px when it is) | pass: none under 24 px, overlapping or covered |
| 6 | Axe, WCAG 2.2 AA, both themes (`a11y.spec.ts` on `/preview`); the canvas mock exposes only its links | pass. The first full run failed `label-content-name-mismatch` on the frame links; fixed (deviation 4). The mock's group holds three named links and nothing else (aria snapshot) |
| 7 | Visual baselines | not rendered here (section 4) |
| 8 | Claim audits (`portfolioOutcomes`, `ventureCase`, `resumeFacts` in `pnpm test`) | pass; `home.test.ts` checks the new copy holds no digit and names only listed organisations |
| 9 | 200% zoom (720 x 450): h1 at 42 px or more, no sideways scroll, no overlapping targets; the profile best-practice checks on `/preview` (forced colours, text spacing, 500% doubling, more contrast, request origins) | pass |
| matrix | 344, 390, 820, 882, 1180 and 1440 px: no sideways scroll, copy in order, canvas beside (from 1180) or below, strip under both; a spanned dual screen (1114 x 720, 34 px hinge at 540, Chromium device-metrics display feature): copy on the left screen, canvas on the right | pass |
| sticky | 820 x 1000: the stage scrolls until its strip is in view and uncovered, then holds while `#work` slides over; a control focused under `#work` scrolls back into the clear | pass |
| intro | First visit: `data-intro="pending"`, no entrance under the overlay; Skip: `done`, the entrance runs. Later visit: entrance at once; reduced motion: none | pass |
| e2e | `PORT=3102 PLAYWRIGHT_WEB_SERVER="pnpm start" pnpm exec playwright test smoke.spec.ts a11y.spec.ts tests/e2e/profile --project=desktop --project=mobile --project=fold-closed --project=fold-open --project=tablet-landscape --project=webkit-phone --grep-invert "matches its baseline" --workers=2` | First full run: 514 passed, 1 failed, 243 skipped by project scope. The failure was Phase 1's stylesheet check (deviation 20); after its fix, `profile-shell.spec.ts` on desktop: 20 of 20 pass. Final run on the committed tree (`e0c1c2e`, same build): 515 passed, 0 failed, 243 skipped by project scope (6.0 min), including axe with WCAG 2.2 on `/preview` in both themes and every `profile-hero.spec.ts` check |
| parity | `GATES_PORT=4302 node scripts/start-gates.mjs --parity-only` | 137 URLs compared, 0 with differences, on the committed tree as before it (the live pages are untouched; `IntroLoader`'s signal changes no server HTML) |

## 4. Visual baselines (not rendered here)

- New: `tests/e2e/profile-hero.spec.ts-snapshots/preview-hero-{1280,390}-{light,dark}-linux.png`
  (the hero section at 1280 x 800 and 390 x 844, reduced motion, so the
  rotation, the marquee and the cursor are still; plan gate 7).
- Changed: `visual.spec.ts` `preview-home-{light,dark}` (mobile and desktop):
  the hero replaces the Phase 1 placeholder block.
- Unchanged: all 96 live baselines; no snapshot file changed in this tree.
- Reviewed by eye in scratch screenshots (not committed) against spec 8.1 to
  8.3, 10, 10.1 and 11: 1440 x 900 and 1280 x 800 (light, dark), 1180 x 820,
  882 x 1104, 820 x 1180, 390 x 844, 375 x 812 and 344 x 882.

## 5. Deviations, with reasons

1. **One motion toggle, beside the strip.** Spec 8.1 puts the hero's toggle
   in the chips row. With R5's default nothing rotates, so the strip is the
   only thing that moves; its toggle sits beside it, where the owner-approved
   canvas has it and where a reader looks. The hero owns the state, so the
   same toggle also holds the headline once alternates ship (plan 2b and 2e:
   "the same hero motion toggle").
2. **Marquee primitive extended** with a controlled play state (spec 6.11 and
   12 item 7: one toggle for the rotation and the marquee). Uncontrolled use is
   unchanged; a test covers the new path.
3. **Frame pictures are textless drawings, not `PortfolioMockup`** (plan 2d):
   its SVG labels would render at about 3.5 px in the frames (spec 8.2, 12 item
   5). A registered `cover` shows as an image.
4. **"Illustration" chip and discipline badge sit over the picture, beside
   the link,** not in the frame's label row (spec 8.2): a 137 to 186 px frame
   has no room for both in one row, and inside the link their text made the
   link's visible label differ from its name (axe `label-content-name-mismatch`,
   WCAG 2.5.3), which the first gate run caught. Both are 12 px on solid fills.
5. **Plan wording over spec where they differ:** link names "{name}: open the
   case study" and the inspector's "Open project" (spec 8.2: "View project");
   breadcrumb "Kunanon / Selected work" (spec 15.2: `site.wordmark`); cursor
   "Kunanon" (spec 8.2 default "You"); the comment is a cleared operating
   principle ("Optimise for reversibility.") with an initial "K" (spec 8.2: the
   portrait and the first outcome); inspector Area and Period (spec 15.2: role
   and category). The plan and the owner-approved canvas agree on each.
6. **Frame links go to `/preview/portfolio/<slug>`** (the lane prompt), not
   `/portfolio/<slug>` (spec 8.2); they follow `PROFILE_BASE`, which Phase 6
   sets to "".
7. **Sticky from 810 px with a measured offset.** The plan says from 810, spec
   8.1 says from 1024 (to keep tall heroes reachable). The measured offset
   keeps every line reachable at any size, so the plan's 810 holds; the focus
   guard covers WCAG 2.4.11. The rule that makes later sections slide over the
   hero (`.pf-hero ~ *`) lives in this partial, because the hero's stickiness
   needs it; Phase 3's sections inherit it.
8. **Panels from 810 px.** Spec 8.2 hides Layers under 1180 and uses the phone
   layout under 1024; spec 10.1 (the later, owner-requested rule) and the
   canvas show the full mock with its panels from 810 and the swipeable row
   under it. This follows 10.1.
9. **Selection swaps in place.** Each frame draws its own selection box and
   handles; spec 5.3's sliding box (.24 s) is not built.
10. **The pre-paint script travels with the hero,** not beside the theme script
    in `__root.tsx` (spec 5.6): no live page's HTML changes before Phase 6,
    and the script reaches `/` with the hero at the cutover. A client-side
    visit (no full load) cannot run it; since the review, IntroLoader marks
    such a visit itself before paint (section 9, finding 1).
11. **Rotation holds while keyboard focus is in the hero** (plan: "paused
    while hovered or focused"; the h1 itself is not focusable). Since the
    review only focus that shows (`:focus-visible`) holds it, and never focus
    on the motion toggle, whose own state decides (section 9, finding 2).
12. **Word-mark hide point** (spec 5.2, not captured): the coral pixel hides at
    70 % of its 500 ms.
13. **Browser checks in `profile-hero.spec.ts`,** not a "preview recruiter
    path" block in `smoke.spec.ts` (brief; Phase 1 did the same).
14. **Nine organisations in the strip** (spec 15.2 says 6 to 8): R6's default,
    "Employers in the résumé plus GoGoCash and Manut AI", is every employer in
    "Currently" and "Experience" (seven) plus the two ventures. The canvas showed
    eight (without The Monk Games). All wordmarks are Onest 600 20 px (spec
    8.3); the canvas's serif and mono variants are not used.
15. **No role chips** (spec 8.1 "one chip per role"): R4's default is the badge
    and the location chip only.
16. **Window dots** use palette tokens (coral, tint-4, tint-3): the profile
    sheets allow no raw hex.
17. **The live Home's route chunk split in two, for the owner to accept.**
    `IntroLoader` and the résumé data are now imported by both the live Home
    and the preview, so the bundler moved them into a shared chunk
    (`resumeTimeline.fallback-*.js`, 5.3 KB gzip in the review build): `/`
    loads 7.80 KB gzip in two chunks instead of 7.20 KB in one (+0.6 KB, one
    more modulepreload), and the entry chunk grew 0.08 KB gzip (108.3 / 120 KB
    either way). The parity gate drops asset links by design; rendering and
    baselines are unchanged. It goes with the previews in Phase 6. The review
    asked for it to stand here as a deviation the owner accepts or declines
    (section 9, finding 9).
18. **The "Design system preview" link** on `/preview` went with the Phase 1
    placeholder block; `/preview/system` is reachable by URL.
19. **LCP element name.** The probe names `span`: the h1's lines are block
    spans, so the browser reports the larger line (line 2), as it does on the
    live Home, whose h1 is built the same way. The browser check asserts the
    LCP element sits in `h1#hero-title` at opacity 1.
20. **A Phase 1 browser check narrowed to stylesheets.** "The preview's
    stylesheet is linked on /preview only" counted every link to an asset
    named `profile*`. `lib/content/home.ts` reads `PROFILE_BASE` from
    `profileChrome.ts`, so that module now has its own script chunk
    (`profileChrome-*.js`), preloaded on `/preview`, and the count became 2.
    Since the review, the live `/` keeps the broad count (any
    `link[href*="/assets/profile"]`, zero), and only the `/preview` count is
    narrowed to `rel="stylesheet"` (section 9, finding 9).

## 6. Owner inputs used and their defaults

| Input | Default used | Where |
| --- | --- | --- |
| R4 chips and buttons | Badge "Open to roles", chip "Bangkok or remote"; "Contact me" (`/contact`, dark pill with the swap arrow) and "Résumé" (`/resume`, ghost pill), 44 px | `lib/content/home.ts` (`homeHero`), `Hero.tsx` |
| R5 alternate lines | None: line 2 holds still on "Forward deployed AI engineering from Bangkok." | `ALTERNATE_PHRASES` in `lib/content/home.ts` (empty) |
| R6 logo strip | Typographic wordmarks: The Binary Holdings, Aiden Labs, Playbux, Coins.co.th, The Monk Games, KK Venture Global, Bitkub, GoGoCash, Manut AI | `logoStrip` in `lib/content/home.ts` |
| R19 phone layout | The reference's: compact swipeable frames with a pager, panels hidden | `home-hero.css` |

## 7. Draft copy awaiting approval

Nothing new is a claim or a figure; the strip and the mock read names from
the site's content. Since the review, each line below that `lib/content/home.ts`
types carries `// DRAFT` there, and a unit test checks the markers. For the
owner's review before Phase 6:

- Eyebrow "Where I’ve worked" (the brief's label) and the nine names (R6).
- Canvas mock labels (interface words, ours): "Featured projects" (the
  group's name), "Share", "Layers", "Assets", "Design", "Prototype", "Area",
  "Period", "Open project", "Illustration", "Kunanon · just now", the cursor
  "Kunanon", the breadcrumb "Kunanon / Selected work".
- Accessible names: "{name}: open the case study", "Show {name}", and the
  announcement "{name}, n of 3".
- The comment line "Optimise for reversibility." (an About page principle).
- R5 candidates, not shipped: the canvas used "Ship the smallest thing that
  proves the bet." and "Stay close to the work." (About page principles).
  Adding approved lines to `ALTERNATE_PHRASES` turns the rotation on.

## 8. Open items

1. **Visual baselines (orchestrator):** render the four new hero baselines and
   re-render `visual.spec.ts` `preview-home` (section 4) in the pinned image.
   Until then those comparisons fail.
2. **Case-study links:** the frames link to `/preview/portfolio/<slug>`, which
   Phase 5 creates; they are not asserted to resolve and 404 until then.
3. **Owner approvals:** R4, R5, R6, R19 and the labels in section 7.
4. **Phase 6:** the hero's inline script moves to `/` with the hero; keep the
   route's own `IntroLoader` and drop the preview's mount with `PreviewHome`;
   set `PROFILE_BASE` to "". **Phase 8 (R21):** the report-only CSP needs this
   inline script's hash, `sha256-CghRNdW2EBQ2lw/75ZwokCydff27JGPd+J+AgtjKjpk=`
   (the script as `ScriptOnce` writes it, pinned in `Hero.ssr.test.ts`).
5. **Live Home chunk split** (deviation 17) until Phase 6.
6. **Design spec not edited** (to avoid merge overlaps with the other lane): the
   decisions in deviations 4 and 7 to 12 belong in spec 5.2, 5.3, 5.6, 8.1 and
   8.2 when the lanes merge.
7. **At 1180 to 1279 px** the 12 px Layers rows wrap ("Node Validator
   Automation" on three lines) in the 503 to 548 px mock; legible, could be
   tightened.
8. **Firefox** is not installed here and was not run. The dual screen is
   checked only through Chromium's emulation, not a device.
9. **Umbrella status table** still reads PLANNED for Phase 2; the orchestrator
   updates it when the lanes merge.

## 9. Code review and fixes

The coordinator's review of the Phase 2 commit (`29ad1d7`) raised no High
finding (the h1 never fades or changes text, and live pages render as
before). Its findings are below. They were fixed together with the Phase 3
review's findings in one fix lane: worktree `t3-1784cc0a-ea5bcb3316195794`,
branch `fix/profile-home-review-findings`, one commit on `b4a07cc` (Phases 2
and 3), nothing pushed. Sections 1 to 8 describe the first run; where a
statement there described code the review changed, it is corrected in place
and points here. "Fails on `b4a07cc`" means the new test was run against the
base commit's source files (tests unchanged) and failed, then passed on the
fix.

### Findings, fixes and tests

| Finding | Fix | Test |
| --- | --- | --- |
| **Medium 1.** A visit made in the app played the intro with no hand-over: in a new session, a full load of `/preview/system`, then a click on Home with motion allowed. The inline script never runs on a client visit, so `html[data-intro]` was missing and `useIntroDone()` was true at once, while IntroLoader still played its 5.2 s overlay: the entrance and the cursor tour ran hidden under it. | `markIntroPending()` in `lib/motion/introSignal.ts`. IntroLoader calls it in a `useLayoutEffect` on the same test it plays on (`!reducedMotion && !alreadySeen()`), so the mark lands before paint. IntroLoader is live: its timing and markup are unchanged, and parity holds (below). Only the preview's `home-hero.css` reads the attribute. | `IntroGate.test.tsx`, "a first visit made in the app": IntroLoader and Hero mounted on the client in an unseen session; the page is pending at once, the cursor makes no stop before the intro's exit (well past its 0.9 s first stop), and its first stop comes 0.9 s after the exit. Fails without the call. Browser: "a first visit made in the app (from another page) still waits, still, under the intro" (full load of `/preview/system`, then the name link to Home: the overlay, `data-intro="pending"`, no entrance, the cursor on frame 0 at the third greeting; Skip: `done` and the entrance). Fails on `b4a07cc`. |
| **Medium, latent until R5 2.** Three rotation defects: (a) the sizers appeared one render after hydration (`useReducedMotion` is true on the server), so line 2 could grow and push content down; (b) the sizers and the leftover `.pf-hero__out` were text in the h1, which changed its text for crawlers that run script and for copying; (c) a mouse click on Play motion left focus on the toggle, so `focusInside` kept the headline paused. | (a, b) `Headline.tsx` renders the sizers whenever there are two or more phrases, on the server and the client whatever the motion setting, as empty `aria-hidden` spans with `data-text={phrase}`, drawn by `.pf-hero__sizer::before { content: attr(data-text) }`. The leaving line is removed on `animationend`, and is never rendered under reduced motion, where nothing would end it. (c) `Hero.tsx`: `holdsHeadline()` holds only for focus that matches `:focus-visible` and is not on the motion toggle. | `Headline.test.tsx` pins the new behaviour: the server h1's text is exactly the sentence and the alternate appears only in `data-text`; the sizers are the same (empty, hidden, one per phrase) on the server and on the client, with motion allowed or reduced; the leaving line goes when its animation ends, leaving the h1's text the visible sentence. `Hero.test.tsx`: the manual blurs are gone; focus stays on the toggle through Pause and Play, and the line turns again; keyboard focus on Contact me holds it; focus that does not show holds nothing; `holdsHeadline` on its own. The toggle and click-focus tests fail with the old rule. jsdom judges `:focus-visible` its own way, so these tests set it (the keyboard paths run in the browser tests); jsdom has no `AnimationEvent`, so React listens for `webkitAnimationEnd` there, and the test sends both names. |
| **Low 3.** The pager disappeared in forced colours. | The forced-colours block draws the dots in `CanvasText` and the current one in `Highlight`, with `forced-color-adjust: none`. | `profile-hero.spec.ts`, "on a phone the pager's dots stay drawn, the current one in Highlight" (390 px, forced colours): three opaque dots, the current one another colour. Fails on `b4a07cc`. |
| **Low 4.** A stage taller than the screen could keep focus out of view, and the no-script offset `min(0px, 100svh - 200svh)` did stick, against its comment. | Inside the 810 px query, `.pf-hero:has(:focus-visible) { position: relative; top: auto }`: keyboard focus unsticks the stage, and the browser scrolls the focused control into view where it really is. `keepClear` in `Hero.tsx`, which measured the stuck stage, is gone. The fallback is `var(--pf-hero-h, 100000px)`, and the comment says what it does. | At 1024 x 768 with the stage stuck under `#work`: "Shift+Tab from the stack back onto a frame link" (from the first card's link; at every stop, the motion toggle and then the frame link, once scrolling stops, the focused control is uncovered and between the bar and the screen's bottom) and "Tab from above into Contact me" (from the nav's Journey link). Both fail on `b4a07cc`. They replace the old check, which called `toggle.focus()` at 1440 x 900. |
| **Low 5.** On a spanned dual screen, the strip's centred label sat on the hinge. | In the `horizontal-viewport-segments: 2` block, `.pf-logos.ds-wrap { max-width: env(viewport-segment-right 0 0, 100%); margin-inline: 0 }`: the strip keeps to the first screen. | The spanned test also checks that the strip and its label end before the hinge (540 px). Fails on `b4a07cc`. |
| **Low 6.** "Open project" was a focusable link inside `aria-hidden`; a mouse click focused it, and Chrome warns. | A styled `span` (`cursor: pointer`) whose click calls `click()` on the selected frame's link. | `CanvasMock.test.tsx`: nothing in the hidden parts takes focus, and a press on the span reaches the selected frame's link. Browser: "the inspector's Open project is for a pointer" (a span; after hovering the second frame, a press opens that case's address), and the canvas test checks that nothing in the hidden parts can take focus. Fails on `b4a07cc`. |
| **Low 7.** Pause motion left the cursor tour running. | `Hero` passes `paused={!playing}` to `CanvasMock`; a pause ends the tour for good, as a pick does. | `CanvasMock.test.tsx`, "ends the tour for good when the hero's motion toggle pauses", and `Hero.test.tsx`, "ends the cursor's tour when the motion toggle pauses". Both fail without the change. |
| **Low 8.** The inline pre-paint script: if a CSP blocks it, or its string changes without the hash, the `<script>` stays in the DOM and hydration recovers with an error. | `IntroPendingScript` uses TanStack's `ScriptOnce`, which `@tanstack/react-router` 1.170.46 exports: server only, with `router.options.ssr.nonce` when one is set, and it removes itself. Its sha256 is pinned: `sha256-CghRNdW2EBQ2lw/75ZwokCydff27JGPd+J+AgtjKjpk=` (for Phase 8, open item 4). Unit tests that render the hero now provide a router (`tests/routerContext.tsx`). | `Hero.ssr.test.ts`, "writes the intro script with the hash Phase 8's policy will allow": it hashes the one script the server render writes. A change to the string, or to the line `ScriptOnce` appends, fails until the policy follows. |
| **Low 9.** `profile-shell.spec.ts`'s stylesheet check. | The same fix as Phase 3's finding 5, done once: the live `/` keeps the broad count of zero, and only the `/preview` count is narrowed to stylesheets. Deviation 17 (the live `/` route's JavaScript in two chunks, +0.6 KB gzip, until Phase 6) is restated as a deviation for the owner to accept. | "the preview's stylesheet is linked on /preview only" (gate). |
| **Low 10.** Unapproved lines in `lib/content/home.ts` were not marked, and the strip read every venture. | `// DRAFT` on the strip's eyebrow, the mock labels ("Featured projects", Share, Layers and Assets, Design and Prototype, Area, Period, Open project), "{name}: open the case study", "Show {name}", "{name}, n of 3" and "Kunanon · just now". The strip takes R6's ventures by slug (`STRIP_VENTURES`: GoGoCash and Manut AI). | `home.test.ts`: "marks every line that waits for the owner's approval as a DRAFT in its source", and "takes R6's two ventures only" (with a third venture mocked into `ventures.ts`, it does not join). The second fails with the old reading. |
| **Low 11.** Tests that pass on broken code or can flake. | The cursor-tour test no longer sleeps 6 s: it polls until there are three stops, then asserts `last - first + 900 < 5000` (the 0.9 s glide included). Items 2 to 4 changed their tests as above. | The test itself; it passed 3 runs of 3 (dev server) and in the full gate. |

Other changes made for the review:

- **`tests/routerContext.tsx`:** `withRouter(node)`, a router in context for
  unit tests that render the hero (`Hero.test.tsx`, `Hero.ssr.test.ts`,
  `IntroGate.test.tsx`, `PreviewHome.test.tsx`).
- **`CanvasMock`** takes `paused`; **`Hero`** exports `holdsHeadline`.

### Results of this run

The gates ran once, on the combined fix tree, for both phases; see the
Phase 3 report, section 9, "Results of this run". The same table:

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
