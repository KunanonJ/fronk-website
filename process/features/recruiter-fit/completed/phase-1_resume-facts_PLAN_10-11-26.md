# Phase 1: Résumé and facts

**Status:** COMPLETE (10-11-26). Verified on the local production build,
committed as `29c835e`, archived the same day. Not pushed, not deployed.
Report: `../reports/phase-1_resume-facts_REPORT_10-11-26.md`.
**Created:** 10-11-26, at `6d31e16`
**Umbrella:** `../active/recruiter-fit_UMBRELLA_PLAN_10-11-26.md`
**Research:** `../references/recruiter-ux-review_10-11-26.md` (findings 1, 2
and 7, and the CV comparison)
**Report target:** `../reports/phase-1_resume-facts_REPORT_{dd-mm-yy}.md`

## Objective

One set of career facts, taken from the owner's CV, drives `/resume`,
`public/resume.pdf`, the Home Experience card, About, the FAQ, the FDE hub and
the text endpoints. The PDF becomes a two-page document with contact details
that a résumé parser reads correctly.

## Dependencies

- No other phase.
- Owner inputs O2, O3, O5 and O7 (umbrella). Each has a default, so the phase
  can run without a reply. O3 decides how much of each bullet is published.

## Owner answers (10-11-26)

- **Execution:** "ENTER EXECUTE MODE".
- **O3:** "All of them". Every figure and partner name in the CV may be
  public, so the bullets ship as the CV writes them.
- **O2:** "All three". The résumé lists GoGoCash, Manut AI and GoSpark.
- O5 and O7 were not asked again; their defaults apply.

## Defaults taken

- **Title:** "IT Manager & AI Engineering Lead" stays as the site writes it.
  The CV writes it with a slash; it is the same title.
- **Coins.co.th** keeps its site name and logo. Only its end date changes.
- **Headline:** built from approved identity wording, with no new claim:
  "AI Engineering Lead. Builds AI tools inside the businesses that use them.
  Based in Bangkok."
- **Summary:** one sentence from `lib/content/identity.ts`, then the CV's own
  summary sentences. The owner may rewrite the first sentence.
- **Availability:** `OPEN_TO_ROLES.sentence` appears under the headline, on
  screen and in the PDF.
- **Screen-only sections:** University-era and Affiliations stay on the
  screen résumé and are left out of the PDF, so it fits two pages. Nothing is
  deleted.
- **Training:** follows the CV. The five 2021 blockchain courses become one
  line, the PMP preparation course is dropped, and Anthropic Academy
  (May 2026) is added.
- **Sanity:** no CMS write. The seed script's résumé headline is updated so a
  future seed does not bring the old one back; the seed is not run.

## Résumé content map

Names, titles and dates only. Bullet text comes from the CV; see the next
section for what is held back. The site's period strings keep their existing
dash format.

| Section | Employer or project | Title or status | Period | Bullets (CV) |
| --- | --- | --- | --- | --- |
| Currently | The Binary Holdings | IT Manager & AI Engineering Lead | Sep 2025 to present | 4: internal platform, knowledge platform, video workflow, build cycle |
| Experience | Aiden Labs | AI Project Manager | Jan 2025 to Oct 2025 | 3, plus the note that it ran alongside The Binary Holdings in Sep and Oct 2025 |
| Experience | Aiden Labs | Advisor (part-time, concurrent) | Nov 2024 to Dec 2024 | 1 |
| Experience | The Binary Holdings | Technical Project Manager | Sep 2024 to Dec 2024 | 1 |
| Experience | Playbux | Project Manager | Nov 2023 to Sep 2024 | 2. The VaporFund launch is inside the first; VaporFund is no longer a row |
| Experience | Coins.co.th | IT Project Manager | Apr 2023 to Oct 2023 | 2 |
| Experience | The Monk Games - Bitkub Metaverse | Business Development Executive | Feb 2023 to Apr 2023 | 1 |
| Experience | KK Venture Global | Business System Analyst | Mar 2022 to Feb 2023 | 1 |
| Experience | KK Venture Global | Blockchain Developer | Feb 2022 to Apr 2022 | 1 |
| Experience | Bitkub | Smart Contract Intern | Nov 2021 to Jan 2022 | 1 |
| Independent projects | GoGoCash | Cashback platform. Live platform | Since 2023 | 3. Links: gogocash.co and `/ventures/gogocash` |
| Independent projects | GoSpark | AI workspace for business agents. In development | | 2 |
| Independent projects | Manut AI | Kept per the O2 default, with its current one-line description | Since 2025 | Link: manut.xyz |
| Education | Kasetsart University | B.Eng., Electrical Engineering | 2017 to 2021 | Existing highlights on screen; one line in print |
| Training | Anthropic Academy | Four courses | May 2026 | |
| Training | University at Buffalo and Moralis Blockchain Academy | Smart Contract Development and Security, a 4-course program | 2021 | |
| Skills | Four groups, as in the CV | AI and Cloud; Transformation and Delivery; Engineering; Tools | | |

GoGoCash and Manut AI leave the "Currently" section, so the Home Experience
card shows employment only: the current role, then the two Aiden Labs rows and
the 2024 role at The Binary Holdings. The ventures keep their own Home card.

## Figures and names held for clearance (O3)

Named by label. The values are in the CV. Until the owner clears a label, its
clause is left out of the bullet; the rest of the sentence is the CV's.

- **The Binary Holdings, current:** platform adoption count; the staffing
  change and the turnaround time of the video workflow; build-cycle time.
- **Aiden Labs:** Lunar AI Agent user count; team size and sprint completion
  rate; campaign participant count.
- **The Binary Holdings, 2024:** two partner names.
- **Playbux:** four partner names; campaign participant count and revenue.
- **Coins.co.th:** team and vendor counts; verification success rates and the
  error rate.
- **The Monk Games:** partnership value.
- **KK Venture Global:** team and vendor counts; cost saving; concert
  revenue; collection size; outsourcing saving; infrastructure cost reduction.
- **Bitkub:** competition ranking.
- **GoGoCash:** agent count; registered users; gross merchandise value;
  cashback paid.
- **Header:** the English test score.

A one-line answer is enough: "O3: all", or the labels to hold.

## Work

Three steps, each a commit-sized change. Pull requests are opened only when
the owner asks.

| Step | Scope |
| --- | --- |
| 1a | **Facts sync.** One `CURRENT_ROLE` constant in `lib/content/identity.ts` (title, organisation, start month) that `PERSON_SUMMARY`, the FDE hub proof line and the first résumé row read, so the date cannot drift again. Rewrite the résumé fallback to the content map. Add optional `note` and `status` to `ResolvedTimelineItem`. Turn skills into four labelled groups. Fix the employer name in the About story, the About arc and the FAQ background answer. Drop logo mappings no row uses, with their image files. Lead the résumé headline and meta description with the AI role. Bump `SITE_UPDATED`. Update the tests that pin the old facts and add a fact-consistency test |
| 1b | **Print résumé and PDF.** Rebuild `ResumePrint` on the CV's structure: a header with the contact line as real links and the availability sentence, then Summary, Experience, Independent projects, Core skills, Education and Training. No logos, no running numbers, no opacity. Print leaves out the screen-only sections. Keep every text size at or above 12 px. Make the generator fail when the PDF has more than two pages. Add `ResumePrint.test.tsx`. Regenerate `public/resume.pdf` from the local production build |
| 1c | **Screen résumé.** Availability chip beside the eyebrow, the summary as the lead, and the actions Download PDF, Contact and Share. Download links save as `Kunanon-Jarat-Resume.pdf`. Add the Independent projects card, the grouped Skills card, the concurrency note under a role, and a "Case studies" link from the current role to `/portfolio` |

## Touchpoints

Content:

- `lib/content/identity.ts` (`CURRENT_ROLE`, `PERSON_SUMMARY`)
- `lib/content/resumeTimeline.fallback.ts`, `lib/content/resumeProfile.ts`
- `lib/content/topics/pillars.ts` (FDE hub proof line)
- `lib/content/aboutPage.ts` (story sentence, arc chip), `lib/content/faq.ts`
- `lib/content/companyLogos.ts`, `public/brand/companies/fico.webp`,
  `public/brand/companies/vaporfund.webp`
- `lib/content/freshness.ts`, `lib/resume/search.ts` (`RESUME_META`),
  `lib/resume/view.ts` (section kinds, print filter)
- `scripts/seed-content.mjs` (headline only)

Components and scripts:

- `components/resume/ResumePrint.tsx`, `ResumePage.tsx`, `ResumeCards.tsx`
- `components/bento/Buttons.tsx` (pass a `download` attribute through)
- `scripts/generate-resume-pdf.mjs`, `public/resume.pdf`
- `src/styles/globals.css` (print block, only if the layout needs it)

Tests:

- Update: `lib/content/resumeProfile.test.ts`, `lib/resume/view.test.ts`,
  `lib/landing/experience.test.ts`, `lib/content/companyLogos.test.ts`,
  `components/resume/ResumePage.test.tsx`, `src/server/text/agentDocs.test.ts`,
  and any of `lib/content/faq.facts.test.ts`, `lib/content/aboutPage.test.ts`,
  `components/landing/home/home.test.tsx` and
  `components/landing/AboutPageContent.test.tsx` that pin a changed string.
- New: `components/resume/ResumePrint.test.tsx` and
  `lib/content/resumeFacts.test.ts`.
- References: `tests/fixtures/site-parity.json` (re-crawl), the Linux
  baselines for home, about and topic-hub-fde.

## Public Contracts

- `/resume` keeps its URL, its noindex and its `?view=compact` parameter.
- `/resume.pdf` keeps its URL. It becomes two pages and downloads as
  `Kunanon-Jarat-Resume.pdf`.
- `/llms.txt` role lines and the `/llms-full.txt` Career section change,
  because both read the résumé fallback. The Person JSON-LD description
  changes with `PERSON_SUMMARY`.
- `ResolvedTimelineItem` gains optional fields, and
  `RESUME_SKILLS_FALLBACK` changes from a list of strings to labelled groups.
  Its readers are the two résumé components and their tests.
- The Sanity `resumeProfile` schema is unchanged. If the owner later creates
  that document, its sections override the fallback and its skills do not.

## Blast Radius

- **Pages:** Home (Experience card), About (story, arc, FAQ), the FDE hub
  (proof line), `/resume` on screen and in print.
- **Machine surfaces:** `llms.txt`, `llms-full.txt`, `about.md`, the FAQPage
  and Person JSON-LD, and the sitemap `lastmod` through `SITE_UPDATED`.
- **Not touched:** the header, the footer, venture pages, portfolio pages,
  Contact, and every route's title and canonical.
- **Risk:** the two-page limit at the 12 px floor; the Linux baseline
  container (the host `node_modules` are macOS builds).

## Validation gates

Run on the local production build, with the environment values CI uses
(`.github/workflows/ci.yml`).

1. `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm knip`, `pnpm test`.
2. `pnpm build`, then `pnpm perf:budget`.
3. `CI=true PLAYWRIGHT_WEB_SERVER="pnpm start" pnpm exec playwright test smoke.spec.ts a11y.spec.ts --project=desktop`.
4. **Visual.** Regenerate the Linux baselines for home, about and
   topic-hub-fde, both themes and both viewports, in
   `mcr.microsoft.com/playwright:v1.64.1-noble` with
   `--update-snapshots=changed` (the command is in `tests/e2e/visual.spec.ts`).
   Review every changed image. Confirm the container's install step first.
5. **Parity.** Re-crawl the reference from the local preview with
   `node scripts/parity-crawl.mjs http://127.0.0.1:4173 tests/fixtures/site-parity.json`,
   review that only the intended text and JSON-LD changed, then
   `node scripts/start-gates.mjs --parity-only` reports 0 differences.
6. **PDF.** `pnpm start`, then `pnpm pdf`. Extract the text layer and check:
   - 2 pages, A4;
   - every employer name and title in the content map appears as a whole
     string, in the map's order;
   - the email, the site, LinkedIn and GitHub appear in the text, with a
     `mailto:` link and three `https:` links as annotations;
   - the availability sentence appears;
   - no initials tile or index number is in the text;
   - a second extractor agrees on the order.
7. **Fact consistency.** A search of `components`, `lib` and `src` finds no
   "November 2025" or "Nov 2025" for the current role, no "FICO", no
   "Strategic Advisor", and "VaporFund" only inside the Playbux bullet.

## Verification Evidence

Recorded on 10-11-26. Detail, deviations and findings are in the report.

| Gate | Command or check | Result |
| --- | --- | --- |
| 1 | typecheck, lint, format, knip, unit tests | Pass: 100 files, 797 tests (763 before) |
| 2 | build, first-load budget | Pass: worst route 185.9 KB of 200 KB |
| 3 | smoke and axe, desktop, both themes | Pass: 90 tests |
| 4 | Linux baselines regenerated and reviewed | Pass: 88 tests; 12 baselines refreshed (home, about, topic-hub-fde) |
| 5 | parity re-crawl and 0 differences | Pass: 132 URLs, 0 differences |
| 6 | PDF text-layer transcript | Pass: 2 pages, 844 of 844 words whole and in order, 6 links |
| 7 | fact-consistency search | Pass |

## Blockers that justify BLOCKED

- The content map does not fit two pages at the 12 px floor. Return to PLAN
  with the options: shorter bullets from the owner, or a smaller map.
- The text layer still extracts split words after the fade and the logos are
  gone. The inferred cause was wrong; investigate before anything else.
- The Linux baseline container cannot build or serve the app.
- An O3 answer leaves a bullet that no longer reads as a sentence. The owner
  rewrites it.

## Out of scope and follow-ups

- Hero, navigation, Contact and the FDE hub layout: Phase 2.
- Case-study outcomes and `/proof`: Phase 3.
- **Owner follow-up:** align the LinkedIn dates, employer names and headline
  with the CV.
- **Resolved by this phase:** item 1 of
  `process/features/visual-redesign/backlog/open-items_09-11-26.md`
  (regenerate `public/resume.pdf`). Note it during UPDATE PROCESS.

## Resume and Execution Handoff

- **Execute anchor:** this file. Supporting context: the umbrella plan and the
  research file.
- **Start with** step 1a. Steps 1b and 1c depend on its data shape.
- **Before coding:** check drift since `6d31e16`, re-read the CV, and confirm
  O2, O3, O5 and O7 or proceed on their defaults.
- **Never** write the phone number, a held figure or a local path into the
  repo. The report names held figures by label.
- **Close out** with the report, a commit recommendation for the execution
  changes, then UPDATE PROCESS before Phase 2.
