import { act, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CanvasInk, {
  FADE_MS,
  MAX_STICKERS,
  freeSpot,
  strokePath,
  type CanvasInkApi,
} from "@/components/profile/home/CanvasInk";
import type {
  CanvasInkColour,
  CanvasTool,
} from "@/components/profile/home/CanvasToolbar";

/*
 * The hero canvas's drawing layer (now-building-and-genz Phase 4): the Pen's
 * strokes fade after about 4 s, but not under reduced motion or while the
 * hero's motion is paused; stickers stamp at the pointer or, from the
 * keyboard, at a free spot, cycle through the set and cap at 24; the first
 * finds the Headphones trait; Clear empties it all; under Move nothing is
 * caught.
 */

const store = vi.hoisted(() => ({ award: vi.fn(() => true) }));
vi.mock("@/lib/brand/traitStore", () => store);

/** The layer is 500 x 400 px, at the page's top left. */
function renderInk({
  tool = "pen",
  ink = "violet",
  still = false,
}: { tool?: CanvasTool; ink?: CanvasInkColour; still?: boolean } = {}) {
  const onCount = vi.fn();
  const say = vi.fn();
  let api: CanvasInkApi | null = null;
  const onReady = (next: CanvasInkApi | null) => {
    api = next;
  };
  const props = { onCount, say, onReady };
  const view = render(
    <CanvasInk tool={tool} ink={ink} still={still} {...props} />,
  );
  const layer = view.container.querySelector<HTMLElement>(".pf-ink")!;
  vi.spyOn(layer, "getBoundingClientRect").mockReturnValue({
    left: 0,
    top: 0,
    width: 500,
    height: 400,
  } as DOMRect);
  return {
    ...view,
    layer,
    onCount,
    say,
    api: () => api!,
    rerenderWith: (next: {
      tool?: CanvasTool;
      ink?: CanvasInkColour;
      still?: boolean;
    }) =>
      view.rerender(
        <CanvasInk
          tool={next.tool ?? tool}
          ink={next.ink ?? ink}
          still={next.still ?? still}
          {...props}
        />,
      ),
  };
}

function draw(layer: HTMLElement, points: readonly [number, number][]) {
  const [first, ...rest] = points;
  fireEvent.pointerDown(layer, {
    button: 0,
    clientX: first![0],
    clientY: first![1],
  });
  for (const [clientX, clientY] of rest)
    fireEvent.pointerMove(layer, { clientX, clientY });
  const [clientX, clientY] = points.at(-1)!;
  fireEvent.pointerUp(layer, { clientX, clientY });
}

/** The strokes drawn, not the one being drawn (which has no `d` at rest). */
const strokes = (layer: HTMLElement) =>
  [...layer.querySelectorAll(".pf-ink__stroke")].filter((path) =>
    path.hasAttribute("d"),
  );

const stickers = (layer: HTMLElement) => [
  ...layer.querySelectorAll<HTMLElement>(".pf-sticker"),
];

function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  store.award.mockClear();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("strokePath", () => {
  it("draws one point as a dot and more as midpoint curves", () => {
    expect(strokePath([])).toBe("");
    expect(strokePath([[10, 20]])).toBe("M10.0 20.0L10.0 20.0");
    expect(
      strokePath([
        [0, 0],
        [10, 10],
        [20, 0],
        [30, 10],
      ]),
    ).toBe("M0.0 0.0Q10.0 10.0 15.0 5.0Q20.0 0.0 25.0 5.0L30.0 10.0");
  });
});

describe("freeSpot", () => {
  it("takes the best spot first, then the one farthest from every sticker", () => {
    expect(freeSpot([])).toEqual([84, 76]);
    expect(freeSpot([{ x: 84, y: 76 }])).toEqual([13, 62]);
    // A sticker by the second spot: the third is the farthest from both.
    expect(
      freeSpot([
        { x: 84, y: 76 },
        { x: 13, y: 62 },
      ]),
    ).toEqual([50, 8]);
  });

  it("nudges a taken spot once every spot has a sticker", () => {
    const all = [
      [84, 76],
      [13, 62],
      [50, 8],
      [73, 64],
      [32, 8],
      [90, 92],
      [66, 8],
      [22, 78],
    ].map(([x, y]) => ({ x: x!, y: y! }));
    expect(freeSpot(all)).toEqual([81, 73]);
  });
});

describe("CanvasInk", () => {
  it("draws a smooth stroke in the ink with the Pen, and it fades after about 4 s", () => {
    const { layer, onCount } = renderInk({ ink: "coral" });
    expect(layer).toHaveAttribute("data-tool", "pen");
    expect(layer).toHaveAttribute("aria-hidden", "true");
    draw(layer, [
      [10, 10],
      [60, 40],
      [120, 80],
      [200, 120],
    ]);
    const [stroke] = strokes(layer);
    expect(strokes(layer)).toHaveLength(1);
    expect(stroke).toHaveAttribute("data-ink", "coral");
    expect(stroke).toHaveAttribute("data-fade");
    // The pointer's px on a 1000 x 1000 grid, smoothed by curves.
    expect(stroke!.getAttribute("d")).toMatch(/^M20\.0 25\.0Q/);
    expect(onCount).toHaveBeenLastCalledWith(1);

    advance(FADE_MS - 1);
    expect(strokes(layer)).toHaveLength(1);
    advance(1);
    expect(strokes(layer)).toHaveLength(0);
    expect(onCount).toHaveBeenLastCalledWith(0);
  });

  it("keeps the strokes under reduced motion or a paused hero, until Clear or motion again", () => {
    const view = renderInk({ still: true });
    draw(view.layer, [
      [10, 10],
      [80, 60],
    ]);
    draw(view.layer, [
      [300, 300],
      [320, 260],
    ]);
    expect(strokes(view.layer)).toHaveLength(2);
    expect(strokes(view.layer)[0]).not.toHaveAttribute("data-fade");
    advance(60_000);
    expect(strokes(view.layer)).toHaveLength(2);

    // Motion again (the hero's toggle played): they fade from then on.
    view.rerenderWith({ still: false });
    expect(strokes(view.layer)[0]).toHaveAttribute("data-fade");
    advance(FADE_MS);
    expect(strokes(view.layer)).toHaveLength(0);

    // Paused again mid-fade: held.
    draw(view.layer, [
      [10, 10],
      [80, 60],
    ]);
    advance(FADE_MS - 500);
    view.rerenderWith({ still: true });
    advance(60_000);
    expect(strokes(view.layer)).toHaveLength(1);

    act(() => view.api().clear());
    expect(strokes(view.layer)).toHaveLength(0);
    expect(view.say).toHaveBeenLastCalledWith("Canvas cleared");
    expect(view.onCount).toHaveBeenLastCalledWith(0);
  });

  it("stamps a sticker where the pointer clicks, through the set in turn", () => {
    const { layer, say } = renderInk({ tool: "stickers" });
    expect(layer).toHaveAttribute("data-tool", "stickers");
    const kinds: string[] = [];
    for (let at = 0; at < 6; at += 1) {
      fireEvent.click(layer, { clientX: 250, clientY: 100 });
      kinds.push(stickers(layer).at(-1)!.getAttribute("data-kind")!);
    }
    expect(kinds).toEqual(["ship", "heart", "gm", "w", "star", "ship"]);
    const [first, heart] = stickers(layer);
    expect(first).toHaveTextContent("ship it");
    expect(first!.style.left).toBe("50%");
    expect(first!.style.top).toBe("25%");
    expect(heart!.querySelector("svg path[data-cell='a']")).not.toBeNull();
    expect(say).toHaveBeenNthCalledWith(1, "Sticker placed: ship it");
    expect(say).toHaveBeenNthCalledWith(2, "Sticker placed: a heart");
    // Dragging with Stickers on draws nothing.
    draw(layer, [
      [10, 10],
      [90, 90],
    ]);
    expect(strokes(layer)).toHaveLength(0);
  });

  it("finds the Headphones trait with the first sticker, and asks only once", async () => {
    const { layer } = renderInk({ tool: "stickers" });
    fireEvent.click(layer, { clientX: 100, clientY: 100 });
    fireEvent.click(layer, { clientX: 200, clientY: 100 });
    act(() => {
      vi.advanceTimersByTime(0);
    });
    await vi.dynamicImportSettled();
    await vi.waitFor(() =>
      expect(store.award).toHaveBeenCalledWith("headphones", "canvas"),
    );
    expect(store.award).toHaveBeenCalledTimes(1);
  });

  it(`keeps ${MAX_STICKERS} stickers at most, the oldest going first`, () => {
    const { layer, onCount } = renderInk({ tool: "stickers" });
    for (let at = 0; at < MAX_STICKERS + 6; at += 1)
      fireEvent.click(layer, { clientX: 10 + at * 10, clientY: 50 });
    const left = stickers(layer);
    expect(left).toHaveLength(MAX_STICKERS);
    // The first six went: the seventh (a heart, at 70 px) is the oldest.
    expect(left[0]!.style.left).toBe("14%");
    expect(left[0]).toHaveAttribute("data-kind", "heart");
    expect(onCount).toHaveBeenLastCalledWith(MAX_STICKERS);
  });

  it("stamps from the keyboard at free spots, and pops only while things may move", () => {
    const moving = renderInk({ tool: "stickers" });
    act(() => moving.api().stamp());
    act(() => moving.api().stamp());
    const [one, two] = stickers(moving.layer);
    expect([one!.style.left, one!.style.top]).toEqual(["84%", "76%"]);
    expect([two!.style.left, two!.style.top]).toEqual(["13%", "62%"]);
    // Only the newest pops, with a burst of pixels.
    expect(one).not.toHaveAttribute("data-pop");
    expect(two).toHaveAttribute("data-pop");
    expect(two!.querySelectorAll(".intro-pixel").length).toBeGreaterThan(0);
    moving.unmount();

    const still = renderInk({ tool: "stickers", still: true });
    act(() => still.api().stamp());
    expect(stickers(still.layer)[0]).not.toHaveAttribute("data-pop");
    expect(still.layer.querySelector(".intro-pixel")).toBeNull();
  });

  it("lets the pointer through under Move: nothing drawn, nothing stamped", () => {
    const { layer, onCount } = renderInk({ tool: "move" });
    expect(layer).not.toHaveAttribute("data-tool");
    draw(layer, [
      [10, 10],
      [90, 90],
    ]);
    fireEvent.click(layer, { clientX: 100, clientY: 100 });
    expect(strokes(layer)).toHaveLength(0);
    expect(stickers(layer)).toHaveLength(0);
    expect(onCount).toHaveBeenLastCalledWith(0);
  });

  it("drops a stroke when the Pen is put down mid-stroke", () => {
    const view = renderInk();
    fireEvent.pointerDown(view.layer, { button: 0, clientX: 10, clientY: 10 });
    fireEvent.pointerMove(view.layer, { clientX: 80, clientY: 80 });
    view.rerenderWith({ tool: "move" });
    fireEvent.pointerUp(view.layer, { clientX: 90, clientY: 90 });
    expect(strokes(view.layer)).toHaveLength(0);
  });
});
