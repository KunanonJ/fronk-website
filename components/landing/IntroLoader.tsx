import { useEffect, useLayoutEffect, useState } from "react";
import { flushSync } from "react-dom";
import IntroPixels from "@/components/landing/IntroPixels";
import { PixelPortrait } from "@/components/profile/site/PixelPortrait";
import { PORTRAIT } from "@/lib/brand/pixelPortrait";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import {
  INTRO_CELLS,
  INTRO_COPY,
  INTRO_GREETINGS,
  INTRO_RANKS,
  INTRO_SESSION_KEY,
  INTRO_TIMING,
  introExitStartMs,
} from "@/lib/content/introGreetings";
import { markIntroDone, markIntroPending } from "@/lib/motion/introSignal";

type Phase = "off" | "cycling" | "exiting";

/** Any of these ends the intro at once. */
const SKIP_EVENTS = ["keydown", "pointerdown", "wheel", "touchstart"] as const;

type TransitionDocument = Document & {
  startViewTransition?: (update: () => void) => { finished: Promise<void> };
};

/** True where the portrait can fly to the nav (view transitions). */
function canMorph(): boolean {
  return (
    typeof (document as TransitionDocument).startViewTransition === "function"
  );
}

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
 * First-visit intro over the home hero (lib/content/introGreetings.ts): the
 * pixel portrait mints. It prints in by the dither's 16 ranks under a counter
 * of its 576 cells while the greetings pass; the welcome lands with a burst
 * of pixels (IntroPixels); then the portrait flies into the nav's avatar as
 * the overlay goes, in a view transition (`data-intro-morph` names the
 * portrait before it and the avatar after it, never both: one name twice
 * would abort it). Without view transitions the overlay fades. Session-once,
 * skipped under reduced motion; any key, click, tap or scroll (or the Skip
 * button) ends it at once. The words, the portrait and the burst are
 * decorative, so only the Skip button is exposed.
 */
export default function IntroLoader() {
  const reducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("off");
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(0);
  const [fading, setFading] = useState(false);

  // The intro is coming (the test below, which it plays on): mark the page
  // before it paints, so a hero waiting on the mark stays still under the
  // overlay. A full load has the inline script's mark already; a visit made
  // in the app has none until this runs.
  useLayoutEffect(() => {
    if (reducedMotion || alreadySeen()) return;
    markIntroPending();
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion || alreadySeen()) return;
    const frame = window.requestAnimationFrame(() => setPhase("cycling"));
    return () => window.cancelAnimationFrame(frame);
  }, [reducedMotion]);

  /** Ends the intro: a fade where the portrait cannot fly to the nav. */
  const exit = () => {
    setFading(!canMorph());
    setPhase("exiting");
  };

  useEffect(() => {
    if (phase !== "cycling") return;

    const timers: number[] = [];
    for (let i = 1; i < INTRO_GREETINGS.length; i += 1) {
      timers.push(
        window.setTimeout(() => setIndex(i), i * INTRO_TIMING.wordMs),
      );
    }
    for (let rank = 1; rank <= INTRO_RANKS; rank += 1) {
      timers.push(
        window.setTimeout(
          () => setShown(rank),
          rank * INTRO_TIMING.printStepMs,
        ),
      );
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
    // The intro-finished signal: a hero waiting on it starts its entrance now.
    markIntroDone();

    const doc = document as TransitionDocument;
    if (!fading && typeof doc.startViewTransition === "function") {
      // The hand-over: the portrait flies into the nav's avatar.
      const root = document.documentElement;
      root.dataset.introMorph = "from";
      const transition = doc.startViewTransition(() => {
        root.dataset.introMorph = "to";
        flushSync(() => setPhase("off"));
      });
      void transition.finished.finally(() => {
        delete root.dataset.introMorph;
      });
      return;
    }
    const id = window.setTimeout(() => setPhase("off"), INTRO_TIMING.exitMs);
    return () => window.clearTimeout(id);
  }, [phase, fading]);

  if (phase === "off") return null;

  const greeting = INTRO_GREETINGS[index] ?? INTRO_GREETINGS[0];
  const exiting = phase === "exiting";
  const arrived = index === INTRO_GREETINGS.length - 1;
  const drawn = Math.round((shown / INTRO_RANKS) * INTRO_CELLS);

  return (
    <div
      data-testid="intro-overlay"
      className={`intro-overlay fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-page${fading ? " is-exiting" : ""}`}
      style={{ transitionDuration: `${INTRO_TIMING.exitMs}ms` }}
    >
      <div className="intro-mint" aria-hidden="true">
        <PixelPortrait
          rows={PORTRAIT}
          shown={shown}
          className="intro-portrait"
        />
        {arrived ? <IntroPixels /> : null}
      </div>
      <p
        key={greeting}
        aria-hidden
        className="intro-word px-6 text-center font-display text-4xl leading-tight tracking-[-0.02em] text-ink sm:text-6xl"
      >
        {greeting}
      </p>
      <p aria-hidden className="t-meta intro-counter">
        {shown === INTRO_RANKS ? INTRO_COPY.minted : INTRO_COPY.minting}{" "}
        {String(drawn).padStart(3, "0")} / {INTRO_CELLS}
      </p>
      <button
        type="button"
        onClick={exit}
        tabIndex={exiting ? -1 : 0}
        className="absolute right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] min-h-9 rounded-full border border-hairline-strong px-4 py-2 font-mono text-label uppercase text-ink-2 transition-colors hover:border-ink/40 hover:text-ink sm:right-6 sm:bottom-6"
      >
        {INTRO_COPY.skip}
      </button>
    </div>
  );
}
