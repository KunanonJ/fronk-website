# Phase 4: Portfolio and OG images

**Status:** EXECUTED 09-11-26 on `feat/redesign-portfolio` (owner standing approval). No outcome metrics added (none owner-approved); cards show the access badge. Evidence: `../reports/phase-4_portfolio_REPORT_09-11-26.md`.
**Created:** 09-11-26
**Umbrella:** `visual-redesign_UMBRELLA_PLAN_09-11-26.md`
**Covers:** the portfolio index and its 4 detail pages, the illustrative mockups and diagrams, and every generated OG image (shared renderer)
**Depends on:** Phases 0 and 1

## Objective

The portfolio reads like considered case studies:
- numbered cards with one real outcome each;
- detail pages with a metadata rail and a facts strip;
- mockups and diagrams in the owner's palette;
- social cards that match the site.

## Known levers (verify at entry)

1. **Index** (`components/landing/PortfolioPage.tsx`, inside `components/landing/LibraryPageShell.tsx`): a two-column grid of numbered cards (`01` to `04`, mono), each with:
   - the title;
   - the tagline;
   - mono stack chips;
   - one hero metric (Cloudstudio "Selected work" pattern).

   This needs `metric?: { value: string; label: string }` (new) on `PortfolioProject` in `lib/content/portfolio.ts`. Values must be real and owner-approved; with no number, the card shows the access badge instead. `PortfolioCover.tsx` keeps the cover / mockup / initials fallback.
2. **Detail** (`components/landing/PortfolioProjectPage.tsx`):
   - the hero mockup (caption "Illustrative mockup, not real data." kept);
   - a sticky right metadata rail on `lg`, from the existing fields: Role, Organization, Period/Year, Access, Stack;
   - a four-column facts strip under the hero;
   - highlights and sections in the reading width;
   - workflow and architecture sections;
   - prev/next links restyled.
3. **Diagrams and mockups** (`components/landing/portfolio/{PortfolioMockup,PortfolioWorkflow,PortfolioArchitecture,VisualIcon}.tsx`): they already use theme classes (`fill-*`/`stroke-*`). Remap them to the Phase 0 tokens:
   - Signal for active nodes;
   - Glaze and Paper for surfaces;
   - Ember only on a node whose state is "failed" or "alerting" in the mockup data (e.g. the validator report's failure row). Ember is never decorative.
4. **OG images:**
   - the shared renderer is `lib/og/render.tsx` and `lib/og/card.tsx`, with fonts from `lib/og/fonts.ts` and `lib/og/fonts/`;
   - the routes are `app/opengraph-image.tsx` plus `app/(landing)/{portfolio,skills,topics,ventures}/[slug]/opengraph-image.tsx`;
   - restyle the card: a Paper or Ink field, Signal accents, a `PixelGrid`-like motif drawn in satori-safe markup, and the D1 font. Geist TTFs are already in `lib/og/fonts/`; Space Mono is replaced by Geist Mono TTFs if D1 is A;
   - keep 1200x630 and the `hasOwnOgImage` contract in `lib/seo/routeMeta.ts`. Changing the hashed URLs is expected; social caches re-scrape.
   - `app/icon.tsx` and `app/apple-icon.tsx` move to the new palette in this phase too.

## Touchpoints

`lib/content/portfolio.ts` (the `metric` field plus owner-approved values), `components/landing/{PortfolioPage,PortfolioProjectPage,PortfolioCover}.tsx`, `components/landing/portfolio/*`, `lib/og/{card,render,fonts}.tsx|ts`, `lib/og/fonts/`, the five `opengraph-image.tsx` files, `app/icon.tsx`, `app/apple-icon.tsx`, and their tests (`lib/og/card.test.tsx`, `lib/og/fonts.test.ts`, `app/favicon.test.ts`, the portfolio tests).

## Gates

- **OG:** every OG route returns a 1200x630 PNG on the preview. Each is reviewed by hand in both the old and new styles, and listed in the report. `lib/og/*.test.*` pass.
- **Portfolio:** `/portfolio` and all 4 details pass axe in both themes. The mockups keep `role="img"` with labels; diagrams stay `<ol>` structures (screen-reader order).
- **Perf:** `pnpm perf:budget` passes for `/portfolio*`. LCP under 2.5 s on `/portfolio` and one detail page.
- **Ratchets and visuals:** the type-floor and raw-hex ratchets are lowered; screenshots at 390 and 1440, light and dark.
- **Standard gates.**

## Out of scope

Real product screenshots (issue #44, owner-supplied; the `cover` field already supports them) and new projects.
