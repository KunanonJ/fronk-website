import { ImageResponse } from "@cf-wasm/og";
import {
  PORTRAIT,
  PORTRAIT_BACKGROUND,
  PORTRAIT_COLOURS,
  PORTRAIT_SMALL,
} from "@/lib/brand/pixelPortrait";

/*
 * The PNG icons: the pixel portrait (lib/brand/pixelPortrait.ts) on its
 * violet tile, every cell a whole number of pixels, so it stays crisp. The
 * favicon PNG takes the 16 x 16 cut at 4x; the Apple touch icon the 24 x 24
 * drawing at 7x (168 px), centred on the tile.
 */

/** A tile's size and corner, and the drawing with its cell size. */
type IconSpec = {
  size: number;
  radius: number;
  rows: readonly string[];
  cell: number;
};

/** /icon, the favicon PNG: 16 cells of 4 px. */
export const ICON: IconSpec = {
  size: 64,
  radius: 14,
  rows: PORTRAIT_SMALL,
  cell: 4,
};

/** /apple-icon, the Apple touch icon: 24 cells of 7 px. */
export const APPLE_ICON: IconSpec = {
  size: 180,
  radius: 40,
  rows: PORTRAIT,
  cell: 7,
};

export function portraitIcon({ size, radius, rows, cell }: IconSpec) {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: PORTRAIT_BACKGROUND,
        borderRadius: radius,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        {rows.map((row, y) => (
          <div key={y} style={{ display: "flex" }}>
            {[...row].map((key, x) => (
              <div
                key={x}
                style={{
                  width: cell,
                  height: cell,
                  background:
                    key === "."
                      ? PORTRAIT_BACKGROUND
                      : PORTRAIT_COLOURS[key as keyof typeof PORTRAIT_COLOURS],
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>,
    { width: size, height: size },
  );
}
