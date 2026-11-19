import { describe, expect, it } from "vitest";
import { aboutPage } from "@/lib/content/aboutPage";
import {
  STACK_ENTRIES,
  aboutCopy,
  workCopy,
} from "@/lib/content/homeWorkAbout";
import {
  FEATURED_PORTFOLIO_SLUGS,
  getPortfolioProjectBySlug,
  portfolioPage,
} from "@/lib/content/portfolio";
import { getVentureBySlug } from "@/lib/content/ventures";

/*
 * The redesigned Home's work stack and About bento copy (profile redesign
 * Phase 3). The module points at cleared content and types no figure; its
 * own lines are drafts in the site's voice.
 */
describe("homeWorkAbout", () => {
  it("stacks the featured projects, then GoGoCash with id=ventures, then Manut AI (R7)", () => {
    expect(STACK_ENTRIES).toEqual([
      ...FEATURED_PORTFOLIO_SLUGS.map((slug) => ({ kind: "project", slug })),
      { kind: "venture", slug: "gogocash", anchor: "ventures" },
      { kind: "venture", slug: "manut" },
    ]);
    for (const entry of STACK_ENTRIES) {
      const found =
        entry.kind === "project"
          ? getPortfolioProjectBySlug(entry.slug)
          : getVentureBySlug(entry.slug);
      expect(found, entry.slug).not.toBeNull();
    }
  });

  it("names the work stack as the smoke test reads it", () => {
    expect(workCopy.eyebrow).toBe(portfolioPage.title);
    expect(workCopy.eyebrow).toBe("Selected work");
  });

  it("takes the story and the principles from the About page, as they are", () => {
    expect(aboutCopy.brief).toBe(aboutPage.story.paragraphs);
    expect(aboutCopy.principles).toBe(aboutPage.principles.items);
  });

  it("types no figure: the stats and evidence are read where they are cleared", () => {
    // Each object on its own: spread together, aboutCopy's heading and lead
    // would replace workCopy's, which would then go unchecked.
    const { brief: _brief, principles: _principles, ...about } = aboutCopy;
    // The story and the principles are /about's, held by its own tests.
    for (const [name, copy] of [
      ["workCopy", workCopy],
      ["aboutCopy", about],
    ] as const) {
      expect(JSON.stringify(copy), name).not.toMatch(/\d/);
    }
  });

  it("writes its drafts plainly: no em dash, no emoji, sentence case", () => {
    const sentences = [
      workCopy.heading,
      workCopy.lead,
      workCopy.cta,
      workCopy.venture,
      workCopy.since,
      aboutCopy.eyebrow,
      aboutCopy.heading,
      aboutCopy.lead,
      aboutCopy.briefLabel,
      aboutCopy.mess.heading,
      ...aboutCopy.mess.chips,
      aboutCopy.mess.line,
      aboutCopy.stats.heading,
      aboutCopy.stats.footnote.lead,
      aboutCopy.motion.caption,
      aboutCopy.motion.pause,
      aboutCopy.motion.play,
    ];
    // The footnote's endings follow a case's name, so they start lower case.
    const endings = [
      aboutCopy.stats.footnote.one,
      aboutCopy.stats.footnote.many,
    ];
    for (const line of [...sentences, ...endings])
      expect(line, line).not.toMatch(/[—–]|\p{Extended_Pictographic}/u);
    for (const line of sentences)
      expect(line[0], line).toBe(line[0]!.toUpperCase());
    expect(aboutCopy.mess.chips).toHaveLength(5);
  });
});
