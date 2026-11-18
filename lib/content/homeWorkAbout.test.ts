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
    const own = {
      ...workCopy,
      ...aboutCopy,
      brief: undefined,
      principles: undefined,
    };
    expect(JSON.stringify(own)).not.toMatch(/\d/);
  });

  it("writes its drafts plainly: no em dash, no emoji, sentence case", () => {
    const drafts = [
      workCopy.heading,
      workCopy.lead,
      workCopy.cta,
      workCopy.venture,
      workCopy.since,
      aboutCopy.eyebrow,
      aboutCopy.heading,
      aboutCopy.lead,
      aboutCopy.briefLabel,
      ...aboutCopy.mess.chips,
      aboutCopy.mess.line,
      aboutCopy.stats.footnote,
      aboutCopy.motion.caption,
      aboutCopy.motion.pause,
      aboutCopy.motion.play,
    ];
    for (const line of drafts) {
      expect(line, line).not.toMatch(/[—–]|\p{Extended_Pictographic}/u);
      expect(line[0], line).toBe(line[0]!.toUpperCase());
    }
    expect(aboutCopy.mess.chips).toHaveLength(5);
  });
});
