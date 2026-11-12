# Report: Tap areas on phones

**Plan:** `../active/mobile-tap-targets_PLAN_12-11-26.md`
**Status:** Steps 1 to 4 are done on branch `fix/mobile-tap-targets`.
- **Pass:** gates 1 to 3 and 5 to 7.
- **Open:** gate 4, CI's `visual` job on the pull request, and gate 8, the
  phone audit after the merge.
- **Waiting:** step 5, for the owner's details.

**Base:** `3b82323` on `main`.

## Owner answers used (12-11-26)

- **Request:** "please make it support mobile responsive".
- **After the audit:** "Something I saw" and "The small issues". The owner
  has not yet given details of the first.
- **Picture labels:** "A", leave them.
- **Execution:** "ENTER EXECUTE MODE".

## What changed

| Step | Change |
| --- | --- |
| 1 | `components/bento/SiteFooter.tsx`: `LINK` gains `-mx-[8.5px] px-[8.5px] min-w-6 justify-center`, and both footer rows use it. The X link goes from 7.89 to 24.89 px wide |
| 2 | `components/landing/home/HomeCards.tsx`: the project names gain `-mt-1 pt-1` and go from 22.16 to 26.16 px tall |
| 3 | `components/landing/skills/SkillsIndexPage.tsx`: the adapted-skills links gain `-mx-1.5 px-1.5 min-w-6 justify-center`. "pr" goes from about 15.5 to about 27.5 px wide, and "how" from 23.3 to 35.3 px |
| 4 | `tests/e2e/smoke.spec.ts`: "tap areas > at phone widths, 24 px or more, apart and uncovered", with 16 cases: seven pages and the open menu, each at 320 and 390 px |

In every step, the padding is taken back by an equal negative margin, so
the tap area grows and the text stays where it was.

## Gates

**Final tree:** `8ce32123f3d2ddc7`, the git tree of every file outside
`process/`. Gates run from 06:48 to 06:51 UTC on 12-11-26. Each step got the
environment CI gives it, and the Sanity write token was unset.

| Gate | Result |
| --- | --- |
| 1 | Typecheck, lint, format, unused code and unit tests pass on Node 26.12.0 and on Node 22.23.4: 993 tests in 112 files on each |
| 2 | Build and first-load budget pass on both. The entry chunk is 107.7 KB on Node 26 and 107.9 KB on Node 22, of 120 KB |
| 3 | Smoke and accessibility, desktop, on the production build, Node 22.23.4: 201 passed (185 before, and the 16 new cases) |
| 4 | **Open:** CI's `visual` job on the pull request. A changed baseline stops the merge |
| 5 | Parity: 137 URLs compared, 0 with differences, with no new crawl |
| 6 | Mutation checks, below. Every file was restored byte for byte |
| 7 | Two independent reviews; see "Review" |
| 8 | **Open:** the phone audit on production, after the merge |

Local runs set `PLAYWRIGHT_BASE_URL=http://localhost:3000` (see "Found along
the way").

## Mutation checks

| Mutation | Test version | Result |
| --- | --- | --- |
| M1: footer padding removed | first | Fails on `/` and `/skills` at both widths (tap area under 24 px) |
| M2: Home name padding removed | first | Fails on `/`, passes on `/skills` |
| M3: skills padding removed | first | Fails on `/skills`, passes on `/` |
| M4: footer padding raised to 10 px | first | Fails on overlap at both widths |
| H1: name colour changed (harmless) | first | Passes |
| M2b: top padding on the project names removed | second | Fails on `/`; the menu cases pass |
| M6: menu rows lose `min-h-11` | second | Fails on the menu; `/` passes |
| H1b: name colour changed (harmless) | second | Passes |
| M5: a missing page added to the list | second | Fails: expected 200, received 404 |
| M7: a fixture page for the helper | final | See the list below the table |
| M8: the first review's shape, `-my-1 py-1`, put back on the project names | final, production build | Fails at both widths: the tagline (`SPAN`) covers the bottom edge of all three names |

**M7, the fixture:**

- **Measured and too small:**
  - two links alone in a `div`;
  - a link next to screen-reader-only text;
  - a link next to an `aria-hidden` glyph.
- **Exempt:**
  - a link in a sentence;
  - a link in an `inline-block` wrapper inside a sentence.
- **Coverage:** a link under an overlay is reported as covered, and the same
  link without the overlay is not.

**Where they ran:** M1 to H1b ran on the dev server, against `/`, `/skills`
and the menu; M5, M7 and M8 ran against the production build.

**Why the early runs still count:** the size and overlap checks are the same
in all three versions of the test. The final version added the coverage
check and the new exemption rule, and M7 and M8 test those.

## Review

Two independent reviews (gate 7). Each was read-only and got the code and
the plan, but none of my verdicts.

**First review, of steps 1 to 4:** no must-fix.

| Severity | Finding | What changed |
| --- | --- | --- |
| should-fix | With `-my-1 py-1`, the focus ring crossed the tagline | Top-only padding on the project names |
| should-fix | The tagline painted over the bottom padding, so the real tap area was 25.75 px, not 30 | Same change |
| should-fix | The test passed on a 404 page | Status 200, the h1, and at least one target |
| nit | The exemption rule was too broad and too narrow | Rewritten |
| nit | The inline venture names did not need padding, and some figures were off | Left alone, figures corrected |
| nit | The open menu and tablet widths were not measured | Menu case added; tablets left out, since the plan covers phones |

What the first reviewer checked by running the pages:

- Text rectangles are unchanged on the seven pages at 320, 375, 390 and
  1440 px.
- Full-page screenshots are byte-identical on six page and width pairs.
- No page scrolls sideways on 28 pairs.

**Second review, of the fixes:** no must-fix.

| Severity | Finding | What changed |
| --- | --- | --- |
| should-fix | The exemption counted other links, screen-reader-only text and `aria-hidden` glyphs as sentence text | It counts only visible text outside every target and outside `aria-hidden` |
| should-fix | The test could not see a target painted over by something that is not a target | Hit test at the centre and just inside the middle of each edge |
| nit | `inline-block` wrappers were not looked through | Looked through, along with `inline` and `contents` |
| nit | The describe title shared the `mobile` project's name | Renamed |
| nit | No explicit wait for the menu button | `toBeVisible` added before the click |

What the second reviewer checked:

- `-mt-1 pt-1` moves no text, tagline or tag (0 px) at 320 and 390 px.
- Nothing tappable lies under the new top padding.
- The closed menu is `display: none`, and the open menu has 13 targets.
- Reduced motion leaves no animation to measure part way through.

The second round's fixes were checked with M7 and M8, not by a third review.

## Deviations from the plan

See the plan's "Deviations (12-11-26)". In short, step 2 pads only the top
of the project names, and step 4 grew: the status check, the new exemption
rule, the open menu and the coverage check.

## Found along the way

- **Local servers and the Playwright address.** `vite dev` and
  `vite preview` listen on `localhost`, which resolves to IPv6 (`::1`) on
  this Mac, while `playwright.config.ts` defaults to `http://127.0.0.1:3000`.
  The dev server timed out until `PLAYWRIGHT_BASE_URL=http://localhost:3000`
  was set. CI is not affected.
- **`/about` on the dev server.** On `pnpm dev`, `/about` never reaches
  `networkidle` under the Playwright runner. The existing test "About answers
  a recruiter in its closing card" times out the same way. The production
  build is fine.
- **The coverage check on the dev server.** On `pnpm dev`, a dev-only
  floating control at the bottom right (an SVG circle) covers targets, so the
  coverage check fails there. Run it against `pnpm start`, as CI does.
- **Node 22.** `.node-version` pins 22.23.4, and Node 22.23.5 is out:
  `npx node@22` fetched it. Upgrading is left for a separate change.
- **Portfolio pictures.** By the owner's choice A, their labels stay 3 to 7 px
  on phones. The pictures are captioned as illustrations, and pinch zoom
  works.

## Still to do

- Gate 4, on the pull request.
- Gate 8, after the merge: the phone audit on production.
- Step 5, when the owner describes what they saw.
