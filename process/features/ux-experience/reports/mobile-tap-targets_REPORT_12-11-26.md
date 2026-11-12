# Report: Tap areas on phones

**Plan:** `../active/mobile-tap-targets_PLAN_12-11-26.md`
**Status:**
- **Steps 1 to 4:** merged as pull request #117 (`71f2586`) at 06:57:09 UTC
  on 12-11-26, live by 06:58:22. All eight gates pass.
- **Step 5,** the owner's report: on branch `feat/share-icon-phones`. Its
  gates are under "Step 5", and its check on production comes after the
  merge.

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
| 4 | Passed: CI's `visual` job on #117's head `70f291c`. The pull request changed no baseline file |
| 5 | Parity: 137 URLs compared, 0 with differences, with no new crawl |
| 6 | Mutation checks, below. Every file was restored byte for byte |
| 7 | Two independent reviews; see "Review" |
| 8 | Passed on production after the deploy, from 06:58 UTC, GET only. The merged rules ran on an iPhone SE (320 px), a Galaxy S8 (360) and an iPhone 13 (390), on the seven pages and the open menu: 24 of 24 clear. The 50-page audit on four phones: tap areas under 24 px went from 54 on 49 pages to none, nothing scrolls sideways, and every page answers 200 |

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

## Step 5: the owner's report (12-11-26)

The report, the owner's choices and the widths before and after are in the
plan, under "Step 5 (12-11-26)".

**Owner answers used:** "Share on its own row" and "The grey ‹ tab"; then
"Icon-only Share on phones"; then "Icon plus slimmer buttons"; then "ship
it", after screenshots at 390 and 440 px.

**The grey "‹" tab:** not the site's. The page has no fixed or sticky
element, and a render at the owner's width (440 px) has no tab. It is most
likely a Safari extension. Nothing changed for it.

**What changed, below 640 px only:**
- **`SharePill`** is a 56 px round icon, with its label hidden only
  visually.
- **The `lg` hero buttons** have 16 px side padding instead of 30.
- **On the résumé,** Download PDF takes the first row.
- **A smoke test,** "share pill > ...", covers the pill at 390, 639 and
  640 px.

**Gates.** Final tree `f6cc43a791ac2488`, the git tree of every file
outside `process/`, 08:09 to 08:10 UTC:

| Gate | Result |
| --- | --- |
| 1 | Typecheck, lint, format, unused code and unit tests pass on Node 26.12.0 and on Node 22.23.4: 994 tests in 112 files |
| 2 | Build and first-load budget pass on both: entry chunk 107.7 KB on Node 26 and 107.9 KB on Node 22, of 120 KB |
| 3 | Smoke and accessibility, desktop, on the production build, Node 22.23.4: 204 passed (201 before, and the 3 new share-pill cases). All 16 tap-area cases still pass |
| 4 | Visual baselines regenerated in the pinned image (`playwright:v1.64.1-noble`), see below. CI's `visual` job is on the pull request |
| 5 | Parity: 137 URLs compared, 0 with differences |
| 6 | Mutation checks: a visible label on phones fails the 390 and 639 px cases; a harmless colour change passes. Restored byte for byte |
| 8 | **Open:** after the merge, the width sweep and the tap-area rules on production |

**Baselines.** The phone baselines were rendered twice in the pinned image,
once from `main` (`36023fd`) and once from the branch, one run at a time.
Both runs passed 48 of 48, with the old phone files deleted first, so every
file is fresh.

- **Changed by this branch, and committed:** 30 files, 15 routes in both
  themes:
  - `home`, `about` and `design`;
  - `portfolio-diagrams`, `portfolio-project` and `portfolio-site`;
  - `skills` and `skill-detail`;
  - `topic-hub`, `topic-hub-fde`, `topic-hub-fde-th`, `topic-hub-th` and
    `topic-hub-th-short`;
  - `venture-hub` and `venture-hub-manut`.
- **Unchanged:** the other 18 phone baselines and every desktop baseline.
- **Older drift, left alone:** 9 committed phone baselines already differed
  from a fresh render of `main`, within the 1% tolerance.
- **Checked by eye, `main` beside the branch:** `topic-hub-fde-dark`,
  `venture-hub-dark`, `home-light`, `skills-light`, `portfolio-project-dark`
  and `topic-hub-th-short-light`.

**Found along the way:** two visual runs in parallel, one container each,
starved the full-page captures. Sixteen to eighteen `toHaveScreenshot` calls
timed out at 5 s, so those runs could not be trusted. Run the containers one
at a time.

## Still to do

- Step 5, gate 8: after the merge, the width sweep and the tap-area rules
  on production.
