"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import {
  INTRO_GREETINGS,
  INTRO_SESSION_KEY,
  INTRO_TIMING,
  introExitStartMs,
} from "@/lib/content/introGreetings";

type Phase = "off" | "cycling" | "exiting";

/** Any of these ends the intro at once. */
const SKIP_EVENTS = ["keydown", "pointerdown", "wheel", "touchstart"] as const;

function alreadySeen(): boolean {
  try {
    return sessionStorage.getItem(INTRO_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

function markSeen(): void {
  try {
    sessionStorage.setItem(INTRO_SESSION_KEY, "1");
  } catch {
    // Storage blocked: the intro may show again next visit, which is harmless.
  }
}

/**
 * First-visit greeting over the home hero: session-once, skipped under
 * reduced motion, and done within INTRO_MAX_MS (see `introGreetings.ts`).
 * Any key, click, tap or scroll (or the Skip button) ends it immediately.
 * Pure CSS motion; the greeting words are decorative, so they're hidden from
 * assistive tech and only the Skip button is exposed.
 */
export default function IntroLoader() {
  const reducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("off");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reducedMotion || alreadySeen()) return;
    const frame = window.requestAnimationFrame(() => setPhase("cycling"));
    return () => window.cancelAnimationFrame(frame);
  }, [reducedMotion]);

  useEffect(() => {
    if (phase !== "cycling") return;

    const exit = () => setPhase("exiting");
    const timers: number[] = [];
    for (let i = 1; i < INTRO_GREETINGS.length; i += 1) {
      timers.push(window.setTimeout(() => setIndex(i), i * INTRO_TIMING.wordMs));
    }
    timers.push(window.setTimeout(exit, introExitStartMs()));
    for (const type of SKIP_EVENTS) {
      window.addEventListener(type, exit, { passive: true });
    }

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      for (const type of SKIP_EVENTS) window.removeEventListener(type, exit);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "exiting") return;
    markSeen();
    const id = window.setTimeout(() => setPhase("off"), INTRO_TIMING.exitMs);
    return () => window.clearTimeout(id);
  }, [phase]);

  if (phase === "off") return null;

  const greeting = INTRO_GREETINGS[index] ?? INTRO_GREETINGS[0];
  const exiting = phase === "exiting";

  return (
    <div
      data-testid="intro-overlay"
      className={`intro-overlay fixed inset-0 z-[100] flex items-center justify-center bg-black${exiting ? " is-exiting" : ""}`}
      style={{ transitionDuration: `${INTRO_TIMING.exitMs}ms` }}
    >
      <p
        key={greeting}
        aria-hidden
        className="intro-word px-6 text-center text-4xl font-light leading-tight tracking-[-0.03em] text-white sm:text-6xl md:text-7xl"
        style={{
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        {greeting}
      </p>
      <button
        type="button"
        onClick={() => setPhase("exiting")}
        tabIndex={exiting ? -1 : 0}
        className="absolute right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] min-h-6 rounded-full border border-white/30 px-4 py-2 text-xs tracking-wide text-white/80 transition-colors hover:border-white/60 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-6 sm:bottom-6"
      >
        Skip intro
      </button>
    </div>
  );
}
