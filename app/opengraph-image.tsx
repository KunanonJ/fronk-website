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
          padding: 80,
          background: "#09090b",
          color: "#fafafa",
          fontFamily: "system-ui, sans-serif",
          backgroundImage:
            "radial-gradient(circle at 90% 10%, rgba(251, 191, 36, 0.12) 0%, transparent 45%), radial-gradient(circle at 0% 100%, rgba(251, 191, 36, 0.06) 0%, transparent 40%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: "-0.02em",
          }}
        >
          <span style={{ color: "#fafafa" }}>{siteConfig.shortName}</span>
          <span style={{ color: "#fbbf24" }}>.</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 22,
              color: "#a1a1aa",
              textTransform: "uppercase",
              letterSpacing: "0.18em",
            }}
          >
            Founder · GoGoCash
          </div>
          <div
            style={{
              fontSize: 92,
              lineHeight: 1.05,
              fontWeight: 600,
              letterSpacing: "-0.04em",
              maxWidth: 1000,
              color: "#fafafa",
            }}
          >
            {siteConfig.name}
          </div>
          <div
            style={{
              fontSize: 38,
              lineHeight: 1.25,
              color: "#a1a1aa",
              letterSpacing: "-0.01em",
              maxWidth: 950,
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
            fontSize: 22,
            color: "#a1a1aa",
            letterSpacing: "-0.01em",
          }}
        >
          <span>fintech · ai · web3 · bangkok</span>
          <span style={{ color: "#fbbf24" }}>{siteConfig.url.replace(/^https?:\/\//, "")}</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
