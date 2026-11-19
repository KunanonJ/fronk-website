# Phase 7 report, group D2: catalog pages (skills, résumé, status, /design, blog, press)

**Plan:** `../active/phase-7_remaining-pages_PLAN_18-11-26.md`, steps 7c, 7e,
7f, 7g, 7h and this group's share of 7i. Group D1 (7a, 7b, 7d: the topic
hubs, Thai typography and the reading pages) runs in its own lane.
**Date:** 18-11-26 into 19-11-26, in the worktree
`t3-08401c89-cad01418b9af45b4` on the local branch
`feat/profile-phase7-catalog-pages`, from `09ee95b` (the Phase 6 cutover's
tip plus the commit that adds this lane's partial). Local commits only;
nothing pushed, merged, rebased or deployed.
**Lane settings:** `PORT=3108`, `GATES_PORT=4308`, Playwright `--workers=2`.
**Harness:** `.claude/agents/`, `.claude/skills/` and `process/context/` are
missing; the lane ran from the shared brief under the Harness-Absent
Fallback.
**Status:** CODE DONE for group D2. The plan's Status is the orchestrator's
to set once both groups are merged. Linux baselines are not rendered here
(section 7). The by-hand checks of plan gate 7 are the owner's (section 9).

## 1. What was built (by plan step)

| Step | Files | What |
| --- | --- | --- |
| Scope | `lib/design/scope.ts` and test | The seven route ids of this group join `PROFILE_ROUTE_IDS` (`/_landing/skills/`, `/_landing/skills/$slug`, `/_landing/resume`, `/_system/design`, `/_landing/blog/`, `/_landing/blog/$slug`, `/_landing/press`), grouped under one comment. A match that ended in a 404 or an error (status `notFound` or `error`, or the root's `_notFound` mark for an unknown URL) now counts too, whichever route failed, because the status page it shows is the new one (7f). So `<html>` carries `data-design="profile"` and the root preloads Onest and Instrument Serif on all of these |
| Shared parts | `components/profile/catalog/{CatalogHero,ToggleGroup}.tsx` | `CatalogHero`: the core pages' hero (`.pf-page-hero*` from Phase 6: the pixel sky, the eyebrow after a status dot, the display h1, the lead) with a slot above the eyebrow for a back link or a breadcrumb and any section attributes (`role="alert"`, `data-print-hide`). `ToggleGroup`: a named group of toggle pills (`aria-pressed`), ink when on, with an optional count after the label ("SME 3"). The h1 lines reuse Phase 6's `Headline`, built from each page's own content module, so no new content module was needed |
| 7c `/skills` | `components/landing/skills/{SkillsIndexPage,SkillsCatalog,SkillCard,SkillParts,CopyButton,InstallTabs}.tsx` | The hero on the sky (h1 lines from `skillsPage.headline`), View on GitHub (dark pill), the Share pill (kept, with its 56 px rule) and the release pill; the install tiles (the tabs and copy buttons as pills, the agent prompt); the pipeline as the case template's numbered steps, each a link to its skill; the catalog's filter tile and one section per stage of paper skill tiles with mono names and chips; the credits as a fact strip, one row per upstream between hairlines. `article#install`, `#pipeline` and `#catalog` stay (the skill pages link them). SoftwareSourceCode and BreadcrumbList JSON-LD unchanged |
| 7c `/skills/$slug` (20) | `components/landing/skills/{SkillDetailPage,SkillSourceCard}.tsx` | The hero with the breadcrumb in the back link's place, the eyebrow "Skill · {stage}", the skill's name as a mono display h1, the lead, the author line, the chips and the pills; then tiles: Install (two columns wide), How it runs, Files, Origin (with its facts), More in the stage, SKILL.md (full width, the fold and the toggle kept), and the previous and next pager |
| 7e `/resume` | `components/resume/{ResumePage,ResumeCards}.tsx` | The hero with the summary, the availability line, Download PDF (dark pill, full width on phones), Contact (ghost pill), Share and the Detailed / Compact switch; then each section in the records card's style (paper 2, a mono heading, rows of the title, the organisation and the period, the logos kept), placed by its kind: Currently, Experience (two balanced columns), Independent projects, University-era beside Education and Affiliations from 1024 px, Training, then Skills (chips) beside Share. `ResumePrint` is untouched; both screen parts carry `data-print-hide` |
| 7f 404 and errors | `components/landing/{StatusPage,statusArt}.ts(x)`, `components/{NotFound,RouteError}.tsx` | The hero on the sky (the h1 "Nothing lives here." and "Something went wrong.", word for word), then three tiles: the status with a pixel drawing of our own (404: a page of tiles with one slot empty and its tile fallen below; error: the same page cracked through, drawn with Phase 1's `PixelArt` in tokens, hidden in forced colours), "Try one of these" with the four recovery links, and "Broken link?" / "Still broken?" with the address and Copy email. "Try again" is the dark pill. No link to `/blog` or `/press` |
| 7g `/design` | `components/system/{DesignSystemPage,SystemLayout}.tsx`, `src/routes/_system/design.tsx` | The content of the deleted `/preview/system` (from `ea9c1d0^`): colour, ink mixes, materials and washes; every type style; radii and shadows; every primitive; the testimonial notebook with its three labelled samples (`sampleNotes.ts`); and states and preferences, last. The hero on the sky keeps the h1 "Design system". No site chrome, as before, so the phone theme switch (`ThemeSwitch`) sits in a bar of its own where the nav would be. Still noindex; its canonical is now `/design` (backlog P3) |
| 7h `/blog`, `/blog/$slug`, `/press` | `components/landing/blog/{BlogIndexPage,BlogPostPage,BlogParts}.tsx`, `components/landing/PressPage.tsx` | Light restyles: the hero on the sky, the bento cards as tiles in the same spans (press keeps `pressSpans`, now as `data-span`), the filters as toggle pills, the post rows and the links lists restyled. Still noindex, unlinked, out of the sitemap |
| Routes | `src/routes/_landing/{skills/index,skills/$slug,resume,press,blog/index,blog/$slug}.tsx` | `PageMain` (the bento column) gives way to `ProfileMain` (`main#main.pf-main`, under the fixed bar); heads, loaders and JSON-LD unchanged |
| Styles | `src/styles/profile/pages-catalog.css` | This lane's partial only: plain CSS on the tokens, phones first, rem breakpoints in range syntax (`width >= 37.5rem`, `40rem`, `64rem`; no `max-width` pairs), `@layer components`, the chevron's turn inside no-preference, contrast and forced-colours blocks. `cutover.css` and the other partials are untouched |
| 7i Tests | section 4 | Unit tests rewritten to the same intents; a guard for this group's files; a browser spec of its own; the notebook checks re-enabled on `/design` |
| Dead code | `components/bento/MonoEyebrow.tsx` (deleted), `BentoRow` in `components/bento/Bento.tsx` (deleted) | knip flagged both once their last users moved |

## 2. Content and parity

- **Parity** (`GATES_PORT=4308 node scripts/start-gates.mjs --parity-only`,
  before the fixture update): 137 URLs compared, **1 with differences**:
  `/design`'s canonical, `https://kunanonj.com` to
  `https://kunanonj.com/design` (intended, plan 7g). The fixture takes
  exactly that one tag (`tests/fixtures/site-parity.json`, 1 line). Titles,
  h1s, descriptions, the other canonicals, JSON-LD, robots, Markdown twins,
  text endpoints, redirects and 404s of every page are unchanged. `og:url`
  on `/design` still names the homepage (the backlog item names only the
  canonical; one tag changed, not the whole share block).
- **Visible text.** The parity crawl (`lib/parity/parity.mjs`,
  `extractPage`) compares head tags, JSON-LD, the languages, the title and
  the first h1, not body text, so it cannot show a lost heading or label.
  The lane therefore served the base build (`09ee95b`, on 4308) and this
  build (on 3108) side by side and dumped, for every page it changes, the
  `innerText` of `<main>` at 1440 px and its heading outline (level and
  text, in order): `/skills` and `/skills?show=user`, all 20 skill pages,
  `/resume` in both views, `/press` and `/press?type=product`, `/blog` and
  all 16 posts it links, the 404 at an unknown URL, `/skills/not-a-skill`
  and `/blog/not-a-post`, the error state (an in-app visit to `/resume`
  whose server call fails), and `/design`: 48 page states. Words were
  compared as multisets (case folded, since CSS uppercases the mono labels;
  arrows split off) and as ordered streams; a second dump of `textContent`
  checked what `innerText` skips (inactive tab panels, folded SKILL.md
  lines, screen-reader text) on the 24 pages that have such parts.
  - **31 page states are word for word the same, with the same heading
    outline**: every skill page, both 404s of the routes and the unknown
    URL, the error state, the résumé in both views, press in both filters,
    and the blog index. The `textContent` check is the same on all 24 pages.
  - **Moved, not changed:** on `/skills` (both filters) the release pill,
    "Superstacks v6.1.1 · Oct 2026", now follows the hero's buttons (View on
    GitHub, Share) instead of sitting beside the h1; same words.
  - **Added, decorative:** each of the 16 posts' back link now reads
    "← Back to Blog" with the arrow as an `aria-hidden` text glyph (the
    shared back link the case pages use), where the base drew an SVG arrow
    before "Back to Blog". The link's name is unchanged.
  - **Replaced on purpose:** `/design` (plan 7g). The base page's eyebrow
    "Internal", lead "The bento canvas as built: tokens, type, buttons,
    chips, cards and motion. Switch the theme to review night." and its
    sections (Colour, Type, Radii, Buttons, Chips, Filters, Card with "An
    in-card title", Pixel art, Motion) gave way to the content of the
    deleted `/preview/system`. Every visible line of that page (156 checked
    from its source at `ea9c1d0^`) is on `/design` except its two header
    lines: the eyebrow "Phase 0 · tokens and primitives" (now "Tokens and
    primitives") and the h1 "Design system preview" (now "Design system",
    the parity reference's h1).
  - **Restored:** a first pass had turned each press card's source label
    ("Feature", "Product", "Profile") from an `h2` into a paragraph. It is
    an `h2` again, as on the base page, and `PressPage.test.tsx` now asserts
    the headings.
- **Prerender:** the sorted `dist/client/**/*.html` lists of the base and
  this build are identical, 46 files.
- **Link names.** Links this lane restyled keep their arrows on screen but in
  `aria-hidden` spans (spec 12 item 18): "Case studies", "Case study" and
  "gogocash.co" (résumé), "View on gogocash.co" (press), "Ventures" (blog),
  "Back to Blog" (post). Visible text is unchanged; the tests that pinned
  the arrows read the new names (section 4).

## 3. Gates

On the final tree (`c13a5f9`, the lane's last code commit), the production
build of it:

| # | Gate | Command | Result |
| --- | --- | --- | --- |
| 1 | Types | `pnpm typecheck` | pass |
| 1 | Lint | `pnpm lint` (`--max-warnings=0`) | pass, no issues |
| 1 | Format | `pnpm exec prettier --write` on touched files, then `pnpm format:check` | pass |
| 1 | Dead code | `pnpm knip` | pass (after deleting `MonoEyebrow` and `BentoRow`) |
| 1 | Unit | `pnpm test` | 162 files, 1,500 tests pass |
| 1 | Build | `pnpm build` | pass (the Sanity schema deploy skips without `SANITY_AUTH_TOKEN`) |
| 1 | Budgets | `pnpm perf:budget` | pass: entry 108.8 / 120 KB, worst route 194.8 / 200 KB (`/skills/code-review`, was 196.9), stylesheets **36.4 / 37 KB** (was 34.2), fonts 51.2 / 56 KB |
| 1, 4, 5, 7 | Browser gate | `PORT=3108 PLAYWRIGHT_WEB_SERVER="pnpm start" pnpm exec playwright test smoke.spec.ts a11y.spec.ts tests/e2e/profile --project=desktop --project=mobile --project=fold-closed --project=fold-open --project=tablet-landscape --project=webkit-phone --grep-invert "matches its baseline" --workers=2` | On the final build (`c13a5f9`), 2,070 tests: **927 passed, 1,141 skipped by project scope, 2 failed**, both 30 s timeouts inside axe's `analyze()` on the dark-theme scans of the two Thai topic hubs (group D1's pages, unchanged here; their light scans passed) while the machine ran at a load average of about 19 (27.1 min). Run alone with `--repeat-each=3`: 6 of 6 passed. Earlier full runs, for the record: on the first build 927 passed and 1 failed (the notebook layout check, fixed by deviation 8); on the build after that fix 922 passed and 6 failed, all 30 s load timeouts (five Home checks this lane does not touch and the notebook drag), which passed alone, 6 of 6, then 21 of 21 with `--repeat-each=3` |
| 3 | Parity | `GATES_PORT=4308 node scripts/start-gates.mjs --parity-only` | Before the fixture update: 137 URLs compared, 1 with differences (`/design`'s canonical, intended). After it: **137 URLs compared, 0 with differences**; the crawl reached 138 URLs (66 HTML pages), as in Phase 6 |
| 6 | Print | `RESUME_URL=http://127.0.0.1:3108/resume OUTPUT=<scratch>/resume.pdf pnpm pdf`, text read back with pypdf | 2 pages; text layer **identical** to the committed `public/resume.pdf` (5,902 characters, from "Kunanon Jarat" to the last training line). `public/resume.pdf` not rewritten. Printed from the build of `de535f1`; nothing it prints changed after |
| | Prerender | sorted HTML lists, base against this build | identical, 46 files |
| | Visible text | section 2, on the first and the final build | same words on every page but one arrow glyph |

The lane's own spec alone (`tests/e2e/profile-pages-catalog.spec.ts
--project=desktop`), on the final build: 39 passed in 19.7 s.

## 4. Tests: changed and new (umbrella input R17)

| Test | Change | Why |
| --- | --- | --- |
| `lib/design/scope.test.ts` | Rewritten in part | The group's seven route ids are scoped; the 404 and error state are scoped whichever route failed (was: left on the old status page); the D1 pages stay out until their lane |
| `lib/design/pagesCatalog.test.ts` (new) | Guard | This group's components and routes keep the frozen `font-sans`, `font-mono` and `font-display` utilities out (they would set Geist inside the scope; the same guard covers `components/ds` and `components/profile`), hold no raw hex and no longer use `PageMain` |
| `components/landing/StatusPage.test.tsx` | Two checks rewritten, two added | The hero is the new one (`t-display`, `pf-page-hero`), the status tile carries the decorative pixel drawing, the page is `main#main.pf-main`; "Try again" is the dark pill (was the `bg-cta` class); the drawings' rows are even and the two differ. The chrome, recovery-link and report checks are unchanged |
| `components/landing/skills/skills.test.tsx` | Unchanged | Every check holds on the new markup (names, anchors, counts, the fold) |
| `components/resume/ResumePage.test.tsx` | Five checks adapted | The h1 class `t-display` (was `kj-lines`), still three lines; link names without arrows ("Case studies", "Case study", "gogocash.co"); the live markers by their class (`li > .pf-resume__live`, was `.bg-ember`); the cards' kinds by `data-kind` (was the bento's Tailwind span classes; the browser spec measures the placement); print hides both screen parts (the hero and the body) |
| `components/landing/PressPage.test.tsx` | Three checks adapted, one added | The hero class; the canvas spans as `data-span` (was Tailwind span classes); "View on gogocash.co" without the arrow in its name; new: the headings, each card's type as an `h2` ("Feature", "Product", "Product", "Profile") and its title as an `h3`, the outline the base page had (section 2, "Restored") |
| `components/landing/blog/blog.test.tsx` | Two checks adapted | The hero class; "Back to Blog" read inside the hero (the "Keep reading" tile now has a link of the same name) |
| `components/system/DesignSystemPage.test.tsx` (new) | | The h1, the six sections, swatches that paint tokens, the sample notebook with its three notes, the page's own theme switch and no site nav |
| `tests/e2e/routes.ts` | `PROFILE_ROUTE_NAMES` gains seven names | `skills`, `skill-detail`, `resume`, `not-found`, `design`, `blog`, `press`: axe runs WCAG 2.2 on them in both themes, and `profile.spec.ts` checks their fit on every project |
| `tests/e2e/profile-shell.spec.ts` | Two pairs flipped | `/skills` and `/design` now preload Onest and Instrument Serif and carry the scope |
| `tests/e2e/profile-journey.spec.ts` | Notebook checks re-enabled | `SYSTEM` is `/design`; the three `test.skip(true, …)` and their reason are gone: keyboard, autoplay, the turn, reduced motion, the drag, the layout across the matrix, the spanned hinge, and the baseline (which the orchestrator renders) |
| `tests/e2e/profile-pages-catalog.spec.ts` (new) | | Desktop Chromium: every group page at 344, 390, 820, 882, 1180 and 1440 px (no sideways scroll, 12 px text, 24 px targets, in the scope); one page per family (`/skills/verify-loop`, `/resume`, the 404, `/design`, `/press`) through forced colours (this group's ringed parts included), text spacing, zoom, more contrast and request origins (not on `/press`, section 8); the résumé's grid and print; the 404's scope and picture; `/design`'s canonical, robots and theme switch; the hidden pages' robots; the error state (an in-app visit to `/resume` whose server call is made to fail: the new status page as an alert, in the scope, with its picture and four recovery links, and Try again recovers); the pipeline's links; and the install tabs by keyboard, reached by pressing Tab from the top of the page (no script focus on a control), then moved with the arrow keys. Each best-practice check first fails a fixture. The check functions are copied from `profile.spec.ts` rather than imported (a spec importing a spec registers its tests twice); Phase 8 can move them to one helper |

## 5. Owner inputs used

| Input | Default used | Where |
| --- | --- | --- |
| R10 screenshots | Code-drawn pictures are our own and decorative | the status pages' pixel drawings |
| R11 testimonials | Hidden on Home; the samples show only on `/design`, labelled as samples | `/design` |
| R17 pinned tests | Rewritten to the same intent; section 4 lists every one, for the owner's approval | tests |
| Share (spec 13 item 27) | The Phase 7 pages keep their Share pills and the 56 px rule | skills, a skill, the résumé, a post |

## 6. Draft copy

No new copy on a public page: every page renders its content modules' and
live pages' strings. Two labels on the noindex `/design` page are new or
changed: the eyebrow "Tokens and primitives" (on `/preview/system` it read
"Phase 0 · tokens and primitives") and the h1, kept as "Design system" (the
parity reference) instead of the preview's "Design system preview". The
preview's sample lines and the notebook's samples come back unchanged.

## 7. Visual baselines (for the orchestrator)

- Deleted: `tests/e2e/visual.spec.ts-snapshots/design-{light,dark}-{desktop,mobile}-linux.png`
  (4 files). The other pages of this group (skills, a skill, the 404, press)
  lost theirs at Phase 6 and still have none; `/resume` and `/blog` are
  CMS-driven and have no visual baseline by design.
- New baseline the re-enabled check needs: `profile-journey.spec.ts`'s
  `preview-notebook-{light,dark}.png` on the matrix projects (never
  committed).
- Screenshots of every page at 1440 px light and 390 px dark were reviewed
  by eye in the lane (not committed): the hero, tiles and type match the
  core pages; nothing overlaps at 390.

## 8. Deviations, with reasons

1. **The status page joins the scope by state, not by route.** A 404 or an
   error can happen on any route, including D1's pages before their lane
   lands; the new status page needs the new tokens wherever it shows, and
   the old body offset must not apply under it. The scope rule now counts
   the failed match itself (`showsStatusPage` in `scope.ts`), reading the
   router's typed `_notFound` mark for an unknown URL.
2. **`/design` keeps no site chrome.** The smoke tests treat it as the one
   page without the nav, so its theme switch sits in a bar of its own (the
   phone menu's radio switch, which works at every width; the nav's toggle
   is hidden under 810 px).
3. **A skill's h1 is set in JetBrains Mono at display size**, not the
   serif: skill names are identifiers ("verify-loop"), as the bento page set
   them in mono; it keeps the hero's other parts.
4. **The skills release pill moved** after the hero's buttons (section 2).
   The hero's anatomy puts its pills under the lead; the words are the
   same.
5. **Arrows leave the link names** of the links this lane restyled (section
   2). Visible text is unchanged, but for the posts' back link, which now
   shows "←" as a text glyph where it drew an SVG arrow.
6. **The blog post body is not restyled.** `components/PortableText.tsx` is
   shared and its tests pin its classes; inside the scope its code spans
   keep the frozen Geist Mono. The light restyle (7h) covers the page around
   it.
7. **Shared bento parts stay as they are:** `SharePill` and `ShareRows`
   (the topic hubs use them too), `CompanyLogo`'s tiles on the résumé.
8. **The notebook is not the last section of `/design`.** The first full
   browser run failed one re-enabled check ("its arrows sit beside the book
   from 1180 px…"): it scrolls the notebook to 100 px from the top at each
   matrix size, and `/preview/system` had the site footer under it, while
   `/design` has none, so at 820 x 1180 and 882 x 1104 the page ended 111
   and 35 px too soon. The notebook now comes before "States and
   preferences", which leaves 300 px or more to spare at every size; the
   check's own logic is unchanged.
9. **Old CSS left in place.** `globals.css` is not this lane's to edit, so
   the bento rules these pages no longer use (`bento-row`, the card lift,
   `kj-lines`) stay until Phase 8.

## 9. Open items

1. **Stylesheet budget (orchestrator, at the merge):** this lane alone
   takes the worst page from 34.2 to 36.4 KB of the 37 KB budget
   (`profile.css` +2.9 KB gzip; `globals.css` −0.8 KB as Tailwind drops the
   bento utilities these pages stopped using). Group D1's partial will very
   likely push the combined tree over 37 KB. The budget is not raised here
   because this branch passes; raising it at the merge with the Phase 6
   reason (the old design stays in `globals.css` until Phase 8) is the
   recommendation.
2. **Visual baselines (orchestrator):** section 7.
3. **The press and blog banners load from `images.unsplash.com`** (their
   content modules' URLs, unchanged; the pages are hidden). It is the only
   third-party request on this group's pages; the request check skips
   `/press` for it. Self-hosting the banners or dropping them is for the
   owner, before the blog is ever made public.
4. **`profile-shell.spec.ts` no longer checks a page outside the scope**
   (its two "keeps Geist" pages moved in). Once D1 lands, every page is in
   the scope and Phase 8 folds it into `:root`.
5. **Plan gate 7's manual checks (owner):** keyboard and screen readers
   through `/resume` (a topic hub is D1's), on the preview URL.
6. **The folded-flat posture** (spec 10.1, `vertical-viewport-segments: 2`)
   concerns the Home hero and the notebook; this group decides nothing for
   it (no page here has content that a horizontal hinge would split
   differently from a scroll). Left to the orchestrator's merge of both
   groups.
7. **`/design`'s `og:url` still names the homepage** (section 2); one more
   tag if wanted.
8. **Phase 8:** the duplicated best-practice check functions (section 4),
   the bento CSS these pages left behind, `sampleNotes.ts`'s folder.
9. **Firefox** is not installed here and was not run.

## 10. Brought onto `main` (19-11-26, the orchestrator)

### Rebase

The lane's five commits were replayed onto group D1's tip with
`git rebase --onto <D1 tip> 09ee95b` (a plain rebase would have replayed the
local phase commits under `09ee95b` too), then onto `main` once D1 merged as
#126. Five files conflicted, all in the first commit:

| File | Resolution |
| --- | --- |
| `components/NotFound.tsx` | Comment only: this lane's. |
| `lib/design/scope.ts` | Both route lists. The function body had merged to this lane's (`showsStatusPage`: a 404 or an error is in the scope); D1 still had the old rule. The header now says what is true after both groups: every page is in the scope; only Sanity Studio and the files the site serves are not. |
| `lib/design/scope.test.ts` | Both groups' checks. D1's "ends in the old 404" assertion and this lane's "not restyled yet" list are gone; a new check keeps Sanity Studio, a bare layout and an empty match list unscoped. |
| `tests/e2e/profile-journey.spec.ts` | Comment only: this lane's. The test bodies merged to `main`'s newer ones (`page.clock.pauseAt`, the transition-duration check) with this lane's `/design` path and un-skips. |
| `tests/e2e/routes.ts` | Both lists. |

`lib/content/testimonials.test.ts` lost its notebook tripwire: it failed if
three quotes were cleared while the notebook's browser checks were parked,
and none is parked now.

### Independent review (seven findings) and what was done

1. **The scope rules of D1 and D2 contradicted each other** at the merge:
   resolved as above.
2. **`main` still held 16 old-look baselines** of skills, a skill, the 404
   and press (rendered at the cutover), and the notebook's 6 were rendered on
   the deleted `/preview/system`: all 22 removed so CI renders them
   (`8761c84`).
3. **A copy of the shared filter bar** (`.pf-cat-filter`, `.pf-cat-option`,
   `.pf-press__bar`): the skills filter, `ToggleGroup` (résumé, press, blog)
   and the install tabs now use `.pf-filter*`; the shared option's pressed
   state also answers `aria-selected`, for tabs (`1ded28e`). Counts follow
   their label after a space, so the skills filter's names read "All 16",
   not "All16".
4. **The device matrix could not see a part in the gutter:** ported from the
   hubs' spec, with the two-frame wait after each resize (`46983eb`). Its
   first run, and a probe of every part on the two pages it flagged, found
   three parts that leave the column on purpose, now exempt:
   the notebook, which bleeds to the left edge on phones (design spec 8.7);
   the logo marquee's track, which runs past its clipped frame; and the skill
   credits' links, whose -6 px margin widens their hit area while their text
   stays on the edge.
5. **The notebook checks' bodies:** `main`'s kept (above).
6. **`CatalogHero` copies Phase 6's `PageHero`:** carried to Phase 8 (8a).
7. **The blog search box's edge** used `--line-strong` (about 1.4:1): now
   `--ink-45`, 3.05:1, as design spec 2.2 keeps for inputs on paper
   (`5b0c7bd`).

Also found on the combined tree:

- **knip:** the old bento `PageHero`, `PageMain` and `MONO_LABEL` lost their
  last users once both groups landed; removed with the two guard checks
  whose subject they were (`28bca27`).
- **The `/skills` release pill** is about 300 of 304 px on a 344 px phone, so
  slightly wider text (CI's Linux fonts, a reader's larger text) would push
  it into the gutter. It may now wrap inside the pill; a pill that fits keeps
  its single 44 px line.

### Gates on the combined tree (D1 plus this group)

| Gate | Result |
| --- | --- |
| Types, lint, format, knip | pass (knip after `28bca27`) |
| Unit | 165 files, 1,532 tests pass |
| Build | pass |
| Budgets | entry 108.7 / 120 KB; worst route 195.1 / 200 KB (`/skills/code-review`); preloaded fonts 47.7 / 56 KB; stylesheets **36.96 / 37 KB** (37,843 bytes gzip, about 45 bytes to spare) |
| Browser gate | Six projects, `--workers=2`, on the build of `28bca27`: 2,548 tests, 1,136 passed, 1,410 skipped by project scope, 2 failed: the gutter check's first run on `/skills` and `/design`, the intended parts named above, now exempt. On the build of `3f79a39` (the release pill and the exemptions): this group's spec 39 passed (desktop); the `/skills` fit and axe checks 24 passed (desktop, mobile, fold-closed, WebKit phone) |
| Stress check | `/skills` at 344 px with the release pill's text widened by 0.08 em of letter spacing: nothing in the gutter |
| Parity | 137 URLs compared, 0 with differences |

### Open items, updated

- **Item 1, the stylesheet budget:** under it, by about 45 bytes. The old
  design's CSS is now dead weight in `globals.css`; Phase 8a deletes it before
  anything else grows, then lowers the budget to the new measurement.
- **Item 4:** with D1 merged, every page is in the scope, so
  `profile-shell.spec.ts`'s Geist branch and `GEIST_FONTS` in
  `src/routes/__root.tsx` are unreachable: Phase 8a.
- **Item 8, Phase 8 adds:** `CatalogHero` folds into Phase 6's `PageHero`;
  `.pf-cat-count` (this group) and `.pf-read-count` (D1) are the same rule
  and become one; the device-matrix helpers (`layoutProblems`, the gutter
  check and its named exemptions) are copied in two specs and move to one
  helper module.

## 11. Merged, deployed and checked live (19-11-26)

- **CI on PR #127.** The first run wrote the 26 baselines (the 20 pages and
  the notebook's 6) and found one real failure: `/design` at 820 px in Linux
  Chromium, where the pixel word mark beside "Forward" sits 0.2 em left of its
  word by design and crossed the column. The gutter checks now let decoration
  overhang: a part with no text whose every element is hidden from assistive
  tech (`3d69e8d`; the hire panel, which has text, is still caught). The 26
  renders were reviewed on contact sheets and committed (`92aa8a7`); the next
  run passed every GitHub check.
- **Merge.** Workers Builds still failed at its start (0 s), so PR #127 was
  admin-merged as `cb1dd6c` and deployed by hand from a clean checkout of
  `main`.
- **Production:** version `a9b74b54-aab0-481f-8241-5a203e05b346`. Rollback
  target: `3a539856-6bb6-4afb-bb7c-cfff2122df73` (group D1).
- **Live checks** on https://kunanonj.com: `/skills`, a skill, `/resume`,
  `/design`, `/press` and `/blog` answer 200 and an unknown URL 404, with the
  new design and the shared filter bar in the served HTML; smoke "recruiter
  path" 62 passed; the catalog and hub device matrices, gutter checks
  included, 21 passed against production.

