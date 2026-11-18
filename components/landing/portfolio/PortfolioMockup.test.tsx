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
const mockups = getAllPortfolioProjects().flatMap((project) =>
  project.mockup ? [project.mockup] : [],
);

describe("PortfolioMockup labels", () => {
  it("covers every kind of mockup the portfolio draws", () => {
    expect(new Set(mockups.map((mockup) => mockup.kind)).size).toBe(4);
  });

  it("writes its labels by default, the same as asking for text", () => {
    for (const mockup of mockups) {
      const plain = renderToString(<PortfolioMockup mockup={mockup} />);
      expect(plain).toContain("<text");
      expect(
        renderToString(<PortfolioMockup mockup={mockup} labels="text" />),
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
