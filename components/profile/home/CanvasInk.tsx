import {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  type CSSProperties,
  type MouseEvent,
  type PointerEvent,
} from "react";
import type {
  CanvasInkColour,
  CanvasTool,
} from "@/components/profile/home/CanvasToolbar";
import {
  burstPixels,
  type BurstPixel,
} from "@/components/profile/site/secrets/burst";
import { canvasToolsCopy } from "@/lib/content/canvasTools";
import inkCss from "@/src/styles/canvas-tools.css?url";

/*
 * The hero canvas's drawing layer (now-building-and-genz Phase 4), loaded by
 * CanvasMock the first time its toolbar is reached for, with its stylesheet
 * (src/styles/canvas-tools.css). It lies over the frames and under the
 * panels, and takes the pointer only while the Pen or Stickers is on, so
 * under Move the frame links work as ever and nothing drawn is in the way.
 *
 * The Pen draws smooth strokes in the chosen ink that fade after about 4 s;
 * under reduced motion, or while the hero's motion toggle is paused, they do
 * not fade and stay until Clear. Freehand drawing is pointer-only by nature:
 * a stroke is the path the pointer takes, the exception WCAG 2.1.1 makes for
 * path-dependent input, and the layer is decoration (aria-hidden). Stickers
 * have a keyboard path: the Stickers button pressed again stamps one at a
 * free spot (CanvasMock calls `stamp`), and the live line names it. The
 * first sticker ever stamped finds the Headphones trait.
 */

/** A stroke is gone after this many ms; the fade is its last part. */
export const FADE_MS = 4000;
/** The most stickers at once: the oldest goes first. */
export const MAX_STICKERS = 24;

/** The stickers, in the order they are stamped. */
const KINDS = ["ship", "heart", "gm", "w", "star"] as const;
type StickerKind = (typeof KINDS)[number];

/** Each sticker leans its own way, by its number. */
const TILTS = [-8, 6, -4, 9, -6, 4] as const;

/**
 * Where a sticker stamped from the keyboard goes, in % of the canvas, best
 * first: dotted ground clear of the panels, the comment and the toolbar.
 */
const SPOTS = [
  [84, 76],
  [13, 62],
  [50, 8],
  [73, 64],
  [32, 8],
  [90, 92],
  [66, 8],
  [22, 78],
] as const;

/** Pixel stickers: k is the outline, a the ink, w a highlight. */
const ART: Record<"heart" | "star", readonly string[]> = {
  heart: [
    ".kkk...kkk.",
    "kaaak.kaaak",
    "kawaakaaaak",
    "kaaaaaaaaak",
    "kaaaaaaaaak",
    ".kaaaaaaak.",
    "..kaaaaak..",
    "...kaaak...",
    "....kak....",
    ".....k.....",
  ],
  star: [
    ".....k.....",
    "....kak....",
    "....kak....",
    "kkkkaaakkkk",
    "kaaaaaaaaak",
    ".kaaawaaak.",
    "..kaaaaak..",
    "..kaaaaak..",
    ".kaakkkaak.",
    ".kak...kak.",
    ".kk.....kk.",
  ],
};

/** A drawing as one path per colour of cell. */
function artPaths(rows: readonly string[]): [cell: string, d: string][] {
  const paths = new Map<string, string>();
  rows.forEach((row, y) =>
    [...row].forEach((cell, x) => {
      if (cell !== ".") {
        paths.set(cell, `${paths.get(cell) ?? ""}M${x} ${y}h1v1h-1z`);
      }
    }),
  );
  return [...paths];
}

const ART_PATHS = {
  heart: artPaths(ART.heart),
  star: artPaths(ART.star),
};

export type Point = readonly [x: number, y: number];

const fixed = ([x, y]: Point) => `${x.toFixed(1)} ${y.toFixed(1)}`;

/**
 * A smooth path through the points: quadratic curves from midpoint to
 * midpoint, each point their control. One point is a dot.
 */
export function strokePath(points: readonly Point[]): string {
  const [first, ...rest] = points;
  if (!first) return "";
  if (rest.length === 0) return `M${fixed(first)}L${fixed(first)}`;
  let d = `M${fixed(first)}`;
  for (let at = 0; at < rest.length - 1; at += 1) {
    const [x, y] = rest[at]!;
    const [nx, ny] = rest[at + 1]!;
    d += `Q${fixed([x, y])} ${fixed([(x + nx) / 2, (y + ny) / 2])}`;
  }
  return `${d}L${fixed(rest.at(-1)!)}`;
}

interface Stroke {
  readonly id: number;
  readonly d: string;
  readonly ink: CanvasInkColour;
}

interface Sticker {
  readonly id: number;
  readonly kind: StickerKind;
  /** Its centre, in % of the canvas. */
  readonly x: number;
  readonly y: number;
  readonly ink: CanvasInkColour;
}

interface Marks {
  readonly strokes: readonly Stroke[];
  readonly stickers: readonly Sticker[];
  /** The next mark's number. */
  readonly next: number;
  /** Stickers stamped so far: the next one's kind. */
  readonly turn: number;
  /** What the live line says next (a new object each time). */
  readonly news: { readonly text: string } | null;
  /** The newest sticker's burst, while motion is allowed. */
  readonly pop: { readonly id: number; readonly pixels: BurstPixel[] } | null;
}

type Action =
  | { type: "stroke"; d: string; ink: CanvasInkColour }
  | { type: "fade"; id: number }
  | {
      type: "stamp";
      /** Where the pointer pressed; none from the keyboard. */
      at: Point | null;
      ink: CanvasInkColour;
      pixels: BurstPixel[];
    }
  | { type: "clear" };

const NOTHING: Marks = {
  strokes: [],
  stickers: [],
  next: 0,
  turn: 0,
  news: null,
  pop: null,
};

/**
 * The spot farthest from every sticker; once each is taken, the best one a
 * little up and to the left for every round of them.
 */
export function freeSpot(stickers: readonly Pick<Sticker, "x" | "y">[]): Point {
  let best: Point = SPOTS[0];
  let room = -1;
  for (const spot of SPOTS) {
    const near = stickers.reduce(
      // Across is worth more: the canvas is wider than it is tall.
      (min, s) =>
        Math.min(min, Math.hypot((s.x - spot[0]) * 1.4, s.y - spot[1])),
      Infinity,
    );
    if (near > room) {
      room = near;
      best = spot;
    }
  }
  if (room >= 8) return best;
  const round = Math.floor(stickers.length / SPOTS.length);
  return [best[0] - 3 * round, best[1] - 3 * round];
}

function marksReducer(marks: Marks, action: Action): Marks {
  switch (action.type) {
    case "stroke":
      return {
        ...marks,
        next: marks.next + 1,
        strokes: [
          ...marks.strokes,
          { id: marks.next, d: action.d, ink: action.ink },
        ],
      };
    case "fade":
      return {
        ...marks,
        strokes: marks.strokes.filter((stroke) => stroke.id !== action.id),
      };
    case "stamp": {
      const kind = KINDS[marks.turn % KINDS.length]!;
      const [x, y] = action.at ?? freeSpot(marks.stickers);
      const id = marks.next;
      return {
        ...marks,
        next: id + 1,
        turn: marks.turn + 1,
        stickers: [
          ...marks.stickers,
          { id, kind, x, y, ink: action.ink },
        ].slice(-MAX_STICKERS),
        news: {
          text: canvasToolsCopy.placed(canvasToolsCopy.stickers[kind]),
        },
        pop: action.pixels.length > 0 ? { id, pixels: action.pixels } : null,
      };
    }
    case "clear":
      return {
        ...marks,
        strokes: [],
        stickers: [],
        pop: null,
        news: { text: canvasToolsCopy.cleared },
      };
  }
}

/** What CanvasMock can ask of the layer. */
export interface CanvasInkApi {
  /**
   * A sticker: at a free spot (the keyboard's way), or where a click landed
   * before the layer had loaded (in % of the canvas).
   */
  stamp: (at?: Point | null) => void;
  clear: () => void;
}

function StickerMark({
  sticker,
  pixels,
}: {
  sticker: Sticker;
  /** Its burst, when it is the newest and motion is allowed. */
  pixels?: BurstPixel[];
}) {
  const { id, kind, x, y, ink } = sticker;
  const style = {
    left: `${x}%`,
    top: `${y}%`,
    "--tilt": `${TILTS[id % TILTS.length]}deg`,
  } as CSSProperties;
  return (
    <span
      className="pf-sticker"
      data-kind={kind}
      data-ink={ink}
      data-pop={pixels ? "" : undefined}
      style={style}
    >
      {kind === "heart" || kind === "star" ? (
        <svg
          className="pf-sticker__art"
          viewBox={`0 0 ${ART[kind][0]!.length} ${ART[kind].length}`}
          shapeRendering="crispEdges"
        >
          {ART_PATHS[kind].map(([cell, d]) => (
            <path key={cell} d={d} data-cell={cell} />
          ))}
        </svg>
      ) : (
        canvasToolsCopy.stickers[kind]
      )}
      {pixels ? (
        <span className="intro-pixels">
          {pixels.map((pixel, at) => (
            <span
              key={at}
              className="intro-pixel"
              style={pixel as CSSProperties}
            />
          ))}
        </span>
      ) : null}
    </span>
  );
}

export default function CanvasInk({
  tool,
  ink,
  still,
  onCount,
  onReady,
  say,
}: {
  tool: CanvasTool;
  ink: CanvasInkColour;
  /** Reduced motion, or the hero's motion paused: nothing fades or pops. */
  still: boolean;
  /** How many marks are on the canvas: Clear works when there are any. */
  onCount: (count: number) => void;
  /** Hands CanvasMock the layer's api once it is in the page. */
  onReady: (api: CanvasInkApi | null) => void;
  /** The polite live line. */
  say: (text: string) => void;
}) {
  const [marks, dispatch] = useReducer(marksReducer, NOTHING);
  const layer = useRef<HTMLDivElement>(null);
  /** The stroke being drawn, painted straight onto its path. */
  const live = useRef<SVGPathElement>(null);
  const drawing = useRef<{
    pointer: number;
    points: Point[];
    last: Point;
  } | null>(null);
  const frame = useRef(0);
  const timers = useRef(new Map<number, number>());
  const awarded = useRef(false);
  /** The props a stamp needs, read when it happens. */
  const latest = useRef({ ink, still });

  useEffect(() => {
    latest.current = { ink, still };
  });

  /** Where an event is, in px on the layer and on its 1000 x 1000 grid. */
  const place = (event: { clientX: number; clientY: number }) => {
    const box = layer.current?.getBoundingClientRect();
    if (!box?.width || !box.height) return null;
    const px: Point = [event.clientX - box.left, event.clientY - box.top];
    const grid: Point = [
      (px[0] / box.width) * 1000,
      (px[1] / box.height) * 1000,
    ];
    return { px, grid, box };
  };

  const stamp = useCallback((at: Point | null) => {
    const motion = !latest.current.still;
    dispatch({
      type: "stamp",
      at,
      ink: latest.current.ink,
      pixels: motion
        ? burstPixels({ count: 10, reach: [22, 46], ms: 520, stagger: 60 })
        : [],
    });
    if (!awarded.current) {
      awarded.current = true;
      void import("@/lib/brand/traitStore").then((store) =>
        store.award("headphones", "canvas"),
      );
    }
  }, []);

  // CanvasMock's handle: a sticker from the keyboard, and Clear.
  useEffect(() => {
    onReady({
      stamp: (at) => stamp(at ?? null),
      clear: () => dispatch({ type: "clear" }),
    });
    return () => onReady(null);
  }, [onReady, stamp]);

  const count = marks.strokes.length + marks.stickers.length;
  useEffect(() => {
    onCount(count);
  }, [count, onCount]);
  useEffect(() => () => onCount(0), [onCount]);

  useEffect(() => {
    if (marks.news) say(marks.news.text);
  }, [marks.news, say]);

  // Each stroke goes FADE_MS after it is drawn, while things may move; held
  // while still, it goes FADE_MS after they may move again.
  useEffect(() => {
    const pending = timers.current;
    if (still) {
      pending.forEach((timer) => window.clearTimeout(timer));
      pending.clear();
      return;
    }
    for (const { id } of marks.strokes) {
      if (pending.has(id)) continue;
      pending.set(
        id,
        window.setTimeout(() => {
          pending.delete(id);
          dispatch({ type: "fade", id });
        }, FADE_MS),
      );
    }
  }, [still, marks.strokes]);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach((timer) => window.clearTimeout(timer));
      cancelAnimationFrame(frame.current);
    };
  }, []);

  // A tool put down mid-stroke drops the stroke.
  useEffect(() => {
    if (tool === "pen") return;
    drawing.current = null;
    live.current?.removeAttribute("d");
  }, [tool]);

  const paint = () => {
    frame.current = 0;
    const stroke = drawing.current;
    if (stroke) live.current?.setAttribute("d", strokePath(stroke.points));
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (tool !== "pen" || event.button !== 0) return;
    const at = place(event);
    if (!at) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    drawing.current = {
      pointer: event.pointerId,
      points: [at.grid],
      last: at.px,
    };
    paint();
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const stroke = drawing.current;
    if (!stroke || event.pointerId !== stroke.pointer) return;
    const native = event.nativeEvent;
    const steps =
      typeof native.getCoalescedEvents === "function"
        ? native.getCoalescedEvents()
        : [];
    for (const step of steps.length > 0 ? steps : [native]) {
      const at = place(step);
      if (!at) continue;
      // Points under 2 px apart add nothing but weight.
      if (Math.hypot(at.px[0] - stroke.last[0], at.px[1] - stroke.last[1]) < 2)
        continue;
      stroke.points.push(at.grid);
      stroke.last = at.px;
    }
    if (!frame.current) frame.current = requestAnimationFrame(paint);
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const stroke = drawing.current;
    if (!stroke || event.pointerId !== stroke.pointer) return;
    drawing.current = null;
    cancelAnimationFrame(frame.current);
    frame.current = 0;
    live.current?.removeAttribute("d");
    dispatch({
      type: "stroke",
      d: strokePath(stroke.points),
      ink: latest.current.ink,
    });
  };

  const onClick = (event: MouseEvent<HTMLDivElement>) => {
    if (tool !== "stickers") return;
    const at = place(event);
    if (!at) return;
    // In % of the canvas, to two places, so it keeps its spot as it resizes.
    const percent = (px: number, of: number) =>
      Math.round((px / of) * 1e4) / 100;
    stamp([percent(at.px[0], at.box.width), percent(at.px[1], at.box.height)]);
  };

  return (
    <>
      <link rel="stylesheet" href={inkCss} precedence="pf-canvas-tools" />
      <div
        ref={layer}
        className="pf-ink"
        data-tool={tool === "move" ? undefined : tool}
        data-still={still ? "" : undefined}
        aria-hidden="true"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={onClick}
      >
        <svg
          className="pf-ink__svg"
          viewBox="0 0 1000 1000"
          preserveAspectRatio="none"
        >
          {marks.strokes.map((stroke) => (
            <path
              key={stroke.id}
              className="pf-ink__stroke"
              d={stroke.d}
              data-ink={stroke.ink}
              data-fade={still ? undefined : ""}
            />
          ))}
          <path ref={live} className="pf-ink__stroke" data-ink={ink} />
        </svg>
        {marks.stickers.map((sticker) => (
          <StickerMark
            key={sticker.id}
            sticker={sticker}
            pixels={marks.pop?.id === sticker.id ? marks.pop.pixels : undefined}
          />
        ))}
      </div>
    </>
  );
}
