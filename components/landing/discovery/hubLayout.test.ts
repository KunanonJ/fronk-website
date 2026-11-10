import { describe, expect, it } from "vitest";
import {
  hubSpanClass,
  splitLead,
  topicGrid,
} from "@/components/landing/discovery/hubLayout";

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

describe("hubSpanClass", () => {
  it("maps spans to the canvas breakpoints", () => {
    expect(hubSpanClass({ md: 1, lg: 1 })).toBe("");
    expect(hubSpanClass({ md: 2, lg: 2 })).toBe("min-[641px]:col-span-2");
    expect(hubSpanClass({ md: 2, lg: 3 })).toBe(
      "min-[641px]:col-span-2 lg:col-span-3",
    );
    expect(hubSpanClass({ md: 2, lg: 1 })).toBe(
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
