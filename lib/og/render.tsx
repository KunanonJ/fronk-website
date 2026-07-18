import { ImageResponse } from "next/og";
import { loadOgFonts } from "@/lib/og/fonts";
import { OG_SIZE, OgCard, type OgCardProps } from "@/lib/og/card";

/** Render the shared FogLAMP card as a route-handler ImageResponse. */
export function renderOgCard(props: OgCardProps): ImageResponse {
  const fonts = loadOgFonts();
  return new ImageResponse(<OgCard {...props} />, {
    ...OG_SIZE,
    ...(fonts.length > 0 ? { fonts } : {}),
  });
}
