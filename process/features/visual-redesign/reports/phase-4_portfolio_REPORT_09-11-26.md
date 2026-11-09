# Phase 4 report: Portfolio and brand images (09-11-26)

**Plan:** `../completed/phase-4_portfolio_PLAN_09-11-26.md`
**Branch:** `feat/redesign-portfolio`
**Mode:** EXECUTE under the owner's standing approval (Phases 3-6).

## What changed

- **Shared page shell** (`components/landing/LibraryPageShell.tsx`, also used by the Library pages in Phase 5): a mono 12 px eyebrow, a Geist display h1 and an `ink-2` lead on `bg-page`.
- **Index** (`components/landing/PortfolioPage.tsx`): numbered case-study cards (`01`-`04`) with a mono category/year line, a Signal access chip (no outcome metric, since none are owner-approved for these internal projects, as the plan specifies), a Geist title, mono stack chips and a "View project" link.
- **Detail** (`components/landing/PortfolioProjectPage.tsx`):
  - the hero mockup (caption kept);
  - a new four-column facts strip (Role, Organisation, Period, Access) that replaces the sidebar details list;
  - a sticky tech-stack rail on `lg`;
  - highlights with small Signal square bullets;
  - Geist section headings;
  - a Signal "Visit" pill for public projects;
  - prev/next as Paper cards.
- **Mockups and diagrams** (`components/landing/portfolio/*`):
  - the active app-shell nav item gets a Signal tint and marker;
  - the mockup's primary action button is Signal with a Paper label;
  - the stage is a faint Signal glow over Glaze-to-Clay;
  - workflow and architecture headings and labels are on tokens (the 10 px label is now 12 px);
  - the connector is Signal at 40%.

  Ember isn't used; no mockup state is a failure.
- **Brand images:**
  - `lib/brand/tokens.ts` now holds the new palette (Ink, Paper, Page, Glaze, Signal, Clay);
  - `lib/og/card.tsx` is redesigned: a Paper field, Ink type, a Signal eyebrow, and a seeded idle pixel block (`pixelCells`, so each page gets its own pattern and Ember never appears);
  - labels are tracked uppercase Geist;
  - Space Mono is removed from the OG fonts (`lib/og/fonts.ts`; the TTF is deleted).
- **Icons:** `app/icon.tsx` and `app/apple-icon.tsx` are a Glaze "K" on an Ink tile with one Signal pixel.
- **Ratchet:** sub-12 px text 24 → 19.

## Verification Evidence

| Gate | Result |
|---|---|
| OG routes on the preview | `/opengraph-image` and the portfolio, skills, topics and ventures segment images: all 200 `image/png` 1200x630. `/icon` 64x64, `/apple-icon` 180x180. Reviewed by hand (contact sheet) |
| `lib/og/*` and favicon tests | Pass, including the new palette assertion and "idle pixel block has no Ember" |
| LCP (phone, throttled, cold) | `/portfolio` 1.0-1.2 s; `/portfolio/ai-automation` 0.99-1.08 s |
| `perf:budget` | `/portfolio*` 239.9 KB (within the 300 KB marketing budget) |
| Accessibility | e2e a11y (axe, both themes) passes on `/portfolio`, a project page and the diagrams page. Mockups keep `role="img"` with labels; diagrams stay `<ol>` structures |
| `pnpm typecheck` / `lint` / `test` | Pass; 0 errors; 512 tests |
| e2e smoke + a11y (desktop + mobile) | 100/100 |
| Scripted review (20 routes × 2 viewports × 2 themes) | Clean |

## Notes

- **Text under 12 px on portfolio pages:** the probe still counts 16-29 such texts, all SVG text inside the illustrative mockups (`role="img"`). Those are part of an image, not page text.
- **OG font in the Worker (pre-existing):** segment OG images render on demand in the Worker, where the Geist TTFs aren't bundled, so their titles use the default font (lighter than the build-rendered home card). This was already the case before this phase. Fix candidates: prerender the segment OG images at build, or embed the fonts as base64. It's logged for Phase 6 or the TanStack migration's OG work.
