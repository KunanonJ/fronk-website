"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  INTRO_GREETINGS,
  INTRO_SESSION_KEY,
} from "@/lib/content/introGreetings";

/** Per-word hold before advancing — Apple Hello pace */
const WORD_HOLD_MS = 720;
/** Crossfade overlap for each greeting */
const WORD_FADE_MS = 0.45;
/** Final Hello linger before screen exits */
const FINAL_HOLD_MS = 900;
/** Full-screen exit duration */
const EXIT_MS = 0.7;

type Phase = "cycling" | "exiting" | "done";

/**
 * Full-screen multilingual Hello intro (session-once).
 * Soft crossfades + Apple-like easing, inspired by macOS Setup Assistant.
 */
export default function IntroLoader() {
  const reducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("done");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;

    try {
      if (sessionStorage.getItem(INTRO_SESSION_KEY) === "1") return;
    } catch {
      // sessionStorage may throw — show loader once anyway
    }

    const start = window.requestAnimationFrame(() => setPhase("cycling"));
    return () => window.cancelAnimationFrame(start);
  }, [reducedMotion]);

  useEffect(() => {
    if (phase !== "cycling") return;

    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      if (i >= INTRO_GREETINGS.length) {
        window.clearInterval(id);
        window.setTimeout(() => setPhase("exiting"), FINAL_HOLD_MS);
        return;
      }
      setIndex(i);
    }, WORD_HOLD_MS);

    return () => window.clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "exiting") return;
    const t = window.setTimeout(() => {
      try {
        sessionStorage.setItem(INTRO_SESSION_KEY, "1");
      } catch {
        // ignore
      }
      setPhase("done");
    }, EXIT_MS * 1000 + 80);
    return () => window.clearTimeout(t);
  }, [phase]);

  if (phase === "done") return null;

  const greeting = INTRO_GREETINGS[index] ?? INTRO_GREETINGS[0];

  return (
    <motion.div
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === "exiting" ? 0 : 1 }}
      transition={{
        duration: EXIT_MS,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div className="relative flex h-[2.4em] w-full max-w-[min(92vw,40rem)] items-center justify-center px-6">
        <AnimatePresence mode="sync">
          <motion.p
            key={greeting}
            className="absolute inset-x-0 px-6 text-center text-4xl font-light leading-tight tracking-[-0.03em] text-white sm:text-6xl md:text-7xl"
            style={{
              fontFamily:
                'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}
            initial={{ opacity: 0, scale: 0.96, filter: "blur(6px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.02, filter: "blur(4px)" }}
            transition={{
              duration: WORD_FADE_MS,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {greeting}
          </motion.p>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
