# Reading aids (plan, 20-11-26)

Owner request (20-11-26): "do the reading aids next", item 4 of
`../references/premium-interactions_RESEARCH_19-11-26.md`: a reading-progress
hairline on case studies and posts, the case contents extended to posts, and
reading time at build. SIMPLE plan.

## What the site holds today

- **Posts are not public:** the blog has been hidden since 09-11-26
  (`BLOG_PUBLIC` is false) and every post answers 404. The fallback posts are
  plain paragraphs, with no headings to list. So the post contents and the
  post progress line have no page to go on; they return with the blog.
- **The long public reads** (measured live at 1440 x 900): the case studies
  (5,400 to 7,500 px; contents rail and scroll spy already), /about
  (9,100 px, 1,150 words) and the topic hubs, English and Thai (3,700 to
  4,600 px).
- **Case words** (lib/content/readingTime.ts, counted from the content): 136
  to 512, so 1 to 3 minutes at 230 words a minute.
- **The top edge** already holds NavProgress's 2 px line, shown only while a
  navigation loads (now rare: only the hidden blog renders on request).

## Steps

1. **The reading line:** `ProfileMain reading` draws a hidden
   `.pf-reading` first in <main> and names a view timeline on <main>
   (shell.css). The line scales from 0 to 1 over `contain` (the main
   content's top at the screen's top to its end at the screen's bottom), so
   the footer does not count; `view-timeline-inset: 0`, since the default
   takes the page's 96 px scroll padding. CSS only, on screens, with motion
   allowed, where `animation-timeline: view()` exists. Under the loading
   line (z 89 against 90); Highlight in forced colours.
2. **Where:** the case studies (portfolio and ventures), the topic hubs (both
   languages), /about.
3. **Reading time:** `caseWords` counts what a reader reads on a case (the
   tagline, the lead, the evidence, the chapters, labels included; not
   addresses or picture data); `readingMinutes` rounds up, at least 1. The
   case eyebrow ends "· 2 min read". English pages only: Thai runs words
   together, so the hubs keep no reading time.
4. **Tests:** unit (counting, rounding, every case, the eyebrow, the line's
   markup); a Chromium smoke test that the line is 0 at the top, half at
   half and full at the end on four pages, absent elsewhere, hidden under
   reduced motion.
5. **Baselines:** the eyebrow's new words change the case pages' screenshots;
   re-render them in CI's image and check that only the eyebrow differs.
6. **Gates:** typecheck, lint, format, knip, unit, budgets, smoke, a11y and
   profile e2e against the build.

## Out of scope

- Post contents and reading time: with the blog.
- Contents for /about or the hubs: short sections, and the layouts are
  designed without a rail.
