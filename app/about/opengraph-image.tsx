import { siteConfig } from "@/lib/site";
import { OG_SIZE } from "@/lib/og/card";
import { renderOgCard } from "@/lib/og/render";

export const alt = `About ${siteConfig.name}`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function AboutOgImage() {
  return renderOgCard({
    eyebrow: "About",
    title: "Founder, builder, operator.",
    subtitle: siteConfig.name,
  });
}
