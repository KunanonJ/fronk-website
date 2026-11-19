import { ImageResponse } from "@cf-wasm/og";
import { brand } from "@/lib/brand/tokens";
import { loadOgFonts } from "@/lib/og/fonts";

const size = { width: 180, height: 180 };

/**
 * The paper "K" in Instrument Serif on an ink tile, with one accent pixel
 * (profile redesign palette, design spec 2.1).
 */
export default function AppleIcon() {
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
        borderRadius: 40,
      }}
    >
      <span
        style={{
          color: brand.paper,
          fontFamily: "Instrument Serif",
          fontSize: 136,
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
          background: brand.accent,
          display: "flex",
        }}
      />
    </div>,
    { ...size, fonts: loadOgFonts() },
  );
}
