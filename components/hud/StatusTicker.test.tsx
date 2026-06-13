import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusTicker } from "./StatusTicker";

describe("StatusTicker > given items > renders a seamless marquee", () => {
  it("renders each item (duplicated once for the seamless loop)", () => {
    render(<StatusTicker items={["BUILDING GOGOCASH", "BKK"]} />);
    // Each item appears twice: the visible copy + an aria-hidden clone.
    expect(screen.getAllByText("BUILDING GOGOCASH")).toHaveLength(2);
    expect(screen.getAllByText("BKK")).toHaveLength(2);
  });
});

describe("StatusTicker > given no items > renders nothing", () => {
  it("returns null for an empty list (no empty bar)", () => {
    const { container } = render(<StatusTicker items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("StatusTicker > mints the numeric deltas", () => {
  it("wraps a figure in a mint, tabular-nums element — and only the figure", () => {
    render(<StatusTicker items={["1,000+ users earning cashback"]} />);
    // The marquee renders each item twice (seamless loop); take the first copy.
    const minted = screen.getAllByText("1,000+")[0]!;
    expect(minted.className).toContain("text-accent");
    expect(minted.className).toContain("tabular-nums");
    // Prose stays outside the mint span — only the number is tinted.
    expect(minted.textContent).toBe("1,000+");
  });

  it("mints a percentage token too", () => {
    render(<StatusTicker items={["up to 30% back"]} />);
    const minted = screen.getAllByText("30%")[0]!;
    expect(minted.textContent).toBe("30%");
    expect(minted.className).toContain("text-accent");
  });
});

describe("StatusTicker > the live ✦ mark breathes", () => {
  it("gives the ✦ glyph the hud-pulse animation", () => {
    const { container } = render(<StatusTicker items={["Building GoGoCash"]} />);
    const star = container.querySelector(".animate-hud-pulse");
    expect(star).not.toBeNull();
    expect(star?.textContent).toContain("✦");
  });
});
