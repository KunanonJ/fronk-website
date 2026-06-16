import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";
import { loadOgFonts } from "@/lib/og/fonts";

export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Terminal-HUD share card — matches the site identity: pure black, hairline
// window frame, mono instrument labels, the ghosted wordmark, mint as the one
// earned accent.
export default function OpenGraphImage() {
  const domain = siteConfig.url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const fonts = loadOgFonts();

  return new ImageResponse(
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "#000000",
        color: "#ededed",
        fontFamily: "Geist",
      }}
    >
      {/* Hairline window frame (the instrument bezel) */}
      <div
        style={{
          position: "absolute",
          top: 28,
          left: 28,
          right: 28,
          bottom: 28,
          border: "1px solid rgba(255,255,255,0.14)",
        }}
      />

      {/* Giant ghosted wordmark rising from the dark */}
      <div
        style={{
          position: "absolute",
          bottom: -64,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          fontSize: 340,
          fontWeight: 800,
          letterSpacing: "-0.05em",
          color: "rgba(255,255,255,0.05)",
        }}
      >
        fronk
      </div>

      {/* Top row: wordmark + mono eyebrow */}
      <div
        style={{
          position: "relative",
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
            fontWeight: 800,
            letterSpacing: "-0.03em",
          }}
        >
          fronk
          <span
            style={{
              marginLeft: 6,
              width: 11,
              height: 23,
              background: "#34d399",
            }}
          />
        </div>
        <div
          style={{
            fontFamily: "Space Mono",
            fontSize: 16,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#8a8a8a",
          }}
        >
          Founder · Builder · Writer
        </div>
      </div>

      {/* Center: name + tagline */}
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 88,
            lineHeight: 0.95,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            maxWidth: 1000,
          }}
        >
          {siteConfig.name}
          <span style={{ color: "#34d399" }}>.</span>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 33,
            lineHeight: 1.2,
            color: "#8a8a8a",
            maxWidth: 920,
          }}
        >
          {siteConfig.tagline}
        </div>
      </div>

      {/* Bottom row: honest status strip + domain */}
      <div
        style={{
          position: "relative",
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
        <div style={{ display: "flex" }}>Building · GoGoCash · Manut AI</div>
        <div style={{ display: "flex", color: "#34d399" }}>{domain}</div>
      </div>
    </div>,
    { ...size, ...(fonts.length ? { fonts } : {}) },
  );
}
