import { ditherCells } from "@/components/ds/ditherCells";
import { brand } from "@/lib/brand/tokens";
import { siteConfig } from "@/lib/site";

export const OG_SIZE = { width: 1200, height: 630 };

export interface OgCardProps {
  /** Small uppercase label above the title (e.g. "Case study", "Skill"). */
  eyebrow?: string;
  title: string;
  subtitle?: string;
}

const CELL = 20;
const BAND = { width: OG_SIZE.width, height: 160 };
/** The site's dither stops (DitherField's default), dense edge first. */
const STOPS = [brand.peach, brand.tint4, brand.tint3] as const;

/** Stable seed from the title, so each page gets its own pattern. */
function seedFrom(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1)
    h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

/**
 * The dither band along the card's foot (design spec 6.8): the site's
 * ordered dither, dense at the bottom edge, in its peach and violet tints.
 */
function DitherBand({ seed }: { seed: number }) {
  const cells = ditherCells({ ...BAND, cell: CELL, fade: "up", seed });
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        bottom: 0,
        width: BAND.width,
        height: BAND.height,
        display: "flex",
      }}
    >
      {cells.map((c) => (
        <div
          key={`${c.x}-${c.y}`}
          style={{
            position: "absolute",
            left: c.x * CELL,
            top: c.y * CELL,
            width: CELL,
            height: CELL,
            background:
              STOPS[
                Math.min(
                  Math.floor((1 - c.level) * STOPS.length),
                  STOPS.length - 1,
                )
              ],
          }}
        />
      ))}
    </div>
  );
}

/**
 * Share card (profile redesign, Phase 8c): a paper field with the site's
 * dither band at its foot, the title in Instrument Serif and the rest in
 * Onest, the eyebrow in the accent's text colour with its two-pixel mark.
 * Callers wrap it in an ImageResponse with loadOgFonts().
 */
export function OgCard({ eyebrow, title, subtitle }: OgCardProps) {
  const domain = siteConfig.url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const label = {
    display: "flex",
    fontSize: 17,
    fontWeight: 500,
    letterSpacing: "0.12em",
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
        padding: "64px 72px 196px",
        background: brand.paper,
        color: brand.ink,
        fontFamily: "Onest",
      }}
    >
      <DitherBand seed={seedFrom(title)} />

      {/* The monogram tile and the name, as the site's nav sets them. */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: brand.ink,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Instrument Serif",
            fontSize: 34,
            color: brand.paper,
          }}
        >
          {brand.monogram}
        </div>
        <div
          style={{
            display: "flex",
            fontFamily: "Instrument Serif",
            fontSize: 34,
            letterSpacing: "-0.01em",
          }}
        >
          {brand.wordmark}
        </div>
      </div>

      {/* Eyebrow, title, subtitle */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 18,
          maxWidth: 940,
        }}
      >
        <div
          style={{
            ...label,
            alignItems: "center",
            gap: 12,
            color: brand.accentInk,
          }}
        >
          <div style={{ display: "flex", gap: 3 }}>
            <div style={{ width: 8, height: 8, background: brand.accent }} />
            <div style={{ width: 8, height: 8, background: brand.tint4 }} />
          </div>
          {eyebrow ?? "Bangkok · Thailand"}
        </div>
        <div
          style={{
            display: "flex",
            fontFamily: "Instrument Serif",
            fontSize: title.length > 28 ? 72 : 92,
            lineHeight: 1.02,
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div
            style={{
              display: "flex",
              fontSize: 28,
              lineHeight: 1.4,
              color: brand.inkMuted,
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>

      {/* A rule, then the name and the domain. */}
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div
          style={{
            width: "100%",
            height: 1,
            background: brand.hairline,
            display: "flex",
          }}
        />
        <div
          style={{
            ...label,
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex" }}>{siteConfig.name}</div>
          <div style={{ display: "flex" }}>{domain}</div>
        </div>
      </div>
    </div>
  );
}
