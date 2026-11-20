# Now building, the recruiter-clear résumé, and the Gen Z layer (program, 20-11-26)

The owner (20-11-26) asked for three things:

- "find the ways to improve interactive as much as possible i want to make it cool and genz people"
- "im not open to work fulltime now so maybe call it currently building gogocash and manut AI project"
- "in Resume page please make it better design with genz driven with clear and great for recruiter to review"

Research is in two agent reports, summarised here: the /resume audit and the interactivity audit. The owner's answers:

- **Status:** "Currently building" GoGoCash and Manut AI, not open to full-time work.
- **The Binary Holdings role** (IT Manager & AI Engineering Lead, from Sep 2025) **ended in Nov 2026**.
- **Who may still get in touch:** partnerships and collabs, freelance or consulting, advisory, talks and workshops, and recruiters for later.
- **Interactive:** all four bundles (secrets and collectibles, hero canvas tools, living status, the 404 game with Save my edition).
- **Résumé:** the "Snapshot" direction.

Each phase is one PR, opened as a draft until it is ready (since #154, a ready PR merges itself once CI passes). Then: deploy, live checks, and this file updated.

## Phase 1: the status and the role (truth first)

- **Availability:** `AVAILABILITY` (was `OPEN_TO_ROLES`) says "Currently building", GoGoCash and Manut AI, Bangkok, with a `workWith` line. It covers English and Thai.
- **The role:** `LATEST_ROLE` (was `CURRENT_ROLE`) ends Nov 2026. Every sentence about it is past tense, and the footer Now line is about the ventures.
- **Hiring becomes working together:**
  - the case panel becomes "Work together"
  - Contact topics: Freelance or consulting, Partnership, the ventures, AI / ERP advice, Speaking or workshops, Investment, A future role, Something else
  - `?topic=project` is new, and `?topic=hiring` still works and chooses "A future role"
- **Facts:** the FAQ, JSON-LD (no current employer), both FDE hubs, share cards, the text endpoints and the résumé data (PDF regenerated).
- **Baselines:** the footer label is on every page, so they are refreshed at zero tolerance (the two-pass method in memory).
- **Shipped:** #158, squash 053af6b (20-11-26). Live: "Open to roles" gone, "Currently building" on every page, cases end with "Work together", `?topic=project` chooses Freelance or consulting, and the live PDF equals main's. 126 baselines were re-rendered in one zero-tolerance pass (both visual steps finished in time), attempt equal to retry.

## Phase 2: the résumé, "Snapshot"

- **First screen:** a smaller heading beside a facts card. It holds the pixel portrait, Building (GoGoCash and Manut AI, with logos), Bangkok GMT+7, email, LinkedIn and GitHub as real links, and Download PDF as the main button. Both widths show it without scrolling.
- **Then, in order:**
  - Building now
  - Experience as one column
  - Skills
  - Education and Training
  - University-era and Affiliations folded into a closed `<details>`
- **Rules:**
  - The facts are derived from the profile's sections, so a Sanity `resumeProfile` still flows through.
  - Degraded mode renders the same.
  - Print stays plain and at most two pages.
- **Styles:** `.pf-resume*` moves to a lazily loaded `src/styles/resume.css`, which frees first-load CSS for every page.
- **Built (#159):**
  - Every other page's first-load CSS goes from 35.2 to 34.6 KB, and a zero-tolerance run showed no other baseline moving.
  - /resume itself loads 37.1 KB of stylesheets, over the 36 KB first-load budget, which the script does not measure on this request-rendered page. Trimming it is a follow-up.
  - The Detailed/Compact toggle is gone; an old `?view=compact` link still opens the page.
  - GoGoCash's figures left the screen's tiles but stay in the PDF and the case studies.

## Phase 3: secrets and collectibles

- **⌘K slash commands:** /party, /theme, /copy email, /traits, /random case, /shortcuts, and hidden ones.
- **A pixel party:** the Konami code or /party fires the intro's burst from the nav avatar.
- **A trait hunt across the site:**
  - the 404, the end of a case, a contact draft, a ⌘K secret
  - the nav avatar wears the visitor's trait
  - "Try a trait" on /about stays the open path
- **Contact:** a pixel burst when the contact draft is ready.
- **Rules:** device storage only. Under reduced motion, the effects become a trait swap and a polite message.
- **Phase 2 shipped:** #159, squash 6db14ae (20-11-26). Live at 1440 x 900 and 390 x 844: the h1, Download PDF and Contact are in view, `resume.css` loads with the page, and University-era is folded.
- **Built (#160):**
  - The traits moved to `lib/brand/portraitTraits.ts`, and the store (`lib/brand/traitStore.ts`) loads only once a trait exists. The shell carries only `traitEvents.ts`.
  - The commands are `/theme light|dark`; there is no system theme, because the provider has `enableSystem={false}`.
  - Gold glasses are awarded only after the page has scrolled, so full-page captures never trigger them.
  - The topic hubs sit at 164.9 of 165 KB, so any future shell code needs a deliberate budget raise.
  - A zero-tolerance run showed no baseline moving.

## Phase 4: hero canvas tools

- **The tools:** the canvas toolbar works at 810 px and up with a mouse. The pen draws violet or coral doodles that fade, stamps drop pixel stickers, and Clear empties the canvas.
- **Move stays the default**, so the frame links keep working.
- **Loading:** a lazy chunk and stylesheet.
- **Phase 3 shipped:** #160, squash a5ea607 (20-11-26). Checked live with no page errors:
  - Typing `/` in ⌘K lists 9 commands.
  - `sudo hire kunanon` answers, and the toast says "You found Gold earring · 1/6".
  - The Konami code throws the party, and the nav avatar puts on Shades.
- **Built (#161):**
  - The toolbar is Move, Stickers, Pen, Ink (violet or coral) and Clear. Each slot shows its own tool from the first paint. The build first showed the old decorative icons until hover and then swapped them, so the icons changed under the pointer; that was dropped in favour of a one-time baseline refresh of 4 captures.
  - The first sticker awards the headphones.
  - The tools' chunk (3.1 KB) and stylesheet (1.0 KB) load on the first hover or focus of the toolbar.

## Phase 5: living status

- A Bangkok-hour chip, worded as a guess. Its copy is for the owner to approve.
- A ship log from the latest commit on main, through a Worker endpoint with an edge cache.
- The nav avatar winks on hover or focus.
- **Built (branch `feat/living-status`):**
  - **The guess:** beside the footer's clock, from the hour LocalTime hands it at each minute (no timer of its own). DRAFT copy in `lib/content/livingCopy.ts`: "probably asleep" (23 to 6), "probably having coffee" (6 to 9), "probably shipping" (9 to 12, 13 to 18), "probably at lunch" (12), "probably still shipping" (18 to 23). The owner's "asleep, replies by morning" became "probably asleep": a reply time is a claim about availability.
  - **The ship log:** `/api/github/shipped` answers `{ subject, date, url }` for main's latest commit (GitHub's REST API, `GITHUB_TOKEN` when set). Ten minutes in browsers and at the edge, a day of the last copy on error (`stale-if-error`), a 503 with `no-store` when GitHub fails. The subject is the first line, at most 80 characters, cut on a word and keeping the pull request number. The footer asks for it once its card is within half a screen, and shows "Shipped 3h ago: <subject>" under the Now line (Intl.RelativeTimeFormat, narrow), or nothing.
  - **Loading:** both are one lazy chunk (`Living`, 1.2 KB gzip) with its own sheet (`living.css`, 0.4 KB), loaded after hydration; the server draws neither. Full-page captures take both out of the flow (`screenshot-no-clock.css`).
  - **The wink:** a hidden 16 x 16 patch (row 7, columns 9 and 10) drawn over the dressed avatar, shown for 250 ms by CSS when the home link is hovered or focused; never under reduced motion, and none where shades cover the eye.
  - **Budgets:** the shell grew 138 B gzip (on #161's main); the topic hubs are at 168,910 B (164.95 of 165 KB, 50 B left). A lazy chunk's new hash alone moves the entry chunk by about 10 B, so the next shell change needs a deliberate raise or a saving.
  - **At rest:** Home's nav and footer, captured as the full-page baselines are (both themes, 1440 and 375 px), are byte-identical to main's.
  - **Parity:** the endpoint is not in the parity crawl: without a token in CI, GitHub's limit of 60 requests an hour could turn its 200 into a 503 and fail the gate at random.

## Phase 6: the 404 game, Save my edition, the holo card

- **The 404:** it arrives with pixels missing. Patching them plays the art and awards the cap, and there is a random-case link.
- **Save my edition:** a PNG of the traited portrait, made in the browser.
- **The holo card:** the /about portrait tilts with a sheen, for a mouse only, with lazy CSS.
- **Phase 4 shipped:** #161, squash e080c8b (20-11-26). Live: the toolbar, a sticker and the Headphones toast, the pen, and Esc back to Move all work.
  - The live check found a first click lost while the layer's chunk was still loading; #162 (8031712) keeps it and stamps it once the layer arrives.
- **Built (#163):**
  - **The 404:** seven seeded gaps. They are buttons named "Patch pixel n of 7", and "Patch it all" is the path that needs no game. The art plays when it is fixed and awards the Coral cap. "I'm feeling lucky" chooses a case on the client from `lib/content/casePaths.ts`, which a test holds equal to the site's cases.
  - **/about:** Save my edition is a 480 px PNG, made in the browser; touch devices get the share sheet. The button shows only once a trait is found, so /about is unchanged at rest. The holo tilt and sheen are for a mouse only, and lazy.
  - **Sizes:** the 404 is 97 px taller, so 4 baselines were refreshed. The topic hubs are at 168,876 of 168,960 B.
- **Phase 6 shipped:** #163, squash 2337239 (20-11-26).
- **Phase 5's budget:** with phase 6 merged, the topic hubs were 51 B over 165 KB. The fix was not a raise: the footer read three words from the contact page's copy, which pulled the whole contact chunk (1.2 KB gzip) into every page. Those words now live in `lib/content/contactWords.ts`, which takes the hubs to 168,107 B, with 853 B of headroom.
- **Phase 5 shipped:** #164, squash 20e7c20 (20-11-26). The ship log drops a commit's type prefix ("feat(footer): ..." reads "a living status ...").
- **The deploy incident (20-11-26, fixed by #165, 748202a):** five seconds into #164's rollout, the Worker cache kept the previous build's home page under the new version's key, for a day. Real Chrome's variant pointed at 19 deleted scripts: an unstyled page that never ran. WebKit and Firefox were fine, and curl with default headers saw nothing. Every build now has an id on `<html data-build>`, and `src/server/negotiate.ts` keeps a page at the edge only when the id is its own; otherwise it answers with `no-store` and logs. After a deploy, check home in real Chrome (Playwright `channel: "chrome"`).

## Phase 7: the UX/UI bug hunt (21-11-26)

- **Ask:** a bug hunt on every platform from desktop to phone, collecting every detail to be pixel perfect, with ways to improve.
- **The sweep:** 48 routes on 12 devices, light and dark (Chromium, WebKit and Firefox, 320 px to 1920 px; 600 loads): axe, sideways scroll, clipping, tap areas, focus rings, widows, measure, alignment and breaks. No axe violations and no sideways scroll. The findings went into two batches.
- **Batch B, typography and pixel polish (#166):**
  - Headings balance their lines and paragraphs avoid a lone last word (`text-wrap-style`, progressive). The topic hub headlines end "and SEA" and "from Bangkok", as the Thai hubs do.
  - One reading measure, `--measure: 34em` (about 70 characters; Onest's `ch` is 0.665em, so 64ch held about 90), on case prose, FAQ answers, /about, /learn, /proof, skills notes and the résumé.
  - "Manut AI", "The Binary Holdings" and "IT Manager" never split (`lib/content/keepWhole.ts`, display copy only, so meta tags, JSON-LD, Markdown and llms.txt keep plain spaces).
  - Skills pages: the agent prompt breaks only after a slash, commands only between words, sizes never.
  - Filter groups below 600 px are one row that scrolls sideways, and the pressed option scrolls into view.
  - Alignment: the skill pager, code insets, library kickers, the back link and the framed images.
  - 320 x 568: Contact me and Résumé are on the first screen in all three engines.
  - Case pages: chapter 01's fact strip drops its closing rule (it drew an empty row above chapter 02's), and on phones the facts share a label column. The résumé's facts card stacks below 375 px, so the email is one line.
  - Sweep, before and after: heading widows 169 to 59 (Tier 5: 108 to 5), long measure 160 to 0, alignment near-misses 140 to 44. Brand names split at phone widths: 64 to 2.
- **Batch A, correctness and accessibility:** in progress.
- **For the owner (not changed):** /about states its principles twice and the availability line about five times; /contact puts "Or write it here" before the email option and ends with a second call to action; at 1024 x 768 Home's hero is one column with about 40% empty.

## Constraints in every phase

- Reduced motion, and WCAG 2.2: 2.2.2, 2.3.1, 2.5.8, 1.4.13, and keyboard parity.
- Budgets: the worst page's first-load CSS stays at or under 36 KB, so new CSS is lazy. The entry chunk stays at or under 120 KB.
- No new heavy dependencies.
- Claims stay owner-cleared, and new copy is marked DRAFT.
- Facts come first: playful features are opt-in or found by the visitor.
