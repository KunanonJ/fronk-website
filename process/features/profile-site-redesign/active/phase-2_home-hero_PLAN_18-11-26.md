# Phase 2: Home hero and logo strip

**Status:** CODE DONE (18-11-26)
**Evidence:** `../reports/phase-2_home-hero_REPORT_18-11-26.md` (gates, deviations, draft copy; visual baselines pending, see its open item 1).
**Created:** 18-11-26, at `563b2a3`.
**Umbrella:** `profile-site-redesign_UMBRELLA_PLAN_18-11-26.md`
**Spec:** `../references/design-spec_18-11-26.md` section 8 (hero, canvas
mock, logo strip, entrance timings), 10, 11 and 13 (items 3, 8, 12).
**Inventory:** sections 4.6 (intro), 5 (Home today), 6.7 (logos), 8.3
(recruiter path), 9.5 (owner decisions O8 and O9) and 10 (R3, R4).
**Report target:** `../reports/phase-2_home-hero_REPORT_{dd-mm-yy}.md`
**Owner inputs:** R4 (chips and buttons), R5 (rotating lines), R6 (logo strip),
R19 (phone layouts).

## Objective

Build the top of the new Home on `/preview`: the hero stage with its sunset
panel and pixel sky, the chips, the serif headline with a rotating second
line, the lead and buttons, the Figma-style canvas of selected work, and the
logo strip. The recruiter facts stay above the fold and the h1 never fades.

## Work

| Step | Scope |
| --- | --- |
| 2a | **Hero stage** (`components/profile/home/Hero.tsx`). From 810 px a sticky wrapper with `min-height: var(--screen)`; below 810 px content height. Under 1180 px the hero stacks, copy first and the full canvas mock after it; on a dual-screen device spanned across a hinge the copy and the canvas sit on either screen (spec section 10.1). The sheet: inset 12 px (10 px under 810), radius 28 28 36 36, `--sunset` background, and a dither sky band at the top that fades out downward. Copy grid 6fr / 6fr, gap 28 px 56 px, top padding `var(--nav-h)` plus 24 px |
| 2b | **Headline.** The h1's text and accessible name stay "Hi, I'm Kunanon Jarat. Forward deployed AI engineering from Bangkok." (owner decision O9, the parity gate, the recruiter test). Line 1, "Hi, I'm Kunanon Jarat.", is fixed. Line 2 is a rotating slot whose first phrase is "Forward deployed AI engineering from Bangkok."; the server renders that phrase, so the h1 text matches today's. Alternates come from a content list (`lib/content/home.ts`) and ship only after R5; with one phrase the line holds still. Rotation every 4.2 s, paused while hovered or focused and by the hero's motion toggle (spec section 6.11, WCAG 2.2.2), off under reduced motion. Only a swap animates: the outgoing line blurs and lifts (`line-out`, .42 s) and the incoming words stamp in (`wordpop`: 70 ms stagger, stepped scale with a coral pixel mark, then a short drift). The first render is static, so the LCP h1 is never hidden or faded. Font size `clamp(2.625rem, min(5.4vw + 0.625rem, 8.4svh + 0.25rem), 6rem)` (spec 3.3: the same sizes at 100% zoom, with a 42 px floor so the h1 still grows at 200% zoom), max 12em |
| 2c | **Chips, lead, buttons.** Per R4: an accent chip "Open to roles" and a plain chip "Bangkok or remote" (wording from `lib/content/availability.ts`); the lead from `lib/content/landing.ts` (today's "IT Manager & AI Engineering Lead at The Binary Holdings. Also building GoGoCash and Manut AI.", subject to recruiter-fit Phase 4); a dark pill "Contact me" with the swap arrow (`/contact`) and a ghost pill "Résumé" (`/resume`), 44 px tall |
| 2d | **Canvas mock** (`components/profile/home/CanvasMock.tsx`), per owner decision 3. A 548 x 406 window at 1280 px: traffic lights, a breadcrumb "Kunanon / Selected work" and a decorative accent "Share" chip; a dotted canvas; a Layers panel listing the three featured projects; three frames, each a link to its case study (accessible name "{Project}: open the case study") showing the project's real cover or its code-drawn mockup (`PortfolioMockup`), labelled like design-tool frames, the active one with a selection box, handles and a discipline badge; an inspector (Design and Prototype tabs, Area, Period, "Open project"); a comment bubble (initial "K", "Kunanon · just now", a cleared line such as an operating principle); a named cursor "Kunanon" that tours the frames once in under 5 s and rests; a bottom toolbar (select, frame, pen, text, comment). Hovering or focusing a frame moves the selection and the inspector. All label text is 12 px or more, so panel widths grow slightly over the reference's 9 to 11 px labels. Decorative parts are `aria-hidden`; the frame links are not. Under 810 px the panels hide and the frames become a scroll-snap carousel with pager buttons that have 24 px hit areas |
| 2e | **Logo strip** (`components/profile/home/LogoStrip.tsx`). Centred mono eyebrow "Where I've worked". A marquee of typographic wordmarks (R6; SVG wordmarks replace them when the owner supplies them): Onest 600 at 20 px in `ink-60` with no opacity or filter (spec 8.3; the reference's .55 opacity would be about 4.3:1), gap 56 px, two copies (the second `aria-hidden`), 44 s linear, edge mask 10 % to 90 %, paused on hover and by the same hero motion toggle (WCAG 2.2.2; the reference has none). Under reduced motion: no movement, no mask, one centred wrapping list |
| 2f | **Entrance and intro.** Eyebrow fade-up .7 s at .2 s, canvas `file-in` 1.4 s at .5 s, lead .9 s at 1.1 s, buttons .8 s at 1.3 s, logo strip .9 s at 1.5 s, all ease-expo and only under `no-preference`. On a first visit the greeting intro (`IntroLoader`, 5.2 s) plays first and the entrance starts when it ends; on later visits it starts at once. The h1 has no entrance animation |
| 2g | **Tests and gates** (below) |

## Touchpoints

New `components/profile/home/{Hero,Headline,CanvasMock,LogoStrip}.tsx` and tests;
new `lib/content/home.ts` (phrases, logo list, mock copy) with tests;
`src/routes/preview/index.tsx`; `components/landing/IntroLoader.tsx` (an
"intro finished" signal only, no change to its timing); `src/styles/globals.css`;
`tests/e2e/smoke.spec.ts` (a "preview recruiter path" block mirroring the
live one), `visual.spec.ts`, `a11y.spec.ts`.

## Public Contracts

None on live pages. The h1 contract above holds for Phase 6.

## Blast Radius

`/preview` only. `IntroLoader` gains an event or callback; its live timing
and tests stay the same.

## Validation gates

1. The CI gates as in Phase 0 gate 1.
2. Recruiter path on `/preview` at 1440 x 900 and 375 x 812: the h1 "Hi, I'm
   Kunanon Jarat. Forward deployed AI engineering from Bangkok.", "Open to
   roles", "Contact me" and "Résumé" are fully in the viewport.
3. Unit: rotation with fake timers (4.2 s, pause on hover and focus, none with
   one phrase or reduced motion); the h1's accessible name is the canonical
   sentence whatever phrase shows; server-rendered h1 text equals today's.
4. LCP: `pnpm probe` against the production build of `/preview` reports the
   h1 as the LCP element with no opacity change.
5. Tap areas at 320 and 390 px: frame links, pager buttons, the marquee pause
   button and the hero buttons.
6. Axe in both themes; the canvas mock exposes only its links and their
   names.
7. Visual: new baselines for the hero at 1280-equivalent desktop and mobile in
   both themes, with rotation and the marquee frozen, reviewed against the
   spec. Existing baselines and parity unchanged.
8. Claim audits pass: no new figure, and the mock's comment line is cleared
   copy.
9. At 200% zoom (a 720 x 450 CSS viewport) the h1 renders at 42 px or more
   and nothing overlaps; the recruiter facts may leave the first screen
   there, which the recruiter test does not cover. The Phase 0 best-practice
   checks pass on the hero (axe with `wcag22aa`, forced colors, text
   spacing, request origins, the WebKit phone project).

Device matrix (spec section 10.1): at 344, 390, 820, 882, 1180 and 1440 px
wide nothing overlaps and nothing scrolls sideways, and the tap-area test
passes at 344. On a spanned dual-screen viewport (Chromium's display-feature
override, a vertical hinge) the copy and the canvas sit on either side of it.

## Blockers that justify BLOCKED

- The recruiter facts do not fit above the fold at 375 x 812 with the
  reference's proportions. Then show the owner the options (smaller chips,
  shorter lead, buttons above the lead) before changing the test.
- The owner wants the reference's own headline pattern, which breaks O9 and
  parity: that needs his explicit decision and a deliberate parity re-crawl.

## Resume and Execution Handoff

- **Execute anchor:** this file. Phase 1 must be merged.
- **Before code:** take R4, R5 and R6 (each has a default). Show the drafted
  rotating lines and the logo list as they would ship.
- **Research first:** how `IntroLoader` ends (session flag, events), and
  which project covers and mockups render well at 186 x 127 px.
