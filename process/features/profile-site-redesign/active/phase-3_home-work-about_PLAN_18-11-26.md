# Phase 3: Home work stack and About bento

**Status:** CODE DONE (18-11-26)
**Evidence:** `../reports/phase-3_home-work-about_REPORT_18-11-26.md` (gates,
deviations, draft copy and open items; Linux baselines pending, rendered by
the orchestrator).
**Created:** 18-11-26, at `563b2a3`.
**Umbrella:** `profile-site-redesign_UMBRELLA_PLAN_18-11-26.md`
**Spec:** `../references/design-spec_18-11-26.md` section 8 (work stack,
About bento), 10, 11, 12 and 15 (content slots).
**Inventory:** sections 5 (Home today), 6.1 to 6.4, 7.1 to 7.2, 8.2 (claim
audits), 8.3 (case-study evidence on Home) and 9.3 (owner rules).
**Report target:** `../reports/phase-3_home-work-about_REPORT_{dd-mm-yy}.md`
**Owner inputs:** R7 (stack cards), R8 (stats figures), R9 (About copy), R10
(screenshots), R13 (recruiter-fit Phase 4 first, because the About copy
changes).

## Objective

Build the `#work` and `#about` sections of the new Home on `/preview`: the
section headers, the sticky stack of case cards, and the 12-column About
bento with its animated tiles, from today's cleared content.

## Work

| Step | Scope |
| --- | --- |
| 3a | **Section header** (`components/profile/home/SectionHeader.tsx`): eyebrow row with its hairline, serif H2 with the spec's max widths, and a lead aligned to the H2's baseline on the right (stacked on phones). Used by `#work`, `#about` and later sections |
| 3b | **Card model.** A pure mapper from `lib/content/portfolio.ts` and `ventures.ts` to stack cards: slug, link (`/portfolio/<slug>` or `/ventures/<slug>`; `/preview/...` while in preview), name, chips (category and discipline), summary, the first cleared outcome line, media (a real cover image, or the project's `PortfolioMockup`, or a code-drawn venture composition built from its logo and loop), media kind (`screenshot` or `illustration`), and a material hue. Default selection and order per R7. Unit-tested, including that every figure shown comes from cleared content |
| 3c | **Work stack** (`components/profile/home/WorkStack.tsx`, `StackCard.tsx`), an `article` named "Selected work" (a smoke test reads it; spec section 13 item 26). Each `li` sticky at `top: 104px + 14px * index`, grid gap 24. Card: grid 5fr / 7fr, gap 32, padding 36, radius 28, `min-height: min(72vh, 620px)`, ring line-soft, the material gradient for its hue, a dither field over the right 60 %. Body: chips, the title (Onest 500, about 40 px), the summary, the first outcome line (kept so the recruiter test's "Selected work shows the first outcome" still holds), and the dark "Read the case study" pill whose arrow grows in on hover. Media: white frame, radius 20, the spec's shadow; code-drawn media carry a visible "Illustration" chip (owner decision 4). Depth: as later cards cover earlier ones, a small scroll observer sets `--depth` on covered cards (`scale(1 - min(depth, 4) * .035)` from the top centre and a paper veil at `depth * .12`); under reduced motion cards still stack but do not scale. Hover (fine pointers): the pill's striped ring, the arrow, the frame at 1.015. Under 810 px: the compact card (media first at 16:10, a 22 px title, a 40 px round arrow pill with its label kept for screen readers, chips and summary hidden, the dither in the top 70 %). The GoGoCash card carries `id="ventures"` so `/work`, `/ventures`, the venture breadcrumbs, the 404 page and the menu keep their anchor |
| 3d | **About bento** (`components/profile/home/AboutBento.tsx`). 12 columns, gap 16 (one column under 810 px, gap 12); tiles radius 24, paper-2, ring line-soft, padding `clamp(20px, 2.4vw, 36px)`. Row 1: an "In short" tile (7 columns; `t-lead` paragraphs from `lib/content/aboutPage.ts`, R9) and a "mess" tile (5 columns, tint-2: five chips that start scattered, rotated and tinted, and tidy into a straight list with violet check circles when the tile enters view, staggered, .75 s; under reduced motion they render tidy; then an italic serif closing line, R9). Row 2: a stats tile (7 columns, dark violet radial gradient with a dither field; up to three numbers drawn by a `PixelNumber` component in our own 5 x 7 pixel digits, with mono labels; each figure is also real text for assistive technology and search, and the canvas is `aria-hidden`; only cleared figures, R8) and a motion tile (5 columns: a code-drawn "from mess to product" animation, pixel blocks gathering into a grid, with a pause button because it loops; still under reduced motion; a chip caption). Row 3: four tiles (3 columns each) for the four operating principles in `aboutPage.principles`, each with a 64 px code-drawn pixel icon that moves once on entering view, a 22 px title and 14 px text |
| 3e | **Content module.** The selections, chips, closing line and stats live in `lib/content/home.ts` with their sources noted; the claim audits learn the new file, so figures there are held to the same rules as `portfolio.ts` and `ventures.ts` |
| 3f | **Tests and gates** (below) |

## Touchpoints

New `components/profile/home/{SectionHeader,WorkStack,StackCard,AboutBento,MessTile,StatsTile,MotionTile,PrincipleTile,PixelNumber}.tsx`
and tests; a stack-card mapper (for example `lib/landing/stackCards.ts`) and
its test; `lib/content/home.ts`; `components/landing/portfolio/PortfolioMockup.tsx`
(rendering at card sizes, if it needs a size prop); the claim audit tests
(`lib/content/portfolioOutcomes.test.ts`, `ventureCase.test.ts`) for the new
file; `tests/siteSources.ts` if needed; `src/routes/preview/index.tsx`;
e2e and visual tests.

## Public Contracts

None on live pages. `id="ventures"` on the GoGoCash card becomes a Phase 6
contract.

## Blast Radius

`/preview` only. `PortfolioMockup` may gain a size option; its live output
must not change (baselines prove it).

## Validation gates

1. The CI gates as in Phase 0 gate 1.
2. Geometry at 1440 x 900 and 390 x 844: cards stick at their offsets, the
   last card scrolls away with the section, no horizontal scroll.
3. `/preview#ventures` lands on the GoGoCash card below the nav.
4. The mess tile tidies on entering view and renders tidy under reduced
   motion; the motion tile's pause button stops it; no depth scaling under
   reduced motion.
5. Claim audits: "1,000 registered users" exactly; GoGoCash totals carry "As
   of October 2026"; outcome lines only from `portfolio.ts`; no uncleared
   figure in the stats tile.
6. Tap areas at 320 and 390 px, including the round arrow pills and the pause
   button. Axe in both themes.
7. Visual: new baselines for `#work` and `#about` (light and dark, mobile and
   desktop), reviewed against the spec. Existing baselines and parity
   unchanged.

Device matrix (spec section 10.1): at 344, 390, 820, 882, 1180 and 1440 px
wide nothing overlaps and nothing scrolls sideways (the About grid in one,
two and twelve columns as the spec sets them, the mess chips inside their
tile), and the tap-area test passes at 344.

## Blockers that justify BLOCKED

- A card would need a figure or a claim the owner has not cleared.
- Sticky stacking cannot pass the covered-target tap test at 390 px (a card
  covering the one beneath it). Then propose a phone layout without stacking
  to the owner.

## Resume and Execution Handoff

- **Execute anchor:** this file. Phase 2 must be merged.
- **Before code:** take R7, R8 and R9. Show the chips, closing line and stats
  as they would ship.
- **Research first:** how `PortfolioMockup` scales; which stats are already
  cleared word for word in `lib/content/`.
