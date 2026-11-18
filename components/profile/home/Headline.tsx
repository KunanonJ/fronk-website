import {
  Fragment,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import { homeHero } from "@/lib/content/home";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

/*
 * The hero's h1 (profile redesign, design spec 8.1 and 12, item 12). Line 1
 * never moves. Line 2 is a slot whose first phrase is today's headline: the
 * server renders the whole sentence, still, so the h1 reads as the live
 * Home's does and the LCP element never fades. With two or more phrases and
 * motion allowed, the line swaps every 4.2 s: the old line blurs away
 * (`kj-line-out`) and is removed when that ends, and the new words stamp in
 * (`kj-word-*`). Both lines are hidden from assistive technology; the h1's
 * name is the full sentence, whatever phrase shows. Its text is only what
 * shows: the sizers draw their phrase from an attribute, in CSS.
 */

/** A phrase as words, numbered on from line 1's for the stamp's stagger. */
export function stampWords(
  phrase: string,
  firstIndex: number,
): readonly { text: string; index: number }[] {
  return phrase
    .split(" ")
    .filter(Boolean)
    .map((text, offset) => ({ text, index: firstIndex + offset }));
}

/** Line 1's word count: line 2's first word stamps in after them. */
const LINE_ONE_WORDS = stampWords(homeHero.greetingLine, 0).length;

function subscribeVisibility(onChange: () => void): () => void {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

export function Headline({
  phrases = homeHero.phrases,
  ready,
  paused = false,
}: {
  /** Line 2's phrases; the first is the server's. */
  phrases?: readonly string[];
  /** The hero can be seen (no intro covers it): the clock may start. */
  ready: boolean;
  /** Held by the hero: its motion toggle, or focus inside it. */
  paused?: boolean;
}) {
  const reduced = useReducedMotion();
  const rotating = !reduced && phrases.length > 1;
  const title = useRef<HTMLHeadingElement>(null);
  const [turn, setTurn] = useState({ index: 0, swaps: 0 });
  /** The last swap whose leaving line has finished its animation. */
  const [gone, setGone] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [offscreen, setOffscreen] = useState(false);
  const hidden = useSyncExternalStore(
    subscribeVisibility,
    () => document.hidden,
    () => false,
  );
  const still = !rotating || !ready || paused || hovered || hidden || offscreen;

  // One swap per phrase stay; any pause clears the clock, and it starts the
  // full stay again when the pause ends.
  useEffect(() => {
    if (still) return;
    const count = phrases.length;
    const id = window.setTimeout(() => {
      setTurn((t) => ({ index: (t.index + 1) % count, swaps: t.swaps + 1 }));
    }, homeHero.rotateMs);
    return () => window.clearTimeout(id);
  }, [still, turn, phrases.length]);

  // Off screen, the line holds still (nobody would see it change).
  useEffect(() => {
    const el = title.current;
    if (!rotating || !el || typeof IntersectionObserver === "undefined") {
      return;
    }
    const observer = new IntersectionObserver(([entry]) =>
      setOffscreen(!(entry?.isIntersecting ?? true)),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rotating]);

  const count = phrases.length;
  const current = phrases[turn.index] ?? phrases[0] ?? "";
  // The line leaving, until its blur ends (never under reduced motion, where
  // nothing would end it).
  const previous =
    rotating && turn.swaps > gone
      ? (phrases[(turn.index - 1 + count) % count] ?? "")
      : null;

  return (
    <h1
      ref={title}
      id="hero-title"
      className="t-hero pf-hero__title"
      aria-label={homeHero.title}
    >
      <span className="pf-hero__line" aria-hidden="true">
        {homeHero.greetingLine}
      </span>{" "}
      <span
        className="pf-hero__line pf-hero__rotor"
        aria-hidden="true"
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        {/* Every phrase, unseen, in the same cell: the line keeps the height
            of the longest, so nothing below it moves on a swap. On the
            server too, and whatever the motion setting, so the line never
            grows after hydration. Drawn by CSS from data-text, so the h1's
            text stays what shows (for copying, and for crawlers that run
            script). */}
        {phrases.length > 1
          ? phrases.map((phrase) => (
              <span
                key={`size-${phrase}`}
                className="pf-hero__sizer"
                aria-hidden="true"
                data-text={phrase}
              />
            ))
          : null}
        {previous !== null ? (
          <span
            key={`out-${turn.swaps}`}
            className="pf-hero__out"
            onAnimationEnd={() => setGone(turn.swaps)}
          >
            {previous}
          </span>
        ) : null}
        {turn.swaps === 0 ? (
          <span className="pf-hero__phrase">{current}</span>
        ) : (
          <span
            key={`in-${turn.swaps}`}
            className="pf-hero__phrase"
            data-stamp=""
          >
            {stampWords(current, LINE_ONE_WORDS).map((word, at) => (
              <Fragment key={word.index}>
                {at > 0 ? " " : null}
                <span
                  className="pf-word"
                  data-side={word.index % 2 === 0 ? "left" : "right"}
                  style={{ "--i": word.index } as CSSProperties}
                >
                  <span className="ds-word-mark pf-word__mark" />
                  <span className="pf-word__text">{word.text}</span>
                </span>
              </Fragment>
            ))}
          </span>
        )}
      </span>
    </h1>
  );
}
