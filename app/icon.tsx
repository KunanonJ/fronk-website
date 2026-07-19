import { ImageResponse } from "next/og";
import { brand } from "@/lib/brand/tokens";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/**
 * Favicon — cream “K” monogram on black, aligned with landing CI.
 */
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
          background: brand.black,
          borderRadius: 14,
          border: `2px solid ${brand.creamLine}`,
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        <span
          style={{
            color: brand.cream,
            fontSize: 36,
            fontWeight: 400,
            fontStyle: "italic",
            letterSpacing: "-0.04em",
            lineHeight: 1,
            marginTop: -2,
          }}
        >
          {brand.monogram}
        </span>
      </div>
    ),
    { ...size },
  );
}
