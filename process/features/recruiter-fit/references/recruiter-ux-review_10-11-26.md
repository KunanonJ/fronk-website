# Recruiter UX review and CV comparison

**Date:** 10-11-26, at `6d31e16`
**Question:** does the site fit a recruiter hiring a Forward Deployed Engineer
(FDE) or an AI team, and how does it compare with the owner's latest CV?
**Feeds:** `../active/recruiter-fit_UMBRELLA_PLAN_10-11-26.md` and its phase plans.

## Method and limits

- Read the content modules, page components and routes.
- Viewed the committed Linux visual baselines (light theme, 1440 px and
  375 px). No live browser session, and the dark theme was not reviewed.
- `/resume` has no baseline (CMS-driven routes are skipped), so the screen
  résumé was reviewed from code and from `public/resume.pdf`.
- Extracted the text layer of `public/resume.pdf` and of the owner's CV with
  pypdf, and compared each with a second extractor.
- Queried the public Sanity dataset: there is no `resumeProfile` document, so
  production renders `lib/content/resumeTimeline.fallback.ts`.

## Verdict

The site serves founders and answer engines well. The recruiter is served
almost only in machine-readable text. The approved availability line
(`OPEN_TO_ROLES` in `lib/content/identity.ts`) reaches `llms.txt`,
`agents.md`, a collapsed FAQ answer, a mid-paragraph sentence on About and the
last proof bullet of the FDE hub. It does not reach Home, the header, the
résumé or Contact.

## Findings

### P0: loses a recruiter outright

| # | Finding | Evidence |
| --- | --- | --- |
| 1 | The résumé PDF has no contact details | Its text layer has no email, LinkedIn, GitHub or site URL, and its only links are gogocash.co and manut.xyz. `components/resume/ResumePrint.tsx` renders name, headline and summary in its header |
| 2 | The PDF text layer breaks for parsers | Every entry after the first in a section extracts as split words in pypdf, and out of visual order in a second extractor. The pattern matches the per-entry opacity fade (`tailOpacity`, `style={{ opacity }}`); that cause is inferred until the fade is removed and the file regenerated. Logo initials join the job titles, the running index numbers are in the text, and the file is 6 pages with 12 skills alone on the last |
| 3 | The hero never states the role or the availability | The h1 is the name and the two ventures, with the accent colour on "Manut AI."; the Live pill says "Building GoGoCash and Manut AI"; there is one button, "Contact me". `hero.secondaryCta` exists but Home does not render it |
| 4 | The résumé is not in navigation | It is absent from `siteMenu` and the footer. Three text links reach it (Home Experience card, About arc, Contact). All navigation sits behind the menu icon at every width |

### P1: evidence that earns the interview

| # | Finding | Evidence |
| --- | --- | --- |
| 5 | Case studies show what was built, not what happened | `PortfolioProject` in `lib/content/portfolio.ts` has no field for an outcome, the owner's part, the rollout or how AI output is checked. Visuals are captioned as illustrative. Pages end with previous and next links only |
| 6 | Home gives its largest slot to location | The only two-column card is the Bangkok scene. "How I work" addresses founders. Selected work, the strongest FDE evidence, is a short text list |
| 7 | The résumé leans project manager and Web3 | Skills open with project management and tokenomics, with AI seventh of twelve. The current role has two generic bullets. No row links to a case study. Ten short rows and two same-date full-time roles read as job-hopping |
| 8 | Contact speaks to founders | "Hiring" is topic 7 of 8 in `CONTACT_TOPICS`. The prompt is "What are you working on, and how can I help?". Nothing answers a recruiter's first questions |

### P2: polish

| # | Finding | Evidence |
| --- | --- | --- |
| 9 | The "Skills" menu item opens the agent-skills catalog | `primaryNav` in `lib/content/landing.ts`. A recruiter expects a list of competencies |
| 10 | `/proof` holds only GoGoCash consumer metrics | Its lead repeats the h1 word for word |
| 11 | "See both ventures" on Home links to the card it sits in | `components/landing/home/HomeCards.tsx`: the card has `id="ventures"` and the link's href is `/#ventures` |
| 12 | Three cards have large empty areas | The FDE hub section cards at 1440 px, About "Let's talk", and the GitHub activity well |
| 13 | About's Story card introduces the owner twice | The third-person summary, then the first-person paragraph (`lib/content/aboutPage.ts`). The first is there for answer engines |
| 14 | The FDE hub has no résumé link | Its actions are Contact and Share, and the availability line is its last proof bullet (`lib/content/topics/pillars.ts`) |

### Worth keeping

The no-invented-numbers rule, the architecture diagrams, the FDE hub's
definition, the agent-readable twins, the Download PDF action on `/resume`,
and a fast, accessible, consistent design system.

## CV comparison

The CV is a 2-page A4 PDF made in LibreOffice (PDF created 2026-10-07). Its
text layer extracts cleanly in reading order. It has five link annotations
(site twice, email, GitHub, LinkedIn), a summary, and contact details.

### Facts where the site and the CV disagree

| Fact | Site | CV |
| --- | --- | --- |
| Current role start | Nov 2025 (résumé, `PERSON_SUMMARY`, FDE hub proof) | Sep 2025 |
| 2022 to 2023 employer | FICO Corporation Thailand, with the fico.com logo | KK Venture Global |
| VaporFund | A separate full-time employer | A product launched within the Playbux role |
| GoGoCash | "Founder", in the hero headline | "Independent project" |
| Second project | Manut AI | GoSpark (Manut AI is absent) |
| Monk role | The Monk Studios, Business Development | The Monk Games - Bitkub Metaverse, Business Development Executive |
| Coins end date | Sep 2023 | Oct 2023 |
| Aiden Labs advisor role | Strategic Advisor, to Jan 2025 | Advisor (part-time, concurrent), to Dec 2024 |

### What the CV adds (named by label; values stay in the CV until cleared)

- Outcome figures for the current role: platform adoption, the staffing change
  and turnaround of the video workflow, and build-cycle time.
- A private-data knowledge platform on Google ADK, Gemini and RAG.
- Lunar AI Agent at Aiden Labs: a user count, a team size and a campaign reach.
- An eKYC result at Coins; partnership, cost and revenue figures in earlier roles.
- GoGoCash: gross merchandise value, cashback paid and role-based agents.
- GoSpark, Anthropic Academy training (May 2026), an English test score, and
  skills grouped with AI first.

### What the site has that the CV lacks

The Superstacks open-source pack, the named case studies with architecture,
GitHub activity, Manut AI and the availability line.

### Positioning split

The CV headline is "AI Transformation Manager | AI Project Manager" and its
verbs are owned, led, managed and partnered. The site's approved line targets
Forward Deployed Engineer and AI engineering roles. Neither source says which
systems the owner coded himself.

## Constraints from earlier owner decisions

- **09-11-26** (`process/features/tanstack-migration/completed/phase-7_bento-redesign_PLAN_09-11-26.md`):
  the Home h1 and "Contact me" are approved canvas copy; the footer is the
  canvas footer plus the agents row; the intro overlay stays; primary buttons
  are ink.
- **10-11-26** (`process/features/sea-discovery/completed/fde-positioning-eo_PLAN_10-11-26.md`):
  the site may say open to FDE and AI engineering roles, Bangkok or remote;
  relocation and travel are not offered; customer work is stated in general
  terms; `/resume` stays noindex.
- **Wording rule** (research report section 3.3 of the same feature): no
  "RAG", "evals" or "guardrails" as named practices, because the repo did not
  support them. The CV now uses "RAG" for the knowledge platform, so it may be
  used for that platform only.

## Facts future sessions should not rediscover

- `/llms.txt` lists role titles and periods from the résumé fallback.
  `/llms-full.txt` prints every résumé bullet. Whatever enters the fallback is
  published to answer engines.
- The repository is public.
- Résumé skills always come from the repo (`lib/content/resumeProfile.ts`),
  never from Sanity.
- `tests/fixtures/site-parity.json` is the parity reference that
  `scripts/start-gates.mjs` diffs against. Re-crawl it with
  `scripts/parity-crawl.mjs` when titles, meta, JSON-LD or text endpoints
  change by design.
