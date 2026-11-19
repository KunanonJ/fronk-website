/**
 * WCAG 2.x relative luminance and contrast ratio, with alpha compositing so
 * translucent tokens (e.g. rgba hairlines, 70 % text) are measured over the
 * surface they actually sit on.
 */

export type Rgb = { r: number; g: number; b: number };
export type Rgba = Rgb & { a: number };

/**
 * Parses `#rgb`, `#rrggbb`, `#rrggbbaa`, `rgb(...)`, `rgba(...)`,
 * `oklch(...)` (the profile redesign's case materials) and `transparent`.
 */
export function parseColor(input: string): Rgba {
  const value = input.trim().toLowerCase();
  if (value === "transparent") return { r: 0, g: 0, b: 0, a: 0 };
  const oklch = value.match(/^oklch\(([^)]+)\)$/);
  if (oklch) {
    const [l, c, h] = oklch[1]!.split(/[\s/]+/).filter(Boolean);
    const lightness = l!.endsWith("%") ? parseFloat(l!) / 100 : Number(l);
    return { ...oklchToRgb(lightness, Number(c), Number(h)), a: 1 };
  }
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

/**
 * OKLCH to sRGB (Björn Ottosson's OKLab matrices), clipped to the sRGB gamut.
 * Exact for the in-gamut case materials the contrast tests measure.
 */
function oklchToRgb(l: number, c: number, hDeg: number): Rgb {
  const h = (hDeg * Math.PI) / 180;
  const a = c * Math.cos(h);
  const b = c * Math.sin(h);
  const l3 = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m3 = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s3 = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const linear = [
    4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3,
    -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3,
    -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3,
  ];
  const [r, g, bl] = linear.map((v) => {
    const encoded =
      v <= 0.0031308 ? 12.92 * v : 1.055 * Math.max(v, 0) ** (1 / 2.4) - 0.055;
    return Math.round(Math.min(1, Math.max(0, encoded)) * 255);
  });
  return { r: r!, g: g!, b: bl! };
}

/**
 * `color-mix(in srgb, a p, b)` as CSS computes it: premultiplied alpha, so
 * mixing with `transparent` keeps the colour and scales its alpha.
 */
export function mixColors(a: Rgba, b: Rgba, p: number): Rgba {
  const alpha = a.a * p + b.a * (1 - p);
  if (alpha === 0) return { r: 0, g: 0, b: 0, a: 0 };
  const channel = (x: number, y: number) =>
    (x * a.a * p + y * b.a * (1 - p)) / alpha;
  return {
    r: channel(a.r, b.r),
    g: channel(a.g, b.g),
    b: channel(a.b, b.b),
    a: alpha,
  };
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

function relativeLuminance({ r, g, b }: Rgb): number {
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
