import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type MouseEvent,
} from "react";
import { flushSync } from "react-dom";
import { Pause, Play, X } from "lucide-react";
import { pillClass } from "@/components/ds/Pill";
import {
  closeLightbox,
  openLightbox,
  type LightboxParts,
} from "@/components/profile/case/lightboxMotion";
import { ShowcaseMediaView } from "@/components/profile/case/ShowcaseArt";
import { useFlowStep } from "@/components/profile/case/useFlowStep";
import { caseCopy, type ShowcaseTile } from "@/lib/content/caseStudy";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { prefersReducedMotion } from "@/lib/motion/motionRuntime";
import { cn } from "@/lib/utils/cn";

/*
 * The viewer (profile redesign Phase 5, design spec 9.10): a native modal
 * <dialog> labelled by the tile's title, over a blurred veil. It draws its
 * own copy of the tile's picture, so nothing moves between the page and the
 * dialog; the page's tile steps aside while it is open. Escape (the dialog's
 * cancel event), the close button or a press on the empty stage closes it.
 * While it is open the page behind does not scroll, though a pinch or a
 * ctrl-wheel still zooms. Focus lands on the pause control of a moving
 * picture, else on close, and returns to the tile's Enlarge button, or to the
 * tile's figure when Enlarge is not drawn (the screen narrowed under 810 px
 * while the viewer was open). Styles: `.pf-lightbox*` in case.css.
 */

/** Keys that would scroll the page behind the viewer. */
const SCROLL_KEYS = new Set([
  "ArrowUp",
  "ArrowDown",
  "PageUp",
  "PageDown",
  "Home",
  "End",
  " ",
]);

/**
 * A pinch (two fingers or more) or a ctrl-wheel: a zoom, which stays the
 * reader's while the viewer holds the page still (WCAG 1.4.4).
 */
export function isZoomGesture(event: Event): boolean {
  if (event.type === "wheel") return (event as WheelEvent).ctrlKey;
  if (event.type === "touchmove") {
    return ((event as TouchEvent).touches?.length ?? 0) > 1;
  }
  return false;
}

/** Whether `el` is drawn: Enlarge is `display: none` under 810 px. */
function drawn(el: HTMLElement): boolean {
  return typeof el.checkVisibility === "function"
    ? el.checkVisibility()
    : getComputedStyle(el).display !== "none";
}

function LargeMedia({
  tile,
  initialStep,
  running,
}: {
  tile: ShowcaseTile;
  initialStep: number;
  running: boolean;
}) {
  const steps =
    tile.media.kind === "illustration" && tile.media.art.type === "flow"
      ? tile.media.art.steps.length
      : 0;
  const step = useFlowStep(steps, running, initialStep);
  return <ShowcaseMediaView media={tile.media} step={step} large />;
}

export function CaseLightbox({
  tile,
  initialStep,
  playing,
  onTogglePlaying,
  onClosed,
}: {
  /** The tile on view, or none while the viewer is closed. */
  tile: ShowcaseTile | null;
  initialStep: number;
  playing: boolean;
  onTogglePlaying: () => void;
  onClosed: () => void;
}) {
  const reduced = useReducedMotion();
  const dialog = useRef<HTMLDialogElement>(null);
  const veil = useRef<HTMLDivElement>(null);
  const large = useRef<HTMLDivElement>(null);
  const caption = useRef<HTMLElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const pauseButton = useRef<HTMLButtonElement>(null);
  /** True from the opening until the dialog has closed. */
  const isOpen = useRef(false);
  const closing = useRef(false);
  const tileId = tile?.id;
  const moving = Boolean(tile?.animated) && !reduced;

  const parts = useCallback((): LightboxParts | null => {
    if (!large.current || !veil.current) return null;
    const extras = [caption.current, closeButton.current, pauseButton.current];
    return {
      tile: large.current,
      veil: veil.current,
      extras: extras.filter((el): el is HTMLElement => el !== null),
    };
  }, []);

  /** The page's tile: where the viewer's tile grows from and returns to. */
  const origin = useCallback(
    () =>
      tileId
        ? document.querySelector<HTMLElement>(`[data-sc-tile="${tileId}"]`)
        : null,
    [tileId],
  );

  const finish = useCallback(() => {
    if (!isOpen.current) return;
    isOpen.current = false;
    closing.current = false;
    const el = dialog.current;
    // The attribute, which `open` reflects, also covers engines without
    // the dialog methods.
    if (el?.hasAttribute("open")) {
      if (typeof el.close === "function") el.close();
      else el.removeAttribute("open");
    }
    const opener = tileId
      ? document.querySelector<HTMLElement>(`[data-sc-enlarge="${tileId}"]`)
      : null;
    // The page's tile is hidden until the parent hears of the close, and a
    // hidden button cannot take focus: commit that first, then return focus.
    flushSync(onClosed);
    // Under 810 px Enlarge is not drawn and cannot take focus, which would
    // fall to the page: the tile's figure takes it instead.
    const target =
      opener && drawn(opener)
        ? opener
        : tileId
          ? document.querySelector<HTMLElement>(`[data-sc-figure="${tileId}"]`)
          : null;
    target?.focus();
  }, [tileId, onClosed]);

  const requestClose = useCallback(() => {
    if (!isOpen.current || closing.current) return;
    closing.current = true;
    const motion = parts();
    const from = origin()?.getBoundingClientRect() ?? null;
    void (
      motion
        ? closeLightbox(motion, from, prefersReducedMotion())
        : Promise.resolve()
    ).then(finish);
  }, [parts, origin, finish]);

  // Opening: into the top layer, the tile grown from its place, then focus.
  useLayoutEffect(() => {
    const el = dialog.current;
    if (!tileId || !el) return;
    isOpen.current = true;
    closing.current = false;
    if (!el.hasAttribute("open")) {
      if (typeof el.showModal === "function") el.showModal();
      else el.setAttribute("open", "");
    }
    const motion = parts();
    if (motion) {
      const from = origin()?.getBoundingClientRect() ?? null;
      void openLightbox(motion, from, prefersReducedMotion());
    }
    (pauseButton.current ?? closeButton.current)?.focus();
  }, [tileId, parts, origin]);

  // While open, the page behind keeps still: no wheel, touch or key scrolls.
  // A zoom still zooms, and Space still presses a focused button.
  useEffect(() => {
    if (!tileId) return;
    const stop = (event: Event) => {
      if (!isZoomGesture(event)) event.preventDefault();
    };
    const onKey = (event: KeyboardEvent) => {
      if (!SCROLL_KEYS.has(event.key)) return;
      const target = event.target as Element | null;
      if (event.key === " " && target?.closest("button")) return;
      event.preventDefault();
    };
    window.addEventListener("wheel", stop, { passive: false });
    window.addEventListener("touchmove", stop, { passive: false });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchmove", stop);
      window.removeEventListener("keydown", onKey);
    };
  }, [tileId]);

  const onStage = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) requestClose();
  };

  return (
    <dialog
      ref={dialog}
      className="pf-lightbox"
      aria-labelledby={tile ? "case-lightbox-title" : undefined}
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      // Closed by other means (a second Escape the browser does not let the
      // page refuse): put everything back without the animation.
      onClose={finish}
    >
      {tile ? (
        <>
          <div ref={veil} className="pf-lightbox__veil" aria-hidden="true" />
          {/* A press on the empty stage closes the viewer; Escape and the
              close button do the same by keyboard. */}
          <div
            className="pf-lightbox__stage"
            style={{ "--ratio": tile.ratio } as CSSProperties}
            onClick={onStage}
          >
            <figure className="pf-lightbox__figure">
              <div
                ref={large}
                className="pf-sc__tile pf-lightbox__tile"
                data-tone={tile.tone}
              >
                <LargeMedia
                  key={tile.id}
                  tile={tile}
                  initialStep={initialStep}
                  running={moving && playing}
                />
              </div>
              <figcaption ref={caption} className="pf-lightbox__cap">
                {tile.media.kind === "illustration" ? (
                  <span className="t-meta pf-lightbox__label">
                    {caseCopy.illustration}
                  </span>
                ) : null}
                <span id="case-lightbox-title" className="pf-lightbox__title">
                  {tile.title}
                </span>
                {tile.text ? <span>{tile.text}</span> : null}
              </figcaption>
            </figure>
            <button
              ref={closeButton}
              type="button"
              className={cn(
                pillClass({ variant: "ghost", round: true }),
                "pf-lightbox__btn pf-lightbox__btn--close",
              )}
              aria-label={caseCopy.close}
              onClick={requestClose}
            >
              <X size={16} strokeWidth={1.8} aria-hidden="true" />
            </button>
            {moving ? (
              <button
                ref={pauseButton}
                type="button"
                className={cn(
                  pillClass({ variant: "ghost", round: true }),
                  "pf-lightbox__btn pf-lightbox__btn--pause",
                )}
                aria-label={playing ? caseCopy.pause : caseCopy.play}
                onClick={onTogglePlaying}
              >
                {playing ? (
                  <Pause size={16} strokeWidth={1.8} aria-hidden="true" />
                ) : (
                  <Play size={16} strokeWidth={1.8} aria-hidden="true" />
                )}
              </button>
            ) : null}
          </div>
        </>
      ) : null}
    </dialog>
  );
}
