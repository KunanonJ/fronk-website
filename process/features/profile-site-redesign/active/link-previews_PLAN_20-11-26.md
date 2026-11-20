# Link previews (plan, 20-11-26)

Owner (20-11-26): "ok implement all of that", item 6 of
`../references/premium-interactions_RESEARCH_19-11-26.md`: "Hover or focus a
case, notebook or post link to see a small card (popover + anchor positioning,
`interestfor` in Chromium, a 1 KB fallback elsewhere); Esc dismisses, touch
just navigates, an off switch. WCAG 1.4.13." The second PR after
`now-and-search_PLAN_20-11-26.md`, whose `/search.json` it reads. SIMPLE plan.

## What the site holds

- **Posts and the notebook are hidden** (the blog since 09-11-26, the
  notebook on Home): only case links can preview.
- **Case links in running text** (surveyed on the build): /about's "Seen
  in" prose links (6), /proof's and /examples' "Read the … case" text links,
  the topic hubs' link lists. The cards, tiles and the Home mock that open a
  case show it already: no preview there.

## Steps

1. **One delegated listener (`LinkPreviews`, in LandingLayout):** links
   matching `PREVIEW_LINKS` (`.ds-prose-link`, `.ds-text-link`,
   `.pf-hub-links__link` to `/portfolio/` or `/ventures/`, not this page).
   Under a fine pointer after 400 ms; on keyboard focus (`:focus-visible`)
   after 120 ms; touch never. The card's chunk, its stylesheet and the index
   load while the delay runs.
2. **WCAG 1.4.13:** dismissible (Esc, also Enter and any press), hoverable
   (160 ms to cross from the link to the card), persistent (until pointer
   or focus leaves). A turn counter stops a late lookup reopening it.
3. **The card (`PreviewCard`, lazy):** a manual popover (top layer, no
   z-index), `role="tooltip"`, the link `aria-describedby` it while shown;
   the case's eyebrow, name (serif) and tagline from `/search.json`. Placed
   under the link or above it, inside the screen, and kept on its link as the
   page scrolls (keyboard focus scrolls smoothly to its link); hidden while
   the link is off screen. Its stylesheet (`src/styles/preview.css`) loads
   with it, so first-load CSS does not change.
4. **Not built:** anchor positioning and `interestfor` (a few lines of
   placement script work in every engine, and Chromium's interest invokers
   would cover only part of the behaviour); the off switch (WCAG 1.4.13 asks
   for dismissible, hoverable and persistent, which hold).
5. **Tests:** unit (which links preview); smoke (pointer pause, hover onto
   the card, Esc, `aria-describedby`, the lazy stylesheet, keyboard focus,
   no preview on cards). No baseline changes: nothing shows at rest.
