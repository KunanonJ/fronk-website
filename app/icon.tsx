import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

// Favicon — the Fronk mark: a lowercase "f" closed by a mint terminal cursor
// block on a dark instrument tile. Mirrors the site logotype.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 5,
          background: "#0a0a0a",
          border: "3px solid rgba(255,255,255,0.16)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <span
          style={{
            color: "#ededed",
            fontSize: 38,
            fontWeight: 800,
            letterSpacing: "-0.04em",
          }}
        >
          f
        </span>
        <span style={{ width: 11, height: 30, background: "#34d399" }} />
      </div>
    ),
    { ...size },
  );
}
