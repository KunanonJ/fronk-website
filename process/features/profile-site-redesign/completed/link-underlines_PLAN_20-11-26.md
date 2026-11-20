# Link underlines: research item 5, as it fits (plan, 20-11-26)

Owner: "ok continue" after the reading aids, so the next item of
`../references/premium-interactions_RESEARCH_19-11-26.md`: "Serif micro-type.
Links in serif swap one word to italic on hover and focus; underlines draw in
with `text-decoration-thickness`." SIMPLE plan.

## What the site holds

- **No links in serif except the brand:** the serif (Instrument Serif) sets
  headings, figures and the brand names; running links are in Onest. The
  only serif links are the nav's name and the footer's (not a link).
- **The italic swap shifts the bar:** measured at 1440 px, the nav name is
  94.4 px in Regular and 103.8 px in Italic (390 px: 62.3 against 67.6),
  so an italic hover would push the nav's links about 9 px. Dropped.
- **Underlines today:** a prose link (`.ds-prose-link`, 17 uses: case
  bylines, /about, the contact page, the skills pages) is underlined in the
  accent at 40 % and does nothing on hover; a footer link snaps an
  underline on.

## Steps

1. **Prose links:** under a fine pointer's hover and under keyboard focus,
   the underline turns the full accent at 2 px; the colour and thickness
   ease over 0.2 s with motion allowed (globals.css).
2. **Footer links:** the underline is always there, unpainted, and its
   colour fades in on hover and keyboard focus with the text colour
   (shell.css). Forced colours paint it at rest, which is fine there.
3. **At rest nothing changes:** the footer card and a prose link at rest
   are pixel-identical before and after (checked), so no baseline moves.
4. **Tests:** a smoke test of both states, pointer and keyboard.
5. **Gates:** typecheck, lint, format, knip, unit (the CSS guards),
   budgets, smoke, a11y and profile e2e against the build.

## Closeout (20-11-26)

- **Shipped:** PR #147, squash 25baca7 (20-11-26).
- **Verified:** Live 6/6: prose link 2 px accent on hover and keyboard focus, footer underline painted on hover, unchanged at rest.
- **Deviations and notes:** The italic swap was dropped, as the plan records (the nav name is 9 px wider in Italic).
- **Status:** complete; archived to `completed/`.
