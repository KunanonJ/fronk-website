import { act, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CountUp } from "@/components/ds/CountUp";
import { PixelNumber } from "@/components/profile/home/PixelNumber";
import { COUNT_MS } from "@/lib/motion/countUp";

/*
 * Count-ups (plan morph-count-up_PLAN_20-11-26) wait the way Reveal does: only
 * a figure below the fold, with motion allowed, waits at zero, then counts
 * once in view. The real figure is never touched: frames are drawn over it.
 */

type Callback = (entries: Array<{ isIntersecting: boolean }>) => void;
let observed: Callback | null = null;
let observedOptions: IntersectionObserverInit | undefined;

/** Calls back only until disconnected, as a real observer does. */
class FakeObserver {
  private connected = true;
  constructor(callback: Callback, options?: IntersectionObserverInit) {
    observed = (entries) => {
      if (this.connected) callback(entries);
    };
    observedOptions = options;
  }
  observe() {}
  disconnect() {
    this.connected = false;
  }
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

/** Places every element, HTML or SVG, at `top` px from the viewport's top. */
function placeAt(top: number) {
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
    top,
    bottom: top + 40,
    left: 0,
    right: 100,
    width: 100,
    height: 40,
    x: 0,
    y: top,
    toJSON: () => ({}),
  } as DOMRect);
}

/** Lets the count run for `ms`, frame by frame. */
function play(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

beforeEach(() => {
  observed = null;
  observedOptions = undefined;
  vi.stubGlobal("IntersectionObserver", FakeObserver);
  vi.useFakeTimers({
    toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"],
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("CountUp", () => {
  it("renders the real figure as its only text, from the server too", () => {
    const html = renderToString(<CountUp as="dd" value="1,000" />);
    expect(html).toBe('<dd class="ds-count">1,000</dd>');
  });

  it("below the fold, waits at zero, counts up in view, then shows the figure", () => {
    stubMotion(false);
    placeAt(5000);
    render(<CountUp value="THB 48,500" />);
    const figure = screen.getByText("THB 48,500");
    expect(figure).toHaveAttribute("data-shown", "THB 0");
    expect(observedOptions?.rootMargin).toBe("0px 0px -10% 0px");

    act(() => observed?.([{ isIntersecting: true }]));
    play(COUNT_MS / 3);
    const frame = figure.getAttribute("data-shown") ?? "";
    expect(frame).toMatch(/^THB \d{1,3}(,\d{3})*$/);
    expect(Number(frame.slice(4).replaceAll(",", ""))).toBeGreaterThan(0);
    expect(Number(frame.slice(4).replaceAll(",", ""))).toBeLessThan(48500);
    expect(figure).toHaveTextContent("THB 48,500");

    play(COUNT_MS);
    expect(figure).not.toHaveAttribute("data-shown");
    expect(figure).toHaveTextContent("THB 48,500");
  });

  it("does not count before the figure is in view", () => {
    stubMotion(false);
    placeAt(5000);
    render(<CountUp value="220+" />);
    act(() => observed?.([{ isIntersecting: false }]));
    play(COUNT_MS * 2);
    expect(screen.getByText("220+")).toHaveAttribute("data-shown", "0+");
  });

  it("leaves a figure already on screen alone", () => {
    stubMotion(false);
    placeAt(100);
    render(<CountUp value="1,000" />);
    expect(screen.getByText("1,000")).not.toHaveAttribute("data-shown");
  });

  it("does nothing under reduced motion, or for a value that is not one number", () => {
    stubMotion(true);
    placeAt(5000);
    render(<CountUp value="30%" />);
    expect(screen.getByText("30%")).not.toHaveAttribute("data-shown");

    vi.restoreAllMocks();
    stubMotion(false);
    placeAt(5000);
    render(<CountUp value="2019 to 2024" />);
    expect(screen.getByText("2019 to 2024")).not.toHaveAttribute("data-shown");
  });

  it("shows the figure for printing, and when it leaves the page", () => {
    stubMotion(false);
    placeAt(5000);
    render(<CountUp value="1,000" />);
    const figure = screen.getByText("1,000");
    expect(figure).toHaveAttribute("data-shown", "0");
    act(() => {
      window.dispatchEvent(new Event("beforeprint"));
    });
    expect(figure).not.toHaveAttribute("data-shown");
    // Printed once, it does not start counting afterwards.
    act(() => observed?.([{ isIntersecting: true }]));
    play(COUNT_MS / 3);
    expect(figure).not.toHaveAttribute("data-shown");

    const { unmount } = render(<CountUp value="220+" />);
    const other = screen.getByText("220+");
    expect(other).toHaveAttribute("data-shown", "0+");
    unmount();
    expect(other).not.toHaveAttribute("data-shown");
  });
});

describe("PixelNumber's count-up", () => {
  it("draws frames in its second path while the real drawing waits", () => {
    stubMotion(false);
    placeAt(5000);
    const { container } = render(<PixelNumber value="50+" />);
    const svg = container.querySelector("svg")!;
    const real = container.querySelector(".pf-pixel-number__figure")!;
    const count = container.querySelector(".pf-pixel-number__count")!;
    const drawing = real.getAttribute("d");
    expect(svg).toHaveAttribute("data-counting");
    expect(count.getAttribute("d")).toMatch(/^M/);

    act(() => observed?.([{ isIntersecting: true }]));
    play(COUNT_MS * 2);
    expect(svg).not.toHaveAttribute("data-counting");
    expect(count).not.toHaveAttribute("d");
    expect(real.getAttribute("d")).toBe(drawing);
    expect(container.querySelector(".sr-only")).toHaveTextContent("50+");
  });

  it("stays still on screen", () => {
    stubMotion(false);
    placeAt(100);
    const { container } = render(<PixelNumber value="50+" />);
    expect(container.querySelector("svg")).not.toHaveAttribute("data-counting");
  });
});
