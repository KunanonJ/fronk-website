import { OG_SIZE } from "@/lib/og/card";
import { renderOgCard } from "@/lib/og/render";

export const alt = "Writing — essays and build notes";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function WritingOgImage() {
  return renderOgCard({
    eyebrow: "Writing",
    title: "Writing",
    subtitle: "Essays and build notes on products, AI, and going solo.",
  });
}
