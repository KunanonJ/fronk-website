# Recruiter fit: open items (11-11-26)

Issues the two pre-merge reviews of pull request #109 confirmed and the
program did not fix. All but the first are older than the program. Owner
questions are in the umbrella plan (O5 to O7 and O10 to O13), not here.

Entry format, as in the general backlog: Priority, Problem, Root cause, Why
deferred, Fix options.

---

## P2: The résumé has no visual baseline

- **Problem:** `/resume` is the page a recruiter lands on, and no image test
  covers it. Both phases changed it.
- **Root cause:** `tests/e2e/visual.spec.ts` skips CMS-driven routes. Studio
  can hold a `resumeProfile` document (`pnpm seed` creates one) that would
  replace the repo's data, and every render reads Sanity.
- **Why deferred:** a baseline would fail on unrelated pull requests after
  the first Studio edit, or when Sanity is unreachable in CI.
- **Fix options:**
  1. Render the résumé from the repo's data in the visual job only (unset the
     Sanity variables for that step, if nothing else on the page needs them).
  2. Give the résumé a second, repo-only route for tests.
  3. Accept the gap; the unit tests, the browser tests and the PDF read-back
     cover the content, not the layout.

## P3: The résumé PDF and its generator

- **Problem:**
  - The PDF has no tags, bookmarks or document language, so a screen reader
    gets untagged text.
  - `scripts/generate-resume-pdf.mjs` accepts a page with no content, and
    checks links only inside the contact block. A relative link on an entry
    could be written as a localhost URL.
  - No CI job checks `public/resume.pdf`; the read-back is manual.
- **Root cause:** the generator's guards were written for the faults found in
  Phase 1 (page count, missing contact links).
- **Why deferred:** nothing is wrong in today's file: 2 pages, 6 absolute
  links, a text layer that reads in order.
- **Fix options:** tagged PDF output and a language in the print call; a
  minimum word count; an absolute-URL check on every link; a unit test that
  reads the committed PDF.

## P3: Résumé data from Sanity can break the page

- **Problem:** a section with a missing title throws in `sectionSlug`
  (`lib/resume/view.ts`); two sections with the same title collide as React
  keys and DOM ids; a résumé whose sections all lack items shows no
  experience and skips the fallback (`lib/content/resumeProfile.ts`).
- **Root cause:** the mapping trusts the document's shape.
- **Why deferred:** Sanity holds no résumé document, so none of this can
  happen today.
- **Fix options:** validate the document with Valibot and fall back per
  section; add an index to keys and ids.

## P3: Structured data and share images

- **Problem:**
  - The Person JSON-LD types its job titles and employer by hand
    (`lib/seo/jsonLd.ts`) instead of reading `CURRENT_ROLE`.
  - The Thai FDE hub's share image is the site card, not the hub's.
  - `/design` (noindex) has the homepage as its canonical.
  - Pages that use `routeShareMeta` do not state the share image's type.
- **Why deferred:** none changes what a visitor or a recruiter sees.
- **Fix options:** read the role from `lib/content/currentRole.ts`; add
  `type: "image/png"` to the default share image and re-crawl the parity
  reference; give the Thai hubs the hub card.

## P3: Accessibility leftovers

- **Problem:**
  - The footer's English labels have no `lang` on Thai pages, as the header's
    had.
  - Link arrows ("Résumé →") are read aloud as part of link names, site-wide.
  - Links that open a new tab say so only in the recruiter block.
  - The availability pill's middle dots may be read aloud.
  - On `/contact?topic=hiring` the message label changes after hydration and
    can move the box below it by a line on narrow screens.
  - On Contact at 641 to 1023 px the tab order does not follow the visual
    order (Email, Elsewhere, then the form).
- **Why deferred:** each is small, and most are site-wide patterns that
  should change in one pass.
- **Fix options:** one pass over `CardLink` and the external links (hide the
  arrow from assistive tech, add the new-tab cue); `lang="en"` on the footer.

## P3: Small layout and hygiene items

- **Problem:**
  - "AI engineering" wraps to two lines in the button grid of About's
    "Let's talk" card.
  - The "How I work" card on Home has about 110 px of empty space above its
    first line at desktop width, and the Thai FDE hub's first card about
    170 px.
  - `expectsHeadingPattern` in `tests/e2e/routes.ts` is read by nothing.
  - `scripts/seed-content.mjs` seeds an older headline into two documents
    that no app code reads.
  - "Resume" is unaccented in the page title, two About labels and the text
    endpoints; the menu, the header and the page say "Résumé".
- **Why deferred:** polish, outside the phases' scope.
- **Fix options:** each is a one-file change; the title change needs a parity
  re-crawl.
