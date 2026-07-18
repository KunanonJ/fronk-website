import { siteConfig } from "@/lib/site";
import { OG_SIZE } from "@/lib/og/card";
import { renderOgCard } from "@/lib/og/render";

export const alt = `Contact ${siteConfig.name}`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function ContactOgImage() {
  return renderOgCard({
    eyebrow: "Contact",
    title: "Say hello.",
    subtitle: siteConfig.email,
  });
}
