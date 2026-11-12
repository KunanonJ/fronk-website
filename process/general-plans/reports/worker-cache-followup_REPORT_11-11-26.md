# Report: Worker cache follow-up

**Plan:** `../active/worker-cache-followup_PLAN_11-11-26.md`
**Research:** `../references/worker-cache-research_11-11-26.md` (section 7
holds the probe)
**Status:** MERGED (11-11-26). Pull request #112 (`1654b92` on `main`),
merged at 10:38:57 UTC after every CI check passed and live by 10:40:41.
Gates 1 to 8, 11 and 12 pass (see "Gates"). Gates 9 and 10 and step 1
are the owner's and still open, so the plan stays in `active/`.
**Base:** `4bbb462` on `main`. Commits on the branch: `4d60e65` (the
change), `ca62b98` (first review's fixes), `c8b37d3` (second review's
fixes), `953b060` (the records); squash-merged as `1654b92`.

## Owner answers used (11-11-26)

- **Execution:** "ENTER EXECUTE MODE", with no answers to the four
  decisions, so each took its default:
  1. Sanity's live API on the server (`useCdn: false`).
  2. A failing Worker shows its error (`stale-if-error=0`).
  3. A publish test in Studio after the merge (gate 10).
  4. The staging Worker is redeployed after the merge.
- **The merge:** "Merge when CI is green", asked with the Sanity usage
  question of decision 1 (the live API's allowance is a quarter of the
  CDN's): the owner's usage is well under it, or the owner accepts the
  risk.

## What changed

| Step | Change |
| --- | --- |
| 2 | The probe, on a throwaway branch: see "The probe" |
| 3 | `EDGE_LIFETIME` is `public, max-age=3600, stale-if-error=0`: an hour at the edge, no `stale-while-revalidate`, and a failing Worker shows its error |
| 4 | `useCdn: false` in `lib/sanity/client.ts` |
| 5 | `withServerFnNoStore` in `src/server/http.ts`, called from the Worker entry: a server function's answer that sets none of `Cache-Control`, `CDN-Cache-Control` and `Cloudflare-CDN-Cache-Control` gets `Cache-Control: no-store` |
| 6 | `scheduled()`, `ALL_CONTENT_TAGS` and the cron are gone; both wrangler files set `"triggers": { "crons": [] }` |
| 7 | `/robots.txt`, `/manifest.webmanifest`, `/.well-known/security.txt` and `/skills.json`: a day at the edge, an hour in browsers. `/studio`: a day at the edge, browsers revalidate, and only a successful render is kept. The feed's, `llms.txt`'s, security.txt's and skills.json's handlers no longer set a cache header their route replaces |
| 8 | The webhook logs a purge that was not accepted, catches one that throws, and its body's `status` equals the HTTP status |
| 9 | `README.md`, `AGENTS.md`, `public/skills.md`, `public/_headers` and the code comments say what the code now does |
| 10 | Three browser tests in `tests/e2e/smoke.spec.ts`: a server function's answer is `no-store`; `/learn`, `/feed.xml`, `/llms.txt` and `/sitemap.xml` send the new lifetime; the five files of step 7 send theirs |

## The probe (step 2)

A route on the throwaway branch `chore/cache-probe` (`7f435b9`) answered
200 with a ten-second edge lifetime, then 500 with `no-store`. On its
Cloudflare preview, in two runs, every variant without `stale-if-error=0`
served the old copy (`STALE`) on all four failing reads, including the
pair the live pages send today (`must-revalidate` in `Cache-Control`, the
lifetime in `CDN-Cache-Control`). With `stale-if-error=0` in
`CDN-Cache-Control`, all four failing reads were the 500. So step 3's
value works as planned, and needs nothing in `Cache-Control`. The branch is
deleted; the probe switched itself off at 13:00 UTC. The table is in the
research file, section 7.

## Gates

Run on the final code, `c8b37d3`: tree `6ad7a167a29adaf4` (every file
outside `process/`, hashed), 10:29 to 10:34 UTC on 11-11-26. Each CI step
got the environment CI gives it. The Sanity write token was unset, so the
builds deployed nothing.

| Gate | Result |
| --- | --- |
| 1 | Typecheck, lint, format, unused code and unit tests pass on Node 26.12.0 and on Node 22.23.4: 940 tests in 110 files on each |
| 2 | Build and first-load budget pass on both (entry chunk 107.9 KB of 120 KB on Node 22). The built `dist/server/wrangler.json` holds `"triggers": {"crons": []}` |
| 3 | Smoke and accessibility, desktop, on the production build, Node 22.23.4: 181 passed (178 before, and the 3 new header tests) |
| 4 | CI's `visual` job, in the pinned image, passed on the pull request's head `953b060` (see "Deviations"). No baseline file changed |
| 5 | The parity reference, crawled again: 135 URLs, none added or removed, one entry changed (the body of `/skills.md`). The parity gate: 135 URLs compared, 0 with differences |
| 6 | The probe: variant (b), the pages' new headers, answered the 500 on all four of its failing reads, in two runs |
| 7 | **On the preview of `953b060`, 10:37 UTC.** A browser run showed the visit to `/learn` calls `/_serverFn/18705441…`. Asked with `Sec-Fetch-Site: same-origin`, it answered 200 with its JSON body, `Cache-Control: no-store` and `BYPASS`, twice; without that header, 403. `/learn` and `/resume` sent exactly `public, max-age=3600, stale-if-error=0`. **On production, 10:41 UTC**, after the merge: the same for `/learn`'s function and for the résumé's (it answered `HIT` before the change), twice each. `/robots.txt`, `/studio` and `/skills.json` sent the lifetimes of step 7 |
| 8 | **On production, two addresses no visitor uses** (`/learn?probe=g8-104051`, `/resume?probe=g8-104051`). Read 1, 10:40:51 UTC: `MISS` on both, each with its page's title. Read 2, 11:41:51 (minute 61): `EXPIRED` on both. Read 3, 11:42:13: `HIT` with age 20 on both. A copy ends within the hour. `EXPIRED`, not `MISS`, also shows that no deploy came in between |
| 9, 10 | The owner's; see "Still to do" |
| 11 | Every check first passed on the clean tree. 22 of 22 mutations caught: the server-function rule (5), the lifetime and `withEdgeCache` (4), `useCdn` (1), the cron in both files and the handler (4), the webhook (3), `/studio` (2), robots.txt and skills.json (2), the stand-in's own `no-store` (1). 4 of 4 harmless edits pass. Files restored byte for byte, then a clean rebuild. Also: removing the 101 guard fails its new test |
| 12 | Two reviews; see "Review" |

## Review

Two independent reviews (gate 12), each read-only, with the code and the
plan and none of my verdicts.

- **First, of `4d60e65`:** one must-fix, three should-fix, twelve nits.
  - Must-fix: the `/studio` comment said Studio "signs in on the client".
    The page is static, with a link to the external Studio.
  - Should-fix:
    - The probe's results were not yet in the research file that
      `AGENTS.md` cites.
    - A server function that set only `CDN-Cache-Control` would have had
      `no-store` added beside it, and the edge would still keep it.
    - Nothing asserted the browser header that `withEdgeCache` alone now
      supplies for the feed, `llms.txt` and the sitemap. That gap let one
      of its mutations survive.
  - All four are fixed in `ca62b98` and in section 7 of the research file.
    So are the nits that held: wording, test names, a 101 guard, and a
    browser test that counted answers from page load.
- **Second, of `ca62b98`:** no must-fix, two should-fix, four nits.
  - A comment stated the probe's result without citing it.
  - A browser test's name promised a failure check its body does not do.
  - The nits: two more wordings and a test for the 101 guard. Fixed in
    `c8b37d3`.
  - One nit left as it is: the config test's `scheduled` pattern misses
    some property forms; `src/server.test.ts` checks the object itself.

## Deviations from the plan

- **The probe** had five variants, not three. (d) and (e) answered in the
  same run what a second run was planned for. It sat in `src/server.ts`,
  not in a route file, so no route tree had to be regenerated.
- **Step 5** treats any of the three cache headers as the function's own
  choice, not only `Cache-Control` (first review), and skips a 101.
- **Step 10** reaches Learn through the site menu, because Learn is not
  in the header's Primary navigation. The second browser test also covers
  `/feed.xml`, `/llms.txt` and `/sitemap.xml` (first review).
- **Two test files were added:** `src/server.test.ts` (the Worker entry:
  the rule, the security headers, no scheduled handler) and
  `src/lib/studioRoute.test.ts`.
- **Gate 4,** the visual comparison, is CI's `visual` job, which runs the
  same pinned Playwright image. Nothing in the change draws a page
  differently, and no baseline file changed.
- **`AGENTS.md`** cites the research file, whose path does not move at
  closeout, instead of the plan.

## Still to do (the owner's)

- **Gate 9, the cron gone.** In the Cloudflare dashboard, the
  `fronk-website` Worker, Settings: the list of cron triggers is empty,
  and Trigger Events show no run after 10:56 UTC (15 minutes after the
  deploy), across the 11:00 and 12:00 marks. Events can take up to 30
  minutes to show, so look after 12:30 UTC. If a run shows, the plan's
  Blockers apply.
- **Step 1, why the purge never landed.** On the same page: the runs
  before the merge, and the Worker's logs for `[cron] cache purge failed`.
  The answer goes into the research file.
- **Gate 10, the publish test.** In Studio, change the writing page's
  eyebrow (`/blog` shows it above the heading; the default is "Blog") and
  publish, then say when. The steps are in plan gate 10: `/blog` is read
  until it is a `HIT` younger than 3000 seconds before the publish, then
  every 15 seconds. The new text within two minutes means the webhook
  works on production. Set the eyebrow back afterwards.
- **Housekeeping.** Redeploy the staging Worker (`pnpm deploy:staging`,
  which needs a Wrangler sign-in) so that it loses its hourly cron and
  serves this build. After gate 9, delete the old
  `fronk-website-revalidate-cron` Worker, after a look at its Trigger
  Events.
