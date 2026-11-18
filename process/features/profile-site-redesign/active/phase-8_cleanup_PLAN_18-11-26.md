# Phase 8: Cleanup, guards and speed

**Status:** PLANNED (18-11-26). Needs its own "ENTER EXECUTE MODE".
**Created:** 18-11-26, at `563b2a3`.
**Umbrella:** `profile-site-redesign_UMBRELLA_PLAN_18-11-26.md`
**Spec:** `../references/design-spec_18-11-26.md` sections 2, 3, 12 and 13.
**Inventory:** sections 1.4 (fonts), 1.7 (images and share images), 3.12
(guards), 8.6 and 8.7 (budgets, knip) and 9.6 (stale documents).
**Report target:** `../reports/phase-8_cleanup_REPORT_{dd-mm-yy}.md`

## Objective

Leave one design system in the repo: delete what the redesign replaced, make
the guards pin the new system, carry it into the share images and icons, and
prove the site is as fast and accessible as before.

## Work

| Step | Scope |
| --- | --- |
| 8a | **Delete the old system.** Geist and Geist Mono files and `@font-face` rules; old bento components, class strings and hooks no longer used (`components/bento/*` that nothing imports, `classes.ts` strings, the `kj-*` keyframes the intro does not use); the Bangkok scene and clock if R14 retired them; fold the scoped `[data-design="profile"]` block into `:root` and `.dark`, and delete the attribute and the old values (spec section 2.13); `components/ui/Button.tsx` (backlog P3). knip must be clean |
| 8b | **Guards pin the new system.** `globals.test.ts`: the new palette values in both themes, the new font families (Geist added to the banned list, Inter and Lenis still banned), the motion contract, the theme rules. `sharedPrimitives.test.ts`: the new single-source class strings (pill, chip, tile, eyebrow, hero h1 and lead). `rawHex.test.ts`: drop the old `app/` allowlist paths. `contrast.test.ts`: every pair in both themes, and the `prefers-contrast: more` values. `typeFloor.test.ts` stays at 12 px. `lib/brand/tokens.ts` takes the new palette and a test that compares each value with the root tokens in `globals.css`, so the hand-kept mirror cannot drift again. The `wcag22aa` axe tag covers every route |
| 8c | **Share images and icons.** `lib/og/*` and `src/server/og/*` in the new style: paper or ink ground, violet accent, a dither band, the title in Instrument Serif and the rest in Onest (TTF files with their OFL texts in `lib/og/fonts/`); `/icon` and `/apple-icon` with the K monogram in the new palette; `lib/brand/tokens.ts` header comment fixed. Re-shoot `public/portfolio/kunanonj-com/cover.webp` from the new Home and rewrite its alt text, because today's file shows the old Home |
| 8d | **Speed.** Fonts: only the two preloaded latin files on first load, subsets checked; the dither canvases draw once per size and theme, off the main thread's busy moments (idle callbacks), with no animation loop; images sized and lazy below the fold; first-load budgets measured and, if there is room, tightened. `pnpm probe` on the live site for `/`, `/about`, `/portfolio/tbh-intranet`, `/topics/forward-deployed-ai-engineering` and a Thai hub: LCP, CLS, TBT recorded against the numbers from before Phase 6. Compare 28 days of field Core Web Vitals and the R22 measures after cutover with the "before" numbers Phase 6 recorded; the CSS and font ratchets of Phase 0 tightened to the new measurements |
| 8e | **Accessibility audit.** Reduced motion turns off every animation and View Transition; everything that moves for more than 5 s has a pause control (marquee, motion tile, orbit, notebook, animated showcase tiles); focus is never hidden under the nav; keyboard paths through the popover, menu, viewer, notebook and orbit; axe with `wcag22aa` in both themes on every route; forced colors, `prefers-contrast: more`, reduced transparency, text spacing and 200% zoom on every page family; screen reader passes (VoiceOver, TalkBack, NVDA) on the pages Phase 6 did not cover |
| 8f | **Docs.** README (design section, the stale intro and route notes), AGENTS.md project notes (palette, fonts, pill nav, motion rules), `process/features/CURRENT_FEATURES.md`, the design spec marked as live, superseded notes on the old design specs (`tanstack-migration` phase 7, `docs/redesign/*`), backlog items closed or carried; the design system artifact re-synced from the repo and its README saying the repo leads |
| 8g | **Content Security Policy (R21).** Default: a `Content-Security-Policy-Report-Only` header in `public/_headers` and `SECURITY_HEADERS` (`src/server/http.ts`), with hashes for the inline theme and intro scripts and the analytics and Turnstile origins allowed; a smoke test fails on any CSP violation in the console. The parity reference records the new header as an intended change. Enforcing the policy is a later owner decision |

## Touchpoints

`src/fonts/`, `src/styles/fonts.css`, `src/styles/globals.css`,
`components/bento/*`, `components/ui/Button.tsx`, `lib/design/*.test.ts`,
`lib/og/*`, `src/server/og/*`, `lib/brand/tokens.ts`,
`public/portfolio/kunanonj-com/cover.webp`, `lib/content/portfolio.ts` (alt
text), `scripts/check-first-load-budget.mjs` (if tightened), README.md,
AGENTS.md, process docs.

## Public Contracts

Share images and icons change look. Nothing else public changes.

## Blast Radius

Deleted code (knip proves nothing used it), share images for every page, the
icons, the guards.

## Validation gates

1. The CI gates as in Phase 0 gate 1, smoke and axe on all routes in both
   themes, all baselines unchanged except pages whose look this phase meant
   to change.
2. knip clean; no Geist file in the build output.
3. Share images render for Home, About, a project, a skill, a topic and a
   venture, and are reviewed.
4. `pnpm probe` numbers recorded and no worse than before Phase 6, or the
   difference explained and accepted by the owner.
5. The accessibility audit list in 8e passes, with evidence per item.
6. The R21 policy reports no violation on any route; the R22 comparison is in
   the report; every row of the best-practices audit is marked done or
   carried with a reason.

## Blockers that justify BLOCKED

- A deletion breaks a page that knip did not see (dynamic import, CSS hook):
  restore it and record why.
- The speed numbers are worse and the cause is the reference's design itself
  (for example the font set): take it to the owner.

## Resume and Execution Handoff

- **Execute anchor:** this file. Phase 7 must be merged.
- **After this phase:** UPDATE PROCESS closes the program: plans to
  `completed/`, the umbrella's status table filled, CURRENT_FEATURES.md marked
  complete.
