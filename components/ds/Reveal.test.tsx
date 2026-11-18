import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Reveal } from "@/components/ds/Reveal";

/*
 * Reveal must never hide what a reader can already see: content is visible
 * from the server, and only an element below the fold waits for the
 * observer, and only when motion is allowed.
 */

type Callback = (entries: Array<{ isIntersecting: boolean }>) => void;
let observed: Callback | null = null;
let observedOptions: IntersectionObserverInit | undefined;

class FakeObserver {
  constructor(callback: Callback, options?: IntersectionObserverInit) {
    observed = callback;
    observedOptions = options;
  }
  observe() {}
  disconnect() {}
}

function stubMotion(reduce: boolean) {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches: reduce && query.includes("reduce"),
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      }) as unknown as MediaQueryList,
  );
}

/** Places every element at `top` px from the top of the viewport. */
function placeAt(top: number) {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    top,
    bottom: top + 100,
    left: 0,
    right: 100,
    width: 100,
    height: 100,
    x: 0,
    y: top,
    toJSON: () => ({}),
  } as DOMRect);
}

beforeEach(() => {
  observed = null;
  observedOptions = undefined;
  vi.stubGlobal("IntersectionObserver", FakeObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("Reveal", () => {
  it("waits below the fold, then shows on entering view", () => {
    stubMotion(false);
    placeAt(5000);
    render(<Reveal>Below the fold</Reveal>);
    const box = screen.getByText("Below the fold");
    expect(box).toHaveClass("is-pending");
    act(() => observed?.([{ isIntersecting: true }]));
    expect(box).not.toHaveClass("is-pending");
  });

  it("leaves content already in view alone", () => {
    stubMotion(false);
    placeAt(100);
    render(<Reveal>On screen</Reveal>);
    expect(screen.getByText("On screen")).not.toHaveClass("is-pending");
  });

  it("does nothing under reduced motion", () => {
    stubMotion(true);
    placeAt(5000);
    render(<Reveal>Still</Reveal>);
    expect(screen.getByText("Still")).not.toHaveClass("is-pending");
  });

  it("does nothing without IntersectionObserver", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    stubMotion(false);
    placeAt(5000);
    render(<Reveal>Old browser</Reveal>);
    expect(screen.getByText("Old browser")).not.toHaveClass("is-pending");
  });

  it("never holds back an h1", () => {
    stubMotion(false);
    placeAt(5000);
    render(
      <Reveal>
        <h1>Hi, I’m Kunanon Jarat.</h1>
      </Reveal>,
    );
    expect(
      screen.getByRole("heading", { level: 1 }).parentElement,
    ).not.toHaveClass("is-pending");
  });

  it("carries the rise, the scale variant and the delay to CSS", () => {
    stubMotion(false);
    placeAt(100);
    render(
      <Reveal variant="scale" rise={12} delay={150}>
        Footer
      </Reveal>,
    );
    const box = screen.getByText("Footer");
    expect(box).toHaveAttribute("data-reveal", "scale");
    expect(box.style.getPropertyValue("--reveal-rise")).toBe("12px");
    expect(box.style.transitionDelay).toBe("150ms");
  });

  it("counts any visible pixel, so a block at the page end or taller than the screen still shows", () => {
    stubMotion(false);
    placeAt(5000);
    render(<Reveal>Last row</Reveal>);
    const threshold = observedOptions?.threshold ?? 0;
    expect(Array.isArray(threshold) ? Math.min(...threshold) : threshold).toBe(
      0,
    );
    expect(observedOptions?.rootMargin ?? "0px").not.toMatch(/-/);
  });
});
