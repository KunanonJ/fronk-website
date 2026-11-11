import { describe, expect, it } from "vitest";
import { RESUME_TIMELINE_FALLBACK } from "@/lib/content/resumeTimeline.fallback";
import { getAllVentureSlugs, getVentureBySlug } from "@/lib/content/ventures";
import { siteSources as sources } from "@/tests/siteSources";

/**
 * True when `text` gives `value` as a whole figure, not inside a longer one.
 * A comma after it is punctuation unless a digit follows ("1,000,000").
 */
function statesFigure(text: string, value: string): boolean {
  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?<![\\d,.])${escaped}(?![\\d+%]|,\\d)`).test(text);
}

/** GoGoCash's two running totals, in any notation a sentence might use. */
const TOTAL = /169,000|169K|13 million|13M\b/;

describe("venture case studies", () => {
  it("every venture ships a case study with intro, sections and timeline", () => {
    for (const slug of getAllVentureSlugs()) {
      const venture = getVentureBySlug(slug);
      expect(venture, slug).not.toBeNull();
      expect(venture?.caseStudy, `${slug} caseStudy`).toBeDefined();
      expect(venture?.caseStudy?.intro.length, `${slug} intro`).toBeGreaterThan(
        40,
      );
      expect(
        venture?.caseStudy?.sections.length,
        `${slug} sections`,
      ).toBeGreaterThanOrEqual(2);
      for (const section of venture?.caseStudy?.sections ?? []) {
        expect(section.heading.length).toBeGreaterThan(2);
        expect(section.body.length).toBeGreaterThan(20);
      }
      expect(venture?.caseStudy?.timeline).toMatch(/\d{4}/);
    }
  });

  it("splits each tagline into hub display lines, word for word", () => {
    for (const slug of getAllVentureSlugs()) {
      const venture = getVentureBySlug(slug)!;
      const lines = venture.caseStudy?.taglineLines ?? [];
      expect(lines.length, slug).toBeGreaterThan(1);
      expect(lines.join(" "), slug).toBe(venture.tagline);
      expect(venture.logo, slug).toMatch(/^\/brand\//);
    }
  });

  it("only gives a loop to a venture whose case names its stages", () => {
    const gogocash = getVentureBySlug("gogocash")!.caseStudy!;
    const stands = gogocash.sections[1]!.body.toLowerCase();
    expect(gogocash.loop).toHaveLength(4);
    expect(stands).toContain(
      (gogocash.loop ?? []).map((stage) => stage.toLowerCase()).join(", "),
    );
    expect(getVentureBySlug("manut")?.caseStudy?.loop).toBeUndefined();
  });

  it("keeps metrics honest — only ventures with corroborated figures have them", () => {
    // GoGoCash's figures are corroborated in its description; Manut has no
    // published numbers yet and must not grow fabricated ones.
    expect(getVentureBySlug("gogocash")?.metrics?.length).toBe(5);
    expect(getVentureBySlug("manut")?.metrics).toBeUndefined();
  });

  it("states every metric in the venture's own published copy", () => {
    for (const slug of getAllVentureSlugs()) {
      const venture = getVentureBySlug(slug)!;
      const published = [
        venture.description,
        venture.caseStudy?.intro ?? "",
        ...(venture.caseStudy?.sections ?? []).map((section) => section.body),
      ].join(" ");
      for (const metric of venture.metrics ?? [])
        expect(
          statesFigure(published, metric.value),
          `${slug}: ${metric.label}`,
        ).toBe(true);
    }
  });

  it("does not take a longer figure for a metric's value", () => {
    // "21,000 registered users" must not vouch for "1,000", nor "130%" for
    // "30%", nor "1,000+" for "1,000".
    expect(statesFigure("It has 21,000 registered users.", "1,000")).toBe(
      false,
    );
    expect(statesFigure("Up to 130% back.", "30%")).toBe(false);
    expect(statesFigure("1,000+ users.", "1,000")).toBe(false);
    expect(statesFigure("With 1,000 registered users.", "1,000")).toBe(true);
    expect(statesFigure("Paid THB 169,000.", "THB 169,000")).toBe(true);
  });
});

/*
 * GoGoCash's running totals (recruiter-fit phase 3). The owner cleared the
 * CV's figures for the site and said they were true as of October 2026
 * (11-11-26). On the venture page and on /proof, which his answer covers,
 * they appear only with that month and only as the résumé states them. The
 * résumé itself keeps the CV's line, which gives no month.
 */
describe("GoGoCash's dated totals", () => {
  const gogocash = getVentureBySlug("gogocash")!;
  const dated = (gogocash.metrics ?? []).filter((metric) => metric.asOf);
  const resumeLine = RESUME_TIMELINE_FALLBACK.flatMap(
    (section) => section.items,
  )
    .filter((item) => item.title === "GoGoCash")
    .flatMap((item) => item.bullets ?? [])
    .find((bullet) => bullet.includes("gross merchandise value"));

  it("restate the résumé's line, figure for figure", () => {
    expect(resumeLine).toBe(
      "1,000 registered users; THB 13 million cumulative gross merchandise value; THB 169,000 cashback paid.",
    );
    expect(dated.map((metric) => `${metric.value} ${metric.label}`)).toEqual([
      "THB 13 million Cumulative gross merchandise value",
      "THB 169,000 Cashback paid",
    ]);
    for (const metric of dated)
      expect(resumeLine!.toLowerCase()).toContain(
        `${metric.value} ${metric.label}`.toLowerCase(),
      );
  });

  it("carry the month the owner gave, and no other", () => {
    expect(dated.length).toBeGreaterThan(0);
    for (const metric of dated) expect(metric.asOf).toBe("October 2026");
    // A total with no date would read as true today.
    const undated = (gogocash.metrics ?? []).filter((metric) => !metric.asOf);
    for (const metric of undated)
      expect(metric.value, metric.label).not.toMatch(/THB|฿/);
  });

  it("are dated in the sentence that states them", () => {
    const stands = gogocash.caseStudy!.sections.find(
      (section) => section.heading === "Where it stands",
    )!.body;
    const sentence = stands
      .split(/(?<=\.)\s+/)
      .find((part) => part.includes("THB 13 million"));
    expect(sentence).toBe(
      "As of October 2026, cumulative gross merchandise value is THB 13 million and cashback paid is THB 169,000.",
    );
  });

  it("leave no other user count anywhere in the site's sources or the seed", () => {
    // "1,000 registered users" is the owner's wording (11-11-26). A looser
    // count on one surface is how the pages came to disagree.
    const loose =
      /1,000\+|1000\+|over 1,000|more than (a|one) thousand|thousand users|1k users|1,000 users/i;
    expect(
      sources()
        .filter(({ text }) => loose.test(text))
        .map(({ file }) => file),
    ).toEqual([]);
    // Every count of registered users in English is exactly 1,000 and
    // unqualified: "21,000 registered users" and "at least 1,000 registered
    // users" are other counts.
    const counted = sources().flatMap(({ file, text }) =>
      [...text.matchAll(/([\d,.]*\d\+?)\s+registered users/gi)].map(
        (match) => ({
          file,
          count: match[1],
          before: text.slice(0, match.index),
        }),
      ),
    );
    expect(counted.length).toBeGreaterThan(5);
    for (const { file, count, before } of counted) {
      expect(count, file).toBe("1,000");
      expect(before.slice(-40), file).not.toMatch(
        /\b(more than|over|nearly|about|almost|up to|at least|around|roughly|approximately|circa|some|close to|upwards of|in excess of|exceeding|plus)\s$/i,
      );
    }
    // The same in Thai. Between "registered" and the number only a space
    // may stand ("กว่า" there would mean "more than"), and the unit may be
    // "ราย" or "คน".
    const thai = sources().flatMap(({ file, text }) =>
      [
        ...text.matchAll(
          /ผู้ใช้[^\d\n]{0,30}?ลงทะเบียน([^\d\n]*?)([\d,.]*\d\+?)\s*(ราย|คน)/g,
        ),
      ].map((match) => ({ file, gap: match[1]!, count: match[2]! })),
    );
    expect(thai.length).toBeGreaterThan(0);
    for (const { file, gap, count } of thai) {
      expect(gap, file).toMatch(/^\s*$/);
      expect(count, file).toBe("1,000");
    }
    // And the phrase is never left without its number. A metric's label is
    // the one place it stands alone; "unregistered users" is another word.
    const bare = sources().filter(({ text }) =>
      /(?<![\d]\s)\bregistered users/i.test(
        text.replace(/"Registered [Uu]sers"/g, ""),
      ),
    );
    expect(bare.map(({ file }) => file)).toEqual([]);
  });

  it("count the users as the résumé does, on every line of the case", () => {
    const copy = [
      gogocash.description,
      gogocash.caseStudy!.intro,
      ...gogocash.caseStudy!.sections.map((section) => section.body),
    ];
    const counting = copy.filter((text) => /users/i.test(text));
    expect(counting.length).toBeGreaterThan(1);
    for (const text of counting) {
      // As a whole figure: "21,000 registered users" is another count.
      expect(statesFigure(text, "1,000 registered users"), text).toBe(true);
      // Whole words: "cover a purchase" is not "over a thousand".
      expect(text).not.toMatch(
        /\bmore than\b|\bover a\b|thousand users|1,000\+/i,
      );
    }
  });

  it("promise cashback as the CV does: on eligible purchases, at partner merchants", () => {
    // The intro once said "a cut of every purchase" at "the stores you
    // already use". The CV's note says eligible purchases from participating
    // brands, and where the two disagree the CV is right (decision 1).
    expect(gogocash.caseStudy!.intro).toContain("eligible purchases");
    // In no file: the FAQ, the hubs and the build board describe GoGoCash too.
    expect(
      sources()
        .filter(({ text }) =>
          /every purchase|stores you already use/i.test(text),
        )
        .map(({ file }) => file),
    ).toEqual([]);
  });

  it("appear nowhere without their month, outside the résumé's own line", () => {
    // Only two modules may hold them, in any notation ("THB 13M", "169,000
    // baht"): the venture (dated) and the résumé, which restates the CV's
    // line as the CV gives it.
    const holders = sources()
      .filter(({ text }) => TOTAL.test(text))
      .map(({ file }) => file)
      .sort();
    expect(holders).toEqual([
      "lib/content/resumeTimeline.fallback.ts",
      "lib/content/ventures.ts",
    ]);
    // In the venture's own copy, every sentence that gives a total names
    // the month: a total read without it would pass for today's figure.
    const copy = [
      gogocash.description,
      gogocash.tagline,
      gogocash.caseStudy!.intro,
      ...gogocash.caseStudy!.sections.map((section) => section.body),
    ];
    const sentences = copy
      .flatMap((text) => text.split(/(?<=\.)\s+/))
      .filter((sentence) => TOTAL.test(sentence));
    expect(sentences.length).toBeGreaterThan(0);
    for (const sentence of sentences)
      expect(sentence).toMatch(/^As of October 2026,/);
    // No other venture borrows them.
    for (const slug of getAllVentureSlugs().filter((s) => s !== "gogocash"))
      expect(JSON.stringify(getVentureBySlug(slug)), slug).not.toMatch(TOTAL);
  });
});
