import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DitherField } from "@/components/ds/DitherField";
import { PixelArt, pixelBeats } from "@/components/profile/site/PixelArt";

/*
 * The one-time moments on reveal (plan dither-print-in_PLAN_20-11-26): a
 * dither field or a footer drawing still below the fold waits, then plays
 * once in view; on screen, under reduced motion or for printing it is simply
 * there.
 */

type Callback = (entries: Array<{ isIntersecting: boolean }>) => void;
let observed: Callback | null = null;

/** Calls back only until disconnected, as a real observer does. */
class FakeObserver {
  private connected = true;
  constructor(callback: Callback) {
    observed = (entries) => {
      if (this.connected) callback(entries);
    };
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
    bottom: top + 200,
    left: 0,
    right: 400,
    width: 400,
    height: 200,
    x: 0,
    y: top,
    toJSON: () => ({}),
  } as DOMRect);
}

beforeEach(() => {
  observed = null;
  vi.stubGlobal("IntersectionObserver", FakeObserver);
  // jsdom has no canvas: the field skips its drawing, as it does with none.
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("DitherField's print-in", () => {
  const canvasOf = (container: HTMLElement) =>
    container.querySelector("canvas")!;

  it("below the fold, waits, prints in once in view, then is still", () => {
    stubMotion(false);
    placeAt(5000);
    const { container } = render(<DitherField />);
    const canvas = canvasOf(container);
    expect(canvas).toHaveAttribute("data-print", "wait");

    act(() => observed?.([{ isIntersecting: true }]));
    expect(canvas).toHaveAttribute("data-print", "run");
    act(() => {
      vi.advanceTimersByTime(8 * 90);
    });
    expect(canvas).not.toHaveAttribute("data-print");
  });

  it("does not start before the field is in view", () => {
    stubMotion(false);
    placeAt(5000);
    const { container } = render(<DitherField />);
    act(() => observed?.([{ isIntersecting: false }]));
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(canvasOf(container)).toHaveAttribute("data-print", "wait");
  });

  it("simply draws on screen, under reduced motion, or with no box", () => {
    stubMotion(false);
    placeAt(100);
    expect(canvasOf(render(<DitherField />).container)).not.toHaveAttribute(
      "data-print",
    );

    vi.restoreAllMocks();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    stubMotion(true);
    placeAt(5000);
    expect(canvasOf(render(<DitherField />).container)).not.toHaveAttribute(
      "data-print",
    );
  });

  it("stops waiting for printing and when it leaves the page", () => {
    stubMotion(false);
    placeAt(5000);
    const first = canvasOf(render(<DitherField />).container);
    act(() => {
      window.dispatchEvent(new Event("beforeprint"));
    });
    expect(first).not.toHaveAttribute("data-print");

    const { container, unmount } = render(<DitherField />);
    const second = canvasOf(container);
    expect(second).toHaveAttribute("data-print", "wait");
    unmount();
    expect(second).not.toHaveAttribute("data-print");
  });
});

describe("pixelBeats", () => {
  const rows = ["kkkkk", "kcawk", "kgggk", "kwwkk", "kkkkk"];

  it("prints the paper and frame first, then the content, then the rest", () => {
    const beats = pixelBeats(rows);
    // Cells in reading order: row 1 is k c a w k, row 2 k g g g k.
    const frame = beats[0]!;
    const light = beats[6]!;
    const content = beats[11]!;
    const inside = beats[18]!;
    expect(frame.blink).toBe(false);
    expect(frame.delay).toBeLessThan(content.delay);
    expect(content.delay).toBeLessThan(light.delay);
    expect(light.blink).toBe(true);
    expect(inside.delay).toBe(light.delay);
    expect(inside.blink).toBe(false);
  });

  it("ends well inside the spec's 3 s, the blink included", () => {
    const longest = Math.max(
      ...pixelBeats(rows).map((beat) => beat.delay + (beat.blink ? 300 : 1)),
    );
    expect(longest).toBeLessThan(3000);
  });
});

describe("PixelArt's play", () => {
  const rows = ["kkk", "kak", "kkk"];

  it("below the fold, waits hidden, then plays every square once in view", () => {
    stubMotion(false);
    placeAt(5000);
    const animate = vi.fn();
    Object.defineProperty(window.SVGElement.prototype, "animate", {
      value: animate,
      configurable: true,
    });
    const { container } = render(<PixelArt rows={rows} play />);
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("data-wait");
    expect(animate).not.toHaveBeenCalled();

    act(() => observed?.([{ isIntersecting: true }]));
    expect(svg).not.toHaveAttribute("data-wait");
    // Nine squares, and the accent light blinks: one more.
    expect(animate).toHaveBeenCalledTimes(10);
    delete (window.SVGElement.prototype as { animate?: unknown }).animate;
  });

  it("is simply there without play, under reduced motion, or without the Web Animations API", () => {
    stubMotion(false);
    placeAt(5000);
    expect(
      render(<PixelArt rows={rows} />).container.querySelector("svg"),
    ).not.toHaveAttribute("data-wait");
    // jsdom has no Element.animate: nothing waits that could not play.
    expect(
      render(<PixelArt rows={rows} play />).container.querySelector("svg"),
    ).not.toHaveAttribute("data-wait");
  });
});
