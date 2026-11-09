/**
 * WCAG 2.x relative luminance and contrast ratio, with alpha compositing so
 * translucent tokens (e.g. rgba hairlines, 70 % text) are measured over the
 * surface they actually sit on.
 */

export type Rgb = { r: number; g: number; b: number };
export type Rgba = Rgb & { a: number };

/** Parses `#rgb`, `#rrggbb`, `#rrggbbaa`, `rgb(...)` and `rgba(...)`. */
export function parseColor(input: string): Rgba {
  const value = input.trim().toLowerCase();
  const hex = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/);
  if (hex) {
    const h = hex[1]!;
    if (h.length === 3) {
      const [r, g, b] = h.split("").map((c) => parseInt(c + c, 16));
      return { r: r!, g: g!, b: b!, a: 1 };
    }
    const n = (i: number) => parseInt(h.slice(i, i + 2), 16);
    return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) / 255 : 1 };
  }
  const fn = value.match(/^rgba?\(([^)]+)\)$/);
  if (fn) {
    const parts = fn[1]!.split(/[\s,/]+/).filter(Boolean);
    const [r, g, b] = parts.slice(0, 3).map(Number);
    const a =
      parts[3] === undefined
        ? 1
        : parts[3].endsWith("%")
          ? parseFloat(parts[3]) / 100
          : Number(parts[3]);
    if ([r, g, b, a].every((n) => Number.isFinite(n)))
      return { r: r!, g: g!, b: b!, a };
  }
  throw new Error(`Unsupported colour: ${input}`);
}

/** Paints `fg` (possibly translucent) over an opaque `bg`. */
export function composite(fg: Rgba, bg: Rgb): Rgb {
  const mix = (f: number, b: number) => Math.round(f * fg.a + b * (1 - fg.a));
  return { r: mix(fg.r, bg.r), g: mix(fg.g, bg.g), b: mix(fg.b, bg.b) };
}

function channel(v: number): number {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance({ r, g, b }: Rgb): number {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/**
 * Contrast ratio between `fg` and `bg`. Translucent colours are composited:
 * `bg` over `base` (default white) first, then `fg` over the result.
 */
export function contrastRatio(
  fg: string,
  bg: string,
  base = "#ffffff",
): number {
  const baseRgb = parseColor(base);
  const bgRgb = composite(parseColor(bg), baseRgb);
  const fgRgb = composite(parseColor(fg), bgRgb);
  const [hi, lo] = [relativeLuminance(fgRgb), relativeLuminance(bgRgb)].sort(
    (x, y) => y - x,
  );
  return (hi! + 0.05) / (lo! + 0.05);
}

/** WCAG 2.x thresholds. */
export const AA_TEXT = 4.5;
export const AA_NON_TEXT = 3;
