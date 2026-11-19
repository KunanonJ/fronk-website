import { Check } from "lucide-react";
import type { ShowcaseArt, ShowcaseMedia } from "@/lib/content/caseStudy";
import { pad2 } from "@/lib/utils/pad2";

/*
 * The showcase's pictures (profile redesign Phase 5, design spec 9.9), drawn
 * in HTML from the case's own data so their words stay real text at 12 px or
 * more and grow with the tile (container units): a workflow, its steps
 * checked off in turn, and the architecture's layers, each part a bar. Each
 * is `role="img"` with a name that says what it shows; its words are
 * presentational inside it. A registered screenshot is an image with its alt.
 * Styles: `.pf-flow*`, `.pf-layers-art*` and `.pf-sc__shot` in case.css.
 */

/** Every step done: the still frame (server HTML and reduced motion). */
export function flowState(
  index: number,
  step: number,
): "done" | "now" | "next" {
  if (index < step) return "done";
  return index === step ? "now" : "next";
}

function FlowArt({ steps, step }: { steps: readonly string[]; step: number }) {
  return (
    <div className="pf-flow">
      <ol className="pf-flow__list">
        {steps.map((label, index) => {
          const state = flowState(index, step);
          return (
            <li key={label} className="pf-flow__step" data-state={state}>
              <span className="pf-flow__dot">
                {state === "done" ? (
                  <Check size={14} strokeWidth={2.4} aria-hidden="true" />
                ) : (
                  pad2(index + 1)
                )}
              </span>
              <span className="pf-flow__label">{label}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function LayersArt({
  layers,
}: {
  layers: Extract<ShowcaseArt, { type: "layers" }>["layers"];
}) {
  return (
    <div className="pf-layers-art">
      {layers.map((layer) => (
        <div key={layer.label} className="pf-layers-art__band">
          <span className="pf-layers-art__label">{layer.label}</span>
          <span className="pf-layers-art__nodes">
            {Array.from({ length: layer.nodes }, (_, index) => (
              <span key={index} className="pf-layers-art__node" />
            ))}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ShowcaseMediaView({
  media,
  step,
  large = false,
}: {
  media: ShowcaseMedia;
  /** The workflow's current step; its length means every step is done. */
  step: number;
  /** The viewer's copy: loaded at once. */
  large?: boolean;
}) {
  if (media.kind === "screenshot") {
    const { image } = media;
    return (
      <img
        className="pf-sc__shot"
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        loading={large ? "eager" : "lazy"}
        decoding="async"
      />
    );
  }
  const { art } = media;
  return (
    <div
      className="pf-sc__art"
      data-art={art.type}
      role="img"
      aria-label={media.label}
    >
      {art.type === "flow" ? (
        <FlowArt steps={art.steps} step={step} />
      ) : (
        <LayersArt layers={art.layers} />
      )}
    </div>
  );
}
