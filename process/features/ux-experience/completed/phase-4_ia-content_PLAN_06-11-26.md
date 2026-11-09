# Phase 4: Information architecture and content

**Status:** SUPERSEDED 09-11-26 by visual-redesign (see its umbrella mapping table: `process/features/visual-redesign/completed/visual-redesign_UMBRELLA_PLAN_09-11-26.md`). Not executed; its findings are folded into the redesign phases.
**Created:** 06-11-26
**Umbrella:** `ux-experience_UMBRELLA_PLAN_06-11-26.md`
**Covers audit findings:** 13-18
**Depends on:** Phase 3 (shared type and spacing)
**Note (09-11-26):** the owner hid the blog (`BLOG_PUBLIC = false`). While it's hidden, skip finding 15 (blog tag filter) and the home "latest writing" strip; the home portfolio strip still applies.

## Objective

Home leads visitors to the work and the writing. About opens with who Kunanon is. The blog shows posts first on a phone. The copy agrees with itself.

## Known work (verify at entry)

1. **Home "Selected work" strip:** the 4 projects from `lib/content/portfolio.ts`, compact cards linking to `/portfolio/[slug]` and an "All work" link.
2. **Home "Latest writing" strip:** the 3 newest posts (Sanity with static fallbacks, same source as `/blog`), title, date, and a link to `/blog`.
3. **Home "Skills" teaser:** a link into the new Skills section, if the `skills-hub` feature has shipped by then.
4. **About order:** profile first, newsletter signup moved to the end (before "Let's talk"). Add a sticky or inline jump list (Profile, How I work, Now, Stack, Path, FAQ) for the 9-screen phone length.
5. **Blog filter on phones:** the 20 tag chips become one horizontally scrollable row (with edge fade), or a "Filter by topic" disclosure. Search stays visible. The first post must sit above the fold at 390x844.
6. **Copy consistency:** the hero says "Founder of GoGoCash and Manut" while the site says three ventures with Airplusauto. The owner picks the wording; update `lib/content/landing.ts` and anything quoting it (FAQ, JSON-LD descriptions). Decide whether Airplusauto gets a `/ventures/airplusauto` page or stays an external link (sea-discovery owns venture hubs, so coordinate).
7. **Ventures photo card on phones:** collapse it to a short banner, or move it after the venture cards, below `sm`.
8. **"3 ventures" glyph clip:** widen the reveal mask or add inline padding so the leading "3" isn't cut.

## Gates

At 390x844: home shows links to portfolio and blog; About's first screen has no form; the first blog post is visible without scrolling. All standard gates pass, and sea-discovery routes stay indexed and unchanged in the sitemap.

## Out of scope

New posts or case studies, and portfolio screenshots (owner-supplied, general backlog).
