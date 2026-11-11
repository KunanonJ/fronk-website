# Worker cache follow-up: a safety net that does not need a purge

**Status:** IN PROGRESS. Approved with "ENTER EXECUTE MODE" on 11-11-26,
every owner decision at its default. Steps 2 to 10 are done on
`feat/worker-cache-followup`; gates 7 to 10 follow the pull request and
the merge. Report: `../reports/worker-cache-followup_REPORT_11-11-26.md`.
**Created:** 11-11-26, at `28f0d06`. Revised the same day after two rounds
of independent review (a fact check and a design review each time).
**Origin:** recruiter-fit decision 25 ("Plan a follow-up"), from "Findings
outside this phase" in the Phase 3 report.
**Research:** `../references/worker-cache-research_11-11-26.md`
**Report target:** `../reports/worker-cache-followup_REPORT_{dd-mm-yy}.md`

## Objective

- **Freshness.** While the Worker answers, no copy of a Sanity-backed
  response is served from the Worker's cache more than an hour after it
  was stored, whether or not a webhook arrives. Gate 8 measures it, and
  anyone can check it with `curl`.
- **Failure.** When the Worker fails while it refreshes an expired copy,
  the visitor gets the error, not an old copy (owner decision 2). A probe
  on a preview shows it (gate 6). It cannot be staged on the real pages.
- **Source.** With decision 1 at yes, a render after a publish reads what
  was published. With no, it may read a cached answer from Sanity.
- **Headers.** Every response the repository sets a cache header on has a
  lifetime somebody chose. The rest use Cloudflare's documented defaults,
  listed in the research file.
- **Words.** The repository's current documents, as distinct from its
  dated records, say only what was observed.

"Sanity-backed" means the seven responses that carry the edge headers and
a tag: `/resume`, `/blog`, a post, `/learn`, `/feed.xml`, `/llms.txt` and
`/sitemap.xml`. The last four read Sanity only while the blog is public.
It is hidden today.

## What is wrong today

The evidence is in the research file. In short:

- **The hourly purge is not seen to work.** On 11-11-26 `/resume` was
  stored at 06:43:29 UTC and was still served from the cache at 08:11,
  after the 07:00 and 08:00 hour marks. The day before, a copy stayed 17
  hours with no merge to `main` in between. Whether the scheduled run
  happens at all is not known.
- **So a missed webhook costs a day or more.** A Sanity-backed response
  stays at the edge for one day, and may be served stale for a second day
  while the edge refreshes. Sanity retries a delivery that fails with a
  5xx or a 429 twice, 30 seconds apart, and then marks it failed.
- **Server-function answers are kept two hours, with no tag.** They send
  no `Cache-Control`, and Cloudflare keeps such a 200 for two hours. No
  purge by tag reaches them, and a cached answer skips the framework's
  cross-site check.
- **A render may read an old answer from Sanity.** Production reads go
  through Sanity's API CDN (`useCdn` in `lib/sanity/client.ts`). That CDN
  serves a stale answer while it refreshes, and Sanity's page gives no
  number for the delay. An old answer read just after a purge is then
  kept at the edge for the full lifetime.
- **What a failing Worker shows is not known.** Cloudflare's default is to
  serve the last good copy with no time limit. The responses carry a word
  that switches the default off, but in the header meant for browsers,
  and the pages do not say whether the edge reads it there.
- **Other responses are kept by default:** `/robots.txt`,
  `/manifest.webmanifest` and `/studio` for two hours, every 404 for three
  minutes. `security.txt` and `skills.json` send `s-maxage`, which
  switches off the stale serving their header asks for.
- **Why the purge does not land is not known.** Three causes fit. The
  Worker's Trigger Events and logs tell them apart (the research file,
  section 6). The local runtime cannot: it gives no cache object to either
  handler. Cloudflare's pages disagree with each other.

None of this shows today: Sanity holds no résumé document and the blog is
hidden. It starts to matter the day a résumé is published in Studio.

## Approach

### Chosen: let the cache expire, and keep the webhook for speed

| Part | Today | Proposed |
| --- | --- | --- |
| Sanity-backed responses | one day at the edge, then stale for up to a day more; purge by webhook; the hourly purge as the safety net | **one hour** at the edge, with no `stale-while-revalidate`; purge by webhook stays |
| The safety net for a missed webhook | the hourly purge, not seen to work | the lifetime itself: an hour after it was stored, a copy is no longer served |
| When the Worker fails on a refresh | not known: the last good copy, or the error | **the error** (`stale-if-error=0`), if the owner agrees (decision 2) |
| The cron trigger and `scheduled()` | deployed | **removed** |
| Sanity reads on the server | through Sanity's API CDN | **the live API** (`useCdn: false`), if the owner agrees (decision 1) |
| Server-function answers | two hours by default, no tag | **`no-store`**, unless a function sets its own header |
| `/robots.txt`, `/manifest.webmanifest`, `/studio`, `security.txt`, `skills.json` | defaults, or `s-maxage` | the explicit lifetimes in the table under step 7 |
| 404, 405, 308 and 500 | Cloudflare's defaults: three minutes, one minute, not kept, not kept | the same, now written down |
| A failed purge in the webhook | HTTP 500, nothing logged, a body that says `status: 200` | HTTP 500, logged, a body that says 500; a rejection is caught |

Why this one:

- **It does not depend on what cannot be observed.** Whether a purge from
  a scheduled handler reaches the cache is not settled by Cloudflare's
  pages and cannot be tested locally. An expiry is plain HTTP, and gate 8
  measures it on addresses no visitor uses.
- **It holds whatever the cause of the dead purge turns out to be.**
- **No `stale-while-revalidate`, so the hour is a real bound.** On a quiet
  site most visits arrive after the copy has expired. With that
  directive, each of those visitors would get the previous visitor's
  copy, up to 25 hours old. Without it, that visitor waits for one
  render.
- **A failure is seen.** The purge failed for days without a sign. With
  `stale-if-error=0` a failing Worker shows its error at once.
- **`no-store` is the safe default for server functions.** Nothing to
  purge and nothing stale. A later function that returns something about
  the visitor is not shared by accident, and the cross-site check runs on
  every request again.
- **It removes code:** the cron, `scheduled()`, and a promise about a
  purge nobody has seen work.

What it costs:

- **The first visitor after each hour waits for a render.** A cold
  `/resume` render took 126 to 289 ms on staging on 09-11-26 (60 to 139
  ms of CPU; the migration's cutover plan). If Sanity is slow, that wait
  is Sanity's: up to 10 seconds a try and 2 retries. Requests that arrive
  while that render runs may each render too; the site has no such load.
- **More renders:** about one an hour for each Sanity-backed address that
  gets visits, not one a day.
- **A Worker run for every server-function call.** Today the edge answers
  a repeat within two hours. A client-side visit to `/resume`, `/learn`
  or `/blog` makes one call; the tab then keeps the answer while the page
  is open and for about five minutes after. The calls for `/resume`,
  `/blog` and a post also read Sanity each time, and so does a repeated
  request for a post that does not exist.
- **Live-API reads, with decision 1.** One or two for each render and for
  each client-side visit to `/resume` or `/blog`. Sanity describes them
  as slower than the CDN (not timed here). Their monthly allowance is a
  quarter of the CDN's: 250k against 1M, on the Free plan and on Growth.
  250k a month is about 8,000 a day. On Growth, extra requests cost ten
  times as much ($1 for 25k against $1 for 250k). A Free plan answers 402
  on both APIs once an allowance is spent, until the month ends. A CDN
  miss already goes to the live API and its rate limits; the new share is
  the reads the CDN answers from its cache today. An address with a new
  query string is a new cache entry, so a crawler that varies the query
  string causes a render, and its reads, for each address. That is so
  today too, against the CDN's allowance.
- **A failing Worker shows at once, with decision 2.** If Cloudflare's
  default applies today, an old copy hides a failure. After the change
  the visitor sees the site's error page until the Worker recovers.
- **A Sanity outage shows sooner.** See the next section.
- **A missed webhook shows for up to an hour.**

One benefit beyond the safety net: a post with a publish time in the
future appears within an hour of that time, not within a day.

### In a Sanity outage

What a visitor gets when Sanity cannot be read:

| Case | Today | With this plan |
| --- | --- | --- |
| `/resume`, loaded directly | the edge's copy until it expires (a day, perhaps two), then the repo's résumé with `no-store` (Phase 3) | the same, but the copy expires within the hour. Each visit then runs the Worker and waits for Sanity to fail |
| `/blog` or a post (hidden), loaded directly | the edge's copy until it expires, then an error page with status 500 (the recruiter-fit backlog), unless the edge serves its last good copy in place of it (not known) | the edge's copy for up to an hour, then the error page (decision 2) |
| Any of them, reached by a link | the edge answers the server-function call from its copy for up to two hours | Sanity is asked each time: `/resume` shows the repo's résumé at once, and `/blog` its error |
| `/learn`, `/feed.xml`, `/llms.txt`, `/sitemap.xml` | no Sanity read while the blog is hidden: not affected | not affected. Once the blog is public they answer an error when their copy expires: their handlers do not catch a failed read |

- **A spent Sanity allowance looks the same as an outage:** the API
  answers 402 until the month ends (decision 1).
- **Decision 1 changes the short outage.** Sanity's CDN answers with its
  last cached content for up to two hours when the Content Lake is down.
  The live API does not.
- **Decision 2 decides the failing Worker.** Cloudflare's default, when a
  Worker throws, times out or answers a 5xx while it refreshes an expired
  copy, is to serve the last good copy with no time limit, unless the
  response carries `s-maxage`, `must-revalidate` or `proxy-revalidate`.
  `stale-if-error=0` is its documented way to show the error.
- **`/resume` keeps its stand-in under either answer** when Sanity cannot
  be read. A Worker error on `/resume` (a fault in the render, not in
  Sanity) shows as an error after decision 2.

### Rejected, and why

| Option | Why not |
| --- | --- |
| Keep `stale-while-revalidate` with the one-hour lifetime | On a quiet site the first visitor after the hour gets a copy up to 25 hours old. Whether this cache honours the directive at all, beside the `must-revalidate` in the browser header, is not settled by the documentation |
| Repair the hourly purge (find the cause; try `cache.purge` from `cloudflare:workers` in `scheduled()`) | With a one-hour lifetime it adds nothing: a copy already ends within the hour. Its effect shows only on the deployed Worker. It can be tried later as a second line, with each run's result in the logs |
| Tag the server-function answers and give them the page's lifetime | It shares every answer between visitors by default, keeps the cross-site check off for cached answers, and needs a tag for each function. The gain is one Sanity read saved per visit |
| Keep server-function answers for a minute, with no tag | It would save repeat reads under load, which the site does not have. It keeps the cross-site check off for cached answers and adds a minute of staleness |
| Keep Sanity's CDN and ask it for no stale answers (`cacheMode: "noStale"`) | The installed client says the option is "Only to be used with live content queries". Using it for ordinary reads would rest on behaviour Sanity does not document |
| Leave the code and correct the documents | Honest, and it leaves a day or more of staleness after a missed webhook |

## Owner decisions

Asked with the approval of this plan. Each has a default.

| # | Question | Default |
| --- | --- | --- |
| 1 | **Read Sanity's live API on the server (`useCdn: false`)?** For: Sanity's CDN serves a stale answer while it refreshes, so the first render after a publish can read the old content, and the edge keeps it for the hour. Sanity's page says "When building integrations with Sanity or responding to webhooks, we recommend using the API to capture the latest saved content", and the Worker renders on the server behind its own cache. Against: the same page says "Use the API CDN for frontends that serve end users"; the costs under "Live-API reads"; and the loss of the CDN's two hours of cover in a Sanity outage. If no, the bound is one hour plus the CDN's delay, and gate 10 times the two together | Yes |
| 2 | **When the Worker fails while it refreshes an expired copy, what does a visitor get?** (a) The error page: `stale-if-error=0` beside the lifetime. The hour then has no exception, and a failure is seen at once. Once the blog is public, `/blog`, a post, `/learn`, `/feed.xml`, `/llms.txt` and `/sitemap.xml` answer an error in a Sanity outage after the hour. (b) The last good copy, for up to a day: `stale-if-error=86400`, and the browser header loses `must-revalidate` if the probe shows it stands in the way. A failure can then hide behind an old page, and the first objective carries that exception. `/resume` shows the repo's résumé when Sanity cannot be read, under either answer | (a), the error |
| 3 | **A publish test after the merge (gate 10)?** The owner changes the eyebrow of the writing page in Studio (it shows above the heading on the hidden `/blog`), publishes, and the new text is read on the live page. It is the only check of the whole chain | Yes |
| 4 | **The staging Worker `fronk-website-start`.** It serves another build, probably an older one, without the security headers, and it keeps its own hourly cron until it is deployed again. Redeploy it after the merge, or delete it? | Redeploy it after the merge |

Needed from the owner, besides the answers:

- **Sanity:** the project's plan and this month's API and API CDN request
  counts (sanity.io/manage, Usage), before step 4 is merged.
- **Cloudflare, step 1:** a look at the `fronk-website` Worker's Trigger
  Events and logs, or a Wrangler sign-in on this machine so that the
  assistant can look.
- **Cloudflare, step 12:** `pnpm deploy:staging` needs the owner's
  Wrangler sign-in. The old `fronk-website-revalidate-cron` Worker, whose
  deletion has waited since the migration, is the owner's to delete,
  after a look at its Trigger Events. If it still runs, it calls a path
  that answers 404.

## Work

Tests first in every step. No step changes a URL or the text of a page.

| Step | Scope |
| --- | --- |
| 1 | **Find out why, for the record (the owner).** The `fronk-website` Worker in the dashboard: Settings, Trigger Events, then the logs for `[cron] cache purge failed`. Best done before the merge, while the trigger still runs. The answer goes into the research file. It does not block the steps below |
| 2 | **See what the edge does when the Worker fails (decision 2).** A throwaway branch adds one probe route and is pushed so that Cloudflare builds a preview. It is never merged, and the branch is deleted afterwards. In the first 20 seconds of each minute the route answers 200 with a ten-second edge lifetime. After that it answers 500 with `no-store`, as the site's error pages do. Three variants, each on its own address: (a) this plan's two headers without the new directive; (b) with `stale-if-error=0`, as the pages will send them; (c) without `must-revalidate`, as the control. Each is read while fresh, and again once it has expired and the route is failing. The statuses go into the research file. By the documentation, (c) serves the old copy as `STALE` and (b) answers 500; (a) is the open question. If (b) serves the old copy, the directive is added to `Cache-Control` as well and the probe runs again |
| 3 | **One hour at the edge.** `EDGE_LIFETIME` in `src/lib/cache.ts` becomes `public, max-age=3600, stale-if-error=0` (decision 2; with answer (b), `public, max-age=3600, stale-if-error=86400`). `src/lib/resumeRoute.test.ts` asserts the new value, and its test title stops saying "for a day" |
| 4 | **Read the live API (decision 1).** `useCdn: false` in `lib/sanity/client.ts`, with the reason beside it. A new `lib/sanity/client.test.ts` sets `NODE_ENV` to `production` and the two Sanity variables with `vi.stubEnv`, loads the client with `await import()` after `vi.resetModules()`, and asserts that `buildClient()` is not null and that its `useCdn` is false. It fails on today's code |
| 5 | **Server-function answers say `no-store`.** A small function in `src/server/http.ts`, called from the wrapper in `src/server.ts` that already sees every response: a response to a request under `/_serverFn/` that carries no `Cache-Control` gets `Cache-Control: no-store`. The path is the framework's default, held in one constant; the unit test pins the constant, and step 10's browser test shows it is the path the framework uses. The résumé's own `no-store` for a stand-in stays, and the comment above it is corrected |
| 6 | **Remove the cron** (after step 5: both edit `src/server.ts`). `scheduled()` goes, with the imports of `ALL_CONTENT_TAGS` and `purgeTags` in `src/server.ts`, the `ALL_CONTENT_TAGS` constant and its test, and the unused `waitUntil` type. Both wrangler files set `"triggers": { "crons": [] }`: an empty list, because a missing key leaves the deployed trigger in place. `lib/cloudflare/cacheConfig.test.ts` asserts the empty list in both files, and its name and comment stop naming an hourly purge |
| 7 | **Decide the rest.** The lifetimes in the table below. A comment in `src/lib/cache.ts` records that 404, 405, 308 and 500 keep Cloudflare's defaults. A not-found gets no route header: the root route draws it, and a post route's headers never run for an unknown slug. Its 404 carries no tag and keeps the three-minute default, which is its whole bound. The `Cache-Control` that the feed's and `llms.txt`'s handlers set for themselves is never sent (the wrapper replaces it) and is removed |
| 8 | **A failed purge is visible.** In `src/server/revalidate.ts` the webhook logs a purge that was not accepted, catches one that rejects, and puts the HTTP status in its body. Two new tests: a purge that rejects, and one that answers `success: false`. Sanity retries a 500 twice; if the purge still fails, the one-hour lifetime covers it |
| 9 | **Say what was observed.** `README.md` (lines 19, 56, 64, 201 and 258 name the cron or the hourly purge); the comments in `src/lib/cache.ts`, `lib/sanity/revalidation.ts`, `lib/sanity/fetch.ts`, `lib/sanity/fetch.test.ts`, `src/server.ts`, `src/server/revalidate.ts`, `src/server/content.functions.ts`, `src/server/content.functions.test.ts` and both wrangler files; the first line of `public/_headers`, which counts `/studio` among the static files (only `/studio/static` is); `public/skills.md`, whose sentence on server functions says their answers carry `Cache-Tag`; and the cache fact in `AGENTS.md`, whose sentences on server functions and on the hourly purge are rewritten for the new behaviour before the merge |
| 10 | **A browser test for the headers.** In `tests/e2e/smoke.spec.ts`: open Home at desktop width, click Learn in the header, and require at least one answer under `/_serverFn/` with status 200 and `Cache-Control: no-store`. A second test requires `/learn` to send exactly the `CDN-Cache-Control` value of step 3. The function behind `/learn` reads nothing from Sanity while the blog is hidden, so the first header can only come from the new rule and neither test depends on Sanity |
| 11 | **Check on the real edge** (gates 7 to 10) |
| 12 | **Housekeeping on Cloudflare,** after gate 9: staging (decision 4) and the old cron Worker |

Lifetimes for step 7. All five change only on a deploy, and a deploy
empties the cache, so the edge value sets no staleness.

| Path | At the edge (`CDN-Cache-Control`) | In browsers (`Cache-Control`) | Today |
| --- | --- | --- | --- |
| `/robots.txt` | `public, max-age=86400` | `public, max-age=3600` | none: two hours by default |
| `/manifest.webmanifest` | `public, max-age=86400` | `public, max-age=3600` | none: two hours by default |
| `/.well-known/security.txt` | `public, max-age=86400` | `public, max-age=3600` | `s-maxage=86400, stale-while-revalidate=604800` |
| `/skills.json` | `public, max-age=86400` | `public, max-age=3600` | `s-maxage=86400, stale-while-revalidate=604800` |
| `/studio` | `public, max-age=86400` | `public, max-age=0, must-revalidate` | none: two hours by default |

The first four take the values `/agents.md` and the Markdown twins
already send, through `withEdgeLifetime`. `/studio` is a route, so its
values go in its route headers, beside its Content-Security-Policy.

## Touchpoints

- `src/lib/cache.ts`, `src/lib/cache.test.ts`, `src/lib/resumeRoute.test.ts`
- `lib/sanity/client.ts`, a new `lib/sanity/client.test.ts`,
  `lib/sanity/fetch.ts` and `lib/sanity/fetch.test.ts` (comments)
- `src/server.ts`, `src/server/http.ts`, `src/server/http.test.ts`
- `src/server/revalidate.ts`, `src/server/revalidate.test.ts`
- `src/server/content.functions.ts` and
  `src/server/content.functions.test.ts` (comments)
- `wrangler.jsonc`, `wrangler.start.jsonc`,
  `lib/cloudflare/cacheConfig.test.ts`
- `src/routes/robots[.]txt.ts`, `src/routes/manifest[.]webmanifest.ts`,
  `src/routes/studio.tsx`, `src/routes/skills[.]json.ts`,
  `src/routes/[.]well-known/security[.]txt.ts`,
  `src/server/text/securityTxt.ts`, `src/server/text/skillsJson.ts`,
  `src/server/text/feed.ts`, `src/server/text/llms.ts`
- `lib/sanity/revalidation.ts` (a comment), `README.md`, `AGENTS.md`,
  `public/skills.md`, `public/_headers` (a comment)
- `tests/e2e/smoke.spec.ts`, `tests/fixtures/site-parity.json`
- Added during EXECUTE: `src/server.test.ts` (the Worker entry) and
  `src/lib/studioRoute.test.ts` (the `/studio` headers)
- On the throwaway branch only: one probe route (in the end, in
  `src/server.ts`)

Left as they are: completed plans and reports,
`process/features/tanstack-migration/references/target-architecture_09-11-26.md`
and `docs/redesign/02-current-site-map.md`. They are records of their
date, and some of what they say about the cache is no longer so.

## Public Contracts

- No URL is added, removed or redirected.
- **Response headers change:**
  - `CDN-Cache-Control` on the seven Sanity-backed responses: `public,
    max-age=86400, stale-while-revalidate=86400` becomes `public,
    max-age=3600, stale-if-error=0`. Their `Cache-Control` for browsers
    stays `public, max-age=0, must-revalidate`, unless step 2 shows the
    directive is needed there too.
  - `GET /_serverFn/<id>` gains `Cache-Control: no-store`.
  - The five paths in the table under step 7.
- **One body changes.** `POST /api/revalidate` keeps its HTTP statuses.
  Where its JSON body has a `status` field, the field is always 200
  today; it will equal the HTTP status.
- **One public text changes:** the sentence on server functions in
  `/skills.md`.
- **The Worker's hourly cron trigger is removed,** on production by the
  deploy that follows the merge (gate 9 checks it), on staging when it is
  deployed again.
- **What a visitor may notice,** while the Worker answers: a direct load
  of a Sanity-backed page can be up to an hour older than the same page
  reached by a link for the first time in a tab, which is fresh. Today
  the two can be a day and two hours old.

## Blast Radius

- Every Sanity-backed response: its lifetime at the edge, what it shows
  when the Worker fails, and where its content is read from.
- Every server-function call.
- The deployed Worker's triggers, on production and on staging.
- The parity reference: the body of `/skills.md` changes, so that entry is
  crawled again. The reference records status, redirect, content type,
  Content-Security-Policy, `X-Robots-Tag`, head tags and text bodies; it
  does not record cache headers.
- No visual change is expected. The visual gate runs to confirm it.

## Validation gates

1. Typecheck, lint, format, unused code and unit tests: locally on Node
   26.12.0, and on Node 22.23.4 with the environment CI gives each step.
2. `pnpm build` and the first-load budget, run without
   `SANITY_AUTH_TOKEN`: with it, the build deploys the Studio schema. The
   built `dist/server/wrangler.json` must hold a `triggers` object whose
   `crons` list is empty.
3. Smoke and accessibility, desktop, on the production build, with the
   browser tests of step 10.
4. The visual comparison in the pinned Playwright image: 96 of 96, no
   baseline changed.
5. The parity gate: 0 differences after the crawl; one entry changed,
   `/skills.md`; none added or removed.
6. **The probe of step 2,** before the pull request. Variant (b), the
   headers the pages will send, answers the route's 500 once its copy has
   expired, twice running. The other two variants are written down. The
   preview answers on `workers.dev`, not on the site's own zone.
   Cloudflare says no zone setting applies to a Worker's cache, so the
   zone should make no difference; that part is documented, not observed.
7. **On the pull request's preview.** Previews use the Worker cache: the
   preview of pull request #110 answered `HIT` on 11-11-26. The server
   function behind `/learn`, asked with `Sec-Fetch-Site: same-origin`,
   answers 200 with its JSON body, `Cache-Control: no-store` and
   `cf-cache-status: BYPASS`, twice running. A 403 does not count: a
   request without that header gets one today, also marked `BYPASS`. The
   function's address is read from a browser run that prints the request.
   `/learn` and `/resume` send exactly the `CDN-Cache-Control` value of
   step 3. A `no-store` on `/resume` means Sanity could not be read just
   then: read it again.
8. **On production, after the merge:** gate 7 again, then the expiry, on
   two addresses no visitor uses: `/learn?probe=<a fresh value>` and
   `/resume?probe=<the same value>`. The cache keeps a separate copy for
   each query string, and both pages answer 200 with an unknown one
   (tried on the local build). `/learn` does not depend on Sanity.
   - Read 1 must be a `MISS`. Note the time. The title and the heading
     must be the page's own.
   - Read 2, after minute 60 (between minutes 61 and 64): `EXPIRED`. A
     `HIT`, `UPDATING` or `STALE` fails the gate. A `MISS` means the edge
     dropped the copy early and proves nothing: start again. Anything
     else: stop and look.
   - Read 3, within a minute of read 2: `HIT` with an age under 120
     seconds.
   - No deploy in between: a deploy empties the cache and resets the test.
9. **The cron is gone.** Fifteen minutes after the deploy the Worker's
   list of cron triggers is empty, and Trigger Events show no run after
   that across two hour marks, so the check ends up to two and a quarter
   hours after the deploy. Cloudflare allows trigger changes up to 15
   minutes to take effect. What a run inside that time records, with no
   handler to call, is not documented; it purges nothing either way. The
   owner looks, or allows a read.
10. **The whole chain, with content (decision 3).**
    - Before: the owner notes the eyebrow now on `/blog` (the default is
      "Blog"; if Studio holds no writing page, the first publish creates
      it), and checks in Sanity that the webhook's filter lets the
      writing page through. `/blog` is read until it is a `HIT` with an
      age under 3000 seconds, so that the copy outlasts the test.
    - The owner publishes the new eyebrow and says when. `/blog` is read
      every 15 seconds for five minutes, then every five minutes, until
      the new text shows or 70 minutes have passed. The time is written
      down.
    - With decision 1 at yes: the new text within two minutes means the
      webhook works on production. The new text only after the copy's
      hour means it does not, and the lifetime caught it: look at the
      webhook's attempts log in Sanity, then at the Worker's log for the
      purge.
    - With decision 1 at no: the time covers the webhook and Sanity's CDN
      together and does not judge the webhook. To time the CDN alone, the
      writing page's query is read from Sanity's live API and from its
      CDN after the publish.
    - No new text after 70 minutes fails the gate. The owner then sets
      the eyebrow back.
11. Mutation checks on the new behaviour, with harmless edits that must
    still pass, as in Phase 3.
12. One independent review of the diff before the pull request, then one
    of its fixes.

What the gates do not cover: a Worker failure on the real pages (gate 6
shows the mechanism on a probe; the pages themselves show it only in a
real failure), and behaviour in data centres other than the one the
checks run through.

## Verification Evidence

Filled during EXECUTE, in the report.

## Rollback

- **Production:** revert the merge and let Workers Builds deploy `main`.
  The reverted wrangler file holds the cron again, and `wrangler deploy`
  replaces the deployed triggers with it. A rollback to an older version
  in the dashboard is not relied on: whether it restores triggers was not
  checked.
- **Staging:** if it was redeployed, redeploy it from the reverted `main`
  with `pnpm deploy:staging`.
- **Not undoable:** the deletion of the old cron Worker, so it waits for
  gate 9. The throwaway probe branch leaves nothing to roll back.

## Blockers that justify BLOCKED

- The probe (gate 6) still serves the old copy with `stale-if-error=0` in
  both headers: the failure objective cannot be met as written. Stop and
  ask.
- The preview shows a server-function answer still served from the cache
  after the change.
- The built `dist/server/wrangler.json` still holds the cron.
- Gate 8's second read is served from the stored copy: it outlived its
  hour.
- The production Worker still lists a cron trigger, or Trigger Events
  show a run, more than 15 minutes after the deploy (gate 9 fails). Read
  the deploy's Wrangler output first. If the old list was sent, fix the
  build it came from, redeploy once and run gate 9 again. If the empty
  list was sent, the owner decides. The trigger is not removed in the
  dashboard: Cloudflare says a Worker managed with Wrangler keeps its
  triggers in its configuration file.
- The owner wants the hourly purge repaired instead. Then step 1 comes
  first, and the plan is rewritten.

## Out of scope and follow-ups

- `/blog` answering 500 when Sanity cannot be read: in the recruiter-fit
  backlog. Decision 2 settles what the edge does with that error.
- A visible note on a stand-in résumé (O17), and a browser test for
  `/resume`'s figures (O18): owner questions in the recruiter-fit
  umbrella plan.
- Sharing the cache across deploys (`cross_version_cache`): today a
  deploy empties the cache, which is the safer behaviour.
- Hiding the edge lifetime from clients with
  `Cloudflare-CDN-Cache-Control`: the lifetime is already public and
  harmless, so `CDN-Cache-Control` stays.
- Repairing the hourly purge as a second line, if step 1 shows a small
  cause.
- One Sanity request for `/blog` in place of two (the posts and the
  writing page are read separately).
- `/api/github/contributions` is unchanged. It reads GitHub, not Sanity.

## Resume and Execution Handoff

- **Execute anchor:** this file. Supporting context: the research file,
  and `src/lib/cache.ts`, `src/server.ts`, `src/server/revalidate.ts` and
  `lib/sanity/client.ts`.
- **Order:** step 2 comes first: its result fixes the header value of
  step 3. Steps 3, 4, 7 and 8 are independent in what they do; steps 3
  and 7 edit the same file. Step 5 comes before step 6; both edit
  `src/server.ts`. Step 9 follows them, and step 10 follows steps 3 and
  5. Step 11 needs the merge, and gate 9 takes more than two hours after
  it. Step 12 follows gate 9. Step 1 is the owner's and blocks nothing.
- **Branch:** from `main`, once the branch that carries this plan
  (`chore/recruiter-fit-phase-3-closeout`) has reached it; before that,
  from that branch. The probe branch of step 2 is separate and is never
  merged.
- **Outward actions this plan asks for:** a push of the throwaway probe
  branch (step 2), and the work's own push and pull request. Merging
  deploys production: ask before the merge, as in Phase 3.
- **Harness:** `.claude/` and `process/context/` are absent from this
  checkout. Follow the Harness-Absent Fallback in
  `process/development-protocols/orchestration.md`.
