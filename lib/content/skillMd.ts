/**
 * Each skill's SKILL.md, read one at a time. `pnpm skills:sync` writes them
 * to `lib/content/skill-md/<name>.md` beside the snapshot, and each becomes a
 * lazy chunk of its own, so /skills ships none and a skill page only its own.
 *
 * Only the skill page's route loader calls this. When the page is
 * prerendered, the loader runs at build time and the text travels in the
 * page's loader data, so the first load fetches no chunk for it. A
 * client-side navigation runs the loader in the browser, which fetches that
 * one skill's static chunk (on hover, with intent preloading).
 */
const SKILL_MD = import.meta.glob("./skill-md/*.md", {
  query: "?raw",
  import: "default",
});

/** The whole SKILL.md of `slug`, frontmatter included. */
export async function loadSkillMd(slug: string): Promise<string> {
  const load = SKILL_MD[`./skill-md/${slug}.md`];
  if (!load) {
    throw new Error(
      `No SKILL.md for ${slug} in lib/content/skill-md: run pnpm skills:sync`,
    );
  }
  return load();
}
