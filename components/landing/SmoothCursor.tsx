"use client";

import { useEffect, useRef, useState } from "react";

const INTERACTIVE_SELECTOR =
  "a, button, [role='button'], .keyword, .activity-day, input, textarea, label, summary";

function prefersFinePointer(): boolean {
  return window.matchMedia("(pointer: fine)").matches;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * hpbrn-style smooth cursor — landing only, fine pointer, PRM/coarse off.
 */
export default function SmoothCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const target = useRef({ x: -100, y: -100 });
  const vel = useRef({ x: 0, y: 0 });
  const raf = useRef(0);
  const [enabled, setEnabled] = useState(false);
  const [isHand, setIsHand] = useState(false);

  useEffect(() => {
    const canEnable = prefersFinePointer() && !prefersReducedMotion();
    setEnabled(canEnable);
    if (!canEnable) return;

    document.documentElement.classList.add("has-smooth-cursor");

    const onMove = (event: PointerEvent) => {
      target.current.x = event.clientX;
      target.current.y = event.clientY;
      const el = document.elementFromPoint(event.clientX, event.clientY);
      setIsHand(Boolean(el?.closest(INTERACTIVE_SELECTOR)));
    };

    const tick = () => {
      // Higher = snappier follow; 0.6 ≈ 50% faster catch-up than 0.4.
      const lerp = 0.6;
      const prevX = pos.current.x;
      const prevY = pos.current.y;
      pos.current.x += (target.current.x - pos.current.x) * lerp;
      pos.current.y += (target.current.y - pos.current.y) * lerp;
      vel.current.x = pos.current.x - prevX;
      vel.current.y = pos.current.y - prevY;

      const node = cursorRef.current;
      if (node) {
        const speed = Math.hypot(vel.current.x, vel.current.y);
        const rotate = Math.atan2(vel.current.y, vel.current.x) * (180 / Math.PI);
        const scale = Math.min(1.08, 1 + speed * 0.012);
        node.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) rotate(${Number.isFinite(rotate) ? rotate * 0.1 : 0}deg) scale(${scale})`;
      }
      raf.current = window.requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    raf.current = window.requestAnimationFrame(tick);

    return () => {
      document.documentElement.classList.remove("has-smooth-cursor");
      window.removeEventListener("pointermove", onMove);
      window.cancelAnimationFrame(raf.current);
    };
  }, []);

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
          fill="#DEDBC8"
          stroke="#111"
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
          stroke="#DEDBC8"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="#111"
        />
      </svg>
    </div>
  );
}
