import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Apple touch icon — the Fronk mark ("f" + mint terminal cursor) on a dark
// instrument tile, scaled for home-screen / iOS use.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          background: "#0a0a0a",
          border: "7px solid rgba(255,255,255,0.16)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <span
          style={{
            color: "#ededed",
            fontSize: 104,
            fontWeight: 800,
            letterSpacing: "-0.04em",
          }}
        >
          f
        </span>
        <span style={{ width: 30, height: 82, background: "#34d399" }} />
      </div>
    ),
    { ...size },
  );
}
