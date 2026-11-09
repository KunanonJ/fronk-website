import { ImageResponse } from "@cf-wasm/og";
import { brand } from "@/lib/brand/tokens";

const size = { width: 64, height: 64 };

/**
 * Glaze "K" on an Ink tile with one Signal pixel (visual-redesign palette).
 */
export default function Icon() {
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
          borderRadius: 14,
        }}
      >
        <span
          style={{
            color: brand.glaze,
            fontSize: 40,
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
            right: 8,
            bottom: 8,
            width: 10,
            height: 10,
            background: brand.signal,
            display: "flex",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
