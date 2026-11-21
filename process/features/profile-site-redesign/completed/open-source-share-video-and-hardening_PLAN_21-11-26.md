# Open source, the share video, and hardening after deploys (record, 21-11-26)

The owner asked, after the now-building program closed (completed/now-building-and-genz_PLAN_20-11-26.md):

- "please add opensource projects that i'm doing now as well so other can check what skills are i'm using which is superstack and other opensource project that i'm doing base on my github"
- "for preview image when share website to other people can we make it make to be video preview"
- "ok i also want the optional as well" (the follow-ups listed after #179: the /about gap, /Contact's case, Firefox's pause, and a feature stylesheet that fails)

## The owner's decisions (21-11-26)

- Projects on the site: Superstacks, thai-accounting-tax-law and OpenFinance (MIT; unlicensed public repos and the @mygogocash repos left out).
- A new /open-source page plus a Home strip, a Markdown twin and agent-doc entries; copy from the owner's own GitHub wording.
- /skills follows the latest Superstacks release (v6.7.0).
- The share video: the share card coming alive, on Home only.
- Earlier the same day: the DRAFT copy approved as is, Protocol Camp as "alum", no Thai "open to" line, no GITHUB_TOKEN for the Worker.

## Shipped

| PR | Squash | What |
|---|---|---|
| #169 | 6c1595a | DRAFT copy markers removed (approved as is); no visible change. |
| #170 | 85f180b | /resume under the stylesheet budget and measured in CI; the hero side by side from 1024 px on a landscape screen. |
| #171 | 63ddba8 | /contact email first and one call to action; /about says each thing once; Protocol Camp alum. |
| #172 | f0a9a36 | The now-building program closed and archived. |
| #173 | 2aed5ae | /skills on Superstacks v6.7.0 (22 skills); each skill page ships only its own SKILL.md (first-load JS 205.8 to 169.3 KB); release dates in Bangkok time; the pipeline in rows of three. |
| #174 | 395bb65 | /open-source and the Home strip, from a committed GitHub snapshot (`pnpm oss:sync`). |
| #175 | 57c3beb | "Open source" in every page's footer. |
| #176 | 1f6118d | A navigation whose chunk a deploy removed loads its page fresh, once (src/lib/staleChunk.ts). |
| #177 | 6d19311 | smoke and a11y pass where they apply on phone width, WebKit and Firefox. |
| #178 | 4685bea | A lazy feature whose code fails to load leaves the page alone and retries; about 4 KB freed from the entry chunk. |
| #179 | 1c4f263 | Home's share card as a looping og:video (iMessage, Discord). |
| #180 | 96bd6b1 | /about: the Now section folded into the story's column beside the records card (the band there 514 to 135 px at 1440; the page 577 px shorter); `#now` lands at 96 px. |
| #181 | ed471cf | /Contact and /TH in any case (footer, nav and `<html lang>`); Firefox keeps Home's pause pressable while Work slides over (176 px, was about 50). |
| #182 | 6986990 | A lazy feature's own stylesheet that failed is asked for again (a fresh link beside React's; the wait capped at 3 s). |

## Verified live

- #173: /skills v6.7.0; /skills 168.5 KB and every skill page 169.3 KB of first-load JS; no foreign SKILL.md in Chrome, WebKit or Firefox.
- #174 and #175: the page, its Markdown twin, sitemaps, llms.txt and agents.md; the Home strip lands each card at 96 px; the footer link on every page.
- #176: on production, with the next skill's chunk answering 404, a click loads /skills/ama fresh exactly once, at the top, in three engines.
- #178: with the search dialog's chunk failing, the page stays and the next open works, in three engines.
- #179: the five tags on Home only; the file byte-identical to the commit; 200, 206 and 304 with the year-long cache.
- #180 and #181 (build mwqjt902): h3#now in the story column and no section#now; /about#now at 96 px in three engines; /Contact, /CONTACT and /contact show no footer call to action; /TH/topics/... says lang="th"; Firefox's pause pressable to 176 px of scroll at 1024 x 768 (Chromium and WebKit 162).
- #182 (build mwqko67y): with the search dialog's stylesheet answering 404, the first open is plain (border radius 0) and the page stays; once it answers again, the next open is styled (24 px), in Chrome, WebKit and Firefox.

## Learned

- Route head() options ship in the entry chunk: every page pays for Home's og:video tags (87 B).
- The 165 KB default budget binds on the topic hubs and /design; #178 freed about 4 KB.
- Cloudflare Speed Brain answers 503 to hover prefetches here (pages are max-age=0): console noise, not a site bug.
- Apple's players honour a video's transfer tag and ffmpeg's decode does not: check colour where it is seen.
- The router matches paths in any case: anything that reads the path (footer, nav, `<html lang>`) must lowercase it.
- Background agents stop at a usage limit and do not resume: check their transcripts' last write, stop the workflow, and relaunch only the unfinished steps.

## For the owner (settings outside the code)

- Cloudflare Speed Brain: turning it off removes the prefetch 503s (Speed > Optimization > Content Optimization).
- OpenFinance's homepage on GitHub points to chameleon-finance-c4y.pages.dev, which no longer resolves; give it a working address and the card's demo link can come back.
