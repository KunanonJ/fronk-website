# Dither print-in and the footer drawings on reveal (plan, 20-11-26)

Owner request (20-11-26): "do the dither print-in and footer art next", from
item 3 of `../references/premium-interactions_RESEARCH_19-11-26.md` (Signature
texture). One PR. SIMPLE plan.

## What the code and spec say

- **Spec 6.8:** the dither is "drawn once per size and theme; an optional
  one-time resolve using `--field-resolve` under 1.2 s, never a loop".
  DitherField (`components/ds/DitherField.tsx`) draws an ordered 4 x 4 Bayer
  threshold over a density ramp at an idle moment; nothing resolves today.
- **Spec 7.7:** the footer's two pixel drawings (a browser window with its
  cursor, a phone; from 1280 px only) are "code-drawn, a one-time animation of
  3 s or less on reveal, then still". Today they are still.
- **Every screenshot test runs under reduced motion** (profile-case, -hero,
  -journey x3, -work-about); visual.spec hides the dither. Motion-only changes
  keep the baselines.

## Steps

1. **A shared wait (`lib/motion/firstView.ts`):** `waitForFirstView(el,
   onView)` holds Reveal's rule: only an element still below the fold after
   hydration waits, then plays once in view; on screen, with no box, under
   reduced motion or without IntersectionObserver, nothing waits. The
   count-up hook moves onto it (no change in behaviour).
2. **Print-in (DitherField):** each cell carries its matrix rank
   (`ditherCells`' `rank`, 0 to 15). A waiting field draws nothing
   (`data-print="wait"`); in view it draws the ranks below 2, 4, ... 16 in
   8 frames of 90 ms (`data-print="run"`), then is the still drawing. Resize
   and theme redraws keep the current step; printing draws it whole. The
   registered `--field-resolve` stays unused: a canvas cannot read it.
3. **The footer drawings (PixelArt `play`):** a waiting drawing is hidden
   (`data-wait`, shell.css, screen and no-preference only). In view, each
   square appears on its beat (`pixelBeats`): the paper and frame by the same
   matrix order, 40 ms a step; the content (tint) row by row from 0.7 s; then
   the ink inside the frame (the cursor, the phone's button) and the lights
   (accent, coral) at 1.35 s, the lights blinking once. Under 1.7 s. Web
   Animations on `visibility` (opacity left hairline seams between squares).
4. **settleDither** skips a field still waiting and waits out one printing.
5. **Tests:** unit (ranks, the print-in states, the beats, play); a Chromium
   smoke test that the footer's field and drawings wait, play once in view
   and end still, and that nothing waits under reduced motion.
6. **Gates:** typecheck, lint, format, knip, unit, budgets, smoke, a11y and
   profile e2e against the build; baselines unchanged.

## Out of scope

- The dither lens (research item 3, "if it earns its place").
- Fields on screen at load (the hero and case skies) stay still: Reveal's
  rule, and the LCP area never moves.

## Closeout (20-11-26)

- **Shipped:** PR #145, squash 151ef5a (20-11-26).
- **Verified:** Live 13/13: footer field and drawings wait, play once and end still; eight Home fields wait; nothing under reduced motion.
- **Deviations and notes:** The drawings hide on `visibility`, not opacity: opacity left hairline seams between squares.
- **Status:** complete; archived to `completed/`.
