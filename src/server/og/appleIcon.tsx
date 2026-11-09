import { ImageResponse } from "@cf-wasm/og";
import { brand } from "@/lib/brand/tokens";

const size = { width: 180, height: 180 };

/**
 * Glaze "K" on an Ink tile with one Signal pixel (visual-redesign palette).
 */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: brand.ink,
          borderRadius: 40,
        }}
      >
        <span
          style={{
            color: brand.glaze,
            fontSize: 112,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1,
          }}
        >
          {brand.monogram}
        </span>
        <div
          style={{
            position: "absolute",
            right: 22,
            bottom: 22,
            width: 26,
            height: 26,
            background: brand.signal,
            display: "flex",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
