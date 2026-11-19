import { ImageResponse } from "@cf-wasm/og";
import type { ReactElement } from "react";
import { loadOgFonts } from "@/lib/og/fonts";
import { OG_SIZE, OgCard, type OgCardProps } from "@/lib/og/card";
import { ProfileCard, type ProfileCardProps } from "@/lib/og/profileCard";

function render(element: ReactElement): ImageResponse {
  return new ImageResponse(element, { ...OG_SIZE, fonts: loadOgFonts() });
}

/**
 * A page's share card at `<path>/<slug>/opengraph-image`: the card for what
 * the slug names, or a plain 404 when it names nothing.
 */
export function renderSlugCard(
  props: OgCardProps | null | undefined,
): Response {
  if (!props) return new Response("Not found", { status: 404 });
  return render(<OgCard {...props} />);
}

/** Render a profile card (Home, About) as a route-handler ImageResponse. */
export function renderProfileCard(props: ProfileCardProps): ImageResponse {
  return render(<ProfileCard {...props} />);
}
