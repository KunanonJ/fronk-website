# Phase 3 report: Case-study evidence

**Plan:** `../active/phase-3_case-study-evidence_PLAN_10-11-26.md`
**Status:** CODE-COMPLETE, NOT MERGED. Verified on the local production
build (11-11-26), on Node 26.12.0 and on CI's Node 22.23.4 (see "Gates" for
the runs and the tree they covered), and reviewed three times (see
"Review"). The merge waits for the owner: every outcome line and every "My
part" line is listed under "Open, for the owner" below.
**Base:** `27004b0` on `feat/recruiter-fit-phase-3` (`main` is `fdcb904`).

## Owner answers used (11-11-26)

- **Execution:** "ENTER EXECUTE MODE", with the merge held for a second
  answer.
- **O4, the mapping:** adoption by 50+ employees and build cycles from 4
  months to 1 week belong to the TBH Intranet ("Yes, both"). The video
  workflow, 10 people to 1 operator with a 30-minute turnaround, is Fando,
  on the AI Automation page ("Yes, that is Fando"). The private-data
  knowledge platform is ARIA, the intranet assistant.
- **O1, his part:** he wrote code for the TBH Intranet and ARIA, the AI
  Automation agents, the validator and signature tools, and GoGoCash and
  Manut AI.
- **GoGoCash:** "1,000 registered users" on every page. Gross merchandise
  value and cashback paid go on the GoGoCash page and on `/proof`, shown "as
  of October 2026". The question named the résumé as where the two figures
  already stood.
- **This site as a project:** "Yes, add it".
- **"RAG" as a skill:** "Restore it, as in my CV".
- **Résumé when Sanity fails:** fall back to the repo's data.

## What changed

**3a. Data model**

- `PortfolioProject` gains two optional fields in
  `lib/content/portfolio.ts`: `outcomes` (a label, a value and `source`, the
  résumé bullet it restates word for word) and `myPart`.
- A project with neither renders as before (tested by removing both from the
  intranet's data).

**3b. Where the outcomes show**

- **Project page:** an "Outcome" card, then a "My part" card, each a full
  row, after the role tiles and before the mockup. The Outcome card links to
  the résumé: "As stated in the résumé".
- **Portfolio index and Home's Selected work:** the first outcome on one
  line under the tagline.
- **Text and structured data:** `/portfolio/{slug}.md` gains "## Outcome"
  and "## My part"; `/llms-full.txt` gains an "Outcome:" and a "My part:"
  line per project; the CreativeWork JSON-LD description ends with
  "Outcome, as stated in the résumé: ...".
- **Access tile:** an internal project now reads "Internal tool (no public
  link)", and its Markdown twin says the same. The tile read "login only"
  and the twin "not public". The repository supports a login for the
  intranet alone, and says nothing on whether the other three can be
  reached from outside. What the data does show is that none carries a link.

**3c. Case-study content**

| Project | Outcome lines | My part |
| --- | --- | --- |
| TBH Intranet | Adoption: 50+ employees. Build cycles: 4 months to 1 week | Owned the roadmap and requirements, and wrote code for the platform and for ARIA, its assistant. Led delivery of ARIA as a private-data knowledge platform for competitive analysis and executive decision support, and partnered with engineering and strategy from requirements through launch. |
| AI Automation | Recurring workflow staffing: 10 people to 1 operator. Turnaround: 30 minutes | Automated video sourcing, trimming, review and publishing with the team, and wrote code for the agents. |
| Node Validator Automation | none | Wrote code for it. |
| Email Signature Generator | none | Wrote code for it. |

**3d. Proof and GoGoCash**

- `/proof` leads with a "Delivery" card: four tiles, one per outcome, each a
  link to its case study, and a link to the résumé. The tiles read the
  outcomes from the projects, so the audit covers this page.
- The lead no longer repeats the h1. It now says what the page holds.
- GoGoCash gains two figures, each printed with "As of October 2026": THB 13
  million cumulative gross merchandise value and THB 169,000 cashback paid.
  They show as tiles on `/ventures/gogocash` and `/proof`, in the case's
  "Where it stands" text, and in the ventures section of `/llms-full.txt`.
- The résumé, its PDF and the career section of `/llms-full.txt` already
  carried the same two figures, in the CV's own line, which gives no month.
  They are unchanged.
- The GoGoCash intro now uses the résumé's terms: "shop at partner
  merchants and earn cashback on eligible purchases". It said "shop at the
  stores you already use, earn a cut of every purchase back". The résumé's
  note says "eligible purchases from participating brands", and decision 1
  makes the CV right where the two disagree.

**3e. FDE hub proof list**

- English: "TBH Intranet: adoption by 50+ employees; build cycles from 4
  months to 1 week" and "AI Automation: recurring workflow staffing from 10
  people to 1 operator; 30-minute turnaround".
- Thai: "TBH Intranet: มีพนักงานใช้งาน 50+ คน และรอบการพัฒนาลดลงจาก 4
  เดือนเหลือ 1 สัปดาห์" and "AI Automation:
  ลดจำนวนคนในเวิร์กโฟลว์ที่ทำเป็นประจำจาก 10 คนเหลือผู้ปฏิบัติงาน 1 คน
  ด้วยระยะเวลาดำเนินการ 30 นาที". The audit pins all four lines word for
  word.

**3f. This site as a portfolio project**

- A fifth project, `kunanonj-com`, at `/portfolio/kunanonj-com`, with its
  Markdown twin, share image, sitemap entry and category filter ("Website").
- Every line restates what the repository shows. It states no outcome and no
  "My part": the CV does not mention the site, so neither is cleared.
- Its visual is a real screenshot of Home, not a drawn mockup.
- It is the first project that is public and not built at The Binary
  Holdings. Three places assumed otherwise and were corrected, each by its
  own rule:
  - `llms.txt` and `llms-full.txt` list it under "Personal projects". The
    grouping is decided by `isPersonalProject` in
    `lib/content/portfolio.ts`.
  - The JSON-LD names the employer as the source only when the project's
    organisation is the employer (`lib/seo/portfolioJsonLd.ts`).
  - The Markdown twin labels the link with the project's own `urlLabel`,
    "Source on GitHub", instead of "Live".
- The portfolio's description, which is also the lead under its h1, now
  reads "Internal tools, automations and AI agents built at The Binary
  Holdings, plus this site, a personal project. The internal ones have no
  public link, so each page shows what the product does and how it is
  built." Its `sitemap.md` line ends "plus this personal site".
- The page says the résumé page is cached at the edge, which the live site
  shows. It does not say when that cache is purged: the code asks for a
  purge on publish and every hour, and the live site shows the hourly one
  not taking effect (see "Findings outside this phase").

**3g. One user count**

- "1,000 registered users" on Home, the venture page, the FAQ, the build
  board and both languages of the hubs.
- The venture page's intro still said "more than a thousand users", and the
  Sanity seed script said "1,000+ users". Both now match. A test reads every
  count of registered users in the site's sources and the seed, in English
  and Thai, and requires each to be exactly 1,000 with no qualifier.

**3h. Résumé**

- "RAG" is back in the AI & Cloud skills. `public/resume.pdf` was
  regenerated: 2 pages, 844 words. The only change from the previous file is
  that word.
- A failed Sanity read now shows the repo's résumé with status 200. The
  failure is logged twice: by the request, and by the fallback, which says
  what the visitor saw.
- Neither the edge nor the browser's HTTP cache keeps the stand-in. It
  reaches a browser in two responses, and both carry `Cache-Control:
  no-store`: the page (the route's `headers`), and the server function's own
  response, which the browser fetches on a client-side navigation (set
  inside the function). The second matters because the Worker cache keeps a
  200 that carries no `Cache-Control` for two hours.
- The tab's own query cache does hold the stand-in, and asks again in three
  cases. The page redraws when a real answer arrives.
  - **A return to the page:** the loader marks the stand-in invalid and
    returns it at once, so the page is drawn without waiting, then asks in
    the background.
  - **The window regains focus, or the network comes back,** while the
    stand-in is on screen: a stand-in is stale from the start, so the page
    asks.
  - **The page mounts with a stand-in more than a second old,** as after a
    slow first load.
- Not covered: a page that stays open and in focus through the outage's end
  keeps the stand-in until one of those three happens. Nothing polls.
- A visitor sees no sign that the repo's copy is standing in. Today the two
  are the same text, because Sanity holds no résumé document.
- `pnpm pdf` refuses to print a stand-in. The page marks it with
  `data-resume-stand-in`, and the script stops when it finds the mark.

## Gates

| Gate | Command or check | Result |
| --- | --- | --- |
| 1 | `pnpm typecheck`, `lint`, `format:check`, `knip`, `test` on Node 26.12.0 | pass (13:24, 11-11-26): 925 tests in 107 files |
| 1 | the same on Node 22.23.4, with CI's environment for each step | pass (13:25): 925 tests in 107 files |
| 2 | `pnpm build`, `pnpm perf:budget`, on both Node versions | pass on both. On Node 22.23.4: entry chunk 107.9 KB of 120 KB, `/proof` 152.3 KB and `/portfolio/kunanonj-com` 162.4 KB of 200 KB. Node 26 measures each 0.1 to 0.2 KB lower |
| 3 | `playwright test smoke.spec.ts a11y.spec.ts --project=desktop` on the production build | 178 passed. 25 are new: 20 in the "case-study evidence" block, and 5 that the route list adds for the new page (one render test, two recruiter-path tests, two axe scans) |
| 4 | Linux baselines in `mcr.microsoft.com/playwright:v1.64.1-noble`: CI's comparison, then a full re-render compared byte for byte | 96 of 96 pass CI's comparison. A full re-render then differs in bytes on 9 baselines only, the nine listed below |
| 5 | `start-gates.mjs --parity-only`, and a fresh crawl compared with the fixture | 135 URLs compared, 0 with differences. The fixture was written by a crawl of the final build: 3 URLs added, 0 removed |
| 6 | clearance audit, `lib/content/portfolioOutcomes.test.ts` and `lib/content/ventureCase.test.ts` | pass, inside gate 1; the list is below |
| 7 | Phase 1: PDF text layer against the printed page | 844 words, whole and in order; 2 pages; 6 links; no phone number. A fresh print matches the committed file word for word |
| 7 | Phase 2: the "recruiter path" browser tests | pass, inside gate 3 |
| 8 | preview | runs when the pull request has its preview; recorded in the pull request |
| 9 | reviews | three rounds; see "Review" |

**What the runs covered.**

- Gates 1 and 2 ran on one tree, `7583d7e78dbd42c4`: a hash of every tracked
  and untracked file outside `process/`, printed at the start and the end
  of each run. The two runs printed it four times, the same each time.
- The browser suite, the PDF check and the fallback checks ran on a build
  of the same sources. The parity gate and the visual comparison ran
  against the reference and the baselines as committed.
- The 844 words are the printed page's text split on whitespace, compared
  in order with the PDF's text layer as `pypdf` extracts it. Another
  extractor may split the same text differently.

**Mutation checks.** 104 changes, each breaking one fact or behaviour of
this phase, were applied one at a time, and a unit test caught every one:
46 aimed at the first version, 16 at the first review's fixes, 20 at the
second review's, 4 at the stand-in's own response and 18 at the third
review's. Six were re-aimed, because a later fix had reworded the line
they changed. Eight harmless edits were applied the same way (an unrelated
"about 30 minutes" on a hub, "hard-coded", a comma after the user count),
and every test still passed. The tree was hashed before and after the runs
and was identical.

**The résumé fallback, end to end.** Checked by hand on 11-11-26, in a
browser, against a build pointed at a Sanity dataset that does not exist.

- `/resume` answers 200 with one `Cache-Control: no-store` header and no
  edge-cache header. Its visible text is word for word the normal build's
  (1,061 words), and the page carries the stand-in mark.
- The server function's own response, fetched on a client-side navigation,
  carries `Cache-Control: no-store` too.
- `pnpm pdf` stops with exit code 1 and writes no file.
- **A return to the page.** With the router's cached match dropped first,
  the résumé's heading was drawn in under half a second in three cases: the
  server answering at once, every server-function request held for 8
  seconds (still pending when the page was drawn), and the browser offline
  (no request made).
- **Sanity coming back.** The held answer was rewritten in flight to say
  the read had succeeded. The stand-in was drawn first, the page dropped
  the stand-in mark when the answer arrived, and the next return asked
  nothing.
- **A page left open.** After a direct load, a window focus while Sanity
  was still down made one request and kept the stand-in. A focus after the
  rewritten answer made one request and dropped the mark. A further focus
  made none.
- `/blog` on the failing build still answers 500 with `no-store`: only the
  résumé falls back.
- The normal build sends `CDN-Cache-Control: public, max-age=86400,
  stale-while-revalidate=86400` and `Cache-Tag: resume` on `/resume`, and
  no stand-in mark.

No automated test builds against a Sanity that cannot be read. The unit
tests cover each layer: the failed request, the fallback, the server
function's response header, the route's headers, the loader, and the query
under the hook the page uses.

### What the visual run showed

- **Changed or new (48):** build, home, portfolio, portfolio-project,
  portfolio-diagrams, portfolio-site (new), proof, topic-hub, topic-hub-fde,
  topic-hub-fde-th, topic-hub-th and venture-hub, each at two sizes in two
  themes.
- **Differ but left alone (9):** design, learn, not-found and
  topic-hub-th-short on mobile in both themes, and press-light on mobile.
  These nine differed in a re-render before this phase changed anything.
  This phase does not touch those pages. They pass CI's comparison, which
  tolerates 1% of pixels.

### What the parity crawl showed

- **Added:** `/portfolio/kunanonj-com`, `/portfolio/kunanonj-com.md` and
  `/portfolio/kunanonj-com/opengraph-image`.
- **Removed:** none.
- **Changed: 69 of the 132 URLs that existed before.**
  - **JSON-LD on 65 pages.** Every page carries the site-wide graph, whose
    GoGoCash description now says "1,000 registered users". On 53 pages
    that is the only change. The 8 topic hubs also move `dateModified` from
    2026-11-10 to 2026-11-11. Four pages change more: `/about` (the GoGoCash
    FAQ answer and `dateModified`), `/portfolio` (a fifth list item) and
    the two project pages with outcomes (the outcome sentence).
  - **Meta descriptions on 3 pages:** `/portfolio`, `/proof` and
    `/ventures/gogocash`.
  - **Bodies of 4 text files:** `llms.txt`, `sitemap.md`, `sitemap.xml`,
    and `agents.md` (its date only).
- The crawl records a body for ten text endpoints. It records none for
  `/llms-full.txt` or the Markdown twins, so their content is held by the
  unit tests and by one browser test, not by this gate.

## Clearance audit

Every figure **this phase adds** restates a bullet of
`lib/content/resumeTimeline.fallback.ts`, the repo's copy of the CV.

| Figure | Where this phase shows it | Résumé bullet | Reply that cleared it |
| --- | --- | --- | --- |
| Adoption: 50+ employees | TBH Intranet page, index card, Home, `/proof`, both FDE hubs, the Markdown twin, `llms-full.txt`, JSON-LD | "Owned the roadmap and requirements for an internal platform ... achieved adoption by 50+ employees." | "Yes, both" |
| Build cycles: 4 months to 1 week | TBH Intranet page, `/proof`, both FDE hubs, the twin, `llms-full.txt`, JSON-LD | "Partnered with engineering and strategy ... build cycles for the internal company platform fell from 4 months to 1 week." | "Yes, both" |
| Recurring workflow staffing: 10 people to 1 operator | AI Automation page, index card, Home, `/proof`, both FDE hubs, the twin, `llms-full.txt`, JSON-LD | "Automated video sourcing, trimming, review and publishing; reduced recurring workflow staffing from 10 people to 1 operator, with a 30-minute turnaround." | "Yes, that is Fando" |
| Turnaround: 30 minutes | AI Automation page, `/proof`, both FDE hubs, the twin, `llms-full.txt`, JSON-LD | the same bullet | "Yes, that is Fando" |
| THB 13 million cumulative gross merchandise value, as of October 2026 | `/ventures/gogocash`, `/proof`, the ventures section of `llms-full.txt` | "1,000 registered users; THB 13 million cumulative gross merchandise value; THB 169,000 cashback paid." | "October 2026" |
| THB 169,000 cashback paid, as of October 2026 | the same three | the same bullet | "October 2026" |

The tests hold these rules:

- An outcome's `source` is a résumé bullet, word for word.
- Each project shows exactly the lines the owner cleared, as label and
  figure pairs, on the project he mapped them to.
- A label and a figure are each an unbroken phrase of the bullet.
- A "wrote code" claim appears only on the four portfolio projects in the
  owner's answer on code (decision 14), in any field of a project, and in
  no other source file. The answer also clears GoGoCash and Manut AI, which
  carry no such claim on the site. The pattern reads "wrote the code",
  "code he wrote" and "did the coding"; it leaves alone "write code" as an
  instruction, "coding agents" and "hard-coded".
- "My part" states no figure, never says "solo", and names none of the
  five practices the program rules out: evals, an evaluation harness,
  guardrails, observability, fine-tuning. No test checks any other wording
  against the CV. "With the team" is such a wording: see item 1 of the
  owner's list.
- The four hub lines, typed in `topics/pillars.ts`, are pinned word for
  word in both languages. The English lines use only their bullet's words.
  The Thai lines give the same figures in the same order, in Arabic
  numerals.
- A cleared figure stands in a project's outcomes and in the pinned hub
  lines, and nowhere else: no other field of any project, no other string
  of any hub in either language, and no other source file. Figures are
  compared whole, so "14 months" is not "4 months". "30 minutes" counts
  only beside "turnaround".
- Every count of registered users in the site's sources and the seed is
  exactly 1,000, with no qualifier before it, in English and Thai.
- GoGoCash's two totals, in any notation ("THB 13M", "169,000 baht"), are
  held by two modules only: the venture, where every sentence that gives
  one starts "As of October 2026," and the résumé, which restates the CV's
  line. The venture page, `/proof` and the ventures section of
  `llms-full.txt` print the month with each total.
- No source file promises cashback on "every purchase"; the GoGoCash intro
  says "eligible purchases".

The audit compares the site with lists typed in the test files. It cannot
know what the owner said: a new entry belongs in those lists only after he
has answered. It compares wording, so a figure reworded past its patterns
passes. It reads the owner's own sources, not the third-party skill text
in `lib/content/skills.generated.json`.

**What the audit does not cover.**

- **Older GoGoCash figures.** "220+ merchants", "up to 30% back" and the
  merchant names were on the site before this program. The CV does not state
  them and no recorded answer does. The program's rule allows a claim that
  is already in the repo, so they stand. This phase edited the sentences
  around them only to change the user count and the cashback wording.
- **The résumé's own line.** The résumé, its PDF and the career section of
  `llms-full.txt` give the two GoGoCash totals without a month, as the CV
  does.
- **A résumé edited in Sanity.** The tests read the repo's copy of the
  résumé. Sanity holds no résumé document today. If one is published,
  `/resume` and the PDF show it, while the text files keep printing the
  repo's copy, and no test reads its user count or its totals. A browser
  test on `/resume` could, at a price: an edit in Studio would then fail
  every pull request until the repo agreed. Left for the owner (item 12).
- **The project cover.** It is an image of Home, so it repeats Home's
  outcome lines where no test can read them.
- **"My part" wording.** The tests check verbs and figures. Whether each
  sentence says what the owner means is his to judge.

## Deviations from the plan

- **Two cards, stacked.** The plan asked for an Outcome card and a "My part"
  card after the role tiles. Side by side, the longer text stretched the
  Outcome card and left half of it empty. Each now takes a full row.
- **Hub lines are typed, not generated.** Importing the portfolio module
  into `topics/pillars.ts` would have put it in the hubs' bundle. The lines
  are typed there and checked against the outcomes by the audit test.
- **3f changed more files than listed.** Adding a public project showed
  three surfaces that credited every project to The Binary Holdings (see
  3f). `src/server/text/portfolioGroups.ts` is new. The portfolio
  description was rewritten (quoted under 3f).
- **A screenshot, not a mockup.** The app-shell mockup draws a sidebar
  dashboard, which this site is not. The project uses the existing `cover`
  slot with a real capture of Home. The test now reads: a public project
  shows a screenshot, an internal tool shows a mockup.
- **No "My part" for this site.** The owner's answer on code does not cover
  it.
- **`SITE_UPDATED`** is 2026-11-11.
- **The plan's test list** named existing files. Five test files are new,
  and one helper:
  - `lib/content/portfolioOutcomes.test.ts`: the audit.
  - `src/lib/resumeRoute.test.ts`: the résumé route's headers and loader.
  - `src/lib/resumeHook.test.tsx`: the résumé query under the hook the page
    uses.
  - `lib/sanity/fetch.test.ts`: a failed Sanity read is rethrown.
  - `src/server/content.functions.test.ts`: the résumé's server function
    (the fallback, and `no-store` on a stand-in's response).
  - `tests/siteSources.ts`: the list of source files the two audits scan.
- **Outside the plan, from the reviews:**
  - `src/lib/queryClient.ts` holds the app's query settings, so the route
    tests run under the settings the app runs under.
  - `scripts/generate-resume-pdf.mjs` refuses to print a stand-in.
  - The access tile reads "Internal tool (not public)".
  - The GoGoCash intro uses the résumé's cashback wording.
  - The résumé's server function marks a stand-in's response `no-store`.
  - A stand-in is stale from the start, so a page that shows one asks
    again when the window regains focus.
  - This site's page no longer says when the edge cache is purged, and its
    architecture drawing has no "Cache purge" box.

## Review

**First round: two independent reviewers, read-only (11-11-26).** One
audited every new public statement against the résumé, the recorded answers
and the repository. The other reviewed the code and the tests.

| Finding | What was done |
| --- | --- |
| A stand-in résumé stayed in the browser's query cache while the page was open and for five minutes after leaving it | The loader asked again when the cached résumé was a stand-in. The second round found that this held the page back, and replaced it (below) |
| No test went through the résumé route, so its cache wiring could be undone unnoticed | `src/lib/resumeRoute.test.ts` calls the route's own `headers` and `loader` |
| The audit checked a label and a figure separately, so two outcomes could trade figures | The audit pins each cleared line as a pair and requires unbroken phrases |
| The "no other hub" check saw only lines that start with a project's name | It now sees the name anywhere in the line |
| A mapper failure fell back with nothing logged | The fallback logs what the visitor was shown |
| Substring checks: "21,000" vouched for "1,000" | A figure must stand alone |
| Browser checks that could pass with the feature removed, or with wrong Thai figures | They assert the figure is drawn, and compare the Thai lines' figures exactly |
| The employer's name decided grouping in three places | `isPersonalProject` decides it once |
| "01 outcomes" for a single outcome | `countLabel` |
| "Career facts are written once" on this site's page: false, the user count alone is typed in several modules | Reworded: the facts are checked by tests wherever they appear |
| "Pages built from the content modules are rendered once per deploy": `/learn` is not | Reworded: pages that read only the content modules |
| "the figures each venture publishes": only GoGoCash has figures | Reworded: the ventures' published figures |
| The portfolio description read as if this site were built at The Binary Holdings | Reworded: "plus this site, a personal project" |
| JSON-LD said "as the owner states it" | Now "as stated in the résumé", as the page's link says |
| Code comments and this report said the totals carry their month "on every surface" | Corrected: the venture page, `/proof` and the ventures section of `llms-full.txt`. The résumé keeps the CV's line |
| This report claimed every figure on `/proof` restates a résumé bullet | Corrected: every figure this phase adds. The older GoGoCash figures are listed above |
| The seed script still said "1,000+ users" | Fixed, and now inside the scan |
| Thai: "ผู้ดูแล" for "operator" | Now "ผู้ปฏิบัติงาน"; both Thai lines reworded closer to the English |

**Not changed, and why.**

- **"220+ merchants", "30%" and the merchant names** were raised as
  unsourced. They are older copy; see "What the audit does not cover".
- **"with the team"** in AI Automation's "My part" was raised by both
  reviewers as not in the CV. It comes from the page's own "team-built"
  copy and makes the claim smaller, not larger. It stays, and the owner is
  asked.
- **"in production and growing"** on the GoGoCash page is older copy.
  Listed below.
- **Tests that assert Tailwind class names** follow the repo's existing
  habit. The browser tests measure the layout itself.

**Second round: three reviewers, then one checker per serious finding
(11-11-26).** The reviewers read the first round's fixes: the résumé route,
the audit tests, and the claims with this report. They raised 30 findings,
12 of them serious. Eight of the serious ones went to a second agent that
tried to disprove each; all eight held. The other four were checked by the
author against the code and also held.

| Finding | What was done |
| --- | --- |
| The first round's fix made the loader wait for the second read. A return to `/resume` could hold the previous page until the Sanity client gave up (10 seconds a try and 2 retries, by its settings), and without end while the browser was offline | The loader marks the stand-in invalid and returns it at once. The page asks again in the background when it mounts, and redraws when a real answer arrives |
| No test covered the failure the fallback starts from: a failed Sanity read must be rethrown, not returned as "no document" | `lib/sanity/fetch.test.ts` |
| The Thai hub lines were compared by their digits only, so "30 minutes" could become "30 hours" | All four hub lines are pinned word for word; Thai numerals are refused |
| The user count was guarded by a phrase list, so "21,000 registered users" passed | Every count of registered users in the sources is read as a number and must be exactly 1,000 |
| A GoGoCash total could be restated without its month | The totals may appear in two modules only, and every venture sentence that gives one must start with the month. The first run of this rule caught a code comment that quoted a total |
| The "no other hub" check read only the proof lists and needed the project's full name | It reads every string of every hub, in both languages, for the outcomes' figures |
| "Wrote code" was guarded only inside "My part", by a pattern that missed common wordings | A wider pattern over every string of every project |
| The GoGoCash intro promised "a cut of every purchase" at "the stores you already use". The résumé's note says eligible purchases from participating brands | Reworded in the résumé's terms, and held by a test |
| The access tile and the portfolio description said every internal project runs behind a login. The repository shows a login for the intranet only | "Internal tool (not public)" and "The internal ones are not public" |
| This site's page said tests check career facts "wherever they appear" | Narrowed to what the tests hold: the résumé's role periods, the current role's start month in the summary and on the forward-deployed hub in both languages, the case-study figures and the user count |
| This report said one rule decides the personal-project handling. Three rules do | Corrected under 3f |
| The list for the owner left out claims this phase puts in front of visitors | Added: see items 7 to 9 |
| `pnpm pdf` could print the stand-in as the résumé | The script stops when the page carries the stand-in mark |
| The route tests copied the app's query settings by hand | `createQueryClient` is shared by the app and the tests |
| The test that reads the server function's source was brittle | It matched the statement by pattern. The third round replaced it with a test that runs the function's handler |
| The browser tests measured cards before the fonts had set the text | They wait for the cards and for `document.fonts.ready` |
| The source scan skipped `public/` and the Sanity schemas | Both are read now |
| This report: 20 new browser tests (25), a shortened `CDN-Cache-Control` value, a misquoted portfolio description, "the tab's life", and "each place that shows them points to the résumé" | Each corrected in place |

**Not changed in the second round, and why.**

- **The router is not run in a unit test.** A mounted page is modelled by
  the observer `useSuspenseQuery` subscribes. The real navigation was
  checked by hand in a browser against a build that cannot reach Sanity.
- **The audit holds a list, not the owner's words.** Stated in the test
  file and under "Clearance audit".
- **`expectsHeadingPattern`** in `tests/e2e/routes.ts` is declared on every
  route and never asserted. It is older than this phase; listed below.
- **This report says "RAG".** The rule limits the word on the site. A
  report on restoring it has to name it.
- **After a failed second read the stand-in stays marked invalid,** so the
  page asks again each time the window regains focus until a read
  succeeds. Each ask is one request, and the page keeps showing the
  stand-in.

**Third round: the author's own check, then three reviewers and eight
checkers (11-11-26).** The scope was what changed after the second round,
and this report.

Before the reviewers ran, the author read Cloudflare's documentation on the
Worker cache and found that a 200 with no `Cache-Control` is kept for two
hours. The server function's response had none, so a stand-in could have
been kept at the edge through a client-side navigation. Fixed before the
round: the function marks a stand-in's response `no-store`.

The reviewers then raised 37 findings, 25 of them serious. Every serious
one went to a checker that tried to disprove it: six alone, nineteen in two
shared batches. All 25 held, several with a corrected cause or a better
fix.

| Finding | What was done |
| --- | --- |
| A stand-in that reached the page without the loader's mark (a direct load, a first visit) was never asked for again while the page stayed open | A stand-in is stale from the start, so the page asks when the window regains focus, when the network returns, and on mount if it is over a second old. Checked in a browser. A page that stays in focus still waits: nothing polls |
| No test failed if the loader waited while the page was on screen | A test holds a request open under a mounted page and requires the loader to return first |
| The route tests modelled the page without the one-second floor the hook puts under a stale time | The model has the floor, and `src/lib/resumeHook.test.tsx` runs the hook itself |
| The gate table was to be filled from a Node 26 run older than the last fixes | Both Node versions were run again on the final tree, with its hash printed |
| This site's page said the edge cache "is purged by tag when Sanity publishes and every hour". The live site shows the hourly purge not taking effect | The sentence and the "Cache purge" box are gone. The finding is below, for the owner |
| "The content modules the pages are built from": `/resume` can show an edit from Sanity that the text files do not | Now "the repo's content modules" |
| "Internal tool (not public)": the repository does not say whether three of the four tools can be reached from outside | "Internal tool (no public link)" on the tile, in the twin and in the portfolio's description |
| A test comment and a test name said the hub lines had been "shown to the owner" | "As drafted; the owner reads them before the merge" |
| The test named "names no practice the CV does not" checks five banned words only | Renamed, and this report says what it does not check |
| The "wrote code" pattern missed "code he wrote" and "did all the coding", read only the projects, and failed on "write code" and "coding agents" | A wider pattern with those exceptions, over the projects and every source file |
| "Every purchase" was refused only inside the venture's own copy | Refused in every source file |
| The user count: "at least" and "around" passed; a Thai count with "กว่า" (more than) or the unit "คน" was not read | A longer list of qualifiers over a wider window, and a Thai pattern that reads both |
| A total in another notation ("THB 13M", "169,000 baht") passed | Matched in any notation |
| An outcome figure could be typed in the FAQ or in another project's fields | A cleared figure may stand in the outcomes and the pinned hub lines only |
| The hub check failed on an unrelated "30 minutes", and on "14 เดือน" for "4 เดือน" | Figures are compared whole; "30 minutes" counts only beside "turnaround" |
| A comma after "registered users" and the words "cover a" failed the count test | Fixed |
| The source scan read third-party skill text | Left out of the audits of the owner's wording |
| The list for the owner left out the English hub lines, the `/proof` lead, the portfolio's lead, the cover, the lack of a visible note on a stand-in, and two more pieces of older GoGoCash copy | Added: items 1, 4, 7, 8, 10 and 11 |
| This report: "kept nowhere", the Thai FAQ card's "tall empty band", a row that described a removed test, "the four projects the owner named" | Each corrected in place |

**Not changed in the third round, and why.**

- **No browser test reads `/resume`'s user count or totals.** The page is
  read from Sanity, so such a test would fail every pull request after an
  edit in Studio. Item 12 asks the owner.
- **Nothing polls while a stand-in is on screen.** A focus, a reconnect or
  a return to the page asks. A poll would add a request a minute for each
  open tab during an outage, for a page that shows the right text today.
- **`no-store` on a page rests on no parent route setting an edge header.**
  None does. Noted beside the constant.
- **Good reads of the server functions stay cached for two hours.** Older
  than the phase, and the owner's decision (item 10).

## Findings outside this phase

Two of these concern the live site's cache. Both are older than the phase
(the migration's caching phase), both matter little today because Sanity
holds no résumé and the blog is hidden, and both start to matter the day a
résumé is published in Studio.

- **The hourly purge does not take effect on the live site.** `/resume` and
  `/learn` carry `Cache-Tag` and a one-day edge lifetime, and `scheduled()`
  asks for a purge of every content tag each hour. On 11-11-26 at 06:26 UTC
  both answered `cf-cache-status: HIT` with `age: 61620`, about 17 hours.
  They were stored at 13:19 UTC on 10-11-26, two and a half minutes after
  the last merge to `main`, and have outlived every hourly run since. The cause is not known
  from the repository: the cron may not run, the purge may fail (the code
  logs "[cron] cache purge failed" and carries on), or the purge may not
  reach these entries. Whether the Sanity webhook's purge works is not
  known either: nothing has been published to try it. Until it is checked,
  an edit in Studio may take up to a day to show. The migration's report
  left this check for staging. `README.md` and `/agents.md` still describe
  the purge as working.
- **Server-function answers are cached at the edge for two hours, with no
  tag.** On a client-side navigation to `/resume`, `/learn` or `/blog`, the
  browser fetches a server function. Its answer carries no `Cache-Control`,
  and Cloudflare's documentation says a Worker with `cache.enabled` keeps
  such a 200 for two hours. The live site confirms it for the résumé's
  function: `cf-cache-status: MISS`, then `HIT`, then `EXPIRED` two hours
  after it was stored (11-11-26). The answer has no `Cache-Tag`, so no
  purge by tag can remove it. This phase closes it for the stand-in only.
- **ARIA's stack is described two ways.** The FDE hub and the FAQ say ARIA
  "combines Gemini and Claude models with embedding search". The résumé
  says the knowledge platform uses "Google ADK, Gemini and Retrieval-
  Augmented Generation (RAG)", and the owner mapped that platform to ARIA.
  This phase states no stack for ARIA. The owner should say which is right.
- **Older GoGoCash copy:** "220+ merchants", "up to 30% back", the merchant
  names and "in production and growing" are not in the CV.
- **JSON-LD names him `creator` of the intranet.** The rule, older than this
  program, is: `contributor` when the role says "team project", else
  `creator`. The CV says he partnered with engineering on the intranet.
- **The `/proof` h1** still reads "venture metrics and case studies". The
  page now leads with delivery. The plan changed the lead only.
- **`expectsHeadingPattern`** in `tests/e2e/routes.ts` is set on every
  route and no test asserts it.
- **Nine mobile baselines are stale** (see "What the visual run showed").
  They pass because the comparison tolerates 1% of pixels.
- **"Founder"** on the venture pages is Phase 4.
- **The site's cover** is a capture of Home. It needs a new capture when
  Home changes, and it shows two of the outcome lines (item 1). It shows
  the contact email, which every page already shows.
- **`/blog` answers 500 when Sanity cannot be read,** as before. Only the
  résumé falls back. The blog is hidden and unlinked.

**A layout effect of this phase, for the record.** On the FDE hubs at 1024
px and wider, the FAQ card shares a row with the proof card, which grew
from three lines to five in English and four in Thai. The FAQ card now has
42 to 43 px below its last line, against 27 px under the proof list
(measured on the local build, 11-11-26).

## Open, for the owner

Asked before the merge. Merging to `main` deploys production.

1. **The outcome lines and the "My part" lines** in the table under 3c:
   approve them or change the wording. Three points inside that:
   - The site's cover image is a capture of Home, and shows two of these
     lines: "Adoption: 50+ employees" and "Recurring workflow staffing: 10
     people to 1 operator". A change to either needs a new capture and a
     new baseline for that page.
   - AI Automation's "My part" says "with the team". The CV's bullet does
     not mention a team; the page's own copy calls the project team-built.
   - Home and the portfolio index show each project's first outcome. For AI
     Automation that is "Recurring workflow staffing: 10 people to 1
     operator", a staffing figure about the current employer, in the CV's
     words.
2. **"Wrote code for it."** stands on the validator and on the signature
   tool. The question that cleared it named the two together. Confirm it for
   each.
3. **ARIA's stack:** Gemini and Claude with embedding search (the site), or
   Google ADK, Gemini and RAG (the résumé)?
4. **The hub lines,** quoted under 3e. The English pair is this phase's
   wording too. Do the Thai pair and the Thai user count, "ผู้ใช้ลงทะเบียน
   1,000 ราย", read as intended?
5. **This site's page.** It shows "Role: Owner" and "Organisation: Personal
   project", and its structured data names him as its creator. It says the
   repository holds instructions for AI coding agents and that many of its
   commits name one as co-author. Keep, reword or remove? And what should
   "My part" say for it, if anything?
6. **Optional:** the résumé gives GoGoCash's two totals without a month, as
   the CV does. Add "as of October 2026" there too?
7. **Wordings this phase wrote or changed, with no figure in them.** Say
   if any should read differently.
   - The GoGoCash intro: "shop at partner merchants and earn cashback on
     eligible purchases", the résumé's terms. It said "earn a cut of every
     purchase back".
   - The access tile on the four internal projects: "Internal tool (no
     public link)". It said "login only". The repository does not say
     whether the validator, the signature tool or the agents can be reached
     from outside. If one is public, it could carry its link.
   - The portfolio's lead: "The internal ones have no public link, so each
     page shows what the product does and how it is built."
   - The `/proof` lead: "Delivery outcomes, as the résumé states them, with
     the case study behind each. Then the ventures' published figures, with
     the sentence that states each."
8. **Older GoGoCash copy** on a page this phase edited. None of it is in
   the CV, and it stands under the rule that allows a claim already in the
   repo. Keep it, or give the wording to use?
   - "220+ merchants", "up to 30% back", the merchant names, and "in
     production and growing".
   - "Funded by affiliate commissions".
   - "My role": "I own the product end to end: merchant partnerships, the
     cashback engine, and the member experience, from first commit in 2023
     to today." ("Founder" itself is Phase 4.)
9. **The intranet's structured data names him its `creator`.** The CV says
   he owned the roadmap and partnered with engineering. Keep `creator`, or
   change it to `contributor`, as on the AI Automation page?
10. **The live site's cache,** from "Findings outside this phase". Neither
    blocks this merge, and both need a decision before a résumé is
    published in Studio.
    - Check why the hourly purge does not take effect: the Worker's logs
      for "[cron] cache purge failed", and a signed webhook on staging.
    - Server-function answers: give them the page's tag and lifetime, or
      mark them all `no-store`.
11. **A note on a stand-in.** When Sanity cannot be read, `/resume` shows
    the repo's résumé with nothing to say so. Today the two are the same
    text. Once Studio holds a résumé, a visitor would see the older copy
    during an outage. Show a short note then, or leave it silent? Each
    visit and each window focus on such a page starts one read in the
    background, which a hanging Sanity can hold for about 30 seconds (10
    seconds a try and 2 retries, by the client's settings).
12. **Optional:** a browser test that reads `/resume`'s user count and
    totals. It would catch a résumé in Sanity that disagrees with the
    site. It would also fail every pull request after such an edit, until
    the repo agreed.

## What green proves, and what it does not

- **Checked by tests:** the figures this phase adds match the résumé's
  bullets and the owner's mapping, on every surface the tests read. The
  pages render, pass axe at desktop width and fit a 320 px screen.
- **Checked by hand in a browser, and by a unit test for each layer:** a
  failed Sanity read no longer breaks `/resume`, and neither the edge nor
  the browser's HTTP cache keeps the stand-in. No automated test builds
  against a Sanity that cannot be read.
- **Not proven:** that Cloudflare treats the deployed Worker as its
  documentation says. `no-store` was seen on a local build, not on the
  edge.
- **Not proven:** that the figures are true. The four outcomes are the
  owner's own statements. The project page, `/proof`, the Markdown twin and
  the structured data point each one to the résumé. Home, the portfolio
  index, the two FDE hubs and `llms-full.txt` show them with no pointer.
  The GoGoCash figures carry none either.
- **Not proven:** that the Thai lines read naturally. The tests pin their
  wording, whatever it says. The owner is asked to read them (item 4).
- **Not proven:** that every claim about this site stays true. The
  highlights describe the repository as of this commit.
