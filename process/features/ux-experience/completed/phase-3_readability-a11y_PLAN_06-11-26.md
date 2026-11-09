# Phase 3: Readability and accessibility

**Status:** SUPERSEDED 09-11-26 by visual-redesign (see its umbrella mapping table: `process/features/visual-redesign/completed/visual-redesign_UMBRELLA_PLAN_09-11-26.md`). Not executed; its findings are folded into the redesign phases.
**Created:** 06-11-26
**Umbrella:** `ux-experience_UMBRELLA_PLAN_06-11-26.md`
**Covers audit findings:** 9 (10 px text), 10 (tap targets), 11 (duplicate "Learn more"), 12 (DuckDuckGo icon 404s on `/resume`)
**Depends on:** Phase 0 (contact markup settled)

## Objective

No visible text under 12 px, no tap target under 24x24 CSS px on phones, unambiguous link names, no third-party icon requests, and axe clean on every public route in CI.

## Known work (verify at entry)

1. **Type floor.** Grep `text-[10px]`, `text-[11px]` and any equivalent tokens. Eyebrows and footer group headings go to 12 px; dates, tags and meta go to 13 px. Keep the uppercase tracking look by adjusting letter-spacing, not by keeping the size.
2. **Tap targets.** Footer socials and the Library, Agents and inline link lists get `inline-flex min-h-6` (24 px), with padding instead of a bigger font. Back links ("Back to Blog", "All projects") get the same. Keep the visual density; grow the hit area.
3. **Link purpose.** Give each venture "Learn more" an accessible name ("GoGoCash: learn more") with sr-only text. Find out why each card renders twice (mobile and desktop variants). If both are in the accessibility tree, hide the inactive one properly or render one responsive card.
4. **`/resume` logos.** Replace `icons.duckduckgo.com` favicons with self-hosted SVG or PNG in `public/brand/companies/`, falling back to a monogram. This fixes the 404s and stops the third-party request.
5. **Reduced-motion hydration warning** (general backlog P3). Make the nav toggle a plain `<button>` around the animated icon.
6. **axe coverage.** Make sure `tests/e2e/a11y.spec.ts` iterates every route in `tests/e2e/routes.ts` at phone and desktop sizes and fails on serious or critical issues. Add it to CI if it isn't there yet (check `.github/workflows`).

## Gates

Probe: `tinyText = 0` and `smallTargets = 0` (excluding the sr-only skip link) on every route; axe green; no new third-party hosts in the network log for `/resume`; plus all standard gates.

## Out of scope

Colour palette changes beyond what contrast requires. The 04-11-26 contrast fix already covers AA.
