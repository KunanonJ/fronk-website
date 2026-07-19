import { ImageResponse } from "next/og";
import { brand } from "@/lib/brand/tokens";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * Apple touch icon — cream “K” monogram on black brand tile.
 */
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
          background: brand.black,
          borderRadius: 40,
          border: `5px solid ${brand.creamLine}`,
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        <span
          style={{
            color: brand.cream,
            fontSize: 108,
            fontWeight: 400,
            fontStyle: "italic",
            letterSpacing: "-0.04em",
            lineHeight: 1,
            marginTop: -4,
          }}
        >
          {brand.monogram}
        </span>
      </div>
    ),
    { ...size },
  );
}
