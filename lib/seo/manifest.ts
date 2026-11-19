import type { Manifest } from "@/lib/seo/types";
import { siteConfig } from "@/lib/site";

export default function manifest(): Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: "/",
    display: "browser",
    // The profile palette (design spec 2.1 and 13 item 37, Phase 6 cutover):
    // the light paper behind the launch screen, and the light theme-color
    // meta's lavender for the browser chrome. Light is the site's default.
    background_color: "#ffffff",
    theme_color: "#f7f3ff",
    icons: [
      // The K monogram: paper K in Instrument Serif on an ink tile, with one
      // accent pixel (public/icon.svg; src/server/og/icon.tsx and
      // appleIcon.tsx render the PNGs).
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icon", sizes: "64x64", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
