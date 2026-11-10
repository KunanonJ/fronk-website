# Phase 2 report: Recruiter path

**Plan:** `../active/phase-2_recruiter-path_PLAN_10-11-26.md`
**Status:** VERIFIED on the local production build (10-11-26), on Node 26 and
on CI's Node 22.23.4. In pull request #109 with Phase 1; the branch commits
are `cfeee8b` (the phase) and `862a328` (the review fixes), squashed on merge.
Not deployed. The live site is checked after the owner deploys.
**Base:** `b86cfe8`

## Owner answers used (10-11-26)

- **Execution:** "ENTER EXECUTE MODE" for Phase 2.
- **O9, hero:** Option B, "Forward deployed AI engineering from Bangkok."
- **O8, header:** yes, inline links at 1024 px and wider.
- **O2, hero lead:** the lead shown with the chosen option, naming both
  ventures.
- **Commit, pull request and merge:** "commit+pr if ci pass merge it".
- **Not answered:** O6. Notice period and work authorization stay off the
  site.

## What changed

**2a. Home hero**

- The h1 leads with the role: "Hi, I'm Kunanon Jarat. Forward deployed AI
  engineering from Bangkok." Four block lines, the last in the accent colour.
- Under it, the availability pill, "Open to roles", then the roles and the
  place. It is a new `AvailabilityPill` in `components/bento/Chips.tsx`.
- Two buttons: "Contact me" stays primary and "Résumé" is added.
- The lead is built from `CURRENT_ROLE`: "IT Manager & AI Engineering Lead at
  The Binary Holdings. Also building GoGoCash and Manut AI."

**2b. Header and menu**

- The site menu gains a "Résumé" row after Portfolio, and "Skills" becomes
  "Agent skills". The `/skills` URL is unchanged.
- At 1024 px and wider, three links sit before the icon buttons: Work,
  Résumé and AI engineering, in a `nav` labelled "Primary". The menu's `nav`
  is labelled "Site" and stays in the HTML on every page.
- The current link carries `aria-current`, a tint and the mark's 5 px square.
  A Thai page counts as its English twin, so the Thai FDE hub marks
  "AI engineering" too.
- The header declares `lang="en"`: its labels are English on the Thai pages
  as well, where `<html>` says `lang="th"`.

**2c. Home weighting**

- Selected work takes two columns and shows each project's category.
- The ventures link points at `/proof`. It used to point at its own card.

**2d. FDE hub, English and Thai**

- The hero has the pill and a "Résumé" button beside Contact, and Contact
  opens the hiring form. "Keep exploring" lists the résumé.
- The English hub's four sections are laid out as two equal pairs. Hubs with
  one, two or three sections render as before; a test pins that.

**2e. Contact hiring path**

- `/contact?topic=hiring` is a typed search parameter (`lib/contact/search.ts`).
  The default never shows in the URL and an unknown value falls back to the
  general form.
- "Hiring" is the first topic. Arriving with the hiring intent presses it, and
  again after "Send another message". The intent only ever adds the topic.
- The message label follows the Hiring chip, not the URL: it asks about the
  role exactly while Hiring is pressed.
- A "For recruiters" card holds the availability line, the time zone, and
  links to the résumé, the PDF and LinkedIn. At 641 to 1023 px it takes a full
  row, so no cell is left empty beside it.
- Recruiter buttons that open the hiring form: Contact on both FDE hubs, on
  the résumé page and on the case-study closing card, and "Contact about a
  role" on About.

**2f. Case studies, About and the résumé page**

- Each portfolio project page ends with a "Hiring" card: the availability
  line, "Résumé" and "Contact", above the previous and next links.
- About: the pill in the hero, and the recruiter block in the "Let's talk"
  card, which had about 380 px of empty space at desktop width.
- The résumé page states the availability with the same pill, and its share
  tags are its own: a résumé link pasted into a chat used to preview as the
  homepage.

**Shared pieces**

- `lib/content/availability.ts` holds the availability wording in English and
  Thai, the hiring link, the résumé link and the PDF's path and file name.
  `lib/content/identity.ts` re-exports `OPEN_TO_ROLES`.
- `components/landing/RecruiterFacts.tsx` draws the recruiter lines and links
  for Contact and About.

## Gates

Local run on Node v26.12.0, repeated on Node 22.23.4, which CI pins, with the
environment values CI uses. The results below are the final run, after the
pre-merge review fixes.

| Gate | Command or check | Result |
| --- | --- | --- |
| 1 | `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm knip`, `pnpm test` | Pass on both Node versions: 0 lint issues, 102 files, 847 tests |
| 2 | `pnpm build`, `pnpm perf:budget` | Pass on both: worst route 186.5 KB of 200 KB, entry chunk 107.5 KB of 120 KB |
| 3 | `smoke.spec.ts` and `a11y.spec.ts`, desktop project, both themes, full run | Pass: 153 tests. Also in CI mode on Node 22.23.4, where Playwright starts its own server |
| 4 | Linux baselines in `mcr.microsoft.com/playwright:v1.64.1-noble`, re-rendered with `--update-snapshots=all` and compared by bytes; then a compare-only run, as CI's `visual` job does | Pass: 62 baselines differ from `main` (54 refreshed, 8 added). The compare-only run passes 96 of 96, with 4 skipped (the blog) |
| 5 | Parity re-crawl with the README command, then `node scripts/start-gates.mjs --parity-only` | Pass: 132 URLs, 0 differences. The reference changed in three fields: the Home h1, the `/resume` share tags and the About FAQ JSON-LD |
| 6 | Acceptance checks as Playwright tests (below) | Pass |
| Regression | Phase 1: a fresh PDF from this build, read back with pypdf and compared with the committed file; `lib/content/resumeFacts.test.ts` | Pass: 2 pages, 844 words identical and in order, 6 identical links. `public/resume.pdf` is unchanged. The fact tests are in the unit run |

**Acceptance checks, all in `tests/e2e/smoke.spec.ts`:**

- Home shows the role line, the pill and both buttons without scrolling, at
  1440 x 900 and at 375 x 812.
- From each of the 24 routes with a site header, the résumé is one click
  away at desktop width. At 375 px one tap opens the menu and its Résumé row
  is on screen; one test taps through to the résumé.
- The header links are hidden at 1023 px and visible at 1024 px, on one row,
  touching neither the email nor the buttons, with no horizontal overflow.
- `/contact?topic=hiring` presses the Hiring chip, as a click and as a direct
  visit; unpressing it brings the general question back.
- An unknown `topic` falls back to the general form with a 200, and the
  default is never written into the URL.
- Contact leaves no empty cell beside the recruiter card, at 1440 px and at
  800 px.
- On the English FDE hub at 1440 px, no section card has more than 120 px
  between its kicker and its number.
- The Thai FDE hub shows the pill and both buttons, in Thai.
- A case study ends with the résumé and the hiring contact.
- About's closing card answers a recruiter and keeps the general Contact.

**Do the tests notice a break?** Eighteen behaviours were broken one at a
time and the files restored byte for byte. A unit test failed for each.

- Phase work (8): the label following the URL instead of the chip; "Send
  another message" forgetting the intent; the intent no longer pressing the
  chip; the header square removed; About's recruiter link opening the general
  form; LinkedIn opening in the same tab; the ventures link pointing at its
  own card; a three-section hub getting the pair layout.
- Review fixes (10): "RAG" said in a third place; a past role's end month
  changed; the header's language removed; the recruiter card one column at
  tablet width; the FAQ offering relocation; `about.md` without the
  availability line; `llms-full.txt` without the role notes; a printed
  education line keeping its bar; the printed languages line dropped; the
  new-tab cue removed.

### What the visual runs showed

- Against the baselines from before this phase, 64 of 88 visual tests passed
  and 24 failed, as expected.
- The 1% tolerance still hides real changes. After the About card gained the
  recruiter block, both desktop About tests passed against the old image;
  only the mobile ones failed. The bytes were compared instead.
- The résumé and the Thai FDE hub now have baselines (8 files). The résumé
  rendered byte-identically in two separate runs.
- Nine mobile baselines differ in bytes and were not refreshed: design,
  learn, not-found and topic-hub-th-short in both themes, and press-light.
  All nine are in the drift recorded at the base commit in Phase 1. This
  phase does not change those pages at 375 px. Press varies from run to run.
- This phase refreshed every desktop baseline with a header, so the older
  drift is cleared at desktop width.

## Deviations from the plan

- **Home card spans.** The plan gave Experience, Ventures, the Bangkok card
  and "How I work" one column each. The Bangkok card is a full-width last
  row and "How I work" takes two columns: a one-column Bangkok card would be
  about 680 px tall.
- **The Thai FDE hub keeps the canvas layout.** It has two sections, and the
  pair layout applies to an even count of four or more. Its first card has
  about 170 px of empty space at desktop width.
- **`AvailabilityPill` is its own component.** The plan suggested a label on
  `LivePill`. That pill is one line, says "Live", and carries the Ember
  square, which means live or failed. The availability line wraps to three
  lines at 375 px and uses the accent square.
- **A new module, `lib/content/availability.ts`.** Pages that show the line
  should not load the whole identity module.
- **"Contact me" in the Home and About heroes opens the general form.** Those
  buttons serve every visitor. The buttons that speak to a recruiter open the
  hiring form (listed under 2e).
- **The hiring intent only ever adds the topic.** It is how the visitor
  arrived, not state: pressing a chip never changes the URL. So a later
  general visit does not remove a pressed chip.
- **The ventures link keeps its approved label,** "See both ventures". Only
  its target changed, as the plan says.
- **The header's current marker has a square.** The tint alone is about
  1.1:1 against the page.
- **Touchpoints the plan listed and this phase did not need to change:**
  `PlaceCard.test.tsx`.
- **Beyond the plan, from the pre-merge review** (each small, each tested):
  the `/resume` share tags; `lang="en"` on the header; the Thai hub counting
  as its English twin for the current marker; baselines for the résumé and
  the Thai FDE hub; "built" for "architected" in About and the FAQ; the
  availability line in `about.md`; and the local paths scrubbed from
  `AGENTS.md` and four completed plans.

## First review, before the phase commit

One reviewer read the diff against the plan, using the method in
`.codex/agents/vc-code-reviewer.toml`. No blocker. Five findings to fix and
eight smaller ones:

| Severity | Finding | Outcome |
| --- | --- | --- |
| Should fix | The form's hiring state did not hold together: unpress Hiring and the label still asked about the role; "Send another message" cleared the chip but kept the role question | Fixed. The label follows the chip, and the intent is applied again after a reset |
| Should fix | About's "Let's talk" card was untouched, though the plan fills it with the recruiter facts | Fixed. The card has the recruiter block, with its own link to the hiring form. The ink "Contact" button stays general, because the card also invites founders and operators |
| Should fix | The header's current link was marked by a tint the eye barely sees | Fixed. The mark's square sits under the label, so no link moves when it appears |
| Should fix | "See both ventures" had been relabelled without approval | Fixed. The approved label is back |
| Should fix | The acceptance checks were thinner than the plan: one route on mobile, no direct visit to the hiring URL, nothing at the 1024 px breakpoint | Fixed. All three are tested |
| Nit | Eight smaller points: a test comment, a module comment, a stale heading pattern, the freshness note, LinkedIn's tab, the hiring prompt's wording, the availability stated twice on the FDE hubs (kept: the proof list is what answer engines quote), and an old seed script (recorded below) | Six fixed, one kept, one recorded |

## Pre-merge review of the whole branch

Before the pull request, a workflow read the whole branch (phases 1 and 2)
through six lenses: behaviour, tests and CI, content, search and
performance, accessibility, and security and privacy. A skeptic then tried to
refute every finding against the code. Nine agents; nothing was pushed until
the privacy lens had reported, because the repository is public.

**Result:** 58 findings. 46 confirmed, 8 refuted, 4 uncertain. 23 of the
confirmed ones predate this branch.

**The two "blocker" verdicts were settled by the CV, which the reviewers
could not read.** They flagged "RAG" in the résumé's skills list, because the
umbrella plan limits the word to the knowledge platform. The CV's Core Skills
line lists RAG, and the Phase 1 plan the owner approved sets the skills as
"four groups, as in the CV". The site says "RAG" in exactly the two places
the CV does: the knowledge-platform bullet and the skills line. It stays; a
test now pins both uses and fails on a third. The owner is asked to confirm.

**Fixed in this pull request:**

| Finding | Fix |
| --- | --- |
| `/resume` shared the homepage's Open Graph and Twitter tags (older than the branch) | The route uses `routeShareMeta`, and stays noindex |
| Contact at 641 to 1023 px left an empty cell beside the recruiter card | The card takes a full row at two columns. A browser test measures it |
| English header labels on Thai pages had no `lang` | The header declares `lang="en"` |
| On the Thai FDE hub the header marked nothing and the menu marked Learn | A Thai path counts as its English twin |
| "Architected" was attached to KK Venture Global; the CV says built | About and the FAQ say built |
| The Thai FDE hub changed in this phase but had no axe scan and no baseline | It is in `tests/e2e/routes.ts`, with four baselines |
| `/resume` was excluded from visual regression "because content comes from Sanity", but Sanity holds no résumé document | It has four baselines; the comment says when to exclude it again |
| The local gate script skipped the English FDE hub's tests (older than the branch) | Both FDE hubs have a `test` name in `src/ported-routes.json` |
| Past-role dates were never checked | A test pins all ten periods; each was checked against the CV |
| A printed education line without a period kept a trailing bar | The line prints only the parts it has |
| `about.md` left out the availability line | It carries it under the title |
| Three behaviours had no assertion: role notes in `llms-full.txt`, the default topic stripped from the URL, the printed languages line | Each has one |
| The relocation guard checked one object; the "no other hub" test checked one hub | Both scan About, the FAQ and every hub in both languages |
| LinkedIn in the recruiter block opened a new tab without saying so | It says so to a screen reader |
| Local paths with the owner's username in `AGENTS.md` and four completed plans (older than the branch) | Eleven lines scrubbed. Git history still holds them |

**One finding came from my own run, not from the reviewers.** A CI-mode run
failed 24 browser tests because the local Workers runtime could not reach
Sanity or GitHub for a while. All 23 of the new phone tests tapped through to
the résumé, and each needed a live Sanity read, so they all failed together.
`e2e-smoke` is a required check. Now each route's test checks that the menu
row is on screen, and one test taps through.

**Recorded, not changed:** see "Open, for the owner" and "Findings outside
this phase".

## Findings outside this phase

- **The résumé page depends on Sanity for every in-browser visit.** A direct
  visit is usually served from the edge cache. A click on a Résumé link navigates in
  the browser, which calls a server function that reads Sanity; a failed read
  shows "Something went wrong." by design (`lib/sanity/fetch.ts`). Sanity
  holds no résumé document, so the read always returns nothing and the page
  draws the repo's data. The new header link makes this path the common one.
  Options: fall back to the repo's data when the read fails, or stop reading
  Sanity for the résumé until a document exists.
- **I dropped eight URLs from the parity reference, and caught it.** The
  first re-crawl ran without `PARITY_SEEDS`, so the markdown mirrors and
  `/llms-full.txt` vanished from the file (132 URLs became 124). The README
  has the right command. A re-crawl should be followed by a count of URLs
  added and removed, not only by the gate, which passes either way.
- **"AI engineering" wraps to two lines** in the button grid of About's
  "Let's talk" card, at both widths. It did so before this phase.
- **`expectsHeadingPattern` in `tests/e2e/routes.ts` is read by nothing.** The
  smoke test only checks that an h1 is visible.
- **`scripts/seed-content.mjs`** still seeds "Building fintech and AI from
  Bangkok." into two Sanity documents that no app code reads.
- **The "How I work" card on Home** has about 110 px of empty space above its
  first line at desktop width, because it shares a row with the taller
  Ventures card.
- **Nine mobile baselines are stale** (listed above). They predate this
  program.
- **Smaller points the review confirmed, all older than the branch:** the
  résumé PDF has no tags or document language; the PDF script accepts an
  empty page and checks links only in the contact block; a résumé section
  from Sanity with a missing or repeated title would break the page; the
  Person JSON-LD types its job titles by hand; the Thai FDE hub's share image
  is the site card; `/design` has the homepage as its canonical; the footer
  has the same missing `lang` the header had; link arrows are read aloud as
  part of link names; the availability pill's dots may be read aloud; the
  message label on `/contact?topic=hiring` changes after hydration and can
  move the box below it by a line on narrow screens.

## LinkedIn (10-11-26)

The owner supplied the profile link. Its signed-out view was compared with
the site, and the differences were given to the owner directly: this
repository is public, so they are not listed here. The owner decided that the
CV wins where sources disagree, so nothing on the site changed. The site's
LinkedIn link resolves.

## Open, for the owner

- **"RAG" in the résumé's skills.** Kept, because the CV lists it. Say if it
  should go; it is one line and one test.
- **"Founder".** About, the venture pages, the JSON-LD, the page meta and two
  text endpoints call the owner the founder of GoGoCash and Manut AI. The CV and the résumé
  call both independent projects. The research file lists this as a
  disagreement with the CV, and Phase 1 changed only the résumé and, through
  Phase 2, Home. Which framing should the rest of the site use?
- **The GoGoCash user count.** The résumé says "1,000 registered users", as
  the CV does. Home, the venture page, the FAQ and two hubs say "1,000+
  users". Phase 3 settles it with the figure's as-of month.
- **The printed languages line,** "English: TOEIC 725 (2026)". O3 cleared the
  figure. O6, how to state languages, is still unanswered; the line follows
  the CV until it is.
- **"Guardrails"** appears once on `/skills` and once in the operating model
  ("turn repeated mistakes into guardrails"), both older than this program.
  The wording rule bans it as a named practice. Does this sentence count?
- **"The Binary Labs"** is named once, on the email signature case study, and
  nowhere in the CV-derived résumé. Phase 3 can keep or cut it.
- **Local paths in git history.** The eleven scrubbed lines remain in earlier
  commits. Rewriting public history is the owner's decision; I do not
  recommend it for this.
- **LinkedIn:** settle the differences given on 10-11-26, on LinkedIn or in
  the CV. Two of them are facts, not wording.
- **O6:** notice period and work authorization are not on the site. The
  recruiter block has room for one line of each.
- **O5 and O7,** from Phase 1, are still on their defaults.
- **The hero wording** is yours to edit: `hero` in `lib/content/landing.ts`.
- **Should "Contact me" on Home open the hiring form?** It opens the general
  form today.
- **After deploy:** open `/contact?topic=hiring` on the live site and check
  the Hiring chip is pressed, and paste the `/resume` link into a chat to see
  its own preview.

## What green proves, and what it does not

- **Proves:** on the local production build, a visitor to Home, the FDE hub,
  a case study, About or the résumé sees the role and the availability, and
  reaches the résumé in one click (two taps on a phone) and a hiring contact
  in one. The contact form's chip, label and URL agree. No career fact or
  résumé PDF content changed in this phase, and every past role's dates match
  the CV.
- **Does not prove:** that recruiters find the path clearer, which needs a
  person; the live site; the nine stale mobile baselines.
