import { brand } from "@/lib/brand/tokens";
import { siteConfig } from "@/lib/site";

export const OG_SIZE = { width: 1200, height: 630 };

export interface OgCardProps {
  /** Small uppercase label above the title (e.g. "Press", "Blog"). */
  eyebrow?: string;
  title: string;
  subtitle?: string;
}

/**
 * Brand share card — black canvas, cream type, KunanonJ wordmark.
 * Pure element tree; callers wrap it in an ImageResponse.
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
        background: brand.black,
        color: brand.cream,
        fontFamily: "Geist",
      }}
    >
      {/* Soft cream wash in the corner for depth (Satori-friendly blocks) */}
      <div
        style={{
          position: "absolute",
          top: -120,
          right: -80,
          width: 420,
          height: 420,
          borderRadius: 420,
          background: "rgba(222, 219, 200, 0.06)",
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -160,
          left: -100,
          width: 480,
          height: 480,
          borderRadius: 480,
          background: "rgba(222, 219, 200, 0.04)",
          display: "flex",
        }}
      />

      {/* Top row: wordmark + eyebrow / locale */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              border: `1.5px solid ${brand.creamLine}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontStyle: "italic",
              fontSize: 26,
              color: brand.cream,
            }}
          >
            {brand.monogram}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              color: brand.cream,
            }}
          >
            {brand.wordmark}
          </div>
        </div>
        <div
          style={{
            fontFamily: "Space Mono",
            fontSize: 16,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: brand.creamMuted,
            display: "flex",
          }}
        >
          {eyebrow ?? "Bangkok · Thailand"}
        </div>
      </div>

      {/* Center: title + subtitle */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 22,
          position: "relative",
          maxWidth: 1040,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: title.length > 28 ? 58 : 78,
            lineHeight: 1.05,
            fontWeight: 700,
            letterSpacing: "-0.035em",
            color: brand.cream,
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div
            style={{
              display: "flex",
              fontSize: 30,
              lineHeight: 1.35,
              color: brand.creamMuted,
              maxWidth: 900,
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>

      {/* Bottom rule + domain */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          position: "relative",
        }}
      >
        <div
          style={{
            width: "100%",
            height: 1,
            background: brand.creamLine,
            display: "flex",
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: "Space Mono",
            fontSize: 17,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: brand.creamMuted,
          }}
        >
          <div style={{ display: "flex" }}>{siteConfig.name}</div>
          <div style={{ display: "flex" }}>{domain}</div>
        </div>
      </div>
    </div>
  );
}
