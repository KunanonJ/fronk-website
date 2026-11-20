import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PortraitPlay } from "@/components/profile/pages/PortraitPlay";

/*
 * The /about pixel portrait (owner, 20-11-26): a press tries the next trait
 * and remembers it; all six found turn the outline gold; the pill dissolves to
 * the photo and back (a cut under reduced motion, as here).
 */
beforeEach(() => {
  localStorage.clear();
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches: query.includes("reduce"),
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      }) as unknown as MediaQueryList,
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

const portrait = () =>
  screen.getByRole("button", { name: /^Pixel portrait: try a trait/ });
const gold = (svg: Element) =>
  svg.querySelectorAll('path[fill="#e3b341"]').length;

describe("PortraitPlay", () => {
  it("starts with no trait found", () => {
    render(<PortraitPlay />);
    expect(portrait()).toHaveAccessibleName(
      "Pixel portrait: try a trait (0 of 6 found)",
    );
    expect(screen.getByText("0/6 traits")).toBeInTheDocument();
  });

  it("puts on the next trait, says so, and remembers it", () => {
    const { unmount } = render(<PortraitPlay />);
    act(() => fireEvent.click(portrait()));
    expect(
      screen.getByText("Shades. 1 of 6 traits found."),
    ).toBeInTheDocument();
    expect(screen.getByText("1/6 traits")).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("pf-portrait-found")!)).toEqual([
      "shades",
    ]);
    unmount();
    render(<PortraitPlay />);
    expect(screen.getByText("1/6 traits")).toBeInTheDocument();
  });

  it("turns gold once all six are found", () => {
    const { container } = render(<PortraitPlay />);
    const svg = container.querySelector("svg")!;
    const before = gold(svg);
    for (let i = 0; i < 6; i += 1) act(() => fireEvent.click(portrait()));
    expect(screen.getByText("Gold edition")).toBeInTheDocument();
    expect(
      screen.getByText("All six traits found: the gold edition."),
    ).toBeInTheDocument();
    expect(gold(container.querySelector("svg")!)).toBeGreaterThan(before);
  });

  it("shows the photo and the pixels again", () => {
    render(<PortraitPlay />);
    act(() =>
      fireEvent.click(screen.getByRole("button", { name: "Show the photo" })),
    );
    expect(document.querySelector(".pf-about-page__pixels")).toHaveAttribute(
      "hidden",
    );
    act(() =>
      fireEvent.click(screen.getByRole("button", { name: "Show the pixels" })),
    );
    expect(portrait()).toBeVisible();
  });
});
