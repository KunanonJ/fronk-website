# Phase 7: Bento redesign (report, 10-11-26)

The approved bento canvas (https://claude.ai/artifact/X9f4PqkFMM4sxCw3pnDeNu)
is live on every page. The plan was
`../completed/phase-7_bento-redesign_PLAN_09-11-26.md` and the build spec
`../references/phase-7_design-spec_09-11-26.md`.

## Shipped

| PR  | Scope |
| --- | --- |
| #86 | **7a:** tokens and ink buttons; motion system with typed view transitions; new header (share panel, theme reveal, site menu); canvas footer with the "For agents" row; Bangkok card with a client-side GMT+7 clock; the intro's celebratory burst; old chrome retired; bento Home |
| #89 | The site menu is server-rendered and hidden while closed, so crawlers can follow its links |
| #90 | **7b:** About (real GitHub activity), Contact (all form states) and Résumé in the site layout with a typed `?view=` |
| #91 | **7c and 7d:** venture and topic hubs in English and Thai; Skills with a typed `?show=` and Skill pages for all 20 skills |
| #95 | **7e, 7f and 7g:** Portfolio with `?category=` and a byline on every project; Learn, Examples, Stack, Proof and Build with typed filters; 404 and the error state; `/design` documenting the system; hidden Blog, Post and Press. Every page is on the 1000 px canvas column, so the interim width switch is gone |

## Owner decisions applied

- **Intro:** kept, ending in a CSS-only confetti burst that is off under
  reduced motion.
- **Removed:** the custom cursor and the keyword tooltips.
- **Buttons:** primary buttons are ink.
- **Ventures:** `/#ventures` anchors to the Home ventures card.
- **Footer:** keeps a compact "For agents" row.

## Gates at the end

- Static checks: typecheck, lint (0 warnings), format and knip are clean;
  747 unit tests pass and the ratchets stay at 0.
- First-load budgets pass:
  - worst marketing route: `/contact`, 214.7 KB of 255;
  - hubs: under the default budget, which rose to 210 KB with the reason
    recorded in `scripts/check-first-load-budget.mjs`.
- Route loaders are split out of the entry chunk, which saves about 1.7 KB
  on every route.
- Parity: 0 differences; smoke and axe pass 164 checks in both themes; 88
  Linux visual baselines pass.
- Production console sweep after #95: 63 pages in both themes, 0 errors or
  warnings.

## Lessons

- **Parallel worktrees worked** once the gates took a port (`GATES_PORT`).
  - The real cost was conflicts in shared files: `src/ported-routes.json`,
    `tests/e2e/smoke.spec.ts`, the layout's route list and the baseline
    PNGs.
  - Fix them by union-merging the `intended` lists, rebuilding test files
    from both sides, and regenerating baselines on the final state.
- **Hardcoded counts break later work.** The Learn grid and tests assumed
  three topic hubs, and EO-2 added a fourth. Derive counts from content.
- **The local gates filter smoke tests by route name**, so the new filter
  tests only ran in CI. Run the full `smoke.spec.ts` once before pushing.
