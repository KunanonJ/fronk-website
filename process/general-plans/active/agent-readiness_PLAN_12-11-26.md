# Agent readiness: what is true of the site, said in the agents' formats

**Status:** IN PROGRESS. Approved with "ENTER EXECUTE MODE" on 12-11-26.
**Created:** 12-11-26, at `1654b92`. Amended during EXECUTE the same day
where the build or a review showed a better way: the tie rule, the
run-first list and the lifetimes below say what was built.
**Origin:** the owner, from Cloudflare's Agent Readiness Diagnostics page
for kunanonj.com ("please do all of these"), scoped by the owner's answers
below.
**Report target:** `../reports/agent-readiness_REPORT_{dd-mm-yy}.md`

## Objective

Pass the Agent Readiness checks that describe what kunanonj.com really is,
and no others:

- **Content Signals:** robots.txt says how AI may use the site's text.
- **Markdown negotiation:** a request that asks for `text/markdown` on the
  home page, `/about` or a portfolio page gets that page's Markdown.
- **Link headers:** the home page points agents at its Markdown, `llms.txt`
  and the sitemap.
- **Agent Skills index:** `/.well-known/agent-skills/index.json` lists the
  20 skills the site publishes, with a digest for each.

No page looks different, and no URL is removed or redirected.

## Owner answers (12-11-26)

- **Scope:** "What is true of the site". OAuth discovery, OAuth protected
  resource, Auth.md, the A2A agent card, Web Bot Auth and the commerce
  checks (x402, MPP, UCP, ACP) are left out: the site has no logins, no
  agent and nothing for sale. Publishing their files would claim otherwise,
  against the honesty rule of the recruiter-fit program.
- **Content Signals:** "Allow training": `search=yes, ai-input=yes,
  ai-train=yes`. It matches robots.txt today, which already lets GPTBot,
  ClaudeBot and Google-Extended crawl.
- **Markdown:** "Serve it from the Worker". Cloudflare's own Markdown for
  Agents switch needs the Pro plan; the zone is on Free.

## What the checks look for

From Cloudflare's launch post and its public scanner (isitagentready.com),
and the specifications they link:

| Check | What passes | Today |
| --- | --- | --- |
| Content Signals | A `Content-Signal:` line in robots.txt, inside a `User-agent` group, e.g. `Content-Signal: search=yes, ai-train=no` | missing |
| Markdown negotiation | A request with `Accept: text/markdown` gets Markdown back, not HTML ("the server responds with a clean markdown version instead of HTML") | missing |
| Link headers | `Link` response headers on the home page at least, with registered relations (`describedby`, `sitemap`, `alternate`) | missing |
| Agent Skills index | `/.well-known/agent-skills/index.json`, served as `application/json`: `$schema` = `https://schemas.agentskills.io/discovery/0.2.0/schema.json`, and `skills[]` with `name`, `type` (`skill-md` or `archive`), `description`, `url`, `digest` (`sha256:` + 64 lowercase hex of the artifact's raw bytes). An archive must hold `SKILL.md` at its root | missing |
| robots.txt, sitemap, AI crawler rules | already pass | pass |

Cloudflare does not publish which page its checker requests for Markdown
and Link headers; third-party guides say the home page. Its Diagnostics
page shows the result after the deploy (gate 9).

## Approach

### Markdown negotiation in the Worker

- The pages it covers are those with a Markdown version already:
  - `/about` gets `/about.md`.
  - `/portfolio/<slug>` gets `/portfolio/<slug>.md`.
  - The home page gets a new `/index.md`: the body of `/llms.txt`, the
    site's summary for agents, served as `text/markdown`.
- **These pages are static files today,** answered before the Worker runs.
  So the Worker runs first for these paths only (`assets.run_worker_first`):
  - It answers a request that prefers Markdown with the Markdown version.
  - It hands every other request back to the static file through a new
    assets binding (`env.ASSETS.fetch`).
  - When there is no static file (an unknown slug), it hands the request to
    Start, as today.
- **"Prefers Markdown"** means the `Accept` header names `text/markdown`
  itself and weighs it at least as high as `text/html`, counting `text/*`
  and `*/*` for HTML. A browser and `curl`'s `*/*` get HTML. A tie with an
  explicit `text/markdown` gets Markdown: agents send `text/markdown,
  text/html`, and Cloudflare's own Markdown for Agents converts whenever
  `text/markdown` is listed. (Amended: the draft gave a tie HTML.)
- **Both versions carry `Vary: Accept`.** Cloudflare's docs say the Worker's
  cache then keeps a separate copy for each `Accept` value. The Markdown
  version also carries `Content-Location` with its `.md` address.
- **Edge lifetime:** both versions get `CDN-Cache-Control: public,
  max-age=86400`, because they change only on a deploy, which empties the
  cache. A repeat request with the same `Accept` is answered from the cache
  without running the Worker's code (it still counts as a request). The
  home page's Markdown is the `/llms.txt` brief, so it keeps that file's
  hour and tag (`posts`). The home page's HTML keeps a day and carries the
  same tag: Cloudflare requires one tag set for every version of an
  address. (Amended: the draft gave the HTML the Markdown's hour too.)
- **When the Markdown fails** (it throws, or answers anything but a 404),
  the page's HTML is the answer, with `Cache-Control: no-store`, so the
  cache does not answer that `Accept` with HTML after the failure. The
  failure is logged with the page.

### Rejected

| Option | Why not |
| --- | --- |
| Upgrade the zone to Pro for Cloudflare's switch | A monthly fee; it converts the HTML automatically, while the site already has hand-written Markdown; untested on pages the Worker builds |
| A Transform Rule that rewrites `/about` to `/about.md` when `Accept` asks for Markdown | Lives in the dashboard, outside the repository and its tests; whether such rules reach a Worker's custom domain was not checked |
| Run the Worker first for every page | More CPU on every page for no gain; only these pages have Markdown |
| Serve `SKILL.md` copies from the site for the skills index | The site would redistribute 20 MIT files, 12 of them from upstream projects, without their licence files. The release ZIPs on GitHub are the owner's own distribution |

## Owner decisions

| # | Question | Default |
| --- | --- | --- |
| 1 | **Which Workers plan is the account on?** Answered 12-11-26: **Workers Free.** Two things follow. On a day past 100,000 requests, `/`, `/about` and the portfolio pages would answer 429 instead of the static file; the site's traffic is far below that today. And each request gets 10 ms of CPU, so the Markdown path stays light: it builds text from the content modules, as `/about.md` already does | Accepted |

## Work

Tests first in every step.

| Step | Scope |
| --- | --- |
| 1 | **Spike, before the rest.** Add `"binding": "ASSETS"` and the new `run_worker_first` entries to `wrangler.jsonc`; build; check that `dist/server/wrangler.json` keeps both and that, under `pnpm start`, `env.ASSETS.fetch` returns the prerendered `/about` with the headers it has today. If the Cloudflare Vite plugin drops either field, stop: BLOCKED |
| 2 | **Content Signals.** `RobotsRule` (`lib/seo/types.ts`) gains `contentSignal`; `robotsToText` (`lib/seo/metadataRoutes.ts`) writes `Content-Signal: …` after a group's `User-Agent` lines, and a `Robots.comment` line at the top. `lib/seo/robots.ts` gives `search=yes, ai-input=yes, ai-train=yes` to the `*` group and to each named crawler's group (a crawler reads only the group that names it), not to the two blocked groups. Comment: `# Content signals: https://contentsignals.org`. Tests in `lib/seo/robots.test.ts` and `lib/seo/metadataRoutes.test.ts` |
| 3 | **The home page's Markdown.** A route `src/routes/index[.]md.ts` serves the `/llms.txt` body as `text/markdown; charset=utf-8`, through `withEdgeCache(…, ["posts"])` like `/llms.txt`. A test in `src/server/text/agentDocs.test.ts` |
| 4 | **Negotiation.** `src/server/negotiate.ts`: `prefersMarkdown(accept)` and `markdownPathFor(pathname)` (`/` → `/index.md`; `/about` → `/about.md`; `/portfolio/<slug>` with one segment → `/portfolio/<slug>.md`; anything else → none). `src/server.ts`: for `GET` and `HEAD` on those paths, Markdown from Start at the `.md` address when it is preferred and found; otherwise the static file from `env.ASSETS`, or Start when there is none. Both versions: `Vary: Accept` and the edge lifetime; the Markdown also gets `Content-Location`. Tests: `src/server/negotiate.test.ts` (an `Accept` table) and `src/server.test.ts` (each path, both versions, an unknown slug, a `POST`, an address outside the list) |
| 5 | **Config.** Both wrangler files: `assets` gains `"binding": "ASSETS"` and `run_worker_first` becomes `["/*/", "/", "/about"]` and each portfolio page by name. (Amended after the spike: the draft's `!` patterns sent `/portfolio/<slug>/` to the static files without the Worker, so the build's prerender step got a 404 instead of the 308; and `*` matches across segments, so `/portfolio/*` would catch the cover image.) `lib/cloudflare/cacheConfig.test.ts` pins both lists to the portfolio content, and the `Env` type in `src/server.ts` gains `ASSETS` |
| 6 | **Link headers.** Both versions of `/` send `Link: </index.md>; rel="alternate"; type="text/markdown", </llms.txt>; rel="describedby"; type="text/plain", </sitemap.xml>; rel="sitemap"; type="application/xml"`. Tested in `src/server.test.ts` |
| 7 | **Release digests.** `scripts/sync-skills.mjs` records each release asset's `digest` (GitHub's API gives `sha256:…`; seen on `code-review-flat.zip` in `v6.1.1`). The sync runs again for the same tag, `v6.1.1`; the snapshot's diff must be the new `digest` fields and nothing else. `SkillAsset` in `lib/content/skills.ts` gains `digest` |
| 8 | **Agent Skills index.** `src/server/text/agentSkillsIndex.ts` and the route `src/routes/[.]well-known/agent-skills/index[.]json.ts`: `$schema` as above, one entry per skill, with `type: "archive"`, the skill's flat ZIP (`<skill>-flat.zip`, `SKILL.md` at its root) as `url`, and its digest. Served as `application/json; charset=utf-8` with `Access-Control-Allow-Origin: *`, a day at the edge and an hour in browsers. Tests: the shape, every name against the spec's pattern, descriptions under 1,024 characters, every digest `sha256:` and 64 hex characters, and the URL equal to the snapshot's |
| 9 | **Words.** `/llms.txt` and `/agents.md` say a page can be asked for in Markdown and name the skills index; the `README.md` section on agent files; one fact in `AGENTS.md`. Each sentence true of the code |
| 10 | **Parity.** `src/ported-routes.json` gains `/index.md` and `/.well-known/agent-skills/index.json`; the reference is crawled again. Expected changes: the bodies of `/robots.txt`, `/llms.txt` and `/agents.md`, and two added entries |

## Touchpoints

- `lib/seo/types.ts`, `lib/seo/metadataRoutes.ts`, `lib/seo/robots.ts`,
  `lib/seo/robots.test.ts`, `lib/seo/metadataRoutes.test.ts`
- `src/server.ts`, `src/server.test.ts`, a new `src/server/negotiate.ts`
  and its test
- `src/routes/index[.]md.ts` (new), `src/server/text/llms.ts`,
  `src/server/text/agentsMd.ts`, `src/server/text/agentDocs.test.ts`
- `wrangler.jsonc`, `wrangler.start.jsonc`,
  `lib/cloudflare/cacheConfig.test.ts`
- `scripts/sync-skills.mjs`, `lib/content/skills.generated.json`,
  `lib/content/skills.ts`
- `src/server/text/agentSkillsIndex.ts` and
  `src/routes/[.]well-known/agent-skills/index[.]json.ts` (new), with a
  test
- `README.md`, `AGENTS.md`, `src/ported-routes.json`,
  `tests/fixtures/site-parity.json`, `tests/e2e/smoke.spec.ts`

## Public Contracts

- **New addresses:** `/index.md` and
  `/.well-known/agent-skills/index.json`.
- **New behaviour:** `/`, `/about` and `/portfolio/<slug>` answer a request
  that prefers `text/markdown` with Markdown.
- **New headers:** `Vary: Accept` and a day at the edge on those pages;
  `Link` on `/`; `Content-Signal` lines in `/robots.txt`.
- **Changed text:** `/robots.txt`, `/llms.txt` and `/agents.md`.
- **Unchanged:** every page's HTML, every other address, and every redirect.

## Blast Radius

- The three page groups now run the Worker on a cache miss. They used to
  be answered by the static-files layer.
- The release snapshot (`lib/content/skills.generated.json`) is
  regenerated. Its only intended change is the digests.
- No visual change is expected; the visual gate confirms it.

## Validation gates

1. Typecheck, lint, format, unused code and unit tests, on Node 26.12.0 and
   on Node 22.23.4 with CI's environment for each step.
2. Build and first-load budget. The built `dist/server/wrangler.json`
   keeps the assets binding and the `run_worker_first` list.
3. Smoke and accessibility, desktop, on the production build, with new
   browser tests:
   - `/`, `/about` and one portfolio page each answer `Accept: text/markdown`
     with `text/markdown`, `Vary: Accept` and the right `Content-Location`,
     and a browser's `Accept` with the page's HTML;
   - `/` sends the `Link` header;
   - robots.txt holds the `Content-Signal` lines;
   - the skills index has 20 entries in the right shape.
4. The visual comparison in the pinned image (CI's `visual` job): no
   baseline changed.
5. Parity: 0 differences after the crawl, with the expected changes of
   step 10 and nothing else.
6. **On the pull request's preview:**
   - The step 3 checks with `curl`.
   - Ask `/` for Markdown, then for HTML, then for Markdown again: each
     answer is the right one, so the cache keeps the versions apart.
   - Download one flat ZIP from the index and hash it: the digest matches.
7. Mutation checks on the new behaviour, with harmless edits that must
   still pass.
8. One independent review of the diff, then one of its fixes.
9. **After the merge, the owner:** Cloudflare's Agent Readiness Diagnostics
   shows Content Signals and Markdown negotiation passing (Quick Wins 5 of
   5), and the Link headers and Agent Skills checks passing where the page
   lists them.

## Blockers that justify BLOCKED

- Step 1 finds that the build drops the assets binding or the
  `run_worker_first` list, or that `env.ASSETS` does not serve the
  prerendered pages as they are served today.
- The re-sync for `v6.1.1` changes anything in the snapshot besides the
  digests.
- Gate 6 shows a cached version served to the wrong `Accept`.

## Out of scope

- OAuth discovery, OAuth protected resource, Auth.md, the A2A agent card,
  Web Bot Auth, the commerce checks: not true of the site (owner answer).
- An MCP server, its server card and WebMCP: the owner chose the scope
  without them.
- API catalog, ARD, the Personal Agent Protocol and DNS-AID.
- Markdown for pages that have no Markdown version today (`/resume`,
  `/learn`, the skills and topic pages).

## Resume and Execution Handoff

- **Execute anchor:** this file.
- **Order:** step 1 first. Steps 2, 3 and 7 are independent. Step 4 needs
  steps 1 and 3; step 6 follows step 4; step 8 follows step 7. Steps 9 and
  10 come last.
- **Branch:** `feat/agent-readiness`, from `main`.
- **Merging deploys production.** Ask before the merge.
- **Harness:** `.claude/` and `process/context/` are absent from this
  checkout. Follow the Harness-Absent Fallback in
  `process/development-protocols/orchestration.md`.
