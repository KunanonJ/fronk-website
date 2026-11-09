"use client";

import { useEffect, useRef, useState } from "react";
import { useFinePointer } from "@/lib/hooks/useFinePointer";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

const INTERACTIVE_SELECTOR =
  "a, button, [role='button'], .keyword, .activity-day, input, textarea, label, summary";

/** Follow strength per frame. Higher = snappier; 0.6 catches up ~50% faster than 0.4. */
const LERP = 0.6;
/** Below this distance (px) on both axes the cursor snaps to target and the loop stops. */
export const CURSOR_SETTLE_PX = 0.1;

/**
 * hpbrn-style smooth cursor — landing only, fine pointer, PRM/coarse off.
 *
 * The rAF loop runs only while the cursor is catching up: it starts on
 * `pointermove` and stops once the cursor settles, so a still pointer costs
 * no frames. The hand-cursor hit test (`elementFromPoint`) runs at most once
 * per frame, not once per pointer event.
 */
export default function SmoothCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const target = useRef({ x: -100, y: -100 });
  const raf = useRef(0);
  const finePointer = useFinePointer();
  const reducedMotion = useReducedMotion();
  const enabled = finePointer && !reducedMotion;
  const [isHand, setIsHand] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    document.documentElement.classList.add("has-smooth-cursor");

    let running = false;
    let moved = false;
    let hand = false;

    const render = (vx: number, vy: number) => {
      const node = cursorRef.current;
      if (!node) return;
      const speed = Math.hypot(vx, vy);
      const rotate = speed > 0 ? Math.atan2(vy, vx) * (180 / Math.PI) * 0.1 : 0;
      const scale = Math.min(1.08, 1 + speed * 0.012);
      node.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) rotate(${rotate}deg) scale(${scale})`;
    };

    const tick = () => {
      if (moved) {
        moved = false;
        const el = document.elementFromPoint(target.current.x, target.current.y);
        const nextHand = Boolean(el?.closest(INTERACTIVE_SELECTOR));
        if (nextHand !== hand) {
          hand = nextHand;
          setIsHand(nextHand);
        }
      }

      const dx = target.current.x - pos.current.x;
      const dy = target.current.y - pos.current.y;
      if (Math.abs(dx) < CURSOR_SETTLE_PX && Math.abs(dy) < CURSOR_SETTLE_PX) {
        pos.current.x = target.current.x;
        pos.current.y = target.current.y;
        render(0, 0);
        running = false;
        return;
      }

      pos.current.x += dx * LERP;
      pos.current.y += dy * LERP;
      render(dx * LERP, dy * LERP);
      raf.current = window.requestAnimationFrame(tick);
    };

    const onMove = (event: PointerEvent) => {
      target.current.x = event.clientX;
      target.current.y = event.clientY;
      moved = true;
      if (!running) {
        running = true;
        raf.current = window.requestAnimationFrame(tick);
      }
    };

    // Park the cursor off-screen until the first pointer move.
    render(0, 0);
    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      document.documentElement.classList.remove("has-smooth-cursor");
      window.removeEventListener("pointermove", onMove);
      window.cancelAnimationFrame(raf.current);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={cursorRef}
      className={`smooth-cursor${isHand ? " is-hand" : ""}`}
      aria-hidden
    >
      <svg
        className="smooth-cursor-arrow"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M4 2.5L20 11.2L12.4 13.1L10 21.5L4 2.5Z"
          className="fill-ink stroke-page"
          strokeWidth="1"
        />
      </svg>
      <svg
        className="smooth-cursor-hand"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M8.5 11V7.2a1.4 1.4 0 0 1 2.8 0V11M11.3 10.5V6.4a1.4 1.4 0 0 1 2.8 0V11M14.1 10.8V7.6a1.4 1.4 0 0 1 2.8 0v5.7c0 2.7-1.8 4.7-4.6 4.7H11a4.2 4.2 0 0 1-3.8-2.4L5.5 12.4a1.5 1.5 0 0 1 2.1-2l1 1.1"
          className="fill-ink stroke-page"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
