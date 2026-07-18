"use client";

import { useEffect, useState } from "react";
import {
  INTRO_GREETINGS,
  INTRO_SESSION_KEY,
} from "@/lib/content/introGreetings";
import { prefersReducedMotion } from "@/lib/motion/motionRuntime";

const CYCLE_MS = 180;
const HOLD_MS = 400;
const FADE_MS = 350;

type Phase = "cycling" | "fading" | "done";

/**
 * Full-screen multilingual Hello intro (session-once, PRM skips).
 */
export function IntroLoader() {
  const [phase, setPhase] = useState<Phase>("done");
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (prefersReducedMotion()) {
      setPhase("done");
      setReady(true);
      return;
    }

    try {
      if (sessionStorage.getItem(INTRO_SESSION_KEY) === "1") {
        setPhase("done");
        setReady(true);
        return;
      }
    } catch {
      // sessionStorage may throw — show loader once anyway
    }

    setPhase("cycling");
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || phase !== "cycling") return;

    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      if (i >= INTRO_GREETINGS.length) {
        window.clearInterval(id);
        setPhase("fading");
        return;
      }
      setIndex(i);
    }, CYCLE_MS);

    return () => window.clearInterval(id);
  }, [ready, phase]);

  useEffect(() => {
    if (phase !== "fading") return;
    const hold = window.setTimeout(() => {
      try {
        sessionStorage.setItem(INTRO_SESSION_KEY, "1");
      } catch {
        // ignore
      }
      setPhase("done");
    }, HOLD_MS + FADE_MS);
    return () => window.clearTimeout(hold);
  }, [phase]);

  if (!ready || phase === "done") return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-bg transition-opacity duration-300 ${
        phase === "fading" ? "opacity-0" : "opacity-100"
      }`}
    >
      <p className="font-display text-4xl font-semibold tracking-tight text-fg sm:text-6xl">
        {INTRO_GREETINGS[index] ?? INTRO_GREETINGS[0]}
      </p>
    </div>
  );
}
