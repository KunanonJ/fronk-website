# The pixel portrait and the minting intro (plan, 20-11-26)

Owner (20-11-26): "for my profile image i want to make it feel like cryptopunk
design and the welcome loading please find the ways to make it more premium
and more dopamine driven". Research:
`../references/punk-avatar-and-intro_RESEARCH_20-11-26.md`. The owner chose all
four places for the portrait (nav avatar, /about photo and pixels, favicon and
app icon, collectible traits) and the minting intro of about 3 s. Two PRs:
this one (the portrait), then the intro, which reuses it.

## PR 1: the portrait

1. **The art (`lib/brand/pixelPortrait.ts`):** an original 24 x 24 portrait
   drawn from his photo (spiky hair and side-swept fringe, toothy smile, navy
   blazer and white collar), a 16 x 16 cut for 32 px, fixed colours with the
   background left to the site (`--portrait-bg`, the accent), six traits of
   our own (shades, gold glasses, headphones, a coral cap, a gold earring, a
   lapel pin) as patches, a gold edition (the outline turns gold), the cells
   with their dither ranks, an SVG builder and an ICO builder. Not a
   CryptoPunk, its traits or its name.
2. **`PixelPortrait`:** the SVG, cells in 16 groups by print rank (one path
   per colour in each), `shown` hiding the ranks above it.
3. **The nav avatar:** the 16 x 16 cut at 32 px (whole 2x), a rounded tile.
4. **The icons:** `/icon` (the cut at 4x, 64 px) and `/apple-icon` (the 24 x
   24 at 7x on a 180 px tile) drawn cell by cell; `public/icon.svg` and
   `public/favicon.ico` (16, 32, 48 px) written from the art, a test keeping
   them equal (`UPDATE_ICONS=1` rewrites them). Same URLs and types: parity
   holds.
5. **/about (`PortraitPlay`):** the portrait lies over the photo. A press puts
   on the next trait, remembered on the device (localStorage), with a polite
   line ("Shades. 1 of 6 traits found."), a one-time bump for a new one, and
   the gold edition once all six are found. A pill dissolves it to the photo
   through the 16 ranks in 8 frames of 45 ms and back (a cut under reduced
   motion). The photo keeps its alt text and its high priority.
6. **The real photo stays** in the Person JSON-LD and the share cards.
7. **Tests:** unit (the art, traits, the gold edition, SVG and ICO builders,
   the committed icons, the component's ranks, the play); smoke (the nav
   avatar, a trait remembered across a reload, the photo and back).
8. **Baselines:** the nav avatar is on every page: refresh them from CI's
   image at zero tolerance, then revert the tolerance.

## PR 2: the minting intro (next)

Replace the greetings and champagne burst with the portrait printing in by
the dither ranks beside a 0 to 576 counter, faster greetings (about 400 ms),
"Welcome to KunanonJ" with a burst of pixels, and a hand-over that morphs the
portrait into the nav avatar; about 3 s, skippable, once a session, nothing
under reduced motion, no flashing (WCAG 2.3.1). The champagne CSS goes.

## Closeout (20-11-26)

- **Shipped:** PR 1, the portrait: #152, squash f57d8d9 (20-11-26). PR 2, the minting intro: INTRO_PR.
- **Verified:** #152 live: `/icon.svg` and `/favicon.ico` byte-equal to the repo, `/icon` (64 px) and `/apple-icon` (180 px) drawn from the art, the nav's 16 x 16 avatar, and the portrait smoke test 10/10 against production (Chromium, WebKit, Firefox). The intro: unit tests (print-in, counter, burst, timings), and an e2e check that the hand-over names the portrait before and the avatar after (`pf-avatar`), never both.
- **Deviations and notes:**
  - A full-portrait button overlapped the pills and socials at phone widths (WCAG 2.5.8). The portrait became a pointer-only shortcut, and "Try a trait · n/6" is the labelled button.
  - #152's zero-tolerance run overran the visual job's 20 minutes, leaving the profile step half done. A second zero-tolerance run, with the first harvest committed, finished it: profile-journey and profile-work-about had not changed.
  - The intro runs 2.9 s, down from 5.2 s. Its greetings now pass at 400 ms, so the in-app intro test waits for the fourth greeting (1.2 s) to prove the tour held past its first stop (0.9 s).
- **Status:** complete; archived to `completed/`.
