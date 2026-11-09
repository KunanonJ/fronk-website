import { siteConfig } from "@/lib/site";
import { renderOgCard } from "@/lib/og/render";

/** Brand share preview — black + cream KunanonJ card. */
export default function OpenGraphImage() {
  return renderOgCard({
    title: siteConfig.name,
    subtitle: siteConfig.tagline,
  });
}
