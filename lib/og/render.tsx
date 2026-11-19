import { ImageResponse } from "@cf-wasm/og";
import type { ReactElement } from "react";
import { loadOgFonts } from "@/lib/og/fonts";
import { OG_SIZE, OgCard, type OgCardProps } from "@/lib/og/card";
import { ProfileCard, type ProfileCardProps } from "@/lib/og/profileCard";

function render(element: ReactElement): ImageResponse {
  const fonts = loadOgFonts();
  return new ImageResponse(element, {
    ...OG_SIZE,
    ...(fonts.length > 0 ? { fonts } : {}),
  });
}

/** Render the shared brand OG card as a route-handler ImageResponse. */
export function renderOgCard(props: OgCardProps): ImageResponse {
  return render(<OgCard {...props} />);
}

/** Render a profile card (Home, About) as a route-handler ImageResponse. */
export function renderProfileCard(props: ProfileCardProps): ImageResponse {
  return render(<ProfileCard {...props} />);
}
