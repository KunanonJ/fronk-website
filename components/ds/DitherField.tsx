import { useEffect, useRef } from "react";
import { ditherCells, type DitherOptions } from "@/components/ds/ditherCells";
import { cn } from "@/lib/utils/cn";

/*
 * A dither field on a canvas (profile redesign, design spec 6.8). Decorative:
 * aria-hidden and without pointer events. Colours come from tokens read with
 * getComputedStyle, so it follows the theme and holds no raw hex. It draws
 * once per size and theme, never in a loop: the first draw and each resize
 * wait for an idle moment (design spec 8d), so they stay off hydration's busy
 * frames; a theme flip redraws on the next frame, before the theme fade
 * snapshots the page. The backing store is the device pixel ratio capped
 * at 2.
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
    let pending: (() => void) | null = null;

    const draw = () => {
      pending = null;
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

    /** Draws at the next idle moment, within 300 ms. */
    const whenIdle = () => {
      if (pending) return;
      if (typeof requestIdleCallback === "function") {
        const id = requestIdleCallback(draw, { timeout: 300 });
        pending = () => cancelIdleCallback(id);
      } else {
        const id = window.setTimeout(draw, 50);
        pending = () => window.clearTimeout(id);
      }
    };
    /** Draws on the next frame, dropping a pending idle draw. */
    const nextFrame = () => {
      pending?.();
      const id = requestAnimationFrame(draw);
      pending = () => cancelAnimationFrame(id);
    };
    whenIdle();
    const resize =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(whenIdle);
    resize?.observe(canvas);
    // The theme is the class on <html> (next-themes); redraw when it flips.
    const theme = new MutationObserver(nextFrame);
    theme.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => {
      pending?.();
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
