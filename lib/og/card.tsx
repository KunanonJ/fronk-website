import { siteConfig } from "@/lib/site";

export const OG_SIZE = { width: 1200, height: 630 };

export interface OgCardProps {
  /** Small uppercase label above the title (e.g. "Case study"). */
  eyebrow?: string;
  title: string;
  subtitle?: string;
}

/**
 * Shared FogLAMP-mood share card: near-black canvas, quiet wordmark, big
 * display title. Pure element tree — callers wrap it in an ImageResponse.
 */
export function OgCard({ eyebrow, title, subtitle }: OgCardProps) {
  const domain = siteConfig.url.replace(/^https?:\/\//, "").replace(/\/$/, "");

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
        background: "#0a0a0a",
        color: "#f2f2f2",
        fontFamily: "Geist",
      }}
    >
      {/* Top row: wordmark + eyebrow */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: "-0.03em",
          }}
        >
          fronk
          <span
            style={{
              marginLeft: 6,
              width: 11,
              height: 23,
              background: "#f2f2f2",
            }}
          />
        </div>
        {eyebrow ? (
          <div
            style={{
              fontFamily: "Space Mono",
              fontSize: 16,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#8a8a8a",
            }}
          >
            {eyebrow}
          </div>
        ) : null}
      </div>

      {/* Center: title + subtitle */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div
          style={{
            display: "flex",
            fontSize: title.length > 26 ? 64 : 88,
            lineHeight: 1,
            fontWeight: 700,
            letterSpacing: "-0.04em",
            maxWidth: 1000,
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div
            style={{
              display: "flex",
              fontSize: 32,
              lineHeight: 1.25,
              color: "#8a8a8a",
              maxWidth: 920,
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>

      {/* Bottom row: honest signature + domain */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "Space Mono",
          fontSize: 17,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#8a8a8a",
        }}
      >
        <div style={{ display: "flex" }}>{siteConfig.name}</div>
        <div style={{ display: "flex" }}>{domain}</div>
      </div>
    </div>
  );
}
