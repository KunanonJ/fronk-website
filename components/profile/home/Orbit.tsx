import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from "react";
import { MotionToggle } from "@/components/ds/MotionToggle";
import { Pill } from "@/components/ds/Pill";
import { PixelBadge, PixelFile } from "@/components/profile/home/PixelIcon";
import { useHydrated } from "@/components/profile/site/popover";
import { orbitCopy } from "@/lib/content/homeJourney";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { orbitRing, type RingItem } from "@/lib/landing/journey";
import { prefersReducedMotion } from "@/lib/motion/motionRuntime";

/*
 * The Journey stage and its tool orbit (profile redesign Phase 4, design spec
 * 8.6). The tools of /stack and four file tiles of our own sit on an ellipse
 * around the stage's centred copy, with depth: far tiles are smaller and
 * blurred, and only the tiles on the near arc show their names.
 *
 * The geometry is CSS (home-journey.css): each item's angle is its slot plus
 * two registered angles, `--orbit-offset` (drag and the buttons) and
 * `--orbit-spin` (a 60 s turn), and cos() and sin() place it. So the server
 * HTML is already a complete, still ring; no item waits for JavaScript.
 *
 * Once hydrated, with motion allowed: the ring turns slowly while the stage is
 * in view, and pauses on hover, on focus inside, while dragged and by its
 * pause button (WCAG 2.2.2). A stage still below the fold waits and its tiles
 * rise in (`kj-file-in`) as it comes into view. Under reduced motion the ring
 * stays still; dragging and the two buttons still turn it (WCAG 2.5.7: the
 * buttons are the single-pointer way to do what dragging does).
 *
 * The tools are a real list with their names and kinds as text, in /stack's
 * order; the ellipse is visual only, and the file tiles are hidden from
 * assistive technology.
 */

const RING = orbitRing();

/** Horizontal travel, in px, before a press on the stage becomes a drag. */
const DRAG_START = 8;

/** The ring's horizontal radius as a share of its width (the CSS's 42 to 44%). */
const RADIUS_SHARE = 0.43;

export function Orbit({
  items = RING,
  children,
}: {
  items?: readonly RingItem[];
  /** The centred copy: eyebrow, heading, lead and the link to the story. */
  children: ReactNode;
}) {
  const hydrated = useHydrated();
  const reduced = useReducedMotion();
  const [playing, setPlaying] = useState(true);
  const stageRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  /** The ring's turn from drags and buttons, in degrees. */
  const offset = useRef(0);
  const press = useRef<{
    id: number;
    x: number;
    y: number;
    from: number;
    dragging: boolean;
  } | null>(null);
  const step = 360 / items.length;

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || typeof IntersectionObserver === "undefined") return;
    // A stage below the fold waits, so its tiles can rise in when it shows;
    // one already in view stays as it is.
    if (
      !prefersReducedMotion() &&
      stage.getBoundingClientRect().top >= window.innerHeight
    ) {
      stage.dataset.pending = "";
    }
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) {
        stage.dataset.offscreen = "";
        return;
      }
      delete stage.dataset.offscreen;
      if ("pending" in stage.dataset) {
        delete stage.dataset.pending;
        stage.dataset.entering = "";
      }
    });
    observer.observe(stage);
    return () => {
      observer.disconnect();
      delete stage.dataset.pending;
      delete stage.dataset.offscreen;
    };
  }, []);

  const setOffset = (degrees: number) => {
    offset.current = degrees;
    ringRef.current?.style.setProperty("--orbit-offset", `${degrees}deg`);
  };

  const endPress = (event: PointerEvent<HTMLDivElement>) => {
    const current = press.current;
    if (!current || current.id !== event.pointerId) return;
    press.current = null;
    const ring = event.currentTarget;
    if (ring.hasPointerCapture(event.pointerId))
      ring.releasePointerCapture(event.pointerId);
    if (stageRef.current) delete stageRef.current.dataset.dragging;
  };

  // The ring layer takes the drag; the centred copy and the controls sit
  // above it, so they keep their own clicks, cursor and text selection.
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    press.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      from: offset.current,
      dragging: false,
    };
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const current = press.current;
    if (!current || current.id !== event.pointerId) return;
    const dx = event.clientX - current.x;
    const dy = event.clientY - current.y;
    if (!current.dragging) {
      // Mostly vertical: the reader is scrolling, not turning.
      if (Math.abs(dy) > DRAG_START && Math.abs(dy) > Math.abs(dx)) {
        press.current = null;
        return;
      }
      if (Math.abs(dx) < DRAG_START) return;
      current.dragging = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      if (stageRef.current) stageRef.current.dataset.dragging = "";
    }
    // The near tiles follow the pointer: an arc of dx at the ring's radius.
    const radius = Math.max(
      1,
      (ringRef.current?.clientWidth ?? 0) * RADIUS_SHARE,
    );
    setOffset(current.from - (dx / radius) * (180 / Math.PI));
  };

  return (
    <div
      ref={stageRef}
      className="pf-journey__stage"
      data-running={reduced ? undefined : ""}
      data-paused={playing ? undefined : ""}
    >
      <div className="pf-journey__wash" aria-hidden="true" />
      <div
        ref={ringRef}
        className="pf-orbit"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPress}
        onPointerCancel={endPress}
      >
        <ul
          className="pf-orbit__ring"
          aria-label={orbitCopy.label}
          style={{ "--n": items.length } as CSSProperties}
        >
          {items.map((item, index) =>
            item.type === "tool" ? (
              <li
                key={item.name}
                className="pf-orbit__item"
                style={{ "--i": index } as CSSProperties}
              >
                <PixelBadge
                  badge={item.badge}
                  tone={item.tone}
                  className="pf-orbit__tile"
                />
                <span className="pf-orbit__label">
                  <span className="t-small pf-orbit__name">{item.name}</span>
                  <span className="sr-only">, </span>
                  <span className="t-meta pf-orbit__kind">{item.kind}</span>
                </span>
              </li>
            ) : (
              <li
                key={item.ext}
                className="pf-orbit__item pf-orbit__item--file"
                style={{ "--i": index } as CSSProperties}
                aria-hidden="true"
              >
                <PixelFile tone={item.tone} className="pf-orbit__tile" />
                <span className="pf-orbit__label">
                  <span className="t-meta pf-orbit__kind">{item.ext}</span>
                </span>
              </li>
            ),
          )}
        </ul>
      </div>
      <div className="pf-journey__copy">{children}</div>
      {hydrated ? (
        <div className="pf-orbit__controls">
          <Pill
            variant="ghost"
            round
            icon={<ArrowLeft size={16} strokeWidth={1.8} />}
            onClick={() => setOffset(offset.current + step)}
          >
            {orbitCopy.previous}
          </Pill>
          <Pill
            variant="ghost"
            round
            icon={<ArrowRight size={16} strokeWidth={1.8} />}
            onClick={() => setOffset(offset.current - step)}
          >
            {orbitCopy.next}
          </Pill>
          <MotionToggle
            playing={playing}
            onToggle={setPlaying}
            labels={{ pause: orbitCopy.pause, play: orbitCopy.play }}
          />
        </div>
      ) : null}
    </div>
  );
}
