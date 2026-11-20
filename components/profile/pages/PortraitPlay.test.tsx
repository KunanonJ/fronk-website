import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PortraitPlay } from "@/components/profile/pages/PortraitPlay";

/*
 * The /about pixel portrait (owner, 20-11-26): "Try a trait" (or a press on
 * the portrait) puts on the next trait and remembers it; all six found turn
 * the outline gold; the pill dissolves to the photo and back (a cut under
 * reduced motion, as here).
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

const tryTrait = () =>
  screen.getByRole("button", { name: /^(Try a trait|Gold edition)/ });
const portrait = () => document.querySelector(".pf-about-page__pixels")!;
const gold = (svg: Element) =>
  svg.querySelectorAll('path[fill="#e3b341"]').length;

describe("PortraitPlay", () => {
  it("starts with no trait found", () => {
    render(<PortraitPlay />);
    expect(tryTrait()).toHaveAccessibleName("Try a trait · 0/6");
  });

  it("puts on the next trait, says so, and remembers it", () => {
    const { unmount } = render(<PortraitPlay />);
    act(() => fireEvent.click(tryTrait()));
    expect(
      screen.getByText("Shades. 1 of 6 traits found."),
    ).toBeInTheDocument();
    expect(tryTrait()).toHaveAccessibleName("Try a trait · 1/6");
    expect(JSON.parse(localStorage.getItem("pf-portrait-found")!)).toEqual([
      "shades",
    ]);
    unmount();
    render(<PortraitPlay />);
    expect(tryTrait()).toHaveAccessibleName("Try a trait · 1/6");
    // A press on the portrait does the same, for a pointer.
    act(() => fireEvent.click(portrait()));
    expect(tryTrait()).toHaveAccessibleName("Try a trait · 2/6");
  });

  it("turns gold once all six are found", () => {
    const { container } = render(<PortraitPlay />);
    const before = gold(container.querySelector("svg")!);
    for (let i = 0; i < 6; i += 1) act(() => fireEvent.click(tryTrait()));
    expect(tryTrait()).toHaveAccessibleName("Gold edition · 6/6");
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
    expect(portrait()).toHaveAttribute("hidden");
    act(() =>
      fireEvent.click(screen.getByRole("button", { name: "Show the pixels" })),
    );
    expect(portrait()).not.toHaveAttribute("hidden");
  });
});
