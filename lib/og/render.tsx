import { ImageResponse } from "@cf-wasm/og";
import type { ReactElement } from "react";
import { loadOgFonts } from "@/lib/og/fonts";
import { OG_SIZE, OgCard, type OgCardProps } from "@/lib/og/card";
import { ProfileCard, type ProfileCardProps } from "@/lib/og/profileCard";

/**
 * What every share card renders with: its size and faces. Home's og:video
 * (lib/og/homeVideoFrames.ts) renders its frames with the same, so its first
 * frame is the og:image.
 */
export function ogRenderOptions() {
  return { ...OG_SIZE, fonts: loadOgFonts() };
}

function render(element: ReactElement): ImageResponse {
  return new ImageResponse(element, ogRenderOptions());
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
