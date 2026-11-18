import { describe, expect, it } from "vitest";
import { STACK_ENTRIES, workCopy } from "@/lib/content/homeWorkAbout";
import { ventures as homeVentures } from "@/lib/content/landing";
import {
  FEATURED_PORTFOLIO_SLUGS,
  getPortfolioProjectBySlug,
  outcomeLine,
} from "@/lib/content/portfolio";
import { PROFILE_BASE } from "@/lib/content/profileChrome";
import { getVentureBySlug } from "@/lib/content/ventures";
import {
  MATERIAL_HUES,
  materialHue,
  stackCards,
} from "@/lib/landing/stackCards";

/*
 * The work stack's cards (design spec 8.4, umbrella R7): read from the
 * content modules, in the owner's default order, with no figure of their own.
 */
describe("stackCards", () => {
  const cards = stackCards();

  it("shows the three featured projects, then both ventures (R7)", () => {
    expect(cards.map((card) => card.name)).toEqual([
      "TBH Intranet",
      "AI Automation",
      "Node Validator Automation",
      "GoGoCash",
      "Manut AI",
    ]);
    expect(
      cards.filter((card) => card.kind === "project").map((card) => card.slug),
    ).toEqual([...FEATURED_PORTFOLIO_SLUGS]);
    expect(cards.map((card) => card.slug)).toEqual(
      STACK_ENTRIES.map((entry) => entry.slug),
    );
  });

  it("puts id=ventures on GoGoCash, and no other id on any card", () => {
    expect(
      cards
        .filter((card) => card.anchor)
        .map((card) => [card.slug, card.anchor]),
    ).toEqual([["gogocash", "ventures"]]);
  });

  it("links each case under the profile base (Phase 5 builds those pages)", () => {
    for (const card of cards) {
      const kind = card.kind === "project" ? "portfolio" : "ventures";
      expect(card.href, card.slug).toBe(`${PROFILE_BASE}/${kind}/${card.slug}`);
    }
    expect(PROFILE_BASE).toBe("/preview");
  });

  it("gives each card the next material, in the spec's order, wrapping after six", () => {
    expect(cards.map((card) => card.hue)).toEqual([253, 79, 292, 327, 266]);
    expect(MATERIAL_HUES).toHaveLength(6);
    expect(materialHue(6)).toBe(253);
    expect(materialHue(11)).toBe(301);
  });

  it("reads names, chips and summaries from the content modules", () => {
    for (const card of cards) {
      if (card.kind === "project") {
        const project = getPortfolioProjectBySlug(card.slug)!;
        expect(card.name).toBe(project.name);
        expect(card.summary).toBe(project.tagline);
        expect(card.chips).toEqual([project.category, project.period]);
      } else {
        const venture = getVentureBySlug(card.slug)!;
        expect(card.name).toBe(venture.name);
        expect(card.summary).toBe(venture.tagline);
        expect(card.chips).toEqual([
          workCopy.venture,
          `${workCopy.since} ${venture.year}`,
        ]);
      }
    }
  });

  it("shows only cleared evidence: a project's first outcome, a venture's own count", () => {
    for (const card of cards) {
      if (card.kind === "project") {
        const first = getPortfolioProjectBySlug(card.slug)!.outcomes?.[0];
        expect(card.evidence, card.slug).toBe(
          first ? outcomeLine(first) : undefined,
        );
      } else {
        const home = homeVentures.cards.find(
          (item) => item.href === `/ventures/${card.slug}`,
        )!;
        expect(card.evidence, card.slug).toBe(
          /\d/.test(home.items[0]) ? home.items[0] : undefined,
        );
      }
    }
    // The figures, by name: the cleared outcome lines and GoGoCash's count.
    expect(cards.map((card) => card.evidence)).toEqual([
      outcomeLine(getPortfolioProjectBySlug("tbh-intranet")!.outcomes![0]!),
      outcomeLine(getPortfolioProjectBySlug("ai-automation")!.outcomes![0]!),
      undefined,
      homeVentures.cards[0].items[0],
      undefined,
    ]);
    // GoGoCash's count is its metric, word for word.
    const users = getVentureBySlug("gogocash")!.metrics![0]!;
    expect(cards[3]!.evidence).toBe(
      `${users.value} ${users.label.toLowerCase()}`,
    );
  });

  it("draws each project's mockup and each venture's logo and loop, as illustrations", () => {
    for (const card of cards) {
      expect(card.media?.kind, card.slug).toBe("illustration");
      if (card.media?.kind !== "illustration") continue;
      if (card.kind === "project") {
        expect(card.media.art).toEqual({
          type: "mockup",
          mockup: getPortfolioProjectBySlug(card.slug)!.mockup,
        });
      } else {
        const venture = getVentureBySlug(card.slug)!;
        expect(card.media.art).toEqual({
          type: "venture",
          logo: venture.logo,
          steps: venture.caseStudy?.loop ?? venture.stack,
          loop: Boolean(venture.caseStudy?.loop),
        });
      }
    }
  });

  it("uses a registered screenshot when a project has one", () => {
    const [card] = stackCards([{ kind: "project", slug: "kunanonj-com" }]);
    expect(card!.media).toEqual({
      kind: "screenshot",
      image: getPortfolioProjectBySlug("kunanonj-com")!.cover,
    });
    expect(card!.evidence).toBeUndefined();
  });

  it("fails loudly on a case that does not exist", () => {
    expect(() => stackCards([{ kind: "project", slug: "nope" }])).toThrow(
      /missing project/,
    );
    expect(() => stackCards([{ kind: "venture", slug: "nope" }])).toThrow(
      /missing venture/,
    );
  });
});
