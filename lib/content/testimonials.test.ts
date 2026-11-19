import { describe, expect, it } from "vitest";
import { SAMPLE_NOTES } from "@/components/profile/preview/sampleNotes";
import {
  clearedTestimonials,
  isClearedOn,
  notebookEntries,
  roleLine,
  TESTIMONIALS,
  TESTIMONIALS_MIN,
  type Testimonial,
} from "@/lib/content/testimonials";
import { siteSources, type SiteSource } from "@/tests/siteSources";

/*
 * The testimonial claim audit (profile redesign Phase 4, plan step 4d and
 * gate 5; owner decision 5 of 18-11-26). Quotes come only from
 * lib/content/testimonials.ts, each with the day the owner cleared it, and
 * the Home shows the notebook only with TESTIMONIALS_MIN of them or more.
 * The checks run on fixtures they must fail first, so they still catch
 * something while the module is empty.
 */

const OWN = "lib/content/testimonials.ts";

const entry = (overrides: Partial<Testimonial> = {}): Testimonial => ({
  quote: "Words the person agreed to publish.",
  name: "A Person",
  role: "Engineer",
  initials: "AP",
  source: "LinkedIn recommendation",
  clearedOn: "18-11-26",
  ...overrides,
});

/** Lines of other source files that repeat a quote, which nobody cleared there. */
function quotesElsewhere(
  quotes: readonly Testimonial[],
  sources: readonly SiteSource[],
): string[] {
  return quotes.flatMap(({ quote }) =>
    sources
      .filter(({ file, text }) => file !== OWN && text.includes(quote.trim()))
      .map(({ file }) => `${file}: "${quote.slice(0, 40)}"`),
  );
}

/**
 * Quotes typed straight into code, not read from testimonials.ts: a `quote:`
 * string that is not a labelled sample, or words written inside a
 * <blockquote> of a component (its expressions, which read content, aside).
 */
function typedQuotes(sources: readonly SiteSource[]): string[] {
  const out: string[] = [];
  for (const { file, text } of sources) {
    if (file === OWN || !/\.(ts|tsx)$/.test(file)) continue;
    for (const match of text.matchAll(/\bquote:\s*(["'`])([\s\S]*?)\1/g)) {
      const quote = match[2]!.trim();
      if (!/^Sample note/.test(quote))
        out.push(`${file}: quote "${quote.slice(0, 40)}"`);
    }
    if (!file.endsWith(".tsx")) continue;
    for (const match of text.matchAll(
      /<blockquote\b[^>]*>([\s\S]*?)<\/blockquote>/g,
    )) {
      let inner = match[1]!;
      // Expressions, nested or not, then tags: what is left was typed.
      for (let before = ""; before !== inner;) {
        before = inner;
        inner = inner.replace(/\{[^{}]*\}/g, "");
      }
      const typed = inner.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
      if (/\p{L}{2,}/u.test(typed))
        out.push(`${file}: <blockquote> "${typed.trim().slice(0, 40)}"`);
    }
  }
  return out;
}

describe("testimonials: the 3-quote rule", () => {
  it("needs three cleared quotes: the Home gets all of them, or none", () => {
    expect(TESTIMONIALS_MIN).toBe(3);
    const cleared = clearedTestimonials();
    expect(notebookEntries()).toEqual(
      cleared.length >= TESTIMONIALS_MIN ? cleared : [],
    );
  });

  it("shows nothing with zero, one or two cleared quotes, and all of them from three", () => {
    for (const count of [0, 1, 2])
      expect(
        notebookEntries(Array.from({ length: count }, () => entry())),
      ).toEqual([]);
    const three = [entry(), entry({ name: "B" }), entry({ name: "C" })];
    expect(notebookEntries(three)).toEqual(three);
  });

  it("counts only entries with words, a name and a real clearance date", () => {
    const entries = [
      entry(),
      entry({ name: "B" }),
      entry({ name: "C", clearedOn: "" }),
      entry({ name: "D", clearedOn: "31-02-26" }),
      entry({ name: "E", quote: "  " }),
    ];
    expect(clearedTestimonials(entries)).toHaveLength(2);
    expect(notebookEntries(entries)).toEqual([]);
  });

  it("reads clearance dates as dd-mm-yy calendar days", () => {
    expect(isClearedOn("18-11-26")).toBe(true);
    expect(isClearedOn("29-02-28")).toBe(true);
    expect(isClearedOn("29-02-26")).toBe(false);
    expect(isClearedOn("2026-11-18")).toBe(false);
    expect(isClearedOn("18/11/26")).toBe(false);
  });

  it("names a role with its organisation when there is one", () => {
    expect(roleLine(entry({ organisation: "Org" }))).toBe("Engineer, Org");
    expect(roleLine(entry())).toBe("Engineer");
  });
});

describe("testimonials: claim audit", () => {
  it("clears every quote on a date, with a name, initials and a source", () => {
    for (const item of TESTIMONIALS) {
      expect(isClearedOn(item.clearedOn), item.name).toBe(true);
      expect(item.quote.trim(), item.name).not.toBe("");
      expect(item.initials.trim(), item.name).not.toBe("");
      expect(item.source.trim(), item.name).not.toBe("");
    }
  });

  it("finds a quote repeated in another source file (the fixture it must fail)", () => {
    const quote = entry({ quote: "A quote nobody cleared for the footer." });
    const sources = [
      { file: OWN, text: quote.quote },
      { file: "components/Footer.tsx", text: `<p>${quote.quote}</p>` },
    ];
    expect(quotesElsewhere([quote], sources)).toEqual([
      'components/Footer.tsx: "A quote nobody cleared for the footer."',
    ]);
  });

  it("keeps every quote in testimonials.ts and in no other place", () => {
    expect(quotesElsewhere(TESTIMONIALS, siteSources())).toEqual([]);
  });

  it("finds a quote typed into a component (the fixtures it must fail)", () => {
    expect(
      typedQuotes([
        {
          file: "components/profile/home/Praise.tsx",
          text: `const notes = [{ quote: "Great to work with.", name: "A" }];`,
        },
        {
          file: "components/profile/home/Praise2.tsx",
          text: `<blockquote className="q">\n  <p>He ships fast.</p>\n</blockquote>`,
        },
      ]),
    ).toEqual([
      'components/profile/home/Praise.tsx: quote "Great to work with."',
      'components/profile/home/Praise2.tsx: <blockquote> "He ships fast."',
    ]);
    // Content read from a module, and a labelled sample, pass.
    expect(
      typedQuotes([
        {
          file: "components/A.tsx",
          text: `<blockquote className="t-quote">“{source.quote}”</blockquote><blockquote><p>{entry.quote}</p></blockquote>`,
        },
        { file: "components/B.ts", text: `{ quote: "Sample note four." }` },
      ]),
    ).toEqual([]);
  });

  it("types no quote into any component: every quote is read from testimonials.ts", () => {
    expect(typedQuotes(siteSources())).toEqual([]);
  });

  it("keeps the preview's samples out of the content module and off the Home", () => {
    const own = siteSources().find(({ file }) => file === OWN)?.text ?? "";
    expect(own).not.toBe("");
    for (const sample of SAMPLE_NOTES) {
      expect(sample.quote).toMatch(/^Sample note/);
      expect(sample.name).toMatch(/^Sample/);
      expect(own).not.toContain(sample.quote);
    }
    // No clearance date: the 3-quote rule drops them even if passed to it.
    expect(notebookEntries(SAMPLE_NOTES)).toEqual([]);
  });
});
