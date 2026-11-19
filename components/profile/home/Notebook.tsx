import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";
import { pillClass } from "@/components/ds/Pill";
import {
  autoplayMs,
  pageDepth,
  pageState,
  stepPage,
  turnsOnRelease,
  wordCount,
} from "@/components/profile/home/notebookRules";
import { useHydrated } from "@/components/profile/site/popover";
import {
  notesCopy,
  roleLine,
  type Testimonial,
} from "@/lib/content/testimonials";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { cn } from "@/lib/utils/cn";
import { pad2 } from "@/lib/utils/pad2";

/*
 * The testimonial notebook (profile redesign Phase 4, design spec 8.7). From
 * 810 px a two-leaf spread: a lavender cover on the left and a pile of lined
 * pages on the right, bound by a spiral; under 810 px one page that bleeds to
 * the left edge; spanned across a hinge, the spread opens across both screens.
 *
 * A page turns over its left edge (`--turn`, a registered number, 0 to 1, in
 * 1 s); the open page is the only one not `inert`. Readers turn pages with the
 * previous and next buttons, or by dragging the page past a quarter of its
 * width or flicking it. With motion allowed the notebook also turns on its
 * own, after min(18 s, max(7 s, 2 s + 180 ms a word)); it holds while the
 * pointer is over it, while focus is inside, while it is off screen and by
 * its pause button, whose ring counts down to the next turn. The live region
 * names the page after a reader's turn only, never during autoplay. Under
 * reduced motion pages change at once and nothing turns on its own.
 *
 * The server HTML lists every note (no page is inert until the script runs),
 * so a reader without JavaScript can scroll through them all. Only real,
 * cleared entries reach the Home (lib/content/testimonials.ts); the preview
 * passes labelled samples.
 */

/**
 * The spread's breakpoint; crossing it opens the notebook at page one. Range
 * syntax, as home-journey.css writes it, so no fractional width falls between
 * the phone and the spread layouts.
 */
const SPREAD = "(width >= 50.625rem)";
const RINGS = 12;
/** Horizontal travel, in px, before a press on the book becomes a drag. */
const DRAG_START = 8;
/** A pointer still for longer than this before release ends with no flick. */
const RESTING_MS = 100;

type NotesCopy = { readonly [K in keyof typeof notesCopy]: string };

interface Drag {
  id: number;
  x: number;
  y: number;
  /** 1 turns the open page over; -1 brings the last turned page back. */
  direction: 0 | 1 | -1;
  width: number;
  progress: number;
  lastX: number;
  lastT: number;
  /** Toward the turn, in px/ms. */
  speed: number;
}

export function Notebook({
  entries,
  copy = notesCopy,
}: {
  entries: readonly Testimonial[];
  copy?: NotesCopy;
}) {
  const hydrated = useHydrated();
  const reduced = useReducedMotion();
  const total = entries.length;
  const [page, setPage] = useState(0);
  /** Every turn, so the countdown restarts even on the same page. */
  const [turns, setTurns] = useState(0);
  /** A reader's turn is announced; autoplay stays silent. */
  const [announce, setAnnounce] = useState(false);
  /** The page cast runs on the page a one-step turn uncovers. */
  const [cast, setCast] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [inView, setInView] = useState(true);
  const [docHidden, setDocHidden] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);

  const autoplay = hydrated && !reduced && total > 1;
  const held = paused || hovered || focused || !inView || docHidden;
  const duration = autoplayMs(wordCount(entries[page]?.quote ?? ""));
  /** What is left of this page's wait, kept across holds. */
  const remaining = useRef(duration);

  useEffect(() => {
    remaining.current = duration;
  }, [page, turns, duration]);

  useEffect(() => {
    if (!autoplay || held) return;
    const started = Date.now();
    const timer = window.setTimeout(() => {
      setPage((current) => stepPage(current, 1, total));
      setTurns((count) => count + 1);
      setCast((count) => count + 1);
      setAnnounce(false);
    }, remaining.current);
    return () => {
      window.clearTimeout(timer);
      remaining.current = Math.max(
        0,
        remaining.current - (Date.now() - started),
      );
    };
  }, [autoplay, held, page, turns, total]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver((seen) =>
      setInView(seen.some((entry) => entry.isIntersecting)),
    );
    observer.observe(wrap);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const update = () => setDocHidden(document.visibilityState === "hidden");
    document.addEventListener("visibilitychange", update);
    const spread = window.matchMedia(SPREAD);
    const reset = () => {
      setPage(0);
      setTurns((count) => count + 1);
    };
    spread.addEventListener("change", reset);
    return () => {
      document.removeEventListener("visibilitychange", update);
      spread.removeEventListener("change", reset);
    };
  }, []);

  if (total === 0) return null;

  const turn = (direction: 1 | -1) => {
    setPage((current) => stepPage(current, direction, total));
    setTurns((count) => count + 1);
    if (direction === 1) setCast((count) => count + 1);
    setAnnounce(true);
  };

  const pageAt = (index: number) =>
    bookRef.current?.querySelector<HTMLElement>(`[data-page="${index}"]`) ??
    null;

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!hydrated || total < 2) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if ((event.target as Element).closest("a, button")) return;
    const leaf = bookRef.current?.querySelector(".pf-book__pages");
    drag.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      direction: 0,
      width: Math.max(1, leaf?.getBoundingClientRect().width ?? 1),
      progress: 0,
      lastX: event.clientX,
      lastT: event.timeStamp,
      speed: 0,
    };
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current || current.id !== event.pointerId) return;
    const dx = event.clientX - current.x;
    const dy = event.clientY - current.y;
    if (current.direction === 0) {
      // Mostly vertical: the reader is scrolling the page.
      if (Math.abs(dy) > DRAG_START && Math.abs(dy) > Math.abs(dx)) {
        drag.current = null;
        return;
      }
      if (Math.abs(dx) < DRAG_START) return;
      const direction = dx < 0 ? 1 : -1;
      // A drag turns one page within the pile; the buttons wrap round.
      if (direction === 1 ? page >= total - 1 : page <= 0) {
        drag.current = null;
        return;
      }
      current.direction = direction;
      event.currentTarget.setPointerCapture(event.pointerId);
      event.currentTarget.dataset.dragging = "";
      // A mouse press on the quote began selecting it: a page turn selects
      // nothing (the stylesheet stops any further selection).
      window.getSelection()?.removeAllRanges();
    }
    const toward = -current.direction;
    current.progress = Math.min(1, Math.max(0, (toward * dx) / current.width));
    const dt = event.timeStamp - current.lastT;
    if (dt > 0) {
      current.speed = (toward * (event.clientX - current.lastX)) / dt;
      current.lastX = event.clientX;
      current.lastT = event.timeStamp;
    }
    const forward = current.direction === 1;
    pageAt(forward ? page : page - 1)?.style.setProperty(
      "--turn",
      String(forward ? current.progress : 1 - current.progress),
    );
    pageAt(forward ? page + 1 : page)?.style.setProperty(
      "--cast",
      String(Math.sin(Math.PI * current.progress)),
    );
  };

  const onPointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current || current.id !== event.pointerId) return;
    drag.current = null;
    const book = event.currentTarget;
    if (book.hasPointerCapture(event.pointerId))
      book.releasePointerCapture(event.pointerId);
    if (current.direction === 0) return;
    delete book.dataset.dragging;
    const forward = current.direction === 1;
    pageAt(forward ? page + 1 : page)?.style.removeProperty("--cast");
    // A pointer that rested before letting go was not flicking.
    const resting = event.timeStamp - current.lastT > RESTING_MS;
    if (
      event.type !== "pointercancel" &&
      turnsOnRelease(
        current.progress * current.width,
        current.width,
        resting ? 0 : current.speed,
      )
    ) {
      turn(current.direction);
    } else {
      // Spring back: the page returns to where it rests, in its 1 s turn.
      pageAt(forward ? page : page - 1)?.style.setProperty(
        "--turn",
        forward ? "0" : "1",
      );
    }
  };

  const open = entries[page];
  const button = cn(
    pillClass({ variant: "ghost", size: "nav", round: true }),
    "pf-book__btn",
  );

  return (
    <div
      ref={wrapRef}
      className="pf-book-wrap"
      role="group"
      aria-roledescription="carousel"
      aria-label={copy.label}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null))
          setFocused(false);
      }}
    >
      <div
        ref={bookRef}
        className="pf-book"
        data-ready={hydrated ? "" : undefined}
        data-autoplay={autoplay ? "" : undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
      >
        <div className="pf-book__cover">
          <p className="t-meta pf-book__label">{copy.coverLabel}</p>
          <p className="t-italic pf-book__line">{copy.coverLine}</p>
          <p className="t-meta pf-book__label pf-book__total">
            {total} {copy.countSuffix}
          </p>
        </div>
        <div className="pf-book__pages">
          {entries.map((entry, index) => {
            const state = pageState(index, page);
            const away = hydrated && state !== "current";
            const depth = pageDepth(index, page, total);
            return (
              <article
                key={index}
                data-page={index}
                data-state={state}
                className="pf-page"
                aria-label={`${copy.pageLabel} ${index + 1} of ${total}`}
                inert={away || undefined}
                aria-hidden={away || undefined}
                style={
                  {
                    "--turn": state === "turned" ? 1 : 0,
                    "--z": `${depth}px`,
                    zIndex: depth,
                  } as CSSProperties
                }
              >
                <figure className="pf-page__face pf-page__front">
                  <blockquote className="t-quote pf-page__quote">
                    <p>{entry.quote}</p>
                  </blockquote>
                  <figcaption className="pf-page__who">
                    <span className="pf-page__avatar" aria-hidden="true">
                      {entry.initials}
                    </span>
                    <span className="pf-page__person">
                      <span className="pf-page__name">{entry.name}</span>
                      <span className="sr-only">, </span>
                      <span className="pf-page__role">{roleLine(entry)}</span>
                    </span>
                    <span className="pf-page__number" aria-hidden="true">
                      {pad2(index + 1)}
                    </span>
                  </figcaption>
                </figure>
                <span
                  className="pf-page__face pf-page__back"
                  aria-hidden="true"
                />
                <span className="pf-page__shade" aria-hidden="true" />
                <span
                  key={state === "current" ? cast : -1}
                  className="pf-page__cast"
                  data-run={state === "current" && cast > 0 ? "" : undefined}
                  aria-hidden="true"
                />
              </article>
            );
          })}
        </div>
        <div className="pf-book__spiral" aria-hidden="true">
          {Array.from({ length: RINGS }, (_, index) => (
            <span key={index} />
          ))}
        </div>
      </div>
      {hydrated ? (
        <div className="pf-book__controls">
          <button
            type="button"
            className={cn(button, "pf-book__prev")}
            aria-label={copy.previous}
            onClick={() => turn(-1)}
          >
            <ArrowLeft size={16} strokeWidth={1.8} aria-hidden="true" />
          </button>
          {autoplay ? (
            <button
              type="button"
              className={cn(button, "pf-book__pause")}
              aria-label={paused ? copy.play : copy.pause}
              onClick={() => setPaused((value) => !value)}
            >
              <span
                key={`${page}-${turns}`}
                className="pf-book__count"
                data-held={held ? "" : undefined}
                style={{ "--book-ms": `${duration}ms` } as CSSProperties}
                aria-hidden="true"
              />
              {paused ? (
                <Play size={16} strokeWidth={1.8} aria-hidden="true" />
              ) : (
                <Pause size={16} strokeWidth={1.8} aria-hidden="true" />
              )}
            </button>
          ) : null}
          <button
            type="button"
            className={cn(button, "pf-book__next")}
            aria-label={copy.next}
            onClick={() => turn(1)}
          >
            <ArrowRight size={16} strokeWidth={1.8} aria-hidden="true" />
          </button>
        </div>
      ) : null}
      <p className="sr-only" aria-live="polite">
        {announce && open
          ? `${copy.pageLabel} ${page + 1} of ${total}: ${open.name}`
          : ""}
      </p>
    </div>
  );
}
