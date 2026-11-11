import { describe, expect, it } from "vitest";
import { getAllPortfolioProjects } from "@/lib/content/portfolio";
import { portfolioGrid, taglineLines } from "./portfolioLayout";

const text = (line: readonly { text: string }[]) =>
  line.map((s) => s.text).join(" ");

describe("portfolioGrid", () => {
  it("draws the canvas index: TBH 2 | Node 1, Email 1 | AI 2", () => {
    expect(portfolioGrid(4)).toEqual([
      { md: 2, lg: 2 },
      { md: 1, lg: 1 },
      { md: 1, lg: 1 },
      { md: 2, lg: 2 },
    ]);
  });

  it("gives a single filtered project the whole row", () => {
    expect(portfolioGrid(1)).toEqual([{ md: 2, lg: 3 }]);
  });

  it.each([2, 3, 5, 6, 7, 8])("fills every row for %i cards", (count) => {
    const spans = portfolioGrid(count);
    expect(spans).toHaveLength(count);
    expect(spans.reduce((sum, s) => sum + s.lg, 0) % 3).toBe(0);
    expect(spans.reduce((sum, s) => sum + s.md, 0) % 2).toBe(0);
  });

  it("returns nothing for no cards", () => {
    expect(portfolioGrid(0)).toEqual([]);
  });
});

describe("taglineLines", () => {
  it("sets TBH Intranet as the canvas does", () => {
    expect(taglineLines("One back office for a multi-entity group.")).toEqual([
      [
        { text: "One", muted: true },
        { text: "back office" },
        { text: "for", muted: true },
      ],
      [{ text: "a multi-entity group." }],
    ]);
  });

  it("breaks the other taglines after a connector or a comma", () => {
    const lines = Object.fromEntries(
      getAllPortfolioProjects().map((p) => [
        p.slug,
        taglineLines(p.tagline).map(text),
      ]),
    );
    expect(lines).toEqual({
      "tbh-intranet": ["One back office for", "a multi-entity group."],
      "node-validator-automation": [
        "Daily health checks for",
        "Avalanche L1 validators.",
      ],
      "email-signature-generator": ["Branded Gmail signatures,", "self-serve."],
      "ai-automation": ["AI agents for", "content ops and hiring."],
      "kunanonj-com": ["A personal site for", "people and for AI agents."],
    });
  });

  it("splits evenly when there is no connector or comma", () => {
    expect(taglineLines("Short tools built well.").map(text)).toEqual([
      "Short tools",
      "built well.",
    ]);
  });

  it("keeps a one-word tagline on one line", () => {
    expect(taglineLines("Done.")).toEqual([[{ text: "Done." }]]);
  });
});
