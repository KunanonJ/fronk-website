import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WorkTogetherPanel } from "@/components/profile/case/WorkTogetherPanel";

/*
 * The end of a case study (now-building-and-genz Phase 3): a reader who
 * scrolls down to the Work together panel finds the Gold glasses; a page
 * that has not scrolled (one opened on it, a full-page capture) finds none.
 */

let report: (entries: Partial<IntersectionObserverEntry>[]) => void = () => {};
const disconnect = vi.fn();

beforeEach(() => {
  localStorage.clear();
  disconnect.mockClear();
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: IntersectionObserverCallback) {
        report = (entries) =>
          callback(
            entries as IntersectionObserverEntry[],
            this as unknown as IntersectionObserver,
          );
      }
      observe() {}
      disconnect = disconnect;
    },
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  window.scrollY = 0;
});

const found = () =>
  JSON.parse(localStorage.getItem("pf-portrait-found") ?? "[]") as string[];

describe("WorkTogetherPanel, the Gold glasses", () => {
  it("keeps its name and links", () => {
    render(<WorkTogetherPanel />);
    expect(
      screen.getByRole("article", { name: "Work together" }),
    ).toBeInTheDocument();
  });

  it("finds nothing before the page has scrolled", async () => {
    render(<WorkTogetherPanel />);
    window.scrollY = 0;
    report([{ isIntersecting: true }]);
    await new Promise((done) => setTimeout(done, 20));
    expect(found()).toEqual([]);
    expect(disconnect).not.toHaveBeenCalled();
  });

  it("finds the Gold glasses once a reader scrolls down to it", async () => {
    render(<WorkTogetherPanel />);
    window.scrollY = 2400;
    report([{ isIntersecting: false }]);
    expect(disconnect).not.toHaveBeenCalled();
    report([{ isIntersecting: true }]);
    expect(disconnect).toHaveBeenCalled();
    await vi.waitFor(() => expect(found()).toEqual(["glasses"]));
  });
});
