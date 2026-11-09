import { pixelCells } from "@/components/ui/PixelGrid";
import { brand } from "@/lib/brand/tokens";
import { siteConfig } from "@/lib/site";

export const OG_SIZE = { width: 1200, height: 630 };

export interface OgCardProps {
  /** Small uppercase label above the title (e.g. "Case study", "Skill"). */
  eyebrow?: string;
  title: string;
  subtitle?: string;
}

const CELL = 18;
const GAP = 6;
const GRID = { cols: 9, rows: 11 };

/** Idle pixel motif (Signal + Glaze only; Ember never appears without a label). */
function PixelBlock({ seed }: { seed: number }) {
  const cells = pixelCells({ ...GRID, seed, density: 0.42, state: "idle" });
  const filled = new Map(cells.map((c) => [`${c.x}-${c.y}`, c.tone]));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: GAP }}>
      {Array.from({ length: GRID.rows }, (_, y) => (
        <div key={y} style={{ display: "flex", gap: GAP }}>
          {Array.from({ length: GRID.cols }, (_, x) => {
            const tone = filled.get(`${x}-${y}`);
            return (
              <div
                key={x}
                style={{
                  display: "flex",
                  width: CELL,
                  height: CELL,
                  background:
                    tone === "signal" ? brand.signal : tone === "glaze" ? brand.glaze : "transparent",
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

/** Stable seed from the title, so each page gets its own pattern. */
function seedFrom(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

/**
 * Share card (visual-redesign Phase 4): Paper field, Ink type, a Signal
 * eyebrow and a seeded pixel block. Geist only (labels are tracked uppercase
 * Geist; Satori can't use the woff2 web fonts). Callers wrap it in an
 * ImageResponse.
 */
export function OgCard({ eyebrow, title, subtitle }: OgCardProps) {
  const domain = siteConfig.url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const label = {
    display: "flex",
    fontSize: 17,
    letterSpacing: "0.14em",
    textTransform: "uppercase" as const,
    color: brand.inkMuted,
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: brand.paper,
        color: brand.ink,
        fontFamily: "Geist",
      }}
    >
      <div style={{ position: "absolute", top: 72, right: 72, display: "flex" }}>
        <PixelBlock seed={seedFrom(title)} />
      </div>

      {/* Top row: monogram + wordmark */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, position: "relative" }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: brand.ink,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            fontWeight: 800,
            color: brand.glaze,
          }}
        >
          {brand.monogram}
        </div>
        <div style={{ display: "flex", fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em" }}>
          {brand.wordmark}
        </div>
      </div>

      {/* Eyebrow, title, subtitle */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20, position: "relative", maxWidth: 820 }}>
        <div style={{ ...label, color: brand.signal, fontWeight: 800 }}>
          {eyebrow ?? "Bangkok · Thailand"}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: title.length > 28 ? 58 : 76,
            lineHeight: 1.04,
            fontWeight: 800,
            letterSpacing: "-0.04em",
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div style={{ display: "flex", fontSize: 30, lineHeight: 1.35, color: brand.inkMuted }}>
            {subtitle}
          </div>
        ) : null}
      </div>

      {/* Bottom rule + name + domain */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20, position: "relative" }}>
        <div style={{ width: "100%", height: 1, background: brand.hairline, display: "flex" }} />
        <div style={{ ...label, justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex" }}>{siteConfig.name}</div>
          <div style={{ display: "flex" }}>{domain}</div>
        </div>
      </div>
    </div>
  );
}
