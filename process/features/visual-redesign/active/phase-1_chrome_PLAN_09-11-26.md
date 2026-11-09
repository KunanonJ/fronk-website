# Phase 1: Chrome (nav, theme toggle, footer, 404)

**Status:** EXECUTED 09-11-26 on `feat/redesign-chrome` (owner approved starting Phase 1; nav icons kept, quieter). All gates green; PR open, waiting on merge approval. Evidence: `../reports/phase-1_chrome_REPORT_09-11-26.md`.
**Created:** 09-11-26
**Umbrella:** `visual-redesign_UMBRELLA_PLAN_09-11-26.md`
**Covers:** audit finding 10 (footer and nav tap targets), and finding 20's reduced-motion hydration warning if it is still in the nav toggle.
**Depends on:** Phase 0 (tokens, `Button` `inverse`, `MonoLabel`, `PixelGrid`)

## Objective

Every route gets the same quiet chrome: a floating pill nav with a clear active state, an Ink Contact pill, a restyled theme toggle, a three-column footer with an oversized name wordmark, and a 404 that uses the pixel motif.

## Owner decision (at entry)

- **Nav icons.** The owner asked for icons in the nav on 04-11-26 (#50). The research recommends text-only labels (mymind, T1 Energy). Options:
  - keep the icons, smaller and quieter (`ink-2`, 16 px);
  - drop them for text labels.

  Default: keep, since the request was recent, unless the owner says otherwise.

## Known levers (verify at entry)

1. **Nav** (`components/landing/LandingTopNav.tsx`; data in `lib/content/landing.ts` `primaryNav`/`navCta`):
   - surface pill with hairline and `shadow-card` (light) or hairline only (dark);
   - 14 px/500 labels;
   - active item: Glaze fill (dark: `surface-tint`) plus a 6 px Signal square marker (dark: `#8E97FF`);
   - Contact as the `inverse` pill;
   - Library menu restyled with the same tokens.

   Keep the centring fix from #50 (`-ml-8`, at least 23 px clearance at the 720 px scrolled pill) and the 1024 to 1279 px hero spacing from #51. Re-measure both.
2. **Mobile menu:** full-width sheet, rows at least 48 px, `aria-expanded` and focus handling kept, `Escape` closes.
3. **Theme toggle** (`components/ThemeToggle.tsx`): 40 px target kept; icon swap without the animation that triggers the hydration warning (general backlog P3); focus ring on `--focus`.
4. **Footer** (`components/landing/LandingSiteFooter.tsx`):
   - three columns: Work (Ventures, Portfolio, Skills), Library (`footerLibrary`), Elsewhere (`socials` plus the agent resources in `footerResources`);
   - a giant "Kunanon" wordmark (Ink, about 18vw, `aria-hidden`; the visible name stays in text);
   - a small print row;
   - every link at least 24 px tall;
   - `rel="me"` stays in `<head>` (`lib/seo/identity.ts`), not in the footer;
   - the `BLOG_PUBLIC`-conditional `feed.xml` link is kept.
5. **404** (`app/not-found.tsx`):
   - status stays 404;
   - `PixelGrid state="failed"` with a visible "Not found" label;
   - links: Home, Portfolio, Ventures, Contact. Verify the current `/#contact` link target exists; otherwise use `/contact`.

## Touchpoints

`components/landing/LandingTopNav.tsx`, `components/ThemeToggle.tsx`, `components/landing/LandingSiteFooter.tsx`, `app/not-found.tsx`, `lib/content/landing.ts` (only if the nav or footer data shape changes), plus tests that assert the nav and footer data (`lib/content/library.test.ts`, `lib/content/blogVisibility.test.ts`).

## Gates

- **Measurement:** nav pill clearance at 720, 1024, 1280 and 1440 px widths (no overlap with the wordmark or Contact).
- **Accessibility:** keyboard pass through the nav, Library menu, mobile menu and toggle with a visible focus ring in both themes; axe green on every route in both themes.
- **Tap targets:** probe at 390 px reports footer and nav targets at 24 px or more; the mobile menu rows are 48 px.
- **Ratchets:** the type-floor ratchet is lowered by the count this phase removes.
- **Screenshots:** every route at 390 and 1440, light and dark (chrome only changes, but on every page).
- **Standard gates.**

## Out of scope

Changing which items the nav shows (owner decision, separate). Blog and Press stay hidden. Page bodies.
