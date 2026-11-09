/**
 * Brand values for renderers that can't read CSS variables (favicon, Apple
 * touch icon, OG share cards via Satori). Mirrors the palette in
 * app/globals.css (visual-redesign, 09-11-26); keep the two in sync.
 */
export const brand = {
  ink: "#0b0d17",
  paper: "#ffffff",
  page: "#f5f6fa",
  glaze: "#e8ebff",
  signal: "#2b3bff",
  clay: "#ffe3d6",
  /** Secondary text on Paper (6.7:1). */
  inkMuted: "#565b70",
  /** Hairline on Paper. */
  hairline: "rgba(11, 13, 23, 0.12)",
  /** Wordmark used in chrome + share cards */
  wordmark: "KunanonJ",
  /** Monogram for favicon / apple touch */
  monogram: "K",
} as const;
