"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import {
  formatCoord,
  formatProgress,
  formatSeconds,
  scrollProgress,
} from "@/lib/hud/telemetry";

/**
 * Live telemetry readout (cursor / scroll / time) — the matveyan HUD signature.
 *
 * Updates DOM text directly via refs inside a single rAF loop, so it never
 * triggers a React re-render at 60fps. Shown only on fine-pointer devices and
 * only when the user allows motion; otherwise it stays hidden (decorative, so
 * `aria-hidden` + non-interactive). Hidden in print via `data-print-hide`.
 */
export function TelemetryHUD() {
  const prefersReduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const scrollRef = useRef<HTMLSpanElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (prefersReduced) return;
    const finePointer = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;
    if (!finePointer) return;

    const root = rootRef.current;
    if (root) root.style.opacity = "1";

    let cursorX = 0;
    let cursorY = 0;
    const start = performance.now();

    const onPointerMove = (event: PointerEvent) => {
      cursorX = event.clientX;
      cursorY = event.clientY;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    let frame = 0;
    const tick = () => {
      const progress = scrollProgress(
        window.scrollY,
        document.documentElement.scrollHeight,
        window.innerHeight,
      );
      if (cursorRef.current) {
        cursorRef.current.textContent = `${formatCoord(cursorX)} · ${formatCoord(cursorY)}`;
      }
      if (scrollRef.current) scrollRef.current.textContent = formatProgress(progress);
      if (timeRef.current) {
        timeRef.current.textContent = formatSeconds(
          (performance.now() - start) / 1000,
        );
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointerMove);
      if (root) root.style.opacity = "0";
    };
  }, [prefersReduced]);

  return (
    <div
      ref={rootRef}
      aria-hidden
      data-print-hide
      className="pointer-events-none fixed right-6 bottom-6 z-40 hidden select-none opacity-0 transition-opacity duration-500 md:block"
    >
      <dl className="grid grid-cols-[auto_auto] gap-x-3 gap-y-1 font-mono text-[0.65rem] uppercase tracking-wider text-subtle tabular-nums">
        <dt>Cursor</dt>
        <dd className="text-right text-muted">
          <span ref={cursorRef}>0 · 0</span>
        </dd>
        <dt>Scroll</dt>
        <dd className="text-right text-muted">
          <span ref={scrollRef}>0.000</span>
        </dd>
        <dt>Time</dt>
        <dd className="text-right text-muted">
          <span ref={timeRef}>0.00</span>
        </dd>
      </dl>
    </div>
  );
}
