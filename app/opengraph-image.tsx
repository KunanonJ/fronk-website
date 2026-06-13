import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "#f5f5f0",
          color: "#0a0a0a",
          fontFamily: "system-ui, sans-serif",
          border: "8px solid #0a0a0a",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 24,
            fontWeight: 800,
            letterSpacing: "-0.03em",
          }}
        >
          <span>{siteConfig.shortName}</span>
          <span style={{ color: "#10b981" }}>.</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: "#525252",
            }}
          >
            Founder · Bangkok
          </div>
          <div
            style={{
              fontSize: 88,
              lineHeight: 0.95,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              maxWidth: 1000,
            }}
          >
            {siteConfig.name}
          </div>
          <div
            style={{
              fontSize: 34,
              lineHeight: 1.2,
              color: "#525252",
              maxWidth: 900,
            }}
          >
            {siteConfig.tagline}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 20,
            fontWeight: 600,
            color: "#525252",
          }}
        >
          <span>fintech · ai · web3</span>
          <span style={{ color: "#10b981" }}>
            {siteConfig.url.replace(/^https?:\/\//, "")}
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
