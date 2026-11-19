import { useEffect, useRef } from "react";
import { PixelArt } from "@/components/profile/site/PixelArt";
import { prefersReducedMotion } from "@/lib/motion/motionRuntime";

/*
 * An operating principle in the About bento (profile redesign Phase 3, design
 * spec 8.5): a 64 px code-drawn pixel icon, the principle and its line, as
 * /about prints them. The icon hops once when the tile comes into view and
 * again on hover; never a loop, and never under reduced motion. Pixel art
 * hides in forced colours (PixelArt's `.pf-art`).
 */

/** Our own 16 x 16 drawings, one per principle in aboutPage order. */
const ICONS: readonly (readonly string[])[] = [
  // Ship the smallest thing that proves the bet: a small parcel, sent up.
  [
    "................",
    "................",
    ".......cc.......",
    "......cccc......",
    ".....cccccc.....",
    ".......cc.......",
    ".......cc.......",
    "................",
    "....aaaaaaaa....",
    "....a..aa..a....",
    "....a..aa..a....",
    "....aaaaaaaa....",
    "....a......a....",
    "....aaaaaaaa....",
    "................",
    "................",
  ],
  // Stay close to the work: a magnifier over it.
  [
    "................",
    "................",
    ".....aaaa.......",
    "....a....a......",
    "...a......a.....",
    "...a..cc..a.....",
    "...a..cc..a.....",
    "...a......a.....",
    "....a....a......",
    ".....aaaa.a.....",
    "..........aa....",
    "...........aa...",
    "............aa..",
    "................",
    "................",
    "................",
  ],
  // Optimise for reversibility: a way back.
  [
    "................",
    "................",
    "................",
    ".....c..........",
    "....cc..........",
    "...cccaaaaaa....",
    "....cc......a...",
    ".....c.......a..",
    ".............a..",
    ".............a..",
    "............a...",
    "....aaaaaaaa....",
    "................",
    "................",
    "................",
    "................",
  ],
  // Document as you go: a page, being written.
  [
    "................",
    "................",
    "....aaaaaa......",
    "....a....aa.....",
    "....a....a.a....",
    "....a....aaaa...",
    "....a.......a...",
    "....a.ccccc.a...",
    "....a.......a...",
    "....a.ccccc.a...",
    "....a.......a...",
    "....a.ccc...a...",
    "....a.......a...",
    "....aaaaaaaaa...",
    "................",
    "................",
  ],
];

/**
 * A drawing on its tinted tile: every empty cell inside a square with
 * clipped corners takes the soft tint (PixelArt's "t").
 */
export function iconRows(drawing: readonly string[]): string[] {
  const last = drawing.length - 1;
  return drawing.map((row, y) =>
    [...row]
      .map((cell, x) => {
        if (cell !== ".") return cell;
        const edgeY = y === 0 || y === last;
        const nearY = y === 1 || y === last - 1;
        const edgeX = x === 0 || x === row.length - 1;
        const nearX = x === 1 || x === row.length - 2;
        const corner = (edgeY && (edgeX || nearX)) || (nearY && edgeX);
        return corner ? "." : "t";
      })
      .join(""),
  );
}

export const PRINCIPLE_ICONS = ICONS.map(iconRows);

export function PrincipleTile({
  index,
  title,
  body,
}: {
  /** The principle's place, which picks its icon. */
  index: number;
  title: string;
  body: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tile = ref.current;
    if (
      !tile ||
      prefersReducedMotion() ||
      typeof IntersectionObserver === "undefined"
    ) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          tile.dataset.seen = "";
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(tile);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="ds-tile ds-tile--paper pf-bento__tile pf-bento__principle pf-principle"
    >
      <span className="pf-principle__icon">
        <PixelArt
          rows={PRINCIPLE_ICONS[index % PRINCIPLE_ICONS.length]!}
          className="pf-principle__art"
        />
      </span>
      <h3 className="pf-principle__title">{title}</h3>
      <p className="t-small pf-principle__body">{body}</p>
    </div>
  );
}
