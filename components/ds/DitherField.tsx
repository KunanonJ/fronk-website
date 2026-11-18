import { useEffect, useRef } from "react";
import { ditherCells, type DitherOptions } from "@/components/ds/ditherCells";
import { cn } from "@/lib/utils/cn";

/*
 * A dither field on a canvas (profile redesign, design spec 6.8). Decorative:
 * aria-hidden and without pointer events. Colours come from tokens read with
 * getComputedStyle, so it follows the theme and holds no raw hex. It draws
 * once per size and theme: a ResizeObserver and a theme observer schedule a
 * single redraw in requestAnimationFrame. Never a loop; the backing store is
 * the device pixel ratio capped at 2.
 */
export function DitherField({
  stops = ["--peach", "--tint-4", "--tint-3"],
  cell = 10,
  fade = "down",
  seed = 0,
  className,
}: {
  /** Token names, from the dense edge outward. */
  stops?: readonly string[];
  cell?: number;
  fade?: DitherOptions["fade"];
  seed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const stopKey = stops.join(" ");

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const tokens = stopKey.split(" ");
    let frame = 0;

    const draw = () => {
      frame = 0;
      const { width, height } = canvas.getBoundingClientRect();
      const context = canvas.getContext("2d");
      if (!context || width === 0 || height === 0) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);
      const style = getComputedStyle(canvas);
      const colours = tokens
        .map((token) => style.getPropertyValue(token).trim())
        .filter(Boolean);
      if (colours.length === 0) return;
      for (const c of ditherCells({ width, height, cell, fade, seed })) {
        const band = Math.floor((1 - c.level) * colours.length);
        context.fillStyle = colours[Math.min(band, colours.length - 1)]!;
        context.fillRect(c.x * cell, c.y * cell, cell, cell);
      }
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };
    schedule();
    const resize =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(schedule);
    resize?.observe(canvas);
    // The theme is the class on <html> (next-themes); redraw when it flips.
    const theme = new MutationObserver(schedule);
    theme.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-design"],
    });
    return () => {
      cancelAnimationFrame(frame);
      resize?.disconnect();
      theme.disconnect();
    };
  }, [stopKey, cell, fade, seed]);

  return (
    <canvas
      ref={ref}
      className={cn("ds-dither", className)}
      aria-hidden="true"
    />
  );
}
