# Worker cache: what the live site does, what the documentation says, what the repo does

**Date:** 11-11-26, at `28f0d06`. Revised the same day after two rounds of
review (a fact check and a design review each time). Section 7, the probe
on a preview, was added during EXECUTE the same day.
**For:** `../active/worker-cache-followup_PLAN_11-11-26.md`
**Origin:** recruiter-fit decision 25, and "Findings outside this phase" in
`process/features/recruiter-fit/reports/phase-3_case-study-evidence_REPORT_11-11-26.md`

## Method, and its limits

- Read-only. Three researchers worked in parallel: Cloudflare's
  documentation, the repository, and the live edge (61 `GET` and `HEAD`
  requests to kunanonj.com and to the staging Worker). The first fact
  check added nine `HEAD` requests, and four more followed at 08:11 UTC.
- Local runs of the built Worker under `vite preview`: its scheduled
  handler triggered three ways with a locally signed webhook as the
  control (08:09 UTC); reads of addresses with an unknown query string;
  and reads of three addresses that do not exist (08:59 UTC).
- Cloudflare's and Sanity's pages were read again on 11-11-26 for every
  sentence quoted in sections 2 and 3.
- Not available: the Worker's logs, its Trigger Events, the Cloudflare
  dashboard and the Sanity project's settings. They belong to the owner's
  accounts. So this file can say what happens, and cannot say why the
  purge does not land.
- "Observed" means a request and its response headers on 11-11-26.
  "Documented" means the vendor's page says so; the page is named.
  "Inferred" is marked as such.

## 1. Observed on the live edge

### The hourly purge did not remove these entries

Times are UTC.

| Entry | Stored | Read | Status and age |
| --- | --- | --- | --- |
| `/resume` and `/learn`, the version deployed on 10-11-26 | 10-11-26 13:19 | 11-11-26 06:26 | `HIT`, age 61620 (17 hours). Read in the Phase 3 session, before that day's deploy; recorded in the Phase 3 report |
| `/resume`, the version deployed on 11-11-26 | 06:43:29 | 06:59:40 | `HIT`, age 971 |
| the same entry | 06:43:29 | 07:01:20 | `HIT`, age 1071 |
| the same entry | 06:43:29 | 07:03:53 | `HIT`, age 1223 |
| the same entry | 06:43:29 | 08:11:09 | `HIT`, age 5260 |
| `/learn`, the version deployed on 11-11-26 | 06:43:28 | 07:01:20 | `HIT`, age 1072 |
| the same entry | 06:43:28 | 08:11:11 | `HIT`, age 5263 |

- The entries of 11-11-26 were stored before the 07:00 and 08:00 hour
  marks and served after them, with the age growing by the wall clock.
  Neither mark removed them.
- The 17-hour entries were stored about two minutes after the merge of
  10-11-26 (13:17:19) and passed 17 hour marks with no merge to `main` in
  between. They stopped being served at the next deploy (inferred from
  the cache key, which holds the Worker's version; they were not read
  again after 06:26).
- Whether the scheduled run happened at any of those marks is not known.
- Both pages carry `CDN-Cache-Control: public, max-age=86400,
  stale-while-revalidate=86400`. The edge strips `Cache-Tag`, so the tag
  cannot be read from outside.

### What else the edge keeps

| Response | Cache headers it sends | Observed |
| --- | --- | --- |
| The four server functions, `GET /_serverFn/<id>` | none | The résumé's function: `MISS`, then `HIT`. The other three, read once each: `MISS`. In the Phase 3 session, on the version before the 06:43 deploy, the résumé's answer was `EXPIRED` two hours after it was stored |
| `/robots.txt`, `/manifest.webmanifest`, `/studio` | none | `MISS`, then `HIT` |
| `/.well-known/security.txt`, `/skills.json` | `s-maxage=86400, stale-while-revalidate=604800`, no `CDN-Cache-Control` | `MISS`, then `HIT` |
| A path that does not exist (404) | none | `MISS`, then `HIT`; `EXPIRED` on a read six minutes later |
| `/rss.xml`, `/about/`, `/writing` (308) | none | `BYPASS`: not kept |
| `/feed.xml`, `/llms.txt`, `/sitemap.xml` | the edge headers, as `/resume` | `HIT` |
| `/llms-full.txt`, `/sitemap.md`, `/agents.md` | `Cache-Control: public, max-age=3600`, `CDN-Cache-Control: public, max-age=86400` | `HIT` |
| `/`, `/about` (prerendered files) | `public, max-age=0, must-revalidate` | `REVALIDATED`, no age. The header pattern matches static assets (inferred; `/skills.md`, a static file, shows the same) |

- A cached server-function answer is served to a request with no
  `Sec-Fetch-Site` header. The same request for an uncached address gets
  403, marked `BYPASS`. So the framework's cross-site check runs only on
  a cache miss. The four answers hold public content.
- A `HEAD` request reports the cache status and age of the `GET` entry. A
  query string makes a separate entry.
- The browser header does not shorten the edge's lifetime: `/resume` was
  a `HIT` at age 5260 with `Cache-Control: public, max-age=0,
  must-revalidate`.
- A preview uses the Worker cache: the preview of the branch
  `feat/recruiter-fit-phase-3` (pull request #110) answered `HIT` with
  age 5407 at 08:11:14.

### A deploy empties the cache

- Every entry that the first reads found already in the cache had been
  stored between 06:43:27 and 06:44:04. The merge commit of pull request
  #110 is 06:41:58, and a poll first saw the new site answer at 06:43:09.
  Entries the first reads missed were stored by those reads, from 06:55.
- Documented: the Worker's version is part of the cache key by default, so
  "a new deployment starts from a cold cache". Neither wrangler file sets
  `cross_version_cache`.

### Staging differs

- `fronk-website-start.myinternal.workers.dev` still answers. It serves a
  different build, probably an older one (inferred): `/portfolio/kunanonj-com`
  is a 404 there, its script is `index-DKElbb22.js` where production has
  `index-CzP1TOHo.js`, and its responses lack the five security headers
  `src/server/http.ts` adds.
- The old cron endpoint, `GET /api/cron/revalidate`, is a 404 on
  production. The code that answered it was removed on 10-11-26.

## 2. Documented by Cloudflare

Sources: `developers.cloudflare.com/workers/cache/` (the overview,
configuration, purge, cache keys and debugging pages),
`/workers/runtime-apis/handlers/scheduled/`,
`/workers/configuration/cron-triggers/`.

- **The Worker's own cache.** "No zone configuration for caching applies
  to Workers Caching." The Worker's headers, its Wrangler file and its
  purges are "the entire configuration surface". No zone-level purge
  reaches it.
- **Two ways to purge.** `ctx.cache.purge(...)`, "available on the
  execution context passed to every handler", and `cache.purge(...)`
  imported from `cloudflare:workers`. "Both forms call into the same API
  and behave identically." Options: `tags`, `pathPrefixes`,
  `purgeEverything`. The result has `success` and `errors`.
- **The scheduled handler.** Its page says the `ctx` object "currently ...
  just contains the `waitUntil` function". No page shows a purge from a
  scheduled handler. The two statements pull apart, and nothing settles
  it.
- **Success means accepted.** `success` says whether the request was
  accepted. The page does not say that anything was evicted. (This
  research's own advice: request the page afterwards and check that it is
  no longer a `HIT`.)
- **Limits.** Purges from a Worker always use the Free tier's limits. A
  rate-limited purge is reported as `success: false`.
- **Scope.** A purge covers the entrypoint that called it. The cache key
  is the path, the query string and, by default, the Worker's version; it
  does not include the host.
- **Tiers.** Each data centre that gets traffic has its own lower tier,
  and a miss there asks a shared upper tier before it runs the Worker.
- **No `Cache-Control` is not "do not cache"** (the configuration page,
  "Cache-Control semantics"). With neither `Cache-Control` nor `Expires`:
  200, 203 and 204 are kept for two hours; 300 and 301 for 20 minutes;
  404 and 410 for 3 minutes; 405, 414 and 501 for 1 minute. "Responses
  whose status is not in the table are not cached by default"; 308 and
  500 are not in it. `no-store` or `private` gives `cf-cache-status:
  BYPASS`.
- **Which header wins.** "The most specific wins":
  `cloudflare-cdn-cache-control` (stripped before the client),
  then `cdn-cache-control` (passed on), then `Cache-Control`. The page
  does not say whether a directive in a lower header still counts.
- **Stale serving.** "If your response includes any of `s-maxage`,
  `must-revalidate`, or `proxy-revalidate`, the stale-serving behavior is
  disabled and Cloudflare will block on a fresh revalidation when the
  response expires. The same is true for `stale-if-error`." The site's
  Sanity-backed responses carry `must-revalidate` in `Cache-Control` and
  their lifetime in `CDN-Cache-Control`, the case the page leaves open.
- **When the Worker fails.** `stale-if-error` applies when the Worker
  fails while it refreshes an expired entry, "for example, when it
  throws, times out, or returns a `5xx` response". Without an explicit
  value, and without the three directives above, "Cloudflare's default
  behavior is to serve stale responses on Worker error indefinitely (as
  long as the cached entry has not been purged)". Such a response is
  marked `STALE`. "If you want Worker errors to surface to clients
  quickly, set `stale-if-error=0`"; the debugging page says to set it "in
  `Cache-Control`", and no page says whether `CDN-Cache-Control` serves.
- **An expired entry.** With no stale serving, a request for an expired
  entry runs the Worker and is marked `EXPIRED`, or `REVALIDATED` when
  the Worker answers 304.
- **Cron triggers.** A deploy with Wrangler replaces the deployed triggers
  with the `triggers` array. "If the `crons` property is an empty array
  then all the Cron Triggers are removed." "If the `triggers` or `crons`
  property are `undefined` then the currently deploy Cron Triggers are
  left in-place." Changes "may take several minutes (up to 15 minutes) to
  propagate". "If a Worker is managed with Wrangler, Cron Triggers should
  be exclusively managed through the Wrangler configuration file." Past
  runs are in the dashboard under the Worker's Settings, Trigger Events.
  The first `waitUntil` promise to fail sets a run's recorded status;
  otherwise the run is reported as a success.
- **Tags.** Printable ASCII, matched without regard to case. An invalid
  tag is dropped silently when the response is stored.

## 3. Documented by Sanity

Sources: `sanity.io/docs/content-lake/api-cdn`,
`/docs/http-reference/query`, `/docs/platform-management/plans-and-payments`,
`/docs/content-lake/webhook-best-practices`, `sanity.io/pricing`, and the
type comments of the installed `@sanity/client` 8.14.1.

- **Two APIs.** `api.sanity.io` is "the uncached API", which "will always
  give you the freshest data, but requests will be slower". `apicdn.sanity.io`
  is "the CDN-distributed, cached API".
- **Which to use.** "Use the API CDN for frontends that serve end users."
  "When building integrations with Sanity or responding to webhooks, we
  recommend using the API to capture the latest saved content." "For
  static builds, the live uncached API is a better fit".
- **The CDN serves stale answers while it refreshes.** The query
  reference documents `cacheMode`: "Set to `noStale` to disable
  stale-while-revalidate on CDN responses. Use it for live queries". The
  client's comment on the same option: "Only to be used with live content
  queries and when useCdn is true."
- **No number for the delay.** The page gives no lifetime, no
  stale-serving window and no time for a publish to reach the CDN.
- **In an outage.** "If Sanity's Content Lake is unavailable, the API CDN
  will return the last cached content for up to two hours."
- **Rate limits.** "Cached responses from the API CDN are not rate
  limited." A cache miss goes to the direct API, "which enforces rate
  limits and concurrency limits per dataset".
- **Allowances.** API requests and API CDN requests are counted
  separately, each month. The pricing page lists 250k API requests and 1M
  API CDN requests for the Free plan and for the Growth plan, and on
  Growth $1 for each further 25k API requests and $1 for each further
  250k API CDN requests. Free plans "have hard caps": "While a quota
  block is active, requests to the API and API CDN fail with HTTP `402`
  Payment Required", until the month ends or the plan is upgraded. Failed
  requests are "not billed".
- **Webhooks.** A delivery that fails with a 500-range status or a 429 is
  retried twice, 30 seconds apart, and then marked failed. A 400-range
  response is never retried. Each webhook has a filter and an attempts
  log.

## 4. What the repository does

### The purge path

- **Webhook** (`src/server.ts`, `src/server/revalidate.ts`): `POST
  /api/revalidate` checks the signature and its age, maps the document
  type to tags and calls `ctx.cache.purge({ tags })` inside the `fetch`
  handler. A failed purge answers HTTP 500 with a body whose `status`
  field is 200, and logs nothing. A purge that rejects is not caught.
  Checked once on staging, on 09-11-26: a signed webhook, then a `MISS`
  and a `HIT` on `/resume`. Not checked on production.
- **Hourly** (`scheduled()` in `src/server.ts`): the same purge with every
  content tag, inside `ctx.waitUntil`. When `ctx.cache` is undefined the
  code does not call Cloudflare: it logs `[cron] cache purge failed [
  'Worker cache is not enabled' ]`, and the run still counts as a success.
  No test covers `scheduled()`.
- After Sanity's two retries, nothing in this design catches a missed
  delivery.

### Where the content is read

- `lib/sanity/client.ts` sets `useCdn` from `NODE_ENV`, so production
  reads go through Sanity's API CDN. A request times out after 10 seconds
  and is retried twice. The client runs on the server only.
- With the blog hidden (`BLOG_PUBLIC` is false), only `/resume`, `/blog`
  and a post read Sanity. `/learn`, `/feed.xml`, `/llms.txt` and
  `/sitemap.xml` carry the same edge headers and read nothing from it.
  `/blog` makes two requests, for the posts and for the writing page.
- A failed read throws, and the route answers its error, status 500, with
  `no-store` (`lib/sanity/fetch.ts`). The résumé is the exception: it
  shows the repo's résumé with `no-store`. The feed's, `llms.txt`'s and
  the sitemap's handlers do not catch a failed read.

### Responses and their cache headers

| Response | Set in | Headers |
| --- | --- | --- |
| `/resume`, `/learn`, `/blog`, `/blog/<slug>` | the route's `headers` (`routeCacheHeaders`) | the edge headers with a tag; `no-store` for an error or a stand-in. A not-found gets no route header (see the 404 row) |
| `/llms.txt`, `/feed.xml`, `/sitemap.xml` | `withEdgeCache` | the edge headers, tag `posts`. The wrapper replaces the `Cache-Control` the feed's and `llms.txt`'s handlers set themselves |
| `/llms-full.txt`, `/sitemap.md`, `/agents.md`, `/about.md`, `/operating-model.md`, the portfolio's Markdown twins | `withEdgeLifetime` | one day at the edge, one hour in browsers, no tag |
| Share images and icons | `withImageCache` | one day at the edge and in browsers |
| `/api/github/contributions` | `withEdgeLifetime` | one hour at the edge, with a request for a day of stale serving; its own `Cache-Control` carries `s-maxage` |
| `/.well-known/security.txt`, `/skills.json` | their handlers | `s-maxage=86400, stale-while-revalidate=604800` |
| The four server functions | nothing; a stand-in résumé sets `no-store` | none: kept two hours by default |
| `/robots.txt`, `/manifest.webmanifest`, `/studio` | nothing | none: kept two hours by default |
| Every 404 (the not-found page, unknown slugs, share images and twins for unknown slugs) | nothing | none: kept three minutes by default |
| 405 on `/api/contact` for a method other than `POST` | nothing | none: kept one minute by default |
| 308 redirects, 500 errors | nothing | not kept |

The edge headers are `Cache-Control: public, max-age=0, must-revalidate`,
`CDN-Cache-Control: public, max-age=86400, stale-while-revalidate=86400`
and `Cache-Tag`.

A not-found gets no route header. The root route draws it, and a post
route's `headers` never run for an unknown slug. On the local build
`/blog/<unknown slug>`, `/portfolio/<unknown slug>` and an unknown path
each answer 404 with no cache header at all. Such a 404 carries no tag,
so a webhook's purge does not reach it; three minutes is its whole bound.

Prerendered pages and hashed assets are files. A request that matches a
file is answered without running the Worker, and `public/_headers`
applies to those answers only. `/studio` is not one of them: the Worker
renders it. Only `/studio/static` is a folder of files.

### Server functions

- Four, all `GET`, all in `src/server/content.functions.ts`:
  `getResumeProfile`, `getLearnCards`, `getBlogIndex` and `getBlogPost`.
  They carry no tag of their own; the pages that call them do. The slug
  of `getBlogPost` travels in the query string, so each slug is a
  separate entry.
- The base path is `/_serverFn`, the framework's default. The repository
  does not change it.
- Headers set inside a handler with `setResponseHeaders` are applied after
  the route's own. During a server render they would replace the route's
  `no-store` on an error page. That is why the handlers set no edge
  headers today.

### Texts that describe the cache wrongly

- **The hourly purge as working:** `README.md` (lines 19, 56, 64, 201 and
  258), `src/lib/cache.ts`, `lib/sanity/revalidation.ts`, `src/server.ts`,
  `src/server/revalidate.ts`, both wrangler files, and the comment and
  test name in `lib/cloudflare/cacheConfig.test.ts`.
- **Server-function answers as tagged:** `public/skills.md` line 21 says
  they "carry `Cache-Tag` and are purged by the Sanity webhook". They
  carry no tag. The file is public and its body is in the parity
  reference.
- **`/studio` as a static file:** the first line of `public/_headers`.
- **Accurate:** the public `/agents.md` names only the webhook's purge.
  The Phase 3 report said it described the hourly purge as working; that
  sentence is corrected there.

## 5. The local runs

On 11-11-26, on the built Worker under `vite preview`. The first used a
throwaway secret that was deleted afterwards.

- **The scheduled handler (08:09 UTC).** `GET /cdn-cgi/local/scheduled`,
  the path Cloudflare documents, answers `ok`. So does `GET
  /cdn-cgi/handler/scheduled`, which no page names, and a `POST` to the
  plugin's `/cdn-cgi/local/explorer/api/local/scheduled` answers
  `"outcome":"ok"`. Each run logs `[cron] cache purge failed [ 'Worker
  cache is not enabled' ]`.
- **The control.** A locally signed webhook to the same Worker answers
  HTTP 500 with the body
  `{"status":200,"revalidated":false,"tags":["resume"],...}`. So the
  local runtime gives no cache object to the `fetch` handler either.
- **Conclusion.** The local runtime cannot tell the two handlers apart.
  Only the real edge can.
- **An unknown query string.** `/resume`, `/learn`, `/blog`, `/llms.txt`,
  `/feed.xml` and `/sitemap.xml` each answer 200 with their usual headers
  when the address carries one, with no redirect.
- **A not-found (08:59 UTC).** See section 4.

## 6. Not known, and who can find out

| Question | Where the answer is |
| --- | --- |
| Does `scheduled()` run each hour on production? | Trigger Events: the dashboard, the Worker, Settings |
| What does the purge return there? | Workers Logs: search for `[cron] cache purge failed` |
| Does `cache.purge` from `cloudflare:workers` work inside `scheduled()`? | A test on a deployed Worker |
| Does the webhook's purge work on production today? | A publish in Studio, then a read of the page |
| How long does a publish take to reach Sanity's CDN? | The same query read from both of Sanity's hosts after a publish |
| Does the edge serve the last good copy when the Worker fails, with the site's two headers? | Answered: yes, marked `STALE` (section 7) |
| Is `stale-if-error=0` honoured in `CDN-Cache-Control`? | Answered: yes (section 7) |
| Does a `must-revalidate` in `Cache-Control` switch off stale serving when `CDN-Cache-Control` asks for it? | For a failing Worker, answered: no (section 7). For `stale-while-revalidate`, not tested; the site no longer sends it |
| Does a refresh that answers `no-store` drop the expired copy? | Answered: no; the next healthy read was `EXPIRED`, not `MISS` (section 7) |
| Which Sanity plan is the project on, and how many requests does it use? | The owner: sanity.io/manage, Usage |

Three causes fit what was observed of the hourly purge. Trigger Events
and the logs tell them apart.

1. **The trigger does not fire.** Trigger Events would be empty.
2. **`scheduled()` gets no `ctx.cache`.** Each hour's log would say
   `'Worker cache is not enabled'`, and each run would be a success. The
   scheduled-handler page supports this; the purge page ("every handler")
   speaks against it.
3. **The purge is accepted and reaches nothing.** No failure in the logs,
   and the entries stay.

## 7. The probe on a preview (plan step 2, 11-11-26)

A throwaway branch, `chore/cache-probe` (commit `7f435b9`, never merged,
deleted afterwards), added a route to the Worker entry. In the first 20
seconds of each UTC minute it answered 200 with a ten-second edge lifetime;
after that it answered 500 with `Cache-Control: no-store`, as the site's
error pages do. It switched itself off at 13:00 UTC. Cloudflare built a
preview of the branch. Two runs, at 09:27 and 09:29 UTC, read each variant
in second 1 (stored), in second 5, in seconds 30 and 45 (the copy expired
and the route failing), and in second 3 of the next minute (the route
answering again).

| Variant | `Cache-Control` | `CDN-Cache-Control` | Failing reads, four of each | Next minute |
| --- | --- | --- | --- | --- |
| a | `public, max-age=0, must-revalidate` | `public, max-age=10` | 200 `STALE`, the stored body | `EXPIRED`, a new body |
| b | `public, max-age=0, must-revalidate` | `public, max-age=10, stale-if-error=0` | 500 `BYPASS`, the error | `EXPIRED`, a new body |
| c | `public, max-age=0` | `public, max-age=10` | 200 `STALE` | `EXPIRED` |
| d | `public, max-age=0, must-revalidate, stale-if-error=0` | `public, max-age=10, stale-if-error=0` | 500 `BYPASS` | `EXPIRED` |
| e | `public, max-age=10` | none | 200 `STALE` | `EXPIRED` |

Every first read was a `MISS` and every second a `HIT`, in both runs.

What it shows:

- When the Worker fails on an expired copy, the edge serves the old copy,
  marked `STALE` (e), as documented.
- A `must-revalidate` in `Cache-Control` does not stop that when
  `CDN-Cache-Control` carries the lifetime (a). The live site's pages send
  that pair today, so during a failure they would show an old copy.
- `stale-if-error=0` in `CDN-Cache-Control` alone is honoured (b): the
  visitor gets the error. Putting it in both headers changes nothing (d).
- The failing refresh, answered with `no-store`, did not drop the expired
  copy: the next healthy read was `EXPIRED`, not `MISS`.
- Limits: a ten-second lifetime, where the pages send an hour; one preview
  on `workers.dev`; the one data centre the reads went through.

The raw log of the 50 reads stayed outside the repository; this table is
the record.
