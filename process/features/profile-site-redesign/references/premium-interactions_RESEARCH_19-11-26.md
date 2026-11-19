# More interactive, more premium, same mood (research, 19-11-26)

Owner request: "find the ways to make the website more interactive and premium
based on this current mood and tone". Two read-only studies fed this: an audit
of the live site and the code (36 page loads, both themes, desktop and phone,
recorded route and filter frames), and outside research on current platform
features and calm editorial portfolios. This is a menu with a recommended
order, not a plan: the owner picks, then a plan file follows.

The design source is `references/design-spec_18-11-26.md`;
`docs/redesign/01-05` describe the older black HUD design (03 is superseded).

## The mood to protect

- **Paper and ink, sunset light.** White paper, ink `#120e1f`, violet `#6e3cff`
  with accent-ink `#4b23c2`, coral `#ff7a3d` and peach `#ffd9c4`, lavender tints,
  a 165 degree sunset sheet. Dark is deep plum (`#0f0c18`, accent `#8d6bff`).
- **Editorial type.** Instrument Serif display (static Regular and Italic only)
  with the signature line: muted lead-in, then a violet italic phrase. Onest for
  text (variable 100-900), JetBrains Mono uppercase labels.
- **Ordered dither as the texture.** 4x4 Bayer in 10 px cells, peach to
  lavender, drawn once per size and theme. Pixel marks, digits, icons, cursors.
- **Bento and pills.** 24-28 px tiles with hairline rings; everything clickable
  is a pill (0.97 press, striped coral/violet hover ring).
- **Motion that is restrained.** Expo easing, 0.1-0.28 s micro, 0.7 s reveals;
  every loop has a pause; reduced motion and the site toggle turn it off.
- **Voice.** First person, plain, evidence first ("Honest signals", "No invented
  scores"). Premium here means calm and exact, not flashy.

## Fix first: what makes it feel less premium today

| # | Problem (where) | Fix | Effort |
|---|---|---|---|
| F1 | **Page changes double-expose.** From a scrolled list, the new page appears at the old scroll position and glides to the top while the 0.28 s cross-fade runs; the case h1 slides under the nav. Cause: `html { scroll-behavior: smooth }` (`src/styles/globals.css:158`) applies to the router's scroll reset. | Make the router's reset instant (router `scrollRestorationBehavior` or smooth scrolling only for in-page anchors), so the fade starts at the top. | S |
| F2 | **Dead hovers on catalog surfaces.** Skill cards, blog rows, portfolio filters, blog tags, contact topic chips and the case Share pill change 0 pixels on hover; `pages-catalog.css` has no `:hover` at all; skill cards and blog rows are not whole-card links. | One hover and press language from the Pill: hairline-to-accent ring, 1 px lift, arrow nudge, 0.97 press; whole-card links with one focus ring. | S |
| F3 | **Filters swap instantly.** `/portfolio`, `/skills`, `/blog` and the résumé turn the view transition off (`src/lib/filterParam.ts:10`). | Keep the filter transition on with `view-transition-name: match-element` on cards, so the grid reflows: cards leave, stay and move (all engines). A sliding active pill like the nav's. | S-M |
| F4 | **Overlays close with a snap**, and the share panel still uses the old bento animation (0.42 s with blur). | Exit transitions (`overlay` + `allow-discrete`, Chromium; others close instantly, acceptable); one popover motion for Say hello, phone menu, share. | S |
| F5 | **No pending feedback** on the request-rendered blog pages; no pressed state between click and transition. | A thin top progress line on pending navigations (router `pendingMs`), the 0.97 press on cards. | S |
| F6 | **Dead space on Home**: about 350-400 px between Story and the footer, the slot the hidden notebook fills. | Collapse the padding while the notebook is hidden. | S |
| F7 | **Muddy dark material**: the hue-79 stack card (AI Automation) renders olive-brown. | Retune its dark oklch wash. | S |
| F8 | **GitHub year card** on /about fills about 40% of its tile and loads from an empty grid. | Size it to the tile; fill cells in by week on reveal. | S |

## Premium interactions that fit the mood (ranked)

1. **Tile to case morph.** Give a venture or case tile's logo or frame and the
   case hero's the same `view-transition-name`. The router already runs a
   transition of type `page`, so it morphs instead of cross-fading. Morph the
   logo or frame, cross-fade the titles (snapshots are bitmaps). 0-0.2 KB JS.
   All engines. The single biggest perceived-quality gain. (S-M)
2. **Numbers that perform.** Venture and proof metrics and the stats tile's pixel
   digits count up once on reveal with `@property --n` and CSS counters (0 JS);
   the real value stays in visually hidden text. Fits "honest signals". (S)
3. **The dither comes alive, quietly.**
   - *Print-in:* bands and images "develop" through stepped dither frames as they
     enter view (scroll-driven animation, Baseline since Oct 2026; uses the
     registered but unused `--field-resolve`). The still state stays the visible
     one. (S-M)
   - *Dither lens:* on fine pointers, the hero's DitherField redraws the cells
     near the cursor a level denser and fades back, then stops. Never runs by
     itself. About 1.5 KB. Pick this or a tile spotlight, not both. (M)
   - The footer pixel drawings animate once on reveal, as spec 7.7 intended. (S)
4. **Reading affordances for long pages.** A reading-progress hairline driven by
   `animation-timeline: scroll()` (0 JS) on case studies and posts; the case TOC
   already scroll-spies, extend it to posts. Reading time at build. (S)
5. **Serif micro-type.** Links in serif swap one word to italic on hover and focus;
   underlines draw in with `text-decoration-thickness`. Uses the static font as
   it is. (S)
6. **Link previews.** Hover or focus a case, notebook or post link to see a small
   card (popover + anchor positioning, `interestfor` in Chromium, a 1 KB
   fallback elsewhere); Esc dismisses, touch just navigates, an off switch.
   WCAG 1.4.13. (M)
7. **A "Now" line.** Bangkok time (`Intl.DateTimeFormat`, Asia/Bangkok) and what
   he is working on this month, client-rendered, updated per minute. Personal,
   calm, true. (S)
8. **Command palette, ⌘K.** Native `<dialog>`, ARIA combobox, a build-time JSON
   index fetched on first open, code loaded on open (0 first-load). A visible
   "Search ⌘K" pill; `/` and `?` shortcuts with an off switch. Fits "engineer". (M)
9. **An intro in the site's own language.** Replace the white confetti splash
   (old keyframes, up to 5.5 s) with a short dither resolve of the hero: the
   dither band prints in and the headline appears, under 1.2 s, first visit only.
   (M)
10. **Theme switch as a dither dissolve.** A stepped Bayer mask on the view
    transition instead of the plain fade. Optional: the spec chose the fade on
    purpose. (M)

**Content, not code, but the largest premium lever:** case media, covers and the
canvas mock are grey skeleton wireframes with an "Illustration" chip, which read
as loading states; the venture covers are large, mostly empty fields. Richer
drawn illustrations (still labelled) or real product screenshots where they can
be shown would lift every page they sit on.

## Skip (gimmicky for this tone)

Magnetic buttons, custom cursors beyond the pixel pair, letter-by-letter split
text, the circular theme reveal (retired), cursor and scroll readouts, smooth-
scroll libraries and parallax, WebGL shader loops, sound (opt-in at most),
haptics (no iOS, removed from Firefox).

## Constraints every item respects

- **Budgets** (`scripts/check-first-load-budget.mjs`, measured 19-11-26): CSS on
  the worst page 33.8 / 36 KB (tightest), marketing routes up to 194.2 / 200 KB
  (skills), default routes 159.6 / 165 KB, entry 108.1 / 120 KB, fonts 47.7 / 52 KB.
  No new font; prefer CSS-native motion; lazy-load anything larger.
- **No motion library** (framer-motion removed, about 44 KB). CSS, `@property`,
  Web Animations, View Transitions, small rAF or IntersectionObserver scripts.
- **CSP** (`src/server/http.ts`): scripts and fonts from 'self' only; no CDN,
  Lottie or embeds.
- **Prerendering and LCP:** content visible from the server; the h1 never
  animates (`tests/e2e/profile-hero.spec.ts:234`).
- **Reduced motion and the toggle:** every keyframe inside `no-preference`, script
  motion checks `prefersReducedMotion()`; anything over 5 s gets a pause
  (WCAG 2.2.2). Guard tests in `lib/design/globals.test.ts` (keyframes named
  `kj-`, the page cross-fade kept for plain navigations).
- **Accessibility gates:** axe WCAG 2.2 AA in both themes, 24 px targets, 12 px
  text floor, contrast tests, forced colours hide decoration.
- **Visual baselines** are captured under reduced motion, so motion-only changes
  keep them; still-state changes regenerate them in CI's image.
- **Honesty:** illustrations stay labelled, no invented metrics.

## Suggested order

1. **Polish** (one PR): F1-F8. Small, fixes what reads as broken or unfinished.
2. **Continuity**: the tile-to-case morph, filter reflow, overlay exits, progress line.
3. **Signature texture**: number tickers, dither print-in, footer art on reveal,
   then the dither lens if it earns its place.
4. **Navigation**: reading progress and post TOC, serif micro-type, link previews,
   the Now line, the ⌘K palette.
5. **Intro and theme** (optional), and the illustration upgrade as content work.

## Sources

Platform status and techniques: web.dev Baseline posts (same-document view
transitions Oct 2025; web platform Oct 2026), Chrome for Developers guides
(view transitions in 2025, scroll-driven animations, interest-triggered
previews, scrollspy, interactive content reveal), MDN (Firefox 159 release
notes, Popover API, interest invokers, mask-image), caniuse (view transition
types, `view-transition-class`, `match-element`, cross-document view
transitions, `animation-timeline: view()`, scroll-state queries, `overlay`,
`popover="hint"`, anchor positioning, vibration), TanStack Router
`ViewTransitionOptions` docs and issue #7906, React 19.3 release notes, WCAG 2.2
Understanding documents (1.4.13, 2.1.4, 2.2.2, 2.3.3, 2.4.11), the ARIA combobox
pattern. Craft references: Emil Kowalski's animation notes, rauno.me, Adrian
Roselli on split text (Feb 2026), Maggie Appleton on command bars. Exemplars:
matveyan.com (Awwwards HM, May 2026), stripe.press, maggieappleton.com,
gwern.net/design, solar.lowtechmagazine.com, paco.me, emilkowal.ski, rauno.me.
