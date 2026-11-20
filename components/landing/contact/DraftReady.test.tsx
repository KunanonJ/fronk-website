import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DraftReady from "@/components/landing/contact/DraftReady";

/*
 * The contact form's Ready moment (now-building-and-genz Phase 3): a pixel
 * burst and a "Draft ready" stamp, then the Lapel pin is found. Under
 * reduced motion, the stamp and the pin only.
 */

function motion(reduced: boolean) {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches: reduced && query.includes("reduce"),
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      }) as unknown as MediaQueryList,
  );
}

const found = () =>
  JSON.parse(localStorage.getItem("pf-portrait-found") ?? "[]") as string[];

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("DraftReady", () => {
  it("bursts beside the stamp, then finds the Lapel pin", () => {
    motion(false);
    render(<DraftReady />);
    expect(screen.getByText("Draft ready")).toHaveClass("pf-ready-stamp");
    expect(screen.getByTestId("ready-pixels").children.length).toBeGreaterThan(
      10,
    );
    expect(found()).toEqual([]);
    act(() => {
      vi.advanceTimersByTime(620);
    });
    expect(screen.queryByTestId("ready-pixels")).toBeNull();
    expect(found()).toEqual(["pin"]);
  });

  it("under reduced motion: no burst, the stamp, and the pin", () => {
    motion(true);
    render(<DraftReady />);
    expect(screen.queryByTestId("ready-pixels")).toBeNull();
    expect(screen.getByText("Draft ready")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(0);
    });
    expect(found()).toEqual(["pin"]);
  });
});
