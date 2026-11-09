# Phase 1 report: Chrome (09-11-26)

**Plan:** `../active/phase-1_chrome_PLAN_09-11-26.md`
**Branch:** `feat/redesign-chrome`
**Mode:** EXECUTE (owner: "Yes, start Phase 1"). Owner decision at entry: keep the nav icons, quieter.

## What changed

- **Nav** (`components/landing/LandingTopNav.tsx`):
  - surface pill with a hairline (`shadow-card` in light);
  - inactive links in `ink-2`; the active link on a Glaze (`surface-tint`) fill with a 6 px square in the link colour;
  - icons kept at 60% opacity;
  - Contact is an Ink pill (Glaze in dark);
  - the Library menu is restyled on the same tokens;
  - mobile rows are 48 px, and the mobile Library heading is a 12 px mono label;
  - the wordmark link is 36 px tall.
- **Menu button:** a plain `<button>` with a CSS press effect replaces `motion.button` `whileTap`. That fixes the dev-only hydration warning under reduced motion (general backlog P3).
- **Theme toggle** (`components/ThemeToggle.tsx`): assumes the light default before mount, so first-time visitors no longer get a "Switch to light theme" label. Restyled on tokens.
- **Focus ring:** one base rule in `app/globals.css` gives every link, button and field a 2 px `--focus` ring. It lives in the base layer, so component focus utilities still win.
- **Footer** (`components/landing/LandingSiteFooter.tsx`):
  - a contact block;
  - Work (new `footerWork`: About, Ventures, Portfolio, Skills), Library and Elsewhere (socials plus agent files, still `BLOG_PUBLIC`-aware) columns;
  - an oversized `aria-hidden` "Kunanon" wordmark;
  - a small-print row.

  Links are at least 32×32 px, and `id="contact"` is kept.
- **404** (`app/not-found.tsx`):
  - `PixelGrid state="failed"` on a Paper card beside the visible "404 · Not found" label;
  - Home (primary), Portfolio, Ventures and Contact. Contact now goes to `/contact`; it used to point at `/#contact`.
  - `id="main"`; the status stays 404.
- **Ratchet:** the sub-12 px text ratchet drops from 35 to 30.

## Verification Evidence

| Gate | Result |
|---|---|
| Nav clearance (gap from the link group to the wordmark / to the toggle and Contact; 768-1440 px, top and scrolled) | Pass: at least 45 px on each side at every width. Production before: at least 50 px; the active-item square adds 12 px to the active link |
| Hero gaps (from Phase 0) | Unchanged: 39-96 px |
| Keyboard (1440 px, light and dark) | Tab order: skip link, wordmark, About, Ventures, Portfolio, Skills, Library, theme toggle, Contact, content. Every stop has a visible ring. Library: Enter opens, Escape closes |
| Mobile menu (390 px) | All 10 rows are 48 px; Escape closes |
| Tap targets at 390 px (probe), production before → branch | Home 14 → 1, Portfolio 14 → 1, Contact 14 → 1, About 27 → 14. The 1 left is the visually hidden skip link; About's rest are page-body links (Phase 3). No nav or footer target is under 24 px |
| Sub-12 px text at 390 px (probe) | Home 6 → 3, About 15 → 12, Portfolio 37 → 34, Contact 3 → 0 |
| Hydration warning (`next dev`, reduced motion, phone; `/portfolio`, `/about`) | None |
| `pnpm typecheck` / `lint` / `test` | Pass; 0 errors (5 baseline warnings); 91 files, 502/502 |
| `pnpm build:cloudflare` / `perf:budget` | Pass (worst 292.1 KB, unchanged) |
| e2e smoke + a11y (desktop + mobile, both themes) | 100/100 |
| Scripted review (20 routes × 2 viewports × 2 themes) | No overflow, no serif fallback, no page errors |
| Screenshots | Nav (active state), Library menu, footer, 404, light and dark: reviewed |

## Notes for later phases

- **PixelGrid in dark mode:** Glaze cells are bright on the dark card. Consider a dimmer dark-mode tint when Phase 2 uses the motif in the home hero.
- **About:** its page-body links (company names in the experience list) are 21 px tall. Fix them in Phase 3.
