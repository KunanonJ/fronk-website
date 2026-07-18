# WP-09 QA report — 375 / 768 / 1440

**Date**: 11-07-26  
**Agent**: QA  
**Status**: PASS (with notes)

## Evidence

| AC | Result | Evidence |
|----|--------|----------|
| AC-09.1 Layout | PASS | Smoke + visual green on home/about/now/ventures/writing/contact/resume at mobile/tablet/desktop |
| AC-09.2 Spacing | PASS | Visual baselines refreshed; no overlapping chrome in captures |
| AC-09.3 Typography | PASS | Inter fallback; headings visible; no clip reported in smoke |
| AC-09.4 Contrast | PASS | Dark `#1c1d20` + white text; forced dark-only |
| AC-09.5 Overflow | PASS | Visual full-page captures; miniature desktop chrome |
| AC-09.6 Interactions | PASS | Nav Work/About/Contact; menu Esc/focus; contact form success/error |
| AC-09.7 A11y | PASS | Skip link Tab test; PRM home test; labeled contact inputs |
| AC-09.8 Visual consistency | PASS | Snapshots updated Chromium 375/768/1440 |
| AC-09.9 Console | PASS | Smoke 27 passed, zero console errors |
| AC-09.10 Suite | PASS | `pnpm test` 185; `pnpm typecheck` clean; smoke + visual green |
| AC-09.11 Report | PASS | This file |

## Commands run

```bash
pnpm test
pnpm typecheck
pnpm exec playwright test tests/e2e/smoke.spec.ts --project=mobile --project=tablet --project=desktop
pnpm exec playwright test tests/e2e/visual.spec.ts --project=mobile --project=tablet --project=desktop --update-snapshots
```

## Notes / follow-ups (owner)

- Drop licensed Söhne `woff2` into `public/fonts/soehne/` to replace Inter
- Replace `public/profile.jpg` with cutout if desired
- `/studio` and `/resume` not visually redesigned (out of scope)
