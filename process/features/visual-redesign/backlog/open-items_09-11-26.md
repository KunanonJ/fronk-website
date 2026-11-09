# visual-redesign: open items at closeout (09-11-26)

Left open when the program closed. Each says why.

## Owner actions

1. **Regenerate `public/resume.pdf` from production.**
   - The committed PDF predates the redesign.
   - Command: `RESUME_URL=https://kunanonj.com/resume pnpm pdf`. Print styles were checked in Phase 5: light palette, Geist, no Download button.
   - Not done automatically because the PDF is the owner's document and carries live CMS content, so it should be reviewed before committing.
2. **Real portfolio screenshots** (issue #44): the `cover` field already supports them; the illustrative mockups stay until then.

## Engineering follow-ups

1. **Segment OG images use the default font in the Worker** (pre-existing, Phase 4 note).
   - Segment `opengraph-image` routes (portfolio, skills, topics, ventures) render on demand in the Worker, where the Geist TTFs aren't bundled.
   - Fix: prerender them at build, or embed the fonts.
2. **knip leaves 7 unused exports/types:** `lib/sanity/types` CMS shapes, `sanity/env` secrets, two skills constants, `pickOptionalString`, `StackIconId`, `SiteConfig`. Harmless; trim when touching those files.
3. **`/stock/asme` page file:** `next.config.ts` already 308s it to `/about`, so `app/(landing)/stock/asme/page.tsx` is an unreachable fallback. Delete it with the next routing change.
4. **Visual suite scope:** the CMS-driven `/resume` and `/blog` are skipped by design (an owner edit in Sanity would fail unrelated PRs); smoke and axe still cover them.
5. **Workers Builds preview checks can sit queued** on Cloudflare's side (seen on #68 for 20+ minutes while production builds ran). They aren't required checks; a local `pnpm build:cloudflare` is the stand-in.
