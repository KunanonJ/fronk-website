import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PressPage, { pressSpans } from "@/components/landing/PressPage";

describe("pressSpans", () => {
  it("follows the canvas for one to four cards", () => {
    expect(pressSpans(0)).toEqual([]);
    expect(pressSpans(1)).toEqual([3]);
    expect(pressSpans(2)).toEqual([3, 3]);
    expect(pressSpans(3)).toEqual([3, 1, 1]);
    expect(pressSpans(4)).toEqual([2, 1, 1, 2]);
  });

  it("repeats the four-card pattern and closes the last row", () => {
    expect(pressSpans(5)).toEqual([2, 1, 1, 2, 3]);
    expect(pressSpans(6)).toEqual([2, 1, 1, 2, 2, 1]);
    expect(pressSpans(7)).toEqual([2, 1, 1, 2, 1, 1, 1]);
    expect(pressSpans(8)).toEqual([2, 1, 1, 2, 2, 1, 1, 2]);
  });
});

describe("PressPage", () => {
  it("draws the canvas hero from the press copy", () => {
    render(<PressPage type="all" onTypeChange={() => {}} />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent("Selected coverage and mentions.");
    expect(h1.className).toMatch(/kj-lines/);
    expect(
      screen.getByText("Click through to read the full piece."),
    ).toBeInTheDocument();
  });

  it("shows every item with its type, date and an external link", () => {
    render(<PressPage type="all" onTypeChange={() => {}} />);
    const cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(4);
    expect(screen.getByText("Showing 4 of 4")).toBeInTheDocument();
    expect(cards[0]?.className).toMatch(/min-\[641px\]:col-span-2/);
    expect(cards[0]?.className).not.toMatch(/lg:col-span-3/);
    const first = cards[0]!;
    expect(first).toHaveTextContent("Feature");
    expect(first).toHaveTextContent("09/07/2026");
    const view = screen.getAllByRole("link", { name: "View on gogocash.co →" });
    expect(view[0]).toHaveAttribute("target", "_blank");
    expect(view[0]).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("filters by type, full width for two cards", () => {
    render(<PressPage type="product" onTypeChange={() => {}} />);
    const cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(2);
    for (const card of cards) {
      expect(card.className).toMatch(/lg:col-span-3/);
      expect(card).toHaveTextContent("Product");
    }
    expect(screen.getByText("Showing 2 of 4")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Product · 2" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("reports a picked type", () => {
    const onTypeChange = vi.fn();
    render(<PressPage type="all" onTypeChange={onTypeChange} />);
    const group = screen.getByRole("group", {
      name: "Filter coverage by type",
    });
    expect(
      Array.from(group.querySelectorAll("button")).map((b) => b.textContent),
    ).toEqual(["All · 4", "Feature · 1", "Product · 2", "Profile · 1"]);
    fireEvent.click(screen.getByRole("button", { name: "Profile · 1" }));
    expect(onTypeChange).toHaveBeenCalledWith("profile");
  });
});
