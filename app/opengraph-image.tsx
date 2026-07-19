import { siteConfig } from "@/lib/site";
import { OG_SIZE } from "@/lib/og/card";
import { renderOgCard } from "@/lib/og/render";

export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = OG_SIZE;
export const contentType = "image/png";

/** Brand share preview — black + cream KunanonJ card. */
export default function OpenGraphImage() {
  return renderOgCard({
    title: siteConfig.name,
    subtitle: siteConfig.tagline,
  });
}
