import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type MouseEvent as ReactMouseEvent,
} from "react";
import {
  Frame,
  MessageCircle,
  MousePointer2,
  PenTool,
  Type,
} from "lucide-react";
import Link from "@/components/navigation/Link";
import { Chip } from "@/components/ds/labels";
import type { CanvasInkApi, Point } from "@/components/profile/home/CanvasInk";
import {
  CanvasToolbar,
  type CanvasInkColour,
  type CanvasTool,
} from "@/components/profile/home/CanvasToolbar";
import { canvasMock, type MockFrame } from "@/lib/content/home";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

/*
 * The hero's design-tool canvas (profile redesign, owner decision 3; design
 * spec 8.2 and 12, item 16): the three featured projects as frames on a
 * dotted canvas, between a Layers panel and an inspector. Only the frames
 * are exposed, as named links; the window chrome, panels, comment, cursor
 * and toolbar are decoration. Hovering or focusing a frame selects it. Under
 * 810 px the panels go and the frames become a swipeable row with a pager.
 * Frames show a real screenshot where one is registered, else a textless
 * drawing labelled "Illustration".
 *
 * As in a design tool (owner, 20-11-26): hovering a row of the Layers panel
 * outlines its frame, and pressing it selects the frame as hovering the frame
 * does, the named cursor gliding over to it. The rows are a pointer's
 * shortcut inside the hidden decoration; the keyboard selects by focusing the
 * frames themselves. Under a fine pointer the dotted canvas drifts against
 * it, a little, as if it lay deeper than the frames.
 *
 * From 810 px with a mouse the toolbar is real (now-building-and-genz
 * Phase 4; CanvasToolbar): Move, the default, under which the canvas is as
 * above; the Pen, whose doodles fade; Stickers; the ink; and Clear. The
 * drawing layer and its stylesheet load the first time the toolbar is
 * reached for (CanvasInk). On touch screens and narrow ones the toolbar
 * stays decoration.
 */

/**
 * The frames the named cursor visits once the hero can be seen, ending on
 * the first, which is selected at rest: the last stop lands by 4.2 s, under
 * the 5 s that would need a pause control (WCAG 2.2.2).
 */
const TOUR = [2, 1, 0] as const;
const TOUR_START_MS = 900;
const TOUR_STEP_MS = 1200;

/** Wide enough for the panels; under it the frames swipe (spec 10). */
const PANELS_QUERY = "(min-width: 50.625rem)";

/** A pointer that can hover: the canvas drifts under it. */
const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";

/** The drawing layer, loaded when the toolbar is first reached for. */
const CanvasInk = lazy(() => import("@/components/profile/home/CanvasInk"));

function subscribeTools(onChange: () => void): () => void {
  const lists = [PANELS_QUERY, FINE_POINTER_QUERY].map((query) =>
    window.matchMedia(query),
  );
  lists.forEach((list) => list.addEventListener("change", onChange));
  return () =>
    lists.forEach((list) => list.removeEventListener("change", onChange));
}

/**
 * The tools work here: wide enough for the panels, and a mouse. Never on
 * the server or at hydration, which draw the decorative toolbar.
 */
function useToolsAllowed(): boolean {
  return useSyncExternalStore(
    subscribeTools,
    () =>
      window.matchMedia(PANELS_QUERY).matches &&
      window.matchMedia(FINE_POINTER_QUERY).matches,
    () => false,
  );
}

/** How far the dots drift, at the canvas's edge, in px. */
const PAN_PX = 12;

/** The frame whose centre is nearest the row's, on the swipeable row. */
function centredFrame(row: HTMLElement): number {
  const middle = row.scrollLeft + row.clientWidth / 2;
  let best = 0;
  let distance = Infinity;
  Array.from(row.children).forEach((child, index) => {
    const item = child as HTMLElement;
    const gap = Math.abs(item.offsetLeft + item.offsetWidth / 2 - middle);
    if (gap < distance) {
      distance = gap;
      best = index;
    }
  });
  return best;
}

const CELLS: Record<NonNullable<MockFrame["mockup"]>, number> = {
  "app-shell": 6,
  "review-queue": 5,
  "email-report": 6,
  "form-preview": 5,
};

/**
 * The frame's picture: the screenshot, or a textless drawing of the screen
 * (labelled "Illustration" by the frame's tags, outside the link).
 */
function Shot({ frame }: { frame: MockFrame }) {
  if (frame.cover) {
    return (
      <img
        className="pf-mock__cover"
        src={frame.cover.src}
        alt=""
        width={frame.cover.width}
        height={frame.cover.height}
        loading="lazy"
        decoding="async"
      />
    );
  }
  const kind = frame.mockup ?? "app-shell";
  return (
    <span className={`pf-thumb pf-thumb--${kind}`}>
      <span className="pf-thumb__screen">
        {Array.from({ length: CELLS[kind] }, (_, i) => (
          <i key={i} />
        ))}
      </span>
    </span>
  );
}

export function CanvasMock({
  ready,
  paused = false,
  frames = canvasMock.frames,
}: {
  /** The hero can be seen: the cursor may start its tour. */
  ready: boolean;
  /** The hero's motion toggle is on pause: the tour ends, as on a pick. */
  paused?: boolean;
  frames?: readonly MockFrame[];
}) {
  const reduced = useReducedMotion();
  const row = useRef<HTMLUListElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  /** Set once the hero's toggle pauses: like a pick, it ends the tour. */
  const halted = useRef(false);
  const [selected, setSelected] = useState(0);
  /** The frame whose layer the pointer is over: outlined, not selected. */
  const [hovered, setHovered] = useState<number | null>(null);
  const [cursorAt, setCursorAt] = useState(0);
  const [touched, setTouched] = useState(false);
  const [shown, setShown] = useState("");
  const current = frames[selected] ?? frames[0];

  const toolsAllowed = useToolsAllowed();
  const [chosen, setChosen] = useState<CanvasTool>("move");
  /** Off where the tools do not work: a window narrowed, a mouse gone. */
  const tool = toolsAllowed ? chosen : "move";
  const [ink, setInk] = useState<CanvasInkColour>("violet");
  const [awake, setAwake] = useState(false);
  /**
   * The toolbar has been reached for: the drawing layer (empty, and letting
   * the pointer through under Move) is in the page, so a tool works at once.
   */
  const [inking, setInking] = useState(false);
  const [marks, setMarks] = useState(0);
  const inkApi = useRef<CanvasInkApi | null>(null);
  /**
   * Stamps asked for before the layer arrived: a free spot (the keyboard)
   * or where a click landed. Played, in order, once it has.
   */
  const queued = useRef<(Point | null)[]>([]);

  // The dotted canvas drifts against a fine pointer and eases back when it
  // leaves; still under reduced motion and while the hero's motion is paused.
  useEffect(() => {
    const el = canvas.current;
    if (!el || reduced || paused) return;
    if (!window.matchMedia(FINE_POINTER_QUERY).matches) return;
    let frame = 0;
    let x = 0;
    let y = 0;
    const apply = () => {
      frame = 0;
      el.style.setProperty("--pan-x", `${x}px`);
      el.style.setProperty("--pan-y", `${y}px`);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const move = (event: PointerEvent) => {
      const box = el.getBoundingClientRect();
      if (!box.width || !box.height) return;
      // From -1 to 1 across the canvas; the dots go the other way.
      const across = ((event.clientX - box.left) / box.width) * 2 - 1;
      const down = ((event.clientY - box.top) / box.height) * 2 - 1;
      x = Math.round(-across * PAN_PX * 10) / 10;
      y = Math.round(-down * PAN_PX * 10) / 10;
      schedule();
    };
    const leave = () => {
      x = 0;
      y = 0;
      schedule();
    };
    el.addEventListener("pointermove", move, { passive: true });
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(frame);
      el.style.removeProperty("--pan-x");
      el.style.removeProperty("--pan-y");
    };
  }, [reduced, paused]);

  // The cursor's one tour, on the full canvas only; a reader's own choice
  // ends it: a pick, or a pause on the hero's motion toggle.
  useEffect(() => {
    if (paused) halted.current = true;
    if (!ready || reduced || touched || halted.current) return;
    if (!window.matchMedia(PANELS_QUERY).matches) return;
    const timers = TOUR.map((frame, step) =>
      window.setTimeout(
        () => {
          setCursorAt(frame);
          setSelected(frame);
        },
        TOUR_START_MS + step * TOUR_STEP_MS,
      ),
    );
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [ready, reduced, touched, paused]);

  // On the swipeable row, the frame in the middle is the selected one.
  useEffect(() => {
    const el = row.current;
    if (!el) return;
    let frame = 0;
    const settle = () => {
      frame = 0;
      setSelected(centredFrame(el));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(settle);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const pick = (index: number) => {
    setTouched(true);
    setSelected(index);
  };

  // Esc puts any tool down (unless a dialog's Esc, or another's, came first).
  useEffect(() => {
    if (tool === "move") return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      if (document.querySelector("dialog[open]")) return;
      event.preventDefault();
      setChosen("move");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tool]);

  /** The live line; the same words again are still read. */
  const say = useCallback((text: string) => {
    setShown((said) => (said === text ? `${text}\u00a0` : text));
  }, []);

  const onInkReady = useCallback((api: CanvasInkApi | null) => {
    inkApi.current = api;
    if (!api) return;
    for (const at of queued.current.splice(0)) api.stamp(at);
  }, []);

  /**
   * A click with Stickers on that lands before the layer has loaded (the
   * chunk is still on its way on a slow network): kept, with its place, and
   * stamped once the layer arrives. Once it is there, it handles clicks.
   */
  const onCanvasClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (tool !== "stickers" || inkApi.current) return;
    if ((event.target as Element).closest(".pf-mock__tools")) return;
    const box = event.currentTarget.getBoundingClientRect();
    if (!box.width || !box.height) return;
    const percent = (px: number, of: number) =>
      Math.round((px / of) * 1e4) / 100;
    queued.current.push([
      percent(event.clientX - box.left, box.width),
      percent(event.clientY - box.top, box.height),
    ]);
  };

  const wake = () => {
    if (awake) return;
    setAwake(true);
    setInking(true);
  };

  /** A tool picked ends the tour, as a pick does; Stickers again stamps. */
  const pickTool = (next: CanvasTool) => {
    setTouched(true);
    if (next === "stickers" && tool === "stickers") {
      if (inkApi.current) inkApi.current.stamp();
      else queued.current.push(null);
      return;
    }
    setChosen(next);
    if (next !== "move") setInking(true);
  };

  /** A layer pressed: its frame is selected and the named cursor goes to it. */
  const pickLayer = (index: number) => {
    pick(index);
    setCursorAt(index);
  };

  /** The inspector's button: the selected frame's own link does the work. */
  const openSelected = () => {
    row.current?.children[selected]
      ?.querySelector<HTMLAnchorElement>("a.pf-mock__frame")
      ?.click();
  };

  const show = (index: number) => {
    const el = row.current;
    const item = el?.children[index] as HTMLElement | undefined;
    if (el && item) {
      el.scrollTo?.({
        left: item.offsetLeft - (el.clientWidth - item.offsetWidth) / 2,
        behavior: reduced ? "auto" : "smooth",
      });
    }
    pick(index);
    const frame = frames[index];
    if (frame) setShown(canvasMock.shown(frame.name, index, frames.length));
  };

  if (!current) return null;

  return (
    <div className="pf-mock-wrap">
      <div
        className="pf-mock"
        role="group"
        aria-label={canvasMock.label}
        data-tool={tool === "move" ? undefined : tool}
      >
        <div className="pf-mock__bar" aria-hidden="true">
          <span className="pf-mock__lights">
            <i />
            <i />
            <i />
          </span>
          <span className="pf-mock__title">
            <b>{canvasMock.breadcrumb.owner}</b>
            {" / "}
            {canvasMock.breadcrumb.file}
          </span>
          <span className="pf-mock__share">{canvasMock.share}</span>
        </div>
        {/* The click only keeps a stamp asked for before the layer loads;
            the keyboard's way is the Stickers button (CanvasToolbar). */}
        <div ref={canvas} className="pf-mock__canvas" onClick={onCanvasClick}>
          {/* First, so the panels after it (at its z-index) lie over it. */}
          {inking && toolsAllowed ? (
            <Suspense fallback={null}>
              <CanvasInk
                tool={tool}
                ink={ink}
                still={reduced || paused}
                onCount={setMarks}
                onReady={onInkReady}
                say={say}
              />
            </Suspense>
          ) : null}
          <div className="pf-mock__panel pf-mock__layers" aria-hidden="true">
            <p className="pf-mock__tabs">
              <b>{canvasMock.layersTabs[0]}</b>
              <span>{canvasMock.layersTabs[1]}</span>
            </p>
            <p className="pf-mock__group">{canvasMock.layersGroup}</p>
            {/* For a pointer only, like the inspector's button: inside
                aria-hidden nothing may take focus, and the frames are the
                same choice for the keyboard and for screen readers. */}
            <ul
              className="pf-mock__layer-list"
              onPointerLeave={() => setHovered(null)}
            >
              {frames.map((frame, index) => (
                <li
                  key={frame.slug}
                  className="pf-mock__layer"
                  data-selected={index === selected ? "" : undefined}
                  onPointerEnter={() => setHovered(index)}
                  onClick={() => pickLayer(index)}
                >
                  <span className="pf-mock__hash">#</span>
                  <span>{frame.name}</span>
                </li>
              ))}
            </ul>
          </div>
          <ul ref={row} className="pf-mock__frames">
            {frames.map((frame, index) => (
              <li key={frame.slug} className="pf-mock__item">
                <Link
                  href={frame.href}
                  className="pf-mock__frame"
                  data-selected={index === selected ? "" : undefined}
                  data-hovered={
                    index === hovered && index !== selected ? "" : undefined
                  }
                  aria-label={canvasMock.frameName(frame.name)}
                  onPointerEnter={() => pick(index)}
                  onFocus={() => pick(index)}
                >
                  <span className="pf-mock__label" aria-hidden="true">
                    <span className="pf-mock__hash">#</span>
                    {frame.name}
                  </span>
                  <span className="pf-mock__shot" aria-hidden="true">
                    <Shot frame={frame} />
                    <span className="pf-mock__handles">
                      <i />
                      <i />
                      <i />
                      <i />
                    </span>
                  </span>
                </Link>
                {/* Over the picture but outside the link, so the link's
                    visible text is its name alone (WCAG 2.5.3). */}
                <span className="pf-mock__tags" aria-hidden="true">
                  {frame.cover ? null : (
                    <Chip kind="illustration">{canvasMock.illustration}</Chip>
                  )}
                  <span className="pf-mock__badge">{frame.category}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="pf-mock__panel pf-mock__inspector" aria-hidden="true">
            <p className="pf-mock__tabs">
              <b>{canvasMock.inspectorTabs[0]}</b>
              <span>{canvasMock.inspectorTabs[1]}</span>
            </p>
            <p className="pf-mock__name">{current.name}</p>
            <p className="pf-mock__field">
              <span>{canvasMock.area}</span>
              {current.category}
            </p>
            <p className="pf-mock__field">
              <span>{canvasMock.period}</span>
              {current.period}
            </p>
            {/* For a pointer only, and no link of its own: inside
                aria-hidden nothing may take focus, so it passes its click
                to the selected frame's link, which is the same link for the
                keyboard and for screen readers. */}
            <span className="pf-mock__open" onClick={openSelected}>
              {canvasMock.open}
            </span>
          </div>
          <div className="pf-mock__comment" aria-hidden="true">
            <span className="pf-mock__avatar">
              {canvasMock.comment.initial}
            </span>
            <span className="pf-mock__bubble">
              <span className="pf-mock__who">{canvasMock.comment.who}</span>
              <span>{canvasMock.comment.line}</span>
            </span>
          </div>
          <div
            className="pf-mock__cursor"
            data-frame={cursorAt}
            aria-hidden="true"
          >
            <MousePointer2 size={18} strokeWidth={1.6} />
            <span className="pf-mock__cursor-name">{canvasMock.cursor}</span>
          </div>
          {toolsAllowed ? (
            <CanvasToolbar
              tool={tool}
              ink={ink}
              canClear={marks > 0}
              awake={awake}
              onWake={wake}
              onTool={pickTool}
              onInk={() => {
                setTouched(true);
                setInk((was) => (was === "violet" ? "coral" : "violet"));
              }}
              onClear={() => {
                setTouched(true);
                inkApi.current?.clear();
              }}
            />
          ) : (
            <div className="pf-mock__tools" aria-hidden="true">
              <span data-on="">
                <MousePointer2 size={15} strokeWidth={1.8} />
              </span>
              <span>
                <Frame size={15} strokeWidth={1.8} />
              </span>
              <span>
                <PenTool size={15} strokeWidth={1.8} />
              </span>
              <span>
                <Type size={15} strokeWidth={1.8} />
              </span>
              <span>
                <MessageCircle size={15} strokeWidth={1.8} />
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="pf-mock__pager">
        {frames.map((frame, index) => (
          <button
            key={frame.slug}
            type="button"
            className="pf-mock__dot"
            aria-label={canvasMock.showName(frame.name)}
            aria-current={index === selected ? "true" : undefined}
            onClick={() => show(index)}
          >
            <span />
          </button>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        {shown}
      </p>
    </div>
  );
}
