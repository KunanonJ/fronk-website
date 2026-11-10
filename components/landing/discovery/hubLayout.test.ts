import { bentoSpan } from "@/components/bento/Bento";
import { describe, expect, it } from "vitest";
import { splitLead, topicGrid } from "@/components/landing/discovery/hubLayout";

const lg = (n: number) => {
  const grid = topicGrid(n);
  return [...grid.sections, grid.proof, grid.faq].map((span) => span.lg);
};
const md = (n: number) => {
  const grid = topicGrid(n);
  return [...grid.sections, grid.proof, grid.faq].map((span) => span.md);
};

describe("topicGrid", () => {
  it("draws the English canvas: s1 2 | s2, s3 | proof 2, FAQ 3", () => {
    expect(lg(3)).toEqual([2, 1, 1, 2, 3]);
    expect(md(3)).toEqual([2, 1, 1, 2, 2]);
  });

  it("draws the Thai canvas: s1 2 | s2, proof | FAQ 2", () => {
    expect(lg(2)).toEqual([2, 1, 1, 2]);
    expect(md(2)).toEqual([2, 1, 1, 2]);
  });

  it("fills every row for a one-section pillar, at three and two columns", () => {
    expect(lg(1)).toEqual([2, 1, 3]);
    // Proof would sit alone beside the full-width FAQ: it widens instead.
    expect(md(1)).toEqual([2, 2, 2]);
  });

  it("never leaves a three-column row part-filled", () => {
    for (let n = 1; n <= 6; n += 1) {
      const total = lg(n).reduce((sum, span) => sum + span, 0);
      expect(total % 3, `${n} sections`).toBe(0);
    }
  });
});

describe("bentoSpan with per-breakpoint spans", () => {
  it("maps spans to the canvas breakpoints", () => {
    expect(bentoSpan({ md: 1, lg: 1 })).toBe("");
    expect(bentoSpan({ md: 2, lg: 2 })).toBe("min-[641px]:col-span-2");
    expect(bentoSpan({ md: 2, lg: 3 })).toBe(
      "min-[641px]:col-span-2 lg:col-span-3",
    );
    expect(bentoSpan({ md: 2, lg: 1 })).toBe(
      "min-[641px]:col-span-2 lg:col-span-1",
    );
  });
});

describe("splitLead", () => {
  it("leads with a short first sentence", () => {
    expect(splitLead("Founder. I own the product end to end.")).toEqual({
      lead: "Founder.",
      rest: "I own the product end to end.",
    });
  });

  it("keeps a long first sentence, or a lone one, as body text", () => {
    const long =
      "Live at gogocash.co with 1,000+ users and a merchant catalogue past 220 partners. The core loop is live.";
    expect(splitLead(long)).toEqual({ rest: long });
    expect(splitLead("One sentence only.")).toEqual({
      rest: "One sentence only.",
    });
  });

  it("does not split inside a domain name", () => {
    expect(splitLead("Live at manut.xyz today. More soon.").lead).toBe(
      "Live at manut.xyz today.",
    );
  });
});

describe("topicGrid with four sections (the FDE hub)", () => {
  it("sets the sections in pairs and gives proof and the FAQ the next row", () => {
    const grid = topicGrid(4);
    expect(grid.paired).toBe(true);
    // The pair row holds the cards, so none of them takes a grid cell.
    expect(grid.sections).toEqual([]);
    expect([grid.proof.lg, grid.faq.lg]).toEqual([1, 2]);
    // At two columns a lone proof card would sit beside nothing: it widens.
    expect([grid.proof.md, grid.faq.md]).toEqual([2, 2]);
  });

  it("pairs only an even count from four up, and leaves the drawn hubs alone", () => {
    expect([1, 2, 3, 5].map((n) => topicGrid(n).paired)).toEqual([
      false,
      false,
      false,
      false,
    ]);
    expect([4, 6].map((n) => topicGrid(n).paired)).toEqual([true, true]);
  });
});
