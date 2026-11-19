import { ImageResponse } from "@cf-wasm/og";
import { brand } from "@/lib/brand/tokens";
import { loadOgFonts } from "@/lib/og/fonts";

/** A square tile's size, corner, letter size, and the accent pixel's inset and size. */
type MonogramSpec = {
  size: number;
  radius: number;
  fontSize: number;
  inset: number;
  pixel: number;
};

/** /icon, the favicon PNG. */
export const ICON: MonogramSpec = {
  size: 64,
  radius: 14,
  fontSize: 48,
  inset: 8,
  pixel: 10,
};

/** /apple-icon, the Apple touch icon. */
export const APPLE_ICON: MonogramSpec = {
  size: 180,
  radius: 40,
  fontSize: 136,
  inset: 22,
  pixel: 26,
};

/**
 * The paper "K" in Instrument Serif on an ink tile, with one accent pixel
 * (profile redesign palette, design spec 2.1).
 */
export function monogramIcon({
  size,
  radius,
  fontSize,
  inset,
  pixel,
}: MonogramSpec) {
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
        borderRadius: radius,
      }}
    >
      <span
        style={{
          color: brand.paper,
          fontFamily: "Instrument Serif",
          fontSize,
          lineHeight: 1,
        }}
      >
        {brand.monogram}
      </span>
      <div
        style={{
          position: "absolute",
          right: inset,
          bottom: inset,
          width: pixel,
          height: pixel,
          background: brand.accent,
          display: "flex",
        }}
      />
    </div>,
    { width: size, height: size, fonts: loadOgFonts() },
  );
}
