import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PixelPortrait } from "@/components/profile/site/PixelPortrait";
import { PORTRAIT, PORTRAIT_SMALL } from "@/lib/brand/pixelPortrait";

/*
 * The pixel portrait as SVG: 16 groups, one per print rank, so the print-in
 * and the dissolve to the photo show or hide whole groups.
 */
describe("PixelPortrait", () => {
  it("draws every rank by default, hidden from assistive technology", () => {
    const { container } = render(<PixelPortrait rows={PORTRAIT_SMALL} />);
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("viewBox", "0 0 16 16");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    const groups = svg.querySelectorAll("g");
    expect(groups).toHaveLength(16);
    expect(svg.querySelectorAll("g[visibility='hidden']")).toHaveLength(0);
    expect(svg.querySelector(".pf-portrait__bg")).not.toBeNull();
  });

  it("hides the ranks at and above `shown`", () => {
    const { container } = render(<PixelPortrait rows={PORTRAIT} shown={4} />);
    expect(container.querySelectorAll("g[visibility='hidden']")).toHaveLength(
      12,
    );
  });

  it("is an image with a name when it has a label", () => {
    const { getByRole } = render(
      <PixelPortrait rows={PORTRAIT} label="Pixel portrait" />,
    );
    expect(getByRole("img", { name: "Pixel portrait" })).toBeInTheDocument();
  });
});
