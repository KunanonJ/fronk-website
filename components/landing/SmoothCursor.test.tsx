import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render } from "@testing-library/react";
import SmoothCursor from "@/components/landing/SmoothCursor";

/** Manual rAF queue so the test controls every frame. */
let frames: FrameRequestCallback[] = [];

function flushFrame(): boolean {
  const pending = frames;
  frames = [];
  act(() => {
    pending.forEach((cb) => cb(performance.now()));
  });
  return frames.length > 0;
}

describe("SmoothCursor", () => {
  let elementFromPoint: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    frames = [];
    vi.stubGlobal(
      "matchMedia",
      vi.fn((query: string) => ({
        matches: query.includes("pointer: fine"),
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      })),
    );
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      frames.push(cb);
      return frames.length;
    });
    vi.stubGlobal("cancelAnimationFrame", () => {
      frames = [];
    });
    elementFromPoint = vi.fn(() => null);
    document.elementFromPoint =
      elementFromPoint as typeof document.elementFromPoint;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("schedules no frames until the pointer moves", () => {
    render(<SmoothCursor />);
    expect(frames).toHaveLength(0);
  });

  it("stops its animation loop once the cursor settles", () => {
    const { container } = render(<SmoothCursor />);
    fireEvent.pointerMove(window, { clientX: 400, clientY: 300 });
    expect(frames).toHaveLength(1);

    let ticks = 0;
    while (flushFrame()) {
      ticks += 1;
      expect(ticks).toBeLessThan(60);
    }

    expect(frames).toHaveLength(0);
    const node = container.querySelector(".smooth-cursor") as HTMLElement;
    expect(node.style.transform).toContain("translate3d(400px, 300px, 0)");
  });

  it("hit-tests at most once per frame, however many moves arrive", () => {
    render(<SmoothCursor />);
    fireEvent.pointerMove(window, { clientX: 10, clientY: 10 });
    fireEvent.pointerMove(window, { clientX: 20, clientY: 20 });
    fireEvent.pointerMove(window, { clientX: 30, clientY: 30 });
    expect(elementFromPoint).not.toHaveBeenCalled();
    expect(frames).toHaveLength(1);

    flushFrame();
    expect(elementFromPoint).toHaveBeenCalledTimes(1);
    expect(elementFromPoint).toHaveBeenCalledWith(30, 30);
  });

  it("restarts the loop on the next move after settling", () => {
    render(<SmoothCursor />);
    fireEvent.pointerMove(window, { clientX: 50, clientY: 50 });
    while (flushFrame()) {
      /* settle */
    }
    expect(frames).toHaveLength(0);

    fireEvent.pointerMove(window, { clientX: 60, clientY: 50 });
    expect(frames).toHaveLength(1);
  });
});
