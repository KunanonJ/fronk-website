# A punk-style pixel portrait and a more rewarding intro (research, 20-11-26)

Owner request (20-11-26): "for my profile image i want to make it feel like
cryptopunk design and the welcome loading please find the ways to make it more
premium and more dopamine driven". A menu with a recommendation; the owner
picks, then a plan file follows.

## What the site has today

- **One portrait** (`/profile-portrait.webp`, 480 x 480): the nav avatar
  (32 px), the /about hero, the profile share card (`lib/og/profileCard.tsx`)
  and the Person JSON-LD image. Short black hair with a fringe, a smile, a navy
  blazer over an open white collar, on dark grey.
- **The welcome intro** (`components/landing/IntroLoader.tsx`, Home, once a
  session): five greetings (Hello, สวัสดี, Bonjour, こんにちは, Welcome to
  KunanonJ), 720 ms each, the last held 1.62 s, then a 700 ms fade: 5.2 s,
  the length the owner chose on 12-11-26. The last word gets a champagne pop,
  confetti and sparkles (`IntroBurst`, CSS in globals.css, from the bento era).
  Any key, tap, click or scroll skips it; reduced motion skips it entirely.
- **The site's language already is pixels:** the dither skies, pixel digits,
  the footer drawings, the pixel marks. A 24 x 24 portrait belongs here more
  than a photo does.

## The portrait: an original punk-style pixel portrait

- **Style:** 24 x 24 cells, flat colours, a 1-cell dark outline, a bust cut at
  the collar, a solid background. A first mock (in the session, not
  committed) keeps what identifies him: the spiky black hair and side-swept
  fringe, the smile, the navy blazer and white collar.
- **IP and honesty:** CryptoPunks are Yuga Labs' collection. The style (small
  flat pixel portraits) is common; we draw an original portrait of him, do not
  reuse a punk or its trait art, avoid their signature blue-grey background,
  and never use the name on the site. The real photo stays where a real face
  matters: the Person JSON-LD image (search) and, by default, the recruiter
  share card.
- **Sizes stay whole-pixel:** the 24 x 24 master renders at 2x (48 px), 15x
  (360 px), 20x (480 px). The nav's 32 px avatar would scale a 24 grid by
  1.33 and smear it; it gets a 16 x 16 cut of the same portrait (2x).
- **Drawn in code**, like the footer drawings (`PixelArt`): an SVG of rects,
  a few KB, crisp at any size, in the site's palette, and able to play the
  same print-in as the footer drawings. Its background takes the site's
  violet or peach in each theme.

### Where it could go

1. **The nav avatar** (16 x 16 cut). Every page, small, the strongest
   identity signal.
2. **/about's portrait: photo and punk in one frame.** The punk shows; a hover
   or tap dissolves to the photo through the site's 4 x 4 Bayer steps (the
   print-in in reverse), and back. A signature moment, honest (the real face
   is one gesture away).
3. **Favicon and app icon:** the punk at 32 and 180 px, replacing the
   monogram.
4. **Traits to find (the dopamine one):** pressing the /about punk cycles our
   own traits (shades, headphones, a cap, a laptop glow), each arriving with a
   pixel pop; a small counter ("3 of 6 traits") remembers progress on the
   device; finding all six gives a last trait (a gold outline). Variable
   reward, opt-in, never in the way.

## The intro: shorter, in the site's own language, with a payoff

Today's intro is a white page of words and a champagne pop: it predates the
redesign and shares nothing with it. Options, each skippable, once a session,
none under reduced motion, nothing flashing more than three times a second
(WCAG 2.3.1):

1. **"Minting" the portrait (recommended):** the greetings cycle faster (about
   400 ms each) while the punk prints in cell by cell in the Bayer order, a
   mono counter ticking 0 to 576 (24 x 24) beside it; "Welcome to KunanonJ"
   lands with a burst of pixels (our own dither squares, not confetti); then
   the punk morphs into the nav avatar (a view transition), handing the visitor
   to the page. About 3 s. Anticipation (the drawing), progress (the counter),
   completion (the snap), continuity (the morph): the dopamine loop, in the
   site's own material.
2. **The same at today's 5.2 s:** keep every greeting at 720 ms, with the
   minting under them. Calmer, the length the owner chose.
3. **A trait roll:** as 1, plus a random trait each session, named on the way
   in ("Trait: shades, 1 in 6"), which the /about punk then wears. The most
   dopamine; closest to the collectible feel.

Common to all: the overlay takes the site's paper and dither instead of the
plain white page; the burst's CSS replaces the champagne keyframes (the CSS
budget is 35.3 / 36 KB, so the new rules must not add more than they remove,
or they load with the intro only); the hero stays still until the hand-over,
as now (`introSignal`).

## Not recommended

Sound (even opt-in), vibration (no iOS), a longer intro, replacing the
JSON-LD photo, or naming CryptoPunks anywhere.

## Recommended order

1. The portrait in code (24 x 24 and 16 x 16), the nav avatar, the favicon.
2. /about's photo-and-punk dissolve.
3. The minting intro (option 1, or 2 if the owner prefers the 5.2 s).
4. The traits, if the owner wants the playful layer.
