# Plan: Tap areas on phones

**Status:** IN PROGRESS (12-11-26). Approved with "A, ENTER EXECUTE MODE"
on 12-11-26: steps 1 to 4, and option A for the picture labels.
- **Done:** steps 1 to 4. Gates 1 to 3 and 5 to 7 pass on the final tree
  (see the report).
- **Waiting:** gate 4 (CI's `visual` job) on the pull request, and gate 8
  after the merge.
- **Step 5** waits for the owner's details.

**Report:** `../reports/mobile-tap-targets_REPORT_12-11-26.md`. The
deviations are listed under "Deviations (12-11-26)".
**Created:** 12-11-26, at `3b82323` on `main`. Branch `fix/mobile-tap-targets`.
**Feature:** ux-experience.
**Research:** the phone audit of 12-11-26, summarised under "What the audit
found".
**Report target:** `../reports/mobile-tap-targets_REPORT_12-11-26.md`

## Owner request (12-11-26)

"please make it support mobile responsive". After the audit, asked what to
work on, the owner chose "Something I saw" and "The small issues". The first
waits for the owner's details (see "Waiting on the owner").

## What the audit found

Live site, 12-11-26, GET requests only, nothing but `kunanonj.com` and
`cdn.sanity.io` fetched.

- **Pages:** 50: the sitemap's 45, plus `/resume`, `/blog`, `/press`, `/design`
  and one address that does not exist.
- **Sizes:** nine:
  - phones upright: iPhone SE 320 × 568, Galaxy S8 360 × 740, iPhone 13
    390 × 664 and Pixel 7 412 × 839;
  - phones sideways: 568 × 320 and 750 × 342;
  - tablets: Galaxy Tab S4 712 × 1138, iPad Mini 768 × 1024 and iPad Pro 11
    sideways, 1194 × 834.

  WebKit ran the Apple devices and Chromium the Android ones.
- **Layout:**
  - No page scrolls sideways at any size, and nothing sticks out past the
    edge.
  - Every page answers 200; the missing address answers 404.
  - Every page sends `width=device-width, initial-scale=1`.
  - At 390 px, Home, About, Résumé, Skills, Contact and a project page are
    one column, and the menu opens as a full-width panel.
- **Tap areas under 24 px,** not counting links inside running text, as
  WCAG's inline exception allows. Exact sizes at 320 px:

| Where | Size | Pages |
| --- | --- | --- |
| Footer, the X link (a one-letter label) | 7.89 × 44 px | every page but `/design` |
| Home, the three project names in "Selected work" | 216 × 22.16 px | `/` |
| `/skills`, "how" and "pr" in an adapted-skills list | 23.31 × 43.81 and 15.54 × 43.81 px | `/skills` |

  WCAG 2.2's target-size rule (2.5.8) lets the X link through only by its
  spacing exception, since it has 18 px of gap around it. The site's own
  rule is larger: most links carry `min-h-11`, 44 px tall.
- **Overlapping tap areas:** none, on `/`, `/about`, `/skills`, `/portfolio`,
  `/portfolio/tbh-intranet`, `/contact` and `/resume` at 320 and 390 px, once
  links inside running text are left out. (A link inside running text that
  wraps onto a second line measures as one box spanning both lines, which
  overlaps its neighbours on paper only.)
- **Portfolio pictures:** `PortfolioMockup` draws 640 × 400 and scales to
  its card. The labels as rendered:

| Width | `/portfolio` cards | Project page |
| --- | --- | --- |
| 320 px | 3.2 to 5.7 px | 3.4 to 5.7 px |
| 390 px | 4.0 to 7.3 px | 4.1 to 7.0 px |
| 1440 px | 3.6 to 14.6 px | 11.2 to 19.1 px |

  On the cards the picture is `aria-hidden`. On project pages it is
  `role="img"` with a name, under the caption "Illustrative mockup, not
  real data".

## Decision for the owner: the picture labels

Raising the label sizes inside the drawing cannot make them readable on a
phone. At 390 px each label would need about 2.5 times its size, and the
labels would no longer fit the drawing.

| Option | What it means |
| --- | --- |
| A. Leave them (recommended) | The labels are placeholder text in an illustration that says so. Pinch zoom works, because the viewport tag allows it, and the SVG stays sharp |
| B. A phone crop on project pages | Show the left part of the drawing larger on phones. The smallest labels reach about 7 px, and the right side of the picture is cut off |
| C. Phone drawings | A portrait version of each of the four pictures, with fewer and larger labels. Readable, but four new drawings and new visual baselines |

Steps 1 to 4 do not depend on this choice.

**Owner's choice (12-11-26): A.** The pictures stay as they are.

## Approach

Each fix grows the tap area with padding and takes the same amount back
with a negative margin. The link's box gets larger while its text stays
where it is, so every page looks exactly the same and no visual baseline
should change. The only visible difference is the focus outline, which
draws around the larger area when the link has keyboard focus.

## Work

| Step | Scope |
| --- | --- |
| 1 | **Footer.** `LINK` in `components/bento/SiteFooter.tsx` gains `-mx-[8.5px] px-[8.5px] min-w-6 justify-center`. The X link becomes 24.89 px wide; with the 18 px gap, neighbouring areas stay 1 px apart. `min-w-6` only acts if a font fails to load and the glyph comes out narrower than 7 px. The "For agents" row uses the same `LINK` and gets the same areas |
| 2 | **Home names.** `NAME_LINK` in `components/landing/home/HomeCards.tsx` (three uses: the GoGoCash and Manut AI names, and the project names) gains `-my-1 py-1`, making the names 30.16 px tall with no other target within reach |
| 3 | **Skills lists.** The adapted-skills links in `components/landing/skills/SkillsIndexPage.tsx` gain `-mx-1.5 px-1.5 min-w-6 justify-center`. "pr" becomes 27.45 px wide and "how" 35.31; with the 16 px gap, neighbouring areas stay 4 px apart |
| 4 | **A test.** In `tests/e2e/smoke.spec.ts`, at 320 and 390 px, on the seven pages under "Overlapping tap areas": every visible link, button and form control is at least 24 × 24 px, and no two of them overlap unless one contains the other. Links inside running text are left out: an element shown `inline` inside `p`, `li`, `dd`, `td`, `blockquote` or `figcaption`, as in the audit |
| 5 | **The owner's item,** once described: reproduce it at the size the owner names, add its fix here, and ask again before executing if the scope grows |

## Deviations (12-11-26)

Made during execution, after two independent reviews:

- **Step 2.** `NAME_LINK` keeps its classes. Only the project names get
  padding, and only on top: `-mt-1 pt-1`, 26.16 px tall.
  - With `-my-1 py-1`, the tagline below painted over the bottom padding,
    so a tap there missed, and the focus ring crossed the tagline.
  - The GoGoCash and Manut AI names are inline, 29 px tall, and need
    nothing.
- **Step 3.** "pr" measures 27.45 to 27.6 px depending on the engine.
- **Step 4.** The test grew:
  - **Missing pages.** Each page must answer 200 and show its h1, and at
    least one target must be measured, so a missing page cannot pass as
    its 404.
  - **The exemption rule.** A link is left out only when it is inline and
    sits next to visible text that belongs to no target and is not
    `aria-hidden`. The rule looks through `inline`, `inline-block` and
    `contents` wrappers to find that text. The first rule, "inline inside
    `p`, `li`, `dd`, `td`, `blockquote` or `figcaption`", was both too
    broad and too narrow.
  - **The open menu.** It is measured at both widths, because it is hidden
    while closed and the page cases never see it.
  - **Coverage.** A hit test of the centre and of a point 1 px inside the
    middle of each edge fails any target that something else paints over.
    That is the dead zone the first review found.
  - **The describe title** is "tap areas > ...", so it no longer shares the
    `mobile` project's name.

## Touchpoints

`components/bento/SiteFooter.tsx`, `components/landing/home/HomeCards.tsx`,
`components/landing/skills/SkillsIndexPage.tsx` and `tests/e2e/smoke.spec.ts`.
No unit test pins these class strings (checked 12-11-26).

## Blast Radius

- The footer on every page, Home's card names and the `/skills` lists. Only
  the tap areas change; the text stays in place.
- Not affected:
  - **Content.** No wording changes.
  - **Parity.** It compares status, title, h1, head tags, structured data
    and links, not class names.
  - **Server code and cache headers.**

## Validation gates

| Gate | Check |
| --- | --- |
| 1 | Typecheck, lint, format, unused code and unit tests on Node 26 and on Node 22.23.4, with the environment CI gives each step |
| 2 | Build and the first-load budget, as CI runs them |
| 3 | Smoke and accessibility on the production build (desktop project), the new test included |
| 4 | CI's `visual` job passes and no baseline file changes. A changed baseline means the approach failed: stop and report |
| 5 | Parity gate: 0 differences, without crawling the reference again |
| 6 | Mutation checks: undoing step 1, 2 or 3 each makes the new test fail. Changing a link's colour class leaves it passing. Files restored byte for byte |
| 7 | One independent review of the diff, given the code and this plan but not my verdicts |
| 8 | After the merge, the phone audit again on production (GET only): no tap area under 24 px outside running text, no overlap, no sideways scroll |

## Waiting on the owner

- **What they saw on a phone:** the page, the phone and browser, and what
  looked wrong. A screenshot helps.

## Blockers that justify BLOCKED

- A visual baseline changes (gate 4): the negative margins did not hold the
  layout.
- The owner's item needs a layout change beyond tap areas: return to PLAN.

## Resume and Execution Handoff

- **Execute anchor:** this file, branch `fix/mobile-tap-targets`.
- **Order:** steps 1 to 3, then 4, then the gates; step 5 when the owner's
  details arrive.
- **The audit scripts** live outside the repository, in the session's
  scratchpad. Gate 8 reruns them, and they read the live site only.
