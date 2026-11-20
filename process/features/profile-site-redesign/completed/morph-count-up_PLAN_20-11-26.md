# Tile-to-case morph and count-ups (plan, 20-11-26)

Owner request (20-11-26): "do the tile-to-case morph and count-ups next", items 1
and 2 of `../references/premium-interactions_RESEARCH_19-11-26.md` (Continuity and
Signature texture). One PR, two commits. SIMPLE plan.

## What the code showed

- **The cover cannot be the morph target.** The case cover sits under the hero
  copy: at 1440 x 900 its top is at 770-1078 px, at 390 x 844 at 733-1283 px.
  A card's picture morphing into it would fly off the screen. What is always
  in view is the h1: the name at about 275 px (250 on phones), and a venture's
  logo beside it (72 px, 34 on phones).
- **Names come per click, not per card.** Naming every tile `case-<slug>`
  would make the hero of case A, leaving through a "More projects" card,
  morph into A's card at the bottom of case B, across the screen. The pressed
  card is marked on click; the case it opens marks its h1 as it renders.
- **The numbers are text in three places and pixels in one:** the venture
  figures on a case page (`.pf-case-figure__value`), the /proof metric tiles
  (`.pf-read-figure` in Metrics), and the About stats tile (`PixelNumber`, an
  SVG). Grouped figures ("1,000", "THB 48,500") rule out CSS counters, so a
  small script draws the frames.

## Steps

1. **Morph (`components/profile/case/caseMorph.ts`):** `morphFromCard` on the
   card links (work index, More projects, Home stack cards) marks the card
   (`data-morph`) and remembers the case it opens, after clearing any other
   mark; a modified click (new tab or window) does nothing. `useMorphTarget`
   in CaseHero marks the h1 when it renders for that case.
2. **Morph CSS (globals.css, View transitions):** only under
   `:active-view-transition-type(page)` and no-preference: the marked card's
   title and the h1's name share `pf-morph-title`, the card's logo and the
   hero logo `pf-morph-logo`. The card title shrinks to its text while the
   transition runs, so the two boxes match. The groups move in 0.42 s on the
   expo ease; the title fades through (old out in 0.16 s, new in from 0.08 s)
   since the card is Onest and the h1 Instrument Serif. The h1's name becomes
   `inline-block`, so a name on two lines is still one box (a box in two
   fragments is not captured); its look must not change.
3. **Count-up (`lib/motion/countUp.ts`, `lib/hooks/useCountUp.ts`):** parse a
   figure into prefix, number and suffix (null for anything else: years,
   ranges, words); draw frames from 0 with an expo ease-out over 0.9 s,
   never above the value, grouping as the source does. As Reveal does: after
   hydration only a figure still below the fold waits; on screen, under
   reduced motion or without IntersectionObserver it stays as it is.
4. **Drawing the frames without touching the real text:** `CountUp`
   (components/ds) sets `data-shown` on its element; CSS hides the real text
   and shows the frame in `::after` (alt text `""`, so it is not read), so
   the real figure keeps the width and stays what screen readers, search and
   tests read. PixelNumber draws frames in a second path and hides the real
   one. CSS only under screen, no-preference and no forced colours.
5. **Use it:** CaseEvidence figures, /proof Metrics, the About stats tile.
6. **Tests:** unit (parse and frames, morph marking, the hero mark, CountUp
   and PixelNumber render the real value); a Chromium smoke test that a card
   click runs a page transition with `pf-morph-title` and no abort, and a
   figure below the fold counts up and lands on its value.
7. **Gates:** typecheck, lint, format, knip, unit, CSS and first-load budgets,
   the profile and smoke e2e locally (Chromium), visual baselines unchanged
   (reduced motion; the inline-block name checked pixel for pixel).

## Out of scope

- The way back (case to list) morph: browser back restores the list's scroll
  as the page renders, so the target could be off screen; revisit if wanted.
- Outcomes on /proof's Delivery and /stack's figures (mixed text, not counts).

## Closeout (20-11-26)

- **Shipped:** PR #144, squash 77258e6 (20-11-26).
- **Verified:** Live 13/13: the title morph from /portfolio, title and logo from a Home venture card, count-ups on /proof and the stats tile, nothing under reduced motion. Case heroes pixel-identical at six widths after the name became inline-block.
- **Deviations and notes:** As planned; the way back (case to list) stays out of scope.
- **Status:** complete; archived to `completed/`.
