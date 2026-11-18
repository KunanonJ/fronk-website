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
  it("draws the hero from the press copy, on the pixel sky", () => {
    render(<PressPage type="all" onTypeChange={() => {}} />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent("Selected coverage and mentions.");
    expect(h1).toHaveClass("t-display");
    expect(h1.closest("section")).toHaveClass("pf-page-hero");
    expect(
      screen.getByText("Click through to read the full piece."),
    ).toBeInTheDocument();
  });

  it("shows every item with its type, date and an external link", () => {
    render(<PressPage type="all" onTypeChange={() => {}} />);
    const cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(4);
    expect(screen.getByText("Showing 4 of 4")).toBeInTheDocument();
    // The canvas's spans, laid out by pages-catalog.css.
    expect(cards.map((card) => card.getAttribute("data-span"))).toEqual([
      "2",
      "1",
      "1",
      "2",
    ]);
    const first = cards[0]!;
    expect(first).toHaveTextContent("Feature");
    expect(first).toHaveTextContent("09/07/2026");
    // The arrow is drawn, not read (spec 12 item 18).
    const view = screen.getAllByRole("link", { name: "View on gogocash.co" });
    expect(view[0]).toHaveTextContent(/^View on gogocash\.co\s*→$/);
    expect(view[0]).toHaveAttribute("target", "_blank");
    expect(view[0]).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("filters by type, full width for two cards", () => {
    render(<PressPage type="product" onTypeChange={() => {}} />);
    const cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(2);
    for (const card of cards) {
      expect(card).toHaveAttribute("data-span", "3");
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
