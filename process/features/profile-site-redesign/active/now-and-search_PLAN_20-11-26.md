# The "Now" line and ⌘K search (plan, 20-11-26)

Owner (20-11-26): "ok implement all of that": the "Now" line (reusing /about's
words), link previews and ⌘K search, items 7, 6 and 8 of
`../references/premium-interactions_RESEARCH_19-11-26.md`, then archiving the
finished plans. This plan is the first PR: the Now line and search, both of
which change every page's chrome, so one baseline refresh covers them. Link
previews follow in their own PR. SIMPLE plan.

## Decisions (the owner left them open)

- **The Now line goes in the footer**, the one place on every page that
  already says who and where: the name block gains "Now: leading AI
  engineering at The Binary Holdings" (the words that open /about's "What
  I'm doing now.", a test keeps them together) and the place line gains the
  time in Bangkok. No month stamp: nothing records when the words were last
  true, so the line does not claim a date.
- **The CSS budget is not raised.** The first-load sheet is 35.2 / 36 KB;
  the dialog's stylesheet loads with its code on first open (React 19
  `<link rel="stylesheet" precedence>`), so it never counts. The button
  shares the theme toggle's rules.
- **No single-key shortcut ("/"):** WCAG 2.1.4 would need an off switch.
  ⌘K or Ctrl+K only.

## Steps

1. **The index (`/search.json`):** `src/server/text/searchIndex.ts` builds
   every public page from lib/content in the pages' own words (titles,
   descriptions, taglines, case eyebrows): 11 pages, 7 cases, 8 topic hubs
   (Thai marked `lang="th"`), 20 skills; 11.9 KB. Hidden pages stay out.
   Deploy-cached like /skills.json.
2. **Matching (`lib/search/match.ts`):** every query word must appear;
   titles weigh most; Latin accents fold ("resume" finds "Résumé"), Thai
   keeps its marks; results in fixed groups (pages, case studies, topics,
   agent skills). An empty query lists the pages and the cases.
3. **The trigger:** a 48 px round button beside the theme toggle from
   810 px (`aria-keyshortcuts`, title names ⌘K), ⌘K or Ctrl+K anywhere, and
   "Search" in the phone menu, which closes the menu first. The dialog is
   `lazy()` and preloads on the button's hover or focus.
4. **The dialog:** native modal `<dialog>` (focus held, Esc and backdrop
   close, focus returns); an ARIA combobox with `aria-activedescendant`,
   grouped listbox, Enter opens through the router, a polite result count.
   The dialog itself scrolls with the field and the hints sticky, so the
   scrolling region holds the focusable field (axe
   scrollable-region-focusable). Touch shows "Close" instead of "esc" and
   no key hints.
5. **The clock (`LocalTime`):** client only (`useSyncExternalStore`, server
   snapshot null), so no time is cached in HTML and hydration never
   mismatches; it moves on at each minute. Not a live region.
6. **Screenshots:** full pages hide `[data-clock]`
   (`tests/e2e/screenshot-no-clock.css`). Every page's footer, and the nav
   from 810 px, change: refresh the baselines from CI's image at zero
   tolerance, then revert the tolerance.
7. **Tests:** unit (matching, the index, the Now line against /about, the
   clock); smoke (⌘K, typing, arrows, Enter, Esc and focus return, the
   lazy stylesheet, axe on the open dialog, the phone menu, the footer).
