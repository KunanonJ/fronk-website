# Report: Agent readiness

**Plan:** `../active/agent-readiness_PLAN_12-11-26.md`
**Status:** IN PROGRESS (12-11-26). The code is complete on
`feat/agent-readiness` and verified locally (see "Gates"). Gate 6 follows
the pull request's preview, and gate 9 (Cloudflare's Diagnostics) the
merge.
**Base:** `cb496e6` on `main`. Commits: `2625b2a` (the change), `6efad5f`
(first review's fixes), `acf13ff` (second review's fixes).

## Owner answers used (12-11-26)

- **Scope:** "What is true of the site": Content Signals, Markdown
  negotiation, Link headers on the home page, an Agent Skills index. No
  OAuth, Auth.md, A2A, Web Bot Auth, commerce, MCP or WebMCP files.
- **Content Signals:** "Allow training": `search=yes, ai-input=yes,
  ai-train=yes`.
- **Markdown:** "Serve it from the Worker" (Cloudflare's switch needs Pro;
  the zone is on Free).
- **Workers plan:** "Workers Free". The 429 risk past 100,000 requests a
  day and the 10 ms CPU limit are accepted and recorded in the plan.
- **Execution:** "ENTER EXECUTE MODE".

## What changed

| Plan step | Change |
| --- | --- |
| 1 | The spike: see "The spike" |
| 2 | robots.txt: `# Content signals: https://contentsignals.org` at the top, and `Content-Signal: search=yes, ai-input=yes, ai-train=yes` in the `*` group and in each named crawler's group, not in the two blocked groups |
| 3 | `/index.md`: the `/llms.txt` brief served as `text/markdown`, tagged `posts` like `/llms.txt` |
| 4 | `src/server/negotiate.ts`. A GET or HEAD for `/`, `/about` or `/portfolio/<slug>` that names `text/markdown` at least as high as `text/html` gets the Markdown version, with `Content-Location`; any other gets the static file through `ASSETS`, or Start when there is none. Both versions carry `Vary: Accept` |
| 5 | Both wrangler files: `assets.binding: "ASSETS"`; `run_worker_first` lists `/*/`, `/`, `/about` and the five portfolio pages by name. A config test pins the list to the portfolio content |
| 6 | `/` sends `Link: </index.md>; rel="alternate"; type="text/markdown", </llms.txt>; rel="describedby"; type="text/plain", </sitemap.xml>; rel="sitemap"; type="application/xml"` with both versions |
| 7 | The skills sync records each release asset's `digest` from GitHub's API and refuses an asset without a sha256 one. The re-sync for `v6.1.1` added 41 digests and changed nothing else: the snapshot without its digests equals the old one |
| 8 | `/.well-known/agent-skills/index.json` (draft 0.2.0): 20 entries, `type: "archive"`, each skill's flat ZIP and its digest; `application/json` with `Access-Control-Allow-Origin: *`, a day at the edge and an hour in browsers |
| 9 | `/llms.txt` and `/agents.md` name the skills index and the Markdown answers; `/agents.md`'s robots row names the content signals; a README section; one workspace fact in `AGENTS.md` |
| 10 | `src/ported-routes.json` gains the two new addresses; the parity reference was crawled again |

Lifetimes: both versions of `/about` and of each portfolio page get a day
at the edge. The home page's Markdown keeps `/llms.txt`'s hour, and its
HTML a day; both carry the tag `posts`, because Cloudflare requires one
tag set for every version of an address. When the Markdown fails, the HTML
answered in its place is `no-store`.

## The spike (step 1)

- **The draft's patterns failed the build.** With `"!/portfolio/*/*"` and
  `"!/portfolio/*.md"` in `run_worker_first`, `pnpm build` failed in its
  prerender step: `Error: Failed to fetch /portfolio/tbh-intranet: Not
  Found`, after `GET /portfolio/tbh-intranet/ 404`. The trailing-slash
  address, which the Worker answers with a 308, now matched a `!` pattern,
  and Cloudflare sends what a `!` pattern matches to the static files
  without the Worker. Its docs say: "Negative patterns ... will continue to
  serve assets correctly, as requests are directed to assets, without
  invoking your Worker script."
- **Fix:** the portfolio pages are listed one by one. The build passed, and
  the trailing-slash addresses got their 308 again
  (`GET /portfolio/tbh-intranet/ 308`, then `GET /portfolio/tbh-intranet
  200`).
- **What was kept:** the built `dist/server/wrangler.json` keeps the
  binding and the list.
- **Under `pnpm start`, every address answered as it should:**
  - the cover image (`/portfolio/kunanonj-com/cover.webp`, 200
    `image/webp`), so the exact entries do not catch it;
  - `/portfolio/kunanonj-com.md` and `/portfolio/kunanonj-com/opengraph-image`,
    200;
  - `/about/`, 308;
  - `/index.md` and the index, 200.

## Gates

Run on the final code, `acf13ff`: tree `16b969853f2aa8d3` (every file
outside `process/`, hashed), 03:33 to 03:37 UTC on 12-11-26. Each CI step
got the environment CI gives it. The Sanity write token was unset, so the
builds deployed nothing.

| Gate | Result |
| --- | --- |
| 1 | Typecheck, lint, format, unused code and unit tests pass on Node 26.12.0 and on Node 22.23.4: 993 tests in 112 files on each |
| 2 | Build and first-load budget pass on both (entry chunk 107.9 KB of 120 KB on Node 22). The built `dist/server/wrangler.json` keeps `"binding": "ASSETS"`, the eight-entry `run_worker_first` list and `"crons": []` |
| 3 | Smoke and accessibility, desktop, on the production build, Node 22.23.4: 185 passed (181 before, and the 4 new agent-readiness tests) |
| 4 | CI's `visual` job, on the pull request |
| 5 | The parity reference, crawled again: 137 addresses, the two new ones added, none removed, and only the bodies of `/agents.md`, `/llms.txt` and `/robots.txt` changed. The parity gate: 137 compared, 0 with differences |
| 6 | On the pull request's preview |
| 7 | Every check first passed on the clean tree. 27 of 27 mutations caught: negotiation (13), the Worker entry (2), robots.txt (3), the skills index (3), the sync (2), the config (3), the home page's Markdown and `/llms.txt` (2). 3 of 3 harmless edits pass. Files restored byte for byte, then a clean rebuild |
| 8 | Two reviews; see "Review" |
| 9 | The owner, after the merge |

## Review

Two independent reviews (gate 8), each read-only, with the code and the
plan and none of my verdicts.

- **First, of `2625b2a`:** three must-fix, seven should-fix, four nits.
  - **Must-fix:**
    - The tie rule (`text/markdown, text/html` gets Markdown) differed from
      the draft plan. The code was kept and the plan amended: agents send
      that header, and Cloudflare's own feature converts whenever
      `text/markdown` is listed.
    - A browser test for robots.txt could pass on an empty file; it now
      checks the status and the groups.
    - Comments said "every other request" goes to the static files, when
      only GET and HEAD do.
  - **Should-fix (fixed in `6efad5f`):**
    - The home page's HTML had the Markdown's hour with
      `stale-if-error=0`; it now keeps a day.
    - A Markdown failure was not caught.
    - The entry's tests lacked the cases the plan listed.
    - An empty `q` read as 0, and only the first of repeated ranges counted.
    - Two comments overclaimed.
  - **Should-fix, recorded rather than changed:**
    - Each distinct `Accept` value is its own cache entry (README and
      `AGENTS.md`).
    - With the Worker cache on, every request counts toward the Workers
      request allowance. The Free plan's 429 exposure is in the plan.
- **Second, of `6efad5f`:** no must-fix, two should-fix, four nits, fixed
  in `acf13ff`.
  - **Should-fix:**
    - The HTML answered after a Markdown failure could be kept a day under
      that `Accept`; it is now `no-store`, and the failure is logged with
      the page.
    - The `text/*` weight had no test.
  - **Nits:** the words name the tie and the fallback; one test checks the
    static files were asked; a spy is always restored.
- **Checked by the first reviewer:** `code-review-flat.zip` matches its
  size and digest and holds `SKILL.md` at its root.
- **Checked during execution:** all 20 flat ZIPs, downloaded from the
  release, match their digests and hold `SKILL.md` at the root.

## Deviations from the plan

- **Step 5:** the portfolio pages are named one by one (see "The spike").
- **The tie rule and the home page's HTML lifetime** changed after the
  first review; the plan is amended where it said otherwise.
- **The Markdown failure fallback** (`no-store`, logged) was added after
  the reviews.
- **Gate 4,** the visual comparison, is CI's `visual` job, in the same
  pinned image.

## Found along the way

- Start answers 406 to a request that accepts only `text/markdown` on a
  page without a Markdown version, such as `/resume` or an unknown
  project. This is unchanged by this work: production answers the same
  today. An agent that also accepts `text/html` gets the page.

## Still to do

- **Gate 6, on the pull request's preview:**
  - The Markdown and HTML versions of `/`, `/about` and a portfolio page.
  - Markdown, then HTML, then Markdown on the same address, each answered
    correctly.
  - The skills index and robots.txt.
- **The merge:** the owner's word; it deploys production.
- **Gate 9, the owner, after the merge:** Cloudflare's Agent Readiness
  Diagnostics should show Content Signals and Markdown negotiation passing
  (Quick Wins 5 of 5), and the Link headers and Agent Skills checks where
  the page lists them.
