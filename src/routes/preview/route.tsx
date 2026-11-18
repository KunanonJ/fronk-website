import { Outlet, createFileRoute } from "@tanstack/react-router";
import PreviewLayout from "@/components/profile/preview/PreviewLayout";
import onestLatin from "../../fonts/onest-latin.woff2?url";
import instrumentSerifLatin from "../../fonts/instrument-serif-latin.woff2?url";
import profileCss from "../../styles/profile.css?url";

/**
 * Hidden previews of the profile redesign (Phases 0 to 5): noindex and
 * nofollow, disallowed in robots.txt, unlinked, never prerendered, out of the
 * sitemap and the parity list. Phase 6 deletes them. Only these pages preload
 * the new Latin faces; __root.tsx gives them the `data-design="profile"`
 * scope.
 */
export const Route = createFileRoute("/preview")({
  head: () => ({
    meta: [{ name: "robots", content: "noindex, nofollow" }],
    links: [
      {
        rel: "preload",
        href: onestLatin,
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        href: instrumentSerifLatin,
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      // The preview-only stylesheet: the chrome and the Home sections.
      { rel: "stylesheet", href: profileCss },
    ],
  }),
  component: () => (
    <PreviewLayout>
      <Outlet />
    </PreviewLayout>
  ),
});
