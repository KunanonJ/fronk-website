import type { CSSProperties, MouseEvent } from "react";
import { Maximize2, Pause, Play } from "lucide-react";
import { pillClass } from "@/components/ds/Pill";
import { ShowcaseMediaView } from "@/components/profile/case/ShowcaseArt";
import { useFlowStep } from "@/components/profile/case/useFlowStep";
import { caseCopy, type ShowcaseTile as Tile } from "@/lib/content/caseStudy";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { cn } from "@/lib/utils/cn";

/*
 * A showcase tile (profile redesign Phase 5, design spec 9.9): the picture on
 * its tone, then its caption, which starts with "Illustration" on a drawn
 * picture. Two 44 px round buttons sit on the tile, shown on hover, focus or
 * touch screens: "Enlarge" (from 810 px) opens the viewer, and on a moving
 * picture the pause control (WCAG 2.2.2), which is not drawn under reduced
 * motion. From 810 px a press on the tile itself opens the viewer too; under
 * it a press does nothing. Styles: `.pf-sc*` in src/styles/profile/case.css.
 */

/** The viewer opens from 810 px (spec 9.10): the `tablet` breakpoint. */
export const VIEWER_QUERY = "(min-width: 50.625rem)";

export function viewerAllowed(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia(VIEWER_QUERY).matches
  );
}

export function ShowcaseTile({
  tile,
  playing,
  hidden,
  onTogglePlaying,
  onOpen,
}: {
  tile: Tile;
  playing: boolean;
  /** True while the viewer shows this tile: the page copy steps aside. */
  hidden: boolean;
  onTogglePlaying: () => void;
  /** Opens the viewer at `step`, the workflow's current step. */
  onOpen: (step: number) => void;
}) {
  const reduced = useReducedMotion();
  const steps =
    tile.media.kind === "illustration" && tile.media.art.type === "flow"
      ? tile.media.art.steps.length
      : 0;
  const moving = tile.animated && !reduced;
  const step = useFlowStep(steps, moving && playing && !hidden);
  const illustration = tile.media.kind === "illustration";
  const titleId = `sc-${tile.id}-title`;

  const onTile = (event: MouseEvent<HTMLDivElement>) => {
    if ((event.target as Element).closest("button")) return;
    if (viewerAllowed()) onOpen(step);
  };

  return (
    <figure
      className={cn("pf-sc", tile.size === "full" && "pf-sc--full")}
      aria-labelledby={titleId}
    >
      {/* The tile is not a control itself: the Enlarge button is its
          keyboard and screen-reader way in, so the press here only helps a
          pointer. */}
      <div
        className="pf-sc__tile"
        data-tone={tile.tone}
        data-sc-tile={tile.id}
        data-viewing={hidden || undefined}
        style={{ "--ratio": tile.ratio } as CSSProperties}
        onClick={onTile}
      >
        <ShowcaseMediaView media={tile.media} step={step} />
        {moving ? (
          <button
            type="button"
            className={cn(
              pillClass({ variant: "ghost", round: true }),
              "pf-sc__btn pf-sc__btn--pause",
            )}
            aria-label={playing ? caseCopy.pause : caseCopy.play}
            onClick={onTogglePlaying}
          >
            {playing ? (
              <Pause size={14} strokeWidth={1.8} aria-hidden="true" />
            ) : (
              <Play size={14} strokeWidth={1.8} aria-hidden="true" />
            )}
          </button>
        ) : null}
        <button
          type="button"
          className={cn(
            pillClass({ variant: "ghost", round: true }),
            "pf-sc__btn pf-sc__btn--enlarge",
          )}
          aria-label={`${caseCopy.enlarge}: ${tile.title}`}
          aria-haspopup="dialog"
          data-sc-enlarge={tile.id}
          onClick={() => onOpen(step)}
        >
          <Maximize2 size={14} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </div>
      <figcaption className="pf-sc__cap">
        {illustration ? (
          <span className="t-meta pf-sc__label">{caseCopy.illustration}</span>
        ) : null}
        <span id={titleId} className="pf-sc__title">
          {tile.title}
        </span>
        {tile.text ? <span className="pf-sc__text">{tile.text}</span> : null}
      </figcaption>
    </figure>
  );
}
