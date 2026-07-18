import { getAllVentures } from "@/lib/content/ventures";
import { OG_SIZE } from "@/lib/og/card";
import { renderOgCard } from "@/lib/og/render";

export const alt = "Work — ventures built and shipped";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function VenturesOgImage() {
  const names = getAllVentures()
    .map((v) => v.name)
    .join(" · ");
  return renderOgCard({ eyebrow: "Work", title: "Work", subtitle: names });
}
