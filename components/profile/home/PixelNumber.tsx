import { useRef } from "react";
import { useCountUp } from "@/lib/hooks/useCountUp";
import { cn } from "@/lib/utils/cn";

/*
 * Figures in our own 5 x 7 pixel digits (profile redesign, design spec 8.5
 * and 12 item 30). The drawing is an SVG hidden from assistive technology;
 * the figure is also real text, visually hidden, so screen readers and
 * search read "1,000", not a picture. It fills with the text colour.
 * Below the fold it counts up once as it comes into view (useCountUp): the
 * frames go in a second path inside the figure's own box, left-aligned, and
 * the real drawing is hidden meanwhile (`.pf-pixel-number*` in
 * home-work-about.css).
 */

/** One glyph per character: rows top to bottom, "#" a lit pixel. */
const GLYPHS: Readonly<Record<string, readonly string[]>> = {
  "0": [".###.", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  "1": ["..#..", ".##..", "..#..", "..#..", "..#..", "..#..", ".###."],
  "2": [".###.", "#...#", "....#", "...#.", "..#..", ".#...", "#####"],
  "3": ["####.", "....#", "....#", ".###.", "....#", "....#", "####."],
  "4": ["...#.", "..##.", ".#.#.", "#..#.", "#####", "...#.", "...#."],
  "5": ["#####", "#....", "####.", "....#", "....#", "#...#", ".###."],
  "6": ["..##.", ".#...", "#....", "####.", "#...#", "#...#", ".###."],
  "7": ["#####", "....#", "...#.", "..#..", ".#...", ".#...", ".#..."],
  "8": [".###.", "#...#", "#...#", ".###.", "#...#", "#...#", ".###."],
  "9": [".###.", "#...#", "#...#", ".####", "....#", "...#.", ".##.."],
  "+": [".....", "..#..", "..#..", "#####", "..#..", "..#..", "....."],
  "%": ["##..#", "##.#.", "...#.", "..#..", ".#...", ".#.##", "#..##"],
  ",": ["..", "..", "..", "..", "##", ".#", "#."],
  ".": [".", ".", ".", ".", ".", ".", "#"],
};

/** Rows in every glyph. */
const ROWS = 7;

/** A figure as one SVG path, one unit square per pixel, a column apart. */
export function pixelFigure(value: string): { width: number; path: string } {
  let x = 0;
  const squares: string[] = [];
  for (const char of value) {
    const glyph = GLYPHS[char];
    if (!glyph) throw new Error(`No pixel glyph for "${char}" in "${value}".`);
    glyph.forEach((row, y) => {
      [...row].forEach((cell, dx) => {
        if (cell === "#") squares.push(`M${x + dx} ${y}h1v1h-1z`);
      });
    });
    x += glyph[0]!.length + 1;
  }
  return { width: Math.max(0, x - 1), path: squares.join("") };
}

/** Draws a count-up frame in the second path, or with null takes it away. */
function drawFrame(svg: SVGSVGElement, frame: string | null): void {
  const count = svg.querySelector(".pf-pixel-number__count");
  if (frame === null) {
    svg.removeAttribute("data-counting");
    count?.removeAttribute("d");
    return;
  }
  count?.setAttribute("d", pixelFigure(frame).path);
  svg.setAttribute("data-counting", "");
}

export function PixelNumber({
  value,
  className,
}: {
  /** Digits, separators and a closing "+" or "%": "1,000", "220+". */
  value: string;
  className?: string;
}) {
  const { width, path } = pixelFigure(value);
  const svg = useRef<SVGSVGElement>(null);
  useCountUp(svg, value, drawFrame);
  return (
    <span className={cn("pf-pixel-number", className)}>
      <span className="sr-only">{value}</span>
      <svg
        ref={svg}
        viewBox={`0 0 ${width} ${ROWS}`}
        style={{ aspectRatio: `${width} / ${ROWS}` }}
        aria-hidden="true"
        focusable="false"
        shapeRendering="crispEdges"
      >
        <path className="pf-pixel-number__figure" d={path} />
        <path className="pf-pixel-number__count" />
      </svg>
    </span>
  );
}
