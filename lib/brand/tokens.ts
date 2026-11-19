/**
 * Brand values for renderers that cannot read CSS variables: the favicon,
 * the Apple touch icon and the share cards (satori). A mirror of the light
 * theme's tokens in src/styles/globals.css (profile redesign, design spec
 * 2.1 and 2.2); lib/brand/tokens.test.ts fails when the two drift.
 */
export const brand = {
  ink: "#120e1f",
  paper: "#ffffff",
  accent: "#6e3cff",
  /** Accent text on paper (--accent-ink). */
  accentInk: "#4b23c2",
  tint2: "#f3eeff",
  tint3: "#ddd0ff",
  tint4: "#c9b6ff",
  peach: "#ffd9c4",
  /** Secondary text: --ink-60 composited on paper. */
  inkMuted: "#716e79",
  /** A rule: --line composited on paper. */
  hairline: "#e7e7e9",
  /** The name, as the site's nav sets it. */
  wordmark: "Kunanon Jarat.",
  /** The favicon's and touch icon's letter. */
  monogram: "K",
} as const;
