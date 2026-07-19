"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useReducedMotion } from "framer-motion";

/** Full cover → hold → reveal cycle */
const SPLASH_MS = 1800;
const PANEL_COUNT = 5;
/** Stagger between adjacent columns (seconds) */
const STAGGER_S = 0.055;
/** Bottom row starts slightly after top for a softer seam */
const BOTTOM_OFFSET_S = 0.04;
const PLAY_DEBOUNCE_MS = 500;

function shouldSkipPath(pathname: string): boolean {
  // Sanity Studio — keep the CMS chrome free of marketing transitions
  return pathname === "/studio" || pathname.startsWith("/studio/");
}

function isInternalPathNavigating(anchor: HTMLAnchorElement): string | null {
  if (anchor.target === "_blank" || anchor.hasAttribute("download")) return null;
  const raw = anchor.getAttribute("href");
  if (!raw || raw.startsWith("#") || raw.startsWith("mailto:") || raw.startsWith("tel:")) {
    return null;
  }
  let pathname: string;
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    try {
      const url = new URL(raw);
      if (url.origin !== window.location.origin) return null;
      pathname = url.pathname;
    } catch {
      return null;
    }
  } else {
    try {
      pathname = new URL(raw, window.location.origin).pathname;
    } catch {
      return null;
    }
  }
  if (shouldSkipPath(pathname) || shouldSkipPath(window.location.pathname)) {
    return null;
  }
  return pathname;
}

/**
 * Brand cream panel wipe between landing pages.
 * Cover → brief hold → reveal, with staggered columns and a soft center mark.
 * Skips first paint (home already has IntroLoader) and hash-only jumps.
 */
export default function RouteSplash() {
  const pathname = usePathname() ?? "/";
  const prefersReducedMotion = useReducedMotion();
  const [active, setActive] = useState(false);
  const [cycle, setCycle] = useState(0);
  const prevPathRef = useRef<string | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const lastPlayRef = useRef(0);

  const play = () => {
    if (prefersReducedMotion) return;
    const now = Date.now();
    if (now - lastPlayRef.current < PLAY_DEBOUNCE_MS) return;
    lastPlayRef.current = now;

    if (hideTimerRef.current != null) {
      window.clearTimeout(hideTimerRef.current);
    }
    setCycle((n) => n + 1);
    setActive(true);
    hideTimerRef.current = window.setTimeout(() => {
      setActive(false);
      hideTimerRef.current = null;
    }, SPLASH_MS);
  };

  useEffect(() => {
    if (prevPathRef.current === null) {
      prevPathRef.current = pathname;
      return;
    }
    if (prevPathRef.current === pathname) return;
    const from = prevPathRef.current;
    prevPathRef.current = pathname;
    if (shouldSkipPath(from) || shouldSkipPath(pathname)) return;
    play();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional path-change trigger
  }, [pathname, prefersReducedMotion]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      if (event.button !== 0) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      const nextPath = isInternalPathNavigating(anchor);
      if (!nextPath) return;
      if (nextPath === window.location.pathname) return;
      play();
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefersReducedMotion]);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current != null) window.clearTimeout(hideTimerRef.current);
    };
  }, []);

  if (!active || prefersReducedMotion) return null;

  return (
    <div
      key={cycle}
      className="route-splash fixed inset-0 z-[9999] h-screen w-screen overflow-hidden"
      aria-hidden
    >
      <div className="route-splash-rows flex h-full w-full flex-col">
        <div className="flex h-1/2 w-full">
          {Array.from({ length: PANEL_COUNT }).map((_, i) => (
            <div
              key={`top-${i}`}
              className="route-splash-box route-splash-box-top h-full w-1/5"
              style={{
                animationDelay: `${i * STAGGER_S}s`,
              }}
            />
          ))}
        </div>
        <div className="flex h-1/2 w-full">
          {Array.from({ length: PANEL_COUNT }).map((_, i) => (
            <div
              key={`bot-${i}`}
              className="route-splash-box route-splash-box-bottom h-full w-1/5"
              style={{
                /* Mirror stagger so the wave closes toward the center seam */
                animationDelay: `${(PANEL_COUNT - 1 - i) * STAGGER_S + BOTTOM_OFFSET_S}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="route-splash-mark pointer-events-none absolute inset-0 flex items-center justify-center">
        <span
          className="route-splash-mark-text text-[clamp(1.75rem,4vw,2.75rem)] tracking-[-0.02em] text-black/85 italic"
          style={{
            fontFamily:
              "var(--font-instrument-serif), 'Instrument Serif', serif",
          }}
        >
          KunanonJ
        </span>
      </div>
    </div>
  );
}
