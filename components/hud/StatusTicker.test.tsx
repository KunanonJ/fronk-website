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
