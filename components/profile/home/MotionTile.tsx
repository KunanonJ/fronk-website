import { useState, type CSSProperties } from "react";
import { MotionToggle } from "@/components/ds/MotionToggle";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

/*
 * The About bento's motion tile (profile redesign Phase 3, design spec 8.5):
 * a code-drawn "from mess to product" loop, 36 pixel blocks that scatter and
 * gather into a grid, with a chip caption. It loops, so it has a pause
 * control (WCAG 2.2.2), and like the marquee it moves only once the page has
 * hydrated and motion is allowed, which is when that control exists. The
 * server HTML, a page without JavaScript and reduced motion show the still,
 * gathered grid. Decorative: the blocks are hidden from assistive technology,
 * and the caption, drawn as a chip, is the tile's h3 (WCAG 1.3.1).
 */

/** The grid is 6 by 6. */
const COUNT = 36;

interface Block {
  readonly dx: number;
  readonly dy: number;
  readonly r: number;
  readonly d: number;
}

/**
 * Where each block starts, scattered: the same every render (a seeded
 * Park-Miller sequence), so the server and the client agree.
 */
function scatter(count: number, seed: number): Block[] {
  let state = seed;
  const next = () => {
    state = (state * 16807) % 2147483647;
    return state / 2147483647;
  };
  return Array.from({ length: count }, () => ({
    dx: Math.round((next() - 0.5) * 230),
    dy: Math.round((next() - 0.5) * 230),
    r: Math.round((next() - 0.5) * 140),
    d: Math.round(next() * 60) / 100,
  }));
}

const BLOCKS = scatter(COUNT, 3);

export function MotionTile({
  caption,
  labels,
}: {
  caption: string;
  /** The pause control's names: what a press will do. */
  labels: { pause: string; play: string };
}) {
  const reduced = useReducedMotion();
  const [playing, setPlaying] = useState(true);
  return (
    <div
      className="ds-tile pf-bento__tile pf-bento__motion pf-motion"
      data-running={reduced ? undefined : ""}
      data-paused={playing ? undefined : ""}
    >
      <div className="pf-motion__blocks" aria-hidden="true">
        {BLOCKS.map((block, index) => (
          <span
            key={index}
            className="pf-motion__block"
            style={
              {
                "--dx": `${block.dx}px`,
                "--dy": `${block.dy}px`,
                "--r": `${block.r}deg`,
                "--d": `${block.d}s`,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <h3 className="ds-chip pf-motion__caption">{caption}</h3>
      <div className="pf-motion__toggle">
        <MotionToggle playing={playing} onToggle={setPlaying} labels={labels} />
      </div>
    </div>
  );
}
