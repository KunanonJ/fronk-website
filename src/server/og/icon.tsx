import { ImageResponse } from "@cf-wasm/og";
import { brand } from "@/lib/brand/tokens";
import { loadOgFonts } from "@/lib/og/fonts";

const size = { width: 64, height: 64 };

/**
 * The paper "K" in Instrument Serif on an ink tile, with one accent pixel
 * (profile redesign palette, design spec 2.1).
 */
export default function Icon() {
  return new ImageResponse(
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
          color: brand.paper,
          fontFamily: "Instrument Serif",
          fontSize: 48,
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
          background: brand.accent,
          display: "flex",
        }}
      />
    </div>,
    { ...size, fonts: loadOgFonts() },
  );
}
