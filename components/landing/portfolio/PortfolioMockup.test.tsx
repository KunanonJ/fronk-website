import { createHash } from "node:crypto";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import PortfolioMockup from "@/components/landing/portfolio/PortfolioMockup";
import { getAllPortfolioProjects } from "@/lib/content/portfolio";

/*
 * The mockups' label option (profile redesign Phase 3). By default every
 * label is text, exactly as before; "bars" draws them as bars for a mockup
 * drawn small enough that its 10 to 18 unit labels would fall under 12 px
 * (the redesigned Home's stack cards, design spec 12 item 5).
 */
const drawn = getAllPortfolioProjects().flatMap((project) =>
  project.mockup ? [{ slug: project.slug, mockup: project.mockup }] : [],
);
const mockups = drawn.map((each) => each.mockup);

describe("PortfolioMockup labels", () => {
  it("covers every kind of mockup the portfolio draws", () => {
    expect(new Set(mockups.map((mockup) => mockup.kind)).size).toBe(4);
  });

  it("draws every project's mockup by default exactly as the live pages always have (stored)", () => {
    // The snapshots were written by the file before the label option
    // (commit 29ad1d7), so a change to the live drawing fails here.
    for (const { slug, mockup } of drawn) {
      const plain = renderToString(<PortfolioMockup mockup={mockup} />);
      expect(plain, slug).toContain("<text");
      expect(plain).toMatchSnapshot(slug);
      expect(
        renderToString(<PortfolioMockup mockup={mockup} labels="text" />),
        slug,
      ).toBe(plain);
    }
  });

  it("draws a bar for each label, and no text, in bars mode", () => {
    for (const mockup of mockups) {
      const plain = renderToString(<PortfolioMockup mockup={mockup} />);
      const bars = renderToString(
        <PortfolioMockup mockup={mockup} labels="bars" />,
      );
      expect(bars, mockup.kind).not.toContain("<text");
      const texts = plain.match(/<text/g)?.length ?? 0;
      const rects = (html: string) => html.match(/<rect/g)?.length ?? 0;
      expect(rects(bars) - rects(plain), mockup.kind).toBe(texts);
    }
  });

  it("draws the same default and bars output as before the floor mode (Phase 5)", () => {
    // sha256 of each mockup's markup, taken before Phase 5 added "floor": the
    // live project pages render the default, the Home's stack cards the bars.
    const hash = (html: string) =>
      createHash("sha256").update(html).digest("hex").slice(0, 16);
    const seen = getAllPortfolioProjects().flatMap((project) =>
      project.mockup
        ? (["text", "bars"] as const).map(
            (labels) =>
              `${project.slug} ${labels} ${hash(
                renderToString(
                  labels === "text" ? (
                    <PortfolioMockup
                      mockup={project.mockup!}
                      label={`Illustrative mockup of ${project.name}`}
                    />
                  ) : (
                    <PortfolioMockup mockup={project.mockup!} labels="bars" />
                  ),
                ),
              )}`,
          )
        : [],
    );
    expect(seen).toEqual([
      "tbh-intranet text f0576b22f76a4984",
      "tbh-intranet bars e7e265f6c79755ca",
      "node-validator-automation text 7a13cf8ce9c0c8ea",
      "node-validator-automation bars a03349100b9bb2e8",
      "email-signature-generator text 8805426ce3ccdf88",
      "email-signature-generator bars 1a0f5d8475fe0ba3",
      "ai-automation text 8740f4443b087c51",
      "ai-automation bars dff73e9f8107f45a",
    ]);
  });

  it("writes only labels of 12 units or more in floor mode, and draws the rest as bars", () => {
    for (const mockup of mockups) {
      const plain = renderToString(<PortfolioMockup mockup={mockup} />);
      const floor = renderToString(
        <PortfolioMockup mockup={mockup} labels="floor" />,
      );
      const sizes = (html: string) =>
        [...html.matchAll(/<text[^>]*font-size="([\d.]+)"/g)].map((m) =>
          Number(m[1]),
        );
      expect(
        sizes(floor).every((size) => size >= 12),
        mockup.kind,
      ).toBe(true);
      // Every label of 12 units or more is still written, word for word.
      expect(sizes(floor), mockup.kind).toEqual(
        sizes(plain).filter((size) => size >= 12),
      );
      // The others became bars: one rect for each label dropped.
      const texts = (html: string) => html.match(/<text/g)?.length ?? 0;
      const rects = (html: string) => html.match(/<rect/g)?.length ?? 0;
      expect(rects(floor) - rects(plain), mockup.kind).toBe(
        texts(plain) - texts(floor),
      );
    }
  });

  it("keeps its name and role in either mode", () => {
    const [mockup] = mockups;
    const named = renderToString(
      <PortfolioMockup
        mockup={mockup!}
        label="Illustrative mockup"
        labels="bars"
      />,
    );
    expect(named).toContain('role="img"');
    expect(named).toContain("<title>Illustrative mockup</title>");
  });
});
