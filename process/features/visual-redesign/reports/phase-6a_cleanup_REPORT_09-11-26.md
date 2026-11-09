# Phase 6a report: cleanup, nav without framer-motion, dev speed (09-11-26)

**Plan:** `../active/phase-6_cleanup-guardrails_PLAN_09-11-26.md` (split: 6a cleanup here; 6b = Linux visual baselines in CI, the head snapshot for the migration, closeout)
**Branch:** `feat/redesign-cleanup`
**Mode:** EXECUTE under the owner's standing approval.

## Owner decisions (09-11-26, at phase entry)

- `/stock/velorah`: retired, 308 to `/` (done here).
- `/design`: kept as a noindex style sheet.
- Visual tests: Linux baselines plus a CI job (Phase 6b).
- Hubs: add the landing nav once it is slimmed (done here).

## What changed

- **Dead code** (confirmed by `knip --production`, then each file grep-checked):
  - 90 files deleted with their tests: `components/{home,hud,hero,layout,content,icons,brand,work,writing,contact,motion}/*`, the root `Hero`, `DraftBanner`, `FAQ` and `PostAuthor`, `ui/{Badge,CornerTicks,Prose,Reveal,SectionHeader}`, `landing/{WordsPullUp*,AnimatedLetter,EditorialStubPage}`, the stale lib helpers, `scripts/measure-cwv.mjs` (its routes no longer exist) and `/stock/velorah` with `components/landing/stock/*`;
  - the unused Sanity fetch helpers and their 8 GROQ queries, the stale `nav` in `lib/site.ts`, and the Lenis/GSAP gates in `lib/motion/motionRuntime.ts`.
- **Dependencies removed:** `framer-motion`, `three`, `@types/three`, `gsap`, `lenis`, `prettier-plugin-tailwindcss` (no Prettier config loaded it). `knip.json` declares the real entries (OpenNext config, cron worker, scripts) and ignores the agent-harness folders. **knip now reports no unused files or dependencies.** Left: 7 unused exports/types (`lib/sanity/types` CMS shapes, `sanity/env` secrets, two skills constants, `pickOptionalString`): harmless, listed for later.
- **Nav without framer-motion:**
  - `LandingTopNav` animates with CSS only: `@starting-style` via Tailwind `starting:`, `motion-reduce:` off;
  - the reduced-motion check for smooth scrolling reads `matchMedia` at click time;
  - new `LandingTopNav.test.tsx` (open/close, Escape, Library menu, `aria-current`).

  This cut **about 44 KB gz of first-load JS from every page with the nav** (`/skills` 235.7 → 191.0 KB, `/portfolio` 239.9 → 195.2 KB).
- **Hubs get the nav:** topic (EN/TH) and venture hubs now carry the landing nav at 190.1 KB, inside the 205 KB default budget they had without it.
- **Aliases out:**
  - `app/globals.css` went from 796 to 441 lines. The legacy colour/font aliases (`--bg`/`--fg` group, `--landing-*`, `--color-cream/primary/landing`, the retired font names), the HUD/brutalist utilities, unused keyframes, the film-grain overlay, the showcase tokens and `liquid-glass` are gone;
  - 169 mechanical class replacements moved the last users to the role tokens with no visual change (`text-primary` → `text-ink`, `fill-pos` → `fill-success`, ...);
  - `::selection` is Signal; the keyword tooltip is an inverse Ink bubble at 12 px; the custom cursor uses tokens (it was still Clay-era cream, low contrast on the light page);
  - `globals.test.ts` now forbids the aliases from returning.
- **Bug fixed:** `CopyButton`'s "Copied" check used `text-success-text`, which isn't a utility (the colour is `text-success`).
- **Ratchets to zero:** sub-12 px text 0, raw hex 0 (no allowlist growth).
  - `scripts/ux-probe.mjs` now applies WCAG 2.5.8's exceptions (visually hidden controls, links inside a sentence).
  - The last real small targets (a pinned-commit link alone in its cell, blog card titles) are 24 px.
- **Budgets lowered** to the measured worst + about 5%: default 205 → 200 KB, marketing 300 → 255 KB. The obsolete Three.js leak check is gone with `three`.
- **Hygiene:** lint 4 warnings → 0. `AGENTS.md` is committed in the form `next build` writes, so builds stop dirtying it.
- **Dev speed (owner request, 09-11-26):**
  - Vitest runs as two projects: jsdom only for component tests and 4 browser-API `.ts` tests, Node for the other 50. Local run 14.1 s → about 6 s; the 53 s CI test step should roughly halve.
  - `pnpm sanity:manifest` skips the 7 s extract when the schema inputs are unchanged (0.6 s), with a matching CI cache.

## Measured dev loop (local, after)

| Step | Time |
|---|---|
| `next dev` ready / first page compile | 0.4 s / 0.4-1.2 s (4 s for a skill page) |
| `pnpm typecheck` (TypeScript 7, native) | 0.9 s |
| `pnpm lint` | 3.3 s |
| `pnpm test` | about 6 s (was 14 s) |
| `pnpm build:cloudflare` | 24 s with an unchanged schema (was about 45 s) |

The slow parts of a phase are CI and deploy waits and the verification suite, not the tools. Two process changes for the remaining work:
- run e2e and the sweep concurrently on one preview (done here: both in 1.4 min instead of about 3.5);
- build the Workers bundle once per round of checks, not after every small change.

## Verification Evidence

| Gate | Result |
|---|---|
| `pnpm typecheck` / `lint` / `test` | Pass; lint 0 problems; 69 files, 419 tests |
| `build:cloudflare` + `perf:budget` | Pass at the new budgets (worst default route 190.1 KB, worst marketing route 243.0 KB on the hidden blog posts) |
| e2e smoke + a11y (desktop + mobile, both themes) | 120/120 |
| Scripted review (20 routes × 2 viewports × 2 themes) | Clean |
| Text and targets (22 routes × 390/1440 × light/dark) | No text under 12 px outside SVG illustrations; no target under 24 px (WCAG 2.5.8) |
| Redirects | `/stock/velorah` and `/showcase` → 308 `/` |
| Nav | CSS-only menu and dropdown verified in both themes (screenshots); unit test 3/3 |
| knip | No unused files or dependencies |
