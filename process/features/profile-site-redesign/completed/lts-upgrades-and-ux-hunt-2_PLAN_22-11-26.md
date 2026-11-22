# LTS upgrades and the second UX/UI bug hunt (record, 22-11-26)

The owner asked, after the open-source and hardening round closed (completed/open-source-share-video-and-hardening_PLAN_21-11-26.md):

- "do another bug hunt for UXUI on all platforms"
- "any packages we can upgrade? please use the LTS verison of packages"

## The owner's decisions (22-11-26)

- pnpm 12 ships last, and the owner's Mac gets pnpm 12 installed globally (`npm install -g pnpm@12.21.0`).
- Batch G (taste calls) ships: the phone footer in columns, one page-end rule, and principle tiles that line up.
- A Thai font preload with its own 80 KB budget was approved and then dropped. Measured, it did not fix Firefox's shift on the Thai hubs (see Learned), and it would have cost 26 KB on every Thai page.

## Upgrades

| PR | Squash | What |
|---|---|---|
| #184 | ac0ddcb | Node 26.13.1 "Lithium", Active LTS to 2029-04-30 (`.node-version`, `engines`, `@types/node` 26); Dependabot leaves `@types/node` majors to follow `.node-version`. Supersedes Dependabot #138. |
| #185 | ede5e19 | Every dependency at its latest stable release, jsdom 31 and jest-dom 8 included; four overrides that matched nothing dropped. TypeScript stays on the TS 6 alias (typescript-eslint 8.73 supports `<6.1.0`). |
| #186 | 0f7c637 | Playwright 1.65.1 and its CI image (by digest); four /stack baselines re-captured; under reduced motion Home's tool ring and the notebook pages move at once (WebKit rev 2388 held the ring's old value). |
| #194 | 0af5db2 | pnpm 12.21.0: settings moved to `pnpm-workspace.yaml`, `allowBuilds` all false, `pmOnFail: ignore` so the lockfile stays one YAML document for GitHub's dependency graph; the lockfile is unchanged byte for byte. |

## The bug hunt

Four passes on production (an automated sweep of every route on 12 devices in three engines, new surfaces, interactions and keyboard, cross-engine differences). 38 findings, 31 confirmed by re-verification: 6 major, 13 minor, 12 polish. The full report is the hunt's scratch output; the findings and fixes are below.

| PR | Squash | Findings |
|---|---|---|
| #187 | 915e70d | U08 the toolbar colour follows the site's theme, not the OS; U27 a failed living stylesheet is asked for again on the next page; U26 sharp cover and portrait on 2x screens. |
| #188 | d585fee | U05 the portrait pills' focus ring; U06 the case viewer returns focus under reduced motion; U18 the ship log's ring under 810 px; U02 Say hello and the menu close when focus moves on; U17, U21 popovers close before ⌘K's dialog; U19 a drag out of the dialog keeps it open; U20 the page holds still behind search and the menu; U03 keys typed right after the first ⌘K are kept. |
| #189 | 2e2b934 | U09 WebKit hero thumbs; U15 a 90 px headline cap; U16 release dot beside its tag; U23 the canvas mock at 1024 to 1399 px; U30 the canvas title at 320 px; U10 the Share pill takes its row's size; U11 /build's h1 holds its lines, a sized Thai fallback; U13 /contact's columns; U14 Thai compounds kept whole; U28 /skills' maintainer line; U29 wrapped /skills tags. Also the flaky intro test, now watched on every frame. |
| #190 | 2415035 | U01 Home section links land from any page, first visit included (Home's loader waits for its hero stylesheet); /#ventures keeps Back, Forward and reload; U04 Show fewer lines keeps its toggle; U07, U12 phone filter rows show they scroll and Tab brings an option wholly in; U22 a focused mock frame comes into its row; the 1180 px headline; reduced motion shows every transition's end value at once (`step-start`). |
| #191 | 8226a12 | U24 the phone footer in columns with 44 px targets (it was 28); U25 one page-end rule (`--page-end`), Home's rhythm on every page; U31 principle tiles line up in every engine (subgrid). |
| #192 | 020695d | Three tests that failed on first try in CI, now deterministic (test-only): the WebKit-phone lift-card ring Tabs on once the page is at rest; the skill-navigation test clicks from off the page and waits out each page transition; the chapter-address test loads the case fonts first. Under load: 6 of 40, 8 of 30 and 13 of 30 failed before; 160, 100 and 60 of each passed after. |
| #193 | 091f75b | Found making #192: the found-trait toast, placed once as it showed, stood over the next card's link a phone reader Tabbed to at a case's end (WCAG 2.4.11); now a focused link or control under it sends it to its other place, or closes it when both cover it. The lift card's pill ring ended 4.75 px off the WebKit phone's screen; an 8 px bottom scroll margin keeps it whole. |

## Verified live

- #184 to #186: each deploy's six key pages load and hydrate with no missing assets; share images still render; the reduced-motion ring turns at once in Chrome, WebKit and Firefox.
- #187: theme-color light on a dark OS, dark with a stored dark theme, and back on the toggle; 2x screens load the 800 px portrait and the 2880 px cover (Chrome, WebKit; Firefox ignores device scale under Playwright).
- #188: "verify" typed right after the first ⌘K/Ctrl+K arrives whole; the page holds still behind search; Say hello closes when Tab leaves it (three engines).
- #189: Home's h1 capped at 90 px at 1920; /skills' Share pill 44 px; /contact's Elsewhere ends level with the form (three engines).
- #190: from /about, /open-source and /skills/verify-loop, Work, About and Journey land at 176, -80 and 0 px and stay there, cold, in three engines (12 of 12; WebKit 5 of 5 repeats).
- #191: at 390 px the footer's pages sit in two columns with 44 px links (three engines); at 1440x900 Home, /about, /skills and /open-source all end with the same 126 px page end (14vh) above the footer (three engines).
- #192: test-only; the deploy's six key pages load and hydrate with no missing assets.
- #193: on a 390 px case page, Tab from All projects to the first card leaves its whole ring on screen and the link clear of the toast (three engines, 3 of 3 each); with the toast forced low over a focused link, it moves to the top within three frames (three engines).
- #194: CI's four jobs installed with pnpm v12.21.0; Workers Builds built and deployed it, and that build's six key pages load and hydrate with no missing assets. The owner's Mac runs pnpm 12.21.0 globally (the native arm64 binary), and the main checkout reinstalled from the unchanged lockfile.

## Learned

- Node 25 and later ship without Corepack; Workers Builds still installed pnpm on Node 26 (every preview and production build passed).
- pnpm 12 refuses lockfile entries less than a day old (`minimumReleaseAge` 1440): a lockfile refreshed today cannot pass a frozen install until tomorrow.
- A zero-tolerance harvest with most screenshots failing overruns the visual job's 20 minutes; the temporary commit also raises the job's limit.
- Linux text sets a little wider than macOS: layout tests with a few pixels of margin pass locally and fail on CI.
- `expect(...).toContainText` polls with back-off and can step over a state that lasts a moment; watch such states with `waitForFunction(..., { polling: "raf" })`.
- The global reduced-motion rule's 0.01 ms transition kept `visibility` hidden for a frame (a focused button lost focus); `transition-timing-function: step-start` shows every end value at once and keeps `transitionend`.
- Firefox lays Thai text out once in another face and then moves it, even with Noto Sans Thai already loaded, so a preload does not help.
- A smooth focus scroll still running when the next Tab lands makes WebKit's second focus scroll unpredictable; tests that Tab from a just-focused control wait for the page to hold still.
- The router preloads a link the pointer rests on for 50 ms, so a test pointer left in place preloads whatever scrolls under it; tests that count fetches click from off the page.
- A test that passes may pass by luck: the lift-card hit test (the pill's centre uncovered) passed with the toast over the pill because the centre fell in the toast's rounded corner; moving the pill 8 px exposed it.
- The gh CLI's active account can flip to kunanon-ui (pull only); run gh and git push with KunanonJ's token instead of switching the account.

## Left open (backlog)

Each is an entry in `process/general-plans/backlog/backlog.md`.

- Home's first-load stylesheets are 35.9 of 36 KB: trim before the next Home CSS change.
- Firefox's Thai layout shift on the Thai hubs (0.18 to 0.24 at 390 and 1024 on the AI hub).
- Safari can land a chapter address 7 px low on a cold load when Onest swaps in late (2 of 12 loads with a 150 ms font delay under load); closer fallback font metrics would remove it.
- TanStack Router leaves a skipped view transition's `ready` rejection unhandled: navigating again while a page transition is starting logs "Transition was skipped" as a page error (all three engines). Upstream.
- `pnpm audit`: one moderate advisory (GHSA-wx4j-mvgx-mqwp, satori before 0.33.5) through @cf-wasm/og 0.5.0 and @cf-wasm/satori 0.4.2 (satori 0.32.0), already the latest; waits on upstream.

## For the owner (settings outside the code)

- Cloudflare Speed Brain: turning it off removes the prefetch 503s.
- OpenFinance's GitHub homepage still points to a dead pages.dev address.
- In the Workers Builds log, confirm the build says Node 26.13.1 and pnpm 12.21.0, and that no `NODE_VERSION` build variable is set.
- The gh CLI's active account is kunanon-ui; switch back with `gh auth switch --user KunanonJ` if that was not intended.
