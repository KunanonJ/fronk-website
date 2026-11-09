# ux-experience: open items at closeout (09-11-26)

The program closed on 09-11-26 (see `../completed/ux-experience_UMBRELLA_PLAN_06-11-26.md`). These items were not finished, and they aren't covered by the `visual-redesign` program.

## 1. Production email test for Phase 0 (owner action)

- **What:** confirm that a message sent from `/contact` in production reaches the inbox, and that Reply goes to the visitor.
- **Why open:** it needs the owner's Resend setup: `kunanonj.com` verified as a sending domain, and the Worker secrets `RESEND_API_KEY`, `CONTACT_TO_EMAIL` and `CONTACT_FROM_EMAIL`. Without them, `/api/contact` returns 503, and the form shows the honest error with the mailto fallback.
- **How:** send one test message from https://kunanonj.com/contact, or POST to Resend's test inbox `delivered@resend.dev` from a local preview with the secrets in `.dev.vars`.

## 2. Blog-dependent items, deferred while the blog is hidden

The blog has been hidden since 09-11-26 (`BLOG_PUBLIC = false` in `lib/content/blogVisibility.ts`, #56). Revisit these when the posts are expanded (issue #43) and the flag flips back:

- **Finding 15:** `/blog` shows 20 tag chips (5 rows) before the first post on phones. Use one scrollable chip row or a "Filter by topic" disclosure; the first post must sit above the fold at 390x844.
- **Finding 13 (writing part):** a home "Latest writing" strip with the 3 newest posts (Sanity plus fallbacks).
- **Finding 6 (blog part):** about 982 KB of card images on `/blog`. Use sized thumbnails, correct `sizes`, and lazy-load below the fold.
- **Finding 7 (blog part):** `components/landing/BlogIndex.tsx` and `BlogPostPage.tsx` (client components) import `lib/content/blog.ts`, which pulls the Sanity client into client bundles. Move the reads behind server code, or handle it in the TanStack migration.
- **The `/blog` restyle:** while hidden, it only gets token compatibility from `visual-redesign` Phase 5. Give it the full redesign when it returns.
